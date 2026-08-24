(function () {
  "use strict";

  const PLUGIN_ID = "hejingshu";
  const APP_ID = "hejingshu-home";
  const VERSION = "0.2.0";

  const GOLD = "#D6B56A";
  const DEEP_RED = "#6F0D14";
  const PAPER_RED = "#8E111A";
  const DARK_RED = "#4C090D";
  const SOFT_GOLD = "#E8D49A";

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
          chars: [],
          selectedChar: null,
          archive: null,
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

        async function loadBase() {
          try { state.user = await roche.persona.getActiveUserPersona(); } catch (_) {}
          try { state.chars = (await roche.character.list()) || []; } catch (_) { state.chars = []; }
          state.archive = await safeGet(storage, "currentMarriage", null);
          if (state.archive?.partnerId) {
            state.selectedChar = state.chars.find(c => c.id === state.archive.partnerId) || null;
          }
        }

        function partnerName() {
          const c = state.selectedChar;
          return c ? (c.name || c.handle || "良人") : "良人";
        }
        function userName() {
          return state.user ? (state.user.name || state.user.handle || "卿") : "卿";
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
          if (state.archive?.completedAt) {
            renderAnniversary();
            return;
          }
          const dust = Array.from({length:18},(_,i)=>`<i style="left:${(i*37)%100}%;top:${-(i*23)%120}px;animation-delay:${(i%7)*.42}s"></i>`).join("");
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
                  <button class="hj-primary" data-action="start">启书</button>
                </div>
              </div>
            </div>`;
          bind();
        }

        function renderChoose() {
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
            ${topbar("择良人","home")}
            <div class="hj-page">
              <div class="hj-stepper"><i class="hj-dot on"></i><i class="hj-dot"></i><i class="hj-dot"></i><i class="hj-dot"></i><i class="hj-dot"></i></div>
              <div class="hj-section-title">一 · 择良人</div>
              <div class="hj-section-desc">嘉礼之始，先定心之所归。请选择与你共书此卷之人。</div>
              <div class="hj-grid">${cards || `<div class="hj-card">未读取到角色。</div>`}</div>
              <div class="hj-actions"><button class="hj-primary" data-action="to-names" ${state.selectedChar?"":"disabled"}>定此良缘</button></div>
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
          const userPersona = state.user?.persona || state.user?.bio || "";
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


        function renderProcessScene(kind) {
          const a = state.archive || {};
          if (kind === "迎亲") {
            view.innerHTML = `
              <div class="hj-scene">
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
              <div class="hj-scene">
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
            <div class="hj-page">
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
              <div class="hj-card" style="margin-top:14px">
                <div class="hj-section-title" style="font-size:17px;margin-top:0">岁岁帖</div>
                <div class="hj-section-desc">第一版先保留入口。后续可以加入百日笺、周年笺、共同记忆与纪念印章。</div>
                <textarea id="hj-note" class="hj-textarea" placeholder="今日留一句……">${esc(a.latestNote || "")}</textarea>
                <div class="hj-actions"><button class="hj-secondary" data-action="save-note">存入岁岁帖</button></div>
              </div>
            </div>`;
          bind();
        }

        async function saveArchive(patch) {
          const base = state.archive || { id: uid(), createdAt: Date.now() };
          state.archive = Object.assign({}, base, patch);
          await storage.set("currentMarriage", state.archive);
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
              await saveArchive({completedAt:Date.now()});
              try { navigator.vibrate?.(45); } catch(_){}
              toast("嘉礼成 · 此书既成，岁岁为证");
              setTimeout(renderAnniversary, 650);
            },1200);
          };
          el.addEventListener("pointerdown", begin);
          ["pointerup","pointercancel","pointerleave"].forEach(t=>el.addEventListener(t, stop));
        }

        function bind() {
          view.querySelectorAll("[data-action]").forEach(el => {
            el.addEventListener("click", async () => {
              const action = el.dataset.action;
              if (action === "close") return roche.ui.closeApp();
              if (action === "home") return renderHome();
              if (action === "back") {
                const t = el.dataset.target;
                if (t==="home") return renderHome();
                if (t==="choose") return renderChoose();
                if (t==="names") return renderNames();
                if (t==="rituals") return renderRituals();
                if (t==="vows") return renderVows();
              }
              if (action === "start") return renderChoose();
              if (action === "select-char") {
                state.selectedChar = state.chars.find(c=>c.id===el.dataset.id) || null;
                return renderChoose();
              }
              if (action === "to-names") {
                if (!state.selectedChar) return toast("请先择一良人");
                await saveArchive({ partnerId: state.selectedChar.id, partnerSnapshot: {
                  id: state.selectedChar.id,
                  name: state.selectedChar.name || "",
                  handle: state.selectedChar.handle || "",
                  avatar: state.selectedChar.avatar || "",
                  bio: state.selectedChar.bio || "",
                  persona: state.selectedChar.persona || ""
                }, userSnapshot: {
                  id: state.user?.id || "",
                  name: state.user?.name || "",
                  handle: state.user?.handle || "",
                  avatar: state.user?.avatar || "",
                  bio: state.user?.bio || "",
                  persona: state.user?.persona || ""
                }});
                return renderNames();
              }
              if (action === "save-names") {
                await saveArchive({
                  userMarriageName: view.querySelector("#hj-user-name").value.trim() || userName(),
                  partnerMarriageName: view.querySelector("#hj-partner-name").value.trim() || partnerName(),
                  weddingDate: view.querySelector("#hj-date").value
                });
                return renderRituals();
              }
              if (action === "ritual") {
                const id = el.dataset.id;
                const rituals = Object.assign({}, state.archive?.rituals || {});
                rituals[id] = !rituals[id];
                await saveArchive({rituals});
                toast(rituals[id] ? `${id}礼成` : `${id}已撤`);
                return renderRituals();
              }
              if (action === "generate-blessing") {
                if (state.loading) return;
                state.loading = true; el.disabled = true; el.textContent = "书写中…";
                try {
                  const blessing = await genAI("blessing");
                  await saveArchive({blessing});
                  toast("婚缘辞已成");
                } catch (e) {
                  toast("生成失败，请检查当前 AI 配置");
                } finally {
                  state.loading = false;
                  renderRituals();
                }
              }
              if (action === "open-fan") {
                const fan = view.querySelector("#hj-fan");
                fan?.classList.add("open");
                const line = view.querySelector("#hj-fan-line");
                if (line) line.textContent = `${partnerName()}：今日见你，此后便记作余生第一眼。`;
                const rituals = Object.assign({}, state.archive?.rituals || {}, {"却扇":true});
                await saveArchive({rituals});
              }
              if (action === "join-cups") {
                view.querySelector("#hj-cups")?.classList.add("join");
                const line = view.querySelector("#hj-cup-line");
                if (line) line.textContent = "合卺既成，自此同甘共苦。";
                const rituals = Object.assign({}, state.archive?.rituals || {}, {"合卺":true});
                await saveArchive({rituals});
              }
              if (action === "tie-thread") {
                view.querySelector("#hj-thread-stage")?.classList.add("tied");
                const line = view.querySelector("#hj-thread-line");
                if (line) line.textContent = "结发同心，白首为期。";
                const rituals = Object.assign({}, state.archive?.rituals || {}, {"结发":true});
                await saveArchive({rituals});
              }
              if (action === "to-vows") return renderVows();
              if (action === "scene-next") return renderProcessScene(el.dataset.next);
              if (action === "ai-vows") {
                if (state.loading) return;
                state.loading = true; el.disabled = true; el.textContent = "代拟中…";
                try {
                  const text = await genAI("vows");
                  const um = text.match(/【我方】[:：]?\s*([\s\S]*?)(?=【良人】|$)/);
                  const pm = text.match(/【良人】[:：]?\s*([\s\S]*)/);
                  if (um) view.querySelector("#hj-vow-user").value = um[1].trim();
                  if (pm) view.querySelector("#hj-vow-partner").value = pm[1].trim();
                  toast("婚誓已代拟，可继续修改");
                } catch (_) {
                  toast("生成失败，请检查当前 AI 配置");
                } finally {
                  state.loading = false; el.disabled = false; el.textContent = "依人设代拟";
                }
              }
              if (action === "save-vows") {
                await saveArchive({
                  vowUser: view.querySelector("#hj-vow-user").value.trim(),
                  vowPartner: view.querySelector("#hj-vow-partner").value.trim(),
                  marriageNo: state.archive?.marriageNo || ("HJ-" + Date.now().toString(36).toUpperCase())
                });
                return renderCertificate();
              }
              if (action === "complete") {
                const ok = await roche.ui.confirm({title:"落印成书",message:"婚书一经落印，本季便进入婚后纪年。仍可在后续版本中继续扩展岁岁帖。"});
                if (!ok) return;
                await saveArchive({completedAt: Date.now()});
                toast("嘉礼成");
                setTimeout(renderAnniversary, 500);
              }
              if (action === "certificate") return renderCertificate(false);
              if (action === "save-note") {
                const note = view.querySelector("#hj-note").value.trim();
                await saveArchive({latestNote:note, latestNoteAt:Date.now()});
                toast("已存入岁岁帖");
              }
            });
          });
        }

        await loadBase();
        renderHome();

        root.__hjCleanup = () => {
          clearTimeout(toastTimer);
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
