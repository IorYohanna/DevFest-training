import React, { useState } from 'react';
import { Home, Search, Compass, Film, MessageCircle, Heart, PlusSquare, Menu, MoreHorizontal, Send, Bookmark, Volume2, Camera, ArrowLeft } from 'lucide-react';
import { NavItem } from './sub-components/Navigation';
import { Story } from './sub-components/Navigation';
import { CommentModal } from './sub-components/CommentModal';
import { RightSidebar } from './sub-components/RightSidebar';
import { Link } from 'react-router-dom';

const Instagram = () => {
  const [commentInputs, setCommentInputs] = useState({});
  const [activePost, setActivePost] = useState(null);

  const stories = [
    { id: 1, username: 'Honty_Herizo', avatar: './img/outsiders/Honty.jpeg', hasNewStory: true },
    { id: 2, username: 'Landry_Sitraka', avatar: './img/outsiders/Landry.jpeg', hasNewStory: true },
    { id: 3, username: 'Andrews_Mihasiniaina', avatar: './img/outsiders/Andrews.jpg', hasNewStory: false },
    { id: 4, username: 'Ranja_Heriman', avatar: './img/outsiders/Ranja.jpeg', hasNewStory: true },
    { id: 5, username: 'Yohanna_Iorenantsoa', avatar: './img/outsiders/Yohanna.jpg', hasNewStory: true },
  ];

  const posts = [
    {
      id: 1,
      username: 'hackers_setup',
      avatar: './img/instagram/hacker.jpg',
      location: 'Audio Original',
      timeAgo: '5h',
      image: './img/instagram/post.png',
      likes: 4821,
      caption: 'Follow @hackers_setup for Tech Gadgets Setup.',
      hashtags: '#architecture #minimal',
      comments: 124,
      hasAudio: true,
      aspectRatio: 'aspect-[4/5]'
    },
    {
      id: 2,
      username: 'marcus_dev',
      avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100&h=100&fit=crop',
      location: 'Tokyo, Japan',
      timeAgo: '2d',
      image: 'https://images.unsplash.com/photo-1550439062-609e1531270e?w=800&q=80',
      likes: 12403,
      caption: 'Late night coding sessions in Shibuya.',
      aspectRatio: 'aspect-square'
    }
  ];

  const Post = ({ post }) => (
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
      </div>

      {/* Action Bar */}
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button className="hover:opacity-60 transition-opacity"><Heart className="text-white" size={26} /></button>
          <button className="hover:opacity-60 transition-opacity" onClick={() => setActivePost(post)}><MessageCircle className="text-white" size={26} /></button>
          <button className="hover:opacity-60 transition-opacity"><Send className="text-white" size={26} /></button>
        </div>
        <button className="hover:opacity-60 transition-opacity"><Bookmark className="text-white" size={26} /></button>
      </div>

      {/* Likes & Caption */}
      <div className="mt-3 space-y-1">
        <div className="text-sm font-medium text-white">{post.likes.toLocaleString()} likes</div>
        <div className="text-sm text-neutral-200">
          <span className="font-medium text-white mr-1">{post.username}</span>
          {post.caption} {post.hashtags && <span className="text-blue-200 hover:underline cursor-pointer">{post.hashtags}</span>}
        </div>
        {post.comments && (
          <div className="text-sm text-neutral-500 cursor-pointer pt-1" onClick={() => setActivePost(post)}>
            View all {post.comments} comments
          </div>
        )}
        <div className="flex items-center justify-between pt-1">
          <input
            type="text"
            placeholder="Add a comment..."
            className="bg-transparent text-sm w-full text-neutral-200 placeholder-neutral-500 focus:outline-none py-1"
            value={commentInputs[post.id] || ''}
            onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
          />
          <button className="text-xs font-medium text-blue-500 hover:text-white transition-colors">Post</button>
        </div>
      </div>
    </article>
  );

  return (
    <div className="flex min-h-screen bg-black text-neutral-200">

      {/* Modale */}
      {activePost && <CommentModal post={activePost} onClose={() => setActivePost(null)} />}

      {/* Left Sidebar Navigation */}
      <aside className="hidden md:flex flex-col w-[72px] xl:w-[245px] fixed h-full border-r border-neutral-800 bg-black z-30 pt-2 pb-5 px-3 transition-all duration-300">
        <div className="h-24 flex items-center mb-2 px-3">
          <a href="#" className="group block">
            <span className="hidden xl:block text-[50px] tracking-tight text-white font-cream mt-2">Instagram</span>
            <Camera className="xl:hidden text-white" size={28} />
          </a>
        </div>
        <nav className="flex-1 space-y-2">
          <NavItem icon={Home} label="Home" active />
          <NavItem icon={Search} label="Search" />
          <NavItem icon={Compass} label="Discover" />
          <NavItem icon={Film} label="Reels" />
          <NavItem icon={MessageCircle} label="Messages" badge={3} />
          <NavItem icon={Heart} label="Notifications" />
          <NavItem icon={PlusSquare} label="Create" />
        </nav>
        <div className="mt-auto pt-2">
            <Link to="/detoxify"
              className="flex items-center gap-2 p-2 text-sm font-medium rounded-full text-gray-400 hover:text-white hover:bg-[#2e2e2e] transition-colors"
              title="Retour"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Retour</span>
            </Link>
        </div>
      </aside>

      {/* Main Feed */}
      <main className="flex-1 flex flex-col items-center ml-0 md:ml-[72px] xl:ml-[245px] w-full min-h-screen pt-8 pb-20">
        <div className="w-full max-w-[630px] px-4">
          {/* Stories */}
          <div className="flex gap-4 mb-10 overflow-x-auto scrollbar-hide py-2">
            {stories.map(story => <Story key={story.id} {...story} />)}
          </div>
          {/* Posts */}
          <div className="max-w-[470px] mx-auto space-y-8">
            {posts.map(post => <Post key={post.id} post={post} />)}
          </div>
        </div>
      </main>

      {/* Right Sidebar */}
      <RightSidebar />

      {/* Bottom Mobile Bar */}
      <div className="md:hidden fixed bottom-0 w-full bg-black border-t border-neutral-800 flex justify-around items-center h-14 z-50 px-2">
        <a href="#" className="p-2"><Home className="text-white" size={26} /></a>
        <a href="#" className="p-2"><Compass className="text-white" size={26} /></a>
        <a href="#" className="p-2"><Film className="text-white" size={26} /></a>
        <a href="#" className="p-2"><PlusSquare className="text-white" size={26} /></a>
        <a href="#" className="p-2">
          <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop" alt="Profile" className="h-6 w-6 rounded-full ring-2 ring-white" />
        </a>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default Instagram;
