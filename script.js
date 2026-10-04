/**
 * WHERE WINDS MEET: HIDDEN MOUNTAIN - GAMING PRELANDER SCRIPT
 * Target Domain: https://wwm.pixuva.com/ (also supports https://ml.pixuva.com/)
 * 
 * CTA Behavior:
 * 1. Capture incoming Adsterra click ID (`subid` parameter from URL).
 * 2. On CTA click:
 *    - Open OFFER 1 in a NEW TAB with exact visitor_id = captured subid.
 *    - Navigate CURRENT PRELANDER TAB to OFFER 2 (https://play.pixuva.com/5A0I/2J2E6/).
 * 3. Tactile gamer Web Audio click feedback.
 * 4. Ambient atmospheric canvas (Wuxia jade motes & rain mist).
 * 5. Vertical Gaming Reel Video controls (Autoplay, Loop, Mute toggle, Progress bar).
 */

(function () {
  'use strict';

  // OFFER 1 — PRIMARY CONVERSION OFFER TEMPLATE (Adsterra tracked offer)
  const OFFER_1_TEMPLATE = "https://play.pixuva.com/5A0I/2J1J9/?source=adtr&visitor_id=##SUB_ID_SHORT(action)##&cost=##COST_CPC##&zoneid=##PLACEMENT_ID##&campaignid=##CAMPAIGN_ID##&device=##DEVICE_BRAND##&browser=##BROWSER_NAME##&os=##USER_OS##&language=##REMOTE_LANGUAGE##&isp=##USER_CARRIER##&useragent=##USERAGENT##&banner_id=##BANNER_ID##&campaign_id=##CAMPAIGN_ID##";

  // OFFER 2 — CURRENT TAB DESTINATION
  const OFFER_2_URL = "https://play.pixuva.com/5A0I/2J2E6/";

  let isCtaClicked = false;

  /**
   * Capture `subid` from incoming Adsterra URL query params.
   * e.g., https://ml.pixuva.com/?subid=ABC123 -> "ABC123"
   */
  function getCapturedSubId() {
    try {
      const params = new URLSearchParams(window.location.search);
      return params.get('subid') || params.get('SUBID') || '';
    } catch (e) {
      return '';
    }
  }

  /**
   * Build Offer 1 destination URL.
   * Replaces ##SUB_ID_SHORT(action)## with the exact captured Adsterra click ID.
   * Preserves all other tracking parameters exactly as provided.
   */
  function getOffer1Url() {
    const subId = getCapturedSubId();
    if (subId) {
      return OFFER_1_TEMPLATE.split('##SUB_ID_SHORT(action)##').join(encodeURIComponent(subId));
    }
    return OFFER_1_TEMPLATE;
  }

  /**
   * Audio click sound using Web Audio API for instantaneous gamer tactile response
   */
  function playClickSound() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(540, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.12);

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
   * Handle CTA Navigation:
   * Action 1: Open OFFER 1 in a NEW TAB with exact visitor_id = captured subid.
   * Action 2: Navigate CURRENT PRELANDER TAB to OFFER 2 (https://play.pixuva.com/5A0I/2J2E6/).
   * 
   * Calling window.open synchronously inside the genuine user click handler
   * ensures the new tab is dispatched cleanly without triggering popup blockers.
   */
  function handleCtaClick(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (isCtaClicked) return;
    isCtaClicked = true;

    playClickSound();

    const offer1Url = getOffer1Url();
    const offer2Url = OFFER_2_URL;

    // 1. Open OFFER 1 in a NEW TAB directly inside the user click handler
    const newTab = window.open(offer1Url, '_blank');
    if (newTab) {
      try {
        newTab.focus();
      } catch (err) {}
    }

    // 2. Navigate CURRENT PRELANDER TAB to OFFER 2
    setTimeout(function () {
      window.location.href = offer2Url;
    }, 100);
  }

  /**
   * Initialize Vertical Reel Video Functionality
   */
  function initReelVideo() {
    const video = document.getElementById('heroReelVideo');
    const audioBtn = document.getElementById('reelAudioBtn');
    const progressBar = document.getElementById('reelProgressBar');
    if (!video) return;

    // Autoplay silently with fallback
    video.muted = true;
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(err => {
        console.log('Video autoplay prevented by browser policy; user interaction needed:', err);
      });
    }

    // Audio toggle button
    if (audioBtn) {
      const mutedIcon = audioBtn.querySelector('.audio-muted');
      const unmutedIcon = audioBtn.querySelector('.audio-unmuted');

      audioBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (video.muted) {
          video.muted = false;
          if (mutedIcon) mutedIcon.style.display = 'none';
          if (unmutedIcon) unmutedIcon.style.display = 'block';
        } else {
          video.muted = true;
          if (mutedIcon) mutedIcon.style.display = 'block';
          if (unmutedIcon) unmutedIcon.style.display = 'none';
        }
      });
    }

    // Time update for progress track
    if (progressBar) {
      video.addEventListener('timeupdate', () => {
        if (video.duration) {
          const pct = (video.currentTime / video.duration) * 100;
          progressBar.style.width = pct + '%';
        }
      });
    }

    // Pause video when out of viewport to preserve device performance
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            video.play().catch(() => {});
          } else {
            video.pause();
          }
        });
      }, { threshold: 0.25 });

      observer.observe(video);
    }
  }

  // Wire up all CTA triggers and initialize components on DOM load
  document.addEventListener('DOMContentLoaded', () => {
    const offer1Url = getOffer1Url();
    const ctaTriggers = document.querySelectorAll('.cta-trigger');

    ctaTriggers.forEach(el => {
      // Set href for progressive enhancement & inspection
      el.setAttribute('href', offer1Url);
      el.setAttribute('target', '_blank');
      el.setAttribute('rel', 'noopener noreferrer');
      el.addEventListener('click', handleCtaClick);
    });

    // Initialize atmospheric particles
    initParticles();

    // Initialize vertical gaming reel
    initReelVideo();
  });

  /**
   * Ambient Floating Wuxia Jade Particles & Rain Mist
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

    const isMobile = window.innerWidth < 640;
    const PARTICLE_COUNT = isMobile ? 20 : 38;
    const particles = [];

    // Palette: Ethereal jade green, mystical cyan, soft amber gold, crisp rain mist
    const colors = [
      'rgba(38, 208, 124, ',   // Jade green
      'rgba(60, 230, 196, ',   // Ethereal cyan
      'rgba(212, 163, 89, ',   // Ancient gold
      'rgba(255, 255, 255, '   // Mist / Rain droplet
    ];

    class Particle {
      constructor() {
        this.reset(true);
      }

      reset(init = false) {
        this.x = Math.random() * width;
        this.y = init ? Math.random() * height : height + 15;
        this.size = Math.random() * 2.2 + 0.8;
        this.speedY = -(Math.random() * 0.75 + 0.3);
        this.speedX = (Math.random() * 0.6 - 0.2);
        this.colorPrefix = colors[Math.floor(Math.random() * colors.length)];
        this.opacity = Math.random() * 0.55 + 0.15;
        this.maxOpacity = this.opacity;
        this.pulse = Math.random() * Math.PI;
      }

      update() {
        this.y += this.speedY;
        this.x += this.speedX;
        this.pulse += 0.025;
        this.opacity = Math.sin(this.pulse) * (this.maxOpacity * 0.4) + (this.maxOpacity * 0.6);

        if (this.y < -15 || this.x < -20 || this.x > width + 20) {
          this.reset();
        }
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.colorPrefix + Math.max(0.04, this.opacity) + ')';
        ctx.shadowBlur = this.size * 4;
        ctx.shadowColor = this.colorPrefix + '0.7)';
        ctx.fill();
      }
    }

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(new Particle());
    }

    let animationFrameId;
    function animate() {
      ctx.clearRect(0, 0, width, height);
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
      }
      animationFrameId = requestAnimationFrame(animate);
    }

    animate();

    // Optimize performance when tab is inactive
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        cancelAnimationFrame(animationFrameId);
      } else {
        animate();
      }
    });
  }

})();
