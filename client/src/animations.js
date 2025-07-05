// animations.js
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TextPlugin } from 'gsap/TextPlugin';

gsap.registerPlugin(ScrollTrigger, TextPlugin);

export const pageTransitions = {
  fadeIn: (element, duration = 0.8) => {
    return gsap.fromTo(element, 
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration, ease: 'power3.out' }
    );
  },

  slideInLeft: (element, duration = 0.8) => {
    return gsap.fromTo(element,
      { opacity: 0, x: -100 },
      { opacity: 1, x: 0, duration, ease: 'power3.out' }
    );
  },

  slideInRight: (element, duration = 0.8) => {
    return gsap.fromTo(element,
      { opacity: 0, x: 100 },
      { opacity: 1, x: 0, duration, ease: 'power3.out' }
    );
  },

  scaleIn: (element, duration = 0.6) => {
    return gsap.fromTo(element,
      { opacity: 0, scale: 0.8 },
      { opacity: 1, scale: 1, duration, ease: 'back.out(1.7)' }
    );
  },

  rotate3D: (element, duration = 1.2) => {
    return gsap.fromTo(element,
      { opacity: 0, rotationX: -90, transformOrigin: 'center bottom' },
      { opacity: 1, rotationX: 0, duration, ease: 'power3.out' }
    );
  }
};

export const hoverEffects = {
  cardHover: (element) => {
    const tl = gsap.timeline({ paused: true });
    tl.to(element, { scale: 1.05, y: -10, duration: 0.3, ease: 'power2.out' })
      .to(element.querySelector('.card-glow'), { opacity: 0.8, duration: 0.3 }, 0);
    
    element.addEventListener('mouseenter', () => tl.play());
    element.addEventListener('mouseleave', () => tl.reverse());
  },

  buttonHover: (element) => {
    const tl = gsap.timeline({ paused: true });
    tl.to(element, { scale: 1.1, duration: 0.2, ease: 'power2.out' })
      .to(element, { boxShadow: '0 20px 40px rgba(0,0,0,0.3)', duration: 0.2 }, 0);
    
    element.addEventListener('mouseenter', () => tl.play());
    element.addEventListener('mouseleave', () => tl.reverse());
  },

  glowEffect: (element, color = '#00ffff') => {
    const tl = gsap.timeline({ paused: true });
    tl.to(element, { 
      filter: `drop-shadow(0 0 20px ${color})`,
      duration: 0.3,
      ease: 'power2.out'
    });
    
    element.addEventListener('mouseenter', () => tl.play());
    element.addEventListener('mouseleave', () => tl.reverse());
  },

  float: (element, distance = 20) => {
    gsap.to(element, {
      y: -distance,
      duration: 2,
      repeat: -1,
      yoyo: true,
      ease: 'power2.inOut'
    });
  }
};

export const scrollAnimations = {
  parallax: (element, speed = 0.5) => {
    gsap.to(element, {
      yPercent: -100 * speed,
      ease: 'none',
      scrollTrigger: {
        trigger: element,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true
      }
    });
  },

  fadeInOnScroll: (elements, stagger = 0.1) => {
    gsap.fromTo(elements,
      { opacity: 0, y: 100 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: elements,
          start: 'top 80%',
          toggleActions: 'play none none reverse'
        }
      }
    );
  },

  countUp: (element, endValue, duration = 2) => {
    ScrollTrigger.create({
      trigger: element,
      start: 'top 80%',
      onEnter: () => {
        gsap.fromTo(element, 
          { innerText: 0 },
          { 
            innerText: endValue,
            duration,
            snap: { innerText: 1 },
            ease: 'power2.out'
          }
        );
      }
    });
  },

  morphOnScroll: (element) => {
    gsap.to(element, {
      borderRadius: '50%',
      rotation: 360,
      scale: 1.2,
      scrollTrigger: {
        trigger: element,
        start: 'top center',
        end: 'bottom center',
        scrub: 1
      }
    });
  }
};

