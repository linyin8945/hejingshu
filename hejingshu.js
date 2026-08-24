(function () {
  "use strict";

  const PLUGIN_ID = "hejingshu";
  const APP_ID = "hejingshu-home";
  const VERSION = "0.5.0";

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
    keepsakes: ASSET_BASE + "keepsakes.webp"
  };


  const AUDIO_BASE = "https://raw.githubusercontent.com/linyin8945/hejingshu/main/audio/";
  const WEDDING_AUDIO = {
    procession: AUDIO_BASE + "procession.mp3",
    ceremony: AUDIO_BASE + "ceremony.mp3",
    afterglow: AUDIO_BASE + "afterglow.mp3"
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
            <div><button class="hj-music-btn" data-action="music-toggle">${music.muted?"♩":"♫"}</button>
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
          s.innerHTML=`<h3>${esc(title)}</h3><p>${esc(text)}</p><div class="hj-actions"><button class="hj-secondary" data-action="close-help">知道了</button></div>`;
          root.querySelector(".hj-shell").appendChild(s);
          bind();
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
              {role:"system",content:`你正在参与一场正式、郑重的中式婚礼。你扮演新郎本人，不是旁白。你必须保持原本人设，不要突然变成模板化古风男主；但你清楚知道今天是你正式迎娶 USER 的日子，这件事对你非常重要。可以保留平时的幽默、嘴硬、散漫等性格，但进入正礼、婚誓、落印等庄重环节时要自然收敛，表现出尊重、认真和珍惜。不要戏谑婚礼本身，不要把它当游戏。`},
              {role:"system",content:`USER人设：\n${userPersona}\n\n新郎人设：\n${charPersona}\n\n可参考的既有关系记忆：\n${memoryText||"无"}\n\n当前婚礼：${a.userMarriageName||userName()} 与 ${a.partnerMarriageName||partnerName()} 的正式婚礼。`},
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
                <button class="hj-primary" data-action="resume-married">打开岁岁帖</button>
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
                ? `<button class="hj-primary" data-action="resume-wedding">续礼</button><div style="height:10px"></div><button class="hj-secondary" data-action="new-marriage">另启新婚</button>`
                : `<button class="hj-primary" data-action="new-marriage">启书</button>`}
            </div>
          </div>`;
          bind();
        }

        function renderChooseV5() {
          const userCards = state.users.map(u=>{
            const on=state.selectedUser?.id===u.id;
            return `<button class="hj-person ${on?"selected":""}" data-action="select-user" data-id="${esc(u.id)}">
              ${u.avatar?`<img class="hj-avatar" src="${esc(u.avatar)}">`:`<div class="hj-avatar-fallback">${esc((u.name||u.handle||"我").slice(0,1))}</div>`}
              <div class="hj-person-txt"><div class="hj-person-name">${esc(u.handle||u.name||"USER")}</div><div class="hj-person-bio">${esc(u.bio||"此次婚礼使用的人设")}</div></div>
            </button>`;
          }).join("");
          const charCards = state.chars.map(c=>{
            const on=state.selectedChar?.id===c.id;
            return `<button class="hj-person ${on?"selected":""}" data-action="select-char" data-id="${esc(c.id)}">
              ${c.avatar?`<img class="hj-avatar" src="${esc(c.avatar)}">`:`<div class="hj-avatar-fallback">${esc((c.name||c.handle||"良").slice(0,1))}</div>`}
              <div class="hj-person-txt"><div class="hj-person-name">${esc(c.handle||c.name||"未命名")}</div><div class="hj-person-bio">${esc(c.bio||c.description||"今日，他将以新郎身份与你共行嘉礼")}</div></div>
            </button>`;
          }).join("");
          view.innerHTML = `${musicTop("择新人","home")}<div class="hj-page" style="padding-top:72px">
            <div class="hj-section-title">今日，与谁成婚？</div>
            <div class="hj-section-desc">选择后会锁定独立人设快照。婚礼中的他仍是他自己，只是清楚知道——今天，他在娶你。</div>
            <div class="hj-label">我</div><div class="hj-grid">${userCards||`<div class="hj-card">未读取到 USER 人设。</div>`}</div>
            <div class="hj-label" style="margin-top:20px">新郎</div><div class="hj-grid">${charCards||`<div class="hj-card">未读取到角色。</div>`}</div>
            ${state.selectedChar?`<div class="hj-card" style="margin-top:18px;text-align:center"><div class="hj-sub">今日，他将以新郎身份与你共行嘉礼</div><div class="hj-section-title" style="font-size:22px">${esc(partnerName())}</div></div>`:""}
            <div class="hj-actions"><button class="hj-primary" data-action="to-names" ${state.selectedChar&&state.selectedUser?"":"disabled"}>就是他</button></div>
          </div>`;
          bind();
        }

        function renderNamesV5() {
          const a=state.archive||{};
          view.innerHTML=`${musicTop("婚书初立","choose")}<div class="hj-page" style="padding-top:72px">
            <div class="hj-section-title">婚书初立</div>
            <div class="hj-section-desc">此刻婚书仍是空的。婚誓与双印，要等你们在正礼中亲自留下。</div>
            <div class="hj-card">
              <label class="hj-label">卿之婚名</label><input id="hj-user-name" class="hj-input" value="${esc(a.userMarriageName||userName())}">
              <label class="hj-label">良人婚名</label><input id="hj-partner-name" class="hj-input" value="${esc(a.partnerMarriageName||partnerName())}">
              <label class="hj-label">婚期</label><input id="hj-date" class="hj-input" type="date" value="${esc(a.weddingDate||new Date().toISOString().slice(0,10))}">
            </div>
            <div class="hj-actions"><button class="hj-primary" data-action="save-names-v5">立婚书</button></div>
          </div>`;
          bind();
        }

        function renderPreWeddingV5() {
          music.play("afterglow",.28);
          const a=state.archive||{};
          view.innerHTML = filmShell({
            asset:"bridePrep",title:"大婚前夜",kicker:"吉 期 将 至",
            line:`夜色渐深。明日，你便要与 ${esc(a.partnerMarriageName||partnerName())} 成婚。`,
            actions:`<button class="hj-secondary" data-action="gen-letter">${a.preLetter?"重读他的婚前笺":"等一封婚前笺"}</button>
                     <button class="hj-primary" data-action="start-pickup-v5">待到吉时</button>`,
            back:"names",
            extra:a.preLetter?`<div style="position:absolute;left:24px;right:24px;top:22%;z-index:7;padding:17px;border:1px solid rgba(239,207,129,.3);border-radius:16px;background:rgba(61,6,9,.68);backdrop-filter:blur(9px);font-size:13px;line-height:2;color:#f0deb8"><div class="hj-film-kicker">婚 前 笺</div>${esc(a.preLetter)}</div>`:""
          });
          bind();
        }

        function renderProcessionV5() {
          music.play("procession",.5);
          view.innerHTML=filmShell({
            asset:"procession",title:"他来了",kicker:"亲 迎",
            line:"长街之外，迎亲仪仗渐近。红绸随风而动，脚步声一点点靠近。",
            actions:`<button class="hj-primary" data-action="to-door-v5">听见叩门</button>`,
            back:"prewedding",position:"center"
          });
          bind();
        }

        function renderDoorV5() {
          const a=state.archive||{};
          view.innerHTML=filmShell({
            asset:"pickupDoor",title:"朱门叩问",kicker:"亲 迎",
            line:"门没有立刻打开。今日第一问，不问礼数，只问真心。",
            help:"亲迎，是婚礼中由新郎亲自迎娶新娘的礼仪。这里的叩门互动是《合卺书》的现代化婚俗设计，用来让新郎真正表达“为什么今日来娶你”。",
            actions:`<button class="hj-secondary" data-action="door-silent">不应他</button>
                     <button class="hj-secondary" data-action="door-question">隔门问他</button>
                     <button class="hj-primary" data-action="door-heart">让他拿出诚意</button>`,
            back:"procession",
            extra:a.doorAnswer?`<div style="position:absolute;left:24px;right:24px;top:24%;z-index:7;padding:16px;border-radius:16px;background:rgba(55,5,8,.70);border:1px solid rgba(238,207,129,.28);font-size:13px;line-height:1.95;color:#f2dfb9"><b>${esc(a.partnerMarriageName||partnerName())}</b>：${esc(a.doorAnswer)}</div>`:""
          });
          bind();
        }

        async function renderFanV5(peek=0) {
          music.play("procession",.38);
          const a=state.archive||{};
          view.innerHTML=filmShell({
            asset:"veilLift",title:"见君",kicker:"出 阁 · 却 扇",
            line:peek===0?"他已经进来了。团扇仍在眼前，你只听得到他的脚步。":peek===1?"扇缘移开一点。你先看见他的衣袖，再看见他停在原地。":"团扇移开。今日这一眼，被郑重地留在婚礼里。",
            help:"“却扇”并非所有时代婚礼都统一存在的固定步骤，《合卺书》将它作为古典婚俗意象保留：新人相见，扇移而见。",
            actions:peek<2?`<button class="hj-primary" data-action="fan-touch" data-peek="${peek+1}">${peek===0?"轻触团扇":"再移开一点"}</button>`:`<button class="hj-primary" data-action="to-hand-v5">随他出阁</button>`,
            back:"door",
            extra:`<div class="hj-touch-object" style="position:absolute;left:50%;top:26%;z-index:7;transform:translateX(-50%)"><div class="hj-fan-touch ${peek===1?"peek":peek>=2?"open":""}">却</div></div>
              ${a.firstLook?`<div style="position:absolute;left:24px;right:24px;top:60%;z-index:7;text-align:center;font-size:13px;line-height:1.8;color:#f1dfb8;text-shadow:0 2px 12px #000">${esc(a.firstLook)}</div>`:""}`
          });
          bind();
        }

        function renderHandV5() {
          view.innerHTML=filmShell({
            asset:"departureHands",title:"执手出阁",kicker:"出 阁",
            line:"门外有人来迎你。今日出此门，不为离别，是从此与他一同往前。",
            actions:`<button class="hj-primary" data-action="take-hand-v5">牵住他</button>`,
            back:"fan"
          });
          bind();
        }

        function renderSedanV5() {
          music.play("procession",.34);
          view.innerHTML=filmShell({
            asset:"sedanJourney",title:"花轿归程",kicker:"归 门",
            line:"轿帘轻晃。长街上的声音渐渐远去。这里没有任务，你可以只坐一会儿。",
            actions:`<button class="hj-secondary" data-action="linger-sedan">再坐一会儿</button><button class="hj-primary" data-action="arrive-v5">轿停了</button>`,
            back:"hand"
          });
          bind();
        }

        function renderArrivalV5() {
          view.innerHTML=filmShell({
            asset:"sedanArrival",title:"迎卿下轿",kicker:"归 门",
            line:"轿帘掀起。喜堂已经在前方，他先把手伸了过来。",
            actions:`<button class="hj-primary" data-action="to-hall-v5">把手给他</button>`,
            back:"sedan"
          });
          bind();
        }

        function renderHallV5() {
          music.play("ceremony",.42);
          view.innerHTML=filmShell({
            asset:"weddingHallEntry",title:"入华堂",kicker:"正 婚",
            line:"宾朋已至，花烛已明。音乐渐收，只余堂前一声清磬。司礼唱：正婚礼始。",
            actions:`<button class="hj-primary" data-action="to-wash-v5">入正婚礼</button>`,
            back:"arrival"
          });
          bind();
        }

        function renderWashV5(done=false) {
          music.play("ceremony",.36);
          view.innerHTML=filmShell({
            asset:"weddingHallEntry",title:"沃盥",kicker:"第 一 礼",
            line:done?"水纹渐静。你们都已净手，正礼由此真正开始。":"司礼：沃盥——新人净手。",
            help:"沃盥：新人入席前以清水净手。取去尘净心、郑重入礼之意。这里不把它当作“点一下完成”，而是让你亲手触水。",
            actions:done?`<button class="hj-primary" data-action="to-tonglao-v5">同席而食</button>`:`<button class="hj-secondary" data-action="wash-water">触碰水面</button>`,
            back:"hall",
            extra:`<div class="hj-touch-object" style="position:absolute;left:50%;top:35%;z-index:7;transform:translateX(-50%)"><div id="hj-water" class="hj-water-bowl ${done?"ripple":""}"></div></div>`
          });
          bind();
        }

        function renderTonglaoV5(selected="") {
          music.play("ceremony",.36);
          const foods=["枣栗","同牢肉","黍饭"];
          view.innerHTML=filmShell({
            asset:"banquetToast",title:"同牢",kicker:"第 二 礼",
            line:selected?`你选了「${esc(selected)}」。从这一箸开始，是第一次以夫妻身份同席。`:"司礼：同牢——共席而食。",
            help:"同牢：新人同席共食，象征从今日起同居一室、同食一席。它在传统婚礼礼制中与合卺前后相承。",
            actions:selected?`<button class="hj-primary" data-action="to-hejin-v5">执卺</button>`:"",
            back:"wash",
            extra:`<div class="hj-touch-object" style="position:absolute;left:50%;top:34%;z-index:7;transform:translateX(-50%)"><div class="hj-food-tray">${
              foods.map(x=>`<button class="hj-food ${selected===x?"selected":""}" data-action="choose-food" data-food="${x}">${x}</button>`).join("")
            }</div></div>`
          });
          bind();
        }

        function renderHejinV5(lifted=false) {
          music.play("ceremony",.32);
          view.innerHTML=filmShell({
            asset:"hejinCups",title:"合卺",kicker:"第 三 礼",
            line:lifted?"你执起自己的卺。他也端起另一只。两盏将在这一刻相合。":"司礼：合卺——新人各执其一。",
            help:"卺分为二，新人各执一半共饮，再合而为一。取从此甘苦同尝、夫妻一体之意。",
            actions:lifted?`<button class="hj-primary" data-action="drink-hejin">与他同时饮下</button>`:`<button class="hj-primary" data-action="lift-cup">执起自己的卺</button>`,
            back:"tonglao",
            extra:`<div class="hj-touch-object" style="position:absolute;left:50%;top:32%;z-index:7;transform:translateX(-50%)"><div class="hj-cup-pair"><div class="hj-cup-btn ${lifted?"lift":""}">卺</div><div class="hj-cup-btn ${lifted?"lift":""}">卺</div></div></div>`
          });
          bind();
        }

        function renderHairV5() {
          music.play("ceremony",.28);
          view.innerHTML=filmShell({
            asset:"hairKnot",title:"结发",kicker:"第 四 礼",
            line:"各取一缕青丝，以红线同系。它不会随着页面结束消失，而会被收入你们的婚藏。",
            help:"结发在后世成为夫妻关系的重要象征。《合卺书》把两缕青丝与红线做成可永久保存的婚礼信物。",
            actions:`<button class="hj-primary" data-action="tie-hair-v5">系青丝</button>`,
            back:"hejin",
            extra:`<div class="hj-touch-object" style="position:absolute;left:50%;top:34%;z-index:7;transform:translateX(-50%)"><div class="hj-thread-interact"><div class="hj-thread-knot-v5">结</div></div></div>`
          });
          bind();
        }

        async function renderVowsV5() {
          music.play("ceremony",.24); music.duck(true);
          const a=state.archive||{};
          if(!a.vowPartner && !state.loading){
            state.loading=true;
            try{
              const t=await weddingAwareText("现在正婚礼已经行至婚誓。请以你本人原本的语言习惯，对你的新娘说出一段真正属于你的婚誓。不要套用古风誓词，不要突然变成另一个人；可以克制、嘴硬、寡言或温柔，但必须认真。你要明确知道：你今天是在娶她，并愿意承担婚姻中的陪伴、尊重与责任。",240);
              await saveArchive({vowPartner:t});
            }catch(_){}
            state.loading=false;
          }
          const b=state.archive||a;
          view.innerHTML=`<div class="hj-film"><div class="hj-vow-book"></div>${musicTop("婚誓","hair")}
            <div class="hj-vow-panel">
              <div class="hj-film-kicker">请 二 位 · 各 陈 一 诺</div>
              <div class="hj-section-title" style="font-size:20px">${esc(b.partnerMarriageName||partnerName())}</div>
              <div class="hj-vow-write">${esc(b.vowPartner||"他仍在整理想说的话……")}</div>
              <div class="hj-rule" style="width:100%;animation:none;margin:18px 0"></div>
              <div class="hj-section-title" style="font-size:20px">轮到你</div>
              <textarea id="hj-vow-user-v5" class="hj-textarea" placeholder="亲笔写下你的婚誓……">${esc(b.vowUser||"")}</textarea>
              <div class="hj-actions"><button class="hj-secondary" data-action="draft-user-vow">依我的人设拟一份</button><button class="hj-primary" data-action="save-vows-v5">写下此诺</button></div>
            </div></div>`;
          bind();
        }

        function renderBookV5(stage="user") {
          music.duck(true);
          const a=state.archive||{};
          const userOn=stage!=="user";
          const partnerOn=stage==="done";
          view.innerHTML=`<div class="hj-book-live">${musicTop("婚书 · 双印","vows")}
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
                `<div class="hj-section-desc" style="text-align:center">两印俱全。婚书至此真正完成。</div><button class="hj-primary" style="display:block;margin:14px auto 0" data-action="ceremony-complete-v5">收书 · 待礼成</button>`}
              <div class="hj-cert-foot">婚期：${esc(a.weddingDate?fmtDate(new Date(a.weddingDate).getTime()):fmtDate())}</div>
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
            try{
              const t=await weddingAwareText("正婚礼已经结束，婚书双印俱全。你第一次真正意识到，她现在已经成为你的妻子。不要写旁白，不要模板情话，只说此刻你本人最自然会对她说的一两句话。",140);
              await saveArchive({afterCeremonyLine:t,status:"ceremony-complete"});
            }catch(_){}
            state.loading=false;
          }
          const b=state.archive||a;
          view.innerHTML=filmShell({
            asset:"ceremonyComplete",title:"礼成",kicker:"嘉 礼 既 成",
            line:"两姓既合，婚书既成。司礼唱：嘉礼——礼成。",
            actions:`<button class="hj-primary" data-action="to-banquet-v5">赴喜宴</button>`,
            back:"book",
            extra:b.afterCeremonyLine?`<div style="position:absolute;left:24px;right:24px;top:27%;z-index:7;padding:15px;border-radius:16px;background:rgba(54,5,8,.58);backdrop-filter:blur(8px);font-size:13px;line-height:1.9;color:#f1dfb8">${esc(b.partnerMarriageName||partnerName())}：${esc(b.afterCeremonyLine)}</div>`:""
          });
          bind();
        }

        function renderBanquetV5() {
          music.play("procession",.28);
          const a=state.archive||{};
          view.innerHTML=filmShell({
            asset:"banquetHall",title:"喜宴",kicker:"礼 成 之 后",
            line:"正礼已经结束。这里不再有必须完成的步骤，你们终于可以从仪式里松下来。",
            actions:`<button class="hj-secondary" data-action="banquet-talk-v5">偷看他</button><button class="hj-secondary" data-action="banquet-toast-v5">与他敬一杯</button><button class="hj-primary" data-action="to-night-v5">与他离席</button>`,
            back:"complete",
            extra:a.banquetLine?`<div style="position:absolute;left:24px;right:24px;top:28%;z-index:7;padding:15px;border-radius:16px;background:rgba(54,5,8,.62);font-size:13px;line-height:1.9;color:#f1dfb8">${esc(a.banquetLine)}</div>`:""
          });
          bind();
        }

        function renderNightV5() {
          music.play("afterglow",.30);
          view.innerHTML=filmShell({
            asset:"bridalNightSeated",title:"花烛",kicker:"只 剩 你 们",
            line:"门合上，外面的喜宴声一点点远去。婚礼结束以后，终于只剩你们两个人。",
            actions:`<button class="hj-secondary" data-action="night-question">问他：今天什么时候最紧张？</button><button class="hj-secondary" data-action="night-look">问他：看到我时在想什么？</button><button class="hj-primary" data-action="sleep-v5">歇下</button>`,
            back:"banquet"
          });
          bind();
        }

        function renderMorningV5() {
          music.play("afterglow",.24);
          view.innerHTML=filmShell({
            asset:"morningAfter",title:"新婚第一日",kicker:"花 烛 余 温",
            line:"昨日嘉礼已成。今日，是你们成婚后的第一日。",
            actions:`<button class="hj-primary" data-action="finish-wedding-v5">打开岁岁帖</button>`,
            back:"home"
          });
          bind();
        }

        function renderAnniversaryV5() {
          music.play("afterglow",.20);
          const a=state.archive||{},d=daysSince(a.completedAt);
          view.innerHTML=`${musicTop("岁岁帖","home")}<div class="hj-page" style="padding-top:72px">
            <div class="hj-anniv"><div class="hj-sub">自合卺之日起</div><div class="hj-count">${d}<small>日</small></div>
            <div class="hj-section-desc">婚礼不是通关。它从这一日开始，被保存为你们共同的婚姻档案。</div></div>
            <div class="hj-mini-cert" data-action="certificate-v5"><div style="text-align:center;color:#E8CB7A;font-size:22px;letter-spacing:.22em">合卺书</div>
              <div style="display:flex;justify-content:center;gap:18px;margin-top:10px;color:#E8D9B7;font-size:13px"><span>${esc(a.userMarriageName||userName())}</span><span>·</span><span>${esc(a.partnerMarriageName||partnerName())}</span></div>
              <div style="text-align:center;color:#BFAE90;font-size:11px;margin-top:8px">${esc(a.weddingDate||"")}</div></div>
            <div class="hj-keepsake-card"><img src="${WEDDING_ASSETS.keepsakes}" alt=""><div class="hj-keepsake-title">婚礼珍藏 · 婚书 / 结发 / 双印</div></div>
            <div class="hj-card" style="margin-top:14px"><div class="hj-section-title" style="font-size:17px;margin-top:0">今日留一句</div>
              <textarea id="hj-note" class="hj-textarea" placeholder="写给今天的你们……">${esc(a.latestNote||"")}</textarea>
              <div class="hj-actions"><button class="hj-secondary" data-action="save-note-v5">存入岁岁帖</button></div>
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
          state.archive = Object.assign({}, state.archive, patch);
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
            doorAnswer: "",
            firstLook: "",
            tonglaoFood: "",
            hejinDone: false,
            hairKeepsake: false,
            userSealAt: null,
            partnerSealAt: null
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
          view.querySelectorAll("[data-action]").forEach(el=>{
            if(el.__hjBound) return; el.__hjBound=true;
            el.addEventListener("click",async()=>{
              const action=el.dataset.action;
              if(action==="close") { music.stop(); return roche.ui.closeApp(); }
              if(action==="music-toggle") return music.toggle();
              if(action==="close-help") return el.closest(".hj-help-sheet")?.remove();
              if(action==="show-help") return showHelp(el.dataset.title||"此礼",el.dataset.help||"");
              if(action==="home") return renderHomeV5();
              if(action==="back"){
                const t=el.dataset.target;
                const map={home:renderHomeV5,choose:renderChooseV5,names:renderNamesV5,prewedding:renderPreWeddingV5,procession:renderProcessionV5,door:()=>renderDoorV5(),fan:()=>renderFanV5(2),hand:renderHandV5,sedan:renderSedanV5,arrival:renderArrivalV5,hall:renderHallV5,wash:()=>renderWashV5(true),tonglao:()=>renderTonglaoV5(state.archive?.tonglaoFood||""),hejin:()=>renderHejinV5(true),hair:renderHairV5,vows:renderVowsV5,book:()=>renderBookV5("done"),complete:renderCeremonyCompleteV5,banquet:renderBanquetV5};
                return (map[t]||renderHomeV5)();
              }
              if(action==="new-marriage") return createNewMarriage();
              if(action==="resume-married") return renderAnniversaryV5();
              if(action==="resume-wedding"){
                const s=state.archive?.directorStage||"prewedding";
                const map={prewedding:renderPreWeddingV5,procession:renderProcessionV5,door:renderDoorV5,fan:()=>renderFanV5(0),hand:renderHandV5,sedan:renderSedanV5,arrival:renderArrivalV5,hall:renderHallV5,wash:()=>renderWashV5(false),tonglao:()=>renderTonglaoV5(),hejin:()=>renderHejinV5(false),hair:renderHairV5,vows:renderVowsV5,book:()=>renderBookV5(state.archive?.partnerSealAt?"done":state.archive?.userSealAt?"partner":"user"),complete:renderCeremonyCompleteV5,banquet:renderBanquetV5,night:renderNightV5,morning:renderMorningV5};
                return (map[s]||renderPreWeddingV5)();
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
                if(state.loading)return; state.loading=true;el.disabled=true;el.textContent="他正在写……";
                try{
                  const t=await weddingAwareText("现在是大婚前夜。你明日会亲自去迎娶 USER。写一封很短的婚前笺给她，像你本人，不要古风模板，不要夸张。哪怕你平时嘴硬或寡言，也要让她知道你明日会来。",150);
                  await saveArchive({preLetter:t,directorStage:"prewedding"});
                }catch(_){toast("生成失败，请检查 AI 配置")}
                state.loading=false;return renderPreWeddingV5();
              }
              if(action==="start-pickup-v5"){await saveArchive({status:"wedding-day",directorStage:"procession"});return renderProcessionV5()}
              if(action==="to-door-v5"){await saveArchive({directorStage:"door"});return renderDoorV5()}
              if(["door-silent","door-question","door-heart"].includes(action)){
                if(state.loading)return;state.loading=true;el.disabled=true;
                const q=action==="door-heart"?"门里的人让你拿出诚意，问：今日你为什么来娶她？请直接以新郎本人回答。":
                  action==="door-question"?"隔着门，USER问你：你现在紧张吗？请以你本人真实口吻回答。":
                  "门里没有回应。你站在门外等了一会儿。请以你本人会有的方式再说一句，让她知道你会等她开门。";
                try{const t=await weddingAwareText(q,160);await saveArchive({doorAnswer:t,directorStage:"door"})}catch(_){toast("生成失败")}
                state.loading=false;return renderDoorV5();
              }
              if(action==="fan-touch"){
                const p=Number(el.dataset.peek||1);
                if(p>=2 && !state.archive?.firstLook && !state.loading){
                  state.loading=true;
                  try{const t=await weddingAwareText("却扇后，你第一次完整看见穿着婚服的 USER。只写你本人此刻的一句反应或一个短动作，不要旁白，不要模板情话。",120);await saveArchive({firstLook:t,directorStage:"fan"})}catch(_){}
                  state.loading=false;
                }
                return renderFanV5(p);
              }
              if(action==="to-hand-v5"){await saveArchive({directorStage:"hand"});return renderHandV5()}
              if(action==="take-hand-v5"){try{navigator.vibrate?.(30)}catch(_){};await saveArchive({handTaken:true,directorStage:"sedan"});return renderSedanV5()}
              if(action==="linger-sedan"){toast("轿帘仍在轻晃。你不必急着去下一幕。");return}
              if(action==="arrive-v5"){await saveArchive({directorStage:"arrival"});return renderArrivalV5()}
              if(action==="to-hall-v5"){await saveArchive({directorStage:"hall"});return renderHallV5()}
              if(action==="to-wash-v5"){await saveArchive({directorStage:"wash"});return renderWashV5(false)}
              if(action==="wash-water"){try{navigator.vibrate?.(18)}catch(_){};await saveArchive({washDone:true,directorStage:"wash"});return renderWashV5(true)}
              if(action==="to-tonglao-v5"){await saveArchive({directorStage:"tonglao"});return renderTonglaoV5()}
              if(action==="choose-food"){const f=el.dataset.food;await saveArchive({tonglaoFood:f,directorStage:"tonglao"});return renderTonglaoV5(f)}
              if(action==="to-hejin-v5"){await saveArchive({directorStage:"hejin"});return renderHejinV5(false)}
              if(action==="lift-cup"){return renderHejinV5(true)}
              if(action==="drink-hejin"){
                try{navigator.vibrate?.(28)}catch(_){}
                if(!state.archive?.hejinLine&&!state.loading){state.loading=true;try{const t=await weddingAwareText("你刚刚与 USER 完成合卺。请用你本人的方式说一句很短的话，承认这件事对你的意义。不要模板古风。",100);await saveArchive({hejinLine:t})}catch(_){}state.loading=false}
                toast(state.archive?.hejinLine||"合卺礼成");
                await saveArchive({hejinDone:true,directorStage:"hair"});setTimeout(renderHairV5,700);return;
              }
              if(action==="tie-hair-v5"){try{navigator.vibrate?.(24)}catch(_){};await saveArchive({hairKeepsake:true,directorStage:"vows"});toast("结发锦囊已收入婚藏");setTimeout(renderVowsV5,700);return}
              if(action==="draft-user-vow"){
                if(state.loading)return;state.loading=true;el.disabled=true;el.textContent="代拟中……";
                try{const t=await weddingAwareText("请站在 USER 的视角，依据 USER 人设与双方关系，草拟一段不超过180字的婚誓。不要替 USER 编造重大经历，不要套用古风模板，必须可以被她继续编辑。",180);view.querySelector("#hj-vow-user-v5").value=t}catch(_){toast("生成失败")}
                state.loading=false;el.disabled=false;el.textContent="依我的人设拟一份";return;
              }
              if(action==="save-vows-v5"){const v=view.querySelector("#hj-vow-user-v5").value.trim();if(!v)return toast("先写下你的婚誓");await saveArchive({vowUser:v,directorStage:"book",marriageNo:state.archive?.marriageNo||("HJ-"+Date.now().toString(36).toUpperCase())});return renderBookV5("user")}
              if(action==="partner-seal"){try{navigator.vibrate?.(45)}catch(_){};await saveArchive({partnerSealAt:Date.now(),directorStage:"book"});return renderBookV5("done")}
              if(action==="ceremony-complete-v5"){await saveArchive({directorStage:"complete",status:"ceremony-complete"});return renderCeremonyCompleteV5()}
              if(action==="to-banquet-v5"){await saveArchive({directorStage:"banquet"});return renderBanquetV5()}
              if(action==="banquet-talk-v5"||action==="banquet-toast-v5"){
                if(state.loading)return;state.loading=true;
                const task=action==="banquet-toast-v5"?"喜宴上，你和新婚妻子一起举杯。以你本人原本的性格，对她说一句轻松但真诚的话。":"喜宴正热闹，你发现 USER 在偷看你。以你本人会有的方式回应她。";
                try{const t=await weddingAwareText(task,120);await saveArchive({banquetLine:t})}catch(_){}
                state.loading=false;return renderBanquetV5();
              }
              if(action==="to-night-v5"){await saveArchive({directorStage:"night"});return renderNightV5()}
              if(action==="night-question"||action==="night-look"){
                if(state.loading)return;state.loading=true;
                const task=action==="night-question"?"婚礼结束后只剩你们两个人。USER问：你今天什么时候最紧张？请真实回答。":"婚礼结束后只剩你们两个人。USER问：你今天第一次完整看到我穿婚服时，在想什么？请真实回答。";
                try{const t=await weddingAwareText(task,180);toast(t)}catch(_){toast("他想了一会儿")}
                state.loading=false;return;
              }
              if(action==="sleep-v5"){await saveArchive({directorStage:"morning"});return renderMorningV5()}
              if(action==="finish-wedding-v5"){await saveArchive({completedAt:state.archive?.completedAt||Date.now(),status:"married",directorStage:"married"});return renderAnniversaryV5()}
              if(action==="certificate-v5") return renderBookV5("done");
              if(action==="save-note-v5"){const n=view.querySelector("#hj-note").value.trim();await saveArchive({latestNote:n,latestNoteAt:Date.now()});return toast("已存入岁岁帖")}
            });
          });
          updateMusicButtons();
        }

        await loadBase();
        preloadAssets(["bridePrep","pickupDoor","procession","weddingHallEntry","bowCeremony"]);
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
