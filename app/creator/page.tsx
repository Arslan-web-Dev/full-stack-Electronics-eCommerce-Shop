import React from "react";
import Image from "next/image";
import Link from "next/link";
import { FaGithub, FaLinkedin, FaGlobe, FaWhatsapp } from "react-icons/fa6";

const CreatorPage = () => {
  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-screen-xl mx-auto px-5 py-20">
        <div className="flex flex-col items-center text-center space-y-8">
          {/* Profile Image with Gradient Border */}
          <div className="relative p-1 rounded-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 shadow-2xl">
            <div className="relative w-48 h-48 rounded-full overflow-hidden border-4 border-white bg-slate-100">
               <Image 
                src="https://raw.githubusercontent.com/Arslan-web-Dev/My-projects-picks/main/personalpicks.png"
                alt="Muhammad Arslan" 
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* Heading */}
          <div className="space-y-4">
            <h1 className="text-5xl font-extrabold text-slate-900 tracking-tight">
              Meet the Creator
            </h1>
            <p className="text-2xl font-medium bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
              Muhammad Arslan
            </p>
          </div>

          {/* Description */}
          <div className="max-w-2xl text-lg text-slate-600 leading-relaxed">
            <p>
              Hi there! I am the lead developer and visionary behind <strong>Arslan Electronics</strong>. 
              My mission was to create a seamless, high-performance electronics shopping experience 
              that combines state-of-the-art technology with an intuitive user interface.
            </p>
            <p className="mt-4">
              Building this platform involved complex full-stack engineering, 
              from the high-performance Next.js frontend to the robust MongoDB Atlas cloud backend. 
              Every pixel and every line of code was crafted with passion and precision.
            </p>
          </div>

          {/* Social Links */}
          <div className="flex gap-6 text-3xl text-slate-700">
            <a href="https://wa.me/923275541708" target="_blank" rel="noopener noreferrer" className="hover:text-green-500 transition-all hover:scale-110">
              <FaWhatsapp />
            </a>
            <a href="#" className="hover:text-slate-900 transition-all hover:scale-110">
              <FaGithub />
            </a>
            <a href="#" className="hover:text-blue-700 transition-all hover:scale-110">
              <FaLinkedin />
            </a>
            <a href="#" className="hover:text-blue-500 transition-all hover:scale-110">
              <FaGlobe />
            </a>
          </div>

          {/* CTA Button */}
          <div className="pt-10">
            <Link 
              href="/"
              className="px-10 py-4 bg-slate-900 text-white font-bold rounded-full hover:bg-blue-600 transition-all shadow-xl hover:shadow-blue-500/50"
            >
              Back to Shop
            </Link>
          </div>
        </div>

        {/* Tech Stack Section */}
        <div className="mt-32 pt-20 border-t border-slate-100">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">Built with Modern Tech Stack</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-md transition-all">
              <div className="text-blue-500 font-bold text-xl mb-2">Next.js</div>
              <p className="text-sm text-slate-500">Frontend Framework</p>
            </div>
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-md transition-all">
              <div className="text-purple-600 font-bold text-xl mb-2">Prisma</div>
              <p className="text-sm text-slate-500">Database ORM</p>
            </div>
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-md transition-all">
              <div className="text-green-600 font-bold text-xl mb-2">MongoDB Atlas</div>
              <p className="text-sm text-slate-500">Cloud Database</p>
            </div>
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-md transition-all">
              <div className="text-cyan-500 font-bold text-xl mb-2">Tailwind CSS</div>
              <p className="text-sm text-slate-500">Styling Library</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatorPage;