export const loadingAnimations = {
  spinner: (element) => {
    gsap.to(element, {
      rotation: 360,
      duration: 1,
      repeat: -1,
      ease: 'none'
    });
  },

  pulse: (element) => {
    gsap.to(element, {
      scale: 1.2,
      opacity: 0.7,
      duration: 1,
      repeat: -1,
      yoyo: true,
      ease: 'power2.inOut'
    });
  },

  typewriter: (element, text, speed = 0.05) => {
    gsap.to(element, {
      duration: text.length * speed,
      text: text,
      ease: 'none'
    });
  },

  liquidFill: (element, percentage) => {
    gsap.to(element, {
      scaleX: percentage / 100,
      duration: 1.5,
      ease: 'power2.out',
      transformOrigin: 'left center'
    });
  }
};

export const particleSystem = {
  create: (container, count = 50) => {
    const particles = [];
    
    for (let i = 0; i < count; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.cssText = `
        position: absolute;
        width: 4px;
        height: 4px;
        background: linear-gradient(45deg, #00ffff, #ff00ff);
        border-radius: 50%;
        pointer-events: none;
      `;
      
      container.appendChild(particle);
      particles.push(particle);
      
      gsap.set(particle, {
        x: Math.random() * container.offsetWidth,
        y: Math.random() * container.offsetHeight,
        opacity: Math.random() * 0.8 + 0.2
      });
      
      gsap.to(particle, {
        x: `+=${Math.random() * 200 - 100}`,
        y: `+=${Math.random() * 200 - 100}`,
        duration: Math.random() * 3 + 2,
        repeat: -1,
        yoyo: true,
        ease: 'power1.inOut'
      });
    }
    
    return particles;
  },

  explode: (x, y, container, count = 20) => {
    const particles = [];
    
    for (let i = 0; i < count; i++) {
      const particle = document.createElement('div');
      particle.style.cssText = `
        position: absolute;
        width: 6px;
        height: 6px;
        background: #00ffff;
        border-radius: 50%;
        left: ${x}px;
        top: ${y}px;
      `;
      
      container.appendChild(particle);
      particles.push(particle);
      
      const angle = (360 / count) * i;
      const distance = Math.random() * 150 + 50;
      
      gsap.to(particle, {
        x: Math.cos(angle * Math.PI / 180) * distance,
        y: Math.sin(angle * Math.PI / 180) * distance,
        opacity: 0,
        scale: 0,
        duration: 1,
        ease: 'power2.out',
        onComplete: () => {
          particle.remove();
        }
      });
    }
  }
};

export const glassmorphismEffects = {
  init: (element) => {
    gsap.set(element, {
      backdropFilter: 'blur(10px)',
      background: 'rgba(255, 255, 255, 0.1)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '20px'
    });
  },

  hover: (element) => {
    const tl = gsap.timeline({ paused: true });
    tl.to(element, {
      backdropFilter: 'blur(20px)',
      background: 'rgba(255, 255, 255, 0.15)',
      duration: 0.3,
      ease: 'power2.out'
    });
    
    element.addEventListener('mouseenter', () => tl.play());
    element.addEventListener('mouseleave', () => tl.reverse());
  }
};

export const initAllAnimations = () => {
  ScrollTrigger.refresh();
  
  document.querySelectorAll('.animate-on-scroll').forEach(el => {
    scrollAnimations.fadeInOnScroll(el);
  });
  
  document.querySelectorAll('.hover-card').forEach(el => {
    hoverEffects.cardHover(el);
  });
  
  document.querySelectorAll('.hover-button').forEach(el => {
    hoverEffects.buttonHover(el);
  });
  
  document.querySelectorAll('.glass-card').forEach(el => {
    glassmorphismEffects.init(el);
    glassmorphismEffects.hover(el);
  });
  
  document.querySelectorAll('.floating-element').forEach(el => {
    hoverEffects.float(el);
  });
};

export default {
  pageTransitions,
  hoverEffects,
  scrollAnimations,
  loadingAnimations,
  particleSystem,
  glassmorphismEffects,
  initAllAnimations
};