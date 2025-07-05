import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const Home = () => {
  const heroRef = useRef();
  const featuresRef = useRef();
  const ctaRef = useRef();

  useEffect(() => {
    const tl = gsap.timeline();
    
    tl.fromTo('.hero-title', 
      { opacity: 0, y: 100, rotationX: -30 },
      { opacity: 1, y: 0, rotationX: 0, duration: 1.2, ease: 'power3.out' }
    )
    .fromTo('.hero-subtitle', 
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }, '-=0.5'
    )
    .fromTo('.hero-cta', 
      { opacity: 0, scale: 0.8 },
      { opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(1.7)' }, '-=0.3'
    );

    gsap.to('.floating-cube', {
      y: -20,
      rotationX: 360,
      rotationY: 360,
      duration: 4,
      repeat: -1,
      ease: 'none'
    });

    gsap.to('.particle', {
      y: -100,
      opacity: 0,
      duration: 3,
      repeat: -1,
      stagger: 0.2
    });

    ScrollTrigger.create({
      trigger: '.features-section',
      start: 'top 80%',
      onEnter: () => {
        gsap.fromTo('.feature-card', 
          { opacity: 0, y: 100, rotationY: -15 },
          { opacity: 1, y: 0, rotationY: 0, duration: 0.8, stagger: 0.2, ease: 'power3.out' }
        );
      }
    });

    ScrollTrigger.create({
      trigger: '.stats-section',
      start: 'top 80%',
      onEnter: () => {
        gsap.fromTo('.stat-number', 
          { innerText: 0 },
          { 
            innerText: (i, el) => el.dataset.value,
            duration: 2,
            snap: { innerText: 1 },
            ease: 'power2.out'
          }
        );
      }
    });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 overflow-hidden">
      
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center px-6">
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div 
              key={i}
              className="particle absolute w-2 h-2 bg-cyan-400 rounded-full opacity-70"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`
              }}
            />
          ))}
        </div>

        <div className="text-center z-10 max-w-4xl">
          <div className="floating-cube w-32 h-32 bg-gradient-to-r from-cyan-400 to-purple-400 mx-auto mb-8 rounded-3xl transform perspective-1000 opacity-80"></div>
          
          <h1 className="hero-title text-6xl md:text-8xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-6">
            PrepFire
          </h1>
          
          <p className="hero-subtitle text-xl md:text-2xl text-gray-300 mb-12 max-w-2xl mx-auto">
            Master coding interviews with AI-powered problems, real-time feedback, and personalized learning paths
          </p>
          
          <div className="hero-cta flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/auth"
              className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold rounded-2xl hover:from-cyan-600 hover:to-purple-600 transform hover:scale-105 transition-all duration-200 shadow-2xl text-center"
            >
              Start Coding Now
            </Link>
            <Link 
              to="/auth"
              className="px-8 py-4 backdrop-blur-xl bg-white/10 border border-white/20 text-white font-semibold rounded-2xl hover:bg-white/20 transform hover:scale-105 transition-all duration-200 text-center"
            >
              Watch Demo
            </Link>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/60 rounded-full mt-2"></div>
          </div>
        </div>
      </section>

      <section ref={featuresRef} className="features-section py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Why Choose PrepFire?
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Experience the future of coding preparation with our advanced features
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="feature-card backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl transform hover:scale-105 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-2xl flex items-center justify-center text-3xl mb-6">
                🤖
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">AI-Powered Problems</h3>
              <p className="text-gray-300">
                Generate unlimited coding problems tailored to your skill level with detailed explanations and hints
              </p>
            </div>

            <div className="feature-card backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl transform hover:scale-105 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-400 rounded-2xl flex items-center justify-center text-3xl mb-6">
                📊
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Smart Analytics</h3>
              <p className="text-gray-300">
                Track your progress with detailed analytics and get personalized recommendations for improvement
              </p>
            </div>

            <div className="feature-card backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl transform hover:scale-105 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-emerald-400 rounded-2xl flex items-center justify-center text-3xl mb-6">
                ⚡
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Real-time Feedback</h3>
              <p className="text-gray-300">
                Get instant feedback on your code with advanced testing and performance optimization suggestions
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="stats-section py-20 px-6 bg-gradient-to-r from-cyan-500/10 to-purple-500/10">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="stat-number text-4xl md:text-5xl font-bold text-cyan-400 mb-2" data-value="10000">0</div>
              <p className="text-gray-300">Problems Solved</p>
            </div>
            <div>
              <div className="stat-number text-4xl md:text-5xl font-bold text-purple-400 mb-2" data-value="5000">0</div>
              <p className="text-gray-300">Active Users</p>
            </div>
            <div>
              <div className="stat-number text-4xl md:text-5xl font-bold text-pink-400 mb-2" data-value="98">0</div>
              <p className="text-gray-300">Success Rate %</p>
            </div>
            <div>
              <div className="stat-number text-4xl md:text-5xl font-bold text-green-400 mb-2" data-value="24">0</div>
              <p className="text-gray-300">Languages</p>
            </div>
          </div>
        </div>
      </section>

      <section ref={ctaRef} className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Level Up?
          </h2>
          <p className="text-xl text-gray-300 mb-12">
            Join thousands of developers who've improved their coding skills with PrepFire
          </p>
          <Link 
            to="/auth"
            className="inline-block px-12 py-5 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-bold text-xl rounded-3xl hover:from-cyan-600 hover:to-purple-600 transform hover:scale-110 transition-all duration-300 shadow-2xl"
          >
            Start Your Journey
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;