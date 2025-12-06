import React, { useEffect, useRef } from "react";
import gsap from "gsap";

const Row = ({ words, direction = "left", speed = 15, className = "" }) => {
  const rowRef = useRef(null);
  const fontChoice = direction === "left" ? "font-transformers" : "font-bitsumis"

  useEffect(() => {
    const container = rowRef.current;
    
    const startX = direction === "left" ? 0 : -50;
    const endX = direction === "left" ? -50 : 0;

    let ctx = gsap.context(() => {
      gsap.fromTo(container,
        { xPercent: startX },
        {
          xPercent: endX,
          duration: speed,
          ease: "none",
          repeat: -1,
        }
      );
    }, rowRef);

    return () => ctx.revert(); // Nettoyage lors du démontage du composant
  }, [direction, speed]);

  const content = [...words, ...words];

  return (
    <div className="w-full overflow-hidden whitespace-nowrap">
      
      <div ref={rowRef} className={`${className}`}>
        {content.map((word, index) => (
          <span
            key={index}
            className={`mx-8 text-8xl font-bold uppercase text-black opacity-80 hover:opacity-100 transition-opacity ${fontChoice}`}
          >
            {word}
          </span>
        ))}
      </div>
    </div>
  );
};


const ScrollingTextSection = () => {
  // Liste pour le HAUT (Défile vers la DROITE)
  const topList = ["Neoshore", "42", "Vivetic", "Stelarix", "Oc-tet", "RELIA", "YF"];

  // Liste pour le BAS (Défile vers la GAUCHE)
  const bottomList = ["Axian", "NextA", "AlgoMada", "Bocasay", "Yas"];

  return (
    <div className="absolute top-1/3 w-full ">

      <Row 
        words={topList} 
        direction="right" 
        speed={25}
      />

      <Row 
        words={bottomList} 
        direction="left" 
        speed={15} 
      />
    </div>
  );
};

export default ScrollingTextSection;