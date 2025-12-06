
export const NavItem = ({ icon: Icon, label, active = false, badge = null }) => (
    <a href="#" className="flex items-center gap-4 p-3 rounded-lg hover:bg-neutral-900 group transition-colors">
      <div className="relative">
        <Icon className={`${active ? 'text-white' : 'text-neutral-200'} group-hover:scale-105 transition-transform`} size={26} />
        {badge && (
          <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white border-2 border-black">
            {badge}
          </div>
        )}
      </div>
      <span className={`hidden xl:block text-base font-medium ${active ? 'text-white' : ''}`}>{label}</span>
    </a>
  );


export const Story = ({ username, avatar, hasNewStory }) => (
<div className="flex flex-col items-center justify-between w-full cursor-pointer group">
    <div className={`p-[3px] rounded-full ${hasNewStory ? 'bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600' : 'bg-neutral-700 group-hover:bg-neutral-600'} group-hover:scale-105 transition-all duration-300`}>
    <div className="p-[3px] bg-black rounded-full">
        <img src={avatar} className={`w-20 h-20 rounded-full object-cover border border-neutral-800 ${!hasNewStory && 'opacity-90'}`} alt={username} />
    </div>
    </div>
    <span className={`text-xs ${hasNewStory ? 'text-neutral-400' : 'text-neutral-500'} truncate w-16 text-center font-medium`}>{username}</span>
</div>
);

