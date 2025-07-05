import React, { useState, useEffect } from 'react';
import { gsap } from 'gsap';
import Header from './Header';
import Footer from './Footer';

const Layout = ({ children }) => {
  const [activeSection, setActiveSection] = useState('dashboard');

  useEffect(() => {
    const floatingElements = document.querySelectorAll('.floating-element');
    floatingElements.forEach((el, index) => {
      gsap.to(el, {
        y: Math.sin(index) * 20,
        rotation: Math.cos(index) * 5,
        duration: 3 + index * 0.5,
        repeat: -1,
        yoyo: true,
        ease: 'power2.inOut'
      });
    });

    gsap.to('.page-transition', {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: 'power3.out'
    });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 relative overflow-hidden">
      
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="floating-element absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-cyan-400/10 to-purple-400/10 rounded-full blur-xl"></div>
        <div className="floating-element absolute top-40 right-20 w-24 h-24 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-full blur-xl"></div>
        <div className="floating-element absolute bottom-20 left-1/4 w-40 h-40 bg-gradient-to-r from-blue-400/10 to-cyan-400/10 rounded-full blur-xl"></div>
        <div className="floating-element absolute top-1/2 right-10 w-20 h-20 bg-gradient-to-r from-pink-400/10 to-purple-400/10 rounded-full blur-xl"></div>
      </div>

      <Header />

      <main className="page-transition opacity-0 translate-y-4 pt-20 min-h-screen relative z-10">
        {children}
      </main>

      <Footer />

      <div className="fixed bottom-6 right-6 z-40">
        <div className="flex flex-col space-y-3">
          <button className="w-14 h-14 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200 flex items-center justify-center text-white text-xl group relative overflow-hidden">
            <span className="relative z-10">💬</span>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full"></div>
          </button>
          
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="w-12 h-12 bg-gradient-to-r from-gray-700 to-gray-800 rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200 flex items-center justify-center text-white text-lg group relative overflow-hidden"
          >
            <span className="relative z-10">↑</span>
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full"></div>
          </button>
        </div>
      </div>

      <div className="fixed top-1/2 left-4 transform -translate-y-1/2 z-30 hidden xl:block">
        <div className="flex flex-col space-y-4">
          {[
            { icon: '📊', label: 'Analytics', color: 'cyan' },
            { icon: '🎯', label: 'Goals', color: 'purple' },
            { icon: '🔥', label: 'Streak', color: 'orange' },
            { icon: '🏆', label: 'Achievements', color: 'yellow' }
          ].map((item, index) => (
            <div key={index} className="group relative">
              <button className="w-12 h-12 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-xl hover:bg-white/10 transition-all duration-200 transform hover:scale-110 flex items-center justify-center">
                {item.icon}
              </button>
              
              <div className="absolute left-full ml-4 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none">
                <div className="bg-black/80 backdrop-blur-sm text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap border border-white/20">
                  {item.label}
                  <div className="absolute right-full top-1/2 transform -translate-y-1/2 w-2 h-2 bg-black/80 rotate-45 border-l border-b border-white/20"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,255,255,0.03)_0%,transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(139,92,246,0.03)_0%,transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(236,72,153,0.03)_0%,transparent_50%)]"></div>
      </div>
    </div>
  );
};

export default Layout;