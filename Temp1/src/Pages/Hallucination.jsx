import React, { useState } from "react";

// Icons
const Icons = {
  Brain: (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/><path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/><path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"/><path d="M17.599 6.5a3 3 0 0 0 .399-1.375"/><path d="M6.003 5.125A3 3 0 0 0 6.401 6.5"/><path d="M3.477 10.896a4 4 0 0 1 .585-.396"/><path d="M19.938 10.5a4 4 0 0 1 .585.396"/><path d="M6 18a4 4 0 0 1-1.97-3.465"/><path d="M20 14.535A4 4 0 0 1 18 18"/></svg>
  ),
  Sparkles: (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M9 9h4"/></svg>
  ),
  ShieldAlert: (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>
  ),
  ShieldCheck: (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></svg>
  ),
  Search: (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
  ),
  Copy: (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
  ),
  Activity: (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
  ),
  ChevronRight: (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
  ),
  Check: (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
  ),
  Terminal: (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 17 10 11 4 5"/><line x1="12" x2="20" y1="19" y2="19"/></svg>
  ),
  Plus: (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
  ),
  Paperclip: (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
  ),
  Mic: (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
  ),
  ArrowUp: (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>
  )
};

// Status badge
const StatusBadge = ({ step, currentStep, label }) => {
  const isActive = currentStep === step;
  const isDone = currentStep > step;
  return (
    <div className={`flex items-center gap-2 transition-opacity duration-300 ${currentStep >= step ? "opacity-100" : "opacity-30"}`}>
      <div className={`w-2 h-2 rounded-full ${isActive ? "bg-indigo-500 animate-pulse" : isDone ? "bg-emerald-500" : "bg-zinc-700"}`}></div>
      <span className="text-xs font-mono tracking-wider uppercase">{label}</span>
    </div>
  );
};

