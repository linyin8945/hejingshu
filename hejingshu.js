(function () {
  "use strict";

  const PLUGIN_ID = "hejingshu";
  const APP_ID = "hejingshu-home";
  const VERSION = "1.0.0";

  const GOLD = "#D6B56A";
  const DEEP_RED = "#6F0D14";
  const PAPER_RED = "#8E111A";
  const DARK_RED = "#4C090D";
  const SOFT_GOLD = "#E8D49A";

  const ASSET_BASE = "https://raw.githubusercontent.com/linyin8945/hejingshu/main/assets/scenes/";
  const WEDDING_ASSETS = {
    procession: ASSET_BASE + "procession.webp",
    weddingGate: ASSET_BASE + "wedding-gate.webp",
    bridePrep: ASSET_BASE + "bride-prep.webp",
    hejinCups: ASSET_BASE + "hejin-cups.webp",
    ceremonyComplete: ASSET_BASE + "ceremony-complete.webp",
    bridalRoom: ASSET_BASE + "bridal-room-main.webp",
    bridalRoomAlt: ASSET_BASE + "bridal-room-alt.webp",
    officiantScroll: ASSET_BASE + "officiant-scroll.webp",
    weddingHallEntry: ASSET_BASE + "wedding-hall-entry.webp",
    sedanJourney: ASSET_BASE + "sedan-journey.webp",
    sedanArrival: ASSET_BASE + "sedan-arrival.webp",
    doubleSeal: ASSET_BASE + "double-seal.webp",
    pickupDoor: ASSET_BASE + "pickup-door.webp",
    banquetToast: ASSET_BASE + "banquet-toast.webp",
    banquetHall: ASSET_BASE + "banquet-hall.webp",
    vowsScroll: ASSET_BASE + "vows-scroll.webp",
    bridalNightSeated: ASSET_BASE + "bridal-night-seated.webp",
    hairKnot: ASSET_BASE + "hair-knot.webp",
    bowCeremony: ASSET_BASE + "bow-ceremony.webp",
    marriageBook: ASSET_BASE + "marriage-book.webp",
    veilLift: ASSET_BASE + "veil-lift.webp",
    departureHands: ASSET_BASE + "departure-hands.webp",
    morningAfter: ASSET_BASE + "morning-after.webp",
    keepsakes: ASSET_BASE + "keepsakes.webp",
    queshan: ASSET_BASE + "queshan.webp"
  };


  const AUDIO_BASE = "https://raw.githubusercontent.com/linyin8945/hejingshu/main/audio/";
  const WEDDING_AUDIO = {
    procession: AUDIO_BASE + "procession.mp3",
    ceremony: AUDIO_BASE + "ceremony.mp3",
    afterglow: AUDIO_BASE + "afterglow.mp3",
    finale: AUDIO_BASE + "finale.mp3"
  };

  function sceneStyle(key, position = "center") {
    const url = WEDDING_ASSETS[key];
    if (!url) return "";
    return `style="--hj-scene-image:url('${url}');--hj-scene-pos:${position}"`;
  }

  function preloadAssets(keys) {
    (keys || []).forEach(key => {
      const url = WEDDING_ASSETS[key];
      if (!url) return;
      const img = new Image();
      img.decoding = "async";
      img.src = url;
    });
  }

  function esc(v) {
    return String(v ?? "").replace(/[&<>"']/g, s => ({
      "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
    }[s]));
  }

  function uid() {
    return (crypto && crypto.randomUUID) ? crypto.randomUUID() : "id-" + Date.now() + "-" + Math.random().toString(16).slice(2);
  }

  function fmtDate(ts) {
    const d = new Date(ts || Date.now());
    return `${d.getFullYear()}年${String(d.getMonth()+1).padStart(2,"0")}月${String(d.getDate()).padStart(2,"0")}日`;
  }

  function daysSince(ts) {
    if (!ts) return 0;
    return Math.max(0, Math.floor((Date.now() - Number(ts)) / 86400000));
  }

  async function safeGet(storage, key, fallback) {
    try {
      const v = await storage.get(key);
      return v == null ? fallback : v;
    } catch (_) {
      return fallback;
    }
  }

  function buildStyles() {
    return `
<style id="hejingshu-style">
.roche-plugin-hejingshu{
  --hj-gold:${GOLD};
  --hj-gold2:${SOFT_GOLD};
  --hj-red:${PAPER_RED};
  --hj-deep:${DEEP_RED};
  --hj-dark:${DARK_RED};
  width:100%;height:100%;overflow:hidden;position:relative;
  color:#F4E8C6;background:
    radial-gradient(circle at 15% 10%,rgba(255,226,154,.09),transparent 25%),
    radial-gradient(circle at 85% 90%,rgba(255,226,154,.06),transparent 30%),
    linear-gradient(150deg,#4c090d 0%,#741016 45%,#4d080c 100%);
  font-family:"STKaiti","KaiTi","Songti SC","Noto Serif CJK SC",serif;
}
.roche-plugin-hejingshu *{box-sizing:border-box}
.roche-plugin-hejingshu button,.roche-plugin-hejingshu input,.roche-plugin-hejingshu textarea{font:inherit}
.hj-shell{height:100%;display:flex;flex-direction:column;position:relative;overflow:hidden}
.hj-paper-noise{position:absolute;inset:0;pointer-events:none;opacity:.18;background-image:
  repeating-linear-gradient(0deg,rgba(255,255,255,.025) 0 1px,transparent 1px 3px),
  repeating-linear-gradient(90deg,rgba(0,0,0,.018) 0 1px,transparent 1px 4px)}
.hj-border{position:absolute;inset:12px;border:1px solid rgba(214,181,106,.55);pointer-events:none}
.hj-border:before{content:"";position:absolute;inset:5px;border:1px solid rgba(214,181,106,.22)}
.hj-topbar{height:58px;display:flex;align-items:center;justify-content:space-between;padding:0 18px;position:relative;z-index:6}
.hj-iconbtn{border:0;background:transparent;color:var(--hj-gold2);font-size:20px;padding:9px 10px;cursor:pointer}
.hj-top-title{font-size:14px;letter-spacing:.32em;color:var(--hj-gold2)}
.hj-page{flex:1;overflow:auto;padding:8px 20px 110px;position:relative;z-index:2;-webkit-overflow-scrolling:touch}
.hj-home{display:flex;min-height:100%;align-items:center;justify-content:center;padding:30px 24px}
.hj-opening{text-align:center;max-width:430px;width:100%;animation:hjFade .9s ease both}
.hj-knot{width:76px;height:76px;border:1px solid var(--hj-gold);border-radius:50%;margin:0 auto 20px;display:flex;align-items:center;justify-content:center;color:var(--hj-gold);font-size:34px;box-shadow:inset 0 0 0 5px rgba(214,181,106,.08);animation:hjSeal 1.2s cubic-bezier(.2,.8,.2,1) both}
.hj-title{font-size:42px;letter-spacing:.28em;margin-right:-.28em;color:#E6C778;text-shadow:0 2px 18px rgba(230,199,120,.18);animation:hjTitle 1.15s .12s ease both}
.hj-sub{font-size:13px;letter-spacing:.22em;color:#D7C29B;margin-top:14px;animation:hjFade .9s .55s both}
.hj-rule{height:1px;background:linear-gradient(90deg,transparent,var(--hj-gold),transparent);margin:28px auto;width:0;animation:hjRule 1.3s .25s ease forwards}
.hj-quote{font-size:13px;line-height:2.05;color:#E6D7B5;margin:0 auto 28px;max-width:280px;animation:hjFade 1s .72s both}
.hj-primary,.hj-secondary,.hj-ghost{border:1px solid var(--hj-gold);border-radius:999px;padding:12px 22px;cursor:pointer;transition:.2s}
.hj-primary{background:linear-gradient(180deg,#D9BC73,#B48A3D);color:#4E0B0F;box-shadow:0 8px 30px rgba(0,0,0,.18)}
.hj-primary:active{transform:scale(.98)}
.hj-secondary{background:rgba(214,181,106,.08);color:#F3E4BC}
.hj-ghost{background:transparent;color:#D8C295;border-color:rgba(214,181,106,.35)}
.hj-card{background:linear-gradient(180deg,rgba(255,241,204,.065),rgba(80,8,12,.16));border:1px solid rgba(214,181,106,.36);border-radius:18px;padding:16px;box-shadow:0 14px 40px rgba(20,0,0,.16);backdrop-filter:blur(5px)}
.hj-section-title{font-size:22px;letter-spacing:.12em;color:#F0D797;margin:10px 0 5px}
.hj-section-desc{font-size:12px;line-height:1.8;color:#CDBB99;margin-bottom:16px}
.hj-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
.hj-person{border:1px solid rgba(214,181,106,.28);background:rgba(54,5,8,.24);border-radius:16px;padding:12px;display:flex;gap:10px;align-items:center;cursor:pointer;min-width:0}
.hj-person.selected{border-color:#E7CA7E;box-shadow:0 0 0 2px rgba(231,202,126,.10) inset;background:rgba(214,181,106,.09)}
.hj-avatar{width:44px;height:44px;border-radius:12px;object-fit:cover;background:#521015;border:1px solid rgba(214,181,106,.35);flex:0 0 auto}
.hj-avatar-fallback{width:44px;height:44px;border-radius:12px;display:flex;align-items:center;justify-content:center;background:#551016;border:1px solid rgba(214,181,106,.35);color:#E9CE85;flex:0 0 auto}
.hj-person-txt{min-width:0}.hj-person-name{font-size:14px;color:#F2E1B8;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.hj-person-bio{font-size:11px;color:#BCA98B;margin-top:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.hj-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:16px}
.hj-stepper{display:flex;gap:8px;margin:6px 0 18px}
.hj-dot{height:4px;flex:1;border-radius:99px;background:rgba(214,181,106,.18)}
.hj-dot.on{background:linear-gradient(90deg,#9F6C2D,#E2C57A)}
.hj-input,.hj-textarea{width:100%;background:rgba(40,3,6,.26);border:1px solid rgba(214,181,106,.34);border-radius:13px;color:#F5E9C8;padding:12px 13px;outline:none}
.hj-textarea{min-height:110px;resize:vertical;line-height:1.75}
.hj-label{font-size:12px;color:#D3BE94;margin:14px 0 7px;display:block}
.hj-rituals{display:grid;gap:10px}
.hj-ritual{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:14px;border:1px solid rgba(214,181,106,.25);border-radius:15px;background:rgba(77,8,12,.22);cursor:pointer}
.hj-ritual.done{border-color:#D8B765;background:rgba(216,183,101,.07)}
.hj-ritual-name{font-size:15px;color:#EBD5A3}.hj-ritual-desc{font-size:11px;color:#BCA98C;margin-top:4px;line-height:1.5}.hj-stamp{width:34px;height:34px;border:1px solid #C85448;color:#D87568;border-radius:7px;display:flex;align-items:center;justify-content:center;transform:rotate(-7deg);font-size:11px}
.hj-certificate{position:relative;max-width:510px;margin:0 auto;background:
  radial-gradient(circle at 50% 0,rgba(255,217,140,.08),transparent 24%),
  linear-gradient(160deg,#8C111A,#6F0D14 55%,#5A0A10);
  border:1px solid #C99E4A;padding:28px 20px 26px;box-shadow:inset 0 0 0 5px rgba(210,166,75,.06),0 20px 60px rgba(0,0,0,.24)}
.hj-certificate:before{content:"";position:absolute;inset:8px;border:1px solid rgba(225,190,108,.35);pointer-events:none}
.hj-cert-top{text-align:center;color:#E6C778;font-size:12px;letter-spacing:.24em}
.hj-cert-title{text-align:center;font-size:38px;color:#E6C778;letter-spacing:.28em;margin:18px 0 12px;margin-right:-.28em}
.hj-cert-names{display:flex;justify-content:center;gap:28px;margin:20px 0;color:#F3E3B8}
.hj-cert-name{text-align:center}.hj-cert-role{font-size:10px;color:#C9B58C;letter-spacing:.18em}.hj-cert-name strong{display:block;font-size:21px;font-weight:500;margin-top:6px;letter-spacing:.12em}
.hj-cert-text{font-size:13px;line-height:2.05;text-align:justify;color:#EAD9B2;padding:12px 8px}
.hj-cert-vows{border-top:1px solid rgba(214,181,106,.25);border-bottom:1px solid rgba(214,181,106,.25);padding:14px 4px;margin:12px 4px;font-size:12px;line-height:1.9;color:#E7D4A9}
.hj-cert-foot{text-align:center;color:#CBB88E;font-size:11px;line-height:1.8;margin-top:16px}
.hj-seal{width:54px;height:54px;margin:18px auto 2px;border:2px solid #D77865;color:#D77865;display:flex;align-items:center;justify-content:center;font-size:18px;line-height:1.05;transform:rotate(-5deg)}
.hj-bottom{position:absolute;left:0;right:0;bottom:0;padding:12px 18px 18px;background:linear-gradient(180deg,transparent,rgba(48,4,7,.96) 30%);z-index:5}
.hj-bottom .hj-primary{width:100%}
.hj-anniv{text-align:center;padding-top:24px}
.hj-count{font-size:42px;color:#E6C778;margin:10px 0 4px}.hj-count small{font-size:13px;margin-left:4px;color:#CDB889}
.hj-mini-cert{margin-top:16px;padding:14px;border:1px solid rgba(214,181,106,.3);border-radius:16px;background:rgba(79,8,12,.28);cursor:pointer}
.hj-toast{position:absolute;left:50%;bottom:90px;transform:translateX(-50%);background:#2E0608;color:#F0DDAF;border:1px solid rgba(214,181,106,.4);padding:9px 14px;border-radius:999px;font-size:12px;z-index:20;opacity:0;pointer-events:none;transition:.2s}
.hj-toast.show{opacity:1;bottom:105px}
.hj-loading{padding:20px;text-align:center;color:#D7C297;font-size:13px}
@keyframes hjFade{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
@keyframes hjTitle{from{opacity:0;filter:blur(8px);letter-spacing:.5em}to{opacity:1;filter:none;letter-spacing:.28em}}
@keyframes hjRule{to{width:78%}}
@keyframes hjSeal{0%{opacity:0;transform:scale(1.6) rotate(-12deg)}65%{opacity:1;transform:scale(.92) rotate(2deg)}100%{transform:scale(1)}}
@media (max-width:380px){.hj-title{font-size:36px}.hj-grid{grid-template-columns:1fr}.hj-page{padding-left:16px;padding-right:16px}}

.hj-opening-scroll{position:relative;width:min(86vw,390px);min-height:520px;margin:auto;padding:58px 28px 46px;
  background:linear-gradient(180deg,rgba(154,25,31,.96),rgba(111,13,20,.98));
  border-left:8px solid #3b0508;border-right:8px solid #3b0508;
  box-shadow:0 22px 55px rgba(0,0,0,.28),inset 0 0 0 1px rgba(231,202,126,.18);
  overflow:hidden;transform-origin:center top;animation:hjScrollOpen 1.35s cubic-bezier(.2,.8,.2,1) both}
.hj-opening-scroll:before,.hj-opening-scroll:after{content:"";position:absolute;left:10px;right:10px;height:18px;
  background:linear-gradient(180deg,#2b0305,#6f0d14 45%,#2b0305);border:1px solid rgba(214,181,106,.35)}
.hj-opening-scroll:before{top:12px}.hj-opening-scroll:after{bottom:12px}
.hj-cloud{position:absolute;color:rgba(230,199,120,.15);font-size:58px;line-height:1;pointer-events:none}
.hj-cloud.c1{left:-6px;top:74px;transform:rotate(-8deg)}.hj-cloud.c2{right:-2px;bottom:90px;transform:rotate(9deg)}
.hj-gold-dust{position:absolute;inset:0;pointer-events:none;overflow:hidden}
.hj-gold-dust i{position:absolute;width:3px;height:3px;border-radius:50%;background:#e5c671;opacity:.45;animation:hjDust 5s linear infinite}
.hj-scene{min-height:100%;display:flex;flex-direction:column;position:relative;overflow:hidden}
.hj-scene-main{flex:1;display:flex;align-items:center;justify-content:center;padding:28px 20px 120px}
.hj-scene-card{width:min(92vw,480px);text-align:center;position:relative}
.hj-scene-kicker{font-size:11px;letter-spacing:.34em;color:#cdb98d;margin-bottom:10px}
.hj-scene-title{font-size:28px;letter-spacing:.2em;color:#efd488;margin-right:-.2em}
.hj-scene-copy{font-size:12px;line-height:1.9;color:#d6c39d;margin:12px auto 22px;max-width:310px}
.hj-lantern-wrap{display:flex;justify-content:space-between;position:absolute;top:30px;left:18px;right:18px;pointer-events:none}
.hj-lantern{width:46px;height:66px;border:1px solid rgba(226,197,122,.55);border-radius:46% 46% 40% 40%;background:rgba(151,20,27,.65);
  box-shadow:0 0 24px rgba(226,197,122,.08);position:relative;transform-origin:50% -10px;animation:hjSwing 3.6s ease-in-out infinite}
.hj-lantern:before{content:"";position:absolute;left:11px;right:11px;top:8px;bottom:8px;border:1px solid rgba(226,197,122,.22);border-radius:48%}
.hj-lantern:after{content:"";position:absolute;left:50%;bottom:-18px;width:1px;height:18px;background:#c89f53}
.hj-curtain{position:absolute;inset:0;pointer-events:none;background:
  linear-gradient(90deg,rgba(47,4,7,.9),transparent 16%,transparent 84%,rgba(47,4,7,.9)),
  repeating-linear-gradient(90deg,transparent 0 34px,rgba(230,199,120,.025) 34px 35px)}
.hj-fan-stage{position:relative;width:250px;height:250px;margin:8px auto 18px}
.hj-face{position:absolute;inset:35px;border-radius:50%;overflow:hidden;border:1px solid rgba(230,199,120,.45);background:#5a0b10;box-shadow:0 12px 35px rgba(0,0,0,.2)}
.hj-face img{width:100%;height:100%;object-fit:cover}
.hj-face .hj-avatar-fallback{width:100%;height:100%;border-radius:50%;font-size:48px}
.hj-fan{position:absolute;width:220px;height:220px;left:15px;top:16px;border-radius:50% 50% 46% 46%;
  background:
    radial-gradient(circle at 50% 44%,rgba(255,244,214,.94) 0 52%,rgba(232,219,184,.95) 53% 55%,rgba(255,247,226,.96) 56%),
    #efe1bc;
  border:2px solid #c6a85d;box-shadow:0 18px 34px rgba(0,0,0,.24);transition:transform 1s cubic-bezier(.2,.8,.2,1),opacity .8s ease;transform-origin:72% 82%}
.hj-fan:before{content:"却";position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:#9b6e36;font-size:42px;opacity:.62}
.hj-fan:after{content:"";position:absolute;width:8px;height:84px;background:linear-gradient(#b79049,#72511f);left:108px;bottom:-72px;border-radius:10px}
.hj-fan.open{transform:translate(82px,-28px) rotate(26deg);opacity:.93}
.hj-toastline{min-height:28px;font-size:13px;color:#efd89a;line-height:1.8;margin-top:4px}
.hj-cups{position:relative;width:280px;height:180px;margin:10px auto 20px}
.hj-cup{position:absolute;bottom:28px;width:94px;height:64px;border:2px solid #d6b56a;border-top:none;border-radius:0 0 46px 46px;
  background:linear-gradient(180deg,rgba(219,184,96,.06),rgba(219,184,96,.14));transition:transform 1.2s cubic-bezier(.2,.8,.2,1)}
.hj-cup:before{content:"";position:absolute;left:8px;right:8px;top:-6px;height:12px;border:2px solid #d6b56a;border-radius:50%;background:#6c0d13}
.hj-cup.left{left:22px;transform:rotate(-8deg)}.hj-cup.right{right:22px;transform:rotate(8deg)}
.hj-cups.join .hj-cup.left{transform:translateX(48px) rotate(6deg)}.hj-cups.join .hj-cup.right{transform:translateX(-48px) rotate(-6deg)}
.hj-flash{position:absolute;left:50%;top:74px;width:10px;height:10px;border-radius:50%;transform:translate(-50%,-50%) scale(.2);
  background:#f6dda0;box-shadow:0 0 0 0 rgba(246,221,160,.4);opacity:0}
.hj-cups.join .hj-flash{animation:hjFlash .8s .72s ease both}
.hj-thread-stage{position:relative;height:190px;margin:8px auto 20px;max-width:320px}
.hj-thread{position:absolute;top:88px;width:48%;height:3px;background:linear-gradient(90deg,transparent,#d4b05d 18%,#d4b05d 82%,transparent);transition:transform 1.1s cubic-bezier(.2,.8,.2,1)}
.hj-thread.left{left:0;transform-origin:right center;transform:rotate(12deg)}.hj-thread.right{right:0;transform-origin:left center;transform:rotate(-12deg)}
.hj-thread-stage.tied .hj-thread.left{transform:translateX(58px) rotate(28deg)}.hj-thread-stage.tied .hj-thread.right{transform:translateX(-58px) rotate(-28deg)}
.hj-thread-knot{position:absolute;left:50%;top:65px;transform:translateX(-50%) scale(.6);opacity:.2;font-size:42px;color:#dfc06e;transition:.8s .5s}
.hj-thread-stage.tied .hj-thread-knot{transform:translateX(-50%) scale(1);opacity:1}
.hj-longpress{position:relative;width:116px;height:116px;border-radius:50%;margin:16px auto 10px;display:flex;align-items:center;justify-content:center;cursor:pointer;user-select:none;-webkit-user-select:none}
.hj-longpress-ring{position:absolute;inset:0;border-radius:50%;background:conic-gradient(#e2c16f var(--hold,0%),rgba(226,193,111,.14) 0);mask:radial-gradient(circle,transparent 56%,#000 57%);-webkit-mask:radial-gradient(circle,transparent 56%,#000 57%)}
.hj-longpress-seal{width:82px;height:82px;border:2px solid #d76f62;color:#d76f62;display:flex;align-items:center;justify-content:center;line-height:1.05;font-size:22px;transform:rotate(-5deg);background:rgba(86,9,13,.75);transition:.18s}
.hj-longpress.holding .hj-longpress-seal{transform:rotate(-5deg) scale(.94) translateY(3px)}
.hj-cert-reveal .hj-cert-top,.hj-cert-reveal .hj-cert-title,.hj-cert-reveal .hj-cert-names,.hj-cert-reveal .hj-cert-text,.hj-cert-reveal .hj-cert-vows,.hj-cert-reveal .hj-seal,.hj-cert-reveal .hj-cert-foot{opacity:0;transform:translateY(8px);animation:hjCertIn .7s ease forwards}
.hj-cert-reveal .hj-cert-title{animation-delay:.15s}.hj-cert-reveal .hj-cert-names{animation-delay:.3s}.hj-cert-reveal .hj-cert-text{animation-delay:.45s}.hj-cert-reveal .hj-cert-vows{animation-delay:.62s}.hj-cert-reveal .hj-seal{animation-delay:.8s}.hj-cert-reveal .hj-cert-foot{animation-delay:.95s}
.hj-scene-bottom{position:absolute;left:0;right:0;bottom:0;padding:14px 18px 22px;background:linear-gradient(180deg,transparent,rgba(51,4,7,.96) 34%);z-index:4}
.hj-scene-bottom button{width:100%}
@keyframes hjScrollOpen{0%{opacity:0;transform:scaleY(.08) translateY(-30px)}55%{opacity:1}100%{transform:scaleY(1) translateY(0)}}
@keyframes hjDust{0%{transform:translateY(-20px);opacity:0}15%{opacity:.5}100%{transform:translateY(520px);opacity:0}}
@keyframes hjSwing{0%,100%{transform:rotate(-2deg)}50%{transform:rotate(2deg)}}
@keyframes hjFlash{0%{opacity:0;transform:translate(-50%,-50%) scale(.2);box-shadow:0 0 0 0 rgba(246,221,160,.5)}40%{opacity:1}100%{opacity:0;transform:translate(-50%,-50%) scale(5);box-shadow:0 0 24px 18px rgba(246,221,160,0)}}
@keyframes hjCertIn{to{opacity:1;transform:none}}


.hj-card-title{font-size:16px;color:#efd69a;letter-spacing:.12em;margin-bottom:6px}
.hj-wedding-day-badge{display:inline-flex;padding:6px 10px;border:1px solid rgba(214,181,106,.35);border-radius:999px;color:#e0c98e;font-size:10px;letter-spacing:.18em}
.hj-hall-lines{position:absolute;inset:0;pointer-events:none;background:
 radial-gradient(circle at 50% -10%,rgba(232,198,113,.08),transparent 36%),
 linear-gradient(90deg,transparent 49.8%,rgba(224,190,105,.10) 50%,transparent 50.2%)}


/* v0.3.1 · iPhone 页面滚动修复 */
.hj-app{
  height:100% !important;
  min-height:0 !important;
  overflow:hidden !important;
}
.hj-page{
  height:100% !important;
  min-height:0 !important;
  overflow-y:auto !important;
  overflow-x:hidden !important;
  -webkit-overflow-scrolling:touch !important;
  overscroll-behavior-y:contain;
  touch-action:pan-y !important;
  padding-bottom:calc(130px + env(safe-area-inset-bottom)) !important;
  box-sizing:border-box !important;
}
.hj-home{
  min-height:100% !important;
  overflow-y:auto !important;
  -webkit-overflow-scrolling:touch !important;
  touch-action:pan-y !important;
}
.hj-grid,.hj-person,.hj-person *{
  touch-action:pan-y !important;
}

/* v0.3.1 · 合卺书封面重绘 */
.hj-opening-scroll{
  width:min(88vw,410px) !important;
  min-height:610px !important;
  padding:0 !important;
  border:0 !important;
  background:
    radial-gradient(circle at 50% 18%,rgba(225,184,93,.10),transparent 27%),
    linear-gradient(180deg,#991922 0%,#85131b 48%,#6f0d14 100%) !important;
  box-shadow:
    0 26px 70px rgba(35,0,3,.30),
    inset 0 0 0 1px rgba(231,199,117,.32),
    inset 0 0 38px rgba(43,0,4,.18) !important;
  overflow:hidden !important;
  position:relative !important;
}
.hj-opening-scroll:before{
  content:"" !important;
  position:absolute !important;
  inset:12px !important;
  height:auto !important;
  left:12px !important;right:12px !important;top:12px !important;bottom:12px !important;
  border:1px solid rgba(226,194,112,.58) !important;
  background:none !important;
  pointer-events:none !important;
}
.hj-opening-scroll:after{
  content:"" !important;
  position:absolute !important;
  width:74px !important;height:74px !important;
  left:22px !important;top:22px !important;right:auto !important;bottom:auto !important;
  border-left:1px solid rgba(229,197,116,.48) !important;
  border-top:1px solid rgba(229,197,116,.48) !important;
  background:none !important;
  pointer-events:none !important;
}
.hj-opening{
  min-height:610px !important;
  padding:76px 34px 62px !important;
  box-sizing:border-box !important;
  display:flex !important;
  flex-direction:column !important;
  align-items:center !important;
  justify-content:center !important;
  position:relative !important;
  z-index:2 !important;
}
.hj-opening:before,.hj-opening:after{
  content:"◇" !important;
  position:absolute !important;
  color:rgba(230,197,111,.55) !important;
  font-size:20px !important;
  line-height:1 !important;
}
.hj-opening:before{top:31px;right:31px}
.hj-opening:after{bottom:31px;left:31px}
.hj-knot{
  width:72px !important;height:72px !important;
  display:flex !important;align-items:center !important;justify-content:center !important;
  border:1px solid rgba(236,205,126,.72) !important;
  outline:1px solid rgba(236,205,126,.22) !important;
  outline-offset:7px !important;
  border-radius:50% !important;
  color:#efd17e !important;
  font-size:32px !important;
  margin:0 0 34px !important;
  background:rgba(112,10,16,.18) !important;
}
.hj-title{
  font-family:"Songti SC","STSong","Noto Serif CJK SC",serif !important;
  font-size:46px !important;
  font-weight:400 !important;
  letter-spacing:.22em !important;
  margin-right:-.22em !important;
  color:#f0d284 !important;
  text-shadow:0 1px 12px rgba(244,208,119,.10) !important;
}
.hj-sub{
  margin-top:16px !important;
  color:#d9bd7a !important;
  letter-spacing:.26em !important;
  font-size:12px !important;
}
.hj-rule{
  width:116px !important;height:1px !important;
  margin:30px auto !important;
  background:linear-gradient(90deg,transparent,#d3af5b,transparent) !important;
}
.hj-quote{
  color:#eadfc7 !important;
  font-family:"Songti SC","STSong",serif !important;
  font-size:14px !important;
  line-height:2.15 !important;
  letter-spacing:.06em !important;
  margin-bottom:32px !important;
}
.hj-opening .hj-primary{
  min-width:118px !important;
  width:auto !important;
  padding:12px 28px !important;
  border-radius:4px !important;
  background:linear-gradient(180deg,#d9b45f,#b98b38) !important;
  color:#5e1013 !important;
  border:1px solid rgba(246,216,137,.7) !important;
  box-shadow:0 8px 22px rgba(52,3,7,.22) !important;
}
.hj-cloud{display:none !important}
.hj-gold-dust i{width:2px !important;height:2px !important;opacity:.22 !important}


.hj-page .hj-actions{
  position:relative;
  z-index:3;
}
.hj-page > .hj-actions:last-child{
  margin-top:22px !important;
  padding-bottom:20px !important;
}


/* v0.4 · 正式婚礼素材场景 */
.hj-scene.hj-photo-scene{
  background:#3e0508;
  isolation:isolate;
}
.hj-photo-scene::before{
  content:"";
  position:absolute;
  inset:0;
  background-image:var(--hj-scene-image);
  background-size:cover;
  background-position:var(--hj-scene-pos, center);
  background-repeat:no-repeat;
  transform:scale(1.015);
  animation:hjPhotoBreath 10s ease-in-out infinite alternate;
  z-index:-3;
}
.hj-photo-scene::after{
  content:"";
  position:absolute;
  inset:0;
  background:
    linear-gradient(180deg,rgba(25,1,3,.30) 0%,rgba(25,1,3,.08) 30%,rgba(25,1,3,.16) 58%,rgba(25,1,3,.82) 100%),
    linear-gradient(90deg,rgba(35,2,4,.18),transparent 28%,transparent 72%,rgba(35,2,4,.18));
  z-index:-2;
  pointer-events:none;
}
.hj-photo-scene .hj-topbar{
  background:linear-gradient(180deg,rgba(32,2,4,.58),transparent);
}
.hj-photo-scene .hj-scene-main{
  align-items:flex-end;
  padding-bottom:132px;
}
.hj-photo-scene .hj-scene-card{
  padding:20px 18px;
  border:1px solid rgba(238,211,144,.28);
  border-radius:18px;
  background:linear-gradient(180deg,rgba(55,5,8,.38),rgba(44,4,7,.68));
  box-shadow:0 16px 44px rgba(0,0,0,.22);
  backdrop-filter:blur(9px);
  -webkit-backdrop-filter:blur(9px);
}
.hj-photo-scene .hj-scene-title{
  text-shadow:0 2px 18px rgba(0,0,0,.42);
}
.hj-photo-scene .hj-scene-copy{
  color:#f2e3bf;
  text-shadow:0 1px 10px rgba(0,0,0,.38);
}
.hj-scene-bottom{
  padding-bottom:calc(20px + env(safe-area-inset-bottom));
}
.hj-scene-bottom .hj-primary,
.hj-scene-bottom .hj-secondary{
  backdrop-filter:blur(8px);
  -webkit-backdrop-filter:blur(8px);
}
.hj-scene-caption{
  margin:0 auto 12px;
  max-width:330px;
  color:#f1ddb0;
  font-size:12px;
  line-height:1.9;
  text-align:center;
}
.hj-photo-hero{
  position:relative;
  width:100%;
  aspect-ratio:16/10;
  overflow:hidden;
  border-radius:18px;
  border:1px solid rgba(224,192,112,.32);
  box-shadow:0 18px 44px rgba(0,0,0,.18);
  margin-bottom:16px;
}
.hj-photo-hero img{
  width:100%;
  height:100%;
  display:block;
  object-fit:cover;
}
.hj-photo-hero::after{
  content:"";
  position:absolute;
  inset:0;
  background:linear-gradient(180deg,transparent 58%,rgba(43,3,6,.52));
  pointer-events:none;
}
.hj-photo-label{
  position:absolute;
  left:14px;
  bottom:12px;
  z-index:2;
  color:#f2d995;
  font-size:12px;
  letter-spacing:.18em;
  text-shadow:0 2px 10px rgba(0,0,0,.55);
}
.hj-stage-word{
  display:inline-block;
  padding:5px 10px;
  border:1px solid rgba(234,204,126,.35);
  border-radius:999px;
  color:#e9cf91;
  background:rgba(58,5,8,.42);
  font-size:10px;
  letter-spacing:.2em;
  margin-bottom:10px;
}
.hj-vows-bg{
  position:relative;
  overflow:hidden;
}
.hj-vows-bg::before{
  content:"";
  position:absolute;
  inset:0;
  background:url("https://raw.githubusercontent.com/linyin8945/hejingshu/main/assets/scenes/vows-scroll.webp") center/cover no-repeat;
  opacity:.24;
  filter:saturate(.9);
  pointer-events:none;
}
.hj-vows-bg > *{position:relative}
.hj-keepsake-card{
  position:relative;
  overflow:hidden;
  min-height:190px;
  border-radius:18px;
  border:1px solid rgba(222,187,101,.3);
  background:#5b090e;
  margin-top:16px;
}
.hj-keepsake-card img{width:100%;height:190px;object-fit:cover;display:block}
.hj-keepsake-card::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,transparent 52%,rgba(46,3,6,.76))}
.hj-keepsake-title{position:absolute;left:16px;bottom:14px;z-index:2;color:#f2d994;font-size:15px;letter-spacing:.12em}
@keyframes hjPhotoBreath{
  from{transform:scale(1.015)}
  to{transform:scale(1.055)}
}


/* =========================================================
   v0.5 · 嘉礼重构 / 可触碰的婚礼电影
   ========================================================= */
.hj-v5-cover{
  height:100%;position:relative;overflow:hidden;background:#4a060a;
}
.hj-v5-cover::before{
  content:"";position:absolute;inset:0;
  background:
    linear-gradient(180deg,rgba(25,1,3,.20),rgba(25,1,3,.18) 42%,rgba(25,1,3,.78)),
    url("https://raw.githubusercontent.com/linyin8945/hejingshu/main/assets/scenes/marriage-book.webp") center/cover no-repeat;
  transform:scale(1.035);animation:hjPhotoBreath 11s ease-in-out infinite alternate;
}
.hj-v5-cover-content{
  position:absolute;inset:0;display:flex;flex-direction:column;justify-content:flex-end;
  align-items:center;padding:0 28px calc(72px + env(safe-area-inset-bottom));text-align:center;
}
.hj-v5-cover-seal{font-size:13px;letter-spacing:.5em;color:#f0d38c;margin-right:-.5em}
.hj-v5-cover-title{font-size:48px;letter-spacing:.25em;margin:12px -.25em 8px 0;color:#f3d685;
  text-shadow:0 8px 30px rgba(0,0,0,.45)}
.hj-v5-cover-sub{font-size:12px;letter-spacing:.24em;color:#eadab1;margin-bottom:28px}
.hj-v5-cover .hj-primary{min-width:180px;background:rgba(201,163,80,.94)}
.hj-v5-top{
  position:absolute;left:0;right:0;top:0;z-index:20;
  display:flex;justify-content:space-between;align-items:center;
  padding:12px 14px;background:linear-gradient(180deg,rgba(25,1,3,.62),transparent);
}
.hj-music-btn{width:38px;height:38px;border-radius:50%;border:1px solid rgba(237,209,139,.32);
  background:rgba(56,5,8,.32);color:#f0d995;font-size:16px}
.hj-film{
  height:100%;position:relative;overflow:hidden;background:#3a0407;color:#f4e7c5;
}
.hj-film-bg{position:absolute;inset:0;background-image:var(--hj-scene-image);background-size:cover;
  background-position:var(--hj-scene-pos,center);transition:transform 8s ease;transform:scale(1.025)}
.hj-film.enter .hj-film-bg{transform:scale(1.065)}
.hj-film-shade{position:absolute;inset:0;background:
  linear-gradient(180deg,rgba(20,1,3,.24),transparent 28%,transparent 55%,rgba(24,1,3,.78) 100%),
  linear-gradient(90deg,rgba(20,1,3,.14),transparent 30%,transparent 70%,rgba(20,1,3,.14))}
.hj-film-content{position:absolute;left:0;right:0;bottom:0;z-index:5;padding:24px 22px calc(26px + env(safe-area-inset-bottom))}
.hj-film-kicker{font-size:10px;letter-spacing:.42em;color:#e9cb83;margin-right:-.42em;margin-bottom:9px}
.hj-film-title{font-size:31px;letter-spacing:.12em;color:#f3d78d;text-shadow:0 3px 18px rgba(0,0,0,.42)}
.hj-film-line{font-size:14px;line-height:1.95;color:#f3e5c7;text-shadow:0 2px 12px rgba(0,0,0,.52);margin-top:10px;max-width:92%}
.hj-film-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:18px}
.hj-film-actions .hj-primary,.hj-film-actions .hj-secondary{padding:11px 18px}
.hj-caption{
  margin-top:13px;padding:0 2px;font-size:12px;line-height:1.8;color:#e7d4aa;
}
.hj-ritual-help{
  position:absolute;right:18px;top:70px;z-index:12;border:1px solid rgba(234,207,139,.36);
  background:rgba(56,5,8,.38);color:#efd894;border-radius:999px;padding:7px 10px;font-size:11px;
}
.hj-help-sheet{position:absolute;left:18px;right:18px;bottom:22px;z-index:30;padding:18px;border-radius:18px;
  border:1px solid rgba(234,207,139,.34);background:rgba(48,4,7,.94);backdrop-filter:blur(14px);
  box-shadow:0 18px 60px rgba(0,0,0,.38)}
.hj-help-sheet h3{margin:0 0 8px;color:#f1d48a;font-size:18px}
.hj-help-sheet p{margin:0;color:#eadbb9;font-size:12px;line-height:1.9}
.hj-touch-object{margin:22px auto 0;display:flex;align-items:center;justify-content:center;position:relative}
.hj-water-bowl{width:172px;height:64px;border-radius:50%;border:2px solid rgba(225,191,106,.75);
  background:radial-gradient(ellipse at center,rgba(186,218,224,.58),rgba(68,91,103,.44) 48%,rgba(80,27,22,.86) 53%,#a67b42 68%,#3f1513 72%);
  box-shadow:0 12px 30px rgba(0,0,0,.32),inset 0 0 20px rgba(255,255,255,.15);cursor:pointer}
.hj-water-bowl.ripple::after{content:"";position:absolute;width:92px;height:24px;border:1px solid rgba(235,249,250,.7);
  border-radius:50%;animation:hjRipple 1.2s ease-out}
@keyframes hjRipple{from{transform:scale(.25);opacity:1}to{transform:scale(1.7);opacity:0}}
.hj-food-tray{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;width:min(330px,88vw)}
.hj-food{border:1px solid rgba(229,197,114,.4);border-radius:14px;background:rgba(70,10,10,.58);
  padding:15px 8px;color:#efdba8;font-size:12px;min-height:72px}
.hj-food.selected{border-color:#f0d080;box-shadow:0 0 0 2px rgba(240,208,128,.12) inset}
.hj-fan-touch{width:210px;height:210px;border-radius:50%;border:3px solid rgba(221,190,110,.78);
  background:radial-gradient(circle at 50% 42%,#f5e7bd,#ddc78e 65%,#a98143);display:flex;
  align-items:center;justify-content:center;color:#8d6736;font-size:38px;transform:translateX(0) rotate(-4deg);
  transition:transform 1.1s cubic-bezier(.2,.8,.2,1),opacity .9s}
.hj-fan-touch.peek{transform:translateX(54px) rotate(8deg)}
.hj-fan-touch.open{transform:translateX(220px) rotate(14deg);opacity:.05}
.hj-hand-touch{width:116px;height:54px;border-radius:50px 50px 16px 50px;background:linear-gradient(180deg,#f0d2b8,#d6aa90);
  transform:rotate(-7deg);box-shadow:0 12px 30px rgba(0,0,0,.25);position:relative}
.hj-hand-touch::after{content:"";position:absolute;right:-30px;top:6px;width:58px;height:42px;border-radius:50%;
  background:linear-gradient(180deg,#f0d2b8,#d6aa90)}
.hj-cup-pair{display:flex;justify-content:center;gap:42px;margin-top:20px}
.hj-cup-btn{width:76px;height:82px;border-radius:9px 9px 32px 32px;border:2px solid #d6b15e;
  background:linear-gradient(180deg,#a11820,#6e0c12);color:#e6c56f;display:flex;align-items:center;justify-content:center}
.hj-cup-btn.lift{transform:translateY(-16px);transition:.7s}
.hj-thread-interact{width:min(330px,88vw);height:90px;position:relative;margin:18px auto 0}
.hj-thread-interact::before,.hj-thread-interact::after{content:"";position:absolute;top:42px;width:45%;height:2px;background:#c65044}
.hj-thread-interact::before{left:2%;transform:rotate(9deg)}.hj-thread-interact::after{right:2%;transform:rotate(-9deg)}
.hj-thread-knot-v5{position:absolute;left:50%;top:25px;transform:translateX(-50%);width:44px;height:44px;border-radius:50%;
  border:1px solid rgba(230,190,110,.65);display:flex;align-items:center;justify-content:center;color:#e2c377;background:#711016}
.hj-vow-book{
  position:absolute;inset:0;background:
    linear-gradient(180deg,rgba(50,4,7,.17),rgba(50,4,7,.32)),
    url("https://raw.githubusercontent.com/linyin8945/hejingshu/main/assets/scenes/marriage-book.webp") center/cover no-repeat;
}
.hj-vow-panel{position:absolute;left:18px;right:18px;bottom:22px;max-height:68%;overflow:auto;z-index:4;
  padding:18px;border-radius:20px;background:rgba(73,7,10,.70);border:1px solid rgba(236,205,128,.34);
  backdrop-filter:blur(11px)}
.hj-vow-write{font-size:13px;line-height:2;color:#f1dfb8;white-space:pre-wrap}
.hj-book-live{
  min-height:100%;padding:74px 26px 130px;position:relative;overflow:auto;
  background:
    linear-gradient(180deg,rgba(86,8,12,.14),rgba(86,8,12,.18)),
    url("https://raw.githubusercontent.com/linyin8945/hejingshu/main/assets/scenes/marriage-book.webp") center/cover fixed no-repeat;
}
.hj-book-paper{
  max-width:520px;margin:0 auto;padding:28px 22px 30px;background:rgba(121,15,21,.78);
  border:1px solid rgba(240,206,123,.55);box-shadow:0 20px 60px rgba(0,0,0,.26),inset 0 0 0 6px rgba(245,213,130,.05);
  backdrop-filter:blur(5px)
}
.hj-book-paper .names{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin:20px 0;text-align:center}
.hj-book-paper .name{font-size:24px;color:#f2d581}.hj-book-paper .role{font-size:10px;color:#d8bf8b;letter-spacing:.2em}
.hj-book-vow{padding:13px 0;border-top:1px solid rgba(239,205,127,.26);font-size:12px;line-height:1.9;color:#f0dfb8}
.hj-double-seals{display:flex;justify-content:center;gap:48px;margin:24px 0 8px}
.hj-person-seal{width:62px;height:62px;border:2px solid #d36b5d;color:#d97466;display:flex;align-items:center;justify-content:center;
  font-size:11px;line-height:1.25;transform:rotate(-5deg);opacity:.22;transition:.5s}
.hj-person-seal.on{opacity:1;box-shadow:0 0 0 3px rgba(211,107,93,.10) inset}
.hj-hold{width:88px;height:88px;border-radius:50%;border:1px solid rgba(235,203,124,.45);display:flex;align-items:center;justify-content:center;
  color:#efd58b;margin:16px auto 0;user-select:none;touch-action:none;position:relative}
.hj-hold::before{content:"";position:absolute;inset:7px;border-radius:50%;border:2px solid rgba(235,203,124,.2)}
.hj-hold.holding::before{animation:hjHold 1.4s linear forwards}
@keyframes hjHold{to{border-color:#efd07d;box-shadow:0 0 0 8px rgba(239,208,125,.12)}}
.hj-ai-line{margin-top:14px;font-size:13px;line-height:1.9;color:#f0dfbb}
.hj-slow-reveal{animation:hjFade 1.2s ease both}

.hj-gen-loading{
  position:relative !important;
  pointer-events:none !important;
  opacity:.88 !important;
  overflow:hidden !important;
}
.hj-gen-loading::before{
  content:"";
  display:inline-block;
  width:13px;height:13px;
  margin-right:8px;
  border:1.8px solid currentColor;
  border-right-color:transparent;
  border-radius:50%;
  vertical-align:-2px;
  animation:hjSpin .75s linear infinite;
}
.hj-gen-loading::after{
  content:"";
  position:absolute;
  inset:0;
  background:linear-gradient(110deg,transparent 20%,rgba(255,255,255,.13) 45%,transparent 70%);
  transform:translateX(-120%);
  animation:hjShimmer 1.25s ease-in-out infinite;
}
@keyframes hjSpin{to{transform:rotate(360deg)}}
@keyframes hjShimmer{to{transform:translateX(120%)}}
.hj-help-close{
  min-width:108px;
}

.hj-contract-wrap{
  min-height:100%;
  padding:74px 18px 110px;
  background:
    linear-gradient(180deg,rgba(57,4,7,.50),rgba(57,4,7,.76)),
    url("https://raw.githubusercontent.com/linyin8945/hejingshu/main/assets/scenes/marriage-book.webp") center/cover fixed no-repeat;
}
.hj-contract-scroll{
  max-width:520px;margin:0 auto;
  position:relative;padding:28px 20px 24px;
  border:1px solid rgba(236,202,117,.58);
  background:linear-gradient(180deg,rgba(128,15,21,.88),rgba(93,8,13,.90));
  box-shadow:0 22px 70px rgba(0,0,0,.30),inset 0 0 0 6px rgba(241,209,128,.05);
}
.hj-contract-scroll::before,.hj-contract-scroll::after{
  content:"";position:absolute;left:16px;right:16px;height:8px;border:1px solid rgba(234,199,111,.42);
  background:linear-gradient(90deg,#5b0b0e,#b47e34,#5b0b0e)
}
.hj-contract-scroll::before{top:-12px}.hj-contract-scroll::after{bottom:-12px}
.hj-contract-emblem{
  width:62px;height:62px;border:1px solid rgba(237,203,118,.7);border-radius:50%;
  display:flex;align-items:center;justify-content:center;margin:0 auto 12px;
  color:#efd07d;font-size:28px;box-shadow:inset 0 0 0 5px rgba(237,203,118,.06)
}
.hj-contract-title{text-align:center;color:#f0d286;font-size:28px;letter-spacing:.2em;margin-right:-.2em}
.hj-contract-copy{text-align:center;color:#dcc79c;font-size:11px;line-height:1.9;margin:8px auto 18px;max-width:310px}
.hj-contract-field{margin:13px 0}
.hj-contract-field label{display:block;font-size:10px;letter-spacing:.22em;color:#d9bd7e;margin:0 0 6px}
.hj-contract-field .hj-input{
  background:rgba(63,4,8,.34);border-color:rgba(234,199,111,.32);
  text-align:center;font-size:18px;color:#f4dfaa
}
.hj-contract-empty{
  margin:18px 0 0;padding:13px 10px;border-top:1px solid rgba(235,200,115,.22);
  border-bottom:1px solid rgba(235,200,115,.22);
  display:grid;grid-template-columns:1fr 1fr;gap:12px;text-align:center
}
.hj-contract-empty span{font-size:10px;letter-spacing:.16em;color:#ad9770}
.hj-scene-story{
  position:absolute;left:24px;right:24px;top:52%;z-index:8;
  padding:12px 0 10px;color:#fff4df;font-size:13px;line-height:1.9;
  text-shadow:0 2px 10px rgba(0,0,0,.88);
  border-top:1px solid rgba(240,214,157,.22);
  border-bottom:1px solid rgba(240,214,157,.14);
  background:linear-gradient(90deg,transparent,rgba(43,2,5,.24) 18%,rgba(43,2,5,.32) 82%,transparent)
}
.hj-scene-story b{color:#f2d58d;font-weight:500}
.hj-scene-story .hj-story-action{color:#ead19a;font-size:10px;letter-spacing:.25em;margin-bottom:5px}
.hj-scene-story.loading{opacity:.72}
.hj-scene-story.loading::before{
  content:"";display:inline-block;width:12px;height:12px;margin-right:7px;
  border:1.6px solid #efd38b;border-right-color:transparent;border-radius:50%;
  animation:hjSpin .8s linear infinite;vertical-align:-2px
}
.hj-inline-status{
  margin-top:10px;font-size:11px;color:#d8c39a;min-height:18px
}
.hj-queshan-note{
  position:absolute;left:24px;right:24px;top:36%;z-index:8;
  text-align:center;color:#f4e5c4;font-size:12px;line-height:1.85;
  text-shadow:0 2px 12px rgba(0,0,0,.9)
}
.hj-veil-soft{
  position:absolute;inset:0;z-index:6;pointer-events:none;
  background:linear-gradient(180deg,rgba(157,16,25,.38),rgba(115,8,14,.12) 45%,transparent 72%);
  transition:opacity 1.2s ease
}
.hj-veil-soft.open{opacity:0}

/* v0.7 · 嘉礼珍藏：统一剧情卡、可触碰礼器与婚礼卷册 */
.hj-scene-story{
  left:18px;right:18px;padding:15px 16px 14px;border-radius:16px;
  border:1px solid rgba(240,214,157,.27);
  background:linear-gradient(145deg,rgba(58,8,12,.81),rgba(34,4,7,.70));
  box-shadow:0 14px 36px rgba(0,0,0,.23),inset 0 1px 0 rgba(255,236,182,.08);
  backdrop-filter:blur(13px);-webkit-backdrop-filter:blur(13px);
  max-height:22vh;overflow:auto;animation:hjStoryAppear .42s ease both;
}
.hj-scene-story::before{content:"";position:absolute;top:0;left:17px;width:38px;height:1px;background:linear-gradient(90deg,#e9cc83,transparent)}
.hj-story-action{display:flex;align-items:center;gap:8px}
.hj-story-action::before{content:"";width:5px;height:5px;border:1px solid #e6c67a;transform:rotate(45deg)}
@keyframes hjStoryAppear{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
.hj-touch-trigger{appearance:none;-webkit-appearance:none;cursor:pointer;touch-action:manipulation}
.hj-touch-trigger:focus-visible{outline:2px solid rgba(242,210,131,.8);outline-offset:5px}
.hj-water-bowl.hj-gen-loading,.hj-thread-knot-v5.hj-gen-loading,.hj-cup-btn.hj-gen-loading{font-size:0}
.hj-bow-emblem{position:absolute;left:50%;top:35%;z-index:7;transform:translateX(-50%);width:104px;height:104px;border-radius:50%;border:1px solid rgba(236,205,135,.72);background:radial-gradient(circle,rgba(109,17,23,.86),rgba(62,7,11,.76));color:#f2d797;font-size:27px;letter-spacing:.13em;box-shadow:0 0 0 8px rgba(232,200,120,.07),0 12px 34px rgba(0,0,0,.3)}
.hj-bow-emblem.done{box-shadow:0 0 0 8px rgba(232,200,120,.1),0 0 32px rgba(219,180,93,.23)}
.hj-archive-section{margin-top:21px}.hj-archive-heading{display:flex;align-items:center;justify-content:space-between;margin-bottom:11px;color:#ead193;font-size:14px;letter-spacing:.12em}.hj-archive-hint{font-size:10px;color:#ac9772;letter-spacing:0}
.hj-memory-entry{width:100%;margin:0 0 10px;padding:13px 14px;text-align:left;border:1px solid rgba(222,188,111,.25);border-radius:13px;background:linear-gradient(135deg,rgba(105,17,22,.65),rgba(59,8,12,.77));color:#f1dfbe}
.hj-memory-entry-title{display:flex;justify-content:space-between;gap:8px;font-size:12px;color:#efdaa6}.hj-memory-entry-date{font-size:10px;color:#bca77e}.hj-memory-entry-copy{margin-top:7px;font-size:12px;line-height:1.9;white-space:pre-wrap;color:#e8d8b8}
.hj-letter-panel{position:absolute;left:19px;right:19px;top:23%;z-index:8;padding:17px 16px;border:1px solid rgba(236,205,133,.34);border-radius:17px;background:linear-gradient(150deg,rgba(80,10,15,.88),rgba(46,5,9,.77));backdrop-filter:blur(13px);-webkit-backdrop-filter:blur(13px);color:#f0dfc1;font-size:13px;line-height:2;box-shadow:0 15px 40px rgba(0,0,0,.2)}
.hj-vow-reaction{margin-top:14px;padding:12px 13px;border-left:2px solid rgba(236,201,123,.68);background:rgba(58,6,9,.4);border-radius:0 10px 10px 0;color:#f0debd;font-size:12px;line-height:1.9}
.hj-film-actions button:disabled{cursor:wait}
@media(max-height:740px){.hj-scene-story{max-height:18vh;padding:11px 13px;font-size:12px}.hj-film-content{padding-bottom:calc(18px + env(safe-area-inset-bottom))}.hj-film-line{font-size:13px}.hj-film-actions{margin-top:12px}}




/* =========================================================
   v0.8 · 完整婚礼体验重构
   现代世界 · 中式婚礼 / 双视角 / 群像 / 自定义互动 / 落幕
   ========================================================= */

.hj-story-cinema{
  position:absolute;
  left:20px;right:20px;
  top:48%;
  z-index:4;
  max-height:17vh;
  overflow:auto;
  -webkit-overflow-scrolling:touch;
  touch-action:pan-y;
  padding:12px 4px 10px;
  color:#fff0d4;
  font-size:13px;
  line-height:1.95;
  text-shadow:0 2px 10px rgba(0,0,0,.86);
  background:
    linear-gradient(90deg,transparent,rgba(42,3,6,.17) 12%,rgba(42,3,6,.30) 50%,rgba(42,3,6,.17) 88%,transparent);
  border-top:1px solid rgba(238,207,139,.20);
  border-bottom:1px solid rgba(238,207,139,.11);
  pointer-events:auto;
  animation:hjStoryAppear .38s ease both;
}
.hj-story-cinema .hj-story-action{
  color:#e6cb8f;
  font-size:10px;
  letter-spacing:.24em;
  margin-bottom:5px;
}
.hj-film-content{z-index:7}
.hj-film-actions{position:relative;z-index:8}
.hj-film-actions .hj-custom-action{border-style:dashed;opacity:.92}

.hj-custom-sheet{
  position:absolute;
  left:16px;right:16px;bottom:18px;
  z-index:40;
  padding:18px;
  border-radius:20px;
  border:1px solid rgba(236,205,128,.38);
  background:linear-gradient(165deg,rgba(70,6,10,.97),rgba(43,3,6,.97));
  box-shadow:0 20px 70px rgba(0,0,0,.42);
  backdrop-filter:blur(16px);
  -webkit-backdrop-filter:blur(16px);
}
.hj-custom-sheet-title{font-size:18px;color:#f0d28b;letter-spacing:.12em}
.hj-custom-sheet-copy{margin:7px 0 12px;color:#d9c7a5;font-size:11px;line-height:1.8}
.hj-custom-sheet textarea{
  width:100%;
  min-height:92px;
  resize:none;
  border:1px solid rgba(230,198,119,.34);
  border-radius:14px;
  background:rgba(41,3,6,.48);
  color:#f4e6c6;
  padding:12px 13px;
  outline:none;
  line-height:1.7;
}
.hj-custom-sheet-actions{display:flex;gap:10px;margin-top:12px}
.hj-custom-sheet-actions button{flex:1}

.hj-memory-toggle{
  margin:18px 0 2px;
  padding:14px 15px;
  border:1px solid rgba(227,194,112,.30);
  border-radius:16px;
  background:linear-gradient(150deg,rgba(92,13,18,.50),rgba(53,5,8,.42));
}
.hj-memory-toggle-row{display:flex;align-items:center;justify-content:space-between;gap:14px}
.hj-memory-toggle-title{font-size:13px;color:#efd9a5}
.hj-memory-toggle-copy{font-size:10px;line-height:1.75;color:#bfae8d;margin-top:5px}
.hj-switch{
  width:50px;height:28px;border-radius:999px;border:1px solid rgba(231,199,117,.38);
  background:rgba(42,4,7,.62);padding:3px;flex:0 0 auto;
  transition:.25s;
}
.hj-switch i{
  display:block;width:20px;height:20px;border-radius:50%;
  background:#b89d67;transition:.25s;
}
.hj-switch.on{background:linear-gradient(90deg,#a06d2b,#d0aa58)}
.hj-switch.on i{transform:translateX(21px);background:#fff0c1}

.hj-prelude-narration{
  position:absolute;
  left:22px;right:22px;top:19%;
  z-index:6;
  padding:12px 0;
  color:#f4e6c7;
  font-size:13px;
  line-height:2;
  text-shadow:0 2px 12px rgba(0,0,0,.78);
}
.hj-prelude-tabs{
  display:flex;gap:8px;margin-bottom:12px;
}
.hj-prelude-tabs button{
  flex:1;border:1px solid rgba(231,198,118,.32);border-radius:999px;
  background:rgba(70,6,9,.34);color:#e8d1a1;padding:8px 10px;
}
.hj-prelude-tabs button.on{background:rgba(201,161,73,.18);border-color:#d8b765;color:#f1d58d}

.hj-transition-mark{
  display:inline-flex;
  align-items:center;gap:7px;
  font-size:10px;letter-spacing:.24em;color:#e6cb86;
}
.hj-transition-mark::before,.hj-transition-mark::after{
  content:"";width:26px;height:1px;background:linear-gradient(90deg,transparent,#d4b264)
}

.hj-finale{
  height:100%;
  overflow-y:auto;
  -webkit-overflow-scrolling:touch;
  background:
    radial-gradient(circle at 50% 12%,rgba(255,218,146,.14),transparent 24%),
    linear-gradient(180deg,#3f080a 0%,#5b0b10 43%,#251012 100%);
  color:#f4e5c2;
  position:relative;
}
.hj-finale::before{
  content:"";
  position:absolute;inset:0;
  background:
    linear-gradient(180deg,rgba(21,4,5,.16),rgba(21,4,5,.74)),
    url("https://raw.githubusercontent.com/linyin8945/hejingshu/main/assets/scenes/ceremony-complete.webp") center/cover no-repeat;
  opacity:.46;
  filter:saturate(.82);
}
.hj-finale-inner{
  position:relative;z-index:2;
  min-height:100%;
  padding:94px 28px calc(52px + env(safe-area-inset-bottom));
  display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;
}
.hj-finale-kicker{font-size:11px;letter-spacing:.38em;color:#d9bd79;margin-right:-.38em}
.hj-finale-title{font-size:46px;letter-spacing:.28em;margin:16px -.28em 10px 0;color:#f0d284}
.hj-finale-names{font-size:13px;color:#e4cfa3;letter-spacing:.14em}
.hj-finale-rule{width:108px;height:1px;background:linear-gradient(90deg,transparent,#d7b86c,transparent);margin:24px 0}
.hj-finale-letter{
  max-width:520px;
  padding:22px 18px;
  border-top:1px solid rgba(231,199,117,.22);
  border-bottom:1px solid rgba(231,199,117,.18);
  font-size:14px;
  line-height:2.15;
  text-align:left;
  color:#f0dfbc;
  text-shadow:0 2px 10px rgba(0,0,0,.34);
}
.hj-finale-memory{margin-top:18px;font-size:10px;letter-spacing:.14em;color:#c6b38d}
.hj-finale-actions{display:flex;gap:10px;margin-top:24px;flex-wrap:wrap;justify-content:center}
.hj-finale-actions button{min-width:150px}

.hj-vow-book{
  background:
    linear-gradient(180deg,rgba(44,4,7,.17),rgba(44,4,7,.48)),
    url("https://raw.githubusercontent.com/linyin8945/hejingshu/main/assets/scenes/vows-scroll.webp") center/cover no-repeat !important;
}


/* =========================================================
   v0.8.1 · 沉浸层级修复
   剧情不再叠卡 / 拜堂三礼 / 沃盥下移 / 婚誓滚动与背景修复
   ========================================================= */

/* 取消会遮挡画面和按钮的剧情浮卡；剧情统一回到页面原有正文区域 */
.hj-story-cinema{display:none !important}
.hj-prelude-narration{display:none !important}

/* 底部内容区本身可滚动，避免剧情和按钮互相覆盖 */
.hj-film-content{
  max-height:53% !important;
  overflow-y:auto !important;
  overflow-x:hidden !important;
  -webkit-overflow-scrolling:touch !important;
  overscroll-behavior-y:contain;
  padding-top:18px !important;
}
.hj-film-line{
  max-height:20vh;
  overflow-y:auto;
  -webkit-overflow-scrolling:touch;
  padding-right:2px;
}
.hj-film-actions{padding-bottom:2px}

/* 大婚前夜：视角与互动统一成规整两列，推进按钮独占一行 */
.hj-pre-actions{
  width:100%;
  display:grid;
  grid-template-columns:repeat(2,minmax(0,1fr));
  gap:10px;
}
.hj-pre-actions > button{
  width:100%;
  min-width:0;
  padding-left:12px;
  padding-right:12px;
}
.hj-pre-actions > .hj-pre-primary{
  grid-column:1 / -1;
}
.hj-pre-actions > .hj-custom-action{
  grid-column:auto;
}

/* 自定义输入仍是临时层，提交后立即收起 */
.hj-custom-sheet{
  max-height:58%;
  overflow-y:auto;
  -webkit-overflow-scrolling:touch;
}

/* 拜堂不再出现大圆按钮 */
.hj-bow-emblem{display:none !important}
.hj-bow-progress{
  display:flex;
  align-items:center;
  gap:8px;
  margin:12px 0 4px;
}
.hj-bow-progress span{
  flex:1;height:3px;border-radius:99px;
  background:rgba(224,193,116,.16);
}
.hj-bow-progress span.on{
  background:linear-gradient(90deg,#a97732,#e1c474);
}
.hj-bow-current{
  margin:9px 0 0;
  font-size:11px;
  letter-spacing:.18em;
  color:#dcc58d;
}

/* 沃盥礼器整体下移，更像摆在案前，而不是悬在画面中央 */
.hj-wash-object{
  position:absolute;
  left:50%;
  top:46%;
  z-index:6;
  transform:translate(-50%,-50%);
}
.hj-wash-object .hj-water-bowl{
  transform:scale(.92);
  transform-origin:center;
}

/* 婚誓页：强制换成另一张卷轴/婚书素材，并建立真正可滚动容器 */
.hj-vow-book{
  position:absolute !important;
  inset:0 !important;
  background:
    linear-gradient(180deg,rgba(43,4,7,.18),rgba(43,4,7,.50)),
    url("https://raw.githubusercontent.com/linyin8945/hejingshu/main/assets/scenes/officiant-scroll.webp") center/cover no-repeat !important;
}
.hj-vow-panel{
  top:92px !important;
  bottom:18px !important;
  max-height:none !important;
  height:auto !important;
  overflow-y:auto !important;
  overflow-x:hidden !important;
  -webkit-overflow-scrolling:touch !important;
  touch-action:pan-y !important;
  overscroll-behavior-y:contain;
  padding-bottom:36px !important;
}
.hj-vow-panel .hj-textarea{min-height:128px}

/* 双印婚书：从顶部到最下方按钮都能完整滚动 */
.hj-book-live{
  position:absolute !important;
  inset:0 !important;
  height:auto !important;
  min-height:100% !important;
  overflow-y:auto !important;
  overflow-x:hidden !important;
  -webkit-overflow-scrolling:touch !important;
  touch-action:pan-y !important;
  overscroll-behavior-y:contain;
  padding-bottom:calc(180px + env(safe-area-inset-bottom)) !important;
}
.hj-book-paper{
  margin-top:58px !important;
  margin-bottom:72px !important;
}
.hj-book-live .hj-v5-top{
  position:fixed !important;
  left:0;right:0;top:0;
}

/* 选人页避免“产品介绍感” */
.hj-choose-poem{
  margin:4px 0 18px;
  color:#d8c59d;
  font-size:12px;
  line-height:1.9;
}
.hj-memory-toggle-copy{line-height:1.6}


/* v0.8.2 · 嘉礼流程精修 */
.hj-film-line{white-space:pre-line;max-height:22vh !important}
.hj-door-questions{display:grid;grid-template-columns:1fr;gap:10px;width:100%}
.hj-door-questions .hj-primary,.hj-door-questions .hj-secondary{width:100%}
.hj-door-custom-sheet .hj-custom-sheet-copy{margin-bottom:10px}
.hj-wash-object,.hj-cup-pair,.hj-thread-interact,.hj-thread-knot-v5{display:none !important}
.hj-finale-music-note{margin-top:10px;font-size:10px;letter-spacing:.16em;color:#baa77e;opacity:.78}


/* v0.8.3 · 存档 / 同牢恢复 / 出阁送轿 */
.hj-save-btn{
  width:38px;height:38px;border-radius:50%;
  border:1px solid rgba(237,209,139,.30);
  background:rgba(56,5,8,.30);
  color:#efd99b;
  font-size:12px;
  margin-right:5px;
}
.hj-tonglao-foods{
  display:grid;
  grid-template-columns:repeat(3,minmax(0,1fr));
  gap:9px;
  width:100%;
}
.hj-tonglao-foods button{
  min-width:0 !important;
  width:100% !important;
  padding-left:8px !important;
  padding-right:8px !important;
}
.hj-save-hint{
  font-size:10px;
  color:#cdb887;
  margin-top:9px;
  letter-spacing:.12em;
}


/* v0.8.5 · 真正的存档面板 */
.hj-save-sheet{
  position:absolute;left:18px;right:18px;top:50%;transform:translateY(-50%);
  z-index:80;padding:22px 18px;border-radius:22px;
  background:linear-gradient(180deg,rgba(82,8,12,.97),rgba(52,5,8,.98));
  border:1px solid rgba(224,190,105,.58);box-shadow:0 24px 70px rgba(0,0,0,.42);
  backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);
}
.hj-save-sheet-title{font-size:22px;letter-spacing:.18em;color:#efd488;text-align:center;margin-bottom:16px}
.hj-save-row{padding:13px 14px;border:1px solid rgba(214,181,106,.25);border-radius:14px;background:rgba(255,255,255,.035);margin-bottom:12px}
.hj-save-label{font-size:10px;letter-spacing:.18em;color:#bfa978;margin-bottom:5px}
.hj-save-value{font-size:14px;line-height:1.7;color:#f1e2bd}
.hj-save-actions{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:14px}
.hj-save-actions .hj-primary,.hj-save-actions .hj-secondary{width:100%;padding-left:10px;padding-right:10px}

.hj-film-content.hj-continuous-content{
  max-height:64% !important; overflow-y:auto !important; overflow-x:hidden !important;
  -webkit-overflow-scrolling:touch !important; touch-action:pan-y !important;
  overscroll-behavior-y:contain; scroll-behavior:smooth; padding-top:18px !important;
}
.hj-film-content.hj-continuous-content .hj-film-line{max-height:none !important;overflow:visible !important}
.hj-story-flow{display:flex;flex-direction:column;gap:15px}
.hj-story-flow-intro{color:#f2e2bf;line-height:2}
.hj-story-turn{border-top:1px solid rgba(232,202,132,.20);padding-top:13px;animation:hjStoryAppear .28s ease both}
.hj-story-turn-tag{margin-bottom:6px;color:#dbc17e;font-size:10px;letter-spacing:.18em}
.hj-story-turn-text{color:#f4e7ca;line-height:2;white-space:pre-line}
.hj-story-flow-end{height:2px}
.hj-continuous-actions{
  position:sticky;bottom:-2px;z-index:5;padding-top:12px;padding-bottom:2px;
  background:linear-gradient(180deg,rgba(55,5,8,0),rgba(55,5,8,.78) 28%,rgba(55,5,8,.94));
  backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px)
}
/* =========================================================
   v1.0.0 · 婚礼存档册 / 嘉礼录
   ========================================================= */

.hj-save-sheet{
  max-height:min(78vh,720px) !important;
  overflow-y:auto !important;
  -webkit-overflow-scrolling:touch;
  padding-bottom:calc(18px + env(safe-area-inset-bottom));
}
.hj-save-title-note{
  margin:-3px 0 16px;
  text-align:center;
  color:#cdb887;
  font-size:11px;
  letter-spacing:.13em;
}
.hj-save-create{
  border:1px solid rgba(224,190,111,.28);
  border-radius:18px;
  padding:14px;
  margin:14px 0;
  background:linear-gradient(145deg,rgba(124,16,22,.56),rgba(52,5,9,.62));
}
.hj-save-name-input{
  width:100%;
  box-sizing:border-box;
  border:1px solid rgba(231,203,130,.34);
  border-radius:13px;
  background:rgba(64,6,10,.48);
  color:#f5e6c6;
  outline:none;
  padding:12px 13px;
  font:inherit;
  font-size:14px;
}
.hj-save-name-input::placeholder{color:rgba(244,229,199,.45)}
.hj-slot-list{display:flex;flex-direction:column;gap:11px;margin-top:13px}
.hj-slot{
  border:1px solid rgba(221,190,112,.23);
  border-radius:17px;
  padding:13px;
  background:linear-gradient(145deg,rgba(111,13,18,.50),rgba(48,4,8,.66));
  box-shadow:inset 0 0 0 1px rgba(255,231,173,.025);
}
.hj-slot-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}
.hj-slot-name{font-size:17px;color:#f1d896;line-height:1.35}
.hj-slot-stage{
  flex:0 0 auto;
  border:1px solid rgba(227,196,118,.25);
  border-radius:999px;
  padding:5px 9px;
  font-size:9px;
  letter-spacing:.10em;
  color:#d9c493;
}
.hj-slot-meta{margin-top:7px;font-size:11px;line-height:1.75;color:#cdbb94}
.hj-slot-preview{
  margin-top:8px;
  padding-top:8px;
  border-top:1px solid rgba(230,198,120,.14);
  color:#e7d9bb;
  font-size:12px;
  line-height:1.75;
  display:-webkit-box;
  -webkit-line-clamp:2;
  -webkit-box-orient:vertical;
  overflow:hidden;
}
.hj-slot-actions{display:grid;grid-template-columns:1.25fr 1fr .72fr;gap:8px;margin-top:11px}
.hj-slot-actions button{min-width:0 !important;padding-left:8px !important;padding-right:8px !important;font-size:12px !important}
.hj-slot-empty{
  padding:20px 14px;
  text-align:center;
  color:#bda97f;
  line-height:1.9;
  border:1px dashed rgba(223,190,109,.22);
  border-radius:16px;
}

/* 嘉礼录入口 */
.hj-record-entry{
  margin-top:12px;
  width:100%;
  border:1px solid rgba(235,203,126,.30);
  border-radius:18px;
  padding:15px 17px;
  text-align:left;
  background:
    linear-gradient(130deg,rgba(139,19,24,.55),rgba(58,6,10,.72)),
    radial-gradient(circle at 82% 10%,rgba(225,188,99,.16),transparent 36%);
  color:#f0d799;
  box-shadow:0 14px 32px rgba(31,0,3,.18);
}
.hj-record-entry-title{font-size:19px;letter-spacing:.15em}
.hj-record-entry-sub{margin-top:7px;font-size:11px;color:#d1bc8c;letter-spacing:.08em}

/* 嘉礼录总页 */
.hj-record-page{
  height:100%;
  overflow-y:auto;
  -webkit-overflow-scrolling:touch;
  padding:76px 22px calc(32px + env(safe-area-inset-bottom));
  box-sizing:border-box;
  background:
    radial-gradient(circle at 50% -10%,rgba(195,54,55,.25),transparent 36%),
    linear-gradient(180deg,#5b080d 0%,#7c1017 42%,#4b0509 100%);
}
.hj-record-hero{text-align:center;padding:18px 4px 22px}
.hj-record-seal{
  width:56px;height:56px;border:1px solid rgba(237,205,126,.42);
  border-radius:50%;margin:0 auto 13px;display:flex;align-items:center;justify-content:center;
  color:#ecd38e;font-size:25px;box-shadow:0 0 0 5px rgba(219,179,84,.055);
}
.hj-record-title{font-size:31px;color:#f0d991;letter-spacing:.22em;margin-left:.22em}
.hj-record-sub{margin-top:9px;color:#cfb985;font-size:11px;letter-spacing:.15em}
.hj-record-count{margin-top:6px;color:#ae9972;font-size:10px}
.hj-record-cards{display:flex;flex-direction:column;gap:14px}
.hj-record-card{
  width:100%;text-align:left;border:1px solid rgba(232,200,119,.27);
  border-radius:20px;padding:18px 16px;
  color:#f2dfb5;
  background:
    linear-gradient(135deg,rgba(129,17,22,.76),rgba(63,5,9,.86)),
    radial-gradient(circle at 90% 8%,rgba(237,203,119,.12),transparent 34%);
  box-shadow:0 14px 28px rgba(28,0,3,.16);
}
.hj-record-card-top{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}
.hj-record-names{font-size:20px;color:#efd794}
.hj-record-status{font-size:9px;letter-spacing:.12em;color:#d1bb84;border:1px solid rgba(228,195,115,.22);border-radius:999px;padding:5px 8px}
.hj-record-date{margin-top:7px;color:#cbb78d;font-size:11px}
.hj-record-progress{margin-top:12px;padding-top:11px;border-top:1px solid rgba(230,199,120,.14);font-size:12px;line-height:1.8;color:#eadcc0}
.hj-record-open{margin-top:12px;color:#e2c675;font-size:11px;letter-spacing:.10em}

/* 嘉礼长卷 */
.hj-scroll-page{
  height:100%;overflow-y:auto;-webkit-overflow-scrolling:touch;
  padding:76px 18px calc(40px + env(safe-area-inset-bottom));
  box-sizing:border-box;
  background:linear-gradient(180deg,#53070b,#7b1016 28%,#59070c);
}
.hj-scroll-cover{
  border:1px solid rgba(232,199,117,.30);border-radius:22px;padding:24px 18px;text-align:center;
  background:linear-gradient(145deg,rgba(129,17,23,.80),rgba(68,5,10,.86));
  box-shadow:0 16px 34px rgba(31,0,3,.18);
}
.hj-scroll-kicker{font-size:10px;letter-spacing:.28em;color:#c9ad70}
.hj-scroll-names{font-size:27px;color:#f0d58c;margin-top:13px;letter-spacing:.10em}
.hj-scroll-date{margin-top:10px;color:#cdb98c;font-size:11px}
.hj-scroll-line{
  width:1px;height:30px;background:linear-gradient(#d3b468,rgba(211,180,104,.18));margin:0 auto;
}
.hj-scroll-section{
  position:relative;border:1px solid rgba(226,194,113,.20);border-radius:18px;padding:15px 15px 16px 18px;
  margin-bottom:12px;background:rgba(72,6,10,.48);
}
.hj-scroll-section::before{
  content:"";position:absolute;left:-5px;top:20px;width:9px;height:9px;border-radius:50%;
  background:#cfae61;box-shadow:0 0 0 5px rgba(207,174,97,.08);
}
.hj-scroll-section-title{color:#efd48c;font-size:17px;letter-spacing:.12em}
.hj-scroll-section-copy{margin-top:9px;color:#eadcc0;white-space:pre-line;line-height:1.95;font-size:13px}
.hj-scroll-section-note{margin-top:7px;color:#bba578;font-size:10px;letter-spacing:.08em}
.hj-scroll-empty{text-align:center;padding:32px 15px;color:#c4ae80;line-height:2}

/* 存档改名小层 */
.hj-rename-sheet{
  position:absolute;z-index:95;left:18px;right:18px;bottom:calc(18px + env(safe-area-inset-bottom));
  border:1px solid rgba(231,199,119,.32);border-radius:20px;padding:16px;
  background:linear-gradient(160deg,rgba(102,10,15,.98),rgba(46,3,7,.98));
  box-shadow:0 22px 60px rgba(20,0,2,.45);
}
.hj-rename-title{text-align:center;color:#efd58d;font-size:18px;letter-spacing:.14em;margin-bottom:12px}
</style>`;
  }

  window.RochePlugin.register({
    id: PLUGIN_ID,
    name: "合卺书",
    version: VERSION,
    apps: [{
      id: APP_ID,
      name: "合卺书",
      icon: "favorite",
      iconImage: "",
      async mount(container, roche) {
        const state = {
          page: "home",
          user: null,
          users: [],
          chars: [],
          selectedUser: null,
          selectedChar: null,
          archive: null,
          archives: [],
          loading: false
        };

        const storage = roche.storage;
        const root = document.createElement("div");
        root.className = "roche-plugin-hejingshu";
        root.innerHTML = buildStyles() + `
          <div class="hj-shell">
            <div class="hj-paper-noise"></div>
            <div class="hj-border"></div>
            <div id="hj-view" style="height:100%"></div>
            <div id="hj-toast" class="hj-toast"></div>
          </div>`;
        container.replaceChildren(root);

        const view = root.querySelector("#hj-view");
        const toastEl = root.querySelector("#hj-toast");

        let toastTimer = null;
        function toast(msg) {
          toastEl.textContent = msg;
          toastEl.classList.add("show");
          clearTimeout(toastTimer);
          toastTimer = setTimeout(() => toastEl.classList.remove("show"), 1600);
          try { roche.ui.toast(msg); } catch (_) {}
        }


        const music = {
          audio: null,
          current: "",
          muted: false,
          targetVolume: .46,
          fadeTimer: null,
          ensure() {
            if (!this.audio) {
              this.audio = new Audio();
              this.audio.preload = "auto";
              this.audio.loop = true;
              this.audio.volume = 0;
              this.audio.playsInline = true;
            }
            return this.audio;
          },
          async play(key, volume=.46, restart=false) {
            const url = WEDDING_AUDIO[key];
            if (!url || this.muted) return;
            const a = this.ensure();
            this.targetVolume = volume;
            if (this.current === key && !restart) {
              if (a.paused) { try { await a.play(); } catch(_){} }
              return this.fadeTo(volume, 900);
            }
            await this.fadeTo(0, 600);
            this.current = key;
            a.src = url;
            a.currentTime = 0;
            try { await a.play(); } catch(_) {}
            this.fadeTo(volume, 1500);
          },
          fadeTo(v, ms=800) {
            const a = this.ensure();
            clearInterval(this.fadeTimer);
            const from = a.volume, start = performance.now();
            this.fadeTimer = setInterval(()=>{
              const p = Math.min(1,(performance.now()-start)/ms);
              a.volume = Math.max(0, Math.min(1, from + (v-from)*p));
              if (p>=1) clearInterval(this.fadeTimer);
            },40);
          },
          duck(on=true) { this.fadeTo(on ? .15 : this.targetVolume, on ? 450 : 900); },
          toggle() {
            this.muted = !this.muted;
            const a = this.ensure();
            if (this.muted) { a.pause(); a.volume=0; }
            else if (this.current) { a.play().catch(()=>{}); this.fadeTo(this.targetVolume,700); }
            updateMusicButtons();
          },
          stop() {
            clearInterval(this.fadeTimer);
            if (this.audio) { this.audio.pause(); this.audio.src=""; }
            this.current="";
          }
        };

        function updateMusicButtons() {
          root.querySelectorAll("[data-action='music-toggle']").forEach(b=>{
            b.textContent = music.muted ? "♩" : "♫";
            b.setAttribute("aria-label", music.muted ? "开启音乐" : "关闭音乐");
          });
        }

        function musicTop(title, back="home") {
          return `<div class="hj-v5-top">
            <button class="hj-iconbtn" data-action="back" data-target="${esc(back)}">‹</button>
            <div class="hj-top-title">${esc(title)}</div>
            <div>${state.archive?.id?`<button class="hj-save-btn" data-action="open-save-v85" aria-label="打开婚礼存档">存</button>`:""}<button class="hj-music-btn" data-action="music-toggle">${music.muted?"♩":"♫"}</button>
            <button class="hj-iconbtn" data-action="close">×</button></div>
          </div>`;
        }

        function filmShell({asset,title,kicker="",line="",actions="",help="",back="home",position="center",extra=""}) {
          return `<div class="hj-film enter" ${sceneStyle(asset,position)}>
            <div class="hj-film-bg"></div><div class="hj-film-shade"></div>
            ${musicTop(title,back)}
            ${help ? `<button class="hj-ritual-help" data-action="show-help" data-title="${esc(title)}" data-help="${esc(help)}">礼？</button>`:""}
            ${extra}
            <div class="hj-film-content">
              ${kicker?`<div class="hj-film-kicker">${esc(kicker)}</div>`:""}
              <div class="hj-film-title">${esc(title)}</div>
              ${line?`<div class="hj-film-line">${line}</div>`:""}
              ${actions?`<div class="hj-film-actions">${actions}</div>`:""}
            </div>
          </div>`;
        }

        function showHelp(title, text) {
          root.querySelector(".hj-help-sheet")?.remove();
          const s = document.createElement("div");
          s.className="hj-help-sheet";
          s.innerHTML=`<h3>${esc(title)}</h3><p>${esc(text)}</p><div class="hj-actions"><button class="hj-secondary hj-help-close" data-action="close-help">知道了</button></div>`;
          root.querySelector(".hj-shell").appendChild(s);
          const closeBtn = s.querySelector("[data-action='close-help']");
          closeBtn?.addEventListener("click",()=>s.remove(),{once:true});
        }

        function beginGenerating(el, label="正在生成") {
          if (!el) return ()=>{};
          const oldHtml = el.innerHTML;
          const oldDisabled = el.disabled;
          el.disabled = true;
          el.classList.add("hj-gen-loading");
          el.textContent = label;
          return ()=>{
            if (!el?.isConnected) return;
            el.classList.remove("hj-gen-loading");
            el.disabled = oldDisabled;
            el.innerHTML = oldHtml;
          };
        }


        function normalizeChineseDialogueQuotes(text) {
          let s=String(text||"");
          const parts=s.split(/\n/);
          const fixed=parts.map(line=>{
            const opens=(line.match(/“/g)||[]).length;
            const closes=(line.match(/”/g)||[]).length;
            if(opens>closes) return line + "”".repeat(opens-closes);
            return line;
          });
          s=fixed.join("\n");
          const totalOpen=(s.match(/“/g)||[]).length;
          const totalClose=(s.match(/”/g)||[]).length;
          if(totalOpen>totalClose) s += "”".repeat(totalOpen-totalClose);
          return s;
        }

        function stripStageDirections(text) {
          let s = String(text || "").trim();
          // 只删除舞台说明，不再剥掉对白本身的中文引号。
          s = s.replace(/（[^（）]{0,160}）/g, "")
               .replace(/\([^()]{0,160}\)/g, "")
               .replace(/【[^【】]{0,120}】/g, "")
               .replace(/\[[^\[\]]{0,120}\]/g, "");
          s = s.replace(/\n{3,}/g, "\n\n").trim();
          // 每一行以及整段都检查一次，确保“……”成对闭合。
          s = normalizeChineseDialogueQuotes(s);
          return s;
        }

        function partnerDisplayName() {
          return state.archive?.partnerMarriageName || partnerName();
        }

        function storyCard(label,text,top="48%") {
          return "";
        }

        function weddingHistoryContext() {
          const a=state.archive||{};
          return [a.preLetter&&`婚前笺：${a.preLetter}`,a.doorAnswer&&`迎亲叩门：${a.doorAnswer}`,a.firstLook&&`却扇初见：${a.firstLook}`,a.sedanLine&&`花轿归程：${a.sedanLine}`,a.bowLine&&`拜堂：${a.bowLine}`,a.washLine&&`沃盥：${a.washLine}`,a.tonglaoLine&&`同牢：${a.tonglaoLine}`,a.hejinLine&&`合卺：${a.hejinLine}`,a.hairLine&&`结发：${a.hairLine}`,a.vowUser&&`新娘婚誓：${a.vowUser}`,a.vowPartner&&`新郎婚誓：${a.vowPartner}`,a.veilLine&&`揭盖头：${a.veilLine}`].filter(Boolean).slice(-7).join("\n");
        }

        async function weddingSceneText(task, maxChars=180) {
          const name = partnerDisplayName();
          const result = await weddingAwareText(
            `${task}
输出要求：
1. 这是婚礼场景正文，不是聊天气泡。
2. 叙述新郎动作时必须使用“${name}”或“他”，禁止用“我”作为叙述视角。
3. 只有新郎真正说出口的台词里可以使用“我”。
4. 不要出现括号舞台说明，不要写“（动作）”“（心理）”。
5. 不要代替 USER 描写她未选择的心理或台词。
6. 任何直接对白只要用了中文左引号“，同一句话结束时必须用中文右引号”闭合；标点放在右引号前，例如：“你好，我的妻子。”绝不能输出只有左引号没有右引号的残缺对白。`, maxChars
          );
          return stripStageDirections(result);
        }

        async function withGenerateButton(el, label, fn) {
          if (state.loading) return null;
          state.loading = true;
          const end = beginGenerating(el, label);
          try {
            return await fn();
          } catch (error) {
            console.error("[合卺书] 生成失败",error);
            toast("这一刻没有写成，请稍后再试");
            return null;
          } finally {
            state.loading = false;
            end();
          }
        }



        function storyTurns(key){
          const a=state.archive||{};
          return Array.isArray(a[key])?a[key]:[];
        }
        function storyFlowHtml(intro,turns){
          const items=(turns||[]).map((turn,i)=>`
            <div class="hj-story-turn">
              <div class="hj-story-turn-tag">${esc(turn.label||`续篇 ${i+1}`)}</div>
              <div class="hj-story-turn-text">${esc(turn.text||"")}</div>
            </div>`).join("");
          return `<div class="hj-story-flow"><div class="hj-story-flow-intro">${esc(intro)}</div>${items}<div class="hj-story-flow-end"></div></div>`;
        }
        function storyContext(turns,maxTurns=6){
          return (turns||[]).slice(-maxTurns).map((t,i)=>`【前文${i+1}｜${t.label||"互动"}】\n${t.text||""}`).join("\n\n");
        }
        async function appendStoryTurn(key,label,text,stage){
          const turns=storyTurns(key).slice();
          turns.push({id:Date.now()+"-"+Math.random().toString(36).slice(2,7),label,text,at:Date.now()});
          await saveArchive({[key]:turns,directorStage:stage});
          return turns;
        }
        function enableContinuousStoryScroll(){
          const content=view.querySelector(".hj-film-content");
          if(!content)return;
          content.classList.add("hj-continuous-content");
          content.querySelector(".hj-film-actions")?.classList.add("hj-continuous-actions");
          requestAnimationFrame(()=>{
            const end=content.querySelector(".hj-story-flow-end");
            end?.scrollIntoView({block:"nearest",behavior:"smooth"});
          });
        }

        const CUSTOM_SCENE_CONFIG = {
          prewedding: {
            title:"这一夜，你想……",
            saveKey:"preCustomLine",
            rerender:"prewedding",
            task:(input)=>`大婚前夜，USER在自己的住处，与新郎分开。USER选择了一个属于自己的动作或想法：“${input}”。请写一段现代中式婚礼前夜剧情。两人此刻空间分离，绝不能写拥抱、触碰、同处一室。可以写环境、亲友准备或远方的新郎视角；不要主动加入手机、社交软件等现代物件。`
          },
          procession: {
            title:"迎亲将至，你想……",
            saveKey:"processionLine",
            rerender:"procession",
            task:(input)=>`现代中式婚礼迎亲现场，USER选择：“${input}”。请写一段迎亲将至的现场剧情，要有具体群众氛围：来宾、亲友或观礼的人中的一两笔，并让${partnerDisplayName()}自然存在于迎亲队伍中。`
          },
          door: {
            title:"隔着门，你想……",
            saveKey:"doorAnswer",
            rerender:"door",
            task:(input)=>`现代中式婚礼亲迎叩门环节，USER隔着门选择：“${input}”。请写${partnerDisplayName()}的真实回应，并自然写到门内外亲友或观礼的人的一点反应。`
          },
          fan: {
            title:"团扇之前，你想……",
            saveKey:"firstLook",
            rerender:"fan",
            task:(input)=>`现代中式婚礼却扇相见环节，USER选择：“${input}”。团扇尚在或刚刚移开。请写${partnerDisplayName()}的现场反应，保持现代人的语言与关系，只保留礼仪审美。`
          },
          hand: {
            title:"出阁这一刻，你想……",
            saveKey:"handLine",
            rerender:"hand",
            task:(input)=>`现代中式婚礼出阁环节，USER选择：“${input}”。写${partnerDisplayName()}如何回应，并写一两笔身边的人或亲友的自然存在。`
          },
          arrival: {
            title:"下轿这一刻，你想……",
            saveKey:"arrivalLine",
            rerender:"arrival",
            task:(input)=>`中式婚礼花轿已停在喜堂前，${partnerDisplayName()}伸手来接 USER 下轿。USER选择：“${input}”。写一段有仪式感的现场剧情，写他如何回应，并带一两笔门前亲友安静等待的氛围。`
          },
          sedan: {
            title:"花轿途中，你想……",
            saveKey:"sedanLine",
            rerender:"sedan",
            task:(input)=>`现代中式婚礼花轿归程中，USER选择：“${input}”。写花轿内外、迎亲队伍与${partnerDisplayName()}的现场反应，不要古代社会设定。`
          },
          hall: {
            title:"入堂之前，你想……",
            saveKey:"hallLine",
            rerender:"hall",
            task:(input)=>`现代中式婚礼即将入堂，USER选择：“${input}”。写满堂宾客与司礼等现场氛围，并让${partnerDisplayName()}自然回应。`
          },
          bridalentry: {
            title:"正礼既成，你想……",
            saveKey:"bridalEntryLine",
            rerender:"bridalentry",
            task:(input)=>`正礼已经结束，新人暂归喜房，喜宴尚未开始。红盖头仍在，房中只剩 USER 与${partnerDisplayName()}。USER选择：“${input}”。请写一段安静、郑重、有余韵的过渡剧情；不要替 USER 决定心理，不要默认任何具体亲属或陪伴关系存在。`
          },
          bridalrest: {
            title:"揭盖之后，你想……",
            saveKey:"bridalRestLine",
            rerender:"bridalrest",
            task:(input)=>`红盖头已经在喜房中揭下，喜宴尚未开始。USER与${partnerDisplayName()}稍作整装，准备重新赴宴。USER选择：“${input}”。写一段从私密初见重新过渡到满堂喜宴的剧情，文字温柔克制，不要模板情话，也不要默认任何具体亲属或陪伴关系存在。`
          },
          banquetentry: {
            title:"入宴这一刻，你想……",
            saveKey:"banquetEntryLine",
            rerender:"banquetentry",
            task:(input)=>`中式婚礼正礼已结束，红盖头也已在喜房中揭下。USER与${partnerDisplayName()}稍作整装后重新走回满堂灯火，准备进入喜宴。USER选择：“${input}”。写一段重新入宴的现场剧情：席间渐热、来宾说笑、有人举杯，但不要刻意写手机、摄影设备或工作人员；焦点仍在二人重新并肩走进人群。`
          },
          banquet: {
            title:"喜宴席间，你想……",
            saveKey:"banquetLine",
            rerender:"banquet",
            task:(input)=>`中式婚礼喜宴上，USER选择：“${input}”。写一段席间现场剧情，要有宾客或朋友的一两笔，但焦点仍在她与${partnerDisplayName()}。`
          },
          banquetend: {
            title:"席散之前，你想……",
            saveKey:"banquetEndLine",
            rerender:"banquetend",
            task:(input)=>`喜宴将散，USER选择：“${input}”。写一段人声渐少、亲友告别的现场剧情，并让${partnerDisplayName()}自然回应或重新走回她身边。`
          },
          returnroom: {
            title:"归房路上，你想……",
            saveKey:"returnRoomLine",
            rerender:"returnroom",
            task:(input)=>`喜宴散后，新人一同归房。USER选择：“${input}”。写一段从满堂热闹渐渐过渡到只剩两个人的剧情，并让${partnerDisplayName()}自然回应。`
          },
          veil: {
            title:"婚房门合上后，你想……",
            saveKey:"veilLine",
            rerender:"veil",
            task:(input)=>`现代中式婚礼洞房揭盖头前后，USER选择：“${input}”。此时宾客已退出，空间只剩新人。请写${partnerDisplayName()}的真实回应。`
          },
          night: {
            title:"花烛夜里，你想……",
            saveKey:"nightLine",
            rerender:"night",
            task:(input)=>`现代中式婚礼花烛夜，USER选择：“${input}”。请写夫妻二人的安静私语或小动作，贴合双方原本人设，不要替 USER 决定未输入的情绪。`
          }
        };

        function customButton(stage,label="自定义……") {
          return `<button class="hj-secondary hj-custom-action" data-action="open-custom-v8" data-stage="${esc(stage)}">${esc(label)}</button>`;
        }

        function renderStageByName(name) {
          const map={
            prewedding:renderPreWeddingV5,procession:renderProcessionV5,door:renderDoorV5,
            fan:()=>renderFanV5(state.archive?.firstLook?2:0),hand:renderHandV5,sedan:renderSedanV5,arrival:renderArrivalV5,
            hall:renderHallV5,bridalentry:renderBridalEntryV9,veil:renderVeilLiftV6,bridalrest:renderBridalRestV9,
            banquetentry:renderBanquetEntryV8,banquet:renderBanquetV5,banquetend:renderBanquetEndV8,returnroom:renderReturnRoomV8,night:renderNightV5
          };
          return (map[name]||renderHomeV5)();
        }

        function showCustomSheet(stage) {
          root.querySelector(".hj-custom-sheet")?.remove();
          const cfg=CUSTOM_SCENE_CONFIG[stage]; if(!cfg) return;
          const s=document.createElement("div");
          s.className="hj-custom-sheet";
          s.innerHTML=`<div class="hj-custom-sheet-title">${esc(cfg.title)}</div>
            <div class="hj-custom-sheet-copy">这一刻，由你自己决定。</div>
            <textarea id="hj-custom-input" placeholder="这一刻，你想……"></textarea>
            <div class="hj-custom-sheet-actions">
              <button class="hj-secondary" data-action="close-custom-v8">取消</button>
              <button class="hj-primary" data-action="submit-custom-v8" data-stage="${esc(stage)}">写入这一刻</button>
            </div>`;
          root.querySelector(".hj-shell").appendChild(s);
          bind();
          setTimeout(()=>s.querySelector("textarea")?.focus(),40);
        }


        function showDoorQuestionSheet(round=1) {
          root.querySelector(".hj-custom-sheet")?.remove();
          const s=document.createElement("div");
          s.className="hj-custom-sheet hj-door-custom-sheet";
          s.innerHTML=`<div class="hj-custom-sheet-title">朱门第${round===1?"一":"二"}问</div>
            <div class="hj-custom-sheet-copy">这一问由你来定。只问真正想听他回答的话。</div>
            <textarea id="hj-door-custom-question" placeholder="你想隔着门问他什么？"></textarea>
            <div class="hj-custom-sheet-actions">
              <button class="hj-secondary" data-action="close-custom-v8">取消</button>
              <button class="hj-primary" data-action="submit-door-custom-v91" data-round="${round}">问他</button>
            </div>`;
          root.querySelector(".hj-shell").appendChild(s);
          bind();
          setTimeout(()=>s.querySelector("textarea")?.focus(),40);
        }

        function doorDialogueText(a) {
          const pname=a.partnerMarriageName||partnerName();
          const lines=[];
          const legacyQ=a.doorCustomQuestion||"";
          const legacyA=a.doorCustomAnswer||"";
          if(a.doorAnswer1) lines.push(`第一问 · 今日为何而来？\n${pname}：${a.doorAnswer1}`);
          else if(a.doorCustomAnswer1||legacyA) lines.push(`第一问 · ${a.doorCustomQuestion1||legacyQ||"由你亲自问他"}\n${pname}：${a.doorCustomAnswer1||legacyA}`);
          if(a.doorAnswer2) lines.push(`第二问 · 此后漫长岁月，你愿如何待我？\n${pname}：${a.doorAnswer2}`);
          else if(a.doorCustomAnswer2) lines.push(`第二问 · ${a.doorCustomQuestion2||"由你亲自问他"}\n${pname}：${a.doorCustomAnswer2}`);
          return lines.join("\n\n");
        }

        function stageDisplayName(stage) {
          const names={
            choose:"择新人",names:"婚书初立",prewedding:"大婚前夜",procession:"迎亲",
            door:"朱门叩问",fan:"却扇",hand:"执手出阁",sedan:"花轿归程",arrival:"迎卿下轿",
            hall:"入堂",bow:"拜堂",wash:"沃盥",tonglao:"同牢",hejin:"合卺",hair:"结发",
            vows:"婚誓",book:"婚书双印",complete:"正礼礼成",bridalentry:"暂归喜房",veil:"揭盖头",bridalrest:"喜房暂歇",banquetentry:"入宴",banquet:"喜宴",
            banquetend:"席散",returnroom:"归房",veil:"揭盖头",night:"花烛",finale:"婚礼落幕"
          };
          return names[stage]||"嘉礼进行中";
        }

        function formatSavedTime(ts) {
          if(!ts) return "尚未记录";
          try{
            const d=new Date(ts);
            return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")} ${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
          }catch(_){return "已保存"}
        }


        function cloneData(obj){
          try{return JSON.parse(JSON.stringify(obj))}
          catch(_){return Object.assign({},obj)}
        }

        function currentStoryProgress(a){
          if(!a)return {count:0,preview:""};
          const keys=["bridalRestStory","nightStory"];
          const turns=keys.flatMap(k=>Array.isArray(a[k])?a[k]:[]);
          const last=turns[turns.length-1];
          if(last) return {count:turns.length,preview:last.text||""};
          const candidates=[
            a.returnRoomLine,a.banquetEndLine,a.banquetLine,a.banquetEntryLine,
            a.bridalRestLine,a.veilLine,a.bridalEntryLine,a.partnerSealLine,a.vowReaction,
            a.hairLine,a.hejinLine,a.tonglaoLine,a.washLine,a.afterCeremonyLine,
            a.arrivalLine,a.sedanLine,a.sedanBoardingLine,a.handLine,a.firstLook,
            a.doorCustomAnswer2,a.doorAnswer2,a.doorCustomAnswer1,a.doorAnswer1,
            a.processionLine,a.groomNightLine,a.preNightLine,a.preLetter
          ].filter(Boolean);
          return {count:0,preview:candidates[0]||""};
        }

        function defaultSlotName(a){
          const stage=stageDisplayName(a?.directorStage);
          const p=currentStoryProgress(a);
          return p.count ? `${stage} · 续写${p.count}段` : `${stage} · ${formatSavedTime(Date.now()).slice(5)}`;
        }

        async function getSaveSlots(){
          const all=await safeGet(storage,"marriageSaveSlots",[]);
          return Array.isArray(all)?all:[];
        }

        async function setSaveSlots(list){
          await storage.set("marriageSaveSlots",list);
        }

        async function createNamedSave(name){
          if(!state.archive)return;
          const slots=await getSaveSlots();
          const snap=cloneData(state.archive);
          const slot={
            id:uid(),
            sourceArchiveId:state.archive.id,
            name:(name||"").trim()||defaultSlotName(state.archive),
            stage:state.archive.directorStage||"prewedding",
            createdAt:Date.now(),
            updatedAt:Date.now(),
            snapshot:snap
          };
          slots.push(slot);
          await setSaveSlots(slots);
          return slot;
        }

        async function renameSaveSlot(id,name){
          const slots=await getSaveSlots();
          const item=slots.find(x=>x.id===id);
          if(!item)return false;
          item.name=(name||"").trim()||item.name;
          item.updatedAt=Date.now();
          await setSaveSlots(slots);
          return true;
        }

        async function deleteSaveSlot(id){
          const slots=(await getSaveSlots()).filter(x=>x.id!==id);
          await setSaveSlots(slots);
        }

        async function restoreSaveSlot(id){
          const slots=await getSaveSlots();
          const item=slots.find(x=>x.id===id);
          if(!item?.snapshot)return false;
          const restored=cloneData(item.snapshot);
          // 读取命名存档 = 回到同一场婚礼的该时刻，不额外复制一场婚礼。
          restored.id=item.sourceArchiveId||restored.id||uid();
          restored.savedAt=Date.now();
          state.archive=restored;
          const list=(await safeGet(storage,"marriageArchives",[])).filter(x=>x.id!==restored.id);
          list.push(restored);
          state.archives=list;
          await storage.set("marriageArchives",list);
          await storage.set("currentMarriageId",restored.id);
          await loadBase();
          return true;
        }

        function showRenameSlotSheet(slotId,currentName=""){
          root.querySelector(".hj-rename-sheet")?.remove();
          const s=document.createElement("div");
          s.className="hj-rename-sheet";
          s.innerHTML=`<div class="hj-rename-title">为这份存档题名</div>
            <input class="hj-save-name-input" id="hj-rename-slot-input" value="${esc(currentName)}" placeholder="例如：揭盖以后 · 只说了两句话">
            <div class="hj-save-actions" style="margin-top:12px">
              <button class="hj-secondary" data-action="cancel-rename-slot-v10">取消</button>
              <button class="hj-primary" data-action="confirm-rename-slot-v10" data-slot="${esc(slotId)}">保存名字</button>
            </div>`;
          root.querySelector(".hj-shell").appendChild(s);
          bind();
          setTimeout(()=>s.querySelector("input")?.focus(),40);
        }

        async function showSaveSheet() {
          root.querySelector(".hj-save-sheet")?.remove();
          if(!state.archive) return toast("当前还没有可保存的婚礼");
          const a=state.archive;
          const all=await getSaveSlots();
          const slots=all.filter(x=>x.sourceArchiveId===a.id).sort((x,y)=>(y.updatedAt||0)-(x.updatedAt||0));
          const liveProgress=currentStoryProgress(a);
          const s=document.createElement("div");
          s.className="hj-save-sheet";
          s.innerHTML=`<div class="hj-save-sheet-title">嘉 礼 存 档</div>
            <div class="hj-save-title-note">将这一刻另外珍藏，日后可以从这里继续。</div>
            <div class="hj-save-row"><div class="hj-save-label">当前礼程</div><div class="hj-save-value">${esc(stageDisplayName(a.directorStage))}</div></div>
            <div class="hj-save-row"><div class="hj-save-label">当前剧情</div><div class="hj-save-value">${liveProgress.count?`连续续写 ${liveProgress.count} 段`:"已自动保存至当前进度"}</div></div>

            <div class="hj-save-create">
              <input class="hj-save-name-input" id="hj-new-slot-name" placeholder="${esc(defaultSlotName(a))}">
              <div class="hj-save-actions" style="margin-top:11px">
                <button class="hj-secondary" data-action="close-save-v85">返回婚礼</button>
                <button class="hj-primary" data-action="create-save-slot-v10">另存这一刻</button>
              </div>
            </div>

            <div class="hj-save-row" style="margin-top:4px"><div class="hj-save-label">已珍藏</div><div class="hj-save-value">${slots.length} 份</div></div>
            <div class="hj-slot-list">
              ${slots.length?slots.map(slot=>{
                const snap=slot.snapshot||{};
                const p=currentStoryProgress(snap);
                return `<div class="hj-slot">
                  <div class="hj-slot-head">
                    <div class="hj-slot-name">${esc(slot.name||"未题名")}</div>
                    <div class="hj-slot-stage">${esc(stageDisplayName(slot.stage||snap.directorStage))}</div>
                  </div>
                  <div class="hj-slot-meta">${esc(formatSavedTime(slot.updatedAt||slot.createdAt))}${p.count?` · 连续剧情 ${p.count} 段`:""}</div>
                  ${p.preview?`<div class="hj-slot-preview">${esc(p.preview)}</div>`:""}
                  <div class="hj-slot-actions">
                    <button class="hj-primary" data-action="load-save-slot-v10" data-slot="${esc(slot.id)}">从这里继续</button>
                    <button class="hj-secondary" data-action="rename-save-slot-v10" data-slot="${esc(slot.id)}" data-name="${esc(slot.name||"")}">改名</button>
                    <button class="hj-secondary" data-action="delete-save-slot-v10" data-slot="${esc(slot.id)}">删除</button>
                  </div>
                </div>`;
              }).join(""):`<div class="hj-slot-empty">还没有单独题名的存档。<br>在喜欢的剧情节点，给这一刻留一个名字吧。</div>`}
            </div>`;
          root.querySelector(".hj-shell").appendChild(s);
          bind();
        }

        function archiveStatusText(a){
          if(a?.completedAt||a?.status==="married")return "礼成";
          return stageDisplayName(a?.directorStage);
        }

        function timelinePush(arr,title,copy,note=""){
          const text=String(copy||"").trim();
          if(text)arr.push({title,copy:text,note});
        }

        function buildWeddingTimeline(a){
          const t=[];
          if(!a)return t;

          timelinePush(t,"婚书初立",
            `${a.userMarriageName||"卿"} · ${a.partnerMarriageName||"良人"}\n${a.weddingDate?`婚期：${a.weddingDate}`:""}`.trim());

          timelinePush(t,"大婚前夜",a.preNightLine||a.preCustomLine);
          timelinePush(t,"婚前笺",a.preLetter,a.partnerMarriageName||"");
          timelinePush(t,"他那一夜",a.groomNightLine);
          timelinePush(t,"迎亲",a.processionLine);

          const door=[];
          if(a.doorAnswer1)door.push(`第一问 · 今日为何而来？\n${a.partnerMarriageName||"他"}：${a.doorAnswer1}`);
          else if(a.doorCustomAnswer1||a.doorCustomAnswer)door.push(`第一问 · ${a.doorCustomQuestion1||a.doorCustomQuestion||"自定义"}\n${a.partnerMarriageName||"他"}：${a.doorCustomAnswer1||a.doorCustomAnswer}`);
          if(a.doorAnswer2)door.push(`第二问 · 此后愿如何待我？\n${a.partnerMarriageName||"他"}：${a.doorAnswer2}`);
          else if(a.doorCustomAnswer2)door.push(`第二问 · ${a.doorCustomQuestion2||"自定义"}\n${a.partnerMarriageName||"他"}：${a.doorCustomAnswer2}`);
          timelinePush(t,"朱门叩问",door.join("\n\n"));

          timelinePush(t,"却扇相见",a.firstLook);
          timelinePush(t,"执手出阁",a.handLine);
          timelinePush(t,"扶送上轿",a.sedanBoardingLine);
          timelinePush(t,"花轿归程",a.sedanLine);
          timelinePush(t,"迎卿下轿",a.arrivalLine);

          if(a.bowDone||a.bowStep) timelinePush(t,"拜堂",a.bowLine||"三拜既成，彼此相向。");
          timelinePush(t,"沃盥",a.washLine);
          timelinePush(t,"同牢",a.tonglaoLine,a.tonglaoFood?`所取礼食：${a.tonglaoFood}`:"");
          timelinePush(t,"合卺",a.hejinLine);
          timelinePush(t,"结发",a.hairLine);

          const vows=[];
          if(a.vowUser)vows.push(`${a.userMarriageName||"卿"}：${a.vowUser}`);
          if(a.vowPartner)vows.push(`${a.partnerMarriageName||"良人"}：${a.vowPartner}`);
          if(a.vowReaction)vows.push(a.vowReaction);
          timelinePush(t,"婚誓",vows.join("\n\n"));

          timelinePush(t,"婚书双印",a.partnerSealLine,a.marriageNo?`婚书编号：${a.marriageNo}`:"");
          timelinePush(t,"正礼告成",a.afterCeremonyLine);
          timelinePush(t,"暂归喜房",a.bridalEntryLine);
          timelinePush(t,"揭盖头",a.veilLine);

          const rest=Array.isArray(a.bridalRestStory)?a.bridalRestStory:[];
          if(rest.length){
            timelinePush(t,"喜房暂歇",rest.map(x=>`${x.label?`【${x.label}】\n`:""}${x.text||""}`).join("\n\n"));
          }else{
            timelinePush(t,"喜房暂歇",a.bridalRestLine);
          }

          timelinePush(t,"重入喜宴",a.banquetEntryLine);
          timelinePush(t,"喜宴",a.banquetLine);
          timelinePush(t,"席散",a.banquetEndLine);
          timelinePush(t,"执手归房",a.returnRoomLine);

          const night=Array.isArray(a.nightStory)?a.nightStory:[];
          if(night.length){
            timelinePush(t,"花烛夜",night.map(x=>`${x.label?`【${x.label}】\n`:""}${x.text||""}`).join("\n\n"));
          }else{
            timelinePush(t,"花烛夜",a.nightLine);
          }

          timelinePush(t,"嘉礼落幕",a.finalBlessing);
          return t;
        }

        async function renderJialiRecordV10(){
          await loadBase();
          music.play("afterglow",.24);
          const archives=(state.archives||[]).slice().sort((a,b)=>(b.completedAt||b.savedAt||0)-(a.completedAt||a.savedAt||0));
          view.innerHTML=`<div class="hj-record-page">
            ${musicTop("嘉礼录","home")}
            <div class="hj-record-hero">
              <div class="hj-record-seal">录</div>
              <div class="hj-record-title">嘉礼录</div>
              <div class="hj-record-sub">良 辰 有 记 · 嘉 礼 有 藏</div>
              <div class="hj-record-count">共收录 ${archives.length} 场嘉礼</div>
            </div>
            <div class="hj-record-cards">
              ${archives.length?archives.map(a=>{
                const p=currentStoryProgress(a);
                return `<button class="hj-record-card" data-action="open-jiali-scroll-v10" data-id="${esc(a.id)}">
                  <div class="hj-record-card-top">
                    <div class="hj-record-names">${esc(a.userMarriageName||"卿")} · ${esc(a.partnerMarriageName||"良人")}</div>
                    <div class="hj-record-status">${esc(archiveStatusText(a))}</div>
                  </div>
                  <div class="hj-record-date">${esc(a.weddingDate||formatSavedTime(a.createdAt).split(" ")[0])}</div>
                  <div class="hj-record-progress">已收录至「${esc(stageDisplayName(a.directorStage))}」${p.count?`，其中连续剧情 ${p.count} 段。`:"。"}</div>
                  <div class="hj-record-open">展开这卷嘉礼 ›</div>
                </button>`;
              }).join(""):`<div class="hj-scroll-empty">嘉礼尚未启卷。<br>当第一场婚礼开始以后，这里会自动留下它走过的每一步。</div>`}
            </div>
          </div>`;
          bind();
        }

        function renderJialiScrollV10(id){
          const a=(state.archives||[]).find(x=>x.id===id);
          if(!a)return renderJialiRecordV10();
          const timeline=buildWeddingTimeline(a);
          view.innerHTML=`<div class="hj-scroll-page">
            ${musicTop("嘉礼长卷","jialirecord")}
            <div class="hj-scroll-cover">
              <div class="hj-scroll-kicker">${a.completedAt?"嘉 礼 已 成":"嘉 礼 未 竟"}</div>
              <div class="hj-scroll-names">${esc(a.userMarriageName||"卿")} · ${esc(a.partnerMarriageName||"良人")}</div>
              <div class="hj-scroll-date">${esc(a.weddingDate||formatSavedTime(a.createdAt).split(" ")[0])}</div>
            </div>
            <div class="hj-scroll-line"></div>
            ${timeline.length?timeline.map((x,i)=>`
              <section class="hj-scroll-section">
                <div class="hj-scroll-section-title">${esc(x.title)}</div>
                <div class="hj-scroll-section-copy">${esc(x.copy)}</div>
                ${x.note?`<div class="hj-scroll-section-note">${esc(x.note)}</div>`:""}
              </section>
              ${i<timeline.length-1?`<div class="hj-scroll-line" style="height:18px"></div>`:""}
            `).join(""):`<div class="hj-scroll-empty">这一卷才刚刚开始。继续走下去，发生过的剧情会自动收进这里。</div>`}
          </div>`;
          bind();
        }

        async function writeWeddingToRocheMemory() {
          const a=state.archive||{};
          if(!a.writeRocheMemory) return {ok:false,skipped:true};
          const cid=state.selectedChar?.conversationId;
          if(!cid) return {ok:false,reason:"missingConversation"};
          if(typeof roche.memory?.write!=="function") return {ok:false,reason:"unsupported"};

          const bride=a.userMarriageName||userName();
          const groom=a.partnerMarriageName||partnerName();
          const date=a.weddingDate||fmtDate();
          const summaryParts=[
            `${bride} 与 ${groom} 于 ${date} 举办中式婚礼并正式成婚。`,
            a.vowUser?`${bride} 的婚誓：${a.vowUser}`:"",
            a.vowPartner?`${groom} 的婚誓：${a.vowPartner}`:"",
            a.doorAnswer1?`迎亲朱门前，${groom} 回答“今日为何而来”：${a.doorAnswer1}`:"",
            a.doorAnswer2?`他也回答了“此后愿如何相待”：${a.doorAnswer2}`:"",
            `两人共同完成亲迎、却扇、拜堂、沃盥、同牢、合卺、结发、婚书双印、喜宴与洞房礼。`
          ].filter(Boolean);
          const summaryText=summaryParts.join("\n");

          try{
            await roche.memory.write({
              conversationId:cid,
              summaryText,
              who:[bride,groom],
              action:"正式成婚，并共同完成一场中式婚礼",
              when:date,
              where:"婚礼中",
              source:"plugin"
            });
            return {ok:true,method:"memory.write"};
          }catch(error){
            return {ok:false,reason:"writeFailed",error};
          }
        }

        async function loadBase() {
          try { state.users = (await roche.persona.getUserPersonas()) || []; } catch (_) { state.users = []; }
          try { state.user = await roche.persona.getActiveUserPersona(); } catch (_) { state.user = null; }
          state.selectedUser = state.user || state.users[0] || null;
          try { state.chars = (await roche.character.list()) || []; } catch (_) { state.chars = []; }

          state.archives = await safeGet(storage, "marriageArchives", []);
          const currentId = await safeGet(storage, "currentMarriageId", "");
          state.archive = state.archives.find(x => x.id === currentId) || null;

          if (state.archive) {
            state.selectedUser = state.users.find(u => u.id === state.archive.userPersonaId) || state.selectedUser;
            state.selectedChar = state.chars.find(c => c.id === state.archive.partnerId) || null;
          } else {
            state.selectedChar = null;
          }
        }

        function partnerName() {
          const c = state.selectedChar;
          return c ? (c.name || c.handle || "良人") : "良人";
        }
        function userName() {
          const u = state.selectedUser || state.user;
          return u ? (u.name || u.handle || "卿") : "卿";
        }

        function topbar(title, backTarget) {
          return `
            <div class="hj-topbar">
              <button class="hj-iconbtn" data-action="back" data-target="${esc(backTarget || "home")}">‹</button>
              <div class="hj-top-title">${esc(title)}</div>
              <button class="hj-iconbtn" data-action="close">×</button>
            </div>`;
        }

        function renderHome() {
          const dust = Array.from({length:18},(_,i)=>`<i style="left:${(i*37)%100}%;top:${-(i*23)%120}px;animation-delay:${(i%7)*.42}s"></i>`).join("");
          if (state.archive?.completedAt) {
            view.innerHTML = `
              <div class="hj-home">
                <div class="hj-opening-scroll">
                  <div class="hj-gold-dust">${dust}</div>
                  <div class="hj-opening">
                    <div class="hj-knot">囍</div>
                    <div class="hj-title">合卺书</div>
                    <div class="hj-sub">此书既成 · 岁岁为证</div>
                    <div class="hj-rule"></div>
                    <div class="hj-quote">${esc(state.archive.userMarriageName||userName())} · ${esc(state.archive.partnerMarriageName||partnerName())}<br>合卺第 ${daysSince(state.archive.completedAt)} 日</div>
                    <button class="hj-primary" data-action="resume-married">入岁岁帖</button>
                    <div style="height:10px"></div>
                    <button class="hj-secondary" data-action="new-marriage">另启新婚</button>
                  </div>
                </div>
              </div>`;
            bind(); return;
          }
          if (state.archive && state.archive.partnerId) {
            view.innerHTML = `
              <div class="hj-home">
                <div class="hj-opening-scroll">
                  <div class="hj-gold-dust">${dust}</div>
                  <div class="hj-opening">
                    <div class="hj-knot">囍</div>
                    <div class="hj-title">合卺书</div>
                    <div class="hj-sub">大婚未竟 · 嘉礼待续</div>
                    <div class="hj-rule"></div>
                    <div class="hj-quote">已有一场尚未完成的婚礼。<br>可继续，也可另启新婚。</div>
                    <button class="hj-primary" data-action="resume-wedding">续礼</button>
                    <div style="height:10px"></div>
                    <button class="hj-secondary" data-action="new-marriage">另启新婚</button>
                  </div>
                </div>
              </div>`;
            bind(); return;
          }
          view.innerHTML = `
            <div class="hj-home">
              <div class="hj-opening-scroll">
                <div class="hj-gold-dust">${dust}</div>
                <div class="hj-cloud c1">☁</div><div class="hj-cloud c2">☁</div>
                <div class="hj-opening">
                  <div class="hj-knot">囍</div>
                  <div class="hj-title">合卺书</div>
                  <div class="hj-sub">嘉礼初成 · 两姓婚盟</div>
                  <div class="hj-rule"></div>
                  <div class="hj-quote">谨以白头之约，书向鸿笺。<br>好将红叶之盟，载明鸳谱。</div>
                  <button class="hj-primary" data-action="new-marriage">启书</button>
                </div>
              </div>
            </div>`;
          bind();
        }

        function renderChoose() {
          const userCards = state.users.map(u => {
            const selected = state.selectedUser?.id === u.id;
            return `<button class="hj-person ${selected?"selected":""}" data-action="select-user" data-id="${esc(u.id)}">
              ${u.avatar ? `<img class="hj-avatar" src="${esc(u.avatar)}">` : `<div class="hj-avatar-fallback">${esc((u.name||u.handle||"我").slice(0,1))}</div>`}
              <div class="hj-person-txt"><div class="hj-person-name">${esc(u.handle || u.name || "USER")}</div>
              <div class="hj-person-bio">${esc(u.bio || "此次婚礼使用的人设")}</div></div>
            </button>`;
          }).join("");

          const cards = state.chars.map(c => {
            const selected = state.selectedChar?.id === c.id;
            return `
              <button class="hj-person ${selected?"selected":""}" data-action="select-char" data-id="${esc(c.id)}">
                ${c.avatar ? `<img class="hj-avatar" src="${esc(c.avatar)}">` : `<div class="hj-avatar-fallback">${esc((c.name||c.handle||"良").slice(0,1))}</div>`}
                <div class="hj-person-txt">
                  <div class="hj-person-name">${esc(c.handle || c.name || "未命名")}</div>
                  <div class="hj-person-bio">${esc(c.bio || c.description || "此心有所归")}</div>
                </div>
              </button>`;
          }).join("");

          view.innerHTML = `
            ${topbar("择新人","home")}
            <div class="hj-page">
              <div class="hj-stepper"><i class="hj-dot on"></i><i class="hj-dot"></i><i class="hj-dot"></i><i class="hj-dot"></i><i class="hj-dot"></i></div>
              <div class="hj-section-title">一 · 定新人</div>
              <div class="hj-section-desc">这场婚礼会锁定一份独立人设快照。以后切换其他人设，也不会污染这场婚礼。</div>
              <div class="hj-label">我的人设</div>
              <div class="hj-grid">${userCards || `<div class="hj-card">未读取到 USER 人设。</div>`}</div>
              <div class="hj-label" style="margin-top:20px">新郎</div>
              <div class="hj-grid">${cards || `<div class="hj-card">未读取到角色。</div>`}</div>
              <div class="hj-actions"><button class="hj-primary" data-action="to-names" ${state.selectedChar&&state.selectedUser?"":"disabled"}>定此良缘</button></div>
            </div>`;
          bind();
        }

        function renderNames() {
          const a = state.archive || {};
          view.innerHTML = `
            ${topbar("定婚名","choose")}
            <div class="hj-page">
              <div class="hj-stepper"><i class="hj-dot on"></i><i class="hj-dot on"></i><i class="hj-dot"></i><i class="hj-dot"></i><i class="hj-dot"></i></div>
              <div class="hj-section-title">二 · 定婚名</div>
              <div class="hj-section-desc">婚书之上，姓名如印。可沿用原名，也可另写只属于此卷的婚名。</div>
              <div class="hj-card">
                <label class="hj-label">卿之婚名</label>
                <input id="hj-user-name" class="hj-input" value="${esc(a.userMarriageName || userName())}">
                <label class="hj-label">良人婚名</label>
                <input id="hj-partner-name" class="hj-input" value="${esc(a.partnerMarriageName || partnerName())}">
                <label class="hj-label">婚期</label>
                <input id="hj-date" class="hj-input" type="date" value="${esc(a.weddingDate || new Date().toISOString().slice(0,10))}">
              </div>
              <div class="hj-actions"><button class="hj-primary" data-action="save-names">入礼</button></div>
            </div>`;
          bind();
        }

        function renderRituals() {
          const a = state.archive || {};
          const rs = a.rituals || {};
          const ritualList = [
            ["聘书","许婚","写下愿与此人结为伴侣的心意。"],
            ["礼书","纳礼","以一件有意义的虚拟信物，表此心不移。"],
            ["合卺","共饮","两盏相合，自此同甘共苦。"],
            ["却扇","见君","揭扇相见，留一言于今日。"],
            ["结发","同心","各执一缕，同系白首之约。"]
          ];
          view.innerHTML = `
            ${topbar("行嘉礼","names")}
            <div class="hj-page">
              <div class="hj-stepper"><i class="hj-dot on"></i><i class="hj-dot on"></i><i class="hj-dot on"></i><i class="hj-dot"></i><i class="hj-dot"></i></div>
              <div class="hj-section-title">三 · 行嘉礼</div>
              <div class="hj-section-desc">不求繁礼尽备，只取其中最有意义的五仪。每成一礼，便落一印。</div>
              <div class="hj-rituals">
                ${ritualList.map(([id,name,desc])=>`
                  <button class="hj-ritual ${rs[id]?"done":""}" data-action="ritual" data-id="${id}">
                    <div><div class="hj-ritual-name">${name}</div><div class="hj-ritual-desc">${desc}</div></div>
                    <div class="hj-stamp">${rs[id]?"已成":"未印"}</div>
                  </button>`).join("")}
              </div>
              <div class="hj-actions">
                <button class="hj-secondary" data-action="generate-blessing">生成婚缘辞</button>
                <button class="hj-primary" data-action="scene-next" data-next="迎亲">进入婚礼渲染</button>
              </div>
              ${a.blessing ? `<div class="hj-card" style="margin-top:14px;font-size:12px;line-height:1.9;color:#E7D4A8">${esc(a.blessing)}</div>` : ""}
            </div>`;
          bind();
        }

        async function genAI(kind) {
          if (!state.selectedChar) return "";
          const a = state.archive || {};
          const userPersona = state.selectedUser?.persona || state.selectedUser?.bio || "";
          const charPersona = state.selectedChar?.persona || state.selectedChar?.bio || "";
          let memoryText = "";
          try {
            const cid = state.selectedChar.conversationId;
            if (cid) {
              const mem = await roche.memory.getLongTerm({conversationId: cid, limit: 60});
              const core = mem?.core?.summary || mem?.core?.text || "";
              const facts = (mem?.facts || []).slice(0,20).map(x=>x.summaryText||x.action||x.text||"").filter(Boolean).join("\n");
              memoryText = [core,facts].filter(Boolean).join("\n");
            }
          } catch (_) {}

          const task = kind === "blessing"
            ? "写一段80到140字的中式婚缘辞。语言古雅但不要堆砌典故，要体现两个人为什么适合走到一起。不要写标题。"
            : "分别为两人各写一句不超过45字的中式婚誓，真诚、克制、有个人性格，不要套话。用【我方】和【良人】分开。";

          const result = await roche.ai.chat({
            messages: [
              {role:"system",content:`你正在为一款中式婚礼插件《合卺书》撰写内容。避免俗套网络古风，文字应端正、温柔、有仪式感。`},
              {role:"system",content:`USER人设：\n${userPersona}\n\n角色人设：\n${charPersona}\n\n可参考的既有关系记忆：\n${memoryText || "无"}`},
              {role:"user",content:task}
            ],
            temperature: 0.75
          });
          return String(result?.text || "").trim();
        }



        async function weddingAwareText(task, maxChars=180) {
          if (!state.selectedChar || !state.selectedUser) return "";
          const a = state.archive || {};
          const userPersona = state.selectedUser?.persona || state.selectedUser?.bio || "";
          const charPersona = state.selectedChar?.persona || state.selectedChar?.bio || "";
          let memoryText = "";
          try {
            const cid = state.selectedChar.conversationId;
            if (cid) {
              const mem = await roche.memory.getLongTerm({conversationId:cid,limit:80});
              const core = mem?.core?.summary || mem?.core?.text || "";
              const facts = (mem?.facts||[]).slice(0,30).map(x=>x.summaryText||x.action||x.text||"").filter(Boolean).join("\n");
              memoryText = [core,facts].filter(Boolean).join("\n");
            }
          } catch(_) {}
          const result = await roche.ai.chat({
            messages:[
              {role:"system",content:`你正在参与一场发生在现代世界里的正式中式婚礼。婚服、礼仪与视觉审美传统化，但所有人物都是现代人，拥有现代身份、关系与生活经验。最重要的是让新郎始终是原本的他，而不是套用任何古风男主或婚礼模板。公共场景可以自然出现“来宾、亲友、身边的人、观礼的人、司礼”等中性群像，但不得默认 USER 或新郎一定拥有母亲、父亲、兄弟姐妹、身边的人、同行的人或任何特定亲属/陪伴关系；只有 USER 人设或既有记忆明确存在时才可具体称呼。群众描写必须具体、短暂、不抢新人戏份。现代背景只体现在人物关系和自然语言里；除非 USER 主动提及，否则不要刻意写手机、社交软件、摄影设备、工作人员流程等容易破坏中式婚礼氛围的现代物件。文字应有场景、留白、细微动作和适度对白，具体、克制、温柔，避免空洞排比、滥用“眼底”“宠溺”“此生不负”等陈词，也不要凭空编造两人的重大往事。进入拜堂、正礼、婚誓与落印时自然收敛，体现尊重、承担、珍惜与双方平等。不要戏谑婚礼本身，不要替 USER 决定情绪、台词或未选择的动作，不描写具体脸部五官。除非任务明确要求第一人称对白，否则叙述新郎动作必须用新郎姓名或“他”，只有说出口的话可以使用“我”。禁止括号舞台说明。`},
              {role:"system",content:`USER人设：\n${userPersona}\n\n新郎人设：\n${charPersona}\n\n可参考的既有关系记忆：\n${memoryText||"无"}\n\n这场婚礼中已经真实发生的片段，后续情节需要自然承接，不要机械重复：\n${weddingHistoryContext()||"婚礼尚未开始"}\n\n当前婚礼：${a.userMarriageName||userName()} 与 ${a.partnerMarriageName||partnerName()} 的正式婚礼。`},
              {role:"user",content:task + `\n请控制在${maxChars}字以内。`}
            ],temperature:.72
          });
          return String(result?.text||"").trim();
        }

        function renderPreWedding() {
          const a = state.archive || {};
          view.innerHTML = `
            ${topbar("婚前一日","names")}
            <div class="hj-page">
              <div class="hj-section-title">二 · 婚期将至</div>
              <div class="hj-section-desc">真正的大婚，从“明日要成婚”开始。</div>
              <div class="hj-photo-hero">
                <img src="${WEDDING_ASSETS.bridePrep}" alt="">
                <div class="hj-photo-label">凤冠初成 · 吉时将近</div>
              </div>
              <div class="hj-card">
                <div class="hj-scene-kicker">婚 前 心 绪</div>
                <div class="hj-section-title" style="font-size:18px">迎亲之前</div>
                <div id="hj-prethought" style="font-size:13px;line-height:2;color:#ead7ad">${esc(a.preThought || "喜服已备，婚书在案。天尚未亮，他就知道——今日，他要去娶你。")}</div>
                <div class="hj-actions"><button class="hj-secondary" data-action="gen-prethought">让他想一想</button></div>
              </div>
              <div class="hj-card" style="margin-top:14px">
                <div class="hj-label">婚堂</div>
                <div class="hj-grid">
                  <button class="hj-person ${a.hall==="朱门华堂"?"selected":""}" data-action="pick-hall" data-value="朱门华堂"><div class="hj-person-name">朱门华堂</div></button>
                  <button class="hj-person ${a.hall==="庭院花烛"?"selected":""}" data-action="pick-hall" data-value="庭院花烛"><div class="hj-person-name">庭院花烛</div></button>
                  <button class="hj-person ${a.hall==="青庐古礼"?"selected":""}" data-action="pick-hall" data-value="青庐古礼"><div class="hj-person-name">青庐古礼</div></button>
                  <button class="hj-person ${a.hall==="春日园林"?"selected":""}" data-action="pick-hall" data-value="春日园林"><div class="hj-person-name">春日园林</div></button>
                </div>
              </div>
              <div class="hj-actions"><button class="hj-primary" data-action="start-pickup">至吉时 · 开亲迎</button></div>
            </div>`;
          bind();
        }

        function renderPickup(stage="叩门") {
          const a = state.archive || {};
          if(stage==="叩门"){
            view.innerHTML = `
              <div class="hj-scene hj-photo-scene" ${sceneStyle("pickupDoor","center")}>
                ${topbar("亲迎 · 叩门","prewedding")}
                <div class="hj-scene-main"><div class="hj-scene-card">
                  <div class="hj-scene-kicker">吉 时 已 至</div>
                  <div class="hj-scene-title">新郎叩门</div>
                  <div class="hj-scene-copy">朱门未启，门内笑语正盛。今日第一关，不问礼数，只问真心。</div>
                  <div class="hj-card" style="text-align:left">
                    <div class="hj-label">堵门问答</div>
                    <div style="font-size:14px;line-height:1.8">“第一次真正意识到，你非她不可，是什么时候？”</div>
                    <div id="hj-door-answer" style="margin-top:12px;font-size:13px;line-height:1.9;color:#ead7ad">${esc(a.doorAnswer||"")}</div>
                    <div class="hj-actions"><button class="hj-secondary" data-action="answer-door">让新郎回答</button></div>
                  </div>
                </div></div>
                <div class="hj-scene-bottom"><button class="hj-primary" data-action="pickup-next" data-next="寻鞋">门开一线</button></div>
              </div>`;
          } else if(stage==="寻鞋"){
            const found = a.shoeFound;
            view.innerHTML = `
              <div class="hj-scene hj-photo-scene" ${sceneStyle("bridalRoom","center")}>
                ${topbar("亲迎 · 寻鞋","prewedding")}
                <div class="hj-scene-main"><div class="hj-scene-card">
                  <div class="hj-scene-kicker">堵 门 小 戏</div>
                  <div class="hj-scene-title">寻婚鞋</div>
                  <div class="hj-scene-copy">屏风、妆奁、箱笼、花架——婚鞋只藏在一处。</div>
                  <div class="hj-grid">
                    ${["屏风后","妆奁下","箱笼中","花架旁"].map((x,i)=>`<button class="hj-person" data-action="find-shoe" data-value="${x}"><div class="hj-person-name">${x}</div></button>`).join("")}
                  </div>
                  <div class="hj-toastline">${found ? `找到了。婚鞋就藏在「${esc(found)}」。` : "再找不到，吉时可要被耽误了。"}</div>
                </div></div>
                <div class="hj-scene-bottom"><button class="hj-primary" data-action="pickup-next" data-next="却扇">迎卿相见</button></div>
              </div>`;
          } else {
            renderProcessScene("却扇");
          }
          bind();
        }

        function renderExitBride() {
          view.innerHTML = `
            <div class="hj-scene hj-photo-scene" ${sceneStyle("departureHands","center")}>
              ${topbar("出阁礼","却扇")}
              <div class="hj-scene-main"><div class="hj-scene-card">
                <div class="hj-scene-kicker">辞 旧 迎 新</div>
                <div class="hj-scene-title">出阁</div>
                <div class="hj-scene-copy">今日出此门，非为离别，乃往新岁。门外有人来迎你，门内仍留旧日灯火。</div>
                <div class="hj-thread-stage tied"><div class="hj-thread left"></div><div class="hj-thread right"></div><div class="hj-thread-knot">门</div></div>
              </div></div>
              <div class="hj-scene-bottom"><button class="hj-primary" data-action="to-hall">出阁入轿</button></div>
            </div>`;
          bind();
        }

        function renderHall() {
          const a = state.archive || {};
          view.innerHTML = `
            <div class="hj-scene hj-photo-scene" ${sceneStyle("weddingHallEntry","center")}>
              ${topbar("华堂","出阁")}
              <div class="hj-curtain"></div>
              <div class="hj-lantern-wrap"><div class="hj-lantern"></div><div class="hj-lantern" style="animation-delay:.7s"></div></div>
              <div class="hj-scene-main"><div class="hj-scene-card">
                <div class="hj-scene-kicker">赞 礼 官 唱 礼</div>
                <div class="hj-scene-title">${esc(a.hall||"朱门华堂")}</div>
                <div class="hj-scene-copy">宾朋已至，花烛已明。新人将入堂，正礼自此开始。</div>
                <div class="hj-card">
                  <div style="font-size:13px;line-height:2;color:#ead7ad">「良辰既至——请新人入堂。」</div>
                </div>
              </div></div>
              <div class="hj-scene-bottom"><button class="hj-primary" data-action="formal-next" data-next="沃盥">入正礼</button></div>
            </div>`;
          bind();
        }

        function renderFormal(stage) {
          const copy = {
            "沃盥":["沃盥","净手洁心","盥洗去尘，非为形式，只为以清净之心入此一礼。"],
            "拜礼":["拜礼","天地为证","可不拘泥繁礼，但这一拜，是向今日郑重行礼。"],
            "合卺":["合卺","卺分为二 · 合而为一","两盏相合，从此同甘共苦。"],
            "结发":["结发","两缕同心","结发为盟，不在发丝，而在此后愿意同行。"]
          }[stage] || ["正礼","嘉礼",""];
          const formalAsset = stage==="拜礼" ? "bowCeremony" : stage==="合卺" ? "hejinCups" : stage==="结发" ? "hairKnot" : "officiantScroll";
          view.innerHTML = `
            <div class="hj-scene hj-photo-scene" ${sceneStyle(formalAsset,"center")}>
              ${topbar("正礼 · "+stage,"hall")}
              <div class="hj-scene-main"><div class="hj-scene-card">
                <div class="hj-scene-kicker">赞 礼 官</div>
                <div class="hj-scene-title">${copy[0]}</div>
                <div class="hj-scene-copy">${copy[2]}</div>
                ${stage==="合卺" ? `<div id="hj-cups" class="hj-scene-caption">卺分为二，合而为一。执盏，与他共饮。</div><button class="hj-secondary" data-action="join-cups">与他共饮</button>` :
                  stage==="结发" ? `<div id="hj-thread-stage" class="hj-scene-caption">各取一缕青丝，以红线同系，收作今日之信。</div><button class="hj-secondary" data-action="tie-thread">同系青丝</button>` :
                  `<div class="hj-stage-word">${stage==="沃盥"?"净手洁心":"天地为证"}</div>`}
              </div></div>
              <div class="hj-scene-bottom"><button class="hj-primary" data-action="formal-next" data-next="${stage==="沃盥"?"拜礼":stage==="拜礼"?"合卺":stage==="合卺"?"结发":"婚誓"}">${stage==="结发"?"各陈一诺":"礼成 · 下一仪"}</button></div>
            </div>`;
          bind();
        }

        function renderBanquet() {
          view.innerHTML = `
            <div class="hj-scene hj-photo-scene" ${sceneStyle("banquetHall","center")}>
              ${topbar("喜宴","certificate")}
              <div class="hj-lantern-wrap"><div class="hj-lantern"></div><div class="hj-lantern" style="animation-delay:.6s"></div></div>
              <div class="hj-scene-main"><div class="hj-scene-card">
                <div class="hj-scene-kicker">嘉 礼 已 成 · 宾 朋 共 贺</div>
                <div class="hj-scene-title">开席</div>
                <div class="hj-scene-copy">正礼结束以后，才该热闹起来。敬酒、喜糖、合影、宾客留言，都属于这一日。</div>
                <div class="hj-photo-hero" style="aspect-ratio:16/8.6;margin-top:8px">
                  <img src="${WEDDING_ASSETS.banquetToast}" alt="">
                  <div class="hj-photo-label">满堂贺喜 · 同席共饮</div>
                </div>
                <div id="hj-banquet-line" class="hj-toastline" style="margin-top:8px"></div>
                <button class="hj-secondary" data-action="banquet-moment">让他在喜宴里说一句</button>
              </div></div>
              <div class="hj-scene-bottom"><button class="hj-primary" data-action="finish-day">宴散 · 嘉礼已毕</button></div>
            </div>`;
          bind();
        }

        function renderProcessScene(kind) {
          const a = state.archive || {};
          if (kind === "迎亲") {
            view.innerHTML = `
              <div class="hj-scene hj-photo-scene" ${sceneStyle("procession","center")}>
                ${topbar("迎亲","rituals")}
                <div class="hj-curtain"></div>
                <div class="hj-lantern-wrap"><div class="hj-lantern"></div><div class="hj-lantern" style="animation-delay:.8s"></div></div>
                <div class="hj-scene-main"><div class="hj-scene-card">
                  <div class="hj-scene-kicker">良 辰 吉 时</div>
                  <div class="hj-scene-title">迎卿入礼</div>
                  <div class="hj-scene-copy">灯影微摇，金线成章。良辰既择，嘉礼将启。</div>
                </div></div>
                <div class="hj-scene-bottom"><button class="hj-primary" data-action="scene-next" data-next="却扇">吉时已至</button></div>
              </div>`;
          } else if (kind === "却扇") {
            const c = state.selectedChar;
            view.innerHTML = `
              <div class="hj-scene hj-photo-scene" ${sceneStyle("veilLift","center")}>
                ${topbar("却扇","rituals")}
                <div class="hj-scene-main"><div class="hj-scene-card">
                  <div class="hj-scene-kicker">却 扇 相 见</div>
                  <div class="hj-scene-title">见君</div>
                  <div class="hj-fan-stage">
                    <div class="hj-face">${c?.avatar ? `<img src="${esc(c.avatar)}">` : `<div class="hj-avatar-fallback">${esc((partnerName()).slice(0,1))}</div>`}</div>
                    <div class="hj-fan" id="hj-fan"></div>
                  </div>
                  <div class="hj-toastline" id="hj-fan-line">一扇之间，藏今日第一眼。</div>
                  <button class="hj-secondary" data-action="open-fan">却扇</button>
                </div></div>
                <div class="hj-scene-bottom"><button class="hj-primary" data-action="scene-next" data-next="合卺">入合卺礼</button></div>
              </div>`;
          } else if (kind === "合卺") {
            view.innerHTML = `
              <div class="hj-scene">
                ${topbar("合卺","rituals")}
                <div class="hj-scene-main"><div class="hj-scene-card">
                  <div class="hj-scene-kicker">卺 分 为 二 · 合 而 为 一</div>
                  <div class="hj-scene-title">合卺</div>
                  <div class="hj-cups" id="hj-cups">
                    <div class="hj-cup left"></div><div class="hj-cup right"></div><div class="hj-flash"></div>
                  </div>
                  <div class="hj-toastline" id="hj-cup-line">两盏未合，礼尚未成。</div>
                  <button class="hj-secondary" data-action="join-cups">共饮合卺</button>
                </div></div>
                <div class="hj-scene-bottom"><button class="hj-primary" data-action="scene-next" data-next="结发">入结发礼</button></div>
              </div>`;
          } else {
            view.innerHTML = `
              <div class="hj-scene">
                ${topbar("结发","rituals")}
                <div class="hj-scene-main"><div class="hj-scene-card">
                  <div class="hj-scene-kicker">结 发 同 心</div>
                  <div class="hj-scene-title">白首为期</div>
                  <div class="hj-thread-stage" id="hj-thread-stage">
                    <div class="hj-thread left"></div><div class="hj-thread right"></div><div class="hj-thread-knot">∞</div>
                  </div>
                  <div class="hj-toastline" id="hj-thread-line">两缕未系，尚待同心。</div>
                  <button class="hj-secondary" data-action="tie-thread">结发</button>
                </div></div>
                <div class="hj-scene-bottom"><button class="hj-primary" data-action="to-vows">共书婚誓</button></div>
              </div>`;
          }
          bind();
        }

        function renderVows() {
          const a = state.archive || {};
          view.innerHTML = `
            ${topbar("共书婚誓","rituals")}
            <div class="hj-page hj-vows-bg">
              <div class="hj-stepper"><i class="hj-dot on"></i><i class="hj-dot on"></i><i class="hj-dot on"></i><i class="hj-dot on"></i><i class="hj-dot"></i></div>
              <div class="hj-section-title">四 · 共书婚誓</div>
              <div class="hj-section-desc">此处不求华丽，只留真正愿意带到以后的一句话。</div>
              <div class="hj-card">
                <label class="hj-label">${esc(a.userMarriageName || userName())}之誓</label>
                <textarea id="hj-vow-user" class="hj-textarea" placeholder="亲笔写下你的婚誓……">${esc(a.vowUser || "")}</textarea>
                <label class="hj-label">${esc(a.partnerMarriageName || partnerName())}之誓</label>
                <textarea id="hj-vow-partner" class="hj-textarea" placeholder="可亲笔代写，也可请 AI 按人设生成……">${esc(a.vowPartner || "")}</textarea>
              </div>
              <div class="hj-actions">
                <button class="hj-secondary" data-action="ai-vows">依人设代拟</button>
                <button class="hj-primary" data-action="save-vows">入婚书</button>
              </div>
            </div>`;
          bind();
        }

        function renderCertificate(preview=true) {
          const a = state.archive || {};
          const completed = Boolean(a.completedAt);
          view.innerHTML = `
            ${topbar("婚书","vows")}
            <div class="hj-page">
              <div class="hj-stepper"><i class="hj-dot on"></i><i class="hj-dot on"></i><i class="hj-dot on"></i><i class="hj-dot on"></i><i class="hj-dot on"></i></div>
              <div class="hj-photo-hero" style="aspect-ratio:16/9.4">
                <img src="${WEDDING_ASSETS.marriageBook}" alt="">
                <div class="hj-photo-label">两姓缔约 · 此诺为凭</div>
              </div>
              <div class="hj-certificate hj-cert-reveal">
                <div class="hj-cert-top">嘉 礼 初 成 · 两 姓 婚 盟</div>
                <div class="hj-cert-title">婚书</div>
                <div class="hj-cert-names">
                  <div class="hj-cert-name"><span class="hj-cert-role">婚书其一</span><strong>${esc(a.userMarriageName || userName())}</strong></div>
                  <div class="hj-cert-name"><span class="hj-cert-role">婚书其二</span><strong>${esc(a.partnerMarriageName || partnerName())}</strong></div>
                </div>
                <div class="hj-cert-text">
                  两姓联姻，一堂缔约。谨以白头之约，书向鸿笺；好将红叶之盟，载明鸳谱。
                  ${a.blessing ? `<br><br>${esc(a.blessing)}` : ""}
                </div>
                <div class="hj-cert-vows">
                  <div>「${esc(a.vowUser || "愿此后朝暮相守，岁岁同心。")}」</div>
                  <div style="margin-top:8px">「${esc(a.vowPartner || "愿与你共看人间灯火，共守寻常岁月。")}」</div>
                </div>
                ${completed ? `<div class="hj-seal">合卺<br>之印</div>` : `
                  <div class="hj-longpress" id="hj-longpress">
                    <div class="hj-longpress-ring"></div>
                    <div class="hj-longpress-seal">合卺<br>之印</div>
                  </div>
                  <div class="hj-section-desc" style="text-align:center;margin-bottom:2px">长按印章，落印成书</div>`}
                <div class="hj-cert-foot">
                  婚期：${esc(a.weddingDate ? fmtDate(new Date(a.weddingDate).getTime()) : fmtDate())}<br>
                  婚书编号：${esc(a.marriageNo || "HJ-"+Date.now().toString(36).toUpperCase())}
                </div>
              </div>
              <div class="hj-actions" style="justify-content:center">
                ${completed ? `<button class="hj-secondary" data-action="home">返回纪年</button>` : `<button class="hj-ghost" data-action="complete">直接落印</button>`}
              </div>
            </div>`;
          bind();
          if (!completed) bindLongPress();
        }


        function renderCeremonyComplete() {
          preloadAssets(["banquetHall","banquetToast"]);
          view.innerHTML = `
            <div class="hj-scene hj-photo-scene" ${sceneStyle("ceremonyComplete","center")}>
              ${topbar("礼成","certificate")}
              <div class="hj-scene-main"><div class="hj-scene-card">
                <div class="hj-scene-kicker">赞 礼</div>
                <div class="hj-scene-title">礼成</div>
                <div class="hj-scene-copy">两姓既合，婚书既成。今日诸礼至此圆满，而往后的日子，才刚刚开始。</div>
                <div class="hj-scene-caption">从今往后，同往人间。</div>
              </div></div>
              <div class="hj-scene-bottom"><button class="hj-primary" data-action="to-banquet">赴喜宴</button></div>
            </div>`;
          bind();
        }

        function renderMorningAfter() {
          preloadAssets(["keepsakes"]);
          view.innerHTML = `
            <div class="hj-scene hj-photo-scene" ${sceneStyle("morningAfter","center")}>
              ${topbar("新婚第一日","home")}
              <div class="hj-scene-main"><div class="hj-scene-card">
                <div class="hj-scene-kicker">花 烛 余 温</div>
                <div class="hj-scene-title">新婚第一日</div>
                <div class="hj-scene-copy">昨夜灯火已静，婚书、凤冠与合卺杯仍留在案上。礼已毕，而余生方始。</div>
              </div></div>
              <div class="hj-scene-bottom"><button class="hj-primary" data-action="enter-anniversary">入岁岁帖</button></div>
            </div>`;
          bind();
        }

        function renderAnniversary() {
          const a = state.archive || {};
          const d = daysSince(a.completedAt);
          view.innerHTML = `
            ${topbar("岁岁帖","home")}
            <div class="hj-page">
              <div class="hj-anniv">
                <div class="hj-sub">自合卺之日起</div>
                <div class="hj-count">${d}<small>日</small></div>
                <div class="hj-section-desc">婚书既成，此后不是终章，而是纪年之始。</div>
              </div>
              <div class="hj-mini-cert" data-action="certificate">
                <div style="text-align:center;color:#E8CB7A;font-size:22px;letter-spacing:.22em">合卺书</div>
                <div style="display:flex;justify-content:center;gap:18px;margin-top:10px;color:#E8D9B7;font-size:13px">
                  <span>${esc(a.userMarriageName || userName())}</span><span>·</span><span>${esc(a.partnerMarriageName || partnerName())}</span>
                </div>
                <div style="text-align:center;color:#BFAE90;font-size:11px;margin-top:8px">${esc(a.weddingDate || "")}</div>
              </div>
              <div class="hj-keepsake-card">
                <img src="${WEDDING_ASSETS.keepsakes}" alt="">
                <div class="hj-keepsake-title">婚礼珍藏 · 留作岁岁之证</div>
              </div>
              <div class="hj-card" style="margin-top:14px">
                <div class="hj-section-title" style="font-size:17px;margin-top:0">岁岁帖</div>
                <div class="hj-section-desc">第一版先保留入口。后续可以加入百日笺、周年笺、共同记忆与纪念印章。</div>
                <textarea id="hj-note" class="hj-textarea" placeholder="今日留一句……">${esc(a.latestNote || "")}</textarea>
                <div class="hj-actions"><button class="hj-secondary" data-action="save-note">存入岁岁帖</button></div>
              </div>
            </div>`;
          bind();
        }


        /* =========================
           v0.5 Director Flow
           ========================= */

        function renderHomeV5() {
          if (state.archive?.completedAt) {
            music.play("afterglow",.34);
            view.innerHTML = `<div class="hj-v5-cover">
              ${musicTop("合卺书")}
              <div class="hj-v5-cover-content">
                <div class="hj-v5-cover-seal">岁 岁 为 证</div>
                <div class="hj-v5-cover-title">合卺书</div>
                <div class="hj-v5-cover-sub">${esc(state.archive.userMarriageName||userName())} · ${esc(state.archive.partnerMarriageName||partnerName())}　成婚第 ${daysSince(state.archive.completedAt)} 日</div>
                <button class="hj-primary" data-action="resume-married">重看嘉礼落幕</button>
                <button class="hj-record-entry" data-action="open-jiali-record-v10">
                  <div class="hj-record-entry-title">嘉礼录</div>
                  <div class="hj-record-entry-sub">良辰有记 · 嘉礼有藏　›</div>
                </button>
                <div style="height:10px"></div>
                <button class="hj-secondary" data-action="new-marriage">另启一卷</button>
              </div>
            </div>`;
            bind();return;
          }
          music.play("ceremony",.24);
          view.innerHTML = `<div class="hj-v5-cover">
            ${musicTop("合卺书")}
            <div class="hj-v5-cover-content">
              <div class="hj-v5-cover-seal">两 姓 缔 约</div>
              <div class="hj-v5-cover-title">合卺书</div>
              <div class="hj-v5-cover-sub">${state.archive?.partnerId ? "大婚未竟 · 嘉礼待续" : "吉期既定 · 嘉礼将启"}</div>
              ${state.archive?.partnerId
                ? `<button class="hj-primary" data-action="resume-wedding">继续上次嘉礼</button>${state.archive?.savedAt?`<div class="hj-save-hint">进度已自动珍藏</div>`:""}
                   <button class="hj-record-entry" data-action="open-jiali-record-v10">
                     <div class="hj-record-entry-title">嘉礼录</div>
                     <div class="hj-record-entry-sub">这场婚礼已经走过的，都在这里　›</div>
                   </button>
                   <div style="height:10px"></div><button class="hj-secondary" data-action="new-marriage">另启新婚</button>`
                : `<button class="hj-primary" data-action="new-marriage">启书</button>
                   <button class="hj-record-entry" data-action="open-jiali-record-v10">
                     <div class="hj-record-entry-title">嘉礼录</div>
                     <div class="hj-record-entry-sub">良辰有记 · 嘉礼有藏　›</div>
                   </button>`}
            </div>
          </div>`;
          bind();
        }

        function renderChooseV5() {
          const a=state.archive||{};
          const userCards = state.users.map(u=>{
            const on=state.selectedUser?.id===u.id;
            return `<button class="hj-person ${on?"selected":""}" data-action="select-user" data-id="${esc(u.id)}">
              ${u.avatar?`<img class="hj-avatar" src="${esc(u.avatar)}">`:`<div class="hj-avatar-fallback">${esc((u.name||u.handle||"卿").slice(0,1))}</div>`}
              <div class="hj-person-txt"><div class="hj-person-name">${esc(u.handle||u.name||"USER")}</div><div class="hj-person-bio">${esc(u.bio||"今日，以此人设赴礼")}</div></div>
            </button>`;
          }).join("");
          const charCards = state.chars.map(c=>{
            const on=state.selectedChar?.id===c.id;
            return `<button class="hj-person ${on?"selected":""}" data-action="select-char" data-id="${esc(c.id)}">
              ${c.avatar?`<img class="hj-avatar" src="${esc(c.avatar)}">`:`<div class="hj-avatar-fallback">${esc((c.name||c.handle||"良").slice(0,1))}</div>`}
              <div class="hj-person-txt"><div class="hj-person-name">${esc(c.handle||c.name||"未命名")}</div><div class="hj-person-bio">今日，他将以新郎身份与你共行嘉礼</div></div>
            </button>`;
          }).join("");
          view.innerHTML = `${musicTop("择新人","home")}<div class="hj-page" style="padding-top:72px">
            <div class="hj-section-title">今有良辰，择一人共赴此日</div>
            <div class="hj-choose-poem">吉期未启，婚书待题。今日，你愿与谁共行嘉礼？</div>
            <div class="hj-label">卿</div><div class="hj-grid">${userCards||`<div class="hj-card">未读取到 USER 人设。</div>`}</div>
            <div class="hj-label" style="margin-top:20px">良人</div><div class="hj-grid">${charCards||`<div class="hj-card">未读取到角色。</div>`}</div>
            ${state.selectedChar?`<div class="hj-card" style="margin-top:18px;text-align:center"><div class="hj-sub">今日，他将着婚服、执婚书，于众人见证之下与你结为夫妻</div><div class="hj-section-title" style="font-size:22px">${esc(userName())} · ${esc(partnerName())}</div></div>`:""}
            <div class="hj-memory-toggle">
              <div class="hj-memory-toggle-row">
                <div><div class="hj-memory-toggle-title">写入 Roche 主记忆</div><div class="hj-memory-toggle-copy">开启后，待嘉礼真正落幕，再将成婚之事与彼此婚誓一并珍藏。</div></div>
                <button class="hj-switch ${a.writeRocheMemory?"on":""}" data-action="toggle-main-memory-v8" aria-label="切换写入 Roche 主记忆"><i></i></button>
              </div>
            </div>
            <div class="hj-actions"><button class="hj-primary" data-action="to-names" ${state.selectedChar&&state.selectedUser?"":"disabled"}>就是他 · 立婚书</button></div>
          </div>`;
          bind();
        }

        function renderNamesV5() {
          const a=state.archive||{};
          view.innerHTML=`<div class="hj-contract-wrap">${musicTop("婚书初立","choose")}
            <div class="hj-contract-scroll">
              <div class="hj-contract-emblem">囍</div>
              <div class="hj-contract-title">婚书初立</div>
              <div class="hj-contract-copy">此卷今日只题姓名与吉期。婚誓、结发与双印，会在你们真正行礼之后一一落入其中。</div>
              <div class="hj-contract-field"><label>卿 之 婚 名</label><input id="hj-user-name" class="hj-input" value="${esc(a.userMarriageName||userName())}"></div>
              <div class="hj-contract-field"><label>良 人 婚 名</label><input id="hj-partner-name" class="hj-input" value="${esc(a.partnerMarriageName||partnerName())}"></div>
              <div class="hj-contract-field"><label>吉 期</label><input id="hj-date" class="hj-input" type="date" value="${esc(a.weddingDate||new Date().toISOString().slice(0,10))}"></div>
              <div class="hj-contract-empty"><span>婚 誓 · 待 书</span><span>双 印 · 待 落</span></div>
              <div class="hj-actions" style="justify-content:center;margin-top:22px"><button class="hj-primary" data-action="save-names-v5">题名 · 立书</button></div>
            </div>
          </div>`;
          bind();
        }

        function renderPreWeddingV5() {
          music.play("afterglow",.28);
          const a=state.archive||{};
          const viewMode=a.prePerspective||"user";
          const isGroom=viewMode==="groom";
          const asset=isGroom?"bridalRoomAlt":"bridePrep";
          const generated=a.preDisplayLine || (isGroom?a.groomNightLine:(a.preCustomLine||a.preNightLine));
          const baseLine=isGroom
            ? `另一处灯火未熄。${esc(partnerDisplayName())} 的婚服已经备好，明日，他会从这里出发来迎你。`
            : `夜渐深，喜服与凤冠都已收拾妥当。屋里的人声一点点轻下来，只等天亮之后，迎亲礼乐从门外响起。`;
          view.innerHTML = filmShell({
            asset,title:"大婚前夜",kicker:isGroom?"另 一 处 · 新 郎":"待 嫁 · 今 夜",
            line:generated?esc(generated):baseLine,
            actions:`<div class="hj-pre-actions">
                       <button class="hj-secondary ${!isGroom?"on":""}" data-action="pre-view-v8" data-view="user">看你这边</button>
                       <button class="hj-secondary ${isGroom?"on":""}" data-action="pre-view-v8" data-view="groom">看看他此刻</button>
                       ${!isGroom?`
                         <button class="hj-secondary" data-action="pre-listen-v8">听窗外的动静</button>
                         <button class="hj-secondary" data-action="pre-book-v8">再看一眼婚书</button>`
                         : `<button class="hj-secondary" data-action="pre-groom-v8">${a.groomNightLine?"再看一会儿":"看看他在做什么"}</button>
                            <button class="hj-secondary" data-action="gen-letter">${a.preLetter?"重读婚前笺":"等一封婚前笺"}</button>`}
                       ${!isGroom?`<button class="hj-secondary" data-action="gen-letter">${a.preLetter?"重读婚前笺":"等一封婚前笺"}</button>`:""}
                       ${customButton("prewedding")}
                       <button class="hj-primary hj-pre-primary" data-action="start-pickup-v5">待到吉时</button>
                     </div>`,
            back:"names",
            extra:""
          });
          bind();
        }

        function renderProcessionV5() {
          music.play("procession",.5);
          const a=state.archive||{};
          const line=a.processionLine
            ? esc(a.processionLine)
            : `礼乐先从长街那头传来。门外等候的亲友渐渐聚到一处，身边有人压低声音笑着说“到了”，院里原本零碎的说话声也跟着热闹起来。再近一些，便能听见迎亲队伍的脚步。`;
          view.innerHTML=filmShell({
            asset:"procession",title:"他来了",kicker:"亲 迎 · 长 街",
            line,
            actions:`<button class="hj-secondary" data-action="procession-look-v8">隔窗看一眼</button>
                     <button class="hj-secondary" data-action="procession-hear-v8">只听他的脚步</button>
                     ${customButton("procession")}
                     <button class="hj-primary" data-action="to-door-v5">迎亲已至 · 去听叩门</button>`,
            back:"prewedding",position:"center",
            extra:""
          });
          bind();
        }

        function renderDoorV5() {
          const a=state.archive||{};
          const dialogue=doorDialogueText(a);
          const firstDone=!!(a.doorAnswer1||a.doorCustomAnswer1||a.doorCustomAnswer);
          const secondDone=!!(a.doorAnswer2||a.doorCustomAnswer2);
          const round=secondDone?3:firstDone?2:1;
          let actions="";
          if(round===1){
            actions=`<div class="hj-door-questions">
              <button class="hj-primary" data-action="door-q1-v82">第一问 · 今日为何而来？</button>
              <button class="hj-secondary" data-action="door-custom-v91" data-round="1">自定义第一问</button>
            </div>`;
          }else if(round===2){
            actions=`<div class="hj-door-questions">
              <button class="hj-primary" data-action="door-q2-v82">第二问 · 此后愿如何待我？</button>
              <button class="hj-secondary" data-action="door-custom-v91" data-round="2">自定义第二问</button>
            </div>`;
          }else{
            actions=`<div class="hj-door-questions"><button class="hj-primary" data-action="door-open-v5">两问既答 · 开门见他</button></div>`;
          }
          view.innerHTML=filmShell({
            asset:"pickupDoor",title:"朱门叩问",kicker:"亲 迎",
            line:dialogue||"门没有立刻打开。门里的人声轻了一点，门外也安静下来。今日这一门，不问礼数，只问真心。",
            help:"朱门叩问共两问。每一问都可以选择内置问题，也可以用自定义问题替代；完成第一问后只进入第二问，不会重复上一问。",
            actions,back:"procession",extra:""
          });
          bind();
        }

        async function renderFanV5(peek=0) {
          music.play("procession",.38);
          const a=state.archive||{};
          const pname=esc(a.partnerMarriageName||partnerName());
          const story = a.firstLook
            ? storyCard("却 扇 · 相 见",a.firstLook,"53%")
            : peek===1
              ? `<div class="hj-queshan-note">${pname} 已走到近前。团扇仍遮着你的面容，只隔着一扇之距。</div>`
              : "";
          view.innerHTML=filmShell({
            asset:"queshan",title:"却扇",kicker:"出 阁 · 相 见",
            line:a.firstLook
              ? esc(a.firstLook)
              : peek===0
                ? `${pname} 已入阁。今日第一次相见，不急着移扇。`
                : peek===1
                  ? `扇缘轻移。你们之间只余最后一点遮挡。`
                  : `团扇已却。这一眼，从此留在今日。`,
            help:"却扇：以团扇遮面，待礼而却扇相见。与洞房中的揭盖头并非同一环节。",
            actions:peek===0
              ? `<button class="hj-secondary" data-action="fan-call">隔扇唤他</button><button class="hj-primary" data-action="fan-touch" data-peek="1">轻移团扇</button>${customButton("fan")}`
              : peek===1
                ? `<button class="hj-secondary" data-action="fan-wait">再等一瞬</button><button class="hj-primary" data-action="fan-touch" data-peek="2">却扇相见</button>`
                : `<button class="hj-primary" data-action="to-hand-v5">随 ${pname} 出阁</button>`,
            back:"door",
            extra:story
          });
          bind();
        }

        function renderHandV5() {
          const a=state.archive||{};
          const taken=!!a.handTaken;
          view.innerHTML=filmShell({
            asset:"departureHands",title:"执手出阁",kicker:"出 阁",
            line:a.handLine
              ? esc(a.handLine)
              : taken
                ? `${esc(partnerDisplayName())} 已牵住你的手。门槛之外，花轿正等在前方。`
                : `${esc(partnerDisplayName())} 已在门外等你。今日出此门，不为离别，是从此与他一同往前。`,
            actions:taken
              ? `<button class="hj-primary" data-action="escort-to-sedan-v83">由他扶送上花轿</button>${customButton("hand")}`
              : `<button class="hj-primary" data-action="take-hand-v5">牵住 ${esc(partnerDisplayName())}</button>${customButton("hand")}`,
            back:"fan",
            extra:""
          });
          bind();
        }

        function renderSedanV5() {
          music.play("procession",.34);
          const a=state.archive||{};
          const pname=esc(a.partnerMarriageName||partnerName());
          view.innerHTML=filmShell({
            asset:"sedanJourney",title:"花轿归程",kicker:"归 门",
            line:a.sedanLine
              ? esc(a.sedanLine)
              : a.sedanBoardingLine
                ? esc(a.sedanBoardingLine)
                : "轿帘轻晃，长街上的喧声渐远。你能听见轿外脚步与礼乐，也知道他就在这支迎亲队伍里。",
            actions:a.sedanLine
              ? `<button class="hj-secondary" data-action="sedan-curtain">再掀一点轿帘</button><button class="hj-primary" data-action="arrive-v5">继续归程 · 待轿停</button>`
              : `<button class="hj-secondary" data-action="sedan-curtain">掀一点轿帘</button>
                 <button class="hj-secondary" data-action="sedan-call">隔帘唤 ${pname}</button>
                 <button class="hj-primary" data-action="sedan-listen">安静听路上</button>${customButton("sedan")}`,
            back:"hand",
            extra:storyCard("花 轿 · 途 中",a.sedanLine,"51%")
          });
          bind();
        }

        function renderArrivalV5() {
          const a=state.archive||{};
          view.innerHTML=filmShell({
            asset:"sedanArrival",title:"迎卿下轿",kicker:"归 门",
            line:a.arrivalLine
              ? esc(a.arrivalLine)
              : `轿帘掀起。喜堂就在前方，${esc(partnerDisplayName())} 没有催你，只把手伸到你够得到的地方。门前的亲友也跟着安静了一瞬。`,
            actions:a.arrivalLine
              ? `<button class="hj-primary" data-action="to-hall-v5">与 ${esc(partnerDisplayName())} 一同入堂</button>`
              : `<button class="hj-secondary" data-action="arrival-hand-v82">把手交给他</button>
                 <button class="hj-secondary" data-action="arrival-pause-v82">故意停一瞬</button>
                 ${customButton("arrival")}
                 <button class="hj-primary" data-action="to-hall-v5">直接与他入堂</button>`,
            back:"sedan",
            extra:""
          });
          bind();
        }

        function renderHallV5() {
          music.play("ceremony",.42);
          view.innerHTML=filmShell({
            asset:"weddingHallEntry",title:"入华堂",kicker:"正 婚",
            line:"宾朋已至，花烛已明。音乐渐收，只余堂前一声清磬。司礼唱：正婚礼始。",
            actions:`<button class="hj-primary" data-action="to-bow-v7">司礼唱 · 请新人拜堂</button>`,
            back:"arrival"
          });
          bind();
        }

        function renderBowV7() {
          music.play("ceremony",.39);
          const a=state.archive||{};
          const step=Number(a.bowStep||0);
          const names=["一拜天地","二拜见证","夫妻对拜"];
          const intro=[
            "司礼唱：一拜天地——敬天地，也敬今日这一场郑重。",
            "司礼唱：二拜见证——向今日在堂前见证你们的人致礼。",
            "司礼唱：夫妻对拜——从这一礼起，彼此相敬，同心同行。"
          ];
          const done=step>=3;
          const line=a.bowLine
            ? esc(a.bowLine)
            : done
              ? "三拜俱成。堂前短暂安静了一瞬，随后才重新有了笑声。"
              : intro[step];
          view.innerHTML=filmShell({
            asset:"bowCeremony",title:"拜堂",kicker:`正 婚 · 第 一 礼${done?" · 礼 成":""}`,
            line,
            help:"拜堂礼序因地域与家庭安排而异。这里保留三次递进：一拜天地、二拜见证、夫妻对拜；第二拜不强制代入任何具体家庭关系。",
            actions:done
              ? `<button class="hj-primary" data-action="to-wash-v5">三拜礼成 · 净手入席</button>`
              : `<div class="hj-bow-progress"><span class="${step>=0?"on":""}"></span><span class="${step>=1?"on":""}"></span><span class="${step>=2?"on":""}"></span></div>
                 <div class="hj-bow-current">${names[step]}</div>
                 <button class="hj-primary" data-action="perform-bow-v7">与 ${esc(partnerDisplayName())} · ${names[step]}</button>`,
            back:"hall",
            extra:""
          });
          bind();
        }

        function renderWashV5(done=false) {
          music.play("ceremony",.36);
          const a=state.archive||{};
          view.innerHTML=filmShell({
            asset:"weddingHallEntry",title:"沃盥",kicker:"正 婚 · 第 二 礼",
            line:a.washLine?esc(a.washLine):(done?"水纹渐静。你们都已净手，正礼由此真正进入席间。":"司礼唱礼：“沃盥。” 清水置于案前，新人依次净手。"),
            help:"沃盥：新人入席前以清水净手，取洁手正心、郑重入礼之意。",
            actions:done?`<button class="hj-primary" data-action="to-tonglao-v5">净手礼成 · 同席而食</button>`:`<button class="hj-secondary" data-action="wash-water">以水净手</button>`,
            back:"bow",
            extra:""
          });
          bind();
        }

        function renderTonglaoV5(selected="") {
          music.play("ceremony",.36);
          const a=state.archive||{};
          const foods=["枣栗","同牢肉","黍饭"];
          const picked=selected||a.tonglaoFood||"";
          view.innerHTML=filmShell({
            asset:"banquetToast",title:"同牢",kicker:"正 婚 · 第 三 礼",
            line:a.tonglaoLine
              ? esc(a.tonglaoLine)
              : picked
                ? `你们从同一席中取食。自这一箸起，“夫妻”不只在婚书上，也落进最寻常的一餐里。`
                : "司礼唱礼：“同牢——共席而食。” 三样礼食置于席前，你可以先取一味。",
            help:"同牢：新人同席共食，象征从今日起同居一室、同食一席。这里保留三样礼食供你选择。",
            actions:picked
              ? `<button class="hj-primary" data-action="tonglao-next-v85">同牢礼成 · 下一礼合卺</button>`
              : `<div class="hj-tonglao-foods">${foods.map(f=>`<button class="hj-secondary" data-action="choose-food" data-food="${esc(f)}">${esc(f)}</button>`).join("")}</div>`,
            back:"wash",
            extra:""
          });
          bind();
        }

        function renderHejinV5(lifted=false) {
          music.play("ceremony",.32);
          const a=state.archive||{};
          const done=!!a.hejinDone;
          view.innerHTML=filmShell({
            asset:"hejinCups",title:"合卺",kicker:"正 婚 · 第 四 礼",
            line:a.hejinLine
              ? esc(a.hejinLine)
              : done
                ? "两卺已饮。杯盏轻碰的一声，被安静地留在正礼里。"
                : lifted
                  ? `你执起自己的卺，${esc(partnerDisplayName())}也端起另一只。两盏将在这一刻相合。`
                  : "司礼唱礼：“合卺——新人各执其一。”",
            help:"合卺：卺分为二，新人各执一半共饮，再合而为一，取从此甘苦同尝、夫妻一体之意。",
            actions:done
              ? `<button class="hj-primary" data-action="to-hair-v6">合卺礼成 · 下一礼结发</button>`
              : lifted
                ? `<button class="hj-primary" data-action="drink-hejin">与 ${esc(partnerDisplayName())} 共饮合卺</button>`
                : `<button class="hj-primary" data-action="lift-cup">执卺</button>`,
            back:"tonglao",
            extra:""
          });
          bind();
        }

        function renderHairV5() {
          music.play("ceremony",.28);
          const a=state.archive||{};
          view.innerHTML=filmShell({
            asset:"hairKnot",title:"结发",kicker:"正 婚 · 第 五 礼",
            line:a.hairLine
              ? esc(a.hairLine)
              : a.hairKeepsake
                ? "两缕青丝已经同系并妥帖收好。"
                : "各取一缕青丝，以红线同系。不是为了繁复礼数，只把今日这一诺留作信物。",
            help:"结发：以两缕青丝同系为信，象征从此结为夫妻。",
            actions:a.hairKeepsake
              ? `<button class="hj-primary" data-action="to-vows-v6">结发礼成 · 请婚誓</button>`
              : `<button class="hj-primary" data-action="tie-hair-v5">同系青丝</button>`,
            back:"hejin",
            extra:""
          });
          bind();
        }

        async function renderVowsV5() {
          music.play("ceremony",.24); music.duck(true);
          const a=state.archive||{};
          if(!a.vowPartner && !state.loading){
            state.loading=true;
            view.innerHTML=filmShell({asset:"officiantScroll",title:"婚誓",kicker:"各 陈 一 诺",line:`${esc(partnerDisplayName())} 正在认真整理要对你说的话。`,actions:`<button class="hj-primary hj-gen-loading" disabled>${esc(partnerDisplayName())} 正在写下婚誓</button>`,back:"hair"});
            bind();
            try{
              const raw=await weddingAwareText("现在正婚礼已经行至婚誓。只写新郎真正对新娘说出口的婚誓正文。不要动作、心理、旁白、括号说明、引号套话。保持本人语言习惯，不要套用古风誓词；可以克制、嘴硬、寡言或温柔，但必须认真。可以自然承接今天婚礼中发生过的一处细节，并写清楚愿意在婚姻中做到的陪伴、尊重或承担。避免夸张的永恒誓言和未经证实的往事。",240);
              const t=stripStageDirections(raw);
              await saveArchive({vowPartner:t});
            }catch(_){toast("他的婚誓暂时没有写成，请稍后重试")}
            state.loading=false;
          }
          const b=state.archive||a;
          view.innerHTML=`<div class="hj-film" ${sceneStyle("officiantScroll","center")}><div class="hj-film-bg"></div><div class="hj-film-shade"></div><div class="hj-vow-book"></div>${musicTop("婚誓","hair")}
            <div class="hj-vow-panel">
              <div class="hj-film-kicker">请 二 位 · 各 陈 一 诺</div>
              <div class="hj-section-title" style="font-size:20px">${esc(b.partnerMarriageName||partnerName())}</div>
              <div class="hj-vow-write">${esc(b.vowPartner||"他仍在整理想说的话……")}</div>
              <div class="hj-rule" style="width:100%;animation:none;margin:18px 0"></div>
              <div class="hj-section-title" style="font-size:20px">轮到你</div>
              <textarea id="hj-vow-user-v5" class="hj-textarea" placeholder="亲笔写下你的婚誓……">${esc(b.vowUser||"")}</textarea>
              ${b.vowReaction?`<div class="hj-vow-reaction"><div class="hj-film-kicker">他听见了你的婚誓</div>${esc(b.vowReaction)}</div>`:""}
              <div class="hj-actions"><button class="hj-secondary" data-action="draft-user-vow">依我的人设拟一份</button><button class="hj-primary" data-action="save-vows-v5">${b.vowReaction?"收录婚书":"让他听见此诺"}</button></div>
            </div></div>`;
          bind();
        }

        function renderBookV5(stage="user", returnMode="ceremony") {
          music.duck(true);
          const a=state.archive||{};
          const userOn=stage!=="user";
          const partnerOn=stage==="done";
          const revisit=returnMode==="finale";
          const doneAction=revisit
            ? `<button class="hj-primary" style="display:block;margin:14px auto 0" data-action="return-finale-v90">收起婚书 · 返回落幕</button>`
            : `<button class="hj-primary" style="display:block;margin:14px auto 0" data-action="ceremony-complete-v5">收书 · 待正礼告成</button>`;
          view.innerHTML=`<div class="hj-book-live">${musicTop("婚书 · 双印",revisit?"finale":"vows")}
            <div class="hj-book-paper">
              <div class="hj-cert-top">两 姓 缔 约 · 此 诺 为 凭</div>
              <div class="hj-cert-title" style="font-size:34px">婚书</div>
              <div class="names"><div><div class="role">婚书其一</div><div class="name">${esc(a.userMarriageName||userName())}</div></div>
              <div><div class="role">婚书其二</div><div class="name">${esc(a.partnerMarriageName||partnerName())}</div></div></div>
              <div class="hj-book-vow">「${esc(a.vowUser||"")||"愿此后朝暮相守，岁岁同心。"}」</div>
              <div class="hj-book-vow">「${esc(a.vowPartner||"")||"愿与你共看人间灯火，共守寻常岁月。"}」</div>
              <div class="hj-double-seals"><div class="hj-person-seal ${userOn?"on":""}">${esc((a.userMarriageName||userName()).slice(0,2))}<br>之印</div>
              <div class="hj-person-seal ${partnerOn?"on":""}">${esc((a.partnerMarriageName||partnerName()).slice(0,2))}<br>之印</div></div>
              ${stage==="user"?`<div class="hj-section-desc" style="text-align:center">长按落下你的印。</div><div class="hj-hold" id="hj-user-hold">长按<br>落印</div>`:
                stage==="partner"?`<div class="hj-section-desc" style="text-align:center">你的印已落下。现在，轮到他。</div><button class="hj-primary" style="display:block;margin:14px auto 0" data-action="partner-seal">看他落印</button>`:
                `<div class="hj-section-desc" style="text-align:center">两印俱全。婚书至此真正完成。</div>${a.partnerSealLine?`<div class="hj-vow-reaction">${esc(a.partnerSealLine)}</div>`:""}${doneAction}`}
              <div class="hj-cert-foot">婚期：${esc(a.weddingDate?fmtDate(new Date(a.weddingDate).getTime()):fmtDate())}${a.marriageNo?`<br>婚书编号：${esc(a.marriageNo)}`:""}</div>
            </div></div>`;
          bind(); if(stage==="user") bindUserSealHold();
        }

        function bindUserSealHold() {
          const el=view.querySelector("#hj-user-hold"); if(!el) return;
          let timer=null;
          const stop=()=>{clearTimeout(timer);el.classList.remove("holding")};
          el.addEventListener("pointerdown",ev=>{
            ev.preventDefault();el.classList.add("holding");
            timer=setTimeout(async()=>{
              try{navigator.vibrate?.(50)}catch(_){}
              await saveArchive({userSealAt:Date.now()});
              renderBookV5("partner");
            },1400);
          });
          ["pointerup","pointercancel","pointerleave"].forEach(x=>el.addEventListener(x,stop));
        }

        async function renderCeremonyCompleteV5() {
          music.duck(false); music.play("ceremony",.48);
          const a=state.archive||{};
          if(!a.afterCeremonyLine && !state.loading){
            state.loading=true;
            view.innerHTML=filmShell({asset:"ceremonyComplete",title:"礼成",kicker:"嘉 礼 既 成",line:"司礼唱：嘉礼——礼成。",actions:`<button class="hj-primary hj-gen-loading" disabled>${esc(partnerDisplayName())} 正在走向你</button>`,back:"book"});
            bind();
            try{
              const t=await weddingAwareText("正婚礼已经结束，婚书双印俱全。你第一次真正意识到，她现在已经成为你的妻子。不要写旁白，不要模板情话，只说此刻你本人最自然会对她说的一两句话。",140);
              await saveArchive({afterCeremonyLine:t,status:"ceremony-complete"});
            }catch(_){}
            state.loading=false;
          }
          const b=state.archive||a;
          view.innerHTML=filmShell({
            asset:"ceremonyComplete",title:"礼成",kicker:"嘉 礼 既 成",
            line:"两姓既合，婚书既成。司礼的最后一声唱礼落下，堂中静了一瞬，继而才重新有了笑声。正礼至此告成，喜宴尚未开席。",
            actions:`<button class="hj-primary" data-action="to-bridal-entry-v90">正礼既成 · 暂归喜房</button>`,
            back:"book",
            extra:b.afterCeremonyLine?storyCard("礼 成 · 新 婚",`${b.partnerMarriageName||partnerName()}：${b.afterCeremonyLine}`,"32%"):""
          });
          bind();
        }


        function renderBridalEntryV9() {
          music.play("afterglow",.22);
          const a=state.archive||{};
          view.innerHTML=filmShell({
            asset:"bridalRoomAlt",title:"暂归喜房",kicker:"正 礼 既 成 · 喜 宴 未 开",
            line:a.bridalEntryLine
              ? esc(a.bridalEntryLine)
              : `堂前的礼乐被门扉隔远。红盖头仍安静地垂着，${esc(partnerDisplayName())} 与你一同回到喜房。方才满堂都是人声，此刻忽然只剩烛火与彼此的呼吸。`,
            actions:`<button class="hj-secondary" data-action="bridal-entry-wait-v90">等他走近</button>
                     <button class="hj-secondary" data-action="bridal-entry-call-v90">先唤他的名字</button>
                     ${customButton("bridalentry")}
                     <button class="hj-primary" data-action="to-veil-v90">花烛已静 · 待他揭盖</button>`,
            back:"complete",
            extra:""
          });
          bind();
        }

        function renderBridalRestV9() {
          music.play("afterglow",.20);
          const turns=storyTurns("bridalRestStory");
          const intro=`红盖头已经安静地搁在一旁。短暂的独处之后，外面的灯火与人声仍隔着门扉。喜宴还没有真正开始，你们可以在这里多停一会儿。`;
          view.innerHTML=filmShell({
            asset:"bridalRoomAlt",title:"整装赴宴",kicker:"盖 头 已 揭 · 喜 宴 将 开",
            line:storyFlowHtml(intro,turns),
            actions:`<button class="hj-secondary" data-action="bridal-rest-sit-v91">与他静坐片刻</button>
                     <button class="hj-secondary" data-action="bridal-rest-ask-v91">问他方才在想什么</button>
                     <button class="hj-secondary" data-action="bridal-rest-near-v91">靠近他一些</button>
                     ${customButton("bridalrest")}
                     <button class="hj-primary" data-action="to-banquet-entry-v90">整装既毕 · 携手赴宴</button>`,
            back:"veil",extra:""
          });
          bind();
          enableContinuousStoryScroll();
        }

        function renderBanquetEntryV8() {
          music.play("procession",.28);
          const a=state.archive||{};
          view.innerHTML=filmShell({
            asset:"banquetHall",title:"入宴",kicker:"重 入 满堂 · 喜 宴 将 开",
            line:a.banquetEntryLine
              ? esc(a.banquetEntryLine)
              : `红盖头已经揭下。稍作整装后，你们重新推开房门。方才被门扉隔远的灯火与笑声一下近了起来，席间已渐渐热闹。${esc(partnerDisplayName())} 就在你身侧，短暂属于两个人的安静过去以后，你们重新一起走进满堂灯火。`,
            actions:`<button class="hj-secondary" data-action="banquet-entry-look-v8">看看席间都在做什么</button>
                     <button class="hj-secondary" data-action="banquet-entry-char-v8">看他怎么应付朋友</button>
                     ${customButton("banquetentry")}
                     <button class="hj-primary" data-action="enter-banquet-v8">与他入席</button>`,
            back:"bridalrest",
            extra:storyCard("入 宴 · 满堂重新热闹",a.banquetEntryLine,"49%")
          });
          bind();
        }

        function renderBanquetV5() {
          music.play("procession",.28);
          const a=state.archive||{};
          view.innerHTML=filmShell({
            asset:"banquetHall",title:"喜宴",kicker:"礼 成 之 后",
            line:a.banquetLine?esc(a.banquetLine):"桌边有人敬酒，也有朋友笑着起哄。正礼已经结束，你们终于能在满堂灯火里稍稍松下来。",
            actions:`<button class="hj-secondary" data-action="banquet-talk-v5">偷看他</button>
                     <button class="hj-secondary" data-action="banquet-toast-v5">与他敬一杯</button>
                     <button class="hj-secondary" data-action="banquet-friend-v8">听朋友们起哄</button>
                     ${customButton("banquet")}
                     <button class="hj-primary" data-action="banquet-end-v8">宴将散</button>`,
            back:"banquetentry",
            extra:storyCard("喜 宴 · 灯 火",a.banquetLine,"48%")
          });
          bind();
        }

        function renderBanquetEndV8() {
          music.play("afterglow",.24);
          const a=state.archive||{};
          view.innerHTML=filmShell({
            asset:"banquetToast",title:"席散",kicker:"夜 深 · 宾 客 渐 散",
            line:a.banquetEndLine
              ? esc(a.banquetEndLine)
              : "有人来告别，也有人还拉着新郎多说两句。桌上的杯盏渐空，宴堂终于显出夜深后的安静。",
            actions:`<button class="hj-secondary" data-action="banquet-goodbye-v8">和最后一拨朋友告别</button>
                     <button class="hj-secondary" data-action="banquet-wait-char-v8">等他从人群里回来</button>
                     ${customButton("banquetend")}
                     <button class="hj-primary" data-action="return-room-v8">与他归房</button>`,
            back:"banquet",
            extra:storyCard("席 散 · 人 声 退 去",a.banquetEndLine,"49%")
          });
          bind();
        }

        function renderReturnRoomV8() {
          music.play("afterglow",.18);
          const a=state.archive||{};
          view.innerHTML=filmShell({
            asset:"bridalRoomAlt",title:"归房",kicker:"从 满堂 · 到 只 剩 两 人",
            line:a.returnRoomLine
              ? esc(a.returnRoomLine)
              : `夜色已经深了。再走向这扇门时，与方才已经不同——红盖头早已揭下，满堂宾客也渐渐散去。今日第二次走向喜房，这一次，不为行礼，只为归房。`,
            actions:`<button class="hj-secondary" data-action="return-room-talk-v8">路上和他说一句话</button>
                     <button class="hj-secondary" data-action="return-room-silent-v8">什么也不说，只和他走回去</button>
                     ${customButton("returnroom")}
                     <button class="hj-primary" data-action="to-night-v90">门扉合上 · 只剩我们</button>`,
            back:"banquetend",
            extra:""
          });
          bind();
        }

        function renderVeilLiftV6() {
          music.play("afterglow",.26);
          const a=state.archive||{};
          view.innerHTML=filmShell({
            asset:"veilLift",title:"揭盖头",kicker:"喜 房 · 初 见",
            line:a.veilLine
              ? esc(a.veilLine)
              : (a.veilOpened
                  ? "红盖头终于从眼前移开。满室灯火一下有了清晰的模样，而今日第一次真正无遮无掩的相见，就停在这一刻。"
                  : `正礼已经告成，喜宴尚未开席。红烛下，盖头仍落着，${esc(partnerDisplayName())} 的脚步在你面前停了下来。`),
            help:"正礼告成后，新人暂归喜房，在赴宴之前揭下红盖头。此后赴喜宴时便不再覆面。",
            actions:a.veilOpened
              ? `<button class="hj-secondary" data-action="veil-after-word-v90">先和他说一句话</button>
                 ${customButton("veil")}
                 <button class="hj-primary" data-action="to-bridal-rest-v90">揭盖已成 · 稍作整装</button>`
              : `<button class="hj-secondary" data-action="veil-call">隔着盖头唤 ${esc(partnerDisplayName())}</button>
                 <button class="hj-secondary" data-action="veil-hand-v90">隔着红绸握住他的手</button>
                 ${customButton("veil")}
                 <button class="hj-primary" data-action="veil-open">让他揭开盖头</button>`,
            back:"bridalentry",
            extra:`<div class="hj-veil-soft ${a.veilOpened?"open":""}"></div>`
          });
          bind();
        }

        function renderNightV5() {
          music.play("afterglow",.30);
          const turns=storyTurns("nightStory");
          const intro=`门扉合上，外面的喜宴声一点点远去。今日所有需要完成的礼都已经走完。此刻没有下一礼，也没有人再催促——只剩你们两个。`;
          view.innerHTML=filmShell({
            asset:"bridalRoom",title:"花烛",kicker:"只 剩 你 们",
            line:storyFlowHtml(intro,turns),
            actions:`<button class="hj-secondary" data-action="night-question-v91">问他：今天什么时候最紧张？</button>
                     <button class="hj-secondary" data-action="night-look-v91">问他：今天最想记住哪一刻？</button>
                     <button class="hj-secondary" data-action="night-future-v91">问他：婚后最想一起做什么？</button>
                     ${customButton("night")}
                     <button class="hj-primary" data-action="finish-wedding-v8">今夜至此 · 礼成</button>`,
            back:"returnroom",extra:""
          });
          bind();
          enableContinuousStoryScroll();
        }

        async function ensureFinalBlessing() {
          const a=state.archive||{};
          if(a.finalBlessing) return a.finalBlessing;
          const core=`嘉礼至此，灯火渐静。

今日你们曾在众人的见证里走向彼此，也曾在礼乐散去以后，只剩两个人安静地坐在烛火前。那些郑重的礼，并不是为了证明爱有多盛大，而是想替这一日留下些什么——让许多年以后回望时，仍记得曾有人穿过满堂灯火，认真地走到你身边。

愿此后岁岁，并非日日无忧，却始终有人可共灯火、共三餐、共风雨，也共寻常。愿欢喜有人知，委屈有人听；愿争执终有回身，远行终有归处。

愿二位新人，自今而后，朝暮同欢，岁岁相守。
今日合卺，此后同心。`;
          await saveArchive({finalBlessing:core});
          return core;
        }

        async function renderFinaleV8() {
          music.play("finale",.40,true);
          const a=state.archive||{};
          const blessing=await ensureFinalBlessing();
          view.innerHTML=`<div class="hj-finale">
            ${musicTop("嘉礼落幕","night")}
            <div class="hj-finale-inner">
              <div class="hj-finale-kicker">嘉 礼 既 成</div>
              <div class="hj-finale-title">礼成</div>
              <div class="hj-finale-names">${esc(a.userMarriageName||userName())} · ${esc(a.partnerMarriageName||partnerName())}</div>
              <div class="hj-finale-rule"></div>
              <div class="hj-finale-letter">${esc(blessing).replace(/\\n/g,"<br>")}</div>
              <div class="hj-finale-music-note">余韵 · 嘉礼终章</div><div class="hj-finale-memory">${a.writeRocheMemory
                ? (a.memoryWriteStatus==="done"?"今日已珍藏进 Roche 主记忆":a.memoryWriteStatus==="unsupported"?"当前 Roche 版本未开放可用的主记忆写入接口，婚礼仍已完整保存在《合卺书》内":"落幕时将尝试把成婚事实与婚誓写入 Roche 主记忆")
                : "这场婚礼只保存在《合卺书》内部，不写入 Roche 主记忆"}</div>
              <div class="hj-finale-actions">
                <button class="hj-secondary" data-action="revisit-book-v8">再看一眼婚书</button>
                <button class="hj-primary" data-action="accept-finale-v8">收下这份祝福</button>
              </div>
            </div>
          </div>`;
          bind();
        }

        async function saveArchive(patch) {
          if (!state.archive) {
            state.archive = {
              id: uid(),
              createdAt: Date.now(),
              status: "planning"
            };
          }
          state.archive = Object.assign({}, state.archive, patch, {savedAt:Date.now()});
          const list = (await safeGet(storage, "marriageArchives", [])).filter(x => x.id !== state.archive.id);
          list.push(state.archive);
          state.archives = list;
          await storage.set("marriageArchives", list);
          await storage.set("currentMarriageId", state.archive.id);
        }

        async function createNewMarriage() {
          state.archive = null;
          state.selectedChar = null;
          state.selectedUser = state.user || state.users[0] || null;
          const fresh = {
            id: uid(),
            createdAt: Date.now(),
            status: "planning",
            rituals: {},
            scenes: {},
            blessing: "",
            vowUser: "",
            vowPartner: "",
            latestNote: "",
            completedAt: null,
            directorStage: "choose",
            preLetter: "",
            prePerspective: "user",
            preNightLine: "",
            groomNightLine: "",
            preCustomLine: "",
            processionLine: "",
            doorAnswer: "",
            firstLook: "",
            bowDone: false,
            bowStep: 0,
            bowLine: "",
            tonglaoFood: "",
            hejinDone: false,
            hairKeepsake: false,
            userSealAt: null,
            partnerSealAt: null,
            sedanLine: "",
            washLine: "",
            tonglaoLine: "",
            hejinLine: "",
            hairLine: "",
            veilLine: "",
            veilOpened: false,
            nightLine: "",
            nightStory: [],
            morningLine: "",
            vowReaction: "",
            partnerSealLine: "",
            notes: [],
            showMemories: false,
            writeRocheMemory: false,
            memoryWriteStatus: "",
            banquetEntryLine: "",
            banquetEndLine: "",
            returnRoomLine: "",
            finalBlessing: ""
          };
          state.archive = fresh;
          await saveArchive({});
          renderChooseV5();
        }


        function bindLongPress() {
          const el = view.querySelector("#hj-longpress");
          if (!el) return;
          let timer = null, raf = null, start = 0, done = false;
          const ring = el.querySelector(".hj-longpress-ring");

          const stop = () => {
            clearTimeout(timer); cancelAnimationFrame(raf);
            el.classList.remove("holding");
            if (!done) ring?.style.setProperty("--hold","0%");
          };
          const tick = () => {
            const p = Math.min(100, ((performance.now()-start)/1200)*100);
            ring?.style.setProperty("--hold", `${p}%`);
            if (p < 100 && !done) raf = requestAnimationFrame(tick);
          };
          const begin = (ev) => {
            ev.preventDefault();
            done = false; start = performance.now();
            el.classList.add("holding");
            raf = requestAnimationFrame(tick);
            timer = setTimeout(async () => {
              done = true;
              await saveArchive({status:"ceremony-complete"});
              try { navigator.vibrate?.(45); } catch(_){}
              toast("嘉礼成 · 此书既成，岁岁为证");
              setTimeout(renderCeremonyComplete, 650);
            },1200);
          };
          el.addEventListener("pointerdown", begin);
          ["pointerup","pointercancel","pointerleave"].forEach(t=>el.addEventListener(t, stop));
        }

        function bind() {
          root.querySelectorAll("[data-action]").forEach(el=>{
            if(el.__hjBound) return; el.__hjBound=true;
            el.addEventListener("click",async()=>{
              try {
              const action=el.dataset.action;
              if(action==="close") { music.stop(); return roche.ui.closeApp(); }
              if(action==="music-toggle") return music.toggle();
              if(action==="close-help") return el.closest(".hj-help-sheet")?.remove();
              if(action==="show-help") return showHelp(el.dataset.title||"此礼",el.dataset.help||"");
              if(action==="home") return renderHomeV5();
              if(action==="back"){
                const t=el.dataset.target;
                const map={home:renderHomeV5,jialirecord:renderJialiRecordV10,choose:renderChooseV5,names:renderNamesV5,prewedding:renderPreWeddingV5,procession:renderProcessionV5,door:()=>renderDoorV5(),fan:()=>renderFanV5(2),hand:renderHandV5,sedan:renderSedanV5,arrival:renderArrivalV5,hall:renderHallV5,bow:renderBowV7,wash:()=>renderWashV5(true),tonglao:()=>renderTonglaoV5(state.archive?.tonglaoFood||""),hejin:()=>renderHejinV5(true),hair:renderHairV5,vows:renderVowsV5,book:()=>renderBookV5("done"),complete:renderCeremonyCompleteV5,bridalentry:renderBridalEntryV9,veil:renderVeilLiftV6,bridalrest:renderBridalRestV9,banquetentry:renderBanquetEntryV8,banquet:renderBanquetV5,banquetend:renderBanquetEndV8,returnroom:renderReturnRoomV8,night:renderNightV5,finale:renderFinaleV8};
                return (map[t]||renderHomeV5)();
              }
              if(action==="toggle-main-memory-v8"){
                await saveArchive({writeRocheMemory:!state.archive?.writeRocheMemory});
                return renderChooseV5();
              }
              if(action==="open-custom-v8") return showCustomSheet(el.dataset.stage);
              if(action==="close-custom-v8") return el.closest(".hj-custom-sheet")?.remove();
              if(action==="submit-custom-v8"){
                const stage=el.dataset.stage;
                const cfg=CUSTOM_SCENE_CONFIG[stage];
                const input=root.querySelector("#hj-custom-input")?.value.trim();
                if(!cfg||!input)return toast("先写下这一刻你想做什么");

                if(stage==="bridalrest" || stage==="night"){
                  const key=stage==="bridalrest"?"bridalRestStory":"nightStory";
                  const turns=storyTurns(key);
                  const ctx=storyContext(turns,6);
                  const phase=stage==="bridalrest"
                    ? `红盖头已经揭下，喜宴尚未开始，USER与${partnerDisplayName()}仍在喜房里短暂独处。`
                    : `喜宴已经结束，两人已经归房。今天所有礼仪都完成了，房里只剩 USER 与${partnerDisplayName()}。`;
                  await withGenerateButton(el,"正在续写这一刻",async()=>{
                    const t=await weddingSceneText(
                      `${phase}\n\n${ctx?`以下是这一场景已经发生的连续前文，请严格接着它往下写，不要重新开场，也不要重复已经发生的动作：\n${ctx}\n\n`:""}USER此刻选择：“${input}”。请直接续写下一段剧情，让${partnerDisplayName()}自然回应。不要总结前文，不要跳时间，不要擅自结束场景。`,220);
                    await appendStoryTurn(key,`自定义 · ${input}`,t,stage);
                  });
                  root.querySelector(".hj-custom-sheet")?.remove();
                  return renderStageByName(stage);
                }

                await withGenerateButton(el,"正在写入这一刻",async()=>{
                  const t=await weddingSceneText(cfg.task(input),190);
                  await saveArchive({[cfg.saveKey]:t,directorStage:cfg.rerender});
                });
                root.querySelector(".hj-custom-sheet")?.remove();
                return renderStageByName(cfg.rerender);
              }
              if(action==="pre-view-v8"){await saveArchive({prePerspective:el.dataset.view||"user",preDisplayLine:""});return renderPreWeddingV5()}
              if(action==="pre-listen-v8"||action==="pre-book-v8"||action==="pre-groom-v8"){
                const isGroom=action==="pre-groom-v8";
                const task=isGroom
                  ? `大婚前夜，镜头切到${partnerDisplayName()}自己的房间。他与 USER 此刻分处两地。写一段婚前夜：婚服、灯火、亲友的提醒，以及他独自准备明日迎亲的动作。绝不能让他和 USER 发生任何物理接触；人物语言保持现代自然，但不要主动写手机、社交软件等物件。`
                  : action==="pre-listen-v8"
                  ? `大婚前夜，USER在自己的住处听窗外和屋里的动静。写亲友为明日婚礼收拾、提醒、说话的一两笔。人物关系保持现代自然，但不要刻意写现代设备。${partnerDisplayName()}不在现场。`
                  : `大婚前夜，USER又看了一眼已经题好姓名与吉期、婚誓与双印仍留白的婚书。写一段安静旁白，明确${partnerDisplayName()}此刻在另一处准备明日迎亲，不得写他抱她、站在她身后或同处一室。`;
                await withGenerateButton(el,isGroom?"正在看他那边":"这一夜仍在继续",async()=>{
                  const t=await weddingSceneText(task,190);
                  await saveArchive(isGroom?{groomNightLine:t,prePerspective:"groom",preDisplayLine:"",directorStage:"prewedding"}:{preNightLine:t,prePerspective:"user",preDisplayLine:"",directorStage:"prewedding"});
                });
                return renderPreWeddingV5();
              }
              if(action==="procession-look-v8"||action==="procession-hear-v8"){
                const task=action==="procession-look-v8"
                  ? `现代中式婚礼迎亲队伍已经到了近前。USER隔窗看了一眼。写具体群众现场：亲友、观礼的人或宾客中的一两笔，再写${partnerDisplayName()}在迎亲队伍中的动作。不要古代百姓叙事。`
                  : `现代中式婚礼迎亲将至。USER没有看，只听脚步、礼乐、朋友起哄和工作人员提醒。写一段以声音、礼乐和人声为主的现场剧情，让她能从人群中辨认出${partnerDisplayName()}越来越近。`;
                await withGenerateButton(el,action==="procession-look-v8"?"正在看迎亲队伍":"正在听越来越近的脚步",async()=>{
                  const t=await weddingSceneText(task,190);
                  await saveArchive({processionLine:t,directorStage:"procession"});
                });
                return renderProcessionV5();
              }
              if(action==="open-save-v85") return await showSaveSheet();
              if(action==="close-save-v85") return el.closest(".hj-save-sheet")?.remove();

              if(action==="create-save-slot-v10"){
                const name=root.querySelector("#hj-new-slot-name")?.value.trim()||"";
                await createNamedSave(name);
                toast("这一刻已经珍藏");
                return await showSaveSheet();
              }
              if(action==="rename-save-slot-v10"){
                return showRenameSlotSheet(el.dataset.slot||"",el.dataset.name||"");
              }
              if(action==="cancel-rename-slot-v10"){
                return el.closest(".hj-rename-sheet")?.remove();
              }
              if(action==="confirm-rename-slot-v10"){
                const input=root.querySelector("#hj-rename-slot-input")?.value.trim()||"";
                await renameSaveSlot(el.dataset.slot||"",input);
                root.querySelector(".hj-rename-sheet")?.remove();
                toast("存档名字已改好");
                return await showSaveSheet();
              }
              if(action==="delete-save-slot-v10"){
                await deleteSaveSlot(el.dataset.slot||"");
                toast("这份存档已删除");
                return await showSaveSheet();
              }
              if(action==="load-save-slot-v10"){
                const ok=await restoreSaveSlot(el.dataset.slot||"");
                root.querySelector(".hj-save-sheet")?.remove();
                if(!ok)return toast("这份存档暂时无法读取");
                toast("已经回到这份存档");
                const s=state.archive?.directorStage||"prewedding";
                switch(s){
                  case "choose": return renderChooseV5();
                  case "names": return renderNamesV5();
                  case "prewedding": return renderPreWeddingV5();
                  case "procession": return renderProcessionV5();
                  case "door": return renderDoorV5();
                  case "fan": return renderFanV5(state.archive?.firstLook?2:0);
                  case "hand": return renderHandV5();
                  case "sedan": return renderSedanV5();
                  case "arrival": return renderArrivalV5();
                  case "hall": return renderHallV5();
                  case "bow": return renderBowV7();
                  case "wash": return renderWashV5(!!state.archive?.washDone);
                  case "tonglao": return renderTonglaoV5(state.archive?.tonglaoFood||"");
                  case "hejin": return renderHejinV5(!!state.archive?.hejinDone);
                  case "hair": return renderHairV5();
                  case "vows": return renderVowsV5();
                  case "book": return renderBookV5(state.archive?.partnerSealAt?"done":state.archive?.userSealAt?"partner":"user");
                  case "complete": return renderCeremonyCompleteV5();
                  case "bridalentry": return renderBridalEntryV9();
                  case "veil": return renderVeilLiftV6();
                  case "bridalrest": return renderBridalRestV9();
                  case "banquetentry": return renderBanquetEntryV8();
                  case "banquet": return renderBanquetV5();
                  case "banquetend": return renderBanquetEndV8();
                  case "returnroom": return renderReturnRoomV8();
                  case "night": return renderNightV5();
                  case "finale": return renderFinaleV8();
                  default:return renderHomeV5();
                }
              }

              if(action==="open-jiali-record-v10") return renderJialiRecordV10();
              if(action==="open-jiali-scroll-v10") return renderJialiScrollV10(el.dataset.id||"");
              if(action==="new-marriage") return createNewMarriage();
              if(action==="resume-married") return renderFinaleV8();
              if(action==="resume-wedding"){
                try{
                  await loadBase();
                  if(!state.archive) return renderHomeV5();
                  const s=state.archive.directorStage||"prewedding";
                  switch(s){
                    case "choose": return renderChooseV5();
                    case "names": return renderNamesV5();
                    case "prewedding": return renderPreWeddingV5();
                    case "procession": return renderProcessionV5();
                    case "door": return renderDoorV5();
                    case "fan": return renderFanV5(state.archive?.firstLook?2:0);
                    case "hand": return renderHandV5();
                    case "sedan": return renderSedanV5();
                    case "arrival": return renderArrivalV5();
                    case "hall": return renderHallV5();
                    case "bow": return renderBowV7();
                    case "wash": return renderWashV5(!!state.archive?.washDone);
                    case "tonglao": return renderTonglaoV5(state.archive?.tonglaoFood||"");
                    case "hejin": return renderHejinV5(!!state.archive?.hejinDone);
                    case "hair": return renderHairV5();
                    case "vows": return renderVowsV5();
                    case "book": return renderBookV5(state.archive?.partnerSealAt?"done":state.archive?.userSealAt?"partner":"user");
                    case "complete": return renderCeremonyCompleteV5();
                    case "bridalentry": return renderBridalEntryV9();
                    case "veil": return renderVeilLiftV6();
                    case "bridalrest": return renderBridalRestV9();
                    case "banquetentry": return renderBanquetEntryV8();
                    case "banquet": return renderBanquetV5();
                    case "banquetend": return renderBanquetEndV8();
                    case "returnroom": return renderReturnRoomV8();
                    case "night": return renderNightV5();
                    case "finale": return renderFinaleV8();
                    default: return renderPreWeddingV5();
                  }
                }catch(error){
                  console.error("[合卺书] 续礼失败",error);
                  toast("存档读取失败，请再试一次");
                  return;
                }
              }
              if(action==="select-user"){
                const y=view.querySelector(".hj-page")?.scrollTop||0;
                state.selectedUser=state.users.find(u=>u.id===el.dataset.id)||state.selectedUser;
                renderChooseV5();requestAnimationFrame(()=>{const s=view.querySelector(".hj-page");if(s)s.scrollTop=y});return;
              }
              if(action==="select-char"){
                const y=view.querySelector(".hj-page")?.scrollTop||0;
                state.selectedChar=state.chars.find(c=>c.id===el.dataset.id)||null;
                renderChooseV5();requestAnimationFrame(()=>{const s=view.querySelector(".hj-page");if(s)s.scrollTop=y});return;
              }
              if(action==="to-names"){
                if(!state.selectedChar||!state.selectedUser) return toast("请先定下两位新人");
                await saveArchive({
                  partnerId:state.selectedChar.id,userPersonaId:state.selectedUser.id,
                  partnerSnapshot:{id:state.selectedChar.id,name:state.selectedChar.name||"",handle:state.selectedChar.handle||"",avatar:state.selectedChar.avatar||"",bio:state.selectedChar.bio||"",persona:state.selectedChar.persona||""},
                  userSnapshot:{id:state.selectedUser.id,name:state.selectedUser.name||"",handle:state.selectedUser.handle||"",avatar:state.selectedUser.avatar||"",bio:state.selectedUser.bio||"",persona:state.selectedUser.persona||""},
                  status:"planning",directorStage:"names"
                });
                return renderNamesV5();
              }
              if(action==="save-names-v5"){
                await saveArchive({userMarriageName:view.querySelector("#hj-user-name").value.trim()||userName(),partnerMarriageName:view.querySelector("#hj-partner-name").value.trim()||partnerName(),weddingDate:view.querySelector("#hj-date").value,status:"planning",directorStage:"prewedding"});
                return renderPreWeddingV5();
              }
              if(action==="gen-letter"){
                await withGenerateButton(el,`${partnerDisplayName()} 正在写婚前笺`,async()=>{
                  const raw=await weddingAwareText(
                    `现在是大婚前夜。你与 USER 分处两地，明日你会亲自去迎娶她。请写一封很短的婚前笺，只写真正会寄给她看的正文。不要动作旁白，不要古风模板，不要夸张誓言，也不要默认任何具体亲属或陪伴者存在。哪怕你平时嘴硬或寡言，也要让她知道：明日你会来。`,
                    170
                  );
                  const t=stripStageDirections(raw);
                  await saveArchive({
                    preLetter:t,
                    preDisplayLine:`婚前笺 · ${partnerDisplayName()}\n\n${t}`,
                    directorStage:"prewedding"
                  });
                });
                return renderPreWeddingV5();
              }
              if(action==="start-pickup-v5"){await saveArchive({status:"wedding-day",directorStage:"procession"});return renderProcessionV5()}
              if(action==="to-door-v5"){await saveArchive({directorStage:"door"});return renderDoorV5()}
              if(action==="door-q1-v82"){
                await withGenerateButton(el,`${partnerDisplayName()} 正在认真回答`,async()=>{
                  const t=await weddingAwareText(
                    `迎亲已到朱门前。门里的人问新郎：“今日为何而来？”请只写新郎真正说出口的回答，不要动作旁白，不要模板古风，不要夸张誓言。必须贴合他原本人设、与 USER 的真实关系，并明确回答为什么今天愿意与她成婚。`,
                    150
                  );
                  await saveArchive({doorAnswer1:stripStageDirections(t),doorRound:2,directorStage:"door"});
                });
                return renderDoorV5();
              }
              if(action==="door-q2-v82"){
                await withGenerateButton(el,`${partnerDisplayName()} 正在回答第二问`,async()=>{
                  const t=await weddingAwareText(
                    `迎亲朱门第二问。门里问新郎：“此后漫长岁月，你愿如何待我？”请只写新郎真正说出口的回答。不要套用古风誓词，不要空泛承诺“永远不会让你受委屈”；要用符合他本人性格的语言，回答婚后具体愿意如何尊重、陪伴、商量、承担与过日子。`,
                    180
                  );
                  await saveArchive({doorAnswer2:stripStageDirections(t),doorRound:3,directorStage:"door"});
                });
                return renderDoorV5();
              }
              if(action==="door-custom-v82" || action==="door-custom-v91") return showDoorQuestionSheet(Number(el.dataset.round||1));
              if(action==="submit-door-custom-v82" || action==="submit-door-custom-v91"){
                const q=root.querySelector("#hj-door-custom-question")?.value.trim();
                if(!q)return toast("先写下你真正想问他的问题");
                const round=Number(el.dataset.round || (state.archive?.doorAnswer1||state.archive?.doorCustomAnswer1||state.archive?.doorCustomAnswer ? 2 : 1));
                await withGenerateButton(el,`${partnerDisplayName()} 正在回答你`,async()=>{
                  const t=await weddingAwareText(
                    `迎亲朱门第${round===1?"一":"二"}问。USER隔着门亲自问新郎：“${q}” 请只写新郎真正说出口的回答，不要替 USER 增加动作或心理，不要模板化，要贴合他原本人设和双方关系。`,180);
                  const ans=stripStageDirections(t);
                  if(round===1){
                    await saveArchive({doorCustomQuestion1:q,doorCustomAnswer1:ans,doorCustomQuestion:q,doorCustomAnswer:ans,doorRound:2,directorStage:"door"});
                  }else{
                    await saveArchive({doorCustomQuestion2:q,doorCustomAnswer2:ans,doorRound:3,directorStage:"door"});
                  }
                });
                root.querySelector(".hj-custom-sheet")?.remove();
                return renderDoorV5();
              }
              if(action==="door-open-v5"){
                await saveArchive({directorStage:"fan"});
                return renderFanV5(0);
              }
              if(action==="fan-call"||action==="fan-wait"){
                const label=action==="fan-call"?`${partnerDisplayName()} 正在隔扇回应`:"他在扇外等你";
                await withGenerateButton(el,label,async()=>{
                  const task=action==="fan-call"
                    ? `却扇尚未移开，USER隔着团扇轻声唤了新郎。写一小段现场反应：${partnerDisplayName()}如何停步、回应，以及说出口的一句话。`
                    : `却扇将移未移，USER又等了一瞬。写一小段现场反应：${partnerDisplayName()}如何安静等她，不催促她。`;
                  const t=await weddingSceneText(task,150);
                  await saveArchive({firstLook:t,directorStage:"fan"});
                });
                return renderFanV5(action==="fan-wait"?1:0);
              }
              if(action==="fan-touch"){
                const p=Number(el.dataset.peek||1);
                if(p>=2 && !state.loading){
                  await withGenerateButton(el,`${partnerDisplayName()} 正在看向你`,async()=>{
                    const t=await weddingSceneText(`团扇终于移开。写一小段现场剧情：${partnerDisplayName()}第一次完整看见穿着婚服的 USER。动作可以停顿、失神、克制或笑，但必须符合人设；最后允许有一句直接对白。`,170);
                    await saveArchive({firstLook:t,directorStage:"fan"});
                  });
                }
                return renderFanV5(p);
              }
              if(action==="to-hand-v5"){await saveArchive({directorStage:"hand"});return renderHandV5()}
              if(action==="take-hand-v5"){
                try{navigator.vibrate?.(30)}catch(_){}
                await withGenerateButton(el,`${partnerDisplayName()} 正牵你出阁`,async()=>{
                  const t=await weddingSceneText(
                    `USER主动牵住${partnerDisplayName()}的手，准备出阁。写一段从门内走到门外的过渡剧情：他回握、放慢脚步、陪她越过门槛；周围只写“身边的人、亲友、来宾”等中性群像，不得默认母亲、父亲、身边的人、兄弟姐妹等具体关系。结尾要自然落到“花轿就在前方”。`,
                    180
                  );
                  await saveArchive({handTaken:true,handLine:t,directorStage:"hand"});
                });
                return renderHandV5();
              }
              if(action==="escort-to-sedan-v83"){
                await withGenerateButton(el,`${partnerDisplayName()} 正扶你上轿`,async()=>{
                  const t=await weddingSceneText(
                    `出阁后，${partnerDisplayName()}牵着 USER 一路走到花轿前，并亲自扶送她上轿。写一段完整过渡剧情：走到轿前、他扶稳她、待她坐好后才松手，轿帘将要落下。不得默认任何具体亲属或身边的人存在。`,
                    175
                  );
                  await saveArchive({sedanBoardingLine:t,directorStage:"sedan"});
                });
                return renderSedanV5();
              }
              if(["sedan-curtain","sedan-call","sedan-listen"].includes(action)){
                const labels={ "sedan-curtain":"轿帘轻轻掀起","sedan-call":`${partnerDisplayName()} 正在回应你`,"sedan-listen":"正在听一路的声音" };
                await withGenerateButton(el,labels[action],async()=>{
                  const task=action==="sedan-curtain"
                    ? `花轿归程中，USER掀开一点轿帘。写一小段现场剧情，必须让${partnerDisplayName()}自然存在于迎亲队伍中，可以是他在轿侧回头、察觉帘动或隔着人群看见这一幕。`
                    : action==="sedan-call"
                    ? `花轿归程中，USER隔着轿帘唤了${partnerDisplayName()}一声。写一小段现场剧情，让${partnerDisplayName()}自然回应她。`
                    : `花轿归程中，USER没有说话，只安静听路上的声音。写一小段氛围剧情，并让${partnerDisplayName()}以很轻的方式存在于场景里，不必强行说情话。`;
                  const t=await weddingSceneText(task,180);
                  await saveArchive({sedanLine:t,directorStage:"sedan"});
                });
                return renderSedanV5();
              }
              if(action==="arrive-v5"){await saveArchive({directorStage:"arrival"});return renderArrivalV5()}
              if(action==="arrival-hand-v82"||action==="arrival-pause-v82"){
                const task=action==="arrival-hand-v82"
                  ? `花轿已经停在喜堂前。USER主动把手交给${partnerDisplayName()}。写一段有仪式感但不过分煽情的下轿剧情：他如何接住她、扶她落地，并带一两笔门前亲友安静等待的氛围。`
                  : `花轿已经停在喜堂前，${partnerDisplayName()}伸手来接 USER。USER故意停了一瞬，没有立刻把手交给他。写他察觉后的真实反应，可以有一句短话；不要催促，不要替 USER 描写心理。`;
                await withGenerateButton(el,action==="arrival-hand-v82"?"他正扶你下轿":"他停下来等你",async()=>{
                  const t=await weddingSceneText(task,175);
                  await saveArchive({arrivalLine:t,directorStage:"arrival"});
                });
                return renderArrivalV5();
              }
              if(action==="to-hall-v5"){await saveArchive({directorStage:"hall"});return renderHallV5()}
              if(action==="to-bow-v7"){await saveArchive({directorStage:"bow"});return renderBowV7()}
              if(action==="perform-bow-v7"){
                try{navigator.vibrate?.(25)}catch(_){}
                const step=Number(state.archive?.bowStep||0);
                const names=["一拜天地","二拜见证","夫妻对拜"];
                await withGenerateButton(el,`${partnerDisplayName()} 正与你行 ${names[step]||"此拜"}`,async()=>{
                  const task=step===0
                    ? `拜堂第一礼“一拜天地”。写${partnerDisplayName()}与 USER 同时郑重行礼的现场，加入堂前宾客短暂安静、衣袂与烛火等细节。`
                    : step===1
                    ? `拜堂第二礼“二拜见证”。这里向今日在堂前见证婚礼的亲友与重要之人致礼，不强制父母或具体家庭关系。写一段克制的现场剧情。`
                    : `拜堂第三礼“夫妻对拜”。写${partnerDisplayName()}与 USER 相向而拜，强调彼此平等、认真选择对方；可以有一处极短的停顿或一句符合人设的话。`;
                  const t=await weddingSceneText(task,170);
                  await saveArchive({
                    bowStep:Math.min(3,step+1),
                    bowDone:step+1>=3,
                    bowLine:t,
                    directorStage:"bow"
                  });
                });
                return renderBowV7();
              }
              if(action==="to-wash-v5"){await saveArchive({directorStage:"wash"});return renderWashV5(false)}
              if(action==="wash-water"){
                try{navigator.vibrate?.(18)}catch(_){}
                await withGenerateButton(el,"水纹轻动",async()=>{
                  const t=await weddingSceneText(`沃盥礼中，USER触水净手。写一小段克制的现场剧情，让${partnerDisplayName()}随后净手，或自然递帕、接帕。不要过度浪漫化。`,130);
                  await saveArchive({washDone:true,washLine:t,directorStage:"wash"});
                });
                return renderWashV5(true);
              }
              if(action==="to-tonglao-v5"){await saveArchive({directorStage:"tonglao"});return renderTonglaoV5()}
              if(action==="choose-food"){
                const f=el.dataset.food;
                await withGenerateButton(el,`${partnerDisplayName()} 与你同食`,async()=>{
                  const t=await weddingSceneText(`同牢礼中，USER先选了“${f}”。写一小段现场剧情，让${partnerDisplayName()}依照原本人设与她同席共食，可以有一个很生活化的小动作或一句短话。`,150);
                  await saveArchive({tonglaoFood:f,tonglaoLine:t,directorStage:"tonglao"});
                });
                return renderTonglaoV5(f);
              }
              if(action==="tonglao-next-v85" || action==="to-hejin-v5"){
                if(state.loading) return;
                await saveArchive({directorStage:"hejin"});
                return renderHejinV5(false);
              }
              if(action==="lift-cup"){return renderHejinV5(true)}
              if(action==="drink-hejin"){
                try{navigator.vibrate?.(28)}catch(_){}
                await withGenerateButton(el,`与 ${partnerDisplayName()} 共饮`,async()=>{
                  const t=await weddingSceneText(`合卺礼完成。写一小段现场剧情：${partnerDisplayName()}与 USER 同饮后放下卺杯，这一刻他明确意识到两人正在正式成为夫妻。不要模板情话。`,150);
                  await saveArchive({hejinLine:t,hejinDone:true,directorStage:"hejin"});
                });
                return renderHejinV5(true);
              }
              if(action==="to-hair-v6"){await saveArchive({directorStage:"hair"});return renderHairV5()}
              if(action==="tie-hair-v5"){
                try{navigator.vibrate?.(24)}catch(_){}
                await withGenerateButton(el,"红线正在系紧",async()=>{
                  const t=await weddingSceneText(`结发礼中，两缕青丝已经以红线同系并收入锦囊。写一小段现场剧情，让${partnerDisplayName()}亲手收好这件信物，动作和一句话需符合原本人设。`,150);
                  await saveArchive({hairKeepsake:true,hairLine:t,directorStage:"hair"});
                });
                return renderHairV5();
              }
              if(action==="to-vows-v6"){await saveArchive({directorStage:"vows"});return renderVowsV5()}
              if(action==="draft-user-vow"){
                if(state.loading)return;
                state.loading=true;
                const doneLoading=beginGenerating(el,"正在为你拟誓");
                try{
                  const raw=await weddingAwareText("请站在 USER 的视角，依据 USER 人设与双方关系，草拟一段不超过180字、可以直接写进婚书的婚誓正文。不要动作、心理、旁白、括号说明，不要替 USER 编造重大经历，不要套用古风模板，必须可以被她继续编辑。",180);
                  const t=stripStageDirections(raw);
                  const box=view.querySelector("#hj-vow-user-v5");
                  if(box) box.value=t;
                }catch(_){toast("生成失败")}
                finally{state.loading=false;doneLoading()}
                return;
              }
              if(action==="save-vows-v5"){
                const v=stripStageDirections(view.querySelector("#hj-vow-user-v5").value.trim());
                if(!v)return toast("先写下你的婚誓");
                if(!state.archive?.vowReaction||state.archive?.vowUser!==v){
                  await withGenerateButton(el,`${partnerDisplayName()} 正在听你的婚誓`,async()=>{
                    await saveArchive({vowUser:v,directorStage:"vows"});
                    const t=await weddingSceneText(`${partnerDisplayName()}刚刚完整听见 USER 写下并说出口的婚誓：“${v}”。写他听完后的真实反应，可以有一个很细微的动作和一句简短回应。必须贴合他原本人设，不要替 USER 描写动作或情绪，不要模板情话。`,170);
                    await saveArchive({vowReaction:t,directorStage:"vows"});
                  });
                  return renderVowsV5();
                }
                await saveArchive({vowUser:v,directorStage:"book",marriageNo:state.archive?.marriageNo||("HJ-"+Date.now().toString(36).toUpperCase())});
                return renderBookV5("user");
              }
              if(action==="partner-seal"){
                await withGenerateButton(el,`${partnerDisplayName()} 正在郑重落印`,async()=>{
                  const t=await weddingSceneText(`婚书上已经写好双方婚名与婚誓，USER 的姓名印已经落下。现在轮到${partnerDisplayName()}落下自己的姓名印。写他看见婚书、郑重落印时的一段现场剧情，可以有一句属于他本人的短话；动作克制，体现这是双方平等确认婚约的时刻。`,170);
                  try{navigator.vibrate?.(45)}catch(_){}
                  await saveArchive({partnerSealAt:Date.now(),partnerSealLine:t,directorStage:"book"});
                });
                return renderBookV5("done");
              }
              if(action==="ceremony-complete-v5"){await saveArchive({directorStage:"complete",status:"ceremony-complete"});return renderCeremonyCompleteV5()}
              if(action==="to-banquet-v5" || action==="to-bridal-entry-v90"){await saveArchive({directorStage:"bridalentry"});return renderBridalEntryV9()}
              if(action==="bridal-entry-wait-v90"||action==="bridal-entry-call-v90"){
                const task=action==="bridal-entry-wait-v90"
                  ? `正礼已经结束，USER仍覆着红盖头，与${partnerDisplayName()}暂归喜房。USER没有催促，只安静等他走近。写一段很轻的现场剧情：他的脚步、停顿、呼吸或一句极短的低语。不要揭盖头，不要替 USER 描写心理。`
                  : `正礼已经结束，USER仍覆着红盖头，与${partnerDisplayName()}暂归喜房。USER先轻声唤了他的名字。写他听见后的真实反应，可以有一句符合人设的回答，但不要揭盖头。`;
                await withGenerateButton(el,action==="bridal-entry-wait-v90"?"他正向你走近":"他听见了你的声音",async()=>{
                  const t=await weddingSceneText(task,175);
                  await saveArchive({bridalEntryLine:t,directorStage:"bridalentry"});
                });
                return renderBridalEntryV9();
              }
              if(action==="to-veil-v90"){await saveArchive({directorStage:"veil"});return renderVeilLiftV6()}
              if(action==="veil-hand-v90"){
                await withGenerateButton(el,`${partnerDisplayName()} 正握住你的手`,async()=>{
                  const t=await weddingSceneText(`正礼告成后的喜房里，红盖头还没有揭开。USER隔着垂下的红绸，主动握住${partnerDisplayName()}的手。写一段很近、很安静的回应；动作主体用他的姓名或“他”，先不要揭盖头。`,160);
                  await saveArchive({veilLine:t,veilOpened:false,directorStage:"veil"});
                });
                return renderVeilLiftV6();
              }
              if(action==="veil-after-word-v90"){
                await withGenerateButton(el,`${partnerDisplayName()} 正看着你`,async()=>{
                  const t=await weddingSceneText(`红盖头刚刚揭下。喜宴尚未开始，喜房里短暂只剩 USER 与${partnerDisplayName()}。USER先和他说了一句话。请写他最自然的回应与极少量动作，不要模板化夸赞外貌，不要描写具体五官。`,170);
                  await saveArchive({veilLine:t,veilOpened:true,directorStage:"veil"});
                });
                return renderVeilLiftV6();
              }
              if(action==="to-bridal-rest-v90"){await saveArchive({directorStage:"bridalrest"});return renderBridalRestV9()}
              if(["bridal-rest-sit-v90","bridal-rest-ask-v90","bridal-rest-sit-v91","bridal-rest-ask-v91","bridal-rest-near-v91"].includes(action)){
                const turns=storyTurns("bridalRestStory");
                const ctx=storyContext(turns,6);
                const kind=action.includes("sit")?"sit":action.includes("ask")?"ask":"near";
                const label=kind==="sit"?"与你静坐片刻":kind==="ask"?"问他方才在想什么":"靠近他一些";
                const instruction=kind==="sit"
                  ? `USER没有急着赴宴，只和${partnerDisplayName()}在喜房里安静坐一小会儿。`
                  : kind==="ask"
                  ? `USER问${partnerDisplayName()}：“方才揭开盖头的时候，你在想什么？”`
                  : `USER主动朝${partnerDisplayName()}靠近了一些。不要替 USER 再增加其它动作。`;
                await withGenerateButton(el,kind==="ask"?"他正在想怎么回答":"这一刻正在继续",async()=>{
                  const t=await weddingSceneText(
                    `红盖头已经揭下，喜宴尚未开始，二人仍在喜房里。\n\n${ctx?`这是刚刚已经发生的连续前文，请严格接着写：\n${ctx}\n\n`:""}${instruction} 请续写下一段，保持空间、动作、情绪连续，不要重新介绍场景，不要总结，不要把剧情直接推进到赴宴。`,220);
                  await appendStoryTurn("bridalRestStory",label,t,"bridalrest");
                });
                return renderBridalRestV9();
              }
              if(action==="to-banquet-entry-v90"){await saveArchive({directorStage:"banquetentry"});return renderBanquetEntryV8()}
              if(action==="banquet-entry-look-v8"||action==="banquet-entry-char-v8"){
                const task=action==="banquet-entry-look-v8"
                  ? `现代中式婚礼正礼结束，新人正进入宴席。写一段入宴现场：宾客重新说笑、朋友举杯、司礼退场后满堂渐渐热闹起来。焦点仍在两位新人。`
                  : `现代中式婚礼正礼结束，${partnerDisplayName()}刚进入宴席就被朋友或同事围住。写一段他如何以自己原本性格应付起哄、敬酒或玩笑，同时下意识留意 USER 在哪里。`;
                await withGenerateButton(el,"宴席重新热闹起来",async()=>{
                  const t=await weddingSceneText(task,180);
                  await saveArchive({banquetEntryLine:t,directorStage:"banquetentry"});
                });
                return renderBanquetEntryV8();
              }
              if(action==="enter-banquet-v8"){await saveArchive({directorStage:"banquet"});return renderBanquetV5()}
              if(action==="banquet-friend-v8"){
                await withGenerateButton(el,"朋友们正笑着起哄",async()=>{
                  const t=await weddingSceneText(`现代中式婚礼喜宴上，朋友们开始自然起哄或祝福。写一段具体、轻松、不低俗的群众互动，并让${partnerDisplayName()}按原本人设回应。`,180);
                  await saveArchive({banquetLine:t,directorStage:"banquet"});
                });
                return renderBanquetV5();
              }
              if(action==="banquet-talk-v5"||action==="banquet-toast-v5"){
                if(state.loading)return;
                state.loading=true;
                const doneLoading=beginGenerating(el,action==="banquet-toast-v5"?"他正与你举杯":"他发现你在看他");
                const task=action==="banquet-toast-v5"?`喜宴上，${partnerDisplayName()}与新婚妻子一起举杯。写一小段有现场氛围的剧情，叙述使用角色姓名或“他”，可以有一句轻松但真诚的对白。`:`喜宴正热闹，${partnerDisplayName()}发现 USER 在看他。写一小段自然克制的现场剧情，以他本人会有的方式回应，可以有一句对白。`;
                try{
                  const t=await weddingSceneText(task,150);
                  await saveArchive({banquetLine:t});
                }catch(_){toast("生成失败")}
                finally{state.loading=false;doneLoading()}
                return renderBanquetV5();
              }
              if(action==="banquet-end-v8"){await saveArchive({directorStage:"banquetend"});return renderBanquetEndV8()}
              if(action==="banquet-goodbye-v8"||action==="banquet-wait-char-v8"){
                const task=action==="banquet-goodbye-v8"
                  ? `现代中式婚礼已经接近散席。写新人和最后一拨亲友、朋友告别的现场，席间人声渐少、杯盏渐空。不要夸张煽情。`
                  : `喜宴将散，${partnerDisplayName()}还被朋友或宾客留住说最后几句话，USER在一旁等他。写一段他从人群里重新走回她身边的现场剧情。`;
                await withGenerateButton(el,"宴席正在慢慢散去",async()=>{
                  const t=await weddingSceneText(task,180);
                  await saveArchive({banquetEndLine:t,directorStage:"banquetend"});
                });
                return renderBanquetEndV8();
              }
              if(action==="return-room-v8"){await saveArchive({directorStage:"returnroom"});return renderReturnRoomV8()}
              if(action==="return-room-talk-v8"||action==="return-room-silent-v8"){
                const task=action==="return-room-talk-v8"
                  ? `现代中式婚礼散席后，新人沿走廊一起回婚房。USER主动和${partnerDisplayName()}说了一句话。写一段从喧闹到安静的过场，并让他回应。`
                  : `现代中式婚礼散席后，新人什么也没说，只一起走回婚房。写环境声音逐渐远去、两人并肩走回去的安静过场。`;
                await withGenerateButton(el,"人声正在身后远去",async()=>{
                  const t=await weddingSceneText(task,175);
                  await saveArchive({returnRoomLine:t,directorStage:"returnroom"});
                });
                return renderReturnRoomV8();
              }
              if(action==="to-veil-v8" || action==="to-night-v90"){await saveArchive({directorStage:"night"});return renderNightV5()}

              if(action==="veil-call"){
                await withGenerateButton(el,`${partnerDisplayName()} 正在靠近`,async()=>{
                  const t=await weddingSceneText(`洞房花烛中，红盖头还没有揭开。USER隔着盖头唤了${partnerDisplayName()}一声。写一小段极近距离的现场剧情，让他回应她，但先不要揭盖头。`,150);
                  await saveArchive({veilLine:t,veilOpened:false,directorStage:"veil"});
                });
                return renderVeilLiftV6();
              }
              if(action==="veil-open"){
                await withGenerateButton(el,`${partnerDisplayName()} 正在揭开盖头`,async()=>{
                  const t=await weddingSceneText(`洞房花烛中，${partnerDisplayName()}亲手揭开 USER 的红盖头。写一小段现场剧情，叙述必须用${partnerDisplayName()}或“他”作为动作主体；可以有一句他真正说出口的话。不要描写具体脸部五官。`,180);
                  await saveArchive({veilLine:t,veilOpened:true,directorStage:"veil"});
                });
                return renderVeilLiftV6();
              }
              if(action==="to-night-v6"){await saveArchive({directorStage:"night"});return renderNightV5()}
              if(["night-question","night-look","night-future","night-question-v91","night-look-v91","night-future-v91"].includes(action)){
                const turns=storyTurns("nightStory");
                const ctx=storyContext(turns,6);
                const kind=action.includes("question")?"question":action.includes("look")?"look":"future";
                const label=kind==="question"?"问他：今天什么时候最紧张？":kind==="look"?"问他：今天最想记住哪一刻？":"问他：婚后最想一起做什么？";
                const question=kind==="question"
                  ? `USER问${partnerDisplayName()}：“今天什么时候最紧张？”`
                  : kind==="look"
                  ? `USER问${partnerDisplayName()}：“今天最想记住哪一刻？”`
                  : `USER问${partnerDisplayName()}：“婚后最想一起做什么？”`;
                await withGenerateButton(el,"他正在回答你",async()=>{
                  const t=await weddingSceneText(
                    `喜宴已经结束，两人已经归房。今天所有礼仪都完成了，房里只剩 USER 与${partnerDisplayName()}。\n\n${ctx?`这是花烛夜已经发生的连续前文，请严格接着写：\n${ctx}\n\n`:""}${question} 请续写他的真实回答与少量自然动作。不要重新开场，不要总结前文，不要突然结束花烛夜。`,220);
                  await appendStoryTurn("nightStory",label,t,"night");
                });
                return renderNightV5();
              }
              if(action==="finish-wedding-v8"){await saveArchive({completedAt:state.archive?.completedAt||Date.now(),status:"married",directorStage:"finale"});return renderFinaleV8()}
              if(action==="revisit-book-v8") return renderBookV5("done","finale");
              if(action==="return-finale-v90") return renderFinaleV8();
              if(action==="accept-finale-v8"){
                if(state.archive?.writeRocheMemory && state.archive?.memoryWriteStatus!=="done"){
                  const end=beginGenerating(el,"正在珍藏今日");
                  const result=await writeWeddingToRocheMemory();
                  end();
                  await saveArchive({memoryWriteStatus:result.ok?"done":result.skipped?"skipped":"unsupported"});
                  if(!result.ok && !result.skipped) toast("主记忆接口暂不可用，婚礼仍已完整保存");
                }
                return renderFinaleV8();
              }
              if(action==="certificate-v5") return renderBookV5("done","finale");
              if(action==="toggle-memories-v7"){await saveArchive({showMemories:!state.archive?.showMemories});return renderFinaleV8()}
              if(action==="save-note-v5"){
                const n=view.querySelector("#hj-note")?.value.trim();
                if(!n)return toast("先写下想留给今天的话");
                const end=beginGenerating(el,"正在保存");
                const createdAt=Date.now();
                const oldNotes=Array.isArray(state.archive?.notes)?state.archive.notes:state.archive?.latestNote?[{text:state.archive.latestNote,createdAt:state.archive.latestNoteAt||createdAt}]:[];
                await saveArchive({latestNote:n,latestNoteAt:createdAt,notes:[...oldNotes,{text:n,createdAt}]});
                end();
                renderFinaleV8();
                return;
              }
              } catch(error) {
                console.error("[合卺书] 按钮执行失败", el.dataset.action, error);
                toast("这一处没有顺利继续，请再点一次");
              }
            });
          });
          updateMusicButtons();
        }

        await loadBase();
        preloadAssets(["bridePrep","bridalRoomAlt","pickupDoor","procession","queshan","weddingHallEntry","bowCeremony","banquetHall","banquetToast","veilLift","bridalRoom","ceremonyComplete"]);
        renderHomeV5();

        root.__hjCleanup = () => {
          clearTimeout(toastTimer);
          music.stop();
        };
      },

      async unmount(container) {
        try {
          const root = container.querySelector(".roche-plugin-hejingshu");
          root?.__hjCleanup?.();
        } catch (_) {}
        container.replaceChildren();
      }
    }]
  });
})();
