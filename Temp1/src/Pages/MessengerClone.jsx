import React, { useState, useCallback } from "react";
import { Phone, Video, Info, Smile, Image, Heart, ChevronDown, SquarePen, Shield, Copy, Send, ArrowLeft } from "lucide-react"; // Importation de ArrowLeft
import { Link } from "react-router-dom";

// --- Le reste des données statiques (initialMessages, users, notes, sanitizeText) est inchangé ---
// ... (code non modifié pour les données statiques et sanitizeText)

const initialMessages = [
    {
        type: "incoming",
        username: "sarah_w",
        avatar: "https://i.pravatar.cc/150?u=sarah",
        content: "Bonjour ! 😊",
        time: "9:40 AM",
    },
    {
        type: "outgoing",
        username: "you",
        avatar: "https://i.pravatar.cc/150?u=johndoe",
        content: "Salut ! 👋",
        time: "9:40 AM",
    },
    {
        type: "incoming",
        username: "sarah_w",
        avatar: "https://i.pravatar.cc/150?u=sarah",
        content: `Salut ! Trop content d'avoir gagné le concours 🎉
Voici mes infos pour la livraison :
Je suis Sarah Connor.
J'habite au 15 Rue de la République, 69002 Lyon.
Mon numéro pour le livreur est le 06 12 34 56 78.
Merci encore pour ce giveaway de folie !`,
        time: "9:41 AM",
    },
];

const users = [
    { id: 1, name: "Sarah Wilson", username: "Landry", avatar: "/img/profile/profile-1.jpeg", active: true },
    { id: 2, name: "David Creative", username: "Andrews Richard", avatar: "/img/profile/profile-2.jpeg", active: false, unread: true },
    { id: 3, name: "Emma Design", username: "Honty Herizo", avatar: "/img/profile/profile-3.jpeg", active: false },
    { id: 4, name: "Lucas Films", username: "Ra-Ranja", avatar: "/img/profile/profile-4.jpeg", active: false },
    { id: 5, name: "Team Vercel", username: "Sarah_w", avatar: "https://i.pravatar.cc/150?u=sarah", active: true },
];

const notes = [
    { id: 1, username: "Your note", avatar: "/img/outsiders/Yohanna.jpg", label: "Note..." },
    { id: 2, username: "The Goat", avatar: "https://i.pravatar.cc/150?u=alice", label: "DevFest?" },
    { id: 3, username: "Alice Watson", avatar: "https://i.pravatar.cc/150?u=mark", label: "" },
];


const sanitizeText = (text) => {
    if (!text) return "";

    let sanitized = text;

    sanitized = sanitized.replace(/Sarah Connor/g, "[PERSON]");
    sanitized = sanitized.replace(/Thomas Anderson/g, "[PERSON]");
    sanitized = sanitized.replace(/(\b[A-Z][a-z]+)\s+([A-Z][a-z]+\b)/g, "[PERSON]");

    sanitized = sanitized.replace(/(\d+\s+Rue|Avenue|Boulevard|Place).*?(\d{5})\s+([A-Z][a-z]+)/g, "[ADDRESS], [POSTAL_CODE] [CITY]");

    sanitized = sanitized.replace(/(\d{2}\s\d{2}\s\d{2}\s\d{2}\s\d{2})|(\d{10})/g, "[PHONE_NUMBER]");

    // eslint-disable-next-line no-useless-escape
    sanitized = sanitized.replace(/[\w\.-]+@[\w\.-]+\.\w+/g, "[EMAIL]");

    return sanitized;
};


// --- Composants de l'Application ---

