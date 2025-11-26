import { useRef } from "react"
import AnimatedTitle from "./AnimatedTitle"
import gsap from "gsap"
import RoundedCorners from "./RoundedCorners"
import Button from "./Button"

const Story = () => {
    //using useRef for animation with gsap
    const frameRef = useRef(null)

    const handleMouseLeave = () => {
        gsap.to (element, {
            duration:0.3,
            rotateX: 0,
            rotateY:0,
            ease: 'power1.inOut'
        })
    }

    //get clientX and Y from the event(e)
    const handleMouseMove = (e) => {
        const {clientX , clientY} = e
        const element = frameRef.current

        if(!element) return

        const rect = element.getBoundingClientRect() //get the left,top,width and height
        const x = clientX - rect.left
        const y = clientY - rect.top

        const centerX = rect.width /2
        const centerY = rect.height /2

        const rotateX = ((y - centerY) / centerY) * -10
        const rotateY = ((x - centerX) / centerX) * 10

        gsap.to(element, {
            direction: 0.3,
            rotateX, rotateY,
            transformPerspective: 500,
            ease: 'power1.inOut'
        })
    }

  return (
    <section id='story' className='min-h-dvh w-screen bg-black text-blue-50'>
        <div className='flex size-full flex-col items-center py-10 pb-24'>
            <p className='font-general text-sm uppercase md:text-[10px]'>
                Another Universe
            </p>

            {/*card title and image */}
            <div className='relative size-full'>
                <AnimatedTitle 
                title="St<b>o</b>ry of <br/> Another real<b>m</b>"
                sectionId = "#story"
                containerClass="mt-5 pointer-events-none mix-blend-difference relative z-10"
                /> {/*mix-blend-difference permet de mettre l'img en dessous du title */}

                <div className="story-img-container">
                    <div className="story-img-mask">
                        <div className="story-img-content">
                            <img 
                            ref={frameRef}
                            src="/img/entrance.webp" 
                            alt="entrance"
                            className="object-contain"
                            onMouseLeave={handleMouseLeave}
                            onMouseEnter={handleMouseLeave}
                            onMouseUp={handleMouseLeave}
                            onMouseMove={handleMouseMove}
                            />
                        </div>
                    </div>

                    <RoundedCorners />
                </div>
            </div>

            <div className="mt-80 flex w-full justify-center md:-mt-64 md:me-44 md:justify-end">
                <div className="flex h-full w-fit flex-col items-center md:items-start">
                    <p className="mt-3 max-w-sm text-center font-circular-web text-violet-50 md:text-start">

                        Some text here
                    </p>

                    <Button
                    id="realm-button"
                    title="Discover more"
                    containerClass="mt-5"
                    />
                
                </div>

           
            </div>


        </div>
    </section>
  )
}

export default Story