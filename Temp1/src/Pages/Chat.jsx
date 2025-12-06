import React from 'react';
import { Upload, History, FileText, Send, MessageSquareText, Menu, Settings } from 'lucide-react'; 

const AnnotatedChatInterface = () => {
    
    // --- [ 1. DONNÉES STATIQUES ] ----------------------------------------------------------------
    // Ces données simulent l'état du Backend. Elles seront remplacées par 'useState' et des appels API.
    const uploadedFiles = [
        { id: 1, name: 'Rapport_Annuel.docx', status: 'Prêt' },
        { id: 2, name: 'Factures_2024.zip', status: 'En cours...' },
    ];
    const messages = [
        { id: 1, text: 'Bienvenue sur votre espace RAG. Uploadez des documents pour commencer la conversation.', sender: 'LLM', timestamp: '10:00 AM' },
        { id: 2, text: 'Quelles sont les capacités de ce système ?', sender: 'User', timestamp: '10:01 AM' },
        { id: 3, text: 'Réponse RAG générée en utilisant 2 documents.', sender: 'LLM', timestamp: '10:02 AM' },
    ];
    const chatHistory = [
        { id: 1, title: 'Configuration FastAPI', active: true },
        { id: 2, title: 'Erreur Pydantic', active: false },
        { id: 3, title: 'Projet RAG Hybride', active: false },
    ];
    // Panneau droit visible par défaut pour le squelette statique
    const isRightAsideOpen = true; 
    // --------------------------------------------------------------------------------------------


    return (
        // Conteneur principal: h-screen, thème sombre
        <div className="flex h-screen w-full bg-gray-900 text-gray-200">
            
            {/* ------------------------------------------------------------------------------------
             * 1. ASIDE Gauche : Historique des Chats (Liste des discussions)
             * SÉPARATION VISUELLE : bg-gray-900, shadow-2xl, border-r
             * ------------------------------------------------------------------------------------ */}
            <aside className="w-[20rem] bg-gray-900 p-4 shadow-2xl flex-shrink-0 hidden lg:block h-screen ">
                
                {/* Header de la liste des Chats */}
                <div className="flex justify-between items-center border-b border-gray-700 pb-2 mb-4">
                    <h3 className="text-xl font-semibold text-violet-400 flex items-center">
                        <History className="w-5 h-5 mr-2" /> Discussions
                    </h3>
                    <div className="p-1 text-gray-500 hover:text-violet-400 transition" title="Nouvelle discussion">
                        <MessageSquareText className="w-5 h-5" />
                    </div>
                </div>
                
                {/* Liste des chats */}
                <ul className="space-y-2">
                    {/* [ ENREGISTREMENT MODIFICATION: ITERATION SUR LES CHATS ] */}
                    {chatHistory.map(chat => (
                        <li 
                            key={chat.id} 
                            className={`p-3 rounded-md cursor-pointer flex items-center text-sm transition ${
                                chat.active 
                                ? 'bg-violet-700 text-white font-medium shadow-md border-l-4 border-white' 
                                : 'bg-gray-800 hover:bg-gray-700'
                            }`}
                        >
                            <MessageSquareText className="w-4 h-4 mr-2" />
                            <span className="truncate">{chat.title}</span>
                        </li>
                    ))}
                </ul>       
            </aside>

            {/* ------------------------------------------------------------------------------------
             * 2. MAIN Centrale : Zone de Chat / Conversation
             * HAUTEUR : h-screen (pleine hauteur)
             * ------------------------------------------------------------------------------------ */}
            <main className={`flex flex-col flex-grow bg-transparent shadow-inner h-screen 
                            ${isRightAsideOpen ? 'lg:w-3/5' : 'lg:w-4/5'} `}>
                
                {/* Header de la Conversation */}
                <div className="flex justify-between items-center p-4">
                    <h2 className="text-2xl font-light text-white text-center w-full">Evitez les renseignements faux</h2>
                </div>

                {/* Chat Area - Affichage des messages */}
                <div className="flex-grow p-4 overflow-y-auto space-y-4">
                    {/* [ ENREGISTREMENT MODIFICATION: RENDU DES MESSAGES ] */}
                    {messages.map(msg => (
                        <div key={msg.id} className={`flex ${msg.sender === 'User' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[70%] p-3 rounded-xl shadow-md ${
                                msg.sender === 'User' ? 'bg-violet-600 text-white rounded-tr-sm' : 'bg-gray-700 text-gray-200 rounded-tl-sm'
                            }`}>
                                <p className="text-sm">{msg.text}</p>
                                <span className={`text-xs block mt-1 ${
                                    msg.sender === 'User' ? 'text-violet-200 text-left' : 'text-gray-400 text-right'
                                }`}>
                                    {msg.timestamp}
                                </span>
                            </div>
                        </div>
                    ))}
                    {/* Placeholder de défilement */}
                    <div className="h-64"></div> 
                </div>
                
                {/* Zone de saisie du message */}
                <form className="flex p-4  sticky bottom-0">
                    {/* [ ENREGISTREMENT MODIFICATION: GESTION DE LA SAISIE ET DE L'ENVOI ] */}
                    <input 
                        type="text" 
                        placeholder="Posez votre question RAG ici..." 
                        className="flex-grow p-3 rounded-full border border-gray-600 bg-gray-900 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-violet-500 transition"
                        defaultValue="Ceci est l'input. Ajouter la logique 'onChange' et 'value={state}' ici."
                    />
                    <button 
                        type="submit"
                        className="ml-3 p-3 bg-violet-600 hover:bg-violet-700 text-white rounded-full flex items-center justify-center"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </form>
            </main>

            {/* ------------------------------------------------------------------------------------
             * 3. ASIDE Droite : Upload et Documents (Panneau RAG Flottant)
             * MODIFICATIONS APPORTÉES : Drag & Drop Horizontal et Bouton Enregistrer.
             * ------------------------------------------------------------------------------------ */}
            <aside className={`w-1/4 bg-gray-900 p-4 shadow-2xl flex-shrink-0 overflow-y-auto 
                            ${isRightAsideOpen ? 'translate-x-0' : 'translate-x-full absolute right-0'}`}>

                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-violet-400 flex items-center">
                        <Upload className="w-5 h-5 mr-2" /> Upload RAG
                    </h3>
                    <button className="p-1 text-gray-500 hover:text-violet-400 transition" title="Paramètres RAG">
                        <Settings className="w-5 h-5" />
                    </button>
                </div>
                
                {/* NOUVELLE DISPOSITION : Drag and Drop SANS BOUTON PARCOURIR */}
                <div className="mb-6 space-y-3">
                    
                    {/* Ligne 1 : Drag and Drop (Cliquez pour ouvrir l'input file) */}
                    <div 
                        className="flex items-center justify-center h-[500px] border-2 border-dashed border-gray-700 p-3 rounded-lg cursor-pointer hover:border-violet-500 transition duration-200"
                        // [ ENREGISTREMENT MODIFICATION: LOGIQUE DRAG & DROP ]
                        // Ajouter 'onDragOver', 'onDrop', 'onClick' ici. Le 'onClick' appellera fileInputRef.current.click()
                    >
                        <p className="text-sm text-gray-400 text-center">Glissez-déposez ici ou cliquez pour choisir un fichier</p>
                        
                        {/* Le champ <input type="file" ref={fileInputRef} className="hidden" /> sera ici */}
                    </div>
                    
                    {/* Ligne 2 : Bouton Enregistrer/Indexer */}
                    {/* [ ENREGISTREMENT MODIFICATION: LOGIQUE D'ENREGISTREMENT/INDEXATION ] */}
                    <button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-lg transition">
                        Enregistrer les modifications
                    </button>
                </div>
                
                {/* Liste des Documents Uploadés Statistique */}
                <h4 className="text-lg font-medium text-gray-300 mb-3">Documents Indexés ({uploadedFiles.length})</h4>
                <ul className="space-y-2">
                    {/* [ ENREGISTREMENT MODIFICATION: GESTION D'ÉTAT DES FICHIERS ] */}
                    {uploadedFiles.map(file => (
                        <li key={file.id} className="flex items-center p-2 bg-gray-800 rounded-md text-sm">
                            <FileText className={`w-4 h-4 mr-2 ${file.status === 'Prêt' ? 'text-green-400' : 'text-yellow-500'}`} />
                            <span className="truncate">{file.name}</span>
                            <span className={`ml-auto text-xs ${file.status === 'Prêt' ? 'text-green-400' : 'text-yellow-500'}`}>
                                {file.status}
                            </span>
                            {/* [ AJOUTER ICI : Bouton X de suppression statique ] */}
                        </li>
                    ))}
                </ul>
            </aside>
        </div>
    );
};

export default AnnotatedChatInterface;