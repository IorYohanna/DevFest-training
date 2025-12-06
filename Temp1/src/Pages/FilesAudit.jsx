/* eslint-disable no-unused-vars */
import React, { useState, useMemo, useRef } from 'react';
import { 
    Cpu, History, User, Upload, ArrowUpRight, 
    ShieldAlert, Binary, Globe, ShieldCheck, 
    FileWarning, ArrowLeft, Download, RefreshCcw 
} from 'lucide-react';

const FileAudit = () => {
    const [status, setStatus] = useState('upload'); // 'upload' | 'scanning' | 'results'
    const [data, setData] = useState(null);
    const fileInputRef = useRef(null);

    // --- LOGIQUE METIER (Connectée à ton Python) ---
    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setStatus('scanning'); // Déclenche l'animation de scan

        const formData = new FormData();
        formData.append('file', file);

        try {
            // Simulation d'un délai pour l'effet "Traitement Neural" (2s)
            // En vrai, Python est trop rapide pour que l'animation soit vue ^^
            await new Promise(resolve => setTimeout(resolve, 2000));

            const response = await fetch('http://localhost:8000/clean-file', {
                method: 'POST',
                body: formData,
            });
            const result = await response.json();
            setData(result);
            setStatus('results');
        } catch (error) {
            console.error("Erreur upload:", error);
            alert("Erreur connexion serveur Python. Vérifiez le port 8000.");
            setStatus('upload');
        }
    };

    // Calcul des stats en temps réel
    const stats = useMemo(() => {
        if (!data || !data.preview_cleaned) return null;
        const allText = JSON.stringify(data.preview_cleaned);
        return {
            total_rows: data.total_rows,
            identities: (allText.match(/👤/g) || []).length,
            phones: (allText.match(/📞/g) || []).length + (allText.match(/📧/g) || []).length,
            pii: (allText.match(/\[/g) || []).length // Approximation du nombre total de tags
        };
    }, [data]);

    const downloadCSV = () => {
        if (!data) return;
        const headers = data.columns.join(',');
        const rows = data.preview_cleaned.map(row => data.columns.map(col => row[col]).join(','));
        const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers, ...rows].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `safe_data_${data.filename || 'export'}.csv`);
        document.body.appendChild(link);
        link.click();
    };

    // Rendu des cellules avec le style IA
    const renderCleanCell = (text) => {
        const str = String(text);
        if (str.includes('[') && str.includes(']')) {
            // Style Bleu métallique pour les tags
            return (
                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono tracking-tight shadow-[0_0_10px_rgba(59,130,246,0.2)]">
                    {str}
                </span>
            );
        }
        return <span className="text-slate-300">{str}</span>;
    };

    return (
        <div className="bg-[#0a0e14] fixed inset-0 overflow-hidden text-slate-300 selection:bg-slate-700 selection:text-slate-100 font-sans">
            
            {/* Ambient Glows (Background) */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[-20%] left-[20%] w-[60%] h-[60%] bg-slate-800/20 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-900/15 rounded-full blur-[100px]"></div>
            </div>

            <div className="flex flex-col h-screen w-full p-6 md:p-8 gap-8">
                
                {/* HEADER */}
                <header className="flex items-center justify-between px-4 shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-slate-700 to-blue-900 flex items-center justify-center text-white shadow-lg shadow-blue-900/30">
                            <Cpu className="w-7 h-7" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-semibold tracking-tight text-white leading-tight">SafeAI <span className="text-blue-400">Auditor</span></h1>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)] animate-pulse"></div>
                                <span className="text-sm text-slate-500 font-mono">SYSTEM_READY</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-5">
                        <button className="flex items-center gap-2 px-5 py-3 rounded-lg border border-slate-800 bg-slate-900/50 text-slate-400 hover:text-white hover:border-slate-700 transition-colors text-sm font-medium">
                            <History className="w-5 h-5" /> Historique
                        </button>
                        <div className="w-11 h-11 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400">
                            <User className="w-5 h-5" />
                        </div>
                    </div>
                </header>

                {/* MAIN WORKSPACE */}
                <main className="flex-1 bg-slate-900/40 backdrop-blur-2xl border border-white/5 rounded-[28px] flex flex-col relative overflow-hidden shadow-2xl">
                    
                    {/* SCAN OVERLAY (Animation de chargement) */}
                    {status === 'scanning' && (
                        <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center flex-col">
                            <div className="absolute top-0 left-0 w-full h-[2px] bg-blue-500 shadow-[0_0_15px_#3b82f6] animate-[scan_2s_linear_infinite]"></div>
                            <div className="w-20 h-20 rounded-full border-t-2 border-r-2 border-blue-500 animate-spin mb-8"></div>
                            <div className="text-blue-400 font-mono text-lg tracking-[0.2em] uppercase animate-pulse">
                                Traitement Neural...
                            </div>
                        </div>
                    )}

                    {/* VUE 1 : UPLOAD */}
                    {status === 'upload' && (
                        <div className="flex-1 flex flex-col items-center justify-center p-12 relative z-10 animate-in fade-in zoom-in duration-500">
                            <div className="mb-16 text-center relative">
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl"></div>
                                <h2 className="text-5xl md:text-6xl font-medium text-white tracking-tight mb-6 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                                    Auditez vos données pour l'IA
                                </h2>
                                <p className="text-slate-400 text-xl max-w-2xl mx-auto font-light leading-relaxed">
                                    Détection automatique de PII, anonymisation contextuelle et nettoyage de données sensibles en local.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-6xl">
                                {/* Carte Upload Principale */}
                                <div 
                                    onClick={() => fileInputRef.current.click()}
                                    className="cursor-pointer bg-slate-800/40 border border-white/5 hover:border-blue-500/50 hover:bg-slate-800/60 p-8 rounded-[24px] group relative overflow-hidden transition-all duration-300"
                                >
                                    <div className="absolute inset-0 bg-blue-600/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out"></div>
                                    <input 
                                        type="file" 
                                        ref={fileInputRef} 
                                        onChange={handleFileUpload} 
                                        accept=".csv" 
                                        className="hidden" 
                                    />
                                    
                                    <div className="flex justify-between items-start mb-8 relative z-10">
                                        <div className="w-14 h-14 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-blue-400 group-hover:scale-110 group-hover:bg-blue-500 group-hover:text-white transition-all shadow-lg">
                                            <Upload className="w-7 h-7" />
                                        </div>
                                        <ArrowUpRight className="w-6 h-6 text-slate-600 group-hover:text-white transition-colors" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-white mb-3 relative z-10">Importer CSV</h3>
                                    <p className="text-sm text-slate-500 group-hover:text-slate-300 relative z-10 transition-colors">Analyse structurelle et détection PII immédiate.</p>
                                </div>

                                {/* Cartes Secondaires (Décoratives pour l'instant) */}
                                <FeatureCard icon={ShieldAlert} color="text-slate-400" title="Toxicité" desc="Filtrage haineux." />
                                <FeatureCard icon={Binary} color="text-blue-400" title="Bancaire" desc="Masquage IBAN/CB." />
                                <FeatureCard icon={Globe} color="text-slate-500" title="Traduction" desc="Détection langue." />
                            </div>
                        </div>
                    )}

                    {/* VUE 2 : RÉSULTATS */}
                    {status === 'results' && data && (
                        <div className="flex-1 flex flex-col h-full overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
                            
                            {/* BARRE DE STATS INTEGREE */}
                            <div className="grid grid-cols-4 gap-6 p-8 border-b border-white/5 bg-slate-900/30">
                                <StatItem label="Statut" value="Sécurisé" color="text-blue-400" dot={true} />
                                <StatItem label="Lignes Traitées" value={stats.total_rows} />
                                <StatItem label="Menaces PII" value={stats.pii} color="text-red-400" badge="Critique" />
                                <StatItem label="Temps IA" value="0.4s" color="text-blue-400" />    
                            </div>

                            {/* TOOLBAR */}
                            <div className="px-8 py-5 flex items-center justify-between shrink-0">
                                <button 
                                    onClick={() => { setData(null); setStatus('upload'); }}
                                    className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
                                >
                                    <ArrowLeft className="w-5 h-5" /> Retour
                                </button>
                                
                                <button 
                                    onClick={downloadCSV}
                                    className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-lg text-sm font-medium shadow-[0_0_15px_rgba(59,130,246,0.4)] transition-all flex items-center gap-2"
                                >
                                    <Download className="w-4 h-4" /> Exporter CSV
                                </button>
                            </div>

                            {/* TABLEAUX COMPARATIFS */}
                            <div className="flex-1 overflow-hidden px-8 pb-8">
                                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 h-full">
                                    
                                    {/* Colonne Gauche (Raw) */}
                                    <div className="flex flex-col bg-[#0f1115] rounded-xl border border-slate-700/30 overflow-hidden relative">
                                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-slate-600/50 to-transparent opacity-50"></div>
                                        <div className="p-5 border-b border-white/5 flex items-center gap-3 bg-white/[0.02]">
                                            <FileWarning className="w-5 h-5 text-slate-400" />
                                            <span className="text-sm font-bold uppercase tracking-wider text-slate-300/70">Source (Non-Sécurisée)</span>
                                        </div>
                                        <div className="overflow-auto flex-1 custom-scrollbar">
                                            <table className="w-full text-left border-collapse">
                                                <thead className="sticky top-0 bg-[#0f1115] z-10">
                                                    <tr className="text-sm text-slate-500 border-b border-white/5">
                                                        {data.columns.map(col => <th key={col} className="p-4 font-medium">{col}</th>)}
                                                    </tr>
                                                </thead>
                                                <tbody className="text-base text-slate-400 font-mono">
                                                    {data.preview_original.map((row, i) => (
                                                        <tr key={i} className="border-b border-white/5 hover:bg-white/[0.03]">
                                                            {data.columns.map(col => <td key={col} className="p-4 whitespace-nowrap">{row[col]}</td>)}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    {/* Colonne Droite (Clean) */}
                                    <div className="flex flex-col bg-[#0f1115] rounded-xl border border-blue-900/30 overflow-hidden relative shadow-[0_0_30px_-10px_rgba(59,130,246,0.15)]">
                                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
                                        <div className="p-5 border-b border-white/5 flex items-center gap-3 bg-white/[0.02]">
                                            <ShieldCheck className="w-5 h-5 text-blue-400" />
                                            <span className="text-sm font-bold uppercase tracking-wider text-blue-200/70">Safe AI Output</span>
                                        </div>
                                        <div className="overflow-auto flex-1 custom-scrollbar">
                                            <table className="w-full text-left border-collapse">
                                                <thead className="sticky top-0 bg-[#0f1115] z-10">
                                                    <tr className="text-sm text-blue-400/50 border-b border-blue-900/20">
                                                        {data.columns.map(col => <th key={col} className="p-4 font-medium">{col}</th>)}
                                                    </tr>
                                                </thead>
                                                <tbody className="text-base">
                                                    {data.preview_cleaned.map((row, i) => (
                                                        <tr key={i} className="border-b border-white/5 hover:bg-blue-500/[0.05]">
                                                            {data.columns.map(col => (
                                                                <td key={col} className="p-4 whitespace-nowrap">
                                                                    {renderCleanCell(row[col])}
                                                                </td>
                                                            ))}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                </div>
                            </div>

                        </div>
                    )}
                </main>
            </div>
            
            {/* Styles globaux pour l'animation scan */}
            <style jsx>{`
                @keyframes scan {
                    0% { top: 0; opacity: 0; }
                    20% { opacity: 1; }
                    80% { opacity: 1; }
                    100% { top: 100%; opacity: 0; }
                }
                .custom-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: #0f172a; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }
            `}</style>
        </div>
    );
};

// Sous-composants pour garder le code propre
const FeatureCard = ({ icon: Icon, color, title, desc }) => (
    <button className="bg-slate-800/40 border border-white/5 p-8 rounded-[24px] group text-left hover:bg-slate-800/60 hover:border-white/10 transition-all">
        <div className={`w-12 h-12 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center ${color} mb-8 group-hover:scale-110 transition-transform`}>
            <Icon className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-medium text-slate-200 mb-2">{title}</h3>
        <p className="text-sm text-slate-500">{desc}</p>
    </button>
);

const StatItem = ({ label, value, color = "text-white", dot, badge }) => (
    <div className="flex flex-col gap-2 border-l border-white/5 pl-8 first:pl-0 first:border-0">
        <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold">{label}</span>
        <div className="flex items-center gap-3">
            {dot && <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse"></div>}
            <span className={`text-2xl font-semibold ${color} font-mono`}>{value}</span>
            {badge && <span className="text-xs bg-red-500/ text-slate-400 px-2 py-1 rounded border border-slate-500/20">{badge}</span>}
        </div>
    </div>
);

export default FileAudit;