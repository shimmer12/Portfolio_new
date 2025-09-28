document.addEventListener('DOMContentLoaded', () => {
  // --- PRELOADER ---
  const preloader = document.getElementById('preloader');
  const preloaderPercent = document.getElementById('preloader-percent');
  let loaded = 0;
  let preloaderInterval = null;

  function finishPreloader() {
    if (preloaderInterval) { clearInterval(preloaderInterval); preloaderInterval = null; }
    if (preloader.style.display !== 'none') {
      gsap.to(preloader, {
        opacity: 0, duration: 0.8, onComplete: () => {
          preloader.style.display = 'none';
          document.body.classList.add('loaded');
          try { initPageAnimations(); } catch (err) { console.error('initPageAnimations error', err); }
        }
      });
    }
  }

  preloaderInterval = setInterval(() => {
    loaded++; preloaderPercent.textContent = `${loaded}%`;
    if (loaded >= 100) { finishPreloader(); }
  }, 20);

  window.addEventListener('load', () => { if (preloader.style.display !== 'none') finishPreloader(); });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && preloader.style.display !== 'none') finishPreloader();
  });
  function onFirstInteraction(){ if (preloader.style.display !== 'none') finishPreloader(); }
  window.addEventListener('click', onFirstInteraction, { once:true });
  window.addEventListener('touchstart', onFirstInteraction, { once:true });
  window.addEventListener('keydown', onFirstInteraction, { once:true });

  // --- MAIN INIT ---
  function initPageAnimations() {
    // GSAP setup
    gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
    ScrollTrigger.getAll().forEach(t => t.kill());

    const sections = gsap.utils.toArray(".panel");

    // Text splits
    sections.forEach(section => {
      const headings = section.querySelectorAll('.gsap-reveal-chars');
      headings.forEach(heading => {
        heading.style.opacity = '1';
        try {
          const typeSplit = new SplitType(heading, { types: 'chars' });
          heading.classList.add('split-initialized');
          gsap.set(typeSplit.chars, { yPercent: 100, opacity: 0 });
          gsap.to(typeSplit.chars, {
            yPercent: 0, opacity: 1, duration: 0.6, ease: 'power3.out', stagger: 0.03,
            scrollTrigger: { trigger: heading, start: 'top 80%', toggleActions: 'play none none none',
              onComplete: () => { heading.style.opacity = '1'; } }
          });
        } catch(e) {
          console.warn('SplitType failed:', e);
          heading.style.opacity = '1'; heading.style.transform = 'none';
        }
      });

      const simpleReveals = section.querySelectorAll('.gsap-reveal');
      simpleReveals.forEach(reveal => {
        reveal.style.opacity = '1';
        gsap.fromTo(reveal, { y:50, opacity:0 }, {
          y:0, opacity:1, duration:1, ease:'power3.out',
          scrollTrigger:{ trigger:reveal, start:'top 80%', toggleActions:'play none none none',
            onComplete:()=>{ reveal.style.opacity = '1'; } }
        });
      });
    });

    // Hero SVG parallax
    gsap.to("#home .gsap-reveal svg", {
      yPercent:-20, ease:"none",
      scrollTrigger:{ trigger:"#home", start:"top top", end:"bottom top", scrub:true }
    });

    // PARTICLE ENGINE
    const canvas = document.getElementById('particle-canvas');
    const ctx = canvas.getContext('2d');
    function resizeCanvas(){ canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    let particles = [];
    const particleConfig = { mist: { count: 50, colors: ['rgba(147,112,219,0.6)','rgba(192,192,192,0.8)'] } };

    class Particle {
      constructor(type, colors, startX, startY){
        this.type = type;
        this.color = colors[Math.floor(Math.random()*colors.length)];
        this.opacity = 1; this.life = 0;
        this.x = startX; this.y = startY;
        this.size = Math.random()*3 + 1;
        this.speedX = (Math.random()-0.5)*4;
        this.speedY = (Math.random()-0.5)*4;
        this.maxLife = 60 + Math.random()*40;
      }
      update(){ this.x += this.speedX; this.y += this.speedY; this.life++; this.opacity = 1 - (this.life/this.maxLife); }
      draw(){
        if (this.opacity <= 0) return;
        ctx.save(); ctx.globalAlpha = this.opacity; ctx.fillStyle = this.color; ctx.translate(this.x, this.y);
        ctx.beginPath(); ctx.arc(0,0,this.size,0,Math.PI*2); ctx.fill(); ctx.closePath(); ctx.restore();
      }
    }
    function createParticles(type, startX, startY){
      const cfg = particleConfig[type]; if (!cfg || !cfg.colors) return;
      for (let i=0;i<cfg.count;i++) particles.push(new Particle(type, cfg.colors, startX, startY));
    }
    function animateParticles(){
      ctx.clearRect(0,0,canvas.width,canvas.height);
      particles.forEach((p, i) => { p.update(); p.draw(); if (p.life >= p.maxLife) particles.splice(i,1); });
      requestAnimationFrame(animateParticles);
    }
    animateParticles();

    // LEAVES trigger
    const leavesContainer = document.getElementById('leaves');
    ScrollTrigger.create({
      trigger:'#experience', start:'top center', end:'bottom center',
      onEnter:()=>gsap.to(leavesContainer,{autoAlpha:1,duration:1}),
      onLeave:()=>gsap.to(leavesContainer,{autoAlpha:0,duration:1}),
      onEnterBack:()=>gsap.to(leavesContainer,{autoAlpha:1,duration:1}),
      onLeaveBack:()=>gsap.to(leavesContainer,{autoAlpha:0,duration:1}),
    });

    // Dandelion wind visibility
    const dandelionWindTrigger = document.getElementById('dandelion-wind');
    if (dandelionWindTrigger){
      ScrollTrigger.create({
        trigger:'#projects', start:'top center', end:'bottom center',
        onEnter:()=>gsap.to(dandelionWindTrigger,{autoAlpha:1,duration:1}),
        onLeave:()=>gsap.to(dandelionWindTrigger,{autoAlpha:0,duration:1}),
        onEnterBack:()=>gsap.to(dandelionWindTrigger,{autoAlpha:1,duration:1}),
        onLeaveBack:()=>gsap.to(dandelionWindTrigger,{autoAlpha:0,duration:1}),
      });
    }

    // Sakura petals canvas (About)
    const petalCanvas = document.querySelector('#about canvas');
    const petalCtx = petalCanvas.getContext('2d');
    function resizePetalCanvas(){ petalCanvas.width = window.innerWidth; petalCanvas.height = window.innerHeight; }
    resizePetalCanvas(); window.addEventListener('resize', resizePetalCanvas);

    const TOTAL = 100; const petalArray = [];
    const petalImg = new Image();
    petalImg.src = 'https://djjjk9bjm164h.cloudfront.net/petal.png';
    petalImg.addEventListener('load', () => { for (let i=0;i<TOTAL;i++) petalArray.push(new Petal()); renderPetals(); });

    function renderPetals(){
      petalCtx.clearRect(0,0,petalCanvas.width, petalCanvas.height);
      petalArray.forEach(p => p.animate());
      window.requestAnimationFrame(renderPetals);
    }
    let mouseX = 0;
    function touchHandler(e){ mouseX = (e.clientX || (e.touches && e.touches[0].clientX) || 0) / window.innerWidth; }
    window.addEventListener('mousemove', touchHandler);
    window.addEventListener('touchmove', touchHandler);

    class Petal{
      constructor(){
        this.x = Math.random()*petalCanvas.width;
        this.y = (Math.random()*petalCanvas.height*2) - petalCanvas.height;
        this.w = 25 + Math.random()*15;
        this.h = 20 + Math.random()*10;
        this.opacity = this.w/40;
        this.flip = Math.random();
        this.xSpeed = 0.15 + Math.random()*0.2;
        this.ySpeed = 0.08 + Math.random()*0.12;
        this.flipSpeed = Math.random()*0.005;
      }
      draw(){
        if (this.y > petalCanvas.height || this.x > petalCanvas.width){
          this.x = -petalImg.width;
          this.y = (Math.random()*petalCanvas.height*2) - petalCanvas.height;
          this.xSpeed = 0.15 + Math.random()*0.2;
          this.ySpeed = 0.08 + Math.random()*0.12;
          this.flip = Math.random();
        }
        petalCtx.globalAlpha = this.opacity;
        petalCtx.drawImage(
          petalImg,
          this.x, this.y,
          this.w * (0.6 + (Math.abs(Math.cos(this.flip))/3)),
          this.h * (0.8 + (Math.abs(Math.sin(this.flip))/5))
        );
      }
      animate(){ this.x += this.xSpeed + mouseX*0.2; this.y += this.ySpeed + mouseX*0.1; this.flip += this.flipSpeed; this.draw(); }
    }

    // DANDELION SEEDS (Projects)
    const dandelionWind = document.getElementById('dandelion-wind');
    if (dandelionWind){
      function createWindSeed(){
        const seed = document.createElement('div');
        seed.className = Math.random()>0.7 ? 'seed flutter' : 'seed';
        const startX = -20 + Math.random()*60;
        const startY = 50 + Math.random()*400;
        seed.style.left = startX + 'px'; seed.style.top = startY + 'px';
        const duration = 15 + Math.random()*10; seed.style.setProperty('--dur', duration + 's');

        const waypoints = []; let currentX=0, currentY=0;
        for (let i=0;i<=5;i++){ currentX += 60 + Math.random()*40; currentY += -30 + Math.random()*60; waypoints.push({x:currentX,y:currentY}); }
        seed.style.setProperty('--sx0','0px'); seed.style.setProperty('--sy0','0px');
        waypoints.forEach((pt,i)=>{ seed.style.setProperty(`--sx${i+1}`, pt.x+'px'); seed.style.setProperty(`--sy${i+1}`, pt.y+'px'); });

        const scale = 0.7 + Math.random()*0.6; seed.style.transform = `scale(${scale})`;
        dandelionWind.appendChild(seed);
        setTimeout(()=>{ if (seed.parentNode) seed.remove(); }, duration*1000 + 1000);
      }
      (function startSeedGeneration(){ createWindSeed(); setTimeout(startSeedGeneration, 1000 + Math.random()*2000); })();
    }

    // Mist effect on section heading click
    document.querySelectorAll('.section-heading').forEach(h => {
      h.addEventListener('click', () => {
        const rect = h.getBoundingClientRect();
        const startX = rect.left + (rect.width/2);
        const startY = rect.top + (rect.height/2);
        createParticles('mist', startX, startY);
      });
    });

    // Smooth anchor scroll + close mobile
    document.querySelectorAll('header a[href^="#"]').forEach(a => {
      a.addEventListener('click', e => {
        e.preventDefault();
        const targetId = a.getAttribute('href');
        const target = document.querySelector(targetId);
        if (target){
          gsap.to(window, { scrollTo: { y: target, autoKill:false }, duration: 1.5, ease:'power2.inOut' });
          const mobileMenu = document.getElementById('mobile-menu');
          if (!mobileMenu.classList.contains('hidden')) mobileMenu.classList.add('hidden');
        }
      });
    });

    // Skill scroller duplication
    const scrollers = document.querySelectorAll(".scroller");
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches){
      scrollers.forEach(scroller => {
        const inner = scroller.querySelector(".scroller__inner");
        if (scroller.dataset.animated) return;
        scroller.dataset.animated = true;
        Array.from(inner.children).forEach(item => {
          const dup = item.cloneNode(true);
          dup.setAttribute("aria-hidden", true);
          inner.appendChild(dup);
        });
      });
    }

    // Golden Snitch cursor follow
    const snitchCursor = document.getElementById('snitch-cursor');
    const snitchSvg = document.getElementById('snitch-svg');
    const leftWing = document.getElementById('left-wing');
    const rightWing = document.getElementById('right-wing');
    if (snitchCursor){ snitchCursor.style.display='block'; snitchCursor.style.opacity='1'; }
    gsap.set(snitchCursor, { xPercent:-50, yPercent:-50 });
    gsap.set(leftWing, { transformOrigin:'100% 50%' });
    gsap.set(rightWing, { transformOrigin:'0% 50%' });

    const tl = gsap.timeline({ repeat:-1, yoyo:true });
    tl.to(leftWing, { rotation:-35, duration:0.15, ease:'sine.inOut' })
      .to(rightWing, { rotation:35, duration:0.15, ease:'sine.inOut' }, 0);
    gsap.to(snitchSvg, { y:-10, duration:1.2, repeat:-1, yoyo:true, ease:'sine.inOut' });

    const snitchPos = { x: window.innerWidth/2, y: window.innerHeight/2 };
    const mousePos = { x: snitchPos.x, y: snitchPos.y };
    const speed = 0.2;
    const xSet = gsap.quickSetter(snitchCursor, "x", "px");
    const ySet = gsap.quickSetter(snitchCursor, "y", "px");
    window.addEventListener('mousemove', e => { mousePos.x = e.clientX; mousePos.y = e.clientY; });
    gsap.ticker.add(() => {
      const dt = 1.0 - Math.pow(1.0 - speed, gsap.ticker.deltaRatio());
      snitchPos.x += (mousePos.x - snitchPos.x) * dt;
      snitchPos.y += (mousePos.y - snitchPos.y) * dt;
      xSet(snitchPos.x); ySet(snitchPos.y);
    });

    // Magnetic buttons
    const magneticElements = document.querySelectorAll('.magnetic-link');
    magneticElements.forEach(el => {
      const strength = 0.5;
      el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - r.left - r.width/2;
        const y = e.clientY - r.top - r.height/2;
        gsap.to(el, { x:x*strength, y:y*strength, duration:.4, ease:'power2.out' });
      });
      el.addEventListener('mouseleave', () => {
        gsap.to(el, { x:0, y:0, duration:.6, ease:'elastic.out(1,0.3)' });
      });
    });

    // Mobile menu
    document.getElementById('mobile-menu-button').addEventListener('click', () => {
      document.getElementById('mobile-menu').classList.toggle('hidden');
    });

    // Sparkle effect on hover elements
    const sparkleElements = document.querySelectorAll('.sparkle-hover');
    sparkleElements.forEach(el => {
      const cs = window.getComputedStyle(el);
      if (cs.position === 'static') el.style.position = 'relative';
      el.addEventListener('mousemove', e => {
        const rect = el.getBoundingClientRect(); const x = e.clientX - rect.left; const y = e.clientY - rect.top;
        const sparkle = document.createElement('span');
        sparkle.style.position = 'absolute'; sparkle.style.left = `${x}px`; sparkle.style.top = `${y}px`;
        sparkle.style.width = '2px'; sparkle.style.height = '2px'; sparkle.style.borderRadius = '50%';
        sparkle.style.pointerEvents = 'none'; sparkle.style.zIndex = '1000'; sparkle.style.transform = 'translate(-50%, -50%)';
        const colors = ['#C0C0C0', '#9932CC', '#DA70D6', '#DDA0DD'];
        sparkle.style.backgroundColor = colors[Math.floor(Math.random()*colors.length)];
        el.appendChild(sparkle);
        gsap.fromTo(sparkle, { scale:0, opacity:1 }, {
          scale: gsap.utils.random(4,8), opacity:0, duration:.6, ease:'power2.out',
          onComplete: ()=>{ if (sparkle.parentNode) sparkle.remove(); }
        });
      });
    });

    // Labubu bubble jokes
    const labubuBubble = document.getElementById('labubu-bubble');
    const labubuText = document.getElementById('labubu-text');
    let jokeInterval;
    const jokesAndWisdom = [
      "If programme works, don't touch the code no more.",
      "Two hard things in programming: naming things, and off-by-one errors.",
      "Just git push and pray.",
      "Computers are fast; programmers keep them slow.",
      "I'm not lazy, I'm on energy-saving mode.",
    ];
    function changeJoke(){
      gsap.to(labubuText, { opacity:0, duration:.5, onComplete:()=>{
        labubuText.textContent = jokesAndWisdom[Math.floor(Math.random()*jokesAndWisdom.length)];
        gsap.to(labubuText, { opacity:1, duration:.5 });
      }});
    }
    gsap.to(labubuBubble, { autoAlpha:1, scale:1, duration:.5, ease:'back.out(1.7)', delay:1 });
    labubuText.textContent = "Hi!";
    if (jokeInterval) clearInterval(jokeInterval);
    setTimeout(()=>{ jokeInterval = setInterval(changeJoke, 6000); changeJoke(); }, 3000);

    // Orbit sparks for each skill
    const skillItems = document.querySelectorAll('.skill-item');
    skillItems.forEach((item, idx) => {
      const count = Math.floor(Math.random()*3) + 2; // 2-4
      for (let i=0;i<count;i++){
        const spark = document.createElement('div');
        spark.className = 'skill-spark';
        spark.style.setProperty('--a', (Math.random()*360)+'deg');
        spark.style.setProperty('--r', (18 + Math.random()*12)+'px');
        spark.style.setProperty('--dur', (6 + Math.random()*4)+'s');
        spark.style.animationDelay = `${(idx*0.5) + (i*0.3)}s`;
        item.appendChild(spark);
      }
    });

    setTimeout(()=>ScrollTrigger.refresh(), 100);
  }
});
