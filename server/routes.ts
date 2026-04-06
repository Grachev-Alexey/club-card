import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { addMonths, format } from "date-fns";
import { insertClubCardSchema, insertVisitSchema } from "@shared/schema";

function calculateExpiryDate(issueDate: Date, cardType: string): Date {
  switch (cardType) {
    case "6 месяцев":
      return addMonths(issueDate, 6);
    case "12 месяцев":
      return addMonths(issueDate, 12);
    case "36 месяцев":
      return addMonths(issueDate, 36);
    case "Полгода":
      return addMonths(issueDate, 6);
    case "Год":
      return addMonths(issueDate, 12);
    case "Два года":
      return addMonths(issueDate, 24);
    default:
      throw new Error(`Unknown card type: ${cardType}`);
  }
}

function determineCardStatus(expiryDate: Date): string {
  const now = new Date();
  const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (daysUntilExpiry < 0) {
    return "Истекла";
  } else if (daysUntilExpiry <= 7) {
    return "Скоро истечет";
  } else {
    return "Активна";
  }
}

const MASTER_PIN = "2728";

function verifyPin(pin: string, res: any): boolean {
  if (pin !== MASTER_PIN) {
    res.status(401).json({ error: "Неверный PIN-код" });
    return false;
  }
  return true;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // API endpoint to get card info (public — for QR card view)
  app.get("/api/card-info/:clientId", async (req, res) => {
    try {
      const { clientId } = req.params;
      const card = await storage.getClubCard(clientId);

      if (!card) {
        return res.status(404).json({ error: "Карта не найдена" });
      }

      const expiryDate = new Date(card.expiryDate);
      const currentStatus = determineCardStatus(expiryDate);

      const response = {
        ...card,
        status: currentStatus,
        issueDate: format(new Date(card.issueDate), "dd.MM.yyyy"),
        expiryDate: format(new Date(card.expiryDate), "dd.MM.yyyy"),
      };

      res.json(response);
    } catch (error) {
      console.error("API error:", error);
      res.status(500).json({ error: "Внутренняя ошибка сервера" });
    }
  });

  // ── Master endpoints (all require PIN) ──────────────────────────────────

  // List all cards
  app.post("/api/master/cards", async (req, res) => {
    try {
      if (!verifyPin(req.body.pin, res)) return;
      const cards = await storage.getAllClubCards();
      const result = cards.map((card) => {
        const expiryDate = new Date(card.expiryDate);
        return {
          ...card,
          status: determineCardStatus(expiryDate),
          issueDate: format(new Date(card.issueDate), "dd.MM.yyyy"),
          expiryDate: format(new Date(card.expiryDate), "dd.MM.yyyy"),
        };
      });
      res.json(result);
    } catch (error) {
      console.error("List cards error:", error);
      res.status(500).json({ error: "Ошибка при получении списка карт" });
    }
  });

  // Create or update a card
  app.post("/api/master/create-card", async (req, res) => {
    try {
      const { pin, clientId, clientName, cardType } = req.body;
      if (!verifyPin(pin, res)) return;

      const issueDate = new Date();
      const expiryDate = calculateExpiryDate(issueDate, cardType);

      const cardData = {
        clientId,
        clientName,
        cardType,
        issueDate: format(issueDate, "yyyy-MM-dd"),
        expiryDate: format(expiryDate, "yyyy-MM-dd"),
        status: "Активна",
      };

      const validatedData = insertClubCardSchema.parse(cardData);
      const savedCard = await storage.createOrUpdateClubCard(validatedData);

      res.status(200).json({ success: true, card: savedCard });
    } catch (error) {
      console.error("Create card error:", error);
      res.status(500).json({
        error: "Ошибка при создании карты",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  // Delete a card
  app.post("/api/master/delete-card", async (req, res) => {
    try {
      const { pin, clientId } = req.body;
      if (!verifyPin(pin, res)) return;

      const existing = await storage.getClubCard(clientId);
      if (!existing) {
        return res.status(404).json({ error: "Карта не найдена" });
      }

      await storage.deleteClubCard(clientId);
      res.json({ success: true });
    } catch (error) {
      console.error("Delete card error:", error);
      res.status(500).json({ error: "Ошибка при удалении карты" });
    }
  });

  // Register a visit
  app.post("/api/master/scan-visit", async (req, res) => {
    try {
      const { pin, clientId, procedureType, notes } = req.body;
      if (!verifyPin(pin, res)) return;

      const card = await storage.getClubCard(clientId);
      if (!card) {
        return res.status(404).json({ error: "Карта не найдена" });
      }

      const expiryDate = new Date(card.expiryDate);
      const currentStatus = determineCardStatus(expiryDate);
      if (currentStatus === "Истекла") {
        return res.status(400).json({ error: "Срок действия карты истек" });
      }

      const visitData = {
        clientId,
        procedureType: procedureType || "",
        notes: notes || "",
        masterId: "master_scan",
      };

      const validatedVisit = insertVisitSchema.parse(visitData);
      const visit = await storage.addVisit(validatedVisit);

      res.json({
        success: true,
        clientName: card.clientName,
        cardType: card.cardType,
        status: currentStatus,
        visitId: visit.id,
        message: "Посещение зарегистрировано",
      });
    } catch (error) {
      console.error("Master scan error:", error);
      res.status(500).json({ error: "Ошибка при регистрации посещения" });
    }
  });

  // Get client visits
  app.post("/api/master/client-visits", async (req, res) => {
    try {
      const { pin, clientId } = req.body;
      if (!verifyPin(pin, res)) return;

      const visits = await storage.getVisits(clientId);
      const card = await storage.getClubCard(clientId);

      res.json({
        clientName: card?.clientName || "Неизвестный клиент",
        visits: visits.map((visit) => ({
          ...visit,
          visitDate: format(new Date(visit.visitDate), "dd.MM.yyyy HH:mm"),
        })),
      });
    } catch (error) {
      console.error("Get visits error:", error);
      res.status(500).json({ error: "Ошибка при получении истории посещений" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
