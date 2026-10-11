/**
 * PUBG: BATTLEGROUNDS & FRAGZEB ARENA
 * Interactive Cinematic Scroll Experience Engine (v4.0)
 * Ultra-smooth 60FPS Canvas Scrollytelling, High-DPI Rendering, Web Audio FX
 */

(() => {
  'use strict';

  // --- Configuration ---
  const TOTAL_FRAMES = 300;
  const FRAME_PREFIX = 'frames/ezgif-frame-';
  const FRAME_EXT = '.jpg';
  const LERP_FACTOR = 0.16; // Smooth interpolation speed

  // --- DOM Elements ---
  const canvas = document.getElementById('sequence-canvas');
  const ctx = canvas.getContext('2d', { alpha: false });
  const preloader = document.getElementById('preloader');
  const progressBarFill = document.getElementById('progress-bar-fill');
  const loadPercentage = document.getElementById('load-percentage');
  const logFramesCount = document.getElementById('log-frames-count');
  const loadStatusText = document.getElementById('load-status-text');

  // Scroll Section & Arena Navigation
  const scrollSection = document.getElementById('pubg-scroll-experience');
  const fragzebNav = document.getElementById('fragzeb-header');

  // HUD Elements
  const hudCurrentFrame = document.getElementById('hud-current-frame');
  const compassDegree = document.getElementById('compass-degree');
  const chapterNavFill = document.getElementById('chapter-nav-fill');
  const chapterDots = document.querySelectorAll('.chapter-dot');
  const storyCards = document.querySelectorAll('.story-card');
  const crosshairTracker = document.getElementById('crosshair-tracker');
  const reticleCoord = document.getElementById('reticle-coord');

  // Controls
  const btnAudioToggle = document.getElementById('btn-audio-toggle');
  const audioIcon = document.getElementById('audio-icon');
  const audioLabel = document.getElementById('audio-label');
  const btnAutoplay = document.getElementById('btn-autoplay');
  const autoplayIcon = document.getElementById('autoplay-icon');
  const autoplayLabel = document.getElementById('autoplay-label');
  const btnFullscreen = document.getElementById('btn-fullscreen');

  // --- State Variables ---
  const images = new Array(TOTAL_FRAMES);
  let loadedCount = 0;
  let targetProgress = 0; // 0.0 to 1.0
  let currentProgress = 0;
  let currentFrameIndex = 0;
  let lastDrawnFrameIndex = -1;

  let isAutoplaying = false;
  let lastTimestamp = 0;

  // Web Audio Context
  let audioCtx = null;
  let isAudioEnabled = false;
  let lastAudioTickFrame = -1;

  // Format frame filename: ezgif-frame-001.jpg
  function getFrameUrl(index) {
    const frameNum = String(index + 1).padStart(3, '0');
    return `${FRAME_PREFIX}${frameNum}${FRAME_EXT}`;
  }

  // ==========================================================================
  // Web Audio FX Synthesizer (Tactical Feedback)
  // ==========================================================================
  function initAudio() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playTickSound() {
    if (!isAudioEnabled || !audioCtx) return;
    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1400, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(320, audioCtx.currentTime + 0.025);
      
      gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.025);
      
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      
      osc.start();
      osc.stop(audioCtx.currentTime + 0.03);
    } catch (e) {}
  }

  function playChapterChime() {
    if (!isAudioEnabled || !audioCtx) return;
    try {
      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.18);
      
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);
      
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      
      osc.start(now);
      osc.stop(now + 0.26);
    } catch (e) {}
  }

  function toggleAudio() {
    initAudio();
    isAudioEnabled = !isAudioEnabled;
    if (isAudioEnabled) {
      if (audioIcon) audioIcon.textContent = '🔊';
      if (audioLabel) audioLabel.textContent = 'AUDIO FX: ON';
      if (btnAudioToggle) btnAudioToggle.classList.add('active');
      playChapterChime();
    } else {
      if (audioIcon) audioIcon.textContent = '🔇';
      if (audioLabel) audioLabel.textContent = 'AUDIO FX: OFF';
      if (btnAudioToggle) btnAudioToggle.classList.remove('active');
    }
  }

  // ==========================================================================
  // Progressive High-Speed Frame Loader
  // ==========================================================================
  function preloadFrames() {
    let completed = 0;

    function handleLoad(idx, img) {
      images[idx] = img;
      completed++;
      loadedCount = completed;

      const pct = Math.round((completed / TOTAL_FRAMES) * 100);
      if (progressBarFill) progressBarFill.style.width = `${pct}%`;
      if (loadPercentage) loadPercentage.textContent = `${pct}%`;
      if (logFramesCount) logFramesCount.textContent = `FRAMES: ${completed} / ${TOTAL_FRAMES}`;

      // Render initial frame as soon as frame 0 is ready
      if (idx === 0 && lastDrawnFrameIndex === -1) {
        drawFrame(0);
      }

      // Hide loading screen when frames are fully buffered
      if (completed === TOTAL_FRAMES) {
        if (loadStatusText) loadStatusText.textContent = 'TELEMETRY READY // SYSTEM ACTIVE';
        setTimeout(() => {
          document.body.classList.remove('loading-state');
        }, 350);
      }
    }

    for (let i = 0; i < TOTAL_FRAMES; i++) {
      const img = new Image();
      img.onload = () => handleLoad(i, img);
      img.onerror = () => {
        console.warn(`Frame failed: ${getFrameUrl(i)}`);
        handleLoad(i, img);
      };
      img.src = getFrameUrl(i);
    }
  }

  // ==========================================================================
  // High-DPI Responsive Canvas Renderer (Aspect-Ratio 'Cover')
  // ==========================================================================
  let canvasWidth = 0;
  let canvasHeight = 0;

  function resizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvasWidth = window.innerWidth;
    canvasHeight = window.innerHeight;

    canvas.width = Math.floor(canvasWidth * dpr);
    canvas.height = Math.floor(canvasHeight * dpr);
    ctx.scale(dpr, dpr);

    if (lastDrawnFrameIndex >= 0) {
      drawFrame(lastDrawnFrameIndex, true);
    }
  }

  window.addEventListener('resize', resizeCanvas);

  function drawFrame(index, force = false) {
    if (!force && index === lastDrawnFrameIndex) return;
    const img = images[index];
    if (!img || !img.complete || img.naturalWidth === 0) return;

    // Draw with 'cover' fitting
    const imgRatio = img.naturalWidth / img.naturalHeight;
    const screenRatio = canvasWidth / canvasHeight;

    let drawWidth, drawHeight, offsetX, offsetY;

    if (screenRatio > imgRatio) {
      drawWidth = canvasWidth;
      drawHeight = canvasWidth / imgRatio;
      offsetX = 0;
      offsetY = (canvasHeight - drawHeight) / 2;
    } else {
      drawHeight = canvasHeight;
      drawWidth = canvasHeight * imgRatio;
      offsetX = (canvasWidth - drawWidth) / 2;
      offsetY = 0;
    }

    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
    lastDrawnFrameIndex = index;
  }

  // ==========================================================================
  // Azimuth Compass & HUD Sync
  // ==========================================================================
  const COMPASS_HEADINGS = [
    '090° E', '125° SE', '180° S', '215° SW', '270° W', '315° NW', '360° N', '045° NE'
  ];

  function updateHUD(progress, frameIdx) {
    if (hudCurrentFrame) {
      hudCurrentFrame.textContent = String(frameIdx + 1).padStart(3, '0');
    }

    // Compass Azimuth
    if (compassDegree) {
      const bearingIdx = Math.floor(progress * (COMPASS_HEADINGS.length - 1));
      compassDegree.textContent = COMPASS_HEADINGS[bearingIdx] || '180° S';
    }

    // Chapter nav vertical line fill
    if (chapterNavFill) {
      chapterNavFill.style.height = `${progress * 100}%`;
    }

    // Active Chapter & Story Card synchronization
    updateStoryCards(progress);

    // Audio click feedback per frame change
    if (Math.abs(frameIdx - lastAudioTickFrame) >= 2) {
      playTickSound();
      lastAudioTickFrame = frameIdx;
    }
  }

  function updateStoryCards(progress) {
    let activeCardIndex = 0;

    storyCards.forEach((card, index) => {
      const start = parseFloat(card.dataset.start);
      const end = parseFloat(card.dataset.end);

      if (progress >= start && progress < end) {
        card.classList.add('active');
        activeCardIndex = index;
      } else {
        card.classList.remove('active');
      }
    });

    chapterDots.forEach((dot, index) => {
      if (index === activeCardIndex) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });
  }

  // ==========================================================================
  // Scroll Calculation Helper
  // ==========================================================================
  function getScrollSectionTravel() {
    if (!scrollSection) return 1;
    return Math.max(scrollSection.offsetHeight - window.innerHeight, 1);
  }

  // ==========================================================================
  // Core Animation Loop (Interpolated Damping)
  // ==========================================================================
  function animate(timestamp) {
    if (!lastTimestamp) lastTimestamp = timestamp;
    const delta = (timestamp - lastTimestamp) / 1000;
    lastTimestamp = timestamp;

    if (isAutoplaying) {
      const step = delta * 0.09;
      targetProgress += step;
      if (targetProgress >= 1.0) {
        targetProgress = 1.0;
        stopAutoplay();
      }
      const travel = getScrollSectionTravel();
      const sectionTop = scrollSection ? scrollSection.offsetTop : 0;
      window.scrollTo(0, sectionTop + targetProgress * travel);
    }

    // Smooth Lerp progress
    currentProgress += (targetProgress - currentProgress) * LERP_FACTOR;

    const frameIdx = Math.min(
      Math.max(Math.floor(currentProgress * (TOTAL_FRAMES - 1)), 0),
      TOTAL_FRAMES - 1
    );

    if (frameIdx !== currentFrameIndex || lastDrawnFrameIndex === -1) {
      currentFrameIndex = frameIdx;
      drawFrame(frameIdx);
      updateHUD(currentProgress, frameIdx);
    }

    requestAnimationFrame(animate);
  }

  // ==========================================================================
  // Native Scroll Handler
  // ==========================================================================
  function onScroll() {
    if (isAutoplaying) return;
    const scrollY = window.scrollY;
    const sectionTop = scrollSection ? scrollSection.offsetTop : 0;
    const travel = getScrollSectionTravel();

    if (travel > 0) {
      const relScroll = scrollY - sectionTop;
      targetProgress = Math.min(Math.max(relScroll / travel, 0), 1);
    }

    // Show Fragzeb navbar only when user has reached the Fragzeb Arena section
    if (fragzebNav) {
      if (scrollY >= sectionTop + travel - 40) {
        fragzebNav.classList.add('nav-revealed');
      } else {
        fragzebNav.classList.remove('nav-revealed');
      }
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });

  // ==========================================================================
  // Chapter Navigation Clicks
  // ==========================================================================
  chapterDots.forEach((dot) => {
    dot.addEventListener('click', () => {
      if (isAutoplaying) stopAutoplay();
      const targetPct = parseFloat(dot.dataset.target);
      const sectionTop = scrollSection ? scrollSection.offsetTop : 0;
      const travel = getScrollSectionTravel();
      window.scrollTo({
        top: sectionTop + targetPct * travel,
        behavior: 'smooth'
      });
      playChapterChime();
    });
  });

  // ==========================================================================
  // Autoplay Tour Controls
  // ==========================================================================
  function startAutoplay() {
    isAutoplaying = true;
    if (btnAutoplay) {
      btnAutoplay.classList.add('active');
      if (autoplayIcon) autoplayIcon.textContent = '⏸';
      if (autoplayLabel) autoplayLabel.textContent = 'PAUSE TOUR';
    }
  }

  function stopAutoplay() {
    isAutoplaying = false;
    if (btnAutoplay) {
      btnAutoplay.classList.remove('active');
      if (autoplayIcon) autoplayIcon.textContent = '▶';
      if (autoplayLabel) autoplayLabel.textContent = 'AUTO TOUR';
    }
  }

  function toggleAutoplay() {
    if (isAutoplaying) {
      stopAutoplay();
    } else {
      if (targetProgress >= 0.99) {
        targetProgress = 0;
        window.scrollTo(0, scrollSection ? scrollSection.offsetTop : 0);
      }
      startAutoplay();
      playChapterChime();
    }
  }

  if (btnAutoplay) {
    btnAutoplay.addEventListener('click', toggleAutoplay);
  }

  if (btnAudioToggle) {
    btnAudioToggle.addEventListener('click', toggleAudio);
  }

  if (btnFullscreen) {
    btnFullscreen.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    });
  }

  // ==========================================================================
  // Mouse Reticle Tracker
  // ==========================================================================
  window.addEventListener('mousemove', (e) => {
    if (crosshairTracker) {
      crosshairTracker.style.left = `${e.clientX}px`;
      crosshairTracker.style.top = `${e.clientY}px`;
    }
    if (reticleCoord) {
      const xCoord = String(Math.floor((e.clientX / window.innerWidth) * 1000)).padStart(4, '0');
      const yCoord = String(Math.floor((e.clientY / window.innerHeight) * 1000)).padStart(4, '0');
      reticleCoord.textContent = `COORD [${xCoord}, ${yCoord}]`;
    }
  });

  // ==========================================================================
  // Keyboard Shortcuts
  // ==========================================================================
  window.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    switch (e.code) {
      case 'Space':
        if (window.scrollY < (scrollSection ? scrollSection.offsetTop + getScrollSectionTravel() : 500)) {
          e.preventDefault();
          toggleAutoplay();
        }
        break;
      case 'KeyM':
        e.preventDefault();
        toggleAudio();
        break;
      case 'KeyF':
        e.preventDefault();
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(() => {});
        } else {
          document.exitFullscreen().catch(() => {});
        }
        break;
    }
  });

  // ==========================================================================
  // Initialization
  // ==========================================================================
  resizeCanvas();
  preloadFrames();
  onScroll();
  requestAnimationFrame(animate);

})();
