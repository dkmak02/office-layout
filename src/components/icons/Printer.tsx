import React from "react";

interface PrinterProps extends React.SVGProps<SVGSVGElement> {
  x?: number;
  y?: number;
  x_axis?: number;
  y_axis?: number;
  rotation?: number;
}

const Printer: React.FC<PrinterProps> = ({ 
  x = 8, 
  y = 8, 
  x_axis = 61, 
  y_axis = 50.5, 
  rotation = 0,
}) => (	

<svg
   version="1.1"
   id="Layer_1"
   x={x_axis}
   y={y_axis}
   viewBox="0 0 320.192 320.192"
   xmlSpace="preserve"
   width={x}
   height={y}
   overflow="hidden"
   style={{transform: `rotate(${rotation}deg)`, overflow: "hidden"}}
><defs
     id="defs1"><clipPath
       id="printerClip"><rect
         x="0"
         y="0"
         width="320.192"
         height="320.192"
         id="rect1" /></clipPath></defs><g
     id="SVGRepo_bgCarrier"
     strokeWidth="0" /><g
     id="SVGRepo_tracerCarrier"
     strokeLinecap="round"
     strokeLinejoin="round" /><g
     id="g1"
     transform="matrix(0.96341355,0,0,0.96341355,-21.964141,-20.546628)"><path
       d="m 277.667,99.275 c -0.022,-4.502 -3.688,-8.096 -8.149,-8.074 l -22.957,0.103 -0.263,-57.798 c -0.022,-4.502 -3.647,-8.096 -8.149,-8.074 L 93.023,26.134 c -4.462,0.019 -8.096,3.647 -8.074,8.149 l 0.263,57.798 -18.862,0.085 c -4.462,0.022 -8.096,3.647 -8.074,8.149 l 0.692,143.101 c 0.019,4.462 3.688,8.096 8.149,8.074 l 18.859,-0.085 0.235,51.713 c 0.022,4.462 3.688,8.096 8.149,8.074 l 154.128,-0.702 c 4.502,-0.022 8.096,-3.688 8.074,-8.149 l -0.235,-51.713 22.957,-0.103 c 4.462,-0.022 8.096,-3.688 8.074,-8.149 z"
       clipPath="url(#printerClip)"
       style={{vectorEffect: "non-scaling-stroke", fill: "#4effbb", fillRule: "evenodd", stroke: "none"}}
       id="path1" /></g><g
     id="XMLID_18_"><g
       id="g4"><g
         id="g2"><path
           d="m 261.232,74.022 v 152.101 c 0,4.462 -3.65,8.112 -8.112,8.112 h -22.957 v 51.713 c 0,4.462 -3.609,8.112 -8.112,8.112 H 67.92 c -4.462,0 -8.112,-3.65 -8.112,-8.112 V 234.235 H 40.946 c -4.462,0 -8.112,-3.65 -8.112,-8.112 V 74.022 c 0,-4.502 3.65,-8.112 8.112,-8.112 H 59.808 V 8.112 C 59.808,3.609 63.458,0 67.92,0 h 154.128 c 4.502,0 8.112,3.609 8.112,8.112 V 65.91 h 22.957 c 4.462,0 8.115,3.609 8.115,8.112 z M 245.005,218.011 V 82.134 H 49.058 v 135.877 h 10.75 v -61.852 c 0,-4.502 3.65,-8.112 8.112,-8.112 h 154.128 c 4.502,0 8.112,3.609 8.112,8.112 v 61.856 h 14.845 z m -31.069,59.828 V 164.27 H 76.032 v 113.569 z m 0,-211.929 V 16.224 H 76.032 V 65.91 Z"
           style={{vectorEffect: "non-scaling-stroke", fill: "#222051", fillRule: "evenodd", stroke: "none"}}
           id="path2" /></g><g
         id="g3"><path
           d="m 49.058,82.134 v 135.877 h 10.75 v -61.852 c 0,-4.502 3.65,-8.112 8.112,-8.112 h 154.128 c 4.502,0 8.112,3.609 8.112,8.112 v 61.856 h 14.845 V 82.134 Z m 26.325,33.788 c -5.232,0 -9.49,-4.217 -9.49,-9.45 0,-5.232 4.258,-9.49 9.49,-9.49 5.232,0 9.45,4.258 9.45,9.49 0,5.233 -4.217,9.45 -9.45,9.45 z m 30.42,0 c -5.232,0 -9.49,-4.217 -9.49,-9.45 0,-5.232 4.258,-9.49 9.49,-9.49 5.232,0 9.45,4.258 9.45,9.49 0,5.233 -4.217,9.45 -9.45,9.45 z"
           style={{vectorEffect: "non-scaling-stroke", fill: "#302c58", fillRule: "evenodd", stroke: "none"}}
           id="path3" /></g></g></g></svg>

);

export default Printer; 