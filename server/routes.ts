import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { AmoCRMService } from "./services/amocrm";
import { addMonths, format } from "date-fns";
import { insertClubCardSchema, insertVisitSchema } from "@shared/schema";
import cors from "cors";

function calculateExpiryDate(issueDate: Date, cardType: string): Date {
  switch (cardType) {
    case "6 месяцев":
      return addMonths(issueDate, 6);
    case "12 месяцев":
      return addMonths(issueDate, 12);
    case "36 месяцев":
      return addMonths(issueDate, 36);
    // Поддержка старых названий для совместимости
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

export async function registerRoutes(app: Express): Promise<Server> {
  const amoCRMService = new AmoCRMService();

  // Enable CORS for frontend
  const frontendUrl = process.env.FRONTEND_URL || process.env.REPLIT_DOMAINS?.split(',')[0] || 'http://localhost:5000';
  app.use('/api/*', cors({
    origin: frontendUrl,
    credentials: true
  }));

  // Webhook endpoint for AmoCRM - обрабатываем form-urlencoded данные
  app.post('/webhook/amo-process-card', async (req, res) => {
    try {
      console.log('AmoCRM webhook received:', req.body);
      console.log('Headers:', req.headers);

      // Проверяем, настроен ли AmoCRM
      if (!amoCRMService.isAmoCRMConfigured()) {
        console.warn('AmoCRM webhook received but AmoCRM is not configured');
        return res.status(503).json({ error: 'AmoCRM integration is not configured' });
      }

      // Парсим данные из form-urlencoded формата
      let leadId: number | null = null;
      
      // Проверяем разные возможные форматы данных
      if (req.body.leads && req.body.leads.add && req.body.leads.add[0]) {
        leadId = parseInt(req.body.leads.add[0].id);
      } else if (req.body['leads[add][0][id]']) {
        leadId = parseInt(req.body['leads[add][0][id]']);
      } else {
        // Ищем в ключах объекта
        const keys = Object.keys(req.body);
        const leadIdKey = keys.find(key => key.includes('leads') && key.includes('id'));
        if (leadIdKey) {
          leadId = parseInt(req.body[leadIdKey]);
        }
      }

      if (!leadId) {
        console.error('Lead ID not found in webhook data:', req.body);
        return res.status(400).json({ error: 'Lead ID not found in webhook payload' });
      }

      console.log('Processing lead ID:', leadId);
      
      // Process lead through AmoCRM service
      const leadData = await amoCRMService.processLead(leadId);
      console.log('Lead data processed:', leadData);
      
      // Calculate dates
      const issueDate = new Date();
      const expiryDate = calculateExpiryDate(issueDate, leadData.cardType);
      
      // Prepare card data
      const cardData = {
        clientId: leadData.clientId,
        clientName: leadData.clientName,
        cardType: leadData.cardType,
        issueDate: format(issueDate, 'yyyy-MM-dd'),
        expiryDate: format(expiryDate, 'yyyy-MM-dd'),
        status: 'Активна'
      };

      console.log('Card data to save:', cardData);

      // Validate data
      const validatedData = insertClubCardSchema.parse(cardData);
      
      // Save to database
      const savedCard = await storage.createOrUpdateClubCard(validatedData);
      console.log('Card saved successfully:', savedCard);
      
      res.status(200).json({ 
        success: true, 
        message: 'Card processed successfully',
        cardId: savedCard.id 
      });
    } catch (error) {
      console.error('Webhook processing error:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Тестовый endpoint для проверки вебхука
  app.post('/webhook/test', (req, res) => {
    console.log('Test webhook received:');
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);
    console.log('Raw body keys:', Object.keys(req.body));
    res.json({ 
      success: true, 
      received: req.body,
      headers: req.headers 
    });
  });

  // API endpoint to get card info
  app.get('/api/card-info/:clientId', async (req, res) => {
    try {
      const { clientId } = req.params;
      
      const card = await storage.getClubCard(clientId);
      
      if (!card) {
        return res.status(404).json({ error: 'Карта не найдена' });
      }

      // Calculate current status
      const expiryDate = new Date(card.expiryDate);
      const currentStatus = determineCardStatus(expiryDate);

      // Format response
      const response = {
        ...card,
        status: currentStatus,
        issueDate: format(new Date(card.issueDate), 'dd.MM.yyyy'),
        expiryDate: format(new Date(card.expiryDate), 'dd.MM.yyyy'),
      };

      res.json(response);
    } catch (error) {
      console.error('API error:', error);
      res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
  });

  // Master endpoint for QR code scanning and visit tracking
  app.post('/api/master/scan-visit', async (req, res) => {
    try {
      const { pin, clientId, procedureType, notes } = req.body;
      
      // Verify master PIN
      if (pin !== '2728') {
        return res.status(401).json({ error: 'Неверный PIN-код' });
      }

      // Check if card exists
      const card = await storage.getClubCard(clientId);
      if (!card) {
        return res.status(404).json({ error: 'Карта не найдена' });
      }

      // Check if card is active
      const expiryDate = new Date(card.expiryDate);
      const currentStatus = determineCardStatus(expiryDate);
      if (currentStatus === 'Истекла') {
        return res.status(400).json({ error: 'Срок действия карты истек' });
      }

      // Create visit record
      const visitData = {
        clientId,
        procedureType: procedureType || '',
        notes: notes || '',
        masterId: 'master_scan',
      };

      const validatedVisit = insertVisitSchema.parse(visitData);
      const visit = await storage.addVisit(validatedVisit);

      res.json({ 
        success: true, 
        clientName: card.clientName,
        cardType: card.cardType,
        status: currentStatus,
        visitId: visit.id,
        message: 'Посещение зарегистрировано' 
      });
    } catch (error) {
      console.error('Master scan error:', error);
      res.status(500).json({ error: 'Ошибка при регистрации посещения' });
    }
  });

  // Get client visits (for master use only)
  app.post('/api/master/client-visits', async (req, res) => {
    try {
      const { pin, clientId } = req.body;
      
      // Verify master PIN
      if (pin !== '2728') {
        return res.status(401).json({ error: 'Неверный PIN-код' });
      }

      const visits = await storage.getVisits(clientId);
      const card = await storage.getClubCard(clientId);

      res.json({
        clientName: card?.clientName || 'Неизвестный клиент',
        visits: visits.map(visit => ({
          ...visit,
          visitDate: format(new Date(visit.visitDate), 'dd.MM.yyyy HH:mm'),
        }))
      });
    } catch (error) {
      console.error('Get visits error:', error);
      res.status(500).json({ error: 'Ошибка при получении истории посещений' });
    }
  });

  // Endpoint для проверки статуса AmoCRM
  app.get('/api/amocrm/status', (req, res) => {
    res.json({
      configured: amoCRMService.isAmoCRMConfigured(),
      message: amoCRMService.isAmoCRMConfigured() 
        ? 'AmoCRM integration is active' 
        : 'AmoCRM integration is disabled. Set AMO_DOMAIN and AMO_ACCESS_TOKEN to enable.'
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}