import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MoveRight } from "lucide-react"; // Import manquant ajouté

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

    // --- LOGIQUE ADAPTATIVE : Utilisation de MatchMedia pour désactiver GSAP sur mobile ---
    useEffect(() => {
        let mm = gsap.matchMedia();

        mm.add("(min-width: 768px)", () => {
            
            const ctx = gsap.context(() => {

                ScrollTrigger.create({
                    trigger: containerRef.current,
                    start: "top top",
                    pin: true, 
                    scrub: 1,
                    end: "+=" + contentData.length * 50,
                    
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
        });

        return () => mm.revert(); 
    }, []);


    useEffect(() => {
        // Animation de texte uniquement si GSAP est actif (>= 768px)
        if (window.innerWidth >= 768) {
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
        }
    }, [activeStep]);

    return (
        <div
            ref={containerRef}
            // Utiliser h-screen seulement sur desktop et h-auto sur mobile
            className="w-full bg-white text-zinc-900 overflow-x-hidden font-sans selection:bg-black selection:text-white flex flex-col md:h-screen md:flex-row"
        >
            
            {/* =========================================
                COLONNE GAUCHE (VISUEL) - Peu de changement
            ========================================= */}
            <div 
                ref={visualWrapperRef}
                className="relative w-full h-[60vh] md:w-1/2 md:h-full flex flex-col justify-between p-4 md:p-8 border-r md:border-zinc-200/0 md:border-zinc-200"
            >
                
                {/* Navigation Gauche */}
                <div className="flex items-center gap-2 text-xs font-bold tracking-widest z-10">
                    <span className="w-2 h-2 bg-black rounded-full"></span> 1
                    <span className="ml-4 text-base md:text-lg">{headerData.title}</span>
                </div>
                
                {/* Zone Visuelle 3D (Taille des éléments ajustée pour desktop/mobile) */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="absolute top-[20%] right-4 md:right-10 bg-black text-white w-7 h-7 md:w-8 md:h-8 flex items-center justify-center text-xs font-bold rounded animate-bounce-slow z-30">
                        {activeStep + 1}
                    </div>

                    <div ref={visualRef} className="relative w-[250px] h-[250px] md:w-[450px] md:h-[450px] flex items-center justify-center">
                        {Array.from({ length: 18 }).map((_, i) => {
                        const angle = i * 15 + 40;
                        const radius = window.innerWidth >= 768 ? 160 : 100;
                        const x = Math.cos((angle * Math.PI) / 180) * radius;
                        const y = Math.sin((angle * Math.PI) / 180) * radius;
                        const isActive = i > 5 && i < 12;

                        return (
                            <div
                            key={i}
                            className="visual-dot absolute rounded-full shadow-sm transition-all duration-500"
                            style={{
                                width: isActive ? "25px" : "15px", 
                                height: isActive ? "25px" : "15px",
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
                    <div className="absolute w-[400px] h-[400px] md:w-[600px] md:h-[600px] bg-zinc-100 rounded-full blur-3xl -z-10 pointer-events-none" />
                </div>

                {/* Trait Vertical de Progression (UNIQUEMENT POUR TABLETTE/DESKTOP) */}
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

            {/* =========================================
                COLONNE DROITE (CONTENU) - MODIFIÉE
            ========================================= */}
            <div className="w-full md:w-1/2 md:h-full flex flex-col bg-white">
                
                {/* HEADER DROIT */}
                <div className="h-20 min-h-[5rem] md:h-20 md:min-h-[5rem] w-full border-b border-zinc-200 flex items-center justify-between px-4 md:px-8 bg-white z-20 transition-colors duration-500">
                    <div className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-black">
                        {headerData.description}
                    </div>
                    <div className="text-base md:text-lg font-bold tracking-tighter text-black">
                        {contentData[activeStep].year}
                    </div>
                </div>


                {/* LISTE D'ÉTAPES - Répartition de l'espace assurée par flex-grow */}
                <div className="flex-1 flex flex-col w-full relative">
                    {contentData.map((item, index) => {
                        // Logique adaptée pour opacité sur mobile/desktop
                        const isActive = window.innerWidth >= 768 ? activeStep === index : false;
                        const isOpacified = window.innerWidth >= 768 ? isActive : true;


                        return (
                            <div
                                key={item.id}
                                className={`
                                    min-h-[300px] md:min-h-0 md:flex-grow // <-- flex-grow permet la répartition égale
                                    flex flex-col justify-center
                                    w-full relative
                                    border-b border-zinc-200 
                                    // 💡 PADDINGS RÉDUITS : p-4/py-4 sur mobile, md:px-8/md:py-4 sur desktop
                                    px-4 md:px-8 py-4
                                    transition-all duration-700 ease-out
                                    ${isOpacified ? "opacity-100 bg-white" : "opacity-40 bg-zinc-50 hover:opacity-60"}
                                `}
                            >
                                {/* HEADER */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4 md:gap-4">
                                        <span 
                                            className={`
                                                text-sm md:text-base font-bold w-8 h-8 md:w-8 md:h-8 flex items-center justify-center
                                                transition-colors duration-500 rounded
                                                ${isOpacified ? "bg-zinc-600 text-white" : "bg-zinc-200 text-zinc-500"}
                                            `}
                                        >
                                            {item.id}
                                        </span>

                                        <h2 
                                            className={`
                                                // 💡 TAILLE DU TITRE RÉDUITE : text-xl sur mobile, text-2xl/text-3xl sur desktop
                                                text-xl md:text-2xl lg:text-3xl font-medium tracking-tight 
                                                transition-colors duration-500
                                                ${isOpacified ? "text-black" : "text-zinc-600"}
                                            `}
                                        >
                                            {item.title}
                                        </h2>
                                    </div>

                                    <div 
                                        className={`
                                            w-2 h-2 md:w-3 md:h-3 bg-black 
                                            transition-transform duration-500 rounded-full
                                            ${isActive ? "scale-100" : "scale-0 rotate-45"}
                                        `}
                                    />
                                </div>

                                {/* CONTENU */}
                                <div
                                    ref={addToRefs}
                                    className={`
                                        // 💡 MARGE RÉDUITE : mt-3 sur mobile/desktop
                                        mt-3
                                        transition-all duration-700 ease-out
                                        ${isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}
                                    `}
                                >
                                    <p className="text-zinc-500 text-sm md:text-base tracking-wide leading-relaxed max-w-xl">
                                        {item.description}
                                    </p>
                                    <button className="mt-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest hover:gap-3 transition-all duration-300">
                                        <span className="border-b border-black pb-0.5">Explore Data</span>
                                        <MoveRight size={14} />
                                    </button>
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