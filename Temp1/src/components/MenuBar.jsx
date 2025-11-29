import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, ArrowRight, ArrowUpRight } from 'lucide-react';
import { gsap } from 'gsap';

const VIDEOS = [
  "/video/coffee-1.mp4",
  "/video/coffee-2.mp4",
  "/video/coffee-3.mp4",
  "/video/coffee-4.mp4",
];

const menuItems = [
  { label: "Index", sub: "01", video: VIDEOS[0] },
  { label: "Work", sub: "02", video: VIDEOS[1] },
  { label: "Studio", sub: "03", video: VIDEOS[2] },
  { label: "Connect", sub: "04", video: VIDEOS[3] },
];

export default function MenuBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const containerRef = useRef(null);
  const overlayRef = useRef(null);
  const linksRef = useRef([]);
  const footerRef = useRef(null);
  const tl = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set(overlayRef.current, {
        clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
      });
      gsap.set(linksRef.current, { y: "120%" });
      gsap.set(footerRef.current, { opacity: 0, y: 40 });

      tl.current = gsap.timeline({ paused: true })
        .to(overlayRef.current, {
          clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
          duration: 1.4,
          ease: "power4.inOut",
        })
        .to(linksRef.current, {
          y: 0,
          duration: 1.1,
          stagger: 0.08,
          ease: "power4.out",
        }, "-=1")
        .to(footerRef.current, {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: "power3.out",
        }, "-=0.8");
    }, containerRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    tl.current && (isMenuOpen ? tl.current.play() : tl.current.reverse());
  }, [isMenuOpen]);

  const addLinkRef = (el) => {
    if (el && !linksRef.current.includes(el)) {
      linksRef.current.push(el);
    }
  };

  return (
    <div ref={containerRef} className="relative min-h-screen bg-gray-50 text-neutral-900 font-sans overflow-x-hidden">

      <header className="fixed top-0 left-0 w-full p-6 md:p-10 flex justify-between items-center z-50 mix-blend-exclusion text-white">
        <div className="text-xl font-bold tracking-tighter flex items-center gap-3">
          <div className="w-3 h-3 bg-white rounded-full"></div>
          FURROW
        </div>
        <button
          onClick={() => setIsMenuOpen(v => !v)}
          className="group flex items-center gap-4 text-sm uppercase tracking-widest"
        >
          <span className="hidden md:block group-hover:opacity-70 transition">
            {isMenuOpen ? 'Close' : 'Menu'}
          </span>
          <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm group-hover:bg-white/20 transition">
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </div>
        </button>
      </header>

      <div
        ref={overlayRef}
        className="fixed inset-0 z-40 flex"
        style={{ pointerEvents: isMenuOpen ? "all" : "none" }}
      >
        <div className="w-full lg:w-1/2 bg-black flex flex-col justify-between p-10 md:p-16 text-white">
          <div className="flex-1 flex flex-col justify-center">
            <nav className="space-y-6">
              {menuItems.map((item, i) => (
                <div
                  key={i}
                  className="overflow-hidden cursor-pointer group"
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  <div
                    ref={addLinkRef}
                    className="flex items-baseline gap-10"
                  >
                    <span className="text-lg font-mono text-gray-500 group-hover:text-white transition">
                      {item.sub}
                    </span>
                    <h2 className={`text-8xl md:text-9xl lg:text-[11rem] font-black uppercase leading-none transition-all duration-500 ${hoveredIndex !== null && hoveredIndex !== i
                        ? "opacity-20 blur-sm"
                        : "opacity-100 blur-0"
                      }`}>
                      {item.label}
                    </h2>
                  </div>
                </div>
              ))}
            </nav>
          </div>

          <div ref={footerRef} className="border-t border-white/20 pt-10 text-sm uppercase tracking-widest opacity-0">
            <div className="flex flex-col md:flex-row justify-between gap-8">
              <div className="flex gap-10 text-gray-400">
                <a href="#" className="hover:text-white transition">Instagram</a>
                <a href="#" className="hover:text-white transition">LinkedIn</a>
                <a href="#" className="hover:text-white transition">Twitter</a>
              </div>
              <div className="text-gray-500">
                Based in Montreal<br />
                <span className="text-white">hello@furrow.studio</span>
              </div>
            </div>
          </div>
        </div>

        <div className="hidden lg:block w-1/2 relative overflow-hidden bg-black">
          {menuItems.map((item, i) => (
            <video
              key={i}
              src={item.video}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${hoveredIndex === i ? "opacity-100" : "opacity-0"
                }`}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-transparent pointer-events-none" />
        </div>
      </div>

      <main className="pt-32 px-6 md:px-10 max-w-7xl mx-auto z-0">
        <h1 className="text-6xl md:text-9xl font-black mb-12 tracking-tighter leading-[0.85]">
          DIGITAL<br />
          EXPERIENCE<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">DESIGNER</span>
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">
          <div className="text-lg md:text-xl leading-relaxed opacity-80">
            <p>
              Une réinterprétation moderne de la navigation classique des agences Awwwards.
              L'animation utilise React pour la structure et GSAP pour la performance fluide à 60fps.
              Notez l'effet de "rideau" (Clip-path) et le décalage (Stagger) des textes.
            </p>
          </div>
          <div className="flex flex-col gap-6">
            <div className="h-64 w-full bg-gray-300 rounded-lg overflow-hidden relative group cursor-pointer">
              <img
                src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop"
                alt="Abstract Art"
                className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <ArrowUpRight className="text-white w-12 h-12" />
              </div>
            </div>
          </div>
        </div>

        <section className="border-t border-black/10 pt-10">
          <div className="flex justify-between items-center text-xs uppercase tracking-widest opacity-50">
            <span>Scroll Down</span>
            <span>( 2024 - 2025 )</span>
          </div>
        </section>
      </main>

      {/* Background Decor */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-tr from-purple-300/30 to-blue-300/30 rounded-full blur-3xl -z-10 pointer-events-none"></div>

    </div>
  );
}