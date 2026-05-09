// *********************
// Role of the component: IntroducingSection with the text "Introducing Singitronic"
// Name of the component: IntroducingSection.tsx
// Developer: Aleksandar Kuzmanovic
// Version: 1.0
// Component call: <IntroducingSection />
// Input parameters: no input parameters
// Output: Section with the text "Introducing Singitronic" and button
// *********************

import Link from "next/link";
import React from "react";

const IntroducingSection = () => {
  return (
    <div className="py-24 bg-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary-100/50 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-accent/10 rounded-full blur-3xl"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center flex flex-col gap-y-8 items-center max-w-4xl mx-auto">
          <h2 className="text-slate-900 text-7xl font-black tracking-tighter mb-2 max-md:text-5xl max-[480px]:text-3xl uppercase">
            INTRODUCING <span className="text-primary-600">SINGI</span><span className="text-accent">TRONIC</span>
          </h2>
          <div className="space-y-4">
            <p className="text-slate-600 text-2xl font-medium max-md:text-xl max-[480px]:text-lg leading-relaxed">
              Experience the pinnacle of electronic innovation. 
              We bring you the latest tech that blends perfectly with your lifestyle.
            </p>
            <div className="pt-6">
              <Link href="/shop" className="inline-flex items-center justify-center text-white bg-slate-900 font-bold px-12 py-4 text-xl rounded-full hover:bg-primary-600 transition-all hover:scale-105 active:scale-95 shadow-xl hover:shadow-primary-500/20 w-auto min-w-[240px]">
                EXPLORE SHOP
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntroducingSection;
