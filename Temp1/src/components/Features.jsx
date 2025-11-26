import { useRef, useState } from 'react';

import {TiLocationArrow} from 'react-icons/ti'

const BentoCard = ({src, title, description}) => {
  return (
    <div className="relative size-full">
      
      <video 
      src={src}
      muted 
      loop 
      autoPlay
      className="absolute left-0 top-0 size-full object-cover object-center"
      />
      
      <div className="relative z-10 flex size-full flex-col justify-between p-5 text-blue-50">
        <div>
          <h1 className="bento-title special-font">
            {title}
          </h1>

          {description && (
            <p className="mt-3 max-w-64 text-xs md:text-base">{description}</p>
          )}

        </div>

      </div>

    </div>
  )
}

//tilt effect with mouse 
const BentoTilt = ({children, className = ''}) => {
  const [transformStyle, settransformStyle] = useState('')
  const itemRef = useRef(null)

  const handleMouseMove = (e) => {
    if(!itemRef.current) return

    //get the position of the ref of the itemRef
    const {left,top,width,height} = itemRef.current.getBoundingClientRect()

    const relativeX = (e.clientX - left) / width //relative x position of our mouse
    const relativeY = (e.clientY - top ) / height 

    const tiltX = (relativeY - 0.5) * 5
    const tiltY = (relativeX - 0.5) * -5

    const newTransform = `perspective(700px) rotateX(${tiltX}deg)  rotateY(${tiltY}deg) scale3d(1,1,1)`
    
    settransformStyle(newTransform)

  }

  const handleMouseLeave = () => {
    settransformStyle('')
  }


  return (
    <div 
    ref={itemRef}
    onMouseMove={handleMouseMove}
    onMouseLeave={handleMouseLeave}
    style={{transform: transformStyle}}
    className={className}
    >
      {children}

    </div>
  )
}

const Features = () => {
  return (
    <section id="features" className="bg-black pb-52 overflow-hidden">
      <div className=" container mx-auto px-3 md:px-10">

        <div className="px-5 py-32">
          <p className="font-circular-web text-lg text-blue-50 ">Into a new world</p>
          <p className="max-w-md font-circular-web text-lg text-blue-50 opacity-50"> 
            Immerse yourslef into another world of adventure and funny experience with us  
          </p>
        </div>

        <BentoTilt className="border-hsla relative mb-7 h-96 w-full 
        overflow-hidden rounded-md md:h=[65vh]"
        >
          <BentoCard
          src="video/feature-1.mp4"
          title={<>radi<b>n</b>t</>}
          description ="some description"
          />

        </BentoTilt>

        <BentoTilt className="grid h-[135vh] grid-cols-2 grid-rows-3 gap-7"> 
          {/*row-span-2 2 ligne et col-span-1 1colonne qd lq fenetre atteint md */}
          
          <bento className="bento-tilt_1 row-span-1 md:col-span-1 md:row-span-2">
            <BentoCard
              src="/video/feature-2.mp4"
              title={<>Zig<b>m</b>a</>}
              description="Never forget to take fun while playing "
            />
          </bento>

          <BentoTilt className="bento-tilt_1 row-span-1 ms-32 md:col-span-1 md:ms-0">
            <BentoCard 
            src="/video/feature-3.mp4"
            title={<>N<b>e</b>xus</>}
            description=""
            />
          </BentoTilt>

          <BentoTilt className="bento-tilt_1 me-14 md:col-span-1 md:me-0">
            <BentoCard 
            src="/video/feature-4.mp4"
            title={<>Az<b>u</b>le</>}
            description=""
            />
          </BentoTilt>
       
          <BentoTilt className="bento-tilt_2 ">
            <div className="flex size-full flex-col justify-between bg-violet-300 p-5">
              <h1 className="bento-title special-font max-w-64 text-black">
                M<b>o</b>re Co<b>m</b>ing S<b>o</b>on!!
              </h1>
              <TiLocationArrow className='m-5 scale-[5] self-end'/>
            </div>
          </BentoTilt>

          <BentoTilt className='bento-tilt_2'>
            <video 
            src="/video/feature-5.mp4"
            autoPlay
            loop 
            muted
            className='size-full object-cover object-center'
            />
          </BentoTilt>

        </BentoTilt>

      </div>
    </section>
  )
}

export default Features