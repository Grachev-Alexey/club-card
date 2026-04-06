export default function NotFoundMessage() {
  return (
    <div className="w-full max-w-md text-center animate-slide-up">
      <div className="bg-gradient-to-br from-amber-900/20 to-orange-800/20 border border-amber-500/30 rounded-2xl p-8 shadow-2xl">
        <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <i className="fas fa-search text-2xl text-amber-400"></i>
        </div>
        <h2 className="text-xl font-semibold text-amber-200 mb-2">Карта не найдена</h2>
        <p className="text-amber-300">Цифровая карта с указанным идентификатором не существует или была удалена.</p>
      </div>
    </div>
  );
}
