import React from 'react';
import {  ArrowUpRight, ArrowUp } from 'lucide-react';
import { Icon } from '@iconify/react';
import ChatArea from './ChatArea';

const historyData = [
  {
    title: "Eco Analysis",
    date: "Today • 12 November",
    image: "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?q=80&w=800&auto=format&fit=crop",
    type: "render",
    details: "Solar farm, photorealistic, 8k",
    avatars: [
      "https://images.unsplash.com/photo-1466611653911-95081537e5b7?q=80&w=200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?q=80&w=200&auto=format&fit=crop"
    ]
  },
  {
    title: "Grid Data",
    date: "Yesterday • 11 November",
    type: "list",
    items: [
      { title: "Efficiency metrics?", sub: "Calculate input/output ratio...", icon: "solar:pie-chart-2-bold-duotone" },
      { title: "Reduce voltage loss?", sub: "Transmission line optimization...", icon: "solar:bolt-bold-duotone" }
    ]
  }
];

const quickActions = [
  { label: "Audit Files", icon: "solar:file-pdf-bold-duotone", subIcon: "solar:file-text-bold-duotone", color: "text-red-500" },
  { label: "Visuals", image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=200&auto=format&fit=crop" },
  { label: "Convert", customIcon: true }, 
  { label: "Audio Brief", icon: "solar:soundwave-bold-duotone", color: "text-slate-700" },
];

const HistoryCard = ({ data }) => {
  if (data.type === 'render') {
    return (
      <div className="relative bg-white/60 backdrop-blur-md rounded-[2.5rem]  shadow-sm border border-white/40 group hover:bg-white/80 transition-all">
        <div className="flex justify-between items-start">
          <div className="flex gap-3 items-center p-4">
            <div className="p-3 bg-white rounded-full shadow-sm">
              <Icon icon="solar:leaf-bold-duotone" className="text-xl text-emerald-500" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-800">{data.title}</h3>
              <p className="text-xs text-slate-400 font-medium mt-0.5">{data.date}</p>
            </div>
          </div>
          <button className="w-10 h-10 rounded-full m-3 bg-white flex items-center justify-center hover:bg-slate-50 transition-colors">
            <ArrowUpRight className="w-4 h-4 text-slate-400 stroke-[1.5]" />
          </button>
        </div>
        
        <div className="relative aspect-[4/3] w-full group-hover:scale-[1.02] transition-transform duration-500 rounded-[2rem] shadow-md overflow-hidden">
          <img 
            src={data.image} 
            className="w-full h-full object-cover" 
            alt="Visual" 
          />

          <div className="absolute bottom-2 left-8 z-10 w-full">
             <div className="bg-gradient-to-b from-white/80 to-zinc-100/45 backdrop-blur-md rounded-full p-3 flex items-center gap-3 shadow-md border border-white/80 max-w-xs">
                <div className="p-1.5  bg-slate-100 rounded-full">
                  <Icon icon="solar:gallery-bold-duotone" className="text-lg text-slate-600" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-slate-800">Site Renderings</span>
                  <span className="text-xs text-zinc-500">{data.details}</span>
                </div>
              </div>
          </div>

          <div className="absolute top-5 right-5 flex flex-col gap-8">
            {data.avatars.map((avatar, i) => (
              <div key={i} className={`w-14 h-14 rounded-full border-2 border-white shadow-lg overflow-hidden relative ${i > 0 ? '-mt-5' : ''} z-${10-i}`}>
                <img src={avatar} className="w-full h-full object-cover" alt="avatar" />
              </div>
            ))}
            <div className="w-12 h-12 rounded-full bg-white/90 backdrop-blur border-2 border-white shadow-lg flex items-center justify-center relative -mt-4 z-0">
              <span className="text-xs font-semibold text-slate-600">+5</span>
            </div>
          </div>
          
        </div>
        
        
      </div>
    );
  }
  return (
    <div className="bg-white/60 backdrop-blur-md rounded-[2.5rem] p-5 shadow-sm border border-white/40 flex flex-col gap-4">
      <div className="flex justify-between items-start">
        <div className="flex gap-3 items-center">
          <div className="p-2 bg-white rounded-full shadow-sm">
            <Icon icon="solar:magic-stick-3-bold-duotone" className="text-xl text-purple-500" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-800">{data.title}</h3>
            <p className="text-xs text-slate-400 font-medium mt-0.5">{data.date}</p>
          </div>
        </div>
        <button className="w-8 h-8 rounded-full bg-white flex items-center justify-center hover:bg-slate-50">
          <ArrowUpRight className="w-4 h-4 text-slate-400 stroke-[1.5]" />
        </button>
      </div>
      <div className="flex flex-col gap-2">
        {data.items.map((item, i) => (
          <button key={i} className="w-full bg-white/80 hover:bg-white p-4 rounded-2xl text-left flex items-center gap-3 transition-colors group">
            <div className="p-1.5 bg-slate-100 rounded-lg group-hover:bg-purple-100 transition-colors">
              <Icon icon={item.icon} className="text-lg text-slate-600 group-hover:text-purple-600" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-slate-800">{item.title}</span>
              <span className="text-xs text-slate-400 truncate w-48">{item.sub}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};


// --- App Layout ---

const Dashboard = () => {
  return (
    <>
      {/* Global Styles for hiding scrollbar but allowing scroll */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { display: none; }
        .custom-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
      
      <div className="bg-[#EBE9EF] text-slate-800 h-screen w-screen overflow-hidden flex p-4 font-sans antialiased selection:bg-purple-200 selection:text-purple-900">
        {/* <Sidebar /> */}
        
        <aside className="flex flex-col w-[400px] shrink-0 h-full gap-6 ml-2">
          <header className="flex items-center justify-center py-2 shrink-0">
            <h1 className="text-2xl font-medium tracking-tight text-slate-800">History</h1>
          </header>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-8 pr-2 pb-10">
            {/* Section Today */}
            <div className="flex flex-col gap-4">
              <h2 className="text-lg text-slate-500 font-medium ml-1">Today</h2>
              <HistoryCard data={historyData[0]} />
            </div>
            
            {/* Section Yesterday */}
            <div className="flex flex-col gap-4">
              <h2 className="text-lg text-slate-500 font-medium ml-1">Yesterday</h2>
              <HistoryCard data={historyData[1]} />
            </div>
          </div>
        </aside>

        <ChatArea />
      </div>
    </>
  );
};

export default Dashboard;