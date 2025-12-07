import Button from "./Button"



const ImgClipBox = ({src, Clip}) => {
    return ( 
        <div className={Clip}>
            <img src={src} alt="" />
        </div>
    )
}

const Contact = () => {
  return (
    <div id="contact" className="my-20 min-h-96 w-screen px-10">
        
        <div className="relative rounded-lg bg-black py-24 text-blue-50 sm:overflow-hidden">
            
            <div className="absolute -left-20 top-0 hidden h-full w-72 overflow-hidden sm:block lg:left-20 lg:w-96">

                <ImgClipBox
                src="img/background/purple.jpg"
                Clip="contact-clip-path-1"
                /> 

                <ImgClipBox
                src="img/contact3.jpg"
                Clip="contact-clip-path-2 -translate-y-20"
                />

            </div>

            <div className="absolute -top-40 left-20 w-60 sm:top-1/2 md:left-auto md:right-10 lg:top-20 lg:w-80">
        
                <ImgClipBox
                    src="/img/swordman-partial.webp"
                    Clip="absolute md:scale-120"
                />

                <ImgClipBox
                    src="/img/contact3.jpg"
                    Clip="sword-man-clip-path md:scale-150"
                />

            </div>

            <div className="flex flex-col items-center text-center">
                <p className="font-general text-[30px] uppercase">
                    Rejoignez Nous !
                </p>

                <p className="mb-6 font-zentry special-font mt-10 w-full  text-5xl leading-[.9] md:text-[6rem] ">
                    Créons Ensemble <br/>Une Nouvelle ère
                </p>

                <Button
                title="contactez nous"
                containerClass = "cursor-pointer"
                />

            </div>
        
        </div>

    </div>
  )
}

export default Contact