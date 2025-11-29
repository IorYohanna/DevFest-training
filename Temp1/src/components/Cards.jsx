import React, { useEffect, useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MoveRight, ArrowRight, Asterisk, Plus, Menu } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

// --- Data ---
const projects = [
    { id: 1, title: "AETHER", category: "Interactive", year: "2024", img: "https://images.unsplash.com/photo-1492571350019-22de08371fd3?q=80&w=2553&auto=format&fit=crop" },
    { id: 2, title: "ONYXIA", category: "WebGL Exp", year: "2023", img: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop" },
    { id: 3, title: "VORTEX", category: "Branding", year: "2023", img: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=2574&auto=format&fit=crop" },
    { id: 4, title: "LUMEN", category: "Development", year: "2024", img: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2670&auto=format&fit=crop" },
    { id: 5, title: "SYNTH", category: "Art Direction", year: "2022", img: "https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?q=80&w=2670&auto=format&fit=crop" },
    { id: 6, title: "ECHO", category: "Product", year: "2024", img: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2670&auto=format&fit=crop" },
];

const Card = ({ project, index }) => {
    return (
        <div className="card-wrapper flex-shrink-0 w-[80vw] md:w-[30vw] lg:w-[22vw] px-6 md:px-12" style={{ perspective: '1000px' }}>
            <div className="card-item relative group w-full aspect-[3/4] bg-zinc-900 overflow-hidden cursor-pointer rounded-lg shadow-2xl">

                {/* Image Container */}
                <div className="w-full h-full overflow-hidden relative">
                    <img
                        src={project.img}
                        alt={project.title}
                        className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500"></div>
                </div>

                {/* Content Overlay */}
                <div className="absolute inset-0 p-6 flex flex-col justify-between">
                    <div className="flex justify-between items-start opacity-0 group-hover:opacity-100 transition-all duration-500 -translate-y-4 group-hover:translate-y-0">
                        <span className="text-[10px] font-mono border border-white/20 px-2 py-1 rounded-full backdrop-blur-md bg-black/10">0{index + 1}</span>
                        <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center">
                            <ArrowRight className="w-4 h-4 -rotate-45" strokeWidth={1.5} />
                        </div>
                    </div>

                    <div>
                        <h3 className="text-3xl md:text-5xl font-medium tracking-tighter text-white translate-y-4 opacity-80 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
                            {project.title}
                        </h3>
                        <div className="flex items-center gap-4 mt-2 overflow-hidden h-6">
                            <span className="text-xs uppercase tracking-widest text-zinc-300 translate-y-6 group-hover:translate-y-0 transition-transform duration-500 delay-75">{project.category}</span>
                            <span className="text-xs font-mono text-zinc-500 translate-y-6 group-hover:translate-y-0 transition-transform duration-500 delay-100">— {project.year}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const WorkGallery = () => {
    const sectionRef = useRef(null);
    const triggerRef = useRef(null);
    const containerRef = useRef(null);
    const progressRef = useRef(null);

    useLayoutEffect(() => {
        const container = containerRef.current;
        const cards = gsap.utils.toArray('.card-item');

        // Calculate total width needed
        const totalWidth = container.scrollWidth;
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        // Calculate scroll distance to fill entire page
        const scrollDistance = totalWidth * 2.5;

        // 1. Oblique Scroll Animation (diagonal movement)
        const scrollTween = gsap.to(container, {
            x: () => -(totalWidth - viewportWidth) * 0.7, // Horizontal component
            y: () => (totalWidth - viewportWidth) * 0.3, // Vertical component for diagonal
            ease: "none",
            scrollTrigger: {
                trigger: triggerRef.current,
                pin: true,
                scrub: 1,
                end: () => "+=" + scrollDistance,
                invalidateOnRefresh: true,
            }
        });

        // 2. 3D Elliptical Path Animation (Top-Right to Bottom-Left)
        cards.forEach((card, index) => {
            const cardWrapper = card.parentElement;

            ScrollTrigger.create({
                trigger: triggerRef.current,
                start: "top top",
                end: () => "+=" + scrollDistance,
                scrub: 1,
                onUpdate: (self) => {
                    const progress = self.progress;
                    const cardProgress = (progress * cards.length - index) / 1.5;
                    const normalizedProgress = Math.max(0, Math.min(1, cardProgress));

                    // Elliptical path calculation (top-right to bottom-left)
                    const angle = normalizedProgress * Math.PI; // 0 to PI

                    // Horizontal ellipse movement (right to left)
                    const ellipseX = Math.cos(angle) * (viewportWidth * 0.15);

                    // Vertical ellipse movement (top to bottom)
                    const ellipseY = Math.sin(angle) * (viewportHeight * 0.25);

                    // 3D rotation following the ellipse path
                    const rotateX = (normalizedProgress - 0.5) * 30; // Tilt forward/backward
                    const rotateY = (1 - normalizedProgress) * 25; // Rotate on Y axis
                    const rotateZ = Math.sin(angle) * 15; // Follow ellipse curve

                    // Scale effect for depth
                    const scale = 0.8 + (Math.sin(angle) * 0.3);

                    // Apply transforms
                    gsap.set(cardWrapper, {
                        x: ellipseX,
                        y: ellipseY,
                        rotateX: rotateX,
                        rotateY: rotateY,
                        rotateZ: rotateZ,
                        scale: scale,
                        transformPerspective: 1000,
                        force3D: true
                    });
                }
            });
        });

        // 3. Velocity-based subtle effects
        let proxy = { skew: 0 };
        const skewSetter = gsap.quickSetter(cards, "skewX", "deg");

        ScrollTrigger.create({
            trigger: triggerRef.current,
            start: "top top",
            end: () => "+=" + scrollDistance,
            onUpdate: (self) => {
                const velocity = self.getVelocity();
                const targetSkew = velocity / -500;

                if (Math.abs(targetSkew) > Math.abs(proxy.skew) || Math.abs(velocity) < 10) {
                    gsap.to(proxy, {
                        skew: targetSkew,
                        duration: 0.6,
                        ease: "power3.out",
                        overwrite: true,
                        onUpdate: () => {
                            const clampedSkew = gsap.utils.clamp(-8, 8, proxy.skew);
                            skewSetter(clampedSkew);
                        }
                    });
                }
            }
        });

        // 4. Progress bar animation
        if (progressRef.current) {
            gsap.to(progressRef.current, {
                scaleX: 1,
                ease: "none",
                scrollTrigger: {
                    trigger: triggerRef.current,
                    scrub: 1,
                    start: "top top",
                    end: () => "+=" + scrollDistance
                }
            });
        }

        return () => {
            scrollTween.kill();
            ScrollTrigger.getAll().forEach(t => t.kill());
        };
    }, []);

    return (
        <div ref={triggerRef} className="h-screen bg-zinc-950 overflow-hidden">
            <div ref={sectionRef} className="h-full w-full flex items-center">
                <div
                    ref={containerRef}
                    className="flex flex-nowrap px-12 md:px-24 h-full "
                    style={{ willChange: 'transform', transformStyle: 'preserve-3d' }}
                >
                    {projects.map((project, i) => (
                        <Card key={project.id} project={project} index={i} />
                    ))}

                    <div className="card-wrapper flex-shrink-0 w-[50vw] md:w-[28vw] lg:w-[22vw] px-6 md:px-12 flex items-center justify-center">
                        <div className="card-item w-full aspect-[3/4] border border-white/10 rounded-lg flex flex-col items-center justify-center gap-6 group hover:bg-zinc-900/50 transition-colors cursor-pointer bg-zinc-925 shadow-2xl">
                            <div className="w-20 h-20 rounded-full border border-zinc-700 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                                <Plus className="w-8 h-8 text-zinc-500 group-hover:text-white" strokeWidth={1} />
                            </div>
                            <h3 className="text-xl font-medium tracking-tight text-zinc-400 group-hover:text-white">View Archive</h3>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};


export default function Cards() {
    useEffect(() => {
        document.body.style.overscrollBehavior = "none";
    }, []);

    return (
        <main className="w-full bg-zinc-950">

            <WorkGallery />
        </main>
    );
}