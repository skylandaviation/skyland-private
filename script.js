// SKYLAND PRIVATE — stable front-end interactions
(function(){
  const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const year=$('#year'); if(year) year.textContent=new Date().getFullYear();

  // Language menu
  const langBtn=$('#langBtn'), langMenu=$('#langMenu');
  if(langBtn&&langMenu){
    langBtn.addEventListener('click',e=>{e.stopPropagation();langMenu.classList.toggle('open')});
    $$('.language-menu button').forEach(btn=>btn.addEventListener('click',()=>{
      langBtn.textContent=btn.dataset.lang.toUpperCase()+' ▾'; langMenu.classList.remove('open');
      document.documentElement.lang=btn.dataset.lang; localStorage.setItem('skyland-language',btn.dataset.lang);
    }));
    document.addEventListener('click',()=>langMenu.classList.remove('open'));
    const saved=localStorage.getItem('skyland-language')||'en'; langBtn.textContent=saved.toUpperCase()+' ▾';
  }

  // Responsive navigation
  const hamburger=$('#hamb'), nav=$('.main-nav');
  if(hamburger&&nav){
    hamburger.addEventListener('click',()=>{const open=nav.classList.toggle('mobile-open');hamburger.setAttribute('aria-expanded',open?'true':'false');hamburger.textContent=open?'×':'☰'});
    $$('a',nav).forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('mobile-open');hamburger.setAttribute('aria-expanded','false');hamburger.textContent='☰'}));
  }
  $$('.nav-drop > a').forEach(link=>link.addEventListener('click',e=>{
    if(window.matchMedia('(max-width:950px)').matches){const parent=link.parentElement;if(parent.querySelector('.mega')){e.preventDefault();parent.classList.toggle('open')}}
  }));

  // Airport data — reliable fallback + worldwide database when available
  const fallback=[
    ['Istanbul Airport','IST','Istanbul','Türkiye'],['Sabiha Gökçen','SAW','Istanbul','Türkiye'],['Antalya Airport','AYT','Antalya','Türkiye'],['Bodrum Milas','BJV','Bodrum','Türkiye'],['Dalaman','DLM','Dalaman','Türkiye'],
    ['Dubai International','DXB','Dubai','United Arab Emirates'],['Abu Dhabi International','AUH','Abu Dhabi','United Arab Emirates'],['Doha Hamad','DOH','Doha','Qatar'],['Riyadh','RUH','Riyadh','Saudi Arabia'],['Jeddah','JED','Jeddah','Saudi Arabia'],
    ['London Heathrow','LHR','London','United Kingdom'],['London City','LCY','London','United Kingdom'],['Paris Charles de Gaulle','CDG','Paris','France'],['Paris Le Bourget','LBG','Paris','France'],['Nice Côte d’Azur','NCE','Nice','France'],
    ['New York JFK','JFK','New York','United States'],['Teterboro','TEB','New York','United States'],['Los Angeles','LAX','Los Angeles','United States'],['Van Nuys','VNY','Los Angeles','United States'],['Miami','MIA','Miami','United States'],
    ['Singapore Changi','SIN','Singapore','Singapore'],['Tokyo Haneda','HND','Tokyo','Japan'],['Seoul Incheon','ICN','Seoul','South Korea'],['Hong Kong','HKG','Hong Kong','Hong Kong'],['Zurich','ZRH','Zurich','Switzerland'],['Geneva','GVA','Geneva','Switzerland'],['Madrid','MAD','Madrid','Spain'],['Barcelona','BCN','Barcelona','Spain'],['Rome Fiumicino','FCO','Rome','Italy'],['Milan Linate','LIN','Milan','Italy']
  ];
  let airports=fallback.map(([name,iata,city,country])=>({name,iata,city,country,value:`${city}, ${country} (${iata})`,search:`${name} ${iata} ${city} ${country}`.toLowerCase()}));
  function enhanceAirport(input){
    if(!input||input.dataset.skyAirport)return; input.dataset.skyAirport='1';
    const wrap=document.createElement('span'); wrap.className='airport-autocomplete'; input.parentNode.insertBefore(wrap,input); wrap.appendChild(input);
    const menu=document.createElement('div'); menu.className='airport-menu'; wrap.appendChild(menu);
    function render(){
      const q=input.value.trim().toLowerCase();
      const matches=(q?airports.filter(a=>a.search.includes(q)):airports).slice(0,20);
      menu.innerHTML='';
      if(!matches.length){menu.innerHTML='<div class="airport-option"><span>No airport found</span><small>Try city, airport name or IATA code</small></div>';menu.classList.add('open');return}
      matches.forEach(a=>{const b=document.createElement('button');b.type='button';b.className='airport-option';b.innerHTML=`${a.value}<small>${a.name}</small>`;b.addEventListener('mousedown',e=>e.preventDefault());b.addEventListener('click',()=>{input.value=a.value;menu.classList.remove('open');input.dispatchEvent(new Event('change',{bubbles:true}))});menu.appendChild(b)});
      menu.classList.add('open');
    }
    input.addEventListener('focus',render); input.addEventListener('input',render);
    input.addEventListener('keydown',e=>{if(e.key==='Escape')menu.classList.remove('open')});
    document.addEventListener('click',e=>{if(!wrap.contains(e.target))menu.classList.remove('open')});
  }
  function scanAirports(){ $$('input[placeholder*="Istanbul" i],input[placeholder*="Dubai" i],input[placeholder*="London" i],input[name="departure"],input[name="destination"],input.leg-from,input.leg-to').forEach(enhanceAirport); }
  scanAirports();

  // Local/offline-safe airport database: keep fallback list available without external fetches.
  function parseCSV(line){const a=[];let x='',q=false;for(let i=0;i<line.length;i++){const c=line[i];if(c==='"'){if(q&&line[i+1]==='"'){x+='"';i++}else q=!q}else if(c===','&&!q){a.push(x);x=''}else x+=c}a.push(x);return a}

  // Native date pickers + direct departure/return dates
  $$('input[type="date"]').forEach(el=>{el.style.cursor='pointer';el.addEventListener('click',()=>{try{el.showPicker&&el.showPicker()}catch(e){}})});

  const tripType=$('#tripType'), departureDate=$('#departureDate'), returnDate=$('#returnDate'), returnField=$('.return-date-field');
  function syncPlannerDates(){
    if(departureDate && $('#travelDate')) $('#travelDate').value=departureDate.value||'';
    if(returnDate && departureDate && returnDate.value && departureDate.value && returnDate.value<departureDate.value) returnDate.value='';
  }
  departureDate?.addEventListener('change',syncPlannerDates);
  returnDate?.addEventListener('change',syncPlannerDates);
  $$('.trip-option').forEach(btn=>btn.addEventListener('click',()=>{
    $$('.trip-option').forEach(b=>b.classList.remove('active'));btn.classList.add('active');
    const value=btn.dataset.trip||'Round Trip'; if(tripType)tripType.value=value;
    if(returnField) returnField.style.display=value==='Round Trip'?'grid':'none';
    if(returnDate) returnDate.required=value==='Round Trip';
  }));
  if(returnField && tripType){ const rt=(tripType.value||'Round Trip')==='Round Trip'; returnField.style.display=rt?'grid':'none'; if(returnDate)returnDate.required=rt; }

  // Homepage lead form: customer can submit directly from hero
  const quickBtn=$('#quickPlanBtn');
  if(quickBtn){
    quickBtn.addEventListener('click',async()=>{
      const from=$('#quickFrom')?.value.trim()||'',to=$('#quickTo')?.value.trim()||'',departure=$('#quickDate')?.value||'',ret=$('#quickReturnDate')?.value||'',name=$('#quickName')?.value.trim()||'',phone=$('#quickPhone')?.value.trim()||'',pax=$('#quickPax')?.value||'1 Passenger';
      const active=$('.quick-trip.active'); const trip=active?.dataset.quickTrip==='oneway'?'One Way':active?.dataset.quickTrip==='multi'?'Multi-city':'Round Trip';
      if(!from||!to||!departure||!name||!phone||(trip==='Round Trip'&&!ret)){quickBtn.innerHTML='Please complete all fields';setTimeout(()=>quickBtn.innerHTML='Continue to request <b>→</b>',2200);return}
      quickBtn.disabled=true;quickBtn.innerHTML='Sending request…';
      const data=new FormData(); [['name',name],['whatsapp',phone],['from',from],['to',to],['departure',departure],['return_date',trip==='Round Trip'?ret:''],['passengers',pax],['trip_type',trip],['_subject','Skyland Private — Homepage Flight Request'],['_template','table'],['_captcha','false'],['_honey','']].forEach(([k,v])=>data.append(k,v));
      try{const r=await fetch('https://formsubmit.co/ajax/skylandaviationinfo@gmail.com',{method:'POST',headers:{Accept:'application/json'},body:data});const j=await r.json().catch(()=>({}));if(!r.ok||j.success===false)throw new Error('send');
        window.location.href='thank-you.html';
      }catch(e){quickBtn.disabled=false;quickBtn.innerHTML='Try again <b>↗</b>'}
    });
  }

  // Homepage trip mode
  const returnWrap=$('.quick-return-wrap');
  $$('.quick-trip').forEach(btn=>btn.addEventListener('click',()=>{$$('.quick-trip').forEach(b=>b.classList.remove('active'));btn.classList.add('active');const mode=btn.dataset.quickTrip;returnWrap?.classList.toggle('hidden-field',mode!=='roundtrip')}));

  // Account modal (if enabled by deployment)
  const modal=$('#accountModal'), close=$('#accountClose');
  const showAccount=v=>{if(!modal)return;modal.classList.add('open');modal.setAttribute('aria-hidden','false');$$('.account-tab').forEach(t=>t.classList.toggle('active',t.dataset.accountView===v));const r=$('#registerForm'),l=$('#loginForm');if(r)r.hidden=v!=='register';if(l)l.hidden=v!=='login'};
  $('#openRegister')?.addEventListener('click',()=>showAccount('register')); $('#openLoginMobile')?.addEventListener('click',()=>showAccount('login')); close?.addEventListener('click',()=>{modal.classList.remove('open');modal.setAttribute('aria-hidden','true')}); modal?.addEventListener('click',e=>{if(e.target===modal)close?.click()}); $$('.account-tab').forEach(t=>t.addEventListener('click',()=>showAccount(t.dataset.accountView)));
})();

// V23: restore top on normal page reload and make the custom language selector translate the whole page.
(function(){
  try{history.scrollRestoration='manual';}catch(e){}
  if(!location.hash){
    window.scrollTo(0,0);
    window.addEventListener('pageshow',()=>setTimeout(()=>window.scrollTo(0,0),30),{once:true});
  }
  const langButtons=document.querySelectorAll('.language-menu button[data-lang]');
  function setGoogleLanguage(lang){
    const target=lang==='tr'?'':lang;
    document.cookie='googtrans=/tr/'+target+';path=/';
    document.cookie='googtrans=/tr/'+target+';path=/;domain='+location.hostname;
    localStorage.setItem('skyland-language',lang);
    if(lang==='tr'){
      document.cookie='googtrans=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
      document.cookie='googtrans=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain='+location.hostname;
    }
    location.reload();
  }
  langButtons.forEach(btn=>btn.addEventListener('click',()=>setGoogleLanguage(btn.dataset.lang)));
  const saved=localStorage.getItem('skyland-language')||'en';
  if(saved==='en') document.documentElement.lang='en';
  if(location.hash) return;
})();
