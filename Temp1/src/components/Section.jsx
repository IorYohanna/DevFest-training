import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/all";
import AnimatedTitle from "./AnimatedTitle";


gsap.registerPlugin(ScrollTrigger);

const Section = () => {

    useGSAP(() => {
        const clipAnimation = gsap.timeline({ //define more precisely the scroll trigger
        scrollTrigger: {
            trigger: "#clip",
            start: "center center",
            end: "+=800 center",
            scrub: 0.5,
            pin:true,
            pinSpacing:true,
        },
        });

        clipAnimation.to(".mask-clip-path", {
        width: "100vw",
        height: "100vh",
        borderRadius: 0,
        })
    })

    return (
        //permet la redirection en utilisant le id depuis l'elem parent
        <div id="about" className="min-h-screen w-screen overflow-hidden">
            <div className="relative mb-8 mt-36 flex flex-col items-center gap-5">
                <p className="font-general text-sm uppercase md:text-[10px]">
                Welcome to Our Univers
                </p>

                <AnimatedTitle 
                title = "Choose the Best Team <br/> And that Team Is Us"
                containerClass="mt-5 !text-black text-center"
                />

                <div className="about-subtext">
                    <p>The Game of Games begins—your life, now an epic MMORPG</p>
                    <p className="text-gray-500">
                        Zentry unites every player from countless games and platforms, both
                        digital and physical, into a unified Play Economy
                    </p>
                </div>
            </div>

            <div className="h-dvh w-screen" id="clip">
                <div className="mask-clip-path about-image">
                    <img
                        src="img/about.webp"
                        alt="Background"
                        className="absolute left-0 top-0 size-full object-cover"
                    />
                </div>
            </div>
        </div>
    )
}

export default Section