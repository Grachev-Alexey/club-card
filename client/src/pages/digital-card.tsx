import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import LoadingSkeleton from "@/components/loading-skeleton";
import ErrorMessage from "@/components/error-message";
import NotFoundMessage from "@/components/not-found-message";
import DigitalCard from "@/components/digital-card";
import CardBenefits from "@/components/card-benefits";
import ContactInfo from "@/components/contact-info";
import { OfflineStorage } from "@/lib/offline-storage";

interface CardData {
  clientId: string;
  clientName: string;
  cardType: string;
  issueDate: string;
  expiryDate: string;
  status: string;
}

export default function DigitalCardPage() {
  const { clientId } = useParams<{ clientId: string }>();
  const [isOffline, setIsOffline] = useState(!OfflineStorage.isOnline());
  const [cachedData, setCachedData] = useState<CardData | null>(null);

  useEffect(() => {
    if (clientId) {
      const cached = OfflineStorage.getCachedCardData(clientId);
      setCachedData(cached);
    }

    const cleanup = OfflineStorage.setupOnlineListener((online) => {
      setIsOffline(!online);
    });

    return cleanup;
  }, [clientId]);

  const { data: cardData, isLoading, error, refetch } = useQuery<CardData>({
    queryKey: ['/api/card-info', clientId],
    queryFn: async () => {
      const response = await fetch(`/api/card-info/${clientId}`);
      if (response.status === 404) {
        throw new Error('NOT_FOUND');
      }
      if (!response.ok) {
        throw new Error('FETCH_ERROR');
      }
      const data = await response.json();
      
      // Cache the data for offline use
      if (clientId) {
        OfflineStorage.saveCardData(clientId, data);
      }
      
      return data;
    },
    enabled: !!clientId && OfflineStorage.isOnline(),
  });

  // Use cached data when offline
  const displayData = cardData || (isOffline ? cachedData : null);

  if (isLoading && !displayData) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <LoadingSkeleton />
      </div>
    );
  }

  if (error && !displayData) {
    if (error.message === 'NOT_FOUND') {
      return (
        <div className="min-h-screen flex items-center justify-center px-4">
          <NotFoundMessage />
        </div>
      );
    }
    
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <ErrorMessage onRetry={() => refetch()} />
      </div>
    );
  }

  if (!displayData) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <NotFoundMessage />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 pt-12 sm:pt-8">
      <div className="w-full max-w-md animate-fade-in">
        {isOffline && (
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3 mb-4 text-center">
            <p className="text-orange-300 text-sm">
              <i className="fas fa-wifi-slash mr-2"></i>
              Оффлайн-режим: показаны сохраненные данные
            </p>
          </div>
        )}
        <DigitalCard card={displayData!} />
        <CardBenefits />
        <ContactInfo />
      </div>
    </div>
  );
}
