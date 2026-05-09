// *********************
// Role of the component: Classical hero component on home page
// Name of the component: Hero.tsx
// Developer: Aleksandar Kuzmanovic
// Version: 1.0
// Component call: <Hero />
// Input parameters: no input parameters
// Output: Classical hero component with two columns on desktop and one column on smaller devices
// *********************

import Image from "next/image";
import React from "react";

const Hero = () => {
  return (
    <div className="relative min-h-[700px] w-full bg-mesh-gradient overflow-hidden flex items-center py-20 max-lg:min-h-[800px]">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/20 rounded-full blur-[120px] animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-[120px] animate-pulse-slow delay-1000"></div>
      </div>

      <div className="relative grid grid-cols-2 items-center gap-x-20 max-w-screen-2xl mx-auto px-10 h-full max-lg:grid-cols-1 max-lg:text-center max-lg:gap-y-16">
        <div className="flex flex-col gap-y-8 animate-fade-up">
          <h1 className="text-7xl text-white font-extrabold tracking-tight max-xl:text-6xl max-md:text-5xl max-sm:text-4xl leading-tight">
            THE PRODUCT <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-accent">
              OF THE FUTURE
            </span>
          </h1>
          <p className="text-slate-300 text-xl max-w-xl max-lg:mx-auto max-sm:text-base leading-relaxed">
            Experience innovation like never before. Our latest smart technology 
            combines elegant design with powerful performance to keep you 
            connected and ahead of the curve.
          </p>
          <div className="flex gap-x-4 max-lg:justify-center max-sm:flex-col max-sm:gap-y-4">
            <button className="bg-primary-500 text-white font-bold px-10 py-4 rounded-full hover:bg-primary-600 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary-500/25">
              BUY NOW
            </button>
            <button className="glass-effect text-white font-bold px-10 py-4 rounded-full hover:bg-white/20 transition-all hover:scale-105 active:scale-95">
              LEARN MORE
            </button>
          </div>
        </div>
        <div className="relative flex justify-center animate-fade-up delay-200">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary-500/10 rounded-full blur-[80px]"></div>
          <Image
            src="/watch for banner.png"
            width={500}
            height={500}
            alt="smart watch"
            className="relative z-10 w-[500px] h-auto animate-float drop-shadow-2xl max-md:w-[350px] max-sm:w-[280px]"
          />
        </div>
      </div>
    </div>
  );
};

export default Hero;
