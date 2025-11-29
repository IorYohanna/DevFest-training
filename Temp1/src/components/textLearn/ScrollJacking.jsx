import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// --- DATA ---
const headerData = {
    title: "TECHNOLOGIE",
    description : "ProSE™ revolutionizes proteomics with unprecedented precision."
}
const contentData = [
  {
    id: 1,
    title: "Sample Preparation",
    description:
      "To prepare samples for ProSE, proteins and peptides are first functionalized by attaching an initiating linker to one terminus of each peptide chain.",
    year: "2025",
  },
  {
    id: 2,
    title: "Molecular Expansion",
    description:
      "The sample undergoes a controlled expansion process, magnifying the molecular structures to allow for precise optical reading and analysis.",
    year: "2026",
  },
  {
    id: 3,
    title: "Amino Acid Sequencing",
    description:
      "High-resolution imaging sequences the amino acids effectively, mapping the protein structure with unprecedented accuracy and speed.",
    year: "2027",
  },
];

const ScrollGallery = () => {
  const containerRef = useRef(null);
  const visualRef = useRef(null);
  const visualWrapperRef = useRef(null);
  const [activeStep, setActiveStep] = useState(0);

  const descriptionRefs = useRef([]);
  descriptionRefs.current = [];

  const addToRefs = (el) => {
    if (el && !descriptionRefs.current.includes(el)) {
      descriptionRefs.current.push(el);
    }
  };


  useEffect(() => {
    const ctx = gsap.context(() => {

      ScrollTrigger.create({
        trigger: containerRef.current,
        start: "top top",
        end: "+=2000", 
        pin: true, 
        scrub: 1, 
        
        onUpdate: (self) => {
          
          const step = Math.min(
            Math.floor(self.progress * contentData.length),
            contentData.length - 1
          );
          setActiveStep(step);
          
          const rotationAngle = self.progress * 300; 
          gsap.to(visualRef.current, {
            rotation: rotationAngle,
            duration: 0.3,
            ease: "none",
          });
        },
      });
      
    }, containerRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    
    descriptionRefs.current.forEach((ref, index) => {
      if (index === activeStep) {

        gsap.to(ref, {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
          delay: 0.2,
        });
      } else {

        gsap.set(ref, {
          opacity: 0,
          y: 15,
          duration: 0.5,
        });
      }
    });
    
  }, [activeStep]);

  return (
    <div
      ref={containerRef}
      className="h-screen w-full bg-white text-zinc-900 overflow-hidden font-sans selection:bg-black selection:text-white flex flex-col md:flex-row"
    >
      
      <div 
        ref={visualWrapperRef}
        className="relative w-full md:w-1/2 h-full flex flex-col justify-between p-8 border-r border-zinc-200/0 md:border-zinc-200"
      >
        
        <div className="flex items-center gap-2 text-xs font-bold tracking-widest z-10">
          <span className="w-2 h-2 bg-black rounded-full"></span> 1
          <span className="ml-4 text-lg">{headerData.title}</span>
        </div>
        
        <div className="absolute inset-0 flex items-center justify-center">
            
            <div className="absolute top-[25%] right-10 bg-black text-white w-8 h-8 flex items-center justify-center text-xs font-bold rounded animate-bounce-slow z-30">
                {activeStep + 1}
            </div>

            <div ref={visualRef} className="relative w-[450px] h-[450px] flex items-center justify-center">
                {Array.from({ length: 18 }).map((_, i) => {
                const angle = i * 15 + 40;
                const radius = 160;
                const x = Math.cos((angle * Math.PI) / 180) * radius;
                const y = Math.sin((angle * Math.PI) / 180) * radius;
                const isActive = i > 5 && i < 12;

                return (
                    <div
                    key={i}
                    className="visual-dot absolute rounded-full shadow-sm transition-all duration-500"
                    style={{
                        width: isActive ? "45px" : "30px",
                        height: isActive ? "45px" : "30px",
                        transform: `translate(${x}px, ${y}px)`, 
                        background: isActive
                        ? "linear-gradient(135deg, #18181b 0%, #3f3f46 100%)"
                        : "linear-gradient(135deg, #f4f4f5 0%, #e4e4e7 100%)",
                        zIndex: isActive ? 10 : 1,
                        border: "1px solid rgba(0,0,0,0.05)",
                    }}
                    />
                );
                })}
            </div>
             <div className="absolute w-[600px] h-[600px] bg-zinc-100 rounded-full blur-3xl -z-10 pointer-events-none" />
        </div>

        <div className="absolute top-0 right-0 h-full w-px bg-zinc-200 hidden md:block">
            <div 
                className="absolute top-0 w-full bg-black transition-all duration-700 ease-out"
                style={{ 
                    height: `${((activeStep + 1) / contentData.length) * 100}%`,
                }}
            />
        </div>


        <div></div>
      </div>

      <div className="w-full md:w-1/2 h-full flex flex-col bg-white">
        
        <div className="h-24 min-h-[6rem] w-full border-b border-zinc-200 flex items-center justify-between px-8 md:px-12 bg-white z-20 transition-colors duration-500">
          <div className="text-xs font-bold uppercase tracking-widest text-black">
            {headerData.description}
          </div>
          <div className="text-lg font-bold tracking-tighter text-black">
             {contentData[activeStep].year}
          </div>
        </div>


        <div className="flex-1 flex flex-col w-full h-full relative">
            {contentData.map((item, index) => {
                const isActive = index === activeStep;

                return (
                    <div
                        key={item.id}
                        className={`
                            flex-1
                            flex flex-col justify-center
                            w-full relative
                            border-b border-zinc-200 
                            px-8 md:px-8 py-6
                            transition-all duration-700 ease-out
                            ${isActive ? "opacity-100 bg-white" : "opacity-40 bg-zinc-50 hover:opacity-60"}
                        `}
                    >
                        {/* HEADER */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-6">
                                <span 
                                    className={`
                                        text-lg font-bold w-10 h-10 flex items-center justify-center
                                        transition-colors duration-500 rounded
                                        ${isActive ? "bg-zinc-600 text-white" : "bg-zinc-200 text-zinc-500"}
                                    `}
                                >
                                    {item.id}
                                </span>

                                <h2 
                                    className={`
                                        text-3xl lg:text-5xl font-medium tracking-tight 
                                        transition-colors duration-500
                                        ${isActive ? "text-black" : "text-zinc-600"}
                                    `}
                                >
                                    {item.title}
                                </h2>
                            </div>

                            <div 
                                className={`
                                    w-4 h-4 bg-black 
                                    transition-transform duration-500 rounded-full
                                    ${isActive ? "scale-100" : "scale-0 rotate-45"}
                                `}
                            />
                        </div>

                        {/* CONTENU */}
                        <div
                            ref={addToRefs}
                            className={`
                                mt-6
                                transition-all duration-700 ease-out
                                ${isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}
                            `}
                        >
                            <p className="text-zinc-500 text-2xl tracking-wide leading-relaxed max-w-xl">
                                {item.description}
                            </p>
                        </div>
                    </div>
                );
            })}
        </div>

      </div>


      <div className="fixed bottom-0 right-0 p-8 hidden md:block z-50 pointer-events-none">
         <div className="h-1 w-24 bg-zinc-200 rounded-full overflow-hidden">
            <div 
                className="h-full bg-black transition-all duration-300 ease-out"
                style={{ width: `${((activeStep + 1) / contentData.length) * 100}%` }}
            />
         </div>
      </div>

    </div>
  );
};

export default ScrollGallery;