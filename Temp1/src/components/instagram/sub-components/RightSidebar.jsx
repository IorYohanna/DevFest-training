import React from 'react';


const suggestions = [
    { id: 1, username: 'Jessica', name: 'Nouveau sur Instagram', avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=100&h=100&fit=crop' },
    { id: 2, username: 'Rand_Ui', name: 'Followed by Lucia_ + 3', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop' },
    { id: 3, username: 'Datouu', name: 'Followed by Lucia_ + 1', avatar: 'https://images.unsplash.com/photo-1603415526960-f7e0328c63b1?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
    { id: 4, username: 'Babyy', name: 'Followed by Maitre + 8', avatar: 'https://images.unsplash.com/photo-1619895862022-09114b41f16f?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8cHJvZmlsZSUyMHBpY3R1cmV8ZW58MHx8MHx8fDA%3D' },
];


export const RightSidebar = () => {
    return (
        <aside className="hidden xl:block w-[380px] pr-20 pt-24 mr-10">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <img src="./img/outsiders/Outsiders.jpg" className="w-12 h-12 rounded-full object-cover" alt="My Profile" />
                    <div className="flex flex-col">
                        <span className="text-sm font-semibold text-white">DF25_OUTSIDERS</span>
                        <span className="text-sm text-neutral-500 font-normal">Team Outsiders</span>
                    </div>
                </div>
                <button className="text-xs font-semibold text-blue-500 hover:text-white transition-colors">Basculer</button>
            </div>

            <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold text-neutral-400">Suggestions pour toi</span>
                <button className="text-xs font-medium text-white hover:text-neutral-400 transition-colors">Voir tout</button>
            </div>

            <div className="flex flex-col gap-4">
            {suggestions.map(user => (
                <div key={user.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img src={user.avatar} className="w-12 h-12 rounded-full object-cover" alt={user.username} />
                        <div className="flex flex-col">
                            <span className="text-sm font-semibold text-white hover:underline cursor-pointer">{user.username}</span>
                            <span className="text-xs text-neutral-500">{user.name}</span>
                        </div>
                    </div>
                    <button className="text-xs font-semibold text-blue-500 hover:text-white transition-colors">Suivre</button>
                </div>
            ))}
            </div>

            <div className="mt-8 pt-4 border-t border-neutral-900 h-screen ">
                <nav className="flex flex-wrap gap-x-3 gap-y-1 mt-4 text-xs text-neutral-500">
                    {['About', 'Help', 'Press', 'API', 'Jobs', 'Privacy'].map((link, i) => (
                    <React.Fragment key={link}>
                        <a href="#" className="hover:underline">{link}</a>
                        {i < 6 && <span className="text-[8px] flex items-center">•</span>}
                    </React.Fragment>
                    ))}
                </nav>
            </div>
      </aside>
    )
}