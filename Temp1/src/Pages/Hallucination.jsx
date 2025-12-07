import React, { useState } from "react";

// --- ICONS ---
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
  ArrowUp: (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>
  ),
  Plus: (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
  ),
  Gallery: (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
  ),
  FileText: (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
  ),
  More: (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
  ),
  Check: (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
  )
};

// --- COMPONENTS ---
// Changement ici : Fond ardoise (slate) au lieu de marron
const GlassCard = ({ children, className = "" }) => (
  <div className={`relative bg-slate-900/40 backdrop-blur-2xl border border-white/5 shadow-2xl overflow-hidden ${className}`}>
    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
    <div className="relative z-10 h-full">
      {children}
    </div>
  </div>
);

const Badge = ({ type }) => {
  const styles = {
    verified: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    warning: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    danger: "bg-red-500/10 text-red-400 border-red-500/20",
  };
  
  let currentStyle = styles.verified;
  let text = "VÉRIFIÉ";
  let Icon = Icons.ShieldCheck;

  if (type >= 0.8) { 
    currentStyle = styles.verified; 
    text = "VÉRIFIÉ"; 
    Icon = Icons.ShieldCheck; 
  } else if (type > 0) { 
    currentStyle = styles.warning; 
    text = "CORRIGÉ"; 
    Icon = Icons.ShieldAlert; 
  } else { 
    currentStyle = styles.danger; 
    text = "HALLUCINATION"; 
    Icon = Icons.ShieldAlert; 
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase border ${currentStyle}`}>
      <Icon className="w-3 h-3" /> {text}
    </span>
  );
};

// --- MAIN APP ---
export default function HallucinationBusterFusion() {
  const [userInput, setUserInput] = useState("");
  const [loadingStep, setLoadingStep] = useState(0);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("synthesis");

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

      // Simulation de l'appel pour l'exemple visuel si pas de backend
      // const res = await fetch(API.base + API.endpoint, ...); 
      // Si vous testez sans backend, décommentez la ligne suivante pour voir le résultat :
      // return { original_prompt: prompt, ai_analysis: { confidence_score: 0.95, corrected_text: "Ceci est un test corrigé.", rag_sources: [{validity:'correct', snippet:'Source fiable'}] } };

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
    // Changement : Fond global Blue/Slate foncé au lieu de marron.
    // Selection color passée de Indigo à Sky
    <div className="min-h-screen bg-[#0f172a] text-zinc-200 p-4 md:p-6 font-sans selection:bg-sky-500/30">
      
      {/* Background Blobs harmonisés (Bleu et Cyan) */}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-sky-900/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-900/20 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Main Grid Layout */}
      <div className="max-w-[1600px] mx-auto h-[calc(100vh-3rem)] grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">

        {/* LEFT COLUMN: Dashboard / History */}
        <div className="lg:col-span-4 flex flex-col gap-6 h-full">
            
          {/* Header Area */}
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2 text-white font-medium text-lg tracking-tight">
              {/* Logo : Dégradé Blanc -> Gris, ombre Sky au lieu de Indigo */}
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-white to-gray-400 flex items-center justify-center shadow-lg shadow-sky-500/20">
                <Icons.Brain className="w-4 h-4 text-black" />
              </div>
              Anti-Hallucination
            </div>
            <button className="p-2 hover:bg-zinc-800 rounded-full transition-colors text-zinc-500">
              <Icons.Plus className="w-5 h-5" />
            </button>
          </div>

          {/* History Area */}
          <div className="flex-1 space-y-6 overflow-y-auto pr-2 custom-scrollbar">
            
            <h3 className="text-xl font-light text-zinc-100 px-1">Historique</h3>

            {/* Widget 1: Big Visual Card */}
            <GlassCard className="rounded-[32px] p-6 group cursor-pointer hover:border-white/10 transition-all bg-slate-800/40">
              <div className="flex justify-between items-start mb-8">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-slate-950/50 rounded-full border border-slate-700/50">
                    <Icons.Activity className="w-4 h-4 text-slate-400" />
                  </div>
                  <span className="text-sm font-medium text-slate-300">Dernier Scan</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-colors">
                  <Icons.ArrowUp className="w-4 h-4 rotate-45" />
                </div>
              </div>
              
              {/* Visual Graphic - Changement de l'ombre portée (Blue au lieu de Purple) */}
              <div className="relative w-full h-48 rounded-2xl bg-gradient-to-br from-white/5 via-slate-900/30 to-slate-900 overflow-hidden mb-4 border border-white/5 flex items-center justify-center">
                <Icons.ShieldCheck className="w-20 h-20 text-sky-400/50 drop-shadow-[0_0_15px_rgba(56,189,248,0.3)]" />
                <div className="absolute bottom-3 right-3 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full text-xs border border-white/10 text-white font-mono">
                  +3 sources
                </div>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm text-zinc-500">Aujourd'hui • 16 Octobre</p>
                <p className="text-zinc-300 font-medium">Vérification Factuelle #402</p>
              </div>
            </GlassCard>

            {/* Widget 2: Yesterday List */}
            <div className="space-y-3">
              <h4 className="text-lg font-light text-zinc-400 px-1 mt-6">Hier</h4>
              
              {[
                { title: "Rapport Financier Q3", sub: "Analyse de cohérence", icon: Icons.FileText },
                { title: "Article Bio-Tech", sub: "Détection biais", icon: Icons.Search }
              ].map((item, i) => (
                <GlassCard key={i} className="rounded-[24px] p-4 flex items-center gap-4 hover:bg-white/5 transition-colors cursor-pointer border-transparent hover:border-white/5">
                  <div className="w-10 h-10 rounded-full bg-slate-800/50 flex items-center justify-center border border-slate-700/50">
                    <item.icon className="w-4 h-4 text-slate-400" />
                  </div>
                  <div className="flex-1">
                    <h5 className="text-sm font-medium text-zinc-200">{item.title}</h5>
                    <p className="text-xs text-zinc-500">{item.sub}</p>
                  </div>
                  <button className="w-8 h-8 rounded-full border border-slate-700 flex items-center justify-center text-zinc-600 hover:text-white hover:border-zinc-600">
                    <Icons.ArrowUp className="w-3 h-3 rotate-45" />
                  </button>
                </GlassCard>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Active Chat / Interaction */}
        <div className="lg:col-span-8 h-full flex flex-col">
            {/* Changement : Fond plus neutre et foncé */}
          <GlassCard className="h-full rounded-[40px] flex flex-col border-white/5 bg-[#1e293b]/50">
            
            {/* Header within Card */}
            <div className="p-8 flex justify-between items-start">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/5">
                  <div className="w-full h-full bg-slate-800 flex items-center justify-center text-xs text-slate-500">AI</div>
                </div>
                <div>
                  <h2 className="text-2xl text-white font-light">Bonjour, <span className="font-semibold">Utilisateur</span></h2>
                  <p className="text-zinc-500 text-sm">Prêt à vérifier la vérité ?</p>
                </div>
              </div>
              <button className="p-2 text-zinc-500 hover:text-white transition-colors">
                <Icons.More className="w-5 h-5" />
              </button>
            </div>

            {/* MAIN CONTENT SCROLLABLE */}
            <div className="flex-1 overflow-y-auto px-8 custom-scrollbar">
              
              {!result && loadingStep === 0 ? (
                /* EMPTY STATE */
                <div className="h-full flex flex-col justify-center items-center pb-20">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl w-full">
                    {/* Carte 1 : Teinte Bleu/Sky */}
                    <div className="p-6 rounded-3xl bg-slate-800/30 border border-white/5 backdrop-blur-sm transform rotate-[-2deg] hover:rotate-0 transition-transform duration-300">
                      <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center mb-4"><Icons.FileText className="w-4 h-4"/></div>
                      <h3 className="font-medium text-zinc-200 mb-2">Analyse de Document</h3>
                      <p className="text-xs text-zinc-500 leading-relaxed">Copiez un paragraphe complexe et laissez le système identifier les incohérences factuelles.</p>
                    </div>
                    {/* Carte 2 : Teinte Emerald (inchangée car sémantique OK) */}
                    <div className="p-6 rounded-3xl bg-slate-800/30 border border-white/5 backdrop-blur-sm transform rotate-[2deg] hover:rotate-0 transition-transform duration-300 mt-8 md:mt-0">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4"><Icons.ShieldCheck className="w-4 h-4"/></div>
                      <h3 className="font-medium text-zinc-200 mb-2">Vérification RAG</h3>
                      <p className="text-xs text-zinc-500 leading-relaxed">Croisement des données avec des sources fiables pour garantir l'exactitude.</p>
                    </div>
                  </div>
                </div>
              ) : (
                /* RESULTS DISPLAY */
                <div className="space-y-8 pb-8 animate-fade-in max-w-3xl mx-auto">
                  
                  {/* User Bubble */}
                  <div className="flex gap-4 items-end flex-row-reverse">
                    <div className="w-8 h-8 rounded-full bg-slate-600 flex-shrink-0" />
                    <div className="bg-slate-700/80 text-zinc-100 px-5 py-3 rounded-2xl rounded-br-none max-w-[80%] text-sm leading-relaxed border border-white/5">
                      {result ? result.original_prompt : userInput}
                    </div>
                  </div>

                  {/* Loader or Result */}
                  {loadingStep > 0 ? (
                    <div className="flex gap-4">
                      {/* Changement : Gradient Blue/Sky */}
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-500 to-blue-600 flex-shrink-0 flex items-center justify-center">
                        <Icons.Sparkles className="w-4 h-4 text-white animate-pulse" />
                      </div>
                      <div className="flex items-center gap-3 text-zinc-400 text-sm pt-2">
                        {/* Point bleu */}
                        <span className="w-2 h-2 rounded-full bg-sky-500 animate-ping"/>
                        {loadingStep === 1 && "Analyse sémantique..."}
                        {loadingStep === 2 && "Vérification base de connaissances..."}
                        {loadingStep === 3 && "Synthèse des résultats..."}
                      </div>
                    </div>
                  ) : result && (
                    <div className="flex gap-4 animate-slide-up">
                      {/* Changement : Gradient Blue/Sky et ombre Sky */}
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-500 to-blue-600 flex-shrink-0 flex items-center justify-center shadow-lg shadow-sky-500/20 h-fit">
                        <Icons.Brain className="w-4 h-4 text-white" />
                      </div>
                      
                      <div className="space-y-4 w-full">
                        {/* Tabs */}
                        <div className="flex gap-2 border-b border-white/5 pb-2">
                          <button
                            onClick={() => setActiveTab("synthesis")}
                            className={`px-4 py-2 text-xs font-medium rounded-lg transition-colors ${
                              activeTab === "synthesis" 
                                ? "bg-white/10 text-white" 
                                : "text-zinc-500 hover:text-zinc-300"
                            }`}
                          >
                            Synthèse
                          </button>
                          <button
                            onClick={() => setActiveTab("diff")}
                            className={`px-4 py-2 text-xs font-medium rounded-lg transition-colors ${
                              activeTab === "diff" 
                                ? "bg-white/10 text-white" 
                                : "text-zinc-500 hover:text-zinc-300"
                            }`}
                          >
                            Différentiel
                          </button>
                        </div>

                        {activeTab === "synthesis" ? (
                          <>
                            {/* Result Card */}
                            <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
                              <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-4">
                                <Badge type={result.ai_analysis.confidence_score} />
                                <span className="text-xs font-mono text-zinc-500">
                                  {(result.ai_analysis.confidence_score * 100).toFixed(0)}% TRUST SCORE
                                </span>
                              </div>
                              
                              <div className="prose prose-invert prose-sm max-w-none">
                                <p className="text-zinc-200 leading-7 text-[15px]">
                                  {result.ai_analysis.corrected_text}
                                </p>
                              </div>

                              <div className="mt-6 flex gap-3">
                                <button onClick={handleCopy} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors text-xs text-zinc-400 border border-white/5">
                                  {copied ? <Icons.Check className="w-3 h-3 text-emerald-400"/> : <Icons.Copy className="w-3 h-3"/>}
                                  {copied ? "Texte copié" : "Copier la correction"}
                                </button>
                              </div>
                            </div>

                            {/* Sources Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {result.ai_analysis.rag_sources.map((source, idx) => (
                                <div key={idx} className="bg-white/[0.03] border border-white/5 rounded-xl p-4 hover:bg-white/[0.05] transition-colors">
                                  <div className="flex items-center gap-2 mb-2">
                                    <div className={`w-1.5 h-1.5 rounded-full ${source.validity === 'correct' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                    <span className="text-[10px] uppercase tracking-wider font-semibold text-zinc-500">Source {idx + 1}</span>
                                  </div>
                                  <p className="text-xs text-zinc-400 italic line-clamp-3">"{source.snippet}"</p>
                                </div>
                              ))}
                            </div>
                          </>
                        ) : (
                          /* Differential View */
                          <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                              <span className="text-[10px] uppercase font-bold text-red-400 tracking-wider bg-red-500/10 px-2 py-1 rounded w-fit">Original</span>
                              <div className="p-4 rounded-lg bg-red-950/10 border border-red-500/10 text-red-200/50 font-mono text-sm leading-relaxed line-through decoration-red-500/40">
                                {result.original_prompt}
                              </div>
                            </div>

                            <div className="space-y-3">
                              <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider bg-emerald-500/10 px-2 py-1 rounded w-fit">Correction</span>
                              <div className="p-4 rounded-lg bg-emerald-950/10 border border-emerald-500/10 text-zinc-300 font-mono text-sm leading-relaxed">
                                {result.ai_analysis.correction_segments ? (
                                  result.ai_analysis.correction_segments.map((seg, idx) => (
                                    <span
                                      key={idx}
                                      className={`${
                                        seg.type === "correct" 
                                          ? "text-emerald-300 bg-emerald-500/10 px-1 rounded mx-0.5" 
                                          : seg.type === "incorrect" 
                                          ? "text-red-400/50 bg-red-500/5 px-1 rounded mx-0.5 line-through decoration-red-500/30" 
                                          : ""
                                      }`}
                                    >
                                      {seg.text}
                                    </span>
                                  ))
                                ) : (
                                  result.ai_analysis.corrected_text
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Error Display */}
                  {error && (
                    <div className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-red-500/20 flex-shrink-0 flex items-center justify-center">
                        <Icons.ShieldAlert className="w-4 h-4 text-red-400" />
                      </div>
                      <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex-1">
                        <p className="text-sm text-red-200 font-medium mb-1">Erreur de connexion Backend</p>
                        <p className="text-xs text-red-300/60 font-mono">{error}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            {/* --- BOTTOM INPUT AREA (Floating Bar) --- */}
                <div className="p-8 pt-4 mt-auto">
                    <form onSubmit={handleSubmit} className="relative group z-20">
                        {/* Glow effect behind input - Changement Indigo/Purple -> Sky/Blue */}
                        <div className={`absolute -inset-0.5 bg-gradient-to-r from-sky-500 to-blue-500 rounded-full blur opacity-20 group-hover:opacity-40 transition duration-1000 group-focus-within:opacity-50 ${loadingStep > 0 ? 'hidden' : ''}`}></div>
                        
                        <div className="relative flex items-center bg-[#0f172a] rounded-full p-2 pr-2 border border-white/10 shadow-2xl">
                             {/* Left Actions (Attachment) */}
                             <button type="button" className="p-3 rounded-full hover:bg-slate-800 text-slate-400 transition-colors ml-1">
                                 <Icons.Plus className="w-5 h-5" />
                             </button>
                             
                             {/* Main Input Field */}
                             <input 
                                type="text"
                                value={userInput}
                                onChange={(e) => setUserInput(e.target.value)}
                                disabled={loadingStep > 0}
                                placeholder="Demandez moi de vérifier une information..." 
                                className="flex-1 bg-transparent text-sm md:text-base text-zinc-200 placeholder-slate-500 focus:outline-none px-4 py-2"
                             />
                             
                             {/* Right Actions & Submit Button */}
                             <div className="flex items-center gap-2 pr-1">
                                 <button type="button" className="p-2 text-slate-500 hover:text-slate-300 transition-colors hidden sm:block">
                                     <Icons.Gallery className="w-5 h-5" />
                                 </button>
                                 <button 
                                    type="submit"
                                    disabled={!userInput.trim() || loadingStep > 0}
                                    className={`p-3 rounded-full transition-all duration-300 ${
                                      userInput.trim() && loadingStep === 0 
                                      ? "bg-zinc-200 text-black hover:scale-105" 
                                      : "bg-slate-800 text-slate-600 cursor-not-allowed"
                                    }`}
                                 >
                                     <Icons.ArrowUp className="w-5 h-5" />
                                 </button>
                             </div>
                        </div>
                        
                        {/* Footer Disclaimer */}
                        <div className="text-center mt-3">
                             <p className="text-[10px] text-slate-600">L'IA peut faire des erreurs. Vérifiez toujours les informations importantes.</p>
                        </div>
                    </form>
                </div>

          </GlassCard>
        </div>
        {/* End Right Column */}

      </div>
    </div>
  );
}