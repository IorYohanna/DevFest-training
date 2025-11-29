import React, { useRef, useLayoutEffect } from 'react';

export default function ParallaxCarousel() {
    const leftColRef = useRef(null);
    const rightColRef = useRef(null);
    const thirdColRef = useRef(null);

    useLayoutEffect(() => {
        const loadGSAP = () => {
            if (window.gsap) {
                initAnimations();
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js';
            script.onload = () => initAnimations();
            document.head.appendChild(script);
        };

        const initAnimations = () => {
            const gsap = window.gsap;
            if (!leftColRef.current || !rightColRef.current || !thirdColRef.current) return;

            // Colonne gauche monte (de 0 à -50%, puis reset à 0)
            gsap.fromTo(leftColRef.current,
                { yPercent: 0 },
                {
                    yPercent: -50,
                    ease: 'none',
                    duration: 40,
                    repeat: -1,
                }
            );

            // Colonne droite descend (de -50% à 0, puis reset à -50%)
            gsap.fromTo(rightColRef.current,
                { yPercent: -50 },
                {
                    yPercent: 0,
                    ease: 'none',
                    duration: 40,
                    repeat: -1,
                }
            );

            gsap.fromTo(thirdColRef.current,
                { yPercent: 0 },
                {
                    yPercent: -50,
                    ease: 'none',
                    duration: 40,
                    repeat: -1,
                }
            );
        };

        loadGSAP();
    }, []);

    const projects = [
        { id: 1, title: 'AETHER', src: '/img/gallery-1.webp', category: 'Direction Artistique' },
        { id: 2, title: 'ECLIPSE', src: '/img/gallery-2.webp', category: 'Web Design' },
        { id: 3, title: 'OBLIVION', src: '/img/gallery-3.webp', category: 'Branding' },
        { id: 4, title: 'NEBULA', src: '/img/gallery-4.webp', category: 'Développement' },
        { id: 5, title: 'VORTEX', src: '/img/gallery-5.webp', category: '3D Motion' },
        { id: 6, title: 'HORIZON', src: '/img/swordman.webp', category: 'Photography' },
    ];

    const ProjectCard = ({ project }) => (
        <div className="project-card relative w-full will-change-transform">
            <div className="image-wrapper w-full h-[65vh] overflow-hidden relative rounded-sm">
                <img src={project.src} alt={project.title} className="project-image w-full h-full object-cover transition duration-500 ease-in-out hover:scale-[1.05]" />
            </div>
            <div className="project-info mt-6 flex justify-between items-start border-b border-gray-700 pb-4">
                <span className="project-cat text-sm uppercase tracking-wider text-gray-400">{project.category}</span>
                <h3 className="project-title font-sans text-xl font-normal m-0 uppercase">{project.title}</h3>
            </div>
        </div>
    );

    return (
        <div className="app-container min-h-screen bg-gray-950 text-white font-sans">
            <section className="gallery-section relative z-5 px-[5vw] h-[120vh] overflow-hidden">
                <div className="gallery-wrapper flex justify-center gap-[6vw] w-full max-w-[1600px] mx-auto pt-[10vh] h-full">

                    <div className="column column-left w-[40%] flex flex-col gap-[15vh] will-change-transform" ref={leftColRef}>
                        {[...projects.slice(0, 3), ...projects.slice(0, 3), ...projects.slice(0, 3), ...projects.slice(0, 3)].map((p, i) => <ProjectCard key={`left-${p.id}-${i}`} project={p} />)}
                    </div>

                    <div className="column column-center w-[40%] flex flex-col gap-[15vh] will-change-transform mt-[20vh]" ref={rightColRef}>
                        {[...projects.slice(3, 6), ...projects.slice(3, 6), ...projects.slice(3, 6), ...projects.slice(3, 6)].map((p, i) => <ProjectCard key={`center-${p.id}-${i}`} project={p} />)}
                    </div>

                    <div className="column column-right w-[40%] flex flex-col gap-[15vh] will-change-transform" ref={thirdColRef}>
                        {[...projects.slice(0, 3), ...projects.slice(0, 3), ...projects.slice(0, 3), ...projects.slice(0, 3)].map((p, i) => <ProjectCard key={`right-${p.id}-${i}`} project={p} />)}
                    </div>
                </div>
            </section>

            <style>{`
        .column { height: fit-content; }
        @media (max-width: 768px) {
          .gallery-section { height: auto; overflow: visible; }
          .gallery-wrapper { flex-direction: column; gap: 5vh; padding-top: 5vh; height: auto; }
          .column { width: 100%; margin-top: 0 !important; gap: 5vh; transform: none !important; }
          .image-wrapper { height: 50vh; }
        }
      `}</style>
        </div>
    );
}