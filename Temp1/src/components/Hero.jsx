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

                <h1 className='special-font text-[6rem] font-transformers absolute bottom-5 text-end right-10 z-40 text-blue-50 leading-none'>
                    <span className='block text-blue-50/30 drop-shadow-[0_0_40px_rgba(255,255,255,0.3)]'>
                        SAFE AI
                    </span>
                    <span className='block text-blue-100/30 font-light tracking-wide'>
                        FOR MANKIND
                    </span>
                </h1>

                <div className='absolute font-batman left-8 top-24 z-40 max-w-xl md:left-16 md:top-32'>
                    <div className='space-y-8'>

                        <h2 className='text-3xl md:text-4xl lg:text-5xl text-white leading-tight tracking-tight mt-32'>
                            Ce que Norton est a, <span className='text-gray-300'>Internet</span>, <br />
                            nous le sommes a l' <span className='text-blue-100'>IA.</span>
                        </h2>

                        <p className='text-base md:text-lg text-blue-100/90 leading-relaxed max-w-lg'>
                            Nous construisons l'infrastructure de confiance pour l'ère de l'intelligence artificielle.
                            <span className='block mt-3 text-white font-medium'>
                                Chaque donnée mérite d'être protégée. Chaque modèle doit être éthique.
                            </span>
                        </p>

                        <div className='flex items-center gap-4 pt-2'>
                            <Button
                                id='Explorer'
                                title='Découvrir notre vision'
                                leftIcon={<TiLocationArrow />}
                                ContainerClass="!bg-gray-300 hover:!bg-white text-black font-semibold px-6 py-3 flex-center gap-2 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(253,224,71,0.4)]"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <a
                href='#chatbot'
                className='group absolute bottom-8 left-1/2 -translate-x-1/2 z-50 cursor-pointer flex flex-col items-center gap-2 sm:bottom-12'
            >
                <span className='text-[10px] sm:text-xs uppercase tracking-[0.3em] text-white/60 font-light'>Scroll</span>
                <div className='w-[1px] h-12 bg-white/30 group-hover:h-16 transition-all duration-300'></div>
            </a>

            <h1 className='font-transformers leading-none text-[6rem] text-end absolute bottom-5 right-10 text-black'>
                Safe AI <br /> for mankind
            </h1>

        </div>

    )
}

export default Hero