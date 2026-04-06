import { useLocation } from "wouter";

export default function HomePage() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-xl mx-auto mb-5">
            <span
              className="text-white font-bold text-lg tracking-wider"
              style={{ fontFamily: "Arial, sans-serif", letterSpacing: "1px" }}
            >
              ЭНСО
            </span>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
            ЭНСО
          </h1>
          <p className="text-gray-400 text-sm">Студия лазерной эпиляции</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => navigate("/master")}
            className="w-full flex items-center gap-4 bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700/50 rounded-2xl p-5 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300 group text-left"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-md shrink-0 group-hover:scale-105 transition-transform">
              <i className="fas fa-user-shield text-white text-lg"></i>
            </div>
            <div>
              <p className="text-white font-semibold">Панель мастера</p>
              <p className="text-gray-400 text-sm mt-0.5">Управление картами клиентов</p>
            </div>
            <i className="fas fa-chevron-right text-gray-600 group-hover:text-purple-400 transition-colors ml-auto"></i>
          </button>
        </div>
      </div>
    </div>
  );
}
