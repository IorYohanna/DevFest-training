import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/all";
import ScrollingTextSection3 from "./TypeTicker";
import ScrollingTextSection from "./TypeTicker";


gsap.registerPlugin(ScrollTrigger);

const Section
 = () => {

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
            scale: 0.4,
            borderRadius: "24px",
            ease: "none"
        })
    })

    return (
        //permet la redirection en utilisant le id depuis l'elem parent
        <div id="about" className="min-h-screen w-screen overflow-hidden">
            {/* <AnimatedTitle 
            title = "Choose the Best Team <br/> And that Team Is Us"
            containerClass="mt-5 !text-black text-center"
            /> */}

            <div className="h-screen w-screen relative" id="clip">
                <div>
                    <div>
                        <img 
                        src="img/temp-test/trianglifyBg.png" 
                        alt="UnderBg" 
                        className="absolute top-0 left-0 w-full h-full object-cover z-0  "
                        />
                        <span className="w-full h-full bg-black/20 absolute z-1"></span>
                    </div>
                    
                    <ScrollingTextSection
                    />
                </div>
                
                <div className="mask-clip-path about-image overflow-hidden">
                    <img
                    src="img/devfest.jpg"
                    alt="Background"
                    className="absolute w-full object-cover top-[-40%]"
                    />

                    <div class="absolute top-2/4 left-2/3 transform -translate-x-1/2 -translate-y-1/2 text-center">
                        <h1 class="text-9xl font-bold font-classyvogue">DevFest 2025</h1>
                        <p class=" text-3xl font-newyork">GDG Antananarivo</p>
                    </div>
                </div>              
            </div> 
            
        </div>
    )
}

export default Section
