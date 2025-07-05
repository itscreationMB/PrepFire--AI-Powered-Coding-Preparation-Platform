import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const Footer = () => {
  const [email, setEmail] = useState('');
  const footerRef = useRef();

  useEffect(() => {
    gsap.fromTo('.footer-section',
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 0.8, stagger: 0.2, ease: 'power3.out' }
    );

    gsap.to('.floating-particle', {
      y: -20,
      duration: 2,
      repeat: -1,
      yoyo: true,
      ease: 'power2.inOut',
      stagger: 0.3
    });
  }, []);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      alert('Thank you for subscribing!');
      setEmail('');
    }
  };

  const SocialIcon = ({ icon, href, label }) => (
    <a
      href={href}
      className="group relative w-12 h-12 rounded-xl backdrop-blur-sm bg-white/5 border border-white/10 flex items-center justify-center text-gray-300 hover:text-white transition-all duration-300 transform hover:scale-110"
      aria-label={label}
    >
      <span className="text-xl relative z-10">{icon}</span>
    </a>
  );

  const FooterLink = ({ href, children }) => (
    <a
      href={href}
      className="block text-gray-300 hover:text-cyan-400 transition-colors duration-200 py-1"
    >
      {children}
    </a>
  );

  return (
    <footer
      ref={footerRef}
      className="relative bg-gradient-to-br from-gray-900/95 via-purple-900/95 to-blue-900/95 backdrop-blur-xl border-t border-white/10 overflow-hidden"
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className="floating-particle absolute w-1 h-1 bg-cyan-400/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 4}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          
          <div className="footer-section space-y-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">P</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  PrepFire
                </h3>
                <p className="text-xs text-gray-400 -mt-1">AI Coding Preparation</p>
              </div>
            </div>
            
            <p className="text-gray-300 leading-relaxed">
              Master coding interviews with AI-powered problems, real-time feedback, and personalized learning paths.
            </p>
            
            <div className="flex space-x-3">
              <SocialIcon icon="📘" href="#" label="Facebook" />
              <SocialIcon icon="🐦" href="#" label="Twitter" />
              <SocialIcon icon="💼" href="#" label="LinkedIn" />
              <SocialIcon icon="📱" href="#" label="Instagram" />
              <SocialIcon icon="🎮" href="#" label="Discord" />
            </div>
          </div>

          <div className="footer-section space-y-6">
            <h4 className="text-xl font-bold text-white">Platform</h4>
            <nav className="space-y-2">
              <FooterLink href="/practice">Practice Problems</FooterLink>
              <FooterLink href="/contests">Contests</FooterLink>
              <FooterLink href="/learn">Learning Paths</FooterLink>
              <FooterLink href="/leaderboard">Leaderboard</FooterLink>
              <FooterLink href="/analytics">Analytics</FooterLink>
            </nav>
          </div>

          <div className="footer-section space-y-6">
            <h4 className="text-xl font-bold text-white">Company</h4>
            <nav className="space-y-2">
              <FooterLink href="/about">About Us</FooterLink>
              <FooterLink href="/careers">Careers</FooterLink>
              <FooterLink href="/blog">Blog</FooterLink>
              <FooterLink href="/contact">Contact</FooterLink>
              <FooterLink href="/partners">Partners</FooterLink>
            </nav>
          </div>

          <div className="footer-section space-y-6">
            <h4 className="text-xl font-bold text-white">Stay Updated</h4>
            <p className="text-gray-300">
              Get the latest coding challenges and platform updates.
            </p>
            
            <form onSubmit={handleSubscribe} className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all duration-200"
                required
              />
              
              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold rounded-xl hover:from-cyan-600 hover:to-purple-600 transform hover:scale-105 transition-all duration-200 shadow-lg"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex flex-wrap items-center space-x-6 text-sm text-gray-400">
              <FooterLink href="/privacy">Privacy Policy</FooterLink>
              <FooterLink href="/terms">Terms of Service</FooterLink>
              <FooterLink href="/security">Security</FooterLink>
            </div>
            
            <div className="text-sm text-gray-400">
              © 2024 PrepFire. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;