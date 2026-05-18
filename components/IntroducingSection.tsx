"use client";

import Link from "next/link";
import React from "react";
import { FaFingerprint, FaShieldAlt, FaSyncAlt } from "react-icons/fa";

const IntroducingSection = () => {
  return (
    <div className="py-32 bg-[#030408] relative overflow-hidden border-b border-indigo-950/40">
      
      {/* Dynamic Laser Grid Scanning Overlays */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,#1e1b4b_0%,transparent_100%)] opacity-40 pointer-events-none" />

      {/* Cyberpunk corner decorative lines */}
      <div className="absolute top-10 left-10 w-8 h-8 border-t-2 border-l-2 border-indigo-500/30 pointer-events-none max-md:hidden" />
      <div className="absolute top-10 right-10 w-8 h-8 border-t-2 border-r-2 border-indigo-500/30 pointer-events-none max-md:hidden" />
      <div className="absolute bottom-10 left-10 w-8 h-8 border-b-2 border-l-2 border-indigo-500/30 pointer-events-none max-md:hidden" />
      <div className="absolute bottom-10 right-10 w-8 h-8 border-b-2 border-r-2 border-indigo-500/30 pointer-events-none max-md:hidden" />

      <div className="container mx-auto px-6 relative z-10">
        
        {/* Holographic scanner panel */}
        <div className="relative max-w-5xl mx-auto rounded-3xl p-12 max-md:p-6 bg-slate-950/40 border border-indigo-500/20 shadow-[0_0_50px_rgba(99,102,241,0.1)] backdrop-blur-xl overflow-hidden group">
          
          {/* Animated Glowing Laser Scanner Line */}
          <div className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-85 shadow-[0_0_12px_#22d3ee] animate-bounce pointer-events-none" 
               style={{ animationDuration: "6s" }} />

          <div className="grid grid-cols-12 gap-8 items-center">
            
            {/* Tech details column (Left 7 cols) */}
            <div className="col-span-7 max-lg:col-span-12 space-y-6 text-left max-lg:text-center">
              <span className="text-xs font-black text-cyan-400 tracking-widest uppercase block">
                // ARSLAN LABS NEURAL PLATFORM
              </span>
              
              <h2 className="text-white text-6xl font-black tracking-tighter leading-tight uppercase max-md:text-4xl">
                INTELLIGENT <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
                  STORE ARCHITECTURE
                </span>
              </h2>

              <p className="text-slate-400 text-lg leading-relaxed">
                Step inside the workspace of tomorrow. Our custom MERN platform combines hardware-optimized security, persistent session management, and micro-latency database querying to bring you immediate consumer access.
              </p>

              {/* High-Tech HUD Specs Grid */}
              <div className="grid grid-cols-3 gap-4 pt-4 max-sm:grid-cols-1">
                <div className="flex items-center gap-x-2 text-xs font-bold text-slate-300">
                  <FaFingerprint className="text-cyan-400 text-base" />
                  <span>SECURE JWT AUTH</span>
                </div>
                <div className="flex items-center gap-x-2 text-xs font-bold text-slate-300">
                  <FaShieldAlt className="text-indigo-400 text-base" />
                  <span>STRIPE SAFEGUARD</span>
                </div>
                <div className="flex items-center gap-x-2 text-xs font-bold text-slate-300">
                  <FaSyncAlt className="text-sky-400 text-base" />
                  <span>REAL-TIME UPDATE</span>
                </div>
              </div>

              {/* Call to action button */}
              <div className="pt-6">
                <Link 
                  href="/shop" 
                  className="inline-flex items-center justify-center text-white bg-slate-900 border border-indigo-500/30 hover:border-cyan-400/50 hover:bg-slate-800 font-extrabold px-12 py-4 text-lg rounded-full transition-all duration-300 hover:scale-[1.04] active:scale-95 shadow-xl w-auto min-w-[240px]"
                >
                  <span>LAUNCH EXPLORER</span>
                </Link>
              </div>
            </div>

            {/* Glowing HUD Tech Sphere decoration (Right 5 cols) */}
            <div className="col-span-5 max-lg:col-span-12 flex justify-center items-center relative py-10">
              
              {/* Rotating outer ring */}
              <div className="w-56 h-56 rounded-full border border-dashed border-cyan-400/20 animate-spin-slow flex items-center justify-center">
                
                {/* Rotating inner ring */}
                <div className="w-40 h-40 rounded-full border border-indigo-500/20 animate-reverse-spin-slow flex items-center justify-center">
                  
                  {/* Central glowing core */}
                  <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-500/20 to-cyan-500/20 border border-indigo-400/40 shadow-[0_0_30px_rgba(99,102,241,0.4)] flex items-center justify-center backdrop-blur-md">
                    <span className="text-[10px] font-black text-white font-mono tracking-widest animate-pulse">ACTIVE</span>
                  </div>
                </div>
              </div>

              {/* Cyber labels */}
              <div className="absolute top-2 left-10 bg-slate-950 border border-indigo-500/30 rounded px-2 py-0.5 text-[8px] text-indigo-300 font-mono">
                [ STATUS: ENCRYPTED ]
              </div>
              <div className="absolute bottom-2 right-10 bg-slate-950 border border-cyan-500/30 rounded px-2 py-0.5 text-[8px] text-cyan-300 font-mono">
                [ SHIELD: 100% ]
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default IntroducingSection;
