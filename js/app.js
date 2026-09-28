(() => {
  "use strict";

  const STORAGE = {
    settings: "boyoz-marquee-settings-v3",
    font: "boyoz-marquee-font-v1",
    theme: "boyoz-marquee-theme-v1"
  };

  const DEFAULTS = {
    text: "BoyOz",
    font: "Space Grotesk",
    fontSize: 160,
    speed: 20,
    rotation: -2,
    gap: 96,
    shadow: 8,
    theme: "elegant",
    customTheme: null
  };

  const THEMES = {
    elegant:{bgA:"#080808",bgB:"#211d19",text:"#f5f1e8",accent:"#d7b77c",shadow:"#070707",shadowOpacity:".88",glow:"rgba(215,183,124,.16)"},
    ocean:{bgA:"#031017",bgB:"#0d3541",text:"#e7fbff",accent:"#64d9eb",shadow:"#031116",shadowOpacity:".90",glow:"rgba(100,217,235,.20)"},
    forest:{bgA:"#040b06",bgB:"#16351f",text:"#edf8ee",accent:"#8bd29b",shadow:"#040b06",shadowOpacity:".90",glow:"rgba(139,210,155,.18)"},
    sunset:{bgA:"#170706",bgB:"#431d13",text:"#fff0e8",accent:"#ff9e72",shadow:"#110504",shadowOpacity:".90",glow:"rgba(255,158,114,.20)"},
    violet:{bgA:"#09050f",bgB:"#26113c",text:"#f7edff",accent:"#c88aff",shadow:"#0a050e",shadowOpacity:".92",glow:"rgba(200,138,255,.20)"},
    ice:{bgA:"#cfe8f5",bgB:"#f3fbff",text:"#10232d",accent:"#338cae",shadow:"#9fc3d2",shadowOpacity:".34",glow:"rgba(255,255,255,.62)"},
    cream:{bgA:"#eadcc1",bgB:"#fff9ec",text:"#33281d",accent:"#a66f2d",shadow:"#c5af86",shadowOpacity:".34",glow:"rgba(255,255,255,.62)"},
    candy:{bgA:"#f2c9df",bgB:"#fff1f7",text:"#44233a",accent:"#c54c8c",shadow:"#d5a1bf",shadowOpacity:".32",glow:"rgba(255,255,255,.64)"},
    lavender:{bgA:"#ded5f4",bgB:"#faf7ff",text:"#302747",accent:"#795fc7",shadow:"#baaee0",shadowOpacity:".30",glow:"rgba(255,255,255,.64)"},
    mint:{bgA:"#cce9dd",bgB:"#f2fff8",text:"#17352a",accent:"#318c6b",shadow:"#a5ccb8",shadowOpacity:".32",glow:"rgba(255,255,255,.64)"}
  };

  const FONT_NAMES = [
    "Space Grotesk","Manrope","Plus Jakarta Sans","DM Sans","Inter",
    "Poppins","Montserrat","Outfit","Sora","Urbanist","Nunito Sans",
    "Raleway","Roboto","Bebas Neue","Archivo Black","Anton","Oswald",
    "League Spartan","Syne","Unbounded","Bungee","Righteous",
    "Abril Fatface","Playfair Display","DM Serif Display",
    "Libre Baskerville","Cormorant Garamond"
  ];

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const root = document.documentElement;

  const els = {
    textInput: $("#textInput"),
    fontPicker: $("#fontPicker"),
    fontSize: $("#fontSize"),
    speed: $("#speed"),
    rotation: $("#rotation"),
    gap: $("#gap"),
    shadow: $("#shadow"),
    themePicker: $("#themePicker"),
    customTheme: $("#customTheme"),
    applyCustomTheme: $("#applyCustomTheme"),
    colorBgA: $("#colorBgA"), colorBgB: $("#colorBgB"), colorText: $("#colorText"),
    colorAccent: $("#colorAccent"), colorShadow: $("#colorShadow"), colorGlow: $("#colorGlow"),
    glowOpacity: $("#glowOpacity"),
    randomTheme: $("#randomTheme"),
    reset: $("#reset"),
    settingsToggle: $("#settingsToggle"),
    settingsPanel: $("#settingsPanel"),
    settingsOverlay: $("#settingsOverlay"),
    themeFlash: $("#themeFlash"),
    googleFontStylesheet: $("#googleFontStylesheet")
  };

  let state = {...DEFAULTS};

  function clamp(value,min,max){return Math.min(max,Math.max(min,value));}

  function readJSON(key,fallback){
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : fallback;
    } catch { return fallback; }
  }

  function saveState(){
    try {
      localStorage.setItem(STORAGE.settings,JSON.stringify({
        text:state.text,fontSize:state.fontSize,speed:state.speed,
        rotation:state.rotation,gap:state.gap,shadow:state.shadow
      }));
      localStorage.setItem(STORAGE.font,state.font);
      if(state.customTheme) localStorage.setItem("boyoz-marquee-custom-theme-v1",JSON.stringify(state.customTheme));
    } catch {}
  }

  function loadState(){
    const settings = readJSON(STORAGE.settings,{});
    state = {
      ...DEFAULTS,
      ...settings,
      font: localStorage.getItem(STORAGE.font) || DEFAULTS.font,
      theme: localStorage.getItem(STORAGE.theme) || DEFAULTS.theme,
      customTheme: readJSON("boyoz-marquee-custom-theme-v1", null)
    };

    if(!THEMES[state.theme]) state.theme = DEFAULTS.theme;
    state.fontSize=clamp(Number(state.fontSize),24,320);
    state.speed=clamp(Number(state.speed),2,120);
    state.rotation=clamp(Number(state.rotation),-15,15);
    state.gap=clamp(Number(state.gap),0,300);
    state.shadow=clamp(Number(state.shadow),0,30);
  }

  function setVariable(name,value){root.style.setProperty(name,value);}

  function updateMarqueeText(){
    const text=String(state.text||"BoyOz").trim()||"BoyOz";
    state.text=text;
    $$(".theme-button").forEach(button=>button.textContent=text);
  }

  function loadGoogleFont(fontName){
    if(!FONT_NAMES.includes(fontName)) fontName=DEFAULTS.font;
    const encoded=encodeURIComponent(fontName).replace(/%20/g,"+");
    if(els.googleFontStylesheet){
      els.googleFontStylesheet.href =
        `https://fonts.googleapis.com/css2?family=${encoded}:wght@400;500;600;700;800&display=swap`;
    }
    setVariable("--font-family",`"${fontName}"`);
    state.font=fontName;
  }

  function applyTheme(name,save=true){
    const theme=THEMES[name];
    if(!theme) return;
    state.theme=name;
    setVariable("--bg-a",theme.bgA);
    setVariable("--bg-b",theme.bgB);
    setVariable("--text",theme.text);
    setVariable("--accent",theme.accent);
    setVariable("--shadow",theme.shadow);
    setVariable("--shadow-opacity",theme.shadowOpacity);
    setVariable("--glow",theme.glow);
    if(els.themePicker) els.themePicker.value=name;
    if(save) localStorage.setItem(STORAGE.theme,name);
    playThemeFlash();
  }

  function playThemeFlash(){
    if(!els.themeFlash) return;
    els.themeFlash.classList.remove("play");
    void els.themeFlash.offsetWidth;
    els.themeFlash.classList.add("play");
    setTimeout(()=>els.themeFlash.classList.remove("play"),500);
  }

  function hsl(h,s,l){return `hsl(${Math.round(h)} ${Math.round(s)}% ${Math.round(l)}%)`;}

  function hslToRgb(h,s,l){
    s/=100;l/=100;
    const k=n=>(n+h/30)%12;
    const a=s*Math.min(l,1-l);
    const f=n=>l-a*Math.max(-1,Math.min(k(n)-3,Math.min(9-k(n),1)));
    return [Math.round(255*f(0)),Math.round(255*f(8)),Math.round(255*f(4))];
  }

  function generateRandomTheme(){
    const isLight=Math.random()>.5;
    const hue=Math.floor(Math.random()*360);
    let bgA,bgB,accent,text,shadow,shadowOpacity;

    if(isLight){
      bgA=hsl(hue,18+Math.random()*24,74+Math.random()*15);
      bgB=hsl((hue+Math.random()*25)%360,15+Math.random()*20,88+Math.random()*10);
      accent=hsl((hue+25+Math.random()*50)%360,45+Math.random()*33,35+Math.random()*22);
      text="#17202a";
      shadow=hsl(hue,15+Math.random()*20,55+Math.random()*15);
      shadowOpacity=(.24+Math.random()*.14).toFixed(2);
    }else{
      bgA=hsl(hue,35+Math.random()*30,5+Math.random()*10);
      bgB=hsl((hue+Math.random()*30)%360,35+Math.random()*30,15+Math.random()*14);
      accent=hsl((hue+20+Math.random()*60)%360,58+Math.random()*32,58+Math.random()*20);
      text="#f7f7f7";
      shadow=hsl(hue,30+Math.random()*35,2+Math.random()*7);
      shadowOpacity=(.78+Math.random()*.16).toFixed(2);
    }

    const glow=isLight
      ? `rgba(255,255,255,${(.48+Math.random()*.22).toFixed(2)})`
      : `rgba(255,255,255,${(.10+Math.random()*.12).toFixed(2)})`;

    applyCustomTheme({bgA,bgB,text,accent,shadow,shadowOpacity,glow});
  }

  function applyCustomTheme(theme,save=true){
    state.customTheme={...state.customTheme,...theme};
    setVariable("--bg-a",theme.bgA);
    setVariable("--bg-b",theme.bgB);
    setVariable("--text",theme.text);
    setVariable("--accent",theme.accent);
    setVariable("--shadow",theme.shadow);
    setVariable("--shadow-opacity",theme.shadowOpacity);
    setVariable("--glow",theme.glow);
    state.theme="custom";
    if(els.themePicker) els.themePicker.value="";
    try{localStorage.setItem(STORAGE.theme,"custom");if(save&&state.customTheme)localStorage.setItem("boyoz-marquee-custom-theme-v1",JSON.stringify(state.customTheme));}catch{}
    syncCustomColorControls();playThemeFlash();
  }

  function hexToRgba(hex,opacity){
    const n=parseInt(String(hex).replace("#",""),16);
    return `rgba(${(n>>16)&255}, ${(n>>8)&255}, ${n&255}, ${(opacity/100).toFixed(2)})`;
  }

  function syncCustomColorControls(){
    const t=state.customTheme;
    if(!t)return;
    [["colorBgA","bgA"],["colorBgB","bgB"],["colorText","text"],["colorAccent","accent"],["colorShadow","shadow"]].forEach(([id,key])=>{
      if(els[id]&&t[key])els[id].value=t[key];
      const o=$("#"+id+"Value");if(o)o.textContent=(t[key]||"#000000").toUpperCase();
    });
    const glow=t.glowHex||"#d7b77c",opacity=Number(t.glowOpacity??18);
    if(els.colorGlow)els.colorGlow.value=glow;
    if($("#colorGlowValue"))$("#colorGlowValue").textContent=glow.toUpperCase();
    if(els.glowOpacity)els.glowOpacity.value=opacity;
    if($("#glowOpacityValue"))$("#glowOpacityValue").textContent=opacity+"%";
  }

  function showCustomTheme(){
    if(!els.customTheme||!els.themePicker)return;
    const active=els.themePicker.value==="";
    els.customTheme.hidden=!active;
    if(active){
      if(!state.customTheme)state.customTheme={bgA:"#080808",bgB:"#211d19",text:"#f5f1e8",accent:"#d7b77c",shadow:"#070707",glowHex:"#d7b77c",glowOpacity:18};
      syncCustomColorControls();
    }
  }

  function updateCustomControls(){
    state.customTheme={
      bgA:els.colorBgA.value,bgB:els.colorBgB.value,text:els.colorText.value,
      accent:els.colorAccent.value,shadow:els.colorShadow.value,glowHex:els.colorGlow.value,
      glowOpacity:Number(els.glowOpacity.value)
    };
    [["colorBgA","bgA"],["colorBgB","bgB"],["colorText","text"],["colorAccent","accent"],["colorShadow","shadow"],["colorGlow","glowHex"]].forEach(([id,key])=>{
      const o=$("#"+id+"Value");if(o)o.textContent=state.customTheme[key].toUpperCase();
    });
    if($("#glowOpacityValue"))$("#glowOpacityValue").textContent=state.customTheme.glowOpacity+"%";
  }

  function applyCustomFromControls(){
    updateCustomControls();
    const t=state.customTheme;
    applyCustomTheme({bgA:t.bgA,bgB:t.bgB,text:t.text,accent:t.accent,shadow:t.shadow,shadowOpacity:".88",glow:hexToRgba(t.glowHex,t.glowOpacity)});
    saveState();
  }

  function updateRangeLabels(){
    const values={
      fontSize:$("#fontSizeValue"),
      speed:$("#speedValue"),
      rotation:$("#rotationValue"),
      gap:$("#gapValue"),
      shadow:$("#shadowValue")
    };
    if(values.fontSize) values.fontSize.textContent=`${state.fontSize}px`;
    if(values.speed) values.speed.textContent=`${state.speed}s`;
    if(values.rotation) values.rotation.textContent=`${state.rotation}°`;
    if(values.gap) values.gap.textContent=`${state.gap}px`;
    if(values.shadow) values.shadow.textContent=`${state.shadow}px`;
  }

  function syncControls(){
    if(els.textInput) els.textInput.value=state.text;
    if(els.fontPicker) els.fontPicker.value=state.font;
    if(els.fontSize) els.fontSize.value=state.fontSize;
    if($("#fontSizeNumber"))$("#fontSizeNumber").value=state.fontSize;
    if(els.speed) els.speed.value=state.speed;
    if($("#speedNumber"))$("#speedNumber").value=state.speed;
    if(els.rotation) els.rotation.value=state.rotation;
    if($("#rotationNumber"))$("#rotationNumber").value=state.rotation;
    if(els.gap) els.gap.value=state.gap;
    if($("#gapNumber"))$("#gapNumber").value=state.gap;
    if(els.shadow) els.shadow.value=state.shadow;
    if($("#shadowNumber"))$("#shadowNumber").value=state.shadow;
    if(els.themePicker)els.themePicker.value=THEMES[state.theme]?state.theme:"";
    syncCustomColorControls();
    showCustomTheme();
    updateRangeLabels();
  }

  function applySettings(){
    setVariable("--font-size",`${state.fontSize}px`);
    setVariable("--speed",`${state.speed}s`);
    setVariable("--rotation",`${state.rotation}deg`);
    setVariable("--gap",`${state.gap}px`);
    setVariable("--shadow-depth",`${state.shadow}px`);
    updateMarqueeText();
    loadGoogleFont(state.font);
    updateRangeLabels();
  }

  let previousFocus=null;

  function openSettings(){
    previousFocus=document.activeElement;
    els.settingsPanel?.classList.add("open");
    els.settingsOverlay?.classList.add("open");
    els.settingsToggle?.setAttribute("aria-expanded","true");
    els.settingsPanel?.setAttribute("aria-hidden","false");
    setTimeout(()=>els.textInput?.focus(),80);
  }

  function closeSettings(){
    els.settingsPanel?.classList.remove("open");
    els.settingsOverlay?.classList.remove("open");
    els.settingsToggle?.setAttribute("aria-expanded","false");
    els.settingsPanel?.setAttribute("aria-hidden","true");
    if(previousFocus && typeof previousFocus.focus==="function") previousFocus.focus();
  }

  function resetAll(){
    state={...DEFAULTS,customTheme:null};
    try{
      localStorage.removeItem(STORAGE.settings);
      localStorage.removeItem(STORAGE.font);
      localStorage.removeItem(STORAGE.theme);
      localStorage.removeItem("boyoz-marquee-custom-theme-v1");
    }catch{}
    applyTheme(DEFAULTS.theme,false);
    applySettings();
    syncControls();
  }

  function bindEvents(){
    els.settingsToggle?.addEventListener("click",()=>{
      els.settingsPanel?.classList.contains("open") ? closeSettings() : openSettings();
    });

    els.settingsOverlay?.addEventListener("click",closeSettings);
    $(".close-settings")?.addEventListener("click",closeSettings);

    document.addEventListener("keydown",event=>{
      if(event.key==="Escape" && els.settingsPanel?.classList.contains("open")) closeSettings();
    });

    $$(".theme-button").forEach(button=>{
      button.addEventListener("click",generateRandomTheme);
    });

    els.textInput?.addEventListener("input",event=>{
      state.text=event.target.value;
      updateMarqueeText();
      saveState();
    });

    els.fontPicker?.addEventListener("change",event=>{
      state.font=event.target.value;
      loadGoogleFont(state.font);
      saveState();
    });

    const ranges=[
      ["fontSize",24,320,"--font-size","px","fontSizeNumber"],
      ["speed",2,120,"--speed","s","speedNumber"],
      ["rotation",-360,360,"--rotation","deg","rotationNumber"],
      ["gap",0,300,"--gap","px","gapNumber"],
      ["shadow",0,30,"--shadow-depth","px","shadowNumber"]
    ];

    ranges.forEach(([key,min,max,variable,suffix,numberId])=>{
      els[key]?.addEventListener("input",event=>{
        state[key]=clamp(Number(event.target.value),min,max);
        setVariable(variable,state[key]+suffix);
        const n=$("#"+numberId);if(n)n.value=state[key];
        updateRangeLabels();
        saveState();
      });
    });

    els.themePicker?.addEventListener("change",event=>{
      if(THEMES[event.target.value]){applyTheme(event.target.value);showCustomTheme();}else showCustomTheme();
    });

    const numberInputs=[["fontSizeNumber","fontSize",24,320,"--font-size","px"],["speedNumber","speed",2,120,"--speed","s"],["rotationNumber","rotation",-15,15,"--rotation","deg"],["gapNumber","gap",0,300,"--gap","px"],["shadowNumber","shadow",0,30,"--shadow-depth","px"]];
    numberInputs.forEach(([id,key,min,max,variable,suffix])=>{
      $("#"+id)?.addEventListener("input",e=>{
        const raw=Number(e.target.value);if(!Number.isFinite(raw))return;
        state[key]=clamp(raw,min,max);e.target.value=state[key];
        if(els[key])els[key].value=state[key];setVariable(variable,state[key]+suffix);updateRangeLabels();saveState();
      });
    });
    ["colorBgA","colorBgB","colorText","colorAccent","colorShadow","colorGlow"].forEach(id=>els[id]?.addEventListener("input",updateCustomControls));
    els.glowOpacity?.addEventListener("input",updateCustomControls);
    els.applyCustomTheme?.addEventListener("click",applyCustomFromControls);



    els.randomTheme?.addEventListener("click",generateRandomTheme);
    els.reset?.addEventListener("click",resetAll);
  }

  function initializeIcons(){
    if(window.lucide && typeof window.lucide.createIcons==="function"){
      window.lucide.createIcons({attrs:{"aria-hidden":"true"}});
      return;
    }
    setTimeout(initializeIcons,100);
  }

  function init(){
    loadState();
    if(state.theme==="custom"&&state.customTheme){applyCustomTheme(state.customTheme,false);}else{applyTheme(state.theme,false);}
    applySettings();
    syncControls();
    bindEvents();
    initializeIcons();
  }

  if(document.readyState==="loading"){
    document.addEventListener("DOMContentLoaded",init,{once:true});
  }else{
    init();
  }
})();