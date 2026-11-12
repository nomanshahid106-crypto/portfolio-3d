// UI behaviour: typing roles, reveal, counters, bars, tilt, filters, menu, form, progress
(function(){
  // Typing roles
  var roles=["SQA Engineer","E-commerce Expert — eBay · Shopify · Walmart","Product Builder — Apps & SaaS","Meta & TikTok Ads Specialist","Bug Hunter 🐞"];
  var el=document.getElementById('typed'),ri=0,ci=0,del=false;
  function tick(){
    var word=roles[ri];
    el.textContent=word.slice(0,ci);
    if(!del){ ci++; if(ci>word.length){del=true; return setTimeout(tick,1600);} }
    else{ ci--; if(ci===0){del=false; ri=(ri+1)%roles.length;} }
    setTimeout(tick, del?32:68);
  }
  if(el) tick();

  // Reveal on scroll + skill bars + counters
  var io=new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(!e.isIntersecting) return;
      e.target.classList.add('in');
      e.target.querySelectorAll('.bar i').forEach(function(b){ b.style.width=b.style.getPropertyValue('--w'); });
      e.target.querySelectorAll('[data-count]').forEach(runCounter);
      if(e.target.hasAttribute('data-count')) runCounter(e.target);
      io.unobserve(e.target);
    });
  },{threshold:.18});
  document.querySelectorAll('.reveal').forEach(function(n){ io.observe(n); });

  function runCounter(node){
    if(node.dataset.done) return; node.dataset.done=1;
    var target=+node.dataset.count, prefix=node.dataset.prefix||'', t0=null;
    function step(ts){ if(!t0)t0=ts; var p=Math.min((ts-t0)/1400,1); var eased=1-Math.pow(1-p,3);
      node.textContent=prefix+Math.floor(target*eased).toLocaleString();
      if(p<1) requestAnimationFrame(step); else node.textContent=prefix+target.toLocaleString()+(target>=100?'+':''); }
    requestAnimationFrame(step);
  }
  // hero counters are inside .stats.reveal — observe handled above; also trigger directly
  document.querySelectorAll('.stat strong').forEach(function(n){ io.observe(n.parentElement); });

  // 3D tilt on cards (desktop, pointer fine)
  if(window.matchMedia('(pointer:fine)').matches){
    document.querySelectorAll('.card-3d').forEach(function(card){
      card.addEventListener('pointermove',function(ev){
        var r=card.getBoundingClientRect(), x=(ev.clientX-r.left)/r.width-.5, y=(ev.clientY-r.top)/r.height-.5;
        card.style.transform='perspective(900px) rotateY('+(x*10)+'deg) rotateX('+(-y*10)+'deg) translateZ(0)';
      });
      card.addEventListener('pointerleave',function(){ card.style.transform=''; });
    });
  }

  // Project filter
  var chips=document.querySelectorAll('.chip');
  chips.forEach(function(chip){ chip.addEventListener('click',function(){
    chips.forEach(function(c){c.classList.remove('active');}); chip.classList.add('active');
    var f=chip.dataset.filter;
    document.querySelectorAll('.project').forEach(function(p){
      p.classList.toggle('hide', !(f==='all'||p.dataset.cat.split(' ').indexOf(f)>-1));
    });
  });});

  // Mobile menu
  var btn=document.getElementById('menu-btn'), menu=document.getElementById('mobile-menu');
  if(btn){ btn.addEventListener('click',function(){ var open=menu.hidden; menu.hidden=!open; btn.setAttribute('aria-expanded',String(open)); });
    menu.querySelectorAll('a').forEach(function(a){ a.addEventListener('click',function(){ menu.hidden=true; }); }); }

  // Scroll progress
  var bar=document.getElementById('progress-bar');
  addEventListener('scroll',function(){ var h=document.documentElement; var p=h.scrollTop/(h.scrollHeight-h.clientHeight||1); bar.style.width=(p*100)+'%'; },{passive:true});

  // Contact form (demo — no backend)
  var form=document.getElementById('contact-form');
  if(form) form.addEventListener('submit',function(ev){ ev.preventDefault();
    var name=form.querySelector('[name=name]').value.trim();
    document.getElementById('form-msg').textContent='Thanks'+(name?', '+name:'')+'! This demo form does not send yet — please reach me via GitHub, Fiverr or LinkedIn above.';
    form.reset();
  });
})();
