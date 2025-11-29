import React, { useState, useCallback, useEffect, useRef } from 'react';
import { ArrowUp, X, Star, FileText, File } from 'lucide-react'; 
// Importé Lucide Icons (Star, FileText, File) en remplacement de @iconify/react

// --- Configuration ---
// REMPLACER PAR VOTRE CLÉ SI ELLE CHANGE
// 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
const OPENROUTER_KEY = ""; 

// --- Hooks pour le Défilement (Simulé en React) ---
const useAutoScroll = (messages) => {
    const scrollRef = useRef(null);
    useEffect(() => {
        if (scrollRef.current) {
            // Défile vers le bas après chaque mise à jour de messages
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);
    return scrollRef;
};

// --- Sous-composant pour les messages ---
const Message = ({ message }) => {
    const isUser = message.role === 'user';
    
    // Sépare le contenu par les retours à la ligne pour un meilleur affichage
    const content = message.content.split('\n').filter(line => line.trim());

    if (isUser) {
        return (
            <div className="flex justify-end relative pl-0 lg:pl-20">
                <div className="bg-white rounded-3xl rounded-tr-sm p-6 shadow-sm max-w-2xl border border-slate-100 z-20">
                    <p className="text-lg text-slate-700 leading-relaxed">{message.content}</p>
                </div>
            </div>
        );
    }
    
    // AI Message
    return (
        <div className="flex gap-6 items-start pr-0 lg:pr-20">
            <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 mt-1 border border-white shadow-sm ring-1 ring-blue-50">
                {/* L'image de l'AI est la même que l'utilisateur mais en niveaux de gris */}
                <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop" className="w-full h-full object-cover grayscale opacity-80" alt="AI" />
            </div>
            <div className="bg-white/50 rounded-3xl rounded-tl-sm p-6 max-w-3xl border border-white/50">
                <div className="space-y-4 text-md text-slate-600 leading-relaxed">
                    {content.map((line, i) => (
                        <p key={i} className='text-slate-700'>{line}</p>
                    ))}
                </div>
            </div>
        </div>
    );
};

// --- Composant Statique pour l'Exemple ---
const StaticExampleContent = () => (
    <>
        {/* Intro Statique */}
        <div className="flex gap-6 items-start mt-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="w-14 h-14 rounded-full overflow-hidden shrink-0 border-2 border-white shadow-sm ring-1 ring-slate-100">
                <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop" className="w-full h-full object-cover" alt="User" />
            </div>
            <div className="pt-1">
                <p className="text-lg text-slate-500 mb-1">Hi, Julian!</p>
                <h2 className="text-3xl font-medium tracking-tight text-slate-800">Ready to analyze the grid?</h2>
            </div>
        </div>

        {/* User Message Statique */}
        <div className="flex justify-end relative pl-0 lg:pl-20">
            {/* Decorative Floating Docs (Remplacé les icônes Iconify par Lucide ou SVG) */}
            <div className="absolute left-0 top-0 hidden xl:block">
                <div className="absolute top-0 right-0 transform -rotate-6 translate-x-2 bg-white/80 backdrop-blur border border-white p-3 rounded-xl shadow-lg w-32 transition-transform hover:-rotate-12 duration-300">
                    <div className="flex items-center gap-2 mb-2">
                        {/* Remplacement de Iconify */}
                        <FileText className="text-blue-500 w-5 h-5" /> 
                    </div>
                    <div className="space-y-1">
                        <div className="h-1.5 bg-slate-200 rounded w-full"></div>
                        <div className="h-1.5 bg-slate-200 rounded w-3/4"></div>
                        <div className="h-1.5 bg-slate-200 rounded w-5/6"></div>
                    </div>
                </div>
                <div className="absolute top-4 right-8 transform rotate-3 bg-white/90 backdrop-blur border border-white p-3 rounded-xl shadow-xl w-32 z-10 transition-transform hover:rotate-6 duration-300">
                    <div className="flex items-center gap-2 mb-2">
                        {/* Remplacement de Iconify - Utilisation de l'icône File de Lucide */}
                        <File className="text-red-500 w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                        <div className="h-1.5 bg-slate-200 rounded w-full"></div>
                        <div className="h-1.5 bg-slate-200 rounded w-1/2"></div>
                    </div>
                </div>
            </div>
            
            <div className="bg-white rounded-3xl rounded-tr-sm p-8 shadow-sm max-w-2xl border border-slate-100 z-20">
                <p className="text-xl text-slate-700 leading-relaxed">
                    Act as the <span className="font-semibold text-slate-900">Lead Engineer</span> and evaluate the <span className="font-semibold text-slate-900">energy output projections</span> based on these technical specifications.
                </p>
            </div>
        </div>

        {/* AI Response Statique */}
        <div className="flex gap-6 items-start pr-0 lg:pr-20">
            <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 mt-1 border border-white shadow-sm ring-1 ring-blue-50">
                <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop" className="w-full h-full object-cover grayscale opacity-80" alt="AI" />
            </div>
            <div className="bg-white/50 rounded-3xl rounded-tl-sm p-8 max-w-3xl border border-white/50">
                <div className="space-y-6 text-lg text-slate-600 leading-relaxed">
                    {[
                        { label: "Optimal Placement:", text: "Based on the irradiance data, the Southern Sector offers a 15% higher yield potential compared to the initial eastern proposal due to reduced shading." },
                        { label: "Output Forecast:", text: "The projected annual production is estimated at 4.2 GWh, exceeding the baseline requirement by 8%." }
                    ].map((item, i) => (
                        <div key={i} className="flex gap-3">
                            <span className="font-semibold text-slate-900">{i + 1}.</span>
                            <p><span className="font-semibold text-slate-900">{item.label}</span> {item.text.replace(item.label, '')}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </>
);


const ChatArea = () => {
    const [messages, setMessages] = useState([
        { role: 'ai', content: "Hello Julian ! I'm your AI. Ready to start a new project? Ask me anything you want ." },
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useAutoScroll(messages); 

const sendMessage = useCallback(async (userMessage) => {
    if (!userMessage.trim() || isLoading || !OPENROUTER_KEY) return;

    setIsLoading(true);
    setInput('');
    
    const newUserMessage = { role: 'user', content: userMessage };
    
    let historyForAPI = [];
    
    setMessages(prev => {
        const newHistory = [...prev, newUserMessage];
        
        historyForAPI = newHistory.map(msg => ({
            role: msg.role === 'ai' ? 'assistant' : 'user',
            content: msg.content
        }));
        
        return newHistory;
    });

    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENROUTER_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                "model": "x-ai/grok-4.1-fast:free", 
                "messages": [
                    { role: "system", content: "You are a professional Grid Analysis AI speaking fluent French. Provide simple and accurate answers." },
                    ...historyForAPI
                ]
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Erreur API: ${errorData.message || response.statusText}`);
        }

        const data = await response.json();
        const aiResponseText = data.choices?.[0]?.message?.content || "Désolé, je n'ai pas reçu de réponse valide de l'IA.";
        
        setMessages(finalPrev => [
            ...finalPrev, 
            { role: 'ai', content: aiResponseText }
        ]);

    } catch (error) {
        console.error("Erreur lors de l'envoi du message à OpenRouter:", error);
        setMessages(finalPrev => [
            ...finalPrev, 
            { role: 'ai', content: `[Erreur] Impossible de communiquer avec le modèle : ${error.message}.` }
        ]);
    } finally {
        setIsLoading(false);
    }

}, [isLoading, OPENROUTER_KEY]);

    const handleSubmit = (e) => {
        e.preventDefault();
        sendMessage(input);
    };

    // 🛑 CONDITION D'AFFICHAGE 🛑
    // Affiche le contenu statique si le nombre de messages est égal à 1 (seulement le message d'accueil de l'AI)
    const conversationStarted = messages.length > 1;

    return (
        <main className="flex-1 bg-[#F9F8FA] rounded-[2.5rem] flex flex-col relative overflow-hidden shadow-sm border border-white/50 ml-6">
            {/* Header */}
            <header className="flex items-center justify-between px-8 py-6 shrink-0 z-10 bg-gradient-to-b from-[#F9F8FA] to-transparent">
                <button className="p-2 hover:bg-black/5 rounded-full transition-colors">
                    {/* Remplacement de l'icône solar:stars-minimalistic-bold-duotone par Star de Lucide */}
                    <Star className="text-2xl text-slate-800 w-6 h-6" /> 
                </button>
                <h1 className="text-2xl font-medium tracking-tight text-slate-800">Grid Analysis Chat</h1>
                <button className="p-2 hover:bg-black/5 rounded-full transition-colors">
                    <X className="w-6 h-6 text-slate-400 stroke-[1.5]" />
                </button>
            </header>

            {/* Chat Content */}
            <div 
                ref={scrollRef} 
                className="flex-1 overflow-y-auto custom-scrollbar px-8 lg:px-16 py-4 flex flex-col gap-10 pb-48"
            >
                
                {/* 1. Affichage du Contenu Statique AVANT la conversation */}
                {!conversationStarted && <StaticExampleContent />}
                
                {/* 2. Affichage du Contenu Dynamique PENDANT la conversation */}
                {messages.map((msg, index) => (
                    <Message key={index} message={msg} />
                ))}
                
                {/* Indicateur de chargement */}
                {isLoading && (
                    <div className="flex gap-6 items-start pr-0 lg:pr-20">
                        <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 mt-1 border border-white shadow-sm ring-1 ring-blue-50">
                            <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop" className="w-full h-full object-cover grayscale opacity-80 animate-pulse" alt="AI loading" />
                        </div>
                        <div className="bg-white/50 rounded-3xl rounded-tl-sm p-6 max-w-3xl border border-white/50">
                            <span className="text-sm text-slate-600 animate-pulse">L'AI analyse...</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Floating Bottom Interface */}
            <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-[#F9F8FA] via-[#F9F8FA]/95 to-transparent z-30">
                <form onSubmit={handleSubmit} className="relative max-w-4xl mx-auto">
                    <input 
                        type="text" 
                        placeholder={isLoading ? "Attendez la réponse de l'AI..." : "Posez une question sur le projet..."} 
                        className="w-full h-16 bg-white rounded-full pl-8 pr-16 text-lg text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 shadow-xl shadow-purple-500/5 border border-transparent focus:border-blue-100 transition-all disabled:opacity-75" 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        disabled={isLoading}
                    />
                    <button 
                        type="submit"
                        className="absolute right-2 top-2 h-12 w-12 bg-[#F3F2F5] hover:bg-slate-200 rounded-full flex items-center justify-center transition-colors group disabled:opacity-50"
                        disabled={isLoading || !input.trim()}
                    >
                        <ArrowUp className="w-5 h-5 text-slate-600 stroke-[2] group-hover:-translate-y-0.5 transition-transform" />
                    </button>
                </form>
            </div>
        </main>
    );
};

export default ChatArea;