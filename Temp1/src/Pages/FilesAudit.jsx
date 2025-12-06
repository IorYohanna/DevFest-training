import React, { useState, useRef, useMemo } from 'react';
import { 
    Cpu, History, User, Upload, ArrowUpRight, 
    ShieldAlert, Binary, Globe, ShieldCheck, 
    FileWarning, ArrowLeft, Download, FileSpreadsheet,
    MessageSquare, Clipboard, Trash2, Wand2, Shield, Zap
} from 'lucide-react';

const FilesAudit = () => {
    const [mode, setMode] = useState('file'); // 'file' | 'text'
    const [status, setStatus] = useState('upload'); // 'upload' | 'scanning' | 'results'
    const [textInput, setTextInput] = useState('');
    const [data, setData] = useState(null);
    
    const fileInputRef = useRef(null);

    // ===== FILE UPLOAD LOGIC =====
    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setStatus('scanning');

        const formData = new FormData();
        formData.append('file', file);

        try {
            await new Promise(resolve => setTimeout(resolve, 2000)); // Simulation délai visuel

            const response = await fetch('http://localhost:8000/clean-file', {
                method: 'POST',
                body: formData,
            });
            
            if (!response.ok) throw new Error('Erreur serveur');
            
            const result = await response.json();
            setData(result);
            setStatus('results');
        } catch (error) {
            console.error("Erreur upload:", error);
            alert("Erreur connexion serveur Python. Vérifiez le port 8000.");
            setStatus('upload');
        }
    };

    // ===== TEXT PROCESSING LOGIC =====
