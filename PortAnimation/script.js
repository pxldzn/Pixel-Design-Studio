document.addEventListener("contextmenu", e => e.preventDefault());

document.addEventListener("keydown", e => {
  if (
    e.key === "F12" ||
    (e.ctrlKey && e.shiftKey && ["I", "J", "C"].includes(e.key)) ||
    (e.ctrlKey && e.key === "U")
  ) {
    e.preventDefault();
  }
});

/**
 * Audio Controller for managing Web Audio API interaction
 */
class AudioController {
  constructor() {
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.buffers = {};
    this.isLoaded = false;
  }

  async loadAssets() {
    const assets = {
      tick: 'AnimationSFX/SingleTick.wav'
    };

    const loadPromises = Object.entries(assets).map(async ([key, url]) => {
      try {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await this.ctx.decodeAudioData(arrayBuffer);
        this.buffers[key] = audioBuffer;
      } catch (e) {
        console.error(`Failed to load audio: ${url}`, e);
      }
    });

    await Promise.all(loadPromises);
    this.isLoaded = true;
  }

  resume() {
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  /**
   * Schedule a tick sound at a specific time
   * @param {number} startTime - relative start time in seconds (from now)
   * @param {number} volume - gain value (0.0 to 1.0)
   */
  playTick(startTime, volume = 1.0) {
    if (!this.buffers.tick) return;

    const source = this.ctx.createBufferSource();
    source.buffer = this.buffers.tick;

    const gainNode = this.ctx.createGain();
    gainNode.gain.value = volume;

    source.connect(gainNode);
    gainNode.connect(this.ctx.destination);

    // Schedule playback
    source.start(this.ctx.currentTime + startTime);
  }

}


document.addEventListener('DOMContentLoaded', async () => {
  const audioCtrl = new AudioController();

  // Elements
  const logoImg = document.getElementById('logo-display');
  const counterEl = document.getElementById('counter');
  const body = document.body;

  // 1. Preload Audio
  await audioCtrl.loadAssets();

  // 2. Resume Audio Context & Start Animation immediately
  audioCtrl.resume();
  startAnimationSequence();

  function startAnimationSequence() {
    // Asset Configuration
    const frames = [
      'SVG/PD 1S.svg', 'SVG/PD 2.svg', 'SVG/PD 3.svg', 'SVG/PD 4.svg',
      'SVG/PD 5.svg', 'SVG/PD 6.svg', 'SVG/PD 7.svg', 'SVG/PD 8.svg',
    ];
    const finalFrame = 'SVG/PD 9F.svg';

    // Timing Configuration (ms)
    const phase1Duration = 4000;
    const phase2Duration = 500;

    // Schedule Audio
    scheduleAudioEvents();

    // Start Visual Loop
    let startTime = null;
    let currentFrameIndex = 0;

    function animate(timestamp) {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;

      // --- PHASE 1: 0s to 4s (Counter & Logo Swap) ---
      if (progress < phase1Duration) {
        // Logo Swap logic
        const targetFrameIndex = Math.floor((progress / phase1Duration) * frames.length);
        if (targetFrameIndex !== currentFrameIndex && targetFrameIndex < frames.length) {
          currentFrameIndex = targetFrameIndex;
          logoImg.src = frames[currentFrameIndex];
        }

        // Counter logic
        const percent = Math.min(Math.floor((progress / phase1Duration) * 100), 100);
        counterEl.textContent = percent < 10 ? `0${percent}` : percent;

        requestAnimationFrame(animate);
      }
      // --- PHASE 2: 4s mark (Transition to Solid Orange Circle - Silence) ---
      else if (progress >= phase1Duration && !logoImg.classList.contains('phase2-complete')) {
        counterEl.textContent = "100";

        // Swap to finalized logo
        logoImg.src = finalFrame;
        logoImg.classList.add('phase2-complete');

        // Hide counter
        counterEl.classList.add('hidden');

        // Hold for 0.5s then trigger Scale (Phase 3)
        setTimeout(() => {
          triggerPhase3();
        }, phase2Duration);
      }
    }

    /**
     * Calculate and schedule all audio events relative to "now"
     */
    function scheduleAudioEvents() {
      // Ticks: 40 ticks over 4 seconds = 1 tick every 0.1s (100ms)
      const tickCount = 40;
      const tickInterval = 4.0 / tickCount; // 0.1s

      for (let i = 0; i < tickCount; i++) {
        const time = i * tickInterval;
        let volume = 1.0;

        // Schedule tick
        audioCtrl.playTick(time, volume);
      }

    }

    function triggerPhase3() {
      // --- PHASE 3: Scale Up & Redirect ---
      logoImg.classList.add('scale-out');

      setTimeout(() => {
        body.classList.add('orange-bg');
      }, 100);

      setTimeout(() => {
        window.location.href = '../landing/landing.html';
      }, 600);
    }

    requestAnimationFrame(animate);
  }
});
