/**
 * RAGNAROK ZERO: GLOBAL - Non-Scrollable PC Lander Script
 * Handles:
 * 1. Tracking parameter mapping and URL resolution (PropellerAds / Ad Networks)
 * 2. CTA click triggers & navigation
 * 3. Gamer particle animation canvas (embers & magic dust)
 * 4. Audio tactile click feedback
 */

(function () {
  'use strict';

  // Offer 1: Destination when visitor clicks the CTA
  const OFFER_1_BASE = "https://play.pixuva.com/5A0I/2J2I9/?source=prp&visitor_id=${SUBID}&cost={cost}&zoneid={zoneid}&campaignid={campaignid}&device={device}&browser={browser}&os={os}&osversion={osversion}&country={country}&language={language}&isp={isp}&user_activity={user_activity}&via={via}&campaign_id={campaignid}";

  // Offer 2: Destination when visitor reloads the prelander page
  const OFFER_2_BASE = "https://play.pixuva.com/5A0I/2J2I9/";

  let isCtaClicked = false;

  /**
   * Build Offer 1 destination URL with dynamic tracking macros.
   */
  function getOffer1Url() {
    try {
      const incomingParams = new URLSearchParams(window.location.search);
      let targetUrlStr = OFFER_1_BASE;

      // Token mappings dictionary
      const tokens = [
        'cost', 'zoneid', 'campaignid', 'device', 'browser',
        'os', 'osversion', 'country', 'language', 'isp',
        'user_activity', 'via', 'campaign_id', 'visitor_id', 'SUBID'
      ];

      // Replace known macros if present in incoming query
      tokens.forEach(token => {
        const value = incomingParams.get(token) || 
                      incomingParams.get(token.toLowerCase()) || 
                      (token === 'SUBID' ? incomingParams.get('visitor_id') || incomingParams.get('subid') : null);
        
        if (value) {
          // Replace ${token} first, then {token}
          targetUrlStr = targetUrlStr.split('${' + token + '}').join(encodeURIComponent(value));
          targetUrlStr = targetUrlStr.split('{' + token + '}').join(encodeURIComponent(value));
        }
      });

      // Also append any extra incoming parameters that weren't in the template
      const targetUrl = new URL(targetUrlStr);
      incomingParams.forEach((val, key) => {
        if (!targetUrl.searchParams.has(key)) {
          targetUrl.searchParams.set(key, val);
        }
      });

      return targetUrl.toString();
    } catch (e) {
      console.warn('Offer 1 URL parsing fallback:', e);
      return OFFER_1_BASE;
    }
  }

  /**
   * Build Offer 2 destination URL (preserving incoming query parameters for tracking).
   */
  function getOffer2Url() {
    try {
      const targetUrl = new URL(OFFER_2_BASE);
      const incomingParams = new URLSearchParams(window.location.search);
      incomingParams.forEach((val, key) => {
        targetUrl.searchParams.set(key, val);
      });
      return targetUrl.toString();
    } catch (e) {
      return OFFER_2_BASE;
    }
  }

  /**
   * Detect if the current page visit is a reload
   */
  function checkAndHandleReload() {
    let isReload = false;
    try {
      if (window.performance && performance.getEntriesByType) {
        const navEntries = performance.getEntriesByType('navigation');
        if (navEntries.length > 0 && navEntries[0].type === 'reload') {
          isReload = true;
        }
      }
      if (!isReload && window.performance && window.performance.navigation && window.performance.navigation.type === 1) {
        isReload = true;
      }
      if (!isReload && sessionStorage.getItem('page_is_reloading') === 'true') {
        isReload = true;
      }
    } catch (e) {}

    if (isReload) {
      try {
        sessionStorage.removeItem('page_is_reloading');
      } catch (e) {}
      window.location.replace(getOffer2Url());
    }
  }

  // Check for reload immediately
  checkAndHandleReload();

  // Track unload to catch reloads across all browsers
  window.addEventListener('beforeunload', () => {
    if (!isCtaClicked) {
      try {
        sessionStorage.setItem('page_is_reloading', 'true');
      } catch (e) {}
    }
  });

  // Audio click sound using Web Audio API for instantaneous gamer tactile response
  function playClickSound() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(620, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(240, ctx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.13);
    } catch (e) {
      // Audio autoplay policy fallback
    }
  }

  /**
   * Handle CTA Navigation: Redirect to Offer 1
   */
  function handleCtaClick(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    isCtaClicked = true;
    try {
      sessionStorage.removeItem('page_is_reloading');
    } catch (err) {}

    playClickSound();

    const targetUrl = getOffer1Url();
    
    // Smooth fast navigation
    setTimeout(() => {
      window.location.href = targetUrl;
    }, 120);
  }

  // Wire up all CTA triggers
  document.addEventListener('DOMContentLoaded', () => {
    const ctaTriggers = document.querySelectorAll('.cta-trigger');
    ctaTriggers.forEach(el => {
      el.addEventListener('click', handleCtaClick);
    });

    // Initialize the ambient particles
    initParticles();
  });

  /**
   * Ambient Floating Ember / Sparkle Particle Canvas
   */
  function initParticles() {
    const canvas = document.getElementById('particles-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    const PARTICLE_COUNT = 45;
    const particles = [];

    const colors = [
      'rgba(0, 210, 255, ',    // Cyan glow
      'rgba(245, 196, 67, ',    // Ragnarok gold
      'rgba(255, 255, 255, ',   // Pure white sparkle
      'rgba(0, 255, 170, '     // Magic teal
    ];

    class Particle {
      constructor() {
        this.reset(true);
      }

      reset(init = false) {
        this.x = Math.random() * width;
        this.y = init ? Math.random() * height : height + 10;
        this.size = Math.random() * 2.5 + 0.8;
        this.speedY = -(Math.random() * 0.7 + 0.25);
        this.speedX = (Math.random() - 0.5) * 0.45;
        this.colorPrefix = colors[Math.floor(Math.random() * colors.length)];
        this.opacity = Math.random() * 0.6 + 0.2;
        this.maxOpacity = this.opacity;
        this.fadeSpeed = Math.random() * 0.005 + 0.002;
        this.pulse = Math.random() * Math.PI;
      }

      update() {
        this.y += this.speedY;
        this.x += this.speedX;
        this.pulse += 0.03;
        this.opacity = Math.sin(this.pulse) * (this.maxOpacity * 0.5) + (this.maxOpacity * 0.5);

        if (this.y < -10 || this.x < -10 || this.x > width + 10) {
          this.reset();
        }
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.colorPrefix + Math.max(0.05, this.opacity) + ')';
        ctx.shadowBlur = this.size * 5;
        ctx.shadowColor = this.colorPrefix + '0.8)';
        ctx.fill();
      }
    }

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(new Particle());
    }

    function animate() {
      ctx.clearRect(0, 0, width, height);
      particles.forEach(p => {
        p.update();
        p.draw();
      });
      requestAnimationFrame(animate);
    }

    animate();
  }

})();
