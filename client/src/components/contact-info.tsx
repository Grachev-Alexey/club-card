import { useState, useEffect } from 'react';

export default function ContactInfo() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Предотвращаем автоматическое появление промпта
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallButton(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Проверяем, запущено ли приложение в standalone режиме
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isIOSStandalone = (window.navigator as any).standalone === true;
    
    if (isStandalone || isIOSStandalone) {
      setShowInstallButton(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // Для iOS показываем инструкции
      if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
        alert('Для добавления на рабочий стол:\n1. Нажмите кнопку "Поделиться" в Safari\n2. Выберите "На экран Домой"');
      } else {
        // Для других браузеров показываем общие инструкции
        alert('Для добавления на рабочий стол:\n1. Откройте меню браузера\n2. Выберите "Добавить на главный экран"');
      }
      return;
    }

    // Показываем промпт установки
    deferredPrompt.prompt();
    
    // Ждем результат
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('Пользователь принял установку');
    } else {
      console.log('Пользователь отклонил установку');
    }
    
    // Очищаем промпт
    setDeferredPrompt(null);
    setShowInstallButton(false);
  };

  return (
    <div className="mt-6 text-center">
      <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/30 animate-stagger-3 animate-subtle-glow hover:animate-premium-float transition-all duration-500">
        <p className="text-sm text-gray-400 mb-2">Вопросы по карте?</p>
        <div className="flex items-center justify-center space-x-4 mb-4">
          <a 
            href="tel:+79697771485" 
            className="flex items-center text-purple-400 hover:text-pink-400 transition-all duration-300 hover:transform hover:scale-105"
          >
            <i className="fas fa-phone mr-2"></i>
            +7 (969) 777-14-85
          </a>
          <a 
            href="https://wa.me/79956638625" 
            className="flex items-center text-green-400 hover:text-green-300 transition-all duration-300 hover:transform hover:scale-105"
          >
            <i className="fab fa-whatsapp mr-2"></i>
            WhatsApp
          </a>
        </div>
        
        {/* Кнопка добавления на рабочий стол */}
        <button
          onClick={handleInstallClick}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium py-3 px-4 rounded-lg transition-all duration-300 hover:transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
        >
          <i className="fas fa-mobile-alt mr-2"></i>
          Добавить на рабочий стол
        </button>
        <p className="text-xs text-gray-500 mt-2">
          Быстрый доступ к вашей карте с главного экрана
        </p>
      </div>
    </div>
  );
}