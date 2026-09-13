(() => {
  const STORE_KEY = 'xiaoping-niuniu-v3';
  const PREVIOUS_KEY = 'xiaoping-niuniu-v2';
  const LEGACY_KEY = 'xiaoping-niuniu-v1';
  const $ = (id) => document.getElementById(id);
  const screens = [...document.querySelectorAll('.screen')];
  const overlays = [...document.querySelectorAll('.overlay')];
  let toastTimer;
  let tripTimer;
  let gardenTimer;
  let pendingBag = [];
  let wardrobeCategory = 'top';

  const FOODS = {
    grass: { name: '青草饲料卷', icon: '🌿', minutes: 30, mood: 0, health: 2, luck: 0, note: '健康+2 · 约30分钟航程能量' },
    strawberry: { name: '草莓小盒', icon: '🍓', minutes: 45, mood: 2, health: 1, luck: 1, note: '心情+2 · 偶遇朋友概率小幅增加' },
    passionfruit: { name: '百香果小面包', icon: '🥭', minutes: 60, mood: 2, health: 1, luck: 2, note: '幸运+2 · 容易遇见旅途小场景' },
    grape: { name: '茉莉香葡萄果篮', icon: '🍇', minutes: 120, mood: 3, health: 1, luck: 1, note: '心情+3 · 能支撑约2小时航程' },
    chocolate: { name: '巧克力旅行曲奇', icon: '🍫', minutes: 180, mood: 5, health: 0, luck: 3, note: '心情+5 · 稀有明信片概率增加' },
    grass_roll: { name: '麦香青草团', icon: '🥯', minutes: 60, mood: 1, health: 3, luck: 0, note: '健康+3 · 厨房耐饿便当' },
    berry_bun: { name: '草莓云朵饼', icon: '🧁', minutes: 90, mood: 4, health: 1, luck: 2, note: '心情+4 · 更容易遇到旅伴' },
    fragrant_jelly: { name: '百香茉莉冻', icon: '🍮', minutes: 180, mood: 3, health: 2, luck: 3, note: '幸运+3 · 容易发现隐藏风景' },
    choco_cookie: { name: '葡萄巧克力酥', icon: '🍪', minutes: 360, mood: 5, health: 1, luck: 4, note: '幸运+4 · 约6小时远行能量' },
    world_bento: { name: '远方旅行饭盒', icon: '🍱', minutes: 1440, mood: 5, health: 5, luck: 6, note: '幸运+6 · 可支撑一整天远行' }
  };
  const CROPS = {
    grass: { name: '青草饲料', icon: '🌱', minutes: 2 },
    strawberry: { name: '草莓', icon: '🍓', minutes: 5 },
    passionfruit: { name: '百香果', icon: '🌼', minutes: 8 },
    grape: { name: '茉莉香葡萄', icon: '🍇', minutes: 12 }
  };
  const RECIPES = {
    grass_roll: { name: '麦香青草团', icon: '🥯', needs: { grass: 2 }, result: 'grass_roll', tip: '健康 +3 · 航程能量1小时' },
    berry_bun: { name: '草莓云朵饼', icon: '🧁', needs: { strawberry: 2 }, result: 'berry_bun', tip: '心情 +4 · 航程能量1.5小时' },
    fragrant_jelly: { name: '百香茉莉冻', icon: '🍮', needs: { passionfruit: 1, grape: 1 }, result: 'fragrant_jelly', tip: '健康心情增加 · 航程能量3小时' },
    choco_cookie: { name: '葡萄巧克力酥', icon: '🍪', needs: { grape: 1, chocolate: 1 }, result: 'choco_cookie', tip: '心情 +5 · 航程能量6小时' },
    world_bento: { name: '远方旅行饭盒', icon: '🍱', needs: { grass: 2, passionfruit: 1, grape: 1, chocolate: 1 }, result: 'world_bento', tip: '健康心情 +5 · 旅行24小时' }
  };
  const BENTO_SHOP = { grass:4, passionfruit:8, grape:15, chocolate:24 };
  const SCENES = {
    dali:{name:'大理洱海',detail:'在苍山下看洱海泛起银光',atlas:'0% 0%'},
    lijiang:{name:'丽江古城',detail:'沿着石板路听小河慢慢流',atlas:'50% 0%'},
    shangri:{name:'香格里拉松赞林寺',detail:'在高原风里遇见金色屋顶',atlas:'100% 0%'},
    lhasa:{name:'拉萨布达拉宫',detail:'在高原阳光里仰望白墙红宫',atlas:'0% 50%'},
    xian:{name:'西安秦始皇兵马俑',detail:'看整齐安静的陶俑军阵',atlas:'50% 50%'},
    beihai:{name:'广西北海银滩',detail:'踩着细沙听海浪',atlas:'100% 50%'},
    sanya:{name:'三亚椰梦长廊',detail:'在椰树影子下看大海',atlas:'0% 100%'},
    kyoto:{name:'京都伏见稻荷',detail:'穿过一排排红色鸟居',atlas:'50% 100%'},
    paris:{name:'巴黎埃菲尔铁塔',detail:'在花园里看铁塔亮起灯',atlas:'100% 100%'}
  };
  const DESTINATIONS = [
    { id:'beihai', minutes:90, route:['beihai'] },
    { id:'xian', minutes:120, route:['xian'] },
    { id:'sanya', minutes:120, route:['sanya'] },
    { id:'lhasa', minutes:150, route:['dali','lijiang','shangri','lhasa'] },
    { id:'kyoto', minutes:480, route:['beihai','sanya','kyoto'] },
    { id:'paris', minutes:1020, route:['xian','shangri','kyoto','paris'] }
  ].map((place)=>({...place,...SCENES[place.id]}));
  const SUPPLIES = {
    charm: {
      ribbon: { name: '远方护身结', icon: '🎀', cost: 8, note: '让路线更容易出现意外惊喜' },
      luckybell: { name: '幸运铃', icon: '🔔', cost: 3000, note: '永久护身符，提高稀有纪念品概率' }
    },
    tool: {
      camera: { name: '木壳相机', icon: '📷', cost: 10, note: '旅途中更容易多寄一张照片' },
      tent: { name: '蓝顶小帐篷', icon: '⛺', cost: 18, note: '容易拍到野外露营场景' },
      bowl: { name: '木纹旅行碗', icon: '🥣', cost: 18, note: '容易靠近湖边、河边与海边' },
      lantern: { name: '暖光小提灯', icon: '🏮', cost: 20, note: '容易拍到夜景与星光' }
    }
  };
  const TOUCHES = {
    head: { delta: 2, word: '♥', effect: 'touch-head', text: '小萍摸摸牛牛的头，牛牛认真地低下来配合。' },
    ear: { delta: 1, word: '♪', effect: 'touch-ear', text: '耳朵轻轻抖了两下，牛牛假装没有害羞。' },
    nose: { delta: 1, word: '噗', effect: 'touch-nose', text: '牛鼻子被碰得痒痒的，牛牛打了个小喷嚏。' },
    body: { delta: 2, word: '♡', effect: 'touch-body', text: '牛牛舒服地靠近小萍，呼吸都慢了下来。' },
    tail: { delta: 1, word: '〰', effect: 'touch-tail', text: '尾巴摇得飞快，牛牛藏不住开心啦。' },
    feet: { delta: 1, word: '哒', effect: 'touch-feet', text: '牛牛轻轻跺了跺小蹄子，想拉小萍出去玩。' }
  };
  const OUTFITS = {
    top: [
      ['none','不穿上衣','○',''], ['gray_stripe','灰色条纹衬衫','▥','assets/wardrobe/top-gray-stripe.webp'], ['blue_shirt','蓝衬衫','▦','assets/wardrobe/top-blue-shirt.webp'],
      ['polo','Polo衫','◆','assets/wardrobe/top-polo.webp'], ['white_shirt','白衬衣','◇','assets/wardrobe/top-white-shirt.webp'], ['white_t','白色短T','□','assets/wardrobe/top-white-t.webp'], ['black_t','黑色短T','■','assets/wardrobe/top-black-t.webp']
    ],
    bottom: [['none','不穿裤子','○',''],['jeans','牛仔裤','▤','assets/wardrobe/bottom-jeans.webp'],['sweatpants','运动裤','▰','assets/wardrobe/bottom-sweatpants.webp']],
    glasses: [['none','不戴眼镜','○',''],['white','白框眼镜','▢','assets/wardrobe/glasses-white.webp'],['black','黑框眼镜','▣','assets/wardrobe/glasses-black.webp']],
    hat: [['none','不戴帽子','○',''],['pigeon_front','鸽子帽正戴','🧢','assets/wardrobe/hat-pigeon-front.webp'],['pigeon_back','鸽子帽反戴','↶','assets/wardrobe/hat-pigeon-back.webp']]
  };
  const defaultState = {
    hearts: 12, mood: 76, health: 84, entered: false, soundMuted: false,
    bag: [], selectedCharm: '', selectedTool: '', traveling: false, travelStarted: 0, travelEnd: 0, tripDurationMin: 0, tripEnergyMin: 0, tripLuck: 0, destination: '', lastDestination: 'beihai', tripItems: [], tripStops: [], tripStopIndex: 0,
    postcards: 0, lastLetter: '', letters: [], souvenirs: [], visitor: null,
    inventory: { grass: 3, strawberry: 2, passionfruit: 2, grape: 2, chocolate: 2, grass_roll: 0, berry_bun: 0, fragrant_jelly: 0, choco_cookie: 0, world_bento: 0 },
    plots: [null,null,null,null], clovers: 12, cloverLastHarvest: Date.now() - 4 * 60000, fourLeaf: 0,
    ownedCharms: ['ribbon'], ownedTools: ['camera'],
    outfit: { top: 'none', bottom: 'none', glasses: 'none', hat: 'none' }
  };

  function loadState() {
    let saved = null;
    try { saved = JSON.parse(localStorage.getItem(STORE_KEY) || 'null'); } catch {}
    if (!saved) {
      try {
        const previous = JSON.parse(localStorage.getItem(PREVIOUS_KEY) || 'null');
        if (previous) saved = { ...previous, outfit: { ...defaultState.outfit } };
      } catch {}
    }
    if (!saved) {
      try {
        const old = JSON.parse(localStorage.getItem(LEGACY_KEY) || 'null');
        if (old) saved = { hearts: old.hearts, entered: old.entered, postcards: old.postcards };
      } catch {}
    }
    return {
      ...defaultState, ...(saved || {}),
      inventory: { ...defaultState.inventory, ...(saved?.inventory || {}) },
      outfit: { ...defaultState.outfit, ...(saved?.outfit || {}) },
      plots: Array.isArray(saved?.plots) && saved.plots.length === 4 ? saved.plots : [...defaultState.plots],
      ownedCharms: Array.isArray(saved?.ownedCharms) ? saved.ownedCharms : [...defaultState.ownedCharms],
      ownedTools: Array.isArray(saved?.ownedTools) ? saved.ownedTools : [...defaultState.ownedTools],
      bag: Array.isArray(saved?.bag) ? saved.bag : [],
      tripStops: Array.isArray(saved?.tripStops) ? saved.tripStops : [],
      letters: Array.isArray(saved?.letters) ? saved.letters : []
    };
  }
  let state = loadState();
  function save() { localStorage.setItem(STORE_KEY, JSON.stringify(state)); }
  function toast(message) { const el = $('toast'); el.textContent = message; el.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('show'), 2200); }
  function say(message) { $('speech').textContent = message; }
  function showScreen(id) {
    screens.forEach((screen) => screen.hidden = screen.id !== id);
    closeOverlays();
    clearInterval(tripTimer); clearInterval(gardenTimer);
    if (id === 'trip') updateTrip();
    if (id === 'garden') { renderGarden(); gardenTimer = setInterval(renderGarden, 1000); }
    if (id === 'kitchen') renderKitchen();
    if (id === 'wardrobe') renderWardrobe();
  }
  function closeOverlays() { overlays.forEach((el) => el.hidden = true); }
  function openOverlay(id) { closeOverlays(); $(id).hidden = false; }
  function clampStats() { state.mood = Math.min(100, Math.max(0, state.mood)); state.health = Math.min(100, Math.max(0, state.health)); }
  function formatMinutes(minutes) { if (minutes < 60) return `${minutes}分钟`; const hours = Math.floor(minutes / 60); const rest = minutes % 60; return rest ? `${hours}小时${rest}分钟` : `${hours}小时`; }
  function formatRemaining(ms) { const secs = Math.max(0, Math.ceil(ms / 1000)); if (secs < 60) return `${secs}秒`; const mins = Math.ceil(secs / 60); if (mins < 60) return `${mins}分钟`; return `${Math.floor(mins/60)}小时${mins%60 ? `${mins%60}分钟` : ''}`; }

  const music = { ctx: null, master: null, timer: null, next: 0, step: 0 };
  const chords = [[261.63,329.63,392],[220,329.63,392],[196,293.66,392],[220,261.63,349.23]];
  function tone(freq, when, duration, volume) {
    if (!music.ctx || !music.master) return;
    const osc = music.ctx.createOscillator(), gain = music.ctx.createGain();
    osc.type = 'sine'; osc.frequency.setValueAtTime(freq, when);
    gain.gain.setValueAtTime(0.0001, when); gain.gain.exponentialRampToValueAtTime(volume, when + .35); gain.gain.exponentialRampToValueAtTime(0.0001, when + duration);
    osc.connect(gain).connect(music.master); osc.start(when); osc.stop(when + duration + .05);
  }
  function scheduleMusic() {
    if (!music.ctx) return;
    while (music.next < music.ctx.currentTime + 2.2) {
      const chord = chords[Math.floor(music.step / 3) % chords.length];
      const note = chord[music.step % 3]; tone(note, music.next, 2.8, .12);
      if (music.step % 8 === 6) tone(note * 2, music.next + .22, 1.8, .045);
      music.next += 1.25; music.step += 1;
    }
  }
  async function startMusic() {
    if (state.soundMuted || music.ctx) return;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    music.ctx = new AudioCtx(); music.master = music.ctx.createGain(); music.master.gain.value = .055; music.master.connect(music.ctx.destination); music.next = music.ctx.currentTime + .08; music.step = 0;
    if (music.ctx.state === 'suspended') await music.ctx.resume().catch(() => {});
    scheduleMusic(); music.timer = setInterval(scheduleMusic, 700); updateSoundButtons();
  }
  function stopMusic() { clearInterval(music.timer); if (music.ctx) music.ctx.close().catch(() => {}); music.ctx = null; music.master = null; updateSoundButtons(); }
  function toggleSound() { state.soundMuted = !state.soundMuted; save(); state.soundMuted ? stopMusic() : startMusic(); updateSoundButtons(); }
  function updateSoundButtons() { document.querySelectorAll('[data-sound-toggle]').forEach((btn) => { const off = state.soundMuted; btn.firstChild.textContent = off ? '♩' : '♫'; btn.querySelector('span').textContent = off ? '静音' : '音乐'; btn.setAttribute('aria-label', off ? '打开背景音乐' : '静音背景音乐'); }); }

  function applyOutfit(scope = document) {
    ['top','bottom','glasses','hat'].forEach((category) => {
      scope.querySelectorAll(`[data-layer="${category}"]`).forEach((layer) => { const choice=state.outfit[category]||'none';layer.hidden=choice==='none';layer.dataset.choice=choice; });
    });
  }
  function updateUI() {
    clampStats(); $('heartCount').textContent = state.hearts; $('cloverCount').textContent = state.clovers;
    $('avatarStage').hidden = state.traveling; $('awayNote').hidden = !state.traveling; $('travelLabel').textContent = state.traveling ? '看旅程' : '出发';
    $('visitorBadge').hidden = !state.visitor;
    applyOutfit(); updateSoundButtons(); save();
  }
  function interact(part, target) {
    if (state.traveling) { toast('牛牛正在旅行，回来再摸摸它吧'); return; }
    const touch = TOUCHES[part]; if (!touch) return;
    startMusic(); state.hearts += touch.delta; state.mood += touch.delta; clampStats(); say(touch.text); updateUI();
    const stage = $('avatarStage'); stage.className = 'avatar-stage'; void stage.offsetWidth; stage.classList.add(touch.effect);
    const pop = document.createElement('span'); pop.className = 'reaction-pop'; pop.textContent = touch.word; pop.style.left = `${target.offsetLeft + target.offsetWidth/2}px`; pop.style.top = `${target.offsetTop + target.offsetHeight/2}px`; stage.appendChild(pop); setTimeout(() => pop.remove(), 1200);
  }
  function showTouchGuide() { if (state.traveling) return toast('牛牛还在外面冒险呢'); const stage = $('avatarStage'); stage.classList.add('show-zones'); say('小萍可以摸摸牛牛的头、耳朵、鼻子、身子、尾巴和小蹄子。'); setTimeout(() => stage.classList.remove('show-zones'), 4200); }

  function availableItems() { return Object.keys(FOODS).filter((id) => (state.inventory[id] || 0) > 0); }
  function bagDuration(items = pendingBag) { return items.reduce((sum, id) => sum + (FOODS[id]?.minutes || 0), 0); }
  function renderBag() {
    const list = $('foodList'); list.innerHTML = '';
    Object.entries(FOODS).forEach(([id,item]) => {
      const count = state.inventory[id] || 0, selected = pendingBag.includes(id);
      const btn = document.createElement('button'); btn.className = 'item-card'; btn.dataset.food = id; btn.disabled = count < 1 && !selected; btn.setAttribute('aria-pressed', String(selected));
      btn.innerHTML = `<span class="item-icon">${item.icon}</span><span><strong>${item.name} ×${count}</strong><small>${item.note}</small></span><em>${formatMinutes(item.minutes)}</em>`;
      btn.addEventListener('click', () => { if (selected) pendingBag = pendingBag.filter((x) => x !== id); else if (pendingBag.length < 5) pendingBag.push(id); else return toast('旅行包最多放五份食物'); renderBag(); });
      list.appendChild(btn);
    });
    $('bagCount').textContent = `已选 ${pendingBag.length}/5`;
    const energy = bagDuration();
    const reachable = pickDestination(energy, true);
    $('bagTime').textContent = pendingBag.length ? `航程能量 ${formatMinutes(energy)}${reachable ? ` · 最远可到${reachable.name}` : ' · 还到不了机场目的地'}` : '组合食物，为从贵阳出发积攒航程能量';
    $('packBtn').disabled = pendingBag.length < 1;
    renderSupplySelects();
  }
  function renderSupplySelects() {
    const charm = $('charmSelect'), tool = $('toolSelect');
    const fourLeafOption = state.fourLeaf > 0 ? `<option value="fourleaf">🍀 四叶草护身符（剩${state.fourLeaf}）</option>` : '';
    charm.innerHTML = '<option value="">不带护身符</option>' + fourLeafOption + state.ownedCharms.filter((id)=>SUPPLIES.charm[id]).map((id) => `<option value="${id}">${SUPPLIES.charm[id].icon} ${SUPPLIES.charm[id].name}</option>`).join('');
    tool.innerHTML = '<option value="">不带道具</option>' + state.ownedTools.map((id) => `<option value="${id}">${SUPPLIES.tool[id].icon} ${SUPPLIES.tool[id].name}</option>`).join('');
    charm.value = state.selectedCharm || ''; tool.value = state.selectedTool || '';
  }
  function openBag() { if (state.traveling) return toast('牛牛已经带着行囊出门了'); pendingBag = [...state.bag]; renderBag(); openOverlay('foodOverlay'); }
  function randomBag() { const items = availableItems().sort(() => Math.random() - .5); pendingBag = items.slice(0, Math.min(items.length, 2 + Math.floor(Math.random()*4))); renderBag(); }
  function packBag() { state.bag = [...pendingBag]; state.selectedCharm = $('charmSelect').value; state.selectedTool = $('toolSelect').value; updateUI(); closeOverlays(); say(`小萍装好了${state.bag.map((id)=>FOODS[id].name).join('、')}，一共是${formatMinutes(bagDuration(state.bag))}航程能量。去哪里由牛牛自己决定。`); toast('旅行行囊准备好啦'); }

  function sceneById(id) { return SCENES[id] || SCENES.beihai; }
  function destinationById(id) { return DESTINATIONS.find((place)=>place.id===id) || DESTINATIONS[0]; }
  function pickDestination(minutes, preview = false) {
    const reachable = DESTINATIONS.filter((place)=>place.minutes<=minutes).sort((a,b)=>b.minutes-a.minutes);
    if (!reachable.length) return null;
    if (preview) return reachable[0];
    const pool = reachable.slice(0,Math.min(3,reachable.length));
    return pool[Math.floor(Math.random()*pool.length)];
  }
  function buildTripStops(destination, startAt) {
    const base = destination.route.map((id)=>({id,...sceneById(id),effect:''}));
    const final = base[base.length-1];
    const toolStops = {
      camera:{...final,name:`${final.name}·远景`,detail:'牛牛架好木壳相机，认真拍下了一整片风光',effect:'panorama'},
      tent:{...final,name:`${final.name}·露营`,detail:'牛牛在风景旁支起蓝顶帐篷，听了一会儿晚风',effect:'camp'},
      bowl:{...final,name:`${final.name}·水边`,detail:'牛牛用木碗舀起清水，在岸边慢慢歇脚',effect:'water'},
      lantern:{...final,name:`${final.name}·夜色`,detail:'牛牛点亮小提灯，拍下星光与温柔夜景',effect:'night'}
    };
    if (toolStops[state.selectedTool]) base.splice(Math.max(1,base.length-1),0,toolStops[state.selectedTool]);
    const rareChance = Math.min(.72,.08 + state.tripLuck*.055 + (state.selectedCharm==='fourleaf' ? .25 : 0) + (state.selectedCharm==='luckybell' ? .16 : 0));
    if (Math.random()<rareChance && base.length<6) base.splice(Math.max(1,base.length-1),0,{...final,name:`${final.name}·秘密角落`,detail:'牛牛绕过安静的小路，发现了一处地图上没有的风景',effect:'rare'});
    const duration = destination.minutes*60000;
    return base.slice(0,6).map((stop,index,all)=>({...stop,at:startAt+Math.round(duration*(index+1)/all.length)}));
  }
  function setPostcardScene(id, stopLike) {
    const scene=$(id); if(!scene)return;
    const stop=typeof stopLike==='string'?{id:stopLike,...sceneById(stopLike),effect:''}:stopLike;
    scene.style.backgroundPosition=stop.atlas;
    scene.className=`destination-scene ${stop.effect||''}`;
    const label=scene.querySelector('.postcard-place');if(label)label.textContent=stop.name;
    applyOutfit(scene);
  }
  function deliverDuePostcards() {
    let delivered=0;
    while(state.tripStopIndex<state.tripStops.length && Date.now()>=state.tripStops[state.tripStopIndex].at){
      const stop=state.tripStops[state.tripStopIndex];
      const itemNames=state.tripItems.map((id)=>FOODS[id]?.name).filter(Boolean).join('、');
      const letter=`“小萍，我到${stop.name}啦。${stop.detail}。${itemNames?`你准备的${itemNames}一路都很好吃。`:''}我把这一刻先寄回家。”`;
      state.tripStopIndex+=1;state.postcards+=1;state.lastDestination=stop.id;state.lastLetter=letter;
      state.letters.unshift({id:stop.id,name:stop.name,detail:stop.detail,atlas:stop.atlas,effect:stop.effect||'',letter,receivedAt:Date.now()});state.letters=state.letters.slice(0,24);delivered+=1;
    }
    if(delivered){save();toast(`牛牛从途中寄回了 ${delivered} 张明信片`);}
  }
  function startTravel() {
    if (state.traveling) return showScreen('trip');
    if (!state.bag.length) { openBag(); return toast('旅行包里必须先放便当'); }
    const energy=bagDuration(state.bag),destination=pickDestination(energy);
    if(!destination){openBag();return toast('航程能量还不够，至少准备1小时30分钟');}
    state.bag.forEach((id)=>state.inventory[id]=Math.max(0,(state.inventory[id]||0)-1));
    state.tripItems=[...state.bag];state.bag=[];state.tripLuck=state.tripItems.reduce((n,id)=>n+(FOODS[id].luck||0),0);
    state.traveling=true;state.travelStarted=Date.now();state.travelEnd=state.travelStarted+destination.minutes*60000;state.tripDurationMin=destination.minutes;state.tripEnergyMin=energy;state.destination=destination.id;state.tripStopIndex=0;state.tripStops=buildTripStops(destination,state.travelStarted);
    if(state.selectedCharm==='fourleaf')state.fourLeaf=Math.max(0,state.fourLeaf-1);
    state.mood+=state.tripItems.reduce((n,id)=>n+FOODS[id].mood,0);state.health+=state.tripItems.reduce((n,id)=>n+FOODS[id].health,0);clampStats();updateUI();
    $('tripMessage').textContent=`牛牛从贵阳出发，最终想去${destination.name}。第一张途中来信正在路上。`;showScreen('trip');
  }
  function completeTrip(openLetter=true) {
    if(!state.traveling)return;deliverDuePostcards();
    const destination=destinationById(state.destination);state.traveling=false;state.hearts+=3;
    const souvenirChance=Math.min(.92,.32+state.tripDurationMin/1800+state.tripLuck*.035+(state.selectedCharm==='fourleaf'?.24:0)+(state.selectedCharm==='luckybell'?.18:0));
    const rewardCount=1+Math.min(2,Math.floor(state.tripDurationMin/420));
    const finds=[`${destination.name}的小纪念章`,'压在书里的小花','圆圆的湖边石','会响的小铃铛','蓝色羽毛'];
    for(let i=0;i<rewardCount;i+=1)if(Math.random()<souvenirChance)state.souvenirs.push(finds[(state.souvenirs.length+i)%finds.length]);
    if(Math.random()<Math.min(.75,.28+state.tripLuck*.04)){const visitors=[{name:'小蜜蜂',icon:'🐝',likes:'草莓'},{name:'慢慢蜗牛',icon:'🐌',likes:'青草'},{name:'白鸽子',icon:'🕊️',likes:'葡萄'}];state.visitor=visitors[Math.floor(Math.random()*visitors.length)];}
    state.travelStarted=0;state.travelEnd=0;state.tripDurationMin=0;state.tripEnergyMin=0;state.tripLuck=0;state.destination='';state.tripItems=[];state.tripStops=[];state.tripStopIndex=0;state.selectedCharm='';state.selectedTool='';updateUI();showScreen('home');say(`小萍！牛牛从${destination.name}回来啦，信箱里有一路寄来的风景。`);if(openLetter)setTimeout(()=>openLetters(true),450);
  }
  function updateTrip() {
    clearInterval(tripTimer);
    const tick=()=>{
      if(!state.traveling)return;deliverDuePostcards();
      const destination=destinationById(state.destination),next=state.tripStops[state.tripStopIndex]||state.tripStops[state.tripStops.length-1]||destination;
      const total=Math.max(1,state.travelEnd-state.travelStarted),left=Math.max(0,state.travelEnd-Date.now()),nextLeft=Math.max(0,(next.at||state.travelEnd)-Date.now());
      $('progressBar').style.width=`${Math.min(100,((total-left)/total)*100)}%`;$('countdown').textContent=left?`约 ${formatRemaining(nextLeft)}后到下一站 · 全程还剩${formatRemaining(left)}`:'最后一张明信片正在送回家……';
      $('tripMessage').textContent=`贵阳 → ${destination.name}。牛牛已寄 ${state.tripStopIndex}/${state.tripStops.length} 张，下一站是${next.name}。`;
      if($('routeProgress'))$('routeProgress').textContent=state.tripStops.map((stop,index)=>`${index<state.tripStopIndex?'✓':'○'} ${stop.name}`).join('  ·  ');
      setPostcardScene('tripScene',next);
      if(left<=0){clearInterval(tripTimer);setTimeout(()=>completeTrip(true),500);}
    };tick();tripTimer=setInterval(tick,1000);
  }
  function checkTrip(){if(state.traveling){deliverDuePostcards();if(Date.now()>=state.travelEnd)completeTrip(false);}}
  function openLetters(force=false){const latest=state.letters[0];$('letterLead').textContent=state.postcards?`牛牛已经寄回 ${state.postcards} 张明信片，带回 ${state.souvenirs.length} 件小纪念品。`:'信箱还安安静静的。等牛牛从旅行途中寄信吧。';$('letterText').textContent=latest?.letter||state.lastLetter||'“小萍，等我看到漂亮的风景，就把它寄回家。”';$('savedPostcard').hidden=!latest;$('souvenirText').textContent=state.souvenirs.length?`收藏：${state.souvenirs.join('、')}`:'还没有旅行纪念品';if(latest)setPostcardScene('savedScene',latest);if($('letterRoute'))$('letterRoute').textContent=state.letters.slice(0,6).map((x)=>x.name).join(' · ');openOverlay('letterOverlay');if(force)toast('牛牛寄来了旅途明信片');}

  function renderGarden() {
    const grid = $('gardenGrid'); grid.innerHTML = '';
    state.plots.forEach((plot,index) => {
      const btn = document.createElement('button'); btn.className = `plot ${plot ? '' : 'empty'}`; btn.dataset.plot = index;
      if (!plot) btn.innerHTML = '<span class="crop-icon">＋</span><strong>空地</strong><small>点一下种点东西</small>';
      else { const crop = CROPS[plot.crop], left = plot.readyAt-Date.now(), ready = left <= 0; btn.innerHTML = `<span class="crop-icon">${crop.icon}</span><strong>${crop.name}</strong><small>${ready ? '成熟啦，点一下收进仓库' : `还要 ${formatRemaining(left)}`}</small>`; }
      btn.addEventListener('click',()=>handlePlot(index)); grid.appendChild(btn);
    });
    const available = Math.min(12,Math.floor((Date.now()-state.cloverLastHarvest)/60000)); $('cloverPatchText').textContent = available ? `长出了 ${available} 片三叶草` : '三叶草正在慢慢长'; $('harvestCloverBtn').disabled = available < 1;
  }
  function handlePlot(index) { const plot = state.plots[index]; if (!plot) { $('plantOverlay').dataset.plot = index; renderCropChoices(); return openOverlay('plantOverlay'); } if (Date.now() < plot.readyAt) return toast(`${CROPS[plot.crop].name}还在晒太阳`); const amount = 2 + Math.floor(Math.random()*3); state.inventory[plot.crop] = (state.inventory[plot.crop]||0)+amount; state.plots[index] = null; state.hearts += 1; save(); renderGarden(); toast(`收获了 ${amount} 份${CROPS[plot.crop].name}`); }
  function renderCropChoices() { $('cropChoices').innerHTML = Object.entries(CROPS).map(([id,c])=>`<button class="crop-choice" data-crop="${id}"><span>${c.icon}</span><strong>${c.name}</strong><small>${c.minutes}分钟成熟</small></button>`).join(''); document.querySelectorAll('[data-crop]').forEach((btn)=>btn.addEventListener('click',()=>plantCrop(btn.dataset.crop))); }
  function plantCrop(crop) { const index = Number($('plantOverlay').dataset.plot); state.plots[index] = { crop, plantedAt: Date.now(), readyAt: Date.now()+CROPS[crop].minutes*60000 }; save(); closeOverlays(); renderGarden(); toast(`${CROPS[crop].name}种好啦`); }
  function harvestClovers() { const count = Math.min(12,Math.floor((Date.now()-state.cloverLastHarvest)/60000)); if (count < 1) return; state.clovers += count; state.cloverLastHarvest = Date.now(); if (Math.random() < .12) { state.fourLeaf += 1; toast(`收下 ${count} 片三叶草，还发现了四叶草！`); } else toast(`收下了 ${count} 片三叶草`); save(); renderGarden(); updateUI(); }
  function openWarehouse() { const all = Object.entries(FOODS).map(([id,item])=>`<div class="inventory-item">${item.icon} ${item.name}<b>×${state.inventory[id]||0}</b></div>`).join(''); $('inventoryGrid').innerHTML = all; $('warehouseMeta').textContent = `三叶草 ${state.clovers} · 四叶草 ${state.fourLeaf} · 纪念品 ${state.souvenirs.length}`; renderShop(); openOverlay('warehouseOverlay'); }
  function renderShop() {
    const entries = [...Object.entries(BENTO_SHOP).map(([id,cost])=>['food',id,{...FOODS[id],cost,note:`便当补给 · ${FOODS[id].note}`}]),...Object.entries(SUPPLIES.charm).map(([id,x])=>['charm',id,x]),...Object.entries(SUPPLIES.tool).map(([id,x])=>['tool',id,x])];
    $('shopList').innerHTML = '';
    entries.forEach(([type,id,item])=>{ const owned = type==='food'?false:type==='charm'?state.ownedCharms.includes(id):state.ownedTools.includes(id); const btn=document.createElement('button'); btn.className='item-card'; btn.disabled=owned||state.clovers<item.cost; btn.innerHTML=`<span class="item-icon">${item.icon}</span><span><strong>${item.name}</strong><small>${item.note}</small></span><em>${owned?'已有':`${item.cost}草`}</em>`; btn.addEventListener('click',()=>type==='food'?buyFood(id,item.cost):buySupply(type,id)); $('shopList').appendChild(btn); });
  }
  function buyFood(id,cost){if(state.clovers<cost)return;state.clovers-=cost;state.inventory[id]=(state.inventory[id]||0)+1;save();updateUI();openWarehouse();toast(`${FOODS[id].name}已经放进仓库`);}
  function buySupply(type,id) { const item=SUPPLIES[type][id]; if(state.clovers<item.cost)return; state.clovers-=item.cost; (type==='charm'?state.ownedCharms:state.ownedTools).push(id); save(); updateUI(); openWarehouse(); toast(`${item.name}已经放进仓库`); }

  function needsText(needs) { return Object.entries(needs).map(([id,n])=>`${FOODS[id].icon}${FOODS[id].name}×${n}`).join(' + '); }
  function canCook(recipe) { return Object.entries(recipe.needs).every(([id,n])=>(state.inventory[id]||0)>=n); }
  function renderKitchen() { const list=$('recipeList'); list.innerHTML=''; Object.entries(RECIPES).forEach(([id,r])=>{ const btn=document.createElement('button');btn.className='recipe';btn.disabled=!canCook(r);btn.innerHTML=`<span class="recipe-icon">${r.icon}</span><span><strong>${r.name}</strong><small>${needsText(r.needs)}</small></span><em>${r.tip}</em>`;btn.addEventListener('click',()=>cook(id));list.appendChild(btn); }); $('kitchenStats').textContent=`牛牛的健康 ${state.health} · 心情 ${state.mood}`; }
  function cook(id) { const recipe=RECIPES[id]; if(!canCook(recipe))return; Object.entries(recipe.needs).forEach(([key,n])=>state.inventory[key]-=n); state.inventory[recipe.result]=(state.inventory[recipe.result]||0)+1; state.health+=FOODS[recipe.result].health;state.mood+=FOODS[recipe.result].mood;clampStats();save();renderKitchen();toast(`${recipe.name}做好啦，放进仓库了`); }

  function renderWardrobe() { document.querySelectorAll('.wardrobe-tab').forEach((btn)=>btn.setAttribute('aria-selected',String(btn.dataset.category===wardrobeCategory))); const box=$('wardrobeOptions');box.innerHTML='';OUTFITS[wardrobeCategory].forEach(([id,name,icon])=>{const btn=document.createElement('button');btn.className='wardrobe-option';btn.setAttribute('aria-pressed',String(state.outfit[wardrobeCategory]===id));btn.innerHTML=`<span>${icon}</span>${name}`;btn.addEventListener('click',()=>{state.outfit[wardrobeCategory]=id;save();applyOutfit();renderWardrobe();toast(`牛牛换上了${name}`);});box.appendChild(btn);}); applyOutfit(); }

  function openMap() { openOverlay('mapOverlay'); }
  function openVisitor() { if (!state.visitor) return; $('visitorIcon').textContent=state.visitor.icon; $('visitorTitle').textContent=`${state.visitor.name}来拜访啦`; $('visitorText').textContent=`它闻到了${state.visitor.likes}的香气，正在门口等小萍招待。`; openOverlay('visitorOverlay'); }
  function feedVisitor() { if(!state.visitor)return; const candidates=availableItems(); if(!candidates.length)return toast('仓库里暂时没有可以招待的食物'); const id=candidates[0];state.inventory[id]-=1;const name=state.visitor.name;state.clovers+=3;state.visitor=null;save();updateUI();closeOverlays();say(`${name}吃得很满足，给小萍留下了三片三叶草。`);toast('客人送来了回礼'); }

  function registerWebTools() {
    const context=document.modelContext;if(!context?.registerTool)return;const register=(tool)=>{try{Promise.resolve(context.registerTool(tool)).catch(()=>{});}catch{}};
    register({name:'read_niuniu_status',title:'查看牛牛状态',description:'查看牛牛、旅行、菜园、仓库和换装状态。',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true,untrustedContentHint:false},execute(){return{atHome:!state.traveling,hearts:state.hearts,mood:state.mood,health:state.health,bag:state.bag,tripEndsAt:state.traveling?state.travelEnd:null,inventory:state.inventory,clovers:state.clovers,outfit:state.outfit};}});
    register({name:'touch_niuniu',title:'摸摸牛牛',description:'摸牛牛的一个指定部位。',inputSchema:{type:'object',properties:{part:{type:'string',enum:Object.keys(TOUCHES)}},required:['part'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute(input){if(!TOUCHES[input?.part])throw new Error('无效部位');if(state.traveling)throw new Error('牛牛正在旅行');interact(input.part,document.querySelector(`[data-part="${input.part}"]`));return{hearts:state.hearts,message:$('speech').textContent};}});
    register({name:'prepare_trip_food',title:'准备旅行便当',description:'把1至5份有库存的食物放入牛牛的旅行包；背包必须有便当。',inputSchema:{type:'object',properties:{items:{type:'array',items:{type:'string',enum:Object.keys(FOODS)},minItems:1,maxItems:5,uniqueItems:true}},required:['items'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute(input){if(state.traveling)throw new Error('牛牛已经在旅行');if(!Array.isArray(input?.items)||input.items.length<1||input.items.length>5)throw new Error('请选择1至5份食物');if(input.items.some(id=>!FOODS[id]||(state.inventory[id]||0)<1))throw new Error('食物库存不足');state.bag=[...input.items];save();return{bag:state.bag,energyMinutes:bagDuration(state.bag),farthest:pickDestination(bagDuration(state.bag),true)?.name||null};}});
    register({name:'start_niuniu_trip',title:'让牛牛出发',description:'从贵阳开始一次按常见航程真实计时、沿途寄明信片的旅行。',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute(){if(state.traveling)throw new Error('牛牛已经在旅行');if(!state.bag.length)throw new Error('请先准备便当');const destination=pickDestination(bagDuration(state.bag),true);if(!destination)throw new Error('便当航程能量不足');startTravel();return{traveling:state.traveling,durationMinutes:state.tripDurationMin,destination:destination.name,stops:state.tripStops.map((x)=>x.name)};}});
    register({name:'plant_garden_crop',title:'在菜园播种',description:'在指定空地种植一种作物。',inputSchema:{type:'object',properties:{plot:{type:'integer',minimum:1,maximum:4},crop:{type:'string',enum:Object.keys(CROPS)}},required:['plot','crop'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute(input){const i=input.plot-1;if(state.plots[i])throw new Error('这块地已经种了东西');state.plots[i]={crop:input.crop,plantedAt:Date.now(),readyAt:Date.now()+CROPS[input.crop].minutes*60000};save();return{plot:input.plot,crop:input.crop,readyAt:state.plots[i].readyAt};}});
  }

  document.querySelectorAll('[data-sound-toggle]').forEach((btn)=>btn.addEventListener('click',toggleSound));
  $('enterBtn').addEventListener('click',()=>{state.entered=true;save();startMusic();showScreen('home');updateUI();});
  $('touchGuideBtn').addEventListener('click',showTouchGuide);document.querySelectorAll('[data-part]').forEach((btn)=>btn.addEventListener('click',()=>interact(btn.dataset.part,btn)));
  $('bagBtn').addEventListener('click',openBag);$('travelBtn').addEventListener('click',startTravel);$('letterBtn').addEventListener('click',()=>openLetters(false));$('mapBtn').addEventListener('click',openMap);$('visitorBadge').addEventListener('click',openVisitor);
  $('randomBagBtn').addEventListener('click',randomBag);$('packBtn').addEventListener('click',packBag);$('charmSelect').addEventListener('change',(e)=>state.selectedCharm=e.target.value);$('toolSelect').addEventListener('change',(e)=>state.selectedTool=e.target.value);
  $('tripBackBtn').addEventListener('click',()=>showScreen('home'));$('harvestCloverBtn').addEventListener('click',harvestClovers);document.querySelectorAll('[data-warehouse]').forEach((btn)=>btn.addEventListener('click',openWarehouse));$('feedVisitorBtn').addEventListener('click',feedVisitor);
  document.querySelectorAll('[data-place]').forEach((btn)=>btn.addEventListener('click',()=>showScreen(btn.dataset.place)));document.querySelectorAll('[data-home]').forEach((btn)=>btn.addEventListener('click',()=>showScreen('home')));
  document.querySelectorAll('.wardrobe-tab').forEach((btn)=>btn.addEventListener('click',()=>{wardrobeCategory=btn.dataset.category;renderWardrobe();}));
  document.querySelectorAll('[data-close]').forEach((btn)=>btn.addEventListener('click',()=>$(btn.dataset.close).hidden=true));overlays.forEach((el)=>el.addEventListener('click',(e)=>{if(e.target===el)el.hidden=true;}));
  document.addEventListener('keydown',(e)=>{if(e.key==='Escape')closeOverlays();});document.addEventListener('pointerdown',()=>startMusic(),{once:true});

  const now=new Date();$('dateText').textContent=new Intl.DateTimeFormat('zh-CN',{month:'long',day:'numeric'}).format(now);
  checkTrip();updateUI();showScreen(state.entered?'home':'intro');registerWebTools();
})();

