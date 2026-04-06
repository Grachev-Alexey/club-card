import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { getStatusColor, getStatusIcon } from "@/lib/utils";
import DaysCounter from "@/components/days-counter";

interface CardData {
  clientId: string;
  clientName: string;
  cardType: string;
  issueDate: string;
  expiryDate: string;
  status: string;
}

interface DigitalCardProps {
  card: CardData;
}

export default function DigitalCard({ card }: DigitalCardProps) {
  const [showMasterQR, setShowMasterQR] = useState(false);
  const cardUrl = `${window.location.origin}/card/${card.clientId}`;
  const masterUrl = `${window.location.origin}/master/${card.clientId}`;
  
  const getStatusWarning = () => {
    if (card.status === "Скоро истечет") {
      return (
        <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3 mb-6">
          <p className="text-orange-300 text-sm font-medium">
            <i className="fas fa-clock mr-2"></i>
            Карта скоро истечет. Продлите для сохранения привилегий.
          </p>
        </div>
      );
    }
    
    if (card.status === "Истекла") {
      return (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-6">
          <p className="text-red-300 text-sm font-medium">
            <i className="fas fa-exclamation-circle mr-2"></i>
            Срок действия карты истек. Обратитесь к администратору для продления.
          </p>
        </div>
      );
    }
    
    return null;
  };

  const cardOpacity = card.status === "Истекла" ? "opacity-75" : "";
  
  const getBorderColor = () => {
    if (card.status === "Истекла") return "border-red-500/30";
    if (card.status === "Скоро истечет") return "border-orange-500/30";
    if (card.status === "Активна") return "border-pink-500/30";
  };

  const getCardAnimation = () => {
    if (card.status === "Активна") return "animate-pink";  
    if (card.status === "Скоро истечет") return "animate-warning-pulse";  
    if (card.status === "Истекла") return "animate-expired-flash";
  };

  return (
    <div className={`bg-gradient-to-br from-gray-800 via-gray-800 to-gray-900 rounded-2xl p-6 shadow-2xl border ${getBorderColor()} ${getCardAnimation()} mb-6 ${cardOpacity} transition-all-smooth relative animate-stagger-1`}>
      
      {/* Card Header */}
      <div className="flex justify-between items-start mb-6">
        {/* Studio Logo with ViVi text */}
        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-pink-400/20"></div>
          <span className="text-white font-bold text-lg tracking-wider relative z-10" style={{ 
            fontFamily: 'Brush Script MT, cursive, Georgia, serif',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)',
            letterSpacing: '1px'
          }}>
            ViVi
          </span>
        </div>
        
        {/* Status Badge */}
        <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(card.status)} animate-status-change transition-colors-smooth`}>
          <i className={`${getStatusIcon(card.status)} mr-1`}></i>
          <span>{card.status}</span>
        </div>
      </div>

      {/* Card Title */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Клубная карта
        </h1>
        <p className="text-gray-400 text-sm">Студия лазерной эпиляции ViVi</p>
      </div>

      {/* Client Information */}
      <div className="mb-6">
        <p className="text-sm text-gray-400 mb-1">Владелец карты</p>
        <h2 className="text-xl font-semibold text-white">
          {card.clientName}
        </h2>
      </div>

      {/* Status Warning */}
      {getStatusWarning()}

      {/* Card Details Grid - Improved symmetry */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-800/50 rounded-xl p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Тип карты</p>
          <p className="font-semibold text-yellow-400">{card.cardType}</p>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">ID клиента</p>
          <p className="font-mono text-sm text-gray-300">{card.clientId}</p>
        </div>
      </div>

      {/* Dates Information - Improved symmetry */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-800/50 rounded-xl p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Дата выдачи</p>
          <p className="text-sm font-medium text-gray-300">{card.issueDate}</p>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Действует до</p>
          <p className={`text-sm font-medium transition-colors-smooth ${card.status === "Истекла" ? "text-red-400" : card.status === "Скоро истечет" ? "text-orange-300" : "text-white"}`}>
            {card.expiryDate}
          </p>
        </div>
      </div>

      {/* Days Counter */}
      <div className="mb-6">
        <DaysCounter expiryDate={card.expiryDate} status={card.status} />
      </div>

      {/* QR Code Section */}
      <div className="flex justify-center relative">
        <div 
          className={`bg-white p-4 rounded-xl shadow-lg transition-all duration-300 relative ${card.status === "Истекла" ? "opacity-50" : "cursor-pointer hover:shadow-xl hover:scale-105"}`}
          onClick={() => card.status !== "Истекла" && setShowMasterQR(!showMasterQR)}
        >
          {card.status === "Истекла" ? (
            <div className="w-32 h-32 bg-gray-700 rounded-lg flex items-center justify-center">
              <i className="fas fa-ban text-4xl text-gray-500"></i>
            </div>
          ) : (
            <>
              <QRCodeSVG
                value={showMasterQR ? masterUrl : cardUrl}
                size={128}
                bgColor="#ffffff"
                fgColor="#000000"
                level="M"
              />
              {/* Subtle corner indicator */}
              <div className={`absolute top-2 right-2 w-3 h-3 rounded-full transition-all duration-300 ${showMasterQR ? 'bg-purple-500' : 'bg-pink-500'}`}></div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
