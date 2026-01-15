/* Super Tetra Game (STG) - app.js (split from HTML) */

(() => {
  // ------------------ Constants ------------------
  const COLS = 10, ROWS = 20, HIDDEN_ROWS = 2, TOTAL_ROWS = ROWS + HIDDEN_ROWS;

  // ------------------ DOM ------------------
  const gameCanvas = document.getElementById('game');
  const ctx = gameCanvas.getContext('2d');

  const nextCanvas = document.getElementById('nextCanvas');
  const nctx = nextCanvas.getContext('2d');

  const holdCanvas = document.getElementById('holdCanvas');
  const hctx = holdCanvas.getContext('2d');

  const targetCanvas = document.getElementById('targetCanvas');
  const tctx = targetCanvas.getContext('2d');

  const elScore = document.getElementById('score');
  const elHigh  = document.getElementById('high');
  const elLevel = document.getElementById('level');
  const elLines = document.getElementById('lines');
  const elLast  = document.getElementById('lastClear');

  const elStepInfo = document.getElementById('stepInfo');
  const elStepMisses = document.getElementById('stepMisses');
  const elStepMode = document.getElementById('stepMode');

  const elFinEff = document.getElementById('finEff');
  const elFinPieces = document.getElementById('finPieces');
  const elFinErrors = document.getElementById('finErrors');
  const elFinLast = document.getElementById('finLast');

  const elPPS = document.getElementById('pps');
  const elAPM = document.getElementById('apm');
  const elHist = document.getElementById('hist');
  const elFinByPiece = document.getElementById('finByPiece');

  const pauseBtn = document.getElementById('pauseBtn');
  const startBtn = document.getElementById('startBtn');
  const restartBtnMain = document.getElementById('restartBtnMain');
  const endBtn = document.getElementById('endBtn');
  const pauseLabel = document.getElementById('pauseLabel');

  

  const exitAppBtn = document.getElementById('exitAppBtn');
  const exitBackdrop = document.getElementById('exitModal');
  const exitOkBtn = document.getElementById('exitOkBtn');

  function showExitHelp(){ try{ location.hash = 'exitModal'; }catch(e){} }
  function hideExitHelp(){ try{ if(location.hash==='#exitModal') history.pushState('', document.title, window.location.pathname + window.location.search); }catch(e){} }



  // ------------------ Exit (Close App) wiring ------------------
  if (exitOkBtn) exitOkBtn.addEventListener('click', hideExitHelp);
  if (exitBackdrop) exitBackdrop.addEventListener('click', (e)=>{ if (e.target === exitBackdrop) hideExitHelp(); });

  if (exitAppBtn){
    exitAppBtn.addEventListener('click', (e)=>{
      // Allow modal to open via hash, but also try to close.
// End current run first (so Exit feels like Quit)
      try{
        if (typeof endGame === 'function') endGame();
      }catch(e){}

      // Attempt to close (often blocked in PWAs/browsers)
      try{ window.close(); }catch(e){}

      // If still open, show friendly instructions
      setTimeout(()=>{ showExitHelp(); }, 150);
    });
  }

const overlayGameOver = document.getElementById('overlayGameOver');
  const finalScore = document.getElementById('finalScore');
  const finalHigh = document.getElementById('finalHigh');
  const finalLevel = document.getElementById('finalLevel');
  const finalLines = document.getElementById('finalLines');

  const restartBtn = document.getElementById('restartBtn');
  const replayBtn2 = document.getElementById('replayBtn2');
  const replayBtn = document.getElementById('replayBtn');
  const leaderList = document.getElementById('leaderList');
  const clearLeaderboardBtn = document.getElementById('clearLeaderboardBtn');

  const toast = document.getElementById('toast');
  const toastText = document.getElementById('toastText');

  const soundToggle = document.getElementById('soundToggle');
  const musicToggle = document.getElementById('musicToggle');
  const musicVolSlider = document.getElementById('musicVolSlider');
  const musicVolVal = document.getElementById('musicVolVal');

  const trainerToggle = document.getElementById('trainerToggle');
  const hintToggle = document.getElementById('hintToggle');
  const outlineToggle = document.getElementById('outlineToggle');
  const strictToggle = document.getElementById('strictToggle');
  const presetSelect = document.getElementById('presetSelect');
  const loadPresetBtn = document.getElementById('loadPresetBtn');
  const resetPresetBtn = document.getElementById('resetPresetBtn');

  const dasSlider = document.getElementById('dasSlider');
  const arrSlider = document.getElementById('arrSlider');
  const dasVal = document.getElementById('dasVal');
  const arrVal = document.getElementById('arrVal');
  const gravitySelect = document.getElementById('gravitySelect');

  const ghostToggle = document.getElementById('ghostToggle');
  const fxToggle = document.getElementById('fxToggle');
  const shakeToggle = document.getElementById('shakeToggle');

  const padStatus = document.getElementById('padStatus');

  const bindGrid = document.getElementById('bindGrid');
  const resetBindsBtn = document.getElementById('resetBindsBtn');

  // ------------------ Settings (runtime) ------------------
  let DAS = 140;
  let ARR = 35;
  const SOFT_DROP_RATE = 28;
  const LOCK_DELAY = 450;
  const CLEAR_ANIM_MS = 260;
  const PARTICLES_PER_CELL = 6;

  let showGhost = true;
  let enableFX = true;
  let enableShake = true;

  let gravityMode = "modern"; // modern / classic / zen

  // Trainer options
  let trainerOn = false;
  let hintsOn = true;
  let outlineOn = true;
  let strictMode = false;

  // Replay
  const LAST_REPLAY_KEY = "tetris_last_replay_v1";
  let lastReplay = null;
  let replayMode = false;
  let replayIdx = 0;
  let replayStartPerf = 0;

  // Analytics / recording
  let runStartPerf = 0;
  let piecesLocked = 0;
  let actionLog = [];              // [{t, kind:"down"/"up"/"tap", action, data?}]
  let actionCounts = {};           // action -> count
  let actionTotal = 0;

  // Finesse by piece breakdown
  const finByPiece = {I:{ok:0,err:0},O:{ok:0,err:0},T:{ok:0,err:0},S:{ok:0,err:0},Z:{ok:0,err:0},J:{ok:0,err:0},L:{ok:0,err:0}};

  // ------------------ Scoring ------------------
  const LINE_SCORE = {1:100,2:300,3:500,4:800};
  const TSPIN_SCORE = {
    mini: {0:100,1:200,2:400},
    full: {0:400,1:800,2:1200,3:1600}
  };
  const B2B_MULT = 1.5;
  const COMBO_BONUS = 50;
  const LINES_PER_LEVEL = 10;
  const PC_BONUS = {1:800,2:1200,3:1800,4:2000};

  // ------------------ Storage keys ------------------
  const HIGH_KEY = "tetris_highscore_modern_trainer_v3";
  const LEADER_KEY = "tetris_leaderboard_modern_trainer_v3";
  const BIND_KEY = "tetris_keybinds_v3";

  // ------------------ Pieces ------------------
  const PIECES = ['I','O','T','S','Z','J','L'];

  const SHAPES = {
    I: [
      [{x:0,y:1},{x:1,y:1},{x:2,y:1},{x:3,y:1}],
      [{x:2,y:0},{x:2,y:1},{x:2,y:2},{x:2,y:3}],
      [{x:0,y:2},{x:1,y:2},{x:2,y:2},{x:3,y:2}],
      [{x:1,y:0},{x:1,y:1},{x:1,y:2},{x:1,y:3}],
    ],
    O: [
      [{x:1,y:1},{x:2,y:1},{x:1,y:2},{x:2,y:2}],
      [{x:1,y:1},{x:2,y:1},{x:1,y:2},{x:2,y:2}],
      [{x:1,y:1},{x:2,y:1},{x:1,y:2},{x:2,y:2}],
      [{x:1,y:1},{x:2,y:1},{x:1,y:2},{x:2,y:2}],
    ],
    T: [
      [{x:1,y:1},{x:0,y:2},{x:1,y:2},{x:2,y:2}],
      [{x:1,y:1},{x:1,y:2},{x:2,y:2},{x:1,y:3}],
      [{x:0,y:2},{x:1,y:2},{x:2,y:2},{x:1,y:3}],
      [{x:1,y:1},{x:0,y:2},{x:1,y:2},{x:1,y:3}],
    ],
    S: [
      [{x:1,y:1},{x:2,y:1},{x:0,y:2},{x:1,y:2}],
      [{x:1,y:1},{x:1,y:2},{x:2,y:2},{x:2,y:3}],
      [{x:1,y:2},{x:2,y:2},{x:0,y:3},{x:1,y:3}],
      [{x:0,y:1},{x:0,y:2},{x:1,y:2},{x:1,y:3}],
    ],
    Z: [
      [{x:0,y:1},{x:1,y:1},{x:1,y:2},{x:2,y:2}],
      [{x:2,y:1},{x:1,y:2},{x:2,y:2},{x:1,y:3}],
      [{x:0,y:2},{x:1,y:2},{x:1,y:3},{x:2,y:3}],
      [{x:1,y:1},{x:0,y:2},{x:1,y:2},{x:0,y:3}],
    ],
    J: [
      [{x:0,y:1},{x:0,y:2},{x:1,y:2},{x:2,y:2}],
      [{x:1,y:1},{x:2,y:1},{x:1,y:2},{x:1,y:3}],
      [{x:0,y:2},{x:1,y:2},{x:2,y:2},{x:2,y:3}],
      [{x:1,y:1},{x:1,y:2},{x:0,y:3},{x:1,y:3}],
    ],
    L: [
      [{x:2,y:1},{x:0,y:2},{x:1,y:2},{x:2,y:2}],
      [{x:1,y:1},{x:1,y:2},{x:1,y:3},{x:2,y:3}],
      [{x:0,y:2},{x:1,y:2},{x:2,y:2},{x:0,y:3}],
      [{x:0,y:1},{x:1,y:1},{x:1,y:2},{x:1,y:3}],
    ]
  };

  const KICKS_JLSTZ = {
    "0>1": [{x:0,y:0},{x:-1,y:0},{x:-1,y:1},{x:0,y:-2},{x:-1,y:-2}],
    "1>2": [{x:0,y:0},{x:1,y:0},{x:1,y:-1},{x:0,y:2},{x:1,y:2}],
    "2>3": [{x:0,y:0},{x:1,y:0},{x:1,y:1},{x:0,y:-2},{x:1,y:-2}],
    "3>0": [{x:0,y:0},{x:-1,y:0},{x:-1,y:-1},{x:0,y:2},{x:-1,y:2}],
    "1>0": [{x:0,y:0},{x:1,y:0},{x:1,y:1},{x:0,y:-2},{x:1,y:-2}],
    "2>1": [{x:0,y:0},{x:-1,y:0},{x:-1,y:-1},{x:0,y:2},{x:-1,y:2}],
    "3>2": [{x:0,y:0},{x:-1,y:0},{x:-1,y:1},{x:0,y:-2},{x:-1,y:-2}],
    "0>3": [{x:0,y:0},{x:1,y:0},{x:1,y:-1},{x:0,y:2},{x:1,y:2}],
  };

  const KICKS_I = {
    "0>1": [{x:0,y:0},{x:-2,y:0},{x:1,y:0},{x:-2,y:-1},{x:1,y:2}],
    "1>2": [{x:0,y:0},{x:-1,y:0},{x:2,y:0},{x:-1,y:2},{x:2,y:-1}],
    "2>3": [{x:0,y:0},{x:2,y:0},{x:-1,y:0},{x:2,y:1},{x:-1,y:-2}],
    "3>0": [{x:0,y:0},{x:1,y:0},{x:-2,y:0},{x:1,y:-2},{x:-2,y:1}],
    "1>0": [{x:0,y:0},{x:2,y:0},{x:-1,y:0},{x:2,y:1},{x:-1,y:-2}],
    "2>1": [{x:0,y:0},{x:1,y:0},{x:-2,y:0},{x:1,y:-2},{x:-2,y:1}],
    "3>2": [{x:0,y:0},{x:-2,y:0},{x:1,y:0},{x:-2,y:-1},{x:1,y:2}],
    "0>3": [{x:0,y:0},{x:-1,y:0},{x:2,y:0},{x:-1,y:2},{x:2,y:-1}],
  };

  const PIECE_GRADS = {
    I: ["#46f7ff","#1a7cff","#6fffff"],
    O: ["#ffe86b","#ff9b2f","#fff2a3"],
    T: ["#d88cff","#8b4bff","#f2b2ff"],
    S: ["#5affb2","#1ddf77","#b7ffe0"],
    Z: ["#ff6b8a","#ff2f5c","#ffb3c3"],
    J: ["#6aa8ff","#2c5bff","#b7d5ff"],
    L: ["#ffb85a","#ff6a2f","#ffe0b0"],
  };

  // ------------------ PRNG for deterministic bag (replay) ------------------
  let bagSeed = 0;
  function mulberry32(seed){
    let a = seed >>> 0;
    return function() {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      let t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  let bagRand = () => Math.random();
  function setBagSeed(seed){
    bagSeed = seed >>> 0;
    bagRand = mulberry32(bagSeed);
  }
  function randomSeed(){
    const a = (crypto?.getRandomValues ? crypto.getRandomValues(new Uint32Array(1))[0] : (Math.random()*2**32)>>>0);
    return a >>> 0;
  }

  // ------------------ Audio ------------------
  let audioCtx = null;
  let masterGain = null;
  let soundEnabled = true;

  // Persisted settings keys
  const SFX_ENABLED_KEY  = "stg_sfx_enabled_v1";
  const MUSIC_ENABLED_KEY = "stg_music_enabled_v1";
  const MUSIC_VOL_KEY     = "stg_music_volume_v1"; // 0..100

  function ensureAudio(){
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (!masterGain){
      masterGain = audioCtx.createGain();
      masterGain.gain.value = 0.6;
      masterGain.connect(audioCtx.destination);
    }
    if (audioCtx.state === "suspended") audioCtx.resume().catch(()=>{});
  }

  function beep(freq=440, dur=0.06, type="sine", gain=0.06, glideTo=null){
    if (!soundEnabled) return;
    ensureAudio();
    if (!audioCtx || !masterGain) return;
    const t0 = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (glideTo) osc.frequency.exponentialRampToValueAtTime(glideTo, t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(gain, t0 + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g); g.connect(masterGain);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }

  const SFX = {
    move:   ()=>beep(520, 0.035, "triangle", 0.035, 460),
    rotate: ()=>beep(740, 0.045, "square",   0.030, 920),
    drop:   ()=>beep(320, 0.060, "sine",     0.045, 180),
    lock:   ()=>beep(180, 0.055, "sine",     0.050, 120),
    clear:  (n)=>beep(520 + n*120, 0.12, "triangle", 0.060, 980 + n*160),
    hold:   ()=>beep(420, 0.065, "triangle", 0.040, 560),
    over:   ()=>beep(180, 0.22, "sawtooth",  0.055, 80),
    pause:  ()=>beep(260, 0.08, "sine", 0.040, 180),
    level:  ()=>beep(640, 0.12, "triangle", 0.045, 980),
    perfect:()=>beep(920, 0.18, "triangle", 0.070, 1480),
    stepOk: ()=>beep(880, 0.08, "triangle", 0.050, 1100),
    stepBad:()=>beep(220, 0.12, "sawtooth", 0.040, 140),
  };

  function setSoundUI(){
    if (!soundToggle) return;
    soundToggle.textContent = soundEnabled ? "🔊 Sound: On" : "🔇 Sound: Off";
    soundToggle.classList.toggle("on", soundEnabled);
  }

  function setMusicUI(){
    if (musicToggle){
      musicToggle.textContent = musicEnabled ? "🎵 Music: On" : "🎵 Music: Off";
      musicToggle.classList.toggle("on", musicEnabled);
    }
    if (musicVolSlider){
      musicVolSlider.disabled = !musicEnabled;
      musicVolSlider.value = String(musicVolume);
    }
    if (musicVolVal){
      musicVolVal.textContent = String(musicVolume);
    }
  }

  function saveAudioPrefs(){
    try{ localStorage.setItem(SFX_ENABLED_KEY, soundEnabled ? "1" : "0"); }catch{}
    try{ localStorage.setItem(MUSIC_ENABLED_KEY, musicEnabled ? "1" : "0"); }catch{}
    try{ localStorage.setItem(MUSIC_VOL_KEY, String(musicVolume)); }catch{}
  }

  function loadAudioPrefs(){
    try{
      const sfx = localStorage.getItem(SFX_ENABLED_KEY);
      if (sfx !== null) soundEnabled = sfx === "1";
    }catch{}
    try{
      const me = localStorage.getItem(MUSIC_ENABLED_KEY);
      if (me !== null) musicEnabled = me === "1";
    }catch{}
    try{
      const mv = parseInt(localStorage.getItem(MUSIC_VOL_KEY) || "60", 10);
      if (!Number.isNaN(mv)) musicVolume = Math.max(0, Math.min(100, mv));
    }catch{}
  }

  // ------------------ Music (Background loop) ------------------
  // Simple synth-based looping themes (no external files).
  // Modes map to gravity: modern / classic / zen
  let musicEnabled = true;         // independent from SFX
  let musicVolume = 60;            // 0..100 (slider)
  let musicTheme = "modern";
  let musicGain = null;
  let musicTimer = null;
  let musicStep = 0;
  let musicNextTime = 0;

  const midiToFreq = (m)=> 440 * Math.pow(2, (m - 69) / 12);

  function ensureMusic(){
    if (!musicEnabled) return;
    ensureAudio();
    if (!audioCtx || !masterGain) return;
    if (!musicGain){
      musicGain = audioCtx.createGain();
      musicGain.gain.value = (musicVolume/100) * 0.30;
      musicGain.connect(masterGain);
    }
  }

  function scheduleTone(freq, t, dur, opts={}){
    if (!audioCtx || !musicGain) return;
    const type = opts.type || "sine";
    const gain = opts.gain ?? 0.04;
    const attack = opts.attack ?? 0.01;
    const release = opts.release ?? Math.min(0.09, dur * 0.5);
    const detune = opts.detune ?? 0;

    const osc = audioCtx.createOscillator();
    const g = audioCtx.createGain();

    osc.type = type;
    osc.detune.setValueAtTime(detune, t);
    osc.frequency.setValueAtTime(freq, t);

    // Optional glide
    if (opts.glideTo){
      osc.frequency.exponentialRampToValueAtTime(opts.glideTo, t + dur);
    }

    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur + release);

    osc.connect(g);

    // Optional filter for softer "pads"
    if (opts.filter){
      const f = audioCtx.createBiquadFilter();
      f.type = opts.filter.type || "lowpass";
      f.frequency.setValueAtTime(opts.filter.freq || 1200, t);
      f.Q.setValueAtTime(opts.filter.q || 0.7, t);
      g.connect(f);
      f.connect(musicGain);
    } else {
      g.connect(musicGain);
    }

    osc.start(t);
    osc.stop(t + dur + release + 0.06);
  }

  const MUSIC_THEMES = {
    modern: {
      bpm: 128,
      stepsPerBeat: 2, // 8th notes
      length: 32,
      prog: [57, 60, 62, 64], // A3, C4, D4, E4 (A minor vibe)
      stepFn: (step, t, dur)=>{
        const chord = Math.floor(step / 8) % 4;
        const root = MUSIC_THEMES.modern.prog[chord];
        // Bass thump on beats
        if (step % 4 === 0){
          scheduleTone(midiToFreq(root - 12), t, dur * 1.8, { type:"sine", gain:0.032, attack:0.01, release:0.10 });
        }
        // Arp sparkle
        const arp = [0, 7, 12, 7];
        const note = root + arp[step % 4];
        scheduleTone(midiToFreq(note + 12), t, dur * 0.95, { type:"triangle", gain:0.018, attack:0.008, release:0.05 });

        // Soft chord stab every 2 beats
        if (step % 8 === 0){
          scheduleTone(midiToFreq(root + 24), t, dur * 0.55, { type:"sawtooth", gain:0.014, attack:0.01, release:0.05, filter:{type:"lowpass", freq:1400, q:0.9} });
        }
      }
    },
    classic: {
      bpm: 168,
      stepsPerBeat: 4, // 16th notes (chiptune-ish)
      length: 32,
      bass: [48, 50, 53, 55], // C3, D3, F3, G3
      melody: [
        72,74,76,74, 72,69,72,74,
        76,77,79,77, 76,74,72,69,
        72,74,76,74, 72,69,67,69,
        71,72,74,72, 71,69,67,69
      ],
      stepFn: (step, t, dur)=>{
        const bar = Math.floor(step / 8) % 4;
        const root = MUSIC_THEMES.classic.bass[bar];

        // Bass on 1 & 3
        if (step % 8 === 0 || step % 8 === 4){
          scheduleTone(midiToFreq(root), t, dur * 2.2, { type:"square", gain:0.020, attack:0.005, release:0.06 });
        }

        // Lead melody every 16th
        const m = MUSIC_THEMES.classic.melody[step % MUSIC_THEMES.classic.melody.length];
        scheduleTone(midiToFreq(m), t, dur * 0.85, { type:"square", gain:0.012, attack:0.003, release:0.04 });

        // Tiny "blip" hi-hat feel
        if (step % 2 === 0){
          scheduleTone(midiToFreq(96), t, dur * 0.25, { type:"triangle", gain:0.006, attack:0.002, release:0.02 });
        }
      }
    },
    zen: {
      bpm: 88,
      stepsPerBeat: 1, // quarters
      length: 16,
      chords: [
        [57, 64, 69], // A minor (A3 E4 A4)
        [55, 62, 67], // G major-ish
        [52, 59, 64], // E minor-ish
        [50, 57, 62], // Dsus vibe
      ],
      stepFn: (step, t, dur)=>{
        const chord = Math.floor(step / 4) % 4;
        const notes = MUSIC_THEMES.zen.chords[chord];

        // Pad (long notes)
        if (step % 4 === 0){
          for (const n of notes){
            const f = midiToFreq(n);
            scheduleTone(f, t, dur * 3.6, { type:"sine", gain:0.012, attack:0.06, release:0.22, filter:{type:"lowpass", freq:900, q:0.6} });
            // gentle detune layer
            scheduleTone(f, t, dur * 3.6, { type:"sine", gain:0.009, attack:0.06, release:0.22, detune:6, filter:{type:"lowpass", freq:900, q:0.6} });
          }
        }

        // Soft bell accent
        if (step % 2 === 0){
          const bell = notes[(step/2)%notes.length|0] + 24;
          scheduleTone(midiToFreq(bell), t, dur * 0.8, { type:"triangle", gain:0.008, attack:0.02, release:0.12, filter:{type:"lowpass", freq:1200, q:0.8} });
        }
      }
    }
  };

  function stopMusic(fadeMs=140){
    if (musicTimer){ clearInterval(musicTimer); musicTimer = null; }
    if (!audioCtx || !musicGain) return;
    try{
      const t0 = audioCtx.currentTime;
      musicGain.gain.cancelScheduledValues(t0);
      musicGain.gain.setValueAtTime(musicGain.gain.value, t0);
      musicGain.gain.linearRampToValueAtTime(0.0001, t0 + fadeMs/1000);
    }catch{}
  }

  function startMusic(theme=gravityMode){
    if (!musicEnabled) return;
    if (!started || paused || gameOver) return;
    if (replayMode) return;

    ensureMusic();
    if (!audioCtx || !musicGain) return;

    const newTheme = (theme === "classic" || theme === "zen" || theme === "modern") ? theme : "modern";
    musicTheme = newTheme;

    // Reset clock
    musicStep = 0;
    musicNextTime = audioCtx.currentTime + 0.06;

    // Fade in
    try{
      const t0 = audioCtx.currentTime;
      musicGain.gain.cancelScheduledValues(t0);
      musicGain.gain.setValueAtTime(0.0001, t0);
      const target = (musicVolume/100) * 0.30;
      musicGain.gain.linearRampToValueAtTime(Math.max(0.0001, target), t0 + 0.18);
    }catch{}

    const cfg = MUSIC_THEMES[musicTheme] || MUSIC_THEMES.modern;
    const stepSeconds = (60 / cfg.bpm) / cfg.stepsPerBeat;
    const intervalMs = Math.max(25, Math.floor(stepSeconds * 1000));

    if (musicTimer) clearInterval(musicTimer);
    musicTimer = setInterval(()=>musicTick(), intervalMs);
  }

  function musicTick(){
    if (!musicEnabled) return;
    if (!audioCtx || !musicGain) return;
    if (!started || paused || gameOver || replayMode) return;

    const cfg = MUSIC_THEMES[musicTheme] || MUSIC_THEMES.modern;
    const stepDur = (60 / cfg.bpm) / cfg.stepsPerBeat;

    // schedule a little ahead (keeps timing stable)
    const ahead = 0.16;
    while (musicNextTime < audioCtx.currentTime + ahead){
      cfg.stepFn(musicStep, musicNextTime, stepDur);
      musicNextTime += stepDur;
      musicStep = (musicStep + 1) % cfg.length;
    }
  }

  function syncMusicTheme(){
    // Theme follows gravity mode
    if (paused || gameOver || !started) return;
    stopMusic(90);
    startMusic(gravityMode);
  }

  // ------------------ Helpers ------------------
  const clamp = (v,min,max)=>Math.max(min,Math.min(max,v));
  const lerp = (a,b,t)=>a+(b-a)*t;

  function setToast(text, on){
    toastText.textContent = text;
    toast.classList.toggle('show', !!on);
  }
  function setLastClear(text, alsoToast=false){
    elLast.textContent = text;
    if (alsoToast){
      setToast(text, true);
      setTimeout(()=>setToast("", false), 750);
    }
  }

  // ------------------ Board metrics ------------------
  const cellSize = Math.floor(gameCanvas.width / COLS);
  const boardW = cellSize * COLS;
  const boardH = cellSize * ROWS;
  const padX = Math.floor((gameCanvas.width - boardW)/2);
  const padY = Math.floor((gameCanvas.height - boardH)/2);

  // ------------------ Game state ------------------
  let board;
  let score = 0, lines = 0, level = 1;
  let highScore = 0;
  let leaderboard = [];

  let paused = false, gameOver = false, started = false;

  let dropInterval = 900, dropAcc = 0;
  let lastTime = 0;

  let current = null;

  // Bag / queue
  let bag = [];
  let nextQueue = [];
  const NEXT_SHOW = 8;

  // Hold
  let holdType = null;
  let canHold = true;

  // Lock / clear
  let touchingGround = false, groundSince = 0;
  let clearing = false, clearRows = [], clearAnimT = 0;

  // Combo/B2B
  let b2b = false;
  let combo = 0;

  // T-spin detect
  let lastAction = "none";
  let lastRotation = null;

  // Particles + lock flashes
  const particles = [];
  const lockFlashes = [];
  const LOCK_FLASH_MS = 140;

  // Shake / banner
  let shakeTime = 0, shakeDur = 0, shakeMag = 0;
  let levelBannerT = 0;
  let levelBannerText = "";

  // Input / repeats (keyboard)
  let kbMoveHeldDir = 0;
  let kbMoveHeldSince = 0;
  let kbMoveLastRepeat = 0;
  let kbSoftDropHeld = false;

  // Input / repeats (gamepad)
  let gpMoveDir = 0;
  let gpMoveHeldSince = 0;
  let gpMoveLastRepeat = 0;
  let gpSoftDropHeld = false;
  let gpPrevButtons = [];
  let gpIndex = null;

  // Soft drop merged
  let softDropHeld = false;
  let softDropAcc = 0;

  // Perfect clear pending
  let pendingClearInfo = null;

  // Trainer (step script)
  let activePreset = "none";
  let trainerSteps = [];
  let trainerStepIndex = 0;
  let trainerMisses = 0;
  let trainerTarget = null;

  // Hint state
  let hintState = null;

  // Finesse tracking (true path)
  let finessePieces = 0;
  let finesseErrors = 0;
  let finesseOptimalTotal = 0;
  let finesseActualTotal = 0;
  let finesseLastText = "—";

  // Per-piece input counters + spawn state
  let pieceInputs = null;

  // ------------------ Keybinds ------------------
  const ACTIONS = [
    {id:"moveLeft",   name:"Move Left"},
    {id:"moveRight",  name:"Move Right"},
    {id:"softDrop",   name:"Soft Drop"},
    {id:"rotateCW",   name:"Rotate CW"},
    {id:"rotateCCW",  name:"Rotate CCW"},
    {id:"hardDrop",   name:"Hard Drop"},
    {id:"hold",       name:"Hold"},
    {id:"pause",      name:"Pause"},
    {id:"restart",    name:"Restart"},
  ];

  const DEFAULT_BINDS = {
    moveLeft:   "ArrowLeft",
    moveRight:  "ArrowRight",
    softDrop:   "ArrowDown",
    rotateCW:   "ArrowUp",
    rotateCCW:  "KeyZ",
    hardDrop:   "ShiftLeft",
    hold:       "KeyC",
    pause:      "Space",
    restart:    "Enter",
  };

  let binds = {...DEFAULT_BINDS};
  let bindListening = null;

  function loadBinds(){
    try{
      const raw = localStorage.getItem(BIND_KEY);
      if (!raw) return;
      const obj = JSON.parse(raw);
      if (obj && typeof obj === "object") binds = {...DEFAULT_BINDS, ...obj};
    }catch{}
  }
  function saveBinds(){ try{ localStorage.setItem(BIND_KEY, JSON.stringify(binds)); }catch{} }

  function prettyKey(code){
    const map = {
      ArrowLeft:"←", ArrowRight:"→", ArrowUp:"↑", ArrowDown:"↓",
      Space:"Space", Enter:"Enter",
      ShiftLeft:"Shift", ShiftRight:"Shift",
      ControlLeft:"Ctrl", ControlRight:"Ctrl",
      AltLeft:"Alt", AltRight:"Alt",
      Escape:"Esc"
    };
    if (map[code]) return map[code];
    if (code.startsWith("Key")) return code.slice(3);
    if (code.startsWith("Digit")) return code.slice(5);
    return code;
  }

  function renderBindUI(){
    bindGrid.innerHTML = "";
    for (const a of ACTIONS){
      const row = document.createElement("div");
      row.className = "bindRow";
      const k = document.createElement("div");
      k.className = "k";
      k.textContent = a.name;

      const key = document.createElement("div");
      key.className = "bindKey";
      key.textContent = prettyKey(binds[a.id] || "");
      key.title = "Click to rebind";
      key.addEventListener("click", ()=>{
        if (bindListening) return;
        bindListening = a.id;
        key.classList.add("listening");
        setToast(`Press a key for: ${a.name} (Esc to cancel)`, true);
      });

      row.appendChild(k);
      row.appendChild(key);
      bindGrid.appendChild(row);
    }
  }

  function actionForCode(code){
    const matches = [];
    for (const a of ACTIONS){
      const b = binds[a.id];
      if (b === code) matches.push(a.id);
      if (a.id === "hardDrop" && (b === "ShiftLeft" || b === "ShiftRight")){
        if (code === "ShiftLeft" || code === "ShiftRight") matches.push("hardDrop");
      }
    }
    return matches;
  }

  // ------------------ Presets ------------------
  function makePreviewStack(rows, type){
    const blocks = [];
    const alpha = 0.32;
    for (let y=0; y<rows.length; y++){
      for (let x=0; x<rows[y].length; x++){
        if (rows[y][x] === "X") blocks.push({x,y,type,alpha});
      }
    }
    return blocks;
  }

  const PRESETS = {
    none: {
      title: "No preset",
      steps: [],
      target: { title:"No target", blocks: [] }
    },
    dt: {
      title: "DT Cannon (trainer)",
      steps: [
        {type:"L", rot:0, x:2, label:"Build left base"},
        {type:"J", rot:0, x:6, label:"Build right base"},
        {type:"S", rot:0, x:3, label:"Bridge center"},
        {type:"Z", rot:0, x:4, label:"Bridge center"},
        {type:"O", rot:0, x:0, label:"Fill left"},
        {type:"T", rot:0, x:4, label:"Prepare T-slot"},
        {type:"I", rot:1, x:9, label:"Make well / stabilize"},
        {type:"T", rot:1, x:4, label:"DT-style T placement"},
      ],
      target: {
        title: "Aim: DT-style T setup + well",
        blocks: makePreviewStack([
          "..........","..........","..........","..........","..........",
          "..........","..........","..........","..........","..........",
          "..........","..........","..........",
          "...XX.XX...",
          "..XXX.XX...",
          "..XXX.XX...",
          ".XXXX.XX...",
          ".XXXX.XX...",
          ".XXXX.XX...",
          ".XXXX.XX...",
        ], "T")
      }
    },
    tki: {
      title: "TKI (trainer)",
      steps: [
        {type:"L", rot:0, x:6, label:"Start platform"},
        {type:"J", rot:0, x:2, label:"Balance left"},
        {type:"T", rot:0, x:4, label:"Place T center"},
        {type:"S", rot:0, x:3, label:"Shape support"},
        {type:"Z", rot:0, x:4, label:"Shape support"},
        {type:"O", rot:0, x:0, label:"Fill left"},
        {type:"I", rot:1, x:9, label:"Create right well"},
        {type:"T", rot:1, x:4, label:"TKI T-slot feel"},
      ],
      target: {
        title: "Aim: platform + T-slot feel",
        blocks: makePreviewStack([
          "..........","..........","..........","..........","..........",
          "..........","..........","..........","..........","..........",
          "..........","..........","..........",
          "..XXX.....",
          ".XXXX.....",
          ".XX.X.....",
          ".XXXX.....",
          ".XXXX.....",
          ".XXXX.....",
          ".XXXX.....",
        ], "T")
      }
    },
    pc: {
      title: "Perfect Clear (trainer)",
      steps: [
        {type:"Z", rot:0, x:3, label:"Shape 1"},
        {type:"S", rot:0, x:4, label:"Shape 2"},
        {type:"O", rot:0, x:0, label:"Fill left"},
        {type:"I", rot:0, x:3, label:"Flatten"},
        {type:"T", rot:0, x:4, label:"Fill middle"},
        {type:"L", rot:0, x:7, label:"Right shape"},
        {type:"J", rot:0, x:6, label:"Right shape"},
        {type:"I", rot:1, x:9, label:"Finish / clean"},
      ],
      target: {
        title: "Aim: clean 4-line base",
        blocks: makePreviewStack([
          "..........","..........","..........","..........","..........",
          "..........","..........","..........","..........","..........",
          "..........","..........","..........","..........","..........",
          "..........","..........","..........",
          "XXXXXXXX..",
          "XXXXXXXX..",
        ], "O")
      }
    }
  };

  // ------------------ Board helpers ------------------
  function makeBoard(){
    const b = [];
    for (let y=0; y<TOTAL_ROWS; y++) b.push(new Array(COLS).fill(null));
    return b;
  }

  function refillBag(){
    const arr = PIECES.slice();
    for (let i=arr.length-1; i>0; i--){
      const j = (bagRand()*(i+1))|0;
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    // store as stack (pop)
    for (const t of arr) bag.push(t);
  }

  function nextFromBag(){
    if (bag.length === 0) refillBag();
    return { type: bag.pop() };
  }

  function nextPieceObject(){
    if (trainerOn && activePreset !== "none" && trainerStepIndex < trainerSteps.length){
      return { type: trainerSteps[trainerStepIndex].type };
    }
    return nextFromBag();
  }

  function ensureQueue(){
    while (nextQueue.length < NEXT_SHOW) nextQueue.push(nextPieceObject());
  }

  function spawnPiece(type){
    return { type, rot:0, x:3, y:0, rx:3, ry:0, rrot:0, lockPulse:0 };
  }

  function getBlocksFor(type, rot, x, y){
    const shape = SHAPES[type][((rot%4)+4)%4];
    return shape.map(p => ({x:p.x+x, y:p.y+y}));
  }

  function getBlocks(piece, rotOverride=null, posOverride=null){
    const rot = rotOverride ?? piece.rot;
    const px = posOverride?.x ?? piece.x;
    const py = posOverride?.y ?? piece.y;
    return getBlocksFor(piece.type, rot, px, py);
  }

  function isInside(x,y){ return x>=0 && x<COLS && y<TOTAL_ROWS; }

  function collidesAt(type, rot, x, y){
    const blocks = getBlocksFor(type, rot, x, y);
    for (const b of blocks){
      if (!isInside(b.x,b.y)) return true;
      if (b.y >= 0 && board[b.y][b.x]) return true;
    }
    return false;
  }

  function collides(piece, rotOverride=null, posOverride=null){
    const rot = rotOverride ?? piece.rot;
    const px = posOverride?.x ?? piece.x;
    const py = posOverride?.y ?? piece.y;
    return collidesAt(piece.type, rot, px, py);
  }

  function recalcSpeed(){
    if (gravityMode === "zen"){ dropInterval = 650; return; }
    if (gravityMode === "classic"){
      const base = 1000;
      dropInterval = clamp(base * Math.pow(0.86, level-1), 70, 1000);
      return;
    }
    const base = 920;
    const lvlFactor = Math.pow(0.90, level-1);
    const scoreFactor = Math.pow(0.995, Math.floor(score/100));
    dropInterval = clamp(base * lvlFactor * scoreFactor, 85, 1000);
  }

  function startShake(mag=6, dur=120){
    if (!enableShake) return;
    shakeMag = mag; shakeDur = dur; shakeTime = dur;
  }

  function showLevelBanner(newLevel){
    levelBannerText = `LEVEL ${newLevel}!`;
    levelBannerT = 900;
    SFX.level();
  }

  // ------------------ Leaderboard ------------------
  function loadHighAndLeaderboard(){
    try{ highScore = parseInt(localStorage.getItem(HIGH_KEY) || "0", 10) || 0; }catch{ highScore = 0; }
    try{
      const raw = localStorage.getItem(LEADER_KEY);
      leaderboard = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(leaderboard)) leaderboard = [];
    }catch{ leaderboard = []; }
  }

  function saveHighAndLeaderboard(){
    try{ localStorage.setItem(HIGH_KEY, String(highScore)); }catch{}
    try{ localStorage.setItem(LEADER_KEY, JSON.stringify(leaderboard)); }catch{}
  }

  function formatDate(ts){
    const d = new Date(ts);
    const pad = (n)=>String(n).padStart(2,"0");
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  function updateLeaderboardUI(){
    leaderList.innerHTML = "";
    if (!leaderboard.length){
      const li = document.createElement("li");
      li.innerHTML = `<small>No runs yet — you’ll be #1 😉</small>`;
      leaderList.appendChild(li);
      return;
    }
    leaderboard.forEach((r)=>{
      const li = document.createElement("li");
      li.innerHTML = `<b>${r.score}</b> <small>(L${r.level} • ${r.lines} lines • ${formatDate(r.ts)})</small>`;
      leaderList.appendChild(li);
    });
  }

  function saveLastReplay(){
    try{ localStorage.setItem(LAST_REPLAY_KEY, JSON.stringify(lastReplay)); }catch{}
    replayBtn.disabled = !lastReplay;
    replayBtn2.disabled = !lastReplay;
  }
  function loadLastReplay(){
    try{
      const raw = localStorage.getItem(LAST_REPLAY_KEY);
      lastReplay = raw ? JSON.parse(raw) : null;
    }catch{ lastReplay = null; }
    replayBtn.disabled = !lastReplay;
    replayBtn2.disabled = !lastReplay;
  }

  function endGame(){
    gameOver = true;
    paused = false;


    // stop background music on game over
    stopMusic(180);

    if (score > highScore) highScore = score;

    finalScore.textContent = String(score);
    finalHigh.textContent = String(highScore);
    finalLevel.textContent = String(level);
    finalLines.textContent = String(lines);

    overlayGameOver.classList.add('show');
    SFX.over();

    leaderboard.push({ score, level, lines, ts: Date.now() });
    leaderboard.sort((a,b)=>b.score - a.score);
    leaderboard = leaderboard.slice(0, 10);
    saveHighAndLeaderboard();
    updateHud();
    updateLeaderboardUI();

    if (!replayMode){
      lastReplay = {
        seed: bagSeed,
        gravityMode, DAS, ARR,
        trainerOn, hintsOn, outlineOn, strictMode, activePreset,
        actionLog,
      };
      saveLastReplay();
    }
  }

  // ------------------ HUD update ------------------
  function updateTrainerHud(){
    if (!(trainerOn && activePreset !== "none" && trainerSteps.length)){
      elStepInfo.textContent = "—";
      elStepMisses.textContent = "0";
      elStepMode.textContent = strictMode ? "Strict" : "Assist";
      return;
    }
    const i = Math.min(trainerStepIndex + 1, trainerSteps.length);
    const n = trainerSteps.length;
    const step = trainerSteps[trainerStepIndex] || null;
    const label = step ? step.label : "Done";
    elStepInfo.textContent = `(${i}/${n}) ${label}`;
    elStepMisses.textContent = String(trainerMisses);
    elStepMode.textContent = strictMode ? "Strict" : "Assist";
  }

  function updateAnalyticsHud(){
    const now = performance.now();
    const elapsed = Math.max(0.001, (now - runStartPerf) / 1000);
    const pps = piecesLocked / elapsed;
    const apm = Math.round((actionTotal / elapsed) * 60);

    elPPS.textContent = pps.toFixed(2);
    elAPM.textContent = String(apm);

    const keys = ["moveLeft","moveRight","softDrop","rotateCW","rotateCCW","hardDrop","hold"];
    const parts = keys.map(k=>{
      const v = actionCounts[k] || 0;
      const label = {
        moveLeft:"←", moveRight:"→", softDrop:"↓", rotateCW:"⟳", rotateCCW:"⟲", hardDrop:"⇩", hold:"H"
      }[k];
      return `${label} ${v}`;
    });
    elHist.textContent = parts.join("  •  ");

    const by = ["I","O","T","S","Z","J","L"].map(t=>{
      const obj = finByPiece[t];
      const total = obj.ok + obj.err;
      if (!total) return `${t}: —`;
      const errPct = Math.round((obj.err/total)*100);
      return `${t}: ${errPct}% err`;
    });
    elFinByPiece.textContent = by.join("  •  ");
  }

  function updateHud(){
    elScore.textContent = String(score);
    elLines.textContent = String(lines);
    elLevel.textContent = String(level);
    elHigh.textContent = String(highScore);

    pauseLabel.textContent = replayMode ? "Replay" : (gameOver ? "Game Over" : (started ? (paused ? "Paused" : "Running") : "Ready"));
    if (typeof startBtn !== "undefined" && startBtn) startBtn.disabled = (replayMode || (!gameOver && started && !paused));
    if (pauseBtn) pauseBtn.disabled = (!started || gameOver || replayMode);
    if (typeof restartBtnMain !== "undefined" && restartBtnMain) restartBtnMain.disabled = (replayMode);
    if (typeof endBtn !== "undefined" && endBtn) endBtn.disabled = (!started || gameOver || replayMode);

    pauseBtn.textContent = paused ? "Resume" : "Pause";

    trainerToggle.textContent = trainerOn ? "🎯 Trainer: On" : "🎯 Trainer: Off";
    hintToggle.textContent = hintsOn ? "💡 Hints: On" : "💡 Hints: Off";
    outlineToggle.textContent = outlineOn ? "🟦 Target outline: On" : "🟦 Target outline: Off";
    strictToggle.textContent = strictMode ? "⚠ Strict: On" : "⚠ Strict: Off";

    trainerToggle.classList.toggle("on", trainerOn);
    hintToggle.classList.toggle("on", hintsOn);
    outlineToggle.classList.toggle("on", outlineOn);
    strictToggle.classList.toggle("on", strictMode);

    dasVal.textContent = String(DAS);
    arrVal.textContent = String(ARR);

    ghostToggle.textContent = showGhost ? "👻 Ghost: On" : "👻 Ghost: Off";
    fxToggle.textContent = enableFX ? "✨ FX: On" : "✨ FX: Off";
    shakeToggle.textContent = enableShake ? "🫨 Shake: On" : "🫨 Shake: Off";

    ghostToggle.classList.toggle("on", showGhost);
    fxToggle.classList.toggle("on", enableFX);
    shakeToggle.classList.toggle("on", enableShake);

    updateTrainerHud();

    const eff = finesseActualTotal === 0 ? 100 : clamp((finesseOptimalTotal / finesseActualTotal) * 100, 0, 120);
    elFinEff.textContent = `${eff.toFixed(0)}%`;
    elFinPieces.textContent = String(finessePieces);
    elFinErrors.textContent = String(finesseErrors);
    elFinLast.textContent = finesseLastText;

    updateAnalyticsHud();

    replayBtn.disabled = !lastReplay;
    replayBtn2.disabled = !lastReplay;
  }

  // ------------------ Replay ------------------
  function startReplay(){
    if (!lastReplay) return;
    stopMusic(120);
    setToast("▶ Replaying last run…", true);
    setTimeout(()=>setToast("", false), 900);

    replayMode = true;
    replayIdx = 0;

    gravityMode = lastReplay.gravityMode || "modern";
    DAS = lastReplay.DAS ?? DAS;
    ARR = lastReplay.ARR ?? ARR;

    trainerOn = !!lastReplay.trainerOn;
    hintsOn = !!lastReplay.hintsOn;
    outlineOn = !!lastReplay.outlineOn;
    strictMode = !!lastReplay.strictMode;
    activePreset = lastReplay.activePreset || "none";

    trainerSteps = (PRESETS[activePreset]?.steps || []).slice();
    trainerStepIndex = 0;
    trainerMisses = 0;
    trainerTarget = PRESETS[activePreset]?.target || null;

    setBagSeed(lastReplay.seed || randomSeed());

    resetGame(true);

    actionLog = (lastReplay.actionLog || []).slice();
    actionCounts = {};
    actionTotal = 0;

    replayStartPerf = performance.now();
    paused = false;
    gameOver = false;
    overlayGameOver.classList.remove('show');

    updateHud();
  }

  function stopReplay(){
    replayMode = false;
    setToast("Replay ended", true);
    setTimeout(()=>setToast("", false), 700);
    resetGame(false);
  }

  // ------------------ Pause ------------------
  
  function togglePause(){
    if (gameOver) return;
    if (!started) return;
    if (replayMode) return;

    // If not started yet, Start Game behaves like "Play"
    if (!started){
      started = true;
      paused = false;
      updateHud();
      startMusic(gravityMode);
      setToast("Go!", true);
      setTimeout(()=>setToast("", false), 700);
      return;
    }

    paused = !paused;
    updateHud();
    setToast(paused ? "Paused" : "Resumed", true);
    if (paused) { stopMusic(120); } else { startMusic(gravityMode); }
    SFX.pause();
    setTimeout(()=>setToast("", false), 700);
  }


  // ------------------ Hold ------------------
  function hold(){
    if (paused || gameOver || clearing) return;
    if (replayMode) return;
    if (!canHold) return;
    canHold = false;
    SFX.hold();

    const curType = current.type;
    if (holdType === null){
      holdType = curType;
      spawnFromQueue();
    } else {
      current = spawnPiece(holdType);
      holdType = curType;
      current.x = 3; current.y = 0; current.rot = 0;
      lastAction = "none";
      lastRotation = null;
      beginPieceInputTracking();
      if (collides(current)) endGame();
    }
    drawHold();
  }

  // ------------------ Movement / rotation (SRS kicks) ------------------
  function tryMove(dx,dy, sfx=true){
    if (paused || gameOver || clearing) return false;
    if (replayMode) return false;
    const nx = current.x + dx;
    const ny = current.y + dy;
    if (!collides(current, current.rot, {x:nx,y:ny})){
      current.x = nx;
      current.y = ny;
      touchingGround = false;

      if (dx !== 0){
        lastAction = "move";
        if (pieceInputs) pieceInputs.moves += Math.abs(dx);
      }
      if (dy !== 0) lastAction = "drop";

      if (sfx && dx !== 0) SFX.move();
      return true;
    }
    return false;
  }

  function rotateWithKick(type, x, y, rot, dir){
    if (type === "O") return {x,y,rot};
    const from = rot;
    const to = (from + (dir>0?1:3)) % 4;
    const key = `${from}>${to}`;
    const kicks = (type === "I") ? KICKS_I[key] : KICKS_JLSTZ[key];
    for (let i=0; i<kicks.length; i++){
      const k = kicks[i];
      const nx = x + k.x;
      const ny = y + k.y;
      if (!collidesAt(type, to, nx, ny)){
        return {x:nx, y:ny, rot:to};
      }
    }
    return null;
  }

  function rotate(dir){
    if (paused || gameOver || clearing) return false;
    if (replayMode) return false;
    const res = rotateWithKick(current.type, current.x, current.y, current.rot, dir);
    if (!res) return false;
    if (current.type === "O") return true;

    current.rot = res.rot;
    current.x = res.x;
    current.y = res.y;

    touchingGround = false;
    lastAction = "rotate";
    lastRotation = { dx:res.x-current.x, dy:res.y-current.y, usedKick:true };

    if (pieceInputs) pieceInputs.rotates += 1;

    SFX.rotate();
    return true;
  }

  function hardDropDistance(piece){
    let d=0;
    while (!collides(piece, piece.rot, {x:piece.x, y:piece.y + d + 1})) d++;
    return d;
  }

  function hardDrop(){
    if (paused || gameOver || clearing) return;
    if (replayMode) return;
    const d = hardDropDistance(current);
    if (d <= 0) return;
    current.y += d;
    score += d * 2;
    updateHud();
    SFX.drop();
    startShake(8, 140);
    touchingGround = true;
    groundSince = LOCK_DELAY + 1;
    lockPiece();
  }

  // ------------------ Trainer hint computation ------------------
  function computeHint(){
    hintState = null;
    if (!(trainerOn && hintsOn && activePreset !== "none" && trainerStepIndex < trainerSteps.length)) return;
    const step = trainerSteps[trainerStepIndex];
    const temp = {type:step.type, rot:step.rot, x:step.x, y:0};
    if (collidesAt(temp.type, temp.rot, temp.x, temp.y)) return;
    const d = hardDropDistance(temp);
    const y = temp.y + d;
    hintState = { type: step.type, x: step.x, rot: step.rot, y, label: step.label, i: trainerStepIndex+1, n: trainerSteps.length };
  }

  function validateStepOnLock(){
    if (!(trainerOn && activePreset !== "none" && trainerStepIndex < trainerSteps.length)) return {active:false};
    const step = trainerSteps[trainerStepIndex];
    const ok = (current.type === step.type && current.x === step.x && (current.rot % 4) === (step.rot % 4));
    return {active:true, ok, step};
  }

  // ------------------ True finesse / analytics tracking ------------------
  function beginPieceInputTracking(){
    pieceInputs = {
      type: current?.type ?? "?",
      spawnedX: current?.x ?? 3,
      spawnedY: current?.y ?? 0,
      spawnedRot: current?.rot ?? 0,
      moves: 0,
      rotates: 0
    };
  }

  // (Simple finesse: compare actions vs heuristic; kept from earlier design)
  function finalizeFinesseForLockedPiece(){
    if (!pieceInputs || !current) return;

    const actual = pieceInputs.moves + pieceInputs.rotates;
    const dx = Math.abs(current.x - pieceInputs.spawnedX);
    const dr = (() => {
      const a = ((current.rot - pieceInputs.spawnedRot) % 4 + 4) % 4;
      const b = ((pieceInputs.spawnedRot - current.rot) % 4 + 4) % 4;
      return Math.min(a,b);
    })();
    const optimal = dx + dr;

    finessePieces += 1;
    finesseOptimalTotal += optimal;
    finesseActualTotal += actual;

    const error = actual > optimal;
    if (error) finesseErrors += 1;

    const bp = finByPiece[pieceInputs.type];
    if (bp){
      if (error) bp.err += 1; else bp.ok += 1;
    }

    finesseLastText = `${pieceInputs.type}: ${actual} vs ${optimal}${error ? " (ERR)" : " (OK)"}`;
    pieceInputs = null;

    updateHud();
  }

  // ------------------ Recording / analytics helpers ------------------
  function countAction(actionId){
    actionCounts[actionId] = (actionCounts[actionId] || 0) + 1;
    actionTotal += 1;
  }

  // ✅ UPDATED: supports extra data (for touch softDropTap etc.)
  function recordAction(kind, actionId, data=null){
    if (replayMode) return;
    const t = performance.now() - runStartPerf;
    actionLog.push({ t, kind, action: actionId, data });
  }

  // ✅ Tap-style actions (used by touch; also works for keyboard if needed)
  function triggerActionTap(actionId, data=null){
    if (bindListening) return;

    if (!replayMode){
      recordAction("tap", actionId, data);

      if (actionId === "softDropTap"){
        const n = Math.max(1, (data?.n|0) || 1);
        for (let i=0;i<n;i++) countAction("softDrop");
      } else if (["moveLeft","moveRight","rotateCW","rotateCCW","hardDrop","hold"].includes(actionId)){
        countAction(actionId);
      }
    }

    handleActionTap(actionId, data);
  }

  function handleActionTap(actionId, data){
    ensureAudio();

    if (paused || gameOver || clearing) return;
    if (replayMode) return;

    switch(actionId){
      case "moveLeft":  tryMove(-1,0,true); break;
      case "moveRight": tryMove(1,0,true); break;
      case "rotateCW":  rotate(+1); break;
      case "rotateCCW": rotate(-1); break;
      case "hardDrop":  hardDrop(); break;
      case "hold":      hold(); break;

      case "softDropTap": {
        const n = Math.max(1, (data?.n|0) || 1);
        for (let i=0;i<n;i++){
          if (!collides(current, current.rot, {x:current.x, y:current.y+1})){
            current.y += 1;
            score += 1;
          } else break;
        }
        updateHud();
        break;
      }
    }
  }

  // ------------------ Unified action triggering (keyboard/controller) ------------------
  function triggerActionDown(actionId, e=null){
    if (bindListening) return;
    if (!replayMode){
      recordAction("down", actionId, null);
      if (["moveLeft","moveRight","softDrop","rotateCW","rotateCCW","hardDrop","hold"].includes(actionId)) countAction(actionId);
    }
    handleActionDown(actionId, e);
  }
  function triggerActionUp(actionId, e=null){
    if (!replayMode) recordAction("up", actionId, null);
    handleActionUp(actionId, e);
  }

  function handleActionDown(actionId, e){
    ensureAudio();

    if (actionId === "pause"){ e?.preventDefault?.(); togglePause(); return; }
    if (actionId === "restart"){
      if (gameOver){
        e?.preventDefault?.();
        if (replayMode) stopReplay();
        else { resetGame(false); gameOver = false; started = true; paused = false; updateHud(); startMusic(gravityMode); }
      }
      return;
    }
    if (paused || gameOver || clearing) return;
    if (replayMode) return;

    switch(actionId){
      case "hardDrop": e?.preventDefault?.(); hardDrop(); break;
      case "hold": e?.preventDefault?.(); hold(); break;
      case "rotateCCW": e?.preventDefault?.(); rotate(-1); break;
      case "rotateCW": e?.preventDefault?.(); rotate(+1); break;
      case "moveLeft":
        e?.preventDefault?.();
        kbMoveHeldDir = -1;
        kbMoveHeldSince = performance.now();
        kbMoveLastRepeat = 0;
        tryMove(-1,0,true);
        break;
      case "moveRight":
        e?.preventDefault?.();
        kbMoveHeldDir = 1;
        kbMoveHeldSince = performance.now();
        kbMoveLastRepeat = 0;
        tryMove(1,0,true);
        break;
      case "softDrop":
        e?.preventDefault?.();
        kbSoftDropHeld = true;
        break;
    }
  }

  function handleActionUp(actionId, e){
    if (actionId === "moveLeft"){
      if (kbMoveHeldDir === -1) kbMoveHeldDir = 0;
    } else if (actionId === "moveRight"){
      if (kbMoveHeldDir === 1) kbMoveHeldDir = 0;
    } else if (actionId === "softDrop"){
      kbSoftDropHeld = false;
    }
  }

  // ✅ UPDATED: replay understands "tap" events (touch included)
  function applyRecordedAction(ev){
    const prevReplay = replayMode;
    replayMode = true;

    if (ev.kind === "down") handleActionDown(ev.action, null);
    else if (ev.kind === "up") handleActionUp(ev.action, null);
    else if (ev.kind === "tap"){
      // temporarily allow tap execution
      replayMode = false;
      handleActionTap(ev.action, ev.data);
      replayMode = true;
    }

    replayMode = prevReplay;
  }

  // ------------------ Keyboard event plumbing ------------------
  function onKeyDown(e){
    if (bindListening){
      e.preventDefault();
      if (e.code === "Escape"){
        bindListening = null;
        setToast("", false);
        renderBindUI();
        return;
      }
      binds[bindListening] = e.code;
      saveBinds();
      setToast(`Bound ${bindListening} to ${prettyKey(e.code)}`, true);
      setTimeout(()=>setToast("", false), 700);
      bindListening = null;
      renderBindUI();
      return;
    }

    const actions = actionForCode(e.code);
    if (!actions.length) return;
    for (const a of actions) triggerActionDown(a, e);
  }

  function onKeyUp(e){
    if (bindListening) return;
    const actions = actionForCode(e.code);
    if (!actions.length) return;
    for (const a of actions) triggerActionUp(a, e);
  }

  window.addEventListener('keydown', (e)=>{
    const block = ["ArrowLeft","ArrowRight","ArrowUp","ArrowDown","Space"];
    if (block.includes(e.code)) e.preventDefault();
  }, {passive:false});

  document.addEventListener('keydown', onKeyDown, {passive:false});
  document.addEventListener('keyup', onKeyUp, {passive:false});

  // ------------------ Held moves (DAS/ARR) ------------------
  function handleHeldMoves(){
    if (paused || gameOver || clearing) return;
    if (replayMode) return;
    if (kbMoveHeldDir === 0) return;

    const now = performance.now();
    const heldFor = now - kbMoveHeldSince;
    if (heldFor < DAS) return;

    if (ARR === 0){
      while (tryMove(kbMoveHeldDir, 0, false)) {}
      SFX.move();
      kbMoveLastRepeat = now;
      return;
    }

    if (kbMoveLastRepeat === 0 || now - kbMoveLastRepeat >= ARR){
      tryMove(kbMoveHeldDir, 0, true);
      kbMoveLastRepeat = now;
    }
  }
  setInterval(handleHeldMoves, 8);

  // ------------------ Touch (RECORDED + REPLAYED) ------------------
  let touchStart = null;
  let activePointers = new Map();

  function onPointerDown(e){
    if (e.pointerType === "mouse") return;
    ensureAudio();
    gameCanvas.setPointerCapture?.(e.pointerId);
    activePointers.set(e.pointerId, {x:e.clientX, y:e.clientY, t:performance.now()});
    if (activePointers.size === 1){
      touchStart = { x:e.clientX, y:e.clientY, t:performance.now(), moved:false };
    }
  }

  function onPointerMove(e){
    if (!touchStart) return;
    const dx = e.clientX - touchStart.x;
    const dy = e.clientY - touchStart.y;
    const adx = Math.abs(dx), ady = Math.abs(dy);

    if (adx + ady > 6) touchStart.moved = true;

    const TH = 28;
    if (paused || gameOver || clearing) return;
    if (replayMode) return;

    // Vertical swipe
    if (ady > adx && ady > TH){
      if (dy > 0){
        // swipe down = 2-step soft drop tap (recorded)
        triggerActionTap("softDropTap", { n: 2 });
      } else {
        // swipe up = hard drop (recorded)
        triggerActionTap("hardDrop");
      }
      touchStart.x = e.clientX; touchStart.y = e.clientY; touchStart.moved = false;
    }
    // Horizontal swipe
    else if (adx > ady && adx > TH){
      if (dx > 0) triggerActionTap("moveRight");
      else triggerActionTap("moveLeft");
      touchStart.x = e.clientX; touchStart.y = e.clientY; touchStart.moved = false;
    }
  }

  function onPointerUp(e){
    if (e.pointerType === "mouse") return;

    const wasTwoFingerTap = (activePointers.size >= 2);
    activePointers.delete(e.pointerId);

    if (wasTwoFingerTap && activePointers.size === 0){
      // 2-finger tap = hold (recorded)
      triggerActionTap("hold");
      touchStart = null;
      return;
    }
    if (!touchStart) return;

    const dt = performance.now() - touchStart.t;
    if (!touchStart.moved && dt < 260){
      if (!paused && !gameOver && !clearing && !replayMode){
        // tap = rotate (recorded)
        triggerActionTap("rotateCW");
      }
    }
    touchStart = null;
  }

  gameCanvas.addEventListener('pointerdown', onPointerDown, {passive:true});
  gameCanvas.addEventListener('pointermove', onPointerMove, {passive:true});
  gameCanvas.addEventListener('pointerup', onPointerUp, {passive:true});
  gameCanvas.addEventListener('pointercancel', ()=>{ touchStart=null; activePointers.clear(); }, {passive:true});

  // ------------------ Gamepad support (poll) ------------------
  function gamepadName(gp){
    if (!gp) return "";
    return gp.id ? gp.id.split("(")[0].trim() : "Gamepad";
  }

  function pollGamepad(){
    const pads = navigator.getGamepads ? navigator.getGamepads() : [];
    let gp = null;

    if (gpIndex !== null && pads[gpIndex]) gp = pads[gpIndex];
    if (!gp){
      for (let i=0;i<pads.length;i++){
        if (pads[i]){ gp = pads[i]; gpIndex = i; break; }
      }
    }

    padStatus.textContent = gp ? `🎮 Gamepad: ${gamepadName(gp)} (connected)` : "🎮 Gamepad: Not connected";
    if (!gp) { gpPrevButtons = []; gpMoveDir = 0; gpSoftDropHeld = false; return; }

    const btn = (i)=> gp.buttons[i]?.pressed;
    const left = !!btn(14);
    const right = !!btn(15);
    const down = !!btn(13);

    const a = !!btn(0);
    const b = !!btn(1);
    const x = !!btn(2);
    const y = !!btn(3);
    const start = !!btn(9);

    const prev = gpPrevButtons;
    const edge = (i, pressed)=> pressed && !prev[i];

    if (edge(9, start)) triggerActionDown("pause", null);

    if (!paused && !gameOver && !replayMode){
      if (edge(0, a)) triggerActionDown("rotateCW", null);
      if (edge(1, b)) triggerActionDown("rotateCCW", null);
      if (edge(2, x)) triggerActionDown("hold", null);
      if (edge(3, y)) triggerActionDown("hardDrop", null);
    }

    gpSoftDropHeld = down && !paused && !gameOver && !replayMode;

    const dir = left && !right ? -1 : right && !left ? 1 : 0;
    if (dir !== gpMoveDir){
      gpMoveDir = dir;
      if (gpMoveDir !== 0 && !paused && !gameOver && !clearing && !replayMode){
        gpMoveHeldSince = performance.now();
        gpMoveLastRepeat = 0;
        triggerActionDown(gpMoveDir === -1 ? "moveLeft" : "moveRight", null);
      }
    } else if (gpMoveDir !== 0 && !paused && !gameOver && !clearing && !replayMode){
      const now = performance.now();
      const heldFor = now - gpMoveHeldSince;
      if (heldFor >= DAS){
        if (ARR === 0){
          while (tryMove(gpMoveDir, 0, false)) {}
          SFX.move();
          gpMoveLastRepeat = now;
        } else {
          if (gpMoveLastRepeat === 0 || now - gpMoveLastRepeat >= ARR){
            tryMove(gpMoveDir, 0, true);
            gpMoveLastRepeat = now;
          }
        }
      }
    }

    gpPrevButtons = gp.buttons.map(b=>!!b.pressed);
  }

  // ------------------ Drawing helpers ------------------
  function drawRoundedRect(c,x,y,w,h,r){
    const rr = Math.min(r, w/2, h/2);
    c.beginPath();
    c.moveTo(x+rr,y);
    c.arcTo(x+w,y,x+w,y+h,rr);
    c.arcTo(x+w,y+h,x,y+h,rr);
    c.arcTo(x,y+h,x,y,rr);
    c.arcTo(x,y,x+w,y,rr);
    c.closePath();
  }

  function pieceGradient(type,x,y,w,h, cctx=ctx){
    const [c1,c2,glow] = PIECE_GRADS[type];
    const g = cctx.createLinearGradient(x,y,x+w,y+h);
    g.addColorStop(0, c1);
    g.addColorStop(1, c2);
    return { fill:g, glow };
  }

  function drawCell(x,y,type, alpha=1, scale=1, flash=0, glowBoost=0){
    const px = padX + x*cellSize;
    const py = padY + y*cellSize;
    const inset = 2.2;
    const w = cellSize - inset*2;
    const h = cellSize - inset*2;

    const cx = px + cellSize/2;
    const cy = py + cellSize/2;
    const sw = w*scale;
    const sh = h*scale;

    const rx = cx - sw/2 + inset;
    const ry = cy - sh/2 + inset;

    const grad = pieceGradient(type, rx, ry, sw, sh);

    ctx.save();
    ctx.globalAlpha = alpha;

    ctx.shadowColor = grad.glow;
    ctx.shadowBlur = 12 + glowBoost;
    drawRoundedRect(ctx, rx, ry, sw, sh, 10);
    ctx.fillStyle = grad.fill;
    ctx.fill();

    ctx.shadowBlur = 0;
    const g2 = ctx.createLinearGradient(rx, ry, rx, ry+sh);
    g2.addColorStop(0, "rgba(255,255,255,.35)");
    g2.addColorStop(0.35, "rgba(255,255,255,.12)");
    g2.addColorStop(1, "rgba(0,0,0,.14)");
    drawRoundedRect(ctx, rx+1.2, ry+1.2, sw-2.4, sh-2.4, 9);
    ctx.fillStyle = g2;
    ctx.fill();

    if (flash > 0){
      ctx.globalAlpha = alpha * flash;
      drawRoundedRect(ctx, rx, ry, sw, sh, 10);
      ctx.fillStyle = "rgba(255,255,255,.78)";
      ctx.fill();
    }

    ctx.globalAlpha = alpha * 0.9;
    ctx.strokeStyle = "rgba(255,255,255,.10)";
    ctx.lineWidth = 1;
    drawRoundedRect(ctx, rx, ry, sw, sh, 10);
    ctx.stroke();

    ctx.restore();
  }

  function drawTargetOutline(blocks, type, pulseT){
    if (!outlineOn) return;
    const [c1,c2,glow] = PIECE_GRADS[type];
    const a = 0.45 + 0.35 * (0.5 + 0.5*Math.sin(pulseT));
    ctx.save();
    ctx.lineWidth = 2;
    ctx.globalAlpha = a;
    ctx.shadowColor = glow;
    ctx.shadowBlur = 14;

    for (const b of blocks){
      const vy = b.y - HIDDEN_ROWS;
      if (vy < 0) continue;
      const px = padX + b.x*cellSize;
      const py = padY + vy*cellSize;
      const inset = 1.3;
      const w = cellSize - inset*2;
      const h = cellSize - inset*2;
      const g = ctx.createLinearGradient(px,py,px+cellSize,py+cellSize);
      g.addColorStop(0,c1);
      g.addColorStop(1,c2);
      ctx.strokeStyle = g;
      drawRoundedRect(ctx, px+inset, py+inset, w, h, 11);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawGrid(){
    const gx = padX, gy = padY, w = boardW, h = boardH;

    const bg = ctx.createLinearGradient(gx, gy, gx+w, gy+h);
    bg.addColorStop(0, "rgba(21,33,74,.72)");
    bg.addColorStop(1, "rgba(13,22,54,.75)");
    ctx.fillStyle = bg;
    drawRoundedRect(ctx, gx, gy, w, h, 14);
    ctx.fill();

    ctx.save();
    ctx.globalAlpha = 0.85;
    ctx.lineWidth = 1;
    for (let y=0; y<=ROWS; y++){
      const yy = gy + y*cellSize;
      ctx.strokeStyle = (y%2===0) ? "rgba(255,255,255,.04)" : "rgba(255,255,255,.03)";
      ctx.beginPath(); ctx.moveTo(gx,yy); ctx.lineTo(gx+w,yy); ctx.stroke();
    }
    for (let x=0; x<=COLS; x++){
      const xx = gx + x*cellSize;
      ctx.strokeStyle = (x%2===0) ? "rgba(255,255,255,.04)" : "rgba(255,255,255,.03)";
      ctx.beginPath(); ctx.moveTo(xx,gy); ctx.lineTo(xx,gy+h); ctx.stroke();
    }
    ctx.restore();

    ctx.strokeStyle = "rgba(255,255,255,.09)";
    ctx.lineWidth = 1.25;
    drawRoundedRect(ctx, gx, gy, w, h, 14);
    ctx.stroke();
  }

  function drawGhost(){
    if (!showGhost) return;
    if (paused || gameOver || clearing) return;
    const d = hardDropDistance(current);
    const blocks = getBlocks(current, current.rot, {x:current.x, y:current.y + d});
    for (const b of blocks){
      const vy = b.y - HIDDEN_ROWS;
      if (vy < 0) continue;
      drawCell(b.x, vy, current.type, 0.20, 0.98, 0);
    }
  }

  let hintPulse = 0;

  function drawHintGhost(dt){
    if (!hintState) return;
    if (paused || gameOver || clearing) return;

    hintPulse += dt * 0.010;

    const blocks = getBlocksFor(hintState.type, hintState.rot, hintState.x, hintState.y);

    for (const b of blocks){
      const vy = b.y - HIDDEN_ROWS;
      if (vy < 0) continue;
      drawCell(b.x, vy, hintState.type, 0.32, 1.00, 0, 16);
    }

    drawTargetOutline(blocks, hintState.type, hintPulse);

    const gx = padX, gy = padY, w = boardW;
    const text = `Step ${hintState.i}/${hintState.n}: ${hintState.label}`;
    ctx.save();
    ctx.globalAlpha = 0.95;
    ctx.font = "800 12px system-ui, -apple-system, Segoe UI, Roboto, Arial";
    const tw = ctx.measureText(text).width;
    const bx = gx + (w - (tw + 22)) / 2;
    const by = gy + 10;

    ctx.shadowColor = "rgba(120,255,220,.35)";
    ctx.shadowBlur = 18;
    drawRoundedRect(ctx, bx, by, tw+22, 26, 12);
    const g = ctx.createLinearGradient(bx, by, bx+tw+22, by+26);
    g.addColorStop(0, "rgba(120,255,220,.20)");
    g.addColorStop(1, "rgba(160,180,255,.18)");
    ctx.fillStyle = g;
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.strokeStyle = "rgba(255,255,255,.18)";
    ctx.stroke();

    ctx.fillStyle = "rgba(255,255,255,.92)";
    ctx.textBaseline = "middle";
    ctx.fillText(text, bx+11, by+13);
    ctx.restore();
  }

  let frameDT = 16.67;

  function drawBoardCells(){
    for (let y=HIDDEN_ROWS; y<TOTAL_ROWS; y++){
      for (let x=0; x<COLS; x++){
        const cell = board[y][x];
        if (!cell) continue;

        const vy = y - HIDDEN_ROWS;
        if (vy < 0 || vy >= ROWS) continue;
        drawCell(x, vy, cell.type, 1, 1, 0);
      }
    }
  }

  function lerpAngle(a,b,t){
    let d = (b - a);
    while (d > 2) d -= 4;
    while (d < -2) d += 4;
    return a + d*t;
  }

  function drawCurrentPiece(dt){
    if (!current) return;
    const s = 1 - Math.pow(0.001, dt/16.67);
    current.rx = lerp(current.rx, current.x, s);
    current.ry = lerp(current.ry, current.y, s);
    current.rrot = lerpAngle(current.rrot, current.rot, s);

    const blocks = SHAPES[current.type][current.rot];
    for (const p of blocks){
      const x = p.x + Math.round(current.rx);
      const y = p.y + Math.round(current.ry);
      const vy = y - HIDDEN_ROWS;
      if (vy < 0) continue;
      drawCell(x, vy, current.type, 1, 1, 0);
    }
  }

  function drawParticles(dt){
    if (!enableFX) return;
    for (let i=particles.length-1; i>=0; i--){
      const p = particles[i];
      p.age += dt/1000;
      if (p.age >= p.life){ particles.splice(i,1); continue; }
      p.vy += 520 * (dt/1000);
      p.x += p.vx * (dt/1000);
      p.y += p.vy * (dt/1000);
      p.vx *= Math.pow(0.92, dt/16.67);
      p.vy *= Math.pow(0.98, dt/16.67);

      const tt = 1 - (p.age / p.life);
      ctx.save();
      ctx.globalAlpha = 0.9 * tt;
      ctx.fillStyle = "rgba(255,255,255,.7)";
      ctx.beginPath();
      ctx.arc(p.x,p.y,p.r*(0.6+0.6*tt),0,Math.PI*2);
      ctx.fill();
      ctx.restore();
    }
  }

  function drawBanner(dt){
    if (levelBannerT <= 0) return;
    levelBannerT = Math.max(0, levelBannerT - dt);

    const t = 1 - (levelBannerT / 900);
    const inT = clamp(t/0.25, 0, 1);
    const outT = clamp((t-0.75)/0.25, 0, 1);
    const alpha = (1 - outT) * inT;

    const scale = 0.92 + 0.12 * Math.sin(clamp(t,0,1) * Math.PI);

    const gx = padX, gy = padY, w = boardW, h = boardH;
    const cx = gx + w/2;
    const cy = gy + h*0.22;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(cx, cy);
    ctx.scale(scale, scale);

    ctx.shadowColor = "rgba(170,220,255,.55)";
    ctx.shadowBlur = 24;

    const bw = 220, bh = 46;
    drawRoundedRect(ctx, -bw/2, -bh/2, bw, bh, 16);
    const grad = ctx.createLinearGradient(-bw/2,-bh/2,bw/2,bh/2);
    grad.addColorStop(0, "rgba(120,255,220,.22)");
    grad.addColorStop(1, "rgba(160,180,255,.22)");
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.strokeStyle = "rgba(255,255,255,.18)";
    ctx.lineWidth = 1;
    drawRoundedRect(ctx, -bw/2, -bh/2, bw, bh, 16);
    ctx.stroke();

    ctx.fillStyle = "rgba(255,255,255,.92)";
    ctx.font = "900 18px system-ui, -apple-system, Segoe UI, Roboto, Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(levelBannerText, 0, 0);

    ctx.restore();
  }

  function draw(){
    ctx.clearRect(0,0,gameCanvas.width, gameCanvas.height);

    if (shakeTime > 0){
      shakeTime = Math.max(0, shakeTime - frameDT);
      const tt = shakeTime / shakeDur;
      const mag = shakeMag * tt;
      const ox = (Math.random()*2-1) * mag;
      const oy = (Math.random()*2-1) * mag;

      ctx.save();
      ctx.translate(ox, oy);
      drawScene();
      ctx.restore();
    } else {
      drawScene();
    }

    drawBanner(frameDT);
  }

  function drawScene(){
    drawGrid();
    drawHintGhost(frameDT);
    drawGhost();
    drawBoardCells();
  }

  // ------------------ Mini canvases ------------------
  function roundRectMini(c,x,y,w,h,r){
    c.beginPath();
    c.moveTo(x+r,y);
    c.arcTo(x+w,y,x+w,y+h,r);
    c.arcTo(x+w,y+h,x,y+h,r);
    c.arcTo(x,y+h,x,y,r);
    c.arcTo(x,y,x+w,y,r);
    c.closePath();
  }

  function drawMiniBg(c, w, h){
    const bg = c.createLinearGradient(0,0,w,h);
    bg.addColorStop(0, "rgba(21,33,74,.65)");
    bg.addColorStop(1, "rgba(13,22,54,.70)");
    c.fillStyle = bg;
    c.fillRect(0,0,w,h);

    c.save();
    c.globalAlpha = 0.18;
    c.strokeStyle = "rgba(255,255,255,.18)";
    c.lineWidth = 1;
    const cell = 22;
    for (let y=0; y<=Math.floor(h/cell); y++){
      c.beginPath(); c.moveTo(0,y*cell); c.lineTo(w,y*cell); c.stroke();
    }
    for (let x=0; x<=Math.floor(w/cell); x++){
      c.beginPath(); c.moveTo(x*cell,0); c.lineTo(x*cell,h); c.stroke();
    }
    c.restore();
  }

  function drawMiniPiece(c, type, boxX, boxY, boxW, boxH){
    if (!type) return;
    const blocks = SHAPES[type][0];
    let minX=99,minY=99,maxX=-99,maxY=-99;
    for (const b of blocks){
      minX = Math.min(minX,b.x); minY = Math.min(minY,b.y);
      maxX = Math.max(maxX,b.x); maxY = Math.max(maxY,b.y);
    }
    const bw = (maxX-minX+1), bh = (maxY-minY+1);
    const cell = Math.floor(Math.min(boxW/(bw+1), boxH/(bh+1)));
    const ox = boxX + Math.floor((boxW - bw*cell)/2) - minX*cell;
    const oy = boxY + Math.floor((boxH - bh*cell)/2) - minY*cell;

    const [c1,c2,glow] = PIECE_GRADS[type];
    for (const b of blocks){
      const x = ox + b.x*cell;
      const y = oy + b.y*cell;
      const g = c.createLinearGradient(x,y,x+cell,y+cell);
      g.addColorStop(0,c1); g.addColorStop(1,c2);

      c.save();
      c.shadowColor = glow;
      c.shadowBlur = 10;
      c.fillStyle = g;
      roundRectMini(c, x+2, y+2, cell-4, cell-4, 8);
      c.fill();
      c.shadowBlur = 0;
      c.strokeStyle = "rgba(255,255,255,.14)";
      c.lineWidth = 1;
      roundRectMini(c, x+2, y+2, cell-4, cell-4, 8);
      c.stroke();
      c.restore();
    }
  }

  function drawHold(){
    hctx.clearRect(0,0,holdCanvas.width, holdCanvas.height);
    drawMiniBg(hctx, holdCanvas.width, holdCanvas.height);
    drawMiniPiece(hctx, holdType, 0, 0, holdCanvas.width, holdCanvas.height);
  }

  function drawNextQueue(){
    ensureQueue();
    nctx.clearRect(0,0,nextCanvas.width, nextCanvas.height);
    drawMiniBg(nctx, nextCanvas.width, nextCanvas.height);

    const count = NEXT_SHOW;
    const slotH = Math.floor(nextCanvas.height / count);

    for (let i=0; i<count; i++){
      const y = i * slotH;
      if (i > 0){
        nctx.save();
        nctx.globalAlpha = 0.16;
        nctx.strokeStyle = "rgba(255,255,255,.16)";
        nctx.beginPath();
        nctx.moveTo(10, y);
        nctx.lineTo(nextCanvas.width-10, y);
        nctx.stroke();
        nctx.restore();
      }
      drawMiniPiece(nctx, nextQueue[i]?.type ?? null, 0, y, nextCanvas.width, slotH);
    }
  }

  function drawTargetPreview(){
    tctx.clearRect(0,0,targetCanvas.width, targetCanvas.height);
    drawMiniBg(tctx, targetCanvas.width, targetCanvas.height);

    const W = targetCanvas.width;
    const H = targetCanvas.height;

    const title = (trainerOn && trainerTarget) ? trainerTarget.title : "Trainer Off";
    tctx.save();
    tctx.fillStyle = "rgba(233,238,255,.88)";
    tctx.font = "800 12px system-ui, -apple-system, Segoe UI, Roboto, Arial";
    tctx.textAlign = "left";
    tctx.textBaseline = "top";
    tctx.fillText(title, 10, 8);
    tctx.restore();
  }

  // ------------------ Spawn / queue ------------------
  function spawnFromQueue(){
    ensureQueue();
    const next = nextQueue.shift();
    current = spawnPiece(next.type);
    current.x = 3; current.y = 0; current.rot = 0;
    current.rx = current.x; current.ry = current.y;
    lastAction = "none";
    lastRotation = null;
    canHold = true;

    ensureQueue();
    drawNextQueue();

    beginPieceInputTracking();
  }

  // ------------------ Lock / clear (simple modern scoring) ------------------
  function lockPiece(){
    const stepRes = validateStepOnLock();
    if (stepRes.active){
      if (!stepRes.ok){
        trainerMisses += 1;
        if (strictMode){
          loadPreset(activePreset);
          return;
        }
      }
      trainerStepIndex = Math.min(trainerStepIndex + 1, trainerSteps.length);
      updateTrainerHud();
    }

    finalizeFinesseForLockedPiece();

    const blocks = getBlocks(current);
    for (const b of blocks){
      if (b.y < 0) continue;
      board[b.y][b.x] = { type: current.type };
    }
    piecesLocked += 1;
    SFX.lock();

    const full = [];
    for (let y=HIDDEN_ROWS; y<TOTAL_ROWS; y++){
      if (board[y].every(cell => cell !== null)) full.push(y);
    }

    if (full.length){
      // clear
      full.sort((a,b)=>a-b);
      for (const y of full){
        board.splice(y,1);
        board.splice(HIDDEN_ROWS, 0, new Array(COLS).fill(null));
      }

      const n = full.length;
      const base = (LINE_SCORE[n] || (n*120)) * level;
      score += base;
      lines += n;

      const prevLevel = level;
      level = 1 + Math.floor(lines / LINES_PER_LEVEL);
      if (level > prevLevel) showLevelBanner(level);

      recalcSpeed();
      setLastClear(`${n} line${n>1?"s":""} (+${base})`, true);
      SFX.clear(n);
      startShake(7, 140);
      updateHud();
    } else {
      setLastClear("LOCK");
    }

    spawnFromQueue();
    if (collides(current)) endGame();
  }

  // ------------------ Reset / preset / analytics ------------------
  function resetAnalyticsAndRecording(){
    runStartPerf = performance.now();
    piecesLocked = 0;
    actionLog = [];
    actionCounts = {};
    actionTotal = 0;
    for (const k of Object.keys(finByPiece)){
      finByPiece[k].ok = 0;
      finByPiece[k].err = 0;
    }
  }

  function resetGame(keepTrainer=false){
    board = makeBoard();
    score = 0; lines = 0; level = 1;
    paused = false; gameOver = false;
    touchingGround = false; groundSince = 0;
    dropAcc = 0;

    holdType = null;
    canHold = true;

    finessePieces = 0;
    finesseErrors = 0;
    finesseOptimalTotal = 0;
    finesseActualTotal = 0;
    finesseLastText = "—";

    resetAnalyticsAndRecording();

    if (!keepTrainer){
      trainerOn = false;
      activePreset = "none";
      trainerSteps = [];
      trainerStepIndex = 0;
      trainerMisses = 0;
      trainerTarget = null;
    } else {
      trainerTarget = PRESETS[activePreset]?.target || null;
    }

    bag = [];
    nextQueue = [];
    refillBag();

    ensureQueue();
    spawnFromQueue();

    overlayGameOver.classList.remove('show');
    setToast("", false);

    recalcSpeed();
    updateHud();
    drawHold();
    drawNextQueue();
    drawTargetPreview();
    setLastClear("—");

    computeHint();

    if (collides(current)) endGame();
  }

  function loadPreset(presetKey){
    activePreset = presetKey;
    const p = PRESETS[presetKey] || PRESETS.none;

    trainerSteps = p.steps.slice();
    trainerStepIndex = 0;
    trainerMisses = 0;
    trainerTarget = p.target;

    trainerOn = (presetKey !== "none") ? true : trainerOn;

    setLastClear(`TRAINER: ${p.title}`, true);

    resetGame(true);

    nextQueue = [];
    ensureQueue();
    drawNextQueue();
    drawTargetPreview();

    computeHint();
    updateHud();
  }

  // ------------------ Game loop ------------------
  function stepDown(){
    // (during replay we allow drop to happen naturally but do not allow manual move functions)
    const ny = current.y + 1;
    if (!collides(current, current.rot, {x:current.x, y:ny})){
      current.y = ny;
      touchingGround = false;
      return true;
    }
    if (!touchingGround){ touchingGround = true; groundSince = 0; }
    return false;
  }

  function replayPump(){
    if (!replayMode) return;
    const tNow = performance.now() - replayStartPerf;
    while (replayIdx < actionLog.length && actionLog[replayIdx].t <= tNow){
      const ev = actionLog[replayIdx++];
      applyRecordedAction(ev);
    }
    if (replayIdx >= actionLog.length && gameOver){
      replayMode = false;
      updateHud();
      setToast("Replay finished", true);
      setTimeout(()=>setToast("", false), 900);
    }
  }

  function update(dt){
    softDropHeld = kbSoftDropHeld || gpSoftDropHeld;
    if (!started) { pollGamepad(); return; }

    if (!paused && !gameOver){
      computeHint();

      pollGamepad();
      if (replayMode) replayPump();

      if (softDropHeld && !replayMode){
        softDropAcc += dt;
        while (softDropAcc >= SOFT_DROP_RATE){
          softDropAcc -= SOFT_DROP_RATE;
          if (!collides(current, current.rot, {x:current.x, y:current.y+1})){
            current.y += 1;
            score += 1;
          } else break;
        }
        updateHud();
      } else {
        softDropAcc = 0;
      }

      dropAcc += dt;
      while (dropAcc >= dropInterval){
        dropAcc -= dropInterval;
        stepDown();
      }

      if (touchingGround){
        groundSince += dt;
        if (groundSince >= LOCK_DELAY){
          lockPiece();
          touchingGround = false;
          groundSince = 0;
        }
      }
    }
  }

  function frame(t){
    frameDT = Math.min(34, t - lastTime || 16.67);
    lastTime = t;

    update(frameDT);
    draw();
    drawCurrentPiece(frameDT);
    drawParticles(frameDT);

    requestAnimationFrame(frame);
  }

  // ------------------ UI events ------------------
  pauseBtn.addEventListener('click', ()=>togglePause());
  if (startBtn){
    startBtn.addEventListener('click', ()=>{
      if (replayMode) stopReplay();

      // First start (or after ending / game over) must create a fresh run + spawn a piece
      if (!started || gameOver){
        gameOver = false;
        resetGame(false);
      }

      started = true;
      paused = false;
      updateHud();
      if (musicEnabled) startMusic(gravityMode);
      setToast("Started", false);
    });
  }
  if (restartBtnMain){
    restartBtnMain.addEventListener('click', ()=>{
      if (replayMode) stopReplay();
      gameOver = false;
      resetGame(false);
      started = true;
      paused = false;
      updateHud();
      startMusic(gravityMode);
      setToast("Restarted", false);
    });
  }
  if (endBtn){
    endBtn.addEventListener('click', ()=>{
      if (replayMode) stopReplay();
      if (!started || gameOver) return;
      endGame();
      started = false;
      updateHud();
    });
  }

  restartBtn.addEventListener('click', ()=>{
    if (replayMode) stopReplay();
    else { resetGame(false); gameOver = false; started = true; paused = false; updateHud(); if (musicEnabled) startMusic(gravityMode); }
  });

  replayBtn.addEventListener('click', ()=>startReplay());
  replayBtn2.addEventListener('click', ()=>startReplay());

  soundToggle.addEventListener('click', ()=>{
    soundEnabled = !soundEnabled;
    setSoundUI();
    saveAudioPrefs();
    if (soundEnabled){
      ensureAudio();
      SFX.rotate();
    }
  });

  if (musicToggle){
    musicToggle.addEventListener('click', ()=>{
      musicEnabled = !musicEnabled;
      setMusicUI();
      saveAudioPrefs();
      if (musicEnabled){
        ensureMusic();
        if (started && !paused && !gameOver && !replayMode) startMusic(gravityMode);
      } else {
        stopMusic(140);
      }
    });
  }

  if (musicVolSlider){
    musicVolSlider.addEventListener('input', ()=>{
      musicVolume = Math.max(0, Math.min(100, parseInt(musicVolSlider.value || '0', 10) || 0));
      if (musicVolVal) musicVolVal.textContent = String(musicVolume);
      saveAudioPrefs();

      // Apply live to running music
      if (audioCtx && musicGain){
        const t0 = audioCtx.currentTime;
        const target = (musicVolume/100) * 0.30;
        try{
          musicGain.gain.cancelScheduledValues(t0);
          musicGain.gain.setValueAtTime(musicGain.gain.value, t0);
          musicGain.gain.linearRampToValueAtTime(Math.max(0.0001, target), t0 + 0.08);
        }catch{}
      }
    });
  }

  trainerToggle.addEventListener('click', ()=>{
    if (replayMode) return;
    trainerOn = !trainerOn;
    if (!trainerOn){
      activePreset = "none";
      trainerSteps = [];
      trainerStepIndex = 0;
      trainerMisses = 0;
      trainerTarget = null;
      setLastClear("TRAINER OFF", true);
      resetGame(false);
    } else {
      setLastClear("TRAINER ON — pick a preset", true);
      updateHud();
      drawTargetPreview();
    }
    updateHud();
  });

  hintToggle.addEventListener('click', ()=>{
    if (replayMode) return;
    hintsOn = !hintsOn;
    updateHud();
  });

  outlineToggle.addEventListener('click', ()=>{
    if (replayMode) return;
    outlineOn = !outlineOn;
    updateHud();
  });

  strictToggle.addEventListener('click', ()=>{
    if (replayMode) return;
    strictMode = !strictMode;
    updateHud();
    setLastClear(strictMode ? "STRICT MODE ON" : "STRICT MODE OFF", true);
  });

  loadPresetBtn.addEventListener('click', ()=>{
    if (replayMode) return;
    const key = presetSelect.value;
    if (key === "none"){
      activePreset = "none";
      trainerSteps = [];
      trainerStepIndex = 0;
      trainerMisses = 0;
      trainerTarget = null;
      drawTargetPreview();
      setLastClear("Preset cleared", true);
      resetGame(true);
      return;
    }
    loadPreset(key);
  });

  resetPresetBtn.addEventListener('click', ()=>{
    if (replayMode) return;
    if (!trainerOn || activePreset === "none"){
      setLastClear("No preset active", true);
      return;
    }
    loadPreset(activePreset);
  });

  dasSlider.addEventListener('input', ()=>{
    DAS = parseInt(dasSlider.value,10);
    dasVal.textContent = String(DAS);
  });
  arrSlider.addEventListener('input', ()=>{
    ARR = parseInt(arrSlider.value,10);
    arrVal.textContent = String(ARR);
  });

  gravitySelect.addEventListener('change', ()=>{
    if (replayMode) return;
    gravityMode = gravitySelect.value;
    recalcSpeed();
    setLastClear(`GRAVITY: ${gravityMode.toUpperCase()}`, true);
    syncMusicTheme();
  });

  ghostToggle.addEventListener('click', ()=>{ showGhost = !showGhost; updateHud(); });
  fxToggle.addEventListener('click', ()=>{ enableFX = !enableFX; updateHud(); });
  shakeToggle.addEventListener('click', ()=>{ enableShake = !enableShake; updateHud(); });

  clearLeaderboardBtn.addEventListener('click', ()=>{
    leaderboard = [];
    saveHighAndLeaderboard();
    updateLeaderboardUI();
  });

  resetBindsBtn.addEventListener('click', ()=>{
    if (replayMode) return;
    binds = {...DEFAULT_BINDS};
    saveBinds();
    renderBindUI();
    setToast("Keybinds reset", true);
    setTimeout(()=>setToast("", false), 650);
  });

  // ------------------ Init ------------------
  function init(){
    loadAudioPrefs();
    loadHighAndLeaderboard();
    loadBinds();
    renderBindUI();
    setSoundUI();
    setMusicUI();
    updateLeaderboardUI();
    loadLastReplay();

    setBagSeed(randomSeed());

    dasSlider.value = String(DAS);
    arrSlider.value = String(ARR);
    gravitySelect.value = gravityMode;

    updateHud();
    resetGame(false);
    started = false;
    paused = true;
    updateHud();
    setToast('Press Start', true);
    setTimeout(()=>setToast('', false), 1200);
    requestAnimationFrame(frame);
  }

  init();
})();

// --- PWA Service Worker registration ---
if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("service-worker.js");
    });
  }
