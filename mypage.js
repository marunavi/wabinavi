/* ============================================================
   わびなび マイページ（mypage.js）v2 — Figma品質リファイン
   ・レイアウトは維持し、フォント/余白/影/アイコン/アニメを高級化
   ・編集可能データは WABI_PROFILE に集約
   ============================================================ */
(function () {
  'use strict';
  if (window.__wabiMypageLoaded) return;
  window.__wabiMypageLoaded = true;

  /* Interフォント（英数字用） */
  if (!document.getElementById('mpInter')) {
    var lf = document.createElement('link'); lf.id='mpInter'; lf.rel='stylesheet';
    lf.href='https://fonts.googleapis.com/css2?family=Inter:wght@500;600;700;800&display=swap';
    document.head.appendChild(lf);
  }

  /* ===== 編集可能データ ===== */
  var WABI_PROFILE = {
    name:'巡礼者 太郎', title:'巡礼者', aiTitle:'いつもおだやか',
    level:19, expToNext:340, expPercent:62,
    coverShrine:'厳島神社', avatar:'',
    stats:[
      {key:'shrines', ic:'torii', label:'参拝した神社', value:28, unit:'社'},
      {key:'goshuin', ic:'book',  label:'御朱印',       value:36, unit:'体'},
      {key:'routes',  ic:'map',   label:'作成したルート', value:5,  unit:''},
      {key:'posts',   ic:'edit',  label:'投稿した記録',  value:12, unit:''},
      {key:'follow',  ic:'users', label:'フォロー',      value:24, unit:''},
      {key:'follower',ic:'award', label:'フォロワー',    value:37, unit:''}
    ],
    quick:[
      {ic:'clock',   label:'参拝履歴'},
      {ic:'book',    label:'御朱印帳'},
      {ic:'star',    label:'行きたい神社'},
      {ic:'map',     label:'作成したルート'},
      {ic:'edit',    label:'投稿した記録'},
      {ic:'bookmark',label:'保存した記事'}
    ],
    weekly:{ period:'5/12〜5/18', items:[
      {label:'神社に3社参拝する',   done:3,  total:3},
      {label:'御朱印を1体登録する', done:1,  total:1},
      {label:'投稿をする',          done:1,  total:1},
      {label:'EXPを100獲得する',    done:60, total:100}
    ]},
    aiRec:{ shrine:'伏見稲荷大社', tags:['混雑が少ない時間帯','御朱印が人気','パワースポット'] },
    goshuinBook:['伏見稲荷大社','出雲大社','明治神宮'],
    badges:[
      {ic:'torii', label:'初参拝',            got:true},
      {ic:'book',  label:'御朱印コレクター',   got:true},
      {ic:'star',  label:'パワースポット巡り', got:true},
      {ic:'award', label:'歴史探訪家',         got:false}
    ]
  };

  /* ===== Lucide風SVGアイコン ===== */
  var P = {
    torii:'<path d="M3 22h18"/><path d="M6 18v-7"/><path d="M18 18v-7"/><path d="M4 11 12 5l8 6"/><path d="M6 8h12"/>',
    book:'<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
    map:'<path d="m9 4-6 2v14l6-2 6 2 6-2V4l-6 2-6-2z"/><path d="M9 4v14"/><path d="M15 6v14"/>',
    edit:'<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
    users:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    award:'<circle cx="12" cy="8" r="6"/><path d="M15.48 12.89 17 22l-5-3-5 3 1.52-9.11"/>',
    clock:'<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
    star:'<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z"/>',
    bookmark:'<path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>',
    settings:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
    chevron:'<path d="m15 18-6-6 6-6"/>',
    home:'<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/>',
    search:'<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
    plus:'<rect width="18" height="18" x="3" y="3" rx="4"/><path d="M12 8v8"/><path d="M8 12h8"/>',
    user:'<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>'
  };
  function ic(name,color,size,sw){
    return '<svg width="'+(size||24)+'" height="'+(size||24)+'" viewBox="0 0 24 24" fill="none" stroke="'+(color||'currentColor')+'" stroke-width="'+(sw||2.2)+'" stroke-linecap="round" stroke-linejoin="round">'+(P[name]||'')+'</svg>';
  }
  function esc(s){ return String(s==null?'':s).replace(/"/g,'&quot;'); }

  /* ===== スタイル ===== */
  var C = { purple:'#6E45B8', accent:'#B33A28', gold:'#C8A14E', bg:'#FAF8F4', text:'#2C2C2C', mute:'#7A7A7A' };
  var css = document.createElement('style');
  css.textContent = [
    "#wcMypage{position:fixed;inset:0;z-index:290;background:"+C.bg+";overflow-y:auto;-webkit-overflow-scrolling:touch;display:none;font-family:'Noto Sans JP',sans-serif;color:"+C.text+";}",
    "#wcMypage.show{display:block;animation:mpFade .45s ease;}",
    "@keyframes mpFade{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}",
    ".mp-num{font-family:'Inter','Noto Sans JP',sans-serif;font-feature-settings:'tnum';}",
    ".mp-in{max-width:430px;margin:0 auto;padding-bottom:92px;}",
    ".mp-hd{position:sticky;top:0;z-index:10;height:58px;background:rgba(255,255,255,.92);backdrop-filter:saturate(180%) blur(12px);display:flex;align-items:center;justify-content:space-between;padding:0 16px;box-shadow:0 1px 0 rgba(0,0,0,.04);}",
    ".mp-hd .mp-t{font-size:17px;font-weight:700;letter-spacing:.02em;}",
    ".mp-ico{width:38px;height:38px;display:flex;align-items:center;justify-content:center;color:"+C.text+";cursor:pointer;border-radius:12px;transition:background .2s;}",
    ".mp-ico:active{background:#f0ebe3;}",
    /* プロフィール（写真主役） */
    ".mp-cover{position:relative;height:246px;background:#3a3025 center/cover;}",
    ".mp-cover:before{content:'';position:absolute;inset:0;background:linear-gradient(to bottom,rgba(0,0,0,.42),rgba(0,0,0,0) 30%);}",
    ".mp-cover:after{content:'';position:absolute;inset:0;background:linear-gradient(to top,"+C.bg+" 2%,rgba(250,248,244,0) 46%);}",
    ".mp-prof{position:absolute;left:20px;right:20px;bottom:16px;display:flex;align-items:flex-end;gap:16px;z-index:2;}",
    ".mp-av{width:86px;height:86px;border-radius:50%;border:3px solid #fff;background:#8a7a66 center/cover;flex:0 0 86px;display:flex;align-items:center;justify-content:center;overflow:hidden;box-shadow:0 6px 20px rgba(0,0,0,.3);}",
    ".mp-av img{width:100%;height:100%;object-fit:cover;}",
    ".mp-av svg{color:#fff;opacity:.9;}",
    ".mp-name{font-size:30px;font-weight:700;color:#fff;line-height:1.1;text-shadow:0 2px 12px rgba(0,0,0,.45);letter-spacing:.01em;}",
    ".mp-titlerow{display:flex;align-items:center;gap:8px;margin-top:8px;}",
    ".mp-title{font-size:12px;font-weight:700;color:#fff;background:"+C.accent+";padding:3px 11px;border-radius:20px;box-shadow:0 2px 8px rgba(179,58,40,.4);}",
    ".mp-aititle{font-size:11.5px;color:"+C.text+";background:rgba(255,255,255,.92);padding:4px 11px;border-radius:20px;font-weight:600;}",
    /* EXP */
    ".mp-exp{margin:18px 20px 0;}",
    ".mp-exp-top{display:flex;align-items:baseline;justify-content:space-between;margin-bottom:8px;}",
    ".mp-exp-lv{font-size:13px;font-weight:800;color:"+C.purple+";letter-spacing:.03em;}",
    ".mp-exp-lv .n{font-size:16px;}",
    ".mp-exp-next{font-size:12px;color:"+C.mute+";}",
    ".mp-exp-next b{color:"+C.gold+";font-family:'Inter',sans-serif;font-weight:800;}",
    ".mp-exp-bar{height:12px;border-radius:8px;background:#ece5db;overflow:hidden;box-shadow:inset 0 1px 2px rgba(0,0,0,.06);}",
    ".mp-exp-fill{height:100%;border-radius:8px;background:linear-gradient(90deg,"+C.purple+" 0%,#9b6fd6 45%,"+C.gold+" 100%);width:0;transition:width 1.2s cubic-bezier(.22,.61,.36,1);box-shadow:0 0 10px rgba(200,161,78,.5);}",
    /* ステータス */
    ".mp-stats{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin:24px 20px 0;}",
    ".mp-stat{background:#fff;border-radius:20px;box-shadow:0 8px 32px rgba(0,0,0,.08);padding:18px;display:flex;align-items:center;gap:14px;cursor:pointer;transition:transform .2s ease,box-shadow .2s ease;}",
    ".mp-stat:hover{transform:translateY(-3px);box-shadow:0 14px 40px rgba(0,0,0,.12);}",
    ".mp-stat:active{transform:scale(.97);}",
    ".mp-stat-ic{width:44px;height:44px;border-radius:14px;background:linear-gradient(135deg,#f6eee7,#f0e3d8);display:flex;align-items:center;justify-content:center;flex:0 0 44px;color:"+C.accent+";}",
    ".mp-stat-l{font-size:12px;color:"+C.mute+";margin-bottom:2px;}",
    ".mp-stat-v{font-size:34px;font-weight:800;line-height:1;}",
    ".mp-stat-v small{font-size:13px;font-weight:600;color:"+C.mute+";margin-left:3px;}",
    /* セクション */
    ".mp-sec{margin:36px 20px 0;}",
    ".mp-card{background:#fff;border-radius:20px;box-shadow:0 8px 32px rgba(0,0,0,.08);padding:20px;}",
    ".mp-sh{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;}",
    ".mp-h{font-size:20px;font-weight:700;letter-spacing:.01em;}",
    ".mp-more{font-size:12.5px;color:"+C.accent+";cursor:pointer;font-weight:600;}",
    /* クイック */
    ".mp-quick{display:grid;grid-template-columns:1fr 1fr 1fr;gap:22px 10px;}",
    ".mp-q{display:flex;flex-direction:column;align-items:center;gap:9px;cursor:pointer;}",
    ".mp-q-ic{width:60px;height:60px;border-radius:50%;background:linear-gradient(135deg,#faf1e9,#f5e7dc);display:flex;align-items:center;justify-content:center;color:"+C.accent+";box-shadow:0 4px 14px rgba(179,58,40,.12);transition:transform .2s;}",
    ".mp-q:hover .mp-q-ic{transform:translateY(-3px);}",
    ".mp-q:active .mp-q-ic{transform:scale(.94);}",
    ".mp-q-l{font-size:12px;color:"+C.text+";font-weight:500;}",
    /* 今週の実績 */
    ".mp-wk{display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid #f3ede4;}",
    ".mp-wk:last-child{border-bottom:none;padding-bottom:2px;}",
    ".mp-wk-ck{width:24px;height:24px;border-radius:50%;flex:0 0 24px;display:flex;align-items:center;justify-content:center;}",
    ".mp-wk-ck.on{background:"+C.accent+";color:#fff;box-shadow:0 3px 10px rgba(179,58,40,.35);}",
    ".mp-wk-ck.off{background:#efe8dd;color:#c3b4a0;}",
    ".mp-wk-l{flex:1;font-size:14px;color:"+C.text+";}",
    ".mp-wk-p{font-size:12px;color:"+C.accent+";font-weight:700;font-family:'Inter',sans-serif;}",
    ".mp-wk-bar{height:6px;border-radius:4px;background:#efe8dd;overflow:hidden;margin-top:6px;}",
    ".mp-wk-fill{height:100%;background:linear-gradient(90deg,"+C.gold+",#e0c179);border-radius:4px;}",
    /* AIおすすめ */
    ".mp-ai{margin:36px 20px 0;background:linear-gradient(135deg,#f3eefb,#efeaf9);border-radius:20px;padding:20px;display:flex;gap:16px;align-items:center;min-height:120px;box-shadow:0 8px 32px rgba(110,69,184,.1);}",
    ".mp-ai-l{flex:1;}",
    ".mp-ai-h{display:flex;align-items:center;gap:8px;}",
    ".mp-ai-h .mp-h{font-size:16px;}",
    ".mp-ai-new{font-size:9.5px;font-weight:800;color:#5a3a10;background:linear-gradient(135deg,#f0d488,"+C.gold+");padding:3px 9px;border-radius:10px;letter-spacing:.06em;box-shadow:0 2px 6px rgba(200,161,78,.4);}",
    ".mp-ai-txt{font-size:15px;margin:10px 0 8px;}",
    ".mp-ai-txt b{color:"+C.purple+";font-weight:700;}",
    ".mp-ai-tag{display:inline-block;font-size:11px;color:"+C.purple+";background:#fff;border-radius:16px;padding:5px 11px;margin:4px 5px 0 0;box-shadow:0 2px 6px rgba(110,69,184,.08);}",
    ".mp-ai-img{width:96px;height:96px;border-radius:16px;flex:0 0 96px;background:#ccc center/cover;box-shadow:0 6px 18px rgba(0,0,0,.15);}",
    /* 横スクロール共通 */
    ".mp-hs{display:flex;gap:14px;overflow-x:auto;-webkit-overflow-scrolling:touch;padding:2px 2px 4px;}",
    ".mp-hs::-webkit-scrollbar{display:none;}",
    /* 最近の投稿 */
    ".mp-post{flex:0 0 110px;}",
    ".mp-post-img{width:110px;height:150px;border-radius:14px;object-fit:cover;background:#d8cdbf center/cover;display:block;box-shadow:0 6px 18px rgba(0,0,0,.1);}",
    ".mp-post-m{font-size:12px;color:"+C.mute+";margin-top:8px;display:flex;gap:10px;align-items:center;}",
    ".mp-post-m .mp-num{color:"+C.text+";font-weight:600;}",
    /* 御朱印帳 */
    ".mp-gsh{flex:0 0 100px;}",
    ".mp-gsh-img{width:100px;height:140px;border-radius:16px;background:#fff center/cover;box-shadow:0 6px 18px rgba(0,0,0,.12);display:block;border:1px solid #f0e8dc;}",
    ".mp-gsh-l{font-size:11.5px;color:"+C.text+";text-align:center;margin-top:8px;font-weight:500;}",
    /* バッジ */
    ".mp-bdg{flex:0 0 auto;display:flex;flex-direction:column;align-items:center;gap:8px;width:76px;}",
    ".mp-bdg-ic{width:60px;height:60px;border-radius:50%;display:flex;align-items:center;justify-content:center;}",
    ".mp-bdg-ic.got{background:radial-gradient(circle at 35% 28%,#f6e3b8,#d9b463);box-shadow:0 5px 16px rgba(200,161,78,.45),inset 0 -2px 4px rgba(150,110,40,.3);color:#fff;}",
    ".mp-bdg-ic.no{background:#ece7dd;color:#b8ac99;}",
    ".mp-bdg-l{font-size:10.5px;color:"+C.text+";text-align:center;line-height:1.35;}",
    ".mp-bdg-l.no{color:"+C.mute+";}",
    /* 下部ナビ */
    ".mp-nav{position:fixed;bottom:0;left:0;right:0;max-width:430px;margin:0 auto;height:64px;background:rgba(255,255,255,.94);backdrop-filter:saturate(180%) blur(12px);border-top:1px solid #efe7db;display:flex;z-index:11;}",
    ".mp-nav a{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;font-size:10px;color:"+C.mute+";cursor:pointer;font-weight:500;}",
    ".mp-nav a.on{color:"+C.purple+";}"
  ].join("\n");
  document.head.appendChild(css);

  function wikiImg(names, cb){
    try{
      var url='https://ja.wikipedia.org/w/api.php?action=query&format=json&origin=*&prop=pageimages&piprop=thumbnail&pithumbsize=700&redirects=1&titles='+encodeURIComponent(names.join('|'));
      fetch(url).then(function(r){return r.json();}).then(function(j){
        var map={},redir={};
        ((j.query||{}).redirects||[]).forEach(function(r){redir[r.from]=r.to;});
        ((j.query||{}).normalized||[]).forEach(function(r){redir[r.from]=r.to;});
        var pg=(j.query||{}).pages||{};
        Object.keys(pg).forEach(function(k){ if(pg[k].thumbnail) map[pg[k].title]=pg[k].thumbnail.source; });
        var out={}; names.forEach(function(n){ out[n]=map[redir[n]||n]||null; }); cb(out);
      }).catch(function(){cb({});});
    }catch(e){cb({});}
  }

  /* ===== セクション描画 ===== */
  function secProfile(p){
    return '<div class="mp-cover" id="mpCover"><div class="mp-prof">'
      + '<div class="mp-av" id="mpAv">'+(p.avatar?'<img src="'+esc(p.avatar)+'">':ic('user','#fff',40,2))+'</div>'
      + '<div style="padding-bottom:2px"><div class="mp-name">'+p.name+'</div>'
      + '<div class="mp-titlerow"><span class="mp-title">'+p.title+'</span><span class="mp-aititle">'+p.aiTitle+'</span></div></div></div></div>';
  }
  function secExp(p){
    return '<div class="mp-exp"><div class="mp-exp-top"><span class="mp-exp-lv">LV.<span class="n mp-num">'+p.level+'</span></span>'
      + '<span class="mp-exp-next">あと <b>'+p.expToNext+'</b> EXP で Lv.'+(p.level+1)+'</span></div>'
      + '<div class="mp-exp-bar"><div class="mp-exp-fill" id="mpExpFill"></div></div></div>';
  }
  function secStats(p){
    return '<div class="mp-stats">'+p.stats.map(function(s){
      return '<div class="mp-stat" data-tap="1"><div class="mp-stat-ic">'+ic(s.ic,C.accent,23,2.2)+'</div>'
        + '<div><div class="mp-stat-l">'+s.label+'</div>'
        + '<div class="mp-stat-v mp-num" data-count="'+s.value+'">0'+(s.unit?'<small>'+s.unit+'</small>':'')+'</div></div></div>';
    }).join('')+'</div>';
  }
  function secQuick(p){
    return '<div class="mp-sec"><div class="mp-card"><div class="mp-quick">'+p.quick.map(function(q){
      return '<div class="mp-q" data-tap="1"><div class="mp-q-ic">'+ic(q.ic,C.accent,25,2.2)+'</div><div class="mp-q-l">'+q.label+'</div></div>';
    }).join('')+'</div></div></div>';
  }
  function secWeekly(p){
    var w=p.weekly;
    return '<div class="mp-sec"><div class="mp-card"><div class="mp-sh"><div class="mp-h">今週の実績</div><div class="mp-more" style="color:'+C.mute+';cursor:default">'+w.period+'</div></div>'
      + w.items.map(function(it){
        var done=it.done>=it.total, partial=it.done<it.total;
        var bar=partial?'<div class="mp-wk-bar"><div class="mp-wk-fill" style="width:'+Math.round(it.done/it.total*100)+'%"></div></div>':'';
        var ck=done?'<div class="mp-wk-ck on">'+ic('bookmark','#fff',13,3).replace('bookmark','') + '✓</div>':'<div class="mp-wk-ck off">✓</div>';
        ck=done?'<div class="mp-wk-ck on">✓</div>':'<div class="mp-wk-ck off">✓</div>';
        return '<div class="mp-wk">'+ck+'<div style="flex:1"><div class="mp-wk-l">'+it.label+'</div>'+bar+'</div>'
          + '<div class="mp-wk-p">'+(done?'達成':it.done+'/'+it.total)+'</div></div>';
      }).join('')+'</div></div>';
  }
  function secAi(p){
    return '<div class="mp-ai"><div class="mp-ai-l"><div class="mp-ai-h"><span class="mp-h">AIおすすめ</span><span class="mp-ai-new">NEW</span></div>'
      + '<div class="mp-ai-txt">今日は <b>'+p.aiRec.shrine+'</b> がおすすめです</div>'
      + '<div>'+p.aiRec.tags.map(function(t){return '<span class="mp-ai-tag">'+t+'</span>';}).join('')+'</div></div>'
      + '<div class="mp-ai-img" id="mpAiImg"></div></div>';
  }
  function secPosts(){
    var posts=(typeof USER_POSTS!=='undefined'&&USER_POSTS.length)?USER_POSTS.slice(0,6):[];
    var body=posts.length?posts.map(function(p){
      return '<div class="mp-post" data-tap="1"><img class="mp-post-img" src="'+esc(p.img||'')+'" loading="lazy" onerror="this.style.background=\'#d8cdbf\'">'
        + '<div class="mp-post-m">'+ic('star',C.accent,13,2.2).replace('star','')+'<span>'+ic('user',C.mute,0,0).replace(/.+/,'')+'</span>♡ <span class="mp-num">'+(p.likes||0)+'</span>　💬 <span class="mp-num">'+((p.comments&&p.comments.length)||0)+'</span></div></div>';
    }).join(''):'<div style="font-size:13px;color:'+C.mute+';padding:6px">まだ投稿がありません</div>';
    return '<div class="mp-sec"><div class="mp-sh"><div class="mp-h">最近の投稿</div><div class="mp-more" data-tap="1">すべて見る ›</div></div><div class="mp-hs">'+body+'</div></div>';
  }
  function secGoshuin(p){
    return '<div class="mp-sec"><div class="mp-sh"><div class="mp-h">御朱印帳</div><div class="mp-more" data-tap="1">すべて見る ›</div></div><div class="mp-hs">'
      + p.goshuinBook.map(function(n){ return '<div class="mp-gsh" data-tap="1"><div class="mp-gsh-img" data-gsh="'+esc(n)+'"></div><div class="mp-gsh-l">'+n+'</div></div>'; }).join('')
      + '</div></div>';
  }
  function secBadges(p){
    return '<div class="mp-sec"><div class="mp-sh"><div class="mp-h">バッジコレクション</div><div class="mp-more" data-tap="1">すべて見る ›</div></div><div class="mp-hs">'
      + p.badges.map(function(b){
        return '<div class="mp-bdg" data-tap="1"><div class="mp-bdg-ic '+(b.got?'got':'no')+'">'+ic(b.ic,b.got?'#fff':'#b8ac99',26,2.2)+'</div><div class="mp-bdg-l '+(b.got?'':'no')+'">'+b.label+'</div></div>';
      }).join('')+'</div></div>';
  }
  function secNav(){
    return '<div class="mp-nav"><a data-tap="1">'+ic('home',C.mute,20,2)+'<span>ホーム</span></a>'
      + '<a data-tap="1">'+ic('search',C.mute,20,2)+'<span>さがす</span></a>'
      + '<a data-tap="1">'+ic('map',C.mute,20,2)+'<span>ルート</span></a>'
      + '<a data-tap="1">'+ic('plus',C.mute,20,2)+'<span>投稿</span></a>'
      + '<a class="on">'+ic('user',C.purple,20,2.2)+'<span>マイページ</span></a></div>';
  }

  var page=document.createElement('div'); page.id='wcMypage'; document.body.appendChild(page);

  function countUp(el,to){
    var t0=null, dur=900;
    function step(ts){ if(!t0)t0=ts; var k=Math.min(1,(ts-t0)/dur); var e=1-Math.pow(1-k,3);
      var small=el.querySelector('small'); el.firstChild.nodeValue=Math.round(e*to);
      if(k<1)requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function render(){
    var p=WABI_PROFILE;
    page.innerHTML='<div class="mp-hd"><span class="mp-ico" id="mpBack">'+ic('chevron',C.text,22,2.4)+'</span><span class="mp-t">マイページ</span><span class="mp-ico" id="mpGear">'+ic('settings',C.text,21,2)+'</span></div>'
      + '<div class="mp-in">'+secProfile(p)+secExp(p)+secStats(p)+secQuick(p)+secWeekly(p)+secAi(p)+secPosts()+secGoshuin(p)+secBadges(p)+'</div>'+secNav();

    document.getElementById('mpBack').onclick=function(){ page.classList.remove('show'); page.style.display='none'; };
    document.getElementById('mpGear').onclick=function(){ toast('設定は準備中です'); };
    page.querySelectorAll('[data-tap]').forEach(function(el){ el.addEventListener('click',function(){ toast('この機能は準備中です'); }); });

    setTimeout(function(){
      var f=document.getElementById('mpExpFill'); if(f)f.style.width=p.expPercent+'%';
      page.querySelectorAll('.mp-stat-v[data-count]').forEach(function(el){ countUp(el, +el.getAttribute('data-count')); });
    },160);

    wikiImg([p.coverShrine,p.aiRec.shrine].concat(p.goshuinBook),function(map){
      var cv=document.getElementById('mpCover'); if(cv&&map[p.coverShrine])cv.style.background='#3a3025 url('+map[p.coverShrine]+') center/cover';
      var ai=document.getElementById('mpAiImg'); if(ai&&map[p.aiRec.shrine])ai.style.background='url('+map[p.aiRec.shrine]+') center/cover';
      page.querySelectorAll('[data-gsh]').forEach(function(el){ var u=map[el.getAttribute('data-gsh')]; if(u)el.style.background='url('+u+') center/cover'; });
    });
  }
  function toast(m){ if(typeof showToast==='function') showToast(m); }
  window.openWabiMypage=function(){ render(); page.style.display='block'; requestAnimationFrame(function(){ page.classList.add('show'); }); page.scrollTop=0; };

  /* トップ右上メニューを「マイページ」に */
  function hookMenu(){
    try{
      var cand=[].slice.call(document.querySelectorAll('.site-hd *, header *, [class*=menu], [class*=hd] *'))
        .filter(function(e){ return e.children.length===0 && /メニュー/.test((e.textContent||'').trim()) && (e.textContent||'').trim().length<8; });
      cand.forEach(function(l){ l.textContent='マイページ'; });
      var btns=[];
      cand.forEach(function(l){ var t=l.closest('a,button,div'); if(t)btns.push(t); });
      btns.forEach(function(b){ b.setAttribute('onclick',''); b.onclick=function(e){ if(e){e.preventDefault();e.stopPropagation();} window.openWabiMypage(); return false; }; });
    }catch(e){}
  }
  hookMenu(); setInterval(hookMenu,2000);
})();
