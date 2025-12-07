import { useEffect, useRef, useState } from 'react';
import Button from './Button';
import { TiLocationArrow } from 'react-icons/ti';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/all';

gsap.registerPlugin(ScrollTrigger)

const Hero = () => {
    const [currentIndex, setCurrentIndex] = useState(1)
    const [hasClicked, setHasClicked] = useState(false)
    const [isLoading, setisLoading] = useState(true)
    const [loadedVideos, setloadedVideos] = useState(0)

    const totalVideos = 3
    const nextVideoRef = useRef(null)

    const upcomingVideoIndex = (currentIndex % totalVideos) + 1

    const handleMiniVideoClick = () => {
        setHasClicked(true)
        setCurrentIndex(upcomingVideoIndex)
    }

    const getVideoSource = (index) => `/video/tech${index}.mp4`


    //permet l'animation d'insertion dans un autre univers(pages)
    useGSAP(() => {
        if (hasClicked) {
            gsap.set('#next-video', { visibility: 'visible' })

            gsap.to('#next-video', {
                transformOrigin: 'center center',
                scale: 1,
                width: "100%",
                height: "100%",
                duration: 1,
                ease: 'power1.inOut', //
                onStart: () => nextVideoRef.current.play(),
            })

            gsap.from('#current-video', {
                transformOrigin: 'center center',
                scale: 0,
                duration: 1.5,
                ease: 'power1.inOut',
            })
        }

    }, { dependencies: [currentIndex], revertOnUpdate: true })

    //animation de scroll transition
    useGSAP(() => {
        gsap.set('#video-frame', {
            clipPath: 'polygon(14% 0%, 72% 0%, 90% 90%, 0% 100%)',
            borderRadius: '0 0 40% 10%',
        })

        gsap.from('#video-frame', {
            clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
            borderRadius: '0 0 0 0',
            ease: 'power1.inOut',
            scrollTrigger: {
                trigger: '#video-frame',
                start: 'center center',
                end: 'bottom center',
                scrub: true,
            }
        })
    })


    const handleVideoLoaded = () => {
        setloadedVideos((prev) => prev + 1)
    }

    //charge only the loading when re-render
    useEffect(() => {
        if (loadedVideos === totalVideos - 1) {
            setisLoading(false)
        }
    }, [loadedVideos])

    return (
        //loading moment
        <div className='relative h-dvh w-screen overflow-hidden'>
            {isLoading && (
                <div className='flex-center absolute z-100 h-dvh w-screen overflow-hidden bg-violet-50'>
                    <div className='three-body'>
                        <div className='three-body__dot'></div>
                        <div className='three-body__dot'></div>
                        <div className='three-body__dot'></div>
                    </div>
                </div>
            )}

            <div
                id='video-frame'
                className='relative z-10 h-dvh w-screen overflow-hidden 
                rounded-lg bg-blue-75'
            >
                <div>
                    {/* change the video when we hover it*/}
                    <div className='mask-clip-path absolute-center z-50 size-64 cursor-pointer overflow-hidden rounded-lg'>
                        <div
                            onClick={handleMiniVideoClick}
                            className='origin-center scale-50 opacity-0 transition-all duration-500 ease-in hover:scale-100 hover:opacity-100'
                        >
                            <video
                                ref={nextVideoRef}
                                src={getVideoSource(upcomingVideoIndex)}
                                loop
                                muted
                                id='current-video'
                                className='size-64 origin-center scale-150 object-cover object-center'
                                onLoadedData={handleVideoLoaded}
                            />
                        </div>
                    </div>

                    {/*garantie la fluidite de la transition entre chaque video */}
                    <video
                        ref={nextVideoRef}
                        src={getVideoSource(currentIndex)}
                        autoPlay
                        loop
                        muted
                        id='next-video'
                        className='absolute-center invisible absolute z-20 size-64 object-cover object-center'
                        onLoadedData={handleVideoLoaded}
                    />

                    <video
                        src={getVideoSource((currentIndex === totalVideos - 1) ? 1 : currentIndex)}
                        autoPlay
                        loop
                        className='absolute left-0 top-0 size-full object-cover'
                        onLoadedData={handleVideoLoaded}
                    />

                </div>

                <h1 className='special-font text-[8rem] font-batman absolute top-[20%] text-end left-[3%] z-40 text-blue-50 leading-none'>
                    <span className='block text-blue-100/90 font-light tracking-wide'>
                        SAFE AI
                    </span>
                </h1>

                <h1 className='special-font text-[8rem] font-transformers absolute bottom-28 text-end right-20 z-40 text-blue-50 leading-none'>

                    <span className='block text-blue-100/70 font-light tracking-wide'>
                        FOR MANKIND
                    </span>
                </h1>
            </div>

            <a
                href='#chatbot'
                className='group absolute bottom-8 left-1/2 -translate-x-1/2 z-50 cursor-pointer flex flex-col items-center gap-2 sm:bottom-12'
            >
                <span className='text-[10px] sm:text-xs uppercase tracking-[0.3em] text-white/60 font-light'>Scroll</span>
                <div className='w-[1px] h-12 bg-white/30 group-hover:h-16 transition-all duration-300'></div>
            </a>

            <h1 className='font-transformers leading-none text-[8rem] text-end absolute bottom-28 right-20 text-black'>
                <span className='block text-black/70 font-light tracking-wide'>
                    FOR MANKIND
                </span>
            </h1>

        </div>

    )
}

export default Hero