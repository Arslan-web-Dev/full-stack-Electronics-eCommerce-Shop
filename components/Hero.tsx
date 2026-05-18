"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { FaBolt, FaGlobe, FaSlidersH, FaServer } from "react-icons/fa";

// Dynamically load Three.js component with SSR disabled to prevent hydration/prerendering failures
const Futuristic3DCanvas = dynamic(() => import("./Futuristic3DCanvas"), {
  ssr: false,
});

const Hero = () => {
  // Live ticking telemetry values
  const [coreFreq, setCoreFreq] = useState(4.82);
  const [systemLoad, setSystemLoad] = useState(18);
  const [networkLatency, setNetworkLatency] = useState(12);

  useEffect(() => {
    const timer = setInterval(() => {
      setCoreFreq(Number((4.8 + Math.random() * 0.08).toFixed(2)));
      setSystemLoad(Math.floor(15 + Math.random() * 8));
      setNetworkLatency(Math.floor(8 + Math.random() * 6));
    }, 2000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative min-h-[850px] w-full bg-[#05070f] overflow-hidden flex items-center py-20 border-b border-indigo-950/40">
      
      {/* Immersive Sci-fi Background Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-35" />

      {/* Futuristic Ambient Glowing Orbs */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-sky-500/10 rounded-full blur-[140px] animate-pulse-slow pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[140px] animate-pulse-slow pointer-events-none delay-1000" />

      <div className="relative z-10 max-w-screen-2xl mx-auto px-10 max-md:px-4 w-full grid grid-cols-12 gap-10 items-center">
        
        {/* Left Side: Cyberpunk HUD Info & Typography */}
        <div className="col-span-6 max-lg:col-span-12 space-y-8 text-left max-lg:text-center animate-fade-up">
          
          {/* Futuristic Scanning Badge */}
          <div className="inline-flex items-center gap-x-2 bg-indigo-950/60 border border-indigo-500/30 px-4 py-1.5 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.15)] backdrop-blur-md">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-black text-indigo-300 tracking-widest uppercase">QUANTUM CORE V.3 SYSTEM CONNECTED</span>
          </div>

          <div className="space-y-4">
            <h1 className="text-8xl font-black text-white leading-none tracking-tighter max-2xl:text-7xl max-md:text-6xl max-sm:text-4xl">
              THE NEXT <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-400 to-sky-400 drop-shadow-[0_2px_10px_rgba(56,189,248,0.2)]">
                EVOLUTION
              </span>
            </h1>
            <p className="text-slate-400 text-lg max-w-lg max-lg:mx-auto leading-relaxed">
              Unlock a hyper-dimensional experience with neural computing, hardware-accelerated displays, and intelligent interface response systems designed for the next digital era.
            </p>
          </div>

          {/* Futuristic HUD Telemetry Live Panels */}
          <div className="grid grid-cols-3 gap-4 max-w-lg max-lg:mx-auto">
            <div className="bg-slate-950/60 border border-indigo-950/80 rounded-xl p-3 shadow-inner backdrop-blur-md">
              <span className="text-[10px] font-bold text-gray-500 block uppercase tracking-wider">CORE FREQ</span>
              <span className="text-lg font-black text-cyan-400 font-mono tracking-tight">{coreFreq} GHz</span>
              <div className="w-full bg-slate-900 h-1 rounded-full mt-2 overflow-hidden">
                <div 
                  className="bg-cyan-400 h-full transition-all duration-1000"
                  style={{ width: `${(coreFreq - 4.7) * 400}%` }}
                />
              </div>
            </div>

            <div className="bg-slate-950/60 border border-indigo-950/80 rounded-xl p-3 shadow-inner backdrop-blur-md">
              <span className="text-[10px] font-bold text-gray-500 block uppercase tracking-wider">SYSTEM LOAD</span>
              <span className="text-lg font-black text-indigo-400 font-mono tracking-tight">{systemLoad} %</span>
              <div className="w-full bg-slate-900 h-1 rounded-full mt-2 overflow-hidden">
                <div 
                  className="bg-indigo-400 h-full transition-all duration-1000"
                  style={{ width: `${systemLoad * 4.5}%` }}
                />
              </div>
            </div>

            <div className="bg-slate-950/60 border border-indigo-950/80 rounded-xl p-3 shadow-inner backdrop-blur-md">
              <span className="text-[10px] font-bold text-gray-500 block uppercase tracking-wider">LATENCY</span>
              <span className="text-lg font-black text-sky-400 font-mono tracking-tight">{networkLatency} ms</span>
              <div className="w-full bg-slate-900 h-1 rounded-full mt-2 overflow-hidden">
                <div 
                  className="bg-sky-400 h-full transition-all duration-1000"
                  style={{ width: `${(15 - networkLatency) * 10}%` }}
                />
              </div>
            </div>
          </div>

          {/* Glowing Call to Actions */}
          <div className="flex gap-x-4 max-lg:justify-center max-sm:flex-col max-sm:gap-y-4 pt-2">
            <button className="relative overflow-hidden group bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white font-extrabold px-12 py-4 rounded-full transition-all duration-300 hover:scale-[1.04] active:scale-95 shadow-[0_0_30px_rgba(99,102,241,0.35)] hover:shadow-[0_0_40px_rgba(99,102,241,0.55)]">
              <span className="relative z-10 flex items-center justify-center gap-x-2">
                <FaBolt className="text-sm text-yellow-300 animate-pulse" />
                <span>EXPLORE STORAGE</span>
              </span>
            </button>
            
            <button className="relative bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-white font-extrabold px-10 py-4 rounded-full transition-all duration-300 hover:scale-[1.04] active:scale-95 backdrop-blur-md">
              <span>INTERFACE SPECS</span>
            </button>
          </div>
        </div>

        {/* Right Side: Immersive 3D Hardware Canvas Container */}
        <div className="col-span-6 max-lg:col-span-12 flex justify-center items-center relative animate-fade-up delay-200">
          
          {/* Circular Holographic Orbit Background overlay */}
          <div className="absolute w-[450px] h-[450px] rounded-full border border-indigo-500/10 animate-spin-slow pointer-events-none" />
          <div className="absolute w-[350px] h-[350px] rounded-full border border-indigo-500/5 animate-reverse-spin-slow pointer-events-none" />
          
          {/* WebGL 3D Canvas element */}
          <div className="relative z-10 scale-110">
            <Futuristic3DCanvas />
          </div>

          {/* Hover Telemetry HUD Callouts */}
          <div className="absolute top-10 right-4 bg-slate-950/80 border border-cyan-500/20 rounded-xl px-4 py-2 text-[10px] text-cyan-300 font-mono backdrop-blur-md shadow-lg pointer-events-none max-sm:hidden">
            <span>[ SCAN_DENSITY: 800_PTS ]</span>
          </div>

          <div className="absolute bottom-10 left-4 bg-slate-950/80 border border-indigo-500/20 rounded-xl px-4 py-2 text-[10px] text-indigo-300 font-mono backdrop-blur-md shadow-lg pointer-events-none max-sm:hidden">
            <span>[ SYSTEM: WebGL_ONLINE ]</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Hero;
