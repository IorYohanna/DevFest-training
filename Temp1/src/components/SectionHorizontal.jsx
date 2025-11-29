import React, { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Données des sections
const SECTIONS = [
  {
    id: 1,
    title: "Le Café Noir",
    subtitle: "ÉNERGIE BRUTE",
    description: "Une torréfaction sombre pour les âmes éveillées.",
    bg: "bg-[#1a1a1a]",
    accent: "text-[#C69C6D]",
    image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80&w=1000"
  },
  {
    id: 2,
    title: "Matcha Zen",
    subtitle: "HARMONIE PURE",
    description: "L'équilibre parfait entre la terre et l'esprit.",
    bg: "bg-[#2D3A28]",
    accent: "text-[#B7D1A5]",
    image: "https://images.unsplash.com/photo-1582793988951-9aed5509eb97?auto=format&fit=crop&q=80&w=1000"
  },
  {
    id: 3,
    title: "Cacao Sacré",
    subtitle: "DOUCEUR ÉPICÉE",
    description: "Une caresse veloutée aux notes de cannelle.",
    bg: "bg-[#3E2723]",
    accent: "text-[#FFAB91]",
    image: "https://images.unsplash.com/photo-1540337706094-da10342abe55?auto=format&fit=crop&q=80&w=1000"
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
            
            <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-overlay">
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

                <h2 className="text-7xl md:text-9xl font-black text-white leading-[0.9] overflow-hidden">
                  <div className={`title-${index} flex flex-wrap perspective-text`}>
                    {splitText(section.title)}
                  </div>
                </h2>

                <p className={`desc-${index} text-gray-400 text-xl max-w-md mt-8 border-l-2 border-white/20 pl-6`}>
                  {section.description}
                </p>
                
                <button className={`button-${index} mt-8 px-8 py-3 border border-white/30 rounded-full text-white uppercase text-xs tracking-widest hover:bg-white hover:text-black transition-all duration-300`}>
                  Découvrir
                </button>
              </div>

              <div className="hidden md:flex justify-center items-center">
                <div className={`w-[400px] h-[500px] rounded-full border border-white/10 backdrop-blur-sm relative overflow-hidden img-wrapper-${index}`}>
                   <img 
                     src={section.image} 
                     alt="" 
                     className={`img-${index} w-full h-full object-cover`} 
                   />
                </div>
              </div>

            </div>

            <div className="absolute -bottom-20 -right-20 text-[20rem] font-bold text-white opacity-5 select-none pointer-events-none">
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