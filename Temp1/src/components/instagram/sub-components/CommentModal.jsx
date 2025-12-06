import { useState } from 'react';
import { Home, Search, Compass, Film, MessageCircle, Heart, PlusSquare, Menu, MoreHorizontal, Send, Bookmark, Volume2, Camera, X, Smile, AlertTriangle, ShieldAlert } from 'lucide-react';

// API Configuration
const API_BASE_URL = "http://localhost:8000/api/v1";

// Analyser un texte
const analyzeText = async (text, threshold = 0.7) => {
  try {
    const response = await fetch(`${API_BASE_URL}/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, threshold }),
    });
    if (!response.ok) throw new Error(`Erreur ${response.status}`);
    return await response.json();
  } catch (err) {
    console.error("Erreur d'analyse:", err);
    throw err;
  }
};

const SafeBadge = () => (
  <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 w-[60px] rounded-full bg-green-500/10 border border-green-500/20 text-green-400 ml-2">
    <ShieldAlert size={10} className="text-green-400 rotate-180" />
    Safe
  </span>
);



export const CommentModal = ({ post, onClose }) => {
    const [commentText, setCommentText] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [toxicityResult, setToxicityResult] = useState(null);
    const [showWarning, setShowWarning] = useState(false);
    const [comments, setComments] = useState([
        { id: 1, user: 'mihoby.rjs', text: '❤️❤️❤️', time: '19 h', likes: 1, avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50&h=50&fit=crop' },
        { id: 2, user: 'r_fano', text: '👏👏👏👏', time: '19 h', likes: 1, avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=50&h=50&fit=crop' },
        { id: 3, user: 'ziondjamal', text: '☁️', time: '2 h', likes: 1, avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=50&h=50&fit=crop' },
        { id: 4, user: 'sarah_des', text: 'Best hacker I ever see in my life ! 🔥', time: '1 h', likes: 4, avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=50&h=50&fit=crop' },
    ]);

    if (!post) return null;

    // Analyser le commentaire en temps réel
    const handleCommentChange = async (e) => {
        const text = e.target.value;
        setCommentText(text);
        
        // Réinitialiser les warnings si le texte est vide
        if (text.trim().length === 0) {
            setToxicityResult(null);
            setShowWarning(false);
            return;
        }

        // Analyser uniquement si le texte a plus de 3 caractères
        if (text.trim().length > 3) {
            setIsAnalyzing(true);
            try {
                const result = await analyzeText(text, 0.7);
                setToxicityResult(result);
                
                // Afficher un warning si le contenu est toxique
                if (result.is_toxic && result.recommendation === 'BLOCK') {
                    setShowWarning(true);
                } else {
                    setShowWarning(false);
                }
            } catch (error) {
                console.error("Erreur lors de l'analyse:", error);
            } finally {
                setIsAnalyzing(false);
            }
        }
    };

    // Publier le commentaire
    const handlePublish = async () => {
        if (!commentText.trim()) return;

        // Vérifier la toxicité avant de publier
        setIsAnalyzing(true);
        try {
            const result = await analyzeText(commentText, 0.7);
            
            if (result.is_toxic && result.recommendation === 'BLOCK') {
                setToxicityResult(result);
                setShowWarning(true);
                setIsAnalyzing(false);
                return; // Bloquer la publication
            }

            // Si le commentaire passe la vérification, l'ajouter
            const newComment = {
                id: comments.length + 1,
                user: 'Vous',
                text: commentText,
                time: 'À l\'instant',
                likes: 0,
                avatar: './img/outsiders/Outsiders.jpg',
                safe: result.is_toxic ? false : true
            };

            setComments([...comments, newComment]);
            setCommentText('');
            setToxicityResult(null);
            setShowWarning(false);
        } catch (error) {
            console.error("Erreur lors de la publication:", error);
            alert("Une erreur s'est produite. Veuillez réessayer.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    // Obtenir la couleur selon le niveau de toxicité
    const getToxicityColor = (score) => {
        if (score >= 0.8) return 'text-red-500';
        if (score >= 0.5) return 'text-orange-500';
        return 'text-yellow-500';
    };

    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
        <button className="absolute top-6 right-6 text-white z-[110]" onClick={onClose}>
            <X size={30} />
        </button>

        <div className="relative z-[101] bg-black border border-neutral-800 w-full max-w-6xl h-[85vh] md:h-[90vh] flex rounded-md overflow-hidden animate-in fade-in zoom-in duration-200">
          
          <div className="hidden md:flex flex-1 bg-black items-center justify-center relative border-r border-neutral-800">
             <img src={post.image} className="w-full h-full object-contain" alt="Post detail" />
          </div>

          <div className="w-full md:w-[400px] lg:w-[500px] flex flex-col bg-black h-full">
            
            <div className="flex items-center justify-between p-4 border-b border-neutral-800 shrink-0">
               <div className="flex items-center gap-3">
                 <div className="p-[2px] rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600">
                    <img src={post.avatar} className="w-8 h-8 rounded-full border-2 border-black" alt={post.username} />
                 </div>
                 <span className="font-semibold text-sm hover:opacity-70 cursor-pointer">{post.username}</span>
               </div>
               <MoreHorizontal size={20} className="text-white cursor-pointer"/>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
               <div className="flex gap-3">
                  <img src={post.avatar} className="w-8 h-8 rounded-full mt-1" alt="avatar" />
                  <div className="flex flex-col text-sm">
                     <div>
                       <span className="font-semibold mr-2">{post.username}</span>
                       <span className="text-neutral-100">{post.caption}</span>
                     </div>
                     <span className="text-neutral-500 text-xs mt-1">{post.timeAgo}</span>
                  </div>
               </div>

               {comments.map(comment => (
                 <div key={comment.id} className="flex gap-3 group">
                    <img src={comment.avatar} className="w-8 h-8 rounded-full mt-1" alt={comment.user} />
                    <div className="flex flex-col text-sm w-full">
                       <div className="flex justify-between items-start">
                          <div>
                            <span className="font-semibold mr-2">{comment.user}</span>
                            <span className="text-neutral-100">{comment.text}</span>
                            {comment.safe && <SafeBadge />}

                          </div>
                          <Heart size={12} className="text-neutral-500 hover:text-red-500 cursor-pointer mt-1" />
                       </div>
                       <div className="flex items-center gap-3 text-xs text-neutral-500 mt-1 font-semibold">
                          <span>{comment.time}</span>
                          {comment.likes > 0 && <span>{comment.likes} J'aime</span>}
                          <span className="cursor-pointer hover:text-neutral-300">Répondre</span>
                          <MoreHorizontal size={14} className="hidden group-hover:block cursor-pointer"/>
                       </div>
                    </div>
                 </div>
               ))}
            </div>
            {/* Warning de toxicité */}
                {showWarning && toxicityResult && (
                    <div className="mx-4 mb-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                        <div className="flex items-start gap-2">
                            <ShieldAlert size={18} className="text-red-500 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                                <p className="text-red-500 font-semibold text-xs mb-1">
                                    Contenu inapproprié détecté
                                </p>
                                <p className="text-red-400 text-xs mb-2">
                                    Ce commentaire contient du langage offensant et ne peut pas être publié.
                                </p>
                                <div className="space-y-1">
                                    {toxicityResult.scores.toxicity > 0.5 && (
                                        <div className="flex justify-between text-xs">
                                            <span className="text-neutral-400">Toxicité:</span>
                                            <span className={getToxicityColor(toxicityResult.scores.toxicity)}>
                                                {(toxicityResult.scores.toxicity * 100).toFixed(0)}%
                                            </span>
                                        </div>
                                    )}
                                    {toxicityResult.scores.obscene > 0.5 && (
                                        <div className="flex justify-between text-xs">
                                            <span className="text-neutral-400">Obscénité:</span>
                                            <span className={getToxicityColor(toxicityResult.scores.obscene)}>
                                                {(toxicityResult.scores.obscene * 100).toFixed(0)}%
                                            </span>
                                        </div>
                                    )}
                                    {toxicityResult.scores.insult > 0.5 && (
                                        <div className="flex justify-between text-xs">
                                            <span className="text-neutral-400">Insulte:</span>
                                            <span className={getToxicityColor(toxicityResult.scores.insult)}>
                                                {(toxicityResult.scores.insult * 100).toFixed(0)}%
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

            <div className="border-t border-neutral-800 bg-black shrink-0">
                <div className="p-4 pb-2">
                    <div className="flex justify-between mb-2">
                       <div className="flex gap-4">
                          <Heart size={24} className="hover:text-neutral-400 cursor-pointer"/>
                          <MessageCircle size={24} className="hover:text-neutral-400 cursor-pointer"/>
                          <Send size={24} className="hover:text-neutral-400 cursor-pointer"/>
                       </div>
                       <Bookmark size={24} className="hover:text-neutral-400 cursor-pointer"/>
                    </div>
                    <div className="font-semibold text-sm mb-1">{post.likes.toLocaleString()} J'aime</div>
                    <div className="text-[10px] text-neutral-500 uppercase mb-3">{post.timeAgo}</div>
                </div>

                
                
                <div className="flex items-center border-t border-neutral-800 p-4">
                   <Smile size={24} className="text-neutral-200 mr-3 cursor-pointer"/>
                   <input 
                      type="text"
                      value={commentText}
                      onChange={handleCommentChange}
                      placeholder="Ajouter un commentaire..." 
                      className="bg-transparent text-sm w-full focus:outline-none text-neutral-200 placeholder-neutral-500"
                   />
                   <button 
                      onClick={handlePublish}
                      disabled={isAnalyzing || !commentText.trim()}
                      className={`font-semibold text-sm ml-2 transition-colors ${
                          isAnalyzing || !commentText.trim() 
                              ? 'text-blue-500/30 cursor-not-allowed' 
                              : 'text-blue-500 hover:text-white cursor-pointer'
                      }`}
                   >
                      {isAnalyzing ? 'Analyse...' : 'Publier'}
                   </button>
                </div>
            </div>

          </div>
        </div>
      </div>
    );
};