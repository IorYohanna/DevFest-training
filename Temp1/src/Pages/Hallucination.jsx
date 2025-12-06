import React, { useState, useEffect } from 'react';

// --- CONFIGURATION API (CONNECTÉE AU VRAI BACKEND) ---
const API_CONFIG = {
  baseUrl: "http://localhost:8000",
  endpoint: "/api/v1/detect-hallucination",
  useMockMode: false
};

// --- ICONS ---
const Icons = {
  Brain: ({className}) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/></svg>,
  Sparkles: ({className}) => <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M9 9h4"/></svg>,
  Alert: ({className}) => <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>,
  Check: ({className}) => <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>,
  Search: ({className}) => <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>,
  Copy: ({className}) => <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>,
  Diff: ({className}) => <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v18"/><path d="M5 10h14"/><path d="M5 14h14"/></svg>
};

// --- TYPEWRITER EFFECT ---
const Typewriter = ({ text, speed = 10 }) => {
  const [displayedText, setDisplayedText] = useState('');
  
  useEffect(() => {
    let index = 0;
    setDisplayedText('');
    const interval = setInterval(() => {
      if (index < text.length) {
        setDisplayedText((prev) => prev + text.charAt(index));
        index++;
      } else {
        clearInterval(interval);
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);

  return <span>{displayedText}</span>;
};

const Hallucination = () => {
  const [userInput, setUserInput] = useState('');
  const [loadingStep, setLoadingStep] = useState(0); 
  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState('synthesis');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);

  // --- APPEL API RÉEL ---
  const fetchAnalysis = async (prompt) => {
    try {
      setError(null);
      setLoadingStep(1);
      await wait(300);
      
      setLoadingStep(2);
      
      const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: prompt })
      });
      
      setLoadingStep(3);
      await wait(200);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Erreur HTTP ${response.status}`);
      }

      const data = await response.json();
      return data;
      
    } catch (error) {
      console.error("❌ Erreur de connexion:", error);
      setError(error.message || "Impossible de contacter le serveur Python. Vérifiez qu'il tourne sur le port 8000.");
      return null;
    }
  };

  const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userInput.trim()) return;
    
    setCopied(false);
    setActiveTab('synthesis');
    setResult(null);
    setError(null);
    
    const data = await fetchAnalysis(userInput);
    if (data) setResult(data);
    setLoadingStep(0);
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.ai_analysis.corrected_text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0E0E1A] text-slate-200 font-sans selection:bg-orange-500/30 overflow-x-hidden relative">
      
      {/* Background Ambiant */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-indigo-700/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-orange-700/10 rounded-full blur-[100px]"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 brightness-100 contrast-150"></div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-12 flex flex-col items-center">
        
        {/* HEADER */}
        <header className="text-center mb-12 animate-fade-in-down">
          <div className="inline-flex items-center justify-center p-2 mb-4 bg-slate-900/50 border border-slate-700/50 rounded-full backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-orange-400 mr-2 animate-ping"></span>
            <span className="text-xs font-mono text-orange-400 tracking-widest uppercase">Safe AI System v2.0</span>
          </div>
          <h1 className="text-6xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-100 to-slate-400 mb-4 drop-shadow-lg">
            Hallucination <span className="font-light italic text-orange-400">Buster</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Interface de surveillance neurale pour détecter, analyser et corriger les dérives factuelles des LLM.
          </p>
        </header>

        {/* MAIN INPUT CARD */}
        <div className="w-full max-w-3xl relative z-20">
          <div className="relative group rounded-2xl p-[1px] bg-gradient-to-b from-indigo-500/40 via-slate-700/30 to-transparent">
            <div className="bg-[#151525] backdrop-blur-xl rounded-2xl p-8 shadow-2xl">
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="prompt" className="text-sm font-semibold text-indigo-400 uppercase tracking-wider flex items-center gap-2">
                    <Icons.Brain className="w-6 h-6 text-orange-400"/>
                    Entrée Prompt Utilisateur
                  </label>
                  <div className="relative">
                    <textarea
                      id="prompt"
                      rows="3"
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      disabled={loadingStep > 0}
                      className="w-full bg-[#0E0E1A] border border-slate-700 text-slate-100 rounded-xl p-4 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all resize-none text-lg placeholder-slate-600 font-light"
                      placeholder="Ex: La pénicilline a été découverte par Alexander Fleming en 1899."
                    />
                    <div className="absolute bottom-3 right-3 text-xs text-slate-600 font-mono">
                      {userInput.length} chars
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loadingStep > 0 || !userInput}
                  className={`
                    relative w-full h-14 rounded-xl font-bold text-lg tracking-wide transition-all duration-300 overflow-hidden 
                    ${loadingStep > 0 
                       ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                       : 'bg-slate-900 border border-indigo-500/50 text-indigo-200 hover:bg-slate-800 shadow-xl shadow-indigo-900/20 group'
                    }
                  `}
                >
                  <span className="relative z-10 flex items-center justify-center gap-3">
                    {loadingStep === 0 ? (
                      <>
                        Lancer l'Analyse de Vérité 
                        <Icons.Search className="w-5 h-5 group-hover:text-orange-400 transition-colors"/>
                      </>
                    ) : (
                      <>
                         Analyse en cours...
                        <span className="flex space-x-1">
                          <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce delay-75"></span>
                          <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce delay-150"></span>
                          <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce delay-300"></span>
                        </span>
                      </>
                    )}
                  </span>
                  <div className={`absolute inset-0 rounded-xl p-[2px] pointer-events-none transition-opacity duration-300 ${loadingStep === 0 ? 'group-hover:opacity-100 opacity-0' : 'opacity-100 animate-pulse-slow'}`}>
                     <div className="w-full h-full rounded-[10px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent"></div>
                  </div>
                </button>
              </form>

              {/* BARRE DE PROGRESSION */}
              {loadingStep > 0 && (
                 <div className="mt-6 space-y-2">
                    <div className="flex justify-between text-xs font-mono text-indigo-300 uppercase">
                       <span className={loadingStep >= 1 ? "opacity-100" : "opacity-30"}>1. Scanning Prompt</span>
                       <span className={loadingStep >= 2 ? "opacity-100" : "opacity-30"}>2. RAG Verification</span>
                       <span className={loadingStep >= 3 ? "opacity-100" : "opacity-30"}>3. Synthesis</span>
                    </div>
                    <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                       <div 
                         className="h-full bg-indigo-500 transition-all duration-500 ease-out"
                         style={{ width: `${(loadingStep / 3) * 100}%` }}
                       ></div>
                    </div>
                 </div>
              )}

              {/* MESSAGE D'ERREUR */}
              {error && (
                <div className="mt-6 p-4 bg-red-950/30 border border-red-500/30 rounded-lg text-red-200">
                  <div className="flex items-start gap-3">
                    <Icons.Alert className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5"/>
                    <div>
                      <p className="font-semibold">Erreur de connexion</p>
                      <p className="text-sm text-red-300 mt-1">{error}</p>
                      <p className="text-xs text-red-400 mt-2">
                        💡 Assurez-vous que le backend Python tourne : <code className="bg-red-900/30 px-2 py-0.5 rounded">uvicorn main:app --reload</code>
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RESULTAT */}
        {result && (
          <div className="w-full max-w-4xl mt-10 animate-fade-in-up space-y-6">
            
            {/* Status Banner */}
            <div className={`
               flex flex-col md:flex-row items-center justify-between p-4 rounded-lg border backdrop-blur-md
               ${result.ai_analysis.is_hallucination 
                 ? 'bg-red-950/30 border-red-500/30 text-red-200' 
                 : 'bg-green-950/30 border-green-500/30 text-green-200'}
            `}>
              <div className="flex items-center gap-4">
                 <div className={`p-3 rounded-full ${result.ai_analysis.is_hallucination ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                    {result.ai_analysis.is_hallucination ? <Icons.Alert className="w-6 h-6" /> : <Icons.Check className="w-6 h-6" />}
                 </div>
                 <div>
                    <h2 className={`text-lg font-bold tracking-wide ${result.ai_analysis.is_hallucination ? 'text-red-100' : 'text-green-100'}`}>
                       {result.ai_analysis.is_hallucination ? "ANOMALIE FACTUELLE DÉTECTÉE" : "INFORMATION CONFIRMÉE"}
                    </h2>
                    <p className="text-slate-400 text-sm">
                      Confiance IA : <span className="text-white font-mono">{(result.ai_analysis.confidence_score * 100).toFixed(1)}%</span>
                      {result.ai_analysis.facts_checked > 0 && (
                        <> • {result.ai_analysis.facts_checked} fait(s) vérifié(s)</>
                      )}
                    </p>
                 </div>
              </div>
              <div className="mt-4 md:mt-0 flex gap-2">
                 <button onClick={handleCopy} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-sm font-medium transition flex items-center gap-2">
                    {copied ? <Icons.Check className="w-4 h-4 text-green-400"/> : <Icons.Copy className="w-4 h-4"/>}
                    {copied ? 'Copié !' : 'Copier'}
                 </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-800">
               <button 
                 onClick={() => setActiveTab('synthesis')}
                 className={`px-6 py-3 text-sm font-medium transition-all relative ${activeTab === 'synthesis' ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}
               >
                 Synthèse & Correction
                 {activeTab === 'synthesis' && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-indigo-400 shadow-[0_0_10px_#8b5cf6]"></div>}
               </button>
               <button 
                 onClick={() => setActiveTab('diff')}
                 className={`px-6 py-3 text-sm font-medium transition-all relative ${activeTab === 'diff' ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}
               >
                 Analyse Différentielle
                 {activeTab === 'diff' && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-indigo-400 shadow-[0_0_10px_#8b5cf6]"></div>}
               </button>
            </div>

            {/* Contenu */}
            <div className="bg-[#151525] border border-t-0 border-slate-800 rounded-b-xl p-8 min-h-[300px]">
              
              {/* TAB SYNTHESE */}
              {activeTab === 'synthesis' && (
                <div className="animate-fade-in-up">
                  <h3 className="text-sm font-mono text-indigo-600 mb-4 uppercase tracking-widest">Vérité Reconstituée</h3>
                  <div className="text-xl md:text-2xl leading-relaxed font-light text-slate-200">
                     <Typewriter text={result.ai_analysis.corrected_text} speed={10} />
                     <span className="inline-block w-2 h-6 bg-indigo-500 ml-1 animate-pulse align-middle"></span>
                  </div>

                  <div className="mt-10 grid grid-cols-1 gap-4">
                     <h3 className="text-sm font-mono text-slate-500 uppercase tracking-widest flex items-center gap-2">
                       <Icons.Search className="w-4 h-4 text-orange-400" /> Sources RAG
                     </h3>
                     {result.ai_analysis.rag_sources.map(source => (
                       <div key={source.id} className="group p-4 bg-slate-900/50 hover:bg-slate-900 border border-slate-800 hover:border-slate-600 rounded-lg transition-all cursor-default">
                          <div className="flex justify-between items-start">
                             <span className="font-semibold text-slate-200 group-hover:text-indigo-400 transition-colors">{source.title}</span>
                             <span className={`text-[10px] px-2 py-0.5 rounded border ${source.validity === 'correct' ? 'border-green-500/30 text-green-400' : 'border-red-500/30 text-red-400'}`}>
                                {source.validity.toUpperCase()}
                             </span>
                          </div>
                          <p className="text-slate-500 text-sm mt-2 font-mono">"{source.snippet}"</p>
                       </div>
                     ))}
                  </div>
                </div>
              )}

              {/* TAB DIFF */}
              {activeTab === 'diff' && (
                 <div className="animate-fade-in-up space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="space-y-2 opacity-60">
                          <label className="text-xs font-bold text-red-500 uppercase">Input Utilisateur</label>
                          <div className="p-4 rounded bg-red-950/10 border border-red-900/50 text-red-200/70 line-through decoration-red-500/50">
                             {result.original_prompt}
                          </div>
                       </div>
                       <div className="space-y-2">
                          <label className="text-xs font-bold text-green-500 uppercase">Réalité Factuelle</label>
                          <div className="p-4 rounded bg-green-950/10 border border-green-900/50 text-green-100">
                             {result.ai_analysis.correction_segments.map((seg, idx) => (
                               <span key={idx} className={
                                 seg.type === 'correct' ? 'bg-green-500/20 text-green-300 font-bold px-1 rounded mx-0.5 border-b border-green-500' :
                                 seg.type === 'incorrect' ? 'bg-red-500/20 text-red-300 line-through px-1 rounded mx-0.5 opacity-60' : ''
                               }>
                                 {seg.text}
                               </span>
                             ))}
                          </div>
                       </div>
                    </div>

                    <div className="p-4 bg-slate-900 rounded border border-slate-800 text-sm text-slate-400">
                       <strong className="text-slate-200">Note :</strong> Les corrections ont été validées contre les sources RAG externes.
                    </div>
                 </div>
              )}

            </div>
          </div>
        )}

      </div>

      {/* FOOTER */}
      <footer className="absolute bottom-4 w-full text-center">
        <p className="text-slate-600 text-xs font-mono">
          Developed for AlgoMada • Safe AI Protocol • <span className={error ? "text-red-600" : "text-green-600"}>
            {error ? "Backend Déconnecté" : "Backend Connecté ✓"}
          </span>
        </p>
      </footer>

      <style>{`
        @keyframes shine { 100% { left: 125%; } }
        .animate-shine { animation: shine 1s; }
        .animate-fade-in-down { animation: fadeInDown 0.8s ease-out; }
        .animate-fade-in-up { animation: fadeInUp 0.8s ease-out; }
        @keyframes fadeInDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse-slow { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        .animate-pulse-slow { animation: pulse-slow 3s infinite ease-in-out; }
      `}</style>
    </div>
  );
};

export default Hallucination;