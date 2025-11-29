import React, { useEffect, useRef, useState } from 'react';

let gsap;
let ScrollTrigger;
let SplitText;

try {
  // eslint-disable-next-line no-unused-vars
  gsap = window.gsap;
  ScrollTrigger = window.ScrollTrigger;
  SplitText = window.SplitText;
} catch (e) {
  console.error("GSAP or its plugins are not available globally.", e);
}


const useResponsiveState = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      setIsTablet(window.innerWidth <= 1024);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return { isMobile, isTablet };
};

const Hero2Section = () => {
  const { isMobile, isTablet } = useResponsiveState();
  const heroContainerRef = useRef(null);

  const mainBgColor = '#F9F1E5'; 
  const primaryTextColor = '#4A2A19'; 
  const accentBgColor = '#D1A36B'; 
  const accentTextColor = '#4A2A19'; 
  const buttonBgColor = '#F2C889'; 

  useEffect(() => {
    const g = window.gsap;
    const ST = window.ScrollTrigger;
    const STx = window.SplitText;


    if (!g) {
      console.error("GSAP is not globally available.");
      return;
    }

    if (ST) g.registerPlugin(ST);

    let titleSplit;
    if (STx) {
      titleSplit = new STx(".hero-title", {
        type: "chars",
      });
    } else {
      console.warn("SplitText not available, title animation disabled.");
    }


    const tl = g.timeline({
      delay: 0.5,
    });

    tl.to(".hero-content", {
      opacity: 1,
      y: 0,
      ease: "power1.inOut",
    })
      .to(
        ".hero-text-scroll",
        {
          duration: 1,
          clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
          ease: "circ.out",
        },
        "<"
      );

    if (titleSplit) {
      tl.from(
        titleSplit.chars,
        {
          yPercent: 100,
          stagger: 0.03,
          ease: "power2.out",
        },
        "-=0.7"
      );
    }

    let heroTl;
    if (ST && heroContainerRef.current) {
      heroTl = g.timeline({
        scrollTrigger: {
          trigger: heroContainerRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });

      heroTl.to(".hero-container-inner", {
        rotate: 0,
        scale: 0.95,
        yPercent: -10,
        ease: "power1.out",
      });
    }


    return () => {
      tl.kill();
      if (heroTl) heroTl.kill();
      if (titleSplit) titleSplit.revert();
      if (ST) ST.getAll().forEach(trigger => trigger.kill());
    };

  }, []);

  const CanPlaceholderLeft = () => (
    <div
      className="absolute z-10 w-40 h-80 md:w-56 md:h-[450px] top-1/2 -translate-y-1/2 left-[5%] transform -rotate-12 rounded-2xl shadow-xl bg-pink-300/80 border-4 border-pink-700 p-2 text-center text-sm font-bold flex flex-col justify-center"
      style={{ backgroundImage: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.1) 0, rgba(255,255,255,0.1) 20px, transparent 20px, transparent 40px)', color: primaryTextColor }}
    >
      <p>SPYLT</p>
      <p className="text-2xl mt-2">20G</p>
      <p className="text-xs">PROTEIN</p>
      <p className='mt-4 text-xs italic'>Placeholder Can Left</p>
    </div>
  );

  const CanPlaceholderRight = () => (
    <div
      className="absolute z-10 w-40 h-80 md:w-56 md:h-[450px] top-1/2 -translate-y-1/2 right-[5%] transform rotate-12 rounded-2xl shadow-xl bg-amber-300/80 border-4 border-amber-700 p-2 text-center text-sm font-bold flex flex-col justify-center"
      style={{ backgroundImage: 'repeating-linear-gradient(-45deg, rgba(255,255,255,0.1) 0, rgba(255,255,255,0.1) 20px, transparent 20px, transparent 40px)', color: primaryTextColor }}
    >
      <p>SPYLT</p>
      <p className="text-2xl mt-2">20G</p>
      <p className="text-xs">PROTEIN</p>
      <p className='mt-4 text-xs italic'>Placeholder Can Right</p>
    </div>
  );


  return (
    <section className="min-h-screen pt-20 md:pt-24 lg:pt-32 pb-16 relative overflow-hidden" style={{ backgroundColor: mainBgColor }}>
      <div ref={heroContainerRef} className="hero-container h-[90vh] md:h-[80vh] flex items-center justify-center relative">
        <div className="hero-container-inner w-full h-full absolute inset-0 flex items-center justify-center">

          {isTablet ? (
            <>
              <CanPlaceholderLeft />
              <CanPlaceholderRight />
            </>
          ) : (
            <video
              src="/video/coffee-5.mp4"
              autoPlay
              muted
              playsInline
              loop
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}


          <div
            className="hero-content opacity-0 z-20 text-center max-w-4xl px-4"
            style={{ transform: 'translateY(50px)' }} 
          >
            <div className="overflow-hidden mb-6">
              <h1
                className="hero-title text-5xl md:text-7xl lg:text-8xl xl:text-[7rem] font-extrabold uppercase leading-tight tracking-tighter"
                style={{ color: primaryTextColor }}
              >
                Freaking Delicious
              </h1>
            </div>

            <div className="flex justify-center my-6 md:my-8">
              <div
                style={{
                  clipPath: "polygon(50% 0, 50% 0, 50% 100%, 50% 100%)",
                  backgroundColor: accentBgColor,
                  transform: "rotate(-2deg)", 
                  padding: isMobile ? '1rem 1.5rem' : '1.5rem 2rem',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
                }}
                className="hero-text-scroll inline-block rounded-lg"
              >
                <div className="hero-subtitle">
                  <h1
                    className="text-3xl md:text-5xl lg:text-6xl font-extrabold uppercase whitespace-nowrap"
                    style={{ color: accentTextColor }}
                  >
                    Protein + Caffine
                  </h1>
                </div>
              </div>
            </div>

            <h2 className="text-lg md:text-xl max-w-lg mx-auto mt-6 mb-10 font-medium" style={{ color: primaryTextColor }}>
              Live life to the fullest with SPYLT: Shatter boredom and embrace
              your inner kid with every deliciously smooth chug.
            </h2>

            <div className="hero-button">
              <button
                className="py-3 px-8 text-lg font-bold uppercase rounded-full shadow-lg transition transform hover:scale-105"
                style={{ backgroundColor: buttonBgColor, color: primaryTextColor }}
              >
                Chug a SPYLT
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero2Section;