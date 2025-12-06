import React from "react";
import { Icon } from "@iconify/react";

const ThresholdSlider = ({ threshold, setThreshold }) => {
  // Calcul du pourcentage pour la largeur de la barre (0 à 100%)
  const percentage = Math.min(Math.max(threshold * 100, 0), 100);

  // Déterminer le label et la couleur en fonction du seuil
  const getStatus = () => {
    if (threshold < 0.3) return { label: "Strict (Sécurisé)", color: "text-emerald-400" };
    if (threshold < 0.7) return { label: "Équilibré", color: "text-blue-400" };
    return { label: "Permissif (Risqué)", color: "text-purple-400" };
  };

  const status = getStatus();

  return (
    <div className="w-full group">
      {/* Header du Slider */}
      <div className="flex items-end justify-between mb-3">
        <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
          <Icon icon="solar:tuning-square-2-linear" className="text-lg opacity-70" />
          Sensibilité
        </label>
        
        <div className="text-right">
            <span className={`block text-xs font-bold uppercase tracking-wider ${status.color}`}>
                {status.label}
            </span>
            <span className="text-[10px] text-slate-500 font-mono">
                Seuil: {threshold.toFixed(2)}
            </span>
        </div>
      </div>

      {/* Container du Slider Custom */}
      <div className="relative w-full h-6 flex items-center select-none">
        
        {/* 1. La piste de fond (Background Track) */}
        <div className="absolute w-full h-1.5 bg-[#0a0a0c] border border-white/10 rounded-full overflow-hidden"></div>

        {/* 2. La barre de progression colorée (Active Track) */}
        <div 
            className="absolute h-1.5 rounded-full bg-gradient-to-r from-yellow-400 via-red-500 to-purple-600 shadow-[0_0_15px_rgba(168,85,247,0.5)] transition-all duration-75 ease-out"
            style={{ width: `${percentage}%` }}
        ></div>

        {/* 3. Le bouton (Thumb) - Positionné en absolute selon le pourcentage */}
        <div 
            className="absolute top-1/2 -translate-y-1/2 h-5 w-5 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)] border-2 border-blue-500 cursor-grab active:cursor-grabbing hover:scale-110 transition-transform z-10"
            style={{ left: `calc(${percentage}% - 10px)` }} // -10px pour centrer le cercle de 20px
        >
            {/* Petit point au centre */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-gray-500 rounded-full"></div>
        </div>

        {/* 4. L'input réel mais INVISIBLE qui capture les clics */}
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={threshold}
          onChange={(e) => setThreshold(parseFloat(e.target.value))}
          className="absolute w-full h-full opacity-0 cursor-pointer z-20"
        />
      </div>

      {/* Indicateurs visuels sous la barre */}
      <div className="flex justify-between mt-2 px-1">
          <div className="w-px h-1.5 bg-white/10"></div>
          <div className="w-px h-1.5 bg-white/10"></div>
          <div className="w-px h-1.5 bg-white/10"></div>
          <div className="w-px h-1.5 bg-white/10"></div>
          <div className="w-px h-1.5 bg-white/10"></div>
      </div>
    </div>
  );
};

export default ThresholdSlider;