interface ErrorMessageProps {
  onRetry: () => void;
}

export default function ErrorMessage({ onRetry }: ErrorMessageProps) {
  return (
    <div className="w-full max-w-md text-center animate-slide-up">
      <div className="bg-gradient-to-br from-red-900/20 to-red-800/20 border border-red-500/30 rounded-2xl p-8 shadow-2xl">
        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <i className="fas fa-exclamation-triangle text-2xl text-red-400"></i>
        </div>
        <h2 className="text-xl font-semibold text-red-200 mb-2">Ошибка загрузки</h2>
        <p className="text-red-300 mb-4">Не удалось загрузить данные карты. Проверьте подключение к интернету.</p>
        <button 
          onClick={onRetry}
          className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
        >
          Попробовать снова
        </button>
      </div>
    </div>
  );
}
