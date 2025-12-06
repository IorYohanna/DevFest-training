import { MessageCircle, Heart, MoreHorizontal, Send, Bookmark, Volume2 } from 'lucide-react';
  
  export const Post = ({ post , setCommentInputs}) => (
    <article className="border-b border-neutral-900 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="p-[2px] rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600">
            <div className="p-[2px] bg-black rounded-full">
              <img src={post.avatar} className="w-8 h-8 rounded-full object-cover" alt={post.username} />
            </div>
          </div>
          <div className="flex flex-col leading-none">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-white hover:text-neutral-300 cursor-pointer">{post.username}</span>
              <span className="text-neutral-500 text-xs">•</span>
              <span className="text-sm text-neutral-400 font-normal">{post.timeAgo}</span>
            </div>
            <span className="text-xs text-neutral-500">{post.location}</span>
          </div>
        </div>
        <button className="text-white hover:text-neutral-400 transition-colors">
          <MoreHorizontal size={20} />
        </button>
      </div>

      {/* Content */}
      <div className={`relative w-full ${post.aspectRatio} bg-neutral-900 rounded-md overflow-hidden border border-neutral-800`}>
        <img src={post.image} alt="Post content" className="w-full h-full object-cover" />
        {post.hasAudio && (
          <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-md p-1.5 rounded-full">
            <Volume2 className="text-white" size={16} />
          </div>
        )}
        {post.id === 1 && (
          <div className="absolute bottom-8 left-8 text-white opacity-80 mix-blend-difference pointer-events-none">
            <h3 className="text-2xl font-bold leading-tight uppercase tracking-tighter">Minimalism<br />is the key.</h3>
          </div>
        )}
      </div>

      {/* Action Bar */}
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button className="hover:opacity-60 transition-opacity">
            <Heart className="text-white" size={26} />
          </button>
          <button className="hover:opacity-60 transition-opacity">
            <MessageCircle className="text-white" size={26} />
          </button>
          <button className="hover:opacity-60 transition-opacity">
            <Send className="text-white" size={26} />
          </button>
        </div>
        <button className="hover:opacity-60 transition-opacity">
          <Bookmark className="text-white" size={26} />
        </button>
      </div>

      {/* Likes & Caption */}
      <div className="mt-3 space-y-1">
        <div className="text-sm font-medium text-white">{post.likes.toLocaleString()} likes</div>
        <div className="text-sm text-neutral-200">
          <span className="font-medium text-white mr-1">{post.username}</span>
          {post.caption} {post.hashtags && <span className="text-blue-200 hover:underline cursor-pointer">{post.hashtags}</span>}
        </div>
        {post.comments && (
          <div className="text-sm text-neutral-500 cursor-pointer pt-1">View all {post.comments} comments</div>
        )}
        
        <div className="flex items-center justify-between pt-1">
          <input 
            type="text" 
            placeholder="Add a comment..." 
            className="bg-transparent text-sm w-full text-neutral-200 placeholder-neutral-500 focus:outline-none py-1"
            value={commentInputs[post.id] || ''}
            onChange={(e) => setCommentInputs({...commentInputs, [post.id]: e.target.value})}
          />
          <button className="text-xs font-medium text-blue-500 hover:text-white transition-colors">Post</button>
        </div>
      </div>
    </article>
  );