// Main Component
export default function Hallucination() {
  const [userInput, setUserInput] = useState("");
  const [loadingStep, setLoadingStep] = useState(0);
  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState("synthesis");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);
  const [isFocused, setIsFocused] = useState(false);

  const API = {
    base: "http://localhost:8000",
    endpoint: "/api/v1/detect-hallucination"
  };

  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  const fetchAnalysis = async (prompt) => {
    try {
      setError(null);
      setLoadingStep(1);
      await wait(600);
      setLoadingStep(2);

      const res = await fetch(API.base + API.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt })
      });

      setLoadingStep(3);
      await wait(400);

      if (!res.ok) throw new Error("Server error " + res.status);
      return await res.json();
    } catch (err) {
      setError(err.message);
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userInput.trim()) return;
    setCopied(false);
    setResult(null);
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
    <div className="text-zinc-400 min-h-screen bg-[#030304] selection:bg-indigo-500/20 selection:text-indigo-200">
      <div className="flex flex-col items-center min-h-screen pt-20 pb-12 px-4 sm:px-6 relative overflow-hidden">

        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="relative z-10 text-center space-y-4 mb-12 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/50 border border-zinc-800 text-[10px] font-mono text-zinc-400 uppercase tracking-widest backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Neural System v2.1
          </div>

          <h1 className="text-4xl md:text-5xl font-medium tracking-tight text-white">
            Assurance <span className="text-indigo-400 font-serif italic">Fiabilité</span>
          </h1>

          <p className="text-sm md:text-base text-zinc-500 max-w-lg mx-auto leading-relaxed">
            Vérification factuelle de modèles de langage via RAG et analyse différentielle sémantique.
          </p>
        </div>

        <div className="w-full max-w-3xl relative z-10 animate-slide-up">

          <div>
            <div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Modern Input Container */}
                <div className="relative">
                  <div className={`relative rounded-3xl bg-[#1a1a1c] border-2 transition-all duration-300 ${
                    isFocused ? 'border-[#e4d050a5] shadow-lg shadow-[#b0de7e44]' : 'border-zinc-800'
                  }`}>
                    
                    {/* Input Field */}
                    <input
                      type="text"
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      onFocus={() => setIsFocused(true)}
                      onBlur={() => setIsFocused(false)}
                      disabled={loadingStep > 0}
                      placeholder="Saisissez une affirmation à vérifier..."
                      className="w-full bg-transparent text-zinc-200 text-base px-5 py-4 pr-[140px] rounded-3xl focus:outline-none placeholder-zinc-600 font-light"
                    />

                    {/* Action Buttons Row */}
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">

                      {/* Divider */}
                      <div className="h-6 w-px bg-zinc-800 mx-1"></div>

                      {/* Submit Button */}
                      <button
                        type="submit"
                        disabled={loadingStep > 0 || !userInput.trim()}
                        className={`p-2.5 rounded-xl transition-all duration-200 ${
                          loadingStep > 0 || !userInput.trim()
                            ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                            : 'bg-gradient-to-br from-indigo-600 to-indigo-500 text-white hover:from-indigo-500 hover:to-indigo-400 hover:scale-105 active:scale-95 shadow-lg shadow-indigo-500/30'
                        }`}
                        title="Analyser"
                      >
                        {loadingStep > 0 ? (
                          <span className="w-4 h-4 border-2 border-zinc-500 border-t-zinc-800 rounded-full animate-spin inline-block"></span>
                        ) : (
                          <Icons.ArrowUp className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Character Counter */}
                  {userInput.length > 0 && (
                    <div className="absolute -bottom-6 right-4 text-[10px] text-zinc-600 font-mono">
                      {userInput.length} caractères
                    </div>
                  )}
                </div>

                {/* Loading Status */}
                {loadingStep > 0 && (
                  <div className="flex items-center justify-center gap-4 py-4">
                    <StatusBadge step={1} currentStep={loadingStep} label="Scanning" />
                    <div className="w-8 h-[1px] bg-zinc-800"></div>
                    <StatusBadge step={2} currentStep={loadingStep} label="RAG Verify" />
                    <div className="w-8 h-[1px] bg-zinc-800"></div>
                    <StatusBadge step={3} currentStep={loadingStep} label="Synthesis" />
                  </div>
                )}
              </form>

              {error && (
                <div className="mt-6 p-3 rounded bg-red-500/5 border border-red-500/20 flex items-start gap-3">
                  <Icons.ShieldAlert className="w-5 h-5 text-red-400" />
                  <div className="space-y-1">
                    <p className="text-sm text-red-200 font-medium">Erreur de connexion Backend</p>
                    <p className="text-xs text-red-300/60 font-mono">{error}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {result && (
            <div className="mt-8 animate-slide-up space-y-6">

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Detection Status Card */}
                <div className={`col-span-1 md:col-span-2 p-6 rounded-xl border-2 flex items-center gap-4 transition-all ${
                    result.ai_analysis.confidence_score >= 0.8 
                    ? "bg-emerald-500/5 border-emerald-500/30 shadow-emerald-500/10 shadow-lg" 
                    : result.ai_analysis.confidence_score > 0
                    ? "bg-amber-500/5 border-amber-500/30 shadow-amber-500/10 shadow-lg"
                    : "bg-red-500/5 border-red-500/30 shadow-red-500/10 shadow-lg"
                }`}>
                    <div className={`p-3 rounded-xl ${
                    result.ai_analysis.confidence_score >= 0.8 
                        ? "bg-emerald-500/10 text-emerald-400" 
                        : result.ai_analysis.confidence_score > 0
                        ? "bg-amber-500/10 text-amber-400"
                        : "bg-red-500/10 text-red-400"
                    }`}>
                    {result.ai_analysis.confidence_score >= 0.8 ? (
                        <Icons.ShieldCheck className="w-7 h-7" />
                    ) : result.ai_analysis.confidence_score > 0 ? (
                        <Icons.ShieldAlert className="w-7 h-7" />
                    ) : (
                        <Icons.ShieldAlert className="w-7 h-7" />
                    )}
                    </div>
                    <div className="flex-1">
                    <h3 className={`text-base font-semibold tracking-wide mb-2 ${
                        result.ai_analysis.confidence_score >= 0.8 
                        ? "text-emerald-100" 
                        : result.ai_analysis.confidence_score > 0
                        ? "text-amber-100"
                        : "text-red-100"
                    }`}>
                        {result.ai_analysis.confidence_score >= 0.8 
                        ? "CONTENU VÉRIFIÉ" 
                        : result.ai_analysis.confidence_score > 0
                        ? "VÉRIFICATION PARTIELLE"
                        : "HALLUCINATION DÉTECTÉE"}
                    </h3>
                    <div className={`inline-block px-3 py-1.5 rounded-lg text-xs leading-relaxed ${
                        result.ai_analysis.confidence_score >= 0.8 
                        ? "bg-emerald-950/50 text-emerald-200/90 border border-emerald-800/30" 
                        : result.ai_analysis.confidence_score > 0
                        ? "bg-amber-950/50 text-amber-200/90 border border-amber-800/30"
                        : "bg-red-950/50 text-red-200/90 border border-red-800/30"
                    }`}>
                        {result.ai_analysis.confidence_score >= 0.8 
                        ? "L'analyse confirme la cohérence factuelle avec la base de connaissance" 
                        : result.ai_analysis.confidence_score > 0
                        ? "Des divergences mineures ont été identifiées et corrigées"
                        : "L'affirmation est entièrement incorrecte selon les sources disponibles"}
                    </div>
                    </div>
                </div>

                {/* Confidence Score Card */}
                <div className="col-span-1 p-6 rounded-xl border-2 border-zinc-800/50 bg-zinc-900/30 flex flex-col justify-center backdrop-blur-sm">
                    <div className="flex justify-between items-end mb-2">
                    <span className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Confiance</span>
                    <span className="text-3xl font-mono font-bold text-white tabular-nums">
                        {(result.ai_analysis.confidence_score * 100).toFixed(0)}%
                    </span>
                    </div>
                    <div className="w-full bg-zinc-800/50 h-2 rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all duration-1000 ease-out ${
                        result.ai_analysis.confidence_score >= 0.8 
                            ? "bg-gradient-to-r from-emerald-500 to-emerald-400" 
                            : result.ai_analysis.confidence_score > 0
                            ? "bg-gradient-to-r from-amber-500 to-amber-400"
                            : "bg-gradient-to-r from-red-500 to-red-400"
                        }`}
                        style={{ width: `${Math.max(result.ai_analysis.confidence_score * 100, 5)}%` }}
                    ></div>
                    </div>
                </div>
                </div>

                {/* Tabs Container */}
                <div className="glass-panel rounded-xl overflow-hidden shadow-lg border border-white/5 bg-black/40 backdrop-blur-xl">
                <div className="flex border-b border-white/5 bg-white/5">
                    {[
                    { id: "synthesis", label: "Synthèse & Correction" },
                    { id: "diff", label: "Différentiel" }
                    ].map((t) => (
                    <button
                        key={t.id}
                        onClick={() => setActiveTab(t.id)}
                        className={`flex-1 py-3 text-xs font-medium tracking-wide transition-colors relative ${activeTab === t.id ? "text-white bg-white/5" : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.02]"}`}
                    >
                        {t.label}
                        {activeTab === t.id && <div className="absolute bottom-0 left-0 w-full h-[1px] bg-indigo-500 shadow-[0_-1px_6px_rgba(99,102,241,0.5)]"></div>}
                    </button>
                    ))}
                </div>

                <div className="p-6 md:p-8 min-h-[300px] bg-[#0c0c0e]">
                    {activeTab === "synthesis" ? (
                    <div className="space-y-8 animate-fade-in">
                        <div>
                        <div className="flex justify-between items-start mb-4">
                            <h4 className="text-xs font-mono text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                            <Icons.Activity className="w-3 h-3" /> Résultat Corrigé
                            </h4>
                            <button
                            onClick={handleCopy}
                            className="text-xs text-zinc-500 hover:text-white flex items-center gap-1.5 transition-colors"
                            >
                            {copied ? <Icons.Check className="w-3 h-3 text-emerald-400" /> : <Icons.Copy className="w-3 h-3" />}
                            {copied ? "Copié" : "Copier"}
                            </button>
                        </div>

                        <div className="text-lg md:text-xl font-light leading-relaxed text-zinc-200">
                            {result.ai_analysis.corrected_text}
                        </div>
                        </div>

                        <div className="border-t border-white/5 pt-6">
                        <h4 className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Icons.Search className="w-3 h-3" /> Sources Consultées
                        </h4>

                        <div className="grid grid-cols-1 gap-3">
                            {result.ai_analysis.rag_sources.map((s, i) => (
                            <div key={i} className="group p-4 rounded-lg bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 transition-all">
                                <div className="flex justify-between items-start mb-2">
                                <span className="text-sm font-medium text-zinc-300 group-hover:text-indigo-300 transition-colors">
                                    Source #{i + 1}
                                </span>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded border uppercase tracking-wider ${s.validity === "correct" ? "border-emerald-500/20 text-emerald-400 bg-emerald-500/5" : "border-red-500/20 text-red-400 bg-red-500/5"}`}>
                                    {s.validity}
                                </span>
                                </div>
                                <p className="text-xs text-zinc-500 font-mono leading-relaxed line-clamp-2">"{s.snippet}"</p>
                            </div>
                            ))}
                        </div>
                        </div>
                    </div>
                    ) : (
                    <div className="animate-fade-in grid md:grid-cols-2 gap-8 h-full">
                        <div className="space-y-3">
                        <span className="text-[10px] uppercase font-bold text-red-400 tracking-wider bg-red-500/10 px-2 py-1 rounded w-fit">Original</span>
                        <div className="p-4 rounded-lg bg-red-950/10 border border-red-500/10 text-red-200/50 font-mono text-sm leading-relaxed line-through decoration-red-500/40">
                            {result.original_prompt}
                        </div>
                        </div>

                        <div className="space-y-3">
                        <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider bg-emerald-500/10 px-2 py-1 rounded w-fit">Correction Sémantique</span>
                        <div className="p-4 rounded-lg bg-emerald-950/10 border border-emerald-500/10 text-zinc-300 font-mono text-sm leading-relaxed">
                            {result.ai_analysis.correction_segments && result.ai_analysis.correction_segments.map((seg, idx) => (
                            <span
                                key={idx}
                                className={`${seg.type === "correct" ? "text-emerald-300 bg-emerald-500/10 px-1 rounded mx-0.5" : seg.type === "incorrect" ? "text-red-400/50 bg-red-500/5 px-1 rounded mx-0.5 line-through decoration-red-500/30" : ""}`}
                            >
                                {seg.text}
                            </span>
                            ))}
                        </div>
                        </div>
                    </div>
                    )}
                </div>
                </div>
            </div>
            )}
        </div>
      </div>
    </div>
  );
}