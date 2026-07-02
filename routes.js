// ══════════════════════════════════════════════════════════
// わびなび おすすめ巡拝ルート データ（10ルート）
// このファイルを書き換えてGitHubのdataフォルダに上げ直せば、
// index.html を触らずにルートを変更できます。
// ══════════════════════════════════════════════════════════
(function(){
  var IMG = [
    'https://images.unsplash.com/photo-1478436127897-769e1b3f0f36?w=520&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1480796927426-f609979314bd?w=520&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1493997181344-712f2f19d87a?w=520&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1503249023995-51b0f3778ccf?w=520&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1583416750470-965b2707b355?w=520&q=80&auto=format&fit=crop'
  ];

  var R = [
    {
      id:'r1', name:'東国三社巡り', emoji:'⛩',
      transport:'車', time:'約4時間', totalMove:'総移動時間 約45分',
      desc:'武神を祀る関東屈指のパワースポット三社を巡る、江戸時代から「お伊勢参りのみそぎ参り」と呼ばれた開運の旅です',
      tags:['関東最強の開運','東国三社守'],
      cardDesc:'武神を祀る関東最強の三社。<br>江戸から続く開運参り',
      cardTag:'開運', cardImg: IMG[0],
      spots:[
        {name:'鹿島神宮',loc:'茨城県鹿嶋市',move:'出発地から約10分',benefit:'勝負運・決断力',lat:35.9688,lng:140.6315},
        {name:'香取神宮',loc:'千葉県香取市',move:'約20分',benefit:'勝運・交通安全',lat:35.8857,lng:140.5288},
        {name:'息栖神社',loc:'茨城県神栖市',move:'約20分',benefit:'厄除招福・交通守護',lat:35.8858,lng:140.6251}
      ]
    },
    {
      id:'r2', name:'えびす・だいこく両参り', emoji:'🎣',
      transport:'車', time:'約5時間', totalMove:'総移動時間 約1時間30分',
      desc:'縁結びの大国主大神と商売繁盛のえびす様。親子二柱の神様を続けて参ると御利益が倍になると伝わる山陰の両参りです',
      tags:['縁結び','商売繁盛'],
      cardDesc:'出雲の大国さまとえびす様、<br>親子の神を巡る山陰の旅',
      cardTag:'縁結び', cardImg: IMG[1],
      spots:[
        {name:'出雲大社',loc:'島根県出雲市',move:'出発地から約25分',benefit:'縁結び・福徳開運',lat:35.3998,lng:132.6852},
        {name:'美保神社',loc:'島根県松江市',move:'約1時間30分',benefit:'商売繁盛・海上安全',lat:35.5622,lng:133.3067}
      ]
    },
    {
      id:'r3', name:'お伊勢参り', emoji:'☀️',
      transport:'バス', time:'約7時間', totalMove:'総移動時間 約1時間10分',
      desc:'二見浦の禊から外宮・内宮へ、古式ゆかしい正式順路で巡る「一生に一度はお伊勢参り」。締めは鬼門を守る朝熊岳金剛證寺へ',
      tags:['正式順路','一生に一度'],
      cardDesc:'禊から内宮へ、正式順路で<br>巡る一生に一度のお参り',
      cardTag:'正式順路', cardImg: IMG[2],
      spots:[
        {name:'二見興玉神社',loc:'三重県伊勢市',move:'出発地から約15分',benefit:'禊・夫婦円満',lat:34.5083,lng:136.7888},
        {name:'伊勢神宮 外宮（豊受大神宮）',loc:'三重県伊勢市',move:'約20分',benefit:'衣食住・産業守護',lat:34.4874,lng:136.7037},
        {name:'猿田彦神社',loc:'三重県伊勢市',move:'約10分',benefit:'みちひらき',lat:34.4674,lng:136.7202},
        {name:'伊勢神宮 内宮（皇大神宮）',loc:'三重県伊勢市',move:'約5分',benefit:'開運・国家安泰',lat:34.4569,lng:136.7230},
        {name:'朝熊岳金剛證寺',loc:'三重県伊勢市',move:'約20分',benefit:'厄除け・福徳',lat:34.4575,lng:136.7854}
      ]
    },
    {
      id:'r4', name:'熊野三山', emoji:'🦅',
      transport:'車', time:'約7時間', totalMove:'総移動時間 約2時間',
      desc:'「よみがえりの聖地」熊野。導きの八咫烏に見守られながら三つの大社を巡り、心を再生する祈りの旅です',
      tags:['よみがえりの聖地','世界遺産'],
      cardDesc:'よみがえりの聖地・熊野。<br>八咫烏が導く再生の旅',
      cardTag:'世界遺産', cardImg: IMG[3],
      spots:[
        {name:'熊野本宮大社',loc:'和歌山県田辺市',move:'出発地から約30分',benefit:'よみがえり・開運',lat:33.8404,lng:135.7736},
        {name:'熊野速玉大社',loc:'和歌山県新宮市',move:'約45分',benefit:'現世安穏・夫婦円満',lat:33.7323,lng:135.9837},
        {name:'熊野那智大社',loc:'和歌山県那智勝浦町',move:'約40分',benefit:'諸願成就・縁結び',lat:33.6684,lng:135.8904}
      ]
    },
    {
      id:'r5', name:'諏訪大社 四社巡り', emoji:'🌲',
      transport:'車', time:'約4時間', totalMove:'総移動時間 約45分',
      desc:'諏訪湖を囲む上社・下社の四宮すべてを参る「四社まいり」。御柱に守られた日本最古級の古社の気に触れます',
      tags:['御柱','四社まいり'],
      cardDesc:'諏訪湖を囲む四つのお宮を<br>一日で参る「四社まいり」',
      cardTag:'御柱', cardImg: IMG[4],
      spots:[
        {name:'諏訪大社 上社本宮',loc:'長野県諏訪市',move:'出発地から約15分',benefit:'勝負運・開運',lat:35.9985,lng:138.1190},
        {name:'諏訪大社 上社前宮',loc:'長野県茅野市',move:'約5分',benefit:'生命力・水の恵み',lat:35.9911,lng:138.1334},
        {name:'諏訪大社 下社秋宮',loc:'長野県下諏訪町',move:'約20分',benefit:'家内安全・縁結び',lat:36.0749,lng:138.0903},
        {name:'諏訪大社 下社春宮',loc:'長野県下諏訪町',move:'約5分',benefit:'子授け・安産',lat:36.0818,lng:138.0819}
      ]
    },
    {
      id:'r6', name:'戸隠神社 五社巡り', emoji:'⛰',
      transport:'車', time:'約6時間', totalMove:'総移動時間 約2時間',
      desc:'天岩戸開き神話ゆかりの五社を麓から奥社へ。樹齢400年を超える杉並木の参道が神域へと導きます',
      tags:['天岩戸神話','杉並木'],
      cardDesc:'天岩戸神話の五社を麓から<br>奥社へ。杉並木の神域歩き',
      cardTag:'杉並木', cardImg: IMG[0],
      spots:[
        {name:'戸隠神社 宝光社',loc:'長野県長野市',move:'出発地から約50分',benefit:'女性守護・技芸上達',lat:36.7324,lng:138.0759},
        {name:'戸隠神社 火之御子社',loc:'長野県長野市',move:'約3分',benefit:'舞楽芸能・縁結び',lat:36.7372,lng:138.0797},
        {name:'戸隠神社 中社',loc:'長野県長野市',move:'約5分',benefit:'学業成就・商売繁盛',lat:36.7425,lng:138.0850},
        {name:'戸隠神社 九頭龍社',loc:'長野県長野市',move:'車約10分＋徒歩約40分',benefit:'水の恵み・縁結び',lat:36.7654,lng:138.0622},
        {name:'戸隠神社 奥社',loc:'長野県長野市',move:'徒歩約2分',benefit:'開運・心願成就',lat:36.7657,lng:138.0625}
      ]
    },
    {
      id:'r7', name:'秩父三社巡り', emoji:'🐺',
      transport:'車', time:'約7時間', totalMove:'総移動時間 約1時間50分',
      desc:'秩父神社・宝登山神社・三峯神社。オオカミ信仰が今も息づく、秩父の山々の霊気に満ちた三社を巡ります',
      tags:['オオカミ信仰','関東屈指の気'],
      cardDesc:'オオカミ信仰が息づく<br>秩父の霊気に触れる三社',
      cardTag:'霊気', cardImg: IMG[1],
      spots:[
        {name:'秩父神社',loc:'埼玉県秩父市',move:'出発地から約5分',benefit:'学業成就・開運',lat:35.9976,lng:139.0842},
        {name:'宝登山神社',loc:'埼玉県長瀞町',move:'約25分',benefit:'火防・金運',lat:36.0933,lng:139.1031},
        {name:'三峯神社',loc:'埼玉県秩父市',move:'約1時間20分',benefit:'厄除け・心願成就',lat:35.9257,lng:138.9298}
      ]
    },
    {
      id:'r8', name:'京都 五社巡り', emoji:'🏮',
      transport:'電車', time:'約7時間', totalMove:'総移動時間 約2時間40分',
      desc:'平安京を守る四神の社と中央の平安神宮。千年の都の結界を一日で巡る「京都五社めぐり」。専用色紙の御朱印集めも人気です',
      tags:['四神相応','専用色紙あり'],
      cardDesc:'平安京を守る四神の社と<br>平安神宮。千年の都の結界',
      cardTag:'色紙巡拝', cardImg: IMG[2],
      spots:[
        {name:'上賀茂神社（北・玄武）',loc:'京都市北区',move:'出発地から約40分',benefit:'厄除け・雷除け',lat:35.0605,lng:135.7523},
        {name:'松尾大社（西・白虎）',loc:'京都市西京区',move:'約40分',benefit:'醸造守護・開運',lat:35.0002,lng:135.6853},
        {name:'城南宮（南・朱雀）',loc:'京都市伏見区',move:'約35分',benefit:'方除け・旅行安全',lat:34.9506,lng:135.7470},
        {name:'八坂神社（東・青龍）',loc:'京都市東山区',move:'約30分',benefit:'厄除け・美容',lat:35.0036,lng:135.7783},
        {name:'平安神宮（中央）',loc:'京都市左京区',move:'約15分',benefit:'開運招福・縁結び',lat:35.0161,lng:135.7829}
      ]
    },
    {
      id:'r9', name:'富士山麓両参り', emoji:'🗻',
      transport:'車', time:'約2時間30分', totalMove:'総移動時間 約15分',
      desc:'富士北麓の総社・北口本宮と、日本三大金運神社に数えられる新屋山神社。霊峰のご神気をいただく両参りです',
      tags:['金運日本一','富士のご神気'],
      cardDesc:'霊峰のご神気と日本三大<br>金運神社を短時間で両参り',
      cardTag:'金運', cardImg: IMG[3],
      spots:[
        {name:'北口本宮冨士浅間神社',loc:'山梨県富士吉田市',move:'出発地から約5分',benefit:'開運・安産・火防',lat:35.4710,lng:138.7926},
        {name:'新屋山神社',loc:'山梨県富士吉田市',move:'約10分',benefit:'金運・商売繁盛',lat:35.4668,lng:138.7973}
      ]
    },
    {
      id:'r10', name:'筑波山神社 両参り', emoji:'💞',
      transport:'徒歩', time:'約4時間30分', totalMove:'総移動時間 約1時間45分',
      desc:'男女二柱の神様が鎮まる霊峰筑波。麓の拝殿から男体山・女体山それぞれの御本殿を参る、縁結びの登拝です',
      tags:['縁結び','登拝'],
      cardDesc:'男体山と女体山、二柱の<br>御本殿を参る縁結び登拝',
      cardTag:'縁結び', cardImg: IMG[4],
      spots:[
        {name:'筑波山神社（拝殿）',loc:'茨城県つくば市',move:'出発地からバス約40分',benefit:'縁結び・夫婦和合',lat:36.2131,lng:140.1013},
        {name:'筑波山神社 男体山御本殿',loc:'茨城県つくば市',move:'ケーブルカー約8分＋徒歩約15分',benefit:'開運・国土安寧',lat:36.2258,lng:140.0984},
        {name:'筑波山神社 女体山御本殿',loc:'茨城県つくば市',move:'徒歩約40分',benefit:'縁結び・良縁成就',lat:36.2255,lng:140.1066}
      ]
    }
  ];

  // ── ① アプリ本体のルートデータを10ルートに差し替え ──
  window.AI_ROUTES = R;

  // ── ② 固定ルート表示時に神社の数が削られないようにする ──
  var origRender = window.renderRouteCards;
  if (typeof origRender === 'function') {
    window.renderRouteCards = function(){
      if (!window._aiQuery && !window._dynamicRoutes) { window._dynamicRoutes = R; }
      origRender();
      // 交通手段の表示を各ルートの推奨手段（車・バス・徒歩など）に直す
      if (window._dynamicRoutes === R) {
        R.forEach(function(r){
          var img = document.getElementById('aiRouteImg_' + r.id);
          if (!img) return;
          var card = img.closest('.ai-rcard');
          if (!card) return;
          var chip = card.querySelector('.ai-rcard-hero-chip');
          if (chip) {
            var ic = r.transport === '徒歩' ? '🚶' : r.transport === '車' ? '🚗' : r.transport === 'バス' ? '🚌' : '🚃';
            chip.textContent = ic + ' ' + r.transport;
          }
        });
      }
    };
  }

  // ── ③ カードをタップしたら、そのルートの位置まで自動スクロール ──
  window.wabiOpenRoute = function(rid){
    if (typeof startAiRoute === 'function') startAiRoute();
    setTimeout(function(){
      var img = document.getElementById('aiRouteImg_' + rid);
      if (img) {
        var card = img.closest('.ai-rcard');
        if (card) card.scrollIntoView({behavior:'smooth', block:'start'});
      }
    }, 400);
  };

  // ── ④ トップの「おすすめ巡拝ルート」カードを10件に作り替え ──
  var scroll = document.querySelector('.ai-preview-scroll');
  if (scroll) {
    var h = '';
    R.forEach(function(r){
      h += '<div class="apc" onclick="wabiOpenRoute(\'' + r.id + '\')">' +
        '<img class="apc-img" src="' + r.cardImg + '" alt="' + r.name + '" loading="lazy">' +
        '<div class="apc-body">' +
          '<div class="apc-name">' + r.emoji + ' ' + r.name + '</div>' +
          '<div class="apc-desc">' + r.cardDesc + '</div>' +
          '<div class="apc-tags">' +
            '<span class="apc-tag">⏱ ' + r.time + '</span>' +
            '<span class="apc-tag red">⛩ ' + r.spots.length + '社</span>' +
            '<span class="apc-tag gold">✦ ' + r.cardTag + '</span>' +
          '</div>' +
        '</div>' +
      '</div>';
    });
    scroll.innerHTML = h;
  }

  // ── ⑤ 「3つのルートを比較して…」の文言を修正 ──
  var sub = document.querySelector('.ai-list-sub');
  if (sub) sub.textContent = '10のルートを比較して、あなたにぴったりの巡拝を選べます';
})();
