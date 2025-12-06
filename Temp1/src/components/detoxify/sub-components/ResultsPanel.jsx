import React from "react";
import { Icon } from "@iconify/react";

// Sous-composant pour afficher une barre de score individuelle
const ScoreBar = ({ label, score, icon }) => {
  // Déterminer la couleur en fonction de la gravité
  const getColor = (val) => {
    if (val > 0.8) return "bg-gradient-to-r from-red-600 to-red-400"; // Très critique
    if (val > 0.5) return "bg-gradient-to-r from-orange-500 to-amber-400"; // Moyen
    return "bg-gradient-to-r from-emerald-500 to-teal-400"; // Faible
  };

  const getTextColor = (val) => {
      if (val > 0.8) return "text-red-400";
      if (val > 0.5) return "text-orange-400";
      return "text-emerald-400";
  }

  return (
    <div className="mb-4 group">
      <div className="flex justify-between items-end mb-1">
        <div className="flex items-center gap-2 text-slate-300">
          <Icon icon={icon} className="text-lg opacity-70 group-hover:opacity-100 transition-opacity" />
          <span className="text-sm font-medium capitalize">{label}</span>
        </div>
        <span className={`text-sm font-bold font-mono ${getTextColor(score)}`}>
          {(score * 100).toFixed(1)}%
        </span>
      </div>
      <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden backdrop-blur-sm border border-white/5">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-out ${getColor(score)} shadow-[0_0_10px_rgba(255,255,255,0.2)]`}
          style={{ width: `${score * 100}%` }}
        ></div>
      </div>
    </div>
  );
};

const ResultsPanel = ({ data }) => {
  // Simulation des données si null (pour l'exemple visuel basé sur votre JSON)
  const result = data || {
    text: "fuck you and i want to tell you that you are beautiful",
    is_toxic: true,
    scores: {
      toxicity: 0.9979,
      severe_toxicity: 0.3640,
      obscene: 0.9885,
      threat: 0.0056,
      insult: 0.9036,
      identity_attack: 0.0086
    },
    max_toxicity: 0.9979,
    category: "toxicity",
    recommendation: "BLOCK"
  };

  // Mapping des icônes pour chaque catégorie
  const icons = {
    toxicity: "solar:danger-circle-bold",
    severe_toxicity: "solar:bomb-emoji-bold",
    obscene: "solar:forbidden-circle-bold",
    threat: "solar:shield-warning-bold",
    insult: "solar:chat-round-angry-bold",
    identity_attack: "solar:users-group-rounded-bold"
  };

  // Mapping des libellés français
  const labels = {
    toxicity: "Toxicité Générale",
    severe_toxicity: "Toxicité Sévère",
    obscene: "Obscénité",
    threat: "Menace",
    insult: "Insulte",
    identity_attack: "Attaque Identitaire"
  };

  return (
    <div className="animate-fade-in-up h-full flex flex-col">
      
      {/* 1. CARTE PRINCIPALE - RECOMMANDATION */}
      <div className={`relative overflow-hidden rounded-[32px] p-8 mb-6 border transition-all duration-500 ${
        result.recommendation === "BLOCK" 
          ? "bg-gradient-to-br from-red-500/10 via-red-900/5 to-black border-red-500/20 shadow-[0_0_20px_-5px_rgba(239,68,68,0.3)]"
          : "bg-gradient-to-br from-emerald-500/10 via-emerald-900/5 to-black border-emerald-500/20 shadow-[0_0_20px_-5px_rgba(16,185,129,0.3)]"
      }`}>
        {/* Effet de lueur en arrière-plan */}
        <div className={`absolute -top-10 -right-10 w-40 h-40 rounded-full blur-[60px] mix-blend-screen ${
            result.recommendation === "BLOCK" ? "bg-red-600/40" : "bg-emerald-600/40"
        }`}></div>

        <div className="relative z-10">
          <div className="flex justify-between items-start">
            <div>
               <div className="flex items-center gap-3 mb-2">
                 <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase border ${
                   result.recommendation === "BLOCK" 
                     ? "bg-red-500/20 border-red-500/40 text-red-200" 
                     : "bg-emerald-500/20 border-emerald-500/40 text-emerald-200"
                 }`}>
                   {result.recommendation}
                 </span>
                 <span className="text-slate-400 text-xs uppercase tracking-widest">IA Confidence</span>
               </div>
               <h2 className="text-4xl font-bold text-white mb-1">
                 {(result.max_toxicity * 100).toFixed(1)}%
               </h2>
               <p className="text-slate-400 text-sm">Score de toxicité maximal détecté</p>
            </div>

            <div className={`p-4 rounded-2xl ${
                result.recommendation === "BLOCK" ? "bg-red-500 text-white" : "bg-emerald-500 text-white"
            } shadow-lg`}>
                <Icon 
                    icon={result.recommendation === "BLOCK" ? "solar:shield-cross-bold" : "solar:shield-check-bold"} 
                    className="text-3xl" 
                />
            </div>
          </div>
        </div>
      </div>

      {/* 2. GRILLE DES SCORES (DÉTAILS) */}
      <div className="flex-1 bg-[#2a2a2a]/40 backdrop-blur-md rounded-[32px] p-6 border border-white/5 overflow-y-auto custom-scrollbar">
        <h3 className="text-white font-medium mb-6 flex items-center gap-2">
            <Icon icon="solar:chart-square-linear" className="text-purple-400" />
            Analyse Détaillée
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
          {/* On map sur les clés de l'objet scores */}
          {Object.entries(result.scores).map(([key, value]) => (
            <ScoreBar 
              key={key} 
              label={labels[key] || key} 
              score={value} 
              icon={icons[key] || "solar:danger-circle-linear"} 
            />
          ))}
        </div>

        {/* Section Texte Analysé */}
        <div className="mt-8 pt-6 border-t border-white/5">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-3">Contexte Analysé</p>
            <div className="p-4 rounded-xl bg-black/20 border border-white/5 text-slate-300 italic font-light leading-relaxed relative">
                <Icon icon="solar:quote-up-square-linear" className="absolute -top-3 -left-2 text-2xl text-purple-500/50 bg-[#121216] rounded-full" />
                "{result.text}"
            </div>
        </div>
      </div>

    </div>
  );
};

export default ResultsPanel;