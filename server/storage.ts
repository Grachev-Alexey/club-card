import { clubCards, visits, type ClubCard, type InsertClubCard, type Visit, type InsertVisit } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";
import { formatClientName } from "./lib/name-formatter";

export interface IStorage {
  getClubCard(clientId: string): Promise<ClubCard | undefined>;
  createOrUpdateClubCard(card: InsertClubCard): Promise<ClubCard>;
  addVisit(visit: InsertVisit): Promise<Visit>;
  getVisits(clientId: string): Promise<Visit[]>;
}

export class DatabaseStorage implements IStorage {
  async getClubCard(clientId: string): Promise<ClubCard | undefined> {
    const [card] = await db.select().from(clubCards).where(eq(clubCards.clientId, clientId));
    
    if (card) {
      // Форматируем имя клиента при получении из базы данных
      return {
        ...card,
        clientName: formatClientName(card.clientName)
      };
    }
    
    return undefined;
  }

  async createOrUpdateClubCard(cardData: InsertClubCard): Promise<ClubCard> {
    // Форматируем имя клиента перед сохранением
    const formattedCardData = {
      ...cardData,
      clientName: formatClientName(cardData.clientName)
    };

    const existingCard = await this.getClubCard(formattedCardData.clientId);
    
    if (existingCard) {
      const [updatedCard] = await db
        .update(clubCards)
        .set({
          ...formattedCardData,
          updatedAt: new Date(),
        })
        .where(eq(clubCards.clientId, formattedCardData.clientId))
        .returning();
      
      return {
        ...updatedCard,
        clientName: formatClientName(updatedCard.clientName)
      };
    } else {
      const [newCard] = await db
        .insert(clubCards)
        .values(formattedCardData)
        .returning();
      
      return {
        ...newCard,
        clientName: formatClientName(newCard.clientName)
      };
    }
  }

  async addVisit(visitData: InsertVisit): Promise<Visit> {
    const [visit] = await db
      .insert(visits)
      .values(visitData)
      .returning();
    return visit;
  }

  async getVisits(clientId: string): Promise<Visit[]> {
    return await db
      .select()
      .from(visits)
      .where(eq(visits.clientId, clientId))
      .orderBy(desc(visits.visitDate));
  }
}

export const storage = new DatabaseStorage();