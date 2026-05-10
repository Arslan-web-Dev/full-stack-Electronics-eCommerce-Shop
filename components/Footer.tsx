
import { navigation } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const Footer = () => {
  return (
    <footer className="bg-slate-950 text-slate-300" aria-labelledby="footer-heading">
      <div>
        <h2 id="footer-heading" className="sr-only">
          Footer
        </h2>
        <div className="mx-auto max-w-screen-2xl px-6 lg:px-8 pt-24 pb-14">
          <div className="xl:grid xl:grid-cols-3 xl:gap-12">
            <div className="flex flex-col gap-y-6">
              <Link href="/" className="flex items-center gap-x-2">
                <span className="text-3xl font-black tracking-tighter text-white">
                  ARSLAN <span className="text-blue-500">ELECTRONICS</span>
                </span>
              </Link>
              <p className="text-slate-400 max-w-xs leading-relaxed">
                Your premier destination for the latest in smart electronics and technology in Pakistan. Innovating your lifestyle, one gadget at a time.
              </p>
              <div className="flex gap-x-4 mt-2">
                {/* Social icons placeholder */}
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-primary-600 transition-colors cursor-pointer">
                  <span className="sr-only">Facebook</span>
                  <div className="w-4 h-4 bg-white/20 rounded-sm"></div>
                </div>
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-primary-600 transition-colors cursor-pointer">
                  <span className="sr-only">Twitter</span>
                  <div className="w-4 h-4 bg-white/20 rounded-sm"></div>
                </div>
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-primary-600 transition-colors cursor-pointer">
                  <span className="sr-only">Instagram</span>
                  <div className="w-4 h-4 bg-white/20 rounded-sm"></div>
                </div>
              </div>
            </div>
            <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
              <div className="md:grid md:grid-cols-2 md:gap-8">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-widest text-primary-400 leading-6">
                    Collection
                  </h3>
                  <ul role="list" className="mt-6 space-y-4">
                    {navigation.sale.map((item) => (
                      <li key={item.name}>
                        <a
                          href={item.href}
                          className="text-sm leading-6 text-slate-400 hover:text-white transition-colors"
                        >
                          {item.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-10 md:mt-0">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-primary-400 leading-6">
                    Company
                  </h3>
                  <ul role="list" className="mt-6 space-y-4">
                    {navigation.about.map((item) => (
                      <li key={item.name}>
                        <a
                          href={item.href}
                          className="text-sm leading-6 text-slate-400 hover:text-white transition-colors"
                        >
                          {item.name}
                        </a>
                      </li>
                    ))}
                    <li>
                      <Link href="/creator" className="text-sm leading-6 text-purple-400 hover:text-white transition-colors font-bold">
                        Meet the Creator
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="md:grid md:grid-cols-2 md:gap-8">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-widest text-primary-400 leading-6">
                    Customer Service
                  </h3>
                  <ul role="list" className="mt-6 space-y-4">
                    {navigation.buy.map((item) => (
                      <li key={item.name}>
                        <a
                          href={item.href}
                          className="text-sm leading-6 text-slate-400 hover:text-white transition-colors"
                        >
                          {item.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-10 md:mt-0">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-primary-400 leading-6">
                    Resources
                  </h3>
                  <ul role="list" className="mt-6 space-y-4">
                    {navigation.help.map((item) => (
                      <li key={item.name}>
                        <a
                          href={item.href}
                          className="text-sm leading-6 text-slate-400 hover:text-white transition-colors"
                        >
                          {item.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-16 border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs leading-5 text-slate-500">
              &copy; {new Date().getFullYear()} Arslan Electronics. All rights reserved.
            </p>
            <div className="flex gap-x-6">
               <span className="text-xs text-slate-600">Privacy Policy</span>
               <span className="text-xs text-slate-600">Terms of Service</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

