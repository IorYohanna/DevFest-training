import { useEffect, useRef, useState } from 'react'
import { TiLocationArrow } from 'react-icons/ti'
import Button from './Button'
import {useWindowScroll} from 'react-use' //get the property of the scroll
import gsap from 'gsap'

const navItems = ['Home', 'Story', 'Features', 'About' , 'Contact']

const NavBar = () => {
    const navContainerRef = useRef(null)
    const audioElementRef = useRef(null)

    const [isAudioPlaying, setisAudioPlaying] = useState(false)
    const [isIndicatorActive, setisIndicatorActive] = useState(false)

    //for the navbar bg
    const [LastScrollY, setLastScrollY] = useState(0)
    const [isNavVisible, setisNavVisible] = useState(true)

    //navbar with noir bg only when scrolling
    const {y: currentScrollY} = useWindowScroll()

    useEffect( () => {
        if(currentScrollY === 0) {
            setisNavVisible(true)
            navContainerRef.current.classList.remove('floating-nav')
        } else if (currentScrollY > LastScrollY) { //user scrolling down then add the bg
            setisNavVisible(false)
            navContainerRef.current.classList.add('floating-nav')
        }else if (currentScrollY < LastScrollY) { //user scrolling up
            setisNavVisible(true)
            navContainerRef.current.classList.add('floating-nav')
        }

        setLastScrollY(currentScrollY)

    }, [currentScrollY])


    useEffect ( () => {
        gsap.to(navContainerRef.current , {
            y: isNavVisible ? 0 : -100,
            opacity: isNavVisible ? 1 : 0,
            duration: 0.2,
        })

    }, [isNavVisible])
    
    //for playing the audio
    const toggleAudioIndicator = () => {
        setisAudioPlaying( (prev) => !prev)
        setisIndicatorActive( (prev) => !prev)
    }

    useEffect ( () => {
        if(isAudioPlaying) {
            audioElementRef.current.play()
        }else {
            audioElementRef.current.pause()
        }
    }, [isAudioPlaying])

    return (
        <div
            ref={navContainerRef}
            className="fixed inset-x-0 top-4 z-50 h-16 border-none transition-all duration-700 sm:inset-x-6"
        >
            <header className="absolute top-1/2 w-full -translate-y-1/2">

                <nav className="flex size-full items-center justify-between p-4">
                {/* Logo and Product button */}
                        <div className="text-black mt-20">
                            <p className="nav-name-up -mb-3">Honty</p>
                            <p className="nav-name-down">Herizo</p>
                        </div>


                    <div className='flex h-full items-center'>
                        
                        <div className='hidden md:block'>
                            {navItems.map( (item) => (
                                <a key={item} href={`#${item.toLowerCase()}`} 
                                className='nav-hover-btn'>
                                    {item}
                                </a>
                            ))}
                        </div>

                        {/*button that allows us to play the music */}
                        <button 
                            className='ml-10 flex items-center space-x-0.5'
                            onClick={toggleAudioIndicator}
                        >
                            <audio 
                                ref={audioElementRef} 
                                className='hidden' 
                                src='/audio/loop.mp3' 
                                loop
                            />
                                {[1,2,3,4].map( (bar) => (
                                    <div key={bar}
                                    className={`indicator-line ${isIndicatorActive ? 'active' : ''}`} 
                                    style={{animationDelay: `${bar * 0.1}s`}}/>
                                ))}
                        </button>
                    </div>
                </nav>
            </header>
        
        </div>
    )
}

export default NavBar