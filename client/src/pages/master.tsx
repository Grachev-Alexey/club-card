import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface Visit {
  id: number;
  clientId: string;
  visitDate: string;
  procedureType: string;
  notes: string;
  masterId: string;
  createdAt: string;
}

interface ClientVisitsResponse {
  clientName: string;
  visits: Visit[];
}

export default function MasterPage() {
  const [pin, setPin] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [clientId, setClientId] = useState("");
  const [procedureType, setProcedureType] = useState("");
  const [notes, setNotes] = useState("");
  const [viewingClientId, setViewingClientId] = useState("");

  const authenticate = () => {
    if (pin === "2728") {
      setIsAuthenticated(true);
    } else {
      alert("Неверный PIN-код");
    }
  };

  const scanVisitMutation = useMutation({
    mutationFn: async (data: { clientId: string; procedureType: string; notes: string }) => {
      const response = await fetch("/api/master/scan-visit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pin: "2728",
          ...data
        })
      });
      
      if (!response.ok) {
        throw new Error("Failed to register visit");
      }
      
      return response.json();
    },
    onSuccess: () => {
      setClientId("");
      setProcedureType("");
      setNotes("");
      alert("Посещение зарегистрировано успешно!");
      queryClient.invalidateQueries({ queryKey: ['/api/master/client-visits'] });
    },
    onError: (error: any) => {
      alert(`Ошибка: ${error.message}`);
    }
  });

  const { data: clientVisits, isLoading: isLoadingVisits } = useQuery({
    queryKey: ['/api/master/client-visits', viewingClientId],
    queryFn: async (): Promise<ClientVisitsResponse> => {
      const response = await fetch("/api/master/client-visits", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pin: "2728",
          clientId: viewingClientId
        })
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch client visits");
      }
      
      return response.json();
    },
    enabled: isAuthenticated && !!viewingClientId
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-8 pt-12 sm:pt-8">
        <div className="w-full max-w-md animate-stagger-1">
          <div className="bg-gradient-to-br from-gray-800 via-gray-800 to-gray-900 rounded-2xl p-6 shadow-2xl border border-gray-700/50 animate-gentle-pulse">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg mx-auto mb-4">
                <i className="fas fa-user-shield text-2xl text-white"></i>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Панель мастера
              </h1>
              <p className="text-gray-400 text-sm">Введите PIN-код для доступа</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  PIN-код
                </label>
                <input
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="Введите PIN-код"
                  maxLength={4}
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

  return (
    <div className="min-h-screen px-4 py-8 pt-12 sm:pt-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 animate-stagger-1">
          <div className="bg-gradient-to-br from-gray-800 via-gray-800 to-gray-900 rounded-2xl p-6 shadow-2xl border border-gray-700/50">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Панель мастера
              </h1>
              <button
                onClick={() => setIsAuthenticated(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <i className="fas fa-sign-out-alt"></i> Выйти
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Регистрация посещения */}
          <div className="animate-stagger-2">
            <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-2xl p-6 shadow-xl border border-gray-700/30 animate-subtle-glow">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                <i className="fas fa-qrcode text-pink-400 mr-2"></i>
                Регистрация посещения
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    ID Клиента
                  </label>
                  <input
                    type="text"
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="Введите ID клиента"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Тип процедуры
                  </label>
                  <select
                    value={procedureType}
                    onChange={(e) => setProcedureType(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  >
                    <option value="">Выберите процедуру</option>
                    <option value="Лазерная эпиляция ног">Лазерная эпиляция ног</option>
                    <option value="Лазерная эпиляция рук">Лазерная эпиляция рук</option>
                    <option value="Лазерная эпиляция лица">Лазерная эпиляция лица</option>
                    <option value="Лазерная эпиляция подмышек">Лазерная эпиляция подмышек</option>
                    <option value="Лазерная эпиляция бикини">Лазерная эпиляция бикини</option>
                    <option value="Комплексная процедура">Комплексная процедура</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Заметки (необязательно)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
                    placeholder="Дополнительные заметки о процедуре"
                    rows={3}
                  />
                </div>

                <button
                  onClick={() => scanVisitMutation.mutate({ clientId, procedureType, notes })}
                  disabled={!clientId || !procedureType || scanVisitMutation.isPending}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-4 rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {scanVisitMutation.isPending ? (
                    <span className="flex items-center justify-center">
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Регистрация...
                    </span>
                  ) : (
                    "Зарегистрировать посещение"
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* История посещений */}
          <div className="animate-stagger-3">
            <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-2xl p-6 shadow-xl border border-gray-700/30 animate-subtle-glow">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                <i className="fas fa-history text-pink-400 mr-2"></i>
                История посещений
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    ID Клиента
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={viewingClientId}
                      onChange={(e) => setViewingClientId(e.target.value)}
                      className="flex-1 px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      placeholder="Введите ID клиента"
                    />
                  </div>
                </div>

                {isLoadingVisits && (
                  <div className="text-center py-4">
                    <i className="fas fa-spinner fa-spin text-pink-400"></i>
                    <p className="text-gray-400 mt-2">Загрузка...</p>
                  </div>
                )}

                {clientVisits && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-white">
                      {clientVisits.clientName}
                    </h3>
                    
                    {clientVisits.visits.length === 0 ? (
                      <p className="text-gray-400 text-center py-4">Посещений не найдено</p>
                    ) : (
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {clientVisits.visits.map((visit) => (
                          <div key={visit.id} className="bg-gray-800/50 rounded-lg p-3 border border-gray-600/30">
                            <div className="flex justify-between items-start mb-2">
                              <span className="text-pink-400 font-medium">{visit.procedureType}</span>
                              <span className="text-xs text-gray-400">{visit.visitDate}</span>
                            </div>
                            {visit.notes && (
                              <p className="text-gray-300 text-sm">{visit.notes}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}