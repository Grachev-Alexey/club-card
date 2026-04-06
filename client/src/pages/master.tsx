import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";

const PIN = "2728";

const CARD_TYPES = [
  "6 месяцев",
  "12 месяцев",
  "36 месяцев",
];

interface Card {
  id: number;
  clientId: string;
  clientName: string;
  cardType: string;
  issueDate: string;
  expiryDate: string;
  status: string;
}

function statusColor(status: string) {
  if (status === "Активна") return "text-green-400";
  if (status === "Скоро истечет") return "text-orange-400";
  return "text-red-400";
}

// ── Auth screen ──────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [pin, setPin] = useState("");

  const submit = () => {
    if (pin === PIN) {
      onLogin();
    } else {
      alert("Неверный PIN-код");
      setPin("");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-gradient-to-br from-gray-800 via-gray-800 to-gray-900 rounded-2xl p-6 shadow-2xl border border-gray-700/50">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg mx-auto mb-4">
              <i className="fas fa-user-shield text-2xl text-white"></i>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Панель мастера
            </h1>
            <p className="text-gray-400 text-sm mt-1">Введите PIN-код для доступа</p>
          </div>

          <div className="space-y-4">
            <input
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent text-center text-2xl tracking-widest"
              placeholder="••••"
              maxLength={4}
            />
            <button
              onClick={submit}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-4 rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-300"
            >
              Войти
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// ── Create card modal ────────────────────────────────────────────────────────
function CreateCardModal({ onClose }: { onClose: () => void }) {
  const [clientName, setClientName] = useState("");
  const [cardType, setCardType] = useState(CARD_TYPES[0]);

  const createMutation = useMutation({
    mutationFn: async () => {
      const clientId = generateId();
      const res = await fetch("/api/master/create-card", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: PIN, clientId, clientName: clientName.trim(), cardType }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.details || data.error || "Ошибка при создании карты");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/master/cards"] });
      onClose();
    },
    onError: (err: any) => {
      alert(`Ошибка: ${err.message}`);
    },
  });

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 w-full max-w-md border border-gray-700/50 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-white">Новая карта</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <i className="fas fa-times text-lg"></i>
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Имя клиента</label>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
              placeholder="Фамилия Имя"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Тип карты</label>
            <select
              value={cardType}
              onChange={(e) => setCardType(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
              {CARD_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-lg border border-gray-600 text-gray-300 hover:text-white hover:border-gray-400 transition-all"
            >
              Отмена
            </button>
            <button
              onClick={() => createMutation.mutate()}
              disabled={!clientName.trim() || createMutation.isPending}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createMutation.isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <i className="fas fa-spinner fa-spin"></i> Создание...
                </span>
              ) : (
                "Создать карту"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Confirm delete modal ─────────────────────────────────────────────────────
function ConfirmDeleteModal({ card, onClose }: { card: Card; onClose: () => void }) {
  const deleteMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/master/delete-card", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: PIN, clientId: card.clientId }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Ошибка при удалении");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/master/cards"] });
      onClose();
    },
    onError: (err: any) => {
      alert(`Ошибка: ${err.message}`);
    },
  });

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 w-full max-w-sm border border-gray-700/50 shadow-2xl">
        <div className="text-center mb-5">
          <div className="w-14 h-14 bg-red-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
            <i className="fas fa-trash-alt text-red-400 text-xl"></i>
          </div>
          <h2 className="text-lg font-bold text-white mb-1">Удалить карту?</h2>
          <p className="text-gray-400 text-sm">
            {card.clientName} (ID: {card.clientId})
          </p>
          <p className="text-red-400 text-xs mt-2">Это действие нельзя отменить</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-lg border border-gray-600 text-gray-300 hover:text-white hover:border-gray-400 transition-all"
          >
            Отмена
          </button>
          <button
            onClick={() => deleteMutation.mutate()}
            disabled={deleteMutation.isPending}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-medium transition-all disabled:opacity-50"
          >
            {deleteMutation.isPending ? (
              <span className="flex items-center justify-center gap-2">
                <i className="fas fa-spinner fa-spin"></i> Удаление...
              </span>
            ) : (
              "Удалить"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Dashboard ────────────────────────────────────────────────────────────────
function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [showCreate, setShowCreate] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Card | null>(null);
  const [search, setSearch] = useState("");

  const { data: cards = [], isLoading } = useQuery<Card[]>({
    queryKey: ["/api/master/cards"],
    queryFn: async () => {
      const res = await fetch("/api/master/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: PIN }),
      });
      if (!res.ok) throw new Error("Ошибка загрузки карт");
      return res.json();
    },
  });

  const filtered = cards.filter(
    (c) =>
      c.clientName.toLowerCase().includes(search.toLowerCase()) ||
      c.clientId.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Панель мастера
            </h1>
            <p className="text-gray-400 text-sm mt-0.5">Управление клубными картами</p>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
          >
            <i className="fas fa-sign-out-alt"></i> Выйти
          </button>
        </div>

        {/* Stats + actions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="col-span-2 sm:col-span-1 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-4 border border-gray-700/40">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Всего карт</p>
            <p className="text-3xl font-bold text-white">{cards.length}</p>
          </div>
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-4 border border-gray-700/40">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Активных</p>
            <p className="text-3xl font-bold text-green-400">
              {cards.filter((c) => c.status === "Активна").length}
            </p>
          </div>
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-4 border border-gray-700/40">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Истекают</p>
            <p className="text-3xl font-bold text-orange-400">
              {cards.filter((c) => c.status === "Скоро истечет").length}
            </p>
          </div>
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-4 border border-gray-700/40">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Истекли</p>
            <p className="text-3xl font-bold text-red-400">
              {cards.filter((c) => c.status === "Истекла").length}
            </p>
          </div>
        </div>

        {/* Search + create */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm"></i>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск по имени или ID..."
              className="w-full pl-9 pr-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-5 py-3 rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all whitespace-nowrap"
          >
            <i className="fas fa-plus"></i> Создать карту
          </button>
        </div>

        {/* Cards table */}
        <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-2xl border border-gray-700/30 overflow-hidden shadow-xl">
          {isLoading ? (
            <div className="py-16 text-center">
              <i className="fas fa-spinner fa-spin text-pink-400 text-3xl mb-3"></i>
              <p className="text-gray-400">Загрузка карт...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center">
              <i className="fas fa-credit-card text-gray-600 text-4xl mb-3"></i>
              <p className="text-gray-400">
                {search ? "Карты не найдены" : "Карт пока нет"}
              </p>
              {!search && (
                <button
                  onClick={() => setShowCreate(true)}
                  className="mt-4 text-pink-400 hover:text-pink-300 text-sm underline"
                >
                  Создать первую карту
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-700/50">
                      <th className="text-left px-5 py-3 text-gray-400 font-medium">Клиент</th>
                      <th className="text-left px-4 py-3 text-gray-400 font-medium">ID</th>
                      <th className="text-left px-4 py-3 text-gray-400 font-medium">Тип карты</th>
                      <th className="text-left px-4 py-3 text-gray-400 font-medium">Выдана</th>
                      <th className="text-left px-4 py-3 text-gray-400 font-medium">Истекает</th>
                      <th className="text-left px-4 py-3 text-gray-400 font-medium">Статус</th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((card, i) => (
                      <tr
                        key={card.id}
                        className={`border-b border-gray-700/20 hover:bg-gray-700/20 transition-colors ${
                          i % 2 === 0 ? "" : "bg-gray-800/20"
                        }`}
                      >
                        <td className="px-5 py-4 font-medium text-white">{card.clientName}</td>
                        <td className="px-4 py-4 text-gray-400 font-mono text-xs">{card.clientId}</td>
                        <td className="px-4 py-4 text-gray-300">{card.cardType}</td>
                        <td className="px-4 py-4 text-gray-400">{card.issueDate}</td>
                        <td className="px-4 py-4 text-gray-400">{card.expiryDate}</td>
                        <td className="px-4 py-4">
                          <span className={`text-xs font-semibold ${statusColor(card.status)}`}>
                            {card.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <button
                            onClick={() => setDeleteTarget(card)}
                            className="text-gray-500 hover:text-red-400 transition-colors p-1"
                            title="Удалить карту"
                          >
                            <i className="fas fa-trash-alt"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="sm:hidden divide-y divide-gray-700/30">
                {filtered.map((card) => (
                  <div key={card.id} className="px-4 py-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-white truncate">{card.clientName}</p>
                        <p className="text-xs text-gray-500 font-mono mt-0.5">{card.clientId}</p>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-gray-400">
                          <span>{card.cardType}</span>
                          <span>до {card.expiryDate}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <span className={`text-xs font-semibold ${statusColor(card.status)}`}>
                          {card.status}
                        </span>
                        <button
                          onClick={() => setDeleteTarget(card)}
                          className="text-gray-500 hover:text-red-400 transition-colors"
                        >
                          <i className="fas fa-trash-alt"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {showCreate && <CreateCardModal onClose={() => setShowCreate(false)} />}
      {deleteTarget && (
        <ConfirmDeleteModal card={deleteTarget} onClose={() => setDeleteTarget(null)} />
      )}
    </div>
  );
}

// ── Main export ──────────────────────────────────────────────────────────────
export default function MasterPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  if (!isAuthenticated) {
    return <LoginScreen onLogin={() => setIsAuthenticated(true)} />;
  }

  return <Dashboard onLogout={() => setIsAuthenticated(false)} />;
}
