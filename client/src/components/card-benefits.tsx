export default function CardBenefits() {
  const benefits = [
    {
      icon: "fas fa-percentage",
      color: "bg-gradient-to-r from-purple-500/30 to-pink-500/30 text-purple-300 border-purple-400/40",
      title: "🔥 СКИДКА 50% НА ВСЁ!",
      description: "Безлимитные посещения со скидкой 50% на весь период действия карты! Экономьте тысячи рублей!",
      highlight: "ВЫГОДА ДО 50 000₽"
    },
    {
      icon: "fas fa-spa",
      color: "bg-gradient-to-r from-pink-500/30 to-rose-500/30 text-pink-300 border-pink-400/40",
      title: "💎 VIP-БОНУС В ПОДАРОК",
      description: "Эксклюзивный вибромассаж глаз БЕСПЛАТНО к каждой процедуре! Роскошь и релакс включены!",
      highlight: "СТОИМОСТЬ 2 000₽"
    },
    {
      icon: "fas fa-heart",
      color: "bg-gradient-to-r from-green-500/30 to-emerald-500/30 text-green-300 border-green-400/40",
      title: "👭 ПРИВОДИ ПОДРУГ",
      description: "3 подругам одна зона БЕСПЛАТНО! Дополнительные зоны со скидкой 50%. Красота в компании друзей!",
      highlight: "ЭКОНОМЬТЕ ВМЕСТЕ!"
    },
    {
      icon: "fas fa-crown",
      color: "bg-gradient-to-r from-yellow-500/30 to-amber-500/30 text-yellow-300 border-yellow-400/40",
      title: "👑 ЭКСКЛЮЗИВНЫЙ АБОНЕМЕНТ",
      description: "Абонемент на всё тело (10 процедур) со скидкой до 70%! Доступен только владельцам карт!",
      highlight: "СКИДКА ДО 80 000₽"
    }
  ];

  return (
    <div className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 rounded-2xl p-6 shadow-2xl border border-gray-700/50 animate-stagger-2 animate-subtle-glow hover:animate-premium-float transition-all duration-500 backdrop-blur-sm">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold mb-2 bg-gradient-to-r from-pink-400 via-purple-400 to-yellow-400 bg-clip-text text-transparent">
          ✨ ЭКСКЛЮЗИВНЫЕ ПРИВИЛЕГИИ ✨
        </h3>
        <p className="text-gray-300 text-sm">Только для владельцев клубных карт ViVi</p>
      </div>
      
      <div className="space-y-5">
        {benefits.map((benefit, index) => (
          <div key={index} className={`relative p-4 rounded-xl border ${benefit.color} group transition-all duration-300 hover:transform hover:scale-[1.02] hover:shadow-lg`}>
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-white/10 to-white/5 rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <i className={`${benefit.icon} text-lg`}></i>
              </div>
              <div className="flex-1">
                <h4 className="text-white font-bold text-sm mb-1 group-hover:text-pink-100 transition-colors duration-300">
                  {benefit.title}
                </h4>
                <p className="text-gray-300 text-xs leading-relaxed group-hover:text-gray-200 transition-colors duration-300">
                  {benefit.description}
                </p>
                <div className="mt-2">
                  <span className="inline-block bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm">
                    {benefit.highlight}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 p-4 bg-gradient-to-r from-pink-500/10 to-purple-500/10 rounded-xl border border-pink-400/30">
        <div className="text-center">
          <p className="text-pink-300 font-semibold text-sm mb-1">💰 ОБЩАЯ ЭКОНОМИЯ</p>
          <p className="text-white font-bold text-lg">ДО 141 000 РУБЛЕЙ!</p>
          <p className="text-gray-400 text-xs">*при активном использовании всех привилегий</p>
        </div>
      </div>
    </div>
  );
}