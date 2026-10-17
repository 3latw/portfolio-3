(() => {
  'use strict';
  const groups = [
    ['Programming languages','code',['JavaScript','TypeScript','Dart','Python','SQL']],
    ['Frontend development','grid',['React.js','HTML5','CSS3','Responsive Web Design']],
    ['Backend development','stack',['Node.js','Express.js','RESTful APIs','JWT Authentication','ASP.NET Core 6']],
    ['Mobile development','mobile',['Flutter','Firebase']],
    ['Databases & ORM','database',['PostgreSQL','Supabase','Drizzle ORM']],
    ['Testing & API tools','check',['Postman','Unit Testing','Integration Testing']],
    ['DevOps & deployment','git',['Git','GitHub','Docker','GitHub Actions','CI/CD','Deployment & Hosting']]
  ];
  const skillGroups = document.querySelector('#skill-groups');
  groups.forEach(([title,icon,skills]) => {
    const group = document.createElement('div');
    group.className = 'skill-group';
    const heading = document.createElement('h3');
    heading.innerHTML = `<svg class="icon" aria-hidden="true"><use href="#i-${icon}"/></svg>`;
    heading.append(document.createTextNode(title));
    const tags = document.createElement('div');
    tags.className = 'skill-tags';
    skills.forEach(skill => {
      const tag = document.createElement('span');
      tag.className = 'skill-tag';
      tag.textContent = skill;
      tags.append(tag);
    });
    group.append(heading,tags);
    skillGroups.append(group);
  });

  document.querySelector('#year').textContent = new Date().getFullYear();
  const menu = document.querySelector('.menu-toggle');
  const mobileNav = document.querySelector('#mobile-nav');
  function closeMenu() {
    menu.setAttribute('aria-expanded','false');
    menu.setAttribute('aria-label','Open menu');
    mobileNav.hidden = true;
  }
  menu.addEventListener('click',() => {
    const open = menu.getAttribute('aria-expanded') === 'true';
    menu.setAttribute('aria-expanded',String(!open));
    menu.setAttribute('aria-label',open ? 'Open menu' : 'Close menu');
    mobileNav.hidden = open;
  });
  mobileNav.querySelectorAll('a').forEach(a => a.addEventListener('click',closeMenu));
  document.addEventListener('keydown',event => {if(event.key === 'Escape') closeMenu();});
  document.addEventListener('click',event => {if(!event.target.closest('.site-header')) closeMenu();});

  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  if(!reduceMotion.matches && 'IntersectionObserver' in window) {
    document.documentElement.classList.add('js-motion');
    const reveal = new IntersectionObserver(entries => entries.forEach(entry => {
      if(entry.isIntersecting) {
        entry.target.classList.add('visible');
        reveal.unobserve(entry.target);
      }
    }),{threshold:0.08});
    document.querySelectorAll('.reveal').forEach((el,index) => {
      if(el.classList.contains('project-card')) el.style.transitionDelay = `${(index%5)*55}ms`;
      reveal.observe(el);
    });
  }

  const navigation = [...document.querySelectorAll('.desktop-nav a')];
  if('IntersectionObserver' in window) {
    const sections = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if(entry.isIntersecting) {
          navigation.forEach(a => {
            const active = a.hash === `#${entry.target.id}`;
            a.classList.toggle('active',active);
            if(active) a.setAttribute('aria-current','location');
            else a.removeAttribute('aria-current');
          });
        }
      });
    },{rootMargin:'-10% 0px -65% 0px',threshold:0});
    document.querySelectorAll('#home,#about,#skills,#projects,#experience,#contact').forEach(el => sections.observe(el));
  }

  const hero = document.querySelector('.hero');
  const visual = document.querySelector('.portrait-motion');
  const video = document.querySelector('#portrait-video');
  const toggle = document.querySelector('#video-toggle');
  const caption = document.querySelector('#motion-caption');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  let manuallyPaused = reduceMotion.matches;
  let scrubbing = false;
  let seekTarget = 0;
  let animation = 0;
  let idleTimer;
  let lastSeek = 0;

  function buttonState() {
    toggle.setAttribute('aria-label',manuallyPaused ? 'Play portrait video' : 'Pause portrait video');
    toggle.innerHTML = `<span aria-hidden="true">${manuallyPaused ? '▷' : 'Ⅱ'}</span>`;
  }
  function play() {
    if(!manuallyPaused && !document.hidden) video.play().catch(() => {
      manuallyPaused = true;
      buttonState();
    });
  }
  function finishScrub() {
    scrubbing = false;
    cancelAnimationFrame(animation);
    visual.style.transform = '';
    play();
  }
  function seekFrame(now) {
    if(!scrubbing) return;
    // A single seek at a time keeps the supplied MP4 responsive on slower devices.
    if(!video.seeking && now-lastSeek > 42 && Math.abs(video.currentTime-seekTarget) > 0.045) {
      video.currentTime = seekTarget;
      lastSeek = now;
    }
    animation = requestAnimationFrame(seekFrame);
  }
  hero.addEventListener('pointermove',event => {
    if(!finePointer.matches || reduceMotion.matches || manuallyPaused || !Number.isFinite(video.duration) || video.readyState < 2) return;
    const rect = hero.getBoundingClientRect();
    const x = Math.max(0,Math.min(1,(event.clientX-rect.left)/rect.width));
    const y = Math.max(0,Math.min(1,(event.clientY-rect.top)/rect.height));
    seekTarget = Math.min(video.duration-0.07,x*(video.duration-0.07));
    visual.style.transform = `translate3d(${(x-.5)*15}px,${(y-.5)*10}px,0) rotateY(${(x-.5)*7}deg) rotateX(${(.5-y)*4}deg)`;
    if(!scrubbing) {
      scrubbing = true;
      video.pause();
      animation = requestAnimationFrame(seekFrame);
    }
    clearTimeout(idleTimer);
    idleTimer = setTimeout(finishScrub,1600);
  });
  hero.addEventListener('pointerleave',() => {clearTimeout(idleTimer);finishScrub();});
  toggle.addEventListener('click',() => {
    manuallyPaused = !manuallyPaused;
    scrubbing = false;
    cancelAnimationFrame(animation);
    clearTimeout(idleTimer);
    visual.style.transform = '';
    if(manuallyPaused) video.pause(); else play();
    buttonState();
  });
  function applyMotionPreference() {
    if(reduceMotion.matches) {
      manuallyPaused = true;
      finishScrub();
      video.pause();
      buttonState();
    }
    caption.textContent = finePointer.matches && !reduceMotion.matches ? "Move your cursor. I'll follow." : 'A little motion. A lot of possibility.';
  }
  reduceMotion.addEventListener('change',applyMotionPreference);
  applyMotionPreference();
  document.addEventListener('visibilitychange',() => {if(document.hidden) video.pause();else if(!scrubbing) play();});
  video.addEventListener('error',() => {caption.textContent = 'Alaa Tawalbeh · Software Developer';toggle.hidden = true;});
  video.addEventListener('loadeddata',() => {if(manuallyPaused)video.pause();else play();},{once:true});
  buttonState();
})();