const Sidebar = () => {
    // Utilisation de couleurs gris foncé typiques d'Instagram/Meta
    return (
        <aside className="w-full md:w-[400px] flex flex-col bg-[#1c1c1c] text-white h-full z-10">
            {/* Sidebar Header */}
            <div className="h-20 flex items-center justify-between px-6 pt-2 sticky top-0 bg-[#1c1c1c] z-20 border-b border-[#2e2e2e]">
                <div className="flex items-center gap-2 cursor-pointer group">
                    <span className="text-xl font-semibold tracking-tight group-hover:text-gray-400 transition-colors">
                        johndoe_ui
                    </span>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                </div>
                <button className="p-2 hover:bg-[#2e2e2e] rounded-full transition-colors">
                    <SquarePen className="w-6 h-6" />
                </button>
            </div>

            {/* Horizontal Notes Scroll (Stories-like) */}
            <div className="px-6 pb-6 pt-2 overflow-x-auto flex gap-5 border-b border-[#2e2e2e] hide-scrollbar">
                {notes.map((note) => (
                    <div key={note.id} className="flex flex-col items-center gap-2 min-w-[72px] cursor-pointer">
                        <div className="relative">
                            {/* Dégradé Instagram simulé pour le contour */}
                            <div className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-yellow-400 via-red-500 to-fuchsia-600">
                                <img src={note.avatar} alt={note.username} className="w-full h-full rounded-full object-cover border-2 border-[#1c1c1c]" />
                            </div>
                            {note.label && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#2e2e2e] rounded-2xl py-1.5 px-3 text-[11px] font-medium whitespace-nowrap text-gray-300">
                                    {note.label}
                                </div>
                            )}
                        </div>
                        <span className="text-xs font-normal">{note.username}</span>
                    </div>
                ))}
            </div>

            {/* Messages Header */}
            <div className="flex items-center justify-between px-6 py-4">
                <span className="font-semibold text-base tracking-tight">Messages</span>
                <span className="text-sm text-blue-400 font-medium cursor-pointer hover:text-white">Requests</span>
            </div>

            {/* Conversation List */}
            <div className="flex-1 overflow-y-auto px-3 space-y-1">
                {users.map((user) => (
                    <div
                        key={user.id}
                        className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${user.active ? "bg-[#2e2e2e]" : "hover:bg-[#2e2e2e]/50"
                            }`}
                    >
                        <div className="relative">
                            <img
                                src={user.avatar}
                                alt={user.username}
                                className="w-14 h-14 rounded-full border border-gray-600 object-cover"
                            />
                            {user.active && <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-[#1c1c1c]" />}
                            {user.unread && <div className="w-2 h-2 bg-blue-500 rounded-full absolute top-2 right-2"></div>}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-baseline mb-0.5">
                                <h3 className={`text-sm ${user.unread ? "font-medium" : "font-normal"} truncate`}>{user.username}</h3>
                            </div>
                            <div className="flex items-center gap-1 text-sm text-gray-400 truncate">
                                {user.active ? "Active now" : "Seen recently"}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            
            {/* NOUVEAU : Bouton de retour en bas à gauche */}
            <div className="p-4 border-t border-[#2e2e2e] bg-[#1c1c1c]">
                <Link to="/audit" 
                    className="flex items-center gap-2 p-2 text-sm font-medium rounded-full text-gray-400 hover:text-white hover:bg-[#2e2e2e] transition-colors"
                    title="Retour"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span>Retour</span>
                </Link>
            </div>
        </aside>
    );
};


const ChatArea = () => {
    const defaultReply = `Bonjour Sarah ! 🎉

Merci beaucoup pour tes informations, nous les avons bien reçues.

Ton lot sera préparé et expédié très bientôt à l’adresse que tu as fournie.

Encore félicitations pour ta victoire et profite bien de ton cadeau ! ✨`;

    const [isAuditorActive, setIsAuditorActive] = useState(false);
    const [messages, setMessages] = useState(initialMessages); 
    const [rawText, setRawText] = useState(initialMessages[2].content); 
    const [sanitizedText, setSanitizedText] = useState("");
    const [isCopying, setIsCopying] = useState(false);
    const [replyMessage, setReplyMessage] = useState(defaultReply); // Nouvel état pour la réponse éditable
    const [canSendReply, setCanSendReply] = useState(false); // Contrôle l'affichage de la zone de réponse

    
    // Fonction de nettoyage exécutée au clic
    const handleSanitize = useCallback(() => {
        const result = sanitizeText(rawText);
        setSanitizedText(result);
        setCanSendReply(true); // Autorise l'affichage de la zone de réponse après l'audit
    }, [rawText]);

    // Fonction de copie
    const handleCopy = () => {
        if (sanitizedText) {
            navigator.clipboard.writeText(sanitizedText);
            setIsCopying(true);
            setTimeout(() => setIsCopying(false), 1500);
        }
    };

    // Fonction d'envoi du message de réponse manuellement
    const handleManualSend = () => {
        if (replyMessage.trim() !== "") {
            const newReply = {
                type: "outgoing",
                username: "you",
                avatar: "https://i.pravatar.cc/150?u=johndoe",
                content: replyMessage,
                time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
            };

            setMessages((prevMessages) => [...prevMessages, newReply]);
            // Réinitialiser les états
            setCanSendReply(false);
            setSanitizedText("");
            setReplyMessage(defaultReply);
            setIsAuditorActive(false); // Retour au mode chat classique
        }
    };

    // Composant de l'Auditeur SafeAI
    const SafeAIAuditor = () => (
        <div className="flex flex-col gap-4 p-4 bg-[#2e2e2e] rounded-xl border border-blue-500/50 shadow-2xl">
            <h3 className="text-xl font-bold text-blue-400 flex items-center gap-2">
                <Shield className="w-6 h-6 text-green-400" /> SafeAI Auditor
            </h3>
            
            {/* Section Entrée/Sortie */}
            <div className="grid grid-cols-2 gap-4">
                {/* Texte Brut (Input) */}
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-300">1. Entrée Brute (Risqué)</label>
                    <textarea
                        placeholder="Collez le message sensible ici..."
                        className="flex-1 min-h-[160px] bg-[#1c1c1c] border border-gray-600 p-3 rounded-lg outline-none text-[14px] resize-none focus:border-red-500/80 transition-colors"
                        value={rawText}
                        onChange={(e) => setRawText(e.target.value)}
                    />
                </div>

                {/* Texte Nettoyé (Output) */}
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-300">2. Sortie Nettoyée (Sécurisée)</label>
                    <textarea
                        placeholder="Cliquez sur 'Lancer l'Audit'..."
                        readOnly
                        className="flex-1 min-h-[160px] bg-[#1c1c1c] border p-3 rounded-lg outline-none text-[14px] resize-none whitespace-pre-wrap"
                        value={sanitizedText}
                        style={{ borderColor: sanitizedText ? 'rgb(34, 197, 94)' : 'rgb(75, 85, 99)' , color: sanitizedText ? 'rgb(187, 247, 208)' : 'rgb(156, 163, 175)' }}
                    />
                </div>
            </div>
            
            {/* Boutons d'Action Audit */}
            <div className="flex justify-between items-center mt-2 border-t border-gray-700 pt-3">
                 <button 
                    onClick={handleSanitize}
                    className="px-5 py-2 text-base font-semibold rounded-full bg-blue-500 hover:bg-blue-600 transition-colors shadow-lg disabled:opacity-50"
                    disabled={!rawText}
                >
                    🚀 Lancer l'Audit
                </button>
                
                <button 
                    onClick={handleCopy}
                    className="px-3 py-2 text-base font-semibold rounded-full bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 transition-colors shadow-lg flex items-center gap-2 disabled:opacity-50"
                    disabled={!sanitizedText}
                >
                    <Copy className="w-4 h-4"/>
                    {isCopying ? 'Copié ! ✅' : 'Copier données sécurisées'}
                </button>
            </div>
            
            {/* Zone de Réponse Manuelle (apparaît après l'audit) */}
            {canSendReply && (
                <div className="flex flex-col gap-2 p-4 bg-[#1c1c1c] rounded-xl border border-green-500/50 mt-4">
                    <label className="text-sm font-medium text-green-400">3. Prévisualisation & Réponse Manuelle</label>
                    <div className="flex items-end gap-3">
                        <textarea
                            placeholder="Écrivez votre réponse de confirmation ici..."
                            className="flex-1 min-h-[100px] bg-[#2e2e2e] border border-gray-600 p-3 rounded-lg outline-none text-[14px] resize-none focus:border-green-500/80 transition-colors"
                            value={replyMessage}
                            onChange={(e) => setReplyMessage(e.target.value)}
                        />
                        <button 
                            onClick={handleManualSend}
                            className="p-3 bg-green-500 hover:bg-green-600 rounded-full transition-colors disabled:opacity-50"
                            disabled={replyMessage.trim() === ""}
                            title="Envoyer la réponse"
                        >
                            <Send className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );

    // Composant de la Zone de Chat Classique
    const ClassicChatInput = () => (
        <div className="relative flex items-center gap-3">
            <div className="flex-1 bg-[#2e2e2e] rounded-3xl flex items-center px-4 py-2.5 gap-3 transition-all shadow-sm">
                <Smile className="w-6 h-6 text-gray-400" />
                <input
                    type="text"
                    placeholder="Message..."
                    className="flex-1 bg-transparent outline-none text-[15px] placeholder:text-gray-400"
                />
                <Image className="w-6 h-6 text-blue-400" />
                <Heart className="w-6 h-6 text-red-500" />
            </div>
        </div>
    );

    return (
        <main className="hidden md:flex flex-1 flex-col h-full bg-[#121212] text-white relative">
            {/* Header */}
            <header className="h-20 border-b border-[#2e2e2e] flex items-center justify-between px-6 bg-[#1c1c1c] z-20">
                <div className="flex items-center gap-3 cursor-pointer">
                    <div className="relative">
                        <img
                            src="https://i.pravatar.cc/150?u=sarah"
                            className="w-10 h-10 rounded-full object-cover border border-gray-600"
                            alt="Sarah"
                        />
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#1c1c1c]" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-base font-semibold tracking-tight">sarah_w</span>
                        <span className="text-xs font-medium text-blue-400">Active now</span>
                    </div>
                </div>
                <div className="flex items-center gap-6 text-gray-400">
                    <Phone className="w-6 h-6" />
                    <Video className="w-6 h-6" />
                    <Info className="w-6 h-6" />
                </div>
            </header>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-1">
                <div className="flex justify-center py-4">
                    <span className="text-xs font-medium text-gray-500">Today, 9:41 AM</span>
                </div>

                {messages.map((msg, i) => (
                    <div
                        key={i}
                        className={`flex items-end gap-2 ${msg.type === "outgoing" ? "justify-end" : "justify-start"}`}
                    >
                        {msg.type === "incoming" && (
                            <img
                                src={msg.avatar}
                                alt={msg.username}
                                className="w-7 h-7 rounded-full object-cover mb-1 border border-gray-600"
                            />
                        )}
                        <div className={`flex flex-col max-w-[60%]`}>
                            <div
                                className={`px-4 py-2.5 rounded-3xl text-[15px] whitespace-pre-wrap leading-relaxed ${msg.type === "outgoing"
                                        ? "bg-blue-500 text-white rounded-br-sm" // Bulles bleues classiques de Messenger
                                        : "bg-[#2e2e2e] text-white rounded-bl-sm" // Bulles grises sombres pour l'entrant
                                    }`}
                            >
                                {msg.content}
                            </div>
                            <span className="text-[10px] text-gray-500 mt-0.5">{msg.time}</span>
                        </div>
                        {msg.type === "outgoing" && (
                            <img
                                src={msg.avatar}
                                alt={msg.username}
                                className="w-7 h-7 rounded-full object-cover mb-1 border border-gray-600"
                            />
                        )}
                    </div>
                ))}
            </div>

            {/* Input / Auditor Area */}
            <div className="p-4 px-6 pb-6 bg-[#1c1c1c] border-t border-[#2e2e2e]">
                <div className="flex items-end justify-end mb-3">
                    <button 
                        onClick={() => {
                            setIsAuditorActive(!isAuditorActive);
                            if (!isAuditorActive) {
                                // Réinitialiser le statut si on passe en mode Auditor pour un nouvel audit
                                setCanSendReply(false); 
                                setSanitizedText("");
                                setReplyMessage(defaultReply);
                            }
                        }}
                        className={`p-2 rounded-full transition-colors flex items-center gap-2 ${isAuditorActive ? 'bg-blue-600 hover:bg-blue-700' : 'bg-[#2e2e2e] hover:bg-[#3a3a3a]'}`}
                        title={isAuditorActive ? "Retour au chat" : "Activer SafeAI Auditor"}
                    >
                        <Shield className="w-6 h-6" />
                        <span className="text-sm font-medium pr-1 hidden sm:inline">{isAuditorActive ? "Mode Chat" : "Mode SafeAI"}</span>
                    </button>
                </div>
                
                {isAuditorActive ? <SafeAIAuditor /> : <ClassicChatInput />}
            </div>
        </main>
    );
};

export default function MessengerClone() {
    return (
        <div className="h-screen w-full flex overflow-hidden font-sans">
            <style jsx global>{`
                /* Pour cacher la scrollbar sur la zone notes */
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .hide-scrollbar {
                    -ms-overflow-style: none; /* IE and Edge */
                    scrollbar-width: none; /* Firefox */
                }
            `}</style>
            <Sidebar />
            <ChatArea />
        </div>
    );
}