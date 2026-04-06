interface CardData {
  clientId: string;
  clientName: string;
  cardType: string;
  issueDate: string;
  expiryDate: string;
  status: string;
}

const CARD_CACHE_KEY = 'club_card_cache';
const CACHE_TIMESTAMP_KEY = 'club_card_cache_timestamp';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export class OfflineStorage {
  static saveCardData(clientId: string, cardData: CardData): void {
    try {
      const cacheData = {
        [clientId]: {
          ...cardData,
          cachedAt: Date.now()
        }
      };
      
      const existingCache = this.getAllCachedCards();
      const updatedCache = { ...existingCache, ...cacheData };
      
      localStorage.setItem(CARD_CACHE_KEY, JSON.stringify(updatedCache));
      localStorage.setItem(`${CACHE_TIMESTAMP_KEY}_${clientId}`, Date.now().toString());
    } catch (error) {
      console.warn('Failed to save card data to offline storage:', error);
    }
  }

  static getCachedCardData(clientId: string): CardData | null {
    try {
      const allCached = this.getAllCachedCards();
      const cardData = allCached[clientId];
      
      if (!cardData) return null;
      
      const cachedAt = cardData.cachedAt || 0;
      const isExpired = Date.now() - cachedAt > CACHE_DURATION;
      
      if (isExpired) {
        this.removeCachedCard(clientId);
        return null;
      }
      
      return cardData;
    } catch (error) {
      console.warn('Failed to retrieve cached card data:', error);
      return null;
    }
  }

  static getAllCachedCards(): Record<string, CardData & { cachedAt?: number }> {
    try {
      const cached = localStorage.getItem(CARD_CACHE_KEY);
      return cached ? JSON.parse(cached) : {};
    } catch (error) {
      return {};
    }
  }

  static removeCachedCard(clientId: string): void {
    try {
      const allCached = this.getAllCachedCards();
      delete allCached[clientId];
      localStorage.setItem(CARD_CACHE_KEY, JSON.stringify(allCached));
      localStorage.removeItem(`${CACHE_TIMESTAMP_KEY}_${clientId}`);
    } catch (error) {
      console.warn('Failed to remove cached card:', error);
    }
  }

  static clearAllCache(): void {
    try {
      localStorage.removeItem(CARD_CACHE_KEY);
      // Remove all timestamp keys
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(CACHE_TIMESTAMP_KEY)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn('Failed to clear cache:', error);
    }
  }

  static isOnline(): boolean {
    return navigator.onLine;
  }

  static setupOnlineListener(callback: (isOnline: boolean) => void): () => void {
    const handleOnline = () => callback(true);
    const handleOffline = () => callback(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }
}