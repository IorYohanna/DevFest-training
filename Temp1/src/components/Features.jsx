import { useRef, useState } from 'react';
import { TiLocationArrow } from 'react-icons/ti'

const BentoCard = ({ src, title, description }) => {
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
          <h1 className="text-5xl font-batman">
            {title}
          </h1>
          {description && (
            <p className="mt-3 max-w-64 text-xs md:text-base font-vogue ">{description}</p>
          )}
        </div>
      </div>
    </div>
  )
}

const BentoTilt = ({ children, className = '' }) => {
  const [transformStyle, settransformStyle] = useState('')
  const itemRef = useRef(null)

  const handleMouseMove = (e) => {
    if (!itemRef.current) return

    const { left, top, width, height } = itemRef.current.getBoundingClientRect()

    const relativeX = (e.clientX - left) / width
    const relativeY = (e.clientY - top) / height

    const tiltX = (relativeY - 0.5) * 5
    const tiltY = (relativeX - 0.5) * -5

    const newTransform = `perspective(700px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1,1,1)`

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
      style={{ transform: transformStyle }}
      className={className}
    >
      {children}
    </div>
  )
}

const Features = () => {
  return (
    <section id="features" className="bg-black pb-52 overflow-hidden">
      <div className="container mx-auto px-3 md:px-10">

        <div className="px-5 py-32">
          {/* Titre de section : Le Gardien de l'IA */}
          <p className="font-circular-web text-lg text-blue-50">
            Le Gardien de l'IA
          </p>
          {/* Sous-titre : Ta mission (Filtrer et protéger) */}
          <p className="max-w-md font-circular-web text-lg text-blue-50 opacity-50">
            Nous construisons le pont entre les modèles puissants et la sécurité humaine.
            Nettoyez vos données, protégez votre vie privée et assurez des interactions IA éthiques.
          </p>
        </div>

        {/* Carte Principale : Le concept global (Sanitisation) */}
        <BentoTilt className="border-hsla relative mb-7 h-96 w-full overflow-hidden rounded-md md:h-[65vh]">
          <BentoCard
            src="video/vid4.mp4"
            title={<>San<b>i</b>tisation</>}
            description="Notre middleware intercepte et nettoie les flux de données en temps réel, supprimant les données personnelles (PII) et la toxicité avant qu'elles n'atteignent l'IA."
          />
        </BentoTilt>

        <div className="grid h-[135vh] grid-cols-2 grid-rows-3 gap-7">

          {/* Grande Carte Verticale : La Confidentialité (GDPR/RGPD) */}
          <BentoTilt className="bento-tilt_1 row-span-1 md:col-span-1 md:row-span-2">
            <BentoCard
              src="/video/vid5.mp4"
              title={<>Confid<b>e</b>ntialité</>}
              description="Détection automatique des informations sensibles. Gardez les noms, les cartes de crédit et les adresses hors de la boîte noire."
            />
          </BentoTilt>

          {/* Petite Carte 1 : Le Filtrage (Contre les biais/haine) */}
          <BentoTilt className="bento-tilt_1 row-span-1 ms-32 md:col-span-1 md:ms-0">
            <BentoCard
              src="/video/vid3.mp4"
              title={<>Filt<b>r</b>age</>}
              description="Bloquez la toxicité et les biais à la source."
            />
          </BentoTilt>

          {/* Petite Carte 2 : La Sécurité (Contre les attaques) */}
          <BentoTilt className="bento-tilt_1 me-14 md:col-span-1 md:me-0">
            <BentoCard
              src="/video/vid1.mp4"
              title={<>Séc<b>u</b>rité</>}
              description="Prévenez l'empoisonnement des données et les attaques par injection."
            />
          </BentoTilt>

          {/* Carte Violette : Call to Action / Vision */}
          <BentoTilt className="bento-tilt_2">
            <div className="flex size-full flex-col justify-between bg-gray-300 p-5">
              <h1 className="font-batman text-7xl max-w-64 text-black">
                <b>I</b>A Au<br /> <b>Service de </b><br /> l'H<b>u</b>manité
              </h1>
              <TiLocationArrow className='m-5 scale-[5] self-end' />
            </div>
          </BentoTilt>

          {/* Vidéo simple : Le Futur */}
          <BentoTilt className='bento-tilt_2'>
            <video
              src="/video/vid2.mp4"
              autoPlay
              loop
              muted
              className='size-full object-cover object-center'
            />
          </BentoTilt>

        </div>

      </div>
    </section>
  )
}

export default Features