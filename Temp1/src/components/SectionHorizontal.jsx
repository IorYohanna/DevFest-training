import React, { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Données des sections mises à jour basées sur le PDF AlgoMada
const SECTIONS = [
  {
    id: 1,
    title: "L'Ère de l'IA",
    subtitle: "CONTEXTE GLOBAL",
    description: "L'IA est partout. Puissante mais imparfaite, son adoption est sans précédent. Elle ne reviendra pas en arrière et redéfinit notre navigation dans le monde numérique.",
    bg: "bg-[#0B1120]", // Bleu nuit très sombre
    accent: "text-[#38BDF8]", // Bleu Cyan électrique
    // Image : Réseau de neurones abstrait / Connexions
    image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80&w=1000"
  },
  {
    id: 2,
    title: "Notre Mission",
    subtitle: "SAFE AI FOR MANKIND",
    description: "Face aux 'bad actors', c'est à nous, experts tech, de guider cette puissance. Orientez l'IA vers une direction RESPONSABLE et SÛRE pour le bien de l'humanité.",
    bg: "bg-[#064E3B]", // Vert sombre (Matrice/Sécurité)
    accent: "text-[#34D399]", // Vert émeraude néon
    // Image : Main humaine vs Technologie / Protection
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=1000"
  },
  {
    id: 3,
    title: "Le Challenge",
    subtitle: "INGÉNIERIE LOGICIELLE",
    description: "Identifiez un risque. Codez une solution. Critères : Originalité, Criticité, Efficacité, UX et Extensibilité. Prouvez que le code peut résoudre les problèmes de l'IA.",
    bg: "bg-[#312E81]", // Violet/Indigo profond
    accent: "text-[#A78BFA]", // Violet clair lumineux
    // Image : Code / Développement / Futur
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=1000"
  }
];

function SectionHorizontal() {
  const componentRef = useRef(null);
  const sliderRef = useRef(null);

  useLayoutEffect(() => {
    let ctx = gsap.context(() => {
      
      if (!componentRef.current || !sliderRef.current) return;

      // Distance réelle à parcourir
      const travel = sliderRef.current.scrollWidth - componentRef.current.offsetWidth;

      // Scroll horizontal propre
      let scrollTween = gsap.to(sliderRef.current, {
        x: -travel,
        ease: "none",
        scrollTrigger: {
          trigger: componentRef.current,
          pin: true,
          scrub: 1,
          end: () => "+=" + (travel + componentRef.current.offsetWidth)
        }
      });

      // Animations internes
      SECTIONS.forEach((section, index) => {
        
        // ✅ Animation du texte - déclenche à 50% (center)
        gsap.fromTo(`.title-${index} .char`, 
          { 
            y: 100, 
            opacity: 0, 
            rotateX: -90 
          },
          {
            y: 0,
            opacity: 1,
            rotateX: 0,
            stagger: 0.05,
            duration: 0.8,
            ease: "power4.out",
            scrollTrigger: {
              trigger: `.section-${index}`,
              containerAnimation: scrollTween,
              start: "left center",  // 50% de la section visible
              end: "center center",  // Fin au centre
              scrub: 1,
              toggleActions: "play reverse play reverse"
            }
          }
        );

        // Animation du sous-titre
        gsap.fromTo(`.subtitle-${index}`,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            scrollTrigger: {
              trigger: `.section-${index}`,
              containerAnimation: scrollTween,
              start: "left center",
              end: "center center",
              scrub: 1,
              toggleActions: "play reverse play reverse"
            }
          }
        );

        // Animation de la description
        gsap.fromTo(`.desc-${index}`,
          { opacity: 0, x: -30 },
          {
            opacity: 1,
            x: 0,
            duration: 0.8,
            scrollTrigger: {
              trigger: `.section-${index}`,
              containerAnimation: scrollTween,
              start: "left center",
              end: "center center",
              scrub: 1,
              toggleActions: "play reverse play reverse"
            }
          }
        );

        // Animation du bouton
        gsap.fromTo(`.button-${index}`,
          { opacity: 0, scale: 0.8 },
          {
            opacity: 1,
            scale: 1,
            duration: 0.6,
            scrollTrigger: {
              trigger: `.section-${index}`,
              containerAnimation: scrollTween,
              start: "left center",
              end: "center center",
              scrub: 1,
              toggleActions: "play reverse play reverse"
            }
          }
        );

        // Animation d'image (parallax)
        gsap.fromTo(`.img-${index}`,
          { scale: 1.6, xPercent: -20 },
          { 
            scale: 1, 
            xPercent: 0,
            ease: "none",
            scrollTrigger: {
              trigger: `.section-${index}`,
              containerAnimation: scrollTween,
              start: "left right",
              end: "right left",
              scrub: true
            }
          }
        );
      });

      ScrollTrigger.refresh();

    }, componentRef);

    return () => ctx.revert();
  }, []);

  // SplitText maison
  const splitText = (text) => {
    return text.split("").map((char, i) => (
      <span key={i} className="char inline-block whitespace-pre transform-style-3d">
        {char}
      </span>
    ));
  };

  return (
    <div ref={componentRef} className="overscroll-none h-screen w-full overflow-hidden bg-black">
      <div ref={sliderRef} className="flex h-full w-[300vw]">
        
        {SECTIONS.map((section, index) => (
          <div 
            key={section.id} 
            className={`section-${index} relative h-screen w-screen flex items-center justify-center ${section.bg} overflow-hidden`}
          >
            
            {/* Image de fond (Overlay) légèrement moins opaque pour le thème sombre */}
            <div className="absolute inset-0 opacity-30 pointer-events-none mix-blend-overlay">
               <img 
                 src={section.image} 
                 alt={section.title} 
                 className={`img-${index} w-full h-full object-cover grayscale`} 
               />
            </div>

            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 w-full max-w-7xl px-8 items-center">
              
              <div className="space-y-6">
                <div className={`subtitle-${index} text-sm font-bold tracking-[0.3em] uppercase ${section.accent} mb-4`}>
                  {section.subtitle}
                </div>

                <h2 className="text-7xl font-black text-white leading-[0.9] overflow-hidden">
                  <div className={`title-${index} flex flex-wrap perspective-text`}>
                    {splitText(section.title)}
                  </div>
                </h2>

                <p className={`desc-${index} text-gray-300 text-xl max-w-md mt-8 border-l-2 border-white/20 pl-6`}>
                  {section.description}
                </p>
                
                <button className={`button-${index} mt-8 px-8 py-3 border border-white/30 rounded-full text-white uppercase text-xs tracking-widest hover:bg-white hover:text-black transition-all duration-300`}>
                  En savoir plus
                </button>
              </div>

              <div className="hidden md:flex justify-center items-center">
                {/* Cadre de l'image plus "Tech" (carré arrondi ou cercle selon préférence, ici cercle gardé mais avec bordure brillante) */}
                <div className={`w-[400px] h-[500px] rounded-[2rem] border border-white/10 backdrop-blur-sm relative overflow-hidden img-wrapper-${index} shadow-2xl shadow-black/50`}>
                   <img 
                     src={section.image} 
                     alt="" 
                     className={`img-${index} w-full h-full object-cover`} 
                   />
                   {/* Overlay de scan line pour l'effet tech */}
                   <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent opacity-50 pointer-events-none"></div>
                </div>
              </div>

            </div>

            <div className="absolute -bottom-20 -right-20 text-[20rem] font-bold text-white opacity-5 select-none pointer-events-none font-mono">
              0{index + 1}
            </div>

          </div>
        ))}
      </div>
      
      <style>{`
        .transform-style-3d {
          transform-style: preserve-3d;
          backface-visibility: hidden;
        }
        .perspective-text {
          perspective: 1000px;
        }
      `}</style>
    </div>
  )
}

export default SectionHorizontal;