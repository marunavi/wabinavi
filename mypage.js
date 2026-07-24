/* ============================================================
   わびなび マイページ（mypage.js）
   ・独立ファイル。concierge.js から読み込まれる
   ・編集可能データは WABI_PROFILE に集約（将来API/管理画面で差し替え可）
   ・将来追加: レベルアップ演出/ランキング/連続参拝/制覇率/イベント/限定バッジ/
     毎日ミッション/フレンド/通知 … 各セクションを関数で分割しコンポーネント化
   ============================================================ */
(function () {
  'use strict';
  if (window.__wabiMypageLoaded) return;
  window.__wabiMypageLoaded = true;

  /* ===== 編集可能データ ===== */
  var WABI_PROFILE = {
    name: '巡礼者 太郎',
    title: '巡礼者',
    aiTitle: 'いつもおだやか',
    level: 19,
    expToNext: 340,
    expPercent: 62,
    coverShrine: '厳島神社',   // 表紙写真（神社名から自動取得）
    avatar: '',                // 空ならシルエット
    stats: [
      { key:'shrines',  icon:'⛩', label:'参拝した神社', value:28, unit:'社' },
      { key:'goshuin',  icon:'📕', label:'御朱印',       value:36, unit:'体' },
      { key:'routes',   icon:'🗺', label:'作成したルート', value:5,  unit:'ルート' },
      { key:'posts',    icon:'📝', label:'投稿した記録',  value:12, unit:'作' },
      { key:'follow',   icon:'👥', label:'フォロー',      value:24, unit:'人' },
      { key:'follower', icon:'🎗', label:'フォロワー',    value:37, unit:'人' }
    ],
    quick: [
      { icon:'⛩', label:'参拝履歴' },
      { icon:'📕', label:'御朱印帳' },
      { icon:'⭐', label:'行きたい神社' },
      { icon:'🗺', label:'作成したルート' },
      { icon:'📝', label:'投稿した記録' },
      { icon:'🔖', label:'保存した記事' }
    ],
    weekly: {
      period: '5/12〜5/18',
      items: [
        { label:'神社に3社参拝する',   done:3,  total:3 },
        { label:'御朱印を1体登録する', done:1,  total:1 },
        { label:'投稿をする',          done:1,  total:1 },
        { label:'EXPを100獲得する',    done:60, total:100 }
      ]
    },
    aiRec: { shrine:'伏見稲荷大社', tags:['混雑が少ない時間帯','御朱印が人気','パワースポット'] },
    goshuinBook: ['伏見稲荷大社','出雲大社','明治神宮'],
    badges: [
      { icon:'⛩', label:'初参拝' },
      { icon:'📕', label:'御朱印コレクター' },
      { icon:'🎌', label:'パワースポット巡り' },
      { icon:'👘', label:'歴史探訪家' }
    ]
  };

  /* ===== 配色・スタイル（モックアップ準拠） ===== */
  var MP = {
    purple:'#7B4CC2', accent:'#B33A28', gold:'#C9A449', bg:'#FAF7F2'
  };
  var css = document.createElement('style');
  css.textContent = [
    "#wcMypage{position:fixed;inset:0;z-index:290;background:"+MP.bg+";overflow-y:auto;-webkit-overflow-scrolling:touch;display:none;font-family:'Noto Sans JP',sans-serif;}",
    ".mp-in{max-width:430px;margin:0 auto;padding-bottom:86px;}",
    ".mp-hd{position:sticky;top:0;z-index:10;height:56px;background:#fff;display:flex;align-items:center;justify-content:space-between;padding:0 16px;box-shadow:0 2px 10px rgba(0,0,0,.06);}",
    ".mp-hd .mp-t{font-size:16px;font-weight:700;color:#2a2a2a;}",
    ".mp-ico{font-size:19px;color:#333;cursor:pointer;width:34px;height:34px;display:flex;align-items:center;justify-content:center;}",
    ".mp-cover{position:relative;height:224px;background:#5a4a3a center/cover;}",
    ".mp-cover-grad{position:absolute;inset:0;background:linear-gradient(to bottom,rgba(0,0,0,.4),rgba(0,0,0,0) 34%,rgba(250,247,242,0) 55%,"+MP.bg+" 100%);}",
    ".mp-prof{position:absolute;left:20px;right:20px;bottom:12px;display:flex;align-items:flex-end;gap:14px;z-index:2;}",
    ".mp-av{width:80px;height:80px;border-radius:50%;border:3px solid #fff;background:#8a7a66 center/cover;flex:0 0 80px;display:flex;align-items:center;justify-content:center;font-size:34px;color:#fff;box-shadow:0 2px 8px rgba(0,0,0,.25);overflow:hidden;}",
    ".mp-av img{width:100%;height:100%;object-fit:cover;}",
    ".mp-name{font-size:22px;font-weight:800;color:"+MP.accent+";line-height:1.2;}",
    ".mp-titlerow{display:flex;align-items:center;gap:8px;margin-top:5px;}",
    ".mp-title{font-size:12px;font-weight:700;color:"+MP.accent+";}",
    ".mp-aititle{font-size:11px;color:#6a5a48;background:rgba(255,255,255,.85);padding:2px 10px;border-radius:12px;}",
    ".mp-exp{margin:6px 20px 0;}",
    ".mp-exp-label{font-size:12px;color:#8a7a66;text-align:center;margin-bottom:5px;}",
    ".mp-exp-label b{color:"+MP.accent+";}",
    ".mp-exp-bar{height:12px;border-radius:8px;background:#ece5db;overflow:hidden;}",
    ".mp-exp-fill{height:100%;border-radius:8px;background:linear-gradient(90deg,"+MP.purple+","+MP.gold+");width:0;transition:width 1.1s cubic-bezier(.22,.61,.36,1);}",
    ".mp-stats{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:20px;}",
    ".mp-stat{background:#fff;border-radius:18px;box-shadow:0 4px 20px rgba(0,0,0,.08);padding:14px 14px;display:flex;align-items:center;gap:12px;cursor:pointer;transition:transform .2s;}",
    ".mp-stat:active{transform:scale(.97);}",
    ".mp-stat-ic{width:38px;height:38px;border-radius:12px;background:#fbeae6;display:flex;align-items:center;justify-content:center;font-size:19px;flex:0 0 38px;}",
    ".mp-stat-l{font-size:11px;color:#9a8a78;}",
    ".mp-stat-v{font-size:22px;font-weight:800;color:#2a2a2a;line-height:1.1;}",
    ".mp-stat-v small{font-size:11px;font-weight:600;color:#9a8a78;margin-left:2px;}",
    ".mp-card{background:#fff;border-radius:20px;box-shadow:0 4px 20px rgba(0,0,0,.08);margin:0 20px 24px;padding:18px;}",
    ".mp-cardh{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;}",
    ".mp-h{font-size:16px;font-weight:800;color:#2a2a2a;}",
    ".mp-more{font-size:12px;color:"+MP.accent+";cursor:pointer;}",
    ".mp-quick{display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px 8px;}",
    ".mp-q{display:flex;flex-direction:column;align-items:center;gap:7px;cursor:pointer;}",
    ".mp-q-ic{width:58px;height:58px;border-radius:50%;background:#faf0e8;display:flex;align-items:center;justify-content:center;font-size:24px;color:"+MP.accent+";transition:transform .2s;}",
    ".mp-q:active .mp-q-ic{transform:scale(.94);}",
    ".mp-q-l{font-size:11.5px;color:#4a4a4a;}",
    ".mp-wk{display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid #f2ece2;}",
    ".mp-wk:last-child{border-bottom:none;}",
    ".mp-wk-ck{width:20px;height:20px;border-radius:50%;flex:0 0 20px;display:flex;align-items:center;justify-content:center;font-size:12px;color:#fff;}",
    ".mp-wk-ck.on{background:"+MP.accent+";}",
    ".mp-wk-ck.off{background:#e6ddd0;color:#b7a993;}",
    ".mp-wk-l{flex:1;font-size:13.5px;color:#3a3a3a;}",
    ".mp-wk-p{font-size:12px;color:"+MP.accent+";font-weight:700;}",
    ".mp-wk-bar{height:6px;border-radius:4px;background:#ece5db;overflow:hidden;margin-top:4px;}",
    ".mp-wk-fill{height:100%;background:"+MP.gold+";border-radius:4px;}",
    ".mp-ai{background:#f3eefb;border-radius:20px;margin:0 20px 24px;padding:16px;display:flex;gap:12px;align-items:center;box-shadow:0 4px 20px rgba(0,0,0,.05);}",
    ".mp-ai-l{flex:1;}",
    ".mp-ai-tag{display:inline-block;font-size:10.5px;color:"+MP.purple+";background:#fff;border:1px solid #ddd0f0;border-radius:12px;padding:3px 9px;margin:4px 4px 0 0;}",
    ".mp-ai-img{width:74px;height:74px;border-radius:14px;flex:0 0 74px;background:#ccc center/cover;}",
    ".mp-badge-new{font-size:9px;color:#fff;background:"+MP.accent+";border-radius:8px;padding:2px 7px;margin-left:6px;vertical-align:middle;}",
    ".mp-hscroll{display:flex;gap:10px;overflow-x:auto;-webkit-overflow-scrolling:touch;padding:2px;}",
    ".mp-hscroll::-webkit-scrollbar{display:none;}",
    ".mp-post{flex:0 0 110px;}",
    ".mp-post-img{width:110px;height:150px;border-radius:12px;object-fit:cover;background:#ccc center/cover;display:block;}",
    ".mp-post-m{font-size:11px;color:#8a7a66;margin-top:5px;}",
    ".mp-gsh{flex:0 0 100px;}",
    ".mp-gsh-img{width:100px;height:140px;border-radius:12px;background:#fff center/cover;box-shadow:0 2px 8px rgba(0,0,0,.12);display:block;}",
    ".mp-gsh-l{font-size:11px;color:#4a4a4a;text-align:center;margin-top:6px;}",
    ".mp-bdg{flex:0 0 auto;display:flex;flex-direction:column;align-items:center;gap:6px;width:74px;}",
    ".mp-bdg-ic{width:60px;height:60px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#f7e6c8,#e6c98a);display:flex;align-items:center;justify-content:center;font-size:26px;box-shadow:0 3px 10px rgba(201,164,73,.35);}",
    ".mp-bdg-l{font-size:10px;color:#4a4a4a;text-align:center;line-height:1.3;}",
    ".mp-nav{position:fixed;bottom:0;left:0;right:0;max-width:430px;margin:0 auto;height:62px;background:#fff;border-top:1px solid #efe7db;display:flex;z-index:11;}",
    ".mp-nav a{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;font-size:10px;color:#9a8a78;cursor:pointer;}",
    ".mp-nav a.on{color:"+MP.purple+";}",
    ".mp-nav a .i{font-size:18px;}"
  ].join("\n");
  document.head.appendChild(css);

  /* ===== Wikipedia写真の取得（表紙/AIおすすめ/御朱印帳用） ===== */
  function wikiImg(names, cb){
    try{
      var url='https://ja.wikipedia.org/w/api.php?action=query&format=json&origin=*&prop=pageimages&piprop=thumbnail&pithumbsize=600&redirects=1&titles='+encodeURIComponent(names.join('|'));
      fetch(url).then(function(r){return r.json();}).then(function(j){
        var map={},redir={};
        ((j.query||{}).redirects||[]).forEach(function(r){redir[r.from]=r.to;});
        ((j.query||{}).normalized||[]).forEach(function(r){redir[r.from]=r.to;});
        var pages=(j.query||{}).pages||{};
        Object.keys(pages).forEach(function(k){ if(pages[k].thumbnail) map[pages[k].title]=pages[k].thumbnail.source; });
        var out={}; names.forEach(function(n){ out[n]=map[redir[n]||n]||null; });
        cb(out);
      }).catch(function(){cb({});});
    }catch(e){cb({});}
  }
  function esc(s){ return String(s==null?'':s).replace(/"/g,'&quot;'); }

  /* ===== 各セクションの描画（コンポーネント化） ===== */
  function secProfile(p){
    return '<div class="mp-cover" id="mpCover"><div class="mp-cover-grad"></div>'
      + '<div class="mp-prof"><div class="mp-av" id="mpAv">'+(p.avatar?'<img src="'+esc(p.avatar)+'">':'👤')+'</div>'
      + '<div><div class="mp-name">'+p.name+'</div>'
      + '<div class="mp-titlerow"><span class="mp-title">'+p.title+'</span><span class="mp-aititle">'+p.aiTitle+'</span></div></div></div></div>';
  }
  function secExp(p){
    return '<div class="mp-exp"><div class="mp-exp-label">あと <b>'+p.expToNext+'EXP</b> で Lv.'+(p.level+1)+'（現在 Lv.'+p.level+'）</div>'
      + '<div class="mp-exp-bar"><div class="mp-exp-fill" id="mpExpFill"></div></div></div>';
  }
  function secStats(p){
    return '<div class="mp-stats">'+p.stats.map(function(s){
      return '<div class="mp-stat" data-stat="'+s.key+'"><div class="mp-stat-ic">'+s.icon+'</div>'
        + '<div><div class="mp-stat-l">'+s.label+'</div><div class="mp-stat-v">'+s.value+'<small>'+s.unit+'</small></div></div></div>';
    }).join('')+'</div>';
  }
  function secQuick(p){
    return '<div class="mp-card"><div class="mp-quick">'+p.quick.map(function(q){
      return '<div class="mp-q" data-quick="'+q.label+'"><div class="mp-q-ic">'+q.icon+'</div><div class="mp-q-l">'+q.label+'</div></div>';
    }).join('')+'</div></div>';
  }
  function secWeekly(p){
    var w=p.weekly;
    return '<div class="mp-card"><div class="mp-cardh"><div class="mp-h">今週の実績</div><div class="mp-more" style="cursor:default;color:#a99">期間：'+w.period+'</div></div>'
      + w.items.map(function(it){
        var done = it.done>=it.total;
        var partial = it.done<it.total;
        var bar = partial ? '<div class="mp-wk-bar"><div class="mp-wk-fill" style="width:'+Math.round(it.done/it.total*100)+'%"></div></div>' : '';
        return '<div class="mp-wk"><div class="mp-wk-ck '+(done?'on':'off')+'">✓</div>'
          + '<div style="flex:1"><div class="mp-wk-l">'+it.label+'</div>'+bar+'</div>'
          + '<div class="mp-wk-p">'+(done?'達成':it.done+'/'+it.total)+'</div></div>';
      }).join('')+'</div>';
  }
  function secAi(p){
    return '<div class="mp-ai"><div class="mp-ai-l"><div class="mp-h" style="font-size:14px">AIおすすめ<span class="mp-badge-new">NEW</span></div>'
      + '<div style="font-size:13px;color:#3a3a3a;margin:6px 0 2px">今日は <b style="color:'+MP.purple+'">'+p.aiRec.shrine+'</b> がおすすめです</div>'
      + '<div>'+p.aiRec.tags.map(function(t){return '<span class="mp-ai-tag">'+t+'</span>';}).join('')+'</div></div>'
      + '<div class="mp-ai-img" id="mpAiImg"></div></div>';
  }
  function secPosts(){
    var posts = (typeof USER_POSTS!=='undefined' && USER_POSTS.length) ? USER_POSTS.slice(0,6) : [];
    var body = posts.length ? posts.map(function(p){
      return '<div class="mp-post"><img class="mp-post-img" src="'+esc(p.img||'')+'" loading="lazy" onerror="this.style.background=\'#d8cdbf\'">'
        + '<div class="mp-post-m">♡ '+(p.likes||0)+'　💬 '+((p.comments&&p.comments.length)||0)+'</div></div>';
    }).join('') : '<div style="font-size:12px;color:#a99;padding:6px">まだ投稿がありません</div>';
    return '<div class="mp-card"><div class="mp-cardh"><div class="mp-h">最近の投稿</div><div class="mp-more">すべて見る ›</div></div><div class="mp-hscroll">'+body+'</div></div>';
  }
  function secGoshuin(p){
    return '<div class="mp-card"><div class="mp-cardh"><div class="mp-h">御朱印帳</div><div class="mp-more">すべて見る ›</div></div><div class="mp-hscroll" id="mpGsh">'
      + p.goshuinBook.map(function(n){ return '<div class="mp-gsh"><div class="mp-gsh-img" data-gsh="'+esc(n)+'"></div><div class="mp-gsh-l">'+n+'</div></div>'; }).join('')
      + '</div></div>';
  }
  function secBadges(p){
    return '<div class="mp-card"><div class="mp-cardh"><div class="mp-h">バッジコレクション</div><div class="mp-more">すべて見る ›</div></div><div class="mp-hscroll">'
      + p.badges.map(function(b){ return '<div class="mp-bdg"><div class="mp-bdg-ic">'+b.icon+'</div><div class="mp-bdg-l">'+b.label+'</div></div>'; }).join('')
      + '</div></div>';
  }
  function secNav(){
    return '<div class="mp-nav"><a data-nav="home"><span class="i">🏠</span>ホーム</a><a data-nav="search"><span class="i">🔍</span>さがす</a>'
      + '<a data-nav="route"><span class="i">🗺</span>ルート</a><a data-nav="post"><span class="i">📝</span>投稿</a>'
      + '<a class="on"><span class="i">👤</span>マイページ</a></div>';
  }

  /* ===== ページ生成 ===== */
  var page = document.createElement('div'); page.id='wcMypage';
  document.body.appendChild(page);

  function render(){
    var p = WABI_PROFILE;
    page.innerHTML = '<div class="mp-hd"><span class="mp-ico" id="mpBack">‹</span><span class="mp-t">マイページ</span><span class="mp-ico" id="mpGear">⚙</span></div>'
      + '<div class="mp-in">'
      + secProfile(p) + secExp(p) + secStats(p) + secQuick(p) + secWeekly(p) + secAi(p) + secPosts() + secGoshuin(p) + secBadges(p)
      + '</div>' + secNav();

    document.getElementById('mpBack').onclick = function(){ page.style.display='none'; };
    document.getElementById('mpGear').onclick = function(){ toast('設定は準備中です'); };
    page.querySelectorAll('[data-stat],[data-quick],.mp-more,.mp-nav a').forEach(function(el){
      if (el.classList.contains('on')) return;
      el.addEventListener('click', function(){ toast('この機能は準備中です'); });
    });
    // EXPバー・写真は表示後に反映
    setTimeout(function(){ var f=document.getElementById('mpExpFill'); if(f) f.style.width=p.expPercent+'%'; }, 120);
    var wantImg = [p.coverShrine, p.aiRec.shrine].concat(p.goshuinBook);
    wikiImg(wantImg, function(map){
      var cover=document.getElementById('mpCover'); if(cover && map[p.coverShrine]) cover.style.background='#5a4a3a url('+map[p.coverShrine]+') center/cover';
      var ai=document.getElementById('mpAiImg'); if(ai && map[p.aiRec.shrine]) ai.style.background='url('+map[p.aiRec.shrine]+') center/cover';
      page.querySelectorAll('[data-gsh]').forEach(function(el){ var u=map[el.getAttribute('data-gsh')]; if(u) el.style.background='url('+u+') center/cover'; });
    });
  }
  function toast(m){ if(typeof showToast==='function') showToast(m); }

  window.openWabiMypage = function(){ render(); page.style.display='block'; page.scrollTop=0; };

  /* ===== トップ右上メニューを「マイページ」に変更 ===== */
  function hookMenu(){
    try{
      // ヘッダー右側の「メニュー」ボタンを探す
      var cand = [].slice.call(document.querySelectorAll('.site-hd *, header *, [class*=menu], [class*=hd] *'))
        .filter(function(e){ return e.children.length===0 && /メニュー/.test((e.textContent||'').trim()) && (e.textContent||'').trim().length<8; });
      cand.forEach(function(lbl){ lbl.textContent='マイページ'; });
      // クリック対象（アイコン＋ラベルの親）に割り当て
      var btns = [].slice.call(document.querySelectorAll('.site-hd [onclick], .site-hd a, .site-hd button, header [onclick]'))
        .filter(function(e){ return /マイページ|メニュー/.test(e.textContent||''); });
      if (!btns.length){
        // ラベルの親要素をクリック対象に
        cand.forEach(function(lbl){ var t=lbl.closest('a,button,div'); if(t) btns.push(t); });
      }
      btns.forEach(function(b){ b.setAttribute('onclick',''); b.onclick=function(e){ if(e){e.preventDefault();e.stopPropagation();} window.openWabiMypage(); return false; }; });
    }catch(e){}
  }
  hookMenu();
  setInterval(hookMenu, 2000);
})();
