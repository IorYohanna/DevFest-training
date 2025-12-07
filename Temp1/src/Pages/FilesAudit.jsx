import React, { useState, useRef, useMemo } from 'react';
import {
    LayoutDashboard, FileSpreadsheet, History, Settings,
    Shield, ChevronRight, Bell, FileText, Upload,
    Zap, CheckCircle2, Download, X, Search,
    Files, ShieldCheck, Cpu,
    // Icônes pour les options de configuration
    Fingerprint, Key, MessageSquareX, FileCode,
    ArrowUpRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

const FilesAudit = () => {
    // États de l'application
    const [status, setStatus] = useState('idle');
    const [inputType, setInputType] = useState('text');
    const [textInput, setTextInput] = useState('');
    const [fileName, setFileName] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [data, setData] = useState(null);

    // État pour la configuration (Active/Inactive)
    const [config, setConfig] = useState({
        pii: true,
        secrets: true,
        profanity: false,
        format: false
    });

    const fileInputRef = useRef(null);

    // Toggle des options de configuration
    const toggleConfig = (key) => {
        setConfig(prev => ({ ...prev, [key]: !prev[key] }));
    };

    // ===== GESTION SÉLECTION FICHIER =====
    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (!file) return;
        setFileName(file.name);
        setSelectedFile(file);
        setInputType('file');
    };

    // ===== LOGIC: TEXT PROCESSING =====
    const processText = async () => {
        if (textInput.trim() === '') return;
        setStatus('scanning');
        try {
            await new Promise(resolve => setTimeout(resolve, 2000));
            const response = await fetch('http://localhost:8000/clean-text', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: textInput }),
            });
            if (!response.ok) throw new Error('Erreur serveur');
            const result = await response.json();
            setData({
                columns: ['Ligne', 'Contenu'], // Traduit
                preview_original: [{ Ligne: 1, Contenu: textInput }],
                preview_cleaned: [{ Ligne: 1, Contenu: result.cleaned }],
                total_rows: 1,
                filename: 'analyse_texte'
            });
            setStatus('results');
        } catch (error) {
            console.error("Erreur traitement texte:", error);
            alert("Erreur connexion serveur Python. Vérifiez le port 8000.");
            setStatus('idle');
        }
    };

    // ===== LOGIC: FILE UPLOAD =====
    const processFile = async () => {
        if (!selectedFile) return;
        setStatus('scanning');
        const formData = new FormData();
        formData.append('file', selectedFile);
        try {
            await new Promise(resolve => setTimeout(resolve, 2500));
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
            setStatus('idle');
        }
    };

    // ===== ROUTER DU BOUTON "LANCER L'AUDIT" =====
    const runAudit = () => {
        if (inputType === 'text') processText();
        else processFile();
    };

    // ===== STATS =====
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
        link.setAttribute("download", `donnees_securisees_${data.filename || 'export'}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
    };

    // ===== RENDER CLEAN CELL =====
    const renderCleanCell = (text, isHidden = false) => {
        if (isHidden) {
            return <span className="blur-[3px] select-none text-slate-700">Masqué</span>;
        }
        const str = String(text);
        if (str.includes('[') && str.includes(']')) {
            return (
                <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-bold bg-blue-500/15 text-blue-300 border border-blue-500/30 font-mono tracking-tight shadow-[0_0_12px_rgba(59,130,246,0.25)]">
                    {str}
                </span>
            );
        }
        return <span className="text-slate-300">{str}</span>;
    };

    // ===== RESET =====
    const resetApp = () => {
        setStatus('idle');
        setTextInput('');
        setFileName('');
        setSelectedFile(null);
        setData(null);
    };

    return (
        <div className="flex w-full h-screen bg-[#09090b] text-slate-200 font-sans overflow-hidden selection:bg-blue-500/40 selection:text-white">

            <style>{`
                .custom-scroll::-webkit-scrollbar { width: 8px; height: 8px; }
                .custom-scroll::-webkit-scrollbar-track { background: transparent; }
                .custom-scroll::-webkit-scrollbar-thumb { background: #3f3f46; border-radius: 10px; border: 2px solid #09090b; }
                .custom-scroll::-webkit-scrollbar-thumb:hover { background: #52525b; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fade-in { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
            `}</style>

            <aside className="w-[280px] border-r border-white/5 flex flex-col justify-between py-6 bg-[#0c0c0e] shrink-0">
                <div className="flex flex-col gap-8 px-4">
                    <div className="flex items-center gap-4 px-2 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center shrink-0 shadow-[0_0_15px_-3px_rgba(37,99,235,0.3)]">
                            <Shield className="text-blue-500 w-5 h-5" strokeWidth={2.5} />
                        </div>
                        <div>
                            <h1 className="text-base font-bold text-white tracking-tight font-transformers">SafeAI</h1>
                            <p className="text-xs text-slate-500 font-medium">Auditeur v2.4</p>
                        </div>
                    </div>

                    <nav className="flex flex-col gap-1">
                        <SidebarItem active={status === 'idle'} icon={LayoutDashboard} label="Nouvel Audit" onClick={resetApp} />
                        <SidebarItem active={status === 'results'} icon={FileSpreadsheet} label="Rapport Actif" />
                        <SidebarItem icon={History} label="Historique" />
                        <SidebarItem icon={Settings} label="Configuration" />
                    </nav>

                    <div className="px-2 pt-6 border-t border-white/5">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 pl-2">Espaces de travail</p>
                        <div className="flex items-center gap-3 text-sm text-slate-300 px-3 py-2.5 hover:bg-white/5 rounded-lg cursor-pointer transition-colors">
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"></div>
                            <span>Logs Production</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-slate-300 px-3 py-2.5 hover:bg-white/5 rounded-lg cursor-pointer transition-colors">
                            <div className="w-2.5 h-2.5 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.4)]"></div>
                            <span>Dossiers Juridiques</span>
                        </div>
                    </div>
                </div>


                {/* CONTENEUR DEMO + UTILISATEUR */}
                <div className="px-5 flex flex-col items-center gap-3 mb-5">
                    <Link to="/messenger" className="flex items-center justify-center gap-2 px-8 py-2.5 bg-gradient-to-tr from-[#feda75] via-[#fa7e1e] to-[#d62976] text-white font-semibold rounded-xl shadow-lg hover:scale-105 transition-transform duration-300">
                        Démo
                        <ArrowUpRight className="w-4 h-4 transform -rotate-12" />
                    </Link>

                    {/* Carte utilisateur */}
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-colors cursor-pointer group w-full">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shadow-lg">
                            JD
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">John Doe</p>
                            <p className="text-xs text-slate-500 truncate">Forfait Entreprise</p>
                        </div>
                    </div>
                </div>

            </aside>

            <main className="flex-1 flex flex-col relative h-full bg-[#09090b]">

                <div className="flex-1 overflow-y-auto custom-scroll mt-5 relative">

                    {/* --- IDLE STATE: CONFIGURATION PANEL --- */}
                    {status === 'idle' && (
                        <div className="max-w-4xl mx-auto mt-6 animate-fade-in">

                            <div className="mb-10 text-center">
                                <h2 className="text-3xl font-semibold font-vogue text-white tracking-tight mb-3">Nouvel Audit de Sécurité</h2>
                                <p className="text-slate-400 font-circular-web text-base max-w-lg mx-auto">Importez des données ou collez du texte. Notre IA locale détecte les données sensibles (PII) et les secrets en toute sécurité.</p>
                            </div>

                            <div className="bg-[#121214] border border-white/10 rounded-2xl overflow-hidden shadow-2xl shadow-black/50">

                                <div className="flex border-b border-white/5 bg-black/20">
                                    <button
                                        onClick={() => setInputType('text')}
                                        className={`flex-1 font-classyvogue py-4 text-sm font-medium flex items-center justify-center gap-2.5 transition-all ${inputType === 'text' ? 'text-blue-400 bg-blue-500/5 border-b-2 border-blue-500' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border-b-2 border-transparent'}`}
                                    >
                                        <FileText className="w-4 h-4" />
                                        Texte Brut
                                    </button>
                                    <div className="w-[1px] bg-white/5"></div>
                                    <button
                                        onClick={() => setInputType('file')}
                                        className={`flex-1 font-classyvogue py-4 text-sm font-medium flex items-center justify-center gap-2.5 transition-all ${inputType === 'file' ? 'text-blue-400 bg-blue-500/5 border-b-2 border-blue-500' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border-b-2 border-transparent'}`}
                                    >
                                        <Upload className="w-4 h-4" />
                                        Fichier
                                    </button>
                                </div>

                                <div className="p-8">
                                    {inputType === 'text' ? (
                                        <div className="relative group">
                                            <textarea
                                                className="w-full bg-[#0c0c0e] border border-white/10 rounded-xl p-5 text-base text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all resize-none font-mono leading-relaxed shadow-inner"
                                                rows={10}
                                                placeholder="Collez des logs, emails ou JSON ici pour nettoyage..."
                                                value={textInput}
                                                onChange={(e) => setTextInput(e.target.value)}
                                            ></textarea>
                                            <div className="absolute bottom-4 right-4 text-xs font-medium text-slate-600 font-mono bg-[#0c0c0e] px-2 py-1 rounded border border-white/5">
                                                {textInput.length} carac.
                                            </div>
                                        </div>
                                    ) : (
                                        <div
                                            onClick={() => fileInputRef.current.click()}
                                            className="border-2 border-dashed border-white/10 rounded-xl h-72 flex flex-col items-center justify-center bg-[#0c0c0e] hover:bg-blue-500/[0.02] hover:border-blue-500/30 transition-all cursor-pointer group relative overflow-hidden"
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                                            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:border-blue-500/30 transition-all duration-300 shadow-xl">
                                                <FileSpreadsheet className="w-8 h-8 text-slate-400 group-hover:text-blue-400" />
                                            </div>
                                            {fileName ? (
                                                <div className="flex items-center gap-3 px-4 py-2 bg-blue-500/10 rounded-full border border-blue-500/20 z-10">
                                                    <span className="text-sm text-blue-300 font-semibold">{fileName}</span>
                                                    <button onClick={(e) => { e.stopPropagation(); setFileName(''); setSelectedFile(null); }} className="p-1 hover:bg-blue-500/20 rounded-full transition-colors"><X className="w-4 h-4 text-blue-400" /></button>
                                                </div>
                                            ) : (
                                                <div className="text-center z-10">
                                                    <p className="text-base text-slate-200 font-medium mb-1">Cliquez pour importer ou glissez-déposez</p>
                                                    <p className="text-sm text-slate-500">CSV, JSON ou TXT (Max 10MB)</p>
                                                </div>
                                            )}
                                            <input ref={fileInputRef} type="file" className="hidden" accept=".csv,.json,.txt" onChange={handleFileSelect} />
                                        </div>
                                    )}

                                    <div className="mt-8">
                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Paramètres de Détection</p>

                                        {/* CARTES DE CONFIGURATION AVEC ICÔNES */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <ConfigCard
                                                icon={Fingerprint}
                                                label="Masquer PII"
                                                sub="Emails, Tél, Sécu"
                                                active={config.pii}
                                                onClick={() => toggleConfig('pii')}
                                            />
                                            <ConfigCard
                                                icon={Key}
                                                label="Détecter Secrets"
                                                sub="Clés API, Tokens"
                                                active={config.secrets}
                                                onClick={() => toggleConfig('secrets')}
                                            />
                                            <ConfigCard
                                                icon={MessageSquareX}
                                                label="Filtre Toxicité"
                                                sub="Langage offensant"
                                                active={config.profanity}
                                                onClick={() => toggleConfig('profanity')}
                                            />
                                            <ConfigCard
                                                icon={FileCode}
                                                label="Formater Sortie"
                                                sub="Standardiser JSON/CSV"
                                                active={config.format}
                                                onClick={() => toggleConfig('format')}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="p-5 bg-black/20 border-t border-white/5 flex justify-end">
                                    <button
                                        onClick={runAudit}
                                        disabled={!textInput && !fileName}
                                        className={`flex items-center gap-2.5 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${(!textInput && !fileName)
                                            ? 'bg-white/5 text-slate-500 cursor-not-allowed'
                                            : 'bg-blue-600 text-white hover:bg-blue-500 shadow-[0_0_25px_-5px_rgba(37,99,235,0.5)] hover:shadow-[0_0_30px_-5px_rgba(37,99,235,0.6)]'
                                            }`}
                                    >
                                        <Zap className="w-4 h-4 fill-current" />
                                        Lancer l'Audit
                                    </button>
                                </div>
                            </div>

                            <div className="mt-5 flex justify-center gap-8">
                                <BadgeFooter label="Conforme SOC2" />
                                <BadgeFooter label="Traitement Local" />
                                <BadgeFooter label="Chiffrement AES-256" />
                            </div>
                        </div>
                    )}

                    {/* --- LOADING STATE --- */}
                    {status === 'scanning' && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center z-50 bg-[#09090b]/90 backdrop-blur-md">
                            <div className="relative">
                                {/* Cercle extérieur */}
                                <div className="w-28 h-28 rounded-full border border-blue-500/20 animate-[spin_3s_linear_infinite]"></div>
                                {/* Cercle intérieur partiel */}
                                <div className="absolute inset-0 w-28 h-28 rounded-full border-t-2 border-blue-400 animate-[spin_1s_linear_infinite]"></div>
                                {/* Icône CPU */}
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Cpu className="w-10 h-10 text-blue-400 animate-pulse drop-shadow-[0_0_10px_rgba(96,165,250,0.6)]" />
                                </div>
                            </div>
                            <p className="mt-8 text-base font-semibold text-slate-200 tracking-[0.2em] uppercase animate-pulse">Traitement en cours</p>
                        </div>
                    )}

                    {/* --- RESULTS STATE --- */}
                    {/* --- RESULTS STATE --- */}
                    {status === 'results' && data && (
                        <div className="max-w-[1400px] mx-auto animate-fade-in flex flex-col gap-8">

                            <div className="flex items-center justify-between mb-10">
                                <div>
                                    <h2 className="text-3xl font-bold text-white tracking-tight">Rapport d'Audit</h2>
                                    <div className="flex items-center gap-3 mt-2">
                                        <span className="text-sm font-medium text-slate-400">ID: #2024-09-LOGS</span>
                                        <span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span>
                                        <span className="text-sm font-medium text-slate-400">{stats.total_rows} lignes analysées</span>
                                    </div>
                                </div>
                                <div className="flex gap-4 mt-16">
                                    <button onClick={resetApp} className="px-5 py-2.5 rounded-lg border border-white/10 text-sm font-medium text-slate-300 hover:bg-white/5 hover:text-white transition-colors">
                                        Nouveau Scan
                                    </button>
                                    <button
                                        onClick={downloadCSV}
                                        className="px-5 py-2.5 rounded-lg bg-white text-black text-sm font-bold hover:bg-slate-200 transition-colors flex items-center gap-2.5 shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)]"
                                    >
                                        <Download className="w-4 h-4" />
                                        Exporter CSV
                                    </button>
                                </div>
                            </div>
                            {/* Stats Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <ResultCard label="Niveau de Risque" value={stats.pii > 0 ? "Élevé" : "Faible"} sub="Selon résultats" color={stats.pii > 0 ? "text-red-400 drop-shadow-[0_0_10px_rgba(248,113,113,0.3)]" : "text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.3)]"} />
                                <ResultCard label="PII Détectées" value={stats.pii} sub="Champs sensibles" color="text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.3)]" />
                                <ResultCard label="Nettoyage" value="100%" sub="Succès" color="text-emerald-400" />
                                <ResultCard label="Temps Calcul" value="0.4s" sub="Moteur local" color="text-blue-400" />
                            </div>

                            {/* Data Visualization: Empilé verticalement */}
                            <div className="flex flex-col gap-8">

                                {/* Entrée Brute */}
                                <div className="flex flex-col bg-[#121214] border border-white/10 rounded-2xl overflow-hidden shadow-lg">
                                    <div className="h-14 border-b border-white/5 bg-white/[0.02] flex items-center justify-between px-6 shrink-0">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-red-500/80 shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
                                            <span className="text-sm font-semibold text-slate-300">Entrée Brute</span>
                                        </div>
                                    </div>
                                    <div className="flex-1 overflow-auto custom-scroll p-0">
                                        <table className="w-full text-left border-collapse font-mono">
                                            <thead>
                                                <tr className="border-b border-white/5 text-slate-500 bg-black/20 text-xs uppercase tracking-wider">
                                                    {data.columns.map(col => <th key={col} className="py-3 px-6 font-bold sticky top-0 bg-[#121214] z-10">{col}</th>)}
                                                </tr>
                                            </thead>
                                            <tbody className="text-slate-400 text-sm">
                                                {data.preview_original.map((row, i) => (
                                                    <tr key={i} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                                                        {data.columns.map((col, j) => (
                                                            <td key={col} className="py-3 px-6 align-top border-r border-white/[0.03] last:border-0 leading-relaxed">{row[col] || row[j]}</td>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Sortie Nettoyée */}
                                <div className="flex flex-col bg-[#121214] border border-blue-500/30 rounded-2xl overflow-hidden shadow-[0_0_50px_-20px_rgba(59,130,246,0.15)]">
                                    <div className="h-14 border-b border-blue-500/10 bg-blue-500/[0.04] flex items-center justify-between px-6 shrink-0">
                                        <div className="flex items-center gap-3">
                                            <ShieldCheck className="w-5 h-5 text-blue-400" />
                                            <span className="text-sm font-bold text-blue-200">Sortie Nettoyée</span>
                                        </div>
                                    </div>
                                    <div className="flex-1 overflow-auto custom-scroll p-0">
                                        <table className="w-full text-left border-collapse font-mono">
                                            <thead>
                                                <tr className="border-b border-white/5 text-blue-400/70 bg-blue-500/[0.03] text-xs uppercase tracking-wider">
                                                    {data.columns.map(col => <th key={col} className="py-3 px-6 font-bold sticky top-0 bg-[#121214] z-10">{col}</th>)}
                                                </tr>
                                            </thead>
                                            <tbody className="text-slate-300 text-sm">
                                                {data.preview_cleaned.map((row, i) => (
                                                    <tr key={i} className="border-b border-white/[0.03] hover:bg-blue-500/[0.05] transition-colors">
                                                        {data.columns.map((col, j) => (
                                                            <td key={col} className="py-3 px-6 align-top border-r border-white/[0.03] last:border-0 leading-relaxed">
                                                                {renderCleanCell(row[col] || row[j])}
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


                </div>
            </main>
        </div>
    );
};

// ===== SOUS-COMPOSANTS =====

// eslint-disable-next-line no-unused-vars
const SidebarItem = ({ icon: Icon, label, active, onClick }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-lg transition-all duration-200 group ${active ? 'bg-white/[0.08] text-white shadow-inner' : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200'
            }`}
    >
        <Icon className={`w-5 h-5 ${active ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
        <span className="text-sm font-medium">{label}</span>
    </button>
);

const ResultCard = ({ label, value, sub, color }) => (
    <div className="p-6 rounded-2xl bg-[#121214] border border-white/10 hover:border-white/20 transition-all group">
        <p className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-2 group-hover:text-slate-400 transition-colors">{label}</p>
        <div className="flex flex-col">
            <p className={`text-4xl font-bold mb-1 ${color}`}>{value}</p>
            <p className="text-xs text-slate-500 font-medium">{sub}</p>
        </div>
    </div>
);

// NOUVEAU COMPOSANT: CARTE DE CONFIGURATION AVEC ICÔNE
// eslint-disable-next-line no-unused-vars
const ConfigCard = ({ icon: Icon, label, sub, active, onClick }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-4 p-4 rounded-xl border text-left transition-all duration-300 relative overflow-hidden group ${active
            ? 'bg-blue-500/10 border-blue-500/50 shadow-[0_0_20px_-5px_rgba(59,130,246,0.3)]'
            : 'bg-[#0c0c0e] border-white/5 hover:border-white/10 hover:bg-white/[0.02]'
            }`}
    >
        {/* Glow effect on hover when inactive */}
        {!active && <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/0 to-blue-500/0 group-hover:via-blue-500/5 transition-all duration-500"></div>}

        {/* Icon Box */}
        <div className={`p-3 rounded-lg shrink-0 transition-colors duration-300 ${active ? 'bg-blue-500/20 text-blue-400' : 'bg-white/5 text-slate-500 group-hover:text-slate-300'
            }`}>
            <Icon className="w-6 h-6" />
        </div>

        {/* Text Content */}
        <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-0.5">
                <p className={`text-sm font-bold transition-colors ${active ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                    }`}>{label}</p>
                {active && <CheckCircle2 className="w-4 h-4 text-blue-500 animate-fade-in" />}
            </div>
            <p className="text-xs text-slate-600 truncate">{sub}</p>
        </div>
    </button>
);

const BadgeFooter = ({ label }) => (
    <div className="flex items-center gap-2.5 text-slate-500">
        <CheckCircle2 className="w-4 h-4 text-slate-600" />
        <span className="text-xs uppercase tracking-widest font-bold">{label}</span>
    </div>
);

const StatusTag = ({ text }) => (
    <div className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-slate-400 font-mono">
        {text}
    </div>
);

export default FilesAudit;