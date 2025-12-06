import React, { useState, useEffect } from "react";
import { Icon  } from "@iconify/react";
import { ArrowUpRight } from "lucide-react";
import ThresholdSlider from "./sub-components/ThresholdSlider";
import { fetchStats } from "../../api/detoxify";
import ResultsPanel from "./sub-components/ResultsPanel";

const Detoxify = () => {
  const [inputText, setInputText] = useState("");
  const [detoxifyResult, setDetoxifyResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [threshold, setThreshold] = useState(0.5);
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState("analyze"); // analyze, filter, batch

const API_BASE_URL = "http://localhost:8000/api/v1";


  // Vérifier la santé du service au chargement
  useEffect(() => {
    fetchStats({ setStats});
  }, []);

  // Analyse simple d'un texte
  const handleAnalyze = async () => {
    if (inputText.trim() === "") {
      setError("Veuillez entrer un texte à analyser");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: inputText,
          threshold: threshold
        })
      });

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setDetoxifyResult({
        ...data,
        type: "analyze"
      });
      fetchStats({setStats}); // Rafraîchir les stats
    } catch (err) {
      setError(`Erreur d'analyse: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Filtrage d'un texte
  const handleFilter = async () => {
    if (inputText.trim() === "") {
      setError("Veuillez entrer un texte à filtrer");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/filter`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: inputText,
          threshold: threshold
        })
      });

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setDetoxifyResult({
        ...data,
        type: "filter"
      });
      fetchStats();
    } catch (err) {
      setError(`Erreur de filtrage: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = () => {
    if (activeTab === "analyze") {
      handleAnalyze();
    } else if (activeTab === "filter") {
      handleFilter();
    }
  };

  return (
    <div className="relative w-full h-screen bg-[#4f4d4d] text-slate-200 font-sans overflow-hidden flex items-center justify-center p-4 md:p-6 selection:bg-purple-500/30">
      
      {/* Background Gradients (Ambiance) */}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-gray-900/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-900/20 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Main Glass Container */}
      <div className="w-full max-w-[1600px] h-full max-h-[900px] flex gap-6 z-10">
        
        {/* LEFT PANEL: INPUT & CONTROLS */}
        <div className="flex-[0.8] h-full flex flex-col gap-6">
            
            {/* Header Card */}
            <div className="flex items-center justify-between p-6 bg-[#2a2a2a]/60 backdrop-blur-2xl border border-white/5 rounded-[40px] shadow-2xl">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#313030] to-gray-200 flex items-center justify-center shadow-lg">
                  <Icon icon="solar:shield-check-bold" className="text-2xl text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-medium text-white tracking-tight">Detoxify AI</h1>
                  <p className="text-xs text-slate-400">Système de modération intelligent</p>
                </div>
              </div>

              <div className="flex">
                <button className="flex items-center justify-center gap-5 px-2 py-2 bg-gradient-to-r bg-gray-600/80  hover:from-purple-600 hover:via-red-500 hover:to-yellow-400 text-white font-medium rounded-full shadow-lg transition-all duration-500">
                  <p className="ml-5">Demo</p>
                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-white">
                    <ArrowUpRight icon="solar:arrow-up-right-bold" className="text-lg text-black" />

                  </div>
                </button>
              </div>
            </div>


            {/* Input Area - Big Card */}
            <div className="flex-1 bg-[#2a2a2a]/80 backdrop-blur-3xl border border-white/5 rounded-[40px] p-8 shadow-2xl flex flex-col relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 via-red-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-light text-white">Zone de saisie</h2>
                    <div className="w-48">
                         <ThresholdSlider threshold={threshold} setThreshold={setThreshold} />
                    </div>
                </div>

                <textarea
                    placeholder={`Entrez le texte à ${activeTab === 'analyze' ? 'analyser' : 'modérer'} ici...`}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    className="flex-1 w-full bg-transparent border-none focus:ring-0 text-slate-300 placeholder-slate-600 text-lg resize-none leading-relaxed p-0"
                />

                <div className="mt-6 flex justify-between items-center pt-6 border-t border-white/5">
                    <span className="text-xs font-mono text-slate-500 bg-white/5 px-3 py-1 rounded-full">
                        {inputText.length} caractères
                    </span>
                    <button 
                        onClick={handleAction}
                        disabled={loading}
                        className="flex items-center gap-3 px-8 py-4 bg-white text-black hover:bg-slate-200 disabled:bg-slate-600 disabled:text-slate-400 rounded-[24px] font-semibold transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] active:scale-95"
                    >
                        {loading ? (
                             <Icon icon="solar:refresh-linear" className="animate-spin text-xl" />
                        ) : (
                             <Icon icon="solar:magic-stick-3-linear" className="text-xl" />
                        )}
                        {loading ? "Traitement..." : activeTab === "analyze" ? "Lancer l'analyse" : "Filtrer le contenu"}
                    </button>
                </div>
            </div>

            {/* Quick Stats Row */}
            <div className="grid grid-cols-2 gap-4 h-32">
                 <div className="bg-[#2a2a2a]/60 backdrop-blur-md border border-white/5 rounded-[32px] p-5 flex flex-col justify-between hover:bg-white/5 transition-colors cursor-default">
                    <div className="flex justify-between items-start">
                        <Icon icon="solar:graph-up-linear" className="text-slate-400 text-xl" />
                        <span className="text-xs text-slate-500 bg-black/30 px-2 py-1 rounded-lg">+2.4%</span>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-white">{stats?.total_requests || 0}</div>
                        <div className="text-xs text-slate-400">Requêtes Totales</div>
                    </div>
                 </div>
                 <div className="bg-[#2a2a2a]/60 backdrop-blur-md border border-white/5 rounded-[32px] p-5 flex flex-col justify-between hover:bg-white/5 transition-colors cursor-default">
                    <div className="flex justify-between items-start">
                        <Icon icon="solar:danger-circle-linear" className="text-slate-400 text-xl" />
                        <span className="text-xs text-red-400/80 bg-red-900/10 px-2 py-1 rounded-lg">High</span>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-white">{stats?.toxic_detected || 0}</div>
                        <div className="text-xs text-slate-400">Menaces Bloquées</div>
                    </div>
                 </div>
            </div>
        </div>

        {/* RIGHT PANEL: RESULTS */}
        <div className="flex-1 bg-[#0a0a0c]/40 backdrop-blur-xl border border-white/5 rounded-[40px] p-8 shadow-2xl relative flex flex-col">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-medium text-white">Résultats</h2>
                <button className="p-3 hover:bg-white/5 rounded-full transition-colors text-slate-400">
                    <Icon icon="solar:menu-dots-circle-linear" className="text-2xl" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-6">
                
                {/* Welcome / Empty State */}
                {!detoxifyResult && (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-40 overflow-hidden">
                         <div className="w-24 h-24 bg-gradient-to-b from-white/5 to-transparent rounded-full flex items-center justify-center mb-6">
                             <Icon icon="solar:chat-line-linear" className="text-4xl text-white/50" />
                         </div>
                         <p className="text-lg font-light max-w-xs">Sélectionnez un mode et lancez une analyse pour voir les données en temps réel.</p>
                    </div>
                )}

                {detoxifyResult ? (
                    <ResultsPanel data={detoxifyResult} />
                ) : (
                    /* ... Le code de l'état vide (Empty State) que j'avais mis avant ... */
                   <div></div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default Detoxify;