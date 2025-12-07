import React, { useState, useEffect, useRef } from 'react';
import { Menu, X } from 'lucide-react';
import { gsap } from 'gsap';
import { Link } from 'react-router-dom';

const VIDEOS = [
  "/video/vid6.mp4",
  "/video/vid7.mp4",
  "/video/vid8.mp4",
  "/video/vid9.mp4",
];

const menuItems = [
  { label: "Acceuil", sub: "01", video: VIDEOS[3], link: "/" },
  { label: "Auditeur", sub: "02", video: VIDEOS[1], link: "/audit" },
  { label: "Toxicite", sub: "03", video: VIDEOS[3], link: "/detoxify" },
  { label: "Hallucinations", sub: "04", video: VIDEOS[0], link: "/hallucination" },

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
    <div ref={containerRef} className="relative h-full bg-gray-50 text-neutral-900 font-sans overflow-x-hidden">

      {/* Header */}
      <header className="fixed top-0 left-0 w-full p-6 md:p-10 flex justify-between items-center z-50 mix-blend-exclusion text-white">
        <div className="text-xl tracking-tighter flex items-center gap-3">
          {/* Logo ici si besoin */}
        </div>
        <button
          onClick={() => setIsMenuOpen(v => !v)}
          className="group mr-[8%] -mt-[20px] flex items-center gap-4 text-sm uppercase tracking-widest"
        >
          <span className="hidden md:block group-hover:opacity-70 transition">
            {isMenuOpen ? 'Close' : 'Menu'}
          </span>
          <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm group-hover:bg-white/20 transition">
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </div>
        </button>
      </header>

      {/* Overlay Menu */}
      <div
        ref={overlayRef}
        className="fixed inset-0 z-40 flex pointer-events-none"
        style={{ pointerEvents: isMenuOpen ? "all" : "none" }}
      >
        {/* Left Side */}
        <div className="w-full lg:w-1/2 bg-black flex flex-col justify-between p-10 md:p-16 text-white relative z-20">
          <div className="flex-1 flex flex-col justify-center relative z-10">
            <nav className="space-y-6">
              {menuItems.map((item, i) => (
                <Link
                  key={i}
                  to={item.link ? item.link : "#"}
                  className="block overflow-hidden"
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  onClick={() => setIsMenuOpen(false)} // ← Ferme le menu après clic
                  ref={addLinkRef}
                >
                  <div className="flex items-baseline gap-10 cursor-pointer">
                    <span className="text-lg font-mono text-gray-500 group-hover:text-white transition">
                      {item.sub}
                    </span>
                    <h2 className={`text-7xl font-black font-transformers uppercase leading-none transition-all duration-500 ${hoveredIndex !== null && hoveredIndex !== i ? "opacity-20 blur-sm" : "opacity-100 blur-0"}`}>
                      {item.label}
                    </h2>
                  </div>
                </Link>
              ))}

            </nav>
          </div>

          {/* Footer */}
          <div ref={footerRef} className="border-t border-white/20 pt-10 text-sm uppercase tracking-widest opacity-0">
            <div className="flex flex-col md:flex-row justify-between gap-8">
              <div className="flex gap-10 text-gray-400">
                <a href="#" className="hover:text-white transition">Instagram</a>
                <a href="#" className="hover:text-white transition">LinkedIn</a>
                <a href="#" className="hover:text-white transition">Twitter</a>
              </div>
              <div className="text-gray-500">
                Based in Madagascar<br />
                <span className="text-white">hello@outsiders.studio</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Videos */}
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
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${hoveredIndex === i ? "opacity-100" : "opacity-0"}`}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-transparent pointer-events-none" />
        </div>
      </div>
    </div>
  );
}
