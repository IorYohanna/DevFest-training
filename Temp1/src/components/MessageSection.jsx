import React, { useEffect, useRef } from 'react';
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

const MessageSection = () => {
    const sectionRef = useRef(null);


    const brownBg = '#8B4545'; 
    const offWhiteText = '#faeade'; 
    const fuelUpBg = '#D1884C'; 
    const fuelUpText = '#4A2A19'; 
    const fadedText = 'rgba(250, 234, 222, 0.2)';

    useEffect(() => {
        gsap.registerPlugin(ScrollTrigger, SplitText);

        if (!sectionRef.current) return;

        const firstMsgSplit = new SplitText(".first-message", {
            type: "words",
        });
        const secMsgSplit = new SplitText(".second-message", {
            type: "words",
        });
        const paragraphSplit = new SplitText(".message-content p", {
            type: "words, lines",
            linesClass: "paragraph-line",
        });

        const anim1 = gsap.to(firstMsgSplit.words, {
            color: offWhiteText,
            ease: "power1.in",
            stagger: 0.5,
            scrollTrigger: {
                trigger: sectionRef.current, // Utiliser la référence pour la précision
                start: "top center",
                end: "30% center",
                scrub: true,
            },
        });

        const anim2 = gsap.fromTo(secMsgSplit.words, {
            color: fadedText
        }, {
            color: offWhiteText,
            ease: "power1.in",
            stagger: 0.5,
            scrollTrigger: {
                trigger: ".second-message",
                start: "top 80%",
                end: "bottom center",
                scrub: true,
            },
        });


        const revealTl = gsap.timeline({
            delay: 0.5,
            scrollTrigger: {
                trigger: ".msg-text-scroll",
                start: "top 80%",
            },
        });
        revealTl.to(".msg-text-scroll", {
            duration: 1.5,
            clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
            ease: "circ.inOut",
        });

        const paragraphTl = gsap.timeline({
            scrollTrigger: {
                trigger: ".message-content p",
                start: "top 90%",
            },
        });
        gsap.set(paragraphSplit.words, { yPercent: 300, rotate: 3 });

        paragraphTl.fromTo(paragraphSplit.words, {
            yPercent: 300,
            rotate: 3,
        }, {
            yPercent: 0,
            rotate: 0,
            ease: "power2.out",
            duration: 0.8,
            stagger: 0.015,
        });

        return () => {
            anim1.kill();
            anim2.kill();
            revealTl.kill();
            paragraphTl.kill();
            firstMsgSplit.revert();
            secMsgSplit.revert();
            paragraphSplit.revert();
            ScrollTrigger.getAll().forEach(trigger => trigger.kill());
        };

    }, []); 

    return (
        <section
            ref={sectionRef} 
            className="message-content w-full h-screen flex items-center justify-center"
            style={{ backgroundColor: brownBg }}
        >
            <div className="container special-font mx-auto flex flex-col items-center py-28 relative h-full justify-center">
                <div className="w-full max-w-5xl px-4">
                    <div className="msg-wrapper text-center">
                        <h1
                            className="first-message text-[12vw] md:text-[8vw] lg:text-[7vw] xl:text-[6.5rem] leading-none font-extrabold uppercase"
                            style={{ color: offWhiteText }}
                        >
                            Stir up your fearless past and
                        </h1>

                        <div className="flex justify-center my-4 md:my-6">
                            <div
                                style={{
                                    clipPath: "polygon(0 0, 0 0, 0 100%, 0% 100%)",
                                    backgroundColor: fuelUpBg,
                                    transform: "rotate(-2deg)",
                                }}
                                className="msg-text-scroll inline-block p-4 md:p-6 lg:p-8 rounded-lg shadow-2xl"
                            >
                                <h2
                                    className="text-[14vw] md:text-[10vw] lg:text-[9vw] xl:text-[8rem] leading-none font-extrabold uppercase"
                                    style={{ color: fuelUpText }}
                                >
                                    Fuel Up
                                </h2>
                            </div>
                        </div>

                        <h1
                            className="second-message text-[12vw] md:text-[8vw] lg:text-[7vw] xl:text-[6.5rem] leading-none font-extrabold uppercase"
                            style={{ color: fadedText }}
                        >
                            your future with every gulp of Perfect Protein
                        </h1>
                    </div>
                    <div className="flex justify-center md:mt-20 mt-10">
                        <div className="max-w-md px-10 flex justify-center text-center overflow-hidden">
                            <p
                                className="text-base md:text-lg lg:text-xl leading-relaxed"
                                style={{ color: offWhiteText }}
                            >
                                Rev up your rebel spirit and feed the adventure of life with
                                SPYLT, where you’re one chug away from epic nostalgia and
                                fearless fun.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default MessageSection;