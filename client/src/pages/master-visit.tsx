import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";

interface CardData {
  clientId: string;
  clientName: string;
  cardType: string;
  issueDate: string;
  expiryDate: string;
  status: string;
}

export default function MasterVisitPage() {
  const [, params] = useRoute("/master/:clientId");
  const clientId = params?.clientId || "";
  const [pin, setPin] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [notes, setNotes] = useState("");

  // Получаем информацию о карте клиента для отображения имени на экране авторизации
  const { data: cardDataForAuth } = useQuery({
    queryKey: ['/api/card-info-auth', clientId],
    queryFn: async (): Promise<CardData> => {
      const response = await fetch(`/api/card-info/${clientId}`);
      if (!response.ok) {
        throw new Error("Карта не найдена");
      }
      return response.json();
    },
    enabled: !!clientId
  });

  const authenticate = () => {
    if (pin === "2728") {
      setIsAuthenticated(true);
    } else {
      alert("Неверный PIN-код");
    }
  };

  // Получаем информацию о карте клиента
  const { data: cardData, isLoading: isLoadingCard } = useQuery({
    queryKey: ['/api/card-info', clientId],
    queryFn: async (): Promise<CardData> => {
      const response = await fetch(`/api/card-info/${clientId}`);
      if (!response.ok) {
        throw new Error("Карта не найдена");
      }
      return response.json();
    },
    enabled: isAuthenticated && !!clientId
  });

  const confirmVisitMutation = useMutation({
    mutationFn: async (data: { notes: string }) => {
      const response = await fetch("/api/master/scan-visit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pin: "2728",
          clientId,
          procedureType: "Визит в студию",
          ...data
        })
      });
      
      if (!response.ok) {
        throw new Error("Ошибка регистрации посещения");
      }
      
      return response.json();
    },
    onSuccess: () => {
      alert("Посещение успешно зарегистрировано!");
      setNotes("");
    },
    onError: (error: any) => {
      alert(`Ошибка: ${error.message}`);
    }
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-8 pt-12 sm:pt-8">
        <div className="w-full max-w-md">
          <div className="bg-gradient-to-br from-gray-800 via-gray-800 to-gray-900 rounded-2xl p-6 shadow-2xl border border-gray-700/50">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg mx-auto mb-4">
                <i className="fas fa-user-shield text-2xl text-white"></i>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Подтверждение визита
              </h1>
              <p className="text-gray-400 text-sm mt-2">Введите PIN-код мастера</p>
              {cardDataForAuth && (
                <p className="text-pink-300 text-lg mt-2 font-medium">{cardDataForAuth.clientName}</p>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  PIN-код
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent text-center text-2xl tracking-widest"
                  placeholder="••••"
                  maxLength={4}
                  onKeyPress={(e) => e.key === 'Enter' && authenticate()}
                />
              </div>
              
              <button
                onClick={authenticate}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-4 rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 focus:ring-offset-gray-800"
              >
                Войти
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isLoadingCard) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-8">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-pink-400 text-4xl mb-4"></i>
          <p className="text-gray-400">Загрузка информации о клиенте...</p>
        </div>
      </div>
    );
  }

  if (!cardData) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-8">
        <div className="text-center">
          <i className="fas fa-exclamation-triangle text-red-400 text-4xl mb-4"></i>
          <p className="text-gray-400">Карта клиента не найдена</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8 pt-12 sm:pt-8">
      <div className="max-w-2xl mx-auto">
        {/* Информация о клиенте */}
        <div className="mb-6">
          <div className="bg-gradient-to-br from-gray-800 via-gray-800 to-gray-900 rounded-2xl p-6 shadow-2xl border border-gray-700/50">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg mx-auto mb-4">
                <i className="fas fa-user text-2xl text-white"></i>
              </div>
              <h1 className="text-2xl font-bold text-white">
                {cardData.clientName}
              </h1>
              <p className="text-gray-400">ID: {cardData.clientId}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-800/50 rounded-xl p-4 text-center">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Тип карты</p>
                <p className="font-semibold text-yellow-400">{cardData.cardType}</p>
              </div>
              <div className="bg-gray-800/50 rounded-xl p-4 text-center">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Статус</p>
                <p className={`font-semibold ${
                  cardData.status === "Активна" ? "text-green-400" :
                  cardData.status === "Скоро истечет" ? "text-orange-400" : 
                  "text-red-400"
                }`}>
                  {cardData.status}
                </p>
              </div>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-400">
                Действует до: <span className="text-white">{cardData.expiryDate}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Форма подтверждения визита */}
        <div>
          <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-2xl p-6 shadow-xl border border-gray-700/30">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              <i className="fas fa-clipboard-check text-pink-400 mr-2"></i>
              Подтверждение визита
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Заметки о визите (необязательно)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
                  placeholder="Заметки о проведенной процедуре или особенности визита"
                  rows={4}
                />
              </div>

              <button
                onClick={() => confirmVisitMutation.mutate({ notes })}
                disabled={confirmVisitMutation.isPending}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-4 px-4 rounded-lg font-medium hover:from-green-600 hover:to-emerald-600 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
              >
                {confirmVisitMutation.isPending ? (
                  <span className="flex items-center justify-center">
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Подтверждение...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <i className="fas fa-check-circle mr-2"></i>
                    Подтвердить визит
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}