// ===== TEXT PROCESSING LOGIC =====
    const processText = async () => {
        if (textInput.trim() === '') return;

        setStatus('scanning');

        try {
            await new Promise(resolve => setTimeout(resolve, 1500)); 

            const response = await fetch('http://localhost:8000/clean-text', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text: textInput }),
            });

            if (!response.ok) throw new Error('Erreur serveur');

            const result = await response.json();
            
            // CORRECTION ICI :
            // 1. On utilise result.cleaned (ce que le back envoie)
            // 2. On crée des Objets {Key: Value} au lieu de tableaux simples [1, val]
            //    pour que l'affichage du tableau en bas fonctionne pareil que pour les CSV.
            
            setData({
                columns: ['Line', 'Content'],
                preview_original: [{ Line: 1, Content: textInput }],
                preview_cleaned: [{ Line: 1, Content: result.cleaned }], 
                total_rows: 1,
                filename: 'text_analysis'
            });
            
            setStatus('results');
        } catch (error) {
            console.error("Erreur traitement texte:", error);
            alert("Erreur connexion serveur Python. Vérifiez le port 8000.");
            setStatus('upload');
        }
    };

    // ===== STATS CALCULATION =====
    const stats = useMemo(() => {
        if (!data || !data.preview_cleaned) return { total_rows: 0, pii: 0 };
        
        const allText = JSON.stringify(data.preview_cleaned);
        return {
            total_rows: data.total_rows || 0,
            pii: (allText.match(/\[/g) || []).length
        };
    }, [data]);

    // ===== CSV DOWNLOAD =====
    const downloadCSV = () => {
        if (!data) return;
        const headers = data.columns.join(',');
        const rows = data.preview_cleaned.map(row => 
            data.columns.map(col => row[col] || row[data.columns.indexOf(col)]).join(',')
        );
        const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers, ...rows].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `safe_data_${data.filename || 'export'}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
    };

    // ===== RENDER CLEAN CELL =====
    const renderCleanCell = (text, isHidden = false) => {
        if (isHidden) {
            return <span className="blur-[3px] select-none text-slate-700">Hidden</span>;
        }

        const str = String(text);
        if (str.includes('[') && str.includes(']')) {
            return (
                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono tracking-tight shadow-[0_0_10px_rgba(59,130,246,0.2)]">
                    {str}
                </span>
            );
        }
        return <span className="text-slate-300">{str}</span>;
    };

    // ===== RESET =====
    const resetApp = () => {
        setStatus('upload');
        setTextInput('');
        setData(null);
    };

    return (
        <div className="bg-[#0a0e14] fixed inset-0 overflow-hidden text-slate-300 selection:bg-slate-700 selection:text-slate-100 font-sans">
            
            {/* Ambient Glows */}
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
                            <h1 className="text-2xl font-semibold tracking-tight text-white leading-tight">
                                SafeAI <span className="text-blue-400">Auditor</span>
                            </h1>
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
                    
                    {/* SCAN OVERLAY */}
                    {status === 'scanning' && (
                        <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center flex-col">
                            <div className="absolute top-0 left-0 w-full h-[2px] bg-blue-500 shadow-[0_0_15px_#3b82f6] animate-[scan_2s_linear_infinite]"></div>
                            <div className="w-20 h-20 rounded-full border-t-2 border-r-2 border-blue-500 animate-spin mb-8"></div>
                            <div className="text-blue-400 font-mono text-lg tracking-[0.2em] uppercase animate-pulse">
                                Traitement Neural...
                            </div>
                        </div>
                    )}

                    {/* VIEW 1: UPLOAD */}
                    {status === 'upload' && (
                        <div className="flex-1 flex flex-col items-center justify-center p-12 relative z-10 animate-in fade-in duration-500">
                            
                            <div className="mb-12 text-center relative">
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl"></div>
                                <h2 className="text-5xl md:text-6xl font-medium text-white tracking-tight mb-6 drop-shadow-[0_0_20px_rgba(59,130,246,0.5)]">
                                    Auditez vos données avec l'IA
                                </h2>
                                <p className="text-slate-400 text-xl max-w-2xl mx-auto font-light leading-relaxed">
                                    Détection automatique de PII, anonymisation contextuelle et nettoyage de données sensibles.
                                </p>
                            </div>

                            {/* Mode Switcher */}
                            <div className="relative bg-slate-900/50 p-1 rounded-xl border border-white/5 flex mb-10 w-64 shadow-inner">
                                <div 
                                    className="absolute top-1 h-[calc(100%-8px)] w-[calc(50%-4px)] bg-blue-600 rounded-lg shadow-lg transition-all duration-300 ease-out"
                                    style={{ left: mode === 'file' ? '4px' : '50%' }}
                                ></div>
                                <button 
                                    onClick={() => setMode('file')}
                                    className={`relative z-10 flex-1 py-2 text-xs font-medium text-center transition-colors duration-300 flex items-center justify-center gap-2 ${mode === 'file' ? 'text-white' : 'text-slate-400'}`}
                                >
                                    <FileSpreadsheet className="w-3.5 h-3.5" /> Fichier
                                </button>
                                <button 
                                    onClick={() => setMode('text')}
                                    className={`relative z-10 flex-1 py-2 text-xs font-medium text-center transition-colors duration-300 flex items-center justify-center gap-2 ${mode === 'text' ? 'text-white' : 'text-slate-400'}`}
                                >
                                    <MessageSquare className="w-3.5 h-3.5" /> Texte
                                </button>
                            </div>

                            {/* MODE: FILE UPLOAD */}
                            {mode === 'file' && (
                                <div className="w-full max-w-6xl animate-in fade-in duration-300">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                        
                                        <label className="cursor-pointer bg-slate-800/40 border border-white/5 hover:border-blue-500/50 hover:bg-slate-800/60 p-8 rounded-[24px] group relative overflow-hidden transition-all duration-300">
                                            <div className="absolute inset-0 bg-blue-600/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out"></div>
                                            <input 
                                                type="file" 
                                                ref={fileInputRef} 
                                                onChange={handleFileUpload} 
                                                accept=".csv" 
                                                className="hidden" 
                                            />
                                            
                                            <div className="flex justify-between items-start mb-8 relative z-10">
                                                <div className="w-14 h-14 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-blue-400 group-hover:scale-110 group-hover:bg-blue-500 group-hover:text-white transition-all">
                                                    <Upload className="w-7 h-7" />
                                                </div>
                                                <ArrowUpRight className="w-6 h-6 text-slate-600 group-hover:text-white transition-colors" />
                                            </div>
                                            
                                            <div className="relative z-10">
                                                <h3 className="text-xl font-semibold text-white mb-3">Importer CSV</h3>
                                                <p className="text-sm text-slate-500 group-hover:text-slate-300 transition-colors">Analyse structurelle et détection PII immédiate.</p>
                                            </div>
                                        </label>

                                        <FeatureCard icon={ShieldAlert} color="text-slate-400" title="Toxicité" desc="Filtrage haineux." />
                                        <FeatureCard icon={Binary} color="text-blue-400" title="Bancaire" desc="Masquage IBAN/CB." />
                                        <FeatureCard icon={Globe} color="text-slate-500" title="Traduction" desc="Détection langue." />
                                    </div>
                                </div>
                            )}

                            {/* MODE: TEXT INPUT */}
                            {mode === 'text' && (
                                <div className="w-full max-w-3xl animate-in fade-in duration-300">
                                    <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-4 flex flex-col gap-4">
                                        <div className="flex items-center justify-between border-b border-white/5 pb-3">
                                            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Prompt Analysis</span>
                                            <div className="flex items-center gap-2">
                                                <button 
                                                    onClick={() => navigator.clipboard.readText().then(text => setTextInput(text))}
                                                    className="p-1.5 hover:bg-white/5 rounded-md text-slate-500 hover:text-white transition-colors" 
                                                    title="Coller"
                                                >
                                                    <Clipboard className="w-4 h-4" />
                                                </button>
                                                <button 
                                                    onClick={() => setTextInput('')} 
                                                    className="p-1.5 hover:bg-white/5 rounded-md text-slate-500 hover:text-white transition-colors" 
                                                    title="Effacer"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                        
                                        <textarea 
                                            value={textInput}
                                            onChange={(e) => setTextInput(e.target.value)}
                                            className="w-full bg-transparent border-none text-slate-300 placeholder:text-slate-600 focus:ring-0 resize-none min-h-[200px] text-sm leading-relaxed font-mono outline-none" 
                                            placeholder="Collez votre texte sensible ici (emails, téléphones, logs, conversations)..."
                                        />
                                        
                                        <div className="flex items-center justify-between pt-2">
                                            <span className="text-xs text-slate-600 font-mono">{textInput.length} chars</span>
                                            <button 
                                                onClick={processText}
                                                className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-lg text-xs font-semibold shadow-[0_0_15px_rgba(59,130,246,0.4)] transition-all flex items-center gap-2 group"
                                            >
                                                <Wand2 className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform" />
                                                Auditer le Texte
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-6 flex justify-center gap-6 text-slate-500">
                                        <div className="flex items-center gap-2 text-xs">
                                            <Shield className="w-3.5 h-3.5" /> Local Processing
                                        </div>
                                        <div className="flex items-center gap-2 text-xs">
                                            <Zap className="w-3.5 h-3.5" /> Real-time Scrubbing
                                        </div>
                                    </div>
                                </div>
                            )}

                        </div>
                    )}

                    {/* VIEW 2: RESULTS */}
                    {status === 'results' && data && (
                        <div className="flex-1 flex flex-col h-full overflow-hidden animate-in fade-in duration-700">
                            
                            {/* Stats Bar */}
                            <div className="grid grid-cols-4 gap-6 p-8 border-b border-white/5 bg-slate-900/30">
                                <StatItem label="Statut" value="Sécurisé" color="text-blue-400" dot />
                                <StatItem label="Lignes Traitées" value={stats.total_rows} />
                                <StatItem label="Menaces PII" value={stats.pii} color="text-red-400" badge="Critique" />
                                <StatItem label="Temps IA" value="0.4s" color="text-blue-400" />
                            </div>

                            {/* Toolbar */}
                            <div className="px-8 py-5 flex items-center justify-between shrink-0">
                                <button 
                                    onClick={resetApp}
                                    className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
                                >
                                    <ArrowLeft className="w-5 h-5" /> Nouvelle Analyse
                                </button>
                                
                                <button 
                                    onClick={downloadCSV}
                                    className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-lg text-sm font-medium shadow-[0_0_15px_rgba(59,130,246,0.4)] transition-all flex items-center gap-2"
                                >
                                    <Download className="w-4 h-4" /> Exporter
                                </button>
                            </div>

                            {/* Tables */}
                            <div className="flex-1 overflow-hidden px-8 pb-8 flex flex-col gap-8">
                                
                                {/* Raw Table */}
                                <div className="flex flex-col bg-[#0f1115] rounded-xl border border-slate-700/30 overflow-hidden relative">
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-slate-600/50 to-transparent opacity-50"></div>
                                    <div className="p-5 border-b border-white/5 flex items-center gap-3 bg-white/[0.02]">
                                        <FileWarning className="w-5 h-5 text-slate-400" />
                                        <span className="text-sm font-bold uppercase tracking-wider text-slate-300/70">Source (Non-Sécurisée)</span>
                                    </div>
                                    <div className="overflow-auto flex-1 custom-scrollbar max-h-64">
                                        <table className="w-full text-left border-collapse">
                                            <thead className="sticky top-0 bg-[#0f1115] z-10">
                                                <tr className="text-sm text-slate-500 border-b border-white/5">
                                                    {data.columns.map(col => <th key={col} className="p-4 font-medium">{col}</th>)}
                                                </tr>
                                            </thead>
                                            <tbody className="text-base text-slate-400 font-mono">
                                                {data.preview_original.map((row, i) => (
                                                    <tr key={i} className="border-b border-white/5 hover:bg-white/[0.03]">
                                                        {data.columns.map((col, j) => (
                                                            <td key={col} className="p-4 whitespace-pre-wrap max-w-2xl">
                                                                {row[col] !== undefined ? row[col] : row[j]}
                                                            </td>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Clean Table */}
                                <div className="flex flex-col bg-[#0f1115] rounded-xl border border-blue-900/30 overflow-hidden relative shadow-[0_0_30px_-10px_rgba(59,130,246,0.15)]">
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
                                    <div className="p-5 border-b border-white/5 flex items-center gap-3 bg-white/[0.02]">
                                        <ShieldCheck className="w-5 h-5 text-blue-400" />
                                        <span className="text-sm font-bold uppercase tracking-wider text-blue-200/70">Safe AI Output</span>
                                    </div>
                                    <div className="overflow-auto flex-1 custom-scrollbar max-h-64">
                                        <table className="w-full text-left border-collapse">
                                            <thead className="sticky top-0 bg-[#0f1115] z-10">
                                                <tr className="text-sm text-blue-400/50 border-b border-blue-900/20">
                                                    {data.columns.map(col => <th key={col} className="p-4 font-medium">{col}</th>)}
                                                </tr>
                                            </thead>
                                            <tbody className="text-base">
                                                {data.preview_cleaned.map((row, i) => (
                                                    <tr key={i} className="border-b border-white/5 hover:bg-blue-500/[0.05]">
                                                        {data.columns.map((col, j) => (
                                                            <td key={col} className="p-4 whitespace-pre-wrap max-w-2xl">
                                                                {renderCleanCell(row[col] !== undefined ? row[col] : row[j])}
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
                    )}

                </main>
            </div>
            
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

// Components
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
            {badge && <span className="text-xs bg-red-500/10 text-red-400 px-2 py-1 rounded border border-red-500/20">{badge}</span>}
        </div>
    </div>
);

export default FilesAudit;