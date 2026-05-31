import React from 'react';
import { motion } from 'framer-motion';

const AnimatedWordmark = ({ isDrawing, ...props }) => {
  // Outline drawing animation for the text elements
  const textDrawVariants = {
    hidden: customDelay => ({ 
      strokeDasharray: 1500, strokeDashoffset: 1500, fillOpacity: 0,
      transition: {
        // Reverse draw timing: start from the center (customDelay 4) erasing first!
        strokeDashoffset: { duration: 4.5, ease: "easeInOut", delay: 4 - customDelay },
        fillOpacity: { duration: 2.5, ease: "easeOut", delay: 4 - customDelay } 
      }
    }),
    visible: customDelay => ({
      strokeDashoffset: 0,
      fillOpacity: 1,
      transition: {
        strokeDashoffset: { duration: 4.5, ease: "easeInOut", delay: customDelay },
        fillOpacity: { duration: 2.5, ease: "easeIn", delay: customDelay + 3.5 }
      }
    })
  };

  // Path drawing for the geometric 'E'
  const pathDrawVariants = {
    hidden: customDelay => ({ 
      pathLength: 0, fillOpacity: 0,
      transition: {
        pathLength: { duration: 4.5, ease: "easeInOut", delay: 4.5 - customDelay },
        fillOpacity: { duration: 2.5, ease: "easeOut", delay: 4.5 - customDelay }
      }
    }),
    visible: customDelay => ({
      pathLength: 1,
      fillOpacity: 1,
      transition: { 
        pathLength: { duration: 4.5, ease: "easeInOut", delay: customDelay },
        fillOpacity: { duration: 2.5, ease: "easeIn", delay: customDelay + 3.5 }
      }
    })
  };

  return (
    <motion.svg viewBox="0 0 600 150" {...props}>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700&display=swap');
          
          .brand-text {
            font-family: 'Cinzel Decorative', serif;
            font-size: 110px;
            letter-spacing: 0.05em;
          }
        `}
      </style>
      
      {/* 
        Drawing pairs from outside in:
        Pair 1 (Outer): Left 'A', Right 'I' (Delay: 0s)
        Pair 2 (Mid): Left 'M', Right 'T' (Delay: 2s)
        Pair 3 (Inner): Left 'A', Center 'E' (Delay: 4s)
      */}

      <text x="330" y="115" className="brand-text" textAnchor="end">
        {/* Left 'A' (Outer) */}
        <motion.tspan custom={0} variants={textDrawVariants} initial="hidden" animate={isDrawing ? "visible" : "hidden"} stroke="#0A0A0A" strokeWidth="1" fill="#0A0A0A">A</motion.tspan>
        {/* Left 'M' (Mid) */}
        <motion.tspan custom={2} variants={textDrawVariants} initial="hidden" animate={isDrawing ? "visible" : "hidden"} stroke="#0A0A0A" strokeWidth="1" fill="#0A0A0A">M</motion.tspan>
        {/* Left 'A' (Inner) */}
        <motion.tspan custom={4} variants={textDrawVariants} initial="hidden" animate={isDrawing ? "visible" : "hidden"} stroke="#0A0A0A" strokeWidth="1" fill="#0A0A0A">A</motion.tspan>
      </text>
      
      <text x="410" y="115" className="brand-text" textAnchor="start">
        {/* Right 'T' (Mid) */}
        <motion.tspan custom={2} variants={textDrawVariants} initial="hidden" animate={isDrawing ? "visible" : "hidden"} stroke="#0A0A0A" strokeWidth="1" fill="#0A0A0A">T</motion.tspan>
        {/* Right 'I' (Outer) */}
        <motion.tspan custom={0} variants={textDrawVariants} initial="hidden" animate={isDrawing ? "visible" : "hidden"} stroke="#0A0A0A" strokeWidth="1" fill="#0A0A0A">I</motion.tspan>
      </text>

      <g transform="translate(342, 40)">
        {/* Crescent Backbone of 'E' (Inner) */}
        <motion.path 
          d="M 60 4 Q 28 -12 8 20 Q -12 52 20 68 Q 44 80 60 64 Q 32 72 16 48 Q 0 24 24 12 Q 44 4 60 4 Z" 
          fill="#0A0A0A" stroke="#0A0A0A" strokeWidth="1"
          custom={4} variants={pathDrawVariants} initial="hidden" animate={isDrawing ? "visible" : "hidden"}
        />
        {/* Floating Stiletto Crossbar of 'E' (Inner, slightly staggered after backbone) */}
        <motion.path 
          d="M 14 34 Q 34 31 54 28 Q 36 40 14 38 Z" 
          fill="#0A0A0A" stroke="#0A0A0A" strokeWidth="1"
          custom={4.5} variants={pathDrawVariants} initial="hidden" animate={isDrawing ? "visible" : "hidden"}
        />
      </g>
    </motion.svg>
  );
};

export default AnimatedWordmark;
