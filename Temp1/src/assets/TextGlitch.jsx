import React, { useRef, useEffect, useState } from 'react';

const TextGlitch = ({ words, duration = 1.5 }) => {
  const textRef = useRef(null);
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const wordsList = words || ["KILAMENTY", "EFA IZY ...", "MILAY"];
  
  // Intersection Observer pour détecter le scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            setCurrentWordIndex(0);
          } else {
            setIsVisible(false);
          }
        });
      },
      {
        threshold: 0.3,
        rootMargin: '0px'
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  // Animation du glitch - Boucle infinie mais chaque mot UNE SEULE FOIS
  useEffect(() => {
    if (!isVisible) return;

    const textElement = textRef.current;
    if (!textElement) return;

    let timeoutIds = [];
    let currentIndex = 0;

    const animateWord = () => {
      const word = wordsList[currentIndex];
      
      // Phase 1: Ligne glitchée initiale (compression verticale)
      textElement.textContent = word;
      textElement.setAttribute('data-text', word);
      textElement.style.opacity = '0';
      textElement.style.transform = 'scaleY(0.1)';
      
      // Phase 2: Expansion de la ligne
      timeoutIds.push(setTimeout(() => {
        textElement.style.transition = 'all 0.2s cubic-bezier(0.65, 0, 0.35, 1)';
        textElement.style.opacity = '1';
        textElement.style.transform = 'scaleY(1)';
      }, 50));
      
      // Phase 3: Glitch intense (bandes qui bougent) - UNE SEULE FOIS
      const glitchDuration = 400;
      const glitchInterval = 50;
      const glitchSteps = glitchDuration / glitchInterval;
      
      for (let i = 0; i < glitchSteps; i++) {
        timeoutIds.push(setTimeout(() => {
          const randomTop = Math.random() * 80;
          const randomBottom = Math.random() * 80;
          const randomLeft = (Math.random() - 0.5) * 4;
          
          textElement.style.setProperty('--glitch-top', `${randomTop}%`);
          textElement.style.setProperty('--glitch-bottom', `${randomBottom}%`);
          textElement.style.setProperty('--glitch-left', `${randomLeft}px`);
        }, 250 + i * glitchInterval));
      }
      
      // Phase 4: Stabilisation - ARRÊTE le glitch
      timeoutIds.push(setTimeout(() => {
        textElement.style.setProperty('--glitch-top', '60%');
        textElement.style.setProperty('--glitch-bottom', '70%');
        textElement.style.setProperty('--glitch-left', '2px');
      }, 250 + glitchDuration));
      
      // Phase 5: Maintien stable
      timeoutIds.push(setTimeout(() => {
        textElement.style.transition = 'all 0.2s ease-in';
      }, 250 + glitchDuration + 100));
      
      // Phase 6: Disparition (compression)
      timeoutIds.push(setTimeout(() => {
        textElement.style.opacity = '0';
        textElement.style.transform = 'scaleY(0.1)';
      }, duration * 1000 - 200));
      
      // Passer au mot suivant et BOUCLER
      timeoutIds.push(setTimeout(() => {
        currentIndex = (currentIndex + 1) % wordsList.length; // Revient au début après le dernier mot
        animateWord(); // Continue la boucle
      }, duration * 1000));
    };

    animateWord(); // Démarre la boucle

    return () => {
      timeoutIds.forEach(id => clearTimeout(id));
    };
  }, [isVisible, wordsList, duration]);

  return (
    <div 
      ref={sectionRef}
      className="text-glitch-container"
    >
      <p 
        ref={textRef} 
        className="glitch-text" 
        data-text=""
      >
      </p>
      
      <style jsx>{`
        .text-glitch-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background-color: #000;
          position: relative;
          overflow: hidden;
        }
        
        .text-glitch-container::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: 
            linear-gradient(rgba(0, 240, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 0, 100, 0.03) 1px, transparent 1px);
          background-size: 50px 50px;
          opacity: 0.5;
        }

        .glitch-text {
          position: relative;
          font-family: 'Arial Black', sans-serif;
          font-size: clamp(3rem, 12vw, 8rem);
          font-weight: 900;
          color: #fff;
          letter-spacing: 0.15em;
          text-align: center;
          user-select: none;
          overflow: visible;
          margin: 0;
          padding: 0;
          opacity: 0;
          transform: scaleY(0.1);
          transform-origin: center;
          --glitch-top: 60%;
          --glitch-bottom: 70%;
          --glitch-left: 2px;
        }

        .glitch-text::before,
        .glitch-text::after {
          content: attr(data-text);
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          text-align: center;
          overflow: hidden;
        }

        .glitch-text::before {
          left: var(--glitch-left);
          text-shadow: -3px 0 #ff0050;
          clip-path: inset(var(--glitch-top) 0 0 0);
          animation: glitchBefore 0.3s infinite;
        }

        .glitch-text::after {
          left: calc(var(--glitch-left) * -1);
          text-shadow: 3px 0 #00f0ff;
          clip-path: inset(0 0 var(--glitch-bottom) 0);
          animation: glitchAfter 0.3s infinite;
        }
        
        @keyframes glitchBefore {
          0%, 100% {
            transform: translate(0);
          }
          33% {
            transform: translate(-2px, 0);
          }
          66% {
            transform: translate(2px, 0);
          }
        }
        
        @keyframes glitchAfter {
          0%, 100% {
            transform: translate(0);
          }
          33% {
            transform: translate(2px, 0);
          }
          66% {
            transform: translate(-2px, 0);
          }
        }

        /* Effet de scanlines */
        .text-glitch-container::after {
          content: '';
          position: absolute;
          inset: 0;
          background-image: repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(255, 255, 255, 0.03) 2px,
            rgba(255, 255, 255, 0.03) 4px
          );
          pointer-events: none;
          animation: scanlines 8s linear infinite;
        }
        
        @keyframes scanlines {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(10px);
          }
        }
      `}</style>
    </div>
  );
};

export default TextGlitch;