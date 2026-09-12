/* ══════════════════════════════════════════════════════════════
   わびなび：共通の定期処理ヘルパー
   スクロール中は処理を止めて、スマホでのスクロールがつっかえないようにする。
   ══════════════════════════════════════════════════════════════ */
(function(){
  if (window.WABI_TICK) return;
  var scrolling = false, timer = null;
  function mark(){
    scrolling = true;
    clearTimeout(timer);
    timer = setTimeout(function(){ scrolling = false; }, 260);
  }
  ['scroll', 'touchmove', 'wheel'].forEach(function(ev){
    window.addEventListener(ev, mark, { passive: true, capture: true });
  });
  window.WABI_SCROLLING = function(){ return scrolling; };
  window.WABI_TICK = function(fn, ms){
    return setInterval(function(){
      if (scrolling) return;              // 指で動かしている間は何もしない
      if (document.hidden) return;        // 画面を見ていない間も止める
      try { fn(); } catch(e){}
    }, ms);
  };
})();

// ══════════════════════════════════════════════════════════════
// わびなび AI旅行コンシェルジュ（ルート選択後の提案ページ）
// ・「このルートを選ぶ」→ このページが開く
// ・周辺のグルメ/カフェ/観光/体験/宿泊を提案し、ルートに追加できる
// ・データは現在ダミー（店名は実在）。API接続時は fetchNearby() を差し替え
// ══════════════════════════════════════════════════════════════
(function(){
  'use strict';

  // 二重読み込み防止（タグが複数あっても1回だけ動く）
  if (window.__wabiConciergeLoaded) return;
  window.__wabiConciergeLoaded = true;

  // ─────────────────────────────────────────
  // 1. 周辺スポットデータ（※評価・件数・徒歩分はダミー値。店名は実在）
  //    API接続時はこのオブジェクトを Google Places / 楽天トラベル の結果に置き換える
  // ─────────────────────────────────────────
  var G={ // グラデーション（カテゴリ別プレースホルダー画像）
    food:'linear-gradient(135deg,#c98a5b,#8a4a2f)', soba:'linear-gradient(135deg,#b9a888,#6f5b3e)',
    cafe:'linear-gradient(135deg,#a98a38,#6e5a20)', matcha:'linear-gradient(135deg,#7a9a6a,#4a6a3f)',
    sight:'linear-gradient(135deg,#8a9ab0,#4a5a70)', exp:'linear-gradient(135deg,#9a7ab0,#5a4470)',
    hotel:'linear-gradient(135deg,#5b7a9a,#2f4a6a)', onsen:'linear-gradient(135deg,#b07a7a,#704444)'
  };
  function I(emoji,grad){ return {emoji:emoji,grad:grad}; }

  var WC_DATA = {
    dyn:{ near:'善光寺',
      gourmet:[
        {name:'信州そば処 みよ田',genre:'そば・郷土料理',rating:4.4,reviews:123,walk:'徒歩4分',ai:96,img:I('🍜',G.soba)},
        {name:'門前そば 藤木庵',genre:'そば',rating:4.2,reviews:98,walk:'徒歩6分',ai:92,img:I('🍜',G.soba)},
        {name:'竹風堂 大門店',genre:'栗おこわ・甘味',rating:4.3,reviews:210,walk:'徒歩5分',ai:90,img:I('🌰',G.food)}],
      cafe:[
        {name:'八幡屋礒五郎 本店カフェ',genre:'七味スイーツ',rating:4.4,reviews:150,walk:'徒歩5分',ai:93,img:I('🍵',G.cafe)},
        {name:'THE FUJIYA GOHONJIN カフェ',genre:'クラシックカフェ',rating:4.5,reviews:120,walk:'徒歩3分',ai:91,img:I('☕',G.cafe)}],
      sight:[
        {name:'長野県立美術館',genre:'美術館',rating:4.4,reviews:380,walk:'徒歩7分',ai:88,img:I('🖼',G.sight)},
        {name:'東山魁夷館',genre:'美術館',rating:4.5,reviews:260,walk:'徒歩8分',ai:87,img:I('🎨',G.sight)}],
      exp:[
        {name:'善光寺 写経体験（約60分）',genre:'写経',rating:4.6,reviews:85,walk:'境内',ai:95,img:I('🖌',G.exp)},
        {name:'ながの門前まち歩きガイドツアー',genre:'ガイドツアー（約90分）',rating:4.5,reviews:60,walk:'徒歩1分',ai:89,img:I('🏮',G.exp)}],
      hotel:[
        {name:'ホテル国際21',genre:'シティホテル',rating:4.5,reviews:893,walk:'徒歩8分',price:'¥12,800〜',ai:94,img:I('🏨',G.hotel)},
        {name:'長野ホテル犀北館',genre:'クラシックホテル',rating:4.3,reviews:612,walk:'徒歩10分',price:'¥15,400〜',ai:90,img:I('🏨',G.hotel)}],
      advice:'善光寺周辺は門前町グルメが充実しています。ランチに信州そばを追加すると、巡礼と食文化の両方を楽しめる満足度の高い巡拝旅になります。'},

    r1:{ near:'鹿島神宮',
      gourmet:[
        {name:'鰻割烹 鈴章',genre:'うなぎ・老舗',rating:4.4,reviews:210,walk:'徒歩3分',ai:95,img:I('🍱',G.food)},
        {name:'亀甲堂',genre:'厄落しだんご（香取神宮門前）',rating:4.3,reviews:180,walk:'香取神宮すぐ',ai:92,img:I('🍡',G.food)}],
      cafe:[
        {name:'亀甲堂 甘味処',genre:'甘味・草だんご',rating:4.3,reviews:180,walk:'香取神宮すぐ',ai:90,img:I('🍵',G.cafe)}],
      sight:[
        {name:'息栖神社 一之鳥居（忍潮井）',genre:'名所・湧水の鳥居',rating:4.4,reviews:150,walk:'徒歩5分',ai:93,img:I('⛩',G.sight)},
        {name:'鹿島城山公園',genre:'公園・展望',rating:4.1,reviews:120,walk:'徒歩10分',ai:82,img:I('🌸',G.sight)}],
      exp:[
        {name:'鹿島神宮 奥参道・要石めぐり',genre:'境内散策',rating:4.6,reviews:300,walk:'境内',ai:94,img:I('🪨',G.exp)}],
      hotel:[
        {name:'鹿島セントラルホテル',genre:'ホテル',rating:4.1,reviews:520,walk:'車10分',price:'¥9,800〜',ai:88,img:I('🏨',G.hotel)},
        {name:'亀の井ホテル 潮来',genre:'温泉ホテル',rating:4.2,reviews:340,walk:'車15分',price:'¥13,200〜',ai:86,img:I('♨️',G.onsen)}],
      advice:'東国三社は各社の間が離れているため、香取神宮門前の亀甲堂で一服を挟むと巡拝のリズムが整います。締めのうなぎもこの地域の楽しみです。'},

    r2:{ near:'出雲大社',
      gourmet:[
        {name:'献上そば 羽根屋 本店',genre:'出雲そば',rating:4.4,reviews:650,walk:'車10分',ai:96,img:I('🍜',G.soba)},
        {name:'そば処 田中屋',genre:'出雲そば（神門通り）',rating:4.3,reviews:480,walk:'徒歩2分',ai:94,img:I('🍜',G.soba)}],
      cafe:[
        {name:'日本ぜんざい学会 壱号店',genre:'ぜんざい発祥の地',rating:4.2,reviews:390,walk:'徒歩3分',ai:93,img:I('🍵',G.cafe)},
        {name:'くつろぎ和かふぇ 甘右衛門',genre:'和カフェ',rating:4.3,reviews:150,walk:'徒歩3分',ai:88,img:I('🍡',G.cafe)}],
      sight:[
        {name:'稲佐の浜',genre:'神話の浜・夕日名所',rating:4.5,reviews:800,walk:'徒歩15分',ai:95,img:I('🌅',G.sight)},
        {name:'島根県立古代出雲歴史博物館',genre:'博物館',rating:4.5,reviews:620,walk:'徒歩5分',ai:90,img:I('🏛',G.sight)}],
      exp:[
        {name:'いずも勾玉の里 伝承館 勾玉づくり',genre:'勾玉づくり体験',rating:4.3,reviews:130,walk:'車15分',ai:87,img:I('🔮',G.exp)}],
      hotel:[
        {name:'竹野屋旅館',genre:'老舗旅館（大社正門前）',rating:4.3,reviews:280,walk:'徒歩1分',price:'¥16,500〜',ai:96,img:I('🏮',G.hotel)},
        {name:'お宿 月夜のうさぎ',genre:'温泉宿',rating:4.4,reviews:520,walk:'車20分',price:'¥14,800〜',ai:89,img:I('♨️',G.onsen)}],
      advice:'出雲そばは「割子」で食べ比べるのが醍醐味。両参りの間にぜんざい発祥の地・神門通りで甘味を挟むと、縁結びの旅がいっそう豊かになります。'},

    r3:{ near:'伊勢神宮 内宮',
      gourmet:[
        {name:'すし久',genre:'てこね寿司（おかげ横丁）',rating:4.3,reviews:900,walk:'徒歩3分',ai:96,img:I('🍣',G.food)},
        {name:'ふくすけ',genre:'伊勢うどん',rating:4.2,reviews:780,walk:'徒歩3分',ai:94,img:I('🍜',G.soba)}],
      cafe:[
        {name:'赤福 本店',genre:'赤福餅・甘味',rating:4.5,reviews:2100,walk:'徒歩3分',ai:98,img:I('🍡',G.cafe)},
        {name:'五十鈴川カフェ',genre:'川沿いカフェ',rating:4.3,reviews:460,walk:'徒歩4分',ai:90,img:I('☕',G.cafe)}],
      sight:[
        {name:'おかげ横丁',genre:'門前町さんぽ',rating:4.5,reviews:5200,walk:'徒歩3分',ai:97,img:I('🏮',G.sight)},
        {name:'伊勢志摩スカイライン 朝熊山頂展望台',genre:'展望台',rating:4.4,reviews:530,walk:'車15分',ai:88,img:I('🗻',G.sight)}],
      exp:[
        {name:'おかげ座 神話の館',genre:'日本神話シアター',rating:4.1,reviews:160,walk:'徒歩3分',ai:85,img:I('📜',G.exp)}],
      hotel:[
        {name:'神宮会館',genre:'内宮まで徒歩5分の宿',rating:4.2,reviews:480,walk:'徒歩5分',price:'¥11,000〜',ai:95,img:I('🏨',G.hotel)},
        {name:'伊勢シティホテル',genre:'シティホテル',rating:4.1,reviews:520,walk:'車12分',price:'¥8,900〜',ai:85,img:I('🏨',G.hotel)}],
      advice:'お伊勢参りの締めは、おかげ横丁での食べ歩きが王道です。朝一番の内宮参拝＋赤福本店の朝がゆという「お伊勢さんの朝」もおすすめです。'},

    r4:{ near:'熊野本宮大社',
      gourmet:[
        {name:'総本家めはりや 新宮本店',genre:'めはり寿司',rating:4.2,reviews:310,walk:'速玉大社から車5分',ai:94,img:I('🍙',G.food)}],
      cafe:[
        {name:'香梅堂',genre:'鈴焼・銘菓（新宮）',rating:4.6,reviews:280,walk:'速玉大社から徒歩5分',ai:92,img:I('🍡',G.cafe)}],
      sight:[
        {name:'那智の大滝（飛瀧神社）',genre:'日本一の名瀑',rating:4.7,reviews:2800,walk:'那智大社から徒歩15分',ai:99,img:I('🌊',G.sight)},
        {name:'大斎原の大鳥居',genre:'日本一の大鳥居',rating:4.6,reviews:900,walk:'本宮から徒歩10分',ai:96,img:I('⛩',G.sight)}],
      exp:[
        {name:'熊野古道 大門坂ウォーク',genre:'石畳の古道歩き（約40分）',rating:4.7,reviews:750,walk:'那智大社ふもと',ai:97,img:I('🌲',G.exp)}],
      hotel:[
        {name:'川湯温泉 冨士屋',genre:'温泉旅館',rating:4.4,reviews:410,walk:'本宮から車10分',price:'¥18,700〜',ai:93,img:I('♨️',G.onsen)},
        {name:'ホテル浦島',genre:'洞窟温泉（那智勝浦）',rating:4.0,reviews:2300,walk:'那智から車15分',price:'¥13,000〜',ai:88,img:I('♨️',G.onsen)}],
      advice:'熊野は一日で巡らず、川湯温泉で一泊するのがおすすめ。翌朝の大門坂を歩いて那智大社へ登ると、よみがえりの旅が完成します。'},

    r5:{ near:'諏訪大社 上社本宮',
      gourmet:[
        {name:'うなぎ小林',genre:'うなぎ',rating:4.4,reviews:520,walk:'車10分',ai:93,img:I('🍱',G.food)},
        {name:'そば処 山猫亭 本店',genre:'そば（下社秋宮前）',rating:4.2,reviews:430,walk:'秋宮すぐ',ai:91,img:I('🍜',G.soba)}],
      cafe:[
        {name:'くらすわ 本店',genre:'ベーカリーカフェ・諏訪湖ビュー',rating:4.3,reviews:680,walk:'車8分',ai:90,img:I('☕',G.cafe)},
        {name:'新鶴本店',genre:'塩羊羹（下諏訪）',rating:4.5,reviews:290,walk:'秋宮から徒歩1分',ai:92,img:I('🍡',G.cafe)}],
      sight:[
        {name:'立石公園',genre:'諏訪湖の絶景展望',rating:4.5,reviews:750,walk:'車12分',ai:91,img:I('🌄',G.sight)},
        {name:'万治の石仏',genre:'パワースポット（春宮近く）',rating:4.2,reviews:520,walk:'春宮から徒歩5分',ai:93,img:I('🪨',G.sight)}],
      exp:[
        {name:'真澄 蔵元ショップ（宮坂醸造）',genre:'酒蔵・試飲',rating:4.4,reviews:340,walk:'車7分',ai:89,img:I('🍶',G.exp)}],
      hotel:[
        {name:'上諏訪温泉 しんゆ',genre:'温泉旅館',rating:4.5,reviews:620,walk:'車10分',price:'¥19,800〜',ai:92,img:I('♨️',G.onsen)},
        {name:'萃 sui-諏訪湖',genre:'全室レイクビューの宿',rating:4.7,reviews:280,walk:'車10分',price:'¥35,000〜',ai:90,img:I('🏨',G.hotel)}],
      advice:'四社まいりの途中、春宮近くの「万治の石仏」は必見。締めは上諏訪温泉で諏訪湖の夕景を眺めれば、御柱の力をいただく旅が整います。'},

    r6:{ near:'戸隠神社 中社',
      gourmet:[
        {name:'うずら家',genre:'戸隠そばの名店（中社前）',rating:4.5,reviews:980,walk:'中社すぐ',ai:98,img:I('🍜',G.soba)},
        {name:'そばの実',genre:'戸隠そば',rating:4.3,reviews:520,walk:'車3分',ai:92,img:I('🍜',G.soba)}],
      cafe:[
        {name:'戸隠 岩戸屋',genre:'そばソフト・甘味',rating:4.1,reviews:210,walk:'中社すぐ',ai:86,img:I('🍦',G.cafe)}],
      sight:[
        {name:'鏡池',genre:'戸隠連峰を映す絶景池',rating:4.5,reviews:640,walk:'車8分',ai:95,img:I('🏞',G.sight)},
        {name:'戸隠森林植物園',genre:'散策路・野鳥',rating:4.4,reviews:330,walk:'奥社参道入口すぐ',ai:88,img:I('🌲',G.sight)}],
      exp:[
        {name:'戸隠民俗館・忍者からくり屋敷',genre:'忍者体験',rating:4.2,reviews:400,walk:'奥社入口すぐ',ai:87,img:I('🥷',G.exp)},
        {name:'とんくるりん そば打ち体験',genre:'そば打ち',rating:4.3,reviews:120,walk:'車5分',ai:85,img:I('🖐',G.exp)}],
      hotel:[
        {name:'宿坊 極意',genre:'戸隠の宿坊',rating:4.6,reviews:150,walk:'宝光社近く',price:'¥13,500〜',ai:95,img:I('🏮',G.hotel)},
        {name:'越志旅館',genre:'中社門前の旅館',rating:4.4,reviews:130,walk:'中社すぐ',price:'¥12,000〜',ai:90,img:I('🏨',G.hotel)}],
      advice:'五社巡りの昼は中社前の戸隠そばが鉄板です。時間に余裕があれば鏡池へ。宿坊に泊まれば、朝の凛とした神域を独り占めできます。'},

    r7:{ near:'秩父神社',
      gourmet:[
        {name:'豚みそ丼本舗 野さか',genre:'豚みそ丼',rating:4.4,reviews:1100,walk:'車5分',ai:96,img:I('🍱',G.food)},
        {name:'わへいそば',genre:'そば・くるみだれ',rating:4.2,reviews:380,walk:'徒歩7分',ai:90,img:I('🍜',G.soba)}],
      cafe:[
        {name:'阿左美冷蔵 金崎本店',genre:'天然氷かき氷（長瀞）',rating:4.4,reviews:980,walk:'宝登山から徒歩5分',ai:94,img:I('🍧',G.cafe)},
        {name:'泰山堂カフェ',genre:'古民家カフェ',rating:4.5,reviews:210,walk:'徒歩3分',ai:89,img:I('☕',G.cafe)}],
      sight:[
        {name:'長瀞ラインくだり',genre:'川下り',rating:4.4,reviews:1500,walk:'宝登山から徒歩10分',ai:92,img:I('🚣',G.sight)},
        {name:'羊山公園',genre:'芝桜の丘',rating:4.4,reviews:1300,walk:'車10分',ai:87,img:I('🌸',G.sight)}],
      exp:[
        {name:'秩父まつり会館',genre:'秩父夜祭の展示',rating:4.2,reviews:420,walk:'秩父神社すぐ',ai:88,img:I('🏮',G.exp)},
        {name:'ちちぶ銘仙館',genre:'織物・染め体験',rating:4.3,reviews:150,walk:'徒歩12分',ai:84,img:I('🧵',G.exp)}],
      hotel:[
        {name:'三峯神社 興雲閣',genre:'神社直営の宿坊',rating:4.3,reviews:310,walk:'三峯神社境内',price:'¥12,100〜',ai:97,img:I('🏮',G.hotel)},
        {name:'和どう',genre:'和銅鉱泉の温泉旅館',rating:4.4,reviews:480,walk:'車12分',price:'¥17,600〜',ai:89,img:I('♨️',G.onsen)}],
      advice:'三峯神社の興雲閣に泊まると、早朝の澄んだ気の中でご祈祷を受けられます。長瀞の天然氷かき氷は行列必至、午前中がおすすめです。'},

    r8:{ near:'上賀茂神社',
      gourmet:[
        {name:'今井食堂',genre:'さば煮定食（上賀茂）',rating:4.2,reviews:520,walk:'徒歩2分',ai:93,img:I('🍱',G.food)},
        {name:'岡北（おかきた）',genre:'京うどん（平安神宮近く）',rating:4.3,reviews:780,walk:'平安神宮から徒歩5分',ai:91,img:I('🍜',G.soba)}],
      cafe:[
        {name:'神馬堂',genre:'やきもち（上賀茂名物）',rating:4.5,reviews:430,walk:'徒歩1分',ai:96,img:I('🍡',G.cafe)},
        {name:'長楽館',genre:'洋館カフェ（八坂神社近く）',rating:4.4,reviews:890,walk:'八坂から徒歩3分',ai:90,img:I('☕',G.cafe)}],
      sight:[
        {name:'祇園白川',genre:'石畳の街並み',rating:4.5,reviews:1600,walk:'八坂から徒歩5分',ai:92,img:I('🏮',G.sight)},
        {name:'蹴上インクライン',genre:'桜と線路跡の名所',rating:4.4,reviews:1100,walk:'平安神宮から徒歩10分',ai:87,img:I('🌸',G.sight)}],
      exp:[
        {name:'松尾大社 お酒の資料館',genre:'酒神の資料館',rating:4.0,reviews:130,walk:'松尾大社境内',ai:86,img:I('🍶',G.exp)}],
      hotel:[
        {name:'ザ・ホテル青龍 京都清水',genre:'元小学校のホテル',rating:4.6,reviews:520,walk:'八坂から徒歩10分',price:'¥38,000〜',ai:91,img:I('🏨',G.hotel)},
        {name:'ホテル平安の森 京都',genre:'岡崎エリアのホテル',rating:4.0,reviews:680,walk:'平安神宮から徒歩8分',price:'¥9,500〜',ai:87,img:I('🏨',G.hotel)}],
      advice:'五社めぐりは移動が多いので、上賀茂の神馬堂で「やきもち」を、締めの祇園で長楽館の一服を。専用色紙の御朱印集めもお忘れなく。'},

    r9:{ near:'北口本宮冨士浅間神社',
      gourmet:[
        {name:'桜井うどん',genre:'吉田のうどん',rating:4.2,reviews:480,walk:'車5分',ai:94,img:I('🍜',G.soba)},
        {name:'みうらうどん',genre:'吉田のうどん',rating:4.3,reviews:620,walk:'車7分',ai:92,img:I('🍜',G.soba)}],
      cafe:[
        {name:'金多留満 本店',genre:'和菓子・はまなし',rating:4.4,reviews:180,walk:'車5分',ai:88,img:I('🍡',G.cafe)}],
      sight:[
        {name:'新倉山浅間公園（忠霊塔）',genre:'富士山×五重塔の絶景',rating:4.6,reviews:2100,walk:'車10分',ai:97,img:I('🗻',G.sight)},
        {name:'富士山レーダードーム館',genre:'体験型ミュージアム',rating:4.1,reviews:230,walk:'車8分',ai:82,img:I('📡',G.sight)}],
      exp:[
        {name:'ふじさんミュージアム',genre:'富士山信仰の博物館',rating:4.2,reviews:190,walk:'車6分',ai:87,img:I('🗻',G.exp)}],
      hotel:[
        {name:'ハイランドリゾート ホテル＆スパ',genre:'富士急隣接リゾート',rating:4.3,reviews:1500,walk:'車8分',price:'¥17,000〜',ai:90,img:I('🏨',G.hotel)},
        {name:'ホテル鐘山苑',genre:'庭園温泉旅館',rating:4.5,reviews:980,walk:'車10分',price:'¥24,200〜',ai:92,img:I('♨️',G.onsen)}],
      advice:'両参りは2時間半で回れるので、午後は新倉山浅間公園へ。五重塔越しの富士は、金運の旅の締めくくりにふさわしい絶景です。'},

    r10:{ near:'筑波山神社',
      gourmet:[
        {name:'コマ展望台 レストラン',genre:'つくばうどん（山頂名物）',rating:4.0,reviews:350,walk:'御幸ヶ原すぐ',ai:90,img:I('🍜',G.soba)}],
      cafe:[
        {name:'沼田屋',genre:'かりんとう饅頭',rating:4.4,reviews:410,walk:'車5分',ai:93,img:I('🍡',G.cafe)}],
      sight:[
        {name:'筑波山ロープウェイ',genre:'つつじヶ丘〜女体山',rating:4.3,reviews:820,walk:'つつじヶ丘駅',ai:91,img:I('🚡',G.sight)},
        {name:'筑波山梅林',genre:'梅の名所（2〜3月）',rating:4.3,reviews:560,walk:'車5分',ai:85,img:I('🌸',G.sight)}],
      exp:[
        {name:'ガマの油売り口上（実演）',genre:'伝統芸能',rating:4.2,reviews:90,walk:'山頂周辺',ai:86,img:I('🐸',G.exp)}],
      hotel:[
        {name:'筑波山江戸屋',genre:'神社隣の老舗旅館',rating:4.2,reviews:380,walk:'徒歩2分',price:'¥15,400〜',ai:95,img:I('🏮',G.hotel)},
        {name:'筑波山京成ホテル',genre:'関東平野を望む宿',rating:4.1,reviews:420,walk:'車5分',price:'¥14,300〜',ai:88,img:I('🏨',G.hotel)}],
      advice:'登拝の昼は山頂の「つくばうどん」を。下山後は神社隣の江戸屋で一泊すれば、朝の静かな拝殿にお参りできます。縁結びの旅は朝が吉です。'}
  };

  // 固定10ルート＝手作りデータ／検索ルート＝Google Placesで周辺を実検索
  var dynCache = {};
  function dynKey(route){ return route.spots.map(function(s){return s.name;}).join('|'); }
  function fetchNearby(route){
    if (window._dynamicRoutes && dynCache[dynKey(route)]) return dynCache[dynKey(route)];
    return WC_DATA[route.id] || WC_DATA.dyn;
  }
  function haversine(a,b,c,d2){var R=6371e3,p=Math.PI/180;var x=(c-a)*p,y=(d2-b)*p;var s=Math.sin(x/2)*Math.sin(x/2)+Math.cos(a*p)*Math.cos(c*p)*Math.sin(y/2)*Math.sin(y/2);return 2*R*Math.asin(Math.sqrt(s));}
  /* ────────────────────────────────────────────────────────────
     周辺スポットの検索（2026-09-05 改訂）

     以前は「1番目の神社の周り」だけを検索していた。そのため
     どのグルメ・カフェ・観光地も1番目の神社の近くのものばかりで、
     「一番近い神社の次に入れる」という並べ替えが成り立たなかった。

     いまは ルート上のすべての神社の周りを検索し、
     スポット1件ごとに「どの神社の近くか（nearName / nearIdx）」を
     持たせている。これを使って ensureItems が並び順を決める。

     ・グルメ／カフェ／観光 … 神社ごとに検索（最大6か所まで）
     ・宿泊 … 最後の立ち寄り先の周りだけ（泊まるのは最後のため）
     ・同じ店が複数の神社で見つかったときは、近いほうの神社に付ける
     ──────────────────────────────────────────────────────────── */
  function fetchDynamicNearby(route, cb){
    try{
      var nm = function(x){ return String(x||'').replace(/[（(].*$/,''); };
      var spots = (route.spots||[]).filter(function(s){ return s && s.lat; });
      if (typeof API_KEY==='undefined' || !API_KEY || typeof google==='undefined'
          || !google.maps || !google.maps.places || !spots.length){ cb(null); return; }

      var svc = new google.maps.places.PlacesService(document.createElement('div'));
      var base = spots.slice(0, 6);                       // 呼び出し回数を抑えるため最大6か所
      var lastIdx = spots.length - 1;
      var shrineNames = {};
      spots.forEach(function(s){ shrineNames[s.name] = 1; });

      var out = { near: nm(spots[0].name), gourmet:[], cafe:[], sight:[], exp:[], hotel:[],
        advice: nm(spots[0].name) + '周辺の人気スポットをAIが選びました。ランチやカフェを追加して、あなただけの巡拝プランに仕上げましょう。' };

      var jobs = [];
      base.forEach(function(sp, si){
        jobs.push({key:'gourmet', type:'restaurant',         radius:800,  emoji:'🍱', grad:G.food,  genre:'お食事処', sp:sp, si:si});
        jobs.push({key:'cafe',    type:'cafe',               radius:800,  emoji:'☕',  grad:G.cafe,  genre:'カフェ',   sp:sp, si:si});
        jobs.push({key:'sight',   type:'tourist_attraction', radius:1500, emoji:'🏞', grad:G.sight, genre:'観光名所', sp:sp, si:si});
      });
      // 宿泊は最後の立ち寄り先の周り（少し広めに探す）
      jobs.push({key:'hotel', type:'lodging', radius:3000, emoji:'🏨', grad:G.hotel, genre:'ホテル',
                 sp:spots[lastIdx], si:lastIdx});

      var pool = { gourmet:{}, cafe:{}, sight:{}, exp:{}, hotel:{} };   // 店名 → 一番近い神社の分

      function keep(key, item){
        var cur = pool[key][item.name];
        if (!cur || item._dist < cur._dist) pool[key][item.name] = item;
      }

      var done = 0;
      function finish(){
        ['gourmet','cafe','sight','exp','hotel'].forEach(function(k){
          var arr = Object.keys(pool[k]).map(function(n){ return pool[k][n]; });
          // 神社の並び順 → 評価の高い順
          arr.sort(function(a,b){ return (a.nearIdx-b.nearIdx) || ((b.rating||0)-(a.rating||0)); });
          // 神社1か所につき3件まで、合計12件まで
          var cnt = {}, res = [];
          arr.forEach(function(it){
            cnt[it.nearIdx] = (cnt[it.nearIdx]||0) + 1;
            if (cnt[it.nearIdx] <= 3 && res.length < 12) res.push(it);
          });
          out[k] = res;
        });
        cb(out);
      }

      jobs.forEach(function(job){
        var c = new google.maps.LatLng(job.sp.lat, job.sp.lng);
        svc.nearbySearch({location:c, radius:job.radius, type:job.type}, function(res, status){
          if (status===google.maps.places.PlacesServiceStatus.OK && res){
            var okType = function(p){ return job.key==='hotel' || !(p.types && p.types.indexOf('lodging')>-1); };
            var notShrine = function(p){ return !shrineNames[p.name]; };
            var list = res.filter(function(p){ return okType(p) && notShrine(p) && p.rating>=4.0 && (p.user_ratings_total||0)>=50; });
            // 3件に満たなければ条件をゆるめて補充（人気順）
            var relaxed = res.filter(function(p){ return okType(p) && notShrine(p) && (p.user_ratings_total||0)>=5; })
              .sort(function(a,b){ return (b.user_ratings_total||0)-(a.user_ratings_total||0); });
            relaxed.forEach(function(p){ if (list.length<3 && list.indexOf(p)<0) list.push(p); });
            list.sort(function(a,b){ return (b.rating||0)-(a.rating||0); });

            list.slice(0,4).forEach(function(p){
              var la = (p.geometry&&p.geometry.location) ? p.geometry.location.lat() : job.sp.lat;
              var ln = (p.geometry&&p.geometry.location) ? p.geometry.location.lng() : job.sp.lng;
              var dist = haversine(job.sp.lat, job.sp.lng, la, ln);
              var mins = Math.max(1, Math.round(dist/80));
              keep(job.key, {
                name:p.name, genre:job.genre, rating:p.rating||4.0, reviews:p.user_ratings_total||0,
                walk:(mins>20?'車'+Math.round(mins/5)+'分':'徒歩'+mins+'分'),
                ai:Math.min(99, Math.round((p.rating||4)*19 + Math.min((p.user_ratings_total||0),1000)/125)),
                img:I(job.emoji, job.grad),
                photoUrl:(p.photos&&p.photos.length)?p.photos[0].getUrl({maxWidth:500}):null,
                nearName:nm(job.sp.name), nearIdx:job.si, lat:la, lng:ln, _dist:dist });
            });
          }
          done++;
          if (done===jobs.length) finish();
        });
      });
    }catch(e){ cb(null); }
  }

  // ─────────────────────────────────────────
  // 2. スタイル
  // ─────────────────────────────────────────
  var css = document.createElement('style');
  css.textContent = [
    '#wcPage,#wcPrev{position:fixed;inset:0;z-index:250;background:#F8F5EF;display:none;overflow-y:auto;-webkit-overflow-scrolling:touch;}',
    '#wcPrev{z-index:260;}',
    '.wc-inner{max-width:500px;margin:0 auto;padding-bottom:96px;}',
    '.wc-hd{position:sticky;top:0;z-index:5;background:#fff;display:flex;align-items:center;gap:8px;padding:14px 16px;border-bottom:1px solid #eee8dc;}',
    '.wc-back{font-size:22px;color:#a83320;cursor:pointer;line-height:1;padding:0 6px;}',
    '.wc-tit{font-family:"Shippori Mincho",serif;font-weight:800;font-size:15px;color:#2a2018;}',
    '.wc-sec{margin:10px 16px 0;}',
    '.wc-sec-h{display:flex;align-items:baseline;justify-content:space-between;}',
    '.wc-sec-tit{font-family:"Shippori Mincho",serif;font-size:14.5px;font-weight:800;color:#2a2018;}',
    '.wc-sec-sub{font-size:11px;color:#a89a80;margin-top:2px;}',
    '.wc-all{font-size:11px;color:#a83320;cursor:pointer;white-space:nowrap;}',
    '.wc-row{display:flex;gap:10px;overflow-x:auto;padding:6px 0 2px;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;}',
    '.wc-row::-webkit-scrollbar{display:none;}',
    '.wc-card{flex:0 0 calc(50% - 5px);background:#fff;border-radius:20px;border:1px solid #e8dfcd;box-shadow:0 3px 12px -6px rgba(90,70,40,.2);overflow:hidden;scroll-snap-align:start;}',
    '.wc-img{position:relative;width:100%;aspect-ratio:4/3;display:flex;align-items:center;justify-content:center;font-size:34px;overflow:hidden;cursor:pointer;}',
    '.wc-ai{position:absolute;top:5px;left:5px;background:rgba(255,255,255,.92);color:#6e5a20;font-size:8px;font-weight:700;padding:2px 6px;border-radius:10px;}',
    '.wc-pr{position:absolute;top:8px;right:8px;background:rgba(42,32,24,.65);color:#fff;font-size:9px;padding:2px 7px;border-radius:10px;}',
    '.wc-body{padding:9px 10px 10px;}',
    '.wc-name{font-family:"Shippori Mincho",serif;font-size:11px;font-weight:800;color:#2a2018;line-height:1.35;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}',
    '.wc-meta{font-size:9.5px;color:#a89a80;margin-top:3px;}',
    '.wc-meta b{color:#2a2018;font-weight:700;}',
    '.wc-sub2{font-size:9.5px;color:#a89a80;margin-top:2px;}',
    '.wc-genre{display:inline-block;font-size:9px;color:#7a4a10;background:#f5efd6;border-radius:8px;padding:1px 7px;margin-top:5px;}',
    '.wc-price{font-size:11px;font-weight:800;color:#a83320;margin-top:4px;}',
    '.wc-add{display:block;width:100%;margin-top:6px;padding:5px 0;border-radius:10px;border:1px solid #c9a84c;background:#fff;color:#7a4a10;font-size:10px;font-weight:700;cursor:pointer;font-family:"Shippori Mincho",serif;}',
    '.wc-add.on{background:#a83320;border-color:#a83320;color:#fff;}',
    '.wc-advice{background:#fff;border-radius:24px;padding:18px;margin:28px 16px 0;box-shadow:0 4px 16px -8px rgba(90,70,40,.25);border-left:4px solid #7a5aa8;}',
    '.wc-advice-t{font-family:"Shippori Mincho",serif;font-size:13px;font-weight:800;color:#5a4470;}',
    '.wc-advice-b{font-size:12.5px;color:#3f382e;line-height:1.9;margin-top:8px;}',
    '.wc-list{background:#fff;border-radius:24px;padding:16px;margin:20px 16px 0;box-shadow:0 4px 16px -8px rgba(90,70,40,.25);}',
    '.wc-li{display:flex;align-items:center;gap:10px;padding:9px 4px;border-bottom:1px dashed #eee2c8;font-size:12.5px;color:#2a2018;}',
    '.wc-li:last-child{border-bottom:none;}',
    '.wc-li-ic{width:34px;height:34px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:17px;flex:0 0 34px;color:#fff;}',
    '.wc-li-nm{flex:1;line-height:1.4;}',
    '.wc-li-tag{font-size:10px;color:#a89a80;}',
    '.wc-li-btn{border:none;background:#f3ede1;color:#8a7a5c;width:26px;height:26px;border-radius:8px;cursor:pointer;font-size:12px;}',
    // ★下部メニュー（#wabiNav）に隠れて押せなくなっていたのを修正★
    //   ・bottom を 0 から「メニューの高さ」に変え、メニューの上に置く
    //   ・z-index をメニュー（2000）より上にして、確実に指が届くようにする
    //   --wabi-nav-h は実際のメニューの高さを測って入れている（下の方の処理）
    '.wc-cta-wrap{position:fixed;bottom:var(--wabi-nav-h,60px);left:0;right:0;z-index:2100;padding:10px 16px 12px;background:linear-gradient(to top,#F8F5EF 65%,rgba(248,245,239,0));pointer-events:none;}',
    '.wc-cta-wrap>*{pointer-events:auto;}',
    '.wc-cta{display:block;width:100%;max-width:468px;margin:0 auto;height:56px;border:none;border-radius:28px;background:linear-gradient(135deg,#7a5aa8,#5a4470);color:#fff;font-size:15px;font-weight:800;font-family:"Shippori Mincho",serif;cursor:pointer;box-shadow:0 8px 20px -6px rgba(90,68,112,.5);}',
    '.wc-hero{position:relative;width:100%;aspect-ratio:4/3;background:#ddd;overflow:hidden;}',
    '.wc-hero img{width:100%;height:100%;object-fit:cover;display:block;}',
    '.wc-hero-grad{position:absolute;inset:0;background:linear-gradient(to top,rgba(20,14,8,.72),rgba(20,14,8,0) 55%);}',
    '.wc-hero-t{position:absolute;left:18px;right:18px;bottom:44px;color:#fff;font-family:"Shippori Mincho",serif;font-size:19px;font-weight:800;line-height:1.5;text-shadow:0 2px 8px rgba(0,0,0,.4);}',
    '.wc-hero-chips{position:absolute;left:18px;bottom:14px;display:flex;gap:8px;}',
    '.wc-chip{background:rgba(42,32,24,.6);color:#fff;font-size:11px;padding:4px 11px;border-radius:14px;}',
    '.wc-tl{margin:20px 16px 0;background:#fff;border-radius:24px;padding:18px 16px;box-shadow:0 4px 16px -8px rgba(90,70,40,.25);}',
    '.wc-tl-i{display:flex;gap:12px;align-items:center;padding:9px 0;}',
    '.wc-tl-n{width:26px;height:26px;border-radius:50%;background:#a83320;color:#fff;font-size:12px;font-weight:700;display:flex;align-items:center;justify-content:center;flex:0 0 26px;}',
    '.wc-tl-th{width:54px;height:54px;border-radius:12px;overflow:hidden;flex:0 0 54px;display:flex;align-items:center;justify-content:center;font-size:24px;color:#fff;}',
    '.wc-tl-th img{width:100%;height:100%;object-fit:cover;}',
    '.wc-tl-nm{font-size:13px;font-weight:700;color:#2a2018;font-family:"Shippori Mincho",serif;}',
    '.wc-tl-mt{font-size:10.5px;color:#a89a80;margin-top:2px;}',
    '.wc-tl-mv{font-size:10.5px;color:#c9a84c;padding:0 0 0 13px;border-left:2px dotted #e0d4b4;margin-left:12px;height:16px;line-height:16px;}',
    '.wc-btn2{flex:1;height:48px;border-radius:24px;font-size:13.5px;font-weight:800;font-family:"Shippori Mincho",serif;cursor:pointer;}',
    '.wc-save{background:#fff;border:1.5px solid #c9a84c;color:#7a4a10;}',
    '.wc-navi{background:linear-gradient(135deg,#a83320,#7a2114);border:none;color:#fff;box-shadow:0 8px 20px -6px rgba(168,51,32,.5);}'
  ].join('\n');
  document.head.appendChild(css);
  var css2 = document.createElement('style');
  css2.textContent = [
    '#wcSpot{position:fixed;inset:0;z-index:265;background:#F8F5EF;display:none;overflow-y:auto;-webkit-overflow-scrolling:touch;}',
    '.wc-sd-inner{max-width:500px;margin:0 auto;padding-bottom:110px;}',
    '.wc-sd-hero{position:relative;width:100%;height:340px;background:linear-gradient(135deg,#8a9ab0,#4a5a70);overflow:hidden;}',
    '.wc-sd-hero>img{width:100%;height:100%;object-fit:cover;display:block;}',
    '.wc-sd-grad{position:absolute;inset:0;background:linear-gradient(to top,rgba(15,10,5,.8),rgba(15,10,5,.05) 62%);}',
    '.wc-sd-back{position:absolute;top:14px;left:14px;width:36px;height:36px;border-radius:50%;background:rgba(255,255,255,.94);display:flex;align-items:center;justify-content:center;font-size:19px;color:#a83320;cursor:pointer;z-index:3;box-shadow:0 2px 8px rgba(0,0,0,.2);}',
    '.wc-sd-heart{position:absolute;top:14px;right:14px;width:36px;height:36px;border-radius:50%;background:rgba(255,255,255,.94);display:flex;align-items:center;justify-content:center;font-size:16px;cursor:pointer;z-index:3;}',
    '.wc-sd-badge{position:absolute;top:60px;left:14px;background:rgba(255,255,255,.92);color:#6e5a20;font-size:10px;font-weight:700;padding:4px 11px;border-radius:14px;z-index:2;}',
    '.wc-sd-tit{position:absolute;left:18px;right:18px;bottom:96px;color:#fff;font-family:"Shippori Mincho",serif;font-size:21px;font-weight:800;text-shadow:0 2px 10px rgba(0,0,0,.45);z-index:2;}',
    '.wc-sd-meta{position:absolute;left:18px;right:18px;bottom:72px;color:#f5efe2;font-size:12px;z-index:2;}',
    '.wc-sd-btns{position:absolute;left:18px;bottom:18px;display:flex;gap:10px;z-index:2;}',
    '.wc-sd-add{background:linear-gradient(135deg,#7a5aa8,#5a4470);color:#fff;border:none;border-radius:20px;padding:10px 18px;font-size:12.5px;font-weight:700;font-family:"Shippori Mincho",serif;cursor:pointer;}',
    '.wc-sd-map{background:rgba(255,255,255,.94);color:#2a2018;border:none;border-radius:20px;padding:10px 18px;font-size:12.5px;font-weight:700;font-family:"Shippori Mincho",serif;cursor:pointer;}',
    '.wc-sd-card{background:#fff;border-radius:20px;padding:16px;margin:14px 16px 0;box-shadow:0 4px 16px -8px rgba(90,70,40,.22);}',
    '.wc-sd-h{font-family:"Shippori Mincho",serif;font-size:14px;font-weight:800;color:#2a2018;margin-bottom:8px;}',
    '.wc-sd-reason{border-left:4px solid #7a5aa8;}',
    '.wc-sd-reason .wc-sd-h{color:#5a4470;}',
    '.wc-sd-txt{font-size:12.5px;color:#3f382e;line-height:1.9;}',
    '.wc-sd-chips{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px;}',
    '.wc-sd-chip{font-size:10px;color:#7a4a10;background:#f5efd6;border-radius:12px;padding:3px 10px;}',
    '.wc-sd-g{display:flex;gap:8px;overflow-x:auto;padding:4px 0 2px;}',
    '.wc-sd-g img{width:112px;height:84px;object-fit:cover;border-radius:12px;flex:0 0 auto;cursor:pointer;}',
    '.wc-sd-g .ph{width:112px;height:84px;border-radius:12px;flex:0 0 auto;display:flex;align-items:center;justify-content:center;font-size:26px;color:#fff;}',
    '.wc-menu{display:flex;gap:10px;overflow-x:auto;padding:4px 0 2px;}',
    '.wc-menu-c{flex:0 0 150px;border:1px solid #eee2c8;border-radius:14px;overflow:hidden;background:#fff;}',
    '.wc-menu-img{height:70px;display:flex;align-items:center;justify-content:center;font-size:26px;color:#fff;}',
    '.wc-menu-b{padding:8px 10px 10px;}',
    '.wc-menu-n{font-size:11.5px;font-weight:700;color:#2a2018;font-family:"Shippori Mincho",serif;}',
    '.wc-menu-p{font-size:12px;font-weight:800;color:#a83320;margin-top:3px;}',
    '.wc-menu-d{font-size:9.5px;color:#a89a80;margin-top:3px;line-height:1.5;}',
    '.wc-info-row{display:flex;gap:10px;padding:7px 0;border-bottom:1px dashed #eee2c8;font-size:12px;color:#3f382e;}',
    '.wc-info-row:last-of-type{border-bottom:none;}',
    '.wc-info-ic{flex:0 0 20px;text-align:center;}',
    '.wc-info-k{flex:0 0 70px;color:#a89a80;font-size:11px;padding-top:1px;}',
    '.wc-rev{border:1px solid #eee2c8;border-radius:14px;padding:10px 12px;margin-top:8px;}',
    '.wc-rev-h{display:flex;align-items:center;gap:8px;font-size:11.5px;font-weight:700;color:#2a2018;}',
    '.wc-rev-av{width:26px;height:26px;border-radius:50%;background:#c9a84c;color:#fff;display:flex;align-items:center;justify-content:center;font-size:12px;}',
    '.wc-rev-st{color:#c9a84c;font-size:10px;}',
    '.wc-rev-t{font-size:11.5px;color:#3f382e;line-height:1.7;margin-top:6px;}',
    '.wc-mini{flex:0 0 128px;background:#fff;border:1px solid #e8dfcd;border-radius:16px;overflow:hidden;}',
    '.wc-mini-img{height:76px;display:flex;align-items:center;justify-content:center;font-size:24px;color:#fff;overflow:hidden;position:relative;}',
    '.wc-mini-img img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;}',
    '.wc-mini-b{padding:7px 9px 9px;}',
    '.wc-mini-n{font-size:10.5px;font-weight:700;color:#2a2018;font-family:"Shippori Mincho",serif;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}',
    '.wc-mini-m{font-size:9px;color:#a89a80;margin-top:2px;}',
    '.wc-mini-add{display:block;width:100%;margin-top:6px;padding:4px 0;border-radius:9px;border:1px solid #c9a84c;background:#fff;color:#7a4a10;font-size:9.5px;font-weight:700;cursor:pointer;}',
    '.wc-mini-add.on{background:#a83320;border-color:#a83320;color:#fff;}',
    '.wc-hotel2{display:flex;gap:10px;margin-top:8px;}',
    '.wc-hbtn{flex:1;border:none;border-radius:12px;padding:8px 0;font-size:10.5px;font-weight:700;cursor:pointer;}',
    '.wc-hbtn.rk{background:#bf0000;color:#fff;}',
    '.wc-hbtn.jl{background:#f60;color:#fff;}',
    '#wcLb{position:fixed;inset:0;z-index:270;background:rgba(10,8,5,.92);display:none;align-items:center;justify-content:center;cursor:pointer;}',
    '#wcLb img{max-width:94%;max-height:88%;border-radius:10px;}'
  ].join('\n');
  document.head.appendChild(css2);
  var css3 = document.createElement('style');
  css3.textContent = [
    '.wcb-card{background:#fff;border-radius:24px;box-shadow:0 8px 24px rgba(0,0,0,.06);padding:18px 14px 14px;margin:16px 16px 0;}',
    '.wcb-tit{text-align:center;font-family:"Shippori Mincho",serif;font-size:16px;font-weight:800;color:#2a2018;}',
    '.wcb-sub{text-align:center;font-size:10.5px;color:#a89a80;margin:4px 0 8px;}',
    '.wcb-total{display:table;margin:0 auto 10px;font-size:11px;font-weight:700;color:#7a4a10;background:#f5efd6;border-radius:14px;padding:4px 14px;}',
    '.wcb-row{display:flex;align-items:center;gap:10px;padding:8px 2px;background:#fff;border-radius:14px;position:relative;}',
    '.wcb-row.drag{box-shadow:0 10px 24px rgba(0,0,0,.18);transform:scale(1.02);z-index:5;}',
    '.wcb-numcol{display:flex;flex-direction:column;align-items:center;flex:0 0 30px;align-self:stretch;}',
    '.wcb-num{width:29px;height:29px;border-radius:50%;background:#a83320;color:#fff;font-weight:800;font-size:13px;display:flex;align-items:center;justify-content:center;flex:0 0 29px;}',
    '.wcb-line{flex:1;width:0;border-left:2px dashed #E5E0D8;margin-top:3px;}',
    '.wcb-img{width:84px;height:64px;border-radius:12px;flex:0 0 84px;display:flex;align-items:center;justify-content:center;font-size:26px;color:#fff;overflow:hidden;position:relative;cursor:pointer;}',
    '.wcb-img img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;}',
    '.wcb-info{flex:1;min-width:0;}',
    '.wcb-nm{font-size:13px;font-weight:800;color:#1F1F1F;font-family:"Shippori Mincho",serif;display:flex;align-items:center;gap:6px;cursor:pointer;}',
    '.wcb-nm span.t{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}',
    '.wcb-bdg{font-size:8.5px;color:#5a4470;background:#ece5f5;border-radius:10px;padding:2px 8px;font-weight:700;white-space:nowrap;flex:0 0 auto;}',
    '.wcb-sb{font-size:10px;color:#6B6B6B;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}',
    '.wcb-tags{display:flex;gap:5px;margin-top:4px;flex-wrap:wrap;}',
    '.wcb-tag{font-size:8.5px;color:#A8844D;background:#F7F2E6;border-radius:10px;padding:2px 8px;}',
    '.wcb-tag.ai{color:#A06A00;background:#FFF3D8;}',
    '.wcb-stay{flex:0 0 54px;background:#FFF7E6;border:1px solid #EADFC6;border-radius:12px;text-align:center;padding:5px 2px;}',
    '.wcb-stay span{display:block;font-size:8.5px;color:#A8844D;}',
    '.wcb-stay b{display:block;font-size:12px;color:#2a2018;line-height:1.3;}',
    '.wcb-handle{flex:0 0 24px;color:#B8B2A6;font-size:19px;text-align:center;cursor:grab;touch-action:none;user-select:none;padding:8px 0;}',
    '.wcb-addbtn{display:block;width:100%;margin-top:10px;padding:11px 0;border:2px dashed #E6E1D6;border-radius:14px;background:#fff;color:#7a5aa8;font-size:12.5px;font-weight:700;cursor:pointer;font-family:"Shippori Mincho",serif;}'
  ].join('\n');
  document.head.appendChild(css3);

  // ─────────────────────────────────────────
  // 3. 状態（選択中ルート・追加スポット）
  // ─────────────────────────────────────────
  var state = { route:null, added:[] };
  function toast(m){ if (typeof showToast==='function') showToast(m); }
  function esc(s){ return String(s).replace(/"/g,'&quot;'); }

  // プレビュー（カスタマイズ済みルート）用のオーバーレイ
  var prev = document.createElement('div'); prev.id='wcPrev';
  prev.innerHTML = '<div class="wc-hd"><span class="wc-back" id="wcPrevBack">‹</span><span class="wc-tit">カスタマイズ済みルート</span></div><div class="wc-inner" id="wcPrevBody"></div>';
  document.body.appendChild(prev);
  document.getElementById('wcPrevBack').onclick = function(){ prev.style.display='none'; };

  var currentNear = '';
  // Google Placesでお店・スポットの実写真を取得（APIキーがある場合のみ／なければ絵文字のまま）
  var wcPhotoCache = {};
  function resolveCardPhotos(){
    try{
      if (typeof API_KEY==='undefined' || !API_KEY) return;
      if (typeof google==='undefined' || !google.maps || !google.maps.places) return;
      var svc = new google.maps.places.PlacesService(document.createElement('div'));
      document.querySelectorAll('#wcInline .wc-img[data-q]').forEach(function(el){
        if (el.querySelector('img')) return;
        var q = el.getAttribute('data-q');
        function setImg(url){
          if (!url || el.querySelector('img')) return;
          var im = document.createElement('img');
          im.src = url; im.loading = 'lazy';
          im.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;';
          el.insertBefore(im, el.firstChild);
          var sp = el.querySelector('span:not(.wc-ai):not(.wc-pr)');
          if (sp) sp.style.display = 'none';
        }
        if (wcPhotoCache[q] !== undefined) { setImg(wcPhotoCache[q]); return; }
        wcPhotoCache[q] = null;
        svc.findPlaceFromQuery({query:q, fields:['photos']}, function(res, status){
          if (status === google.maps.places.PlacesServiceStatus.OK && res && res[0] && res[0].photos && res[0].photos.length){
            var u = res[0].photos[0].getUrl({maxWidth:500});
            wcPhotoCache[q] = u; setImg(u);
          }
        });
      });
    }catch(e){}
  }

  var CATS = [
    {key:'gourmet', tit:'グルメ',       sub:'おすすめランチ'},
    {key:'cafe',    tit:'カフェ・スイーツ', sub:'ひと休みに'},
    {key:'sight',   tit:'観光スポット',   sub:'あわせて立ち寄りたい'},
    {key:'exp',     tit:'体験・アクティビティ', sub:'旅を深める'},
    {key:'hotel',   tit:'宿泊施設',      sub:'巡拝の拠点に'}
  ];
  var CAT_LABEL = {gourmet:'ランチ',cafe:'カフェ',sight:'観光',exp:'体験',hotel:'宿泊'};

  // そのスポットが「どの神社の近く」かを返す（無ければ従来どおり1番目の神社）
  function nearOf(item){ return (item && item.nearName) || currentNear || ''; }

  function cardHtml(item, cat, idx){
    return '<div class="wc-card">'
      + '<div class="wc-img" data-q="'+esc(item.name+' '+nearOf(item))+'" style="background:'+item.img.grad+'">'
      +   (item.photoUrl ? '<img src="'+esc(item.photoUrl)+'" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">' : '')
      +   '<span style="filter:drop-shadow(0 2px 6px rgba(0,0,0,.3));'+(item.photoUrl?'display:none;':'')+'">'+item.img.emoji+'</span>'
      +   '<span class="wc-ai">🌿 おすすめ度 '+item.ai+'点</span>'
      + '</div>'
      + '<div class="wc-body">'
      +   '<div class="wc-name" title="'+esc(item.name+'（'+item.genre+'）')+'">'+item.name+'</div>'
      +   '<div class="wc-meta">★<b style="color:#2a2018">'+item.rating.toFixed(1)+'</b>（'+item.reviews+'）・'+(item.nearName?item.nearName+'から':'')+item.walk+'</div>'
      +   (item.price ? '<div class="wc-price">'+item.price+'</div>' : '')
      +   '<button class="wc-add" data-cat="'+cat.key+'" data-idx="'+idx+'">＋ ルートに追加</button>'
      + '</div></div>';
  }

  // ─────────────────────────────────────────
  // 4. 検索結果ページ（ルート一覧）の下に提案セクションを組み込む
  // ─────────────────────────────────────────
  function buildInline(){
    var ct = document.getElementById('aiRouteCards');
    if (!ct) return;
    var routes = window._dynamicRoutes || window.AI_ROUTES || [];
    if (!routes.length) return;
    if (!state.route || routes.indexOf(state.route) < 0) { state.route = routes[0]; state.added = []; state.items = null; }
    var d;
    if (window._dynamicRoutes) {
      var dk = dynKey(state.route);
      if (dynCache[dk]) { d = dynCache[dk]; }
      else if (dynCache[dk+':loading']) { d = null; }
      else {
        dynCache[dk+':loading'] = true;
        fetchDynamicNearby(state.route, function(res){
          dynCache[dk] = res || WC_DATA.dyn;
          delete dynCache[dk+':loading'];
          buildInlineKeep();
        });
        d = null;
      }
    } else { d = fetchNearby(state.route); }
    if (!d) {
      var oldL = document.getElementById('wcInline'); if (oldL) oldL.remove();
      var ld = document.createElement('div'); ld.id='wcInline';
      ld.innerHTML = '<div class="wc-sec" style="text-align:center;margin:26px 16px 40px"><div class="wc-sec-tit" style="font-size:15px">🌿 周辺のおすすめを探しています…</div><div class="wc-sec-sub">AIが'+String(state.route.spots[0].name).replace(/[（(].*$/,'')+'の近くのグルメ・カフェ・観光を検索中</div></div>';
      ct.appendChild(ld);
      return;
    }
    currentNear = d.near || String(state.route.spots[0].name).replace(/[（(].*$/,'');

    var old = document.getElementById('wcInline'); if (old) old.remove();
    var box = document.createElement('div'); box.id='wcInline';
    // 以前は下部固定ボタンがこの中にあったため 96px の余白を空けていたが、
    // ボタンを body 直下へ移したので不要になった。大きな空白の原因だったので詰める。
    box.style.cssText = 'padding-bottom:10px;';
    var h = '';
    h += '<div id="wcAddedBox"></div>';
    h += '<div class="wc-sec" style="text-align:center;margin-top:18px">'
      + '<div class="wc-sec-tit" style="font-size:15.5px">🌿 この近くもおすすめです 🍃</div>'
      + '<div class="wc-sec-sub">AIが周辺スポットを見つけました（ベース：'+state.route.name+'）</div></div>';
    CATS.forEach(function(cat){
      var items = d[cat.key]||[];
      if (!items.length) return;
      h += '<div class="wc-sec"><div class="wc-sec-h"><div><span class="wc-sec-tit">'+cat.tit+'</span>'
        + ' <span class="wc-sec-sub">'+(cat.sub||'')+'</span></div><span class="wc-all">すべて見る ›</span></div>'
        + '<div class="wc-row">' + items.map(function(it,i){ return cardHtml(it,cat,i); }).join('') + '</div></div>';
    });

    box.innerHTML = h;
    ct.appendChild(box);
    renderAddedList();

    box.querySelectorAll('.wc-add').forEach(function(btn){
      btn.onclick = function(){
        var cat = btn.getAttribute('data-cat'), idx = +btn.getAttribute('data-idx');
        var item = (fetchNearby(state.route)[cat]||[])[idx];
        if (!item) return;
        var key = cat+':'+idx;
        var pos = state.added.findIndex(function(a){ return a.key===key; });
        if (pos>-1) { state.added.splice(pos,1); btn.classList.remove('on'); btn.textContent='＋ ルートに追加'; }
        else { state.added.push({key:key,cat:cat,item:item}); btn.classList.add('on'); btn.textContent='✓ 追加済み'; toast('🌿 「'+item.name+'」をルートに追加しました'); }
        renderAddedList();
      };
    });
    box.querySelectorAll('.wc-all').forEach(function(a){ a.onclick=function(){ toast('「すべて見る」はAPI接続後に対応予定です'); }; });
    // カード画像タップ → スポット詳細ページ
    box.querySelectorAll('.wc-card').forEach(function(cardEl){
      var img = cardEl.querySelector('.wc-img');
      var btn = cardEl.querySelector('.wc-add');
      if (img && btn) img.onclick = function(){ openSpot(btn.getAttribute('data-cat'), +btn.getAttribute('data-idx')); };
      var nameEl = cardEl.querySelector('.wc-name');
      if (nameEl && btn){ nameEl.style.cursor='pointer'; nameEl.onclick = function(){ openSpot(btn.getAttribute('data-cat'), +btn.getAttribute('data-idx')); }; }
    });

    // 画面下固定の「カスタマイズしたルートを見る」ボタン
    //
    // ★以前は #pgAiRouteList の中に入れていたが、この要素には transform が掛かっている。
    //   transform が掛かった要素の中では position:fixed が「画面」ではなく
    //   「その要素」を基準にしてしまい、ボタンが画面の下にはみ出して押せなくなっていた。
    //   そのため body の直下に置き、表示・非表示だけをページに合わせて切り替える。
    if (document.getElementById('pgAiRouteList') && !document.getElementById('wcInlineCtaBar')) {
      var bar = document.createElement('div');
      bar.id = 'wcInlineCtaBar'; bar.className = 'wc-cta-wrap';
      bar.style.display = 'none';
      bar.innerHTML = '<button class="wc-cta" id="wcInlineCta">カスタマイズしたルートを見る →</button>';
      document.body.appendChild(bar);
      document.getElementById('wcInlineCta').onclick = openPreview;
    }
    syncNavHeight();
    syncInlineCta();
    resolveCardPhotos();
    setTimeout(resolveCardPhotos, 1200); // SDK読み込みが遅れた場合の再試行
  }

  // 下部メニューの高さを測って CSS 変数 --wabi-nav-h に入れる。
  // 端末やホームバーの有無で高さが変わるため、決め打ちにせず毎回測る。
  // ルート一覧ページが開いているときだけ、下部固定ボタンを出す
  function syncInlineCta(){
    try {
      var bar = document.getElementById('wcInlineCtaBar');
      if (!bar) return;
      var page = document.getElementById('pgAiRouteList');
      var open = page && page.classList.contains('show')
                 && getComputedStyle(page).display !== 'none';
      // ルート一覧の上に別の画面（プレビュー・スポット詳細・テーマ）が
      // かぶさっている間は出さない
      if (open) {
        ['wcPrev', 'wcSpot', 'wcTheme', 'wabiRoutePg'].forEach(function(id){
          var el = document.getElementById(id);
          if (el && getComputedStyle(el).display !== 'none') open = false;
        });
      }
      bar.style.display = open ? 'block' : 'none';
    } catch(e){}
  }
  window.wabiSyncInlineCta = syncInlineCta;

  function syncNavHeight(){
    try {
      var nav = document.getElementById('wabiNav');
      var h = (nav && nav.offsetHeight) ? nav.offsetHeight : 60;
      document.documentElement.style.setProperty('--wabi-nav-h', h + 'px');
    } catch(e){}
  }
  window.wabiSyncNavHeight = syncNavHeight;
  syncNavHeight();
  window.addEventListener('resize', syncNavHeight);
  window.addEventListener('orientationchange', function(){ setTimeout(syncNavHeight, 300); });

  // 滞在時間（分）の目安
  var STAY = {shrine:40, gourmet:60, cafe:30, sight:30, exp:60};
  var CAT_BADGE = {gourmet:'ランチ', cafe:'カフェ・休憩', sight:'観光', exp:'体験', hotel:'宿泊'};

  /* ────────────────────────────────────────────────────────────
     並び順つきのルート項目リストを最新化（神社＋追加スポット）
     （2026-09-05 並べ替えルールを追加）

     ・宿泊施設 … 必ずルートの一番最後（あとから何を足しても最後のまま）
     ・それ以外（グルメ・カフェ・観光・体験）
        … そのスポットが見つかった神社（nearName）のすぐ次に入れる
           同じ神社に複数入れるときは、追加した順に並べる
     ・nearName が無い古いデータや固定ルートは、今までどおり末尾に足す
     ・すでに並んでいるものは動かさないので、≡ での手動並べ替えは残る
     ──────────────────────────────────────────────────────────── */
  function isHotelItem(it){ return it && it.type==='add' && it.a && it.a.cat==='hotel'; }

  // その追加スポットを入れる位置（対応する神社の直後）を返す。判らなければ -1
  function insertPosFor(a, list){
    var near = a && a.item && a.item.nearName;
    if (!near) return -1;
    var base = -1;
    for (var i = 0; i < list.length; i++){
      var it = list[i];
      if (it.type !== 'shrine') continue;
      var nm = String(it.spot.name || '').replace(/[（(].*$/, '');
      if (nm === near || nm.indexOf(near) >= 0 || near.indexOf(nm) >= 0){ base = i; break; }
    }
    if (base < 0) return -1;
    // その神社のあとに既に入っているスポットの、さらに次へ（宿泊の前で止める）
    var at = base + 1;
    while (at < list.length && list[at].type === 'add' && !isHotelItem(list[at])) at++;
    return at;
  }

  function ensureItems(){
    if (!state.route) return;
    var prev = state.items || [];
    var valid = [];
    prev.forEach(function(it){
      if (it.type==='shrine' && state.route.spots.some(function(s){ return s.name===it.spot.name; })) valid.push(it);
      if (it.type==='add' && state.added.some(function(a){ return a.key===it.a.key; })) valid.push(it);
    });
    state.route.spots.forEach(function(s){
      if (!valid.some(function(it){ return it.type==='shrine' && it.spot.name===s.name; })) valid.push({type:'shrine', spot:s});
    });
    state.added.forEach(function(a){
      if (valid.some(function(it){ return it.type==='add' && it.a.key===a.key; })) return;
      var it = {type:'add', a:a};
      if (a.cat === 'hotel'){ valid.push(it); return; }          // 宿泊はこのあと必ず最後に寄せる
      var at = insertPosFor(a, valid);
      if (at < 0) valid.push(it); else valid.splice(at, 0, it);
    });
    // 宿泊施設は常に一番最後へ
    var beds = [], rest = [];
    valid.forEach(function(it){ (isHotelItem(it) ? beds : rest).push(it); });
    state.items = rest.concat(beds);
  }

  // ─────────────────────────────────────────
  // ルートのスポット画像が「⛩」のままになるのを防ぐ後追い取得
  //
  // AIが作るルートのスポットは photo を持たないことがある。
  //  ① photoCache / SHRINES に既にある写真を使う（通信なし）
  //  ② それでも無ければ Places API に1回だけ問い合わせる
  // 取れた写真はルートのデータにも書き戻すので、再描画しても消えない。
  // ─────────────────────────────────────────
  var spotPhotoMemo = {};   // 神社名 → URL（'' は「写真なし」の確定）

  function rememberSpotPhoto(name, url){
    spotPhotoMemo[name] = url || '';
    if (!url) return;
    try {
      if (state.route && state.route.spots) {
        state.route.spots.forEach(function(sp){ if (sp.name===name && !sp.photo) sp.photo = url; });
      }
      (window._dynamicRoutes || []).forEach(function(r){
        (r.spots || []).forEach(function(sp){ if (sp.name===name && !sp.photo) sp.photo = url; });
      });
    } catch(e){}
  }

  function paintSpotPhoto(box, url){
    if (!box || box.querySelector('img')) return;
    var im = document.createElement('img');
    im.loading = 'lazy';
    im.onerror = function(){ try { im.parentNode.removeChild(im); box.textContent = '\u26e9'; } catch(e){} };
    box.textContent = '';
    box.appendChild(im);
    im.src = url;
  }

  function fillSpotPhotos(){
    try {
      var boxes = document.querySelectorAll(
        '.wcb-img[data-shrinename], .wc-mini-img[data-shrinename], .wc-tl-th[data-shrinename]');
      var svc = null;
      [].forEach.call(boxes, function(box){
        if (box.querySelector('img')) return;
        var name = box.getAttribute('data-shrinename');
        if (!name) return;

        var url = spotPhotoMemo[name];
        if (url === undefined && typeof window.findShrinePhoto === 'function') {
          try { url = window.findShrinePhoto(name) || undefined; } catch(e){ url = undefined; }
        }
        if (url) { paintSpotPhoto(box, url); rememberSpotPhoto(name, url); return; }
        if (url === '') return;                          // 写真なしと確定済み
        if (box.getAttribute('data-photoloading')) return;
        if (typeof google === 'undefined' || !google.maps || !google.maps.places) return;

        box.setAttribute('data-photoloading', '1');
        if (!svc) svc = new google.maps.places.PlacesService(document.createElement('div'));
        svc.findPlaceFromQuery({ query: name, fields: ['photos'] }, function(res, st){
          box.removeAttribute('data-photoloading');
          if (st === google.maps.places.PlacesServiceStatus.OK
              && res && res[0] && res[0].photos && res[0].photos.length) {
            var u = res[0].photos[0].getUrl({ maxWidth: 500 });
            rememberSpotPhoto(name, u);
            paintSpotPhoto(box, u);
          } else {
            rememberSpotPhoto(name, '');                 // 次から問い合わせない
          }
        });
      });
    } catch(e){}
  }

  function renderAddedList(){
    var boxEl = document.getElementById('wcAddedBox');
    if (!boxEl || !state.route) return;
    ensureItems();
    // 合計滞在時間（宿泊は別枠）
    var total = 0, hotelCount = 0;
    state.items.forEach(function(it){
      if (it.type==='shrine') total += STAY.shrine;
      else if (it.a.cat==='hotel') hotelCount++;
      else total += (STAY[it.a.cat]||40);
    });
    var totalTxt = '合計滞在 約' + (total>=60 ? Math.floor(total/60)+'時間'+(total%60?total%60+'分':'') : total+'分')
      + (hotelCount ? '＋宿泊'+hotelCount+'泊' : '') + '（移動時間は別）';

    var h = '<div class="wcb-card">'
      + '<div class="wcb-tit">✦ 現在のルート ✦</div>'
      + '<div class="wcb-sub">追加したスポットで、あなただけの巡礼ルートを作りましょう</div>'
      + '<div class="wcb-total">'+totalTxt+'</div>'
      + '<div id="wcbList">';
    state.items.forEach(function(it, i){
      var last = (i === state.items.length-1);
      var num = '<div class="wcb-numcol"><div class="wcb-num">'+(i+1)+'</div>'+(last?'':'<div class="wcb-line"></div>')+'</div>';
      if (it.type==='shrine') {
        var s = it.spot;
        h += '<div class="wcb-row" data-i="'+i+'">'+num
          + '<div class="wcb-img" data-shrinename="'+esc(s.name)+'" style="background:'+G.sight+'">'+(s.photo?'<img src="'+esc(s.photo)+'" loading="lazy">':'⛩')+'</div>'
          + '<div class="wcb-info"><div class="wcb-nm" data-shrinename="'+esc(s.name)+'"><span class="t">'+s.name+'</span><span class="wcb-bdg">必須スポット</span></div>'
          + '<div class="wcb-sb">'+(s.loc||'')+'</div>'
          + '<div class="wcb-tags"><span class="wcb-tag">参拝・観光</span></div></div>'
          + '<div class="wcb-stay"><span>滞在時間</span><b>'+STAY.shrine+'分</b></div>'
          + '<div class="wcb-handle" data-h="'+i+'">≡</div></div>';
      } else {
        var a = it.a, isHotel = a.cat==='hotel';
        h += '<div class="wcb-row" data-i="'+i+'">'+num
          + '<div class="wcb-img" data-ocat="'+a.cat+'" data-okey="'+esc(a.key)+'" style="background:'+a.item.img.grad+'">'
          + (a.item.photoUrl?'<img src="'+esc(a.item.photoUrl)+'" loading="lazy">':a.item.img.emoji)+'</div>'
          + '<div class="wcb-info"><div class="wcb-nm" data-ocat="'+a.cat+'" data-okey="'+esc(a.key)+'"><span class="t">'+a.item.name+'</span><span class="wcb-bdg">'+(CAT_BADGE[a.cat]||'')+'</span></div>'
          + '<div class="wcb-sb">'+nearOf(a.item)+'から'+a.item.walk+'</div>'
          + '<div class="wcb-tags"><span class="wcb-tag">'+a.item.genre+'</span><span class="wcb-tag ai">おすすめ度 '+a.item.ai+'点</span></div></div>'
          + (isHotel
             ? '<div class="wcb-stay"><span>宿泊</span><b>1泊</b></div>'
             : '<div class="wcb-stay"><span>滞在時間</span><b>'+(STAY[a.cat]||40)+'分</b></div>')
          + '<div class="wcb-handle" data-h="'+i+'">≡</div></div>';
      }
    });
    h += '</div>'
      + '<button class="wcb-addbtn" id="wcbAdd">＋ スポットを追加</button>'
      + '<div style="text-align:center;font-size:9.5px;color:#b8b2a6;margin-top:7px">≡ を押したまま上下で並び替え ／ 外すときは下のカードの「✓追加済み」をもう一度タップ</div>'
      + '</div>';
    boxEl.innerHTML = h;

    // タップで詳細ページへ
    boxEl.querySelectorAll('[data-shrinename]').forEach(function(el){
      el.onclick = function(){ if (typeof window.openSpotDetail==='function') window.openSpotDetail(el.getAttribute('data-shrinename')); };
    });
    boxEl.querySelectorAll('[data-okey]').forEach(function(el){
      el.onclick = function(){
        var key = el.getAttribute('data-okey');
        var idx = +key.split(':')[1];
        openSpot(el.getAttribute('data-ocat'), idx);
      };
    });
    // 「＋スポットを追加」→ 下の提案セクションへスクロール
    var addBtn = document.getElementById('wcbAdd');
    if (addBtn) addBtn.onclick = function(){
      var sec = document.querySelector('#wcInline .wc-sec:nth-of-type(1)');
      var target = document.querySelectorAll('#wcInline .wc-sec')[1] || sec;
      if (target) target.scrollIntoView({behavior:'smooth', block:'start'});
    };
    // ドラッグで並び替え（ハンドル ≡ を押したまま上下）
    setupDrag();
    // 写真が無いスポットは後から埋める
    fillSpotPhotos();
  }
  window.wabiFillSpotPhotos = fillSpotPhotos;   // 別スコープの定期実行から呼ぶ

  function setupDrag(){
    var list = document.getElementById('wcbList');
    if (!list) return;
    list.querySelectorAll('.wcb-handle').forEach(function(handle){
      handle.onpointerdown = function(ev){
        ev.preventDefault();
        var row = handle.closest('.wcb-row');
        var startIdx = +row.getAttribute('data-i');
        var curIdx = startIdx;
        row.classList.add('drag');
        handle.setPointerCapture(ev.pointerId);
        var move = function(e){
          var rows = [].slice.call(list.querySelectorAll('.wcb-row'));
          for (var j=0; j<rows.length; j++){
            if (rows[j]===row) continue;
            var rc = rows[j].getBoundingClientRect();
            if (e.clientY > rc.top && e.clientY < rc.bottom){
              if (e.clientY < rc.top + rc.height/2) list.insertBefore(row, rows[j]);
              else list.insertBefore(row, rows[j].nextSibling);
              break;
            }
          }
        };
        var up = function(e){
          row.classList.remove('drag');
          handle.releasePointerCapture(ev.pointerId);
          document.removeEventListener('pointermove', move);
          document.removeEventListener('pointerup', up);
          // DOMの並びから state.items を再構成
          var order = [].slice.call(list.querySelectorAll('.wcb-row')).map(function(r){ return state.items[+r.getAttribute('data-i')]; });
          state.items = order;
          renderAddedList();
        };
        document.addEventListener('pointermove', move);
        document.addEventListener('pointerup', up);
      };
    });
  }

  // 削除後にボタン状態も同期して再構築（選択ルートは保持）
  function buildInlineKeep(){
    var keepRoute = state.route, keepAdded = state.added, keepItems = state.items;
    buildInline();
    state.route = keepRoute; state.added = keepAdded; state.items = keepItems;
    // ボタンの押下状態を復元
    keepAdded.forEach(function(a){
      var btn = document.querySelector('#wcInline .wc-add[data-cat="'+a.cat+'"][data-idx="'+a.key.split(':')[1]+'"]');
      if (btn) { btn.classList.add('on'); btn.textContent='✓ 追加済み'; }
    });
    renderAddedList();
  }

  // ─────────────────────────────────────────
  // 5. カスタマイズ済みルートのプレビュー
  // ─────────────────────────────────────────
  function buildTimeline(){
    ensureItems();
    return state.items.map(function(it){
      if (it.type==='shrine') return {name:it.spot.name, sname:it.spot.name, photo:it.spot.photo, meta:'約'+STAY.shrine+'分滞在', ic:'⛩', grad:G.sight};
      var a = it.a;
      return {name:a.item.name,
        meta:(a.cat==='hotel' ? '宿泊・1泊' : (CAT_LABEL[a.cat]||'')+'・約'+(STAY[a.cat]||40)+'分'),
        ic:a.item.img.emoji, grad:a.item.img.grad, photo:a.item.photoUrl||null};
    });
  }

  function openPreview(){
    if (!state.route) return;
    var r = state.route, tl = buildTimeline();
    var base = String(r.spots[0].name).replace(/[（(].*$/,'');
    var theme = (r.tags && r.tags[0]) ? r.tags[0] : '祈り';
    var title = base + 'とめぐる、<br>' + theme + 'の旅';
    var transIc = r.transport==='徒歩' ? '🚶 徒歩中心' : r.transport==='車' ? '🚗 車中心' : '🚃 電車・バス';
    var hero = r.spots[0].photo || '';
    var h = '<div class="wc-hero">' + (hero ? '<img src="'+esc(hero)+'">' : '<div style="width:100%;height:100%;background:'+G.sight+'"></div>')
      + '<div class="wc-hero-grad"></div>'
      + '<div style="position:absolute;top:14px;left:14px;background:rgba(255,255,255,.9);color:#5a4470;font-size:10px;font-weight:700;padding:4px 12px;border-radius:14px">カスタマイズ済みルート</div>'
      + '<div class="wc-hero-t">'+title+'</div>'
      + '<div class="wc-hero-chips"><span class="wc-chip">'+transIc+'</span><span class="wc-chip">🕐 '+(r.time||'')+'＋α</span><span class="wc-chip">📍 '+tl.length+'スポット</span></div></div>';
    h += '<div class="wc-tl">';
    tl.forEach(function(t,i){
      h += '<div class="wc-tl-i"><div class="wc-tl-n">'+(i+1)+'</div>'
        + '<div class="wc-tl-th"'+(t.sname?' data-shrinename="'+esc(t.sname)+'"':'')+' style="background:'+t.grad+'">'+(t.photo?'<img src="'+esc(t.photo)+'" loading="lazy">':t.ic)+'</div>'
        + '<div><div class="wc-tl-nm">'+t.name+'</div><div class="wc-tl-mt">'+t.meta+'</div></div></div>';
      if (i<tl.length-1) h += '<div class="wc-tl-mv">'+(r.transport==='徒歩'?'徒歩':'移動')+' 約10分</div>';
    });
    h += '</div>';
    h += '<div style="display:flex;gap:10px;margin:20px 16px 30px">'
      + '<button class="wc-btn2 wc-save" id="wcSave">♡ ルートを保存</button>'
      + '<button class="wc-btn2 wc-navi" id="wcNavi">✦ このルートでナビを開始 →</button></div>';
    document.getElementById('wcPrevBody').innerHTML = h;
    prev.style.display = 'block'; prev.scrollTop = 0;
    document.getElementById('wcSave').onclick = function(){
      try{
        var saved = JSON.parse(localStorage.getItem('wabi_custom_routes')||'[]');
        saved.push({route:r.id, name:r.name, added:state.added.map(function(a){return a.item.name;}), date:new Date().toISOString().slice(0,10)});
        localStorage.setItem('wabi_custom_routes', JSON.stringify(saved));
      }catch(e){}
      toast('♡ ルートを保存しました');
    };
    document.getElementById('wcNavi').onclick = function(){
      var names = tl.map(function(t){ return String(t.name).replace(/[（(].*$/,'').trim(); });
      var mode = r.transport==='徒歩' ? 'walking' : 'driving';
      var url = 'https://www.google.com/maps/dir/?api=1&origin=' + encodeURIComponent(names[0])
        + '&destination=' + encodeURIComponent(names[names.length-1])
        + (names.length>2 ? '&waypoints=' + encodeURIComponent(names.slice(1,-1).join('|')) : '')
        + '&travelmode=' + mode;
      window.open(url, '_blank');
    };
  }

  // ─────────────────────────────────────────
  // 4.5 検索ルートの神社数が少ないとき、周辺の神社仏閣をGoogleから補充
  //（例：7時間なら6社まで。内蔵データベースに無い神社を自動で追加）
  // ─────────────────────────────────────────
  var supplyCache = {};
  function wantSpotCount(){
    var t = window._aiSelTime || '3時間';
    return t==='2日' ? 8 : t==='7時間' ? 6 : t==='5時間' ? 4 : 3;
  }
  function supplementDynamicRoutes(){
    try{
      var routes = window._dynamicRoutes;
      if (!routes || !routes.length) return;
      var s0 = routes[0].spots && routes[0].spots[0];
      if (!s0 || !s0.lat) return;
      var want = wantSpotCount();
      var maxSpots = 0;
      routes.forEach(function(r){ if (r.spots.length > maxSpots) maxSpots = r.spots.length; });
      if (maxSpots >= want) return;
      if (typeof API_KEY==='undefined' || !API_KEY || typeof google==='undefined' || !google.maps || !google.maps.places) return;
      var ck = s0.name + ':' + want;
      if (supplyCache[ck] === 'loading') return;
      if (Array.isArray(supplyCache[ck])) { applySupplement(routes, supplyCache[ck], want); return; }
      supplyCache[ck] = 'loading';
      var trans = window._aiSelTrans || '電車';
      var radius = trans==='徒歩' ? 2500 : trans==='車' ? 15000 : 8000;
      var svc = new google.maps.places.PlacesService(document.createElement('div'));
      svc.nearbySearch({location:new google.maps.LatLng(s0.lat, s0.lng), radius:radius, keyword:'神社 寺', type:'place_of_worship'}, function(res, status){
        if (status !== google.maps.places.PlacesServiceStatus.OK || !res){ supplyCache[ck] = []; return; }
        var pool = res.filter(function(p){ return (p.user_ratings_total||0) >= 20 && p.geometry && p.geometry.location; })
          .sort(function(a,b){ return (b.user_ratings_total||0)-(a.user_ratings_total||0); })
          .map(function(p){
            return { name:p.name,
              loc:(p.vicinity||'').split(/[、,]/)[0]||'',
              move:'約15分', benefit:'開運・参拝',
              lat:p.geometry.location.lat(), lng:p.geometry.location.lng(),
              photo:(p.photos && p.photos.length) ? p.photos[0].getUrl({maxWidth:500}) : null };
          });
        supplyCache[ck] = pool;
        applySupplement(routes, pool, want);
        // 追加できたので画面を描き直す
        if (typeof window.renderRouteCards === 'function') window.renderRouteCards();
        if (typeof showToast === 'function') showToast('🌿 周辺の神社仏閣をルートに補充しました');
      });
    }catch(e){}
  }
  function applySupplement(routes, pool, want){
    routes.forEach(function(r, ri){
      var have = r.spots.map(function(s){ return s.name; });
      var cand = pool.filter(function(p){ return have.indexOf(p.name) < 0; });
      // ルートごとに始点をずらして変化をつける
      if (cand.length > 1) { var off = ri % cand.length; cand = cand.slice(off).concat(cand.slice(0, off)); }
      var i = 0;
      while (r.spots.length < want && i < cand.length){
        if (r.spots.every(function(s){ return s.name !== cand[i].name; })) r.spots.push(cand[i]);
        i++;
      }
    });
  }

  // ─────────────────────────────────────────
  // 5.5 スポット詳細ページ（カード画像タップで開く）
  // ─────────────────────────────────────────
  var spotPg = document.createElement('div'); spotPg.id='wcSpot';
  spotPg.innerHTML = '<div class="wc-sd-inner" id="wcSpotBody"></div><div class="wc-cta-wrap"><button class="wc-cta" id="wcSpotCta">このスポットを追加してルートを更新 →</button></div>';
  document.body.appendChild(spotPg);
  var lb = document.createElement('div'); lb.id='wcLb'; lb.innerHTML='<img>';
  lb.onclick = function(){ lb.style.display='none'; };
  document.body.appendChild(lb);

  var currentSpot = null; // {cat, idx, item}
  var placeCache = {};    // 店名 → Places詳細

  function starTxt(n){ return '★'.repeat(Math.round(n)) + '☆'.repeat(5-Math.round(n)); }

  function openSpot(cat, idx){
    var item = (fetchNearby(state.route)[cat]||[])[idx];
    if (!item) return;
    currentSpot = {cat:cat, idx:idx, item:item};
    renderSpot(item, cat);
    spotPg.style.display='block'; spotPg.scrollTop=0;
    enrichSpot(item, cat); // Placesで写真・営業時間・口コミを取得して差し込み
  }

  function renderSpot(item, cat){
    var d = fetchNearby(state.route);
    var isHotel = cat==='hotel';
    var h = '';
    // ① ヒーロー
    h += '<div class="wc-sd-hero" id="sdHeroBox" style="background:'+item.img.grad+'">'
      + (item.photoUrl ? '<img src="'+esc(item.photoUrl)+'" style="width:100%;height:100%;object-fit:cover">' : '')
      + '<div id="sdHeroEmoji" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:64px;'+(item.photoUrl?'display:none;':'')+'">'+item.img.emoji+'</div>'
      + '<div class="wc-sd-grad"></div>'
      + '<div class="wc-sd-back" id="sdBack">‹</div><div class="wc-sd-heart">♡</div>'
      + '<div class="wc-sd-badge">🌿 おすすめ度 '+item.ai+'点</div>'
      + '<div class="wc-sd-tit">'+item.name+'</div>'
      + '<div class="wc-sd-meta">★ '+item.rating.toFixed(1)+'（'+item.reviews+'件の口コミ）・'+nearOf(item)+'から'+item.walk+'</div>'
      + '<div class="wc-sd-btns"><button class="wc-sd-add" id="sdAdd">＋ ルートに追加</button><button class="wc-sd-map" id="sdMap">📍 地図で見る</button></div>'
      + '</div>';
    // ② AIおすすめ理由
    h += '<div class="wc-sd-card wc-sd-reason"><div class="wc-sd-h">🌿 AIがおすすめする理由</div>'
      + '<div class="wc-sd-txt">'+item.name+'は、'+(nearOf(item)||'神社')+'から'+item.walk+'。巡礼の途中で立ち寄りやすい'+item.genre+'の人気店です。地元の方にも観光客にも親しまれており、参拝とあわせて訪れるのに最適です。</div>'
      + '<div class="wc-sd-chips"><span class="wc-sd-chip">地元で人気</span><span class="wc-sd-chip">'+item.walk+'</span><span class="wc-sd-chip">'+item.genre+'</span></div></div>';
    // ③ 写真ギャラリー（Placesで後から差し込み）
    h += '<div class="wc-sd-card"><div class="wc-sd-h">📷 写真</div><div class="wc-sd-g" id="sdGallery">'
      + '<div class="ph" style="background:'+item.img.grad+'">'+item.img.emoji+'</div>'
      + '<div class="ph" style="background:'+G.sight+'">📷</div>'
      + '<div class="ph" style="background:'+G.cafe+'">📷</div>'
      + '</div><div id="sdGalleryNote" style="font-size:9.5px;color:#a89a80;margin-top:6px">※写真はAPIキー設定後に自動で本物が表示されます</div></div>';
    // ④ おすすめメニュー（飲食のみ・参考例）
    if (cat==='gourmet' || cat==='cafe') {
      h += '<div class="wc-sd-card"><div class="wc-sd-h">🍽 おすすめメニュー <span style="font-size:9.5px;color:#a89a80;font-weight:400">（参考・変わる場合があります）</span></div><div class="wc-menu">'
        + '<div class="wc-menu-c"><div class="wc-menu-img" style="background:'+item.img.grad+'">'+item.img.emoji+'</div><div class="wc-menu-b"><div class="wc-menu-n">名物・看板メニュー</div><div class="wc-menu-p">〜¥1,500</div><div class="wc-menu-d">お店を代表する一品。まずはこれから。</div></div></div>'
        + '<div class="wc-menu-c"><div class="wc-menu-img" style="background:'+G.cafe+'">🍵</div><div class="wc-menu-b"><div class="wc-menu-n">季節の一品</div><div class="wc-menu-p">〜¥1,000</div><div class="wc-menu-d">季節替わりのおすすめ。</div></div></div>'
        + '</div></div>';
    }
    // ⑤ 店舗情報
    h += '<div class="wc-sd-card"><div class="wc-sd-h">🏠 店舗情報</div><div id="sdInfo">'
      + '<div class="wc-info-row"><span class="wc-info-ic">🕐</span><span class="wc-info-k">営業時間</span><span id="sdHours">取得中…</span></div>'
      + '<div class="wc-info-row"><span class="wc-info-ic">📞</span><span class="wc-info-k">電話番号</span><span id="sdTel">取得中…</span></div>'
      + '<div class="wc-info-row"><span class="wc-info-ic">📍</span><span class="wc-info-k">住所</span><span id="sdAddr">取得中…</span></div>'
      + '</div><button class="wc-sd-map" id="sdMap2" style="width:100%;margin-top:12px;border:1px solid #c9a84c">📍 Googleマップで開く</button></div>';
    // ⑥ 口コミ
    h += '<div class="wc-sd-card"><div class="wc-sd-h">💬 口コミ（Google） <span style="font-size:9.5px;color:#a89a80;font-weight:400" id="sdRevNote">取得中…</span></div><div id="sdRevs"></div></div>';
    // ⑦ この近くの神社（現在のルートの神社）
    if (state.route && state.route.spots) {
      h += '<div class="wc-sd-card"><div class="wc-sd-h">⛩ この近くの神社</div><div class="wc-sd-g">'
        + state.route.spots.map(function(s){
            return '<div class="wc-mini"><div class="wc-mini-img" data-shrinename="'+esc(s.name)+'" style="background:'+G.sight+'">'+(s.photo?'<img src="'+esc(s.photo)+'" loading="lazy">':'⛩')+'</div>'
              + '<div class="wc-mini-b"><div class="wc-mini-n">'+s.name+'</div><div class="wc-mini-m">巡拝ルート内</div></div></div>';
          }).join('')
        + '</div></div>';
    }
    // ⑧ この近くの観光スポット
    var sights = (d.sight||[]).filter(function(x){ return x.name!==item.name; });
    if (sights.length) {
      h += '<div class="wc-sd-card"><div class="wc-sd-h">🏞 この近くの観光スポット</div><div class="wc-sd-g">'
        + sights.map(function(x){
            var gi = (d.sight||[]).indexOf(x);
            var added = state.added.some(function(a){ return a.key==='sight:'+gi; });
            return '<div class="wc-mini"><div class="wc-mini-img" style="background:'+x.img.grad+'">'+x.img.emoji+'</div>'
              + '<div class="wc-mini-b"><div class="wc-mini-n">'+x.name+'</div><div class="wc-mini-m">'+x.walk+'</div>'
              + '<button class="wc-mini-add'+(added?' on':'')+'" data-scat="sight" data-sidx="'+gi+'">'+(added?'✓ 追加済み':'＋ 追加')+'</button></div></div>';
          }).join('')
        + '</div></div>';
    }
    // ⑨ この近くのホテル（アフィリエイト導線）
    var hotels = (d.hotel||[]).filter(function(x){ return x.name!==item.name; });
    if (hotels.length) {
      h += '<div class="wc-sd-card"><div class="wc-sd-h">🏨 この近くのホテル</div>'
        + hotels.map(function(x){
            return '<div style="border:1px solid #eee2c8;border-radius:14px;padding:10px 12px;margin-top:8px">'
              + '<div style="display:flex;gap:10px;align-items:center">'
              + '<div style="width:56px;height:56px;border-radius:12px;flex:0 0 56px;display:flex;align-items:center;justify-content:center;font-size:24px;color:#fff;background:'+x.img.grad+'">'+x.img.emoji+'</div>'
              + '<div><div style="font-size:12px;font-weight:700;font-family:\'Shippori Mincho\',serif">'+x.name+'</div>'
              + '<div style="font-size:10px;color:#a89a80;margin-top:2px">★'+x.rating.toFixed(1)+'（'+x.reviews+'）・'+x.walk+'</div>'
              + '<div style="font-size:12px;font-weight:800;color:#a83320;margin-top:2px">'+(x.price||'')+'</div></div></div>'
              + '<div class="wc-hotel2">'
              + '<button class="wc-hbtn rk" data-hname="'+esc(x.name)+'" data-htype="rk">楽天トラベルで見る</button>'
              + '<button class="wc-hbtn jl" data-hname="'+esc(x.name)+'" data-htype="jl">じゃらんで見る</button>'
              + '</div></div>';
          }).join('')
        + '</div>';
    }
    document.getElementById('wcSpotBody').innerHTML = h;

    // ボタン類の配線
    document.getElementById('sdBack').onclick = function(){ spotPg.style.display='none'; };
    function mapOpen(){ window.open('https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(item.name+' '+nearOf(item)),'_blank'); }
    document.getElementById('sdMap').onclick = mapOpen;
    document.getElementById('sdMap2').onclick = mapOpen;
    document.getElementById('sdAdd').onclick = function(){ addCurrentSpot(); };
    document.getElementById('wcSpotCta').onclick = function(){ addCurrentSpot(); spotPg.style.display='none'; };
    // 観光スポットの＋追加
    spotPg.querySelectorAll('.wc-mini-add').forEach(function(btn){
      btn.onclick = function(){
        var scat=btn.getAttribute('data-scat'), sidx=+btn.getAttribute('data-sidx');
        var it=(fetchNearby(state.route)[scat]||[])[sidx];
        if(!it) return;
        var key=scat+':'+sidx;
        if(!state.added.some(function(a){return a.key===key;})){
          state.added.push({key:key,cat:scat,item:it});
          btn.classList.add('on'); btn.textContent='✓ 追加済み';
          toast('🌿 「'+it.name+'」をルートに追加しました');
          buildInlineKeep();
        }
      };
    });
    // 楽天・じゃらん（※アフィリエイトIDは後日ここに組み込み）
    spotPg.querySelectorAll('.wc-hbtn').forEach(function(btn){
      btn.onclick = function(){
        var nm=btn.getAttribute('data-hname'), tp=btn.getAttribute('data-htype');
        var url = tp==='rk'
          ? 'https://search.travel.rakuten.co.jp/ds/hotellist/Japan?f_query='+encodeURIComponent(nm)
          : 'https://www.jalan.net/uw/uwp1300/uww1301.do?keyword='+encodeURIComponent(nm);
        window.open(url,'_blank');
      };
    });
  }

  function addCurrentSpot(){
    if(!currentSpot) return;
    var key=currentSpot.cat+':'+currentSpot.idx;
    if(!state.added.some(function(a){return a.key===key;})){
      state.added.push({key:key,cat:currentSpot.cat,item:currentSpot.item});
      toast('🌿 「'+currentSpot.item.name+'」をルートに追加しました');
      buildInlineKeep();
    } else {
      toast('すでにルートに追加されています');
    }
  }

  // Google Placesで実データ（写真・営業時間・電話・住所・口コミ）を差し込む
  function enrichSpot(item, cat){
    var fallbackRevs = function(){
      var el=document.getElementById('sdRevs'); if(!el) return;
      document.getElementById('sdRevNote').textContent='（APIキー設定後に実際の口コミが表示されます）';
      el.innerHTML=['巡礼の途中に立ち寄りました。雰囲気が良く、また来たいお店です。','参拝後にぴったり。地元の方にも人気なのが頷けます。','場所もわかりやすく、旅の思い出になりました。'].map(function(t,i){
        return '<div class="wc-rev"><div class="wc-rev-h"><span class="wc-rev-av">'+'参拝旅'[i]+'</span>サンプルさん <span class="wc-rev-st">★★★★☆</span></div><div class="wc-rev-t">'+t+'（サンプル表示）</div></div>';
      }).join('');
      var hs=document.getElementById('sdHours'); if(hs)hs.textContent='—（APIキー設定後に表示）';
      var tl=document.getElementById('sdTel'); if(tl)tl.textContent='—';
      var ad=document.getElementById('sdAddr'); if(ad)ad.textContent='—';
    };
    try{
      if (typeof API_KEY==='undefined' || !API_KEY || typeof google==='undefined' || !google.maps || !google.maps.places){ fallbackRevs(); return; }
      var q = item.name+' '+nearOf(item);
      var svc = new google.maps.places.PlacesService(document.createElement('div'));
      var apply = function(p){
        // 写真
        if (p.photos && p.photos.length){
          var hero=document.getElementById('sdHeroBox');
          if(hero && !hero.querySelector('img')){
            var im=document.createElement('img'); im.src=p.photos[0].getUrl({maxWidth:900});
            im.style.cssText='width:100%;height:100%;object-fit:cover;';
            hero.insertBefore(im, hero.firstChild);
          }
          var he=document.getElementById('sdHeroEmoji'); if(he) he.style.display='none';
          var g=document.getElementById('sdGallery');
          if(g){ g.innerHTML=p.photos.slice(0,6).map(function(ph){ return '<img src="'+ph.getUrl({maxWidth:400})+'" loading="lazy">'; }).join('');
            g.querySelectorAll('img').forEach(function(im2){ im2.onclick=function(){ lb.querySelector('img').src=im2.src.replace('maxwidth=400','maxwidth=1200'); lb.style.display='flex'; }; });
            var note=document.getElementById('sdGalleryNote'); if(note) note.remove();
          }
        }
        // 店舗情報
        var hs=document.getElementById('sdHours');
        if(hs) hs.textContent = (p.opening_hours && p.opening_hours.weekday_text) ? p.opening_hours.weekday_text[0].replace(/^月曜日: /,'月 ')+' ほか' : '—';
        var tl=document.getElementById('sdTel'); if(tl) tl.textContent = p.formatted_phone_number || '—';
        var ad=document.getElementById('sdAddr'); if(ad) ad.textContent = p.formatted_address ? p.formatted_address.replace(/^日本、/,'') : '—';
        // 口コミ
        var el=document.getElementById('sdRevs');
        if(el && p.reviews && p.reviews.length){
          document.getElementById('sdRevNote').textContent='';
          el.innerHTML = p.reviews.slice(0,3).map(function(r){
            var nm=(r.author_name||'匿名').slice(0,10);
            var txt=(r.text||'').slice(0,90)+((r.text||'').length>90?'…':'');
            return '<div class="wc-rev"><div class="wc-rev-h"><span class="wc-rev-av">'+nm.slice(0,1)+'</span>'+nm+'さん <span class="wc-rev-st">'+starTxt(r.rating||4)+'</span></div><div class="wc-rev-t">'+txt+'</div></div>';
          }).join('');
        } else if(el && !el.children.length){ fallbackRevs(); }
      };
      if (placeCache[q]) { apply(placeCache[q]); return; }
      svc.findPlaceFromQuery({query:q, fields:['place_id']}, function(res, status){
        if (status===google.maps.places.PlacesServiceStatus.OK && res && res[0] && res[0].place_id){
          svc.getDetails({placeId:res[0].place_id, fields:['photos','formatted_phone_number','opening_hours','formatted_address','reviews']}, function(p, st2){
            if (st2===google.maps.places.PlacesServiceStatus.OK && p){ placeCache[q]=p; apply(p); }
            else fallbackRevs();
          });
        } else fallbackRevs();
      });
    }catch(e){ fallbackRevs(); }
  }

  // ─────────────────────────────────────────
  // 6. アプリへの組み込み
  // ─────────────────────────────────────────
  // ルート一覧が描画されるたびに、下に提案セクションを付ける
  var origRRC = window.renderRouteCards;
  if (typeof origRRC === 'function') {
    window.renderRouteCards = function(){
      origRRC();
      try { state.route = null; state.added = []; state.items = null; buildInline(); supplementDynamicRoutes(); } catch(e){}
    };
  }
  // 「このルートを選ぶ」＝そのルートをベースにして、おすすめセクションへ移動
  window.selectRoute = function(rid){
    var routes = window._dynamicRoutes || window.AI_ROUTES || [];
    var route = routes.find(function(r){ return r.id===rid; });
    if (!route && window.AI_ROUTES) route = window.AI_ROUTES.find(function(r){ return r.id===rid; });
    if (!route || !route.spots || !route.spots.length) return;
    state.route = route; state.added = []; state.items = null;
    buildInline();
    toast('🌿 「'+route.name+'」をベースにしました。下のおすすめを追加できます');
    var el = document.getElementById('wcInline');
    if (el) el.scrollIntoView({behavior:'smooth', block:'start'});
  };

  // ─────────────────────────────────────────
  // 7. トップ「みんなの最新投稿」を2列フォトグリッドに刷新
  // ─────────────────────────────────────────
  var css4 = document.createElement('style');
  css4.textContent = [
    '.wcp-hd{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px;}',
    '.wcp-tit{font-size:16px;font-weight:800;color:#2F2F2F;font-family:"Shippori Mincho",serif;}',
    '.wcp-sub{font-size:11.5px;color:#6B6B6B;margin-top:2px;}',
    '.wcp-more{font-size:12px;color:#7a5aa8;font-weight:700;cursor:pointer;padding-top:3px;white-space:nowrap;}',
    '.wcp-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;}',
    '.wcp-card{position:relative;aspect-ratio:3/4;border-radius:16px;overflow:hidden;background:linear-gradient(135deg,#8a9ab0,#4a5a70);cursor:pointer;}',
    '.wcp-card img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;}',
    '.wcp-card.noimg img{display:none;}',
    '.wcp-card.noimg::after{content:"⛩";position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:38px;color:#fff;}',
    '.wcp-grad{position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,.62),rgba(0,0,0,0) 55%);}',
    '.wcp-info{position:absolute;left:10px;right:10px;bottom:9px;color:#fff;}',
    '.wcp-userrow{display:flex;align-items:center;gap:7px;}',
    '.wcp-av{width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:#fff;flex:0 0 28px;border:1.5px solid rgba(255,255,255,.7);}',
    '.wcp-un{flex:1;font-size:12px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-shadow:0 1px 4px rgba(0,0,0,.5);}',
    '.wcp-like{font-size:17px;cursor:pointer;line-height:1;}',
    '.wcp-like.on{color:#ff5a5a;}',
    '.wcp-tags{display:flex;gap:8px;margin-top:6px;font-size:10.5px;white-space:nowrap;overflow:hidden;text-shadow:0 1px 4px rgba(0,0,0,.5);}',
    '.wcp-postbtn{display:flex;align-items:center;justify-content:center;gap:6px;width:100%;margin-top:14px;padding:12px 0;border:1.5px solid #7a5aa8;border-radius:12px;background:#fff;color:#7a5aa8;font-size:14px;font-weight:700;cursor:pointer;font-family:"Shippori Mincho",serif;}'
  ].join('\n');
  document.head.appendChild(css4);

  // 神社名からWikipediaの実写真を一括取得（投稿カード用）
  function wikiPhotosFor(names, cb){
    try{
      var url='https://ja.wikipedia.org/w/api.php?action=query&format=json&origin=*&prop=pageimages&piprop=thumbnail&pithumbsize=600&redirects=1&titles='+encodeURIComponent(names.join('|'));
      fetch(url).then(function(r){ return r.json(); }).then(function(j){
        var map={}, redir={};
        ((j.query||{}).redirects||[]).forEach(function(r){ redir[r.from]=r.to; });
        ((j.query||{}).normalized||[]).forEach(function(r){ redir[r.from]=r.to; });
        var pages=(j.query||{}).pages||{};
        Object.keys(pages).forEach(function(k){ if(pages[k].thumbnail) map[pages[k].title]=pages[k].thumbnail.source; });
        var out={}; names.forEach(function(n){ out[n]=map[redir[n]||n]||null; });
        cb(out);
      }).catch(function(){ cb({}); });
    }catch(e){ cb({}); }
  }

  function redesignCommunity(){
    try{
      var box = document.querySelector('.community-box');
      if (!box || typeof USER_POSTS === 'undefined' || !USER_POSTS.length) return;
      var posts = USER_POSTS.slice(0,6);
      var avColors = ['#a83320','#7a5aa8','#c9a84c','#5b7a9a','#7a9a6a','#b07a7a'];
      var h = '<div class="wcp-hd"><div><div class="wcp-tit">🌿 みんなの最新投稿</div><div class="wcp-sub">参拝の記録をシェアしよう</div></div><div class="wcp-more" id="wcpMore">もっと見る ›</div></div>';
      h += '<div class="wcp-grid">';
      posts.forEach(function(p,i){
        var m = String(p.addr||'').match(/^.{2,3}?[都道府県]/);
        var pref = m ? m[0] : (p.area||'');
        h += '<div class="wcp-card" data-pid="'+p.id+'">'
          + '<img src="'+esc(p.img||'')+'" loading="lazy" onerror="this.parentElement.classList.add(\'noimg\')">'
          + '<div class="wcp-grad"></div>'
          + '<div class="wcp-info">'
          + '<div class="wcp-userrow"><span class="wcp-av" style="background:'+avColors[i%avColors.length]+'">'+(p.avatar||String(p.user||'').slice(0,1))+'</span><span class="wcp-un">'+p.user+'</span><span class="wcp-like">♡</span></div>'
          + '<div class="wcp-tags"><span># '+p.shrine+'</span><span># '+pref+'</span></div>'
          + '</div></div>';
      });
      h += '</div>';
      h += '<button class="wcp-postbtn" id="wcpPost">📷 投稿する</button>';
      box.innerHTML = h;
      var more = document.getElementById('wcpMore');
      if (more) more.onclick = function(){ if (typeof openCommunityAll==='function') openCommunityAll(); };
      var pb = document.getElementById('wcpPost');
      if (pb) pb.onclick = function(){ if (typeof openCommunityPost==='function') openCommunityPost(); };
      box.querySelectorAll('.wcp-card').forEach(function(c){
        c.onclick = function(ev){
          var t = ev.target;
          if (t.classList && t.classList.contains('wcp-like')){
            ev.stopPropagation();
            t.textContent = (t.textContent==='♡') ? '♥' : '♡';
            t.classList.toggle('on');
            return;
          }
          if (typeof openPostDetail==='function') openPostDetail(c.getAttribute('data-pid'));
        };
      });
      // 投稿の神社名で本物の写真に差し替え
      var shrineNames = []; posts.forEach(function(p){ if (p.shrine && shrineNames.indexOf(p.shrine)<0) shrineNames.push(p.shrine); });
      wikiPhotosFor(shrineNames, function(map){
        box.querySelectorAll('.wcp-card').forEach(function(c){
          var pid = c.getAttribute('data-pid');
          if (String(pid).charAt(0)==='u') return; // 自分の投稿は自分の写真のまま
          var post = posts.filter(function(p){ return String(p.id)===String(pid); })[0];
          if (!post) return;
          var u = map[post.shrine];
          if (u){
            var im = c.querySelector('img');
            if (im){ im.src = u; c.classList.remove('noimg'); }
          }
        });
      });
    }catch(e){}
  }
  redesignCommunity();

  // ─────────────────────────────────────────
  // 9. 「この条件で検索する」の結果カード：写真を2×2グリッド（みんなの投稿と同サイズ感）
  // ─────────────────────────────────────────
  var css6 = document.createElement('style');
  css6.textContent = '.wgal{display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:.2rem .875rem .7rem;}\n.wgal img{width:100%;aspect-ratio:3/4;object-fit:cover;border-radius:16px;display:block;}';
  document.head.appendChild(css6);
  function upgradeRankingPhotos(){
    try{
      if (typeof photoCache === 'undefined') return;
      document.querySelectorAll('.rcard').forEach(function(card){
        if (card.querySelector('.wgal')) return;
        var nameEl = card.querySelector('.rname');
        if (!nameEl) return;
        var name = nameEl.textContent.trim();
        var ph = photoCache[name];
        if (!ph || !ph.length) return;
        var wrap = card.querySelector('.pgallery');
        if (!wrap) return;
        var strip = card.querySelector('.pstrip');
        var g = document.createElement('div'); g.className='wgal';
        g.innerHTML = ph.slice(0,4).map(function(u){ return '<img src="'+u+'" loading="lazy">'; }).join('');
        wrap.parentElement.insertBefore(g, wrap);
        wrap.style.display='none';
        if (strip) strip.style.display='none';
      });
    }catch(e){}
  }
  // ★2026-09-12 停止★
  // この処理は「大きい写真1枚」を隠して、代わりに小さい縦長写真4枚を入れていた。
  // ところが同じ写真の場所を index.html の galleryHtml()、下の fixRanking()、
  // この処理の3つが奪い合っていて、どれが先に間に合うかで見た目が変わっていた。
  // （写真が取れたカードだけ4枚の小さい写真になり、取れなかったカードは大きい写真1枚。
  //   トップページで「法隆寺だけ小さい4枚」になっていたのがこれ）
  // あとから入れたデザイン統一（下の方にある「写真は1枚だけ」「比率は4:3」）と
  // 真逆のことをしているので、この処理は動かさないことにした。
  // ※ 消さずに残してあるのは、また必要になったときのため。戻すときは所有者を1つに絞ること。
  void upgradeRankingPhotos;
  WABI_TICK(function(){ if (window.wabiSyncInlineCta) window.wabiSyncInlineCta(); }, 400);
  WABI_TICK(function(){ if (window.wabiFillSpotPhotos) window.wabiFillSpotPhotos(); }, 1500);

  // ─────────────────────────────────────────
  // 10. トップ「テーマで巡るベスト10」「季節の行事・ライトアップ」をJSONから表示
  //（管理画面 admin/sections.html で編集 → data/themes.json・events.json をアップで反映）
  // ─────────────────────────────────────────
  // テーマ／季節行事の詳細ビュー（説明文中の画像URLは画像として表示）
  var themePg = document.createElement('div'); themePg.id='wcTheme';
  themePg.style.cssText='position:fixed;inset:0;z-index:262;background:#F8F5EF;display:none;overflow-y:auto;';
  themePg.innerHTML='<div style="max-width:500px;margin:0 auto;padding-bottom:50px" id="wcThemeBody"></div>';
  document.body.appendChild(themePg);
  function openWabiTheme(t, photoUrl){
    var hero = t.hero || photoUrl || '';
    var descHtml = String(t.desc||'').split(/\n/).map(function(line){
      var s = line.trim();
      if (!s) return '';
      if (/^https?:\/\/\S+$/.test(s) && (/\.(png|jpe?g|webp|gif)(\?|$)/i.test(s) || /wikimedia\.org|unsplash\.com|googleusercontent/.test(s))) {
        return '<img src="'+esc(s)+'" loading="lazy" style="width:100%;border-radius:14px;margin:12px 0;display:block">';
      }
      return '<p style="font-size:13.5px;line-height:2;color:#3f382e;margin:10px 0">'+esc(s)+'</p>';
    }).join('');
    var h='<div style="position:relative;width:100%;height:230px;background:'+(hero?('url('+esc(hero)+') center/cover'):'linear-gradient(135deg,#8a9ab0,#4a5a70)')+'">'
      +'<div style="position:absolute;inset:0;background:linear-gradient(to top,rgba(15,10,5,.72),rgba(15,10,5,.05) 60%)"></div>'
      +'<div style="position:absolute;top:14px;left:14px;width:36px;height:36px;border-radius:50%;background:rgba(255,255,255,.94);display:flex;align-items:center;justify-content:center;font-size:19px;color:#a83320;cursor:pointer;z-index:2" id="wcThemeBack">‹</div>'
      +'<div style="position:absolute;left:18px;right:18px;bottom:38px;color:#fff;font-family:\'Shippori Mincho\',serif;font-size:19px;font-weight:800;text-shadow:0 2px 8px rgba(0,0,0,.4)">'+esc(t.title||'')+'</div>'
      +(t.meta?'<div style="position:absolute;left:18px;bottom:12px"><span style="background:rgba(42,32,24,.6);color:#fff;font-size:11px;padding:4px 11px;border-radius:14px">'+esc(t.meta)+'</span></div>':'')
      +'</div>'
      +'<div style="padding:14px 18px 30px">'+(descHtml||'<p style="font-size:12px;color:#a89a80">詳しい内容は準備中です。</p>')+'</div>';
    document.getElementById('wcThemeBody').innerHTML=h;
    themePg.style.display='block'; themePg.scrollTop=0;
    document.getElementById('wcThemeBack').onclick=function(){ themePg.style.display='none'; };
  }

  function renderTopSection(headText, jsonUrl){
    fetch(jsonUrl, {cache:'no-store'}).then(function(r){ return r.ok ? r.json() : null; }).then(function(items){
      if (!items || !items.length) return;
      items = items.filter(function(t){ return t.status !== 'draft'; });
      if (!items.length) return;
      var head = [...document.querySelectorAll('div,h2,h3,span')].find(function(e){
        return e.tagName!=='SCRIPT' && e.childElementCount===0 && (e.textContent||'').trim().indexOf(headText)===0 && !e.closest('#wcPost,#wcPrev,#wcSpot,#wcTheme');
      });
      if (!head) return;
      var sec = head;
      for (var i=0;i<6 && sec.parentElement;i++){
        sec = sec.parentElement;
        if (sec.querySelector('.route-card') || sec.innerText.length>120) break;
      }
      var row = sec.querySelector('.route-scroll, .route-cards, [class*=scroll]');
      if (!row){
        row = [...sec.querySelectorAll('div')].find(function(d){ return d.children.length>=2 && d.scrollWidth>d.clientWidth+40; });
      }
      if (!row){
        row = document.createElement('div');
        row.style.cssText='display:flex;gap:10px;overflow-x:auto;padding:10px 0 6px;';
        head.parentElement.insertAdjacentElement('afterend', row);
      }
      row.innerHTML = items.map(function(t,i){
        var bg = t.hero ? 'url('+esc(t.hero)+') center/cover' : 'linear-gradient(135deg,#8a9ab0,#4a5a70)';
        return '<div class="route-card" data-wtop="'+i+'" style="flex:0 0 165px;cursor:pointer">'
          + '<div class="route-card-img-wrap"><div class="route-card-img wtop-img" data-shrine-w="'+esc((!t.hero&&t.shrine)?t.shrine:'')+'" style="display:flex;align-items:center;justify-content:center;font-size:30px;background:'+bg+';color:#fff">'+(t.hero?'':'⛩')+'</div></div>'
          + '<div class="route-card-body"><div class="route-card-title">'+esc(t.title||'')+'</div>'
          + '<div class="route-card-desc">'+esc(String(t.desc||'').split(/\n/)[0].slice(0,28))+'</div>'
          + '<div class="route-card-meta">'+esc(t.meta||'')+'</div></div></div>';
      }).join('');
      var wikiMapCache = {};
      row.querySelectorAll('[data-wtop]').forEach(function(c){
        var t = items[+c.getAttribute('data-wtop')];
        c.onclick = function(){
          var img = c.querySelector('.wtop-img');
          var bgu = (img && img.style.background.match(/url\("?([^)"]+)"?\)/)||[])[1];
          openWabiTheme(t, bgu);
        };
      });
      var names = items.filter(function(t){ return !t.hero && t.shrine; }).map(function(t){ return t.shrine; });
      if (names.length) wikiPhotosFor([...new Set(names)], function(map){
        row.querySelectorAll('.wtop-img').forEach(function(el){
          var u = map[el.getAttribute('data-shrine-w')];
          if (u){ el.style.background='url('+u+') center/cover'; el.textContent=''; }
        });
      });
    }).catch(function(){});
  }

  // ─────────────────────────────────────────
  // 11. トップの見た目微調整（おすすめ巡拝ルート2枚ぴったり／ツアー特集を大きく）
  // ─────────────────────────────────────────
  var css7 = document.createElement('style');
  css7.textContent = [
    '.ai-preview-scroll{scroll-snap-type:x mandatory;}',
    '.ai-preview-scroll .apc{scroll-snap-align:start;}',
    '.tour-card{border-radius:14px !important;}',
    '.tour-img{flex:0 0 152px !important;width:152px !important;min-height:112px;}',
    '.tour-body{padding:.85rem .95rem !important;}',
    '.tour-title{font-size:14.5px !important;}',
    '.tour-route{font-size:11.5px !important;}',
    '.tour-price{font-size:13px !important;}'
  ].join('\n');
  document.head.appendChild(css7);

  // おすすめ巡拝ルート：どの画面幅でも「ぴったり2枚」表示（余白を実測して自動調整）
  function fixApcRow(){
    try{
      var sc = document.querySelector('.ai-preview-scroll');
      if (!sc) return;
      var P = parseFloat(getComputedStyle(sc).paddingLeft) || 20;
      sc.style.gap = P + 'px';
      var card = (sc.clientWidth - P - P) / 2; // gap=P・右余白は詰めて2枚ぴったり
      sc.querySelectorAll('.apc').forEach(function(c){ c.style.flex = '0 0 ' + card + 'px'; c.style.width = card + 'px'; });
    }catch(e){}
  }
  fixApcRow();
  setTimeout(fixApcRow, 800);
  window.addEventListener('resize', fixApcRow);

  // ─────────────────────────────────────────
  // 12. 季節の行事・ツアー特集のダミー画像を、実在寺社のWikipedia写真に差し替え
  // ─────────────────────────────────────────
  var CARD_SHRINE = {
    // 季節の行事（タイトルの一部 → 神社名）
    '明治神宮 夏越':'明治神宮', '鞍馬寺 竹伐':'鞍馬寺', '貴船神社':'貴船神社',
    '住吉大社 御田植':'住吉大社', '熱田神宮 月次':'熱田神宮',
    // ツアー特集
    '伊勢神宮':'伊勢神宮内宮', '出雲大社':'出雲大社', '高野山':'金剛峯寺'
  };
  function shrineForText(txt){
    for (var key in CARD_SHRINE){ if (txt.indexOf(key)>=0) return CARD_SHRINE[key]; }
    return null;
  }
  function fixCardImages(){
    try{
      var jobs = [];
      document.querySelectorAll('.season-card').forEach(function(card){
        var t = card.querySelector('.season-title'); var img = card.querySelector('.season-img img');
        if (t && img && !img.getAttribute('data-wabi')){ var s = shrineForText(t.textContent||''); if (s){ jobs.push({img:img, shrine:s}); img.setAttribute('data-wabi','1'); } }
      });
      document.querySelectorAll('.tour-card').forEach(function(card){
        var t = card.querySelector('.tour-title'); var img = card.querySelector('.tour-img img');
        if (t && img && !img.getAttribute('data-wabi')){ var s = shrineForText(t.textContent||''); if (s){ jobs.push({img:img, shrine:s}); img.setAttribute('data-wabi','1'); } }
      });
      if (!jobs.length) return;
      var names = [];
      jobs.forEach(function(j){ if (names.indexOf(j.shrine)<0) names.push(j.shrine); });
      wikiPhotosFor(names, function(map){
        jobs.forEach(function(j){
          var u = map[j.shrine];
          if (u){ j.img.src = u; j.img.style.display=''; }
        });
      });
    }catch(e){}
  }
  fixCardImages();
  WABI_TICK(fixCardImages, 1500);

  // ─────────────────────────────────────────
  // 13. Google地図SDKの自動起動＋おすすめ神社ランキングの写真復活・2枚ぴったり
  // ─────────────────────────────────────────
  window.__wcSDKq = window.__wcSDKq || [];
  function ensureGoogle(cb){
    if (typeof google!=='undefined' && google.maps && google.maps.places){ if(cb)cb(); return; }
    if (typeof API_KEY==='undefined' || !API_KEY) return;
    if (cb) window.__wcSDKq.push(cb);
    if (window.__wcSDKloading) return;
    window.__wcSDKloading = true;
    window.__wcSDKcb = function(){ (window.__wcSDKq||[]).forEach(function(f){ try{f();}catch(e){} }); window.__wcSDKq=[]; };
    var s = document.createElement('script');
    s.src = 'https://maps.googleapis.com/maps/api/js?key='+API_KEY+'&libraries=places&callback=__wcSDKcb';
    s.onerror = function(){ window.__wcSDKloading=false; };
    document.head.appendChild(s);
  }
  ensureGoogle(function(){ if (typeof filter==='function') filter(); }); // 起動時にSDKを用意

  // おすすめ神社ランキング：カードを2枚ぴったり＆写真をPlacesで表示
  function fixRanking(){
    try{
      var cards = document.querySelectorAll('.rcard');
      if (!cards.length) return;
      // 横スクロール → 横2列×縦スクロールのグリッドに（クラスで!important適用）
      var sc = cards[0].parentElement;
      sc.classList.add('wc-rankgrid');
      // 写真の取得（Places）
      ensureGoogle(function(){
        var svc = new google.maps.places.PlacesService(document.createElement('div'));
        cards.forEach(function(c){
          if (c.getAttribute('data-wcphoto')) return;
          var nm = c.querySelector('.rname'); var pg = c.querySelector('.pgallery');
          if (!nm || !pg) return;
          c.setAttribute('data-wcphoto','1');
          var name = nm.textContent.trim();
          svc.findPlaceFromQuery({query:name+' 神社', fields:['photos']}, function(res, st){
            if (st===google.maps.places.PlacesServiceStatus.OK && res && res[0] && res[0].photos && res[0].photos.length){
              var ph = res[0].photos;
              var urls = ph.slice(0,4).map(function(p){ return p.getUrl({maxWidth:500}); });
              var main = urls[0];
              var strip = urls.slice(0,4);
              while (strip.length<4) strip.push(main);
              pg.innerHTML = '<div class="pgallery-main"><img src="'+main+'" loading="lazy"><div class="photo-count">📷 '+urls.length+'枚</div></div>';
              // サムネイルは元からある rcard 直下の .pstrip に入れる（空白の二重化を防ぐ）
              var stripEl = c.querySelector(':scope > .pstrip') || pg.parentElement.querySelector('.pstrip');
              if (stripEl) stripEl.innerHTML = strip.map(function(u){ return '<div class="pstrip-item"><img src="'+u+'" loading="lazy"></div>'; }).join('');
            } else {
              c.removeAttribute('data-wcphoto'); // 取得失敗は次回リトライ
            }
          });
        });
      });
    }catch(e){}
  }
  var cssRank = document.createElement('style');
  cssRank.textContent = [
    // ランキングを横スクロール→横2列×縦スクロールのグリッドに強制（index.html側の!importantに勝つ）
    '.wc-rankgrid{display:grid !important;grid-template-columns:1fr 1fr !important;gap:12px !important;overflow-x:visible !important;overflow-y:visible !important;flex-wrap:wrap !important;scroll-snap-type:none !important;}',
    '.wc-rankgrid>.rcard{flex:none !important;width:auto !important;min-width:0 !important;align-self:start !important;scroll-snap-align:none !important;}',
    // 全カード統一（1位も含め同じ上品な枠＋やわらかい影。順位は左上バッジで表現）
    '.rcard, .rcard.r1{border:1px solid #ece4d3 !important;box-shadow:0 6px 18px -10px rgba(90,70,40,.35) !important;height:auto !important;align-self:stretch !important;background:#fff;}',
    // ヘッダー高を固定して、住所の行数に関わらず画像の開始位置を揃える
    '.rcard .rhd{min-height:130px !important;box-sizing:border-box;}',
    // 写真エリア
    '.rcard .pgallery{height:auto !important;}',
    '.rcard .pgallery-main{aspect-ratio:16/11 !important;height:auto !important;overflow:hidden;position:relative;border-radius:10px;}',
    '.rcard .pgallery-main img{width:100%;height:100%;object-fit:cover;display:block;}',
    '.rcard .pstrip{display:grid !important;grid-template-columns:repeat(4,1fr);gap:4px;margin-top:4px;height:auto !important;}',
    '.rcard .pstrip-item{aspect-ratio:1;overflow:hidden;border-radius:6px;}',
    '.rcard .pstrip-item img{width:100%;height:100%;object-fit:cover;display:block;}',
    // 横スクロールのドット目印
    '.wc-rankdots{display:flex;justify-content:center;gap:6px;margin:10px 0 2px;}',
    '.wc-rankdots i{width:7px;height:7px;border-radius:50%;background:#dcd3bf;transition:.2s;}',
    '.wc-rankdots i.on{background:#a83320;width:18px;border-radius:4px;}'
  ].join('\n');
  document.head.appendChild(cssRank);

  // 横スクロールのドット目印を設置＆連動
  function fixRankDots(){
    try{
      var first = document.querySelector('.rcard');
      if (!first) return;
      var sc = first.parentElement;
      var cards = sc.querySelectorAll('.rcard');
      if (!cards.length) return;
      var pages = Math.ceil(cards.length/2);
      var ex = sc.parentElement.querySelector('.wc-rankdots'); if (ex) ex.remove();
      return; // 縦2列グリッドではスクロール目印は不要
      var dots = sc.parentElement.querySelector('.wc-rankdots');
      if (!dots){
        dots = document.createElement('div'); dots.className='wc-rankdots';
        for (var i=0;i<pages;i++){ dots.innerHTML += '<i'+(i===0?' class="on"':'')+'></i>'; }
        sc.parentElement.insertBefore(dots, sc.nextSibling);
        sc.addEventListener('scroll', function(){
          var per = cards[0].getBoundingClientRect().width + 12;
          var idx = Math.round(sc.scrollLeft/(per*2));
          dots.querySelectorAll('i').forEach(function(d,i){ d.classList.toggle('on', i===idx); });
        });
      }
    }catch(e){}
  }
  var _origFixRanking = fixRanking;
  fixRanking = function(){ _origFixRanking(); fixRankDots(); };

  fixRanking();
  WABI_TICK(fixRanking, 2000);
  window.addEventListener('resize', fixRanking);

  // おすすめ巡拝ルート：横スクロール → 2列グリッド（テーマで巡るベスト10と同じ一覧配置）
  var cssRouteGrid = document.createElement('style');
  cssRouteGrid.textContent = [
    '.ai-preview-scroll{display:grid !important;grid-template-columns:1fr 1fr !important;gap:14px !important;overflow-x:visible !important;padding:0 16px 8px !important;scroll-snap-type:none !important;}',
    '.ai-preview-scroll .apc{flex:none !important;width:auto !important;scroll-snap-align:none !important;}'
  ].join('\n');
  document.head.appendChild(cssRouteGrid);

  // ─────────────────────────────────────────
  // 14. 参拝のお供：楽天アフィリエイト商品（5点）を表示
  // ─────────────────────────────────────────
  var WABI_OSUPPLY = [
    { name:'秩父三十四ヶ所札所めぐり 観音霊場巡礼ルートガイド 改訂版', price:'¥1,848', tag:'巡礼ガイド',
      img:'https://hbb.afl.rakuten.co.jp/hgb/55e62409.82eb9d0a.55e6240a.758d8692/?me_id=1213310&item_id=20543940&pc=https%3A%2F%2Fthumbnail.image.rakuten.co.jp%2F%400_mall%2Fbook%2Fcabinet%2F5857%2F9784780425857_1_4.jpg%3F_ex%3D240x240&s=240x240&t=picttext',
      link:'https://hb.afl.rakuten.co.jp/ichiba/55e62409.82eb9d0a.55e6240a.758d8692/?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fbook%2F16988967%2F%3Fscid%3Daf_pc_bbtn&link_type=picttext&ut=eyJwYWdlIjoiaXRlbSIsInR5cGUiOiJwaWN0dGV4dCIsInNpemUiOiIyNDB4MjQwIiwibmFtIjoxLCJuYW1wIjoicmlnaHQiLCJjb20iOjEsImNvbXAiOiJkb3duIiwicHJpY2UiOjEsImJvciI6MSwiY29sIjoxLCJiYnRuIjoxLCJwcm9kIjowLCJhbXAiOmZhbHNlfQ==' },
    { name:'御朱印帳 大判 金剛力士像 箔押し 金箔 蛇腹', price:'¥2,090', tag:'御朱印帳',
      img:'https://hbb.afl.rakuten.co.jp/hgb/55e6354a.261418e4.55e6354b.281f8a3b/?me_id=1344822&item_id=10000097&pc=https%3A%2F%2Fthumbnail.image.rakuten.co.jp%2F%400_mall%2Fnippoh-bb%2Fcabinet%2Fhakuoshi%2Fimgrc0107619189.jpg%3F_ex%3D240x240&s=240x240&t=picttext',
      link:'https://hb.afl.rakuten.co.jp/ichiba/55e6354a.261418e4.55e6354b.281f8a3b/?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fnippoh-bb%2F8-001%2F%3Fscid%3Daf_pc_bbtn&link_type=picttext&ut=eyJwYWdlIjoiaXRlbSIsInR5cGUiOiJwaWN0dGV4dCIsInNpemUiOiIyNDB4MjQwIiwibmFtIjoxLCJuYW1wIjoicmlnaHQiLCJjb20iOjEsImNvbXAiOiJkb3duIiwicHJpY2UiOjEsImJvciI6MSwiY29sIjoxLCJiYnRuIjoxLCJwcm9kIjowLCJhbXAiOmZhbHNlfQ==' },
    { name:'御朱印帳 大判 翡翠花吹雪 金襴 京都ちせん', price:'¥2,480', tag:'御朱印帳',
      img:'https://hbb.afl.rakuten.co.jp/hgb/55e637eb.50260a1f.55e637ec.b9335393/?me_id=1356718&item_id=10000067&pc=https%3A%2F%2Fthumbnail.image.rakuten.co.jp%2F%400_mall%2Fkyoto-chisen%2Fcabinet%2Fcompass1649313958.jpg%3F_ex%3D240x240&s=240x240&t=picttext',
      link:'https://hb.afl.rakuten.co.jp/ichiba/55e637eb.50260a1f.55e637ec.b9335393/?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fkyoto-chisen%2F10000067%2F%3Fscid%3Daf_pc_bbtn&link_type=picttext&ut=eyJwYWdlIjoiaXRlbSIsInR5cGUiOiJwaWN0dGV4dCIsInNpemUiOiIyNDB4MjQwIiwibmFtIjoxLCJuYW1wIjoicmlnaHQiLCJjb20iOjEsImNvbXAiOiJkb3duIiwicHJpY2UiOjEsImJvciI6MSwiY29sIjoxLCJiYnRuIjoxLCJwcm9kIjowLCJhbXAiOmZhbHNlfQ==' },
    { name:'トラベルポーチ 4in1 コスメポーチ セット 吊り下げ', price:'¥1,630', tag:'旅行グッズ',
      img:'https://hbb.afl.rakuten.co.jp/hgb/55e6427a.c24ca2fa.55e6427b.72a6c9f7/?me_id=1405779&item_id=10000142&pc=https%3A%2F%2Fthumbnail.image.rakuten.co.jp%2F%400_mall%2Fbestselectmart%2Fcabinet%2Ftrip%2Ftrip_000%2Ftrip-0003_00.jpg%3F_ex%3D240x240&s=240x240&t=picttext',
      link:'https://hb.afl.rakuten.co.jp/ichiba/55e6427a.c24ca2fa.55e6427b.72a6c9f7/?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fbestselectmart%2Fse-travel-0003%2F%3Fscid%3Daf_pc_bbtn&link_type=picttext&ut=eyJwYWdlIjoiaXRlbSIsInR5cGUiOiJwaWN0dGV4dCIsInNpemUiOiIyNDB4MjQwIiwibmFtIjoxLCJuYW1wIjoicmlnaHQiLCJjb20iOjEsImNvbXAiOiJkb3duIiwicHJpY2UiOjEsImJvciI6MSwiY29sIjoxLCJiYnRuIjoxLCJwcm9kIjowLCJhbXAiOmZhbHNlfQ==' },
    { name:'旅行用圧縮袋 2点セット YKK 収納ポーチ', price:'¥3,490', tag:'旅行グッズ',
      img:'https://hbb.afl.rakuten.co.jp/hgb/55e6442a.17a8cbc9.55e6442b.7e61cac6/?me_id=1379780&item_id=10000075&pc=https%3A%2F%2Fthumbnail.image.rakuten.co.jp%2F%400_mall%2Fichifujiec%2Fcabinet%2Fnsana018%2Fnk039%2Fnk03920230930%2Fnsana018set2b.jpg%3F_ex%3D240x240&s=240x240&t=picttext',
      link:'https://hb.afl.rakuten.co.jp/ichiba/55e6442a.17a8cbc9.55e6442b.7e61cac6/?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fichifujiec%2Fnsana018set%2F%3Fscid%3Daf_pc_bbtn&link_type=picttext&ut=eyJwYWdlIjoiaXRlbSIsInR5cGUiOiJwaWN0dGV4dCIsInNpemUiOiIyNDB4MjQwIiwibmFtIjoxLCJuYW1wIjoicmlnaHQiLCJjb20iOjEsImNvbXAiOiJkb3duIiwicHJpY2UiOjEsImJvciI6MSwiY29sIjoxLCJiYnRuIjoxLCJwcm9kIjowLCJhbXAiOmZhbHNlfQ==' }
  ];
  var cssOsupply = document.createElement('style');
  cssOsupply.textContent = [
    '#osupplyList .osupply-card{position:relative;}',
    '.wabi-rk-btn{display:block;text-align:center;margin-top:6px;background:#bf0000;color:#fff !important;font-size:11px;font-weight:700;line-height:1;padding:7px 0;border-radius:14px;text-decoration:none;}',
    '.wabi-pr{position:absolute;top:6px;right:6px;background:rgba(42,32,24,.6);color:#fff;font-size:8.5px;padding:2px 7px;border-radius:9px;z-index:2;}'
  ].join('\n');
  document.head.appendChild(cssOsupply);
  function osupplyCardHtml(p){
    return '<div class="osupply-card">'
      + '<span class="wabi-pr">PR</span>'
      + '<a href="'+p.link+'" target="_blank" rel="nofollow sponsored noopener" style="text-decoration:none;color:inherit;display:block">'
      + '<div class="osupply-img"><img src="'+p.img+'" alt="" loading="lazy" onerror="this.style.display=\'none\'"><div class="osupply-img-rank">'+p.tag+'</div></div>'
      + '<div class="osupply-body"><div class="osupply-title">'+p.name+'</div><div class="osupply-price">'+p.price+'</div>'
      + '<span class="wabi-rk-btn">楽天で見る</span></div></a></div>';
  }
  function fixOsupply(){
    try{
      var html = WABI_OSUPPLY.map(osupplyCardHtml).join('');
      var list = document.getElementById('osupplyList');
      if (list && !list.getAttribute('data-wabi')){ list.setAttribute('data-wabi','1'); list.innerHTML = html; }
      var full = document.getElementById('osupplyGridFull');
      if (full && !full.getAttribute('data-wabi')){ full.setAttribute('data-wabi','1'); full.className='osupply-list'; full.innerHTML = html; }
    }catch(e){}
  }
  fixOsupply();
  WABI_TICK(fixOsupply, 2000);

  // ─────────────────────────────────────────
  // 15. ツアー特集：楽天トラベル観光体験アフィリエイト（4件）
  // ─────────────────────────────────────────
  var WABI_TOURS = [
    { name:'嵐電1日フリーきっぷ 御朱印帳付きプラン', area:'京都・嵐電', badge:'御朱印付き', partner:'楽天トラベル',
      shrine:'車折神社', link:'https://a.r10.to/hFISmH', img:'https://images.unsplash.com/photo-1752898514963-e36929a03859?w=600&q=80&auto=format&fit=crop' },
    { name:'京都魔界案内ミステリーツアー 陰陽師編', area:'京都・体験', badge:'人気', partner:'楽天トラベル',
      shrine:'晴明神社', link:'https://a.r10.to/hgv8Ka', img:'https://images.unsplash.com/photo-1760333972888-852dd0072281?w=600&q=80&auto=format&fit=crop' },
    { name:'奈良 吉野 櫻本坊 修行体験＋お抹茶＋お菓子', area:'奈良・吉野', badge:'世界遺産', partner:'楽天トラベル',
      shrine:'金峯山寺', link:'https://a.r10.to/h5KHp7', img:'https://images.unsplash.com/photo-1763120339579-d660fbebaa16?w=600&q=80&auto=format&fit=crop' },
    { name:'犬鳴山 七宝瀧寺 滝行＋写経体験', area:'大阪・泉佐野', badge:'修験の聖地', partner:'楽天トラベル',
      shrine:'七宝瀧寺', link:'https://a.r10.to/h8XIiv', img:'https://images.unsplash.com/photo-1759339645664-9b9c15d70b56?w=600&q=80&auto=format&fit=crop' }
  ];
  function tourCardHtml(t){
    return '<div class="tour-card" style="position:relative">'
      + '<span class="wabi-pr">PR</span>'
      + '<a href="'+t.link+'" target="_blank" rel="nofollow sponsored noopener" style="display:flex;text-decoration:none;color:inherit;width:100%">'
      + '<div class="tour-img" data-tourshrine="'+t.shrine+'" style="width:152px !important;height:112px !important;flex:0 0 152px !important;background:url(\''+t.img+'\') center/cover !important;">'+'<div class="tour-img-badge">'+t.badge+'</div></div>'
      + '<div class="tour-body"><div><div class="tour-title">'+t.name+'</div><div class="tour-route">'+t.area+'</div></div>'
      + '<div class="tour-bottom"><span class="wabi-rk-btn" style="padding:6px 14px">楽天トラベルで見る</span>'
      + '<span style="font-size:9px;color:#a89a80;margin-left:6px">'+t.partner+'</span></div></div></a></div>';
  }
  function fixTours(){
    try{
      var html = WABI_TOURS.map(tourCardHtml).join('');
      var changed = false;
      var t1 = document.getElementById('tourList');
      if (t1 && !t1.getAttribute('data-wabi')){ t1.setAttribute('data-wabi','1'); t1.innerHTML = html; changed=true; }
      var t2 = document.getElementById('tourListFull');
      if (t2 && !t2.getAttribute('data-wabi')){ t2.setAttribute('data-wabi','1'); t2.innerHTML = html; changed=true; }
      if (changed){
        var shrines = WABI_TOURS.map(function(t){ return t.shrine; });
        wikiPhotosFor(shrines, function(map){
          document.querySelectorAll('.tour-img[data-tourshrine]').forEach(function(el){
            var u = map[el.getAttribute('data-tourshrine')];
            if (u){ el.style.background = 'url('+u+') center/cover'; }
          });
        });
      }
    }catch(e){}
  }
  fixTours();
  WABI_TICK(fixTours, 2000);

  // ─── 神社詳細：メイン画像下の2枚（別アングル写真＋御朱印）を本文幅に合わせて均等配置 ───
  var cssSdDuo = document.createElement('style');
  cssSdDuo.textContent = '#wabiSdDuo{margin-left:auto !important;margin-right:auto !important;max-width:500px !important;}';
  document.head.appendChild(cssSdDuo);

  // ─── 「もっと見る」各ページをツアー特集と同じ横型カードデザインに統一 ───
  // 準備中の項目タップ時のフィードバック
  window.wabiSoon = function(){
    if (typeof showToast==='function') showToast('準備中です'); else alert('準備中です');
  };
  // ツアー特集と同じ tour-card 横型カードを生成する共通関数
  function wabiTourCard(o){
    var badge = o.badge ? '<div class="tour-img-badge">'+o.badge+'</div>' : '';
    var pr    = o.pr ? '<span class="wabi-pr">PR</span>' : '';
    var bg    = o.img ? ' style="background:url('+o.img+') center/cover"' : '';
    if (o.link){
      var partnerL = o.partner ? '<span style="font-size:9px;color:#a89a80;margin-left:6px">'+o.partner+'</span>' : '';
      return '<div class="tour-card" style="position:relative">'+pr
        + '<a href="'+o.link+'" target="_blank" rel="nofollow sponsored noopener" style="display:flex;text-decoration:none;color:inherit;width:100%">'
        + '<div class="tour-img"'+bg+'>'+badge+'</div>'
        + '<div class="tour-body"><div><div class="tour-title">'+o.title+'</div><div class="tour-route">'+o.sub+'</div></div>'
        + '<div class="tour-bottom"><span class="wabi-rk-btn" style="padding:6px 14px">'+(o.btn||'見る')+'</span>'+partnerL+'</div>'
        + '</div></a></div>';
    }
    var partnerR = o.partner ? '<span class="tour-partner">'+o.partner+'</span>' : '';
    var onc = o.onclick ? ' onclick="'+o.onclick+'"' : '';
    return '<div class="tour-card" style="position:relative"'+onc+'>'+pr
      + '<div class="tour-img"'+bg+'>'+badge+'</div>'
      + '<div class="tour-body"><div><div class="tour-title">'+o.title+'</div><div class="tour-route">'+o.sub+'</div></div>'
      + '<div class="tour-bottom">'+(o.metaLeft||'<span></span>')+partnerR+'</div>'
      + '</div></div>';
  }

  // ① 参拝のお供（楽天アフィリエイト・実リンク）
  window.openOsupplyList = function(){
    try{
      var el = document.getElementById('osupplyGridFull');
      if (el){
        el.style.cssText=''; el.className='tour-list'; el.setAttribute('data-wabi','1');
        el.innerHTML = WABI_OSUPPLY.map(function(p){
          return wabiTourCard({ img:p.img, badge:p.tag, title:p.name, sub:p.price, link:p.link, btn:'楽天で見る', partner:'楽天市場', pr:true });
        }).join('');
      }
    }catch(e){}
    if (typeof openOverlay==='function') openOverlay('pgOsupplyList');
  };

  // ② 季節の行事・ライトアップ
  window.openSeasonList = function(){
    try{
      var el = document.getElementById('seasonListFull');
      if (el && typeof SEASONS!=='undefined'){
        el.style.cssText=''; el.className='tour-list';
        el.innerHTML = SEASONS.map(function(s){
          return wabiTourCard({ img:s.img, badge:s.tag, title:s.title, sub:s.area+' ・ '+s.period, partner:'開催情報', onclick:'wabiSoon()' });
        }).join('');
      }
    }catch(e){}
    if (typeof openOverlay==='function') openOverlay('pgSeasonList');
  };

  // ④ 御朱印グッズ
  window.openEcList = function(){
    try{
      var el = document.getElementById('ecGridFull');
      if (el && typeof EC_ITEMS!=='undefined'){
        el.style.cssText=''; el.className='tour-list';
        el.innerHTML = EC_ITEMS.map(function(e){
          return wabiTourCard({ img:e.img, badge:e.tag||'', title:e.title, sub:'御朱印グッズ',
            metaLeft:'<span class="tour-price"><b>¥'+e.price+'</b></span>', onclick:'wabiSoon()' });
        }).join('');
      }
    }catch(e){}
    if (typeof openOverlay==='function') openOverlay('pgEcList');
  };

  // ⑥ 終活・供養のご相談
  window.openShukatsuList = function(){
    try{
      var el = document.getElementById('shukatsuListFull');
      if (el && typeof SHUKATSU!=='undefined'){
        el.style.cssText=''; el.className='tour-list';
        el.innerHTML = SHUKATSU.map(function(s){
          return wabiTourCard({ img:s.img, badge:s.cat, title:s.title, sub:s.cta, partner:'無料資料請求', onclick:'wabiSoon()' });
        }).join('');
      }
    }catch(e){}
    if (typeof openOverlay==='function') openOverlay('pgShukatsuList');
  };

  window.openTourList = function(){
    try{
      var full = document.getElementById('tourListFull');
      if (full){
        full.setAttribute('data-wabi','1');
        full.innerHTML = WABI_TOURS.map(tourCardHtml).join('');
        var shrines = WABI_TOURS.map(function(t){ return t.shrine; });
        wikiPhotosFor(shrines, function(map){
          document.querySelectorAll('#tourListFull .tour-img[data-tourshrine]').forEach(function(el){
            var u = map[el.getAttribute('data-tourshrine')];
            if (u){ el.style.background = 'url('+u+') center/cover'; }
          });
        });
      }
    }catch(e){}
    if (typeof openOverlay==='function') openOverlay('pgTourList');
  };



  renderTopSection('テーマで巡るベスト', 'data/themes.json');
  renderTopSection('季節の行事', 'data/events.json');

  // ─────────────────────────────────────────
  // 8. 新しい投稿画面（Instagram×Threads風）
  // ─────────────────────────────────────────
  var css5 = document.createElement('style');
  css5.textContent = [
    '#wcPost{position:fixed;inset:0;z-index:280;background:#fff;display:none;overflow-y:auto;-webkit-overflow-scrolling:touch;}',
    '.wpo-inner{max-width:500px;margin:0 auto;padding:0 16px 40px;}',
    '.wpo-hd{position:sticky;top:0;z-index:5;background:#fff;display:flex;align-items:center;justify-content:space-between;padding:14px 0;border-bottom:1px solid #f0ede6;margin:0 -16px;padding-left:16px;padding-right:16px;}',
    '.wpo-back{font-size:22px;color:#2F2F2F;cursor:pointer;line-height:1;}',
    '.wpo-tit{font-size:15px;font-weight:800;color:#2F2F2F;}',
    '.wpo-prev{font-size:13px;color:#7a5aa8;font-weight:700;cursor:pointer;}',
    '.wpo-user{display:flex;align-items:center;gap:10px;padding:16px 0 4px;}',
    '.wpo-av{width:40px;height:40px;border-radius:50%;background:#c9a84c;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;}',
    '.wpo-un{font-size:14px;font-weight:700;color:#2F2F2F;}',
    '.wpo-sec{background:#fff;border:1px solid #efe9dd;border-radius:18px;padding:14px;margin-top:14px;box-shadow:0 2px 10px rgba(0,0,0,.03);}',
    '.wpo-label{font-size:13px;font-weight:800;color:#2F2F2F;margin-bottom:10px;}',
    '.wpo-label .req{color:#d7453b;}',
    '.wpo-label .ok{font-size:10px;color:#2e7d4f;background:#e6f4ec;border-radius:10px;padding:2px 8px;margin-left:6px;font-weight:700;}',
    '.wpo-photos{display:flex;gap:10px;overflow-x:auto;}',
    '.wpo-ph{position:relative;width:118px;height:118px;border-radius:14px;overflow:hidden;flex:0 0 118px;}',
    '.wpo-ph img{width:100%;height:100%;object-fit:cover;}',
    '.wpo-ph .x{position:absolute;top:6px;right:6px;width:22px;height:22px;border-radius:50%;background:rgba(255,255,255,.95);display:flex;align-items:center;justify-content:center;font-size:12px;cursor:pointer;box-shadow:0 1px 4px rgba(0,0,0,.25);}',
    '.wpo-ph .cover{position:absolute;left:6px;bottom:6px;background:rgba(122,90,168,.92);color:#fff;font-size:8.5px;padding:2px 7px;border-radius:8px;}',
    '.wpo-add{width:118px;height:118px;border-radius:14px;border:2px dashed #ddd5c4;background:#fbfaf6;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;color:#8a7a5c;font-size:11px;cursor:pointer;flex:0 0 118px;}',
    '.wpo-add span{font-size:22px;}',
    '.wpo-input{width:100%;border:1.5px solid #e5ddca;border-radius:14px;padding:13px 38px 13px 13px;font-size:16px;color:#2F2F2F;background:#fff;box-sizing:border-box;font-family:inherit;}',
    '.wpo-input:focus{outline:none;border-color:#7a5aa8;}',
    '.wpo-clear{position:absolute;right:12px;top:50%;transform:translateY(-50%);width:20px;height:20px;border-radius:50%;background:#d8d2c4;color:#fff;display:none;align-items:center;justify-content:center;font-size:11px;cursor:pointer;}',
    '.wpo-select{width:100%;border:1.5px solid #e5ddca;border-radius:14px;padding:13px;font-size:16px;color:#2F2F2F;background:#fff;appearance:none;box-sizing:border-box;font-family:inherit;}',
    '.wpo-tags{display:flex;flex-wrap:wrap;gap:8px;}',
    '.wpo-tag{font-size:12px;color:#7a5aa8;background:#f1ecf8;border-radius:14px;padding:6px 12px;cursor:pointer;border:1.5px solid transparent;user-select:none;}',
    '.wpo-tag.off{color:#b3aca0;background:#f5f3ee;text-decoration:line-through;}',
    '.wpo-loc{display:flex;align-items:center;gap:10px;border:1.5px solid #e5ddca;border-radius:14px;padding:12px;}',
    '.wpo-loc-pin{font-size:20px;color:#7a5aa8;}',
    '.wpo-loc-nm{font-size:13.5px;font-weight:800;color:#2F2F2F;}',
    '.wpo-loc-ad{font-size:11px;color:#6B6B6B;margin-top:1px;}',
    '.wpo-ta{width:100%;min-height:120px;border:1.5px solid #e5ddca;border-radius:14px;padding:13px;font-size:16px;color:#2F2F2F;box-sizing:border-box;resize:vertical;font-family:inherit;line-height:1.7;}',
    '.wpo-ta:focus{outline:none;border-color:#7a5aa8;}',
    '.wpo-cnt{text-align:right;font-size:11px;color:#a89a80;margin-top:5px;}',
    '.wpo-submit{display:block;width:100%;height:56px;border:none;border-radius:16px;background:linear-gradient(135deg,#7a5aa8,#5a4470);color:#fff;font-size:16px;font-weight:800;cursor:pointer;margin-top:20px;box-shadow:0 8px 20px -6px rgba(90,68,112,.45);}',
    '.wpo-submit:disabled{background:#d8d2c4;box-shadow:none;}',
    '.wpo-note{font-size:10px;color:#a89a80;margin-top:8px;text-align:center;}'
  ].join('\n');
  document.head.appendChild(css5);

  var PREFS = ['北海道','青森県','岩手県','宮城県','秋田県','山形県','福島県','茨城県','栃木県','群馬県','埼玉県','千葉県','東京都','神奈川県','新潟県','富山県','石川県','福井県','山梨県','長野県','岐阜県','静岡県','愛知県','三重県','滋賀県','京都府','大阪府','兵庫県','奈良県','和歌山県','鳥取県','島根県','岡山県','広島県','山口県','徳島県','香川県','愛媛県','高知県','福岡県','佐賀県','長崎県','熊本県','大分県','宮崎県','鹿児島県','沖縄県'];
  var wpoState = { photos:[], tags:[], loc:null };

  var postPg = document.createElement('div'); postPg.id='wcPost';
  postPg.innerHTML = '<div class="wpo-inner">'
    + '<div class="wpo-hd"><span class="wpo-back" id="wpoBack">‹</span><span class="wpo-tit">新しく投稿</span><span class="wpo-prev" id="wpoPrev">プレビュー</span></div>'
    + '<div class="wpo-user"><div class="wpo-av">参</div><div class="wpo-un">あなた（参拝者さん）</div></div>'
    + '<div class="wpo-sec"><div class="wpo-label">写真を追加 <span class="req">*</span> <span style="font-size:10px;color:#a89a80;font-weight:400">1枚目がトップに表示されます</span></div>'
    +   '<div class="wpo-photos" id="wpoPhotos"><div class="wpo-add" id="wpoAdd"><span>📷</span>写真を追加</div></div>'
    +   '<input type="file" id="wpoFile" accept="image/*" multiple style="display:none"></div>'
    + '<div class="wpo-sec"><div class="wpo-label">神社名 <span class="req">*</span></div>'
    +   '<div style="position:relative"><input class="wpo-input" id="wpoShrine" placeholder="例：善光寺"><span class="wpo-clear" id="wpoClear">✕</span></div></div>'
    + '<div class="wpo-sec"><div class="wpo-label">都道府県 <span class="req">*</span></div>'
    +   '<select class="wpo-select" id="wpoPref"><option value="">選択してください</option>'
    +   PREFS.map(function(p){ return '<option>'+p+'</option>'; }).join('') + '</select></div>'
    + '<div class="wpo-sec" id="wpoLocSec" style="display:none"><div class="wpo-label">位置情報 <span style="font-size:10px;color:#6B6B6B;font-weight:400">（写真から自動検出）</span><span class="ok">✓ 検出完了</span></div>'
    +   '<div class="wpo-loc"><span class="wpo-loc-pin">📍</span><div style="flex:1"><div class="wpo-loc-nm" id="wpoLocNm">—</div><div class="wpo-loc-ad" id="wpoLocAd">—</div></div></div>'
    +   '<div style="font-size:9.5px;color:#a89a80;margin-top:6px">※写真の位置情報（GPS）から推定しました</div></div>'
    + '<div class="wpo-sec"><div class="wpo-label">おすすめハッシュタグ <span class="ok" id="wpoTagBadge" style="display:none">✓ 自動生成</span></div>'
    +   '<div class="wpo-tags" id="wpoTags"><span style="font-size:11px;color:#a89a80">神社名を入れると自動生成されます（タップで付け外し）</span></div></div>'
    + '<div class="wpo-sec"><div class="wpo-label">投稿内容 <span style="font-size:10px;color:#a89a80;font-weight:400">（最大1000文字）</span></div>'
    +   '<textarea class="wpo-ta" id="wpoText" maxlength="1000" placeholder="参拝の感想や、境内のおすすめポイント、ご利益など自由にご記入ください"></textarea>'
    +   '<div class="wpo-cnt"><span id="wpoCnt">0</span> / 1000</div></div>'
    + '<div class="wpo-sec"><div class="wpo-label">公開設定</div>'
    +   '<select class="wpo-select" id="wpoVis"><option value="public">🌏 公開（みんなの最新投稿に表示）</option><option value="private">🔒 自分だけ（記録として保存）</option></select></div>'
    + '<button class="wpo-submit" id="wpoSubmit" disabled>投稿する</button>'
    + '<div class="wpo-note">投稿は今はこの端末に保存されます（会員機能の公開後にみんなへ共有されます）</div>'
    + '</div>';
  document.body.appendChild(postPg);

  function wpoOpen(){
    wpoState = { photos:[], tags:[], loc:null };
    document.getElementById('wpoShrine').value='';
    document.getElementById('wpoPref').value='';
    document.getElementById('wpoText').value='';
    document.getElementById('wpoCnt').textContent='0';
    document.getElementById('wpoLocSec').style.display='none';
    document.getElementById('wpoTags').innerHTML='<span style="font-size:11px;color:#a89a80">神社名を入れると自動生成されます（タップで付け外し）</span>';
    wpoRenderPhotos(); wpoValidate();
    postPg.style.display='block'; postPg.scrollTop=0;
  }
  // 既存の「投稿する」ボタンをこの画面に差し替え
  window.openCommunityPost = wpoOpen;

  document.getElementById('wpoBack').onclick = function(){ postPg.style.display='none'; };
  document.getElementById('wpoAdd').onclick = function(){ document.getElementById('wpoFile').click(); };
  document.getElementById('wpoClear').onclick = function(){ var i=document.getElementById('wpoShrine'); i.value=''; i.dispatchEvent(new Event('input')); };

  function wpoRenderPhotos(){
    var box = document.getElementById('wpoPhotos');
    var h = '';
    wpoState.photos.forEach(function(p,i){
      h += '<div class="wpo-ph"><img src="'+p+'">'+(i===0?'<span class="cover">トップ表示</span>':'')+'<span class="x" data-x="'+i+'">✕</span></div>';
    });
    h += '<div class="wpo-add" id="wpoAdd"><span>📷</span>写真を追加</div>';
    box.innerHTML = h;
    document.getElementById('wpoAdd').onclick = function(){ document.getElementById('wpoFile').click(); };
    box.querySelectorAll('[data-x]').forEach(function(x){
      x.onclick = function(){ wpoState.photos.splice(+x.getAttribute('data-x'),1); wpoRenderPhotos(); wpoValidate(); };
    });
  }

  // 写真を縮小してデータ化（端末保存用）
  function wpoCompress(file, cb){
    var img = new Image();
    var fr = new FileReader();
    fr.onload = function(){ img.src = fr.result; };
    img.onload = function(){
      var max = 900, w = img.width, hgt = img.height;
      if (w > max){ hgt = Math.round(hgt*max/w); w = max; }
      var cv = document.createElement('canvas'); cv.width=w; cv.height=hgt;
      cv.getContext('2d').drawImage(img,0,0,w,hgt);
      cb(cv.toDataURL('image/jpeg',.82));
    };
    fr.readAsDataURL(file);
  }

  // EXIFのGPS情報を読む（あれば）
  function wpoExifGps(file, cb){
    var r = new FileReader();
    r.onload = function(){
      try{
        var v = new DataView(r.result);
        if (v.getUint16(0) !== 0xFFD8){ cb(null); return; }
        var off = 2, len = v.byteLength;
        while (off < len){
          if (v.getUint16(off) === 0xFFE1){
            var exifOff = off+4;
            if (v.getUint32(exifOff) !== 0x45786966){ cb(null); return; }
            var tiff = exifOff+6;
            var little = v.getUint16(tiff) === 0x4949;
            function u16(o){ return v.getUint16(o, little); }
            function u32(o){ return v.getUint32(o, little); }
            var ifd0 = tiff + u32(tiff+4);
            var n = u16(ifd0), gpsIfd = 0;
            for (var i=0;i<n;i++){ var e = ifd0+2+i*12; if (u16(e) === 0x8825) gpsIfd = tiff + u32(e+8); }
            if (!gpsIfd){ cb(null); return; }
            var gn = u16(gpsIfd), lat=null, lng=null, latR='N', lngR='E';
            function rat(o){ return u32(o)/u32(o+4); }
            function dms(valOff){ var o = tiff + u32(valOff+8); return rat(o) + rat(o+8)/60 + rat(o+16)/3600; }
            for (var g=0; g<gn; g++){
              var ge = gpsIfd+2+g*12, tag = u16(ge);
              if (tag===1) latR = String.fromCharCode(v.getUint8(ge+8));
              if (tag===2) lat = dms(ge);
              if (tag===3) lngR = String.fromCharCode(v.getUint8(ge+8));
              if (tag===4) lng = dms(ge);
            }
            if (lat!==null && lng!==null){ cb({lat:(latR==='S'?-lat:lat), lng:(lngR==='W'?-lng:lng)}); return; }
            cb(null); return;
          }
          off += 2 + v.getUint16(off+2);
        }
        cb(null);
      }catch(e){ cb(null); }
    };
    r.readAsArrayBuffer(file.slice(0, 131072));
  }

  // GPS → 最寄りの神社・都道府県をAIが推定して自動入力
  function wpoDetectFromGps(gps){
    try{
      if (typeof API_KEY==='undefined' || !API_KEY || typeof google==='undefined' || !google.maps || !google.maps.places) return;
      var svc = new google.maps.places.PlacesService(document.createElement('div'));
      svc.nearbySearch({location:new google.maps.LatLng(gps.lat,gps.lng), rankBy:google.maps.places.RankBy.DISTANCE, type:'place_of_worship'}, function(res, st){
        if (st!==google.maps.places.PlacesServiceStatus.OK || !res || !res[0]) return;
        var p = res[0];
        var sh = document.getElementById('wpoShrine');
        if (!sh.value){ sh.value = p.name; sh.dispatchEvent(new Event('input')); }
        var vic = p.vicinity || '';
        document.getElementById('wpoLocNm').textContent = p.name;
        document.getElementById('wpoLocAd').textContent = vic;
        document.getElementById('wpoLocSec').style.display = 'block';
        // 都道府県はジオコーダで
        try{
          new google.maps.Geocoder().geocode({location:{lat:gps.lat,lng:gps.lng}}, function(gres, gst){
            if (gst==='OK' && gres && gres[0]){
              var pref = '';
              gres[0].address_components.forEach(function(c){ if (c.types.indexOf('administrative_area_level_1')>-1) pref = c.long_name; });
              if (pref){
                document.getElementById('wpoPref').value = pref;
                document.getElementById('wpoLocAd').textContent = pref + ' ' + vic;
                wpoGenTags(); wpoValidate();
              }
            }
          });
        }catch(e){}
      });
    }catch(e){}
  }

  document.getElementById('wpoFile').onchange = function(){
    var files = [].slice.call(this.files||[]);
    if (!files.length) return;
    files.forEach(function(f, i){
      wpoCompress(f, function(data){ wpoState.photos.push(data); wpoRenderPhotos(); wpoValidate(); });
      if (i===0 && !wpoState.photos.length) wpoExifGps(f, function(gps){ if (gps) wpoDetectFromGps(gps); });
    });
    this.value='';
  };

  // 神社名からハッシュタグを自動生成
  function wpoGenTags(){
    var name = document.getElementById('wpoShrine').value.trim();
    var pref = document.getElementById('wpoPref').value;
    if (!name){ return; }
    var m = new Date().getMonth()+1;
    var season = (m>=3&&m<=4)?'#桜':(m>=5&&m<=6)?'#新緑':(m>=7&&m<=8)?'#夏詣':(m>=9&&m<=11)?'#紅葉':'#初詣';
    var base = ['#'+name];
    if (pref) base.push('#'+pref);
    var isTemple = /寺|院|大師|不動|観音/.test(name);
    base = base.concat(isTemple ? ['#寺院','#御朱印','#仏閣めぐり'] : ['#神社','#御朱印','#パワースポット']);
    base = base.concat(['#開運', season, '#参拝記録', '#わびなび']);
    var keep = {};
    wpoState.tags.forEach(function(t){ keep[t.tag] = t.on; });
    wpoState.tags = base.map(function(t,i){ return {tag:t, on:(t in keep) ? keep[t] : (i<6)}; });
    var badge = document.getElementById('wpoTagBadge'); if (badge) badge.style.display='inline-block';
    wpoRenderTags();
  }
  function wpoRenderTags(){
    var box = document.getElementById('wpoTags');
    box.innerHTML = wpoState.tags.map(function(t,i){
      return '<span class="wpo-tag'+(t.on?'':' off')+'" data-t="'+i+'">'+t.tag+'</span>';
    }).join('');
    box.querySelectorAll('.wpo-tag').forEach(function(el){
      el.onclick = function(){ var t=wpoState.tags[+el.getAttribute('data-t')]; t.on=!t.on; wpoRenderTags(); };
    });
  }
  document.getElementById('wpoShrine').addEventListener('input', function(){
    document.getElementById('wpoClear').style.display = this.value ? 'flex' : 'none';
    wpoGenTags(); wpoValidate();
  });
  document.getElementById('wpoPref').addEventListener('change', function(){ wpoGenTags(); wpoValidate(); });
  document.getElementById('wpoText').addEventListener('input', function(){ document.getElementById('wpoCnt').textContent = this.value.length; });

  function wpoValidate(){
    var ok = wpoState.photos.length>0 && document.getElementById('wpoShrine').value.trim() && document.getElementById('wpoPref').value;
    document.getElementById('wpoSubmit').disabled = !ok;
  }

  // プレビュー（トップに載るカードの見た目）
  document.getElementById('wpoPrev').onclick = function(){
    if (!wpoState.photos.length){ toast('写真を追加するとプレビューできます'); return; }
    var name = document.getElementById('wpoShrine').value.trim()||'神社名';
    var pref = document.getElementById('wpoPref').value||'都道府県';
    var pv = document.createElement('div');
    pv.style.cssText='position:fixed;inset:0;z-index:300;background:rgba(20,14,8,.75);display:flex;align-items:center;justify-content:center;';
    pv.innerHTML='<div style="width:230px"><div class="wcp-card"><img src="'+wpoState.photos[0]+'"><div class="wcp-grad"></div><div class="wcp-info"><div class="wcp-userrow"><span class="wcp-av" style="background:#c9a84c">参</span><span class="wcp-un">あなた</span><span class="wcp-like">♡</span></div><div class="wcp-tags"><span># '+name+'</span><span># '+pref+'</span></div></div></div><div style="text-align:center;color:#fff;font-size:11px;margin-top:10px">トップページでの見え方（タップで閉じる）</div></div>';
    pv.onclick=function(){ pv.remove(); };
    document.body.appendChild(pv);
  };

  // 投稿する
  document.getElementById('wpoSubmit').onclick = function(){
    var name = document.getElementById('wpoShrine').value.trim();
    var pref = document.getElementById('wpoPref').value;
    if (!wpoState.photos.length || !name || !pref) return;
    var post = {
      id:'u'+Date.now(),
      user:'あなた', avatar:'参', date:'たった今',
      shrine:name, addr:pref, area:pref.replace(/[都道府県]$/,''),
      img:wpoState.photos[0],
      text:document.getElementById('wpoText').value.trim(),
      tags:wpoState.tags.filter(function(t){return t.on;}).map(function(t){return t.tag;}),
      visibility:document.getElementById('wpoVis').value,
      likes:0, comments:[]
    };
    try{
      var mine = JSON.parse(localStorage.getItem('wabi_my_posts')||'[]');
      mine.unshift(post);
      if (mine.length>12) mine = mine.slice(0,12); // 容量対策
      localStorage.setItem('wabi_my_posts', JSON.stringify(mine));
    }catch(e){ toast('端末の保存容量が足りないため、写真は保存されない場合があります'); }
    if (post.visibility==='public' && typeof USER_POSTS!=='undefined'){
      USER_POSTS.unshift(post);
      redesignCommunity();
    }
    postPg.style.display='none';
    toast('🌿 投稿しました！トップの「みんなの最新投稿」に表示されています');
    var sec = document.querySelector('.community-box');
    if (sec) sec.scrollIntoView({behavior:'smooth', block:'center'});
  };

  // 端末に保存済みの自分の投稿を起動時に反映
  try{
    var mine0 = JSON.parse(localStorage.getItem('wabi_my_posts')||'[]');
    if (mine0.length && typeof USER_POSTS!=='undefined'){
      mine0.slice().reverse().forEach(function(p){ if (p.visibility==='public') USER_POSTS.unshift(p); });
      redesignCommunity();
    }
  }catch(e){}
})();

// マイページを読み込む
(function(){var s=document.createElement("script");s.src="mypage.js?v="+(window._wv||Date.now());document.body.appendChild(s);})();


/* ══════════════════════════════════════════════════════════════
   わびなび：地図の初期表示範囲を「現在地から車で約20分圏」に
   （2026-07-26 追加 / 従来は日本全体＝ズーム6で開いていた）
   ══════════════════════════════════════════════════════════════ */
(function(){
  if (window.__wabiMapScope) return;
  window.__wabiMapScope = true;

  var RADIUS_KM = 10;                               // 車で約20分 ≒ 半径10km
  var FALLBACK  = { lat: 35.6812, lng: 139.7671 };  // 東京駅（位置情報が使えない時）
  var LS_KEY    = 'wabiLastLoc';

  function saveLoc(lat, lng){
    try { localStorage.setItem(LS_KEY, lat + ',' + lng); } catch(e){}
  }
  function loadLoc(){
    try {
      var p  = (localStorage.getItem(LS_KEY) || '').split(',');
      var la = parseFloat(p[0]), ln = parseFloat(p[1]);
      if (isFinite(la) && isFinite(ln)) return { lat: la, lng: ln };
    } catch(e){}
    return null;
  }

  // 半径 km が画面に収まるズーム値を計算（端末の画面幅に自動対応）
  function zoomForRadius(lat, km){
    var cv = document.getElementById('mapCanvas');
    var w  = (cv && cv.clientWidth)  || 390;
    var h  = (cv && cv.clientHeight) || 480;
    var px = Math.min(w, h);
    var mppNeeded = (km * 2000) / px;                          // 直径(m) ÷ 画面(px)
    var mppZero   = 156543.03392 * Math.cos(lat * Math.PI / 180);
    var z = Math.log(mppZero / mppNeeded) / Math.LN2;           // 小数ズーム
    if (!isFinite(z)) z = 11;
    return Math.max(9, Math.min(14, Math.round(z * 10) / 10));
  }

  function setScope(c){
    var m = window.mapInstance;
    if (!m || !m.setZoom) return false;
    try {
      // 小数ズームを許可（端末幅ちょうどに合わせるため）
      try { m.setOptions({ isFractionalZoomEnabled: true }); } catch(e){}
      m.setCenter({ lat: c.lat, lng: c.lng });
      m.setZoom(zoomForRadius(c.lat, RADIUS_KM));
    } catch(e){ return false; }
    return true;
  }

  // 地図生成直後は initMap 側のリサイズ処理で戻されるため、時間差で複数回打つ
  function applyScope(c){
    var tries = 0;
    (function loop(){
      if (setScope(c)) {
        setTimeout(function(){ setScope(c); }, 600);
        setTimeout(function(){ setScope(c); }, 1400);
        return;
      }
      if (++tries < 30) setTimeout(loop, 200);
    })();
  }

  // 表示範囲に合わせてDB神社のピンも広げる（従来は半径3kmのみ）
  function repinAround(lat, lng){
    try {
      if (typeof SHRINES === 'undefined' || typeof placePins !== 'function') return;
      if (typeof haversineDistance !== 'function') return;
      var list = SHRINES.filter(function(s){
        return s.lat && s.lng && haversineDistance(lat, lng, s.lat, s.lng) <= RADIUS_KM;
      });
      if (typeof clearMarkers === 'function') clearMarkers();
      placePins(list);
    } catch(e){}
  }

  // ① 現在地が取得できたとき（従来ズーム14＝半径約3km）
  var _near = window.showShrinesNearLocation;
  if (typeof _near === 'function') {
    window.showShrinesNearLocation = function(lat, lng){
      var r = _near.apply(this, arguments);
      saveLoc(lat, lng);
      repinAround(lat, lng);
      applyScope({ lat: lat, lng: lng });
      return r;
    };
  }

  // ② 現在地が取れなかったとき（従来ズーム6＝日本全体）
  var _all = window.showAllShrinesOnMap;
  if (typeof _all === 'function') {
    window.showAllShrinesOnMap = function(){
      var r = _all.apply(this, arguments);
      var c = (window.myLatLng && window.myLatLng.lat) ? window.myLatLng
            : (loadLoc() || FALLBACK);
      repinAround(c.lat, c.lng);
      applyScope(c);
      return r;
    };
  }
})();


/* ══════════════════════════════════════════════════════════════
   わびなび：神社詳細の「いつか訪れたい」→「お気に入りに登録」
   押すと localStorage('wabiFavorites') に保存／再度押すと解除。
   マイページの「お気に入りの神社仏閣」件数に自動反映される。
   （2026-07-27 追加 / index.html は触らず concierge.js から上書き）
   ══════════════════════════════════════════════════════════════ */
(function(){
  if (window.__wabiFav) return;
  window.__wabiFav = true;

  var LS   = 'wabiFavorites';
  var GOLD = '#C9A24A';

  function load(){
    try { var a = JSON.parse(localStorage.getItem(LS) || '[]'); return Array.isArray(a) ? a : []; }
    catch(e){ return []; }
  }
  function save(a){ try { localStorage.setItem(LS, JSON.stringify(a)); } catch(e){} }
  function nameOf(x){ return (x && typeof x === 'object') ? (x.name || '') : String(x || ''); }
  function indexOfName(a, n){
    for (var i = 0; i < a.length; i++) if (nameOf(a[i]) === n) return i;
    return -1;
  }

  var STAR_OFF = '<svg viewBox="0 0 14 14" fill="none"><path d="M7 1.2l1.8 3.7 4.1.6-3 2.9.7 4-3.6-1.9L3.4 12.4l.7-4-3-2.9 4.1-.6z" stroke="currentColor" stroke-width="1.1" stroke-linejoin="round"/></svg>';
  var STAR_ON  = '<svg viewBox="0 0 14 14"><path d="M7 1.2l1.8 3.7 4.1.6-3 2.9.7 4-3.6-1.9L3.4 12.4l.7-4-3-2.9 4.1-.6z" fill="currentColor"/></svg>';

  function favBtn(){
    return document.querySelector('#pgShrineDetail button.sd-act-btn[onclick^="sdBookmark"]')
        || document.querySelector('button.sd-act-btn[onclick^="sdBookmark"]');
  }

  // ボタンの見た目を現在の登録状態に合わせる
  function paint(){
    var b = favBtn(); if (!b) return;
    var s  = window.currentSdShrine;
    var on = !!(s && s.name && indexOfName(load(), s.name) >= 0);
    b.innerHTML = (on ? STAR_ON : STAR_OFF) + (on ? 'お気に入り登録済み' : 'お気に入りに登録');
    b.style.background  = on ? GOLD  : '#fff';
    b.style.color       = on ? '#fff' : '';
    b.style.borderColor = GOLD;
  }
  window.__wabiFavPaint = paint;

  // ボタン本体（index.html の onclick="sdBookmark()" から呼ばれる）
  window.sdBookmark = function(){
    var s = window.currentSdShrine;
    if (!s || !s.name) {
      if (typeof showToast === 'function') showToast('神社情報を取得できませんでした');
      return;
    }
    var a = load(), i = indexOfName(a, s.name);
    if (i >= 0) {
      a.splice(i, 1); save(a); paint();
      if (typeof showToast === 'function') showToast('お気に入りを解除しました');
    } else {
      a.push({
        name: s.name, addr: s.addr || '', area: s.area || '',
        lat: s.lat || null, lng: s.lng || null, ts: Date.now()
      });
      save(a); paint();
      if (typeof showToast === 'function') showToast('★「' + s.name + '」をお気に入りに登録しました');
    }
  };

  // 詳細ページを開くたびにボタン表示を更新
  function hook(fnName){
    var orig = window[fnName];
    if (typeof orig !== 'function') return;
    window[fnName] = function(){
      var r = orig.apply(this, arguments);
      setTimeout(paint, 0);
      setTimeout(paint, 300);
      return r;
    };
  }
  // 神社詳細の最下部「AI御朱印巡りルートに追加」ボタンを隠す
  var hideCss = document.createElement('style');
  hideCss.textContent = '#pgShrineDetail button[onclick^="sdAddToAiRoute"]{display:none !important;}';
  document.head.appendChild(hideCss);
  function hideAiBtn(){
    var b = document.querySelector('#pgShrineDetail button[onclick^="sdAddToAiRoute"]');
    if (b) { b.style.display = 'none'; if (b.parentElement) b.parentElement.style.display = 'none'; }
  }

  // populate / open のたびに、お気に入りボタンの再描画とAIボタン非表示を行う
  ['populateShrineDetail', 'openShrineDetail'].forEach(function(fnName){
    var orig = window[fnName];
    if (typeof orig !== 'function') return;
    window[fnName] = function(){
      var r = orig.apply(this, arguments);
      setTimeout(function(){ paint(); hideAiBtn(); }, 0);
      setTimeout(function(){ paint(); hideAiBtn(); }, 300);
      return r;
    };
  });

  setTimeout(function(){ paint(); hideAiBtn(); }, 1200);
})();


/* ══════════════════════════════════════════════════════════════
   わびなび：おすすめ神社ランキングを常にベスト10表示にする
   10位のカードの下に「11位〜◯位を見る」を置き、
   同じ2列カードデザインの別ページで続きを表示する。
   （2026-07-27 追加 / index.html は触らず concierge.js から上書き）
   ══════════════════════════════════════════════════════════════ */
(function(){
  if (window.__wabiRankTop10) return;
  window.__wabiRankTop10 = true;

  var TOP = 10;       // トップページに出す件数
  var MAX = 30;       // ランキング全体の件数（1位〜30位）
  var rest = [];      // 11位以降のカードHTML
  var restLabel = '';

  // index.html 側の filter() は10件で切ってしまうため、30件まで出すよう差し替える
  var _origFilter = window.filter;
  window.filter = function(){
    try {
      var areaSel = document.getElementById('areaSel');
      var sortSel = document.getElementById('sortSel');
      if (!areaSel || !sortSel || typeof SHRINES === 'undefined' || typeof renderCard !== 'function') {
        return _origFilter && _origFilter.apply(this, arguments);
      }
      var area = areaSel.value, sort = sortSel.value;
      if (area === 'nearby') { if (typeof searchNearby === 'function') searchNearby(); return; }

      var f = SHRINES.slice();
      if (typeof currentType !== 'undefined' && currentType) f = f.filter(function(s){ return (s.type || 'shrine') === currentType; });
      if (area !== 'all') f = f.filter(function(s){ return s.area === area; });
      if (typeof currentTag !== 'undefined' && currentTag !== 'all') f = f.filter(function(s){ return s.tags && s.tags.indexOf(currentTag) >= 0; });
      if (sort === 'visited') f = f.filter(function(s){ return s.visited; });
      if (sort === 'rating') f.sort(function(a, b){ return b.rating - a.rating; });
      if (sort === 'rank')   f.sort(function(a, b){ return a.rank - b.rank; });

      var lbl = areaSel.options[areaSel.selectedIndex].text;
      var top = f.slice(0, MAX);
      var shown = Math.min(top.length, TOP);
      document.getElementById('resCount').textContent = lbl + ' ' + shown + '件';
      document.getElementById('rmeta').innerHTML = lbl + ' <span>' + shown + '件</span> のおすすめ神社';
      document.getElementById('list').innerHTML = top.length
        ? top.map(function(s, i){ return renderCard(s, i + 1); }).join('')
        : '<div style="text-align:center;color:#aaa;padding:2rem 0;font-size:13px">このエリアの神社はまだありません</div>';
    } catch(e) {
      if (_origFilter) _origFilter.apply(this, arguments);
    }
  };

  var css = document.createElement('style');
  css.textContent = [
    '.wabi-more-rank{display:inline-flex;align-items:center;justify-content:center;gap:4px;',
      'padding:6px 12px;border:1px solid #e6dcc6;border-radius:10px;background:#fffdf8;cursor:pointer;',
      "font-family:'Noto Serif JP',serif;font-size:10.5px;font-weight:600;color:#8a6d3b;letter-spacing:.02em;}",
    '.wabi-more-rank:active{transform:scale(.985)}',
    '#wabiRankMore{position:fixed;inset:0;z-index:300;background:#faf8f4;display:none;overflow-y:auto;-webkit-overflow-scrolling:touch;}',
    '#wabiRankMore .wrm-hd{position:sticky;top:0;z-index:5;background:#a83320;color:#fff;display:flex;align-items:center;gap:10px;padding:14px 16px;}',
    "#wabiRankMore .wrm-hd .b{font-size:20px;cursor:pointer;line-height:1;opacity:.85}",
    "#wabiRankMore .wrm-hd .t{font-family:'Shippori Mincho',serif;font-size:15px;font-weight:800;letter-spacing:.1em}",
    '#wabiRankMore .wrm-in{max-width:500px;margin:0 auto;padding:14px 16px 40px;}',
    "#wabiRankMore .wrm-meta{font-size:11px;color:#888;margin-bottom:.875rem;font-family:'Noto Serif JP',serif;}",
    '#wabiRankMore .wrm-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;align-items:start;}'
  ].join('');
  document.head.appendChild(css);

  var pg = document.createElement('div');
  pg.id = 'wabiRankMore';
  pg.innerHTML = '<div class="wrm-hd"><span class="b">‹</span><span class="t">おすすめ神社ランキング</span></div>'
               + '<div class="wrm-in"><div class="wrm-meta" id="wrmMeta"></div><div class="wrm-grid" id="wrmGrid"></div></div>';
  document.body.appendChild(pg);
  pg.querySelector('.b').onclick = function(){
    pg.style.display = 'none';
    if (typeof updateFabVisibility === 'function') updateFabVisibility();
  };

  // 別ページのカードにも写真を読み込む（トップと同じPlaces取得）
  function fillPhotos(root){
    try {
      if (!window.google || !google.maps || !google.maps.places) return;
      var svc = new google.maps.places.PlacesService(document.createElement('div'));
      root.querySelectorAll('.rcard').forEach(function(c){
        if (c.getAttribute('data-wcphoto')) return;
        var nm = c.querySelector('.rname'), gal = c.querySelector('.pgallery');
        if (!nm || !gal) return;
        c.setAttribute('data-wcphoto', '1');
        svc.findPlaceFromQuery({ query: nm.textContent.trim() + ' 神社', fields: ['photos'] }, function(res, stt){
          if (stt === google.maps.places.PlacesServiceStatus.OK && res && res[0] && res[0].photos && res[0].photos.length) {
            var urls = res[0].photos.slice(0, 4).map(function(p){ return p.getUrl({ maxWidth: 500 }); });
            var strip = urls.slice(0, 4);
            while (strip.length < 4) strip.push(urls[0]);
            gal.innerHTML = '<div class="pgallery-main"><img src="' + urls[0] + '" loading="lazy"><div class="photo-count">📷 ' + urls.length + '枚</div></div>';
            var se = c.querySelector('.pstrip');
            if (se) se.innerHTML = strip.map(function(u){ return '<div class="pstrip-item"><img src="' + u + '" loading="lazy"></div>'; }).join('');
          } else {
            c.removeAttribute('data-wcphoto');
          }
        });
      });
    } catch(e){}
  }

  window.wabiOpenRankMore = function(){
    document.getElementById('wrmMeta').textContent = restLabel;
    var grid = document.getElementById('wrmGrid');
    grid.innerHTML = rest.join('');
    grid.querySelectorAll('.rcard').forEach(function(c){ c.removeAttribute('data-wcphoto'); });
    pg.style.display = 'block';
    pg.scrollTop = 0;
    var fab = document.getElementById('fabMap');
    if (fab) fab.style.display = 'none';
    fillPhotos(grid);
    setTimeout(function(){ fillPhotos(grid); }, 1200);
  };

  var list = document.getElementById('list');
  var mo = null;

  function doTrim(){
    if (!list) return;
    // グリッドの中に置くと行の高さに引き伸ばされるため、#list の外側に置く
    var old = (list.parentNode || document).querySelector('.wabi-more-rank');

    var cards = [];
    for (var i = 0; i < list.children.length; i++) {
      if (list.children[i].className && String(list.children[i].className).indexOf('rcard') >= 0) cards.push(list.children[i]);
    }
    // すでに10件に絞り込み済み（＝リンクも設置済み）なら何もしない
    if (cards.length <= TOP && old && rest.length && old.parentNode) { /* 件数が減ったら作り直す */ }
    if (old) old.parentNode.removeChild(old);
    if (cards.length <= TOP) { rest = []; return; }

    rest = [];
    for (var j = TOP; j < cards.length; j++) {
      if (j < MAX) rest.push(cards[j].outerHTML);   // 11位〜30位だけ別ページへ
      cards[j].parentNode.removeChild(cards[j]);
    }
    restLabel = (TOP + 1) + '位〜' + (TOP + rest.length) + '位 のおすすめ神社';

    var more = document.createElement('div');
    more.className = 'wabi-more-rank';
    more.innerHTML = (TOP + 1) + '位〜' + (TOP + rest.length) + '位を見る　›';
    more.onclick = window.wabiOpenRankMore;
    if (list.parentNode) list.parentNode.insertBefore(more, list.nextSibling);
    else list.appendChild(more);

    // 件数表示もベスト10に合わせる
    try {
      var rc = document.getElementById('resCount');
      var rm = document.getElementById('rmeta');
      if (rc) rc.textContent = rc.textContent.replace(/\d+件/, TOP + '件');
      if (rm) rm.innerHTML = rm.innerHTML.replace(/\d+件/, TOP + '件');
    } catch(e){}
  }

  function trim(){
    if (mo) mo.disconnect();
    try { doTrim(); } catch(e){}
    if (mo && list) mo.observe(list, { childList: true });
  }

  if (list && window.MutationObserver) {
    mo = new MutationObserver(trim);
    mo.observe(list, { childList: true });
  }
  // 差し替えたfilterで一度描き直す（初期表示は10件で切られているため）
  function refresh(){ try { if (typeof window.filter === 'function') window.filter(); } catch(e){} }
  setTimeout(refresh, 200);
  setTimeout(refresh, 1200);
  setTimeout(trim, 300);
  setTimeout(trim, 1500);
})();


/* ══════════════════════════════════════════════════════════════
   わびなび：おすすめ巡拝ルートの「記事ページ」
   1記事＝1ルート。カードをタップするとそのルートだけを表示する。
   （2026-07-27 追加 / index.html・routes.js は触らず concierge.js から上書き）
   ══════════════════════════════════════════════════════════════ */
(function(){
  if (window.__wabiRoutePage) return;
  window.__wabiRoutePage = true;

  // ── ルートごとの追記データ（実在の店舗・宿のみ掲載）──────────
  var EXTRA = {
    r1: {
      lead:'東国の神々に導かれる、<br>開運と浄化の旅へ',
      whoFor:['新しいことを始めたい人','心をリセットして前に進みたい人','仕事運・勝負運を上げたい人','人間関係を円滑にしたい人','強力なパワーを授かりたい人'],
      trivia:'東国三社は、江戸時代に「お伊勢参りの禊参り」として広く親しまれました。三社を巡って授かる「東国三社守」は、三角柱に各社の御神紋をおさめる形で知られています。',
      area:'鹿島神宮',
      eats:[
        {cat:'カフェ', name:'和茶房うの', note:'香取神宮の御神水で淹れるコーヒー', loc:'千葉県香取市'},
        {cat:'川魚', name:'戸村川魚店', note:'佐原の川魚店が営むうなぎ', loc:'千葉県香取市'},
        {cat:'甘味', name:'わらび餅 岩立本店', note:'小江戸・佐原の名物わらび餅', loc:'千葉県香取市'},
        {cat:'カフェ', name:'珈琲玉澤', note:'佐原の町並みに佇む珈琲店', loc:'千葉県香取市'},
        {cat:'寿司', name:'鮨 治ろうや', note:'鹿島灘の地魚を握る鮨処', loc:'茨城県鹿嶋市'},
        {cat:'地ビール', name:'パラダイスビール', note:'鹿島神宮の御神水で仕込む鹿嶋の地ビール', loc:'茨城県鹿嶋市'}
      ],
      stays:[
        {cat:'ホテル', name:'佐原商家町ホテル NIPPONIA', note:'佐原の商家を生かした分散型ホテル', loc:'千葉県香取市'},
        {cat:'宿', name:'和風の宿 ホステルコエド佐原', note:'小江戸・佐原の町家の宿', loc:'千葉県香取市'},
        {cat:'旅館', name:'旅館 一蘭荘', note:'佐原に残る小さな旅館', loc:'千葉県香取市'},
        {cat:'ホテル', name:'はまなすの湯 たびのホテル鹿島', note:'温泉に浸かれる鹿島の宿', loc:'茨城県神栖市'},
        {cat:'ホテル', name:'ホテルルートイン鹿嶋', note:'鹿島神宮めぐりの拠点に', loc:'茨城県鹿嶋市'},
        {cat:'宿', name:'かすみの浦 和み', note:'水郷・潮来の一日一組の宿', loc:'茨城県潮来市'}
      ]
    },
    r2: {
      lead:'親子の神をたずねる、<br>山陰の福めぐり',
      whoFor:['良縁を望む人','商売を営む人','人とのご縁を大切にしたい人','人生の節目に願を立てたい人','片参りで終わらせたくない人'],
      trivia:'出雲大社だけを参拝して美保神社を訪れないことは、古くから「片参り」と呼ばれてきました。大国主大神と御子神・事代主神の両方をお参りして、はじめて満願とされます。',
      area:'出雲大社',
      eats:[
        {cat:'そば', name:'平和そば本店', note:'出雲大社ちかくの割子そば', loc:'島根県出雲市'},
        {cat:'そば', name:'羽根屋 本店', note:'出雲を代表する老舗そば処', loc:'島根県出雲市'},
        {cat:'カフェ', name:'koharu', note:'出雲大社ちかくの小さなカフェ', loc:'島根県出雲市'},
        {cat:'和食', name:'しまね和牛と米と出汁', note:'島根の食材を味わう和食', loc:'島根県出雲市'},
        {cat:'そば', name:'出雲そば 荒木屋', note:'出雲大社ちかくの老舗割子そば', loc:'島根県出雲市'},
        {cat:'和食', name:'味処まつや', note:'美保関ちかくの食事処', loc:'島根県松江市'}
      ],
      stays:[
        {cat:'ホテル', name:'NIPPONIA 出雲大社 門前町', note:'門前町の町家を生かした宿', loc:'島根県出雲市'},
        {cat:'旅館', name:'界 出雲', note:'日本海を望む温泉旅館', loc:'島根県出雲市'},
        {cat:'旅館', name:'いにしえの宿 佳雲', note:'出雲大社まで徒歩8分／天然温泉', loc:'島根県出雲市'},
        {cat:'旅館', name:'湯宿 草菴', note:'出雲の静かな温泉宿', loc:'島根県出雲市'},
        {cat:'旅館', name:'お宿 月夜のうさぎ', note:'縁結びの町の和モダン宿', loc:'島根県出雲市'},
        {cat:'旅館', name:'旅館 美保館', note:'美保神社ちかく／本館は国登録有形文化財', loc:'島根県松江市'}
      ]
    },
    r3: {
      lead:'禊から内宮へ、<br>一生に一度の正式順路',
      whoFor:['一生に一度のお参りをしたい人','正しい作法で巡りたい人','心身を清めたい人','日々の感謝を伝えたい人','神宮の歴史にふれたい人'],
      trivia:'「お伊勢参らば朝熊をかけよ、朝熊かけねば片参り」。伊勢音頭に唄われたこの一節が、外宮・内宮のあとに朝熊岳金剛證寺を訪ねる習わしを今に伝えています。',
      area:'伊勢神宮 内宮',
      eats:[
        {cat:'甘味', name:'赤福 本店', note:'おはらい町／1707年創業の伊勢名物', loc:'三重県伊勢市'},
        {cat:'伊勢うどん', name:'ふくすけ', note:'おかげ横丁／手打ち伊勢うどんが名物', loc:'三重県伊勢市'},
        {cat:'甘味', name:'五十鈴勢語庵', note:'伊勢の塩ようかん', loc:'三重県伊勢市'},
        {cat:'伊勢うどん', name:'めん処 政成', note:'伊勢うどんと煮込みうどんの専門店', loc:'三重県伊勢市'},
        {cat:'カフェ', name:'BonTin cafe 禊', note:'二見ちかくの海辺のカフェ', loc:'三重県伊勢市'},
        {cat:'甘味', name:'茶房山中', note:'伊勢のひとやすみ処', loc:'三重県伊勢市'}
      ],
      stays:[
        {cat:'旅館', name:'麻吉旅館', note:'古市街道に残る江戸期からの旅館', loc:'三重県伊勢市'},
        {cat:'旅館', name:'日の出旅館', note:'伊勢市駅ちかくの木造旅館', loc:'三重県伊勢市'},
        {cat:'旅館', name:'星出館', note:'昭和初期の建物が残る宿', loc:'三重県伊勢市'},
        {cat:'旅館', name:'大石屋', note:'二見浦ちかくの旅館', loc:'三重県伊勢市'},
        {cat:'宿泊施設', name:'神宮会館', note:'内宮まで徒歩5分／早朝の参拝案内あり', loc:'三重県伊勢市'},
        {cat:'旅館', name:'いにしえの宿 伊久', note:'内宮まで徒歩15分／全室露天風呂付', loc:'三重県伊勢市'}
      ]
    },
    r4: {
      lead:'甦りの地へ、<br>山と海をわたる祈りの道',
      whoFor:['人生を仕切り直したい人','自然の力にふれたい人','世界遺産の道を歩きたい人','心身を癒したい人','静かに自分と向き合いたい人'],
      trivia:'熊野は古くから「甦りの地」と呼ばれ、身分を問わず人々が参詣したことから「蟻の熊野詣」と称されました。三山を結ぶ熊野古道は世界遺産に登録されています。',
      area:'熊野本宮大社',
      eats:[
        {cat:'ラーメン', name:'麺屋みつあし', note:'本宮ちかくの人気麺処', loc:'和歌山県田辺市'},
        {cat:'カフェ', name:'bond', note:'熊野本宮の小さなカフェ', loc:'和歌山県田辺市'},
        {cat:'海鮮', name:'鮪十屋', note:'那智勝浦の生まぐろ丼', loc:'和歌山県那智勝浦町'},
        {cat:'和食', name:'八咫庵', note:'熊野本宮大社ちかくの食事処', loc:'和歌山県田辺市'},
        {cat:'寿司', name:'宮ずし', note:'熊野の地魚を握る寿司処', loc:'和歌山県田辺市'},
        {cat:'海鮮', name:'桂城', note:'那智勝浦の生まぐろ料理', loc:'和歌山県那智勝浦町'}
      ],
      stays:[
        {cat:'宿', name:'熊野古道の宿 霧の郷たかはら', note:'熊野古道 中辺路の高原に建つ宿', loc:'和歌山県田辺市'},
        {cat:'民宿', name:'民宿 瀧よし', note:'湯の峰温泉のかけ流し', loc:'和歌山県田辺市'},
        {cat:'旅館', name:'あづまや', note:'日本最古の湯とされる湯の峰温泉', loc:'和歌山県田辺市'},
        {cat:'宿', name:'WhyKumano Hostel & Cafe Bar', note:'那智勝浦のゲストハウス', loc:'和歌山県那智勝浦町'},
        {cat:'宿', name:'熊野古道の宿 GuesthouseMUI', note:'熊野古道歩きの拠点に', loc:'和歌山県田辺市'},
        {cat:'宿', name:'ペンションあしたの森', note:'熊野の森に囲まれた宿', loc:'和歌山県田辺市'}
      ]
    },
    r5: {
      lead:'諏訪湖をめぐる、<br>四社まいりの旅',
      whoFor:['ものごとを成し遂げたい人','自然信仰にふれたい人','四社すべてを巡りたい人','温泉もあわせて楽しみたい人','家族の安泰を願う人'],
      trivia:'諏訪大社には本殿がなく、山や樹木そのものを御神体とする古い信仰の形が残ります。四社すべてを参拝する「四社まいり」の習わしが今も受け継がれています。',
      area:'諏訪大社 上社本宮',
      eats:[
        {cat:'うなぎ', name:'うなぎ 林屋', note:'1893年創業／諏訪のうなぎの名店', loc:'長野県下諏訪町'},
        {cat:'和菓子', name:'新鶴本店', note:'明治6年創業／秋宮前の塩羊羹', loc:'長野県下諏訪町'},
        {cat:'食堂', name:'本田食堂', note:'下諏訪で親しまれる食堂', loc:'長野県下諏訪町'},
        {cat:'そば', name:'そば処とみや', note:'諏訪の手打ちそば', loc:'長野県諏訪市'},
        {cat:'和食', name:'宇迦', note:'諏訪の旬を味わう和食', loc:'長野県諏訪市'},
        {cat:'川魚', name:'丸共 清水屋川魚店', note:'諏訪湖の川魚とうなぎ', loc:'長野県岡谷市'}
      ],
      stays:[
        {cat:'旅館', name:'ぬのはん', note:'上諏訪温泉／諏訪湖畔の創作会席の宿', loc:'長野県諏訪市'},
        {cat:'旅館', name:'上諏訪温泉しんゆ', note:'諏訪湖を望む上諏訪温泉の宿', loc:'長野県諏訪市'},
        {cat:'旅館', name:'上諏訪温泉 浜の湯', note:'諏訪湖畔の露天風呂', loc:'長野県諏訪市'},
        {cat:'旅館', name:'萃sui-諏訪湖', note:'諏訪湖畔の小さな宿', loc:'長野県諏訪市'},
        {cat:'旅館', name:'下諏訪温泉 聴泉閣かめや', note:'秋宮ちかくの老舗旅館', loc:'長野県下諏訪町'},
        {cat:'旅館', name:'ホテル鷺乃湯', note:'上諏訪温泉の湖畔宿', loc:'長野県諏訪市'}
      ]
    },
    r6: {
      lead:'杉並木の奥へ、<br>天岩戸の神々をたずねて',
      whoFor:['静かな森を歩きたい人','神話の舞台を訪ねたい人','蕎麦を味わいたい人','宿坊に泊まってみたい人','心を整えたい人'],
      trivia:'戸隠は天岩戸神話ゆかりの地で、投げられた岩戸が現在の戸隠山になったと伝えられます。奥社の参道には樹齢400年を超える杉並木が続きます。',
      area:'戸隠神社',
      eats:[
        {cat:'そば', name:'蕎麦処 うずら家', note:'戸隠を代表する行列のそば処', loc:'長野県長野市戸隠'},
        {cat:'そば', name:'蕎麦 二葉屋 葉隠', note:'中社ちかくの人気そば処', loc:'長野県長野市戸隠'},
        {cat:'そば', name:'戸隠･手打ちそば つる家', note:'奥社参道ちかくの手打ちそば', loc:'長野県長野市戸隠'},
        {cat:'和食', name:'山帰来 つた弥', note:'戸隠の山菜を味わう', loc:'長野県長野市戸隠'},
        {cat:'カフェ', name:'き楽珈琲', note:'戸隠の自家焙煎珈琲', loc:'長野県長野市戸隠'},
        {cat:'そば', name:'信州戸隠そばの実', note:'日本蕎麦百名店に選ばれた戸隠そば', loc:'長野県長野市戸隠'}
      ],
      stays:[
        {cat:'宿坊', name:'戸隠 旧福寿院 武井旅館', note:'戸隠神社の宿坊', loc:'長野県長野市戸隠'},
        {cat:'宿坊', name:'戸隠神社 宿坊 山本館', note:'中社ちかくの宿坊', loc:'長野県長野市戸隠'},
        {cat:'宿坊', name:'戸隠神社宿坊 旧延命院 御宿 諏訪', note:'戸隠神社の宿坊', loc:'長野県長野市戸隠'},
        {cat:'旅館', name:'越志旅館', note:'戸隠の老舗旅館', loc:'長野県長野市戸隠'},
        {cat:'宿', name:'宿屋 白金家', note:'戸隠のちいさな宿', loc:'長野県長野市戸隠'},
        {cat:'宿', name:'山宿 戸隠小舎', note:'戸隠高原の山宿', loc:'長野県長野市戸隠'}
      ]
    },
    r7: {
      lead:'山の気に満ちた、<br>秩父の三社を結ぶ道',
      whoFor:['気持ちを引き締めたい人','山のパワーを感じたい人','ご当地グルメも楽しみたい人','関東で本格的な巡拝をしたい人','狼信仰にふれたい人'],
      trivia:'秩父神社・宝登山神社・三峯神社をあわせて「秩父三社」と呼びます。三峯神社は標高約1,100mの山中に鎮座し、狼を神使とする信仰で知られます。',
      area:'秩父神社',
      eats:[
        {cat:'豚みそ丼', name:'豚みそ丼本舗 野さか', note:'秩父名物の豚みそ丼', loc:'埼玉県秩父市'},
        {cat:'かき氷', name:'阿左美冷蔵 寶登山道店', note:'明治23年創業／宝登山神社の参道で天然氷', loc:'埼玉県長瀞町'},
        {cat:'食堂', name:'秩父パリー食堂', note:'昭和2年築／国の登録有形文化財の食堂', loc:'埼玉県秩父市'},
        {cat:'そば', name:'そば工房 そば福', note:'秩父の手打ちそば', loc:'埼玉県秩父市'},
        {cat:'カフェ', name:'cafe ura_hoto', note:'長瀞のちいさなカフェ', loc:'埼玉県長瀞町'},
        {cat:'甘味', name:'茶夢', note:'長瀞の甘味処', loc:'埼玉県長瀞町'}
      ],
      stays:[
        {cat:'ホテル', name:'NIPPONIA 秩父 門前町', note:'秩父神社の門前町に泊まる', loc:'埼玉県秩父市'},
        {cat:'旅館', name:'須崎旅館', note:'秩父・小鹿野町の旅館', loc:'埼玉県小鹿野町'},
        {cat:'宿', name:'二百年の農家屋敷 宮本家', note:'築二百年の農家屋敷の宿', loc:'埼玉県小鹿野町'},
        {cat:'宿', name:'秩父別邸 木叢', note:'秩父の一棟貸しの宿', loc:'埼玉県秩父市'},
        {cat:'旅館', name:'秩父温泉 ゆの宿 和どう', note:'秩父七湯のひとつ和銅鉱泉', loc:'埼玉県秩父市'},
        {cat:'ホテル', name:'ホテルルートインGrand秩父', note:'秩父駅ちかくの拠点宿', loc:'埼玉県秩父市'}
      ]
    },
    r8: {
      lead:'都をまもる四神と、<br>中央の社をむすぶ',
      whoFor:['京都をじっくり巡りたい人','厄除け・方除を願う人','歴史や由緒にふれたい人','電車で無理なく回りたい人','京料理も楽しみたい人'],
      trivia:'京都五社めぐりは、平安京を四方から守護する四神——北の玄武（上賀茂神社）、西の白虎（松尾大社）、南の朱雀（城南宮）、東の青龍（八坂神社）——に、中央の平安神宮を加えた巡拝です。',
      area:'八坂神社',
      eats:[
        {cat:'うなぎ', name:'炭火鰻 翠川 祗園八坂', note:'八坂神社ちかくの炭火鰻', loc:'京都府京都市東山区'},
        {cat:'京料理', name:'祇園 もりわき', note:'祇園の割烹', loc:'京都府京都市東山区'},
        {cat:'甘味', name:'甘味処 乃あん', note:'祇園の和カフェ', loc:'京都府京都市東山区'},
        {cat:'和菓子', name:'神馬堂', note:'明治5年創業／上賀茂神社門前のやきもち', loc:'京都府京都市北区'},
        {cat:'和菓子', name:'葵家やきもち総本舗 上賀茂本店', note:'上賀茂神社 鳥居前のやきもち', loc:'京都府京都市北区'},
        {cat:'和食', name:'魚末', note:'東山の魚料理', loc:'京都府京都市東山区'}
      ],
      stays:[
        {cat:'旅館', name:'柚子屋旅館', note:'八坂神社前の京旅館', loc:'京都府京都市東山区'},
        {cat:'旅館', name:'SOWAKA', note:'祇園・八坂の元料亭を生かした宿', loc:'京都府京都市東山区'},
        {cat:'ホテル', name:'THE JUNEI HOTEL Kyoto', note:'京の設えでもてなす小規模ホテル', loc:'京都府京都市'},
        {cat:'旅館', name:'十四春旅館', note:'東山の老舗旅館', loc:'京都府京都市東山区'},
        {cat:'旅館', name:'京の宿 祇園佐の', note:'祇園の町家宿', loc:'京都府京都市東山区'},
        {cat:'宿', name:'京小宿 八坂 ゆとね', note:'八坂ちかくの一棟貸し', loc:'京都府京都市東山区'}
      ]
    },
    r9: {
      lead:'富士の北麓、<br>ふたつの浅間をたずねる',
      whoFor:['金運を上げたい人','富士山の力を感じたい人','短時間で巡りたい人','世界文化遺産を訪ねたい人','仕事の転機を迎えた人'],
      trivia:'北口本宮冨士浅間神社は吉田口登山道の起点で、富士山世界文化遺産の構成資産のひとつです。新屋山神社の奥宮は、金運のお社として広く知られています。',
      area:'北口本宮冨士浅間神社',
      eats:[
        {cat:'吉田のうどん', name:'麺許皆伝', note:'富士吉田を代表するうどん店', loc:'山梨県富士吉田市'},
        {cat:'吉田のうどん', name:'ふもとや', note:'ごぼうのきんぴらが名物', loc:'山梨県富士吉田市'},
        {cat:'カフェ', name:'Fuuto Coffee&Bakeshop', note:'富士吉田の自家焙煎とパン', loc:'山梨県富士吉田市'},
        {cat:'すき焼き', name:'ふじ乃屋', note:'富士吉田のすき焼き・しゃぶしゃぶ', loc:'山梨県富士吉田市'},
        {cat:'カフェ', name:'Harukiya Coffee Roastery', note:'本町通りの焙煎所', loc:'山梨県富士吉田市'},
        {cat:'カフェ', name:'The Pleasure Garden Cafe', note:'富士山を望むカフェ', loc:'山梨県富士吉田市'}
      ],
      stays:[
        {cat:'ホテル', name:'富士山ステーションホテル', note:'富士山駅から徒歩2分', loc:'山梨県富士吉田市'},
        {cat:'ホテル', name:'ハイランドリゾート ホテル&スパ', note:'ふじやま温泉に隣接', loc:'山梨県富士吉田市'},
        {cat:'ホテル', name:'Megu Fuji Plus+', note:'富士吉田の眺望のよい宿', loc:'山梨県富士吉田市'},
        {cat:'旅館', name:'富士河口湖温泉郷 湖南荘', note:'河口湖畔の温泉宿', loc:'山梨県富士河口湖町'},
        {cat:'宿', name:'ホステル富士山・結', note:'富士吉田の町なかの宿', loc:'山梨県富士吉田市'},
        {cat:'ホテル', name:'BLANC FUJI', note:'富士山を望む小さな宿', loc:'山梨県富士吉田市'}
      ]
    },
    r10: {
      lead:'男体・女体、<br>ふたつの峰にのぼる',
      whoFor:['夫婦・カップルで訪れたい人','山歩きを楽しみたい人','縁結びを願う人','関東平野の眺めを見たい人','温泉もあわせて楽しみたい人'],
      trivia:'筑波山は男体山に伊弉諾尊、女体山に伊弉冉尊をお祀りし、ふたつの峰そのものが御神体です。『万葉集』にも詠まれ、「西の富士、東の筑波」と並び称されました。',
      area:'筑波山神社',
      eats:[
        {cat:'そば', name:'筑膳', note:'築100年の古民家／手打ち蕎麦と旬の山の幸', loc:'茨城県つくば市'},
        {cat:'うどん', name:'あんだ堂', note:'4代続く製麺工場が営むうどん・そば', loc:'茨城県つくば市'},
        {cat:'カフェ', name:'877Stand 筑波山山頂店', note:'筑波山山頂の眺望カフェ', loc:'茨城県つくば市'},
        {cat:'和食', name:'麦とろ まる信食堂', note:'筑波山ふもとの麦とろ', loc:'茨城県つくば市'},
        {cat:'和食', name:'とんとこ豚', note:'つくばの豚料理', loc:'茨城県つくば市'},
        {cat:'和食', name:'彩食工房ひるくらいむ', note:'つくばの創作和食', loc:'茨城県つくば市'}
      ],
      stays:[
        {cat:'ホテル', name:'ホテル一望', note:'筑波山中腹／関東平野を見晴らす宿', loc:'茨城県つくば市'},
        {cat:'宿', name:'古民家宿 旧小林邸ひととき', note:'筑波山ふもとの古民家宿', loc:'茨城県つくば市'},
        {cat:'温泉', name:'つくば温泉 喜楽里 別邸', note:'つくばの日帰り温泉と宿', loc:'茨城県つくば市'},
        {cat:'ホテル', name:'ホテル ベストランド', note:'つくば駅ちかくの拠点宿', loc:'茨城県つくば市'},
        {cat:'ホテル', name:'BEB5土浦 by 星野リゾート', note:'霞ヶ浦ちかくのカジュアルホテル', loc:'茨城県土浦市'},
        {cat:'グランピング', name:'筑波山ゲルグランピング', note:'筑波山を望むグランピング', loc:'茨城県石岡市'}
      ]
    }
  };
  window.WABI_ROUTE_EXTRA = EXTRA;

  // ── スタイル ─────────────────────────────────────────────
  var C = { bg:'#FAF8F4', main:'#6E4BA8', gold:'#C8A14A', text:'#2D2D2D', sub:'#6F6F6F', card:'#FFF' };
  var st = document.createElement('style');
  st.textContent = [
    "#wabiRoutePg{position:fixed;inset:0;z-index:310;background:"+C.bg+";display:none;overflow-y:auto;-webkit-overflow-scrolling:touch;font-family:'Shippori Mincho','Noto Serif JP',serif;color:"+C.text+";}",
    '#wabiRoutePg .wrp-in{max-width:500px;margin:0 auto;padding-bottom:48px;}',
    '#wabiRoutePg .wrp-hero{position:relative;width:100%;aspect-ratio:3/2;min-height:240px;background:#3a3025;background-size:cover;background-position:center center;background-repeat:no-repeat;}',
    '#wabiRoutePg .wrp-hero::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.35) 0%,rgba(0,0,0,0) 38%,rgba(0,0,0,.62) 100%);}',
    '#wabiRoutePg .wrp-top{position:absolute;top:14px;left:16px;right:16px;display:flex;align-items:center;justify-content:space-between;z-index:2;}',
    '#wabiRoutePg .wrp-ic{width:34px;height:34px;border-radius:50%;background:rgba(0,0,0,.34);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;color:#fff;font-size:17px;cursor:pointer;}',
    '#wabiRoutePg .wrp-ics{display:flex;gap:8px;}',
    '#wabiRoutePg .wrp-hcap{position:absolute;left:16px;right:16px;bottom:52px;z-index:2;}',
    '#wabiRoutePg .wrp-label{display:inline-block;background:'+C.main+';color:#fff;font-size:11px;font-weight:600;letter-spacing:.06em;padding:4px 11px;border-radius:12px;margin-bottom:9px;}',
    '#wabiRoutePg .wrp-title{color:#fff;font-size:24px;font-weight:700;line-height:1.3;text-shadow:0 2px 10px rgba(0,0,0,.4);}',
    '#wabiRoutePg .wrp-sub{color:rgba(255,255,255,.9);font-size:14px;font-weight:500;margin-top:6px;text-shadow:0 2px 8px rgba(0,0,0,.4);}',
    '#wabiRoutePg .wrp-body{padding:0 16px;}',
    '#wabiRoutePg .wrp-sec{margin-top:24px;}',
    '#wabiRoutePg .wrp-time{margin-top:-26px;position:relative;z-index:3;background:'+C.card+';border-radius:20px;box-shadow:0 8px 24px rgba(0,0,0,.06);padding:16px 18px;display:flex;align-items:center;gap:10px;}',
    '#wabiRoutePg .wrp-time .lb{font-size:13px;color:'+C.sub+';font-weight:500;flex:1;}',
    '#wabiRoutePg .wrp-time .vl{font-size:19px;font-weight:400;color:'+C.text+';}',
    '#wabiRoutePg .wrp-eyebrow{font-size:12px;font-weight:600;color:'+C.main+';letter-spacing:.06em;margin-bottom:8px;}',
    "#wabiRoutePg .wrp-h2{font-family:'Shippori Mincho','Noto Serif JP',serif;font-size:22px;font-weight:700;line-height:1.45;margin-bottom:14px;}",
    '#wabiRoutePg .wrp-p{font-size:15px;font-weight:400;line-height:1.7;color:'+C.text+';margin-bottom:14px;}',
    '#wabiRoutePg .wrp-h3{display:flex;align-items:center;gap:7px;font-size:18px;font-weight:700;margin-bottom:12px;}',
    '#wabiRoutePg .wrp-h3 .em{font-size:16px;}',
    '#wabiRoutePg .wrp-who{background:#F3F0FA;border-radius:20px;padding:18px 18px 16px;}',
    '#wabiRoutePg .wrp-who .it{display:flex;align-items:flex-start;gap:9px;font-size:14px;line-height:1.6;margin-top:11px;}',
    '#wabiRoutePg .wrp-who .it:first-of-type{margin-top:0;}',
    '#wabiRoutePg .wrp-ck{flex:0 0 18px;width:18px;height:18px;border-radius:50%;background:'+C.main+';color:#fff;display:flex;align-items:center;justify-content:center;font-size:10px;margin-top:2px;}',
    '#wabiRoutePg .wrp-spot{display:flex;gap:12px;background:'+C.card+';border-radius:20px;box-shadow:0 8px 24px rgba(0,0,0,.06);padding:12px;margin-bottom:12px;}',
    '#wabiRoutePg .wrp-spot .ph{position:relative;flex:0 0 96px;width:96px;height:96px;border-radius:14px;background:#e9e3d8 center/cover;overflow:hidden;}',
    '#wabiRoutePg .wrp-spot .no{position:absolute;top:6px;left:6px;width:22px;height:22px;border-radius:50%;background:'+C.main+';color:#fff;font-size:11px;font-weight:700;display:flex;align-items:center;justify-content:center;}',
    '#wabiRoutePg .wrp-spot .nm{font-size:16px;font-weight:700;line-height:1.35;}',
    '#wabiRoutePg .wrp-spot .bn{display:inline-block;font-size:12px;font-weight:600;color:'+C.gold+';margin:3px 0 5px;}',
    '#wabiRoutePg .wrp-spot .tx{font-size:13px;font-weight:400;line-height:1.65;color:'+C.sub+';}',
    '#wabiRoutePg .wrp-tri{background:#F6F3FC;border:1px solid #E2D9F2;border-radius:20px;padding:16px 18px;}',
    '#wabiRoutePg .wrp-tri .tt{display:flex;align-items:center;gap:7px;font-size:14px;font-weight:700;margin-bottom:9px;}',
    '#wabiRoutePg .wrp-tri .tx{font-size:13px;line-height:1.75;color:#4A4458;}',
    '#wabiRoutePg .wrp-cta{width:100%;background:'+C.main+';color:#fff;border:none;border-radius:16px;padding:16px;font-size:15px;font-weight:700;display:flex;align-items:center;justify-content:center;gap:8px;cursor:pointer;font-family:inherit;box-shadow:0 8px 24px rgba(110,75,168,.28);}',
    '#wabiRoutePg .wrp-cta:active{transform:scale(.99);}',
    "#wabiRoutePg .wrp-cta2{width:100%;margin-top:12px;height:56px;border-radius:28px;background:#5E3A8A;color:#fff;border:none;font-family:'Shippori Mincho',serif;font-size:16px;font-weight:700;letter-spacing:.06em;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;box-shadow:0 4px 14px rgba(94,58,138,.3);}",
    "#wabiRoutePg .wrp-cta2:active{transform:scale(.99);}",
    '#wabiRoutePg .wrp-scroll{display:flex;gap:12px;overflow-x:auto;padding-bottom:6px;margin:0 -16px;padding-left:16px;padding-right:16px;-webkit-overflow-scrolling:touch;}',
    '#wabiRoutePg .wrp-scroll::-webkit-scrollbar{display:none;}',
    '#wabiRoutePg .wpc{flex:0 0 152px;width:152px;background:'+C.card+';border-radius:20px;box-shadow:0 8px 24px rgba(0,0,0,.06);overflow:hidden;cursor:pointer;text-decoration:none;color:inherit;display:block;}',
    '#wabiRoutePg .wpc .im{height:92px;display:flex;align-items:center;justify-content:center;font-size:26px;background-size:cover;background-position:center;}',
    '#wabiRoutePg .wpc .bd{padding:10px 11px 12px;}',
    '#wabiRoutePg .wpc .ct{font-size:11px;font-weight:600;color:'+C.sub+';}',
    '#wabiRoutePg .wpc .nm{font-size:13px;font-weight:700;line-height:1.4;margin:3px 0 5px;}',
    '#wabiRoutePg .wpc .nt{font-size:11px;font-weight:400;line-height:1.5;color:'+C.sub+';}',
    '#wabiRoutePg .wpc .lc{font-size:11px;color:'+C.gold+';font-weight:600;margin-top:6px;}',
    '#wabiRoutePg .wpc.more .im{background:#EFEAF8;color:'+C.main+';}',
    '#wabiRoutePg .wrp-spot{cursor:pointer;align-items:center;}',
    '#wabiRoutePg .wrp-spot:active{transform:scale(.995);}',
    '#wabiRoutePg .wrp-spot .ar{flex:0 0 14px;color:#bbb;font-size:20px;line-height:1;}',
    '#wabiRoutePg .wpc{position:relative;display:flex;flex-direction:column;}',
    '#wabiRoutePg .wpc .im,#wabiRoutePg .wpc .bd{cursor:pointer;}',
    '#wabiRoutePg .wpc .bd{flex:1;}',
    '#wabiRoutePg .wpc .rt{font-size:11px;font-weight:600;color:'+C.gold+';margin-bottom:4px;}',
    '#wabiRoutePg .wpc .rt span{color:#9a9a9a;font-weight:400;}',
    "#wabiRoutePg .wpc-add{margin:0 11px 12px;padding:8px 0;border-radius:12px;border:1px solid "+C.main+";background:#fff;color:"+C.main+";font-family:inherit;font-size:11.5px;font-weight:700;cursor:pointer;}",
    "#wabiRoutePg .wpc-add.on{background:"+C.main+";color:#fff;}",
    '#wabiRoutePg .wrp-added{margin-bottom:10px;}',
    '#wabiRoutePg .wrp-added .tt{font-size:12px;font-weight:700;color:'+C.sub+';margin-bottom:7px;}',
    "#wabiRoutePg .wrp-added .chip{display:inline-block;background:#EFEAF8;color:"+C.main+";font-size:12px;font-weight:600;padding:5px 11px;border-radius:12px;margin:0 6px 6px 0;}",
    "#wabiRoutePg .wrp-h3 .wk{margin-left:auto;font-size:10.5px;font-weight:600;color:"+C.main+";background:#EFEAF8;padding:3px 9px;border-radius:10px;}",
    '#wabiRoutePg .wrp-note{font-size:11px;color:#9a9a9a;line-height:1.6;margin-top:10px;}'
  ].join('');
  document.head.appendChild(st);

  var pg = document.createElement('div');
  pg.id = 'wabiRoutePg';
  pg.innerHTML = '<div class="wrp-in" id="wrpIn"></div>';
  document.body.appendChild(pg);

  function esc(s){ return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  function gmap(q){ return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(q); }
  function transIcon(t){ return t === '徒歩' ? '🚶' : t === '電車' ? '🚃' : t === 'バス' ? '🚌' : '🚗'; }
  function catIcon(c){
    if (/うどん|そば|麺/.test(c)) return '🍜';
    if (/うなぎ|かつ|和食|京料理|食堂/.test(c)) return '🍱';
    if (/甘味|茶屋|カフェ/.test(c)) return '🍡';
    if (/ビール|酒/.test(c)) return '🍺';
    if (/宿坊/.test(c)) return '🏯';
    if (/旅館/.test(c)) return '♨️';
    return '🏨';
  }
  var TINT = ['#FBF3E7','#F3F0FA','#EEF4F0','#FAF0F0','#F1F1F7','#F7F2EA'];

  function spotCard(s, i){
    var ph = s.photo ? ' style="background-image:url(\'' + esc(s.photo) + '\')"' : '';
    var tx = (s.deity ? esc(s.deity) + 'をお祀りするお社。' : '') + (s.benefit ? esc(s.benefit) + 'のご利益で知られます。' : '');
    return '<div class="wrp-spot" data-spot="' + i + '">'
      + '<div class="ph"' + ph + '><div class="no">' + (i + 1) + '</div></div>'
      + '<div style="flex:1;min-width:0">'
        + '<div class="nm">' + esc(s.name) + '</div>'
        + (s.benefit ? '<div class="bn">' + esc(s.benefit) + '</div>' : '')
        + '<div class="tx">' + tx + '</div>'
      + '</div><div class="ar">›</div></div>';
  }

  // ── ルートに追加したスポットの保存 ──────────────────────
  var LS_ADD = 'wabiRouteExtras';
  function loadAdd(){
    try { var o = JSON.parse(localStorage.getItem(LS_ADD) || '{}'); return (o && typeof o === 'object') ? o : {}; }
    catch(e){ return {}; }
  }
  function saveAdd(o){ try { localStorage.setItem(LS_ADD, JSON.stringify(o)); } catch(e){} }
  function addedList(rid){ var o = loadAdd(); return o[rid] || []; }
  function isAdded(rid, name){ return addedList(rid).some(function(p){ return p.name === name; }); }
  function toggleAdd(rid, p){
    var o = loadAdd(), a = o[rid] || [];
    var i = -1; a.forEach(function(x, k){ if (x.name === p.name) i = k; });
    if (i >= 0) a.splice(i, 1); else a.push({ name: p.name, loc: p.loc || '' });
    o[rid] = a; saveAdd(o);
    return i < 0;
  }

  function placeCard(p, i){
    var q = p.name + ' ' + (p.loc || '');
    return '<div class="wpc" data-q="' + esc(q) + '" data-name="' + esc(p.name) + '" data-loc="' + esc(p.loc || '') + '">'
      + '<div class="im" data-gmap="' + esc(q) + '" style="background-color:' + TINT[i % TINT.length] + '">' + catIcon(p.cat) + '</div>'
      + '<div class="bd" data-gmap="' + esc(q) + '"><div class="ct">' + esc(p.cat) + '</div>'
      + '<div class="nm">' + esc(p.name) + '</div>'
      + '<div class="rt"></div>'
      + '<div class="nt">' + esc(p.note) + '</div>'
      + '<div class="lc">' + esc(p.loc) + '</div></div>'
      + '<button class="wpc-add" type="button">＋ ルートに追加</button></div>';
  }

  // ── 毎週更新：週番号でリストを回転させ、その週の分を表示する ──
  var SHOW = 3;   // 1週あたりに出す件数
  function weekIndex(){
    // 1970-01-05(月)を起点にした通し週番号
    return Math.floor((Date.now() - 4 * 864e5) / (7 * 864e5));
  }
  function weeklyPick(arr){
    if (!arr || !arr.length) return [];
    var w = weekIndex(), n = arr.length;
    var k = ((w % n) + n) % n;
    return arr.slice(k).concat(arr.slice(0, k)).slice(0, SHOW);
  }

  function scrollSec(icon, title, items, minRating){
    items = weeklyPick(items);
    if (!items.length) return '';
    var h = '<div class="wrp-sec"><div class="wrp-h3"><span class="em">' + icon + '</span>' + title
          + '<span class="wk">毎週更新</span></div>'
          + '<div class="wrp-scroll"' + (minRating ? ' data-min="' + minRating + '"' : '') + '>';
    h += items.map(placeCard).join('');
    h += '</div></div>';
    return h;
  }

  // Google Placesから写真と評価を取得し、★4.0未満のスポットは非表示にする
  function fillPlacePhotos(root, rid){
    var cards = root.querySelectorAll('.wpc[data-q]');
    if (!window.google || !google.maps || !google.maps.places) {
      cards.forEach(function(c){ c.style.display = ''; });   // 取得できない環境では全件表示
      return;
    }
    var svc = new google.maps.places.PlacesService(document.createElement('div'));
    cards.forEach(function(card){
      if (card.getAttribute('data-done')) return;
      card.setAttribute('data-done', '1');
      svc.findPlaceFromQuery({ query: card.getAttribute('data-q'), fields: ['photos', 'rating', 'user_ratings_total'] }, function(res, stt){
        var ok = (stt === google.maps.places.PlacesServiceStatus.OK && res && res[0]);
        var rating = ok && res[0].rating ? res[0].rating : 0;
        var sc = card.parentNode;
        var min = sc && sc.getAttribute ? parseFloat(sc.getAttribute('data-min') || '0') : 0;
        // 評価が取得できて、基準を下回るスポットは表示しない
        if (min && rating && rating < min) { card.style.display = 'none'; hideEmptySections(root); return; }
        card.style.display = '';
        if (!ok) { hideEmptySections(root); return; }
        if (res[0].photos && res[0].photos.length) {
          var im = card.querySelector('.im');
          if (im) { im.style.backgroundImage = 'url(' + res[0].photos[0].getUrl({ maxWidth: 400 }) + ')'; im.textContent = ''; }
        }
        var rt = card.querySelector('.rt');
        if (rt) rt.innerHTML = '★ ' + rating.toFixed(1) + (res[0].user_ratings_total ? ' <span>(' + res[0].user_ratings_total.toLocaleString() + ')</span>' : '');
        hideEmptySections(root);
      });
    });
  }

  // 中身が全部消えたセクションは見出しごと隠す
  function hideEmptySections(root){
    root.querySelectorAll('.wrp-scroll').forEach(function(sc){
      var vis = [].filter.call(sc.querySelectorAll('.wpc'), function(c){ return c.style.display !== 'none'; }).length;
      var sec = sc.closest('.wrp-sec');
      if (sec) sec.style.display = vis ? '' : 'none';
    });
  }

  // Googleマップのルートを組み立てる（追加スポットも経由地に含める）
  function buildRouteUrl(r){
    var names = (r.spots || []).map(function(s){ return String(s.name).replace(/[（(].*$/, '').trim(); });
    var extras = addedList(r.id).map(function(p){ return p.name + ' ' + (p.loc || ''); });
    var all = names.concat(extras);
    if (!all.length) return null;
    if (all.length === 1) return gmap(all[0]);
    var mode = r.transport === '徒歩' ? 'walking' : 'driving';
    var u = 'https://www.google.com/maps/dir/?api=1'
          + '&origin=' + encodeURIComponent(all[0])
          + '&destination=' + encodeURIComponent(all[all.length - 1])
          + '&travelmode=' + mode;
    var way = all.slice(1, -1);
    if (way.length) u += '&waypoints=' + way.slice(0, 9).map(encodeURIComponent).join('%7C');
    return u;
  }

  // 神社カード → 既存の神社詳細ページを開く
  function openSpotDetail(s){
    var t = null;
    try {
      if (typeof SHRINES !== 'undefined') {
        t = SHRINES.filter(function(x){ return x.name === s.name; })[0]
         || SHRINES.filter(function(x){ return s.name.indexOf(x.name) >= 0 || x.name.indexOf(s.name) >= 0; })[0];
      }
    } catch(e){}
    if (!t) {
      t = { rank: 0, name: s.name, deity: s.deity || '—', addr: s.addr || '',
            map: gmap(s.name), area: '', rating: 0, rev: 0, visited: false,
            tags: ['goshuin'], lat: s.lat || null, lng: s.lng || null };
    }
    closePage();
    if (typeof openShrineDetail === 'function') openShrineDetail(t);
  }

  function render(r){
    var x = EXTRA[r.id] || {};
    var totalMove = String(r.totalMove || '').replace(/^総移動時間\s*/, '') || r.time || '';
    var sub = String(r.cardDesc || '').replace(/<br\s*\/?>/g, ' ');
    var area = x.area || (r.spots && r.spots[0] ? r.spots[0].name : r.name);

    var hero = (r.spots && r.spots[0] && r.spots[0].photo) ? r.spots[0].photo : r.cardImg;

    var h = '';
    // ① ヒーロー（1社目の実写を使う）
    h += '<div class="wrp-hero" style="background-image:url(\'' + esc(hero) + '\')">'
       +   '<div class="wrp-top"><div class="wrp-ic" id="wrpBack">‹</div></div>'
       +   '<div class="wrp-hcap"><span class="wrp-label">おすすめ巡礼ルート</span>'
       +     '<div class="wrp-title">' + esc(r.name) + '</div>'
       +     '<div class="wrp-sub">' + esc(sub) + '</div></div>'
       + '</div>';

    h += '<div class="wrp-body">';

    // ② 総移動時間の目安
    h += '<div class="wrp-time"><span style="font-size:16px">🕐</span>'
       +   '<span class="lb">総移動時間の目安</span>'
       +   '<span class="vl">' + esc(totalMove) + '</span>'
       +   '<span style="font-size:16px">' + transIcon(r.transport) + '</span></div>';

    // ③ このルートについて
    h += '<div class="wrp-sec"><div class="wrp-eyebrow">このルートについて</div>'
       +   '<div class="wrp-h2">' + (x.lead || esc(r.name)) + '</div>';
    String(r.desc || '').split('。').filter(function(t){ return t.trim(); }).forEach(function(t, i, a){
      h += '<div class="wrp-p">' + esc(t.trim()) + (i === a.length - 1 && !/[。！？]$/.test(t) ? '。' : '。') + '</div>';
    });
    h += '</div>';

    // ④ こんな人におすすめ
    if (x.whoFor && x.whoFor.length) {
      h += '<div class="wrp-sec"><div class="wrp-who"><div class="wrp-h3" style="margin-bottom:14px"><span class="em">⛩</span>こんな人におすすめ</div>';
      x.whoFor.forEach(function(w){ h += '<div class="it"><span class="wrp-ck">✓</span><span>' + esc(w) + '</span></div>'; });
      h += '</div></div>';
    }

    // ⑤ めぐる神社
    h += '<div class="wrp-sec"><div class="wrp-h3" style="color:' + C.main + ';border-bottom:1px solid #E4DCF2;padding-bottom:8px">めぐる神社</div>';
    (r.spots || []).forEach(function(s, i){ h += spotCard(s, i); });
    h += '</div>';

    // ⑥ 知っておきたい豆知識
    if (x.trivia) {
      h += '<div class="wrp-sec"><div class="wrp-tri"><div class="tt"><span>💡</span>知っておきたい豆知識</div>'
         +   '<div class="tx">' + esc(x.trivia) + '</div></div></div>';
    }

    // ⑦⑧ 周辺スポット・宿泊施設
    h += scrollSec('📍', 'この近くのおすすめスポット', x.eats || [], 4);
    h += scrollSec('🛏', 'この近くのおすすめ宿泊施設', x.stays || [], 4);

    // ⑨ ページ最下部：このルートを作成
    h += '<div class="wrp-sec"><div class="wrp-added" id="wrpAdded"></div>'
       +   '<button class="wrp-cta2" id="wrpSelect">このルートを作成 →</button></div>';

    h += '<div class="wrp-note">※ 掲載している店舗・宿泊施設はすべて実在の施設です。Google の評価が★4.0以上のスポットのみ表示しています。営業時間・定休日・料金は変わることがあるため、お出かけ前に公式情報をご確認ください。</div>';
    h += '</div>';

    document.getElementById('wrpIn').innerHTML = h;

    var inEl = document.getElementById('wrpIn');
    document.getElementById('wrpBack').onclick = closePage;

    // 神社カード → 神社詳細ページ
    inEl.querySelectorAll('.wrp-spot').forEach(function(el){
      el.onclick = function(){ openSpotDetail((r.spots || [])[+el.getAttribute('data-spot')]); };
    });

    // 追加済みスポットの表示更新
    function paintAdded(){
      var a = addedList(r.id);
      var box = document.getElementById('wrpAdded');
      if (box) {
        box.innerHTML = a.length
          ? '<div class="tt">ルートに追加したスポット</div>' + a.map(function(p){ return '<span class="chip">' + esc(p.name) + '</span>'; }).join('')
          : '';
      }
      inEl.querySelectorAll('.wpc').forEach(function(c){
        var on = isAdded(r.id, c.getAttribute('data-name'));
        var b = c.querySelector('.wpc-add');
        if (b) { b.textContent = on ? '✓ 追加済み' : '＋ ルートに追加'; b.className = 'wpc-add' + (on ? ' on' : ''); }
      });
    }

    // スポットカード：本体タップでGoogleマップ、ボタンでルートに追加
    inEl.querySelectorAll('.wpc').forEach(function(c){
      c.querySelectorAll('[data-gmap]').forEach(function(t){
        t.onclick = function(){ window.open(gmap(t.getAttribute('data-gmap')), '_blank', 'noopener'); };
      });
      var btn = c.querySelector('.wpc-add');
      if (btn) btn.onclick = function(ev){
        ev.stopPropagation();
        var on = toggleAdd(r.id, { name: c.getAttribute('data-name'), loc: c.getAttribute('data-loc') });
        paintAdded();
        if (typeof showToast === 'function') showToast(on ? 'ルートに追加しました' : 'ルートから外しました');
      };
    });

    // ページ最下部：このルートを作成 → Googleマップで表示
    document.getElementById('wrpSelect').onclick = function(){
      var u = buildRouteUrl(r);
      if (u) window.open(u, '_blank', 'noopener');
      else if (typeof showToast === 'function') showToast('ルートを組み立てられませんでした');
    };

    paintAdded();
    fillPlacePhotos(inEl, r.id);
    setTimeout(function(){ fillPlacePhotos(inEl, r.id); paintAdded(); }, 1500);
  }

  function closePage(){
    pg.style.display = 'none';
    if (typeof updateFabVisibility === 'function') updateFabVisibility();
  }

  // ── ルートカードのタップ先を「1記事1ルート」に差し替え ──────
  window.wabiOpenRoute = function(rid){
    var routes = window.AI_ROUTES || [];
    var r = null;
    for (var i = 0; i < routes.length; i++) if (routes[i].id === rid) r = routes[i];
    if (!r) { if (typeof showToast === 'function') showToast('ルート情報を取得できませんでした'); return; }
    render(r);
    pg.style.display = 'block';
    pg.scrollTop = 0;
    var fab = document.getElementById('fabMap');
    if (fab) fab.style.display = 'none';
  };
})();


/* ══════════════════════════════════════════════════════════════
   わびなび：巡礼レベル ＆ EXPシステム
   ・レベル計算／EXP付与関数／履歴／管理用のEXP値変更に対応
   ・データはすべて localStorage。将来Supabaseへ移すときは
     store()/persist() の2か所を差し替えれば済む構造にしてある。
   （2026-07-27 追加 / index.html は触らず concierge.js から上書き）
   ══════════════════════════════════════════════════════════════ */
(function(){
  if (window.WabiExp) return;

  var C = { purple:'#6E4BA8', gold:'#C9A24A', text:'#2D2D2D', mute:'#7A7A7A', bg:'#F8F6F2', card:'#FFF' };

  // ── ① レベル計算 ───────────────────────────────────────────
  // 指定のアンカーを必ず通る、なめらかな右肩上がりカーブ
  // 必要EXP（累計） = A * exp(b*u + c*u^2)  ／ u = ln(L-1)
  // 指定のめやす（Lv2:100, Lv3:250, Lv5:700, Lv10:2500, Lv20:9000,
  // Lv30:20000, Lv50:60000, Lv100:250000）に最小二乗で合わせた、なめらかな曲線。
  // 1レベルごとの必要EXPが常に増えていく（途中で軽くならない）。
  var LV_A = 4.614750, LV_B = 1.237153, LV_C = 0.101172;
  var MAXLV = 100;

  function totalForLevel(L){
    if (L <= 1) return 0;
    if (L > MAXLV) L = MAXLV;
    var u = Math.log(L - 1);
    return Math.round(Math.exp(LV_A + LV_B * u + LV_C * u * u) / 10) * 10;
  }
  function levelOf(exp){
    var L = 1;
    for (var i = 2; i <= MAXLV; i++){ if (exp >= totalForLevel(i)) L = i; else break; }
    return L;
  }
  function progressOf(exp){
    var L = levelOf(exp);
    if (L >= MAXLV) return { level: MAXLV, cur: 0, need: 0, toNext: 0, pct: 100, total: exp };
    var base = totalForLevel(L), next = totalForLevel(L + 1);
    return {
      level: L, cur: exp - base, need: next - base, toNext: next - exp,
      pct: Math.max(0, Math.min(100, Math.round((exp - base) / (next - base) * 100))),
      total: exp
    };
  }

  // ── ② EXP取得ルール（管理側から値を変更できる） ─────────────
  var GROUPS = {
    daily:     '毎日・閲覧',
    post:      '投稿',
    visit:     '神社巡り',
    community: 'コミュニティ',
    affiliate: '予約・お買い物',
    invite:    '友達紹介'
  };
  var DEFAULT_RULES = {
    login:            { exp:5,    label:'ログイン',                 group:'daily',     icon:'⛩',  limit:1  },
    view_top:         { exp:2,    label:'トップページ閲覧',           group:'daily',     icon:'🏠', limit:1  },
    ai_route:         { exp:15,   label:'AIルート検索',              group:'daily',     icon:'✦',  limit:3  },
    read_article:     { exp:5,    label:'記事を読む',                group:'daily',     icon:'📖', limit:5  },
    read_article_end: { exp:5,    label:'記事を最後まで読む',          group:'daily',     icon:'📗', limit:5  },
    view_spot:        { exp:3,    label:'おすすめスポットを見る',      group:'daily',     icon:'📍', limit:10 },
    view_shrine:      { exp:3,    label:'神社詳細を見る',             group:'daily',     icon:'⛩',  limit:10 },
    bookmark:         { exp:8,    label:'お気に入りに保存',            group:'daily',     icon:'★'            },
    save_route:       { exp:15,   label:'ルート保存',                group:'daily',     icon:'🗺'           },
    post_photo:       { exp:50,   label:'神社仏閣の写真投稿',          group:'post',      icon:'📷'           },
    post_goshuin:     { exp:80,   label:'御朱印の写真投稿',            group:'post',      icon:'🖌'           },
    got_like:         { exp:3,    label:'投稿にいいねされる',          group:'post',      icon:'♡'            },
    got_comment:      { exp:5,    label:'コメントされる',             group:'post',      icon:'💬'           },
    do_comment:       { exp:5,    label:'自分がコメントする',          group:'post',      icon:'✎'            },
    post_popular:     { exp:100,  label:'投稿が人気になる（100いいね）', group:'post',    icon:'🔥'           },
    visit_record:     { exp:80,   label:'参拝記録を追加',             group:'visit',     icon:'🙏'           },
    goshuin_record:   { exp:100,  label:'御朱印を登録',               group:'visit',     icon:'📕'           },
    route_complete:   { exp:150,  label:'AIルートで巡拝完了',          group:'visit',     icon:'🏁'           },
    new_pref:         { exp:100,  label:'初めての都道府県を訪れる',     group:'visit',     icon:'🗾'           },
    all_pref:         { exp:3000, label:'全国都道府県 巡礼コンプリート', group:'visit',    icon:'👑'           },
    follow:           { exp:10,   label:'ユーザーをフォロー',          group:'community', icon:'＋', limit:10 },
    gain_follower:    { exp:15,   label:'フォロワー獲得',             group:'community', icon:'👥'           },
    profile_100:      { exp:100,  label:'プロフィール設定100%',        group:'community', icon:'✓', once:true },
    buy_rakuten:      { exp:20,   label:'楽天で商品購入',             group:'affiliate', icon:'🛍', note:'成果確定後' },
    book_rakuten:     { exp:80,   label:'楽天トラベルで予約',          group:'affiliate', icon:'♨️', note:'成果確定後' },
    book_tour:        { exp:120,  label:'ツアー予約',                group:'affiliate', icon:'🚌', note:'成果確定後' },
    referral_buy:     { exp:30,   label:'紹介リンクから購入',          group:'affiliate', icon:'🔗', note:'成果確定後' },
    invite_sender:    { exp:300,  label:'友達を紹介した',             group:'invite',    icon:'🎁', note:'紹介成立時' },
    invite_receiver:  { exp:100,  label:'紹介されて登録した',          group:'invite',    icon:'🎉', note:'紹介成立時' }
  };

  // ── ③ 保存（将来Supabaseに差し替える場所はここだけ）─────────
  var LS_STATE = 'wabiExpState';
  var LS_RULES = 'wabiExpRules';   // 管理画面からの上書き値

  function store(){
    try {
      var o = JSON.parse(localStorage.getItem(LS_STATE) || '{}');
      if (!o || typeof o !== 'object') o = {};
      o.total   = o.total   || 0;
      o.history = o.history || [];
      o.daily   = o.daily   || {};
      o.once    = o.once    || {};
      o.invites = o.invites || 0;
      return o;
    } catch(e){ return { total:0, history:[], daily:{}, once:{}, invites:0 }; }
  }
  function persist(o){ try { localStorage.setItem(LS_STATE, JSON.stringify(o)); } catch(e){} }

  function rules(){
    var r = {}, k;
    for (k in DEFAULT_RULES) r[k] = JSON.parse(JSON.stringify(DEFAULT_RULES[k]));
    try {
      var ov = JSON.parse(localStorage.getItem(LS_RULES) || '{}');
      for (k in ov){
        if (!r[k]) r[k] = { label:k, group:'daily', icon:'✦' };
        if (typeof ov[k] === 'number') r[k].exp = ov[k];
        else for (var f in ov[k]) r[k][f] = ov[k][f];
      }
    } catch(e){}
    return r;
  }
  function today(){
    var d = new Date();
    return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);
  }

  // ── ④ EXP付与（すべてここを通す）─────────────────────────
  function addExp(key, opts){
    opts = opts || {};
    var R = rules(), rule = R[key];
    if (!rule) return null;
    var st = store(), day = today();

    if (rule.once && st.once[key]) return null;
    if (rule.limit){
      st.daily[day] = st.daily[day] || {};
      if ((st.daily[day][key] || 0) >= rule.limit) return null;
      st.daily[day][key] = (st.daily[day][key] || 0) + 1;
      // 古い日付は7日分だけ残す
      var days = Object.keys(st.daily).sort();
      while (days.length > 7) { delete st.daily[days.shift()]; }
    }
    if (rule.once) st.once[key] = 1;

    var gained = (typeof opts.exp === 'number') ? opts.exp : rule.exp;
    var before = progressOf(st.total);
    st.total += gained;
    var after = progressOf(st.total);

    st.history.unshift({ t: Date.now(), k: key, e: gained, l: rule.label, i: rule.icon || '✦' });
    if (st.history.length > 200) st.history.length = 200;
    persist(st);

    if (opts.silent !== true && typeof showToast === 'function') showToast('＋' + gained + ' EXP　' + rule.label);
    if (after.level > before.level && typeof showToast === 'function'){
      setTimeout(function(){ showToast('🎉 巡礼レベル ' + after.level + ' になりました'); }, 1200);
    }
    refreshMypageExp();
    return { gained: gained, total: st.total, level: after.level, levelUp: after.level > before.level };
  }

  // ── 公開API ───────────────────────────────────────────────
  window.WabiExp = {
    add: addExp,
    total: function(){ return store().total; },
    level: function(){ return levelOf(store().total); },
    progress: function(){ return progressOf(store().total); },
    history: function(n){ return store().history.slice(0, n || 50); },
    rules: rules,
    groups: GROUPS,
    totalForLevel: totalForLevel,
    // 管理画面用：EXP値の変更／新しいイベントの追加
    setExp: function(key, exp){
      var ov = {}; try { ov = JSON.parse(localStorage.getItem(LS_RULES) || '{}'); } catch(e){}
      ov[key] = ov[key] || {}; ov[key].exp = exp;
      localStorage.setItem(LS_RULES, JSON.stringify(ov)); return rules()[key];
    },
    addRule: function(key, def){
      var ov = {}; try { ov = JSON.parse(localStorage.getItem(LS_RULES) || '{}'); } catch(e){}
      ov[key] = def; localStorage.setItem(LS_RULES, JSON.stringify(ov)); return rules()[key];
    },
    invites: function(){ return store().invites; },
    addInvite: function(){ var st = store(); st.invites++; persist(st); addExp('invite_sender'); return st.invites; },
    reset: function(){ localStorage.removeItem(LS_STATE); refreshMypageExp(); }
  };

  // ── ⑤ 自動付与（既存の機能にひっかける）────────────────────
  function hookFn(name, key){
    var orig = window[name];
    if (typeof orig !== 'function') return;
    window[name] = function(){
      var r = orig.apply(this, arguments);
      try { addExp(key, { silent:true }); } catch(e){}
      return r;
    };
  }
  setTimeout(function(){
    addExp('login',    { silent:true });
    addExp('view_top', { silent:true });
    hookFn('openShrineDetail', 'view_shrine');
    hookFn('generateRoute',    'ai_route');
    hookFn('saveRoute',        'save_route');
    hookFn('saveVisit',        'visit_record');
    hookFn('sdVisited',        'visit_record');
    // お気に入り登録（登録時のみ）
    var _bm = window.sdBookmark;
    if (typeof _bm === 'function'){
      window.sdBookmark = function(){
        var beforeN = 0;
        try { beforeN = JSON.parse(localStorage.getItem('wabiFavorites') || '[]').length; } catch(e){}
        var r = _bm.apply(this, arguments);
        try {
          var afterN = JSON.parse(localStorage.getItem('wabiFavorites') || '[]').length;
          if (afterN > beforeN) addExp('bookmark', { silent:true });
        } catch(e){}
        return r;
      };
    }
    // おすすめスポットのタップ
    document.addEventListener('click', function(ev){
      var t = ev.target;
      while (t && t !== document.body){
        if (t.classList && t.classList.contains('wpc')) { addExp('view_spot', { silent:true }); return; }
        t = t.parentElement;
      }
    }, true);
    // このルートを作成
    document.addEventListener('click', function(ev){
      if (ev.target && ev.target.id === 'wrpSelect') addExp('save_route', { silent:true });
    }, true);
  }, 1500);

  // 「PILGRIM LEVEL」の表記を「巡礼レベル」に
  function fixLevelLabel(){
    document.querySelectorAll('div,span,p').forEach(function(el){
      if (el.children.length === 0 && /PILGRIM LEVEL/.test(el.textContent)){
        el.textContent = el.textContent.replace('PILGRIM LEVEL', '巡礼レベル');
        el.style.letterSpacing = '.12em';
      }
    });
  }
  setTimeout(fixLevelLabel, 1200);
  setTimeout(fixLevelLabel, 3000);

  // ── ⑥ 画面まわり ──────────────────────────────────────────
  var css = document.createElement('style');
  css.textContent = [
    // マイページのレベル欄
    '.mp-exp-head{font-family:\'Shippori Mincho\',serif;font-size:13px;font-weight:700;color:' + C.text + ';letter-spacing:.12em;margin-bottom:9px;}',
    '.mp-exp-links{display:flex;gap:10px;margin-top:12px;}',
    '.mp-exp-links a{flex:1;text-align:center;padding:10px 6px;border-radius:14px;border:1px solid #e6dcc6;background:#fff;',
      'font-family:\'Noto Serif JP\',serif;font-size:12px;font-weight:700;color:' + C.purple + ';cursor:pointer;text-decoration:none;}',
    '.mp-exp-links a.gold{border-color:' + C.gold + ';color:#8a6d3b;background:#fffdf7;}',
    // 共通ページ
    '.wx-pg{position:fixed;inset:0;z-index:320;background:' + C.bg + ';display:none;overflow-y:auto;-webkit-overflow-scrolling:touch;',
      'font-family:\'Shippori Mincho\',\'Noto Serif JP\',serif;color:' + C.text + ';}',
    '.wx-hd{position:sticky;top:0;z-index:5;background:' + C.bg + ';display:flex;align-items:center;gap:10px;padding:16px;border-bottom:1px solid #ece4d3;}',
    '.wx-hd .b{font-size:22px;cursor:pointer;line-height:1;color:' + C.text + ';}',
    '.wx-hd .t{font-size:15px;font-weight:800;letter-spacing:.1em;}',
    '.wx-in{max-width:500px;margin:0 auto;padding:18px 16px 48px;}',
    '.wx-sec{margin-bottom:26px;}',
    '.wx-h{font-size:16px;font-weight:700;margin-bottom:10px;display:flex;align-items:center;gap:7px;}',
    '.wx-p{font-size:13.5px;line-height:1.85;color:#4a4a4a;font-family:\'Noto Serif JP\',serif;}',
    '.wx-card{background:' + C.card + ';border-radius:20px;box-shadow:0 8px 24px rgba(0,0,0,.06);padding:18px;}',
    // レベルカード
    '.wx-lvcard{background:linear-gradient(135deg,#fff,#fbf7ef);border:1px solid #ece4d3;border-radius:20px;padding:18px;box-shadow:0 8px 24px rgba(0,0,0,.06);}',
    '.wx-lvtop{display:flex;align-items:baseline;justify-content:space-between;margin-bottom:9px;}',
    '.wx-lv{font-size:22px;font-weight:700;color:' + C.purple + ';}',
    '.wx-next{font-size:12px;color:' + C.mute + ';font-family:\'Noto Serif JP\',serif;}',
    '.wx-next b{color:' + C.gold + ';}',
    '.wx-bar{height:8px;border-radius:6px;background:#e9e2d7;overflow:hidden;}',
    '.wx-fill{height:100%;border-radius:6px;background:linear-gradient(90deg,' + C.purple + ',' + C.gold + ');width:0;transition:width 1.1s cubic-bezier(.22,.61,.36,1);}',
    '.wx-tot{font-size:11.5px;color:' + C.mute + ';margin-top:8px;font-family:\'Noto Serif JP\',serif;}',
    // EXP一覧カード
    '.wx-gname{font-size:12px;font-weight:700;color:' + C.purple + ';letter-spacing:.08em;margin:16px 0 9px;}',
    '.wx-grid{display:grid;grid-template-columns:1fr 1fr;gap:9px;}',
    '.wx-item{background:' + C.card + ';border-radius:16px;box-shadow:0 4px 14px rgba(0,0,0,.05);padding:12px 12px 11px;}',
    '.wx-item .ic{font-size:17px;}',
    '.wx-item .lb{font-size:12px;font-weight:600;line-height:1.45;margin:5px 0 4px;font-family:\'Noto Serif JP\',serif;}',
    '.wx-item .ex{font-size:14px;font-weight:700;color:' + C.gold + ';}',
    '.wx-item .nt{font-size:10px;color:#a09a90;margin-top:3px;font-family:\'Noto Serif JP\',serif;}',
    // 履歴
    '.wx-hrow{display:flex;align-items:center;gap:10px;padding:11px 0;border-bottom:1px solid #f0ebe1;}',
    '.wx-hrow:last-child{border-bottom:none;}',
    '.wx-hrow .ic{width:30px;height:30px;border-radius:50%;background:#f4efe4;display:flex;align-items:center;justify-content:center;font-size:14px;flex:0 0 30px;}',
    '.wx-hrow .lb{flex:1;font-size:13px;font-family:\'Noto Serif JP\',serif;}',
    '.wx-hrow .ex{font-size:13px;font-weight:700;color:' + C.gold + ';}',
    '.wx-day{font-size:11.5px;color:' + C.mute + ';font-weight:700;margin:14px 0 4px;font-family:\'Noto Serif JP\',serif;}',
    '.wx-empty{font-size:12.5px;color:#a8a29a;text-align:center;padding:18px 0;font-family:\'Noto Serif JP\',serif;}',
    // 紹介ページ（2026-07-27 リデザイン）
    "#wxInvite{background:#F8F6F2;}",
    "#wxInvite .wx-hd{justify-content:flex-start;position:relative;border-bottom:none;padding:18px 24px 6px;}",
    "#wxInvite .wx-hd .t{position:absolute;left:0;right:0;text-align:center;font-size:20px;font-weight:700;color:#222;letter-spacing:.06em;pointer-events:none;}",
    "#wxInvite .wx-hd .b{position:relative;z-index:2;color:#222;}",
    "#wxInvite .wx-in{padding:10px 24px 56px;}",
    "#wxInvite .iv-sec{margin-top:32px;}",
    "#wxInvite .iv-lbl{font-size:13px;font-weight:700;color:#222;letter-spacing:.06em;margin-bottom:12px;}",
    "#wxInvite .iv-card{background:#fff;border-radius:24px;box-shadow:0 10px 30px rgba(0,0,0,.08);padding:36px 24px 30px;text-align:center;",
      "opacity:0;transform:translateY(10px);animation:ivIn .5s cubic-bezier(.22,.61,.36,1) forwards;}",
    "@keyframes ivIn{to{opacity:1;transform:none;}}",
    "#wxInvite .iv-d1{animation-delay:.05s;} #wxInvite .iv-d2{animation-delay:.14s;} #wxInvite .iv-d3{animation-delay:.22s;}",
    "#wxInvite .iv-h{font-size:18px;font-weight:700;color:#222;letter-spacing:.04em;}",
    "#wxInvite .iv-exp{font-size:54px;font-weight:800;color:#7B58C6;line-height:1.15;margin:14px 0 2px;letter-spacing:-.01em;}",
    "#wxInvite .iv-exp small{font-size:22px;font-weight:700;margin-left:4px;}",
    "#wxInvite .iv-cap{font-size:13.5px;color:#666;font-family:'Noto Serif JP',serif;}",
    "#wxInvite .iv-line{height:1px;background:#EFEAE0;margin:26px 8px 22px;}",
    "#wxInvite .iv-sub{font-size:13.5px;color:#666;font-family:'Noto Serif JP',serif;}",
    "#wxInvite .iv-exp2{font-size:38px;font-weight:800;color:#C8A04D;line-height:1.2;margin:6px 0 12px;}",
    "#wxInvite .iv-exp2 small{font-size:17px;font-weight:700;margin-left:3px;}",
    "#wxInvite .iv-note{font-size:12.5px;color:#666;line-height:1.8;font-family:'Noto Serif JP',serif;}",
    "#wxInvite .iv-linebtn{display:flex;align-items:center;justify-content:center;gap:10px;width:100%;height:56px;border:none;",
      "border-radius:16px;background:#06C755;color:#fff;font-family:'Shippori Mincho',serif;font-size:16px;font-weight:700;",
      "letter-spacing:.04em;cursor:pointer;box-shadow:0 8px 22px rgba(6,199,85,.26);transition:transform .12s;}",
    "#wxInvite .iv-linebtn:active{transform:scale(.95);}",
    "#wxInvite .iv-linebtn svg{width:24px;height:24px;}",
    "#wxInvite .iv-or{display:flex;align-items:center;gap:14px;margin:26px 0 0;color:#9a948a;font-size:12px;letter-spacing:.1em;}",
    "#wxInvite .iv-or::before,#wxInvite .iv-or::after{content:'';flex:1;height:1px;background:#E7E1D6;}",
    "#wxInvite .iv-urlrow{display:flex;gap:10px;align-items:stretch;}",
    "#wxInvite .iv-url{flex:1;min-width:0;height:48px;padding:0 14px;border:1px solid #E7E1D6;border-radius:14px;background:#fff;",
      "font-family:'Noto Serif JP',serif;font-size:12.5px;color:#444;box-sizing:border-box;}",
    "#wxInvite .iv-copy{flex:0 0 auto;height:48px;padding:0 18px;border:1px solid #7B58C6;border-radius:14px;background:#fff;",
      "color:#7B58C6;font-family:inherit;font-size:13px;font-weight:700;cursor:pointer;transition:transform .12s;}",
    "#wxInvite .iv-copy:active{transform:scale(.95);}",
    "#wxInvite .iv-qr{background:#fff;border-radius:24px;box-shadow:0 10px 30px rgba(0,0,0,.08);padding:28px 24px 22px;text-align:center;}",
    "#wxInvite .iv-qr img{width:190px;height:190px;display:block;margin:0 auto 16px;}",
    "#wxInvite .iv-steps{background:#fff;border-radius:24px;box-shadow:0 10px 30px rgba(0,0,0,.08);padding:22px 24px;}",
    "#wxInvite .iv-step{display:flex;align-items:center;gap:13px;padding:11px 0;}",
    "#wxInvite .iv-step + .iv-step{border-top:1px solid #F2EEE5;}",
    "#wxInvite .iv-no{flex:0 0 24px;width:24px;height:24px;border-radius:50%;background:#F1ECFA;color:#7B58C6;",
      "font-size:12px;font-weight:700;display:flex;align-items:center;justify-content:center;}",
    "#wxInvite .iv-step span{font-size:14px;color:#222;font-family:'Noto Serif JP',serif;}",
    "#wxInvite .iv-done{font-size:12.5px;color:#666;text-align:center;margin-top:14px;font-family:'Noto Serif JP',serif;}",
    "#wxInvite .iv-fine{font-size:11px;color:#9a948a;text-align:center;margin-top:24px;line-height:1.7;font-family:'Noto Serif JP',serif;}",
    "#wxInvite .iv-kpi{display:grid;grid-template-columns:1fr 1fr;gap:12px;}",
    "#wxInvite .iv-kpi > div{background:#fff;border-radius:20px;box-shadow:0 10px 30px rgba(0,0,0,.08);padding:18px;text-align:center;}",
    "#wxInvite .iv-kpi .l{font-size:12px;color:#666;font-family:'Noto Serif JP',serif;}",
    "#wxInvite .iv-kpi .v{font-size:26px;font-weight:800;color:#7B58C6;margin-top:5px;}",
    '.wx-note{font-size:11px;color:#a09a90;line-height:1.7;margin-top:12px;font-family:\'Noto Serif JP\',serif;}'
  ].join('');
  document.head.appendChild(css);

  function mkPage(id, title){
    var el = document.createElement('div');
    el.className = 'wx-pg'; el.id = id;
    el.innerHTML = '<div class="wx-hd"><span class="b">‹</span><span class="t">' + title + '</span></div><div class="wx-in"></div>';
    document.body.appendChild(el);
    el.querySelector('.b').onclick = function(){ el.style.display = 'none'; };
    return el;
  }
  var guidePg  = mkPage('wxGuide',  'EXPについて');
  var invitePg = mkPage('wxInvite', '友達を紹介');

  function esc2(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

  // ── EXPガイドページ ───────────────────────────────────────
  function renderGuide(){
    var pr = progressOf(store().total), R = rules(), st = store();
    var h = '';

    h += '<div class="wx-sec"><div class="wx-lvcard">'
       +   '<div class="wx-lvtop"><span class="wx-lv">LV.' + pr.level + '</span>'
       +     '<span class="wx-next">' + (pr.level >= MAXLV ? '最高位に到達しました' : 'あと <b>' + pr.toNext + '</b> EXP で Lv.' + (pr.level + 1)) + '</span></div>'
       +   '<div class="wx-bar"><div class="wx-fill" id="wxFill"></div></div>'
       +   '<div class="wx-tot">累計 ' + pr.total.toLocaleString() + ' EXP　／　次のレベルまで ' + pr.need.toLocaleString() + ' EXP</div>'
       + '</div></div>';

    h += '<div class="wx-sec"><div class="wx-h">巡礼レベルとは？</div><div class="wx-card"><div class="wx-p">'
       +   '神社やお寺を巡ったり、参拝の記録や御朱印を投稿したりすると経験値（EXP）が貯まります。<br>'
       +   'EXPが一定に達すると巡礼レベルが上がります。急ぐものではありません。'
       +   'ご自身の歩みが少しずつ形になっていく——そんな道しるべとしてお使いください。'
       + '</div></div></div>';

    h += '<div class="wx-sec"><div class="wx-h">EXPの獲得方法</div>';
    for (var g in GROUPS){
      var items = [];
      for (var k in R) if (R[k].group === g) items.push(R[k]);
      if (!items.length) continue;
      h += '<div class="wx-gname">' + GROUPS[g] + '</div><div class="wx-grid">';
      items.forEach(function(it){
        h += '<div class="wx-item"><div class="ic">' + (it.icon || '✦') + '</div>'
           +   '<div class="lb">' + esc2(it.label) + '</div>'
           +   '<div class="ex">＋' + it.exp + ' EXP</div>'
           +   (it.note ? '<div class="nt">' + esc2(it.note) + '</div>'
                        : (it.limit ? '<div class="nt">1日' + it.limit + '回まで</div>'
                                    : (it.once ? '<div class="nt">初回のみ</div>' : '')))
           + '</div>';
      });
      h += '</div>';
    }
    h += '</div>';

    h += '<div class="wx-sec"><div class="wx-h">レベルが上がると？</div><div class="wx-card"><div class="wx-p">'
       +   '現在準備中です。<br>'
       +   'レベルが高い巡拝者には、今後 限定イベントや限定御朱印、特別企画など'
       +   'さまざまな特典をご用意する予定です。<br>ぜひ今のうちから経験値を集めてください。'
       + '</div></div></div>';

    // EXP履歴
    h += '<div class="wx-sec"><div class="wx-h">EXP履歴</div><div class="wx-card" style="padding:6px 16px">';
    var hist = st.history.slice(0, 40);
    if (!hist.length){
      h += '<div class="wx-empty">まだEXPの記録がありません</div>';
    } else {
      var lastDay = '';
      hist.forEach(function(x){
        var d = new Date(x.t);
        var key = d.getFullYear() + '/' + (d.getMonth() + 1) + '/' + d.getDate();
        var lbl = (key === (new Date().getFullYear() + '/' + (new Date().getMonth() + 1) + '/' + new Date().getDate())) ? '今日' : key;
        if (lbl !== lastDay){ h += '<div class="wx-day">' + lbl + '</div>'; lastDay = lbl; }
        h += '<div class="wx-hrow"><div class="ic">' + (x.i || '✦') + '</div>'
           +   '<div class="lb">' + esc2(x.l || x.k) + '</div>'
           +   '<div class="ex">＋' + x.e + '</div></div>';
      });
    }
    h += '</div></div>';

    guidePg.querySelector('.wx-in').innerHTML = h;
    setTimeout(function(){ var f = document.getElementById('wxFill'); if (f) f.style.width = pr.pct + '%'; }, 120);
  }

  // ── 友達紹介ページ（UIのみ・LINE連携は後日）────────────────
  function inviteUrl(){
    var code = 'WABI' + String(Math.abs(hashCode(navigator.userAgent + '|' + (localStorage.getItem('wabiInviteSeed') || setSeed()))) % 1000000).padStart(6, '0');
    return 'https://wabinavi.jp/?invite=' + code;
  }
  function setSeed(){ var s = String(Date.now()); try { localStorage.setItem('wabiInviteSeed', s); } catch(e){} return s; }
  function hashCode(s){ var h = 0; for (var i = 0; i < s.length; i++){ h = ((h << 5) - h) + s.charCodeAt(i); h |= 0; } return h; }

  var LINE_ICON = '<svg viewBox="0 0 24 24" fill="#fff" aria-hidden="true"><path d="M12 2C6.48 2 2 5.78 2 10.43c0 4.18 3.49 7.69 8.21 8.36.32.07.75.21.86.49.1.25.06.64.03.89l-.14.84c-.04.25-.19.97.85.53 1.04-.44 5.6-3.3 7.64-5.65 1.41-1.55 2.08-3.12 2.08-4.93C21.83 5.78 17.35 2 12 2zM8.31 12.98H6.43c-.22 0-.41-.18-.41-.41V9.04c0-.22.18-.41.41-.41h.16c.22 0 .41.18.41.41v3.12h1.31c.22 0 .41.18.41.41v.16c0 .05-.19.25-.41.25zm1.6-.41c0 .22-.18.41-.41.41h-.16c-.22 0-.41-.18-.41-.41V9.04c0-.22.18-.41.41-.41h.16c.22 0 .41.18.41.41v3.53zm4.05 0c0 .18-.11.33-.28.38-.4.01-.8.02-.13.02-.13 0-.25-.07-.32-.16l-1.61-2.19v1.95c0 .22-.18.41-.41.41h-.16c-.22 0-.41-.18-.41-.41V9.04c0-.18.11-.33.28-.38.04-.1.08-.2.13-.2.13 0 .25.07.32.16l1.61 2.19V9.04c0-.22.18-.41.41-.41h.16c.22 0 .41.18.41.41v3.53zm3.15-2.53c.22 0 .41.18.41.41v.16c0 .22-.18.41-.41.41h-1.31v.84h1.31c.22 0 .41.18.41.41v.16c0 .22-.18.41-.41.41h-1.88c-.22 0-.41-.18-.41-.41V9.04c0-.22.18-.41.41-.41h1.88c.22 0 .41.18.41.41v.16c0 .22-.18.41-.41.41h-1.31v.84h1.31z"/></svg>';

  function renderInvite(){
    var st = store(), url = inviteUrl();
    var R = rules();
    var expMe = (R.invite_sender && R.invite_sender.exp) || 300;
    var expYou = (R.invite_receiver && R.invite_receiver.exp) || 100;
    var earned = st.invites * expMe;

    var h = '';

    // ② 紹介カード
    h += '<div class="iv-card iv-d1">'
       +   '<div class="iv-h">一緒に巡拝を楽しもう</div>'
       +   '<div class="iv-exp">＋' + expMe + '<small>EXP</small></div>'
       +   '<div class="iv-cap">あなたに授与されます</div>'
       +   '<div class="iv-line"></div>'
       +   '<div class="iv-sub">紹介された方にも</div>'
       +   '<div class="iv-exp2">＋' + expYou + '<small>EXP</small></div>'
       +   '<div class="iv-note">紹介された方も、無料会員登録の完了で<br>経験値を獲得できます。</div>'
       + '</div>';

    // ③ LINEボタン
    h += '<div class="iv-sec"><button class="iv-linebtn" id="ivLine">' + LINE_ICON + 'LINEで友達に送る</button>'
       +   '<div class="iv-or">または</div></div>';

    // ④ 紹介URL
    h += '<div class="iv-sec"><div class="iv-lbl">紹介URL</div>'
       +   '<div class="iv-urlrow"><input class="iv-url" id="ivUrl" readonly value="' + esc2(url) + '">'
       +   '<button class="iv-copy" id="ivCopy">コピー</button></div></div>';

    // ⑤ QRコード
    h += '<div class="iv-sec"><div class="iv-lbl">QRコード</div><div class="iv-qr">'
       +   '<img id="ivQr" alt="紹介用QRコード" src="https://api.qrserver.com/v1/create-qr-code/?size=380x380&margin=6&data='
       +     encodeURIComponent(url) + '">'
       +   '<div class="iv-cap" id="ivQrNote">友達に読み取ってもらうだけでOK</div>'
       + '</div></div>';

    // ⑥ 紹介成立条件
    h += '<div class="iv-sec"><div class="iv-lbl">紹介成立の条件</div><div class="iv-steps">'
       +   '<div class="iv-step"><span class="iv-no">1</span><span>お友達がLINEで登録</span></div>'
       +   '<div class="iv-step"><span class="iv-no">2</span><span>無料会員登録が完了</span></div>'
       +   '<div class="iv-step"><span class="iv-no">3</span><span>はじめてログイン</span></div>'
       +   '<div class="iv-done">3つすべて完了すると紹介成立です</div>'
       + '</div></div>';

    // 実績
    h += '<div class="iv-sec"><div class="iv-kpi">'
       +   '<div><div class="l">紹介した人数</div><div class="v">' + st.invites + '<span style="font-size:13px">人</span></div></div>'
       +   '<div><div class="l">紹介で得たEXP</div><div class="v">' + earned + '</div></div>'
       + '</div></div>';

    h += '<div class="iv-fine">※ 紹介成立後に経験値が付与されます。<br>'
       +   'LINEでの会員登録機能は現在準備中です。</div>';

    invitePg.querySelector('.wx-in').innerHTML = h;

    document.getElementById('ivLine').onclick = function(){
      var text = 'わびなびで一緒に神社めぐりしませんか？\n' + url;
      window.open('https://line.me/R/msg/text/?' + encodeURIComponent(text), '_blank', 'noopener');
    };
    document.getElementById('ivCopy').onclick = function(){
      var inp = document.getElementById('ivUrl');
      try { inp.select(); inp.setSelectionRange(0, 99999); document.execCommand('copy'); } catch(e){}
      if (navigator.clipboard) navigator.clipboard.writeText(url).catch(function(){});
      if (typeof showToast === 'function') showToast('コピーしました');
    };
    var qr = document.getElementById('ivQr');
    qr.onerror = function(){
      qr.style.display = 'none';
      document.getElementById('ivQrNote').textContent = 'QRコードを読み込めませんでした。上の紹介URLをお使いください。';
    };
  }

  window.wabiOpenExpGuide = function(){ renderGuide(); guidePg.style.display = 'block'; guidePg.scrollTop = 0; };
  window.wabiOpenInvite   = function(){ renderInvite(); invitePg.style.display = 'block'; invitePg.scrollTop = 0; };

  // ── ⑦ マイページのレベル欄を差し替える ──────────────────────
  function paintMypageExp(){
    var box = document.querySelector('#wcMypage .mp-exp');
    if (!box) return;
    var pr = progressOf(store().total);
    box.innerHTML =
        '<div class="mp-exp-head">巡礼レベル</div>'
      + '<div class="mp-exp-top"><span class="mp-lv">LV.<b>' + pr.level + '</b></span>'
      +   '<span class="mp-exp-next">' + (pr.level >= MAXLV ? '最高位に到達しました'
            : 'あと <b>' + pr.toNext + '</b> EXP で Lv.' + (pr.level + 1)) + '</span></div>'
      + '<div class="mp-exp-bar"><div class="mp-exp-fill" id="mpExpFill"></div></div>'
      + '<div class="mp-exp-links"><a id="wxGuideLink">EXPについて ›</a>'
      +   '<a class="gold" id="wxInviteLink">友達を紹介 ›</a></div>';
    document.getElementById('wxGuideLink').onclick  = function(){ window.wabiOpenExpGuide(); };
    document.getElementById('wxInviteLink').onclick = function(){ window.wabiOpenInvite(); };
    // mypage.js 側があとからバーを書き換えるので、時間差で上書きする
    [0, 250, 700].forEach(function(ms){
      setTimeout(function(){
        var f = document.getElementById('mpExpFill');
        if (f) f.style.width = pr.pct + '%';
      }, ms);
    });
  }
  function refreshMypageExp(){ try { paintMypageExp(); } catch(e){} }

  var _openMp = window.openWabiMypage;
  function bindMypage(){
    if (typeof window.openWabiMypage !== 'function' || window.openWabiMypage.__wx) return;
    var orig = window.openWabiMypage;
    var wrapped = function(){
      var r = orig.apply(this, arguments);
      setTimeout(paintMypageExp, 0);
      setTimeout(paintMypageExp, 200);
      setTimeout(fixLevelLabel, 250);
      return r;
    };
    wrapped.__wx = true;
    window.openWabiMypage = wrapped;
  }
  bindMypage();
  var tries = 0;
  var iv = setInterval(function(){ bindMypage(); if (++tries > 40 || (window.openWabiMypage && window.openWabiMypage.__wx)) clearInterval(iv); }, 300);
})();


/* ══════════════════════════════════════════════════════════════
   わびなび：ヘッダー右上を「ログイン」に変更
   タップすると ログイン ／ 新規登録 を選べるメニューを表示。
   新規登録はLINEで登録する導線（チャネルID登録後に本稼働）。
   （2026-07-27 追加 / index.html は触らず concierge.js から上書き）
   ══════════════════════════════════════════════════════════════ */
(function(){
  if (window.__wabiLoginBtn) return;
  window.__wabiLoginBtn = true;

  // ── LINEログインの設定（チャネル発行後にここへ入れる）──────
  // チャネルIDは公開情報（OAuthのclient_id相当）。チャネルシークレットは絶対にここに置かない。
  var LINE_CFG = {
    channelId: '2010884035',                        // LINEログイン チャネルID
    liffId: '2010884035-qTXvJFEi',                   // LIFF ID
    redirectUri: location.origin + location.pathname,
    scope: 'profile openid'
  };
  try {
    LINE_CFG.channelId = localStorage.getItem('wabiLineChannelId') || LINE_CFG.channelId;
    LINE_CFG.liffId    = localStorage.getItem('wabiLiffId') || LINE_CFG.liffId;
  } catch(e){}

  var LS_USER = 'wabiUser';
  function getUser(){
    try { var u = JSON.parse(localStorage.getItem(LS_USER) || 'null'); return (u && u.id) ? u : null; }
    catch(e){ return null; }
  }
  function setUser(u){
    try { u ? localStorage.setItem(LS_USER, JSON.stringify(u)) : localStorage.removeItem(LS_USER); } catch(e){}
    paintButton();
  }

  // LIFF SDK を必要になったときだけ読み込む
  function loadLiff(){
    return new Promise(function(res, rej){
      if (window.liff) { res(window.liff); return; }
      var s = document.createElement('script');
      s.src = 'https://static.line-scdn.net/liff/edge/2/sdk.js';
      s.onload = function(){ res(window.liff); };
      s.onerror = rej;
      document.head.appendChild(s);
    });
  }

  window.WabiLine = {
    config: LINE_CFG,
    user: getUser,
    setChannelId: function(id){
      LINE_CFG.channelId = id || '';
      try { localStorage.setItem('wabiLineChannelId', LINE_CFG.channelId); } catch(e){}
      return LINE_CFG.channelId;
    },
    setLiffId: function(id){
      LINE_CFG.liffId = id || '';
      try { localStorage.setItem('wabiLiffId', LINE_CFG.liffId); } catch(e){}
      if (typeof showToast === 'function') showToast('LIFF IDを設定しました');
      return LINE_CFG.liffId;
    },
    logout: function(){
      setUser(null);
      try { localStorage.removeItem('wabiLineIdToken'); } catch(e){}
      try { if (window.liff && liff.isLoggedIn && liff.isLoggedIn()) liff.logout(); } catch(e){}
      if (typeof showToast === 'function') showToast('ログアウトしました');
    },
    // サーバーを用意できたとき用（認証コードを受け取る従来フロー）
    authorizeUrl: function(){
      if (!LINE_CFG.channelId) return null;
      var state = 'wabi' + Date.now();
      try { sessionStorage.setItem('wabiLineState', state); } catch(e){}
      return 'https://access.line.me/oauth2/v2.1/authorize?response_type=code'
        + '&client_id=' + encodeURIComponent(LINE_CFG.channelId)
        + '&redirect_uri=' + encodeURIComponent(LINE_CFG.redirectUri)
        + '&state=' + state
        + '&scope=' + encodeURIComponent(LINE_CFG.scope)
        + '&bot_prompt=aggressive';
    },
    // LIFFでログイン（サーバー不要）
    start: function(){
      if (!LINE_CFG.liffId){
        if (typeof showToast === 'function') showToast('LINE登録は現在準備中です（LIFF ID未設定）');
        return false;
      }
      if (typeof showToast === 'function') showToast('LINEに接続しています…');
      loadLiff().then(function(liff){
        return liff.init({ liffId: LINE_CFG.liffId }).then(function(){
          // redirectUri は指定しない。指定するとクエリ文字列付きURLになり、
          // コールバックURLの完全一致に外れて 400 Bad Request になるため。
          if (!liff.isLoggedIn()) { liff.login(); return null; }
          // クラウド同期の本人確認に使うIDトークンも取っておく
          try {
            var it = liff.getIDToken();
            if (it) localStorage.setItem('wabiLineIdToken', it);
          } catch(e){}
          return liff.getProfile();
        });
      }).then(function(p){
        if (!p) return;
        setUser({ id: p.userId, name: p.displayName || '巡礼者', pic: p.pictureUrl || '' });
        var sp = document.getElementById('wxSignup'); if (sp) sp.style.display = 'none';
        if (typeof showToast === 'function') showToast('ようこそ、' + (p.displayName || '巡礼者') + 'さん');
        if (window.WabiExp) window.WabiExp.add('login', { silent:true });
      }).catch(function(e){
        if (typeof showToast === 'function') showToast('LINEに接続できませんでした');
        console.warn('[WabiLine]', e);
      });
      return true;
    },
    // すでにLINEでログイン済みなら黙って情報を取り直す
    restore: function(){
      if (!LINE_CFG.liffId || getUser()) return;
      loadLiff().then(function(liff){
        return liff.init({ liffId: LINE_CFG.liffId }).then(function(){
          if (!liff.isLoggedIn()) return null;
          try {
            var it = liff.getIDToken();
            if (it) localStorage.setItem('wabiLineIdToken', it);
          } catch(e){}
          return liff.getProfile();
        });
      }).then(function(p){
        if (p) setUser({ id: p.userId, name: p.displayName || '巡礼者', pic: p.pictureUrl || '' });
      }).catch(function(){});
    }
  };

  // ── スタイル ─────────────────────────────────────────────
  var css = document.createElement('style');
  css.textContent = [
    '.wl-wrap{position:relative;display:flex;align-items:center;}',
    ".wl-btn{display:flex;align-items:center;gap:7px;background:#5D3A7A;color:#fff;border:none;border-radius:999px;",
      "padding:10px 18px;font-family:'Shippori Mincho',serif;font-size:14px;font-weight:700;letter-spacing:.06em;",
      "cursor:pointer;white-space:nowrap;transition:opacity .15s;}",
    '.wl-btn:active{opacity:.85;}',
    '.wl-btn svg{width:16px;height:16px;}',
    '.wl-menu{position:absolute;top:calc(100% + 12px);right:0;min-width:190px;background:#fff;border:1px solid #ece4d3;',
      'border-radius:6px;box-shadow:0 10px 30px rgba(0,0,0,.13);display:none;z-index:120;overflow:hidden;}',
    '.wl-menu.on{display:block;}',
    '.wl-menu::before{content:"";position:absolute;top:-8px;right:26px;width:14px;height:14px;background:#fff;',
      'border-left:1px solid #ece4d3;border-top:1px solid #ece4d3;transform:rotate(45deg);}',
    ".wl-menu a{display:block;padding:16px 20px;font-family:'Shippori Mincho',serif;font-size:15px;color:#2a2a2a;",
      'cursor:pointer;text-decoration:none;background:#fff;position:relative;z-index:1;}',
    '.wl-menu a:active{background:#faf7f1;}',
    '.wl-menu .sep{height:1px;background:#ece4d3;margin:0 20px;position:relative;z-index:1;}',
    // 新規登録ページ
    ".wl-pg{position:fixed;inset:0;z-index:330;background:#F8F6F2;display:none;overflow-y:auto;-webkit-overflow-scrolling:touch;font-family:'Shippori Mincho','Noto Serif JP',serif;color:#2D2D2D;}",
    '.wl-hd{position:sticky;top:0;background:#F8F6F2;display:flex;align-items:center;gap:10px;padding:16px;border-bottom:1px solid #ece4d3;}',
    '.wl-hd .b{font-size:22px;cursor:pointer;line-height:1;}',
    '.wl-hd .t{font-size:15px;font-weight:800;letter-spacing:.1em;}',
    '.wl-in{max-width:500px;margin:0 auto;padding:26px 20px 48px;}',
    '.wl-lead{font-size:20px;font-weight:700;line-height:1.5;margin-bottom:10px;}',
    ".wl-sub{font-size:13px;line-height:1.85;color:#6F6F6F;font-family:'Noto Serif JP',serif;margin-bottom:26px;}",
    '.wl-line{display:flex;align-items:center;justify-content:center;gap:9px;width:100%;padding:17px;border:none;border-radius:16px;',
      'background:#06C755;color:#fff;font-family:inherit;font-size:16px;font-weight:700;cursor:pointer;box-shadow:0 8px 22px rgba(6,199,85,.28);}',
    '.wl-mail{display:block;width:100%;margin-top:12px;padding:16px;border:1px solid #e6dcc6;border-radius:16px;background:#fff;',
      'font-family:inherit;font-size:14px;font-weight:700;color:#6E4BA8;cursor:pointer;text-align:center;}',
    '.wl-benefit{background:#fff;border-radius:20px;box-shadow:0 8px 24px rgba(0,0,0,.06);padding:20px;margin-top:26px;}',
    '.wl-benefit .h{font-size:14px;font-weight:700;margin-bottom:12px;}',
    ".wl-benefit li{list-style:none;font-size:13.5px;line-height:1.7;color:#4a4a4a;font-family:'Noto Serif JP',serif;",
      'display:flex;gap:9px;margin-top:9px;}',
    '.wl-benefit li span.c{color:#C9A24A;font-weight:700;}',
    ".wl-foot{font-size:11.5px;color:#a09a90;line-height:1.75;margin-top:22px;font-family:'Noto Serif JP',serif;text-align:center;}",
    ".wl-login-link{display:block;text-align:center;margin-top:18px;font-size:13px;color:#6E4BA8;font-weight:700;cursor:pointer;}"
  ].join('');
  document.head.appendChild(css);

  // ── 新規登録ページ ────────────────────────────────────────
  var pg = document.createElement('div');
  pg.className = 'wl-pg'; pg.id = 'wxSignup';
  pg.innerHTML =
      '<div class="wl-hd"><span class="b">‹</span><span class="t">新規登録</span></div>'
    + '<div class="wl-in">'
    +   '<div class="wl-lead">LINEではじめる<br>あなただけの巡礼帳</div>'
    +   '<div class="wl-sub">LINEアカウントで登録すると、参拝の記録・御朱印・巡礼レベルがすべて保存され、'
    +     '機種変更をしても引き継げます。パスワードを覚える必要はありません。</div>'
    +   '<button class="wl-line" id="wlLineBtn"><span style="font-weight:800;letter-spacing:.05em">LINE</span>LINEで新規登録</button>'
    +   '<button class="wl-mail" id="wlMailBtn">メールアドレスで登録する</button>'
    +   '<div class="wl-benefit"><div class="h">会員になると</div><ul>'
    +     '<li><span class="c">◆</span><span>参拝記録・御朱印を<b>クラウド保存</b></span></li>'
    +     '<li><span class="c">◆</span><span>AI巡拝ルートが<b>無制限</b>に</span></li>'
    +     '<li><span class="c">◆</span><span>お気に入りの神社仏閣を<b>複数端末</b>で共有</span></li>'
    +     '<li><span class="c">◆</span><span>参拝や投稿で<b>巡礼レベル</b>が上がる</span></li>'
    +     '<li><span class="c">◆</span><span>限定・特別御朱印の<b>お知らせ</b></span></li>'
    +   '</ul></div>'
    +   '<a class="wl-login-link" id="wlToLogin">すでにアカウントをお持ちの方はログイン ›</a>'
    +   '<div class="wl-foot">登録することで利用規約とプライバシーポリシーに<br>同意したものとみなされます。</div>'
    + '</div>';
  document.body.appendChild(pg);
  pg.querySelector('.b').onclick = function(){ pg.style.display = 'none'; };

  function openLogin(){
    pg.style.display = 'none';
    try {
      if (typeof openRegister === 'function') openRegister();
      else document.getElementById('pgRegister').style.display = 'flex';
      // ログインモードに切り替える
      setTimeout(function(){
        var hd = document.querySelector('#pgRegister .reg-hd-tit');
        if (hd && hd.textContent.indexOf('ログイン') !== 0 && typeof regToggleMode === 'function') regToggleMode();
      }, 30);
    } catch(e){}
  }
  window.wabiOpenSignup = function(){ pg.style.display = 'block'; pg.scrollTop = 0; };
  window.wabiOpenLogin  = openLogin;

  document.getElementById('wlLineBtn').onclick = function(){ window.WabiLine.start(); };
  document.getElementById('wlMailBtn').onclick = function(){
    pg.style.display = 'none';
    if (typeof openRegister === 'function') openRegister();
  };
  document.getElementById('wlToLogin').onclick = openLogin;

  // ── ヘッダーのボタンを差し替える ────────────────────────────
  function buildButton(){
    var acts = document.querySelector('.site-hd-actions');
    if (!acts || acts.querySelector('.wl-wrap')) return;
    var btns = acts.querySelectorAll('.site-hd-btn');
    if (btns.length < 2) return;
    var target = btns[btns.length - 1];   // 右端（メニュー／マイページ）

    var wrap = document.createElement('div');
    wrap.className = 'wl-wrap';
    wrap.innerHTML =
        '<button class="wl-btn" id="wlBtn">'
      +   '<svg viewBox="0 0 20 20" fill="none"><circle cx="10" cy="6.5" r="3.2" stroke="currentColor" stroke-width="1.6"/>'
      +   '<path d="M3.5 17c0-3.6 13-3.6 13 0" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>'
      +   'ログイン</button>'
      + '<div class="wl-menu" id="wlMenu">'
      +   '<a id="wlMenuLogin">ログイン</a><div class="sep"></div><a id="wlMenuSignup">新規登録</a>'
      + '</div>';
    target.parentNode.replaceChild(wrap, target);

    var menu = document.getElementById('wlMenu');
    document.getElementById('wlBtn').onclick = function(ev){
      ev.stopPropagation();
      menu.classList.toggle('on');
    };
    document.addEventListener('click', function(){ menu.classList.remove('on'); });
    paintButton();
  }

  // ログイン状態に合わせてボタンとメニューを描き分ける
  function paintButton(){
    var btn = document.getElementById('wlBtn'), menu = document.getElementById('wlMenu');
    if (!btn || !menu) return;
    var u = getUser();
    var person = '<svg viewBox="0 0 20 20" fill="none"><circle cx="10" cy="6.5" r="3.2" stroke="currentColor" stroke-width="1.6"/>'
               + '<path d="M3.5 17c0-3.6 13-3.6 13 0" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>';
    if (u){
      btn.innerHTML = (u.pic ? '<img src="' + u.pic + '" style="width:20px;height:20px;border-radius:50%;object-fit:cover">' : person)
                    + (u.name.length > 6 ? u.name.slice(0, 6) + '…' : u.name);
      menu.innerHTML = '<a id="wlMenuMypage">マイページ</a><div class="sep"></div><a id="wlMenuLogout">ログアウト</a>';
      document.getElementById('wlMenuMypage').onclick = function(){
        menu.classList.remove('on');
        if (typeof openWabiMypage === 'function') openWabiMypage();
      };
      document.getElementById('wlMenuLogout').onclick = function(){
        menu.classList.remove('on'); window.WabiLine.logout();
      };
    } else {
      btn.innerHTML = person + 'ログイン';
      menu.innerHTML = '<a id="wlMenuLogin">ログイン</a><div class="sep"></div><a id="wlMenuSignup">新規登録</a>';
      document.getElementById('wlMenuLogin').onclick  = function(){ menu.classList.remove('on'); openLogin(); };
      document.getElementById('wlMenuSignup').onclick = function(){ menu.classList.remove('on'); window.wabiOpenSignup(); };
    }
  }

  buildButton();
  var n = 0;
  var iv = setInterval(function(){ buildButton(); if (++n > 30) clearInterval(iv); }, 400);
  setTimeout(function(){ try { window.WabiLine.restore(); } catch(e){} }, 2000);

  // 既存の会員ページ（#pgRegister）の「LINEで登録・ログイン」を実際に動かす
  function hookRegister(){
    var orig = window.regWithProvider;
    if (typeof orig !== 'function' || orig.__wl) return;
    var wrapped = function(provider){
      if (provider === 'LINE'){
        var pr = document.getElementById('pgRegister');
        if (pr) pr.style.display = 'none';
        window.WabiLine.start();
        return;
      }
      return orig.apply(this, arguments);
    };
    wrapped.__wl = true;
    window.regWithProvider = wrapped;
  }
  hookRegister();
  var m = 0;
  var iv2 = setInterval(function(){ hookRegister(); if (++m > 30) clearInterval(iv2); }, 400);
})();


/* ══════════════════════════════════════════════════════════════
   わびなび：マイページのプロフィール写真・カバー写真を変更できるようにする
   タップ → シートから「写真を選ぶ／LINEの写真に戻す／削除」
   選んだ画像は端末内で縮小して localStorage に保存する。
   （2026-07-27 追加 / index.html は触らず concierge.js から上書き）
   ══════════════════════════════════════════════════════════════ */
(function(){
  if (window.__wabiPhoto) return;
  window.__wabiPhoto = true;

  var LS_AV = 'wabiAvatar', LS_CV = 'wabiCover';
  function get(k){ try { return localStorage.getItem(k) || ''; } catch(e){ return ''; } }
  function set(k, v){ try { v ? localStorage.setItem(k, v) : localStorage.removeItem(k); } catch(e){} }

  var css = document.createElement('style');
  css.textContent = [
    // 「変更できます」と分かるカメラバッジ
    '#wcMypage .mp-av{position:relative;cursor:pointer;}',
    '#wcMypage .mp-hero{cursor:pointer;}',
    '.wp-cam{position:absolute;right:-2px;bottom:-2px;width:26px;height:26px;border-radius:50%;background:#fff;',
      'border:1px solid #e6dcc6;display:flex;align-items:center;justify-content:center;font-size:12px;',
      'box-shadow:0 2px 8px rgba(0,0,0,.18);z-index:3;}',
    '.wp-cam-cover{position:absolute;right:14px;bottom:14px;width:34px;height:34px;border-radius:50%;',
      'background:rgba(0,0,0,.45);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;',
      'font-size:15px;color:#fff;z-index:3;cursor:pointer;}',
    // 選択シート
    '.wp-mask{position:fixed;inset:0;background:rgba(0,0,0,.4);z-index:400;display:none;}',
    '.wp-mask.on{display:block;}',
    ".wp-sheet{position:fixed;left:0;right:0;bottom:0;z-index:401;background:#fff;border-radius:22px 22px 0 0;",
      "padding:10px 16px calc(18px + env(safe-area-inset-bottom));max-width:500px;margin:0 auto;",
      "font-family:'Shippori Mincho','Noto Serif JP',serif;transform:translateY(100%);transition:transform .22s cubic-bezier(.22,.61,.36,1);}",
    '.wp-sheet.on{transform:translateY(0);}',
    '.wp-sheet .bar{width:38px;height:4px;border-radius:2px;background:#e2dbcd;margin:6px auto 14px;}',
    '.wp-sheet .ttl{font-size:14px;font-weight:700;text-align:center;margin-bottom:10px;color:#2D2D2D;}',
    '.wp-sheet button{display:block;width:100%;padding:16px;border:none;background:transparent;border-top:1px solid #f0ebe1;',
      "font-family:inherit;font-size:15px;color:#2D2D2D;cursor:pointer;}",
    '.wp-sheet button.warn{color:#b23a2c;}',
    '.wp-sheet button.cancel{margin-top:8px;border-top:none;background:#f6f2ea;border-radius:14px;font-weight:700;}',
    '.wp-namebox{padding:4px 0 14px;}',
    ".wp-namebox input{width:100%;box-sizing:border-box;padding:14px;border:1px solid #e6dcc6;border-radius:14px;"
      +"font-family:'Shippori Mincho',serif;font-size:16px;color:#2D2D2D;background:#fff;outline:none;}",
    '.wp-namebox input:focus{border-color:#5D3A7A;}',
    '#wcMypage .mp-name .wp-pen{font-size:12px;opacity:.65;margin-left:7px;vertical-align:middle;}'
  ].join('');
  document.head.appendChild(css);

  var mask = document.createElement('div'); mask.className = 'wp-mask';
  var sheet = document.createElement('div'); sheet.className = 'wp-sheet';
  document.body.appendChild(mask); document.body.appendChild(sheet);
  mask.onclick = closeSheet;
  function closeSheet(){ mask.classList.remove('on'); sheet.classList.remove('on'); }
  function openSheet(title, items){
    sheet.innerHTML = '<div class="bar"></div><div class="ttl">' + title + '</div>'
      + items.map(function(it, i){ return '<button data-i="' + i + '" class="' + (it.cls || '') + '">' + it.label + '</button>'; }).join('')
      + '<button class="cancel" data-i="-1">キャンセル</button>';
    sheet.querySelectorAll('button').forEach(function(b){
      b.onclick = function(){
        var i = +b.getAttribute('data-i');
        closeSheet();
        if (i >= 0 && items[i].run) setTimeout(items[i].run, 120);
      };
    });
    mask.classList.add('on');
    requestAnimationFrame(function(){ sheet.classList.add('on'); });
  }

  // ファイル選択 → 縮小 → dataURL
  var input = document.createElement('input');
  input.type = 'file'; input.accept = 'image/*'; input.style.display = 'none';
  document.body.appendChild(input);

  function pickImage(maxW, maxH, cb){
    input.value = '';
    input.onchange = function(){
      var f = input.files && input.files[0];
      if (!f) return;
      if (!/^image\//.test(f.type)) { if (typeof showToast === 'function') showToast('画像ファイルを選んでください'); return; }
      var fr = new FileReader();
      fr.onload = function(){
        var img = new Image();
        img.onload = function(){
          var cw = maxW, ch = maxH;
          var cv = document.createElement('canvas');
          cv.width = cw; cv.height = ch;
          var ctx = cv.getContext('2d');
          // 中央でトリミング（cover）
          var s = Math.max(cw / img.width, ch / img.height);
          var dw = img.width * s, dh = img.height * s;
          ctx.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
          try { cb(cv.toDataURL('image/jpeg', 0.82)); }
          catch(e){ if (typeof showToast === 'function') showToast('画像を保存できませんでした'); }
        };
        img.onerror = function(){ if (typeof showToast === 'function') showToast('画像を読み込めませんでした'); };
        img.src = fr.result;
      };
      fr.readAsDataURL(f);
    };
    input.click();
  }

  function lineUser(){ try { return (window.WabiLine && WabiLine.user && WabiLine.user()) || null; } catch(e){ return null; } }

  function saveImg(key, dataUrl){
    try {
      set(key, dataUrl);
      apply();
      if (typeof showToast === 'function') showToast('写真を変更しました');
    } catch(e){
      if (typeof showToast === 'function') showToast('保存できませんでした（容量が不足しています）');
    }
  }

  // ── 名前の編集 ──────────────────────────────────────────
  var LS_NM = 'wabiName';
  function openNameSheet(cur, hasLine){
    sheet.innerHTML = '<div class="bar"></div><div class="ttl">表示名を変更</div>'
      + '<div class="wp-namebox"><input id="wpName" maxlength="20" placeholder="お名前（20文字まで）" value="' + String(cur || '').replace(/"/g, '&quot;') + '"></div>'
      + '<button data-a="save">保存する</button>'
      + (hasLine ? '<button data-a="line">LINEの名前に戻す</button>' : '')
      + '<button class="cancel" data-a="cancel">キャンセル</button>';
    sheet.querySelectorAll('button').forEach(function(b){
      b.onclick = function(){
        var a = b.getAttribute('data-a');
        var v = (document.getElementById('wpName') || {}).value || '';
        closeSheet();
        setTimeout(function(){
          if (a === 'save'){
            v = v.trim();
            if (!v) { if (typeof showToast === 'function') showToast('お名前を入力してください'); return; }
            set(LS_NM, v); apply();
            if (typeof showToast === 'function') showToast('表示名を変更しました');
          } else if (a === 'line'){
            set(LS_NM, ''); apply();
            if (typeof showToast === 'function') showToast('LINEの名前に戻しました');
          }
        }, 120);
      };
    });
    mask.classList.add('on');
    requestAnimationFrame(function(){ sheet.classList.add('on'); });
    setTimeout(function(){ var i = document.getElementById('wpName'); if (i) i.focus(); }, 320);
  }

  // 保存済みの写真をマイページに反映する
  function apply(){
    var av = document.querySelector('#wcMypage .mp-av');
    var cv = document.getElementById('mpCover');
    var nmEl = document.querySelector('#wcMypage .mp-name');
    var myAv = get(LS_AV), myCv = get(LS_CV), u = lineUser();

    if (av){
      var src = myAv || (u && u.pic) || '';
      if (src) av.innerHTML = '<img src="' + src + '" style="width:100%;height:100%;object-fit:cover;border-radius:50%">';
      if (!av.querySelector('.wp-cam')){
        var b = document.createElement('div'); b.className = 'wp-cam'; b.textContent = '📷';
        av.appendChild(b);
      }
      av.onclick = function(ev){
        ev.stopPropagation();
        var items = [{ label:'写真を選ぶ', run: function(){ pickImage(400, 400, function(d){ saveImg(LS_AV, d); }); } }];
        if (u && u.pic) items.push({ label:'LINEの写真に戻す', run: function(){ set(LS_AV, ''); apply(); } });
        if (myAv) items.push({ label:'写真を削除', cls:'warn', run: function(){ set(LS_AV, ''); apply(); } });
        openSheet('プロフィール写真', items);
      };
    }

    if (cv){
      if (myCv) cv.style.background = '#3a3025 url(' + myCv + ') center/cover';
      if (!cv.querySelector('.wp-cam-cover')){
        var b2 = document.createElement('div'); b2.className = 'wp-cam-cover'; b2.textContent = '📷';
        cv.appendChild(b2);
        b2.onclick = function(ev){ ev.stopPropagation(); openCover(); };
      }
      cv.onclick = openCover;
    }
    function openCover(){
      var items = [{ label:'写真を選ぶ', run: function(){ pickImage(1200, 700, function(d){ saveImg(LS_CV, d); }); } }];
      if (get(LS_CV)) items.push({ label:'元の写真に戻す', cls:'warn', run: function(){ set(LS_CV, ''); if (typeof openWabiMypage === 'function') openWabiMypage(); } });
      openSheet('カバー写真', items);
    }

    // 名前（タップで変更）
    if (nmEl){
      var myNm = get(LS_NM);
      var shown = myNm || (u && u.name) || nmEl.textContent.replace(/\s*✎\s*$/, '');
      nmEl.innerHTML = esc3(shown) + '<span class="wp-pen">✎</span>';
      nmEl.style.cursor = 'pointer';
      nmEl.onclick = function(ev){
        ev.stopPropagation();
        openNameSheet(shown, !!(u && u.name));
      };
    }
  }
  function esc3(t){ return String(t == null ? '' : t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  window.wabiApplyProfilePhotos = apply;

  // マイページを開くたびに反映（mypage.js が毎回作り直すため）
  function bind(){
    if (typeof window.openWabiMypage !== 'function' || window.openWabiMypage.__wp) return;
    var orig = window.openWabiMypage;
    var wrapped = function(){
      var r = orig.apply(this, arguments);
      setTimeout(apply, 0); setTimeout(apply, 250); setTimeout(apply, 900);
      return r;
    };
    wrapped.__wp = true;
    window.openWabiMypage = wrapped;
  }
  bind();
  var n = 0;
  var iv = setInterval(function(){ bind(); if (++n > 40) clearInterval(iv); }, 300);
})();


/* ══════════════════════════════════════════════════════════════
   わびなび：Supabase同期（機種変更しても引き継げるようにする）
   ・LINEでログインしている間だけ動く
   ・保存するのは EXP／お気に入り／写真／ルート追加スポット
   ・URLとanonキーを設定するまでは何もしない（今までどおり端末内保存）
     設定：WabiSync.setup('https://xxxx.supabase.co', 'anonキー')
   （2026-07-27 追加 / index.html は触らず concierge.js から上書き）
   ══════════════════════════════════════════════════════════════ */
(function(){
  if (window.WabiSync) return;

  var TABLE = 'wabi_profiles';
  // 同期する localStorage のキー
  var KEYS = ['wabiExpState', 'wabiFavorites', 'wabiAvatar', 'wabiCover', 'wabiRouteExtras', 'wabiExpRules', 'wabiName'];

  // Supabaseの接続先。どちらも公開前提の値（publishableキーはanonキーの後継）。
  // ※ secretキー（sb_secret_...）は絶対にここへ置かないこと。
  var CFG = {
    url: 'https://rqkqjrzhvhsogwhtfbqh.supabase.co',
    key: 'sb_publishable_cqf_45micn3pe7PtMq1seQ_2UEAxlCv'
  };
  function normUrl(u){
    return String(u || '').trim().replace(/\/+$/, '').replace(/\/rest\/v1$/, '');
  }
  try {
    CFG.url = normUrl(localStorage.getItem('wabiSbUrl') || CFG.url);
    CFG.key = (localStorage.getItem('wabiSbKey') || CFG.key).trim();
  } catch(e){}

  function lineId(){
    try {
      var u = window.WabiLine && WabiLine.user && WabiLine.user();
      return (u && u.id) ? u.id : '';
    } catch(e){ return ''; }
  }
  function enabled(){ return !!(CFG.url && CFG.key && lineId()); }

  // 旧anonキー（eyJ...）と新publishableキー（sb_publishable_...）の両方に対応
  function headers(extra, withAuth){
    var h = { 'apikey': CFG.key, 'Content-Type': 'application/json' };
    if (withAuth !== false) h['Authorization'] = 'Bearer ' + CFG.key;
    for (var k in (extra || {})) h[k] = extra[k];
    return h;
  }
  // 401のときは Authorization を外してもう一度だけ試す
  function call(url, opts, extra){
    opts = opts || {};
    opts.headers = headers(extra, true);
    return fetch(url, opts).then(function(r){
      if (r.status !== 401 && r.status !== 403) return r;
      var o2 = { method: opts.method, body: opts.body, headers: headers(extra, false) };
      return fetch(url, o2);
    });
  }

  function snapshot(){
    var o = {};
    KEYS.forEach(function(k){
      try { var v = localStorage.getItem(k); if (v != null) o[k] = v; } catch(e){}
    });
    return o;
  }
  function restore(data){
    if (!data || typeof data !== 'object') return 0;
    var n = 0;
    KEYS.forEach(function(k){
      if (typeof data[k] === 'string'){
        try { localStorage.setItem(k, data[k]); n++; } catch(e){}
      }
    });
    return n;
  }
  function localStamp(){
    try { return +(localStorage.getItem('wabiSyncAt') || 0); } catch(e){ return 0; }
  }
  function touch(){
    try { localStorage.setItem('wabiSyncAt', String(Date.now())); } catch(e){}
  }

  function rpc(fn, args){
    var url = CFG.url + '/rest/v1/rpc/' + fn;
    return call(url, { method: 'POST', body: JSON.stringify(args) });
  }

  /* ── 本人確認つきの読み書き（2026-07-31）────────────────────
     以前は「LINEユーザーIDを知っていれば誰でも読み書きできる」状態だった。
     いまは Edge Function(wabi-sync) にログインの証明を渡し、
     サーバー側で本人だと確かめてから読み書きする。               */
  var FN_URL = CFG.url + '/functions/v1/wabi-sync';

  function googleSession(){
    try { return JSON.parse(localStorage.getItem('wabiSbSession') || 'null'); }
    catch(e){ return null; }
  }
  // Googleのトークンが切れていたら更新する
  function refreshGoogle(){
    var s = googleSession();
    if (!s || !s.refresh_token) return Promise.resolve(null);
    return fetch(CFG.url + '/auth/v1/token?grant_type=refresh_token', {
      method: 'POST',
      headers: { 'apikey': CFG.key, 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: s.refresh_token })
    }).then(function(r){ return r.ok ? r.json() : null; })
      .then(function(j){
        if (!j || !j.access_token) return null;
        var ns = {
          access_token: j.access_token,
          refresh_token: j.refresh_token || s.refresh_token,
          expires_at: Date.now() + (parseInt(j.expires_in, 10) || 3600) * 1000,
          provider: 'google'
        };
        try { localStorage.setItem('wabiSbSession', JSON.stringify(ns)); } catch(e){}
        return ns.access_token;
      }).catch(function(){ return null; });
  }
  // LINEのIDトークン（ログイン時に取っておいたもの）
  function lineToken(){
    try { return localStorage.getItem('wabiLineIdToken') || ''; } catch(e){ return ''; }
  }
  // いま使える「本人の証明」を返す
  function proof(){
    var id = lineId();
    if (!id) return Promise.resolve(null);
    if (id.indexOf('g:') === 0){
      var s = googleSession();
      if (!s || !s.access_token) return Promise.resolve(null);
      if (s.expires_at && s.expires_at < Date.now() + 60000){
        return refreshGoogle().then(function(t){
          return t ? { provider: 'google', token: t } : null;
        });
      }
      return Promise.resolve({ provider: 'google', token: s.access_token });
    }
    var t = lineToken();
    return Promise.resolve(t ? { provider: 'line', token: t } : null);
  }

  function callFn(action, extra, retried){
    return proof().then(function(pr){
      if (!pr) return null;
      var body = { action: action, provider: pr.provider, token: pr.token };
      for (var k in (extra || {})) body[k] = extra[k];
      return fetch(FN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'apikey': CFG.key },
        body: JSON.stringify(body)
      }).then(function(r){
        // Googleのトークン切れなら一度だけ取り直して再挑戦
        if (r.status === 401 && !retried && pr.provider === 'google'){
          return refreshGoogle().then(function(t){
            return t ? callFn(action, extra, true) : null;
          });
        }
        if (!r.ok) return null;
        return r.json();
      });
    }).catch(function(){ return null; });
  }

  function pull(){
    if (!enabled()) return Promise.resolve(null);
    return callFn('get').then(function(j){
      if (!j || !j.ok || !j.row) return null;
      var row = j.row;
      var remote = row.updated_at ? Date.parse(row.updated_at) : 0;
      // サーバー側が新しいときだけ端末に取り込む
      if (remote > localStamp()){
        var n = restore(row.data);
        touch();
        repaint();
        return { restored: n, at: remote };
      }
      return { restored: 0, at: remote };
    }).catch(function(){ return null; });
  }

  function push(){
    if (!enabled()) return Promise.resolve(false);
    return callFn('put', { data: snapshot() }).then(function(j){
      if (j && j.ok) { touch(); return true; }
      return false;
    }).catch(function(){ return false; });
  }

  // 画面の再描画（EXPバー・写真・お気に入り件数）
  function repaint(){
    try { if (window.WabiExp) { /* 値はlocalStorage直読みなので描き直すだけでよい */ } } catch(e){}
    try { if (typeof wabiApplyProfilePhotos === 'function') wabiApplyProfilePhotos(); } catch(e){}
    try {
      var mp = document.getElementById('wcMypage');
      if (mp && mp.style.display === 'block' && typeof openWabiMypage === 'function') openWabiMypage();
    } catch(e){}
  }

  // 変更をまとめて送る（連続操作で叩きすぎないように）
  var timer = null;
  function schedulePush(){
    if (!enabled()) return;
    clearTimeout(timer);
    timer = setTimeout(function(){ push(); }, 2500);
  }

  // localStorage への書き込みを検知して自動保存
  var _set = localStorage.setItem.bind(localStorage);
  var _rm  = localStorage.removeItem.bind(localStorage);
  localStorage.setItem = function(k, v){
    var r = _set(k, v);
    if (KEYS.indexOf(k) >= 0) schedulePush();
    return r;
  };
  localStorage.removeItem = function(k){
    var r = _rm(k);
    if (KEYS.indexOf(k) >= 0) schedulePush();
    return r;
  };

  window.WabiSync = {
    config: CFG,
    table: TABLE,
    keys: KEYS,
    enabled: enabled,
    setup: function(url, key){
      CFG.url = normUrl(url);
      CFG.key = (key || '').trim();
      try {
        localStorage.setItem('wabiSbUrl', CFG.url);
        localStorage.setItem('wabiSbKey', CFG.key);
      } catch(e){}
      if (typeof showToast === 'function') showToast('Supabaseの接続先を設定しました');
      return pull().then(function(){ return push(); });
    },
    pull: pull,
    push: push,
    status: function(){
      return { hasUrl: !!CFG.url, hasKey: !!CFG.key, loggedIn: !!lineId(), enabled: enabled(), lastSync: localStamp() };
    },
    // 接続確認（テーブルが見えるかどうかだけを試す）
    test: function(){
      if (!CFG.url || !CFG.key) return Promise.resolve({ ok:false, reason:'URLかキーが未設定です' });
      return rpc('wabi_get', { p_line_id: lineId() || 'CONNECTION_TEST' }).then(function(r){
        return r.text().then(function(t){ return { ok: r.ok, status: r.status, body: t.slice(0, 200) }; });
      }).catch(function(e){ return { ok:false, reason: String(e && e.message || e) }; });
    }
  };

  // ログイン済みなら起動時に取り込む
  setTimeout(function(){ if (enabled()) pull(); }, 3500);
  // 画面を離れるときに取りこぼしを送る
  window.addEventListener('pagehide', function(){ if (enabled()) push(); });
})();


/* ══════════════════════════════════════════════════════════════
   わびなび：ログイン画面と新規登録画面の作り直し
   ・ログイン画面（#pgRegister）… LINEでログイン／Googleでログイン／新規登録はこちら
   ・新規登録画面（#wxSignup）  … 「わびなびアカウントを作成」＋LINE／Googleのみ
   （2026-07-27 / index.html は触らず concierge.js から上書き）
   ══════════════════════════════════════════════════════════════ */
(function(){
  if (window.__wabiRegSkin) return;
  window.__wabiRegSkin = true;

  var GOOGLE_ICON = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">'
    + '<path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>'
    + '<path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>'
    + '<path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>'
    + '<path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>';
  var LINE_ICON = '<svg viewBox="0 0 24 24" width="20" height="20" fill="#fff" aria-hidden="true"><path d="M12 2C6.48 2 2 5.78 2 10.43c0 4.18 3.49 7.69 8.21 8.36.32.07.75.21.86.49.1.25.06.64.03.89l-.14.84c-.04.25-.19.97.85.53 1.04-.44 5.6-3.3 7.64-5.65 1.41-1.55 2.08-3.12 2.08-4.93C21.83 5.78 17.35 2 12 2zM8.31 12.98H6.43c-.22 0-.41-.18-.41-.41V9.04c0-.22.18-.41.41-.41h.16c.22 0 .41.18.41.41v3.12h1.31c.22 0 .41.18.41.41v.16c0 .05-.19.25-.41.25zm1.6-.41c0 .22-.18.41-.41.41h-.16c-.22 0-.41-.18-.41-.41V9.04c0-.22.18-.41.41-.41h.16c.22 0 .41.18.41.41v3.53zm4.05 0c0 .18-.11.33-.28.38-.4.01-.8.02-.13.02-.13 0-.25-.07-.32-.16l-1.61-2.19v1.95c0 .22-.18.41-.41.41h-.16c-.22 0-.41-.18-.41-.41V9.04c0-.18.11-.33.28-.38.04-.1.08-.2.13-.2.13 0 .25.07.32.16l1.61 2.19V9.04c0-.22.18-.41.41-.41h.16c.22 0 .41.18.41.41v3.53zm3.15-2.53c.22 0 .41.18.41.41v.16c0 .22-.18.41-.41.41h-1.31v.84h1.31c.22 0 .41.18.41.41v.16c0 .22-.18.41-.41.41h-1.88c-.22 0-.41-.18-.41-.41V9.04c0-.22.18-.41.41-.41h1.88c.22 0 .41.18.41.41v.16c0 .22-.18.41-.41.41h-1.31v.84h1.31z"/></svg>';

  // Googleログインはまだ未設定（Supabaseの認証にGoogleを連携したら有効化する）
  window.WabiGoogle = {
    ready: false,
    start: function(){
      if (typeof showToast === 'function') showToast('Googleでのログインは現在準備中です');
      return false;
    }
  };

  var css = document.createElement('style');
  css.textContent = [
    // ── ログイン画面（背景を少し薄く／会員になるとを白に）──
    '#pgRegister.reg-bg{background:linear-gradient(180deg,#5b3722 0%,#4a3170 42%,#463067 100%) !important;}',
    '#pgRegister .reg-btn{height:54px;padding:0 16px;border-radius:14px;font-family:\'Shippori Mincho\',serif;font-size:15px;font-weight:700;letter-spacing:.04em;}',
    '#pgRegister .reg-divider{display:none !important;}',
    '#pgRegister .reg-btn-mail{display:none !important;}',
    '#pgRegister .reg-benefits{background:#fff !important;border:1px solid #ece4d3 !important;border-radius:20px !important;',
      'box-shadow:0 10px 30px rgba(0,0,0,.14);padding:20px 22px !important;}',
    '#pgRegister .reg-benefits *{color:#2D2D2D !important;}',
    '#pgRegister .reg-benefits b{color:#5D3A7A !important;}',
    '#pgRegister .reg-benefits-tit{font-family:\'Shippori Mincho\',serif;font-weight:700 !important;}',
    // 新規登録はこちら（メール登録の位置に置く）
    '.reg-signup-link{display:block;width:100%;height:54px;line-height:54px;text-align:center;border-radius:14px;',
      'background:rgba(255,255,255,.10);border:1px solid rgba(201,168,76,.55);color:#fff;cursor:pointer;',
      'font-family:\'Shippori Mincho\',serif;font-size:15px;font-weight:700;letter-spacing:.04em;margin-bottom:10px;}',
    '.reg-signup-link:active{transform:scale(.98);}',
    // ── 新規登録画面 ──
    '#wxSignup{background:#FBFAF7 !important;}',
    '#wxSignup .wl-hd{background:#FBFAF7;border-bottom:none;}',
    '#wxSignup .wl-in{padding:6px 24px 56px;}',
    '#wxSignup .su-ttl{font-family:\'Shippori Mincho\',serif;font-size:24px;font-weight:700;color:#222;',
      'letter-spacing:.04em;margin:14px 0 10px;}',
    '#wxSignup .su-lead{font-size:13px;line-height:1.9;color:#666;font-family:\'Noto Serif JP\',serif;margin-bottom:30px;}',
    // クラシル風：白い丸型ボタン＋左にブランドアイコン
    '#wxSignup .su-btn{position:relative;display:flex;align-items:center;justify-content:center;width:100%;height:62px;',
      'border-radius:999px;background:#fff;border:1px solid #DFDCD6;cursor:pointer;color:#4a4a4a;',
      'font-family:\'Shippori Mincho\',serif;font-size:17px;font-weight:700;letter-spacing:.06em;',
      'margin-bottom:14px;transition:transform .12s,box-shadow .2s;box-shadow:0 2px 8px rgba(0,0,0,.03);}',
    '#wxSignup .su-btn:active{transform:scale(.97);}',
    '#wxSignup .su-btn .ic{position:absolute;left:22px;top:50%;transform:translateY(-50%);display:flex;align-items:center;}',
    '#wxSignup .su-btn .lineic{width:28px;height:28px;border-radius:7px;background:#06C755;display:flex;align-items:center;justify-content:center;}',
    '#wxSignup .su-benefit{background:#fff;border-radius:24px;box-shadow:0 10px 30px rgba(0,0,0,.08);padding:22px 24px;margin-top:32px;}',
    '#wxSignup .su-benefit .h{font-family:\'Shippori Mincho\',serif;font-size:15px;font-weight:700;color:#222;margin-bottom:14px;}',
    '#wxSignup .su-benefit li{list-style:none;display:flex;gap:10px;font-size:13.5px;line-height:1.75;color:#444;',
      'font-family:\'Noto Serif JP\',serif;margin-top:10px;}',
    '#wxSignup .su-benefit li .c{color:#C8A04D;font-weight:700;}',
    '#wxSignup .su-benefit li b{color:#5D3A7A;}',
    '#wxSignup .su-login{display:block;text-align:center;margin-top:22px;font-size:13px;color:#5D3A7A;font-weight:700;cursor:pointer;}',
    '#wxSignup .su-fine{font-size:11px;color:#9a948a;text-align:center;line-height:1.8;margin-top:20px;font-family:\'Noto Serif JP\',serif;}'
  ].join('');
  document.head.appendChild(css);

  // ── 新規登録画面を作り直す ────────────────────────────────
  function buildSignup(){
    var pg = document.getElementById('wxSignup');
    if (!pg) return;
    var box = pg.querySelector('.wl-in');
    if (!box || box.getAttribute('data-su')) return;
    box.setAttribute('data-su', '1');
    box.innerHTML =
        '<div class="su-ttl">わびなびアカウントを作成</div>'
      + '<div class="su-lead">参拝の記録・御朱印・巡礼レベルを保存できます。<br>'
      +   'パスワードを覚える必要はありません。</div>'
      + '<button class="su-btn" id="suLine"><span class="ic"><span class="lineic">' + LINE_ICON + '</span></span>LINEで登録</button>'
      + '<button class="su-btn" id="suGoogle"><span class="ic">' + GOOGLE_ICON + '</span>Googleで登録</button>'
      + '<div class="su-benefit"><div class="h">会員になると</div><ul>'
      +   '<li><span class="c">◆</span><span>参拝記録・御朱印を<b>クラウド保存</b></span></li>'
      +   '<li><span class="c">◆</span><span>AI巡拝ルートが<b>無制限</b>に</span></li>'
      +   '<li><span class="c">◆</span><span>お気に入りを<b>複数端末</b>で共有</span></li>'
      +   '<li><span class="c">◆</span><span>参拝や投稿で<b>巡礼レベル</b>が上がる</span></li>'
      +   '<li><span class="c">◆</span><span>限定・特別御朱印の<b>お知らせ</b></span></li>'
      + '</ul></div>'
      + '<a class="su-login" id="suLogin">すでにアカウントをお持ちの方はログイン ›</a>'
      + '<div class="su-fine">登録することで利用規約とプライバシーポリシーに<br>同意したものとみなされます。</div>';

    document.getElementById('suLine').onclick   = function(){ window.WabiLine.start(); };
    document.getElementById('suGoogle').onclick = function(){ window.WabiGoogle.start(); };
    document.getElementById('suLogin').onclick  = function(){
      pg.style.display = 'none';
      if (typeof window.wabiOpenLogin === 'function') window.wabiOpenLogin();
    };
  }

  // ── ログイン画面の文言とボタンを差し替える ─────────────────
  function fixLogin(){
    var pr = document.getElementById('pgRegister');
    if (!pr) return;
    var line = pr.querySelector('.reg-btn-line');
    var goog = pr.querySelector('.reg-btn-google');
    if (line && line.getAttribute('data-wl') !== '1'){
      line.setAttribute('data-wl', '1');
      line.innerHTML = LINE_ICON + 'LINEでログイン';
      line.setAttribute('onclick', '');
      line.onclick = function(){ pr.style.display = 'none'; window.WabiLine.start(); };
    }
    if (goog && goog.getAttribute('data-wl') !== '1'){
      goog.setAttribute('data-wl', '1');
      goog.innerHTML = GOOGLE_ICON + 'Googleでログイン';
      goog.setAttribute('onclick', '');
      goog.onclick = function(){ window.WabiGoogle.start(); };
    }
    // メール登録の位置に「新規登録はこちら」を置く
    var mail = pr.querySelector('.reg-btn-mail');
    if (mail && !pr.querySelector('.reg-signup-link')){
      var a = document.createElement('div');
      a.className = 'reg-signup-link';
      a.textContent = '新規登録はこちら';
      a.onclick = function(){
        pr.style.display = 'none';
        if (typeof window.wabiOpenSignup === 'function') window.wabiOpenSignup();
      };
      mail.parentNode.insertBefore(a, mail);
    }
    // 下の切り替えリンクは重複するので隠す
    var tg = pr.querySelector('.reg-toggle');
    if (tg) tg.style.display = 'none';
  }

  buildSignup();
  fixLogin();
  var n = 0;
  var iv = setInterval(function(){ buildSignup(); fixLogin(); if (++n > 40) clearInterval(iv); }, 400);
})();


/* ══════════════════════════════════════════════════════════════
   わびなび：マイページ調整
   ・表示名をヘッダー（ログインボタン）にも反映
   ・アバターに写真があるときはカメラマークを隠す
   ・6枚のカードを横長（4:3）に。参拝した神社と御朱印の位置を入れ替え
   ・カードの背景画像を差し替え
   （2026-07-27 / index.html は触らず concierge.js から上書き）
   ══════════════════════════════════════════════════════════════ */
(function(){
  if (window.__wabiMypage2) return;
  window.__wabiMypage2 = true;

  var IMG = {
    '参拝した神社':        'mp-sanpai.jpg',
    '御朱印':              'mp-goshuin.jpg',
    'お気に入りの神社仏閣': 'mp-post.jpg',
    '投稿した記録':        'mp-favorite.jpg',
    'フォロー':            'mp-follow.jpg',
    'フォロワー':          'mp-follower.jpg'
  };
  // 表示順（参拝した神社と御朱印を入れ替え）
  var ORDER = ['御朱印', '参拝した神社', 'お気に入りの神社仏閣', '投稿した記録', 'フォロー', 'フォロワー'];

  var css = document.createElement('style');
  css.textContent = [
    // 横長（4:3）／すべての行を同じ高さに揃える
    '#wcMypage .mp-stat{aspect-ratio:4/3 !important;height:auto !important;min-height:0 !important;}',
    '#wcMypage .mp-stats{align-items:stretch !important;grid-auto-rows:1fr !important;}',
    // ラベルが2行になっても箱が伸びないようにする
    '#wcMypage .mp-stat-l{overflow:hidden;}',
    // 写真があるときはカメラマークを隠す
    '#wcMypage .mp-av.has-photo .wp-cam{display:none !important;}'
  ].join('');
  document.head.appendChild(css);

  function labelOf(el){
    var l = el.querySelector('.mp-stat-l');
    return l ? l.textContent.trim() : '';
  }

  function fixCards(){
    var wrap = document.querySelector('#wcMypage .mp-stats');
    if (!wrap) return;
    var cards = [].slice.call(wrap.querySelectorAll('.mp-stat'));
    if (!cards.length) return;

    // 背景画像を差し替え（data-bg を外して mypage.js 側の上書きを止める）
    cards.forEach(function(c){
      var lb = labelOf(c);
      var f = IMG[lb];
      if (!f) return;
      c.removeAttribute('data-bg');
      c.style.background = '#3a3025 url(' + f + ') center/cover';
    });

    // 並び替え
    if (wrap.getAttribute('data-ordered') !== '1'){
      var byLabel = {};
      cards.forEach(function(c){ byLabel[labelOf(c)] = c; });
      var ok = ORDER.every(function(k){ return byLabel[k]; });
      if (ok){
        ORDER.forEach(function(k){ wrap.appendChild(byLabel[k]); });
        wrap.setAttribute('data-ordered', '1');
      }
    }
  }

  // アバターに写真があるかどうかでカメラマークを出し分け
  function fixAvatarBadge(){
    var av = document.querySelector('#wcMypage .mp-av');
    if (!av) return;
    var hasImg = !!av.querySelector('img');
    if (hasImg) av.classList.add('has-photo');
    else av.classList.remove('has-photo');
  }

  // 表示名をヘッダーのログインボタンにも反映
  function syncHeaderName(){
    try {
      var btn = document.getElementById('wlBtn');
      if (!btn) return;
      var u = (window.WabiLine && WabiLine.user && WabiLine.user()) || null;
      if (!u) return;                      // 未ログインなら「ログイン」のまま
      var my = '';
      try { my = localStorage.getItem('wabiName') || ''; } catch(e){}
      var nm = my || u.name || '巡礼者';
      var pic = '';
      try { pic = localStorage.getItem('wabiAvatar') || u.pic || ''; } catch(e){}
      var ic = pic
        ? '<img src="' + pic + '" style="width:20px;height:20px;border-radius:50%;object-fit:cover">'
        : '<svg viewBox="0 0 20 20" fill="none"><circle cx="10" cy="6.5" r="3.2" stroke="currentColor" stroke-width="1.6"/>'
          + '<path d="M3.5 17c0-3.6 13-3.6 13 0" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>';
      btn.innerHTML = ic + (nm.length > 6 ? nm.slice(0, 6) + '…' : nm);
    } catch(e){}
  }
  window.wabiSyncHeaderName = syncHeaderName;

  function run(){ fixCards(); fixAvatarBadge(); syncHeaderName(); }

  // マイページを開くたび／写真や名前を変えたときに反映
  function bind(){
    if (typeof window.openWabiMypage !== 'function' || window.openWabiMypage.__mp2) return;
    var orig = window.openWabiMypage;
    var wrapped = function(){
      var r = orig.apply(this, arguments);
      [0, 200, 600, 1400].forEach(function(ms){ setTimeout(run, ms); });
      return r;
    };
    wrapped.__mp2 = true;
    window.openWabiMypage = wrapped;
  }
  bind();
  var n = 0;
  var iv = setInterval(function(){ bind(); if (++n > 40) clearInterval(iv); }, 300);

  // 写真・名前の保存を検知して即反映
  var _set = localStorage.setItem.bind(localStorage);
  localStorage.setItem = function(k, v){
    var r = _set(k, v);
    if (k === 'wabiName' || k === 'wabiAvatar') setTimeout(run, 60);
    return r;
  };
  var _rm = localStorage.removeItem.bind(localStorage);
  localStorage.removeItem = function(k){
    var r = _rm(k);
    if (k === 'wabiName' || k === 'wabiAvatar') setTimeout(run, 60);
    return r;
  };

  setTimeout(syncHeaderName, 2500);
  setTimeout(syncHeaderName, 5000);
})();


/* ══════════════════════════════════════════════════════════════
   わびなび：ヘッダーまわりの整理
   ・ログインボタンを小さく
   ・使っていない検索ボタンを削除
   ・「APIキー設定済み」の帯を利用者から見えないように
   （2026-07-27 / index.html は触らず concierge.js から上書き）
   ══════════════════════════════════════════════════════════════ */
(function(){
  if (window.__wabiHdTidy) return;
  window.__wabiHdTidy = true;

  var css = document.createElement('style');
  css.textContent = [
    // ログインボタンを一回り小さく
    ".wl-btn{padding:8px 14px !important;font-size:12.5px !important;gap:6px !important;}",
    ".wl-btn svg{width:14px !important;height:14px !important;}",
    ".wl-btn img{width:17px !important;height:17px !important;}",
    ".wl-menu{min-width:170px;}",
    ".wl-menu a{padding:14px 18px;font-size:14px;}",
    // 検索ボタンを非表示
    ".site-hd-actions .site-hd-btn{display:none !important;}",
    // APIキーの帯は管理用なので隠す
    "#apiBanner,#apiAppliedBar{display:none !important;}"
  ].join('');
  document.head.appendChild(css);

  // 管理用：必要なときだけ表示できるようにしておく
  window.wabiShowApiBar = function(){
    var st = document.createElement('style');
    st.textContent = '#apiBanner,#apiAppliedBar{display:flex !important;}';
    document.head.appendChild(st);
    if (typeof showToast === 'function') showToast('APIキーの設定欄を表示しました');
  };

  // index.html 側があとから style.display を直接いじるので、そのつど閉じ直す
  function hideApi(){
    ['apiBanner', 'apiAppliedBar'].forEach(function(id){
      var el = document.getElementById(id);
      if (el && el.style.display !== 'none' && !window.__wabiApiShown) el.style.display = 'none';
    });
  }
  hideApi();
  WABI_TICK(hideApi, 1500);
})();


/* ══════════════════════════════════════════════════════════════
   わびなび：下部メニューを4つに ／ 名前のちらつき解消 ／ 御朱印ランキングの高さ揃え
   （2026-07-27 / index.html は触らず concierge.js から上書き）
   ══════════════════════════════════════════════════════════════ */
(function(){
  if (window.__wabiNav4) return;
  window.__wabiNav4 = true;

  var css = document.createElement('style');
  css.textContent = [
    // 既存のフッターナビと金色のマップボタンを隠す
    '.fnav{display:none !important;}',
    '#fabMap,.fab-map{display:none !important;}',
    // 新しい下部メニュー（どのページでも出る）
    '#wabiNav{position:fixed;bottom:0;left:50%;transform:translateX(-50%);width:100%;max-width:500px;',
      'background:rgba(255,255,255,.97);backdrop-filter:blur(8px);border-top:1px solid #f0e8d8;',
      'display:grid;grid-template-columns:repeat(4,1fr);z-index:400;',
      'padding:6px 0 max(6px,env(safe-area-inset-bottom));box-shadow:0 -2px 12px rgba(0,0,0,.05);}',
    '#wabiNav .wn{display:flex;flex-direction:column;align-items:center;gap:3px;cursor:pointer;padding:4px 0;color:#b9b0a2;}',
    '#wabiNav .wn:active{opacity:.6;}',
    '#wabiNav .wn.on{color:#a83320;}',
    '#wabiNav .wn svg{width:21px;height:21px;}',
    "#wabiNav .wn span{font-size:9.5px;letter-spacing:.04em;font-family:'Noto Serif JP',serif;font-weight:600;}",
    // 下部メニューに隠れないように下余白
    'body{padding-bottom:0;}'
  ].join('');
  document.head.appendChild(css);

  var IC = {
    home:  '<svg viewBox="0 0 22 22" fill="none"><path d="M3 10l8-6.5 8 6.5v8.5a1 1 0 0 1-1 1h-4v-6H8v6H4a1 1 0 0 1-1-1V10z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>',
    map:   '<svg viewBox="0 0 22 22" fill="none"><path d="M11 19s6-6.1 6-10.2A6 6 0 0 0 5 8.8C5 12.9 11 19 11 19z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><circle cx="11" cy="9" r="2.2" stroke="currentColor" stroke-width="1.5"/></svg>',
    posts: '<svg viewBox="0 0 22 22" fill="none"><circle cx="8" cy="7.5" r="2.6" stroke="currentColor" stroke-width="1.5"/><circle cx="15" cy="8.5" r="2.1" stroke="currentColor" stroke-width="1.4"/><path d="M3.5 17c0-2.9 9-2.9 9 0" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M13.5 15.6c.4-1.6 5-1.6 5 .9" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>',
    my:    '<svg viewBox="0 0 22 22" fill="none"><circle cx="11" cy="7.5" r="3.4" stroke="currentColor" stroke-width="1.6"/><path d="M4 18.5c0-4 14-4 14 0" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>'
  };

  // 開いているオーバーレイをすべて閉じる
  function closeAll(){
    ['pgShrineDetail','pgMap','pgRegister','pgAiRoute','pgAiResult','pgAreaSearch','pgPostDetail',
     'pgTourList','pgSeasonList','pgEcList','pgOsupplyList','pgShukatsuList','pgArticleList',
     'wabiRoutePg','wabiRankMore','wxGuide','wxInvite','wxSignup','wcMypage','wcPost',
     'wabiListPg','wabiFeedPg'].forEach(function(id){
      var el = document.getElementById(id);
      if (el) el.style.display = 'none';
    });
    var mp = document.getElementById('wcMypage');
    if (mp) mp.classList.remove('show');
  }

  var nav = document.createElement('div');
  nav.id = 'wabiNav';
  nav.innerHTML =
      '<div class="wn on" data-k="home">'  + IC.home  + '<span>ホーム</span></div>'
    + '<div class="wn" data-k="map">'      + IC.map   + '<span>マップ</span></div>'
    + '<div class="wn" data-k="posts">'    + IC.posts + '<span>みんなの投稿</span></div>'
    + '<div class="wn" data-k="my">'       + IC.my    + '<span>マイページ</span></div>';
  document.body.appendChild(nav);

  function mark(k){
    nav.querySelectorAll('.wn').forEach(function(el){
      el.classList.toggle('on', el.getAttribute('data-k') === k);
    });
  }

  nav.querySelectorAll('.wn').forEach(function(el){
    el.onclick = function(){
      var k = el.getAttribute('data-k');
      mark(k);
      if (k === 'home'){
        closeAll();
        if (typeof go === 'function') go('pgHome');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (k === 'map'){
        closeAll();
        // 閉じる処理が終わってから地図を開く（同時に走ると閉じられてしまう）
        setTimeout(function(){
          if (typeof searchNearby === 'function') searchNearby();
          else if (typeof openMapFromFab === 'function') openMapFromFab();
          // 念のため：数秒経っても開かなければ強制的に表示する
          setTimeout(function(){
            var m = document.getElementById('pgMap');
            if (m && m.style.display !== 'flex' && typeof showMapArea === 'function') showMapArea();
          }, 2500);
        }, 80);
      } else if (k === 'posts'){
        closeAll();
        if (typeof openCommunityAll === 'function') openCommunityAll();
        else if (typeof showToast === 'function') showToast('みんなの投稿ページは現在準備中です');
      } else if (k === 'my'){
        closeAll();
        if (typeof openWabiMypage === 'function') openWabiMypage();
      }
    };
  });

  // ── 名前のちらつきを解消（LINEの名前→設定名の切り替わりを見せない）──
  function myName(){
    try { return localStorage.getItem('wabiName') || ''; } catch(e){ return ''; }
  }
  var fixing = false;
  function fixBtn(){
    if (fixing) return;
    var btn = document.getElementById('wlBtn');
    if (!btn) return;
    var nm = myName();
    if (!nm) return;
    var u = null;
    try { u = window.WabiLine && WabiLine.user && WabiLine.user(); } catch(e){}
    if (!u) return;
    var shown = nm.length > 6 ? nm.slice(0, 6) + '…' : nm;
    if (btn.textContent.trim() === shown) return;
    fixing = true;
    try { if (typeof wabiSyncHeaderName === 'function') wabiSyncHeaderName(); } catch(e){}
    fixing = false;
  }
  // ボタンが作られた／書き換わった瞬間に直す
  if (window.MutationObserver){
    var mo = new MutationObserver(function(){ fixBtn(); });
    var acts = document.querySelector('.site-hd-actions');
    if (acts) mo.observe(acts, { childList: true, subtree: true, characterData: true });
  }
  fixBtn();
  var t = 0;
  var iv = setInterval(function(){ fixBtn(); if (++t > 40) clearInterval(iv); }, 120);
})();


/* ── 御朱印タグのランキングで高さが崩れるのを直す ───────────── */
(function(){
  if (window.__wabiGoshuinFix) return;
  window.__wabiGoshuinFix = true;
  var css = document.createElement('style');
  css.textContent = [
    // 行の高さを揃える
    '#list.wc-rankgrid{grid-auto-rows:1fr !important;align-items:stretch !important;}',
    '#wrmGrid{grid-auto-rows:1fr !important;align-items:stretch !important;}',
    // 御朱印の写真・募集中プレースホルダを同じ高さに
    '.rcard img[style*="height: 340px"],.rcard img[style*="height:340px"]{height:190px !important;}',
    '#list .rcard [style*="height: 340px"],#list .rcard [style*="height:340px"]{height:190px !important;}',
    '#list .rcard,#wrmGrid .rcard{display:flex;flex-direction:column;height:100% !important;}',
    '#list.wc-rankgrid>.rcard,#wrmGrid>.rcard{align-self:stretch !important;}',
    '#list .rcard .rftr,#wrmGrid .rcard .rftr{margin-top:auto;}'
  ].join('');
  document.head.appendChild(css);

  // インラインで 340px 指定されている要素を実測で詰める
  function trim(){
    document.querySelectorAll('#list .rcard img, #wrmGrid .rcard img').forEach(function(im){
      if (im.style && /340px/.test(im.style.height)) im.style.height = '190px';
    });
    document.querySelectorAll('#list .rcard div, #wrmGrid .rcard div').forEach(function(d){
      if (d.style && /340px/.test(d.style.height)) d.style.height = '190px';
      if (d.style && /340px/.test(d.style.minHeight)) d.style.minHeight = '190px';
    });
  }
  WABI_TICK(trim, 900);
})();


/* ══════════════════════════════════════════════════════════════
   わびなび：カバー写真のちらつき解消 ／ 神社・お寺タグ追加
   （2026-07-27 / index.html は触らず concierge.js から上書き）
   ══════════════════════════════════════════════════════════════ */
(function(){
  if (window.__wabiFix3) return;
  window.__wabiFix3 = true;

  // ── ① カバー写真のちらつきを消す ──────────────────────────
  // mypage.js があとから Wikipedia の写真を入れてくるので、
  // 自分で設定したカバーがあるときは CSS で強制的に固定する。
  var coverStyle = document.createElement('style');
  coverStyle.id = 'wabiCoverFix';
  document.head.appendChild(coverStyle);
  function fixCover(){
    var u = '';
    try { u = localStorage.getItem('wabiCover') || ''; } catch(e){}
    coverStyle.textContent = u
      ? '#wcMypage #mpCover{background:#3a3025 url("' + u + '") center/cover !important;}'
      : '';
  }
  fixCover();
  var _set = localStorage.setItem.bind(localStorage);
  localStorage.setItem = function(k, v){ var r = _set(k, v); if (k === 'wabiCover') fixCover(); return r; };
  var _rm = localStorage.removeItem.bind(localStorage);
  localStorage.removeItem = function(k){ var r = _rm(k); if (k === 'wabiCover') fixCover(); return r; };

  // 初期状態は「両方」（神社中心/両方/寺院中心のUIと合わせる）
  try { if (typeof currentType !== 'undefined' && currentType === 'shrine' && !localStorage.getItem('wabiTypeTouched')) currentType = ''; } catch(e){}
  setTimeout(function(){ try { if (typeof filter === 'function') filter(); } catch(e){} }, 600);

  // ── ② 「すべて」と「御朱印」の間に 神社／お寺 を追加 ────────
  function addTypeChips(){
    var row = document.querySelector('.tagrow');
    if (!row || row.querySelector('[data-wtype]')) return;
    var all = row.querySelector('.tag');
    if (!all) return;

    function mk(label, type){
      var s = document.createElement('span');
      s.className = 'tag';
      s.setAttribute('data-wtype', type);
      s.textContent = label;
      s.onclick = function(){
        var on = s.classList.contains('on');
        row.querySelectorAll('[data-wtype]').forEach(function(e){ e.classList.remove('on'); });
        if (on){
          // もう一度押したら解除（神社・寺の両方を表示）
          try { window.currentType = ''; } catch(e){}
          if (typeof currentType !== 'undefined') currentType = '';
        } else {
          s.classList.add('on');
          try { localStorage.setItem('wabiTypeTouched', '1'); } catch(e){}
          if (typeof setType === 'function') setType(type);
          else if (typeof currentType !== 'undefined') currentType = type;
        }
        if (typeof filter === 'function') filter();
      };
      return s;
    }
    var shrine = mk('神社', 'shrine');
    var temple = mk('お寺', 'temple');
    all.parentNode.insertBefore(temple, all.nextSibling);
    all.parentNode.insertBefore(shrine, all.nextSibling);

    // 「すべて」を押したら種別の絞り込みも解除する
    var origAll = all.onclick;
    all.addEventListener('click', function(){
      row.querySelectorAll('[data-wtype]').forEach(function(e){ e.classList.remove('on'); });
      try { if (typeof currentType !== 'undefined') currentType = ''; } catch(e){}
      setTimeout(function(){ if (typeof filter === 'function') filter(); }, 0);
    });
  }
  addTypeChips();
  var n = 0;
  var iv = setInterval(function(){ addTypeChips(); if (++n > 30) clearInterval(iv); }, 400);
})();


/* ══════════════════════════════════════════════════════════════
   わびなび：マイページ6枚のカードから開く一覧ページ
   ① 参拝した神社 ② 御朱印帳 ③ お気に入り ④ 投稿した記録
   ⑤ フォロー ⑥ フォロワー
   （2026-07-27 / index.html は触らず concierge.js から上書き）
   ══════════════════════════════════════════════════════════════ */
(function(){
  if (window.__wabiListPages) return;
  window.__wabiListPages = true;

  var css = document.createElement('style');
  css.textContent = [
    ".wlp{position:fixed;inset:0;z-index:350;background:#FAF8F4;display:none;overflow-y:auto;",
      "-webkit-overflow-scrolling:touch;font-family:'Shippori Mincho','Noto Serif JP',serif;color:#2D2D2D;}",
    '.wlp-hd{position:sticky;top:0;z-index:5;background:rgba(250,248,244,.96);backdrop-filter:blur(8px);',
      'display:flex;align-items:center;padding:16px;border-bottom:1px solid #EFE9DD;}',
    '.wlp-hd .b{font-size:22px;cursor:pointer;line-height:1;width:30px;}',
    '.wlp-hd .t{flex:1;text-align:center;font-size:15px;font-weight:800;letter-spacing:.1em;}',
    '.wlp-hd .r{width:30px;text-align:right;color:#C8A04D;font-size:18px;}',
    '.wlp-in{max-width:500px;margin:0 auto;padding:20px 20px 90px;}',
    '.wlp-h{font-size:19px;font-weight:700;letter-spacing:.04em;}',
    '.wlp-cnt{font-size:30px;font-weight:800;color:#5D3A7A;margin:2px 0 18px;}',
    '.wlp-cnt small{font-size:14px;font-weight:700;margin-left:3px;color:#6F6F6F;}',
    '.wlp-addg{display:block;width:100%;margin-top:18px;padding:13px 0;border:2px dashed #C8A04D;'
      +'border-radius:16px;background:#fff;color:#7a4a10;font-size:13.5px;font-weight:700;'
      +'font-family:inherit;cursor:pointer;}',
    // 検索欄
    '.wlp-search{position:relative;margin-bottom:18px;}',
    ".wlp-search input{width:100%;box-sizing:border-box;height:44px;padding:0 40px 0 14px;border:1px solid #E7E1D6;",
      "border-radius:14px;background:#fff;font-family:'Noto Serif JP',serif;font-size:13px;color:#333;outline:none;}",
    '.wlp-search input:focus{border-color:#5D3A7A;}',
    '.wlp-search .ic{position:absolute;right:14px;top:50%;transform:translateY(-50%);color:#b9b0a2;}',
    // 大きめカード（参拝した神社）
    '.wlp-card{display:flex;gap:12px;background:#fff;border-radius:24px;box-shadow:0 10px 30px rgba(0,0,0,.06);',
      'padding:12px;margin-bottom:14px;cursor:pointer;align-items:center;}',
    '.wlp-card:active{transform:scale(.995);}',
    '.wlp-card .ph{flex:0 0 108px;width:108px;height:84px;border-radius:16px;background:#e9e3d8 center/cover;overflow:hidden;}',
    '.wlp-card .nm{font-size:16px;font-weight:700;line-height:1.35;}',
    ".wlp-card .sub{font-size:12px;color:#6F6F6F;font-family:'Noto Serif JP',serif;margin-top:3px;}",
    '.wlp-card .dt{font-size:11.5px;color:#C8A04D;font-weight:700;margin-top:6px;}',
    '.wlp-card .ar{flex:0 0 14px;color:#c9c2b6;font-size:20px;}',
    // 3列グリッド（御朱印帳）
    '.wlp-g3{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;}',
    '.wlp-g3 .it{cursor:pointer;}',
    '.wlp-g3 .im{width:100%;aspect-ratio:3/4;border-radius:14px;background:#fff center/cover;border:1px solid #E7E1D6;',
      'box-shadow:0 6px 18px rgba(0,0,0,.06);display:flex;align-items:center;justify-content:center;overflow:hidden;}',
    '.wlp-g3 .im img{width:100%;height:100%;object-fit:contain;background:#fff;}',
    ".wlp-g3 .nm{font-size:11.5px;font-weight:700;margin-top:7px;line-height:1.35;text-align:center;}",
    ".wlp-g3 .dt{font-size:10px;color:#9a948a;text-align:center;margin-top:2px;font-family:'Noto Serif JP',serif;}",
    // 2列グリッド（お気に入り・投稿）
    '.wlp-g2{display:grid;grid-template-columns:1fr 1fr;gap:12px;}',
    '.wlp-g2 .it{position:relative;border-radius:20px;overflow:hidden;background:#fff;',
      'box-shadow:0 10px 30px rgba(0,0,0,.06);cursor:pointer;}',
    '.wlp-g2 .im{width:100%;aspect-ratio:1/1;background:#e9e3d8 center/cover;}',
    '.wlp-g2 .bd{padding:10px 12px 12px;}',
    '.wlp-g2 .nm{font-size:13px;font-weight:700;line-height:1.35;}',
    ".wlp-g2 .sub{font-size:11px;color:#6F6F6F;margin-top:3px;font-family:'Noto Serif JP',serif;}",
    '.wlp-g2 .heart{position:absolute;top:9px;right:9px;width:28px;height:28px;border-radius:50%;',
      'background:rgba(255,255,255,.92);display:flex;align-items:center;justify-content:center;font-size:13px;color:#5D3A7A;}',
    '.wlp-g2 .cap{position:absolute;left:10px;bottom:10px;color:#fff;font-size:11.5px;font-weight:700;text-shadow:0 1px 6px rgba(0,0,0,.6);}',
    // 人リスト（フォロー・フォロワー）
    '.wlp-tabs{display:flex;gap:0;border-bottom:1px solid #EFE9DD;margin-bottom:16px;}',
    '.wlp-tabs .tb{flex:1;text-align:center;padding:12px 0;font-size:13.5px;font-weight:700;color:#9a948a;cursor:pointer;}',
    '.wlp-tabs .tb.on{color:#5D3A7A;box-shadow:inset 0 -2px 0 #5D3A7A;}',
    '.wlp-person{display:flex;align-items:center;gap:12px;background:#fff;border-radius:20px;',
      'box-shadow:0 8px 24px rgba(0,0,0,.05);padding:12px 14px;margin-bottom:10px;}',
    '.wlp-person .av{flex:0 0 46px;width:46px;height:46px;border-radius:50%;background:#e9e3d8 center/cover;}',
    '.wlp-person .nm{font-size:14px;font-weight:700;}',
    ".wlp-person .mt{font-size:11.5px;color:#6F6F6F;margin-top:3px;font-family:'Noto Serif JP',serif;}",
    ".wlp-btn{flex:0 0 auto;padding:8px 14px;border-radius:999px;border:1px solid #E7E1D6;background:#fff;",
      "font-family:inherit;font-size:12px;font-weight:700;color:#6F6F6F;cursor:pointer;}",
    '.wlp-btn.act{border-color:#5D3A7A;color:#5D3A7A;}',
    // 空のとき
    '.wlp-empty{text-align:center;padding:52px 20px;}',
    '.wlp-empty .em{font-size:34px;opacity:.35;}',
    ".wlp-empty .tx{font-size:13.5px;color:#8a8378;line-height:1.9;margin-top:14px;font-family:'Noto Serif JP',serif;}",
    // 詳細シート
    '.wlp-sheet{position:fixed;inset:0;z-index:360;background:rgba(0,0,0,.55);display:none;align-items:flex-end;}',
    '.wlp-sheet.on{display:flex;}',
    '.wlp-sheet .bx{width:100%;max-width:500px;margin:0 auto;background:#FAF8F4;border-radius:24px 24px 0 0;',
      'max-height:88vh;overflow-y:auto;padding:0 0 calc(24px + env(safe-area-inset-bottom));}',
    '.wlp-sheet .hero{width:100%;aspect-ratio:4/3;background:#e9e3d8 center/cover;border-radius:24px 24px 0 0;}',
    '.wlp-sheet .hero img{width:100%;height:100%;object-fit:contain;background:#fff;border-radius:24px 24px 0 0;}',
    '.wlp-sheet .bd{padding:20px;}',
    '.wlp-sheet .nm{font-size:21px;font-weight:700;}',
    ".wlp-sheet .sub{font-size:12.5px;color:#6F6F6F;margin-top:5px;font-family:'Noto Serif JP',serif;}",
    '.wlp-sheet .row{display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid #EFE9DD;font-size:13.5px;}',
    ".wlp-sheet .row span:first-child{color:#8a8378;font-family:'Noto Serif JP',serif;}",
    '.wlp-sheet .cta{width:100%;margin-top:20px;height:54px;border:none;border-radius:16px;background:#5D3A7A;color:#fff;',
      "font-family:inherit;font-size:15px;font-weight:700;cursor:pointer;}",
    '.wlp-sheet .cta2{width:100%;margin-top:10px;height:50px;border:1px solid #C8A04D;border-radius:16px;background:#fff;',
      "color:#8a6d3b;font-family:inherit;font-size:14px;font-weight:700;cursor:pointer;}"
  ].join('');
  document.head.appendChild(css);

  function esc(s){ return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  function photoOf(name){
    try { if (window.photoCache && photoCache[name] && photoCache[name][0]) return photoCache[name][0]; } catch(e){}
    return '';
  }

  // ── 共通のページ枠 ─────────────────────────────────────────
  var pg = document.createElement('div');
  pg.className = 'wlp'; pg.id = 'wabiListPg';
  pg.innerHTML = '<div class="wlp-hd"><span class="b">‹</span><span class="t"></span><span class="r"></span></div><div class="wlp-in"></div>';
  document.body.appendChild(pg);
  pg.querySelector('.b').onclick = function(){ pg.style.display = 'none'; };

  var sheet = document.createElement('div');
  sheet.className = 'wlp-sheet';
  sheet.innerHTML = '<div class="bx"></div>';
  document.body.appendChild(sheet);
  sheet.onclick = function(e){ if (e.target === sheet) sheet.classList.remove('on'); };
  function openSheet(html){ sheet.querySelector('.bx').innerHTML = html; sheet.classList.add('on'); }
  window.wabiCloseSheet = function(){ sheet.classList.remove('on'); };

  function show(title, right, html){
    pg.querySelector('.wlp-hd .t').textContent = title;
    pg.querySelector('.wlp-hd .r').innerHTML = right || '';
    pg.querySelector('.wlp-in').innerHTML = html;
    pg.style.display = 'block';
    pg.scrollTop = 0;
  }
  function empty(em, tx){
    return '<div class="wlp-empty"><div class="em">' + em + '</div><div class="tx">' + tx + '</div></div>';
  }

  // ── ① 参拝した神社 ────────────────────────────────────────
  function visitedList(){
    var out = [];
    try {
      var rec = JSON.parse(localStorage.getItem('wabiVisits') || '[]');
      if (Array.isArray(rec)) rec.forEach(function(v){ if (v && v.name) out.push(v); });
    } catch(e){}
    try {
      if (typeof SHRINES !== 'undefined'){
        SHRINES.filter(function(s){ return s.visited; }).forEach(function(s){
          if (!out.some(function(o){ return o.name === s.name; }))
            out.push({ name: s.name, addr: s.addr, date: '', _s: s });
        });
      }
    } catch(e){}
    return out;
  }
  function openVisited(){
    var list = visitedList();
    var h = '<div class="wlp-h">参拝した神社</div><div class="wlp-cnt">' + list.length + '<small>社</small></div>';
    h += '<div class="wlp-search"><input id="wlpQ1" placeholder="神社名・地域で検索"><span class="ic">🔍</span></div>';
    h += '<div id="wlpBody1">' + (list.length ? list.map(cardVisited).join('')
        : empty('⛩', 'まだ参拝の記録がありません。<br>神社詳細から「参拝済にする」を押すと<br>ここに残っていきます。')) + '</div>';
    show('参拝した神社', '', h);
    var q = document.getElementById('wlpQ1');
    if (q) q.oninput = function(){
      var v = q.value.trim();
      var f = v ? list.filter(function(x){ return (x.name + (x.addr || '')).indexOf(v) >= 0; }) : list;
      document.getElementById('wlpBody1').innerHTML = f.length ? f.map(cardVisited).join('')
        : empty('🔍', '見つかりませんでした');
    };
    bindVisited(list);
  }
  function cardVisited(v, i){
    var ph = photoOf(v.name);
    return '<div class="wlp-card" data-v="' + i + '">'
      + '<div class="ph"' + (ph ? ' style="background-image:url(\'' + esc(ph) + '\')"' : '') + '></div>'
      + '<div style="flex:1;min-width:0"><div class="nm">' + esc(v.name) + '</div>'
      + '<div class="sub">' + esc(v.addr || '') + '</div>'
      + (v.date ? '<div class="dt">' + esc(v.date) + ' 参拝</div>' : '<div class="dt">参拝済</div>')
      + '</div><div class="ar">›</div></div>';
  }
  function bindVisited(list){
    pg.querySelectorAll('[data-v]').forEach(function(el){
      el.onclick = function(){
        var v = list[+el.getAttribute('data-v')];
        if (!v) return;
        var s = v._s || null;
        try { if (!s && typeof SHRINES !== 'undefined') s = SHRINES.filter(function(x){ return x.name === v.name; })[0]; } catch(e){}
        pg.style.display = 'none';
        if (s && typeof openShrineDetail === 'function') openShrineDetail(s);
      };
    });
  }

  // ── ② 御朱印帳 ────────────────────────────────────────────
  function goshuinItems(){
    var out = [];
    try {
      if (typeof goshuinList !== 'undefined'){
        goshuinList.forEach(function(g){ if (g && g.imageUrl) out.push(g); });
      }
    } catch(e){}
    try {
      var mine = JSON.parse(localStorage.getItem('wabiGoshuin') || '[]');
      if (Array.isArray(mine)) mine.forEach(function(g){ if (g && g.imageUrl) out.push(g); });
    } catch(e){}
    return out;
  }
  function openGoshuin(){
    var list = goshuinItems();
    var h = '<div class="wlp-h">御朱印帳</div><div class="wlp-cnt">' + list.length + '<small>体</small></div>';
    h += list.length
      ? '<div class="wlp-g3">' + list.map(function(g, i){
          return '<div class="it" data-g="' + i + '"><div class="im"><img src="' + esc(g.imageUrl) + '" loading="lazy"></div>'
            + '<div class="nm">' + esc(g.shrine) + '</div>'
            + (g.date ? '<div class="dt">' + esc(g.date) + '</div>' : '') + '</div>';
        }).join('') + '</div>'
      : empty('📕', 'まだ御朱印が登録されていません。<br>下の「＋ 御朱印を登録」から<br>追加できます。');
    h += '<button class="wlp-addg" id="wlpAddG">＋ 御朱印を登録</button>'
      + '<div style="text-align:center;font-size:10.5px;color:#b8b2a6;margin-top:8px">'
      + 'ここに登録した御朱印は、あなたのこの端末にだけ残ります。サイトには公開されません。</div>';
    show('御朱印帳', '📖', h);
    var addG = document.getElementById('wlpAddG');
    if (addG) addG.onclick = function(){ recordGoshuin(''); };
    pg.querySelectorAll('[data-g]').forEach(function(el){
      el.onclick = function(){
        var g = list[+el.getAttribute('data-g')];
        if (!g) return;
        openSheet('<div class="hero"><img src="' + esc(g.imageUrl) + '"></div><div class="bd">'
          + '<div class="nm">' + esc(g.shrine) + '</div>'
          + '<div class="sub">' + esc(g.author ? '投稿者：' + g.author : '') + '</div>'
          + (g.date ? '<div class="row"><span>拝受日</span><span>' + esc(g.date) + '</span></div>' : '')
          + '<button class="cta" onclick="wabiCloseSheet()">閉じる</button></div>');
      };
    });
  }

  // ── ③ お気に入り ──────────────────────────────────────────
  function favList(){
    try { var a = JSON.parse(localStorage.getItem('wabiFavorites') || '[]'); return Array.isArray(a) ? a : []; }
    catch(e){ return []; }
  }
  function openFav(){
    var list = favList();
    var h = '<div class="wlp-h">お気に入り</div><div class="wlp-cnt">' + list.length + '<small>件</small></div>';
    h += list.length
      ? '<div class="wlp-g2">' + list.map(function(f, i){
          var ph = photoOf(f.name);
          return '<div class="it" data-f="' + i + '"><div class="im"' + (ph ? ' style="background-image:url(\'' + esc(ph) + '\')"' : '') + '></div>'
            + '<div class="heart">♥</div>'
            + '<div class="bd"><div class="nm">' + esc(f.name) + '</div>'
            + '<div class="sub">' + esc(f.addr || f.area || '') + '</div></div></div>';
        }).join('') + '</div>'
      : empty('★', 'まだお気に入りがありません。<br>神社詳細の「お気に入りに登録」を押すと<br>ここに集まります。');
    show('お気に入り', '', h);
    pg.querySelectorAll('[data-f]').forEach(function(el){
      el.onclick = function(){
        var f = list[+el.getAttribute('data-f')];
        if (!f) return;
        var s = null;
        try { if (typeof SHRINES !== 'undefined') s = SHRINES.filter(function(x){ return x.name === f.name; })[0]; } catch(e){}
        if (!s) s = { name:f.name, deity:'—', addr:f.addr || '', map:'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(f.name),
                      area:f.area || '', rating:0, rev:0, visited:false, tags:['goshuin'], lat:f.lat, lng:f.lng, rank:0 };
        pg.style.display = 'none';
        if (typeof openShrineDetail === 'function') openShrineDetail(s);
      };
    });
  }

  // ── ④ 投稿した記録 ────────────────────────────────────────
  function myPosts(){
    try { var a = JSON.parse(localStorage.getItem('wabiMyPosts') || '[]'); return Array.isArray(a) ? a : []; }
    catch(e){ return []; }
  }
  function openPosts(){
    var list = myPosts();
    var h = '<div class="wlp-h">投稿した記録</div><div class="wlp-cnt">' + list.length + '<small>件</small></div>';
    h += list.length
      ? '<div class="wlp-g2">' + list.map(function(p, i){
          var im = (p.photos && p.photos[0]) || p.image || '';
          return '<div class="it" data-p="' + i + '"><div class="im"' + (im ? ' style="background-image:url(\'' + esc(im) + '\')"' : '') + '>'
            + '<div class="cap">' + esc(p.date || '') + '<br>' + esc(p.shrine || '') + '</div></div></div>';
        }).join('') + '</div>'
      : empty('✎', 'まだ投稿がありません。<br>「参拝を投稿する」から、参拝の記録や<br>御朱印の写真を残せます。');
    show('投稿した記録', '✎', h);
    pg.querySelectorAll('[data-p]').forEach(function(el){
      el.onclick = function(){
        var p = list[+el.getAttribute('data-p')];
        if (!p) return;
        var im = (p.photos && p.photos[0]) || p.image || '';
        openSheet((im ? '<div class="hero" style="background-image:url(\'' + esc(im) + '\')"></div>' : '')
          + '<div class="bd"><div class="nm">' + esc(p.shrine || '参拝の記録') + '</div>'
          + '<div class="sub">' + esc(p.date || '') + '</div>'
          + '<div style="margin-top:14px;font-size:14px;line-height:1.9;font-family:\'Noto Serif JP\',serif">'
          + esc(p.text || p.body || '') + '</div>'
          + '<button class="cta" onclick="wabiCloseSheet()">閉じる</button></div>');
      };
    });
  }

  // ── ⑤⑥ フォロー・フォロワー ──────────────────────────────
  function people(key){
    try { var a = JSON.parse(localStorage.getItem(key) || '[]'); return Array.isArray(a) ? a : []; }
    catch(e){ return []; }
  }
  function personRow(p, btnLabel, act){
    return '<div class="wlp-person"><div class="av"' + (p.pic ? ' style="background-image:url(\'' + esc(p.pic) + '\')"' : '') + '></div>'
      + '<div style="flex:1;min-width:0"><div class="nm">' + esc(p.name) + '</div>'
      + '<div class="mt">巡礼Lv.' + (p.level || 1) + '　参拝数 ' + (p.visits || 0) + ' 社</div></div>'
      + '<button class="wlp-btn' + (act ? ' act' : '') + '">' + btnLabel + '</button></div>';
  }
  function openFollow(){
    var list = people('wabiFollowing');
    var h = '<div class="wlp-tabs"><div class="tb on">フォロー中</div><div class="tb">おすすめ</div></div>'
      + '<div class="wlp-h">フォロー</div><div class="wlp-cnt">' + list.length + '<small>人</small></div>'
      + '<div class="wlp-search"><input placeholder="名前で検索"><span class="ic">🔍</span></div>'
      + (list.length ? list.map(function(p){ return personRow(p, 'フォロー中', false); }).join('')
         : empty('👥', 'まだ誰もフォローしていません。<br>みんなの投稿から気になる方を<br>フォローできます。'));
    show('フォロー', '＋', h);
    pg.querySelectorAll('.wlp-tabs .tb').forEach(function(t){
      t.onclick = function(){
        pg.querySelectorAll('.wlp-tabs .tb').forEach(function(x){ x.classList.remove('on'); });
        t.classList.add('on');
        if (typeof showToast === 'function' && t.textContent === 'おすすめ') showToast('おすすめの表示は準備中です');
      };
    });
  }
  function openFollower(){
    var list = people('wabiFollowers');
    var h = '<div class="wlp-tabs"><div class="tb on">フォロワー</div><div class="tb">リクエスト</div></div>'
      + '<div class="wlp-h">フォロワー</div><div class="wlp-cnt">' + list.length + '<small>人</small></div>'
      + '<div class="wlp-search"><input placeholder="名前で検索"><span class="ic">🔍</span></div>'
      + (list.length ? list.map(function(p){ return personRow(p, p.following ? 'フォロー中' : 'フォローバック', !p.following); }).join('')
         : empty('🎖', 'まだフォロワーがいません。<br>参拝の記録や御朱印を投稿すると<br>見つけてもらいやすくなります。'));
    show('フォロワー', '＋', h);
    pg.querySelectorAll('.wlp-tabs .tb').forEach(function(t){
      t.onclick = function(){
        pg.querySelectorAll('.wlp-tabs .tb').forEach(function(x){ x.classList.remove('on'); });
        t.classList.add('on');
        if (typeof showToast === 'function' && t.textContent === 'リクエスト') showToast('リクエストの表示は準備中です');
      };
    });
  }

  // ── マイページの6枚のカードに割り当てる ───────────────────
  var MAP = {
    '参拝した神社':        openVisited,
    '御朱印':              openGoshuin,
    'お気に入りの神社仏閣': openFav,
    '投稿した記録':        openPosts,
    'フォロー':            openFollow,
    'フォロワー':          openFollower
  };
  window.wabiOpenList = MAP;

  function bindCards(){
    document.querySelectorAll('#wcMypage .mp-stat').forEach(function(c){
      if (c.getAttribute('data-wlp')) return;
      var l = c.querySelector('.mp-stat-l');
      var fn = l ? MAP[l.textContent.trim()] : null;
      if (!fn) return;
      c.setAttribute('data-wlp', '1');
      c.removeAttribute('data-tap');            // 「準備中です」トーストを止める
      c.addEventListener('click', function(ev){
        ev.stopPropagation();
        fn();
      }, true);
    });
  }
  function bind(){
    if (typeof window.openWabiMypage !== 'function' || window.openWabiMypage.__wlp) return;
    var orig = window.openWabiMypage;
    var wrapped = function(){
      var r = orig.apply(this, arguments);
      [0, 250, 800].forEach(function(ms){ setTimeout(bindCards, ms); });
      return r;
    };
    wrapped.__wlp = true;
    window.openWabiMypage = wrapped;
  }
  bind();
  var n = 0;
  var iv = setInterval(function(){ bind(); bindCards(); if (++n > 40) clearInterval(iv); }, 300);
})();


/* ══════════════════════════════════════════════════════════════
   わびなび：記録機能（参拝の記録 ／ 御朱印の登録 ／ 投稿）
   保存先は localStorage（Supabase同期の対象キーに追加済み）
     wabiVisits   参拝の記録
     wabiGoshuin  御朱印
     wabiMyPosts  投稿した記録
   （2026-07-27 / index.html は触らず concierge.js から上書き）
   ══════════════════════════════════════════════════════════════ */
(function(){
  if (window.WabiRec) return;

  var K_V = 'wabiVisits', K_G = 'wabiGoshuin', K_P = 'wabiMyPosts';
  function load(k){ try { var a = JSON.parse(localStorage.getItem(k) || '[]'); return Array.isArray(a) ? a : []; } catch(e){ return []; } }
  function save(k, a){
    try { localStorage.setItem(k, JSON.stringify(a)); return true; }
    catch(e){ if (typeof showToast === 'function') showToast('保存できませんでした（端末の空き容量が不足しています）'); return false; }
  }
  function today(){
    var d = new Date();
    return d.getFullYear() + '.' + ('0' + (d.getMonth() + 1)).slice(-2) + '.' + ('0' + d.getDate()).slice(-2);
  }
  function esc(s){ return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

  var css = document.createElement('style');
  css.textContent = [
    '.wrc-mask{position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:420;display:none;}',
    '.wrc-mask.on{display:block;}',
    ".wrc{position:fixed;left:0;right:0;bottom:0;z-index:421;max-width:500px;margin:0 auto;background:#FAF8F4;",
      "border-radius:24px 24px 0 0;max-height:90vh;overflow-y:auto;transform:translateY(100%);",
      "transition:transform .24s cubic-bezier(.22,.61,.36,1);font-family:'Shippori Mincho','Noto Serif JP',serif;color:#2D2D2D;}",
    '.wrc.on{transform:translateY(0);}',
    '.wrc .bar{width:38px;height:4px;border-radius:2px;background:#e2dbcd;margin:10px auto 4px;}',
    '.wrc-in{padding:8px 20px calc(24px + env(safe-area-inset-bottom));}',
    '.wrc-ttl{font-size:19px;font-weight:700;text-align:center;margin:6px 0 4px;}',
    ".wrc-sub{font-size:12.5px;color:#6F6F6F;text-align:center;margin-bottom:18px;font-family:'Noto Serif JP',serif;}",
    '.wrc-lb{font-size:13px;font-weight:700;margin:16px 0 8px;}',
    ".wrc-in input[type=text],.wrc-in input[type=date],.wrc-in textarea,.wrc-in select{width:100%;box-sizing:border-box;",
      "padding:13px;border:1px solid #E7E1D6;border-radius:14px;background:#fff;font-family:'Noto Serif JP',serif;",
      "font-size:14px;color:#2D2D2D;outline:none;}",
    '.wrc-in textarea{min-height:96px;resize:vertical;line-height:1.7;}',
    '.wrc-in input:focus,.wrc-in textarea:focus,.wrc-in select:focus{border-color:#5D3A7A;}',
    '.wrc-stars{display:flex;gap:8px;font-size:30px;color:#ddd6c6;cursor:pointer;}',
    '.wrc-stars .s.on{color:#C8A04D;}',
    '.wrc-chips{display:flex;flex-wrap:wrap;gap:8px;}',
    ".wrc-chip{padding:9px 14px;border:1px solid #E7E1D6;border-radius:999px;background:#fff;font-size:12.5px;cursor:pointer;color:#6F6F6F;}",
    '.wrc-chip.on{border-color:#5D3A7A;color:#5D3A7A;font-weight:700;background:#F6F2FC;}',
    '.wrc-photos{display:flex;gap:10px;flex-wrap:wrap;}',
    '.wrc-ph{position:relative;width:88px;height:88px;border-radius:14px;overflow:hidden;background:#e9e3d8 center/cover;}',
    '.wrc-ph .x{position:absolute;top:5px;right:5px;width:22px;height:22px;border-radius:50%;background:rgba(255,255,255,.94);',
      'display:flex;align-items:center;justify-content:center;font-size:12px;cursor:pointer;}',
    '.wrc-add{width:88px;height:88px;border-radius:14px;border:1.5px dashed #d8d0c0;background:#fff;color:#a89f8e;',
      'display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;font-size:11px;cursor:pointer;}',
    '.wrc-add span{font-size:20px;}',
    '.wrc-save{width:100%;margin-top:22px;height:54px;border:none;border-radius:16px;background:#5D3A7A;color:#fff;',
      "font-family:inherit;font-size:15px;font-weight:700;cursor:pointer;box-shadow:0 8px 22px rgba(93,58,122,.26);}",
    '.wrc-save:active{transform:scale(.98);}',
    '.wrc-cancel{width:100%;margin-top:10px;height:48px;border:none;border-radius:14px;background:#f2eee6;color:#6F6F6F;',
      "font-family:inherit;font-size:14px;font-weight:700;cursor:pointer;}",
    ".wrc-note{font-size:11px;color:#9a948a;line-height:1.7;margin-top:12px;text-align:center;font-family:'Noto Serif JP',serif;}",
    '.wrc-pub{display:flex;align-items:center;gap:10px;background:#fff;border:1px solid #E7E1D6;border-radius:14px;padding:13px;}',
    '.wrc-pub input{width:auto !important;}'
  ].join('');
  document.head.appendChild(css);

  var mask = document.createElement('div'); mask.className = 'wrc-mask';
  var box  = document.createElement('div'); box.className  = 'wrc';
  box.innerHTML = '<div class="bar"></div><div class="wrc-in"></div>';
  document.body.appendChild(mask); document.body.appendChild(box);
  mask.onclick = close;
  function close(){ mask.classList.remove('on'); box.classList.remove('on'); }
  function open(html){
    box.querySelector('.wrc-in').innerHTML = html;
    mask.classList.add('on');
    requestAnimationFrame(function(){ box.classList.add('on'); });
  }
  window.wabiRecClose = close;

  // 写真：端末内で縮小してから保存
  var fileInput = document.createElement('input');
  fileInput.type = 'file'; fileInput.accept = 'image/*'; fileInput.style.display = 'none';
  document.body.appendChild(fileInput);
  function pick(maxW, cb){
    fileInput.value = '';
    fileInput.onchange = function(){
      var f = fileInput.files && fileInput.files[0];
      if (!f || !/^image\//.test(f.type)) return;
      var fr = new FileReader();
      fr.onload = function(){
        var img = new Image();
        img.onload = function(){
          var sc = Math.min(1, maxW / img.width);
          var cv = document.createElement('canvas');
          cv.width = Math.round(img.width * sc); cv.height = Math.round(img.height * sc);
          cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height);
          try { cb(cv.toDataURL('image/jpeg', 0.8)); } catch(e){}
        };
        img.src = fr.result;
      };
      fr.readAsDataURL(f);
    };
    fileInput.click();
  }

  var STAY = ['〜30分', '1時間', '2時間', '半日', '1日'];

  // ── 参拝の記録 ────────────────────────────────────────────
  function recordVisit(shrine){
    var name = (shrine && shrine.name) || (window.currentSdShrine && currentSdShrine.name) || '';
    var addr = (shrine && shrine.addr) || '';
    var state = { rating: 0, stay: '', photos: [] };

    // どの神社か決まっていないとき（トップの「投稿する」など）は選んでもらう
    var pick = '';
    if (!name){
      var opts = '';
      try {
        if (typeof SHRINES !== 'undefined'){
          opts = SHRINES.map(function(s){ return '<option value="' + esc(s.name) + '">' + esc(s.addr || '') + '</option>'; }).join('');
        }
      } catch(e){}
      pick = '<div class="wrc-lb">参拝した神社・お寺</div>'
           + '<input type="text" id="wrcShrine" list="wrcShrineList" placeholder="神社名・お寺名を入力">'
           + '<datalist id="wrcShrineList">' + opts + '</datalist>';
    }

    open('<div class="wrc-ttl">参拝を記録する</div>'
      + (name ? '<div class="wrc-sub">' + esc(name) + '</div>' : '<div class="wrc-sub">参拝の記録を残しましょう</div>')
      + pick
      + '<div class="wrc-lb">参拝日</div><input type="date" id="wrcDate">'
      + '<div class="wrc-lb">満足度</div><div class="wrc-stars" id="wrcStars">'
      +   [1,2,3,4,5].map(function(i){ return '<span class="s" data-i="' + i + '">★</span>'; }).join('') + '</div>'
      + '<div class="wrc-lb">滞在時間</div><div class="wrc-chips" id="wrcStay">'
      +   STAY.map(function(s){ return '<span class="wrc-chip" data-s="' + esc(s) + '">' + esc(s) + '</span>'; }).join('') + '</div>'
      + '<div class="wrc-lb">感想</div><textarea id="wrcMemo" placeholder="そのときに感じたことを残しておきましょう"></textarea>'
      + '<div class="wrc-lb">写真</div><div class="wrc-photos" id="wrcPhotos">'
      +   '<div class="wrc-add" id="wrcAdd"><span>＋</span>写真を追加</div></div>'
      + '<div class="wrc-lb">みんなの投稿にも載せる</div>'
      + '<label class="wrc-pub"><input type="checkbox" id="wrcPub"><span style="font-size:13px">投稿として公開する（＋50 EXP）</span></label>'
      + '<button class="wrc-save" id="wrcSave">記録する</button>'
      + '<button class="wrc-cancel" onclick="wabiRecClose()">キャンセル</button>'
      + '<div class="wrc-note">写真は端末内で縮小して保存されます。<br>ログイン中は自動でクラウドにも保存されます。</div>');

    var d = new Date();
    document.getElementById('wrcDate').value =
      d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);

    document.querySelectorAll('#wrcStars .s').forEach(function(s){
      s.onclick = function(){
        state.rating = +s.getAttribute('data-i');
        document.querySelectorAll('#wrcStars .s').forEach(function(x){
          x.classList.toggle('on', +x.getAttribute('data-i') <= state.rating);
        });
      };
    });
    document.querySelectorAll('#wrcStay .wrc-chip').forEach(function(c){
      c.onclick = function(){
        var v = c.getAttribute('data-s');
        var on = c.classList.contains('on');
        document.querySelectorAll('#wrcStay .wrc-chip').forEach(function(x){ x.classList.remove('on'); });
        if (!on) { c.classList.add('on'); state.stay = v; } else state.stay = '';
      };
    });
    function paintPhotos(){
      var wrap = document.getElementById('wrcPhotos');
      wrap.innerHTML = state.photos.map(function(p, i){
        return '<div class="wrc-ph" style="background-image:url(\'' + p + '\')"><div class="x" data-x="' + i + '">✕</div></div>';
      }).join('') + (state.photos.length < 4 ? '<div class="wrc-add" id="wrcAdd"><span>＋</span>写真を追加</div>' : '');
      var add = document.getElementById('wrcAdd');
      if (add) add.onclick = function(){ pick(1000, function(u){ state.photos.push(u); paintPhotos(); }); };
      wrap.querySelectorAll('[data-x]').forEach(function(x){
        x.onclick = function(){ state.photos.splice(+x.getAttribute('data-x'), 1); paintPhotos(); };
      });
    }
    paintPhotos();

    document.getElementById('wrcSave').onclick = function(){
      // 神社が未指定なら入力欄から取る
      if (!name){
        var inp = document.getElementById('wrcShrine');
        var v = inp ? inp.value.trim() : '';
        if (!v) { if (typeof showToast === 'function') showToast('参拝した神社・お寺を入力してください'); return; }
        name = v;
        try {
          if (typeof SHRINES !== 'undefined'){
            var hit = SHRINES.filter(function(s){ return s.name === v; })[0];
            if (hit) addr = hit.addr || '';
          }
        } catch(e){}
      }
      var dv = (document.getElementById('wrcDate') || {}).value || '';
      var date = dv ? dv.replace(/-/g, '.') : today();
      var memo = (document.getElementById('wrcMemo') || {}).value || '';
      var pub  = !!(document.getElementById('wrcPub') || {}).checked;

      var list = load(K_V);
      list.unshift({ name: name, addr: addr, date: date, rating: state.rating,
                     stay: state.stay, memo: memo, photos: state.photos, ts: Date.now() });
      if (!save(K_V, list)) return;

      if (pub){
        var posts = load(K_P);
        posts.unshift({ shrine: name, date: date, text: memo, photos: state.photos, ts: Date.now() });
        save(K_P, posts);
      }
      close();
      try {
        if (window.WabiExp){
          WabiExp.add('visit_record', { silent: true });
          if (pub) WabiExp.add('post_photo', { silent: true });
        }
      } catch(e){}
      if (typeof showToast === 'function') showToast('参拝を記録しました　＋80 EXP');
      refreshCounts();
    };
  }

  // ── 御朱印の登録 ──────────────────────────────────────────
  function recordGoshuin(shrineName){
    var name = shrineName || (window.currentSdShrine && currentSdShrine.name) || '';
    var askName = !name;          // 神社名が分からないときは入力してもらう
    var state = { img: '' };

    open('<div class="wrc-ttl">御朱印を登録する</div>'
      + (askName
          ? '<div class="wrc-lb">神社・お寺の名前</div><input type="text" id="wrcGName" placeholder="例：伊勢神宮（内宮）">'
          : '<div class="wrc-sub">' + esc(name) + '</div>')
      + '<div class="wrc-lb">御朱印の写真</div><div class="wrc-photos" id="wrcGP">'
      +   '<div class="wrc-add" id="wrcGAdd" style="width:120px;height:150px"><span>📷</span>写真を選ぶ</div></div>'
      + '<div class="wrc-lb">拝受日</div><input type="date" id="wrcGDate">'
      + '<div class="wrc-lb">メモ</div><textarea id="wrcGMemo" placeholder="限定御朱印、書き置き など"></textarea>'
      + '<button class="wrc-save" id="wrcGSave">登録する</button>'
      + '<button class="wrc-cancel" onclick="wabiRecClose()">キャンセル</button>'
      + '<div class="wrc-note">登録した御朱印はマイページの御朱印帳に並びます。</div>');

    var d = new Date();
    document.getElementById('wrcGDate').value =
      d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);

    function paint(){
      var w = document.getElementById('wrcGP');
      w.innerHTML = state.img
        ? '<div class="wrc-ph" style="width:120px;height:150px;background-image:url(\'' + state.img + '\')"><div class="x" id="wrcGX">✕</div></div>'
        : '<div class="wrc-add" id="wrcGAdd" style="width:120px;height:150px"><span>📷</span>写真を選ぶ</div>';
      var a = document.getElementById('wrcGAdd');
      if (a) a.onclick = function(){ pick(1100, function(u){ state.img = u; paint(); }); };
      var x = document.getElementById('wrcGX');
      if (x) x.onclick = function(){ state.img = ''; paint(); };
    }
    paint();

    document.getElementById('wrcGSave').onclick = function(){
      if (askName) {
        name = ((document.getElementById('wrcGName') || {}).value || '').trim();
        if (!name) { if (typeof showToast === 'function') showToast('神社・お寺の名前を入れてください'); return; }
      }
      if (!state.img) { if (typeof showToast === 'function') showToast('御朱印の写真を選んでください'); return; }
      var dv = (document.getElementById('wrcGDate') || {}).value || '';
      var list = load(K_G);
      list.unshift({ shrine: name, imageUrl: state.img, date: dv ? dv.replace(/-/g, '.') : today(),
                     memo: (document.getElementById('wrcGMemo') || {}).value || '', author: 'あなた', ts: Date.now() });
      if (!save(K_G, list)) return;
      close();
      try { if (window.WabiExp) WabiExp.add('goshuin_record', { silent: true }); } catch(e){}
      if (typeof showToast === 'function') showToast('御朱印を登録しました　＋100 EXP');
      refreshCounts();
    };
  }

  // ── マイページの数字を実データに合わせる ──────────────────
  function counts(){
    var fav = 0, vis = 0, gos = 0, pos = 0;
    try { fav = (JSON.parse(localStorage.getItem('wabiFavorites') || '[]') || []).length; } catch(e){}
    vis = load(K_V).length;
    gos = load(K_G).length;
    pos = load(K_P).length;
    // データベース側で参拝済になっているものも数える
    try {
      if (typeof SHRINES !== 'undefined'){
        SHRINES.filter(function(s){ return s.visited; }).forEach(function(s){
          if (!load(K_V).some(function(v){ return v.name === s.name; })) vis++;
        });
      }
    } catch(e){}
    try {
      if (typeof goshuinList !== 'undefined') gos += goshuinList.filter(function(g){ return g && g.imageUrl; }).length;
    } catch(e){}
    return { '参拝した神社': vis, '御朱印': gos, 'お気に入りの神社仏閣': fav, '投稿した記録': pos,
             'フォロー': 0, 'フォロワー': 0 };
  }
  function refreshCounts(){
    try {
      var c = counts();
      document.querySelectorAll('#wcMypage .mp-stat').forEach(function(card){
        var l = card.querySelector('.mp-stat-l');
        var v = card.querySelector('.mp-stat-v');
        if (!l || !v) return;
        var key = l.textContent.trim();
        if (!(key in c)) return;
        v.setAttribute('data-count', c[key]);
        var unit = v.querySelector('small');
        v.textContent = c[key];
        if (unit) v.appendChild(unit);
      });
    } catch(e){}
  }
  window.wabiRefreshCounts = refreshCounts;

  // ── 既存のボタンにつなぐ ──────────────────────────────────
  function hookAll(){
    // 神社詳細「参拝済にする」
    if (typeof window.sdVisited === 'function' && !window.sdVisited.__wrc){
      var f = function(){ recordVisit(window.currentSdShrine); };
      f.__wrc = true;
      window.sdVisited = f;
    }
    // ★御朱印の「募集中」カードには、もう登録フォームを付けない★
    //   サイトに出る御朱印画像は管理者だけが登録する（admin/goshuin.html）。
    //   利用者が自分の御朱印帳に記録する入口は、マイページの御朱印帳に置いた。
    //   （以前はここで window.showGoshuinForm を差し替えていた）
    // コミュニティの「参拝を投稿する」
    if (typeof window.openCommunityPost === 'function' && !window.openCommunityPost.__wrc){
      var p = function(){ recordVisit(window.currentSdShrine || null); };
      p.__wrc = true;
      window.openCommunityPost = p;
    }
  }
  hookAll();
  var n = 0;
  var iv = setInterval(function(){ hookAll(); if (++n > 60) clearInterval(iv); }, 300);

  // マイページを開いたら実データの件数に直す
  function bind(){
    if (typeof window.openWabiMypage !== 'function' || window.openWabiMypage.__wrc) return;
    var orig = window.openWabiMypage;
    var w = function(){
      var r = orig.apply(this, arguments);
      [120, 400, 1100].forEach(function(ms){ setTimeout(refreshCounts, ms); });
      return r;
    };
    w.__wrc = true;
    window.openWabiMypage = w;
  }
  bind();
  var m = 0;
  var iv2 = setInterval(function(){ bind(); if (++m > 40) clearInterval(iv2); }, 300);

  window.WabiRec = {
    visit: recordVisit,
    goshuin: recordGoshuin,
    counts: counts,
    refresh: refreshCounts,
    keys: { visits: K_V, goshuin: K_G, posts: K_P }
  };
})();


/* 記録した内容もクラウド同期の対象にする */
(function(){
  try {
    if (window.WabiSync && WabiSync.keys){
      ['wabiVisits', 'wabiGoshuin', 'wabiMyPosts'].forEach(function(k){
        if (WabiSync.keys.indexOf(k) < 0) WabiSync.keys.push(k);
      });
    }
  } catch(e){}
})();


/* ══════════════════════════════════════════════════════════════
   わびなび：マイページの整理 ／ 下部メニューの確実化 ／ みんなの最新投稿ページ
   （2026-07-27 / index.html は触らず concierge.js から上書き）
   ══════════════════════════════════════════════════════════════ */
(function(){
  if (window.__wabiFeed) return;
  window.__wabiFeed = true;

  function esc(s){ return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

  var css = document.createElement('style');
  css.textContent = [
    // ── 下部メニューを最前面に、iPhoneでも確実に反応するように ──
    '#wabiNav{z-index:999 !important;pointer-events:auto !important;-webkit-tap-highlight-color:transparent;}',
    '#wabiNav .wn{-webkit-tap-highlight-color:transparent;touch-action:manipulation;user-select:none;}',
    // ── みんなの最新投稿 ──
    ".wfd{position:fixed;inset:0;z-index:355;background:#FAF8F4;display:none;overflow-y:auto;",
      "-webkit-overflow-scrolling:touch;font-family:'Shippori Mincho','Noto Serif JP',serif;color:#2D2D2D;}",
    '.wfd-hd{position:sticky;top:0;z-index:5;background:rgba(250,248,244,.96);backdrop-filter:blur(8px);',
      'display:flex;align-items:center;padding:16px;}',
    '.wfd-hd .b{font-size:22px;cursor:pointer;width:30px;line-height:1;}',
    '.wfd-hd .t{flex:1;text-align:center;font-size:17px;font-weight:700;letter-spacing:.06em;}',
    '.wfd-hd .r{width:30px;text-align:right;font-size:17px;}',
    '.wfd-in{max-width:500px;margin:0 auto;padding:0 16px 96px;}',
    ".wfd-sub{font-size:12.5px;color:#6F6F6F;font-family:'Noto Serif JP',serif;margin-bottom:14px;}",
    '.wfd-chips{display:flex;gap:9px;overflow-x:auto;padding-bottom:4px;margin-bottom:14px;}',
    '.wfd-chips::-webkit-scrollbar{display:none;}',
    ".wfd-chip{flex:0 0 auto;padding:10px 20px;border:1px solid #E7E1D6;border-radius:999px;background:#fff;",
      "font-size:13px;color:#6F6F6F;cursor:pointer;font-weight:600;}",
    '.wfd-chip.on{background:#5D3A7A;border-color:#5D3A7A;color:#fff;}',
    '.wfd-bar{display:flex;align-items:center;justify-content:space-between;font-size:12.5px;color:#6F6F6F;',
      "margin-bottom:14px;font-family:'Noto Serif JP',serif;}",
    '.wfd-bar span{cursor:pointer;}',
    '.wfd-g{display:grid;grid-template-columns:1fr 1fr;gap:12px;}',
    '.wfd-card{background:#fff;border-radius:20px;box-shadow:0 8px 24px rgba(0,0,0,.06);overflow:hidden;cursor:pointer;',
      'display:flex;flex-direction:column;}',
    '.wfd-card .im{position:relative;width:100%;aspect-ratio:4/3;background:#e9e3d8 center/cover;}',
    '.wfd-card .cat{position:absolute;top:8px;left:8px;background:#5D3A7A;color:#fff;font-size:10px;font-weight:700;',
      'padding:3px 9px;border-radius:8px;}',
    '.wfd-card .cnt{position:absolute;top:8px;right:8px;background:rgba(0,0,0,.5);color:#fff;font-size:10px;',
      'padding:3px 8px;border-radius:8px;}',
    '.wfd-card .bd{padding:11px 12px 12px;display:flex;flex-direction:column;flex:1;}',
    '.wfd-card .who{display:flex;align-items:center;gap:7px;margin-bottom:8px;}',
    '.wfd-card .av{flex:0 0 24px;width:24px;height:24px;border-radius:50%;background:#C8A04D center/cover;color:#fff;',
      'font-size:11px;display:flex;align-items:center;justify-content:center;font-weight:700;}',
    '.wfd-card .un{font-size:11.5px;font-weight:700;line-height:1.2;}',
    ".wfd-card .tm{font-size:10px;color:#a09a90;font-family:'Noto Serif JP',serif;}",
    '.wfd-card .nm{font-size:14.5px;font-weight:700;line-height:1.3;}',
    ".wfd-card .lo{font-size:11px;color:#8a8378;margin-top:3px;font-family:'Noto Serif JP',serif;}",
    ".wfd-card .tx{font-size:11.5px;line-height:1.65;color:#4a4a4a;margin-top:7px;font-family:'Noto Serif JP',serif;",
      'display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}',
    '.wfd-card .ft{display:flex;align-items:center;gap:14px;margin-top:auto;padding-top:10px;font-size:11.5px;color:#8a8378;}',
    '.wfd-card .ft .sp{margin-left:auto;}',
    '.wfd-empty{text-align:center;padding:60px 20px;color:#8a8378;font-size:13.5px;line-height:1.9;',
      "font-family:'Noto Serif JP',serif;}"
  ].join('');
  document.head.appendChild(css);

  // ── ① マイページの「最近の投稿」「投稿した御朱印」を消す ──
  function hideSections(){
    document.querySelectorAll('#wcMypage .mp-sec').forEach(function(sec){
      var h = sec.querySelector('.mp-h');
      if (!h) return;
      var t = h.textContent.trim();
      if (t === '最近の投稿' || t === '投稿した御朱印') sec.style.display = 'none';
    });
  }

  // ── ② 下部メニューを常に最前面・確実に反応させる ────────────
  function hardenNav(){
    var nav = document.getElementById('wabiNav');
    if (!nav) return;
    if (nav.parentElement !== document.body || nav.nextElementSibling){
      document.body.appendChild(nav);           // 常に最後＝最前面へ
    }
    nav.querySelectorAll('.wn').forEach(function(el){
      if (el.getAttribute('data-hard')) return;
      el.setAttribute('data-hard', '1');
      el.setAttribute('role', 'button');
      // iOS で反応しないことがあるので touchend でも拾う
      el.addEventListener('touchend', function(ev){
        ev.preventDefault();
        ev.stopPropagation();
        if (typeof el.onclick === 'function') el.onclick(ev);
      }, { passive: false });
    });
  }
  WABI_TICK(function(){ hardenNav(); hideSections(); }, 900);
  hardenNav();

  // ── ③ みんなの最新投稿 ────────────────────────────────────
  var pg = document.createElement('div');
  pg.className = 'wfd'; pg.id = 'wabiFeedPg';
  pg.innerHTML = '<div class="wfd-hd"><span class="b">‹</span><span class="t">みんなの最新投稿</span><span class="r">🌿</span></div>'
               + '<div class="wfd-in"></div>';
  document.body.appendChild(pg);
  pg.querySelector('.b').onclick = function(){ pg.style.display = 'none'; };

  var CATS = ['すべて', '神社', 'お寺', '御朱印'];
  var state = { cat: 'すべて', sort: 'new' };

  function catOf(p){
    if (p.cat) return p.cat;
    var n = String(p.shrine || '');
    if (/御朱印/.test(String(p.text || ''))) return '御朱印';
    return /寺$|院$|庵$|坊$|大師$/.test(n) ? 'お寺' : '神社';
  }
  function allPosts(){
    var out = [];
    // 自分の投稿
    try {
      var mine = JSON.parse(localStorage.getItem('wabiMyPosts') || '[]');
      var nm = localStorage.getItem('wabiName') || '';
      var u = null; try { u = window.WabiLine && WabiLine.user && WabiLine.user(); } catch(e){}
      if (Array.isArray(mine)) mine.forEach(function(p){
        out.push({ user: nm || (u && u.name) || 'あなた', pic: (function(){ try { return localStorage.getItem('wabiAvatar') || (u && u.pic) || ''; } catch(e){ return ''; } })(),
                   date: p.date || '', shrine: p.shrine || '', addr: '', img: (p.photos && p.photos[0]) || '',
                   photos: p.photos || [], text: p.text || '', likes: 0, comments: [], ts: p.ts || 0, mine: true });
      });
    } catch(e){}
    // みんなの投稿
    try {
      if (typeof USER_POSTS !== 'undefined' && Array.isArray(USER_POSTS)){
        USER_POSTS.forEach(function(p){
          out.push({ user: p.user, avatar: p.avatar, date: p.date, shrine: p.shrine, addr: p.addr,
                     img: p.img, photos: p.photos || (p.img ? [p.img] : []), text: p.text,
                     likes: p.likes || 0, comments: p.comments || [], _raw: p });
        });
      }
    } catch(e){}
    return out;
  }

  function card(p, i){
    var n = (p.photos && p.photos.length) || (p.img ? 1 : 0);
    var av = p.pic
      ? '<div class="av" style="background-image:url(\'' + esc(p.pic) + '\')"></div>'
      : '<div class="av">' + esc((p.avatar || (p.user || '？')).slice(0, 1)) + '</div>';
    return '<div class="wfd-card" data-i="' + i + '">'
      + '<div class="im"' + (p.img ? ' style="background-image:url(\'' + esc(p.img) + '\')"' : '') + '>'
      +   '<span class="cat">' + esc(catOf(p)) + '</span>'
      +   (n > 1 ? '<span class="cnt">1/' + n + '</span>' : '')
      + '</div>'
      + '<div class="bd"><div class="who">' + av
      +   '<div style="min-width:0"><div class="un">' + esc(p.user || '巡礼者') + '</div>'
      +   '<div class="tm">' + esc(p.date || '') + '</div></div></div>'
      +   '<div class="nm">' + esc(p.shrine || '') + '</div>'
      +   (p.addr ? '<div class="lo">' + esc(p.addr) + '</div>' : '')
      +   (p.text ? '<div class="tx">' + esc(p.text) + '</div>' : '')
      +   '<div class="ft"><span>♡ ' + (p.likes || 0) + '</span>'
      +     '<span>💬 ' + ((p.comments && p.comments.length) || 0) + '</span>'
      +     '<span class="sp">🔖</span></div>'
      + '</div></div>';
  }

  function render(){
    var list = allPosts();
    if (state.cat !== 'すべて') list = list.filter(function(p){ return catOf(p) === state.cat; });
    if (state.sort === 'like') list.sort(function(a, b){ return (b.likes || 0) - (a.likes || 0); });

    var h = '<div class="wfd-sub">参拝の記録をシェアしよう</div>'
      + '<div class="wfd-chips">' + CATS.map(function(c){
          return '<span class="wfd-chip' + (c === state.cat ? ' on' : '') + '" data-c="' + esc(c) + '">' + esc(c) + '</span>';
        }).join('') + '</div>'
      + '<div class="wfd-bar"><span id="wfdSort">' + (state.sort === 'new' ? '新しい順' : '人気順') + ' ∨</span>'
      +   '<span id="wfdFilter">絞り込み ⚙</span></div>'
      + (list.length ? '<div class="wfd-g">' + list.map(card).join('') + '</div>'
         : '<div class="wfd-empty">まだ投稿がありません。<br>「参拝を投稿する」から最初の記録を<br>残してみてください。</div>');

    pg.querySelector('.wfd-in').innerHTML = h;

    pg.querySelectorAll('.wfd-chip').forEach(function(c){
      c.onclick = function(){ state.cat = c.getAttribute('data-c'); render(); };
    });
    var so = document.getElementById('wfdSort');
    if (so) so.onclick = function(){ state.sort = (state.sort === 'new') ? 'like' : 'new'; render(); };
    var fi = document.getElementById('wfdFilter');
    if (fi) fi.onclick = function(){ if (typeof showToast === 'function') showToast('絞り込みは準備中です'); };

    pg.querySelectorAll('.wfd-card').forEach(function(el){
      el.onclick = function(){
        var p = list[+el.getAttribute('data-i')];
        if (!p) return;
        if (p._raw && typeof openPostDetail === 'function'){ pg.style.display = 'none'; openPostDetail(p._raw.id || p._raw); return; }
        if (typeof showToast === 'function') showToast('投稿の詳細は準備中です');
      };
    });
  }

  window.wabiOpenFeed = function(){ render(); pg.style.display = 'block'; pg.scrollTop = 0; };

  // 下部メニュー「みんなの投稿」と、トップの「もっと見る」をこのページにつなぐ
  function hook(){
    var el = document.querySelector('#wabiNav [data-k="posts"]');
    if (el && !el.getAttribute('data-feed')){
      el.setAttribute('data-feed', '1');
      el.onclick = function(){
        ['pgShrineDetail','pgMap','pgRegister','pgAiRoute','pgAiResult','pgAreaSearch','pgPostDetail',
         'wabiRoutePg','wabiRankMore','wxGuide','wxInvite','wxSignup','wcMypage','wabiListPg'].forEach(function(id){
          var e = document.getElementById(id); if (e) e.style.display = 'none';
        });
        var mp = document.getElementById('wcMypage'); if (mp) mp.classList.remove('show');
        window.wabiOpenFeed();
        document.querySelectorAll('#wabiNav .wn').forEach(function(x){ x.classList.toggle('on', x.getAttribute('data-k') === 'posts'); });
      };
    }
    if (typeof window.openCommunityAll === 'function' && !window.openCommunityAll.__wfd){
      var f = function(){ window.wabiOpenFeed(); };
      f.__wfd = true;
      window.openCommunityAll = f;
    }
  }
  hook();
  WABI_TICK(hook, 700);
})();


/* ══════════════════════════════════════════════════════════════
   わびなび：投稿写真の差し替え ／ 画面のちらつき解消 ／
             「11位〜30位」ボタンを極小に ／ 記事を25本に増やす
   （2026-07-27 / index.html は触らず concierge.js から上書き）
   ══════════════════════════════════════════════════════════════ */
(function(){
  if (window.__wabiPolish) return;
  window.__wabiPolish = true;

  var css = document.createElement('style');
  css.textContent = [
    // 「11位〜30位を見る」を極小に
    '.wabi-more-rank{display:block !important;width:max-content !important;height:auto !important;',
      'min-height:0 !important;padding:6px 12px !important;font-size:10.5px !important;line-height:1.4 !important;',
      'border-radius:10px !important;margin:10px auto 0 !important;text-align:center !important;',
      'grid-column:auto !important;align-self:center !important;justify-self:center !important;}',
    // 画面の切り替えでちらつかないように
    '#wcMypage,#pgMap,#wabiFeedPg,#wabiListPg{will-change:opacity;}',
    '#wcMypage{transition:none !important;}',
    // 下部メニュー（約60px）に隠れないよう、スクロールする画面の下に余白
    '#wcMypage .mp-in{padding-bottom:96px !important;}',
    '#wabiListPg .wlp-in,#wabiFeedPg .wfd-in{padding-bottom:110px !important;}',
    '#wabiRoutePg .wrp-in,#wxGuide .wx-in,#wxInvite .wx-in,#wxSignup .wl-in{padding-bottom:110px !important;}',
    '#wabiRankMore .wrm-in{padding-bottom:110px !important;}',
    '#pgShrineDetail{padding-bottom:80px;}',
    '.app{padding-bottom:76px;}'
  ].join('');
  document.head.appendChild(css);

  // ── ① ちらつき解消：先に開いてから他を閉じる ────────────────
  function closeOthers(keep){
    ['pgShrineDetail','pgMap','pgRegister','pgAiRoute','pgAiResult','pgAreaSearch','pgPostDetail',
     'pgTourList','pgSeasonList','pgEcList','pgOsupplyList','pgShukatsuList','pgArticleList',
     'wabiRoutePg','wabiRankMore','wxGuide','wxInvite','wxSignup','wcMypage','wcPost',
     'wabiListPg','wabiFeedPg'].forEach(function(id){
      if (id === keep) return;
      var el = document.getElementById(id);
      if (el && el.style.display !== 'none') el.style.display = 'none';
    });
    if (keep !== 'wcMypage'){
      var mp = document.getElementById('wcMypage');
      if (mp) mp.classList.remove('show');
    }
  }

  function rebindNav(){
    var nav = document.getElementById('wabiNav');
    if (!nav || nav.getAttribute('data-polish')) return;
    nav.setAttribute('data-polish', '1');

    function mark(k){
      nav.querySelectorAll('.wn').forEach(function(el){
        el.classList.toggle('on', el.getAttribute('data-k') === k);
      });
    }
    nav.querySelectorAll('.wn').forEach(function(el){
      var k = el.getAttribute('data-k');
      el.onclick = function(){
        mark(k);
        if (k === 'home'){
          closeOthers('');
          if (typeof go === 'function') go('pgHome');
          // 画面内でスクロールしている要素もすべて先頭に戻す
          try {
            window.scrollTo(0, 0);
            document.documentElement.scrollTop = 0;
            document.body.scrollTop = 0;
            var app = document.querySelector('.app');
            if (app) app.scrollTop = 0;
            var home = document.getElementById('pgHome');
            if (home) home.scrollTop = 0;
          } catch(e){}
        } else if (k === 'map'){
          // 先に地図を開いてから、あとで他を閉じる（間に白い画面を挟まない）
          if (typeof searchNearby === 'function') searchNearby();
          setTimeout(function(){ closeOthers('pgMap'); }, 30);
          setTimeout(function(){
            var m = document.getElementById('pgMap');
            if (m && m.style.display !== 'flex' && typeof showMapArea === 'function') showMapArea();
            closeOthers('pgMap');
          }, 2200);
        } else if (k === 'posts'){
          if (typeof wabiOpenFeed === 'function') wabiOpenFeed();
          setTimeout(function(){ closeOthers('wabiFeedPg'); }, 20);
        } else if (k === 'my'){
          if (typeof openWabiMypage === 'function') openWabiMypage();
          setTimeout(function(){ closeOthers('wcMypage'); }, 20);
        }
      };
    });
  }
  rebindNav();
  var n0 = 0;
  var iv0 = setInterval(function(){ rebindNav(); if (++n0 > 40) clearInterval(iv0); }, 300);

  // ── ② サンプル投稿の写真を、その神社の実写に差し替える ────────
  function fixPostPhotos(){
    if (typeof USER_POSTS === 'undefined' || !Array.isArray(USER_POSTS)) return;
    if (window.__wabiPostPhotoDone) return;
    window.__wabiPostPhotoDone = true;
    var names = USER_POSTS.map(function(p){ return p.shrine; }).filter(Boolean);
    if (!names.length || typeof wikiPhotosFor !== 'function') return;
    wikiPhotosFor(names, function(map){
      var changed = false;
      USER_POSTS.forEach(function(p){
        if (p.shrine && map[p.shrine]) { p.img = map[p.shrine]; changed = true; }
      });
      if (changed){
        try { if (typeof redesignCommunity === 'function') redesignCommunity(); } catch(e){}
        try {
          var f = document.getElementById('wabiFeedPg');
          if (f && f.style.display === 'block' && typeof wabiOpenFeed === 'function') wabiOpenFeed();
        } catch(e){}
      }
    });
  }
  setTimeout(fixPostPhotos, 2500);
  setTimeout(fixPostPhotos, 6000);

  // ── ③ 下書きのままだった記事25本をサイトに載せる ────────────
  var ART_FILE = {
    't16': 'articles/寺院/寺院記事16_20260906_taiken.html',
    't17': 'articles/寺院/寺院記事17_20260906_teien.html',
    'a14': 'articles/神社/記事14_20260805_武蔵国の古社.html',
    'a15': 'articles/神社/記事15_20260805_北陸の古社.html',
    'a16': 'articles/神社/記事16_20260805_瀬戸内の海の社.html',
    't13': 'articles/寺院/寺院記事13_20260805_kyoto_momiji.html',
    't14': 'articles/寺院/寺院記事14_20260805_kitakamakura.html',
    't15': 'articles/寺院/寺院記事15_20260805_hana_no_mitera.html',
    't12': 'articles/寺院/寺院記事12_20260617_shitamachi.html',
    't11': 'articles/寺院/寺院記事11_20260617_botan.html',
    't10': 'articles/寺院/寺院記事10_20260617_kinun.html',
    'a13': 'articles/神社/記事13_20260608_京都東山.html',
    'a12': 'articles/神社/記事12_20260608_京都嵐山.html',
    'a11': 'articles/神社/記事11_20260608_京都洛中御朱印.html',
    't09': 'articles/寺院/寺院記事09_20260605_shukubo.html',
    't08': 'articles/寺院/寺院記事08_20260605_yamato.html',
    't07': 'articles/寺院/寺院記事07_20260605_shakyou.html',
    'a10': 'articles/神社/記事10_20260605_心身の浄化.html',
    'a09': 'articles/神社/記事09_20260605_厄除け方位除け.html',
    'a08': 'articles/神社/記事08_20260605_仕事運と出世.html',
    't06': 'articles/寺院/寺院記事06_20260604_厄除け大師.html',
    't05': 'articles/寺院/寺院記事05_20260604_切り絵御朱印.html',
    't04': 'articles/寺院/寺院記事04_20260604_座禅体験.html',
    'a07': 'articles/神社/記事07_20260604_縁結び神社.html',
    'a06': 'articles/神社/記事06_20260604_金運神社.html',
    'a05': 'articles/神社/記事05_20260604_切り絵御朱印.html',
    't03': 'articles/寺院/寺院記事03_20260603_夜間特別拝観.html',
    't02': 'articles/寺院/寺院記事02_20260603_あじさい寺.html',
    't01': 'articles/寺院/寺院記事01_20260603_枯山水.html',
    'a04': 'articles/神社/記事04_20260603_初詣縁起物.html',
    'a03': 'articles/神社/記事03_20260603_紅葉絶景京都.html',
    'a02': 'articles/神社/記事02_20260603_夏越の祓.html',
    'a01': 'articles/神社/記事01_20260602_桜と御朱印.html'
  };

  function loadArticles(){
    if (typeof ARTICLES === 'undefined' || !Array.isArray(ARTICLES)) return;
    if (window.__wabiArtLoaded) return;
    window.__wabiArtLoaded = true;
    fetch('articles-data.json?v=' + Date.now()).then(function(r){ return r.ok ? r.json() : null; }).then(function(j){
      if (!j || !j.articles) return;
      var have = {};
      ARTICLES.forEach(function(a){ have[a.title] = 1; });
      var added = 0;
      j.articles.forEach(function(a){
        if (!a || !a.title || have[a.title]) return;
        ARTICLES.push({
          id: a.id, title: a.title, date: a.date, cat: a.cat || a.type || '記事',
          img: a.img || '', excerpt: a.excerpt || '',
          body: '<p class="lead">' + (a.excerpt || '') + '</p><p style="color:#999">読み込んでいます…</p>',
          _file: ART_FILE[a.id] || ''
        });
        added++;
      });
      if (!added) return;
      // 新しい順に並べ替え
      ARTICLES.sort(function(x, y){ return String(y.date).localeCompare(String(x.date)); });
      try { if (typeof renderArticleList === 'function') renderArticleList('artList', 5); } catch(e){}
      try {
        var full = document.getElementById('artListFull');
        if (full && typeof renderArticleList === 'function') renderArticleList('artListFull', null);
      } catch(e){}
    }).catch(function(){});
  }
  loadArticles();
  var n1 = 0;
  var iv1 = setInterval(function(){ loadArticles(); if (++n1 > 20) clearInterval(iv1); }, 500);

  // 記事を開いたら本文ファイルを読み込む
  function hookOpenArticle(){
    if (typeof window.openArticle !== 'function' || window.openArticle.__wp) return;
    var orig = window.openArticle;
    var f = function(id){
      var r = orig.apply(this, arguments);
      try {
        var a = ARTICLES.filter(function(x){ return x.id === id; })[0];
        if (a && a._file && !a._loaded){
          fetch(a._file + '?v=' + Date.now()).then(function(res){ return res.ok ? res.text() : ''; }).then(function(html){
            if (!html) return;
            // <body> の中身だけを取り出す
            var m = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
            var bodyHtml = m ? m[1] : html;
            bodyHtml = bodyHtml.replace(/<script[\s\S]*?<\/script>/gi, '');
            a.body = bodyHtml;
            a._loaded = true;
            var el = document.querySelector('#pgArticleDetail .article-body');
            if (el) el.innerHTML = bodyHtml;
          }).catch(function(){});
        }
      } catch(e){}
      return r;
    };
    f.__wp = true;
    window.openArticle = f;
  }
  hookOpenArticle();
  var n2 = 0;
  var iv2 = setInterval(function(){ hookOpenArticle(); if (++n2 > 40) clearInterval(iv2); }, 300);
})();



/* ══════════════════════════════════════════════════════════════
   わびなび：学問の神様（天満宮）を神社データベースに追加
   評価・クチコミ数・座標は Google Places で実測した実データ
   （2026-07-30 / index.html は触らず concierge.js から追記）
   ══════════════════════════════════════════════════════════════ */
(function(){
  if (window.__wabiTenman) return;
  window.__wabiTenman = true;

  var ADD = [
    { name:'湯島天満宮',   addr:'東京都文京区湯島3-30-1',        area:'関東',   rating:4.3, rev:11831, lat:35.7077, lng:139.7682, badges:['学問の神'] },
    { name:'亀戸天神社',   addr:'東京都江東区亀戸3-6-1',         area:'関東',   rating:4.2, rev:9740,  lat:35.7030, lng:139.8207, badges:['藤の名所'] },
    { name:'谷保天満宮',   addr:'東京都国立市谷保5209',          area:'関東',   rating:4.3, rev:2427,  lat:35.6801, lng:139.4437, badges:['関東三天神'] },
    { name:'荏柄天神社',   addr:'神奈川県鎌倉市二階堂74',        area:'関東',   rating:4.3, rev:1389,  lat:35.3259, lng:139.5643, badges:['日本三天神'] },
    { name:'大阪天満宮',   addr:'大阪府大阪市北区天神橋2-1-8',   area:'近畿',   rating:4.3, rev:10352, lat:34.6961, lng:135.5127, badges:['天神祭'] },
    { name:'道明寺天満宮', addr:'大阪府藤井寺市道明寺1-16-40',   area:'近畿',   rating:4.2, rev:1411,  lat:34.5692, lng:135.6177, badges:['梅の名所'] },
    { name:'長岡天満宮',   addr:'京都府長岡京市天神2-15-13',     area:'近畿',   rating:4.2, rev:2707,  lat:34.9229, lng:135.6867, badges:['きりしまツツジ'] },
    { name:'錦天満宮',     addr:'京都府京都市中京区中之町537',   area:'近畿',   rating:4.3, rev:4704,  lat:35.0050, lng:135.7673, badges:['錦市場'] },
    { name:'防府天満宮',   addr:'山口県防府市松崎町14-1',        area:'中国四国',rating:4.3, rev:4064,  lat:34.0632, lng:131.5741, badges:['日本三天神'] },
    { name:'上野天満宮',   addr:'愛知県名古屋市千種区赤坂町4-89',area:'中部',   rating:4.3, rev:1299,  lat:35.1808, lng:136.9571, badges:['名古屋二天神'] }
  ];

  function build(){
    if (typeof SHRINES === 'undefined' || !Array.isArray(SHRINES)) return false;
    if (window.__wabiTenmanDone) return true;
    var have = {};
    SHRINES.forEach(function(s){ have[s.name] = 1; });
    var maxRank = 0;
    SHRINES.forEach(function(s){ if (s.rank > maxRank) maxRank = s.rank; });

    var added = 0;
    ADD.forEach(function(a){
      if (have[a.name]) return;
      SHRINES.push({
        rank: ++maxRank,
        name: a.name,
        deity: '菅原道真公',
        addr: a.addr,
        map: 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(a.name),
        area: a.area,
        rating: a.rating,
        rev: a.rev,
        visited: false,
        type: 'shrine',
        badges: a.badges,
        tags: ['goshuin', 'gakumon', 'kaiun', 'rekishi'],
        lat: a.lat,
        lng: a.lng
      });
      added++;
    });
    window.__wabiTenmanDone = true;
    if (added){
      // 評価順の通し番号を振り直す
      try {
        SHRINES.slice().sort(function(x, y){ return (y.rating || 0) - (x.rating || 0); });
        if (typeof filter === 'function') filter();
      } catch(e){}
    }
    return true;
  }
  build();
  var n = 0;
  var iv = setInterval(function(){ if (build() || ++n > 40) clearInterval(iv); }, 300);
})();


/* ── マイページの細かい調整 ─────────────────────────────────── */
(function(){
  if (window.__wabiMpTweak) return;
  window.__wabiMpTweak = true;

  var css = document.createElement('style');
  css.textContent = [
    // 「友達に紹介」をLINEの緑に
    '#wxInviteLink{background:#06C755 !important;border-color:#06C755 !important;color:#fff !important;',
      'box-shadow:0 6px 16px rgba(6,199,85,.26);}',
    '#wxInviteLink:active{opacity:.9;}'
  ].join('');
  document.head.appendChild(css);

  function tweak(){
    // 文言を「友達に紹介」に
    var a = document.getElementById('wxInviteLink');
    if (a && a.textContent.indexOf('友達を紹介') >= 0) a.textContent = '友達に紹介 ›';
    // 紹介ページのタイトルも合わせる
    var t = document.querySelector('#wxInvite .wx-hd .t');
    if (t && t.textContent === '友達を紹介') t.textContent = '友達に紹介';
    // バッジコレクションの「すべて見る」を消す
    document.querySelectorAll('#wcMypage .mp-sec').forEach(function(sec){
      var h = sec.querySelector('.mp-h');
      if (h && h.textContent.trim() === 'バッジコレクション'){
        var more = sec.querySelector('.mp-more');
        if (more) more.style.display = 'none';
      }
    });
  }
  WABI_TICK(tweak, 700);
  tweak();
})();


/* ══════════════════════════════════════════════════════════════
   わびなび：検索タグを1つだけ選べるように ／ お気に入りの写真表示
             ／ スクロールをなめらかに
   （2026-07-30 / index.html は触らず concierge.js から上書き）
   ══════════════════════════════════════════════════════════════ */
(function(){
  if (window.__wabiFix4) return;
  window.__wabiFix4 = true;

  var css = document.createElement('style');
  css.textContent = [
    // スマホでのスクロールをなめらかに
    '#wcMypage,#wabiListPg,#wabiFeedPg,#wabiRoutePg,#wxGuide,#wxInvite,#wxSignup,#wabiRankMore{',
      '-webkit-overflow-scrolling:touch;overscroll-behavior:contain;}',
    // 半透明ぼかしはスクロールを重くするため、単色に
    '#wabiNav{backdrop-filter:none !important;background:#fff !important;}',
    '.wlp-hd,.wfd-hd,#wcMypage .mp-hd{backdrop-filter:none !important;}',
    '#wcMypage .mp-hd{background:#F8F6F2 !important;}',
    '.wlp-hd{background:#FAF8F4 !important;}',
    '.wfd-hd{background:#FAF8F4 !important;}',
    // 画像の描画を軽くする
    '#wcMypage .mp-stat,#wabiListPg .wlp-card .ph,#wabiListPg .wlp-g2 .im{transform:translateZ(0);}'
  ].join('');
  document.head.appendChild(css);

  // ── ① 赤いタグは常に1つだけ選べるようにする ────────────────
  function singleSelect(){
    var row = document.querySelector('.tagrow');
    if (!row || row.getAttribute('data-single')) return;
    row.setAttribute('data-single', '1');

    row.addEventListener('click', function(ev){
      var el = ev.target.closest ? ev.target.closest('.tag') : null;
      if (!el) return;
      // 押したもの以外の選択を必ず外す
      setTimeout(function(){
        row.querySelectorAll('.tag').forEach(function(t){ t.classList.toggle('on', t === el); });
        var isType = el.hasAttribute('data-wtype');
        try {
          if (isType){
            // 神社／お寺を選んだら、ご利益の絞り込みは解除
            if (typeof currentTag !== 'undefined') currentTag = 'all';
          } else {
            // ご利益を選んだら、神社／お寺の絞り込みは解除
            if (typeof currentType !== 'undefined') currentType = '';
          }
          if (typeof filter === 'function') filter();
        } catch(e){}
      }, 0);
    }, true);
  }
  singleSelect();
  var n = 0;
  var iv = setInterval(function(){ singleSelect(); if (++n > 30) clearInterval(iv); }, 400);

  // ── ② 一覧ページの写真を読み込む（お気に入り・参拝した神社）──
  function fillListPhotos(){
    var pg = document.getElementById('wabiListPg');
    if (!pg || pg.style.display !== 'block') return;
    var need = [];
    pg.querySelectorAll('.wlp-card,.wlp-g2 .it').forEach(function(c){
      var t = c.querySelector('.nm');
      var ph = c.querySelector('.ph, .im');
      if (!t || !ph) return;
      if (ph.style.backgroundImage) return;
      if (ph.getAttribute('data-try')) return;
      ph.setAttribute('data-try', '1');
      need.push({ name: t.textContent.trim(), el: ph });
    });
    if (!need.length) return;

    // まずは既に取得済みのキャッシュから
    need.forEach(function(x){
      try {
        if (window.photoCache && photoCache[x.name] && photoCache[x.name][0]){
          x.el.style.backgroundImage = 'url("' + photoCache[x.name][0] + '")';
          x.done = true;
        }
      } catch(e){}
    });
    var rest = need.filter(function(x){ return !x.done; });
    if (!rest.length) return;

    // Google Places で神社の写真を取ってくる
    try {
      if (window.google && google.maps && google.maps.places){
        var svc = new google.maps.places.PlacesService(document.createElement('div'));
        rest.forEach(function(x, i){
          setTimeout(function(){
            svc.findPlaceFromQuery({ query: x.name + ' 神社', fields: ['photos'] }, function(r, st){
              if (st === google.maps.places.PlacesServiceStatus.OK && r && r[0] && r[0].photos && r[0].photos.length){
                var u = r[0].photos[0].getUrl({ maxWidth: 600 });
                x.el.style.backgroundImage = 'url("' + u + '")';
                try { window.photoCache = window.photoCache || {}; photoCache[x.name] = [u]; } catch(e){}
              } else {
                x.el.removeAttribute('data-try');   // 次の機会に再挑戦
              }
            });
          }, i * 220);
        });
        return;
      }
    } catch(e){}

    // Places が使えないときは Wikipedia から
    try {
      if (typeof wikiPhotosFor === 'function'){
        wikiPhotosFor(rest.map(function(x){ return x.name; }), function(map){
          rest.forEach(function(x){
            if (map[x.name]) x.el.style.backgroundImage = 'url("' + map[x.name] + '")';
            else x.el.removeAttribute('data-try');
          });
        });
      }
    } catch(e){}
  }
  window.wabiFillListPhotos = fillListPhotos;
  WABI_TICK(fillListPhotos, 1200);

  // 一覧が描き直された瞬間にも写真を読み込む（タイマー待ちにしない）
  (function(){
    var pg = document.getElementById('wabiListPg');
    if (!pg || !window.MutationObserver) return;
    var t = null;
    new MutationObserver(function(){
      clearTimeout(t);
      t = setTimeout(function(){ try { fillListPhotos(); } catch(e){} }, 120);
    }).observe(pg, { childList: true, subtree: true });
  })();
})();


/* ══════════════════════════════════════════════════════════════
   わびなび：マイページのヒーローを16:9 ／ 記録シートの横揺れ防止 ／
             投稿詳細ページのリデザイン ／ 下部メニューの取りこぼし修正
   （2026-07-30 / index.html は触らず concierge.js から上書き）
   ══════════════════════════════════════════════════════════════ */
(function(){
  if (window.__wabiFix5) return;
  window.__wabiFix5 = true;

  function esc(s){
    return String(s == null ? '' : s)
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  /* ── ① マイページのヒーロー画像を 16:9 に ───────────────── */
  /* ── ② 参拝を記録するシートは縦スクロールだけにする ───────── */
  var css = document.createElement('style');
  css.id = 'wabiFix5Css';
  css.textContent = [
    /* ① ヒーロー 16:9（430px幅なら約242px）*/
    '#wcMypage .mp-hero{height:auto !important;aspect-ratio:16/9 !important;min-height:0 !important;}',

    /* ② 記録シート：横方向の移動を完全に止める */
    '.wrc{overflow-x:hidden !important;overscroll-behavior-x:none !important;touch-action:pan-y !important;',
      'width:100% !important;box-sizing:border-box !important;}',
    '.wrc-in{max-width:100% !important;box-sizing:border-box !important;overflow-x:hidden !important;',
      'padding-bottom:calc(104px + env(safe-area-inset-bottom)) !important;}',
    '.wrc-in *{max-width:100%;box-sizing:border-box;}',
    '.wrc-chips{flex-wrap:wrap !important;overflow-x:visible !important;}',
    '.wrc-photos{overflow-x:hidden !important;}',
    '.wrc-mask{touch-action:none;}',

    /* ③ 投稿詳細ページ */
    ".wpd{display:none;position:fixed;inset:0;z-index:700;background:#FAF8F4;overflow-y:auto;overflow-x:hidden;",
      "-webkit-overflow-scrolling:touch;overscroll-behavior-x:none;touch-action:pan-y;",
      "font-family:'Shippori Mincho','Noto Serif JP',serif;color:#2D2D2D;}",
    '.wpd-hero{position:relative;width:100%;max-width:500px;margin:0 auto;aspect-ratio:16/10;background:#e9e3d8;overflow:hidden;}',
    '.wpd-track{display:flex;height:100%;overflow-x:auto;scroll-snap-type:x mandatory;scrollbar-width:none;}',
    '.wpd-track::-webkit-scrollbar{display:none;}',
    '.wpd-sl{flex:0 0 100%;height:100%;scroll-snap-align:start;background:#e9e3d8 center/cover no-repeat;}',
    '.wpd-rd{position:absolute;top:12px;width:38px;height:38px;border-radius:50%;background:rgba(255,255,255,.92);',
      'box-shadow:0 2px 10px rgba(0,0,0,.14);display:flex;align-items:center;justify-content:center;',
      'font-size:20px;line-height:1;cursor:pointer;color:#2D2D2D;}',
    '.wpd-back{left:12px;}',
    '.wpd-menu{right:12px;font-size:17px;letter-spacing:1px;}',
    '.wpd-cnt{position:absolute;right:12px;bottom:12px;background:rgba(0,0,0,.55);color:#fff;',
      "font-size:12px;padding:5px 12px;border-radius:999px;font-family:'Noto Serif JP',serif;}",
    '.wpd-dots{display:flex;justify-content:center;gap:7px;padding:13px 0 2px;}',
    '.wpd-dot{width:7px;height:7px;border-radius:50%;background:#dcd6ca;transition:background .2s;}',
    '.wpd-dot.on{background:#5D3A7A;}',
    '.wpd-in{max-width:500px;margin:0 auto;padding:4px 16px 120px;}',

    '.wpd-user{display:flex;align-items:center;gap:11px;margin:10px 0 16px;}',
    '.wpd-av{flex:0 0 46px;width:46px;height:46px;border-radius:50%;background:#5D3A7A center/cover no-repeat;',
      'color:#fff;display:flex;align-items:center;justify-content:center;font-size:17px;font-weight:700;}',
    '.wpd-un{font-size:15.5px;font-weight:700;line-height:1.3;}',
    ".wpd-ud{font-size:11.5px;color:#8a8378;margin-top:2px;font-family:'Noto Serif JP',serif;}",
    '.wpd-fol{margin-left:auto;flex:0 0 auto;padding:9px 17px;border:1.4px solid #5D3A7A;border-radius:999px;',
      "background:#fff;color:#5D3A7A;font-size:12.5px;font-weight:700;font-family:inherit;cursor:pointer;}",
    '.wpd-fol.on{background:#5D3A7A;color:#fff;}',

    '.wpd-card{background:#fff;border-radius:20px;box-shadow:0 8px 24px rgba(0,0,0,.06);padding:14px;margin-bottom:14px;}',
    '.wpd-sh{display:flex;align-items:center;gap:13px;cursor:pointer;}',
    '.wpd-ic{flex:0 0 46px;width:46px;height:46px;border-radius:50%;background:#F3EFFA;',
      'display:flex;align-items:center;justify-content:center;}',
    '.wpd-shn{font-size:17px;font-weight:700;line-height:1.3;}',
    ".wpd-sha{font-size:11.5px;color:#8a8378;margin-top:3px;font-family:'Noto Serif JP',serif;line-height:1.5;}",
    '.wpd-cv{margin-left:auto;flex:0 0 auto;color:#b9b2a6;font-size:20px;}',

    '.wpd-h{font-size:12px;font-weight:700;color:#8a8378;letter-spacing:.08em;margin:0 0 10px;}',
    '.wpd-rows{display:flex;flex-direction:column;gap:0;}',
    '.wpd-row{display:flex;align-items:center;padding:11px 0;border-top:1px solid #F0EBE1;}',
    '.wpd-row:first-child{border-top:none;padding-top:2px;}',
    ".wpd-row .k{font-size:12.5px;color:#8a8378;font-family:'Noto Serif JP',serif;}",
    '.wpd-row .v{margin-left:auto;font-size:14px;font-weight:700;}',
    '.wpd-st{margin-left:auto;font-size:16px;color:#ddd6c6;letter-spacing:2px;}',
    '.wpd-st i{font-style:normal;}',
    '.wpd-st i.on{color:#C8A04D;}',

    ".wpd-tx{font-size:14px;line-height:2.05;white-space:pre-wrap;font-family:'Noto Serif JP',serif;color:#3a3a3a;",
      'background:#fff;border-radius:20px;box-shadow:0 8px 24px rgba(0,0,0,.06);padding:16px;margin-bottom:14px;}',

    '.wpd-act{display:flex;background:#fff;border-radius:20px;box-shadow:0 8px 24px rgba(0,0,0,.06);overflow:hidden;}',
    '.wpd-act > div{flex:1;display:flex;align-items:center;justify-content:center;gap:8px;padding:16px 0;',
      'font-size:13.5px;cursor:pointer;color:#4a4a4a;}',
    '.wpd-act > div + div{border-left:1px solid #F0EBE1;}',
    '.wpd-act .hb{font-size:18px;color:#c9736a;}',
    '.wpd-act .liked .hb{color:#d5453b;}'
  ].join('');
  document.head.appendChild(css);

  /* ── ③ 投稿詳細ページ ─────────────────────────────────── */

  // 参拝データ（記録ページと同じ項目）。サンプル投稿ぶんを補完する
  var META = {
    p1: { rating:5, stay:'1時間' },
    p2: { rating:5, stay:'半日' },
    p3: { rating:4, stay:'2時間' },
    p4: { rating:5, stay:'2時間' },
    p5: { rating:4, stay:'1時間' },
    p6: { rating:4, stay:'1時間' },
    p7: { rating:5, stay:'2時間' },
    p8: { rating:4, stay:'〜30分' }
  };

  // 「3日前」などから実際の参拝日を作る
  function dateFromRel(s){
    var d = new Date(), m;
    s = String(s || '');
    if ((m = s.match(/(\d+)\s*時間前/)))  d.setHours(d.getHours() - (+m[1]));
    else if ((m = s.match(/(\d+)\s*日前/)))    d.setDate(d.getDate() - (+m[1]));
    else if ((m = s.match(/(\d+)?\s*週間前/))) d.setDate(d.getDate() - 7 * (+(m[1] || 1)));
    else if ((m = s.match(/(\d+)?\s*[かヶ]?月前/))) d.setMonth(d.getMonth() - (+(m[1] || 1)));
    else if ((m = s.match(/(\d{4})[.\-\/](\d{1,2})[.\-\/](\d{1,2})/))) return m[1] + '.' + ('0'+m[2]).slice(-2) + '.' + ('0'+m[3]).slice(-2);
    return d.getFullYear() + '.' + ('0'+(d.getMonth()+1)).slice(-2) + '.' + ('0'+d.getDate()).slice(-2);
  }

  var TORII = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none">'
    + '<path d="M3 6h18M4.5 9h15M6.5 6v13M17.5 6v13" stroke="#5D3A7A" stroke-width="1.7" stroke-linecap="round"/></svg>';

  // 神社ごとの写真を最大5枚集める（Google Places → Wikipedia）
  var photoCache5 = {};
  function photosFor(name, first, cb){
    if (!name) { cb(first ? [first] : []); return; }
    if (photoCache5[name]) { cb(photoCache5[name]); return; }
    var done = false;
    function finish(arr){
      if (done) return; done = true;
      arr = (arr || []).filter(Boolean);
      // 実写が取れたときはそれを優先（サンプル画像を先頭に出さない）
      if (!arr.length && first) arr = [first];
      arr = arr.slice(0, 5);
      photoCache5[name] = arr;
      cb(arr);
    }
    setTimeout(function(){ finish(first ? [first] : []); }, 4000);
    try {
      if (window.google && google.maps && google.maps.places && window.mapInstance !== undefined){
        var host = document.createElement('div');
        var svc = new google.maps.places.PlacesService(host);
        svc.findPlaceFromQuery({ query: name, fields: ['photos'] }, function(res, st){
          if (st === google.maps.places.PlacesServiceStatus.OK && res && res[0] && res[0].photos && res[0].photos.length){
            finish(res[0].photos.slice(0, 5).map(function(p){
              try { return p.getUrl({ maxWidth: 900, maxHeight: 700 }); } catch(e){ return null; }
            }));
            return;
          }
          if (typeof wikiPhotosFor === 'function'){
            wikiPhotosFor([name], function(map){ finish(map[name] ? [map[name]] : []); });
          } else finish([]);
        });
        return;
      }
    } catch(e){}
    if (typeof wikiPhotosFor === 'function') wikiPhotosFor([name], function(map){ finish(map[name] ? [map[name]] : []); });
    else finish([]);
  }

  var pg = document.createElement('div');
  pg.className = 'wpd'; pg.id = 'wabiPostPg';
  document.body.appendChild(pg);

  function closePg(){ pg.style.display = 'none'; }
  window.wabiClosePostPg = closePg;

  function findPost(idOrObj){
    if (idOrObj && typeof idOrObj === 'object') return idOrObj;
    try {
      if (typeof USER_POSTS !== 'undefined' && Array.isArray(USER_POSTS)){
        var hit = USER_POSTS.filter(function(p){ return p.id === idOrObj; })[0];
        if (hit) return hit;
      }
    } catch(e){}
    return null;
  }

  function paint(p, photos){
    var meta   = META[p.id] || {};
    var rating = p.rating || meta.rating || 0;
    var stay   = p.stay   || meta.stay   || '';
    var vdate  = p.visited || dateFromRel(p.date);
    var likes  = p.likes || 0;
    var av = p.pic
      ? '<div class="wpd-av" style="background-image:url(\'' + esc(p.pic) + '\')"></div>'
      : '<div class="wpd-av">' + esc((p.avatar || String(p.user || '？')).slice(0, 1)) + '</div>';

    var slides = (photos.length ? photos : ['']).map(function(u){
      return '<div class="wpd-sl"' + (u ? ' style="background-image:url(\'' + esc(u) + '\')"' : '') + '></div>';
    }).join('');
    var n = photos.length || 1;

    pg.innerHTML =
      '<div class="wpd-hero">'
      +   '<div class="wpd-track" id="wpdTrack">' + slides + '</div>'
      +   '<div class="wpd-rd wpd-back" id="wpdBack">‹</div>'
      +   '<div class="wpd-rd wpd-menu" id="wpdMenu">•••</div>'
      +   (n > 1 ? '<div class="wpd-cnt" id="wpdCnt">1/' + n + '</div>' : '')
      + '</div>'
      + (n > 1 ? '<div class="wpd-dots" id="wpdDots">'
          + photos.map(function(_, i){ return '<div class="wpd-dot' + (i ? '' : ' on') + '"></div>'; }).join('')
          + '</div>' : '')
      + '<div class="wpd-in">'
      +   '<div class="wpd-user">' + av
      +     '<div style="min-width:0"><div class="wpd-un">' + esc(p.user || '巡礼者') + '</div>'
      +     '<div class="wpd-ud">' + esc(p.date || '') + 'に投稿</div></div>'
      +     (p.mine ? '' : '<button class="wpd-fol" id="wpdFol">フォローする</button>')
      +   '</div>'

      +   '<div class="wpd-card"><div class="wpd-sh" id="wpdSh">'
      +     '<div class="wpd-ic">' + TORII + '</div>'
      +     '<div style="min-width:0"><div class="wpd-shn">' + esc(p.shrine || '') + '</div>'
      +     (p.addr ? '<div class="wpd-sha">' + esc(p.addr) + '</div>' : '') + '</div>'
      +     '<div class="wpd-cv">›</div>'
      +   '</div></div>'

      +   '<div class="wpd-card">'
      +     '<div class="wpd-h">参拝の記録</div>'
      +     '<div class="wpd-rows">'
      +       '<div class="wpd-row"><span class="k">参拝日</span><span class="v">' + esc(vdate) + '</span></div>'
      +       '<div class="wpd-row"><span class="k">満足度</span><span class="wpd-st">'
      +         [1,2,3,4,5].map(function(i){ return '<i class="' + (i <= rating ? 'on' : '') + '">★</i>'; }).join('')
      +       '</span></div>'
      +       (stay ? '<div class="wpd-row"><span class="k">滞在時間</span><span class="v">' + esc(stay) + '</span></div>' : '')
      +       '<div class="wpd-row"><span class="k">写真</span><span class="v">' + n + '枚</span></div>'
      +     '</div>'
      +   '</div>'

      +   (p.text ? '<div class="wpd-tx">' + esc(p.text) + '</div>' : '')

      +   '<div class="wpd-act">'
      +     '<div id="wpdLike"><span class="hb">♡</span><span id="wpdLikeN">' + likes + '</span></div>'
      +     '<div id="wpdShare"><span style="font-size:16px">⤴</span><span>シェア</span></div>'
      +   '</div>'
      + '</div>';

    document.getElementById('wpdBack').onclick = closePg;
    document.getElementById('wpdMenu').onclick = function(){
      if (typeof showToast === 'function') showToast('この投稿を報告・共有する機能は準備中です');
    };
    var fol = document.getElementById('wpdFol');
    if (fol) fol.onclick = function(){
      var on = fol.classList.toggle('on');
      fol.textContent = on ? 'フォロー中' : 'フォローする';
      if (typeof showToast === 'function') showToast(on ? esc(p.user) + ' さんをフォローしました' : 'フォローを解除しました');
    };
    document.getElementById('wpdSh').onclick = function(){
      var found = null;
      try {
        if (typeof SHRINES !== 'undefined') found = SHRINES.filter(function(s){
          return s.name === p.shrine || s.name.indexOf(p.shrine) >= 0 || String(p.shrine).indexOf(s.name) >= 0;
        })[0];
      } catch(e){}
      closePg();
      setTimeout(function(){
        if (found && typeof openShrineDetail === 'function') openShrineDetail(found);
        else if (typeof showToast === 'function') showToast('この神社の詳細ページは準備中です');
      }, 180);
    };
    var lk = document.getElementById('wpdLike');
    lk.onclick = function(){
      var on = lk.classList.toggle('liked');
      lk.querySelector('.hb').textContent = on ? '♥' : '♡';
      document.getElementById('wpdLikeN').textContent = likes + (on ? 1 : 0);
    };
    document.getElementById('wpdShare').onclick = function(){
      var t = (p.shrine || 'わびなび') + ' の参拝記録｜わびなび';
      try {
        if (navigator.share){ navigator.share({ title: t, text: p.text || '', url: location.href }); return; }
        navigator.clipboard.writeText(location.href);
        if (typeof showToast === 'function') showToast('リンクをコピーしました');
      } catch(e){ if (typeof showToast === 'function') showToast('シェアに失敗しました'); }
    };

    // 写真スワイプ：何枚目かを表示
    var tr = document.getElementById('wpdTrack');
    if (tr && n > 1){
      tr.addEventListener('scroll', function(){
        var i = Math.round(tr.scrollLeft / tr.clientWidth);
        var c = document.getElementById('wpdCnt');
        if (c) c.textContent = (i + 1) + '/' + n;
        var ds = document.querySelectorAll('#wpdDots .wpd-dot');
        for (var k = 0; k < ds.length; k++) ds[k].classList.toggle('on', k === i);
      }, { passive: true });
    }
  }

  window.openPostDetail = function(idOrObj){
    var p = findPost(idOrObj);
    if (!p) { if (typeof showToast === 'function') showToast('投稿を読み込めませんでした'); return; }
    // 他のページを閉じる
    ['pgShrineDetail','pgMap','pgRegister','pgAiRoute','pgAiResult','pgAreaSearch','pgPostDetail',
     'pgTourList','pgSeasonList','pgEcList','pgOsupplyList','pgShukatsuList','pgArticleList',
     'wabiRoutePg','wabiRankMore','wxGuide','wxInvite','wxSignup','wcMypage','wcPost',
     'wabiListPg','wabiFeedPg'].forEach(function(id){
      var e = document.getElementById(id); if (e) e.style.display = 'none';
    });
    var mp = document.getElementById('wcMypage'); if (mp) mp.classList.remove('show');

    var first = (p.photos && p.photos[0]) || p.img || '';
    var have  = (p.photos && p.photos.length > 1) ? p.photos.slice(0, 5) : null;
    paint(p, have || (first ? [first] : []));
    pg.style.display = 'block';
    pg.scrollTop = 0;
    if (!have && !p.mine){
      photosFor(p.shrine, first, function(arr){
        if (pg.style.display === 'block' && arr.length > 1) paint(p, arr);
      });
    }
    try { if (window.WabiExp) WabiExp.add('viewPost'); } catch(e){}
  };
  window.closePostDetail = closePg;

  // 一覧カードから自分の投稿も詳細で開けるようにする
  function hookFeed(){
    var f = document.getElementById('wabiFeedPg');
    if (!f) return;
    f.querySelectorAll('.wfd-card').forEach(function(el){
      if (el.getAttribute('data-pd5')) return;
      el.setAttribute('data-pd5', '1');
      el.addEventListener('click', function(){
        setTimeout(function(){
          if (pg.style.display === 'block') return;
          // openPostDetail が呼ばれていなければ自分の投稿として組み立てる
          var nm = el.querySelector('.nm'), un = el.querySelector('.un'), tm = el.querySelector('.tm'),
              tx = el.querySelector('.tx'), im = el.querySelector('.im');
          if (!nm) return;
          var bg = im ? (im.style.backgroundImage || '').replace(/^url\(["']?/, '').replace(/["']?\)$/, '') : '';
          window.openPostDetail({
            id: '', mine: true, user: un ? un.textContent : 'あなた', avatar: (un ? un.textContent : 'あ').slice(0,1),
            date: tm ? tm.textContent : '', shrine: nm.textContent, addr: '',
            img: bg, photos: bg ? [bg] : [], text: tx ? tx.textContent : '', likes: 0
          });
        }, 60);
      });
    });
  }
  WABI_TICK(hookFeed, 800);

  /* ── ④ 下部メニューが記録シート・新ページを閉じてから動くように ── */
  function navGuard(){
    var nav = document.getElementById('wabiNav');
    if (!nav || nav.getAttribute('data-fix5')) return;
    nav.setAttribute('data-fix5', '1');
    // capture フェーズ＝各ボタンの onclick より先に走る
    nav.addEventListener('click', function(){
      try { if (typeof wabiRecClose === 'function') wabiRecClose(); } catch(e){}
      try { closePg(); } catch(e){}
      try {
        var m = document.querySelector('.wrc-mask'); if (m) m.classList.remove('on');
        var b = document.querySelector('.wrc');      if (b) b.classList.remove('on');
      } catch(e){}
    }, true);
    nav.addEventListener('touchstart', function(){
      try { if (typeof wabiRecClose === 'function') wabiRecClose(); } catch(e){}
      try { closePg(); } catch(e){}
    }, { capture: true, passive: true });
  }
  navGuard();
  WABI_TICK(navGuard, 900);

  // 記録シートが「開いたのに出てこない」を防ぐ
  // （requestAnimationFrame が止まる状況でも必ずせり上がるようにする）
  (function(){
    var m = document.querySelector('.wrc-mask'), b = document.querySelector('.wrc');
    if (!m || !b) return;
    new MutationObserver(function(){
      if (m.classList.contains('on') && !b.classList.contains('on')){
        setTimeout(function(){ if (m.classList.contains('on')) b.classList.add('on'); }, 50);
      }
    }).observe(m, { attributes: true, attributeFilter: ['class'] });
  })();

  // 記録シートが開いている間も下部メニューを押せるように前面へ
  (function(){
    var z = document.createElement('style');
    z.textContent = '#wabiNav{z-index:2000 !important;} .wrc{z-index:421;} .wrc-mask{z-index:420;}';
    document.head.appendChild(z);
  })();
})();


/* ══════════════════════════════════════════════════════════════
   わびなび：下部メニューの取り合いを解消
   （マップを開いたあとの遅延処理が、次に押したタブを閉じてしまう問題）
   （2026-07-30 / index.html は触らず concierge.js から上書き）
   ══════════════════════════════════════════════════════════════ */
(function(){
  if (window.__wabiFix6) return;
  window.__wabiFix6 = true;

  var IDS = ['pgShrineDetail','pgMap','pgRegister','pgAiRoute','pgAiResult','pgAreaSearch','pgPostDetail',
             'pgTourList','pgSeasonList','pgEcList','pgOsupplyList','pgShukatsuList','pgArticleList',
             'wabiRoutePg','wabiRankMore','wxGuide','wxInvite','wxSignup','wcMypage','wcPost',
             'wabiListPg','wabiFeedPg','wabiPostPg'];

  function closeAll(keep){
    IDS.forEach(function(id){
      if (id === keep) return;
      var el = document.getElementById(id);
      if (el && el.style.display !== 'none') el.style.display = 'none';
    });
    if (keep !== 'wcMypage'){
      var mp = document.getElementById('wcMypage');
      if (mp) mp.classList.remove('show');
    }
  }

  // 今どのタブを押したか。遅延処理はこれが変わっていたら何もしない
  var tab = 'home';
  window.__wabiTab = tab;

  function handlerFor(k, nav){
    return function(){
      tab = k; window.__wabiTab = k;
      nav.querySelectorAll('.wn').forEach(function(x){
        x.classList.toggle('on', x.getAttribute('data-k') === k);
      });
      // シート・投稿詳細は先に閉じる
      try { if (typeof wabiRecClose === 'function') wabiRecClose(); } catch(e){}
      try { if (typeof wabiClosePostPg === 'function') wabiClosePostPg(); } catch(e){}

      if (k === 'home'){
        closeAll('');
        try { if (typeof go === 'function') go('pgHome'); } catch(e){}
        try {
          window.scrollTo(0, 0);
          document.documentElement.scrollTop = 0;
          document.body.scrollTop = 0;
          var app = document.querySelector('.app'); if (app) app.scrollTop = 0;
          var hm = document.getElementById('pgHome'); if (hm) hm.scrollTop = 0;
        } catch(e){}

      } else if (k === 'map'){
        try { if (typeof searchNearby === 'function') searchNearby(); } catch(e){}
        [30, 700, 1500, 2300].forEach(function(ms){
          setTimeout(function(){
            if (tab !== 'map') return;               // ← 別のタブに移っていたら何もしない
            closeAll('pgMap');
            var m = document.getElementById('pgMap');
            if (ms > 1000 && m && m.style.display !== 'flex' && typeof showMapArea === 'function'){
              try { showMapArea(); } catch(e){}
            }
          }, ms);
        });

      } else if (k === 'posts'){
        try { if (typeof wabiOpenFeed === 'function') wabiOpenFeed(); } catch(e){}
        [20, 400].forEach(function(ms){
          setTimeout(function(){ if (tab === 'posts') closeAll('wabiFeedPg'); }, ms);
        });

      } else if (k === 'my'){
        try { if (typeof openWabiMypage === 'function') openWabiMypage(); } catch(e){}
        [20, 400, 900].forEach(function(ms){
          setTimeout(function(){
            if (tab !== 'my') return;
            closeAll('wcMypage');
            var mp = document.getElementById('wcMypage');
            if (mp){ mp.style.display = ''; mp.classList.add('show'); }
          }, ms);
        });
      }
    };
  }

  function bind(){
    var nav = document.getElementById('wabiNav');
    if (!nav) return;
    nav.querySelectorAll('.wn').forEach(function(el){
      var k = el.getAttribute('data-k');
      if (el.__fix6k === k && el.onclick === el.__fix6h) return;   // すでに自分のもの
      var h = handlerFor(k, nav);
      el.__fix6k = k; el.__fix6h = h;
      el.onclick = h;
    });
  }
  bind();
  WABI_TICK(bind, 600);
  setTimeout(bind, 1200);
  setTimeout(bind, 3000);
})();


/* ══════════════════════════════════════════════════════════════
   わびなび：全ボタン総点検で見つかった不具合の修正
   ① 地図が後から勝手に開いてしまう（位置情報の遅い応答）
   ② 神社詳細「参拝記録を投稿する」が準備中のまま
   ③ ルートの「ナビ開始」が準備中のまま
   ④ 画面を見ていない間に止まる定期処理に頼っていた文言・非表示の修正
   ⑤ 写真変更シートが出てこないことがある
   （2026-07-30 / index.html は触らず concierge.js から上書き）
   ══════════════════════════════════════════════════════════════ */
(function(){
  if (window.__wabiFix7) return;
  window.__wabiFix7 = true;

  // 画面を見ていない間も動く軽い定期処理（指で動かしている間だけ休む）
  var scrolling = false, st = null;
  window.addEventListener('scroll', function(){
    scrolling = true; clearTimeout(st);
    st = setTimeout(function(){ scrolling = false; }, 140);
  }, { passive: true, capture: true });
  function TICK(fn, ms){
    return setInterval(function(){ if (scrolling) return; try { fn(); } catch(e){} }, ms);
  }

  /* ── ① 地図が後から勝手に開くのを防ぐ ──────────────────────
     searchNearby() の位置情報の応答が数秒遅れて返り、
     すでに別のページへ移っていても地図を開いてしまうため、
     マップタブを離れてから8秒間は見張って閉じる。            */
  (function(){
    var lastTab = window.__wabiTab || 'home';
    var leftAt  = 0;
    setInterval(function(){
      var t = window.__wabiTab || 'home';
      if (lastTab === 'map' && t !== 'map') leftAt = Date.now();
      lastTab = t;
      if (t === 'map') return;
      if (!leftAt || Date.now() - leftAt > 8000) return;
      var m = document.getElementById('pgMap');
      if (m && m.style.display !== 'none' && getComputedStyle(m).display !== 'none'){
        m.style.display = 'none';
      }
    }, 150);
  })();

  /* ── ② 神社詳細「参拝記録を投稿する」で記録シートを開く ───── */
  function fixWriteReview(){
    if (typeof window.sdWriteReview === 'function' && window.sdWriteReview.__wf7) return;
    var f = function(){
      var s = window.currentSdShrine || null;
      if (window.WabiRec && typeof WabiRec.visit === 'function'){ WabiRec.visit(s); return; }
      // 記録シートが見つからないときは従来どおり参拝済の導線へ
      var b = document.querySelector('#pgShrineDetail .sd-visited-btn');
      if (b) b.click();
    };
    f.__wf7 = true;
    window.sdWriteReview = f;
  }
  fixWriteReview();
  TICK(fixWriteReview, 1500);

  /* ── ③ 「ナビ開始」でGoogleマップの経路案内を開く ────────── */
  (function(){
    // どのルートを表示中かを覚えておく
    if (typeof window.showRouteMap === 'function' && !window.showRouteMap.__wf7){
      var orig = window.showRouteMap;
      var wrapped = function(route){ window.__wabiRmRoute = route; return orig.apply(this, arguments); };
      wrapped.__wf7 = true;
      window.showRouteMap = wrapped;
    }
    var nav = function(){
      var r = window.__wabiRmRoute;
      var pts = [];
      if (r && r.spots && r.spots.length){
        pts = r.spots.map(function(s){ return s.name; });
      } else if (window.currentSdShrine){
        pts = [currentSdShrine.name];
      }
      if (!pts.length){
        if (typeof showToast === 'function') showToast('ルートを選んでから押してください');
        return;
      }
      var dest = encodeURIComponent(pts[pts.length - 1]);
      var way  = pts.slice(0, -1).map(encodeURIComponent).join('|');
      var url  = 'https://www.google.com/maps/dir/?api=1&destination=' + dest
               + (way ? '&waypoints=' + way : '') + '&travelmode=driving';
      window.open(url, '_blank');
    };
    nav.__wf7 = true;
    window.startNavi = nav;
  })();

  /* ── ④ 文言・非表示の修正を、画面を見ていなくても効くように ── */
  function tweaks(){
    // 「友達を紹介」→「友達に紹介」
    var a = document.getElementById('wxInviteLink');
    if (a && a.textContent.indexOf('友達を紹介') >= 0) a.textContent = '友達に紹介 ›';
    var t = document.querySelector('#wxInvite .wx-hd .t');
    if (t && t.textContent.trim() === '友達を紹介') t.textContent = '友達に紹介';
    // マイページの不要セクションと「すべて見る」
    document.querySelectorAll('#wcMypage .mp-sec').forEach(function(sec){
      var h = sec.querySelector('.mp-h');
      if (!h) return;
      var n = h.textContent.trim();
      if (n === '最近の投稿' || n === '投稿した御朱印'){ sec.style.display = 'none'; return; }
      if (n === 'バッジコレクション'){
        var more = sec.querySelector('.mp-more');
        if (more) more.style.display = 'none';
      }
    });
  }
  tweaks();
  TICK(tweaks, 800);
  (function(){
    var mp = document.getElementById('wcMypage');
    if (!mp) return;
    new MutationObserver(function(){ tweaks(); }).observe(mp, { childList: true, subtree: true });
  })();

  /* ── ⑤ 写真変更シートが出てこないことがあるのを防ぐ ───────── */
  (function(){
    function guard(maskSel, sheetSel){
      var m = document.querySelector(maskSel), s = document.querySelector(sheetSel);
      if (!m || !s || m.__wf7) return;
      m.__wf7 = true;
      new MutationObserver(function(){
        if (m.classList.contains('on') && !s.classList.contains('on')){
          setTimeout(function(){ if (m.classList.contains('on')) s.classList.add('on'); }, 50);
        }
      }).observe(m, { attributes: true, attributeFilter: ['class'] });
    }
    function run(){ guard('.wp-mask', '.wp-sheet'); guard('.wrc-mask', '.wrc'); }
    run();
    TICK(run, 1200);
  })();
})();


/* ══════════════════════════════════════════════════════════════
   わびなび：Googleログイン（Supabase Auth 経由 / サーバー不要）
   ・「Googleで登録」「Googleでログイン」を実際に動かす
   ・Supabase の /auth/v1/authorize?provider=google へ飛ばし、
     戻ってきた URL の #access_token からユーザー情報を取り出す
   ・保存先は LINEログインと同じ localStorage('wabiUser') = {id,name,pic}
     id は 'g:' + SupabaseのユーザーID（LINEのIDと混ざらないように接頭辞をつける）
   ・Supabase側でGoogleを有効にしていないときは、今までどおり
     「Googleでのログインは現在準備中です」と出るだけで何も起きない
   ※ クライアントシークレットはここには置かない（Supabaseのダッシュボード側のみ）
   （2026-07-30 追加 / index.html は触らず concierge.js から上書き）
   ══════════════════════════════════════════════════════════════ */
(function(){
  if (window.__wabiGoogleLogin) return;
  window.__wabiGoogleLogin = true;

  var LS_USER = 'wabiUser';
  var LS_SESS = 'wabiSbSession';        // Supabaseのトークン（将来のRLS対応用）
  var SS_GOING = 'wabiGoogleGoing';

  // Supabaseの接続先は WabiSync と共有する（publishableキーは公開前提の値）
  function cfg(){
    var url = 'https://rqkqjrzhvhsogwhtfbqh.supabase.co';
    var key = 'sb_publishable_cqf_45micn3pe7PtMq1seQ_2UEAxlCv';
    try {
      if (window.WabiSync && WabiSync.config){
        url = WabiSync.config.url || url;
        key = WabiSync.config.key || key;
      }
    } catch(e){}
    try {
      url = localStorage.getItem('wabiSbUrl') || url;
      key = localStorage.getItem('wabiSbKey') || key;
    } catch(e){}
    return { url: String(url).trim().replace(/\/+$/, ''), key: String(key).trim() };
  }

  function toast(m){ try { if (typeof showToast === 'function') showToast(m); } catch(e){} }
  function getUser(){
    try { var u = JSON.parse(localStorage.getItem(LS_USER) || 'null'); return (u && u.id) ? u : null; }
    catch(e){ return null; }
  }

  // ── ヘッダーのログインボタンを描き直す（__wabiLoginBtn の paintButton と同じ見た目）──
  var PERSON = '<svg viewBox="0 0 20 20" fill="none"><circle cx="10" cy="6.5" r="3.2" stroke="currentColor" stroke-width="1.6"/>'
             + '<path d="M3.5 17c0-3.6 13-3.6 13 0" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>';
  function repaintHeader(){
    var btn = document.getElementById('wlBtn'), menu = document.getElementById('wlMenu');
    if (!btn || !menu) return;
    var u = getUser();
    if (!u) return;
    var nm = u.name || '巡礼者';
    try { nm = localStorage.getItem('wabiName') || nm; } catch(e){}
    var pic = u.pic || '';
    try { pic = localStorage.getItem('wabiAvatar') || pic; } catch(e){}
    btn.innerHTML = (pic ? '<img src="' + pic + '" style="width:20px;height:20px;border-radius:50%;object-fit:cover">' : PERSON)
                  + (nm.length > 6 ? nm.slice(0, 6) + '…' : nm);
    menu.innerHTML = '<a id="wlMenuMypage">マイページ</a><div class="sep"></div><a id="wlMenuLogout">ログアウト</a>';
    var mp = document.getElementById('wlMenuMypage'), lo = document.getElementById('wlMenuLogout');
    if (mp) mp.onclick = function(){
      menu.classList.remove('on');
      if (typeof openWabiMypage === 'function') openWabiMypage();
    };
    if (lo) lo.onclick = function(){
      menu.classList.remove('on');
      if (window.WabiLine && WabiLine.logout) WabiLine.logout();
    };
    try { if (typeof wabiSyncHeaderName === 'function') wabiSyncHeaderName(); } catch(e){}
  }

  function saveUser(u){
    try { localStorage.setItem(LS_USER, JSON.stringify(u)); } catch(e){}
    // ヘッダーの反映は少し遅れて作られることがあるので何度か試す
    [0, 200, 700, 1500].forEach(function(ms){ setTimeout(repaintHeader, ms); });
  }

  // ── Googleが有効になっているかをSupabaseに聞く ──────────────
  function providerReady(){
    var c = cfg();
    if (!c.url || !c.key) return Promise.resolve(false);
    return fetch(c.url + '/auth/v1/settings', { headers: { 'apikey': c.key } })
      .then(function(r){ return r.ok ? r.json() : null; })
      .then(function(j){ return !!(j && j.external && j.external.google); })
      .catch(function(){ return false; });
  }

  // 戻り先。クエリやハッシュを外して Supabase の許可リストに合わせる
  function backUrl(){ return location.origin + location.pathname; }

  // ── ログイン開始 ─────────────────────────────────────────
  function start(){
    var c = cfg();
    if (!c.url || !c.key){
      toast('Googleでのログインは現在準備中です');
      return false;
    }
    toast('Googleに接続しています…');
    providerReady().then(function(ok){
      if (!ok){
        toast('Googleでのログインは現在準備中です');
        return;
      }
      try { sessionStorage.setItem(SS_GOING, '1'); } catch(e){}
      location.href = c.url + '/auth/v1/authorize?provider=google'
                    + '&redirect_to=' + encodeURIComponent(backUrl());
    });
    return true;
  }

  // ── 戻ってきたときの処理 ───────────────────────────────────
  function parseHash(h){
    var o = {};
    String(h || '').replace(/^#/, '').split('&').forEach(function(kv){
      if (!kv) return;
      var i = kv.indexOf('=');
      var k = i < 0 ? kv : kv.slice(0, i);
      var v = i < 0 ? '' : kv.slice(i + 1);
      try { o[decodeURIComponent(k)] = decodeURIComponent(v.replace(/\+/g, ' ')); }
      catch(e){ o[k] = v; }
    });
    return o;
  }
  function cleanHash(){
    try { history.replaceState(null, '', location.pathname + location.search); } catch(e){}
  }
  // JWTの中身（ネットにつながらなくても名前くらいは取れる）
  function jwtBody(t){
    try {
      var p = String(t).split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      while (p.length % 4) p += '=';
      return JSON.parse(decodeURIComponent(escape(atob(p))));
    } catch(e){ return null; }
  }

  function pickName(meta, email){
    meta = meta || {};
    return meta.full_name || meta.name || meta.preferred_username
        || (email ? String(email).split('@')[0] : '') || '巡礼者';
  }
  function pickPic(meta){
    meta = meta || {};
    return meta.avatar_url || meta.picture || '';
  }

  function finish(id, name, pic){
    saveUser({ id: 'g:' + id, name: name, pic: pic });
    var sp = document.getElementById('wxSignup'); if (sp) sp.style.display = 'none';
    var pr = document.getElementById('pgRegister'); if (pr) pr.style.display = 'none';
    toast('ようこそ、' + name + 'さん');
    try { if (window.WabiExp) window.WabiExp.add('login', { silent: true }); } catch(e){}
    // ログイン直後にクラウドの記録を取り込む
    try { if (window.WabiSync && WabiSync.pull) setTimeout(function(){ WabiSync.pull(); }, 600); } catch(e){}
  }

  function handleReturn(){
    var h = location.hash || '';
    if (h.indexOf('error') >= 0 && h.indexOf('access_token=') < 0){
      var e = parseHash(h);
      cleanHash();
      try { sessionStorage.removeItem(SS_GOING); } catch(e2){}
      toast('Googleに接続できませんでした');
      console.warn('[WabiGoogle]', e.error_description || e.error || h);
      return;
    }
    if (h.indexOf('access_token=') < 0) return;

    var p = parseHash(h);
    cleanHash();
    try { sessionStorage.removeItem(SS_GOING); } catch(e){}

    try {
      localStorage.setItem(LS_SESS, JSON.stringify({
        access_token: p.access_token || '',
        refresh_token: p.refresh_token || '',
        expires_at: Date.now() + (parseInt(p.expires_in, 10) || 3600) * 1000,
        provider: 'google'
      }));
    } catch(e){}

    var body = jwtBody(p.access_token) || {};
    var c = cfg();

    // 正確な情報はユーザーAPIから取る。取れなければJWTの中身で代用する。
    fetch(c.url + '/auth/v1/user', {
      headers: { 'apikey': c.key, 'Authorization': 'Bearer ' + p.access_token }
    }).then(function(r){ return r.ok ? r.json() : null; })
      .then(function(u){
        if (u && u.id){
          finish(u.id, pickName(u.user_metadata, u.email), pickPic(u.user_metadata));
        } else if (body.sub){
          finish(body.sub, pickName(body.user_metadata, body.email), pickPic(body.user_metadata));
        } else {
          toast('Googleに接続できませんでした');
        }
      })
      .catch(function(){
        if (body.sub) finish(body.sub, pickName(body.user_metadata, body.email), pickPic(body.user_metadata));
        else toast('Googleに接続できませんでした');
      });
  }

  // ── 公開API（__wabiRegSkin の準備中スタブを置き換える）──────
  window.WabiGoogle = {
    ready: true,
    user: getUser,
    config: cfg,
    isEnabled: providerReady,
    start: start,
    logout: function(){
      var c = cfg(), s = null;
      try { s = JSON.parse(localStorage.getItem(LS_SESS) || 'null'); } catch(e){}
      if (s && s.access_token){
        try {
          fetch(c.url + '/auth/v1/logout', {
            method: 'POST',
            headers: { 'apikey': c.key, 'Authorization': 'Bearer ' + s.access_token }
          }).catch(function(){});
        } catch(e){}
      }
      try { localStorage.removeItem(LS_SESS); } catch(e){}
    }
  };

  // ログアウトのときにSupabase側のセッションも切る
  (function(){
    function hook(){
      if (!window.WabiLine || !WabiLine.logout || WabiLine.logout.__wg) return true;
      var orig = WabiLine.logout;
      var wrapped = function(){
        try { window.WabiGoogle.logout(); } catch(e){}
        return orig.apply(this, arguments);
      };
      wrapped.__wg = true;
      WabiLine.logout = wrapped;
      return true;
    }
    if (!hook()){
      var n = 0;
      var iv = setInterval(function(){ if (hook() || ++n > 30) clearInterval(iv); }, 400);
    }
  })();

  // index.html の regWithProvider('Google') からも動くようにする
  (function(){
    function hook(){
      var orig = window.regWithProvider;
      if (typeof orig !== 'function' || orig.__wg) return;
      var wrapped = function(provider){
        if (provider === 'Google'){
          var pr = document.getElementById('pgRegister');
          if (pr) pr.style.display = 'none';
          window.WabiGoogle.start();
          return;
        }
        return orig.apply(this, arguments);
      };
      wrapped.__wg = true;
      window.regWithProvider = wrapped;
    }
    hook();
    var n = 0;
    var iv = setInterval(function(){ hook(); if (++n > 30) clearInterval(iv); }, 400);
  })();

  // 戻ってきた直後に処理する（すでにログイン済みならヘッダーだけ整える）
  handleReturn();
  [300, 1200, 2500].forEach(function(ms){ setTimeout(repaintHeader, ms); });
})();


/* ══════════════════════════════════════════════════════════════
   わびなび：フッターにプライバシーポリシー・利用規約のリンクを置く
   （Googleログインの本番公開に必要／サイト公開時にも必須）
   （2026-07-31 / index.html は触らず concierge.js から上書き）
   ══════════════════════════════════════════════════════════════ */
(function(){
  if (window.__wabiLegal) return;
  window.__wabiLegal = true;

  var css = document.createElement('style');
  css.textContent = [
    '#wabiLegal{max-width:500px;margin:0 auto;padding:26px 20px calc(120px + env(safe-area-inset-bottom));',
      "text-align:center;font-family:'Noto Serif JP',serif;font-size:11.5px;line-height:2;color:#8a8378;",
      'border-top:1px solid #EFE9DE;}',
    '#wabiLegal a{color:#5D3A7A;text-decoration:none;margin:0 8px;white-space:nowrap;}',
    '#wabiLegal .cp{display:block;margin-top:8px;color:#a8a196;font-size:10.5px;}'
  ].join('');
  document.head.appendChild(css);

  function put(){
    var home = document.getElementById('pgHome');
    if (!home || document.getElementById('wabiLegal')) return;
    var box = document.createElement('div');
    box.id = 'wabiLegal';
    box.innerHTML = '<a href="/privacy.html">プライバシーポリシー</a>･'
                  + '<a href="/terms.html">利用規約</a>'
                  + '<span class="cp">© 2026 わびなび（和美導）</span>';
    home.appendChild(box);
  }
  put();
  var n = 0;
  var iv = setInterval(function(){
    put(); if (++n > 20 || document.getElementById('wabiLegal')) clearInterval(iv);
  }, 600);
})();


/* ══════════════════════════════════════════════════════════════
   わびなび：Googleアナリティクス（GA4）
   測定ID G-0WRQVNFV8Y ／ 2026-07-31 設置
   ※測定IDは公開前提の値なのでコードに書いて問題ありません
   ══════════════════════════════════════════════════════════════ */
(function(){
  if (window.__wabiGA) return;
  window.__wabiGA = true;

  var GA_ID = 'G-0WRQVNFV8Y';

  // すでに他の場所で読み込まれていれば何もしない
  if (document.querySelector('script[src*="googletagmanager.com/gtag/js"]')) return;

  var s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
  document.head.appendChild(s);

  window.dataLayer = window.dataLayer || [];
  function gtag(){ dataLayer.push(arguments); }
  window.gtag = window.gtag || gtag;
  gtag('js', new Date());
  gtag('config', GA_ID);

  /* ── わびなびの中の移動もページとして数える ──────────────
     1枚のHTMLの中でページを切り替えるつくりなので、
     オーバーレイが開いたときに page_view を送る                */
  var PAGES = {
    pgShrineDetail: '神社詳細', pgMap: 'マップ', pgRegister: 'ログイン',
    pgAiRoute: 'AIルート', pgAiRouteList: 'AIルート一覧', pgAreaSearch: 'エリア検索',
    pgTourList: 'ツアー一覧', pgSeasonList: '季節の行事', pgEcList: '御朱印グッズ',
    pgOsupplyList: '参拝のお供', pgShukatsuList: '終活・供養', pgArticleList: '記事一覧',
    pgThemeDetail: '特集', wabiRoutePg: '巡拝ルート', wabiRankMore: 'ランキング11-30位',
    wxGuide: 'EXPガイド', wxInvite: '友達に紹介', wxSignup: '新規登録',
    wcMypage: 'マイページ', wabiListPg: '一覧ページ', wabiFeedPg: 'みんなの投稿',
    wabiPostPg: '投稿詳細'
  };
  var shown = {};
  function check(){
    Object.keys(PAGES).forEach(function(id){
      var el = document.getElementById(id);
      if (!el) return;
      var open = getComputedStyle(el).display !== 'none';
      if (open && !shown[id]){
        shown[id] = true;
        try {
          gtag('event', 'page_view', {
            page_title: 'わびなび｜' + PAGES[id],
            page_location: location.origin + '/#' + id
          });
        } catch(e){}
      } else if (!open){
        shown[id] = false;
      }
    });
  }
  setInterval(check, 1200);
})();


/* ══════════════════════════════════════════════════════════════
   わびなび：写真をクラウド（Supabase Storage）に預ける
   ・これまで写真は端末内に dataURL で保存していたため、
     1台あたり約5MB（縮小後30枚前後）が上限だった。
   ・ログイン中は写真だけを保管庫へ上げ、端末にはURLだけを残す。
   ・ログインしていないときは今までどおり端末内に保存する。
   （2026-07-31 / index.html は触らず concierge.js から上書き）
   ══════════════════════════════════════════════════════════════ */
(function(){
  if (window.WabiPhoto) return;

  var FN = 'https://rqkqjrzhvhsogwhtfbqh.supabase.co/functions/v1/wabi-sync';

  function isData(v){ return typeof v === 'string' && v.indexOf('data:image/') === 0; }
  function isCloud(v){ return typeof v === 'string' && v.indexOf('/storage/v1/object/public/wabi-photos/') > 0; }

  // WabiSync が持っている「本人の証明」を借りる
  function proof(){
    try {
      var u = JSON.parse(localStorage.getItem('wabiUser') || 'null');
      if (!u || !u.id) return Promise.resolve(null);
      if (u.id.indexOf('g:') === 0){
        var s = JSON.parse(localStorage.getItem('wabiSbSession') || 'null');
        if (!s || !s.access_token) return Promise.resolve(null);
        return Promise.resolve({ provider: 'google', token: s.access_token });
      }
      var t = localStorage.getItem('wabiLineIdToken') || '';
      return Promise.resolve(t ? { provider: 'line', token: t } : null);
    } catch(e){ return Promise.resolve(null); }
  }

  // 写真1枚をクラウドへ。失敗したら元のdataURLをそのまま返す（記録は必ず残す）
  function upload(dataUrl){
    if (!isData(dataUrl)) return Promise.resolve(dataUrl);
    return proof().then(function(pr){
      if (!pr) return dataUrl;
      return fetch(FN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'upload', provider: pr.provider, token: pr.token, dataUrl: dataUrl })
      }).then(function(r){ return r.ok ? r.json() : null; })
        .then(function(j){ return (j && j.url) ? j.url : dataUrl; })
        .catch(function(){ return dataUrl; });
    });
  }
  function uploadAll(list){
    if (!list || !list.length) return Promise.resolve(list || []);
    return Promise.all(list.map(upload));
  }

  window.WabiPhoto = { upload: upload, uploadAll: uploadAll, isData: isData, isCloud: isCloud };

  /* ── ① 記録するときに写真をクラウドへ ───────────────────── */
  // localStorage への保存を横取りして、写真だけ先にクラウドへ上げる
  var KEYS = ['wabiVisits', 'wabiGoshuin', 'wabiMyPosts'];
  var busy = {};
  function liftPhotos(key){
    if (busy[key]) return;
    var arr;
    try { arr = JSON.parse(localStorage.getItem(key) || '[]'); } catch(e){ return; }
    if (!Array.isArray(arr) || !arr.length) return;

    var jobs = [];
    arr.forEach(function(rec){
      if (!rec) return;
      if (Array.isArray(rec.photos)){
        rec.photos.forEach(function(ph, i){
          if (isData(ph)) jobs.push(upload(ph).then(function(u){ rec.photos[i] = u; }));
        });
      }
      ['img', 'photo', 'image'].forEach(function(f){
        if (isData(rec[f])) jobs.push(upload(rec[f]).then(function(u){ rec[f] = u; }));
      });
    });
    if (!jobs.length) return;

    busy[key] = true;
    Promise.all(jobs).then(function(){
      try { localStorage.setItem(key, JSON.stringify(arr)); } catch(e){}
      busy[key] = false;
      try { if (window.WabiRec && WabiRec.refresh) WabiRec.refresh(); } catch(e){}
    }).catch(function(){ busy[key] = false; });
  }

  /* ── ② プロフィール写真・カバー写真もクラウドへ ─────────── */
  function liftOne(key){
    if (busy[key]) return;
    var v;
    try { v = localStorage.getItem(key) || ''; } catch(e){ return; }
    if (!isData(v)) return;
    busy[key] = true;
    upload(v).then(function(u){
      if (u && u !== v){ try { localStorage.setItem(key, u); } catch(e){} }
      busy[key] = false;
      try { if (typeof wabiApplyProfilePhotos === 'function') wabiApplyProfilePhotos(); } catch(e){}
    }).catch(function(){ busy[key] = false; });
  }

  function sweep(){
    // ログインしていないときは何もしない（端末内保存のまま）
    var u = null;
    try { u = JSON.parse(localStorage.getItem('wabiUser') || 'null'); } catch(e){}
    if (!u || !u.id) return;
    KEYS.forEach(liftPhotos);
    liftOne('wabiAvatar');
    liftOne('wabiCover');
  }

  // 保存された直後と、ときどき見回る
  var _set = localStorage.setItem.bind(localStorage);
  localStorage.setItem = function(k, v){
    var r = _set(k, v);
    if (KEYS.indexOf(k) >= 0 || k === 'wabiAvatar' || k === 'wabiCover'){
      setTimeout(sweep, 400);
    }
    return r;
  };
  setTimeout(sweep, 4000);
  setInterval(sweep, 30000);

  /* ── ③ 端末の空きが足りないときに備える ─────────────────── */
  // 保存に失敗したら、いちばん古い写真を落として入れ直す
  window.wabiSafeSet = function(k, v){
    try { localStorage.setItem(k, v); return true; }
    catch(e){
      try {
        KEYS.forEach(function(key){
          var a = JSON.parse(localStorage.getItem(key) || '[]');
          if (Array.isArray(a)){
            a.forEach(function(rec){
              if (rec && Array.isArray(rec.photos)){
                rec.photos = rec.photos.filter(function(p){ return !isData(p); });
              }
            });
            _set(key, JSON.stringify(a));
          }
        });
        localStorage.setItem(k, v);
        return true;
      } catch(e2){ return false; }
    }
  };
})();


/* ══════════════════════════════════════════════════════════════
   わびなび：プレースホルダだった2ページを実データに差し替え
   ① 季節の行事・ライトアップ … 公式情報で日程を確認した実在の行事10件
   ② 御朱印グッズ           … 楽天で実在を確認した商品4点
   ③ 終活・供養             … 提携が未締結のため、いったん非表示
   （2026-07-31 / index.html は触らず concierge.js から上書き）
   ══════════════════════════════════════════════════════════════ */
(function(){
  if (window.__wabiReal) return;
  window.__wabiReal = true;

  function esc(s){
    return String(s == null ? '' : s)
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  /* ── ① 季節の行事・ライトアップ（実在・公式で日程確認済み）──── */
  var EVENTS = [
    { id:'e1', title:'京都五山送り火', sub:'大文字から鳥居形まで、五つの送り火',
      area:'京都', place:'京都市内一円', period:'2026年8月16日（日）20:00〜', tag:'夏',
      photo:'大文字山 京都',
      url:'https://ja.kyoto.travel/event/major/okuribi/' },
    { id:'e2', title:'清水寺 千日詣り・夜間特別拝観', sub:'一日の参拝で千日分の功徳',
      area:'京都', place:'清水寺', period:'2026年8月9日（日）〜16日（日）／夜間は14〜16日', tag:'夏',
      photo:'清水寺',
      url:'https://www.kiyomizudera.or.jp/news/sennichi-mairi.php' },
    { id:'e3', title:'春日大社 中元万燈籠', sub:'三千基の燈籠に火が入る夜',
      area:'奈良', place:'春日大社', period:'2026年8月14日（金）・15日（土）19:00〜21:30', tag:'夏',
      photo:'春日大社',
      url:'https://www.kasugataisha.or.jp/calendar/summer08/' },
    { id:'e4', title:'東大寺 万灯供養会', sub:'大仏殿を囲む約2,500基の灯籠',
      area:'奈良', place:'東大寺 大仏殿', period:'2026年8月15日（土）19:00〜22:00', tag:'夏',
      photo:'東大寺',
      url:'https://narashikanko.or.jp/event/detail_10260.html' },
    { id:'e5', title:'高台寺 東山観月路', sub:'夜の庭園と方丈前庭のプロジェクション',
      area:'京都', place:'高台寺', period:'2026年7月11日（土）〜8月23日（日）※8/10休', tag:'夏',
      photo:'高台寺',
      url:'https://ja.kyoto.travel/event/single.php?event_id=8391' },
    { id:'e6', title:'青蓮院門跡 青蓮華の夏灯り', sub:'苔庭と竹林を照らす夏の夜間拝観',
      area:'京都', place:'青蓮院門跡', period:'2026年7月17日（金）〜8月23日（日）※8/13〜16除く', tag:'夏',
      photo:'青蓮院',
      url:'https://ja.kyoto.travel/event/single.php?event_id=14582' },
    { id:'e7', title:'貴船神社 七夕笹飾りライトアップ', sub:'川床の里に揺れる願いの短冊',
      area:'京都', place:'貴船神社', period:'2026年7月1日（水）〜8月15日（土）', tag:'夏',
      photo:'貴船神社',
      url:'https://ja.kyoto.travel/event/single.php?event_id=4549' },
    { id:'e8', title:'瑠璃光院 夏の特別公開', sub:'書院の机に映り込む青もみじ',
      area:'京都', place:'瑠璃光院', period:'2026年7月1日（水）〜8月17日（月）', tag:'夏',
      photo:'瑠璃光院',
      url:'https://ja.kyoto.travel/event/single.php?event_id=8361' },
    { id:'e9', title:'上賀茂神社 本殿・権殿 特別公開', sub:'第51回 京の夏の旅',
      area:'京都', place:'上賀茂神社', period:'2026年7月10日（金）〜9月30日（水）', tag:'夏',
      photo:'上賀茂神社',
      url:'https://ja.kyoto.travel/event/single.php?event_id=14518' },
    { id:'e10', title:'下鴨神社 本殿・大炊殿 特別公開', sub:'第51回 京の夏の旅',
      area:'京都', place:'下鴨神社', period:'2026年7月10日（金）〜9月30日（水）', tag:'夏',
      photo:'下鴨神社',
      url:'https://ja.kyoto.travel/event/single.php?event_id=14519' }
  ];

  /* ── ② 御朱印グッズ（楽天で実在を確認した商品）───────────── */
  // link が hb.afl… のものは楽天アフィリエイトのリンク（PR表示あり）
  var GOODS = [
    { name:'御城印帳 ポケット式 御城印ホルダー 戦国武将 家紋', shop:'京都ごりやく堂', price:'¥3,190', tag:'ランキング1位',
      img:'https://images.unsplash.com/photo-1478436127897-769e1b3f0f36?w=400&q=80&auto=format&fit=crop',
      pr:false,
      link:'https://item.rakuten.co.jp/kyoto-goriyaku/kgd-ghldm/' },
    { name:'御朱印ホルダー 見開きサイズ 書き置き 20ポケット', shop:'京都ごりやく堂', price:'¥3,300〜', tag:'ランキング2位',
      img:'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=400&q=80&auto=format&fit=crop',
      pr:false,
      link:'https://item.rakuten.co.jp/kyoto-goriyaku/isk-hldl/' },
    { name:'御朱印帳 大判 かわいい 翡翠花吹雪 金襴 蛇腹式', shop:'御朱印帳工房 京都ちせん', price:'¥2,480', tag:'ランキング3位',
      img:'https://images.unsplash.com/photo-1763120339579-d660fbebaa16?w=400&q=80&auto=format&fit=crop',
      pr:false,
      link:'https://item.rakuten.co.jp/kyoto-chisen/10000067/' },
    { name:'うるわしき御朱印帳 友禅紙 鳥の子紙 大判サイズ', shop:'京都ごりやく堂', price:'¥1,980', tag:'ランキング4位',
      img:'https://images.unsplash.com/photo-1752898514963-e36929a03859?w=400&q=80&auto=format&fit=crop',
      pr:false,
      link:'https://item.rakuten.co.jp/kyoto-goriyaku/kgd-urusyu/' }
  ];

  /* ── スタイル ─────────────────────────────────────────── */
  var css = document.createElement('style');
  css.textContent = [
    '.wev-card{background:#fff;border-radius:20px;box-shadow:0 8px 24px rgba(0,0,0,.06);overflow:hidden;cursor:pointer;',
      'display:flex;flex-direction:column;}',
    '#seasonList{display:flex;gap:12px;overflow-x:auto;padding:4px 2px 10px;scrollbar-width:none;}',
    '#seasonList::-webkit-scrollbar{display:none;}',
    '#seasonList .wev-card{flex:0 0 245px;width:245px;}',
    '#seasonListFull{display:grid;grid-template-columns:1fr 1fr;gap:12px;}',
    '#ecGridFull{display:grid;grid-template-columns:1fr 1fr;gap:12px;}',
    '#ecGrid .ec-img,#ecGridFull .ec-img{aspect-ratio:1/1;overflow:hidden;position:relative;}',
    '#ecGrid .ec-img img,#ecGridFull .ec-img img{width:100%;height:100%;object-fit:cover;display:block;}',
    '.wev-card .im{position:relative;width:100%;aspect-ratio:4/3;background:#e9e3d8 center/cover no-repeat;}',
    '.wev-card .bd{padding:12px 13px 14px;}',
    '.wev-card .tt{font-size:14.5px;font-weight:700;line-height:1.4;}',
    ".wev-card .sb{font-size:11.5px;color:#8a8378;margin-top:4px;line-height:1.6;font-family:'Noto Serif JP',serif;}",
    ".wev-card .pd{font-size:11.5px;color:#5D3A7A;margin-top:8px;font-family:'Noto Serif JP',serif;line-height:1.5;}",
    '.wev-card .ar{position:absolute;top:8px;left:8px;background:rgba(42,32,24,.62);color:#fff;font-size:10px;',
      'padding:3px 9px;border-radius:999px;}',
    '.wev-card .go{display:inline-block;margin-top:9px;font-size:11px;color:#5D3A7A;}',
    '.wgd-pr{position:absolute;top:6px;right:6px;background:rgba(42,32,24,.6);color:#fff;font-size:8.5px;',
      'padding:2px 7px;border-radius:9px;z-index:2;}',
    '.wgd-shop{font-size:10.5px;color:#8a8378;margin-top:3px;}',
    '.wgd-btn{display:block;text-align:center;margin-top:7px;background:#bf0000;color:#fff !important;',
      'font-size:11px;font-weight:700;padding:7px 0;border-radius:14px;text-decoration:none;}'
  ].join('');
  document.head.appendChild(css);

  /* ── 写真をあとから読み込む（Places → Wikipedia）───────────── */
  var photoCacheEv = {};
  function fillPhotos(root){
    var els = root.querySelectorAll('[data-ph]');
    var names = [];
    els.forEach(function(el){
      var n = el.getAttribute('data-ph');
      if (!n || el.getAttribute('data-done')) return;
      if (photoCacheEv[n]){ el.style.backgroundImage = 'url("' + photoCacheEv[n] + '")'; el.setAttribute('data-done','1'); return; }
      if (names.indexOf(n) < 0) names.push(n);
    });
    if (!names.length) return;

    function apply(n, url){
      if (!url) return;
      photoCacheEv[n] = url;
      root.querySelectorAll('[data-ph="' + n + '"]').forEach(function(el){
        el.style.backgroundImage = 'url("' + url + '")'; el.setAttribute('data-done','1');
      });
    }
    try {
      if (window.google && google.maps && google.maps.places){
        var svc = new google.maps.places.PlacesService(document.createElement('div'));
        names.forEach(function(n, i){
          setTimeout(function(){
            svc.findPlaceFromQuery({ query: n, fields: ['photos'] }, function(res, st){
              if (st === google.maps.places.PlacesServiceStatus.OK && res && res[0] && res[0].photos && res[0].photos[0]){
                try { apply(n, res[0].photos[0].getUrl({ maxWidth: 700, maxHeight: 520 })); return; } catch(e){}
              }
              wikiPhotos([n], function(map){ apply(n, map[n]); });
            });
          }, i * 200);
        });
        return;
      }
    } catch(e){}
    wikiPhotos(names, function(map){ names.forEach(function(n){ apply(n, map[n]); }); });
  }
  function wikiPhotos(names, cb){
    try {
      var url = 'https://ja.wikipedia.org/w/api.php?action=query&format=json&origin=*'
        + '&prop=pageimages&piprop=thumbnail&pithumbsize=700&redirects=1&titles='
        + encodeURIComponent(names.join('|'));
      fetch(url).then(function(r){ return r.json(); }).then(function(j){
        var map = {}, redir = {};
        ((j.query || {}).redirects || []).forEach(function(r){ redir[r.from] = r.to; });
        ((j.query || {}).normalized || []).forEach(function(r){ redir[r.from] = r.to; });
        var pages = (j.query || {}).pages || {};
        Object.keys(pages).forEach(function(k){
          if (pages[k].thumbnail) map[pages[k].title] = pages[k].thumbnail.source;
        });
        var out = {};
        names.forEach(function(n){ out[n] = map[redir[n] || n] || null; });
        cb(out);
      }).catch(function(){ cb({}); });
    } catch(e){ cb({}); }
  }

  /* ── 季節の行事を描き直す ─────────────────────────────── */
  function evCard(e){
    return '<div class="wev-card" data-url="' + esc(e.url) + '">'
      + '<div class="im" data-ph="' + esc(e.photo) + '"><span class="ar">' + esc(e.area) + '</span></div>'
      + '<div class="bd">'
      +   '<div class="tt">' + esc(e.title) + '</div>'
      +   '<div class="sb">' + esc(e.sub) + '</div>'
      +   '<div class="pd">' + esc(e.period) + '</div>'
      +   '<span class="go">公式ページで詳しく見る ›</span>'
      + '</div></div>';
  }
  function bindCards(root){
    root.querySelectorAll('.wev-card').forEach(function(el){
      if (el.getAttribute('data-b')) return;
      el.setAttribute('data-b','1');
      el.onclick = function(){ window.open(el.getAttribute('data-url'), '_blank', 'noopener'); };
    });
    fillPhotos(root);
  }
  function paintSeasons(){
    // トップの横スクロール（3件）と、もっと見るページ（全件）
    var top = document.getElementById('seasonList');
    if (top && !top.querySelector('.wev-card')){
      top.innerHTML = EVENTS.slice(0, 5).map(evCard).join('');
      bindCards(top);
    }
    // もっと見るページは別の処理があとから上書きするので、
    // 自分のカードが消えていたら何度でも描き直す
    var full = document.getElementById('seasonListFull');
    if (full && !full.querySelector('.wev-card')){
      full.innerHTML = EVENTS.map(evCard).join('');
      bindCards(full);
    }
    // 同ページ上部に残っている古い行事カード（終了した7月の祭）を隠す
    var pg = document.getElementById('pgSeasonList');
    if (pg){
      pg.querySelectorAll('.route-card').forEach(function(el){
        var w = el.parentElement;
        if (w && w !== pg && w.getAttribute('data-hid') !== '1'){
          w.setAttribute('data-hid','1'); w.style.display = 'none';
        } else if (el.getAttribute('data-hid') !== '1'){
          el.setAttribute('data-hid','1'); el.style.display = 'none';
        }
      });
    }
  }

  /* ── 御朱印グッズを描き直す ───────────────────────────── */
  function goodsCard(g){
    return '<div class="ec-card" style="position:relative">'
      + (g.pr ? '<span class="wgd-pr">PR</span>' : '')
      + '<a href="' + esc(g.link) + '" target="_blank" rel="' + (g.pr ? 'nofollow sponsored noopener' : 'noopener') + '" style="text-decoration:none;color:inherit;display:block">'
      +   '<div class="ec-img"><img src="' + esc(g.img) + '" alt="" loading="lazy" onerror="this.style.display=\'none\'">'
      +     '<div class="ec-img-tag">' + esc(g.tag) + '</div></div>'
      +   '<div class="ec-body"><div class="ec-title">' + esc(g.name) + '</div>'
      +     '<div class="wgd-shop">' + esc(g.shop) + '</div>'
      +     '<div class="ec-price">' + esc(g.price) + '<small>(税込)</small></div>'
      +     '<span class="wgd-btn">楽天で見る</span></div>'
      + '</a></div>';
  }
  function paintGoods(){
    ['ecGrid', 'ecGridFull'].forEach(function(id){
      var el = document.getElementById(id);
      if (el && !el.querySelector('.wgd-btn')){
        el.innerHTML = GOODS.map(goodsCard).join('');
      }
    });
  }

  /* ── 終活・供養は提携が済むまで隠す ───────────────────── */
  // 「無料で資料請求」と書いてあるのに実際には請求できない状態は、
  // お墓や供養という大切な話題では不誠実なので、提携が決まるまで出さない。
  function hideShukatsu(){
    ['shukatsuList', 'shukatsuListFull'].forEach(function(id){
      var el = document.getElementById(id);
      if (!el || el.getAttribute('data-hid')) return;
      el.setAttribute('data-hid', '1');
      el.innerHTML = '';
      // トップページ側はセクションごと隠す（もっと見るの導線も消す）
      if (id === 'shukatsuList'){
        var sec = el.parentElement;
        for (var i = 0; i < 4 && sec; i++){
          if (/終活・供養/.test(sec.textContent || '')){ sec.style.display = 'none'; break; }
          sec = sec.parentElement;
        }
      } else {
        el.innerHTML = '<div style="padding:48px 20px;text-align:center;color:#8a8378;'
          + 'font-size:13px;line-height:2">'
          + 'このページは準備中です。<br>信頼できる提携先が決まりしだい公開いたします。</div>';
      }
    });
  }

  function run(){
    try { paintSeasons(); paintGoods(); hideShukatsu(); } catch(e){}
    // 写真はGoogleマップの読み込みを待って何度か取りに行く
    try {
      ['seasonList', 'seasonListFull'].forEach(function(id){
        var el = document.getElementById(id);
        if (el && el.querySelector('[data-ph]:not([data-done])')) fillPhotos(el);
      });
    } catch(e){}
  }
  run();
  setInterval(run, 800);
})();


/* ══════════════════════════════════════════════════════════════
   わびなび：みんなの投稿の「絞り込み ⚙」を検索窓に変更
   投稿者名・神社名・地名・本文で探せるようにする
   （2026-07-31 / index.html は触らず concierge.js から上書き）
   ══════════════════════════════════════════════════════════════ */
(function(){
  if (window.__wabiFeedSearch) return;
  window.__wabiFeedSearch = true;

  var css = document.createElement('style');
  css.textContent = [
    '.wfs{display:flex;align-items:center;gap:8px;background:#fff;border:1px solid #E7E1D6;',
      'border-radius:999px;padding:9px 14px;margin:0 0 12px;box-shadow:0 4px 14px rgba(0,0,0,.04);}',
    '.wfs svg{flex:0 0 16px;opacity:.45;}',
    ".wfs input{flex:1;border:none;outline:none;background:transparent;font-family:'Noto Serif JP',serif;",
      'font-size:13.5px;color:#2D2D2D;min-width:0;}',
    '.wfs input::placeholder{color:#b3aca0;}',
    '.wfs .x{flex:0 0 auto;width:18px;height:18px;border-radius:50%;background:#eee7db;color:#8a8378;',
      'display:none;align-items:center;justify-content:center;font-size:11px;cursor:pointer;}',
    '.wfs .x.on{display:flex;}',
    ".wfs-hit{font-size:11.5px;color:#8a8378;margin:-6px 0 10px 4px;font-family:'Noto Serif JP',serif;}"
  ].join('');
  document.head.appendChild(css);

  var ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="#2D2D2D" stroke-width="1.8">'
    + '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5" stroke-linecap="round"/></svg>';

  var keyword = '';

  function norm(s){
    return String(s || '').toLowerCase()
      .replace(/[ぁ-ん]/g, function(c){ return String.fromCharCode(c.charCodeAt(0) + 0x60); })
      .replace(/[\s　]/g, '');
  }

  function apply(){
    var pg = document.getElementById('wabiFeedPg');
    if (!pg) return;
    var cards = pg.querySelectorAll('.wfd-card');
    if (!cards.length) return;
    var q = norm(keyword);
    var hit = 0;
    cards.forEach(function(c){
      if (!q){ c.style.display = ''; hit++; return; }
      var t = norm(c.textContent);
      var ok = t.indexOf(q) >= 0;
      c.style.display = ok ? '' : 'none';
      if (ok) hit++;
    });
    var lbl = pg.querySelector('.wfs-hit');
    if (lbl){
      lbl.textContent = q ? ('「' + keyword + '」の検索結果 ' + hit + '件') : '';
      lbl.style.display = q ? 'block' : 'none';
    }
    var empty = pg.querySelector('.wfd-empty-search');
    if (q && hit === 0){
      if (!empty){
        empty = document.createElement('div');
        empty.className = 'wfd-empty wfd-empty-search';
        empty.innerHTML = '見つかりませんでした。<br>神社名・お寺名・投稿者名でお試しください。';
        var g = pg.querySelector('.wfd-g');
        if (g) g.parentNode.insertBefore(empty, g.nextSibling);
      }
      empty.style.display = 'block';
    } else if (empty){
      empty.style.display = 'none';
    }
  }

  function build(){
    var pg = document.getElementById('wabiFeedPg');
    if (!pg) return;
    var bar = pg.querySelector('.wfd-bar');
    if (!bar) return;

    // 「絞り込み ⚙」を消す
    var fi = pg.querySelector('#wfdFilter');
    if (fi) fi.style.display = 'none';

    if (!pg.querySelector('.wfs')){
      var box = document.createElement('div');
      box.className = 'wfs';
      box.innerHTML = ICON
        + '<input type="search" placeholder="神社名・投稿者名で検索" autocomplete="off">'
        + '<span class="x">✕</span>';
      bar.parentNode.insertBefore(box, bar);

      var lbl = document.createElement('div');
      lbl.className = 'wfs-hit';
      lbl.style.display = 'none';
      bar.parentNode.insertBefore(lbl, bar.nextSibling);

      var inp = box.querySelector('input');
      var clr = box.querySelector('.x');
      inp.value = keyword;
      clr.classList.toggle('on', !!keyword);

      var t = null;
      inp.addEventListener('input', function(){
        keyword = inp.value.trim();
        clr.classList.toggle('on', !!keyword);
        clearTimeout(t);
        t = setTimeout(apply, 160);
      });
      inp.addEventListener('keydown', function(e){
        if (e.key === 'Enter'){ e.preventDefault(); inp.blur(); apply(); }
      });
      clr.onclick = function(){
        keyword = ''; inp.value = ''; clr.classList.remove('on'); apply(); inp.focus();
      };
    }
    apply();
  }

  setInterval(build, 700);
  build();
})();


/* ══════════════════════════════════════════════════════════════
   わびなび：記事ページの見え方を整える
   ① 記事一覧のサムネイル写真が出ないのを直す
   ② 記事末尾「まとめ」の文字が薄くて読めないのを直す
   ③ その下の赤い「記事一覧へ戻る」ボタンを消す
   （2026-07-31 / index.html は触らず concierge.js から上書き）
   ══════════════════════════════════════════════════════════════ */
(function(){
  if (window.__wabiArtFix) return;
  window.__wabiArtFix = true;

  var css = document.createElement('style');
  css.textContent = [
    /* ① サムネイルは写真を敷き詰めて表示 */
    '.art-thumb{position:relative;overflow:hidden;}',
    '.art-thumb img{width:100%;height:100%;object-fit:cover;display:block;}',
    '.art-thumb img[src]{display:block !important;}',

    /* ② まとめは元の意図どおり濃い茶色の箱に */
    '#pgArticleDetail .summary{background:#4a3728 !important;color:#faf8f5 !important;',
      'padding:24px 22px !important;border-radius:16px !important;margin:32px 0 8px !important;line-height:2;}',
    '#pgArticleDetail .summary h2{color:#f3ead9 !important;border-left:3px solid #c9a24a !important;',
      'padding-left:12px !important;margin:0 0 10px !important;font-size:17px !important;}',
    '#pgArticleDetail .summary p,#pgArticleDetail .summary li{color:#f6f0e6 !important;font-size:14px !important;}',

    /* ③ 赤い「記事一覧へ戻る」は消す（左上の「‹ 記事」で戻れる） */
    '#pgArticleDetail .ext-btn{display:none !important;}'
  ].join('');
  document.head.appendChild(css);

  /* Wikimediaの写真は「1280px」でないと404になるので直す */
  function fixSize(u){
    return (typeof u === 'string' && u.indexOf('upload.wikimedia.org') >= 0)
      ? u.replace(/\/\d+px-/, '/1280px-') : u;
  }
  function run(){
    try {
      if (typeof ARTICLES !== 'undefined' && Array.isArray(ARTICLES)){
        ARTICLES.forEach(function(a){ if (a && a.img) a.img = fixSize(a.img); });
      }
    } catch(e){}
    document.querySelectorAll('.art-thumb img, #pgArticleDetail img').forEach(function(im){
      var s = im.getAttribute('src') || '';
      var f = fixSize(s);
      if (f !== s){ im.setAttribute('src', f); im.style.display = ''; }
      // 一度エラーで隠された写真をもう一度出す
      if (im.style.display === 'none' && im.naturalWidth > 0) im.style.display = '';
    });
    // 写真が出たら「寺院」などの文字プレースホルダは隠す
    document.querySelectorAll('.art-thumb').forEach(function(th){
      var im = th.querySelector('img'), ph = th.querySelector('.art-thumb-ph');
      if (im && ph) ph.style.display = (im.naturalWidth > 0) ? 'none' : '';
    });
  }
  run();
  setInterval(run, 900);
})();


/* ══════════════════════════════════════════════════════════════
   わびなび：友達に紹介ページの上半分をリデザイン
   （円相の下地・大きなEXP表示・LINEボタン。「または」より下は据え置き）
   （2026-07-31 / index.html は触らず concierge.js から上書き）
   ══════════════════════════════════════════════════════════════ */
(function(){
  if (window.__wabiInviteSkin) return;
  window.__wabiInviteSkin = true;

  // 円相（一筆書きの丸）— 背景にうっすら敷く
  var ENSO = "data:image/svg+xml;utf8," + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">' +
    '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">' +
    '<stop offset="0%" stop-color="#EFE3C6"/><stop offset="55%" stop-color="#E6D7B4"/>' +
    '<stop offset="100%" stop-color="#F4EBD8"/></linearGradient></defs>' +
    '<path d="M290 78 C 236 40, 150 44, 102 96 C 48 154, 48 250, 104 305 ' +
    'C 160 360, 258 356, 308 298 C 352 247, 352 168, 306 120" ' +
    'fill="none" stroke="url(#g)" stroke-width="17" stroke-linecap="round"/>' +
    '</svg>');

  // 下地の小さな金の粒
  var DOTS = "data:image/svg+xml;utf8," + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">' +
    '<g fill="#E3D2A8" opacity="0.75">' +
    '<circle cx="18" cy="152" r="3.2"/><circle cx="34" cy="170" r="2.2"/>' +
    '<circle cx="10" cy="178" r="1.8"/><circle cx="46" cy="150" r="1.6"/>' +
    '<circle cx="28" cy="140" r="1.4"/><circle cx="182" cy="150" r="3"/>' +
    '<circle cx="168" cy="168" r="2"/><circle cx="190" cy="174" r="1.6"/>' +
    '<circle cx="160" cy="146" r="1.5"/>' +
    '</g></svg>');

  var css = document.createElement('style');
  css.textContent = [
    /* ── 紹介カード（円相の下地つき）───────────────────────── */
    '#wxInvite .iv-card{position:relative;overflow:hidden;text-align:center;',
      'background:#FBF8F0;border:1px solid #F1E8D6;border-radius:28px;',
      'padding:54px 24px 46px;margin:6px 0 26px;',
      'box-shadow:0 10px 30px rgba(120,100,60,.07);}',
    '#wxInvite .iv-card::before{content:"";position:absolute;left:50%;top:50%;',
      'transform:translate(-50%,-50%);width:min(88%,340px);aspect-ratio:1;',
      'background:url("' + ENSO + '") center/contain no-repeat;opacity:.85;pointer-events:none;}',
    '#wxInvite .iv-card::after{content:"";position:absolute;inset:0;',
      'background:url("' + DOTS + '") center/100% 100% no-repeat;pointer-events:none;}',
    '#wxInvite .iv-card > *{position:relative;z-index:1;}',

    /* 見出し */
    "#wxInvite .iv-h{font-family:'Shippori Mincho','Noto Serif JP',serif;",
      'font-size:23px;font-weight:700;letter-spacing:.04em;color:#2D2D2D;margin:0 0 26px;line-height:1.5;}',

    /* ＋300 EXP */
    "#wxInvite .iv-exp{font-family:'Shippori Mincho',serif;color:#5D3A7A;",
      'font-size:62px;font-weight:800;line-height:1;letter-spacing:-.01em;margin:0;}',
    '#wxInvite .iv-exp small{font-size:24px;font-weight:700;margin-left:5px;letter-spacing:.02em;}',
    "#wxInvite .iv-cap{font-family:'Shippori Mincho',serif;font-size:14.5px;color:#4a4340;margin-top:16px;}",

    /* 区切り線 */
    '#wxInvite .iv-line{width:58%;max-width:230px;height:1px;margin:26px auto;border:0;',
      'background:linear-gradient(90deg,rgba(201,162,74,0),#C9A24A,rgba(201,162,74,0));}',

    /* ＋100 EXP */
    "#wxInvite .iv-sub{font-family:'Shippori Mincho',serif;font-size:16px;color:#3f3a36;margin-bottom:12px;}",
    "#wxInvite .iv-exp2{font-family:'Shippori Mincho',serif;color:#C9A24A;",
      'font-size:44px;font-weight:800;line-height:1;margin:0;}',
    '#wxInvite .iv-exp2 small{font-size:19px;font-weight:700;margin-left:4px;}',
    "#wxInvite .iv-note{font-family:'Shippori Mincho',serif;font-size:13px;color:#6b635c;",
      'line-height:2;margin-top:16px;}',

    /* LINEボタン */
    '#wxInvite .iv-linebtn{display:flex;align-items:center;justify-content:center;gap:12px;',
      'width:100%;height:60px;border:none;border-radius:16px;background:#06C755;color:#fff;',
      "font-family:'Shippori Mincho',serif;font-size:17px;font-weight:700;letter-spacing:.08em;",
      'cursor:pointer;box-shadow:0 8px 22px rgba(6,199,85,.28);}',
    '#wxInvite .iv-linebtn:active{transform:scale(.99);opacity:.93;}',
    '#wxInvite .iv-linebtn svg{width:26px;height:26px;}',

    /* 「または」まわりの余白 */
    '#wxInvite .iv-or{margin-top:22px;}'
  ].join('');
  document.head.appendChild(css);
})();


/* ══════════════════════════════════════════════════════════════
   わびなび：一覧ページの下に余白／セクション名の変更
   ① 一覧の最後のカードが下部メニューに隠れないよう余白を足す
   ② 「季節の行事・ライトアップ」→「この時期おすすめイベント」
   （2026-07-31 / index.html は触らず concierge.js から上書き）
   ══════════════════════════════════════════════════════════════ */
(function(){
  if (window.__wabiBottomPad) return;
  window.__wabiBottomPad = true;

  var PAD = 'calc(124px + env(safe-area-inset-bottom))';

  var css = document.createElement('style');
  css.textContent = [
    /* ① 各一覧ページの中身に下余白（下部メニュー＋ひと呼吸ぶん） */
    '#pgArticleList .ovl-cont,#pgSeasonList .ovl-cont,#pgEcList .ovl-cont,',
    '#pgTourList .ovl-cont,#pgOsupplyList .ovl-cont,#pgShukatsuList .ovl-cont,',
    '#pgAreaSearch .ovl-cont,#pgThemeDetail .ovl-cont{',
      'padding-bottom:' + PAD + ' !important;}',

    /* テーマで巡るベスト10 の詳細ページ */
    '#pgThemeDetail{padding-bottom:' + PAD + ' !important;}',
    '#wcTheme,#wcThemeBody{padding-bottom:' + PAD + ' !important;}',

    /* 念のため、一覧系の最後の要素にも余白 */
    '#pgArticleList .art-item:last-child,#pgSeasonList .wev-card:last-child{margin-bottom:10px;}',

    /* テーマ一覧（トップの横並び）も下が詰まらないように */
    '#themeGrid{padding-bottom:6px;}'
  ].join('');
  document.head.appendChild(css);

  /* ② セクション名の変更 */
  var OLD = '季節の行事・ライトアップ';
  var NEW = 'この時期おすすめイベント';
  // アイコン（svg）が中に入っている見出しもあるので、
  // 要素まるごとではなく「文字の部分」だけを書き換える
  function swapText(root){
    var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    var n;
    while ((n = w.nextNode())){
      if (n.nodeValue && n.nodeValue.indexOf(OLD) >= 0){
        n.nodeValue = n.nodeValue.split(OLD).join(NEW);
      }
    }
  }
  function rename(){
    document.querySelectorAll('.home-sec-tit,.ovl-tit,.sec-tit,.wlp-ttl,h1,h2,h3').forEach(function(el){
      if (el.textContent.indexOf(OLD) >= 0) swapText(el);
    });
    // ページ見出し（戻るボタンの隣など）
    ['pgSeasonList'].forEach(function(id){
      var pg = document.getElementById(id);
      if (pg && pg.textContent.indexOf(OLD) >= 0) swapText(pg);
    });
  }
  rename();
  setInterval(rename, 800);

  /* スクロールできる高さが足りているか、開いたときに念のため確かめる */
  function ensure(){
    ['pgArticleList','pgSeasonList','pgEcList','pgTourList','pgOsupplyList','pgThemeDetail'].forEach(function(id){
      var pg = document.getElementById(id);
      if (!pg || getComputedStyle(pg).display === 'none') return;
      var c = pg.querySelector('.ovl-cont') || pg;
      if (c.style.paddingBottom.indexOf('124px') < 0) c.style.paddingBottom = PAD;
    });
  }
  setInterval(ensure, 900);
})();


/* ══════════════════════════════════════════════════════════════
   わびなび：テーマで巡るベスト10 を記事ページに
   ・1位〜4位／5位〜と2ページに分ける
   ・各順位に実写を1枚ずつ（写真はウィキメディア・コモンズ）
   （2026-07-31 / index.html は触らず concierge.js から上書き）
   ══════════════════════════════════════════════════════════════ */
(function(){
  if (window.__wabiThemeRank) return;
  window.__wabiThemeRank = true;

  function esc(s){
    return String(s == null ? '' : s)
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }
  var W = 'https://upload.wikimedia.org/wikipedia/commons/thumb/';
  function wiki(dir, file){
    var f = encodeURIComponent(file);
    return W + dir + '/' + f + '/1280px-' + f;
  }

  /* ── テーマA：一生に一度は見たい！圧巻の仏像・大仏 ─────────── */
  var THEME_A = {
    id: 'A',
    title: '一生に一度は見たい！圧巻の仏像・大仏',
    lead: '見上げるほどの大仏から、そっと微笑む半跏思惟像まで。'
        + '日本各地には、一度は間近で向き合いたい仏像が静かに佇んでいます。'
        + 'スケールの大きさ、彫刻としての美しさ、そして向き合ったときの心の動き——'
        + 'その三つを軸に選んだ、珠玉のランキングをご紹介します。',
    hero: 'https://upload.wikimedia.org/wikipedia/commons/7/7a/Daibutsu_of_Todaiji_4.jpg',
    heroCap: '東大寺 盧舎那仏坐像（奈良の大仏）',
    items: [
      { rank:1, name:'東大寺', yomi:'とうだいじ', area:'奈良県奈良市',
        season:'春（桜）、秋（紅葉）',
        access:'近鉄奈良駅から徒歩約20分、またはバスで約5分',
        see:'圧倒的スケールを誇る盧舎那仏（奈良の大仏）と南大門の金剛力士立像',
        goshuin:'「華厳」などの力強い墨書きと朱印を大仏殿内で授与',
        photo: wiki('a/a7', '東大寺_大仏殿（2024年）.jpg'),
        cap:'東大寺 大仏殿',
        text:'日本の仏教美術を象徴する奈良・東大寺。見上げるほど巨大な「奈良の大仏」こと盧舎那仏坐像は高さ約15メートルにも及び、見る者を圧倒するスケールと慈愛に満ちた表情で鎮座しています。大仏殿は世界最大級の木造建築であり、その空間に身を置くだけで悠久の歴史と静かなパワーを感じられるはずです。南大門に立つ大迫力の阿吽の金剛力士立像など、国宝級の彫刻も必見。一生に一度は間近で体感したい、日本が誇る仏像の最高峰と言える歴史的寺院です。' },

      { rank:2, name:'高徳院', yomi:'こうとくいん', area:'神奈川県鎌倉市',
        season:'秋（紅葉）、初夏（新緑）',
        access:'江ノ島電鉄・長谷駅から徒歩約7分',
        see:'青空の下に鎮座する阿弥陀如来坐像（鎌倉大仏）の美しいお姿',
        goshuin:'「阿弥陀如来」の流麗な墨書きと大仏様の印',
        photo: wiki('b/b6', '230128_Kamakura_Daibutsu_Japan01s3.jpg'),
        cap:'高徳院 鎌倉大仏',
        text:'鎌倉のシンボルとして親しまれる高徳院の「鎌倉大仏」。像高約11.3メートル、重量約121トンの阿弥陀如来坐像で、国宝に指定されています。奈良の大仏とは異なり、露座（屋根のない屋外）に鎮座しているのが最大の特徴です。青空や夕焼け、季節の木々を背景にたたずむお姿は、自然と調和した比類なき美しさを放っています。胎内拝観も可能で、高度な鋳造技術を内側から見学できるのも魅力。静かな鎌倉の空気と共に、心安らぐ仏様の慈悲を感じてください。' },

      { rank:3, name:'興福寺', yomi:'こうふくじ', area:'奈良県奈良市',
        season:'通年（国宝館は屋内展示のため天候問わずおすすめ）',
        access:'近鉄奈良駅から徒歩約5分',
        see:'憂いを帯びた美少年の表情で魅了する国宝・阿修羅像',
        goshuin:'「令興福力」など複数種類を勧進所で授与',
        photo: wiki('7/77', 'Kofukuji12st5s3200.jpg'),
        cap:'興福寺 五重塔と東金堂',
        text:'藤原氏の氏寺として栄えた古都奈良の名刹、興福寺。ここで必見なのが、国宝館に安置されている「阿修羅像」です。三つの顔と六つの腕を持つ異形の神でありながら、どこか憂いを帯びた少年のような繊細な表情は、見る者の心を強く惹きつけて離しません。天平時代の最高傑作とも称され、全国に熱狂的なファンを持つ仏像です。他にも千手観音菩薩立像や金剛力士立像など、仏教彫刻の宝庫。歴史の重みと芸術性の高さに、時間を忘れて魅入ってしまうこと間違いなしです。' },

      { rank:4, name:'三十三間堂（蓮華王院）', yomi:'さんじゅうさんげんどう', area:'京都府京都市',
        season:'通年（冬の静かな時期も趣があります）',
        access:'京阪本線・七条駅から徒歩約7分',
        see:'圧巻！1001体の千手観音立像と、巨大な千手観音坐像',
        goshuin:'「大悲殿」の力強い墨書きを堂内で授与',
        photo: wiki('a/a5', 'Sanjusangendo_2022.jpg'),
        cap:'三十三間堂（蓮華王院 本堂）',
        text:'全長約120メートルのお堂の中に、金色の仏像がズラリと並ぶ京都の三十三間堂。堂内に入った瞬間、目の前に広がる1001体もの千手観音立像群はまさに圧巻の一言です。「仏像の森」とも呼べる壮大なスケールと黄金の輝きは、極楽浄土を思わせる神秘的な空間を作り出しています。中央には巨像である千手観音坐像（国宝）が鎮座し、その前を風神・雷神像や二十八部衆立像が守護しています。「会いたい人に似た像が必ずある」と言い伝えられる、奇跡のような空間です。' },

      { rank:5, name:'平等院', yomi:'びょうどういん', area:'京都府宇治市',
        season:'春（藤の花）、秋（紅葉）',
        access:'JR・京阪宇治駅から徒歩約10分',
        see:'極楽浄土を体現した鳳凰堂と、定朝作の阿弥陀如来坐像',
        goshuin:'「阿弥陀如来」「鳳凰堂」などを集印所で授与',
        photo: wiki('b/ba', 'Phoenix_Hall_in_Byodo-in_Temple,_Ujirenge_Uji_city_2026.jpg'),
        cap:'平等院 鳳凰堂',
        text:'10円玉のデザインとしてもお馴染みの京都・宇治の平等院。池の中島に建つ優美な鳳凰堂は、平安時代の貴族が夢見た極楽浄土を見事に具現化しています。その堂内中央に鎮座するのが、平安時代を代表する仏師・定朝（じょうちょう）の確実な遺作である国宝「阿弥陀如来坐像」です。丸みを帯びた優和な表情と流れるような衣のひだは、日本の仏像彫刻の完成形とも言われる美しさ。極上の癒しと芸術性を堪能できる至高の空間です。' },

      { rank:6, name:'広隆寺', yomi:'こうりゅうじ', area:'京都府京都市',
        season:'通年（静かに鑑賞できる平日がおすすめ）',
        access:'嵐電・太秦広隆寺駅すぐ',
        see:'日本の彫刻として初の国宝指定。微笑みを浮かべる弥勒菩薩半跏思惟像',
        goshuin:'「弥勒尊」の流れるような筆致を授与所で授与',
        photo: wiki('a/ad', 'Kouryuji_Taishiden.jpg'),
        cap:'広隆寺 太子殿',
        text:'聖徳太子建立の日本最古の寺の一つと言われる京都の広隆寺。霊宝殿に安置されている「弥勒菩薩半跏思惟像」は、国宝第1号に指定されたことで知られる日本仏教美術の至宝です。右足を左膝に乗せ、右手でそっと頬杖をついて思索にふけるお姿は、優美そのもの。口元に浮かべた「アルカイックスマイル（古典的微笑）」と呼ばれる謎めいた微笑みは、すべての悩みを包み込んでくれるような優しさに溢れています。心静かに向き合いたい仏様です。' },

      { rank:7, name:'牛久大仏', yomi:'うしくだいぶつ', area:'茨城県牛久市',
        season:'春（桜や芝桜の季節）、秋（コスモス）',
        access:'JR常磐線・牛久駅からバスで約30分',
        see:'ギネス世界記録認定！高さ120mの青銅製立像の圧倒的巨大さ',
        goshuin:'「光雲無碍」など複数種類を大仏胎内などで授与',
        photo: wiki('0/01', 'Ushiku_Daibutsu_-_Great_Buddha_in_Japan.jpg'),
        cap:'牛久大仏',
        text:'遠くからでもその巨大さに度肝を抜かれる茨城県の牛久大仏。全高120メートル（像高100メートル、台座20メートル）を誇り、「青銅製立像」としてはギネス世界記録に認定されている世界最大級の大仏です。奈良の大仏が手のひらに乗ってしまうほどのスケールは、まさに現代の奇跡。大仏様の胎内に入ることもでき、エレベーターで地上85メートルの展望窓まで登れば、関東平野を一望できます。足元の広大な庭園には季節の花々が咲き誇り、大仏様との美しいコントラストを楽しめます。' },

      { rank:8, name:'中宮寺', yomi:'ちゅうぐうじ', area:'奈良県生駒郡斑鳩町',
        season:'春（山吹の季節）、秋（斑鳩の里の紅葉）',
        access:'JR法隆寺駅からバスで約5分、「法隆寺前」下車徒歩約8分',
        see:'スフィンクス、モナ・リザと並ぶ「世界三大微笑像」菩薩半跏像',
        goshuin:'「如意輪観音」の繊細で美しい墨書き',
        photo: wiki('4/44', 'Chuguji_Hondo_2008.jpg'),
        cap:'中宮寺 本堂',
        text:'法隆寺に隣接する尼寺、中宮寺。こちらに安置されている国宝「菩薩半跏像（伝如意輪観音）」は、エジプトのスフィンクス、レオナルド・ダ・ヴィンチのモナ・リザと並び、「世界三大微笑像」とも称される傑作です。黒光りするしなやかなお体と、右足を左膝に乗せて静かに微笑むお姿は、飛鳥時代の彫刻の最高峰。人々をいかにして救おうかと深い思索にふけりながらも、どこか優しく親しみやすい雰囲気を漂わせています。仏様と1対1で向き合えるような親密な時間が流れます。' },

      { rank:9, name:'日本寺', yomi:'にほんじ', area:'千葉県安房郡鋸南町',
        season:'春〜秋（ハイキングに最適な気候の時期）',
        access:'JR内房線・保田駅から徒歩約45分、または車で約10分、ロープウェイ利用も可',
        see:'磨崖仏としては日本最大！岩肌に彫られた大迫力の「薬師瑠璃光如来」',
        goshuin:'「薬師如来」の力強い墨書きと印',
        photo: wiki('3/32', 'Nihonji_Buddha.JPG'),
        cap:'鋸山 日本寺大仏（薬師瑠璃光如来）',
        text:'千葉県の鋸山（のこぎりやま）の広大な斜面に境内が広がる日本寺。ハイキングコースとしても人気のこの山中に鎮座するのが、総高31メートルを誇る「日本寺大仏（薬師瑠璃光如来）」です。奈良や鎌倉の大仏を凌ぐ大きさであり、自然の岩肌を彫り抜いて作られた磨崖仏（まがいぶつ）としては日本最大級のスケール。大自然に溶け込むように座すそのお姿は、圧倒的な存在感と野趣あふれる迫力に満ちています。境内には1500体もの羅漢像が並ぶ「千五百羅漢」もあり、見どころ満載のお寺です。' }
    ]
  };


  /* ── テーマD：本気で人生を変える！全国・最強金運アップ寺社 ───── */
  var THEME_D = {
    id: 'D',
    title: '本気で人生を変える！全国・最強金運アップ寺社',
    lead: 'お金を洗えば何倍にもなって還ってくるという霊水、黄金に輝く鳥居、'
        + '宝くじの高額当選者が続出した島の社——。'
        + '日本各地には、財運を願う人々が全国から足を運ぶ「金運の聖地」があります。'
        + 'ご利益の伝承、参拝者の多さ、そして境内に流れる空気の力強さ。'
        + 'その三つを軸に選んだ、本気で人生を変えたい方のためのランキングです。',
    hero: 'https://upload.wikimedia.org/wikipedia/commons/0/0b/Mikane_jinja.jpg',
    heroCap: '御金神社 黄金の鳥居（京都市中京区）',
    items: [
      { rank:1, name:'新屋山神社', yomi:'あらややまじんじゃ', area:'山梨県富士吉田市',
        season:'5月〜11月（奥宮への林道が通行可能な時期）',
        access:'富士山駅から車で約10分（奥宮へはさらに車で約30分）',
        see:'富士山の強力なエネルギーが満ちる本宮と、神秘的な奥宮',
        goshuin:'富士山の印が押された、力強くご利益を感じるデザイン',
        photo:'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/A_Torii_of_Araya_yama_shrine_Okuno_Inn.jpg/1280px-A_Torii_of_Araya_yama_shrine_Okuno_Inn.jpg',
        cap:'新屋山神社 奥宮の鳥居',
        text:'「日本三大金運神社」の筆頭として、全国の経営者や投資家がこぞって足を運ぶ最強の金運パワースポットです。富士山麓の豊かな自然に抱かれた本宮はもちろんのこと、富士山2合目に位置する奥宮はさらに強力な磁場を持つとされ、本気で人生を変えたい、財力を高めたいと願う人々に絶大な支持を得ています。清らかな山の空気を深呼吸しながら参拝すれば、金運上昇への強力な後押しを実感できるはずです。' },

      { rank:2, name:'銭洗弁財天 宇賀福神社', yomi:'ぜにあらいべんざいてん うがふくじんじゃ', area:'神奈川県鎌倉市',
        season:'巳の日、特に己巳（つちのとみ）の日',
        access:'鎌倉駅から徒歩約25分',
        see:'洞窟内に湧き出る「銭洗水」と神秘的な境内',
        goshuin:'シンプルながらも歴史を感じる墨書きと朱印',
        photo:'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Zeniaraibenzaiten_Ugafuku-Shrine_01.jpg/1280px-Zeniaraibenzaiten_Ugafuku-Shrine_01.jpg',
        cap:'銭洗弁財天 宇賀福神社 参道の洞窟',
        text:'鎌倉の急な坂道を登り、トンネルを抜けた先に広がる異空間。境内の洞窟内に湧き出る霊水「銭洗水」でお金を洗うと、何倍にもなって還ってくると言い伝えられています。ザルに硬貨や紙幣を入れて清める体験は、お金への執着や心の厄を洗い流すような清々しさがあります。宝くじの高額当選祈願や商売繁盛を願って、全国から参拝者が絶えません。洗ったお金は有意義に使うことで、さらなる金運を引き寄せるとされています。' },

      { rank:3, name:'御金神社', yomi:'みかねじんじゃ', area:'京都府京都市中京区',
        season:'通年（お正月は特に多くの参拝者で賑わいます）',
        access:'地下鉄・烏丸御池駅から徒歩約5分',
        see:'住宅街に突如現れる、黄金に輝く見事な鳥居',
        goshuin:'金色の文字で「金」と書かれたインパクト抜群のデザイン',
        photo:'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Mikane_jinja_03.jpg/1280px-Mikane_jinja_03.jpg',
        cap:'御金神社 拝殿とイチョウ型の絵馬',
        text:'京都の閑静な住宅街に突如として現れる、黄金に輝く鳥居が目印の御金神社。金属全般の神様である金山毘古命（かなやまひこのみこと）をお祀りしており、通貨＝お金の神様として絶大な人気を集めています。境内には、宝くじ当選や資産運用成功、借金完済など、切実な願いが書かれたイチョウ型の絵馬がびっしり。お守りや御朱印も金色づくしで、参拝するだけで気分が明るくなり、金運が爆発的にアップしそうなパワーに満ちています。' },

      { rank:4, name:'小網神社', yomi:'こあみじんじゃ', area:'東京都中央区',
        season:'通年（毎年11月の「どぶろく祭」もおすすめ）',
        access:'日比谷線・人形町駅から徒歩約5分',
        see:'強運厄除けのシンボル「昇り龍・降り龍」の精巧な彫刻',
        goshuin:'力強い筆致と、福禄寿などの縁起の良い印',
        photo:'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Koami_jinja.jpg/1280px-Koami_jinja.jpg',
        cap:'小網神社 社殿',
        text:'ビル群の谷間にひっそりと鎮座しながら、連日行列が絶えない東京屈指のパワースポット。「強運厄除けの神様」として知られ、第二次世界大戦時の戦災を免れた奇跡の神社です。境内にある「東京銭洗い弁天」の水でお金を清めて財布に収めると、財運を授かると言われています。社殿に彫られた「昇り龍・降り龍」は見事で、強運を引き寄せるパワーの源。投資家やビジネスマンがこぞって訪れる、小さくも最強の金運神社です。' },

      { rank:5, name:'金持神社', yomi:'かもちじんじゃ', area:'鳥取県日野郡日野町',
        season:'通年',
        access:'JR根雨駅からタクシーで約10分',
        see:'豊かな自然に囲まれた静寂な境内と、縁起の良い名前',
        goshuin:'「金持神社」の文字が光る、大変縁起の良い御朱印',
        photo:'https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Kamochi_Jinja.jpg/1280px-Kamochi_Jinja.jpg',
        cap:'金持神社 参道の石段',
        text:'その名の通り「金運が上がる」として全国から参拝者が殺到する鳥取県の金持神社。古くから鉄の産地であったこの地で、「金（鉄）を持つ」という意味から名付けられました。社務所には、「宝くじで高額当選しました」「事業が軌道に乗りました」といったお礼参りの絵馬が数多く奉納されており、そのご利益は本物と噂されています。豊かな自然のエネルギーを吸収しながら、本気で財運アップを祈願したい方にぴったりの聖地です。' },

      { rank:6, name:'聖神社', yomi:'ひじりじんじゃ', area:'埼玉県秩父市',
        season:'通年',
        access:'秩父鉄道・和銅黒谷駅から徒歩約5分',
        see:'日本初の流通貨幣「和同開珎」の巨大なモニュメント',
        goshuin:'和同開珎のスタンプが押された金運祈願の御朱印',
        photo:'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/%E8%81%96%E7%A5%9E%E7%A4%BE%E3%81%AE%E6%8B%9D%E6%AE%BF%E5%89%8D.JPG/1280px-%E8%81%96%E7%A5%9E%E7%A4%BE%E3%81%AE%E6%8B%9D%E6%AE%BF%E5%89%8D.JPG',
        cap:'聖神社 社殿と和同開珎',
        text:'「銭神様」と呼ばれ親しまれる埼玉県の聖神社。この地で和銅が採掘され、日本初の流通貨幣「和同開珎」が造られたことに由来する、お金に非常に縁の深い神社です。境内のすぐ近くには巨大な和同開珎のモニュメントがあり、絶好の写真スポットになっています。宝くじ当選やギャンブル運向上、ビジネスの成功などを願う参拝者で賑わい、黄色いハンカチに願い事を書いて奉納するユニークな祈願方法も人気を集めています。' },

      { rank:7, name:'宝当神社', yomi:'ほうとうじんじゃ', area:'佐賀県唐津市（高島）',
        season:'通年',
        access:'唐津駅から徒歩で宝当桟橋へ、そこから定期船で約10分',
        see:'のどかな島の風景と、島全体を包むポジティブな空気',
        goshuin:'「宝当」の文字が力強く書かれた縁起の良い御朱印',
        photo:'https://upload.wikimedia.org/wikipedia/commons/a/a5/Houtou_Shrine%2C_Saga%2C_Japan.jpg',
        cap:'宝当神社 参道（佐賀県唐津市 高島）',
        text:'唐津湾に浮かぶ人口数百人の小さな島、高島にある宝当神社。1990年代に参拝者の中から宝くじの高額当選者が続出したことで一躍全国区になりました。「宝が当たる」というストレートで縁起の良い名前から、現在も一攫千金を夢見る人々が船に乗って訪れます。島内には宝くじ売り場や開運グッズを扱うお店もあり、島全体が金運アップのテーマパークのような明るい雰囲気に包まれています。' },

      { rank:8, name:'鷲子山上神社', yomi:'とりのこさんしょうじんじゃ', area:'栃木県那須郡那珂川町／茨城県常陸大宮市',
        season:'秋（紅葉の季節）',
        access:'JR烏山駅からタクシーで約30分',
        see:'県境をまたぐ珍しい境内と、日本一巨大な「フクロウ像」',
        goshuin:'フクロウの可愛らしい印が押された特別な御朱印',
        photo:'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Torinoko_Sanjo_Shrine_06.jpg/1280px-Torinoko_Sanjo_Shrine_06.jpg',
        cap:'鷲子山上神社 楼門',
        text:'栃木県と茨城県の県境、標高470メートルの山頂に鎮座する神社。神様のお使いである「フクロウ」が境内の至る所に祀られており、「不苦労（苦労しない）」のご利益があるとされています。特に目を引くのが、日本最大級の巨大な黄金のフクロウ像。その柱を叩いて願い事をすると、金運や幸運が舞い込むと言われています。豊かな自然の中でハイキングを楽しみながら、苦労を払い、金運を呼び込むことができる心温まるパワースポットです。' },

      { rank:9, name:'金華山黄金山神社', yomi:'きんかさんこがねやまじんじゃ', area:'宮城県石巻市',
        season:'初夏〜秋（フェリーでの移動があるため気候の良い時期）',
        access:'石巻駅からバスで鮎川港へ、そこからフェリーで約20分',
        see:'島全体が神域という圧倒的なスケールと、神の使いである鹿',
        goshuin:'黄金山神社の力強い文字と、金華山の印',
        photo:'https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/Koganeyama-jinja_Haiden.jpg/1280px-Koganeyama-jinja_Haiden.jpg',
        cap:'金華山 黄金山神社 拝殿',
        text:'太平洋に浮かぶ孤島・金華山に鎮座し、「3年続けてお参りすれば一生お金に困らない」という有名な言い伝えがある東北屈指の霊場です。島全体が神域とされ、手つかずの大自然の中を神の使いである鹿たちが悠然と歩いています。アクセスは容易ではありませんが、船に乗って海を渡り、急な階段を登って本殿に辿り着いた時の達成感と清々しさは格別です。本気で金運を引き寄せたい人が、覚悟を持って訪れるべき最強の聖地です。' },

      { rank:10, name:'宝来宝来神社', yomi:'ほぎほぎじんじゃ', area:'熊本県阿蘇郡南阿蘇村',
        season:'通年',
        access:'南阿蘇鉄道・長陽駅からタクシーで約10分',
        see:'独特の雰囲気を持つ真っ赤な鳥居群と、御神体である巨大な「当銭岩」',
        goshuin:'無人のため、お札や開運グッズの自動販売機が設置されています',
        pq:'宝来宝来神社 南阿蘇',
        cap:'宝来宝来神社（熊本県南阿蘇村）',
        text:'熊本県の南阿蘇に位置する、知る人ぞ知る金運神社。重機で解体しようとしてもできなかった巨大な岩を御神体「当銭岩（とうせんいわ）」として祀ったところ、関わった人々に次々と宝くじの当選が舞い込んだという逸話があります。境内は独特のBGMが流れ、真っ赤な鳥居や奇抜なモニュメントが並ぶ非常にユニークな空間です。「ホギホギ」と呪文を唱えながら岩の周りを回る独自の参拝方法があり、強烈な個性とパワーで金運を刺激してくれます。' }
    ]
  };


  /* ── テーマE：悪縁を断ち良縁を結ぶ！縁切り＆縁結びスポット ───── */
  var THEME_E = {
    id: 'E',
    title: '悪縁を断ち良縁を結ぶ！縁切り＆縁結びスポット',
    lead: '断ちたい縁があるから、結びたい縁がある——。'
        + '形代で真っ白になった碑、神々が縁組を語らう社、静かな森の結社。'
        + '日本各地には、人生の結び目をほどき、また新しく結び直してくれる社寺があります。'
        + 'ご利益の伝承、参拝者の切実さ、そして境内に流れる清らかさ。'
        + 'その三つを軸に選んだランキングをご紹介します。',
    hero: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Yasui_Kompira-gu_Kyoto_Japan_paper_charm_sculpture.jpg/1280px-Yasui_Kompira-gu_Kyoto_Japan_paper_charm_sculpture.jpg',
    heroCap: '安井金比羅宮 縁切り縁結び碑（京都市東山区）',
    items: [
      { rank:1, name:'安井金比羅宮', yomi:'やすいこんぴらぐう', area:'京都府京都市東山区',
        season:'通年（早朝の静かな時間帯がおすすめ）',
        access:'京阪本線・祇園四条駅から徒歩約10分',
        see:'参拝者の形代で真っ白になった巨大な「縁切り縁結び碑」',
        goshuin:'宝船の印など、月替わりの美しい御朱印あり',
        photo:'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Yasui_Kompira-gu_Kyoto_Japan02s3.jpg/1280px-Yasui_Kompira-gu_Kyoto_Japan02s3.jpg',
        cap:'安井金比羅宮 社殿',
        text:'「悪縁を切り、良縁を結ぶ」ことで全国に名を轟かせる京都の強力なパワースポットです。境内中央にある高さ1.5m、幅3mの「縁切り縁結び碑（いし）」は、願いが書かれた形代（身代わりのお札）で覆い尽くされ、異様なほどの存在感を放ちます。形代を持ち、願いを念じながら穴を表から裏へくぐって悪縁を断ち、裏から表へくぐって良縁を結びます。恋愛だけでなく、病気、ギャンブル、職場の人間関係など、人生のあらゆる障害をリセットしたい方に最適です。' },

      { rank:2, name:'出雲大社', yomi:'いずもおおやしろ', area:'島根県出雲市',
        season:'神在月（旧暦10月・通常11月頃）',
        access:'一畑電車・出雲大社前駅から徒歩約5分',
        see:'神楽殿の巨大な大注連縄と、国宝に指定された荘厳な御本殿',
        goshuin:'「出雲大社」の威厳ある文字とシンプルな朱印',
        photo:'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/Haiden_of_Izumo-taisha-1.JPG/1280px-Haiden_of_Izumo-taisha-1.JPG',
        cap:'出雲大社 拝殿',
        text:'縁結びの神様「大国主大神（おおくにぬしのおおかみ）」をお祀りする、日本を代表する聖地。男女の縁はもちろん、仕事や友人など、人生を豊かにするあらゆる「良いご縁」を結んでくれるとされています。「二拝四拍手一拝」という独特の作法で祈りを捧げるのが特徴です。旧暦10月には全国の八百万の神々が出雲に集まり、人々の縁組について会議を開くと言われています。壮大な神話の世界に浸りながら、心静かに良縁を祈願できる特別な場所です。' },

      { rank:3, name:'東京大神宮', yomi:'とうきょうだいじんぐう', area:'東京都千代田区',
        season:'通年',
        access:'飯田橋駅から徒歩約5分',
        see:'ビル群の中に佇む清らかな境内と、豊富な縁結びのお守り',
        goshuin:'季節の花々が描かれた美しい台紙の御朱印も人気',
        photo:'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Tokyo_Daijingu_2019e.jpg/1280px-Tokyo_Daijingu_2019e.jpg',
        cap:'東京大神宮 社殿',
        text:'「東京のお伊勢さま」として親しまれ、都内随一の縁結びパワースポットとして女性に大人気の神社です。日本で初めて神前結婚式を行った神社でもあり、結びの働きを司る「造化の三神」が併せ祀られていることから、恋愛成就のご利益が非常に高いとされています。スズランをモチーフにしたお守りや、恋みくじなど、可愛らしくて気分が上がる授与品が豊富に揃っているのも魅力。都会の喧騒を忘れる清冽な空気の中で、新しい恋の始まりを祈願してみてはいかがでしょうか。' },

      { rank:4, name:'川越氷川神社', yomi:'かわごえひかわじんじゃ', area:'埼玉県川越市',
        season:'夏（縁むすび風鈴の時期）',
        access:'川越駅からバスで約10分',
        see:'境内を彩る風鈴や絵馬トンネル、鯛を釣り上げる「鯛みくじ」',
        goshuin:'季節の神事や祭事に合わせた彩り豊かな御朱印',
        photo:'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Kawagoe_Hikawa_Shrine%2C_Kawagoe_City%3B_December_2019_%2801%29.jpg/1280px-Kawagoe_Hikawa_Shrine%2C_Kawagoe_City%3B_December_2019_%2801%29.jpg',
        cap:'川越氷川神社 大鳥居',
        text:'二組の夫婦神と、その子孫である大己貴命（縁結びの神様）をお祀りしていることから、「家族円満・夫婦円満・縁結び」の神様として信仰を集める川越の古社。毎朝限定で頒布される「縁結び玉」は非常に人気があります。また、夏に開催される「縁むすび風鈴」は、境内に飾られた色鮮やかな風鈴が涼やかな音色を奏でる幻想的なイベントで、写真映えも抜群。良縁を願う絵馬のトンネルをくぐり、楽しみながら恋の運気を高められる神社です。' },

      { rank:5, name:'貴船神社', yomi:'きふねじんじゃ', area:'京都府京都市左京区',
        season:'夏（川床の時期）や秋（紅葉）、冬の雪景色',
        access:'叡山電車・貴船口駅からバスで約5分、下車後徒歩約5分',
        see:'石段沿いに並ぶ朱色の春日灯籠と、水に浮かべる「水占みくじ」',
        goshuin:'水の神様らしい、流麗で美しい墨書き',
        photo:'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/KTO2110-003_%2851778191219%29.jpg/1280px-KTO2110-003_%2851778191219%29.jpg',
        cap:'貴船神社 春日灯籠の並ぶ表参道',
        text:'京都の奥座敷、貴船山の豊かな自然に抱かれた古社。全国の水を司る神様をお祀りしていますが、中宮の「結社（ゆいのやしろ）」は、平安時代の女流歌人・和泉式部が夫との復縁を祈願して叶ったという逸話から、強力な縁結びの神様として知られています。本宮、結社、奥宮の順に参拝する「三社詣」を行うと願いが叶いやすいとされています。ご神水に浮かべると文字が浮き出る「水占みくじ」も大人気。神秘的な森の空気に心が洗われます。' },

      { rank:6, name:'縁切榎', yomi:'えんきりえのき', area:'東京都板橋区',
        season:'通年',
        access:'都営三田線・板橋本町駅から徒歩約5分',
        see:'住宅街の一角にひっそりと立つ榎の御神木と、無数の絵馬',
        goshuin:'神社ではないため御朱印はありません（近くのお蕎麦屋さんで絵馬を購入可能）',
        photo:'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bb/Enkiri-enoki_%281%29_2025-05-03.jpg/1280px-Enkiri-enoki_%281%29_2025-05-03.jpg',
        cap:'縁切榎（東京都板橋区）',
        text:'東京都板橋区の旧中山道沿いにある、知る人ぞ知る強力な縁切りスポット。江戸時代から「この榎の樹皮を削り取って煎じて飲ませると悪縁が切れる」という信仰があり、大名行列さえもこの木の下を通るのを避けたと言われています。現在は神社（榎木稲荷）として整備され、病気や悪習、断ち切りたい人間関係の縁切りを願う絵馬が所狭しと掛けられています。決してふざけた気持ちではなく、真剣に悪縁を絶ちたいと願う人のみ訪れるべき神聖な場所です。' },

      { rank:7, name:'白山比咩神社', yomi:'しらやまひめじんじゃ', area:'石川県白山市',
        season:'初夏〜秋（表参道の緑が美しい時期）',
        access:'北陸鉄道・鶴来駅からバスで約5分、または徒歩約30分',
        see:'杉や欅の巨木に囲まれた荘厳な表参道と、白山の伏流水',
        goshuin:'「白山」の文字が力強く、霊山のパワーを感じるデザイン',
        photo:'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/%E7%99%BD%E5%B1%B1%E6%AF%94%E5%92%A9%E7%A5%9E%E7%A4%BE_01.jpg/1280px-%E7%99%BD%E5%B1%B1%E6%AF%94%E5%92%A9%E7%A5%9E%E7%A4%BE_01.jpg',
        cap:'白山比咩神社 表参道',
        text:'霊峰・白山を御神体とする全国の白山神社の総本宮。お祀りしている菊理媛尊（くくりひめのみこと）は、日本神話で伊奘諾尊（いざなぎのみこと）と伊弉冉尊（いざなみのみこと）の仲裁をしたことから、「和合の神」「縁結びの神」として厚く信仰されています。「くくる」＝「縁を結ぶ」お力があり、男女の縁だけでなく、ビジネスの良い取引先とのご縁など、人生の大きな転機に良縁を導いてくれます。荘厳な表参道を歩けば、心身の浄化を実感できるはずです。' },

      { rank:8, name:'門田稲荷神社', yomi:'かどたいなりじんじゃ（下野國一社八幡宮 境内）', area:'栃木県足利市',
        season:'通年',
        access:'東武伊勢崎線・野州山辺駅から徒歩約15分',
        see:'日本三大縁切稲荷の一つ。柄杓の底を抜いて奉納する独自の祈願方法',
        goshuin:'八幡宮の社務所にて門田稲荷神社の御朱印も授与',
        photo:'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Kadota_Inari_Jinja.JPG/1280px-Kadota_Inari_Jinja.JPG',
        cap:'門田稲荷神社（栃木県足利市）',
        text:'京都の伏見稲荷、東京の榎木稲荷（縁切榎）と並び、「日本三大縁切稲荷」の一つに数えられる強力な縁切りスポットです。下野國一社八幡宮の境内にひっそりと鎮座していますが、病気やギャンブル、悪縁など、人生の障壁となるものとの決別を願う人々が全国から訪れます。特徴的なのは、絵馬と共に「底を抜いた柄杓（ひしゃく）」を奉納する独自の作法。「水が抜けるように悪縁も流れ去る」という意味が込められており、強い覚悟を持って祈願する参拝者の思いが伝わってきます。' },

      { rank:9, name:'生田神社', yomi:'いくたじんじゃ', area:'兵庫県神戸市中央区',
        season:'通年',
        access:'各線・三宮駅から徒歩約10分',
        see:'都会のオアシス「生田の森」と、水みくじ',
        goshuin:'切り絵の御朱印や、神戸らしい洗練されたデザインの御朱印帳が人気',
        photo:'https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Ikuta-jinja%2C_haiden-1.jpg/1280px-Ikuta-jinja%2C_haiden-1.jpg',
        cap:'生田神社 拝殿',
        text:'神戸の中心地・三宮からほど近い場所にありながら、豊かな緑に囲まれた生田神社。「神戸」という地名の語源にもなったと言われる歴史ある古社です。御祭神の稚日女尊（わかひるめのみこと）は、機織りの神様であることから「糸と糸を織り成すように人の縁を結ぶ」として、縁結びにご利益があるとされています。本殿裏手にある「生田の森」には、池の水に浸すと文字が浮かび上がる「水みくじ」があり、楽しみながら良縁を占うことができます。' },

      { rank:10, name:'菊野大明神（法雲寺 境内）', yomi:'きくのだいみょうじん', area:'京都府京都市中京区',
        season:'通年',
        access:'地下鉄・京都市役所前駅から徒歩約5分',
        see:'怨念がこもるとされる霊石と、厳格な境内での参拝体験',
        goshuin:'法雲寺にて授与（書き置きの場合あり）',
        pq:'菊野大明神 京都',
        cap:'法雲寺 参道（京都市中京区）',
        text:'京都の中心街にある浄土宗の寺院・法雲寺の境内に祀られている菊野大明神。知る人ぞ知る、京都で最も強力とされる縁切りスポットです。御神体は「深草少将の腰掛け石」と呼ばれる霊石で、男女の悪縁だけでなく、いじめやストーカーなどあらゆる悪縁をスパッと断ち切ると言われています。境内は写真撮影厳禁など厳格なきまりがあり、遊び半分で訪れる場所ではありません。本当に切実な悩みを抱え、人生を切り開く覚悟を持った人のみ受け入れてくれる聖域です。' }
    ]
  };


  /* ── テーマF：大勝負の前に！仕事運・出世運を爆上げする勝負神様 ── */
  var THEME_F = {
    id: 'F',
    title: '大勝負の前に！仕事運・出世運を爆上げする勝負神様',
    lead: '大事なプレゼン、試験、転職、起業——。'
        + '絶対に負けられない一番の前に、武将や政治家が祈りを捧げてきた社があります。'
        + '勝利の伝承、武神としての格、そして境内に立ったときに背筋が伸びる感覚。'
        + 'その三つを軸に選んだ、勝負の前に訪れたい神社のランキングです。',
    hero: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/%E5%87%BA%E4%B8%96%E3%81%AE%E7%9F%B3%E6%AE%B5_%2824809061527%29.jpg/1280px-%E5%87%BA%E4%B8%96%E3%81%AE%E7%9F%B3%E6%AE%B5_%2824809061527%29.jpg',
    heroCap: '愛宕神社 出世の石段（東京都港区）',
    items: [
      { rank:1, name:'愛宕神社', yomi:'あたごじんじゃ', area:'東京都港区',
        season:'9月の「出世の石段祭」の時期、または勝負を控えた直前',
        access:'日比谷線・神谷町駅から徒歩約5分',
        see:'傾斜約40度という急勾配で知られる「出世の石段（男坂）」',
        goshuin:'葵の御紋が押印された美しいデザイン',
        photo:'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fb/%E6%84%9B%E5%AE%95%E7%A5%9E%E7%A4%BE%E3%80%81%E5%87%BA%E4%B8%96%E3%81%AE%E7%9F%B3%E6%AE%B5.jpg/1280px-%E6%84%9B%E5%AE%95%E7%A5%9E%E7%A4%BE%E3%80%81%E5%87%BA%E4%B8%96%E3%81%AE%E7%9F%B3%E6%AE%B5.jpg',
        cap:'愛宕神社 出世の石段（男坂）',
        text:'東京23区で最も高い自然の山、愛宕山の山頂に鎮座する愛宕神社。大勝負の前に必ず訪れたい仕事運・出世運の聖地です。最大の見どころは、86段にも及ぶ急な「出世の石段」。江戸時代、馬でこの石段を駆け上がった武士が将軍に称賛され、大出世を遂げたという逸話に由来します。息を切らしながら自らの足で登り切った先には、爽快感と確かな達成感が待っています。大事なプレゼンや転職、起業前に背中を押してくれる勝負神社です。' },

      { rank:2, name:'鶴岡八幡宮', yomi:'つるがおかはちまんぐう', area:'神奈川県鎌倉市',
        season:'通年（お正月や秋の例大祭）',
        access:'JR鎌倉駅から徒歩約10分',
        see:'鮮やかな朱塗りの本宮と、源氏の勝利を導いた力強い気運',
        goshuin:'「鶴岡八幡宮」の力強い墨書きとシンプルな朱印',
        photo:'https://upload.wikimedia.org/wikipedia/commons/d/d1/TsurugaokaHachimangu_by_ulysses_powers_in_Kamakura.jpg',
        cap:'鶴岡八幡宮 本宮',
        text:'源頼朝が創建し、鎌倉幕府の中心となった鶴岡八幡宮は、武家社会の守護神として篤く信仰されてきました。「勝負の神様」としての力は絶大で、現在も仕事での大一番や試験など、絶対に負けられない戦いを控えた人々が全国から参拝に訪れます。力強い「勝守（かちまもり）」は、困難に立ち向かう勇気を与えてくれる人気の授与品。広い境内を歩き、源氏の武将たちが祈った必勝のエネルギーを全身に取り込みましょう。' },

      { rank:3, name:'鹿島神宮', yomi:'かしまじんぐう', area:'茨城県鹿嶋市',
        season:'初夏から秋（奥参道の緑が美しい時期）',
        access:'JR鹿島神宮駅から徒歩約10分',
        see:'鬱蒼とした杉木立の奥参道と、武神のパワーを感じる本殿',
        goshuin:'「鹿島神宮」の威厳ある筆致と、常陸国一之宮の印',
        photo:'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Kashima-jingu_haiden-1.JPG/1280px-Kashima-jingu_haiden-1.JPG',
        cap:'鹿島神宮 拝殿',
        text:'日本建国・武道の神様である武甕槌大神（たけみかづちのおおかみ）をお祀りする、全国の鹿島神社の総本宮。勝利の神様、そして「すべての始まりの地（鹿島立ち）」として、新規事業の立ち上げや転職など、新しい門出での勝利を願うビジネスパーソンに圧倒的な支持を得ています。東京ドーム15個分という広大な鎮守の森に足を踏み入れると、空気が一変。心が研ぎ澄まされ、ブレない強い意志と決断力を授かることができる屈指の聖地です。' },

      { rank:4, name:'代々木八幡宮', yomi:'よよぎはちまんぐう', area:'東京都渋谷区',
        season:'通年',
        access:'小田急線・代々木八幡駅から徒歩約5分',
        see:'都会のオアシスのような森と、強力なパワースポット「出世稲荷」',
        goshuin:'代々木八幡宮と出世稲荷の2種類の御朱印を授与',
        photo:'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Yoyogi_Hachimangu_2012-10-15.jpg/1280px-Yoyogi_Hachimangu_2012-10-15.jpg',
        cap:'代々木八幡宮 参道の石段',
        text:'渋谷という大都会にありながら、縄文時代の遺跡も残る豊かな森に抱かれた代々木八幡宮。この神社の境内にある「出世稲荷大明神」が、芸能人や経営者の間で「絶大な出世効果がある」と口コミで広がり、連日多くの人が参拝に訪れます。富士山へと続く龍脈の上に位置しているとされ、上昇気流に乗るような強力な運気を引き寄せると言われています。自分の才能を開花させ、業界で大きく飛躍したいと願う方にぴったりの神社です。' },

      { rank:5, name:'香取神宮', yomi:'かとりじんぐう', area:'千葉県香取市',
        season:'春（桜の時期）や秋（紅葉）',
        access:'JR佐原駅からタクシーで約10分',
        see:'黒漆塗りに極彩色が映える美しい本殿と、要石',
        goshuin:'下総国一之宮の威厳を感じる力強いデザイン',
        photo:'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/Katori-jingu_haiden_shomen.JPG/1280px-Katori-jingu_haiden_shomen.JPG',
        cap:'香取神宮 拝殿',
        text:'鹿島神宮と対になり、国家鎮護の神として古くから朝廷や武将の崇敬を集めてきた香取神宮。御祭神の経津主大神（ふつぬしのおおかみ）は、剣の威力を象徴する強力な武神です。勝負運、決断力、行動力を高めるご利益があり、自分自身の心の迷いを断ち切り、プロジェクトを力強く前進させたいビジネスマンに最適です。黒を基調とした威風堂々たる本殿の前に立つと、背筋が伸び、困難を突破するための強い闘志が湧いてきます。' },

      { rank:6, name:'豊國神社', yomi:'ほうこくじんじゃ', area:'大阪府大阪市中央区（大阪城公園内）',
        season:'通年',
        access:'各線・森ノ宮駅、谷町四丁目駅から徒歩約15分',
        see:'大きな豊臣秀吉公の銅像と、大阪城の堂々たる借景',
        goshuin:'秀吉公の馬印である「千成瓢箪」の印が押された縁起の良い御朱印',
        photo:'https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/H%C5%8Dkoku_Shrine_%28Osaka%29.jpg/1280px-H%C5%8Dkoku_Shrine_%28Osaka%29.jpg',
        cap:'豊國神社 社殿（大阪城公園内）',
        text:'農民から天下人へと、日本史上類を見ない大出世を遂げた豊臣秀吉公をお祀りする神社。大阪城公園内に鎮座しており、究極の「出世開運・仕事運向上」のパワースポットとして全国のビジネスマンが足を運びます。秀吉公にあやかり、千成瓢箪（せんなりびょうたん）をモチーフにしたお守りや絵馬が大人気。逆境を跳ね返し、自分の実力と機転で道を切り開いてトップに立ちたいという、強烈な上昇志向を持つ人の背中を力強く押してくれます。' },

      { rank:7, name:'神田明神（神田神社）', yomi:'かんだみょうじん', area:'東京都千代田区',
        season:'通年',
        access:'御茶ノ水駅から徒歩約5分',
        see:'色鮮やかな御神殿と、平将門命を祀る勝負の気運',
        goshuin:'力強い墨書きと、神田祭の時期などには限定御朱印も',
        photo:'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Kanda-Myojin_2012.JPG/1280px-Kanda-Myojin_2012.JPG',
        cap:'神田明神 御神殿',
        text:'江戸総鎮守として徳川家康公が関ヶ原の戦いの前に戦勝祈願を行い、見事天下統一を果たしたことで知られる神田明神。御祭神の一柱である平将門命（たいらのまさかどのみこと）は、勝負運の神様として絶大な信仰を集めています。現在では、秋葉原や丸の内といったビジネス街の守護神でもあり、企業成長や商売繁盛、IT情報安全の祈願に訪れるビジネスマンが絶えません。大きな勝負に出る企業のトップやプロジェクトリーダー必見の神社です。' },

      { rank:8, name:'太郎坊宮（阿賀神社）', yomi:'たろうぼうぐう', area:'滋賀県東近江市',
        season:'通年',
        access:'近江鉄道・太郎坊宮前駅から徒歩約20分（石段あり）',
        see:'山の中腹に露出する巨大な「夫婦岩」と、天狗の伝説',
        goshuin:'「勝利」の文字や天狗の印が押された、迫力ある御朱印',
        photo:'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Aga-Shrine%EF%BC%88Tarobogu%EF%BC%89-Meoto-Rock01.jpg/1280px-Aga-Shrine%EF%BC%88Tarobogu%EF%BC%89-Meoto-Rock01.jpg',
        cap:'太郎坊宮 夫婦岩',
        text:'標高350mの赤神山の中腹に鎮座し、「勝利と幸福を授ける神様」としてプロスポーツ選手や企業経営者が密かに通う知る人ぞ知る勝負神社。神様を守護する天狗（太郎坊）の伝説が残り、境内は神秘的な空気に包まれています。最大の見どころは、神の力で真っ二つに割れたとされる巨大な「夫婦岩」。嘘つきや悪人が通ると岩に挟まれると言い伝えられています。自らの心を正し、清らかな心で勝負の運気を授かりたい方にオススメの強力な聖地です。' },

      { rank:9, name:'東郷神社', yomi:'とうごうじんじゃ', area:'東京都渋谷区',
        season:'通年',
        access:'JR原宿駅から徒歩約3分',
        see:'原宿の喧騒を忘れる静寂の森と、「勝」の文字が力強いお守り',
        goshuin:'東郷平八郎命の印と「至誠」の文字が美しいデザイン',
        photo:'https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/Togo-jinja-haiden.jpg/1280px-Togo-jinja-haiden.jpg',
        cap:'東郷神社 拝殿',
        text:'日露戦争において、世界最強と言われたバルチック艦隊を打ち破った東郷平八郎命をお祀りする神社。「絶対勝利」の神様として、スポーツ選手や受験生、そして絶対に失敗できない大事業を控えたビジネスマンの熱烈な信仰を集めています。名物の「勝守（かちまもり）」は、その力強い「勝」の文字から、持つ者に揺るぎない自信を与えてくれます。世界の海軍史に残る大勝利を導いた東郷元帥の至誠と決断力にあやかりたい大勝負の前にぜひ。' },

      { rank:10, name:'筥崎宮', yomi:'はこざきぐう', area:'福岡県福岡市東区',
        season:'通年（9月の放生会も有名）',
        access:'地下鉄・箱崎宮前駅から徒歩約3分',
        see:'鎌倉時代の元寇に打ち勝った歴史を物語る「敵国降伏」の扁額',
        goshuin:'「筥崎宮」の力強い文字とシンプルな印',
        photo:'https://upload.wikimedia.org/wikipedia/commons/6/66/Hakozakigu01.jpg',
        cap:'筥崎宮 楼門',
        text:'日本三大八幡宮の一つに数えられる、九州を代表する勝負の神様。鎌倉時代、元（モンゴル帝国）の襲来（元寇）という未曾有の国難において、神風を吹かせて国を守り抜いたとして「勝利の神」と称えられるようになりました。楼門に掲げられた「敵国降伏（武力ではなく徳の力で敵を降伏させる）」の扁額は圧巻。現在では地元プロスポーツチームが毎年必勝祈願に訪れることでも有名で、ライバル企業との競争やコンペなど、逆境を覆す力が欲しい時に最適です。' }
    ]
  };


  /* ── テーマG：愛犬・愛猫と一緒に参拝！ペットの健康を祈る寺社 ── */
  var THEME_G = {
    id: 'G',
    title: '愛犬・愛猫と一緒に参拝！ペットの健康を祈る寺社',
    lead: '大切な家族の一員である、うちの子の健康を祈りたい——。'
        + '日本には、リードのまま境内を歩ける社、ペット専用のお社やご祈祷を用意している社があります。'
        + '同伴のしやすさ、ペットのための授与品やご祈祷の充実度、そして境内の温かさ。'
        + 'その三つを軸に選んだランキングです。'
        + '※ペット同伴の可否や範囲は変わることがあります。お出かけの前に各社寺へご確認ください。',
    hero: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Inu-neko-sha_shrine_from_the_front01.jpg/1280px-Inu-neko-sha_shrine_from_the_front01.jpg',
    heroCap: '座間神社 伊奴寝子社の狛犬と狛猫（神奈川県座間市）',
    items: [
      { rank:1, name:'神祇大社', yomi:'じんぎたいしゃ', area:'静岡県伊東市',
        season:'通年',
        access:'伊豆急行・伊豆高原駅から車で約5分、徒歩約20分',
        see:'リードのまま歩ける境内と、手描きのペット用絵馬',
        goshuin:'ペット同伴の記念になる御朱印あり（ペット用の水飲み場完備）',
        photo:'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/%E7%A5%9E%E7%A5%87%E5%A4%A7%E7%A4%BE%E6%8B%9D%E6%AE%BF.jpg/1280px-%E7%A5%9E%E7%A5%87%E5%A4%A7%E7%A4%BE%E6%8B%9D%E6%AE%BF.jpg',
        cap:'神祇大社 拝殿（静岡県伊東市）',
        text:'伊豆高原に位置し、愛犬・愛猫と一緒に参拝できる神社の代表格として絶大な人気を誇ります。ペット専用のお清め所（手水舎）があり、リードを付けたまま一緒に境内を散策できるのが最大の魅力。犬や猫の顔の形をした可愛らしい絵馬に、飼い主自身がマジックで目や鼻を描き入れ、愛するペットの健康と長寿を祈願します。ペット守りも豊富に揃っており、ペットツーリズムが盛んな伊豆観光の際に必ず立ち寄りたい、優しさに満ちた名社です。' },

      { rank:2, name:'市谷亀岡八幡宮', yomi:'いちがやかめがおかはちまんぐう', area:'東京都新宿区',
        season:'通年（ペットの七五三祈祷も受付）',
        access:'各線・市ケ谷駅から徒歩約5分',
        see:'ペットのための本格的なご祈祷と、種類豊富なペット御守',
        goshuin:'八幡宮の威厳ある御朱印',
        photo:'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ed/Tokyo---2022-05-29_047.jpg/1280px-Tokyo---2022-05-29_047.jpg',
        cap:'市谷亀岡八幡宮 社殿',
        text:'東京都心部にありながら、ペットと一緒の参拝をいち早く受け入れてきた先駆的な神社。犬や猫だけでなく、ウサギや小鳥、爬虫類など、あらゆるペットの健康祈願や厄除け、さらには「ペットの七五三」まで本格的なご祈祷を行ってくれます（要予約）。バンダナ型のお守りや、迷子札になるお守りなど、飼い主の気持ちに寄り添ったペット用授与品が非常に充実しているのも特徴。大切な家族の健康を、神様にしっかりとお守りいただける安心感があります。' },

      { rank:3, name:'武蔵御嶽神社', yomi:'むさしみたけじんじゃ', area:'東京都青梅市',
        season:'春〜秋（ハイキングに最適な時期）',
        access:'ケーブルカー「御岳山駅」から徒歩約25分',
        see:'愛犬と一緒に乗れるケーブルカーと、狼信仰の「おいぬ様」',
        goshuin:'「おいぬ様」の印が押された力強い御朱印',
        photo:'https://upload.wikimedia.org/wikipedia/commons/2/2e/%E6%AD%A6%E8%94%B5%E5%BE%A1%E5%B2%B3%E7%A5%9E%E7%A4%BE_%E6%8B%9D%E6%AE%BF.jpg',
        cap:'武蔵御嶽神社 拝殿',
        text:'標高929mの御岳山山頂に鎮座する歴史ある神社。古くから日本狼を「おいぬ様（大口真神）」として魔除け・盗難除けの神として信仰してきました。その縁から愛犬連れの参拝を歓迎しており、ケーブルカーには愛犬と一緒に乗車可能（ペット券あり）。山頂までのハイキングコースを愛犬と楽しみながら向かい、境内では犬の健康を願う祈祷（要予約）も受けられます。愛犬との絆を深める特別なアクティビティとしても最高のお参り体験になります。' },

      { rank:4, name:'座間神社 伊奴寝子社', yomi:'ざまじんじゃ／いぬねこしゃ', area:'神奈川県座間市',
        season:'通年',
        access:'JR相模線・相武台下駅から徒歩約5分',
        see:'境内に設けられた犬と猫のための専用のお社',
        goshuin:'伊奴寝子社専用の可愛らしい犬と猫の印が押された御朱印',
        photo:'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Inu-neko-sha_shrine%2C_the_sitting_statue_of_the_cat01.jpg/1280px-Inu-neko-sha_shrine%2C_the_sitting_statue_of_the_cat01.jpg',
        cap:'伊奴寝子社の狛猫',
        text:'神奈川県の座間神社の境内にある「伊奴寝子社」は、その名の通り、犬や猫など愛するペットのための全国でも珍しい専用のお社です。小さな狛犬ならぬ「狛犬と狛猫」の像があり、手のひらで優しく撫でることで、ペットの無病息災や病気平癒を祈願できます。ペット用の絵馬やお守りも大変可愛らしく、大切な家族の一員であるペットへの深い愛情を持った参拝者が絶えません。静かで心温まる空間で、うちの子の健康をゆっくりとお祈りできます。' },

      { rank:5, name:'伊奴神社', yomi:'いぬじんじゃ', area:'愛知県名古屋市西区',
        season:'通年（戌の日は安産祈願で混雑します）',
        access:'地下鉄・庄内通駅から徒歩約15分',
        see:'境内にある立派な「犬の王」の石像',
        goshuin:'可愛い犬の印が押された御朱印やオリジナル御朱印帳',
        photo:'https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Inu_Jinja_%28Nishi_Ward%2C_Nagoya%29_Vlux5_hdsr_21.jpg/1280px-Inu_Jinja_%28Nishi_Ward%2C_Nagoya%29_Vlux5_hdsr_21.jpg',
        cap:'伊奴神社 社殿（名古屋市西区）',
        text:'愛知県で唯一「犬」という文字が名前に入る神社。元々は安産や子授けの神様として有名ですが、神様の使いである「犬の王」の伝説があることから、愛犬家の聖地としても知られています。境内にある立派な犬の石像は、撫でることで安産や健康のご利益があるとされ、愛犬の健康祈願に訪れる人も多くいます。犬をモチーフにしたおみくじや、可愛らしい犬のお守りが豊富に揃っており、犬好きなら一度は訪れたい心躍る神社です。' },

      { rank:6, name:'見付天神 矢奈比賣神社', yomi:'みつけてんじん やなひめじんじゃ', area:'静岡県磐田市',
        season:'通年',
        access:'JR磐田駅からバスで約10分',
        see:'妖怪を退治した霊犬「しっぺい太郎」の銅像とお墓',
        goshuin:'しっぺい太郎の印が押された勇ましい御朱印',
        photo:'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fb/Yanahime_Jinja_Haiden.jpg/1280px-Yanahime_Jinja_Haiden.jpg',
        cap:'矢奈比賣神社（見付天神）拝殿',
        text:'学問の神様・菅原道真公をお祀りする見付天神ですが、愛犬家の間では霊犬「しっぺい太郎」伝説の地として有名です。村人を苦しめていた恐ろしい妖怪（ヒヒ）を、命懸けで退治したという勇敢な犬の物語が残っており、境内にはしっぺい太郎の立派な銅像が建てられています。この勇敢な犬にあやかり、愛犬の健康や長寿、無病息災を願う「ペットお守り」が大人気。霊犬の強いパワーを感じながら、愛犬の守護をお祈りできる頼もしい神社です。' },

      { rank:7, name:'少彦名神社', yomi:'すくなひこなじんじゃ', area:'大阪府大阪市中央区',
        season:'通年',
        access:'地下鉄・北浜駅から徒歩約5分',
        see:'薬の街・道修町に鎮座する、医薬と健康の神様',
        goshuin:'季節限定の美しい御朱印や、ペット用の健康祈願御朱印',
        photo:'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Sukunahikona-jinja1.jpg/1280px-Sukunahikona-jinja1.jpg',
        cap:'少彦名神社 社殿（大阪・道修町）',
        text:'大阪のオフィス街、薬の町として知られる道修町（どしょうまち）のビルの谷間に鎮座する神社。日本の医薬の神様・少彦名命と、中国の医薬の神様・神農炎帝をお祀りする「薬の神様」です。近年は人間の健康だけでなく、ペットの病気平癒や健康長寿を願う飼い主が多く訪れており、ペット専用の絵馬や、肉球がデザインされた可愛いペット健康御守りが授与されています。現在病気と闘っている愛犬・愛猫のために、医薬の神様にすがりたい方に強くおすすめします。' },

      { rank:8, name:'吉水神社', yomi:'よしみずじんじゃ', area:'奈良県吉野郡吉野町',
        season:'春（吉野山の桜の時期は絶景です）',
        access:'近鉄・吉野駅からロープウェイと徒歩で約30分',
        see:'世界遺産でありながらペット大歓迎の温かい空気と絶景',
        goshuin:'「吉水神社」のダイナミックな墨書き',
        photo:'https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Yoshimizu-jinja_haiden.jpg/1280px-Yoshimizu-jinja_haiden.jpg',
        cap:'吉水神社 拝殿（奈良県吉野町）',
        text:'源義経や後醍醐天皇、豊臣秀吉にゆかりのある世界遺産・吉野山に位置する歴史深い神社。非常に格式高い神社ですが、驚くほどペットに対して寛容で「犬も猫も神様の大切な命」として、リードを付ければ境内を一緒に散策することができます（建物の外側のみ）。ペットの健康祈祷も積極的に受け付けており、犬用の可愛いお守りも充実。吉野山の壮大な自然「一目千本」の絶景を愛犬と一緒に眺めながら、歴史と温かい慈悲に触れられる最高のパワースポットです。' },

      { rank:9, name:'朝日氷川神社', yomi:'あさひひかわじんじゃ', area:'埼玉県川口市',
        season:'通年',
        access:'埼玉高速鉄道・南鳩ヶ谷駅から徒歩約15分',
        see:'ペット用のお清め水や、茅の輪くぐり（期間限定）',
        goshuin:'毎月変わる色鮮やかなデザイン御朱印が人気',
        photo:'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/Asahi_Hikawa_Jinja.JPG/1280px-Asahi_Hikawa_Jinja.JPG',
        cap:'朝日氷川神社 社殿（埼玉県川口市）',
        text:'住宅街に佇む地域密着型の神社ですが、ペットに非常に優しい神社として遠方からも参拝者が訪れます。境内にはペット専用の手水鉢（お清め水）が用意されており、愛犬のお清めをしてから一緒にお参りすることができます。また、ペットの厄除けや健康長寿のご祈祷も事前予約で対応可能。ペットのランドセル型お守りなど、遊び心のある可愛い授与品も人気です。アットホームな雰囲気の中で、家族全員で心穏やかにお参りができる温かい神社です。' },

      { rank:10, name:'森戸大明神', yomi:'もりとだいみょうじん', area:'神奈川県三浦郡葉山町',
        season:'通年（夕暮れ時の海の景色も最高です）',
        access:'JR逗子駅からバスで約15分',
        see:'境内の奥にある「畜霊社」と、相模湾を見渡す絶景',
        goshuin:'シンプルで力強い御朱印と、波をあしらったオリジナル御朱印帳',
        photo:'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Morito_Jinja_part3.JPG/1280px-Morito_Jinja_part3.JPG',
        cap:'森戸大明神（神奈川県葉山町）',
        text:'葉山の美しい海岸沿いに鎮座し、源頼朝が創建した歴史ある神社。本殿の奥にひっそりと佇む「畜霊社（ちくれいしゃ）」は、かつて多くの家畜を疫病から救ったと言われ、現在ではペットの健康と無病息災の守護神として信仰されています。愛犬と一緒にリードで境内を歩くことができ、海風を感じながらの参拝は開放感抜群。参拝後は神社に隣接する森戸海岸の砂浜を愛犬と散歩するのが定番コース。海と神様のパワーでペットも飼い主もリフレッシュできる癒しの神社です。' }
    ]
  };


  /* ── テーマH：歴史ファン必見！戦国武将が祈願した名刹・古社 ──── */
  var THEME_H = {
    id: 'H',
    title: '歴史ファン必見！戦国武将が祈願した名刹・古社',
    lead: '桶狭間へ向かう信長、川中島へ向かう信玄、関ヶ原へ向かう家康——。'
        + '戦国の武将たちは、命を懸けた一戦の前に必ず社寺へ足を運び、武運を祈りました。'
        + '武将との確かなゆかり、今も残る奉納物や遺構、そして境内に流れる歴史の重み。'
        + 'その三つを軸に選んだ、歴史ファンのためのランキングです。',
    hero: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Nikko_Toshogu_Yomeimon_Gate_2024.jpg/1280px-Nikko_Toshogu_Yomeimon_Gate_2024.jpg',
    heroCap: '日光東照宮 陽明門（栃木県日光市）',
    items: [
      { rank:1, name:'熱田神宮', yomi:'あつたじんぐう', area:'愛知県名古屋市熱田区',
        season:'初夏（新緑の季節）、お正月',
        access:'名鉄・神宮前駅から徒歩約3分',
        see:'三種の神器「草薙神剣」を祀る本宮と、荘厳な「信長塀」',
        goshuin:'本宮横の授与所にて（シンプルで力強い書体が特徴）',
        photo:'https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/Atsuta-jingu_Shrine_Haiden%2C_Jingu_Atsuta_Ward_Nagoya_2023.jpg/1280px-Atsuta-jingu_Shrine_Haiden%2C_Jingu_Atsuta_Ward_Nagoya_2023.jpg',
        cap:'熱田神宮 拝殿',
        text:'三種の神器の一つ「草薙神剣」を祀る熱田神宮。若き日の織田信長が桶狭間の戦いの直前に必勝祈願に訪れ、奇跡的な大勝利を収めたことで有名です。そのお礼として信長が奉納した「信長塀」は現在も境内に残っており、圧倒的な武運の気配を今に伝えています。広大な鎮守の森に囲まれた神聖な空気を深呼吸すれば、戦国武将たちが祈った力強いパワーを全身で感じられるはず。歴史ファンなら絶対に外せない、ロマンに満ちた格式高い大社です。' },

      { rank:2, name:'日光東照宮', yomi:'にっこうとうしょうぐう', area:'栃木県日光市',
        season:'春（例大祭）、秋（紅葉）',
        access:'JR・東武日光駅からバスで約10分、下車後徒歩約5分',
        see:'国宝・陽明門をはじめとする極彩色の彫刻群と三猿、眠り猫',
        goshuin:'「東照宮」の威厳ある文字と、葵の御紋が押された御朱印',
        photo:'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Karamon_of_Nikko_Tosho_Shrine.JPG/1280px-Karamon_of_Nikko_Tosho_Shrine.JPG',
        cap:'日光東照宮 唐門',
        text:'戦国乱世に終止符を打ち、泰平の江戸時代を築き上げた徳川家康公をお祀りする世界遺産。全国の優秀な職人を集めて造り上げられた社殿群は、極彩色の彫刻で彩られ、まさに豪華絢爛の一言です。「見ざる・言わざる・聞かざる」の三猿や、眠り猫など、平和への願いが込められた彫刻は必見。天下人の圧倒的な権威と、平和な時代への強い祈りが込められた神聖な空間に身を置けば、スケールの大きな出世運や勝負運のパワーを授かることができるでしょう。' },

      { rank:3, name:'諏訪大社（上社本宮）', yomi:'すわたいしゃ', area:'長野県諏訪市',
        season:'御柱祭の年、または気候の良い初夏〜秋',
        access:'JR茅野駅からバスまたはタクシーで約15分',
        see:'社殿の四隅に立つ巨大な「御柱」と、荘厳な神楽殿',
        goshuin:'上社本宮・前宮、下社春宮・秋宮の四社巡りの御朱印が人気',
        photo:'https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Suwa-taisha%2C_Kamisha_Honmiya%2C_haiden-1.jpg/1280px-Suwa-taisha%2C_Kamisha_Honmiya%2C_haiden-1.jpg',
        cap:'諏訪大社 上社本宮 拝殿',
        text:'甲斐の虎・武田信玄が篤く信仰したことで知られる諏訪大社。信玄は戦の前に必ず諏訪明神に戦勝を祈願し、「南無諏訪南宮法性上下大明神」と記した軍旗を掲げて数々の戦に勝利しました。全国に一万社以上ある諏訪神社の総本社であり、国内にある最も古い神社の一つとされています。御柱（おんばしら）と呼ばれる巨大なモミの木が社殿の四隅にそびえ立つ姿は圧巻。古来からの武神の力強さと、信玄が頼った圧倒的な勝負運を感じられる信州屈指の聖地です。' },

      { rank:4, name:'上杉神社', yomi:'うえすぎじんじゃ', area:'山形県米沢市',
        season:'春（桜の開花時期・上杉まつり）',
        access:'JR米沢駅からバスで約10分',
        see:'お堀に囲まれた美しい境内と、上杉謙信公・鷹山公の銅像',
        goshuin:'謙信公の「毘」と「龍」の文字が力強く押された御朱印',
        photo:'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Haiden_of_Uesugi_Shrine.jpg/1280px-Haiden_of_Uesugi_Shrine.jpg',
        cap:'上杉神社 拝殿（山形県米沢市）',
        text:'越後の龍と恐れられた稀代の戦術家、上杉謙信公をお祀りする山形県米沢市の上杉神社。謙信公の「義」を重んじる精神が今も息づくこの神社は、勝負運や学業成就のご利益があるとして多くの参拝者を集めています。桜の名所としても有名で、お堀に囲まれた美しい境内を歩くと、厳しい戦国の世を信念を持って生き抜いた武将の研ぎ澄まされた気配を感じられます。「為せば成る」で知られる上杉鷹山公の銅像もあり、困難に立ち向かう勇気を与えてくれる場所です。' },

      { rank:5, name:'尾山神社', yomi:'おやまじんじゃ', area:'石川県金沢市',
        season:'通年（夜間の神門のライトアップも美しいです）',
        access:'JR金沢駅からバスで約10分、「南町・尾山神社」下車徒歩約3分',
        see:'ステンドグラスが輝く和漢洋折衷の美しい「神門」',
        goshuin:'前田家の家紋である梅鉢紋が鮮やかに押されたデザイン',
        photo:'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Oyama-jinja%2C_shinmon.jpg/1280px-Oyama-jinja%2C_shinmon.jpg',
        cap:'尾山神社 神門（石川県金沢市）',
        text:'加賀百万石の礎を築いた前田利家公と、正室のまつの方をお祀りする金沢市の尾山神社。最大の見どころは、和漢洋の三つの様式が融合した珍しい造りの「神門」です。ステンドグラスがはめ込まれた最上階は、かつて日本海を行き交う船の灯台の役割も果たしていたと言われます。利家公の金色の兜のモニュメントもあり、戦国の世を生き抜き大名へと出世した夫婦の力強い絆と勝負運を感じられます。金沢観光の中心にあり、美しい庭園も見逃せない歴史的名社です。' },

      { rank:6, name:'眞田神社', yomi:'さなだじんじゃ', area:'長野県上田市（上田城跡公園内）',
        season:'春（上田城千本桜まつり）、秋（紅葉）',
        access:'JR上田駅から徒歩約15分',
        see:'真田家の象徴「六文銭」があしらわれた巨大な赤備えの兜',
        goshuin:'武将のイラストや六文銭が描かれた月替わりの限定御朱印が人気',
        photo:'https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Sanada_Shrine_at_Ueda_city.jpg/1280px-Sanada_Shrine_at_Ueda_city.jpg',
        cap:'眞田神社（上田城跡公園内）',
        text:'信州上田城の跡地に鎮座し、戦国時代に数々の知略で大軍を退けた真田一族（幸隆、昌幸、信之、幸村）をお祀りする神社。徳川の大軍を二度も撃退した上田城は「落ちない城」として知られ、現在では「試験に落ちない」合格祈願や勝負運のパワースポットとして受験生や歴史ファンが絶えません。境内には真田家の家紋「六文銭」が輝く巨大な兜があり、どんな逆境にも屈しない真田の不屈の精神と知恵のパワーを授かることができる熱い聖地です。' },

      { rank:7, name:'大樹寺', yomi:'だいじゅじ', area:'愛知県岡崎市',
        season:'通年',
        access:'愛知環状鉄道・大門駅から徒歩約15分',
        see:'歴代将軍の等身大位牌と、山門から岡崎城が見える「ビスタライン」',
        goshuin:'「厭離穢土 欣求浄土」の力強い墨書き',
        photo:'https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/Daijuji_sanmon.jpg/1280px-Daijuji_sanmon.jpg',
        cap:'大樹寺 山門（愛知県岡崎市）',
        text:'徳川家康公の誕生地である岡崎市に位置し、松平家・徳川将軍家の菩提寺として知られる名刹。桶狭間の戦いで敗走した若き日の家康公が、この寺の先祖の墓前で自害を覚悟した際、住職から「平和な国を創れ」と諭され、生き延びて天下統一を目指す決意を固めたという歴史的な転換点となった場所です。歴代将軍の等身大の位牌が安置されており、天下人が天下人となる覚悟を決めた、静かで重みのある空間に圧倒されます。' },

      { rank:8, name:'建勲神社', yomi:'たけいさおじんじゃ', area:'京都府京都市北区',
        season:'秋（船岡山からの紅葉と京都の街の眺望が素晴らしいです）',
        access:'地下鉄・北大路駅からバスで約10分、「建勲神社前」下車徒歩約10分',
        see:'京都の街を一望できる船岡山の静かな境内',
        goshuin:'信長公の愛刀である「宗三左文字」や「薬研藤四郎」のデザイン',
        photo:'https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Takeisao-jinja_Honden.jpg/1280px-Takeisao-jinja_Honden.jpg',
        cap:'建勲神社 本殿（京都市北区 船岡山）',
        text:'織田信長公を主祭神としてお祀りする京都市の建勲（通称：けんくん）神社。天下統一という大きな志を抱き、数々の困難を打ち破ってきた信長公の強力なパワーにあやかり、大願成就や難局突破のご利益があるとされています。京都の街を一望できる船岡山に位置し、静かで気の引き締まる境内には、刀剣ファンに人気の刀剣モチーフの御朱印やお守りも充実。現状を打破し、新しい時代を切り開く野心と勇気をもらいたい方に最適な古社です。' },

      { rank:9, name:'富士山本宮浅間大社', yomi:'ふじさんほんぐうせんげんたいしゃ', area:'静岡県富士宮市',
        season:'春（桜の時期）、または富士山が綺麗に見える冬の晴れた日',
        access:'JR富士宮駅から徒歩約10分',
        see:'徳川家康公が造営した美しい本殿（浅間造）と、雪解け水が湧く湧玉池',
        goshuin:'「富士山本宮」の文字と富士山の美しい印',
        photo:'https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Fujinomiya_Hongu_Sengen_Taisha_Honden.jpg/1280px-Fujinomiya_Hongu_Sengen_Taisha_Honden.jpg',
        cap:'富士山本宮浅間大社 本殿',
        text:'全国にある浅間神社の総本宮。富士山を御神体とし、古くから多くの武将の崇敬を集めました。特に徳川家康公は関ヶ原の戦いの戦勝を祈願し、そのお礼として現在の壮麗な本殿や拝殿などを造営・寄進しました。境内には富士山の雪解け水が湧き出す美しい「湧玉池」があり、心身を清めることができます。武田信玄公も刀剣を奉納するなど、名だたる戦国武将たちが自然の圧倒的な力に武運を祈った、美しくも力強いエネルギーに満ちた聖域です。' },

      { rank:10, name:'宝厳寺（竹生島）', yomi:'ほうごんじ', area:'滋賀県長浜市',
        season:'春〜秋（琵琶湖クルーズが心地よい季節）',
        access:'長浜港または今津港から観光船で約30分',
        see:'豊臣秀吉公が寄進した国宝の「唐門」と、かわらけ投げ',
        goshuin:'本尊の弁才天（大悲殿）の流麗な墨書き',
        photo:'https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Hogonji08s3200.jpg/1280px-Hogonji08s3200.jpg',
        cap:'宝厳寺 唐門（国宝・竹生島）',
        text:'琵琶湖に浮かぶ神の島・竹生島にある宝厳寺。古くから信仰の対象であったこの島は、豊臣秀吉公と深い関わりがあります。秀吉公の寄進によって建てられた唐門（国宝）は、豪華絢爛な桃山文化の面影を今に伝える極彩色の彫刻が施されており必見です。また、戦国武将の浅井長政も信仰を寄せた地でもあります。船でしか行けないという神秘性と、天下人が愛した華やかな芸術性が融合した島全体がパワースポット。戦国のロマンを感じられる特別な場所です。' }
    ]
  };


  /* ── テーマI：神話の起源！日本神話の偉大な神様が鎮座する社 ──── */
  var THEME_I = {
    id: 'I',
    title: '神話の起源！日本神話の偉大な神様が鎮座する社',
    lead: '天照大御神が姿を隠した岩戸、八百万の神々が集う社、天孫が降り立った山——。'
        + '古事記や日本書紀に記された物語は、今も各地の社に生きています。'
        + '神話との結びつきの深さ、社殿や自然そのものの神々しさ、そして立ったときに背筋が伸びる感覚。'
        + 'その三つを軸に選んだ、神話の起源をたどるランキングです。',
    hero: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/Kumano_Hongu_Ooyunohara_Ootorii_20160321.jpg/1280px-Kumano_Hongu_Ooyunohara_Ootorii_20160321.jpg',
    heroCap: '熊野本宮大社 大斎原の大鳥居（和歌山県田辺市）',
    items: [
      { rank:1, name:'伊勢神宮（内宮・皇大神宮）', yomi:'いせじんぐう', area:'三重県伊勢市',
        season:'通年（空気が澄み切った早朝参拝が特におすすめ）',
        access:'近鉄・五十鈴川駅からバスで約6分',
        see:'五十鈴川の清らかな御手洗場と、神聖な空気に包まれた正宮',
        goshuin:'神楽殿にて授与（印のみの非常にシンプルで格式高い御朱印）',
        photo:'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Naiku_001.jpg/1280px-Naiku_001.jpg',
        cap:'伊勢神宮 内宮 正宮',
        text:'日本神話の最高神であり、太陽を象徴する天照大御神（あまてらすおおみかみ）をお祀りする、日本人の心のふるさと。古事記や日本書紀の世界が最も濃く息づく起源の聖地です。五十鈴川の清流で心身を清め、樹齢数百年の鉾杉が立ち並ぶ参道を歩けば、日常の喧騒から完全に切り離された神々しい世界へと誘われます。個人的な願い事をするのではなく、日々の感謝を神様に伝える場所。圧倒的な清涼感と荘厳な空気に触れ、心身ともに生まれ変わるような特別な参拝体験を。' },

      { rank:2, name:'出雲大社', yomi:'いずもおおやしろ', area:'島根県出雲市',
        season:'神在月（旧暦10月・通常11月頃）',
        access:'一畑電車・出雲大社前駅から徒歩約5分',
        see:'神楽殿の巨大な大注連縄と、国宝である巨大な御本殿',
        goshuin:'「出雲大社」の威厳ある文字とシンプルな朱印',
        photo:'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Kaguraden_Shimenawa%2C_Izumo_Shrine_-_May_8%2C_2013.jpg/1280px-Kaguraden_Shimenawa%2C_Izumo_Shrine_-_May_8%2C_2013.jpg',
        cap:'出雲大社 神楽殿の大注連縄',
        text:'日本神話で「国譲り」の舞台となった出雲大社。大国主大神（おおくにぬしのおおかみ）をお祀りし、目に見えないご縁を結ぶ強力なパワースポットです。旧暦10月の「神在月」には全国の八百万の神々がここに集まり、人々の縁について会議を開くという壮大な神話が今も息づいています。神楽殿にある巨大な大注連縄は圧巻。「二拝四拍手一拝」という独自の作法で祈りを捧げれば、古の神々の息吹と、素晴らしいご縁の訪れを確かに感じることができるでしょう。' },

      { rank:3, name:'熊野本宮大社', yomi:'くまのほんぐうたいしゃ', area:'和歌山県田辺市',
        season:'通年（熊野古道ウォークとあわせた春〜秋が最適）',
        access:'JR紀伊田辺駅からバスで約2時間',
        see:'檜皮葺きの荘厳な社殿群と、旧社地「大斎原」の大鳥居',
        goshuin:'神の使者である「八咫烏」の印が押された特別な御朱印',
        photo:'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Inside_the_Kumano_Hongu_Taisha.jpg/1280px-Inside_the_Kumano_Hongu_Taisha.jpg',
        cap:'熊野本宮大社 社殿',
        text:'全国に3000社以上ある熊野神社の総本宮。主祭神である家津美御子大神（けつみみこのおおかみ）は、日本神話の英雄・素戔嗚尊（すさのおのみこと）と同一視されています。八咫烏（やたがらす）を神の使者とし、古くから「よみがえりの聖地」として多くの人々の信仰を集めてきました。かつて社殿があった大斎原（おおゆのはら）にそびえ立つ日本一巨大な大鳥居は必見です。神話の神々の荒々しくも包容力のあるエネルギーに満ち、人生の再出発を力強く後押ししてくれます。' },

      { rank:4, name:'天岩戸神社', yomi:'あまのいわとじんじゃ', area:'宮崎県西臼杵郡高千穂町',
        season:'通年',
        access:'延岡駅からバスで約1時間半、高千穂バスセンターから車で約15分',
        see:'洞窟を御神体とする西本宮と、無数の石積みが並ぶ「天安河原」',
        goshuin:'「天岩戸神社」と「天安河原宮」の2種類を授与',
        photo:'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Amanoiwato-west-shrine_%2828795304727%29.jpg/1280px-Amanoiwato-west-shrine_%2828795304727%29.jpg',
        cap:'天岩戸神社 西本宮（宮崎県高千穂町）',
        text:'宮崎県高千穂町に位置し、日本神話で最も有名な「天岩戸（あまのいわと）伝説」の舞台となった神社。太陽の神・天照大御神がお隠れになったとされる洞窟「天岩戸」をそのまま御神体としてお祀りしています。西本宮から少し歩いた先にある「天安河原（あまのやすかわら）」は、八百万の神々が集まって会議をしたとされる神秘的な洞窟。無数の石積みが並ぶ光景は異世界のような静寂に包まれており、神話の時代に直接触れているような圧倒的なスピリチュアル体験ができます。' },

      { rank:5, name:'鹿島神宮', yomi:'かしまじんぐう', area:'茨城県鹿嶋市',
        season:'初夏〜秋（豊かな森の散策が心地よい時期）',
        access:'JR鹿島神宮駅から徒歩約10分',
        see:'地震を抑え込む「要石」と、神秘的な水が湧く「御手洗池」',
        goshuin:'「鹿島神宮」の威厳ある筆致と、常陸国一之宮の印',
        photo:'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Mitarashiike_in_Kashima_Shrine_1.JPG/1280px-Mitarashiike_in_Kashima_Shrine_1.JPG',
        cap:'鹿島神宮 御手洗池',
        text:'日本神話において、出雲の国譲りを交渉で成功させた最強の武神・武甕槌大神（たけみかづちのおおかみ）をお祀りする常陸国一之宮。その圧倒的な強さから、勝負運や決断力、行動力を高める神様として知られています。広大な鎮守の森には、地震を起こす大鯰を抑え込んでいるとされる神秘的な「要石（かなめいし）」や、1日40万リットルもの霊水が湧き出す「御手洗池」など、神話の息吹を感じるスポットが点在。迷いを断ち切り、新たなスタートを切りたい時に最適な聖地です。' },

      { rank:6, name:'霧島神宮', yomi:'きりしまじんぐう', area:'鹿児島県霧島市',
        season:'春（桜の時期）、秋（紅葉）',
        access:'JR霧島神宮駅からバスで約15分',
        see:'極彩色の装飾が美しい国宝の社殿と、樹齢800年の御神木',
        goshuin:'「天孫降臨之地」の印が押された、歴史ロマンを感じる御朱印',
        photo:'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Kirishima-Jingu_Front.jpg/1280px-Kirishima-Jingu_Front.jpg',
        cap:'霧島神宮 社殿（鹿児島県霧島市）',
        text:'天照大御神の孫である瓊瓊杵尊（ににぎのみこと）が、神々の住む高天原から地上へと降り立った「天孫降臨」の神話の舞台。深い緑の森に包まれた参道を抜けると、突如として現れる朱塗りの豪華絢爛な社殿は、見る者を息を呑むほどの美しさです。神聖な空気が漂う境内には樹齢800年を超える御神木の杉がそびえ立ち、悠久の歴史を物語っています。国家の始まりを告げる壮大な神話ロマンを感じながら、心身に強力なエネルギーをチャージできる九州屈指のパワースポットです。' },

      { rank:7, name:'大神神社', yomi:'おおみわじんじゃ', area:'奈良県桜井市',
        season:'通年',
        access:'JR三輪駅から徒歩約5分',
        see:'御神体である「三輪山」と、大迫力の大鳥居、三ツ鳥居',
        goshuin:'「大物主大神」の印が押された、重厚感のある御朱印',
        photo:'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Omiwa-jinja_haiden.JPG/1280px-Omiwa-jinja_haiden.JPG',
        cap:'大神神社 拝殿（奈良県桜井市）',
        text:'奈良県の三輪山を御神体とする、日本最古の神社の一つ。大物主大神（おおものぬしのおおかみ）がお祀りされており、本殿を持たず、拝殿から直接山に向かって祈りを捧げるという古代の神仙信仰の形を今に伝えています。国造りの神話に深く関わる神様であり、蛇を化身とすることから、境内には蛇が好むとされる卵と酒が多数供えられています。三輪山そのものが神聖なエネルギーの塊であり、大自然と神が一体となった圧倒的な神秘性と、古の信仰の深さを体感できる場所です。' },

      { rank:8, name:'宗像大社', yomi:'むなかたたいしゃ', area:'福岡県宗像市',
        season:'秋（10月のみあれ祭の時期）',
        access:'JR東郷駅からバスで約12分',
        see:'悠久の歴史を感じる辺津宮の社殿と、国宝を展示する神宝館',
        goshuin:'宗像三女神の神紋が押された美しい御朱印',
        photo:'https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Munakata-taisha%2C_shaden.JPG/1280px-Munakata-taisha%2C_shaden.JPG',
        cap:'宗像大社 辺津宮 社殿',
        text:'天照大御神と素戔嗚尊の誓約（うけい）によって生まれた美しい三女神をお祀りする世界遺産。本土にある「辺津宮」、大島にある「中津宮」、そして神職しか立ち入れない絶海の孤島・沖ノ島の「沖津宮」の三宮で構成されています。特に沖ノ島は「神宿る島」として古代の祭祀遺跡がそのまま残り、数万点の国宝が出土した「海の正倉院」です。日本神話の神々が海の安全や交通・国家の守護としていかに重要視されていたかを実感できる、荘厳で美しい海の聖地です。' },

      { rank:9, name:'大山祇神社', yomi:'おおやまづみじんじゃ', area:'愛媛県今治市（大三島）',
        season:'通年（しまなみ海道のドライブにあわせた訪問が人気）',
        access:'JR福山駅または今治駅からバスで約1時間',
        see:'樹齢2600年の巨大なクスノキの御神木と、国宝だらけの宝物館',
        goshuin:'「日本総鎮守」の印が押された、格式高い御朱印',
        photo:'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Ohyamazumi_Shrine_Haiden.JPG/1280px-Ohyamazumi_Shrine_Haiden.JPG',
        cap:'大山祇神社 拝殿（愛媛県今治市 大三島）',
        text:'愛媛県の大三島に鎮座する、全国の山祇神社・三島神社の総本社。天照大御神の兄神であり、山の神・海の神・戦いの神として絶大な力を持つ大山祇神（おおやまづみのかみ）をお祀りしています。境内中央には樹齢2600年と言われる巨大な楠の御神木がそびえ立ち、神話の時代から続く圧倒的な生命力を放っています。古くから朝廷や武将の崇敬を集め、国宝・重要文化財の武具の8割がここに奉納されているという宝物館も必見。自然の偉大さと神の威厳を肌で感じる瀬戸内の聖地です。' },

      { rank:10, name:'鵜戸神宮', yomi:'うどじんぐう', area:'宮崎県日南市',
        season:'通年（晴れた日の日南海岸の絶景は格別です）',
        access:'JR伊比井駅からバスで約20分、または宮崎駅からバスで約1時間半',
        see:'断崖絶壁の洞窟の中に鎮座する色鮮やかな朱塗りの本殿',
        goshuin:'うさぎの印や、波をモチーフにしたオリジナル御朱印帳が人気',
        photo:'https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/Udo-jingu_Main-shrine.jpg/1280px-Udo-jingu_Main-shrine.jpg',
        cap:'鵜戸神宮 本殿（洞窟の中に鎮座）',
        text:'宮崎県日南海岸の断崖絶壁、海に面した洞窟の中に色鮮やかな朱塗りの本殿が鎮座する、全国でも珍しい景観の神社。日本神話の初代天皇・神武天皇の父である日子波瀲武鸕鷀草葺不合尊（ひこなぎさたけうがやふきあえずのみこと）をお祀りしています。豊玉姫が我が子を育てるために残したとされる「お乳岩」など、海神の娘との神秘的なロマンスの伝説が残る場所。波の音を聴きながら、亀石の窪みに願いを込めて「運玉」を投げる祈願も人気。神話と絶景が織りなす神秘の空間です。' }
    ]
  };


  /* ── テーマJ：映画・アニメ・TVのロケ地！聖地巡礼神社仏閣 ───── */
  var THEME_J = {
    id: 'J',
    title: '映画・アニメ・TVのロケ地！聖地巡礼神社仏閣',
    lead: 'あの階段、あの鳥居、あの参道——。'
        + 'スクリーンや画面で心を掴まれた風景が、実際に足を運べる場所として日本各地にあります。'
        + '作品との結びつきの強さ、実際に立ったときの再現度、そして社寺としての魅力。'
        + 'その三つを軸に選んだ、聖地巡礼のためのランキングです。'
        + '※参拝の場では、他の参拝者やお住まいの方のご迷惑にならないよう、撮影のマナーにご配慮ください。',
    hero: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/76/Suga_Shrine_stairs_high-angle_20161113-070854.jpg/1280px-Suga_Shrine_stairs_high-angle_20161113-070854.jpg',
    heroCap: '須賀神社 男坂の階段（東京都新宿区）',
    items: [
      { rank:1, name:'須賀神社', yomi:'すがじんじゃ', area:'東京都新宿区',
        season:'通年（映画の情景に近い、晴れた日の夕暮れ時）',
        access:'地下鉄・四谷三丁目駅から徒歩約7分',
        see:'映画のキービジュアルに登場する、赤い手すりのあの「男坂の階段」',
        goshuin:'須賀神社の力強い文字と、三つ巴の神紋',
        photo:'https://upload.wikimedia.org/wikipedia/commons/b/bc/Suga_Shrine_stairs_low-angle_20161113-_071126.jpg',
        cap:'須賀神社 男坂を見上げる',
        text:'世界的メガヒットを記録したアニメ映画『君の名は。』。そのラストシーンやキービジュアルの舞台として登場し、世界中からファンが押し寄せる究極の聖地です。住宅街にひっそりと佇む神社ですが、境内へと続く赤い手すりの階段（男坂）に立つと、映画の感動が鮮やかによみがえります。階段の上から振り返って見下ろす東京の街並みは、まさにスクリーンで見たあの景色。主人公たちが出会う奇跡の場所に立ち、映画の世界の余韻に心ゆくまで浸ることができる特別な神社です。' },

      { rank:2, name:'神田明神（神田神社）', yomi:'かんだみょうじん', area:'東京都千代田区',
        season:'通年（神田祭の時期や、お正月）',
        access:'JR御茶ノ水駅から徒歩約5分',
        see:'アニメに登場する男坂や、キャラクターとのコラボ絵馬',
        goshuin:'祭事やアニメコラボに合わせた限定デザインの授与もあり',
        photo:'https://upload.wikimedia.org/wikipedia/commons/thumb/8/81/Kanda_Jinja_entrance.JPG/1280px-Kanda_Jinja_entrance.JPG',
        cap:'神田明神 隨神門',
        text:'江戸総鎮守としての深い歴史を持ちながら、秋葉原の近くという立地からポップカルチャーの聖地としても名高い神田明神。大人気アイドルアニメ『ラブライブ！』で主人公たちがトレーニングをした「男坂」や、巫女として手伝いをする実家として登場したことで、聖地巡礼の定番スポットとなりました。境内にはキャラクターが描かれた絵馬がズラリと並び、IT情報安全守護のお守りなどユニークな授与品も充実。伝統と最新カルチャーが見事に融合した、懐の深い大社です。' },

      { rank:3, name:'飛騨山王宮 日枝神社', yomi:'ひださんのうぐう ひえじんじゃ', area:'岐阜県高山市',
        season:'春（春の雪解けや高山祭の時期）',
        access:'JR高山駅から徒歩約25分、または車で約10分',
        see:'映画の「宮水神社」のモデルと噂される赤い鳥居と灯籠',
        goshuin:'山の神様らしい力強い筆致と印が魅力',
        photo:'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Takayama-Hie-jinja_haiden.jpeg/1280px-Takayama-Hie-jinja_haiden.jpeg',
        cap:'飛騨山王宮 日枝神社 拝殿（岐阜県高山市）',
        text:'飛騨高山の静かな森に抱かれた歴史ある古社。『君の名は。』に登場するヒロインの実家「宮水神社」のモデルの一つではないかとファンの間で語り継がれ、一大聖地となりました。杉の巨木が立ち並ぶ中に静かに佇む大きな赤い鳥居や、石段を登るアプローチは、まさに映画のノスタルジックな雰囲気に満ちています。春には豪華絢爛な屋台が巡行する「春の高山祭」の舞台にもなり、豊かな自然と物語の感動が交差する、静寂で美しい情景を堪能できる場所です。' },

      { rank:4, name:'大洗磯前神社', yomi:'おおあらいいそさきじんじゃ', area:'茨城県東茨城郡大洗町',
        season:'通年（海から昇る朝日が見られる早朝が絶景）',
        access:'鹿島臨海鉄道・大洗駅からバスで約15分',
        see:'太平洋の荒波が打ち寄せる岩礁に立つ「神磯の鳥居」',
        goshuin:'荒波と鳥居が描かれた美しいオリジナル御朱印帳が人気',
        photo:'https://upload.wikimedia.org/wikipedia/commons/3/3b/Oarai-Isozaki-Jinja_torii2.jpg',
        cap:'大洗磯前神社 神磯の鳥居',
        text:'海に浮かぶ絶景の鳥居で有名な大洗磯前神社ですが、ここは戦車道を描いた人気アニメ『ガールズ＆パンツァー（ガルパン）』の巨大な聖地でもあります。境内には作品の大きな絵馬が掲げられ、ファンが奉納した愛あふれる絵馬が所狭しと並んでいます。海へと続く長い階段は、劇場版で戦車が駆け下りた大迫力のシーンの舞台。町全体がアニメと共存しており、絶景のパワースポット参拝と合わせて、熱気あふれる聖地巡礼を存分に楽しめる唯一無二の場所です。' },

      { rank:5, name:'秩父神社', yomi:'ちちぶじんじゃ', area:'埼玉県秩父市',
        season:'秋〜冬（秩父夜祭の時期）',
        access:'秩父鉄道・秩父駅から徒歩約3分',
        see:'「つなぎの龍」や「お元気三猿」など、色鮮やかな極彩色の彫刻',
        goshuin:'「秩父神社」の力強い墨書き',
        photo:'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Chichibu-jinja_ac_%284%29.jpg/1280px-Chichibu-jinja_ac_%284%29.jpg',
        cap:'秩父神社 社殿（埼玉県秩父市）',
        text:'関東屈指の古社であり、秩父三社の一つに数えられる秩父神社。ここは、日本中を涙で包んだ感動のアニメ『あの日見た花の名前を僕達はまだ知らない。（あの花）』の舞台としてファンに愛されています。作品内に神社の本殿前や周辺の風景が美しく描かれており、作中と同じアングルで写真撮影を楽しむファンの姿が絶えません。徳川家康公が寄進した極彩色の美しい社殿は一見の価値あり。アニメの切なくも温かい世界観と、秩父の豊かな自然に癒される聖地です。' },

      { rank:6, name:'鷲宮神社', yomi:'わしのみやじんじゃ', area:'埼玉県久喜市',
        season:'通年（お正月や9月の土師祭）',
        access:'東武伊勢崎線・鷲宮駅から徒歩約8分',
        see:'「アニメ聖地巡礼の発祥地」とも言われる活気ある境内',
        goshuin:'関東最古の大社としての威厳を感じる美しい御朱印',
        photo:'https://upload.wikimedia.org/wikipedia/commons/thumb/7/76/Washimiyajinja_honden.jpg/1280px-Washimiyajinja_honden.jpg',
        cap:'鷲宮神社 本殿（埼玉県久喜市）',
        text:'「アニメ聖地巡礼」という文化を世に定着させた記念碑的な場所。日常系アニメの金字塔『らき☆すた』で、主人公の姉妹が住む「鷹宮神社」のモデルとなりました。放送から長年が経過した現在でもファンの熱量は高く、地元商店街と一体となった町おこしの成功例として語り継がれています。関東最古の大社とされる格式高い神社でありながら、キャラクターの神輿が登場するなど、ファンと地域が温かく交流する雰囲気が魅力。アニメ文化の歴史を感じられる聖地です。' },

      { rank:7, name:'上色見熊野座神社', yomi:'かみしきみくまのいますじんじゃ', area:'熊本県阿蘇郡高森町',
        season:'初夏〜夏（深い緑と苔が最も美しい時期）',
        access:'南阿蘇鉄道・高森駅から車で約10分',
        see:'異世界へと続くような、苔むした石段と立ち並ぶ石灯籠',
        goshuin:'無人のため境内では授与なし（近くの観光案内所で情報提供あり）',
        photo:'https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Kamishikimi_Kumanoimasu_Shrine_001.jpg/1280px-Kamishikimi_Kumanoimasu_Shrine_001.jpg',
        cap:'上色見熊野座神社 苔むした参道（熊本県高森町）',
        text:'緑深い阿蘇の森の中に突如現れる、神秘的すぎる神社。緑の苔に覆われた100基以上の石灯籠が並ぶ長い石段は、まるで異世界への入り口のような圧倒的な雰囲気を放っています。この幻想的な風景は、緑川ゆき原作のアニメ映画『蛍火の杜へ』や『夏目友人帳』の舞台のモデルとされ、SNSを通じて国内外から参拝者が訪れるようになりました。神社の奥には大風穴「穿戸岩（うげといわ）」があり、困難を打ち破るパワースポットとしても有名。物語の妖（あやかし）に出会えそうな奇跡の森です。' },

      { rank:8, name:'近江神宮', yomi:'おうみじんぐう', area:'滋賀県大津市',
        season:'通年（かるた祭などの行事の時期）',
        access:'京阪電鉄・近江神宮前駅から徒歩約9分',
        see:'鮮やかな朱塗りの楼門と、境内に響く百人一首の歌声',
        goshuin:'時の祖神である天智天皇を祀る、格式高い御朱印',
        photo:'https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/Omi-jingu02n4592.jpg/1280px-Omi-jingu02n4592.jpg',
        cap:'近江神宮 楼門（滋賀県大津市）',
        text:'競技かるた（百人一首）に青春を懸ける高校生たちを描いた大ヒット漫画・アニメ・映画『ちはやふる』の最大の聖地。作中において「かるたの甲子園」と呼ばれる全国大会の舞台として何度も登場し、ファンの胸を熱くさせました。色鮮やかな朱塗りの楼門や、競技が行われる近江勧学館など、作中そのままの情景が広がっています。境内には時計の歴史を学べる時計館もあり、百人一首の雅な世界と、高校生たちの熱い青春の鼓動を同時に感じられる美しい神社です。' },

      { rank:9, name:'晴明神社', yomi:'せいめいじんじゃ', area:'京都府京都市上京区',
        season:'秋（桔梗が咲く時期）',
        access:'地下鉄・今出川駅から徒歩約12分',
        see:'境内の至る所に刻まれた「五芒星（晴明桔梗印）」と厄除桃',
        goshuin:'五芒星がデザインされた、非常にスタイリッシュな御朱印',
        photo:'https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Seimei_Jinja%2C_Worship_Place_and_Main_Sanctuary_002.jpg/1280px-Seimei_Jinja%2C_Worship_Place_and_Main_Sanctuary_002.jpg',
        cap:'晴明神社 拝殿（京都市上京区）',
        text:'平安時代の天才陰陽師・安倍晴明公をお祀りする神社。映画やドラマ、アニメ『陰陽師』シリーズのファンにとっての絶対的聖地であり、また、フィギュアスケートの羽生結弦選手がプログラム「SEIMEI」の成功祈願に訪れたことでも世界的に有名になりました。境内は魔除けのシンボルである五芒星（星のマーク）に溢れており、非常にミステリアスな雰囲気。式神の石像や、撫でると厄が落ちるという厄除桃など、物語の呪術的な世界観にどっぷりと浸れるパワースポットです。' },

      { rank:10, name:'櫻井神社', yomi:'さくらいじんじゃ', area:'福岡県糸島市',
        season:'通年（糸島ドライブの途中に最適）',
        access:'JR九大学研都市駅からバスで約30分',
        see:'緑豊かな境内と、縁結びのパワースポットとしての静謐な空気',
        goshuin:'「櫻井神社」の美しい文字と、桜の印',
        photo:'https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Sakurai_Shrine_Romon_Main_gate_001.jpg/1280px-Sakurai_Shrine_Romon_Main_gate_001.jpg',
        cap:'櫻井神社 楼門（福岡県糸島市）',
        text:'福岡県のリゾートエリア・糸島に鎮座する神社。国民的アイドルグループ「嵐」のメンバー・櫻井翔さんと同じ名前であることから、ファンの間で「嵐神社の聖地」として爆発的な人気を呼び、ライブ当選祈願の絵馬が数多く奉納されています。また、美しい自然環境から数々のドラマやCMのロケ地としても使用される風光明媚な場所です。黒田藩ゆかりの歴史ある神社であり、縁結びや厄除けのご利益も強力。推し活の熱気と、豊かな自然の癒しを同時に味わえるハッピーな神社です。' }
    ]
  };


  /* ── テーマK：古事記の神々に会いに行く！神話が息づく社 ────── */
  var THEME_K = {
    id: 'K',
    title: '古事記の神々に会いに行く！神話が息づく社',
    lead: '海に浮かぶ大鳥居、白うさぎの伝説が残る浜、建国の地とされる宮跡——。'
        + '古事記や日本書紀に記された物語の舞台は、伊勢や出雲だけではありません。'
        + '神話との結びつき、その土地ならではの景観、そして今も続く信仰の厚み。'
        + 'その三つを軸に選んだ、もう一歩踏み込んで神話をたどるためのランキングです。',
    hero: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Itsukushima_Shrine_Torii_Gate_%2813890465459%29.jpg/1280px-Itsukushima_Shrine_Torii_Gate_%2813890465459%29.jpg',
    heroCap: '厳島神社 大鳥居（広島県廿日市市）',
    items: [
      { rank:1, name:'厳島神社', yomi:'いつくしまじんじゃ', area:'広島県廿日市市',
        season:'通年（満潮時と干潮時で違う景色を楽しめます）',
        access:'JR宮島口駅からフェリーで約10分、下船後徒歩約15分',
        see:'海に浮かぶ大鳥居と、満潮時に海に浮かぶように見える朱塗りの社殿',
        goshuin:'「厳島神社」の流麗な文字と、シンプルな神紋',
        photo:'https://upload.wikimedia.org/wikipedia/commons/b/b0/Itsukushima_Honden_Haiden.jpg',
        cap:'厳島神社 社殿',
        text:'海上に浮かぶ大鳥居で世界的に有名な世界遺産・厳島神社。お祀りしているのは、天照大御神と素戔嗚尊の誓約（うけい）によって生まれた「宗像三女神（むなかたさんじょしん）」です。海の神、交通安全、財福の神として古くから平清盛をはじめとする権力者たちの篤い崇敬を集めました。自然の海そのものを敷地とし、潮の満ち引きによって姿を変える社殿の造りは、自然と神を一体としてとらえた日本独自の信仰の極致。神話の美しさと海のダイナミズムを堪能できる圧倒的な聖地です。' },

      { rank:2, name:'青島神社', yomi:'あおしまじんじゃ', area:'宮崎県宮崎市',
        season:'夏（南国ムード満点の青い空と海が美しい季節）',
        access:'JR青島駅から徒歩約10分',
        see:'「鬼の洗濯板」に囲まれた島全体が神域という絶景',
        goshuin:'「青島神社」の文字と、南国らしいビロウ樹の印',
        photo:'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Aoshima_jinja%2C_Worship_Hall_01.jpg/1280px-Aoshima_jinja%2C_Worship_Hall_01.jpg',
        cap:'青島神社 拝殿（宮崎県宮崎市）',
        text:'日本神話の有名なエピソード「海幸彦・山幸彦」の舞台となった場所。兄の釣り針を探して海神の宮殿へ赴いた山幸彦（彦火火出見命）と、海神の娘・豊玉姫命のロマンスの地として知られ、縁結びの強力なパワースポットとして大人気です。周囲1.5kmの小島全体が神域で、奇岩「鬼の洗濯板」と亜熱帯植物に囲まれた景色はまるで南国の楽園。素焼きの皿を投げて吉凶を占う「天の平瓮投げ」など、楽しみながら神話のロマンに浸ることができる開放感抜群の神社です。' },

      { rank:3, name:'白兎神社', yomi:'はくとじんじゃ', area:'鳥取県鳥取市',
        season:'通年（白兎海岸の散策とセットがおすすめ）',
        access:'JR鳥取駅からバスで約40分、「白兎神社前」下車すぐ',
        see:'境内に並ぶ可愛らしい白うさぎの石像と、うさぎが体を洗った御身洗池',
        goshuin:'白うさぎの印が押された、非常に可愛らしいデザイン',
        photo:'https://upload.wikimedia.org/wikipedia/commons/e/e0/HakutoJinjya_Haiden.jpg',
        cap:'白兎神社 拝殿（鳥取県鳥取市）',
        text:'古事記に記された日本最古の恋物語「因幡の白兎（いなばのしろうさぎ）」伝説の舞台です。サメに皮を剥がれて泣いていた白うさぎを大国主命が救い、そのお礼にうさぎが八上姫との縁を結んだという神話から、日本初の縁結びの神様「白兎神」をお祀りしています。境内には様々なポーズの可愛らしいうさぎの石像が並び、縁結びの石を乗せて祈願する人が絶えません。皮膚病の平癒にもご利益があるとされ、神話の優しさとロマンが詰まった心温まる神社です。' },

      { rank:4, name:'石上神宮', yomi:'いそのかみじんぐう', area:'奈良県天理市',
        season:'通年（早朝は神鶏の鳴き声が響き渡ります）',
        access:'JR・近鉄天理駅から徒歩約30分、またはタクシーで約5分',
        see:'境内で放し飼いにされている美しい「神鶏」たちと、厳かな神宮の森',
        goshuin:'日本最古の神社の一つにふさわしい、威厳に満ちた御朱印',
        photo:'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Isonokami_Jingu_Haiden1.jpg/1280px-Isonokami_Jingu_Haiden1.jpg',
        cap:'石上神宮 拝殿（奈良県天理市）',
        text:'日本最古の神社の一つとされ、古事記や日本書紀にもその名が記される名社。お祀りしているのは、神武天皇の東征を助けたとされる神剣「韴霊（ふつのみたま）」に宿る布都御魂大神（ふつのみたまのおおかみ）です。古代の有力な軍事氏族・物部氏の総氏神であり、起死回生やピンチを救う強力な武神として信仰されています。境内には神様の使いである色鮮やかなニワトリ（神鶏）が放し飼いにされており、古代の森の静寂に鶏の鳴き声が響く、神秘的で力強いパワースポットです。' },

      { rank:5, name:'橿原神宮', yomi:'かしはらじんぐう', area:'奈良県橿原市',
        season:'通年（特に建国記念の日である2月11日）',
        access:'近鉄・橿原神宮前駅から徒歩約10分',
        see:'畝傍山を背にした広大で清々しい境内と、荘厳な外拝殿',
        goshuin:'「橿原神宮」の力強い墨書きとシンプルな朱印',
        photo:'https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/251206_Kashihara_Shrine_Kashihara_Nara_pref_Japan05s3.jpg/1280px-251206_Kashihara_Shrine_Kashihara_Nara_pref_Japan05s3.jpg',
        cap:'橿原神宮 外拝殿と畝傍山（奈良県橿原市）',
        text:'日本という国が始まったまさに「建国の聖地」。日本神話において、日向（宮崎）から東征を果たした初代天皇・神武天皇が即位したとされる橿原宮の跡地に創建されました。神武天皇とその皇后をお祀りしています。背後にそびえる大和三山の一つ・畝傍山（うねびやま）と調和した境内は驚くほど広大で、玉砂利を踏む音だけが響く静かで清々しい空間です。大きな目標に向かって新しい一歩を踏み出す時、建国の祖神の強大なパワーを授かりたい方に最高の場所です。' },

      { rank:6, name:'諏訪大社（下社秋宮）', yomi:'すわたいしゃ', area:'長野県諏訪郡下諏訪町',
        season:'通年（上社本宮との四社巡りがおすすめ）',
        access:'JR下諏訪駅から徒歩約10分',
        see:'日本最大級の巨大な青銅製狛犬と、美しい彫刻が施された神楽殿',
        goshuin:'下社秋宮の威風堂々たる御朱印',
        photo:'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Suwa-taisha%2C_Shimosha_Akimiya%2C_kaguraden.jpg/1280px-Suwa-taisha%2C_Shimosha_Akimiya%2C_kaguraden.jpg',
        cap:'諏訪大社 下社秋宮 神楽殿',
        text:'『古事記』の国譲り神話において、建御雷神（たけみかづちのかみ）との力比べに敗れ、諏訪の地へ逃れてきた建御名方神（たけみなかたのかみ）をお祀りしています。出雲の神の血を引く強力な軍神・農耕神であり、敗北からこの地で再起を果たし強大な力を築いたことから、生命力の再生や五穀豊穣の神として信仰されています。巨大なしめ縄が飾られた秋宮の神楽殿は圧巻。大自然と古代信仰が融合した、信州のミステリアスで力強いエネルギーに触れることができます。' },

      { rank:7, name:'大國魂神社', yomi:'おおくにたまじんじゃ', area:'東京都府中市',
        season:'5月（関東三大奇祭の一つ「くらやみ祭」）',
        access:'京王線・府中駅から徒歩約5分',
        see:'約500mにわたってケヤキ並木が続く美しい表参道',
        goshuin:'武蔵国総社の歴史を感じさせる堂々たる御朱印',
        photo:'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/%C5%8Ckunitama_Shrine2.jpg/1280px-%C5%8Ckunitama_Shrine2.jpg',
        cap:'大國魂神社 拝殿（東京都府中市）',
        text:'武蔵国（現在の東京・埼玉・神奈川の一部）の守り神である大國魂大神（おおくにたまのおおかみ）をお祀りする神社。大國魂大神は出雲の大国主神と同神とされ、縁結びや厄除けのご利益で絶大な信仰を集めています。創建は1900年以上前とされ、源頼朝や徳川家康など時の権力者たちも厚く保護しました。境内には武蔵国の著名な神社の神様を全て集めた「総社」の役割もあり、ここを参拝するだけで関東一円の神様にご挨拶ができるという、非常に効率的かつ強力なパワースポットです。' },

      { rank:8, name:'氣比神宮', yomi:'けひじんぐう', area:'福井県敦賀市',
        season:'通年',
        access:'JR敦賀駅から徒歩約15分、またはバスで約5分',
        see:'日本三大木造大鳥居の一つに数えられる、高さ11mの朱塗りの大鳥居',
        goshuin:'越前国一之宮の格式高い文字と印',
        photo:'https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Kehi-jingu_otorii-2.jpg/1280px-Kehi-jingu_otorii-2.jpg',
        cap:'氣比神宮 大鳥居（福井県敦賀市）',
        text:'「北陸道総鎮守」として越前国（福井県）を古くから守ってきた名社。主祭神の伊奢沙別命（いざさわけのみこと）は食物の神様であり、神功皇后や応神天皇など、古代の歴史に名を残す重要な神々が合祀されています。松尾芭蕉が『おくのほそ道』の旅で訪れたことでも知られ、境内には長寿の水として有名な「長命水」が湧き出ています。堂々とそびえ立つ朱塗りの大鳥居は圧巻。海上交通や無病息災の強力な守護神として、北陸の厳しい自然の中で人々の生活を支えてきた神の威厳を感じます。' },

      { rank:9, name:'幣立神宮', yomi:'へいたてじんぐう', area:'熊本県上益城郡山都町',
        season:'通年（五色神祭が行われる8月23日など）',
        access:'熊本市内から車で約1時間半（公共交通機関ではアクセス困難）',
        see:'手つかずの深い森に包まれた神秘の境内',
        goshuin:'宇宙の起源を感じさせるような、神秘的でシンプルな御朱印',
        photo:'https://upload.wikimedia.org/wikipedia/commons/1/18/Heitate_Jingu.jpg',
        cap:'幣立神宮（熊本県山都町）',
        text:'熊本県の深い山奥にひっそりと鎮座する、知る人ぞ知る「隠れ宮」。古事記に登場する神々よりもさらに古い、天地の始まりの神とされる「神漏岐命（かむろぎのみこと）・神漏美命（かむろみのみこと）」をはじめ、大宇宙大和神（おおとのちおおかみ）という天の神々をお祀りしています。境内は強いエネルギーが交差する場所と語り継がれ、国内外から静けさを求める人々が訪れます。日本の神話の枠を超えた、宇宙的なスケールと深い森の静寂に圧倒される聖地です。' },

      { rank:10, name:'伏見稲荷大社', yomi:'ふしみいなりたいしゃ', area:'京都府京都市伏見区',
        season:'通年（人の少ない早朝の千本鳥居が最も幻想的です）',
        access:'JR稲荷駅から徒歩すぐ',
        see:'稲荷山全体にどこまでも続く、朱塗りの「千本鳥居」',
        goshuin:'「伏見稲荷大社」の流れるような美しい文字',
        photo:'https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/2018_Senbon_Torii_path.jpg/1280px-2018_Senbon_Torii_path.jpg',
        cap:'伏見稲荷大社 千本鳥居',
        text:'全国に約3万社ある「お稲荷さん」の総本宮。お祀りしている宇迦之御魂大神（うかのみたまのおおかみ）は、古事記に登場する五穀豊穣の神様であり、現在では商売繁昌・家内安全の神様として世界中から絶大な人気を集めています。稲荷山全体が神域となっており、願いが通ったお礼として奉納された朱色の鳥居がトンネルのように連なる「千本鳥居」は、見る者を神話と現世の境界へと誘うような圧倒的な美しさ。豊かさと繁栄を約束する神の、計り知れないパワーを体感できる大社です。' }
    ]
  };


  /* ── テーマL：外国人観光客におすすめのアイテム10選 ────────── */
  var THEME_L = {
    id: 'L',
    unit: '',
    nomap: true,
    heroBadge: 'ITEM 10',
    title: '日本の神社仏閣を120%楽しむ！外国人観光客におすすめのアイテム10選',
    lead: '日本の神社仏閣は、ただ見るだけでなく、その土地の歴史や文化を体感できる素晴らしい場所です。'
        + '参拝の体験をより深く、そして思い出深いものにするために、'
        + '「わびなび」が厳選したおすすめのアイテム10選をご紹介します。'
        + 'これらを手に入れることで、あなたの旅はさらに特別なものになるでしょう。',
    hero: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Goshuincho_with_five_shuin.jpg/1280px-Goshuincho_with_five_shuin.jpg',
    heroCap: '御朱印帳と御朱印',
    items: [
      { rank:1, name:'御朱印帳（Goshuin-cho）',
        rows:[['ひとこと','あなただけの「旅のアートピース」を作ろう'],
              ['どこで','神社仏閣の授与所や、専門店・書店などで購入できます']],
        photo:'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Goshuincho_with_five_shuin.jpg/1280px-Goshuincho_with_five_shuin.jpg',
        cap:'御朱印帳（五つの御朱印）',
        text:'参拝の証として授与される「御朱印（Goshuin）」を集めるための、専用の帳面です。和紙の質感や、神社仏閣ごとの美しいデザインは、それ自体が日本旅行の素晴らしいアートピースになります。／なぜおすすめ？　御朱印は、ただのスタンプではなく、あなたがその神聖な場所を訪れた証であり、芸術的な墨書きと朱印が施されます。自分だけの御朱印帳を完成させることは、日本旅行の大きな楽しみと、一生の思い出になります。' },

      { rank:2, name:'お守り（Omamori）',
        rows:[['ひとこと','神様・仏様の力を日常に持ち帰ろう'],
              ['どこで','神社やお寺の授与所']],
        photo:'https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/Variousomamori.jpg/1280px-Variousomamori.jpg',
        cap:'さまざまなお守り',
        text:'神様や仏様の力が宿るとされる、小さな袋入りのアイテムです。健康、恋愛成就（縁結び）、交通安全、学業成就など、さまざまな願いに対応しています。神社やお寺の授与所でいただけます。／なぜおすすめ？　日本の神聖なパワーを日常生活に持ち帰ることができます。カバンにつけたり、財布に入れたりして、守られている安心感を感じられます。大切な人へのお土産にも最適です。' },

      { rank:3, name:'おみくじ（Omikuji）',
        rows:[['ひとこと','神様・仏様からの「あなたへのメッセージ」'],
              ['どこで','境内の授与所やおみくじ箱']],
        photo:'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/%E3%81%8A%E3%81%BF%E3%81%8F%E3%81%98_%2816284941554%29.jpg/1280px-%E3%81%8A%E3%81%BF%E3%81%8F%E3%81%98_%2816284941554%29.jpg',
        cap:'境内のおみくじ',
        text:'神様・仏様からのメッセージが書かれたクジです。大吉（Great good luck）から大凶（Great bad luck）まであり、今のあなたの運勢を占うことができます。最近は、多言語（英語、中国語など）に対応したおみくじも増えています。／なぜおすすめ？　単なる占いではなく、今のあなたがどう行動すべきかのアドバイスが書かれています。日本語のみの場合でも、翻訳アプリを使って神様の言葉を読み解く体験自体が、日本文化への深い理解につながるでしょう。' },

      { rank:4, name:'絵馬（Ema）',
        rows:[['ひとこと','あなたの願いを「日本の聖地」に奉納しよう'],
              ['どこで','授与所で受け、絵馬掛けに奉納します']],
        photo:'https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Ema_at_Kamado-jinja.jpg/1280px-Ema_at_Kamado-jinja.jpg',
        cap:'絵馬掛けに奉納された絵馬',
        text:'願い事を書いて奉納するための、木製の板です。神社仏閣の境内には、多くの絵馬が掛けられており、人々の願いが満ちています。／なぜおすすめ？　あなたの願いが、日本の神様や仏様に届くかもしれません。自分の手で書く体験、そして神聖な場所に自分の願いを置いていく行為は、非常にスピリチュアルな思い出になります。' },

      { rank:5, name:'お賽銭入れ・がま口（Money pouch）',
        rows:[['ひとこと','参拝をスマートにする「和のアイテム」'],
              ['どこで','門前町のお土産店や和雑貨店']],
        photo:'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Typical_saisenbako.jpg/1280px-Typical_saisenbako.jpg',
        cap:'賽銭箱（お賽銭を納める箱）',
        text:'日本の硬貨、特にお賽銭に使う5円玉（ご縁がありますように）などをスマートに持ち運ぶための和風のポーチです。特に、がま口タイプは、そのクラシックなフォルムと機能性で人気です。／なぜおすすめ？　日本の硬貨は種類が多く、参拝時に財布から探すのは大変です。お賽銭入れがあれば、スムーズに参拝できます。日本文化の美しさを日常で感じられる、実用的なお土産になります。' },

      { rank:6, name:'手ぬぐい（Tenugui）',
        rows:[['ひとこと','実用的で美しい「和のハンカチ」'],
              ['どこで','門前町の和雑貨店、神社仏閣の授与所']],
        photo:'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/Tenugui.jpg/1280px-Tenugui.jpg',
        cap:'手ぬぐい',
        text:'日本の伝統的な木綿のハンカチ・タオルです。吸水性が良く、すぐ乾きます。神社仏閣オリジナルの柄や、美しい和柄は、タペストリーとして飾ることもできます。／なぜおすすめ？　参拝時の汗を拭うだけでなく、実用的なお土産になります。日本の美意識が凝縮された手ぬぐいは、使うたびに日本の風景を思い出させてくれるでしょう。' },

      { rank:7, name:'和傘（Wagasa）',
        rows:[['ひとこと','日本の風景を彩る「伝統の傘」'],
              ['どこで','京都・金沢・岐阜などの和傘専門店']],
        photo:'https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Traditional_Japanese_umbrellas_%28wagasa%29_on_display_at_Nagai_Botanical_Garden%2C_January_2026_-_0910.jpg/1280px-Traditional_Japanese_umbrellas_%28wagasa%29_on_display_at_Nagai_Botanical_Garden%2C_January_2026_-_0910.jpg',
        cap:'和傘',
        text:'竹と和紙で作られた、日本の伝統的な傘です。その優雅なフォルムと、和紙を通した柔らかな光は、日本の街並みや境内での撮影に彩りを添えます。／なぜおすすめ？　持ち帰るのは少し大変ですが、日本の美を象徴するアイテムです。雨の日だけでなく、日傘としても使えます。日本の伝統工芸の素晴らしさを体感できる、リッチなお土産になります。' },

      { rank:8, name:'お香（Incense）',
        rows:[['ひとこと','心を落ち着ける「和の香り」'],
              ['どこで','京都・堺・淡路島などのお香専門店']],
        photo:'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Senko.JPG/1280px-Senko.JPG',
        cap:'線香',
        text:'日本の伝統的な香りのアイテムです。神社仏閣の静寂な空気の中で漂う香りは、心を落ち着ける効果があります。美しい香炉とセットで、自分へのご褒美に。／なぜおすすめ？　日本の神社仏閣の静寂を、自宅で再現できます。日本の文化の深さを、五感（特に嗅覚）で感じることができる、洗練されたお土産になります。' },

      { rank:9, name:'和菓子（Wagashi）',
        rows:[['ひとこと','参拝後に五感で楽しむ「日本文化」'],
              ['どこで','門前町の和菓子店、老舗の茶屋']],
        photo:'https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Seioubo_Japanese_traditional_sweets.jpg/1280px-Seioubo_Japanese_traditional_sweets.jpg',
        cap:'和菓子',
        text:'日本の伝統的なお菓子です。参拝後に門前町で味わう和菓子は、旅の疲れを癒してくれます。美しい見た目と繊細な味わいは、まさに五感で楽しむ日本文化です。／なぜおすすめ？　参拝の体験を、味覚でも完成させることができます。和菓子はその土地の文化や季節を反映しており、日本の美学を感じられます。お土産用も豊富で、日本の味を共有できます。' },

      { rank:10, name:'御朱印（Goshuin）',
        rows:[['ひとこと','旅の「最大の記念」であり、あなたが訪れた証'],
              ['どこで','神社仏閣の授与所（御朱印帳が必要です）']],
        photo:'https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/Shuin_Ginkaku-ji_%E9%8A%80%E9%96%A3%E5%AF%BA.jpg/1280px-Shuin_Ginkaku-ji_%E9%8A%80%E9%96%A3%E5%AF%BA.jpg',
        cap:'御朱印（銀閣寺）',
        text:'これ自体が旅の最大の記念であり、あなたがその場所を訪れた証です。御朱印帳に直接、または書き置きでいただく、芸術的な墨書きと朱印です。／なぜおすすめ？　これまでのアイテムすべてを「統合」する存在です。御朱印を集めることは、日本の神社仏閣を深く巡り、神様や仏様と向き合ったことの証明になります。あなたの日本旅行の、最も個人的で貴重なコレクションになります。' }
    ]
  };


  /* ── テーマM：日本の神社仏閣でのマナー10選 ─────────────── */
  var THEME_M = {
    id: 'M',
    unit: '',
    nomap: true,
    heroBadge: 'MANNERS 10',
    title: '神聖な場所を訪れるために。日本の神社仏閣でのマナー10選',
    lead: 'Respectful Visit: Top 10 Etiquette Points for Visiting Japanese Shrines and Temples／'
        + '日本の神社仏閣は、美しい建築や庭園だけでなく、深くスピリチュアルな場所です。'
        + 'そこは神様や仏様が祀られている場所であり、何世紀にもわたって人々が祈りを捧げてきた場所です。'
        + '外国人観光客の皆様が、より深く日本文化を体験し、地域の人々と敬意を持って接するために、'
        + '最低限知っておいてほしい10のマナーを厳選しました。'
        + 'これらを守ることで、あなたの旅はより豊かで、思い出深いものになるでしょう。',
    hero: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Kehi-jingu_otorii-2.jpg/1280px-Kehi-jingu_otorii-2.jpg',
    heroCap: '氣比神宮 大鳥居（福井県敦賀市）',
    items: [
      { rank:1, name:'服装：敬意の表れとしての「控えめさ」',
        rows:[['English','Modesty as a sign of respect'],
              ['ポイント','「肩」と「膝」を隠すことを意識しましょう']],
        photo:'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ed/Courtyard_of_Meiji_Shrine_20190717.jpg/1280px-Courtyard_of_Meiji_Shrine_20190717.jpg',
        cap:'明治神宮 境内（東京都渋谷区）',
        text:'神社仏閣は「祈りの場」です。露出の多い服装は避けましょう。特に「肩」と「膝」を隠すことを意識してください。タンクトップ、ミニスカート、ショートパンツは不適切とされる場合があります。／なぜ？　控えめな服装は、神聖な場所や、そこで働く神職・僧侶、そして他の参拝者に対する敬意の表れです。' },

      { rank:2, name:'鳥居と山門：境界線を越える前に',
        rows:[['English','The boundary line'],
              ['ポイント','くぐる前に一礼（軽めの礼）をしてから入りましょう']],
        photo:'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Kawagoe_Hikawa_Shrine%2C_Kawagoe_City%3B_December_2019_%2801%29.jpg/1280px-Kawagoe_Hikawa_Shrine%2C_Kawagoe_City%3B_December_2019_%2801%29.jpg',
        cap:'川越氷川神社 大鳥居（埼玉県川越市）',
        text:'神社の「鳥居（Torii）」とお寺の「山門（Sanmon）」は、神聖な領域と俗世の境界線です。くぐる前に、一礼（軽めの礼）をしてから入りましょう。／なぜ？　「お邪魔します」という挨拶と、神聖な場所に入る準備ができたことを示す行為です。' },

      { rank:3, name:'参道の歩き方：神様・仏様の通り道',
        rows:[['English','The path for the deity / Buddha'],
              ['ポイント','中央（正中）は避けて、右端または左端を歩きましょう']],
        photo:'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/%E7%99%BD%E5%B1%B1%E6%AF%94%E5%92%A9%E7%A5%9E%E7%A4%BE_01.jpg/1280px-%E7%99%BD%E5%B1%B1%E6%AF%94%E5%92%A9%E7%A5%9E%E7%A4%BE_01.jpg',
        cap:'白山比咩神社 表参道（石川県白山市）',
        text:'鳥居や山門から本殿へと続く道を「参道（Sando）」と呼びます。参道の「中央」を歩くのは避けましょう。代わりに、右端または左端を歩くのが好ましいです。／なぜ？　参道の中央（正中：Seichu）は、神様や仏様が通る道とされているためです。' },

      { rank:4, name:'手水での清め：心身を清める儀式',
        rows:[['English','Ritual purification'],
              ['手順','①柄杓を右手で持ち左手を洗う ②持ち替えて右手を洗う ③左手に水を受けて口をすすぐ（柄杓に口をつけない） ④残った水で柄を洗う ⑤元の場所に戻す']],
        photo:'https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/%E6%89%8B%E6%B0%B4%E8%88%8E_-_panoramio_%282%29.jpg/1280px-%E6%89%8B%E6%B0%B4%E8%88%8E_-_panoramio_%282%29.jpg',
        cap:'手水舎',
        text:'多くの神社仏閣の入り口近くには「手水舎（Chozuya）」と呼ばれる、水が湧き出る場所があります。ここで、参拝前に心と体を清めます。／なぜ？　神様や仏様の前に立つ前に、汚れ（ケガレ）を落とすためです。なお、近年は柄杓を置かず、流水で手を清める形式の手水舎も増えています。' },

      { rank:5, name:'参拝の作法（神社）：二礼二拍手一礼',
        rows:[['English','Two bows, two claps, one bow'],
              ['手順','①お賽銭を入れる ②鈴があれば鳴らす ③深く二回礼 ④胸の前で二回拍手 ⑤手を合わせて静かに祈る ⑥最後に深く一回礼']],
        photo:'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Haiden_of_Uesugi_Shrine.jpg/1280px-Haiden_of_Uesugi_Shrine.jpg',
        cap:'上杉神社 拝殿（山形県米沢市）',
        text:'神社での参拝は、一般的に「二礼二拍手一礼（Ni-rei Ni-hakushu Ichi-rei）」という特定の動作で行います。鈴を鳴らすのは神様をお呼びするためです。なお出雲大社など、四拍手の作法をとる神社もあります。掲示があればそれに従いましょう。' },

      { rank:6, name:'参拝の作法（お寺）：静かな礼、拍手はしない',
        rows:[['English','Silent bowing, no clapping'],
              ['手順','①お賽銭を入れる ②鐘があれば突く（不可の寺も） ③線香やロウソクがあれば供える ④胸の前で手を合わせて静かに祈る（拍手はしない） ⑤最後に深く一回礼']],
        photo:'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Asakusa_Senso-ji_2021-12_ac_%282%29.jpg/1280px-Asakusa_Senso-ji_2021-12_ac_%282%29.jpg',
        cap:'浅草寺 本堂（東京都台東区）',
        text:'お寺での参拝は、拍手をしません。静かに手を合わせる（合掌：Gassho）のが基本です。鐘は参拝の後に突くと「戻り鐘」といって縁起が良くないとされるため、突く場合は参拝の前に。お寺によっては鐘を突けない場合もあるので、掲示を確認してください。' },

      { rank:7, name:'お賽銭：神様・仏様への贈り物',
        rows:[['English','The offering'],
              ['ポイント','硬貨は優しく入れましょう。額に決まりはありません']],
        photo:'https://upload.wikimedia.org/wikipedia/commons/1/11/Japanese_offertory_box.jpg',
        cap:'賽銭箱',
        text:'参拝の際、お賽銭箱に硬貨を入れます。これは願いを叶えてもらうための「代金」ではなく、神様や仏様への「贈り物」や「感謝」です。／マナー：硬貨は優しく入れましょう。乱暴に投げつけるのは不適切です。額に決まりはありませんが、5円硬貨は「ご縁（良い繋がり）」があるとして縁起が良いとされています。' },

      { rank:8, name:'御朱印と御守り：敬意を持った取り扱い',
        rows:[['English','Respectful handling'],
              ['ポイント','御朱印には専用の御朱印帳が必要です']],
        photo:'https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Isagawa-jinja_Shuin.jpg/1280px-Isagawa-jinja_Shuin.jpg',
        cap:'御朱印（率川神社）',
        text:'「御朱印（Goshuin）」は、参拝の証として授与される芸術的な墨書きと朱印です。「御守り（Omamori）」は、神様や仏様の力が宿るとされるお守りです。／マナー：御朱印をいただくには、専用の「御朱印帳（Goshuin-cho）」が必要です。御朱印は参拝を済ませてからいただきましょう。御朱印や御守りは神聖なものです。カバンの中に乱暴にしまったり、粗末に扱ったりしないでください。' },

      { rank:9, name:'写真撮影：標識に従いましょう',
        rows:[['English','Observe the signs'],
              ['ポイント','本殿の内部や仏像は撮影禁止のことが多いです']],
        photo:'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/%E6%9D%B1%E5%A4%A7%E5%AF%BA_%E5%A4%A7%E4%BB%8F%E6%AE%BF%EF%BC%882024%E5%B9%B4%EF%BC%89.jpg/1280px-%E6%9D%B1%E5%A4%A7%E5%AF%BA_%E5%A4%A7%E4%BB%8F%E6%AE%BF%EF%BC%882024%E5%B9%B4%EF%BC%89.jpg',
        cap:'東大寺 大仏殿（奈良県奈良市）',
        text:'日本の神社仏閣は美しい写真スポットですが、どこでも撮影して良いわけではありません。特に「本殿の内部」や「仏像」は撮影禁止であることが多いです。／マナー：撮影禁止の標識（No Photography）をよく確認しましょう。他の参拝者の迷惑になるような撮影（フラッシュ、三脚、通路を塞ぐなど）は避けましょう。' },

      { rank:10, name:'静寂：静かで平和な雰囲気を保ちましょう',
        rows:[['English','Maintain the peaceful atmosphere'],
              ['ポイント','大声で話したり、走ったりしないでください']],
        photo:'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Inner_Sando_of_Kashima_Shrine.jpg/1280px-Inner_Sando_of_Kashima_Shrine.jpg',
        cap:'鹿島神宮 奥参道（茨城県鹿嶋市）',
        text:'神社仏閣は、人々が静かに祈り、心を落ち着ける場所です。大声で話したり、走ったりしないでください。／なぜ？　誰かが人生の重要な岐路で祈っているかもしれません。誰もが静かに神様や仏様と向き合えるよう、配慮しましょう。' }
    ]
  };


  /* ── テーマN：外国人に人気な神社仏閣ベスト10 ＋ 特別編 ────── */
  var THEME_N = {
    id: 'N',
    heroBadge: 'BEST 10 ＋ 特別編',
    title: 'インバウンド最前線！外国人に人気な神社仏閣ベスト10 ＋ 特別編',
    lead: 'SNSでの話題性、旅行予約サイトのランキング、観光庁のデータ、'
        + 'そして外国人向けツアーの組み込み状況などを総合的に分析し、'
        + '外国人観光客から熱狂的な支持を集める日本の神社仏閣をランキング形式でご紹介します。'
        + 'さらに、特別編として、徳川将軍家の威光を伝える日光東照宮も加えた、決定版です。',
    hero: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/2018_Senbon_Torii_path.jpg/1280px-2018_Senbon_Torii_path.jpg',
    heroCap: '伏見稲荷大社 千本鳥居（京都市伏見区）',
    items: [
      { rank:1, name:'伏見稲荷大社', area:'京都府京都市伏見区',
        rows:[['おすすめの理由','数千本もの朱塗りの鳥居が続く「千本鳥居」。外国人に人気の日本の観光スポットで長年上位をキープする不動のトップです'],
              ['マナー','山を登る際は他の参拝者の邪魔にならないよう端を歩きましょう'],
              ['御朱印','定番のほか、季節限定のものもあります'],
              ['アクセス','JR稲荷駅または京阪伏見稲荷駅から徒歩すぐ']],
        photo:'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Fushimi_Inari_Romon.jpg/1280px-Fushimi_Inari_Romon.jpg',
        cap:'伏見稲荷大社 楼門',
        text:'全国に約3万社あるお稲荷さんの総本宮。稲荷山全体が神域で、願いが通ったお礼として奉納された鳥居がトンネルのように連なります。早朝は人が少なく、朱色の回廊を静かに歩けます。山頂まで往復すると2時間ほど。歩きやすい靴でお出かけください。' },

      { rank:2, name:'浅草寺', area:'東京都台東区',
        rows:[['おすすめの理由','東京で最も古いお寺。巨大な赤い提灯の「雷門」は東京の顔。仲見世通りの食べ歩きや買い物も含め、外国人にとっての「日本」が詰まっています'],
              ['マナー','仏教のお寺です。本堂前の大きな香炉の煙を体に浴び、無病息災を祈りましょう'],
              ['御朱印','力強い墨書きと朱印が特徴です'],
              ['アクセス','各線浅草駅から徒歩すぐ']],
        photo:'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Kaminarimon_%28outer_gate%29%2C_Sensoji_Temple%2C_Akakusa%2C_Tokyo.jpg/1280px-Kaminarimon_%28outer_gate%29%2C_Sensoji_Temple%2C_Akakusa%2C_Tokyo.jpg',
        cap:'浅草寺 雷門',
        text:'628年創建と伝わる東京最古の寺院。雷門から仲見世通りを抜けて宝蔵門、本堂へと続く参道は一日中賑わっています。人形焼きや雷おこしなど食べ歩きの名物も豊富。夜はライトアップされ、昼とはまったく違う表情を見せてくれます。' },

      { rank:3, name:'新倉山浅間神社（新倉山浅間公園・忠霊塔）', area:'山梨県富士吉田市',
        rows:[['おすすめの理由','「富士山＋五重塔（忠霊塔）＋桜（または紅葉）」が1枚に収まる奇跡の絶景。SNSで世界中に拡散され、東京からの日帰りバスツアーの定番コースになりました'],
              ['マナー','神社です。鳥居をくぐるときは礼を。展望デッキは大変混雑するため、撮影は譲り合いましょう'],
              ['御朱印','五重塔と富士山がデザインされた記念になる御朱印があります'],
              ['アクセス','富士急行線下吉田駅から徒歩約20分（398段の階段あり）。東京からのツアーバスも便利です']],
        photo:'https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/Chuurei-tou_Fujiyoshida_17025277650_c59733d6ba_o.jpg/1280px-Chuurei-tou_Fujiyoshida_17025277650_c59733d6ba_o.jpg',
        cap:'新倉山浅間公園 忠霊塔と富士山',
        text:'桜の季節と紅葉の季節は特に人気が高く、早朝から撮影の列ができます。398段の「咲くや姫階段」を登った先に展望デッキがあり、そこから富士山・五重塔・街並みが一望できます。階段を避けたい方は迂回路もあります。' },

      { rank:4, name:'金閣寺（鹿苑寺）', area:'京都府京都市北区',
        rows:[['おすすめの理由','黄金に輝く舎利殿が鏡湖池に映り込む姿は視覚的なインパクトが強く、外国人観光客を魅了します。雪景色や紅葉の時期はさらに美しく、知名度は圧倒的です'],
              ['マナー','禅寺です。境内では静かに鑑賞しましょう'],
              ['御朱印','「舎利殿」の美しい墨書きと印が特徴です'],
              ['アクセス','京都駅からバスで「金閣寺道」下車']],
        photo:'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Kinkaku-ji_2015.JPG/1280px-Kinkaku-ji_2015.JPG',
        cap:'鹿苑寺 金閣（京都市北区）',
        text:'室町幕府三代将軍・足利義満の山荘を寺としたもので、正式には鹿苑寺といいます。金箔に覆われた三層の楼閣は、池に映る「逆さ金閣」とあわせて一枚の絵のよう。順路は一方通行で、混雑時もスムーズに巡れます。' },

      { rank:5, name:'清水寺', area:'京都府京都市東山区',
        rows:[['おすすめの理由','世界遺産。「清水の舞台」として知られる巨大な木造の本堂から京都市内を一望できる景色は圧巻です。参道の賑わいや、音羽の滝での体験も人気があります'],
              ['マナー','お寺です。本堂の舞台では静かにしましょう'],
              ['御朱印','千手観音に関するものなど、複数の御朱印があります'],
              ['アクセス','京都駅からバスで「清水道」または「五条坂」下車']],
        photo:'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Kiyomizu-dera%2C_Kyoto%2C_November_2016_-02.jpg/1280px-Kiyomizu-dera%2C_Kyoto%2C_November_2016_-02.jpg',
        cap:'清水寺 本堂（清水の舞台）',
        text:'釘を使わない「懸造り」で崖に張り出した本堂の舞台は、高さ約13メートル。眼下に広がる森と京都市街の眺めは季節ごとに表情を変えます。境内の音羽の滝は三筋の水が落ち、それぞれに願いが込められています。三筋すべてを飲むのは欲張りとされるのでご注意を。' },

      { rank:6, name:'厳島神社', area:'広島県廿日市市',
        rows:[['おすすめの理由','海の中にそびえ立つ「浮かぶ鳥居」は日本三景の一つであり、世界遺産にも登録されています。満潮時の神秘的な姿と、干潮時に鳥居の下まで歩ける体験はここだけのものです'],
              ['マナー','満潮時は鳥居へ歩けなくなるため、潮見表を確認しましょう。境内の鹿に食べ物を与えないでください'],
              ['御朱印','「厳島神社」の威厳ある文字と、シンプルな神紋が特徴です'],
              ['アクセス','宮島口からフェリーで約10分']],
        photo:'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Itsukushima_Shrine_Torii_Gate_%2813890465459%29.jpg/1280px-Itsukushima_Shrine_Torii_Gate_%2813890465459%29.jpg',
        cap:'厳島神社 大鳥居（広島県廿日市市）',
        text:'海上に建つ社殿は、潮の満ち引きによってまったく違う景色を見せます。満潮時は朱の回廊が海に浮かんでいるよう、干潮時は大鳥居の足元まで歩いて近づけます。訪問前に潮見表を確認して、時間を合わせるのがおすすめです。' },

      { rank:7, name:'明治神宮', area:'東京都渋谷区',
        rows:[['おすすめの理由','原宿・渋谷のすぐ隣にありながら、広大な森に包まれた静寂は外国人にとって都会のオアシス。日本の伝統的な結婚式に遭遇できることもあり、格式の高さが人気です'],
              ['マナー','神社です。入り口の鳥居をくぐるとき、一礼しましょう'],
              ['御朱印','シンプルで格式高い、洗練されたデザインです'],
              ['アクセス','JR原宿駅、地下鉄明治神宮前駅から徒歩すぐ']],
        photo:'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ed/Courtyard_of_Meiji_Shrine_20190717.jpg/1280px-Courtyard_of_Meiji_Shrine_20190717.jpg',
        cap:'明治神宮 境内（東京都渋谷区）',
        text:'明治天皇と昭憲皇太后をお祀りする神社。約70万平方メートルの「明治神宮の杜」は、全国から献木された木々を人の手で植えて育てた人工の森です。玉砂利を踏みながら大鳥居をくぐると、都心とは思えない静けさに包まれます。' },

      { rank:8, name:'高徳院（鎌倉大仏）', area:'神奈川県鎌倉市',
        rows:[['おすすめの理由','東京から日帰り可能。屋外に鎮座する巨大な青銅製の「鎌倉大仏」は視覚的に分かりやすく、鎌倉のシンボルとして愛されています。大仏の胎内に入ることもできます'],
              ['マナー','仏教のお寺です。大仏様の前では静かにしましょう'],
              ['御朱印','大仏を表す印が特徴です'],
              ['アクセス','江ノ電長谷駅から徒歩約10分']],
        photo:'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/230128_Kamakura_Daibutsu_Japan01s3.jpg/1280px-230128_Kamakura_Daibutsu_Japan01s3.jpg',
        cap:'高徳院 鎌倉大仏',
        text:'像高約11.3メートル、重量約121トンの阿弥陀如来坐像で、国宝に指定されています。屋根のない露座に鎮座しているため、青空や夕焼け、雪などその日の空とともに眺められるのが魅力。胎内拝観では鋳造の跡を内側から見学できます。' },

      { rank:9, name:'東大寺', area:'奈良県奈良市',
        rows:[['おすすめの理由','日本を象徴する「奈良の大仏」が鎮座し、世界最大級の木造建築である大仏殿は圧巻のスケール。奈良公園の鹿と触れ合えることとセットで、必須の訪問先です'],
              ['マナー','仏教のお寺です。大仏殿内では静かに。公園の鹿は神の使いとされますが野生動物です。接し方に注意しましょう'],
              ['御朱印','「華厳」の文字が力強く、複数の種類があります'],
              ['アクセス','近鉄奈良駅から徒歩約20分、またはバス']],
        photo:'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/%E6%9D%B1%E5%A4%A7%E5%AF%BA_%E5%A4%A7%E4%BB%8F%E6%AE%BF%EF%BC%882024%E5%B9%B4%EF%BC%89.jpg/1280px-%E6%9D%B1%E5%A4%A7%E5%AF%BA_%E5%A4%A7%E4%BB%8F%E6%AE%BF%EF%BC%882024%E5%B9%B4%EF%BC%89.jpg',
        cap:'東大寺 大仏殿（奈良県奈良市）',
        text:'高さ約15メートルの盧舎那仏坐像を安置する大仏殿は、現在のものでも創建時の約3分の2の規模。それでも見上げるほどの大きさです。南大門の金剛力士立像も必見。奈良公園の鹿にせんべいを与えるときは、まとめて出さず一枚ずつが安全です。' },

      { rank:10, name:'春日大社', area:'奈良県奈良市',
        rows:[['おすすめの理由','世界遺産。数千もの石灯籠と釣灯籠が並ぶ光景は幻想的です。奈良公園の中にあり、神の使いとされる鹿が歩く姿と朱塗りの社殿のコントラストが外国人観光客を魅了します'],
              ['マナー','神社です。灯籠に触れたり、鹿を驚かせたりしないでください'],
              ['御朱印','春日大社の神紋が押されたものがあります'],
              ['アクセス','近鉄奈良駅から徒歩圏内、またはバス']],
        photo:'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Kasuga-taisha%2C_chumon-1.jpg/1280px-Kasuga-taisha%2C_chumon-1.jpg',
        cap:'春日大社 中門（奈良県奈良市）',
        text:'768年の創建と伝わる、藤原氏ゆかりの古社。参道には約2000基の石灯籠が並び、回廊には約1000基の釣灯籠が吊るされています。節分と8月の「万燈籠」ではすべてに火が灯され、幻想的な光景が広がります。' },

      { rank:11, badge:'特別編', name:'日光東照宮', area:'栃木県日光市',
        rows:[['おすすめの理由','世界遺産「日光の社寺」の代表格。徳川家康公を祀り、伝統的な建築技術と極彩色の彫刻が融合した豪華絢爛な聖域です。「陽明門」「眠り猫」「三猿」の彫刻は必見'],
              ['マナー','国宝や重要文化財が多数あります。触れたり、土足禁止の場所に入ったりしないよう掲示をよく確認しましょう。静かに鑑賞するのがマナーです'],
              ['御朱印','徳川家の「葵の御紋」が入った、格式高く美しい御朱印が授与されます'],
              ['アクセス','東京（浅草・新宿）から東武鉄道の特急で約2時間、「東武日光駅」下車。駅からバスまたは徒歩']],
        photo:'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Nikko_Toshogu_Yomeimon_Gate_2024.jpg/1280px-Nikko_Toshogu_Yomeimon_Gate_2024.jpg',
        cap:'日光東照宮 陽明門（栃木県日光市）',
        text:'戦国乱世に終止符を打った徳川家康公をお祀りする社。日が暮れるまで見ていても飽きないことから「日暮の門」とも呼ばれる陽明門には、508もの彫刻が施されています。「見ざる・言わざる・聞かざる」の三猿は神厩舎に、眠り猫は奥宮へ向かう入り口にあります。深い杉木立の参道もあわせて歩きたい聖域です。' }
    ]
  };

  var THEMES = {};
  THEMES[THEME_A.id] = THEME_A;
  THEMES[THEME_D.id] = THEME_D;
  THEMES[THEME_E.id] = THEME_E;
  THEMES[THEME_F.id] = THEME_F;
  THEMES[THEME_G.id] = THEME_G;
  THEMES[THEME_H.id] = THEME_H;
  THEMES[THEME_I.id] = THEME_I;
  THEMES[THEME_J.id] = THEME_J;
  THEMES[THEME_K.id] = THEME_K;
  THEMES[THEME_L.id] = THEME_L;
  THEMES[THEME_M.id] = THEME_M;
  THEMES[THEME_N.id] = THEME_N;

  /* トップの「テーマで巡るベスト10」一覧に新テーマのカードを追加する
     （index.html の window.THEMES へ追記し、必要なときだけ描き直す） */
  function addThemeCard(){
    try {
      if (!Array.isArray(window.THEMES)) return;
      var extra = [
        { id:'K', rank:'BEST 10', theme:THEME_K, desc:'厳島・青島・白兎・伏見稲荷。海と島に宿る神々。' },
        { id:'L', rank:'ITEM 10', theme:THEME_L, desc:'御朱印帳・お守り・絵馬。参拝がもっと楽しくなる10品。' },
        { id:'M', rank:'MANNERS', theme:THEME_M, desc:'鳥居のくぐり方、手水、二礼二拍手一礼。知っておきたい作法。' },
        { id:'N', rank:'INBOUND', theme:THEME_N, desc:'伏見稲荷・浅草寺・忠霊塔。外国人に選ばれている社寺。' }
      ];
      var need = false;
      extra.forEach(function(e){
        if (!window.THEMES.some(function(x){ return x.id === e.id; })){
          window.THEMES.push({
            id: e.id, rank: e.rank,
            title: e.theme.title,
            desc: e.desc,
            img: e.theme.hero,
            fallback: e.theme.items[e.theme.items.length - 1].photo,
            lead: e.theme.lead
          });
        }
      });
      var g = document.getElementById('themeGrid');
      if (g && g.children.length){
        extra.forEach(function(e){
          if (g.innerHTML.indexOf("openThemeDetail('" + e.id + "')") < 0) need = true;
        });
      }
      if (need && typeof window.renderThemeGrid === 'function'){
        window.renderThemeGrid('themeGrid');
      }
    } catch(e){}
  }
  addThemeCard();
  setInterval(addThemeCard, 1000);
  window.WABI_THEME_RANK = THEMES;

  /* ── スタイル ─────────────────────────────────────────── */
  var css = document.createElement('style');
  css.textContent = [
    ".wtr{display:none;position:fixed;inset:0;z-index:720;background:#FAF8F4;overflow-y:auto;overflow-x:hidden;",
      "-webkit-overflow-scrolling:touch;font-family:'Shippori Mincho','Noto Serif JP',serif;color:#2D2D2D;}",
    '.wtr-hd{position:sticky;top:0;z-index:6;background:rgba(250,248,244,.96);backdrop-filter:blur(8px);',
      'border-bottom:1px solid #EFE9DE;display:flex;align-items:center;gap:8px;padding:14px 16px;',
      'max-width:500px;margin:0 auto;}',
    '.wtr-hd .b{font-size:22px;line-height:1;width:30px;cursor:pointer;}',
    '.wtr-hd .t{flex:1;text-align:center;font-size:15px;font-weight:700;letter-spacing:.05em;',
      'white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}',
    '.wtr-hd .sp{width:30px;}',

    '.wtr-hero{position:relative;max-width:500px;margin:0 auto;aspect-ratio:16/10;',
      'background:#e9e3d8 center/cover no-repeat;}',
    '.wtr-hero .bdg{position:absolute;top:14px;left:14px;background:#5D3A7A;color:#fff;',
      'font-size:11px;font-weight:700;letter-spacing:.12em;padding:6px 13px;border-radius:999px;}',
    ".wtr-hcap{max-width:500px;margin:7px auto 0;padding:0 18px;font-size:11px;color:#9a9086;",
      "font-family:'Noto Serif JP',serif;text-align:right;}",

    '.wtr-in{max-width:500px;margin:0 auto;padding:20px 18px calc(130px + env(safe-area-inset-bottom));}',
    '.wtr-ttl{font-size:22px;font-weight:800;line-height:1.5;margin:6px 0 14px;}',
    ".wtr-lead{font-family:'Noto Serif JP',serif;font-size:13.5px;line-height:2.05;color:#4a4540;",
      'background:#fff;border-radius:20px;box-shadow:0 8px 24px rgba(0,0,0,.05);padding:17px;margin-bottom:8px;}',
    '.wtr-page{font-size:11.5px;color:#8a8378;text-align:center;margin:16px 0 2px;letter-spacing:.08em;}',

    /* 順位カード */
    '.wtr-card{background:#fff;border-radius:22px;box-shadow:0 8px 26px rgba(0,0,0,.06);',
      'overflow:hidden;margin:18px 0;}',
    '.wtr-im{position:relative;width:100%;aspect-ratio:4/3;background:#e9e3d8 center/cover no-repeat;}',
    '.wtr-no{position:absolute;top:12px;left:12px;display:flex;align-items:baseline;gap:2px;',
      'background:rgba(42,32,24,.72);color:#fff;padding:6px 14px 7px;border-radius:999px;}',
    '.wtr-no b{font-size:20px;font-weight:800;line-height:1;}',
    '.wtr-no b.sm{font-size:13px;letter-spacing:.04em;}',
    '.wtr-no span{font-size:11px;}',
    '.wtr-no.g{background:linear-gradient(135deg,#C9A24A,#E0C57E);color:#3a2c14;}',
    ".wtr-icap{position:absolute;right:10px;bottom:9px;background:rgba(0,0,0,.42);color:#fff;",
      "font-size:10px;padding:3px 9px;border-radius:8px;font-family:'Noto Serif JP',serif;}",
    '.wtr-bd{padding:16px 17px 18px;}',
    '.wtr-nm{font-size:19px;font-weight:800;line-height:1.4;}',
    ".wtr-ym{font-size:11.5px;color:#8a8378;margin-top:3px;font-family:'Noto Serif JP',serif;}",
    '.wtr-meta{margin:13px 0 2px;border-top:1px solid #F1EBE0;}',
    '.wtr-row{display:flex;gap:10px;padding:9px 0;border-bottom:1px solid #F6F1E8;}',
    ".wtr-row .k{flex:0 0 84px;font-size:11.5px;color:#8a8378;font-family:'Noto Serif JP',serif;padding-top:1px;}",
    ".wtr-row .v{flex:1;font-size:12.5px;line-height:1.75;font-family:'Noto Serif JP',serif;color:#3a3630;}",
    '.wtr-row:last-child{border-bottom:none;}',
    ".wtr-tx{font-family:'Noto Serif JP',serif;font-size:13.5px;line-height:2.05;color:#3a3630;margin-top:14px;}",
    '.wtr-map{display:inline-block;margin-top:13px;font-size:12px;color:#5D3A7A;',
      'border:1px solid #E2D8EE;border-radius:999px;padding:7px 15px;text-decoration:none;}',

    /* ページ送り */
    '.wtr-pager{display:flex;gap:10px;margin:26px 0 4px;}',
    '.wtr-pager button{flex:1;height:52px;border:1px solid #E7E1D6;border-radius:16px;background:#fff;',
      "font-family:'Shippori Mincho',serif;font-size:14px;font-weight:700;color:#2D2D2D;cursor:pointer;}",
    '.wtr-pager button.main{background:#5D3A7A;border-color:#5D3A7A;color:#fff;',
      'box-shadow:0 8px 20px rgba(93,58,122,.22);}',
    '.wtr-pager button:disabled{opacity:.35;}',
    ".wtr-note{font-size:11.5px;color:#9a9086;line-height:1.9;margin-top:20px;text-align:center;",
      "font-family:'Noto Serif JP',serif;}"
  ].join('');
  document.head.appendChild(css);

  /* ── ページ本体 ───────────────────────────────────────── */
  var pg = document.createElement('div');
  pg.className = 'wtr'; pg.id = 'wabiThemeRank';
  document.body.appendChild(pg);

  // 1ページ目は1〜4位、2ページ目に5位以降をまとめる（全2ページ）
  var FIRST = 4;
  var cur = null, page = 0;
  function slice(t, p){
    return p === 0 ? t.items.slice(0, FIRST) : t.items.slice(FIRST);
  }

  function close(){ pg.style.display = 'none'; }
  window.wabiCloseThemeRank = close;

  function card(it){
    var t = cur || {};
    var unit = (t.unit === undefined) ? '位' : t.unit;
    var gold = it.rank <= 3 ? ' g' : '';
    var q = encodeURIComponent(it.name + ' ' + (it.area || ''));
    var im = it.photo
      ? '<div class="wtr-im" style="background-image:url(\'' + esc(it.photo) + '\')">'
      : '<div class="wtr-im" data-pq="' + esc(it.pq || (it.name + ' ' + (it.area || ''))) + '">';
    var no = it.badge
      ? '<span class="wtr-no' + gold + '"><b class="sm">' + esc(it.badge) + '</b></span>'
      : '<span class="wtr-no' + gold + '"><b>' + it.rank + '</b><span>' + esc(unit) + '</span></span>';

    var rows = it.rows;
    if (!rows){
      rows = [];
      if (it.season)  rows.push(['おすすめ時期', it.season]);
      if (it.access)  rows.push(['アクセス', it.access]);
      if (it.see)     rows.push(['見どころ', it.see]);
      if (it.goshuin) rows.push(['御朱印', it.goshuin]);
    }
    var meta = rows.length
      ? '<div class="wtr-meta">' + rows.map(function(r){
          return '<div class="wtr-row"><span class="k">' + esc(r[0]) + '</span>'
               + '<span class="v">' + esc(r[1]) + '</span></div>';
        }).join('') + '</div>'
      : '';

    var ym = (it.yomi || it.area)
      ? '<div class="wtr-ym">' + esc(it.yomi || '')
        + ((it.yomi && it.area) ? '　/　' : '') + esc(it.area || '') + '</div>'
      : '';

    var map = t.nomap ? ''
      : '<a class="wtr-map" href="https://www.google.com/maps/search/?api=1&query=' + q
        + '" target="_blank" rel="noopener">地図で見る ›</a>';

    return '<div class="wtr-card">'
      + im
      +   no
      +   '<span class="wtr-icap">' + esc(it.cap) + '</span>'
      + '</div>'
      + '<div class="wtr-bd">'
      +   '<div class="wtr-nm">' + esc(it.name) + '</div>'
      +   ym
      +   meta
      +   '<div class="wtr-tx">' + esc(it.text) + '</div>'
      +   map
      + '</div></div>';
  }

  function labelOf(it){
    var unit = (cur && cur.unit !== undefined) ? cur.unit : '位';
    return it.badge ? it.badge : (it.rank + unit);
  }

  function render(){
    var t = cur; if (!t) return;
    var total = t.items.length;
    var pages = total > FIRST ? 2 : 1;
    var list = slice(t, page);
    var from = page === 0 ? 0 : FIRST;
    var to = from + list.length;

    var h = '<div class="wtr-hd"><span class="b" id="wtrBack">‹</span>'
          +   '<span class="t">' + esc(t.title) + '</span><span class="sp"></span></div>';

    if (page === 0){
      h += '<div class="wtr-hero" style="background-image:url(\'' + esc(t.hero) + '\')">'
         +   '<span class="bdg">' + esc(t.heroBadge || ('BEST ' + total)) + '</span></div>'
         + '<div class="wtr-hcap">' + esc(t.heroCap) + '</div>';
    }

    h += '<div class="wtr-in">';
    if (page === 0){
      h += '<div class="wtr-ttl">' + esc(t.title) + '</div>'
         + '<div class="wtr-lead">' + esc(t.lead) + '</div>';
    }
    h += '<div class="wtr-page">' + labelOf(list[0]) + ' 〜 ' + labelOf(list[list.length - 1]) + '（' + (page + 1) + ' / ' + pages + 'ページ）</div>';
    h += list.map(card).join('');

    h += '<div class="wtr-pager">';
    if (page > 0) h += '<button id="wtrPrev">‹ ' + labelOf(t.items[0]) + '〜' + labelOf(t.items[FIRST - 1]) + 'に戻る</button>';
    if (pages > 1 && page === 0){
      h += '<button class="main" id="wtrNext">' + labelOf(t.items[FIRST]) + '〜' + labelOf(t.items[total - 1]) + 'を見る ›</button>';
    }
    h += '</div>';

    if (page === pages - 1){
      h += '<div class="wtr-note">写真：ウィキメディア・コモンズ／Google<br>'
         + '拝観時間・御朱印の授与状況は変更される場合があります。<br>'
         + 'お出かけの前に各社寺の公式情報をご確認ください。</div>';
    }
    h += '</div>';

    pg.innerHTML = h;
    document.getElementById('wtrBack').onclick = function(){
      if (page > 0){ page = 0; render(); } else close();
    };
    var pv = document.getElementById('wtrPrev');
    if (pv) pv.onclick = function(){ page--; render(); pg.scrollTop = 0; };
    var nx = document.getElementById('wtrNext');
    if (nx) nx.onclick = function(){ page++; render(); pg.scrollTop = 0; };
    pg.scrollTop = 0;
    fillPlaces();
  }

  /* ウィキメディアに写真がない社寺は Google の写真で埋める */
  var pqCache = {};
  function fillPlaces(){
    var els = pg.querySelectorAll('.wtr-im[data-pq]');
    if (!els.length) return;
    els.forEach(function(el, i){
      var q = el.getAttribute('data-pq');
      if (pqCache[q]){ el.style.backgroundImage = 'url("' + pqCache[q] + '")'; return; }
      setTimeout(function(){
        try {
          if (!(window.google && google.maps && google.maps.places)) return;
          var svc = new google.maps.places.PlacesService(document.createElement('div'));
          svc.findPlaceFromQuery({ query: q, fields: ['photos'] }, function(res, st){
            if (st !== google.maps.places.PlacesServiceStatus.OK) return;
            if (!res || !res[0] || !res[0].photos || !res[0].photos[0]) return;
            var url = res[0].photos[0].getUrl({ maxWidth: 900, maxHeight: 700 });
            pqCache[q] = url;
            pg.querySelectorAll('.wtr-im[data-pq="' + q + '"]').forEach(function(x){
              x.style.backgroundImage = 'url("' + url + '")';
            });
          });
        } catch(e){}
      }, 150 + i * 250);
    });
  }

  function open(id){
    var t = THEMES[id];
    if (!t) return false;
    ['pgShrineDetail','pgMap','pgRegister','pgAiRoute','pgAiResult','pgAreaSearch','pgPostDetail',
     'pgTourList','pgSeasonList','pgEcList','pgOsupplyList','pgShukatsuList','pgArticleList',
     'pgThemeDetail','wabiRoutePg','wabiRankMore','wxGuide','wxInvite','wxSignup','wcMypage',
     'wcPost','wabiListPg','wabiFeedPg','wabiPostPg'].forEach(function(x){
      var e = document.getElementById(x); if (e) e.style.display = 'none';
    });
    var mp = document.getElementById('wcMypage'); if (mp) mp.classList.remove('show');
    cur = t; page = 0; render();
    pg.style.display = 'block';
    try { if (window.WabiExp) WabiExp.add('read_article'); } catch(e){}
    return true;
  }

  // 既存の openThemeDetail を差し替え（用意のないテーマは今までどおり）
  function hook(){
    if (typeof window.openThemeDetail === 'function' && window.openThemeDetail.__wtr) return;
    var orig = window.openThemeDetail;
    var f = function(id){
      if (open(id)) return;
      if (typeof orig === 'function') return orig.apply(this, arguments);
    };
    f.__wtr = true;
    window.openThemeDetail = f;
  }
  hook();
  setInterval(hook, 900);

  // 下部メニューを押したら閉じる
  (function(){
    var nav = document.getElementById('wabiNav');
    if (nav) nav.addEventListener('click', close, true);
  })();
})();


/* ══════════════════════════════════════════════════════════════
   わびなび：オーバーレイ表示中に背面（トップページ）が見えてしまう問題の修正
   ・巡拝ルート記事などを開いている間は body のスクロールを止める
   ・端までスクロールしたときの「スクロールの連鎖」も止める
   （2026-08-04 / index.html は触らず concierge.js から追記）
   ══════════════════════════════════════════════════════════════ */
(function(){
  if (window.__wabiScrollLock) return;
  window.__wabiScrollLock = true;

  var css = document.createElement('style');
  css.textContent = [
    '#wabiRoutePg,.wtr,#wabiPostPg,#wabiListPg,#wabiFeedPg,#wabiRankMore,',
    '#pgShrineDetail,#pgArticleDetail,#pgThemeDetail,#wxGuide,#wxInvite,#wxSignup,#wcMypage,',
    '#pgMap,#pgAiRoute,#pgAiResult,#pgSeasonList,#pgEcList,#pgArticleList,#pgTourList,',
    '#pgAreaSearch,#pgRegister',
    '{overscroll-behavior:contain;}',
    'html.wabiLock,body.wabiLock{overflow:hidden !important;height:100% !important;}',
    'html.wabiLock{background:#FAF8F4 !important;}'
  ].join('');
  document.head.appendChild(css);

  var IDS = ['wabiRoutePg','wabiThemeRank','wabiPostPg','wabiListPg','wabiFeedPg','wabiRankMore',
             'pgShrineDetail','pgArticleDetail','pgThemeDetail','wxGuide','wxInvite','wxSignup',
             'wcMypage','pgMap','pgAiRoute','pgAiResult','pgSeasonList','pgEcList','pgArticleList',
             'pgTourList','pgAreaSearch','pgRegister'];

  var y = 0, locked = false;

  function anyOpen(){
    for (var i = 0; i < IDS.length; i++){
      var e = document.getElementById(IDS[i]);
      if (!e) continue;
      var cs = getComputedStyle(e);
      if (cs.display !== 'none' && cs.visibility !== 'hidden'
          && e.getBoundingClientRect().height > 0) return true;
    }
    return false;
  }

  function tick(){
    var open = anyOpen();
    if (open && !locked){
      y = window.scrollY || window.pageYOffset || 0;
      document.documentElement.classList.add('wabiLock');
      document.body.classList.add('wabiLock');
      locked = true;
    } else if (!open && locked){
      document.documentElement.classList.remove('wabiLock');
      document.body.classList.remove('wabiLock');
      locked = false;
      window.scrollTo(0, y);
    }
  }

  setInterval(tick, 250);
})();


/* ══════════════════════════════════════════════════════════════
   わびなび：記事などの一番下が下部メニューに隠れる問題の修正
   ・オーバーレイ各ページの下に余白を足して、末尾まで読めるようにする
   （2026-08-04 / index.html は触らず concierge.js から追記）
   ══════════════════════════════════════════════════════════════ */
(function(){
  if (window.__wabiBottomPad2) return;
  window.__wabiBottomPad2 = true;
  var css = document.createElement('style');
  css.textContent =
    '#pgArticleDetail,#pgShrineDetail,#wabiRoutePg,#wabiFeedPg,#wabiListPg,'
    + '#wabiPostPg,#wabiRankMore'
    + '{padding-bottom:calc(124px + env(safe-area-inset-bottom)) !important;}';
  document.head.appendChild(css);
})();


/* ══════════════════════════════════════════════════════════════
   わびなび：オーバーレイの後ろにトップページが見えてしまう問題の修正（第2弾）
   ・iPhoneのアドレスバーが伸縮すると画面の高さが変わり、
     inset:0 で作った全画面ページの下に隙間ができて背面が見えていた
     → 高さを 100dvh（実際の表示領域）に合わせる
   ・保険として、全オーバーレイの背面に不透明の下地（#wabiBackdrop）を敷く
   ・マイページの登場アニメが「6px下にずれたまま」止まることがあったため
     透明度だけのアニメに変更
   （2026-08-05 / index.html は触らず concierge.js から追記）
   ══════════════════════════════════════════════════════════════ */
(function(){
  if (window.__wabiBackdrop) return;
  window.__wabiBackdrop = true;

  var IDS = ['wcMypage','wabiRoutePg','wabiThemeRank','wabiPostPg','wabiListPg','wabiFeedPg',
             'wabiRankMore','pgShrineDetail','pgArticleDetail','pgThemeDetail','wxGuide','wxInvite',
             'wxSignup','pgMap','pgAiRoute','pgAiResult','pgSeasonList','pgEcList','pgArticleList',
             'pgTourList','pgAreaSearch','pgRegister','wcPost'];
  var SEL = IDS.map(function(i){ return '#' + i; }).join(',');

  var css = document.createElement('style');
  css.textContent = [
    /* 画面の実際の高さに合わせる（アドレスバーの伸縮対策） */
    SEL + '{height:100dvh !important;}',
    /* 全オーバーレイの背面に敷く不透明の下地 */
    '#wabiBackdrop{position:fixed;left:0;top:0;width:100%;height:100dvh;min-height:100vh;',
      'background:#FAF8F4;z-index:99;display:none;pointer-events:none;}',
    /* マイページの登場アニメは透明度だけに（ずれたまま止まるのを防ぐ） */
    '#wcMypage.show{animation:wabiFadeOnly .45s ease !important;}',
    '@keyframes wabiFadeOnly{from{opacity:0}to{opacity:1}}'
  ].join('');
  document.head.appendChild(css);

  var bd = document.createElement('div');
  bd.id = 'wabiBackdrop';
  function attach(){
    if (!document.body) return setTimeout(attach, 200);
    if (!document.getElementById('wabiBackdrop')) document.body.insertBefore(bd, document.body.firstChild);
  }
  attach();

  function anyOpen(){
    for (var i = 0; i < IDS.length; i++){
      var e = document.getElementById(IDS[i]);
      if (!e) continue;
      var c = getComputedStyle(e);
      if (c.display !== 'none' && c.visibility !== 'hidden'
          && e.getBoundingClientRect().height > 0) return true;
    }
    return false;
  }

  setInterval(function(){
    try { bd.style.display = anyOpen() ? 'block' : 'none'; } catch(e){}
  }, 250);
})();

/* 会員登録・ログインのページだけ背景が透明だったので不透明にする */
(function(){
  if (window.__wabiRegBg) return;
  window.__wabiRegBg = true;
  var s = document.createElement('style');
  s.textContent = '#pgRegister{background:#FAF8F4 !important;}';
  document.head.appendChild(s);
})();


/* ══════════════════════════════════════════════════════════════
   わびなび：デザインシステム 第1段階
   ・デザイントークン（色・余白・角丸・影）を1か所に定義
   ・ボタンの高さと角丸を統一（タップしやすい大きさに）
   ・セクションの余白を 32px / 左右20px に統一
   ・生成り色を #FAF8F3 に一本化
   ・おすすめ神社ランキングのカードを整える
     （写真は1枚だけ・全カード同じ高さ・同じ写真サイズ）
   （2026-08-05 / index.html は触らず concierge.js から追記）
   ══════════════════════════════════════════════════════════════ */
(function(){
  if (window.__wabiDS1) return;
  window.__wabiDS1 = true;

  var css = document.createElement('style');
  css.id = 'wabiDesignSystem1';
  css.textContent = [

    /* ── トークン ─────────────────────────── */
    ':root{',
      '--paper:#FAF8F3;--surface:#FFFFFF;--surface-2:#F5F0E6;',
      '--line:#ECE6DA;--line-strong:#D8D2C4;',
      '--ink:#2D2A26;--ink-2:#6E6459;--ink-3:#9A9086;',
      '--vermilion:#A83320;--purple:#3A1D5D;--gold:#C9A24A;',
      '--s1:4px;--s2:8px;--s3:12px;--s4:16px;--s5:20px;',
      '--s6:24px;--s7:32px;--s8:40px;--s9:48px;',
      '--r-s:8px;--r-m:16px;--r-l:24px;--r-full:999px;',
      '--sh-1:0 1px 2px rgba(58,42,24,.04), 0 2px 8px rgba(58,42,24,.04);',
      '--sh-2:0 2px 4px rgba(58,42,24,.05), 0 8px 20px rgba(58,42,24,.06);',
      '--sh-3:0 8px 32px rgba(58,42,24,.10);',
    '}',

    /* ── 生成りを1色に ─────────────────────── */
    'html,body,#wabiBackdrop,#wabiRoutePg,.wtr,#wabiPostPg,#wabiListPg,',
    '#wabiFeedPg,#wabiRankMore,#wcMypage,#pgRegister',
    '{background-color:#FAF8F3 !important;}',

    /* ── セクションの余白 ───────────────────── */
    '.home-sec{padding:32px 20px 0 !important;}',
    '.sec{padding:32px 20px 0 !important;}',

    /* ── ボタン ───────────────────────────── */
    '.hero-search-cta,.btn-search,.wcp-postbtn',
    '{min-height:52px !important;border-radius:999px !important;',
     'font-size:15px !important;font-weight:700 !important;}',
    '.wabi-rk-btn,.wgd-btn{min-height:40px !important;border-radius:999px !important;',
     'font-size:12px !important;}',
    '.wl-btn{min-height:40px !important;}',
    '.hero-search-pill,.hero-search-toggle{min-height:32px !important;border-radius:999px !important;}',
    '.wtr-pager button{height:52px !important;border-radius:999px !important;}',
    /* 押したときにわずかに沈む */
    '.hero-search-cta:active,.btn-search:active,.wcp-postbtn:active,',
    '.wabi-rk-btn:active,.wgd-btn:active,.wtr-pager button:active',
    '{transform:scale(.98);transition:transform .12s ease-out;}',

    /* ── おすすめ神社ランキングのカード ───────── */
    /* 写真は「1枚だけ」。下の小さな写真の帯は出さない */
    '#list .rcard .pstrip,.rcard .pstrip,.pstrip{display:none !important;}',
    /* カードの見た目を統一 */
    '.rcard{border-radius:16px !important;border:1px solid #ECE6DA !important;',
     'box-shadow:0 1px 2px rgba(58,42,24,.04),0 2px 8px rgba(58,42,24,.04) !important;}',
    '.rcard.r1{border:1px solid #C9A24A !important;background:#fff !important;',
     'box-shadow:0 0 0 1px rgba(201,168,76,.22),0 2px 10px rgba(58,42,24,.06) !important;}',
    /* 名前・タグ・住所の高さを揃えて、写真の位置を全カードで合わせる */
    '.rhd{min-height:130px !important;align-items:flex-start !important;}',
    /* 写真は余計な枠・影を外して、比率を揃える */
    '.pgallery{border:none !important;background:transparent !important;',
     'box-shadow:none !important;padding:0 !important;border-radius:0 !important;}',
    '.pgallery-main{aspect-ratio:4/3 !important;border-radius:0 !important;}',

    /* ── 動きが苦手な方への配慮 ───────────────── */
    '@media (prefers-reduced-motion: reduce){*{animation:none !important;transition:none !important;}}'

  ].join('');
  document.head.appendChild(css);
})();

/* デザインシステム 第1段階の仕上げ：あとから上書きされていた2つのボタンの角丸 */
(function(){
  if (window.__wabiDS1b) return;
  window.__wabiDS1b = true;
  function put(){
    if (document.getElementById('wabiDS1b')) return;
    var s = document.createElement('style');
    s.id = 'wabiDS1b';
    s.textContent = '.hero-search-cta.hero-search-cta{border-radius:999px !important;}'
      + '.hero-search-pill.hero-search-pill,.hero-search-toggle.hero-search-toggle{border-radius:999px !important;}';
    document.head.appendChild(s);
  }
  put();
  setInterval(function(){ var s=document.getElementById('wabiDS1b'); if(s) document.head.appendChild(s); }, 3000);
})();


/* ══════════════════════════════════════════════════════════════
   わびなび：デザインシステム 第2段階＋AIルートの「すべて見る」
   ・すべてのカードの角丸を16px・影を1種類に統一
   ・カード内の写真の比率を 4:3 に統一
   ・AIルートの周辺スポット「すべて見る」を実装
     （以前は「API接続後に対応予定です」と出るだけだった）
   （2026-08-05 / index.html は触らず concierge.js から追記）
   ══════════════════════════════════════════════════════════════ */
(function(){
  if (window.__wabiDS2) return;
  window.__wabiDS2 = true;

  var css = document.createElement('style');
  css.id = 'wabiDesignSystem2';
  css.textContent = [
    /* カードの角丸と影を統一 */
    '.theme-card.theme-card,.route-card.route-card,.wev-card.wev-card,.ec-card.ec-card,',
    '.tour-card.tour-card,.art-card.art-card,.wc-card.wc-card,.wfd-card.wfd-card,',
    '.wtr-card.wtr-card,.wgd-card.wgd-card,.rcard.rcard,.wcb-card.wcb-card{',
      'border-radius:16px !important;',
      'box-shadow:0 1px 2px rgba(58,42,24,.04),0 2px 8px rgba(58,42,24,.04) !important;}',
    /* 写真の比率を 4:3 に統一 */
    '.theme-card.theme-card{aspect-ratio:4/3 !important;}',
    '#list .rcard .pgallery-main,.pgallery-main.pgallery-main{aspect-ratio:4/3 !important;}',
    '.art-thumb img,.art-thumb{aspect-ratio:4/3 !important;object-fit:cover !important;height:auto !important;}'
  ].join('');
  document.head.appendChild(css);
})();

/* ── AIルート：周辺スポットの「すべて見る」 ────────────────── */
(function(){
  if (window.__wabiAllSpots) return;
  window.__wabiAllSpots = true;

  var TYPE = {
    'グルメ':'restaurant', 'カフェ・スイーツ':'cafe', '観光スポット':'tourist_attraction',
    '体験・アクティビティ':'tourist_attraction', '宿泊施設':'lodging'
  };

  var css = document.createElement('style');
  css.textContent = [
    '#wcAllPg{position:fixed;inset:0;height:100dvh;z-index:340;background:#FAF8F3;display:none;',
      'overflow-y:auto;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;',
      "font-family:'Shippori Mincho','Noto Serif JP',serif;color:#2D2A26;",
      'padding-bottom:calc(124px + env(safe-area-inset-bottom));}',
    '.wap-hd{position:sticky;top:0;z-index:5;background:rgba(250,248,243,.96);backdrop-filter:blur(8px);',
      'border-bottom:1px solid #ECE6DA;display:flex;align-items:center;gap:8px;padding:14px 20px;',
      'max-width:500px;margin:0 auto;}',
    '.wap-hd .b{font-size:22px;width:30px;cursor:pointer;line-height:1;}',
    '.wap-hd .t{flex:1;text-align:center;font-size:15px;font-weight:700;letter-spacing:.04em;}',
    '.wap-in{max-width:500px;margin:0 auto;padding:20px;}',
    ".wap-note{font-size:12px;color:#9A9086;line-height:1.85;margin-bottom:16px;font-family:'Noto Serif JP',serif;}",
    '.wap-row{display:flex;gap:12px;align-items:center;background:#fff;border-radius:16px;padding:12px;',
      'margin-bottom:12px;box-shadow:0 1px 2px rgba(58,42,24,.04),0 2px 8px rgba(58,42,24,.04);}',
    '.wap-im{width:96px;height:72px;border-radius:12px;flex:0 0 96px;background:#F5F0E6 center/cover no-repeat;}',
    '.wap-bd{flex:1;min-width:0;}',
    '.wap-nm{font-size:15px;font-weight:700;line-height:1.45;}',
    ".wap-me{font-size:12px;color:#6E6459;margin-top:4px;line-height:1.6;font-family:'Noto Serif JP',serif;}",
    '.wap-btn{flex:0 0 auto;min-height:40px;border-radius:999px;border:1px solid #D8D2C4;background:#fff;',
      'color:#3A1D5D;font-size:12px;font-weight:700;padding:0 14px;cursor:pointer;white-space:nowrap;',
      "font-family:'Shippori Mincho',serif;}",
    '.wap-btn.on{background:#3A1D5D;color:#fff;border-color:#3A1D5D;}',
    '.wap-btn:active{transform:scale(.98);}'
  ].join('');
  document.head.appendChild(css);

  var pg = document.createElement('div');
  pg.id = 'wcAllPg';
  pg.innerHTML = '<div class="wap-hd"><span class="b" id="wapBack">‹</span>'
    + '<span class="t" id="wapTit"></span><span style="width:30px"></span></div>'
    + '<div class="wap-in" id="wapBody"></div>';
  function attach(){
    if (!document.body) return setTimeout(attach, 200);
    if (!document.getElementById('wcAllPg')){
      document.body.appendChild(pg);
      document.getElementById('wapBack').onclick = function(){ pg.style.display = 'none'; };
      var nav = document.getElementById('wabiNav');
      if (nav) nav.addEventListener('click', function(){ pg.style.display = 'none'; }, true);
    }
  }
  attach();

  function baseRoute(){
    var sub = document.querySelector('#wcInline .wc-sec-sub');
    var nm = sub ? (sub.textContent.split('ベース：')[1] || '').replace(/[）)]\s*$/, '').trim() : '';
    var rs = window._dynamicRoutes || window.AI_ROUTES || [];
    for (var i = 0; i < rs.length; i++){ if (rs[i].name === nm) return rs[i]; }
    return rs[0] || null;
  }

  function open(secEl){
    if (!secEl) return;
    var titEl = secEl.querySelector('.wc-sec-tit');
    var tit = titEl ? titEl.textContent.trim() : '';
    var type = TYPE[tit] || 'tourist_attraction';
    var r = baseRoute();
    if (!r || !r.spots || !r.spots[0] || !r.spots[0].lat){
      if (typeof showToast === 'function') showToast('周辺の位置情報を取得できませんでした');
      return;
    }
    if (!(window.google && google.maps && google.maps.places)){
      if (typeof showToast === 'function') showToast('地図の読み込みを待っています。少しあとでお試しください');
      return;
    }
    var s0 = r.spots[0];
    var near = String(s0.name).replace(/[（(].*$/, '');
    document.getElementById('wapTit').textContent = tit;
    var body = document.getElementById('wapBody');
    body.innerHTML = '<div class="wap-note">' + near + 'の周辺を探しています…</div>';
    pg.style.display = 'block';
    pg.scrollTop = 0;

    var svc = new google.maps.places.PlacesService(document.createElement('div'));
    svc.nearbySearch({ location: new google.maps.LatLng(s0.lat, s0.lng), radius: 1500, type: type },
    function(res, st){
      if (st !== google.maps.places.PlacesServiceStatus.OK || !res){
        body.innerHTML = '<div class="wap-note">周辺の情報を取得できませんでした。'
          + '時間をおいてもう一度お試しください。</div>';
        return;
      }
      var list = res.filter(function(p){ return (p.user_ratings_total || 0) >= 5 && p.name !== s0.name; })
        .sort(function(a, b){ return (b.rating || 0) - (a.rating || 0); })
        .slice(0, 12);

      var have = {};
      document.querySelectorAll('#wcInline .wc-card .wc-name').forEach(function(n){
        have[n.textContent.trim()] = n.closest('.wc-card');
      });

      var h = '<div class="wap-note">' + near + 'の周辺から' + list.length + '件。'
        + '「＋ ルートに追加」はAIが選んだおすすめの候補に対応しています。'
        + 'そのほかの候補は「地図で見る」からご確認ください。</div>';

      list.forEach(function(p, i){
        var ph = (p.photos && p.photos.length) ? p.photos[0].getUrl({ maxWidth: 300, maxHeight: 220 }) : '';
        var card = have[p.name];
        h += '<div class="wap-row">'
          + '<div class="wap-im" style="' + (ph ? "background-image:url('" + ph + "')" : '') + '"></div>'
          + '<div class="wap-bd"><div class="wap-nm">' + p.name + '</div>'
          + '<div class="wap-me">★' + (p.rating || '-') + '（' + (p.user_ratings_total || 0) + '）'
          + (p.vicinity ? '<br>' + p.vicinity : '') + '</div></div>'
          + '<button class="wap-btn" data-i="' + i + '" data-has="' + (card ? '1' : '0') + '">'
          + (card ? '＋ 追加' : '地図で見る') + '</button>'
          + '</div>';
      });
      body.innerHTML = h;

      body.querySelectorAll('.wap-btn').forEach(function(b){
        b.onclick = function(){
          var p = list[+b.getAttribute('data-i')];
          if (b.getAttribute('data-has') === '1'){
            var card = have[p.name];
            var add = card && card.querySelector('.wc-add');
            if (add){
              add.click();
              b.classList.toggle('on');
              b.textContent = add.classList.contains('on') ? '✓ 追加済み' : '＋ 追加';
            }
          } else {
            window.open('https://www.google.com/maps/search/?api=1&query='
              + encodeURIComponent(p.name + ' ' + (p.vicinity || '')), '_blank');
          }
        };
      });
    });
  }

  function bind(){
    document.querySelectorAll('#wcInline .wc-all').forEach(function(a){
      if (a.getAttribute('data-wap')) return;
      a.setAttribute('data-wap', '1');
      a.onclick = function(e){ e.stopPropagation(); open(a.closest('.wc-sec')); };
    });
  }
  bind();
  setInterval(bind, 800);
})();


/* ══════════════════════════════════════════════════════════════
   わびなび：デザインシステム 第3段階（文字の整理）
   ・小さすぎる文字（8.5〜10.5px）をすべて11pxに
   ・見出しの階層を 22 / 18 / 15px に
   ・本文を 15px・行間1.9 に
   （2026-08-06 / index.html は触らず concierge.js から追記）
   ══════════════════════════════════════════════════════════════ */
(function(){
  if (window.__wabiDS3) return;
  window.__wabiDS3 = true;
  var css = document.createElement('style');
  css.id = 'wabiDesignSystem3';
  css.textContent = [
    /* 最小サイズを11pxに */
    '.spot-card-benefit-label,.apc-tag,.nl,.wabi-pr,.wc-ai,.wc-meta,.wc-add,.ar,.kbadge,',
    '.theme-card-rank,.theme-card-desc,.apc-desc,.deity,.osupply-img-rank,.hero-search-pill,',
    '.bn,.bv,.tour-img-badge,.ec-img-tag,.wgd-shop,.wcp-tags,.hero-feat-txt,.route-card-badge,',
    '.wc-price,.wcb-sb,.wcb-tag,.wcb-bdg,.photo-count,.wc-sec-sub,.wcb-sub',
    '{font-size:11px !important;}',
    /* 見出しの階層 */
    '.home-sec-tit,.wc-sec-tit{font-size:18px !important;line-height:1.55 !important;}',
    '#pgArticleDetail h1{font-size:22px !important;line-height:1.5 !important;}',
    '#pgArticleDetail h2{font-size:18px !important;line-height:1.55 !important;}',
    '#pgArticleDetail h3{font-size:15px !important;line-height:1.6 !important;}',
    '.wtr-ttl{font-size:22px !important;line-height:1.5 !important;}',
    '.wtr-nm{font-size:17px !important;}',
    /* 本文 15px・行間1.9 */
    '#pgArticleDetail p,#pgArticleDetail li,.wtr-tx,.wtr-lead,.wrp-p',
    '{font-size:15px !important;line-height:1.9 !important;}',
    '.wtr-row .v{font-size:13px !important;line-height:1.75 !important;}',
    '.wtr-row .k{font-size:12px !important;}'
  ].join('');
  document.head.appendChild(css);
})();


/* ══════════════════════════════════════════════════════════════
   わびなび：AIルート「すべて見る」— 各カードに2つのボタン
   ・すべての候補に「地図で見る」と「＋ 追加」を並べる
   ・AIのおすすめ枠にない候補も、自分で追加できるようにする
     （追加したスポットはルートの行程とナビの経由地に反映される）
   （2026-08-06 / index.html は触らず concierge.js から追記）
   ══════════════════════════════════════════════════════════════ */
(function(){
  if (window.__wabiAllSpots2) return;
  window.__wabiAllSpots2 = true;

  var LS = 'wabiAiExtraSpots';
  function extras(){ try { var a = JSON.parse(localStorage.getItem(LS) || '[]'); return Array.isArray(a) ? a : []; } catch(e){ return []; } }
  function saveExtras(a){ try { localStorage.setItem(LS, JSON.stringify(a)); } catch(e){} }
  function hasExtra(nm){ return extras().some(function(x){ return x.name === nm; }); }
  function addExtra(p){ var a = extras(); if (hasExtra(p.name)) return; a.push({ name:p.name, addr:p.vicinity || '' }); saveExtras(a); }
  function delExtra(nm){ saveExtras(extras().filter(function(x){ return x.name !== nm; })); }

  var css = document.createElement('style');
  css.textContent = [
    '.wap2-btns{flex:0 0 auto;display:flex;flex-direction:column;gap:6px;}',
    '.wap2-btn{min-height:36px;border-radius:999px;border:1px solid #D8D2C4;background:#fff;color:#3A1D5D;',
      'font-size:11px;font-weight:700;padding:0 12px;cursor:pointer;white-space:nowrap;',
      "font-family:'Shippori Mincho',serif;}",
    '.wap2-btn.on{background:#3A1D5D;color:#fff;border-color:#3A1D5D;}',
    '.wap2-btn:active{transform:scale(.98);}',
    '.wapx{margin:10px 16px 0;background:#fff;border-radius:16px;padding:12px 14px;',
      'box-shadow:0 1px 2px rgba(58,42,24,.04),0 2px 8px rgba(58,42,24,.04);}',
    ".wapx-t{font-size:11px;color:#9A9086;margin-bottom:8px;font-family:'Noto Serif JP',serif;}",
    '.wapx-r{display:flex;align-items:center;gap:8px;padding:6px 0;font-size:13px;}',
    '.wapx-r .x{margin-left:auto;color:#9A9086;cursor:pointer;font-size:16px;padding:0 4px;}'
  ].join('');
  document.head.appendChild(css);

  /* ① 一覧の各行を「地図で見る」＋「＋ 追加」の2ボタンにする */
  function upgradeRows(){
    var pg = document.getElementById('wcAllPg');
    if (!pg || getComputedStyle(pg).display === 'none') return;
    pg.querySelectorAll('.wap-row').forEach(function(row){
      if (row.getAttribute('data-w2')) return;
      var old = row.querySelector('.wap-btn');
      if (!old) return;
      row.setAttribute('data-w2', '1');
      var nm = (row.querySelector('.wap-nm') || {}).textContent || '';
      var me = (row.querySelector('.wap-me') || {}).textContent || '';
      var addr = me.split('\n').pop().trim();
      var wrap = document.createElement('div');
      wrap.className = 'wap2-btns';

      var mapBtn = document.createElement('button');
      mapBtn.className = 'wap2-btn';
      mapBtn.textContent = '地図で見る';
      mapBtn.onclick = function(){
        window.open('https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(nm + ' ' + addr), '_blank');
      };

      var addBtn = document.createElement('button');
      addBtn.className = 'wap2-btn';
      var canRoute = old.getAttribute('data-has') === '1';
      function label(){
        var on = canRoute ? old.classList.contains('on') : hasExtra(nm);
        addBtn.textContent = on ? '✓ 追加済み' : '＋ 追加';
        addBtn.classList.toggle('on', on);
      }
      addBtn.onclick = function(){
        if (canRoute){ old.click(); }
        else {
          if (hasExtra(nm)){ delExtra(nm); if (typeof showToast === 'function') showToast('ルートから外しました'); }
          else { addExtra({ name:nm, vicinity:addr }); if (typeof showToast === 'function') showToast('🌿 「' + nm + '」をルートに追加しました'); }
        }
        setTimeout(label, 60);
      };
      label();

      wrap.appendChild(mapBtn);
      wrap.appendChild(addBtn);
      old.style.display = 'none';
      row.appendChild(wrap);
    });
  }

  /* ② 自分で追加したスポットを「現在のルート」と行程に反映する */
  function paintExtras(){
    var list = extras();

    var box = document.getElementById('wcAddedBox');
    if (box){
      var old = box.querySelector('.wapx');
      if (!list.length){ if (old) old.remove(); }
      else {
        var sig = list.map(function(x){ return x.name; }).join('|');
        if (!old || old.getAttribute('data-sig') !== sig){
          if (old) old.remove();
          var d = document.createElement('div');
          d.className = 'wapx';
          d.setAttribute('data-sig', sig);
          d.innerHTML = '<div class="wapx-t">＋ あなたが追加したスポット</div>'
            + list.map(function(x){
                return '<div class="wapx-r">📍 ' + x.name + '<span class="x" data-nm="' + x.name + '">✕</span></div>';
              }).join('');
          box.appendChild(d);
          d.querySelectorAll('.x').forEach(function(b){
            b.onclick = function(){ delExtra(b.getAttribute('data-nm')); paintExtras(); };
          });
        }
      }
    }

    var tl = document.querySelector('#wcPrevBody .wc-tl');
    if (tl && list.length){
      list.forEach(function(x){
        if (tl.querySelector('[data-wapx="' + x.name + '"]')) return;
        var d = document.createElement('div');
        d.className = 'wc-tl-i';
        d.setAttribute('data-wapx', x.name);
        d.innerHTML = '<div class="wc-tl-n">＋</div>'
          + '<div class="wc-tl-th" style="background:#EFE9DE">📍</div>'
          + '<div><div class="wc-tl-nm">' + x.name + '</div>'
          + '<div class="wc-tl-mt">' + (x.addr || '自分で追加したスポット') + '</div></div>';
        tl.appendChild(d);
      });
    }

    /* ナビは画面に並んでいる順番どおりに経由地を組み立てる */
    var navi = document.getElementById('wcNavi');
    if (navi && !navi.getAttribute('data-wapx')){
      navi.setAttribute('data-wapx', '1');
      navi.onclick = function(){
        var names = [].map.call(document.querySelectorAll('#wcPrevBody .wc-tl-nm'), function(n){
          return String(n.textContent).replace(/[（(].*$/, '').trim();
        }).filter(Boolean);
        if (!names.length) return;
        var url = 'https://www.google.com/maps/dir/?api=1&origin=' + encodeURIComponent(names[0])
          + '&destination=' + encodeURIComponent(names[names.length - 1])
          + (names.length > 2 ? '&waypoints=' + encodeURIComponent(names.slice(1, -1).join('|')) : '');
        window.open(url, '_blank');
      };
    }
  }

  setInterval(function(){ try { upgradeRows(); paintExtras(); } catch(e){} }, 400);
})();


/* ════════════════════════════════════════════════════════════
   わびなび：第3段階の仕上げ
   ・まだ小さかった文字を 11px に（ヘッダー内のものは 10px）
   ・「すべて見る」の説明文を、全件追加できるに合わせて書き換え
   （2026-08-06 / index.html は触らず concierge.js から追記）
   ════════════════════════════════════════════════════════════ */
(function(){
  if (window.__wabiDS3b) return;
  window.__wabiDS3b = true;

  var css = document.createElement('style');
  css.id = 'wabiDesignSystem3b';
  css.textContent = [
    '.hero-search-pill.hero-search-pill,.route-card-desc,.route-card-meta,.wgd-pr,',
    '.gs-suggest-label,.gs-suggest-post-meta,.hero-search-row-label,.api-small-btn,',
    '.hero-search-note,.ai-preview-label,.big-cta-sec-label,.wc-sec-sub.wc-sec-sub',
    '{font-size:11px !important;}',
    '.site-hd-sub,.site-hd-btn-label{font-size:10px !important;}'
  ].join('');
  document.head.appendChild(css);

  /* 「すべて見る」の説明文を書き換える */
  setInterval(function(){
    try {
      var n = document.querySelector('#wcAllPg .wap-note');
      if (!n) return;
      var t = n.textContent || '';
      if (t.indexOf('AIが選んだ') < 0) return;
      n.textContent = t.split('。')[0] + '。気になるスポットは「＋ 追加」でルートに加えられます。'
        + '場所の確認は「地図で見る」から。';
    } catch(e){}
  }, 500);
})();


/* ════════════════════════════════════════════════════════════
   わびなび：デザインシステム 第4・5段階
   ・記事の「豆知識」の黄色 → 生成りの沈んだ面＋金の細罫
   ・会員登録ページの紫のグラデーション → 生成り
   ・検索チップの選択中 → 金から墨色へ
   ・下部メニューの文字を 11px に
   ・ページの登場・カードの登場・押下の動きを揃える
   （2026-08-06 / index.html は触らず concierge.js から追記）
   ════════════════════════════════════════════════════════════ */
(function(){
  if (window.__wabiDS45) return;
  window.__wabiDS45 = true;

  var css = document.createElement('style');
  css.id = 'wabiDesignSystem45';
  css.textContent = [
    /* 豆知識 */
    '#pgArticleDetail blockquote{background:#F5F0E6 !important;border-left:2px solid #C9A24A !important;',
      'border-radius:0 12px 12px 0 !important;padding:14px 18px !important;}',
    /* 会員登録 */
    '#pgRegister,#pgRegister.reg-bg{background:#FAF8F3 !important;background-image:none !important;}',
    /* チップの選択中 */
    '.hero-search-pill.on,.hero-search-toggle.on',
      '{background:#2D2A26 !important;color:#fff !important;border-color:#2D2A26 !important;}',
    /* 下部メニュー */
    '#wabiNav span{font-size:11px !important;}',
    /* ページの登場 */
    '@keyframes wabiIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}',
    '#wabiRoutePg,.wtr,#wabiPostPg,#wabiListPg,#wabiFeedPg,#wabiRankMore,#pgShrineDetail,',
    '#pgArticleDetail,#pgThemeDetail,#wcAllPg,#wxGuide,#wxInvite',
      '{animation:wabiIn .2s cubic-bezier(.2,.8,.2,1);}',
    /* カードの登場（画面に入ったとき一度だけ） */
    '@keyframes wabiRise{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}',
    '.wabi-rise{animation:wabiRise .32s cubic-bezier(.2,.8,.2,1) both;}',
    /* 押したとき */
    '.rcard:active,.theme-card:active,.route-card:active,.wev-card:active,',
    '.wtr-card:active,.wc-card:active,.art-card:active',
      '{transform:scale(.985);transition:transform .12s ease-out;}'
  ].join('');
  document.head.appendChild(css);

  /* 画面に入ったカードを一度だけふわっと出す
     （最初から見えている状態を崩さないので、万が一動かなくても内容は見えます） */
  try {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function(es){
      es.forEach(function(e){
        if (!e.isIntersecting) return;
        e.target.classList.add('wabi-rise');
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    function watch(){
      document.querySelectorAll('.theme-card,.route-card,.wev-card,.art-card').forEach(function(el){
        if (el.getAttribute('data-rise')) return;
        el.setAttribute('data-rise', '1');
        io.observe(el);
      });
    }
    watch();
    setInterval(watch, 1500);
  } catch(e){}
})();


/* ════════════════════════════════════════════════════════════
   わびなび：おすすめ記事のカードをツアー特集と同じ大きさに
   （2026-08-06 / index.html は触らず concierge.js から追記）
   ════════════════════════════════════════════════════════════ */
(function(){
  if (window.__wabiArtCard) return;
  window.__wabiArtCard = true;
  var css = document.createElement('style');
  css.id = 'wabiArtCard';
  css.textContent = [
    '.art-item{height:121px !important;min-height:121px !important;background:#fff !important;',
      'border-radius:16px !important;overflow:hidden !important;gap:0 !important;align-items:stretch !important;',
      'box-shadow:0 1px 2px rgba(58,42,24,.04),0 2px 8px rgba(58,42,24,.04) !important;}',
    '.art-thumb{width:152px !important;height:121px !important;flex:0 0 152px !important;',
      'border-radius:0 !important;aspect-ratio:auto !important;overflow:hidden !important;}',
    '.art-thumb img{width:152px !important;height:121px !important;border-radius:0 !important;',
      'aspect-ratio:auto !important;object-fit:cover !important;}',
    '.art-body{padding:14px 16px !important;overflow:hidden !important;}',
    '.art-title{font-size:15px !important;line-height:1.5 !important;display:-webkit-box !important;',
      '-webkit-line-clamp:3 !important;-webkit-box-orient:vertical !important;overflow:hidden !important;}',
    '.art-list{gap:12px !important;}'
  ].join('');
  document.head.appendChild(css);
})();


/* ════════════════════════════════════════════════════════════
   わびなび：自分で設定した名前・アイコンを最優先で表示する
   ・LINEとGoogleでログインし直しても、自分で決めた表示名と写真を保つ
   ・「LINEの名前に戻す」を選んだときはその選択を尊重する
   （2026-08-06 / index.html は触らず concierge.js から追記）
   ════════════════════════════════════════════════════════════ */
(function(){
  if (window.__wabiMineProfile) return;
  window.__wabiMineProfile = true;

  var LS_NM = 'wabiName', LS_AV = 'wabiAvatar';
  var MY_NM = 'wabiNameMine', MY_AV = 'wabiAvatarMine', LS_UID = 'wabiUidLast';

  function g(k){ try { return localStorage.getItem(k) || ''; } catch(e){ return ''; } }
  function s(k, v){ try { v ? localStorage.setItem(k, v) : localStorage.removeItem(k); } catch(e){} }
  function uid(){
    try { var u = JSON.parse(localStorage.getItem('wabiUser') || 'null'); return (u && u.id) || ''; }
    catch(e){ return ''; }
  }

  var switchedAt = 0;

  function tick(){
    var cur = uid(), last = g(LS_UID);
    if (cur !== last){ s(LS_UID, cur); switchedAt = Date.now(); }

    if (switchedAt && (Date.now() - switchedAt < 6000)){
      /* ログインし直した直後：自分で決めた名前・写真を戻す */
      if (g(MY_NM) && g(LS_NM) !== g(MY_NM)) s(LS_NM, g(MY_NM));
      if (g(MY_AV) && g(LS_AV) !== g(MY_AV)) s(LS_AV, g(MY_AV));
    } else {
      /* 普段：自分で変えた内容を控えておく（「元に戻す」で空にした場合も追従） */
      if (g(LS_NM) !== g(MY_NM)) s(MY_NM, g(LS_NM));
      if (g(LS_AV) !== g(MY_AV)) s(MY_AV, g(LS_AV));
    }

    /* 表示への反映（ヘッダーとマイページ） */
    var nm = g(LS_NM), av = g(LS_AV);
    var btn = document.getElementById('wlBtn');
    if (btn && nm){
      var want = nm.length > 6 ? nm.slice(0, 6) + '…' : nm;
      if ((btn.textContent || '').trim() !== want){
        var img = btn.querySelector('img');
        var src = av || (img ? img.src : '');
        btn.innerHTML = (src ? '<img src="' + src + '" style="width:20px;height:20px;border-radius:50%;object-fit:cover">' : '') + want;
      }
    }
    var mn = document.querySelector('#wcMypage .mp-name');
    if (mn && nm && mn.textContent.replace(/\s*✎\s*$/, '').trim() !== nm){
      mn.innerHTML = nm.replace(/[<>&]/g, '') + '<span class="wp-pen">✎</span>';
    }
    var avEl = document.querySelector('#wcMypage .mp-av img');
    if (avEl && av && avEl.src !== av) avEl.src = av;
  }

  setInterval(tick, 600);
  tick();
})();


/* ════════════════════════════════════════════════════════════
   わびなび：ランキングの掲載数をカテゴリごとに揃える
   ・すべて／神社／お寺／御朱印 → 30位まで
   ・縁結び／開運／学問／健康／自然景観／歴史・文化財 → 20位まで
   そのために、実在する寺院25か所と天満宮7社を追加する。
   評価と件数と緯度経度は Google の実データ。
   あわせて、地域の表記が日本語のままだった10件をコード（kanto等）に直す。
   （2026-08-06 / index.html は触らず concierge.js から追記）
   ════════════════════════════════════════════════════════════ */
(function(){
  if (window.__wabiMoreShrines) return;
  window.__wabiMoreShrines = true;

  function M(n){ return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(n); }
  function T(rank, name, deity, addr, area, rating, rev, tags, badges, lat, lng){
    return { rank:rank, type:'temple', name:name, deity:deity, addr:addr, map:M(name),
             area:area, rating:rating, rev:rev, visited:false, tags:tags, badges:badges, lat:lat, lng:lng };
  }
  function S(rank, name, deity, addr, area, rating, rev, tags, badges, lat, lng){
    return { rank:rank, type:'shrine', name:name, deity:deity, addr:addr, map:M(name),
             area:area, rating:rating, rev:rev, visited:false, tags:tags, badges:badges, lat:lat, lng:lng };
  }

  var ADD = [
    T(11,'中尊寺','阿弥陀如来','岩手県西磐井郡平泉町平泉衣関202','hokkaido',4.4,12419,
      ['goshuin','rekishi','shizen'],['世界遺産','天台宗東北大本山'],39.0016,141.1028),
    T(12,'瑞巌寺','聖観世音菩薩','宮城県宮城郡松島町松島町内91','hokkaido',4.4,6570,
      ['goshuin','rekishi','shizen'],['国宝','伊達政宗ゆかり'],38.3720,141.0598),
    T(13,'立石寺（山寺）','薬師如来','山形県山形市山寺4456-1','hokkaido',4.5,9351,
      ['goshuin','rekishi','shizen','kenko'],['奥の細道','千段の石段'],38.3131,140.4346),
    T(14,'日光山輪王寺','阿弥陀如来・千手観音・馬頭観音','栃木県日光市山内2300','kanto',4.3,2003,
      ['goshuin','rekishi','shizen'],['世界遺産','三仏堂'],36.7552,139.6005),
    T(15,'川崎大師 平間寺','厄除弘法大師','神奈川県川崎市川崎区大師町4-48','kanto',4.3,12789,
      ['goshuin','kaiun','kenko','rekishi'],['真言宗智山派大本山','厄除け'],35.5347,139.7295),
    T(16,'高幡不動尊 金剛寺','不動明王','東京都日野市高幡733','kanto',4.3,6128,
      ['goshuin','kaiun','kenko','rekishi'],['関東三大不動','土方歳三ゆかり'],35.6620,139.4111),
    T(17,'深大寺','阿弥陀三尊・白鳳仏','東京都調布市深大寺元町5-15-1','kanto',4.3,8560,
      ['goshuin','enmusubi','shizen','rekishi'],['縁結び','国宝の釈迦如来倚像'],35.6675,139.5504),
    T(18,'増上寺','阿弥陀如来','東京都港区芝公园4-7-35','kanto',4.5,12587,
      ['goshuin','rekishi','kaiun'],['浄土宗大本山','徳川将軍家菩提寺'],35.6575,139.7483),
    T(19,'池上本門寺','日蓮聖人','東京都大田区池上1-1-1','kanto',4.3,2859,
      ['goshuin','rekishi'],['日蓮宗大本山','五重塔'],35.5788,139.7052),
    T(20,'建長寺','地蔵菩薩','神奈川県鎌倉市山ノ内8','kanto',4.4,4742,
      ['goshuin','rekishi','shizen'],['鎌倉五山第一位','日本最初の禅寺'],35.3315,139.5549),
    T(21,'円覚寺','宝冠釈迦如来','神奈川県鎌倉市山ノ内409','kanto',4.4,4570,
      ['goshuin','rekishi','shizen'],['鎌倉五山第二位','国宝舎利殿'],35.3377,139.5475),
    T(22,'長谷寺（鎌倉）','十一面観世音菩薩','神奈川県鎌倉市長谷3-11-2','kanto',4.5,17020,
      ['goshuin','rekishi','shizen'],['鎌倉の観音様','あじさい'],35.3125,139.5331),
    T(23,'永平寺','釈迦牟尼仏','福井県吉田郡永平寺町志比5-15','chubu',4.5,8347,
      ['goshuin','rekishi','shizen'],['曹洞宗大本山','道元禅師開創'],36.0566,136.3569),
    T(24,'三十三間堂（蓮華王院）','千手観音','京都府京都市東山区三十三間堂廻町657','kinki',4.7,17292,
      ['goshuin','rekishi'],['国宝','千一体の千手観音'],34.9879,135.7717),
    T(26,'東寺（教王護国寺）','薬師如来','京都府京都市南区九条町1','kinki',4.5,19780,
      ['goshuin','rekishi','kenko'],['世界遺産','日本一の五重塔'],34.9803,135.7477),
    T(27,'仁和寺','阿弥陀如来','京都府京都市右京区御室大兹33','kinki',4.4,7883,
      ['goshuin','rekishi','shizen'],['世界遺産','御室桜'],35.0311,135.7138),
    T(28,'醤醐寺','薬師如来','京都府京都市伏見区醤醐東大路町22','kinki',4.4,6006,
      ['goshuin','rekishi','shizen','kenko'],['世界遺産','秀吉の花見'],34.9511,135.8194),
    T(29,'平等院','阿弥陀如来','京都府宇治市宇治蓮華116','kinki',4.5,22330,
      ['goshuin','rekishi','shizen'],['世界遺産','鳳凰堂'],34.8893,135.8077),
    T(30,'薬師寺','薬師三尊','奈良県奈良市西ノ京町457','kinki',4.4,5899,
      ['goshuin','rekishi','kenko'],['世界遺産','薬師如来'],34.6686,135.7843),
    T(31,'興福寺','釈迦如来','奈良県奈良市登大路町48','kinki',4.4,12921,
      ['goshuin','rekishi'],['世界遺産','阿修羅像'],34.6832,135.8312),
    T(32,'四天王寺','救世観音','大阪府大阪市天王寺区四天王寺1-11-18','kinki',4.4,13001,
      ['goshuin','rekishi','kenko','kaiun'],['聖徳太子建立','日本仏法最初の官寺'],34.6545,135.5165),
    T(33,'中山寺','十一面観世音菩薩','兵庫県宝塚市中山寺2-11-1','kinki',4.3,4437,
      ['goshuin','kenko','enmusubi','rekishi'],['安産祈願','西国三十三所'],34.8216,135.3678),
    T(34,'大聖院','波切不動明王','広島県廜日市市宮島町210','chugoku',4.6,5207,
      ['goshuin','rekishi','kenko','shizen'],['宮島最古の寺','真言宗御室派大本山'],34.2920,132.3185),
    T(35,'大願寺','厳島弁財天','広島県廜日市市宮島町3','chugoku',4.2,645,
      ['goshuin','rekishi','kaiun'],['日本三大弁財天'],34.2955,132.3183),
    T(36,'善通寺','薬師如来','香川県善通寺市善通寺町3-3-1','chugoku',4.4,3087,
      ['goshuin','rekishi','kenko'],['弘法大師誕生地','四国霊場第七十五番'],34.2263,133.7762),
    T(37,'石手寺','薬師如来','愛媛県松山市石手2-9-21','chugoku',4.1,2610,
      ['goshuin','rekishi','kenko','kaiun'],['四国霊場第五十一番','国宝仁王門'],33.8479,132.7965),

    S(71,'五條天神社','大己貴命・少彦名命（相殿 菅原道真公）','東京都台東区上野公园4-17','kanto',4.3,2124,
      ['goshuin','kenko','gakumon','rekishi'],['医薬の祖神','上野公园'],35.7137,139.7723),
    S(72,'平河天満宮','菅原道真公','東京都千代田区平河町1-7-5','kanto',4.2,479,
      ['goshuin','gakumon','kaiun','rekishi'],['江戸城の鎮守','銅鳥居'],35.6824,139.7407),
    S(73,'大生郷天満宮','菅原道真公','茨城県常総市大生郷町1234','kanto',4.0,479,
      ['goshuin','gakumon','kaiun','rekishi'],['日本三大天神'],36.0607,139.9528),
    S(74,'菅原院天満宮神社','菅原道真公','京都府京都市上京区烏丸通下立売下ル堀松町408','kinki',4.2,739,
      ['goshuin','gakumon','kenko','rekishi'],['道真公生誕の地','癌封じの梅'],35.0196,135.7591),
    S(75,'山田天満宮','菅原道真公','愛知県名古屋市北区山田町3-25','chubu',4.3,2316,
      ['goshuin','gakumon','kaiun','kenko'],['名古屋三大天神','金神社'],35.1960,136.9383),
    S(76,'白潟天満宮','菅原道真公','島根県松江市天神町59','chugoku',4.3,168,
      ['goshuin','gakumon','kaiun'],['松江天神さん'],35.4617,133.0560),
    S(77,'綱敷天満宮','菅原道真公','福岡県築上郡築上町大字高塚794-2','kyushu',4.2,472,
      ['goshuin','gakumon','shizen','rekishi'],['花庭園の梅'],33.6605,131.0639)
  ];

  var AREA_FIX = { '関東':'kanto', '近畿':'kinki', '中部':'chubu', '中国四国':'chugoku',
                   '北海道・東北':'hokkaido', '九州・沖縄':'kyushu', '中国・四国':'chugoku', '中部・北陸':'chubu' };

  var MAX_BY = { all:30, goshuin:30, enmusubi:20, kaiun:20, gakumon:20,
                 kenko:20, shizen:20, rekishi:20, shobai:20 };

  function installFilter(){
    if (window.__wabiMaxFilter) return;
    if (typeof SHRINES === 'undefined' || typeof renderCard !== 'function') return;
    if (!document.getElementById('areaSel') || !document.getElementById('sortSel')) return;
    window.__wabiMaxFilter = true;
    var prev = window.filter;
    window.filter = function(){
      try {
        var areaSel = document.getElementById('areaSel');
        var sortSel = document.getElementById('sortSel');
        var area = areaSel.value, sort = sortSel.value;
        if (area === 'nearby'){ if (typeof searchNearby === 'function') searchNearby(); return; }

        var tag = (typeof currentTag !== 'undefined' && currentTag) ? currentTag : 'all';
        var MAX = MAX_BY[tag] || 20;
        var TOP = 10;

        var f = SHRINES.slice();
        if (typeof currentType !== 'undefined' && currentType) f = f.filter(function(s){ return (s.type || 'shrine') === currentType; });
        if (area !== 'all') f = f.filter(function(s){ return s.area === area; });
        if (tag !== 'all') f = f.filter(function(s){ return s.tags && s.tags.indexOf(tag) >= 0; });
        if (sort === 'visited') f = f.filter(function(s){ return s.visited; });
        if (sort === 'rating') f.sort(function(a, b){ return b.rating - a.rating; });
        if (sort === 'rank')   f.sort(function(a, b){ return a.rank - b.rank; });

        var lbl = areaSel.options[areaSel.selectedIndex].text;
        var top = f.slice(0, MAX);
        var shown = Math.min(top.length, TOP);
        document.getElementById('resCount').textContent = lbl + ' ' + shown + '件';
        document.getElementById('rmeta').innerHTML = lbl + ' <span>' + shown + '件</span> のおすすめ神社';
        document.getElementById('list').innerHTML = top.length
          ? top.map(function(s, i){ return renderCard(s, i + 1); }).join('')
          : '<div style="text-align:center;color:#9A9086;padding:2rem 0;font-size:13px">このエリアの神社仏閣はまだありません</div>';
      } catch(e){
        if (prev) prev.apply(this, arguments);
      }
    };
    try { window.filter(); } catch(e){}
  }

  function apply(){
    if (typeof SHRINES === 'undefined' || !Array.isArray(SHRINES)) return false;
    if (window.__wabiMoreDone) return true;
    var have = {};
    SHRINES.forEach(function(s){ have[s.name] = 1; });
    ADD.forEach(function(x){ if (!have[x.name]) SHRINES.push(x); });
    SHRINES.forEach(function(s){ if (AREA_FIX[s.area]) s.area = AREA_FIX[s.area]; });
    window.__wabiMoreDone = true;
    installFilter();
    try { if (typeof filter === 'function') filter(); } catch(e){}
    return true;
  }

  if (!apply()){
    var n = 0;
    var t = setInterval(function(){ if (apply() || ++n > 60) clearInterval(t); }, 500);
  }
})();


/* __wabiRankRefresh : 初期表示でも「11位〜◯位を見る」が出るように、
   index.html 側の初回描画のあとに filter() を数回だけ呼び直す */
(function(){
  if (window.__wabiRankRefresh) return;
  window.__wabiRankRefresh = true;
  var times = [900, 2000, 3500, 6000];
  function run(){
    try {
      if (!window.__wabiMaxFilter) return;
      if (document.querySelector('.wabi-more-rank')) return;
      var l = document.getElementById('list');
      if (!l || !l.querySelector('.rcard')) return;
      if (typeof filter === 'function') filter();
    } catch(e){}
  }
  times.forEach(function(ms){ setTimeout(run, ms); });
  if (document.readyState !== 'complete') window.addEventListener('load', function(){ setTimeout(run, 600); });
})();


/* __wabiTopDS : TOPページを Design System v1.0 に合わせる（2026-08-07）
   ・index.html は触らず、このブロックのCSSだけで仕上げる
   ・適用範囲はTOPページのみ。body に wabi-top クラスがついている間だけ効く
   ・他ページを順に仕上げるときは、同じやり方でページ別のブロックを追加する */
(function(){
  if (window.__wabiTopDS) return;
  window.__wabiTopDS = true;

  var CSS = [
    "/* トークン */",
    "body.wabi-top{--paper:#FAF8F3;--surface:#FFFFFF;--surface-2:#F5F0E6;--line:#ECE6DA;--line-strong:#D8D2C4;--ink:#2D2A26;--ink-2:#6E6459;--ink-3:#9A9086;--vermilion:#A83320;--purple:#3A1D5D;--gold:#C9A24A;--success:#5C7A5C;--sh1:0 1px 2px rgba(58,42,24,.04),0 2px 8px rgba(58,42,24,.04);--ease:cubic-bezier(.2,.8,.2,1)}",
    "body.wabi-top #pgHome{font-family:\"Noto Serif JP\",\"Shippori Mincho\",serif}",
    "/* 1. セクション見出し H2 18/700/.04em */",
    "body.wabi-top #pgHome .home-sec-tit{font-size:18px !important;font-weight:700 !important;line-height:1.55 !important;letter-spacing:.04em !important;color:var(--ink) !important}",
    "body.wabi-top #pgHome .home-sec-hd{margin-bottom:12px !important}",
    "body.wabi-top #pgHome .home-sec-more{font-size:11px !important;font-weight:600 !important;letter-spacing:.08em !important;line-height:1.4 !important;color:var(--purple) !important}",
    "body.wabi-top #pgHome .home-sec-tit .ico{background:var(--surface-2) !important;border-radius:8px !important;color:var(--ink-2) !important;box-shadow:none !important;border:0 !important}",
    "body.wabi-top #pgHome .home-sec-tit .ico svg{stroke:var(--ink-2) !important;color:var(--ink-2) !important;fill:none !important}",
    "/* 2. カードの土台：金の罫線を撤去し --line へ */",
    "body.wabi-top #pgHome .rcard,body.wabi-top #pgHome .tour-card,body.wabi-top #pgHome .art-item,body.wabi-top #pgHome .wev-card,body.wabi-top #pgHome .wcp-card,body.wabi-top #pgHome .apc,body.wabi-top #pgHome .theme-card,body.wabi-top #pgHome .ec-card,body.wabi-top #pgHome .goods-card,body.wabi-top #pgHome .osupply-card{border:1px solid var(--line) !important;border-radius:16px !important;box-shadow:var(--sh1) !important;background:var(--surface) !important}",
    "/* 3. タグ・格バッジ */",
    "body.wabi-top #pgHome .deity,body.wabi-top #pgHome .kbadge,body.wabi-top #pgHome .tag{border-radius:8px !important;font-size:11px !important;font-weight:600 !important;letter-spacing:.08em !important;line-height:1.4 !important;box-shadow:none !important}",
    "body.wabi-top #pgHome .deity{background:var(--surface-2) !important;color:var(--ink-2) !important;border:0 !important}",
    "body.wabi-top #pgHome .kbadge{background:var(--surface) !important;color:var(--ink) !important;border:1px solid var(--line-strong) !important}",
    "/* 4. 文字サイズを8段階へ */",
    "body.wabi-top #pgHome .cp,body.wabi-top #pgHome small,body.wabi-top #pgHome .wabi-more-rank{font-size:11px !important}",
    "body.wabi-top #pgHome .wcp-sub,body.wabi-top #pgHome .sb,body.wabi-top #pgHome .pd,body.wabi-top #pgHome .tour-route,body.wabi-top #pgHome .ec-title{font-size:12px !important;line-height:1.7 !important}",
    "body.wabi-top #pgHome .wl-btn,body.wabi-top #pgHome .theme-card-title{font-size:13px !important}",
    "body.wabi-top #pgHome .rname,body.wabi-top #pgHome .tt,body.wabi-top #pgHome .tour-title{font-size:15px !important;font-weight:700 !important;line-height:1.6 !important}",
    "/* 5. 神社カード：写真を上へ・4:3・順位バッジは写真の左上 */",
    "/* 修正(2026-08-19): .rcard がflexコンテナでなかったため order:-1 が効かず、",
    "   バッジ(position:absolute)が写真ではなく神社名テキストの上に重なるバグを修正 */",
    "body.wabi-top #pgHome .rcard{position:relative;overflow:hidden;display:flex !important;flex-direction:column !important}",
    "body.wabi-top #pgHome .rcard{display:flex !important;flex-direction:column !important}",
    "body.wabi-top #pgHome .rcard .pgallery{order:-1 !important;margin:0 !important;border-radius:0 !important}",
    "/* 2x2グリッド写真(.wgal)は order:-1 の対象から漏れていたため、",
    "   名前が先・写真が後のままバッジと重なっていた。同様に先頭へ */",
    "body.wabi-top #pgHome .rcard .wgal{order:-1 !important;margin:0 !important}",
    "/* 写真が無いカードでは、バッジを名前の上に重ねず通常の並びに戻す（保険） */",
    "body.wabi-top #pgHome .rcard:not(:has(.pgallery)):not(:has(.wgal)) .rbdg{position:static !important;top:auto !important;left:auto !important;margin:0 !important}",
    "body.wabi-top #pgHome .rcard .pgallery-main{aspect-ratio:4/3 !important;height:auto !important;min-height:0 !important;border-radius:0 !important;background:var(--surface-2) !important}",
    "body.wabi-top #pgHome .rcard .pgallery-main img{width:100% !important;height:100% !important;object-fit:cover !important;object-position:center 30% !important}",
    "body.wabi-top #pgHome .rcard .rhd{min-height:0 !important;height:auto !important;padding:16px !important}",
    "body.wabi-top #pgHome .rcard .rbdg{position:absolute !important;top:12px !important;left:12px !important;z-index:3 !important;margin:0 !important}",
    "body.wabi-top #pgHome .rcard .nblk{width:100% !important}",
    "body.wabi-top #pgHome .rcard .nrow{display:block !important}",
    "body.wabi-top #pgHome .rcard .rname{display:block !important}",
    "body.wabi-top #pgHome .rcard .deity{display:inline-block !important;margin-top:6px !important}",
    "body.wabi-top #pgHome .rcard .kakushiki{margin-top:6px !important}",
    "body.wabi-top #pgHome .rcard .rarow{display:none !important}",
    "body.wabi-top #pgHome .rcard .alink{color:var(--purple) !important;font-size:12px !important;line-height:1.7 !important;margin-top:8px !important;display:flex !important;align-items:flex-start !important;gap:4px !important}",
    "body.wabi-top #pgHome .rcard .rftr{padding:0 16px 16px !important}",
    "body.wabi-top #pgHome .rcard .rcnt{color:var(--ink-3) !important;font-size:12px !important;line-height:1.7 !important}",
    "body.wabi-top #pgHome .rcard .rnum{color:var(--ink) !important;font-size:13px !important;font-weight:700 !important}",
    "/* 6. 参拝バッジ（朱→苔／生成り） */",
    "body.wabi-top #pgHome .bn{background:var(--surface-2) !important;color:var(--ink-3) !important;border-radius:8px !important;font-size:11px !important;letter-spacing:.08em !important;font-weight:600 !important}",
    "body.wabi-top #pgHome .bv{background:#EDF2ED !important;color:var(--success) !important;border-radius:8px !important;font-size:11px !important;letter-spacing:.08em !important;font-weight:600 !important}",
    "/* 7. ヘッダー・下部ナビ（生成り＋ぼかし） */",
    "body.wabi-top .site-hd{background:rgba(250,248,243,.96) !important;-webkit-backdrop-filter:blur(8px) !important;backdrop-filter:blur(8px) !important;border-bottom:1px solid var(--line) !important;box-shadow:none !important;padding:8px 20px !important}",
    "body.wabi-top .site-hd-sub{color:var(--ink-3) !important}",
    "body.wabi-top #wabiNav{background:rgba(250,248,243,.92) !important;-webkit-backdrop-filter:blur(12px) !important;backdrop-filter:blur(12px) !important;border-top:1px solid var(--line) !important;box-shadow:none !important}",
    "body.wabi-top #wabiNav .nav-lb,body.wabi-top #wabiNav span{font-size:11px !important;letter-spacing:.08em !important}",
    "/* 8. チップ：選択中は紫（行動の色） */",
    "body.wabi-top .hero-search-toggle,body.wabi-top .hero-search-pill{color:var(--ink-2) !important;border:1px solid var(--line-strong) !important;letter-spacing:.08em !important}",
    "body.wabi-top .hero-search-toggle.on,body.wabi-top .hero-search-pill.on{background:var(--purple) !important;border-color:var(--purple) !important;color:#fff !important}",
    "/* 9. 参拝のお供（PRカード） */",
    "body.wabi-top #pgHome .osupply-title{font-size:13px !important;line-height:1.85 !important;color:var(--ink) !important;min-height:48px !important;display:-webkit-box !important;-webkit-line-clamp:2 !important;-webkit-box-orient:vertical !important;overflow:hidden !important}",
    "body.wabi-top #pgHome .osupply-price{font-size:15px !important;font-weight:700 !important;color:var(--ink) !important}",
    "body.wabi-top #pgHome .wabi-rk-btn{background:var(--purple) !important;color:#fff !important;border:0 !important;border-radius:999px !important;height:40px !important;min-height:40px !important;font-size:12px !important;font-weight:700 !important;letter-spacing:.08em !important;box-shadow:none !important}",
    "body.wabi-top #pgHome .wabi-pr{background:rgba(255,255,255,.92) !important;color:var(--ink-3) !important;border-radius:8px !important;font-size:11px !important;font-weight:600 !important;letter-spacing:.08em !important;border:0 !important}",
    "body.wabi-top #pgHome .osupply-img-rank{background:rgba(0,0,0,.42) !important;color:#fff !important;border-radius:8px !important;font-size:11px !important;font-weight:600 !important;letter-spacing:.08em !important;border:0 !important;box-shadow:none !important}",
    "/* 10. 押下 */",
    "body.wabi-top #pgHome .rcard:active,body.wabi-top #pgHome .tour-card:active,body.wabi-top #pgHome .art-item:active,body.wabi-top #pgHome .wev-card:active,body.wabi-top #pgHome .osupply-card:active{transform:scale(.985);transition:transform 120ms var(--ease)}",
    "@media (prefers-reduced-motion:reduce){body.wabi-top #pgHome *{transition:none !important;animation:none !important}}"
  ].join('\n');

  var style = document.createElement('style');
  style.id = 'wabiTopDS';
  style.textContent = CSS;
  (document.head || document.documentElement).appendChild(style);

  // TOPページが見えている間だけ body.wabi-top をつける
  function isTop(){
    var home = document.getElementById('pgHome');
    if (!home) return false;
    if (getComputedStyle(home).display === 'none') return false;
    // 他のページが上に開いていたらTOPではない
    var overlays = ['pgMap','pgShrine','pgRoute','wcMypage','pgSeasonList','wabiPostPg','wabiRankMore'];
    for (var i = 0; i < overlays.length; i++) {
      var el = document.getElementById(overlays[i]);
      if (el && getComputedStyle(el).display !== 'none' && el.offsetHeight > 0) return false;
    }
    return true;
  }

  function sync(){
    try { document.body.classList.toggle('wabi-top', isTop()); } catch(e){}
  }

  sync();
  // タブ切替やページ開閉に追従する
  ['click','touchend','popstate'].forEach(function(ev){
    window.addEventListener(ev, function(){ setTimeout(sync, 60); setTimeout(sync, 400); }, true);
  });
  setInterval(sync, 1000);
})();

/* __wabiTopFix1 : TOPページの不具合修正（2026-08-08）
   STEP3）最下部が下部メニューに近すぎる：余白 76px → 124px + セーフエリア（第4-2章）
   STEP4）狭い端末で「未参拝」バッジが縦に潰れる：440px以下でだけ折り返しを許可
   ※ 440px を超える幅では1バイトも変わらない */
(function(){
  if (window.__wabiTopFix1) return;
  window.__wabiTopFix1 = true;

  var CSS = [
    "/* STEP3 ページ下部の余白：76px → 124px + セーフエリア */",
    "body.wabi-top .app{padding-bottom:calc(124px + env(safe-area-inset-bottom)) !important}",
    "/* STEP4 狭い端末でカード下部が潰れるのを防ぐ */",
    "/*   440px 以下（iPhone全機種）のときだけ効く。幅の広い画面では何も変わらない */",
    "@media (max-width:440px){",
    "  body.wabi-top #pgHome .rcard .rftr{flex-wrap:wrap !important;gap:6px !important;align-items:center !important}",
    "  body.wabi-top #pgHome .rcard .bn,body.wabi-top #pgHome .rcard .bv{white-space:nowrap !important;display:inline-block !important;flex:0 0 auto !important}",
    "  body.wabi-top #pgHome .rcard .rcnt{white-space:nowrap !important}",
    "}"
  ].join('\n');

  var style = document.createElement('style');
  style.id = 'wabiTopFix1';
  style.textContent = CSS;
  (document.head || document.documentElement).appendChild(style);
})();

/* __wabiTopFix2 : TOPページの朱・金の誤用を直す（2026-08-08）
   対象は10か所。いずれもヒーロー領域の外側。
   ヒーロー内の .btn-search（金のグラデーション）と .hero-search-cta（朱）は
   ブランド表現に関わるため、SIMBAさんの判断を待って手をつけていない。
   .tagbar（絞り込みバー）も、白にすると中のチップが見えなくなるため見送った。 */
(function(){
  if (window.__wabiTopFix2) return;
  window.__wabiTopFix2 = true;

  var CSS = [
    "/* 朱は「数字・位置」だけ（ルール3）、金は5か所だけ（ルール2）、紫は「行動」だけ（ルール4） */",
    "body.wabi-top #pgHome .secln{background:var(--line) !important;border-radius:0 !important}",
    "body.wabi-top #pgHome .ec-price{color:var(--ink) !important}",
    "body.wabi-top #pgHome .ec-img-tag{background:rgba(0,0,0,.42) !important;color:#fff !important;border-radius:8px !important;font-weight:600 !important;letter-spacing:.08em !important}",
    "body.wabi-top #pgHome .wcp-av{background:var(--surface-2) !important;color:var(--ink-2) !important;border-color:var(--line) !important}",
    "body.wabi-top #pgHome .community-box{border:1px solid var(--line) !important;box-shadow:var(--sh1) !important}",
    "body.wabi-top #pgHome .tour-img-badge{background:rgba(0,0,0,.42) !important;color:#fff !important;border-radius:8px !important;font-weight:600 !important;letter-spacing:.08em !important}",
    "body.wabi-top #pgHome .ai-preview-label{color:var(--ink-3) !important}",
    "body.wabi-top .wl-btn{background:var(--purple) !important}",
    "body.wabi-top #pgHome .wgd-pr{border-radius:8px !important}",
    "/* 「11位〜30位を見る」を Secondary ボタン（S）にする */",
    "body.wabi-top #pgHome .wabi-more-rank{border-radius:999px !important;color:var(--purple) !important;border:1px solid var(--line-strong) !important;background:var(--surface) !important;min-height:36px !important;display:inline-flex !important;align-items:center !important;justify-content:center !important;padding:0 18px !important;box-shadow:none !important}"
  ].join('\n');

  var style = document.createElement('style');
  style.id = 'wabiTopFix2';
  style.textContent = CSS;
  (document.head || document.documentElement).appendChild(style);
})();


/* __wabiTopFix3 : 保留していた A/B/C と 優先2（影）・優先3（アイコン）を実施（2026-08-11）
   ・index.html は触らない。このブロックのCSS＋JSだけで仕上げる
   ・適用範囲はTOPページのみ（body.wabi-top が付いている間だけ）

   A  ヒーローCTA 朱 → 紫（DS 2-2 ルール3：主要ボタンは紫）
   B  検索チップの選択色 → 紫（__wabiTopDS で実施済み。ここでは検索まわりの金の影を除去）
   C1 ヒーロー画像 4:3 → 16:9（DS 7-1：ヒーローは16:9）
   C2 ツアーカードの写真 → 4:3（DS 7-1：カード内の写真は4:3）
   優先2 影を3種類（sh-1 / sh-2 / sh-3）に統一。金色・朱色の影を全廃
   優先3 アイコンの実効線幅を 1.00 / 1.25 / 1.50px に揃える            */
(function(){
  if (window.__wabiTopFix3) return;
  window.__wabiTopFix3 = true;

  var CSS = [
    /* --- 影のトークン（DS 付録A） --------------------------------- */
    "body.wabi-top{",
    "  --sh-1:0 1px 2px rgba(58,42,24,.04),0 2px 8px rgba(58,42,24,.04);",
    "  --sh-2:0 2px 4px rgba(58,42,24,.05),0 8px 20px rgba(58,42,24,.06);",
    "  --sh-3:0 8px 32px rgba(58,42,24,.10)}",

    "/* A：ヒーローCTA 朱→紫。角丸14px は DS の6値に無いので999pxへ */",
    "body.wabi-top .hero-search-cta{background:var(--purple) !important;border-radius:999px !important;box-shadow:var(--sh-2) !important;border:0 !important}",
    "body.wabi-top .hero-search-cta:active{transform:scale(.985);box-shadow:var(--sh-1) !important}",

    "/* B：検索まわりの金・朱の影を除去（選択色の紫は __wabiTopDS で実施済み） */",
    "body.wabi-top .hero-search-toggle,body.wabi-top .hero-search-pill,body.wabi-top .hero-search-input-wrap{box-shadow:none !important}",
    "body.wabi-top .hero-search-toggle.on,body.wabi-top .hero-search-pill.on{box-shadow:none !important}",

    "/* C1：ヒーロー画像 4:3 → 16:9 */",
    "body.wabi-top .hero-bg-wrap{aspect-ratio:16/9 !important;background-size:cover !important;background-position:center 30% !important;border-radius:0 !important}",

    "/* C2：ツアーカードの写真を 4:3 に */",
    "body.wabi-top #pgHome .tour-card{align-items:stretch !important;min-height:90px !important}",
    "body.wabi-top #pgHome .tour-img{flex:0 0 auto !important;width:auto !important;aspect-ratio:4/3 !important;align-self:stretch !important;min-height:0 !important;border-radius:0 !important}",
    "body.wabi-top #pgHome .tour-img img{width:100% !important;height:100% !important;object-fit:cover !important;object-position:center 30% !important}",

    "/* 優先2：影は3種類だけ。カードは sh-1 */",
    "body.wabi-top #pgHome .rcard,body.wabi-top #pgHome .tour-card,body.wabi-top #pgHome .art-item,",
    "body.wabi-top #pgHome .wev-card,body.wabi-top #pgHome .wcp-card,body.wabi-top #pgHome .apc,",
    "body.wabi-top #pgHome .theme-card,body.wabi-top #pgHome .ec-card,body.wabi-top #pgHome .goods-card,",
    "body.wabi-top #pgHome .osupply-card,body.wabi-top #pgHome .community-box{box-shadow:var(--sh-1) !important}",

    "/* 浮いているものだけ sh-2 / sh-3 */",
    "body.wabi-top .wabi-fab,body.wabi-top .map-fab{box-shadow:var(--sh-2) !important}",
    "body.wabi-top .wrc,body.wabi-top .wp-sheet,body.wabi-top .wx-menu{box-shadow:var(--sh-3) !important}",

    "/* 小さな部品に影はつけない（DS 16-4：影を重ねない） */",
    "body.wabi-top #pgHome .deity,body.wabi-top #pgHome .kbadge,body.wabi-top #pgHome .tag,",
    "body.wabi-top #pgHome .bn,body.wabi-top #pgHome .bv,body.wabi-top #pgHome .rbdg,",
    "body.wabi-top #pgHome .tour-img-badge,body.wabi-top #pgHome .wabi-pr,",
    "body.wabi-top #pgHome .osupply-img-rank,body.wabi-top #pgHome .cp,",
    "body.wabi-top #pgHome .wabi-more-rank,body.wabi-top #pgHome .home-sec-tit .ico,",
    "body.wabi-top #pgHome .wl-btn,body.wabi-top #pgHome .wabi-rk-btn{box-shadow:none !important}",

    "/* 金色・朱色の影を使っている残りを打ち消す */",
    "body.wabi-top #pgHome .pgallery,body.wabi-top #pgHome .pgallery-main,",
    "body.wabi-top #pgHome .secln,body.wabi-top #pgHome .ec-img-tag{box-shadow:none !important}"
  ].join('\n');

  var style = document.createElement('style');
  style.id = 'wabiTopFix3';
  style.textContent = CSS;
  (document.head || document.documentElement).appendChild(style);

  /* ------------------------------------------------------------------
     優先3：アイコンの線の太さを揃える

     ★なぜ viewBox そのものを揃えないか★
       index.html には viewBox が13種類（0 0 14 14 が40個、0 0 18 18 が27個…）
       混在している。viewBox を 0 0 24 24 に書き換えるには、
       中の座標をすべて計算し直す必要があり、index.html を大きく触ることになる。
       わびなびは「index.html は触らない」方針なので、それは採らない。

     ★代わりに何をするか★
       見た目の目的は「線の太さが画面上で揃うこと」である。
       画面上の実際の太さは
             stroke-width × （表示px ÷ viewBoxの単位数）
       で決まる。そこで表示サイズから逆算して stroke-width を入れ直す。

       DS 第6章の実効線幅
         12px以下      → 1.00px
         13〜20px      → 1.25px
         21px以上      → 1.50px

     ★触らないもの（DS 19章の例外）★
       E3 鳥居・三重塔・朱印（サービス記号）／E4 ブランドロゴ／E5 外部提供アイコン
  ------------------------------------------------------------------ */
  var SKIP = /wabi-logo|brand-logo|torii|pagoda|shuin|gm-|google/i;

  function targetStroke(px){
    if (px <= 12) return 1.00;
    if (px <= 20) return 1.25;
    return 1.50;
  }

  function tuneIcons(root){
    var host = root || document.getElementById('pgHome');
    if (!host) return 0;
    var list = host.querySelectorAll('svg[viewBox]');
    var done = 0;
    for (var i = 0; i < list.length; i++){
      var svg = list[i];
      if (svg.__wabiTuned) continue;
      var cls = (svg.getAttribute('class') || '') + ' ' + ((svg.parentNode && svg.parentNode.getAttribute)
                ? (svg.parentNode.getAttribute('class') || '') : '');
      if (SKIP.test(cls)) { svg.__wabiTuned = true; continue; }

      var box = (svg.getAttribute('viewBox') || '').trim().split(/\s+/);
      var units = parseFloat(box[2]);
      if (!units || !isFinite(units)) { svg.__wabiTuned = true; continue; }

      var rect = svg.getBoundingClientRect();
      var px = Math.max(rect.width, rect.height);
      if (!px) continue;                       // まだ描かれていない。次の巡回で拾う

      var want = targetStroke(px) * units / px;
      // 極端な値にはしない
      if (want < 0.4) want = 0.4;
      if (want > 3.2) want = 3.2;
      svg.style.strokeWidth = String(Math.round(want * 100) / 100);
      svg.__wabiTuned = true;
      done++;
    }
    return done;
  }

  // 描画が落ち着いてから。以後は増えた分だけ拾う
  function run(){ try { tuneIcons(); } catch (e) {} }
  if (document.readyState === 'complete') setTimeout(run, 300);
  else window.addEventListener('load', function(){ setTimeout(run, 300); });
  setTimeout(run, 1200);
  setTimeout(run, 2500);

  var home = document.getElementById('pgHome');
  if (home && window.MutationObserver){
    var timer = null;
    new MutationObserver(function(){
      clearTimeout(timer);
      timer = setTimeout(run, 250);
    }).observe(home, { childList: true, subtree: true });
  }

  window.WabiIconTune = tuneIcons;   // 手で呼べるように
})();


/* __wabiPrefFilter : おすすめランキングを「都道府県」でも絞り込めるようにする（2026-08-12）
   ・index.html は触らない。このブロックだけで実現する
   ・エリア（関東・九州など）での絞り込みはそのまま残す

   ★あわせて直した不具合★
     areaSel / sortSel の onchange が **空** だったため、
     選び直しても何も起きなかった（filter() を直接呼べば動いていた）。
     ここで change に filter() を結び直す。

   ★県の一覧は SHRINES から自動で作る★
     47都道府県を固定で並べると、神社が1件も無い県が13も出てしまう。
     実際に登録がある県だけを、エリアごとにまとめて出す（件数つき）。
     データが増えれば選択肢も自動で増える。                              */
(function(){
  if (window.__wabiPrefFilter) return;
  window.__wabiPrefFilter = true;

  var PREF = ['北海道','青森県','岩手県','宮城県','秋田県','山形県','福島県',
              '茨城県','栃木県','群馬県','埼玉県','千葉県','東京都','神奈川県',
              '新潟県','富山県','石川県','福井県','山梨県','長野県','岐阜県','静岡県','愛知県','三重県',
              '滋賀県','京都府','大阪府','兵庫県','奈良県','和歌山県',
              '鳥取県','島根県','岡山県','広島県','山口県','徳島県','香川県','愛媛県','高知県',
              '福岡県','佐賀県','長崎県','熊本県','大分県','宮崎県','鹿児島県','沖縄県'];

  var AREA_LABEL = { hokkaido:'北海道・東北', kanto:'関東', chubu:'中部・北陸',
                     kinki:'近畿', chugoku:'中国・四国', kyushu:'九州・沖縄' };
  var AREA_ORDER = ['hokkaido','kanto','chubu','kinki','chugoku','kyushu'];

  /* 住所の先頭から都道府県を取り出す。'三重県伊勢市…' → '三重県' */
  function prefOf(s){
    var a = (s && s.addr) ? String(s.addr) : '';
    for (var i = 0; i < PREF.length; i++) {
      if (a.indexOf(PREF[i]) === 0) return PREF[i];
    }
    return '';
  }

  /* ---- 県の選択肢を作る（登録がある県だけ） ---------------------- */
  var builtCount = -1;
  function buildOptions(){
    var sel = document.getElementById('areaSel');
    if (!sel || typeof SHRINES === 'undefined' || !Array.isArray(SHRINES)) return false;
    if (builtCount === SHRINES.length) return true;   // 変化なし

    // いったん自分が足したものを消して作り直す（あとから神社が増えるため）
    Array.prototype.slice.call(sel.querySelectorAll('optgroup[data-wabi-pref]'))
      .forEach(function(g){ g.parentNode.removeChild(g); });

    var byArea = {};
    SHRINES.forEach(function(s){
      var p = prefOf(s);
      if (!p) return;
      var a = s.area || '';
      if (!byArea[a]) byArea[a] = {};
      byArea[a][p] = (byArea[a][p] || 0) + 1;
    });

    AREA_ORDER.forEach(function(a){
      var m = byArea[a];
      if (!m) return;
      var group = document.createElement('optgroup');
      group.setAttribute('data-wabi-pref', '1');
      group.label = (AREA_LABEL[a] || a) + '｜都道府県で選ぶ';
      Object.keys(m).sort(function(x, y){ return PREF.indexOf(x) - PREF.indexOf(y); })
        .forEach(function(p){
          var o = document.createElement('option');
          o.value = 'pref:' + p;
          o.textContent = p + '（' + m[p] + '）';
          group.appendChild(o);
        });
      sel.appendChild(group);
    });
    builtCount = SHRINES.length;
    return true;
  }

  /* ---- 県で絞り込む filter ---------------------------------------- */
  var installed = false;
  function install(){
    if (installed) return;
    if (typeof renderCard !== 'function' || typeof SHRINES === 'undefined') return;
    installed = true;

    var prev = window.filter;
    window.filter = function(){
      var sel = document.getElementById('areaSel');
      // 県が選ばれていないときは、これまでどおりの処理に任せる
      if (!sel || String(sel.value).indexOf('pref:') !== 0) {
        return prev && prev.apply(this, arguments);
      }
      try {
        var pref = sel.value.slice(5);
        var sortSel = document.getElementById('sortSel');
        var sort = sortSel ? sortSel.value : 'rank';
        var tag = (typeof currentTag !== 'undefined' && currentTag) ? currentTag : 'all';
        var MAX = 30, TOP = 10;

        var f = SHRINES.filter(function(s){ return prefOf(s) === pref; });
        if (typeof currentType !== 'undefined' && currentType) {
          f = f.filter(function(s){ return (s.type || 'shrine') === currentType; });
        }
        if (tag !== 'all') {
          f = f.filter(function(s){ return s.tags && s.tags.indexOf(tag) >= 0; });
        }
        if (sort === 'visited') f = f.filter(function(s){ return s.visited; });
        if (sort === 'rating')  f.sort(function(a, b){ return b.rating - a.rating; });
        if (sort === 'rank')    f.sort(function(a, b){ return a.rank - b.rank; });

        var top = f.slice(0, MAX);
        var shown = Math.min(top.length, TOP);
        var rc = document.getElementById('resCount');
        var rm = document.getElementById('rmeta');
        if (rc) rc.textContent = pref + ' ' + shown + '件';
        if (rm) rm.innerHTML = pref + ' <span>' + shown + '件</span> のおすすめ神社';
        document.getElementById('list').innerHTML = top.length
          ? top.map(function(s, i){ return renderCard(s, i + 1); }).join('')
          : '<div style="text-align:center;color:#9A9086;padding:2rem 0;font-size:13px">'
            + pref + 'の神社仏閣はまだありません</div>';
      } catch(e) {
        if (prev) prev.apply(this, arguments);
      }
    };
  }

  /* ---- 選び直したら描き直す（ここが効いていなかった） -------------- */
  function bind(){
    ['areaSel', 'sortSel'].forEach(function(id){
      var el = document.getElementById(id);
      if (!el || el.getAttribute('data-wabi-bound')) return;
      el.setAttribute('data-wabi-bound', '1');
      el.addEventListener('change', function(){
        try { if (typeof window.filter === 'function') window.filter(); } catch(e){}
      });
    });
  }

  function run(){
    bind();
    install();
    buildOptions();
  }

  if (document.readyState === 'complete') setTimeout(run, 100);
  else window.addEventListener('load', function(){ setTimeout(run, 100); });
  // 神社データはあとから増える（__wabiMoreShrines）ので、しばらく見張る
  [400, 1200, 2500, 5000].forEach(function(ms){ setTimeout(run, ms); });

  window.WabiPrefFilter = { rebuild: run, prefOf: prefOf };
})();


/* __wabiShrines2341 : おすすめランキングの登録数を増やす（2026-08-12）
   ・index.html は触らない。このブロックで SHRINES に追加する
   ・出典：Wikidata（CC0）。日本の神社（Q845945）・寺院（Q5393308）のうち
     Wikipediaに記事があるものを都道府県ごとに取得し、
     **掲載言語数の多い順＝知名度順**に各県50件まで採用した
   ・Googleへの問い合わせは一切していない。費用0円
   ・★とクチコミ件数は持っていないので、追加分では代わりに
     「Wikipedia ◯言語」を出す（既存113件はこれまでどおり★つき）   */
(function(){
  if (window.__wabiShrines2341) return;
  window.__wabiShrines2341 = true;

  var RAW = "鹿苑寺~0~京都府~kinki~57|伊勢神宮~1~三重県~chubu~44|高徳院~0~神奈川県~kanto~42|慈照寺~0~京都府~kinki~33|延暦寺~0~滋賀県~kinki~32|東寺~0~京都府~kinki~30|法隆寺地域の仏教建造物~0~奈良県~kinki~25|醍醐寺~0~京都府~kinki~23|東福寺~0~京都府~kinki~23|賀茂御祖神社~1~京都府~kinki~22|西芳寺~0~京都府~kinki~22|南禅寺~0~京都府~kinki~22|三十三間堂~0~京都府~kinki~21|宇治上神社~1~京都府~kinki~20|高山寺~0~京都府~kinki~20|大徳寺~0~京都府~kinki~20|知恩院~0~京都府~kinki~20|天龍寺~0~京都府~kinki~20|本能寺~0~京都府~kinki~20|大観密寺~0~宮城県~hokkaido~19|園城寺~0~滋賀県~kinki~19|唐招提寺~0~奈良県~kinki~19|金剛峯寺~0~和歌山県~kinki~19|賀茂神社~1~京都府~kinki~18|石山本願寺~0~大阪府~kinki~18|日光二荒山神社~1~栃木県~kanto~18|輪王寺~0~栃木県~kanto~18|元興寺~0~奈良県~kinki~18|西本願寺~0~京都府~kinki~17|妙心寺~0~京都府~kinki~17|鹿島神宮~1~茨城県~kanto~16|總持寺~0~神奈川県~kanto~16|宇佐神宮~1~大分県~kyushu~16|金峯山寺~0~奈良県~kinki~16|法起寺~0~奈良県~kinki~16|高台寺~0~京都府~kinki~15|氷川神社~1~埼玉県~kanto~15|熊野速玉大社~1~三重県~chubu~15|熊野本宮大社~1~三重県~chubu~15|吉野水分神社~1~奈良県~kinki~15|安泰寺~0~兵庫県~kinki~15|相国寺~0~京都府~kinki~14|方広寺~0~京都府~kinki~14|本願寺~0~京都府~kinki~14|萬福寺~0~京都府~kinki~14|武田神社~1~山梨県~chubu~14|根津神社~1~東京都~kanto~14|大神神社~1~奈良県~kinki~14|飛鳥寺~0~奈良県~kinki~14|青岸渡寺~0~和歌山県~kinki~14|毛越寺~0~岩手県~hokkaido~13|吉田神社~1~京都府~kinki~13|建仁寺~0~京都府~kinki~13|三宝院~0~京都府~kinki~13|泉涌寺~0~京都府~kinki~13|東本願寺~0~京都府~kinki~13|護国寺~0~東京都~kanto~13|上野東照宮~1~東京都~kanto~13|泉岳寺~0~東京都~kanto~13|西大寺~0~奈良県~kinki~13|立石寺~0~山形県~hokkaido~12|日吉大社~1~滋賀県~kinki~12|崇福寺~0~長崎県~kyushu~12|鎮西大社諏訪神社~1~長崎県~kyushu~12|大安寺~0~奈良県~kinki~12|聖福寺~0~福岡県~kyushu~12|愛宕神社~1~京都府~kinki~11|鞍馬寺~0~京都府~kinki~11|大覚寺~0~京都府~kinki~11|長谷寺~0~神奈川県~kanto~11|豪徳寺~0~東京都~kanto~11|築地本願寺~0~東京都~kanto~11|東郷神社~1~東京都~kanto~11|秋篠寺~0~奈良県~kinki~11|長谷寺~0~奈良県~kinki~11|生田神社~1~兵庫県~kinki~11|圓教寺~0~兵庫県~kinki~11|補陀洛山寺~0~和歌山県~kinki~11|笠間稲荷神社~1~茨城県~kanto~10|勧修寺~0~京都府~kinki~10|浄瑠璃寺~0~京都府~kinki~10|壬生寺~0~京都府~kinki~10|等持院~0~京都府~kinki~10|法観寺~0~京都府~kinki~10|法住寺~0~京都府~kinki~10|万寿寺~0~京都府~kinki~10|六波羅蜜寺~0~京都府~kinki~10|赤間神宮~1~山口県~chugoku~10|永源寺~0~滋賀県~kinki~10|宝厳寺~0~滋賀県~kinki~10|久能山東照宮~1~静岡県~chubu~10|尾山神社~1~石川県~chubu~10|香取神宮~1~千葉県~kanto~10|勝尾寺~0~大阪府~kinki~10|山王神社~1~長崎県~kyushu~10|寛永寺~0~東京都~kanto~10|鑁阿寺~0~栃木県~kanto~10|橿原神宮~1~奈良県~kinki~10|春日山原始林~1~奈良県~kinki~10|石上神宮~1~奈良県~kinki~10|一乗寺~0~兵庫県~kinki~10|酒見寺~1~兵庫県~kinki~10|浄土寺~0~兵庫県~kinki~10|鶴林寺~0~兵庫県~kinki~10|廣田神社~1~兵庫県~kinki~10|根来寺~0~和歌山県~kinki~10|丹生官省符神社~1~和歌山県~kinki~10|丹生都比売神社~1~和歌山県~kinki~10|田縣神社~1~愛知県~chubu~9|合氣神社~1~茨城県~kanto~9|常磐神社~1~茨城県~kanto~9|観自在王院跡~0~岩手県~hokkaido~9|浄土寺~0~広島県~chugoku~9|喜多院~0~埼玉県~kanto~9|石山寺~0~滋賀県~kinki~9|寿福寺~0~神奈川県~kanto~9|東慶寺~0~神奈川県~kanto~9|平間寺~0~神奈川県~kanto~9|報国寺~0~神奈川県~kanto~9|妙本寺~0~神奈川県~kanto~9|静岡浅間神社~1~静岡県~chubu~9|大石寺~0~静岡県~chubu~9|観心寺~0~大阪府~kinki~9|富貴寺~0~大分県~kyushu~9|三仏寺~0~鳥取県~chugoku~9|愛宕神社~1~東京都~kanto~9|宮中三殿~1~東京都~kanto~9|柴又帝釈天~0~東京都~kanto~9|乃木神社~1~東京都~kanto~9|富岡八幡宮~1~東京都~kanto~9|吉水神社~1~奈良県~kinki~9|新薬師寺~0~奈良県~kinki~9|大峯山寺~0~奈良県~kinki~9|談山神社~1~奈良県~kinki~9|龍田大社~1~奈良県~kinki~9|當麻寺~0~奈良県~kinki~9|国泰寺~0~富山県~chubu~9|崇福寺~0~福岡県~kyushu~9|西宮神社~1~兵庫県~kinki~9|太山寺~0~兵庫県~kinki~9|長田神社~1~兵庫県~kinki~9|大須観音~0~愛知県~chubu~8|津島神社~1~愛知県~chubu~8|太山寺~0~愛媛県~chugoku~8|伊奈波神社~1~岐阜県~chubu~8|宮﨑神宮~1~宮崎県~kyushu~8|鹽竈神社~1~宮城県~hokkaido~8|佛通寺~0~広島県~chugoku~8|屋島寺~0~香川県~chugoku~8|本山寺~0~香川県~chugoku~8|竹林寺~0~高知県~chugoku~8|祐徳稲荷神社~1~佐賀県~kyushu~8|久遠寺~0~山梨県~chubu~8|摠見寺~0~滋賀県~kinki~8|鎌倉宮~1~神奈川県~kanto~8|浄妙寺~0~神奈川県~kanto~8|瑞泉寺~0~神奈川県~kanto~8|杉本寺~0~神奈川県~kanto~8|大船観音寺~0~神奈川県~kanto~8|円福寺~0~千葉県~kanto~8|那古寺~0~千葉県~kanto~8|太融寺~0~大阪府~kinki~8|大念仏寺~0~大阪府~kinki~8|豊國神社~1~大阪府~kinki~8|福済寺~0~長崎県~kyushu~8|戸隠神社~1~長野県~chubu~8|佐太神社~1~島根県~chugoku~8|花園神社~1~東京都~kanto~8|東禅寺~0~東京都~kanto~8|蓮光寺~0~東京都~kanto~8|十楽寺~0~徳島県~chugoku~8|大日寺~0~徳島県~chugoku~8|地蔵寺~0~徳島県~chugoku~8|霊山寺~0~徳島県~chugoku~8|岡寺~0~奈良県~kinki~8|金峯神社~1~奈良県~kinki~8|大和神社~1~奈良県~kinki~8|中宮寺~0~奈良県~kinki~8|般若寺~0~奈良県~kinki~8|宝山寺~0~奈良県~kinki~8|霊山寺~0~奈良県~kinki~8|圓照寺~0~奈良県~kinki~8|廣瀬大社~1~奈良県~kinki~8|高良大社~1~福岡県~kyushu~8|伊和神社~1~兵庫県~kinki~8|道成寺~0~和歌山県~kinki~8|覚王山日泰寺~0~愛知県~chubu~7|萬松寺~0~愛知県~chubu~7|八坂寺~0~愛媛県~chugoku~7|無量光院跡~0~岩手県~hokkaido~7|南宮大社~1~岐阜県~chubu~7|青葉神社~1~宮城県~hokkaido~7|仙台東照宮~1~宮城県~hokkaido~7|陸奥国分寺~0~宮城県~hokkaido~7|青井阿蘇神社~1~熊本県~kyushu~7|広島護国神社~1~広島県~chugoku~7|三瀧寺~0~広島県~chugoku~7|国分寺~0~香川県~chugoku~7|大窪寺~0~香川県~chugoku~7|国分寺~0~高知県~chugoku~7|小村神社~1~高知県~chugoku~7|禅師峰寺~0~高知県~chugoku~7|高麗神社~1~埼玉県~kanto~7|多度大社~1~三重県~chubu~7|熊野神社~1~山形県~hokkaido~7|月山神社~1~山形県~hokkaido~7|功山寺~0~山口県~chugoku~7|瑠璃光寺~0~山口県~chugoku~7|近江神宮~1~滋賀県~kinki~7|多賀大社~1~滋賀県~kinki~7|満月寺~0~滋賀県~kinki~7|照国神社~1~鹿児島県~kyushu~7|度津神社~1~新潟県~chubu~7|彌彦神社~1~新潟県~chubu~7|安養院~0~神奈川県~kanto~7|佐助稲荷神社~1~神奈川県~kanto~7|浄智寺~0~神奈川県~kanto~7|明月院~0~神奈川県~kanto~7|岩木山神社~1~青森県~hokkaido~7|家原寺~0~大阪府~kinki~7|教興寺~0~大阪府~kinki~7|国分寺~0~大阪府~kinki~7|生國魂神社~1~大阪府~kinki~7|青蓮寺~0~大阪府~kinki~7|大鳥大社~1~大阪府~kinki~7|道明寺~0~大阪府~kinki~7|枚岡神社~1~大阪府~kinki~7|妙国寺~0~大阪府~kinki~7|西寒多神社~1~大分県~kyushu~7|御柱祭~1~長野県~chubu~7|回向院~0~東京都~kanto~7|正福寺~0~東京都~kanto~7|曹源寺~0~東京都~kanto~7|天王寺~0~東京都~kanto~7|氷川神社 (赤坂)~1~東京都~kanto~7|安楽寺~0~徳島県~chugoku~7|極楽寺~0~徳島県~chugoku~7|金泉寺~0~徳島県~chugoku~7|法輪寺~0~徳島県~chugoku~7|薬王寺~0~徳島県~chugoku~7|室生寺~0~奈良県~kinki~7|丹生川上神社~1~奈良県~kinki~7|法華寺~0~奈良県~kinki~7|法輪寺~0~奈良県~kinki~7|瑞龍寺~0~富山県~chubu~7|明通寺~0~福井県~chubu~7|櫛田神社~1~福岡県~kyushu~7|香椎宮~1~福岡県~kyushu~7|忉利天上寺~0~兵庫県~kinki~7|奥之院~0~和歌山県~kinki~7|金剛三昧院~0~和歌山県~kinki~7|慈尊院~0~和歌山県~kinki~7|長保寺~0~和歌山県~kinki~7|笠覆寺~0~愛知県~chubu~6|荒子観音~0~愛知県~chubu~6|大縣神社~1~愛知県~chubu~6|砥鹿神社~1~愛知県~chubu~6|桃巌寺~0~愛知県~chubu~6|豊川稲荷~0~愛知県~chubu~6|観自在寺~0~愛媛県~chugoku~6|吉祥寺~0~愛媛県~chugoku~6|浄土寺~0~愛媛県~chugoku~6|大宝寺~0~愛媛県~chugoku~6|佛木寺~0~愛媛県~chugoku~6|大洗磯前神社~1~茨城県~kanto~6|筑波山神社~1~茨城県~kanto~6|盛岡八幡宮~1~岩手県~hokkaido~6|永保寺~0~岐阜県~chubu~6|崇福寺~0~岐阜県~chubu~6|飛騨一宮水無神社~1~岐阜県~chubu~6|都農神社~1~宮崎県~kyushu~6|竹駒神社~1~宮城県~hokkaido~6|加藤神社~1~熊本県~kyushu~6|大慈寺~0~熊本県~kyushu~6|八代宮~1~熊本県~kyushu~6|耕三寺~0~広島県~chugoku~6|千光寺~0~広島県~chugoku~6|多家神社~1~広島県~chugoku~6|明王院~0~広島県~chugoku~6|琴弾八幡宮~1~香川県~chugoku~6|八栗寺~0~香川県~chugoku~6|岩本寺~0~高知県~chugoku~6|金剛福寺~0~高知県~chugoku~6|最御崎寺~0~高知県~chugoku~6|種間寺~0~高知県~chugoku~6|神峯寺~0~高知県~chugoku~6|清瀧寺~0~高知県~chugoku~6|青龍寺~0~高知県~chugoku~6|雪蹊寺~0~高知県~chugoku~6|善楽寺~0~高知県~chugoku~6|大日寺~0~高知県~chugoku~6|津照寺~0~高知県~chugoku~6|陶山神社~1~佐賀県~kyushu~6|所澤神明社~1~埼玉県~kanto~6|鷲宮神社~1~埼玉県~kanto~6|皇大神宮~1~三重県~chubu~6|二見興玉神社~1~三重県~chubu~6|北畠神社~1~三重県~chubu~6|鳥海山大物忌神社~1~山形県~hokkaido~6|恵林寺~0~山梨県~chubu~6|向嶽寺~0~山梨県~chubu~6|清白寺~0~山梨県~chubu~6|大善寺~0~山梨県~chubu~6|西明寺~0~滋賀県~kinki~6|天孫神社~1~滋賀県~kinki~6|白鬚神社~1~滋賀県~kinki~6|鹿児島神宮~1~鹿児島県~kyushu~6|枚聞神社~1~鹿児島県~kyushu~6|居多神社~1~新潟県~chubu~6|天津神社~1~新潟県~chubu~6|寒川神社~1~神奈川県~kanto~6|極楽寺~0~神奈川県~kanto~6|銭洗弁財天宇賀福神社~1~神奈川県~kanto~6|長寿寺~0~神奈川県~kanto~6|長勝寺~0~神奈川県~kanto~6|東勝寺~0~神奈川県~kanto~6|龍口寺~0~神奈川県~kanto~6|猿賀神社~1~青森県~hokkaido~6|青龍寺~0~青森県~hokkaido~6|伊豆山神社~1~静岡県~chubu~6|玉泉寺~0~静岡県~chubu~6|秋葉山本宮秋葉神社~1~静岡県~chubu~6|妙立寺~0~石川県~chubu~6|安房神社~1~千葉県~kanto~6|玉前神社~1~千葉県~kanto~6|千葉寺~0~千葉県~kanto~6|大福寺~0~千葉県~kanto~6|日本寺~0~千葉県~kanto~6|法華経寺~0~千葉県~kanto~6|万満寺~0~千葉県~kanto~6|葛井寺~0~大阪府~kinki~6|金剛寺~0~大阪府~kinki~6|孝恩寺~0~大阪府~kinki~6|坐摩神社~1~大阪府~kinki~6|施福寺~0~大阪府~kinki~6|慈眼寺~0~大阪府~kinki~6|常光寺~0~大阪府~kinki~6|水無瀬神宮~1~大阪府~kinki~6|正圓寺~0~大阪府~kinki~6|全興寺~0~大阪府~kinki~6|太平寺~0~大阪府~kinki~6|難波神社~1~大阪府~kinki~6|難波八阪神社~1~大阪府~kinki~6|報恩院~0~大阪府~kinki~6|法楽寺~0~大阪府~kinki~6|柞原八幡宮~1~大分県~kyushu~6|聖福寺~0~長崎県~kyushu~6|安楽寺~0~長野県~chubu~6|宇倍神社~1~鳥取県~chugoku~6|観音院~0~鳥取県~chugoku~6|大山寺~0~鳥取県~chugoku~6|大神山神社~1~鳥取県~chugoku~6|倭文神社~1~鳥取県~chugoku~6|王子神社~1~東京都~kanto~6|丸山神社~1~東京都~kanto~6|浄閑寺~0~東京都~kanto~6|水天宮~1~東京都~kanto~6|善養寺~0~東京都~kanto~6|大國魂神社~1~東京都~kanto~6|東京十社~1~東京都~kanto~6|観音寺~0~徳島県~chugoku~6|熊谷寺~0~徳島県~chugoku~6|常楽寺~0~徳島県~chugoku~6|切幡寺~0~徳島県~chugoku~6|鶴林寺~0~徳島県~chugoku~6|平等寺~0~徳島県~chugoku~6|立江寺~0~徳島県~chugoku~6|宇太水分神社~1~奈良県~kinki~6|吉野神宮~1~奈良県~kinki~6|橘寺~0~奈良県~kinki~6|山田寺~0~奈良県~kinki~6|手向山八幡宮~1~奈良県~kinki~6|朝護孫子寺~0~奈良県~kinki~6|東大寺二月堂~0~奈良県~kinki~6|東大寺法華堂~0~奈良県~kinki~6|南都七大寺~0~奈良県~kinki~6|白毫寺~0~奈良県~kinki~6|不退寺~0~奈良県~kinki~6|吉崎御坊~0~福井県~chubu~6|氣比神宮~1~福井県~chubu~6|戒壇院~0~福岡県~kyushu~6|観世音寺~0~福岡県~kyushu~6|宮地嶽神社~1~福岡県~kyushu~6|光明禅寺~0~福岡県~kyushu~6|南蔵院~0~福岡県~kyushu~6|和布刈神社~1~福岡県~kyushu~6|竈門神社~1~福岡県~kyushu~6|白水阿弥陀堂~0~福島県~hokkaido~6|霊山神社~1~福島県~hokkaido~6|出石神社~1~兵庫県~kinki~6|神呪寺~0~兵庫県~kinki~6|朝光寺~0~兵庫県~kinki~6|能福寺~0~兵庫県~kinki~6|湊川神社~1~兵庫県~kinki~6|淡嶋神社~1~和歌山県~kinki~6|粉河寺~0~和歌山県~kinki~6|間々観音~0~愛知県~chubu~5|興正寺~0~愛知県~chubu~5|甚目寺~0~愛知県~chubu~5|大樹寺~0~愛知県~chubu~5|豊国神社~1~愛知県~chubu~5|鳳来寺~0~愛知県~chubu~5|本願寺名古屋別院~0~愛知県~chubu~5|国分寺~0~愛媛県~chugoku~5|浄瑠璃寺~0~愛媛県~chugoku~5|瑞應寺~0~愛媛県~chugoku~5|繁多寺~0~愛媛県~chugoku~5|宝厳寺~0~愛媛県~chugoku~5|宝寿寺~0~愛媛県~chugoku~5|明石寺~0~愛媛県~chugoku~5|龍光寺~0~愛媛県~chugoku~5|圓明寺~0~愛媛県~chugoku~5|意富比神社~1~茨城県~kanto~5|楽法寺~0~茨城県~kanto~5|吉備津彦神社~1~岡山県~chugoku~5|中山神社~1~岡山県~chugoku~5|備前国総社宮~1~岡山県~chugoku~5|頼久寺~0~岡山県~chugoku~5|沖縄神社~1~沖縄県~kyushu~5|護国寺~0~沖縄県~kyushu~5|崇元寺~0~沖縄県~kyushu~5|尖閣神社~1~沖縄県~kyushu~5|加納天満宮~1~岐阜県~chubu~5|岐阜護國神社~1~岐阜県~chubu~5|気多若宮神社~1~岐阜県~chubu~5|常在寺~0~岐阜県~chubu~5|瑞龍寺~0~岐阜県~chubu~5|正法寺~0~岐阜県~chubu~5|養老神社~1~岐阜県~chubu~5|正念寺~0~宮崎県~kyushu~5|青島神社~1~宮崎県~kyushu~5|円通院~0~宮城県~hokkaido~5|高蔵寺~0~宮城県~hokkaido~5|菊池神社~1~熊本県~kyushu~5|藤崎八旛宮~1~熊本県~kyushu~5|北岡神社~1~熊本県~kyushu~5|本妙寺~0~熊本県~kyushu~5|榛名神社~1~群馬県~kanto~5|不動院~0~広島県~chugoku~5|一宮寺~0~香川県~chugoku~5|志度寺~0~香川県~chugoku~5|長尾寺~0~香川県~chugoku~5|白峯寺~0~香川県~chugoku~5|曼荼羅寺~0~香川県~chugoku~5|延光寺~0~高知県~chugoku~5|金剛頂寺~0~高知県~chugoku~5|千栗八幡宮~1~佐賀県~kyushu~5|田島神社~1~佐賀県~kyushu~5|慈恩寺~0~埼玉県~kanto~5|氷川神社~1~埼玉県~kanto~5|平林寺~0~埼玉県~kanto~5|伊雑宮~1~三重県~chubu~5|伊射波神社~1~三重県~chubu~5|夏見廃寺~0~三重県~chubu~5|金剛證寺~0~三重県~chubu~5|佐美長神社~1~三重県~chubu~5|豊受大神宮~1~三重県~chubu~5|上杉神社~1~山形県~hokkaido~5|法善寺~0~山梨県~chubu~5|金剛輪寺~0~滋賀県~kinki~5|建部大社~1~滋賀県~kinki~5|長寿寺~0~滋賀県~kinki~5|甘縄神明神社~1~神奈川県~kanto~5|光明寺~0~神奈川県~kanto~5|勝福寺 (小田原市)~0~神奈川県~kanto~5|常立寺~0~神奈川県~kanto~5|清浄光寺~0~神奈川県~kanto~5|長谷寺~0~神奈川県~kanto~5|妙法寺~0~神奈川県~kanto~5|伊豆国分寺~0~静岡県~chubu~5|井伊谷宮~1~静岡県~chubu~5|願成就院~0~静岡県~chubu~5|事任八幡宮~1~静岡県~chubu~5|修禅寺~0~静岡県~chubu~5|小国神社~1~静岡県~chubu~5|了仙寺~0~静岡県~chubu~5|菅生石部神社~1~石川県~chubu~5|大乗寺~0~石川県~chubu~5|豊国神社~1~石川県~chubu~5|一月寺~0~千葉県~kanto~5|笠森寺~0~千葉県~kanto~5|鏡忍寺~0~千葉県~kanto~5|高蔵寺~0~千葉県~kanto~5|清澄寺~0~千葉県~kanto~5|千葉神社~1~千葉県~kanto~5|誕生寺~0~千葉県~kanto~5|東海寺~0~千葉県~kanto~5|一心寺~0~大阪府~kinki~5|叡福寺~0~大阪府~kinki~5|今宮戎神社~1~大阪府~kinki~5|神峯山寺~0~大阪府~kinki~5|西琳寺~0~大阪府~kinki~5|総持寺~0~大阪府~kinki~5|美多彌神社~1~大阪府~kinki~5|百済寺~0~大阪府~kinki~5|法善寺~0~大阪府~kinki~5|壺井八幡宮~1~大阪府~kinki~5|神角寺~0~大分県~kyushu~5|両子寺~0~大分県~kyushu~5|海神神社~1~長崎県~kyushu~5|興神社~1~長崎県~kyushu~5|和多都美神社~1~長崎県~kyushu~5|光前寺~0~長野県~chubu~5|信濃国分寺~0~長野県~chubu~5|仁科神明宮~1~長野県~chubu~5|金持神社~1~鳥取県~chugoku~5|若桜神社~1~鳥取県~chugoku~5|白兎神社~1~鳥取県~chugoku~5|名和神社~1~鳥取県~chugoku~5|日御碕神社~1~島根県~chugoku~5|八重垣神社~1~島根県~chugoku~5|由良比女神社~1~島根県~chugoku~5|葛西神社~1~東京都~kanto~5|吉祥寺~0~東京都~kanto~5|高岩寺~0~東京都~kanto~5|全生庵~0~東京都~kanto~5|大宮八幡宮~1~東京都~kanto~5|瀧泉寺~0~東京都~kanto~5|伏見三寳稲荷神社~1~東京都~kanto~5|祐天寺~0~東京都~kanto~5|井戸寺~0~徳島県~chugoku~5|一宮神社~1~徳島県~chugoku~5|雲辺寺~0~徳島県~chugoku~5|恩山寺~0~徳島県~chugoku~5|国分寺~0~徳島県~chugoku~5|焼山寺~0~徳島県~chugoku~5|太龍寺~0~徳島県~chugoku~5|大山寺~0~徳島県~chugoku~5|大日寺~0~徳島県~chugoku~5|大麻比古神社~1~徳島県~chugoku~5|藤井寺~0~徳島県~chugoku~5|童学寺~0~徳島県~chugoku~5|西明寺 (益子町)~0~栃木県~kanto~5|大谷寺~0~栃木県~kanto~5|中禅寺~0~栃木県~kanto~5|本寺専修寺~0~栃木県~kanto~5|高瀬神社~1~富山県~chubu~5|金崎宮~1~福井県~chubu~5|宝慶寺~0~福井県~chubu~5|劔神社~1~福井県~chubu~5|宇美八幡宮~1~福岡県~kyushu~5|志賀海神社~1~福岡県~kyushu~5|承天寺~0~福岡県~kyushu~5|水天宮~1~福岡県~kyushu~5|東長寺~0~福岡県~kyushu~5|梅林寺~0~福岡県~kyushu~5|風浪宮~1~福岡県~kyushu~5|伊佐須美神社~1~福島県~hokkaido~5|勝常寺~0~福島県~hokkaido~5|多田神社~1~兵庫県~kinki~5|上川神社~1~北海道~hokkaido~5|函館八幡宮~1~北海道~hokkaido~5|紀三井寺~0~和歌山県~kinki~5|熊野三山~1~和歌山県~kinki~5|日前神宮・國懸神宮~1~和歌山県~kinki~5|竈山神社~1~和歌山県~kinki~5|愛知縣護國神社~1~愛知県~chubu~4|若宮八幡社~1~愛知県~chubu~4|勝鬘寺~0~愛知県~chubu~4|城山八幡宮~1~愛知県~chubu~4|誓願寺~0~愛知県~chubu~4|川原神社~1~愛知県~chubu~4|大神神社~1~愛知県~chubu~4|長楽寺~0~愛知県~chubu~4|那古野神社~1~愛知県~chubu~4|尾張大国霊神社~1~愛知県~chubu~4|本光寺 (幸田町)~0~愛知県~chubu~4|名古屋東照宮~1~愛知県~chubu~4|六所神社~1~愛知県~chubu~4|伊佐爾波神社~1~愛媛県~chugoku~4|横峰寺~0~愛媛県~chugoku~4|岩屋寺~0~愛媛県~chugoku~4|香園寺~0~愛媛県~chugoku~4|三角寺~0~愛媛県~chugoku~4|西林寺~0~愛媛県~chugoku~4|仙遊寺~0~愛媛県~chugoku~4|前神寺~0~愛媛県~chugoku~4|佐竹寺~0~茨城県~kanto~4|酒列磯前神社~1~茨城県~kanto~4|水戸東照宮~1~茨城県~kanto~4|正福寺~0~茨城県~kanto~4|清滝寺~0~茨城県~kanto~4|大御堂~0~茨城県~kanto~4|日輪寺~0~茨城県~kanto~4|高顕寺~0~岡山県~chugoku~4|長福寺~0~岡山県~chugoku~4|備中国分寺~0~岡山県~chugoku~4|末吉宮~1~沖縄県~kyushu~4|高舘義経堂~0~岩手県~hokkaido~4|達谷窟~0~岩手県~hokkaido~4|中尊寺金色堂~0~岩手県~hokkaido~4|華厳寺~0~岐阜県~chubu~4|橿森神社~1~岐阜県~chubu~4|金神社~1~岐阜県~chubu~4|護国之寺~0~岐阜県~chubu~4|三輪神社~1~岐阜県~chubu~4|大龍寺~0~岐阜県~chubu~4|長良天神神社~1~岐阜県~chubu~4|濃飛護國神社~1~岐阜県~chubu~4|飛騨護國神社~1~岐阜県~chubu~4|飛騨国分寺~0~岐阜県~chubu~4|美江寺~0~岐阜県~chubu~4|美濃国分寺~0~岐阜県~chubu~4|法華寺~0~岐阜県~chubu~4|本荘神社 (岐阜市)~1~岐阜県~chubu~4|来振寺~0~岐阜県~chubu~4|狭野神社~1~宮崎県~kyushu~4|江田神社~1~宮崎県~kyushu~4|神門神社~1~宮崎県~kyushu~4|天岩戸神社~1~宮崎県~kyushu~4|都萬神社~1~宮崎県~kyushu~4|槵觸神社~1~宮崎県~kyushu~4|愛宕神社~1~宮城県~hokkaido~4|西方寺~0~宮城県~hokkaido~4|陸奥国分尼寺~0~宮城県~hokkaido~4|健軍神社~1~熊本県~kyushu~4|高橋稲荷神社~1~熊本県~kyushu~4|上色見熊野座神社~1~熊本県~kyushu~4|一之宮貫前神社~1~群馬県~kanto~4|水澤寺~0~群馬県~kanto~4|生品神社~1~群馬県~kanto~4|達磨寺~0~群馬県~kanto~4|中之嶽神社~1~群馬県~kanto~4|長谷寺~0~群馬県~kanto~4|安国寺~0~広島県~chugoku~4|持光寺~0~広島県~chugoku~4|郷照寺~0~香川県~chugoku~4|金倉寺~0~香川県~chugoku~4|甲山寺~0~香川県~chugoku~4|根香寺~0~香川県~chugoku~4|出釈迦寺~0~香川県~chugoku~4|神谷神社~1~香川県~chugoku~4|大興寺~0~香川県~chugoku~4|天皇寺~0~香川県~chugoku~4|田村神社~1~香川県~chugoku~4|弥谷寺~0~香川県~chugoku~4|豊楽寺~0~高知県~chugoku~4|鏡神社~1~佐賀県~kyushu~4|佐嘉神社~1~佐賀県~kyushu~4|大興善寺 (基山町)~0~佐賀県~kyushu~4|與止日女神社~1~佐賀県~kyushu~4|安楽寺~0~埼玉県~kanto~4|久伊豆神社~1~埼玉県~kanto~4|三峯神社~1~埼玉県~kanto~4|慈光寺~0~埼玉県~kanto~4|正法寺~0~埼玉県~kanto~4|秩父神社~1~埼玉県~kanto~4|伊賀国分寺跡~0~三重県~chubu~4|猿田彦神社~1~三重県~chubu~4|敢國神社~1~三重県~chubu~4|結城神社~1~三重県~chubu~4|月讀宮~1~三重県~chubu~4|荒祭宮~1~三重県~chubu~4|都波岐神社・奈加等神社~1~三重県~chubu~4|出羽神社~1~山形県~hokkaido~4|鳥海月山両所宮~1~山形県~hokkaido~4|湯殿山神社~1~山形県~hokkaido~4|玉祖神社~1~山口県~chugoku~4|周防国分寺~0~山口県~chugoku~4|円光院~0~山梨県~chubu~4|景徳院~0~山梨県~chubu~4|甲斐国分寺~0~山梨県~chubu~4|山梨縣護國神社~1~山梨県~chubu~4|棲雲寺~0~山梨県~chubu~4|浅間神社~1~山梨県~chubu~4|大泉寺~0~山梨県~chubu~4|長禅寺~0~山梨県~chubu~4|東光寺~0~山梨県~chubu~4|富士山-信仰の対象と芸術の源泉~1~山梨県~chubu~4|観音正寺~0~滋賀県~kinki~4|義仲寺~0~滋賀県~kinki~4|滋賀縣護國神社~1~滋賀県~kinki~4|常楽寺~0~滋賀県~kinki~4|正法寺~0~滋賀県~kinki~4|善水寺~0~滋賀県~kinki~4|長命寺~0~滋賀県~kinki~4|都久夫須麻神社~1~滋賀県~kinki~4|百済寺~0~滋賀県~kinki~4|苗村神社~1~滋賀県~kinki~4|新田神社~1~鹿児島県~kyushu~4|古四王神社~1~秋田県~hokkaido~4|伊勢山皇大神宮~1~神奈川県~kanto~4|金山神社~1~神奈川県~kanto~4|元八幡~1~神奈川県~kanto~4|光明寺~0~神奈川県~kanto~4|弘明寺~0~神奈川県~kanto~4|星谷寺~0~神奈川県~kanto~4|相模国分寺~0~神奈川県~kanto~4|大山阿夫利神社~1~神奈川県~kanto~4|報徳二宮神社~1~神奈川県~kanto~4|宝戒寺~0~神奈川県~kanto~4|蕪嶋神社~1~青森県~hokkaido~4|五社神社・諏訪神社~1~静岡県~chubu~4|柴屋寺~0~静岡県~chubu~4|承元寺~0~静岡県~chubu~4|焼津神社~1~静岡県~chubu~4|清見寺~0~静岡県~chubu~4|長楽寺~0~静岡県~chubu~4|方広寺~0~静岡県~chubu~4|龍潭寺~0~静岡県~chubu~4|臨済寺~0~静岡県~chubu~4|能登国分寺~0~石川県~chubu~4|總持寺祖院~0~石川県~chubu~4|安房国分寺~0~千葉県~kanto~4|洲崎神社~1~千葉県~kanto~4|小御門神社~1~千葉県~kanto~4|甚大寺~0~千葉県~kanto~4|筒森神社~1~千葉県~kanto~4|龍正院~0~千葉県~kanto~4|良玄寺~0~千葉県~kanto~4|サムハラ神社~1~大阪府~kinki~4|阿部野神社~1~大阪府~kinki~4|海会寺跡~0~大阪府~kinki~4|吉志部神社~1~大阪府~kinki~4|玉造稲荷神社~1~大阪府~kinki~4|桜井神社~1~大阪府~kinki~4|三光神社~1~大阪府~kinki~4|真木大堂~0~大分県~kyushu~4|羅漢寺~0~大分県~kyushu~4|厳原八幡宮神社~1~長崎県~kyushu~4|長崎縣護國神社~1~長崎県~kyushu~4|天手長男神社~1~長崎県~kyushu~4|金龍寺~0~長野県~chubu~4|生島足島神社~1~長野県~chubu~4|穂高神社~1~長野県~chubu~4|上淀廃寺跡~0~鳥取県~chugoku~4|諏訪神社~1~鳥取県~chugoku~4|鳥取東照宮~1~鳥取県~chugoku~4|隠岐国分寺~0~島根県~chugoku~4|月照寺~0~島根県~chugoku~4|神魂神社~1~島根県~chugoku~4|須佐神社~1~島根県~chugoku~4|水若酢神社~1~島根県~chugoku~4|太皷谷稲成神社~1~島根県~chugoku~4|物部神社~1~島根県~chugoku~4|魚籃寺~0~東京都~kanto~4|九品仏浄真寺~0~東京都~kanto~4|愛染院~0~徳島県~chugoku~4|東林院~0~徳島県~chugoku~4|宇都宮二荒山神社~1~栃木県~kanto~4|下野薬師寺跡~0~栃木県~kanto~4|唐沢山神社~1~栃木県~kanto~4|満願寺~0~栃木県~kanto~4|気多神社~1~富山県~chubu~4|射水神社~1~富山県~chubu~4|日石寺~0~富山県~chubu~4|富山縣護國神社~1~富山県~chubu~4|雄山神社~1~富山県~chubu~4|若狭国分寺~0~福井県~chubu~4|若狭彦神社~1~福井県~chubu~4|藤島神社~1~福井県~chubu~4|平泉寺白山神社~1~福井県~chubu~4|萬徳寺~0~福井県~chubu~4|御祖神社~1~福岡県~kyushu~4|七夕神社~1~福岡県~kyushu~4|水田天満宮~1~福岡県~kyushu~4|正覚寺~0~福岡県~kyushu~4|千如寺~0~福岡県~kyushu~4|善導寺~0~福岡県~kyushu~4|如意輪寺~0~福岡県~kyushu~4|福聚寺~0~福岡県~kyushu~4|鷲尾愛宕神社~1~福岡県~kyushu~4|恵日寺~0~福島県~hokkaido~4|都都古別神社~1~福島県~hokkaido~4|粟鹿神社~1~兵庫県~kinki~4|安養院~0~兵庫県~kinki~4|伊弉諾神宮~1~兵庫県~kinki~4|伽耶院~0~兵庫県~kinki~4|花岳寺~0~兵庫県~kinki~4|広峯神社~1~兵庫県~kinki~4|射楯兵主神社~1~兵庫県~kinki~4|須磨寺~0~兵庫県~kinki~4|清荒神清澄寺~0~兵庫県~kinki~4|大宮八幡宮~1~兵庫県~kinki~4|大和大国魂神社~1~兵庫県~kinki~4|猪名野神社~1~兵庫県~kinki~4|売布神社~1~兵庫県~kinki~4|平林寺~0~兵庫県~kinki~4|平和観音寺~0~兵庫県~kinki~4|菩提寺~0~兵庫県~kinki~4|本福寺~0~兵庫県~kinki~4|毫摂寺 (宝塚市)~0~兵庫県~kinki~4|姥神大神宮~1~北海道~hokkaido~4|岩見沢神社~1~北海道~hokkaido~4|国泰寺~0~北海道~hokkaido~4|上国寺~0~北海道~hokkaido~4|真宗大谷派函館別院~0~北海道~hokkaido~4|太田山神社~1~北海道~hokkaido~4|帯廣神社~1~北海道~hokkaido~4|樽前山神社~1~北海道~hokkaido~4|伊太祁曽神社~1~和歌山県~kinki~4|広八幡神社~1~和歌山県~kinki~4|浄妙寺 (有田市)~0~和歌山県~kinki~4|善福院~0~和歌山県~kinki~4|阿弥陀寺~0~愛知県~chubu~3|久昌寺~0~愛知県~chubu~3|強巴林~0~愛知県~chubu~3|金蓮寺~0~愛知県~chubu~3|建中寺~0~愛知県~chubu~3|御器所八幡宮~1~愛知県~chubu~3|香積院~0~愛知県~chubu~3|三河国分寺~0~愛知県~chubu~3|三河国分尼寺~0~愛知県~chubu~3|松平東照宮~1~愛知県~chubu~3|松應寺~0~愛知県~chubu~3|成田山名古屋別院大聖寺~0~愛知県~chubu~3|政秀寺~0~愛知県~chubu~3|正住院~0~愛知県~chubu~3|聖徳寺~0~愛知県~chubu~3|大山廃寺跡~0~愛知県~chubu~3|伊豫稲荷神社~1~愛媛県~chugoku~3|栄福寺~0~愛媛県~chugoku~3|延命寺~0~愛媛県~chugoku~3|王至森寺~0~愛媛県~chugoku~3|久米官衙遺跡群~0~愛媛県~chugoku~3|極楽寺~0~愛媛県~chugoku~3|高昌寺~0~愛媛県~chugoku~3|石鎚神社~1~愛媛県~chugoku~3|泰山寺~0~愛媛県~chugoku~3|大寶寺~0~愛媛県~chugoku~3|東雲神社~1~愛媛県~chugoku~3|南光坊~0~愛媛県~chugoku~3|一言主神社~1~茨城県~kanto~3|下館羽黒神社~1~茨城県~kanto~3|金村別雷神社~1~茨城県~kanto~3|常陸国分寺~0~茨城県~kanto~3|常陸國總社宮~1~茨城県~kanto~3|息栖神社~1~茨城県~kanto~3|大杉神社~1~茨城県~kanto~3|安仁神社~1~岡山県~chugoku~3|蔭涼寺~0~岡山県~chugoku~3|岡山寺~0~岡山県~chugoku~3|岡山神社~1~岡山県~chugoku~3|国清寺~0~岡山県~chugoku~3|最上稲荷~0~岡山県~chugoku~3|作楽神社~1~岡山県~chugoku~3|正楽寺~0~岡山県~chugoku~3|西大寺~0~岡山県~chugoku~3|大多羅寄宮~1~岡山県~chugoku~3|幡多廃寺塔跡~0~岡山県~chugoku~3|備前国分寺跡~0~岡山県~chugoku~3|美作国分寺~0~岡山県~chugoku~3|本蓮寺~0~岡山県~chugoku~3|餘慶寺~0~岡山県~chugoku~3|沖宮~1~沖縄県~kyushu~3|金武宮~1~沖縄県~kyushu~3|識名宮~1~沖縄県~kyushu~3|天久宮~1~沖縄県~kyushu~3|桃林寺~0~沖縄県~kyushu~3|普天満宮~1~沖縄県~kyushu~3|駒形神社~1~岩手県~hokkaido~3|桜山神社~1~岩手県~hokkaido~3|正法寺~0~岩手県~hokkaido~3|報恩寺~0~岩手県~hokkaido~3|安国寺~0~岐阜県~chubu~3|横蔵寺~0~岐阜県~chubu~3|屋根神~1~岐阜県~chubu~3|下原八幡神社~1~岐阜県~chubu~3|願興寺~0~岐阜県~chubu~3|根道神社~1~岐阜県~chubu~3|手力雄神社~1~岐阜県~chubu~3|新長谷寺~0~岐阜県~chubu~3|正眼寺~0~岐阜県~chubu~3|禅昌寺~0~岐阜県~chubu~3|大仙寺~0~岐阜県~chubu~3|南宮御旅神社~1~岐阜県~chubu~3|巨田神社~1~宮崎県~kyushu~3|神柱宮~1~宮崎県~kyushu~3|生目神社~1~宮崎県~kyushu~3|川南護国神社~1~宮崎県~kyushu~3|日向国分寺跡~0~宮崎県~kyushu~3|塩流神社~1~宮城県~hokkaido~3|黄金山神社~1~宮城県~hokkaido~3|黄金山神社~1~宮城県~hokkaido~3|下増田神社~1~宮城県~hokkaido~3|宮城縣護國神社~1~宮城県~hokkaido~3|五大堂~0~宮城県~hokkaido~3|二柱神社~1~宮城県~hokkaido~3|輪王寺~0~宮城県~hokkaido~3|熊本県護国神社~1~熊本県~kyushu~3|出水神社~1~熊本県~kyushu~3|蓮華院誕生寺~0~熊本県~kyushu~3|上野国分寺跡~0~群馬県~kanto~3|世良田東照宮~1~群馬県~kanto~3|満徳寺~0~群馬県~kanto~3|妙義神社~1~群馬県~kanto~3|安芸国分寺~0~広島県~chugoku~3|宮の前廃寺跡~0~広島県~chugoku~3|向上寺~0~広島県~chugoku~3|広島東照宮~1~広島県~chugoku~3|艮神社~1~広島県~chugoku~3|寺町廃寺跡~0~広島県~chugoku~3|沼名前神社~1~広島県~chugoku~3|白神社~1~広島県~chugoku~3|福山八幡宮~1~広島県~chugoku~3|福禅寺~0~広島県~chugoku~3|観音寺~0~香川県~chugoku~3|讃岐国分尼寺~0~香川県~chugoku~3|松尾寺~0~香川県~chugoku~3|神恵院~0~香川県~chugoku~3|道隆寺~0~香川県~chugoku~3|峰悧冨神社~1~香川県~chugoku~3|木烏神社~1~香川県~chugoku~3|伊都多神社~1~高知県~chugoku~3|山内神社~1~高知県~chugoku~3|大善寺~0~高知県~chugoku~3|比江廃寺跡~0~高知県~chugoku~3|不破八幡宮~1~高知県~chugoku~3|鳴無神社~1~高知県~chugoku~3|荒穂神社~1~佐賀県~kyushu~3|高伝寺~0~佐賀県~kyushu~3|唐津神社~1~佐賀県~kyushu~3|歓喜院~1~埼玉県~kanto~3|金鑚神社~1~埼玉県~kanto~3|三芳野神社~1~埼玉県~kanto~3|出雲伊波比神社~1~埼玉県~kanto~3|聖天院~0~埼玉県~kanto~3|仙波東照宮~1~埼玉県~kanto~3|中院~0~埼玉県~kanto~3|天龍寺~0~埼玉県~kanto~3|東明寺~0~埼玉県~kanto~3|鳩峯八幡神社~1~埼玉県~kanto~3|不動寺~0~埼玉県~kanto~3|蓮馨寺~0~埼玉県~kanto~3|伊勢国分寺跡~0~三重県~chubu~3|花窟神社~1~三重県~chubu~3|月夜見宮~1~三重県~chubu~3|志摩国分寺~0~三重県~chubu~3|樹敬寺~0~三重県~chubu~3|金峯神社 (鶴岡市)~1~山形県~hokkaido~3|慈恩寺~0~山形県~hokkaido~3|鳥越八幡神社~1~山形県~hokkaido~3|總光寺~0~山形県~hokkaido~3|忌宮神社~1~山口県~chugoku~3|亀山八幡宮~1~山口県~chugoku~3|元乃隅神社~1~山口県~chugoku~3|常栄寺~0~山口県~chugoku~3|東光寺~0~山口県~chugoku~3|豊榮神社・野田神社~1~山口県~chugoku~3|一宮浅間神社~1~山梨県~chubu~3|義光山矢の堂~0~山梨県~chubu~3|甲府五山~0~山梨県~chubu~3|大井俣窪八幡神社~1~山梨県~chubu~3|能成寺~0~山梨県~chubu~3|法泉寺~0~山梨県~chubu~3|安養寺~0~滋賀県~kinki~3|伊崎寺~0~滋賀県~kinki~3|鉛練比古神社~1~滋賀県~kinki~3|奥石神社~1~滋賀県~kinki~3|鬼室神社~1~滋賀県~kinki~3|錦織寺~0~滋賀県~kinki~3|桑実寺~0~滋賀県~kinki~3|御上神社~1~滋賀県~kinki~3|滋賀院~0~滋賀県~kinki~3|崇福寺跡~0~滋賀県~kinki~3|西教寺~0~滋賀県~kinki~3|大笹原神社~1~滋賀県~kinki~3|徳源院~0~滋賀県~kinki~3|日吉東照宮~1~滋賀県~kinki~3|日向大神宮~1~滋賀県~kinki~3|日牟禮八幡宮~1~滋賀県~kinki~3|加紫久利神社~1~鹿児島県~kyushu~3|薩摩国分寺跡~0~鹿児島県~kyushu~3|大隅国分寺跡~0~鹿児島県~kyushu~3|南洲神社~1~鹿児島県~kyushu~3|天徳寺~0~秋田県~hokkaido~3|佐渡国分寺~0~新潟県~chubu~3|蓮華峰寺~0~新潟県~chubu~3|安国論寺~0~神奈川県~kanto~3|伊奴寝子社~1~神奈川県~kanto~3|英勝寺~0~神奈川県~kanto~3|櫛引八幡宮~1~青森県~hokkaido~3|弘前東照宮~1~青森県~hokkaido~3|高山稲荷神社~1~青森県~hokkaido~3|高照神社~1~青森県~hokkaido~3|最勝院~0~青森県~hokkaido~3|菩提寺~0~青森県~hokkaido~3|龗神社~1~青森県~hokkaido~3|伊古奈比咩命神社~1~静岡県~chubu~3|遠江国分寺~0~静岡県~chubu~3|可睡斎~0~静岡県~chubu~3|元城町東照宮~1~静岡県~chubu~3|山宮浅間神社~1~静岡県~chubu~3|松蔭寺~0~静岡県~chubu~3|浅間古墳~1~静岡県~chubu~3|曽我八幡宮~1~静岡県~chubu~3|平田寺~0~静岡県~chubu~3|片山廃寺跡~0~静岡県~chubu~3|宝台院~0~静岡県~chubu~3|来宮神社~1~静岡県~chubu~3|龍沢寺~0~静岡県~chubu~3|宇多須神社~1~石川県~chubu~3|久保市乙剣宮~1~石川県~chubu~3|寺町寺院群~0~石川県~chubu~3|大野湊神社~1~石川県~chubu~3|那谷寺~0~石川県~chubu~3|下総国分寺~0~千葉県~kanto~3|観福寺~0~千葉県~kanto~3|亀井院~0~千葉県~kanto~3|高家神社~1~千葉県~kanto~3|姉埼神社~1~千葉県~kanto~3|上総国分寺~0~千葉県~kanto~3|上総国分尼寺跡~0~千葉県~kanto~3|鶴峯八幡神社~1~千葉県~kanto~3|登渡神社~1~千葉県~kanto~3|東峰神社~1~千葉県~kanto~3|如意輪寺~0~千葉県~kanto~3|妙法生寺~0~千葉県~kanto~3|龍角寺 (寺院)~0~千葉県~kanto~3|龍福寺~0~千葉県~kanto~3|圓明院~0~千葉県~kanto~3|櫻木神社~1~千葉県~kanto~3|豊後国分寺~0~大分県~kyushu~3|壱岐神社~1~長崎県~kyushu~3|温泉神社 (雲仙市)~1~長崎県~kyushu~3|観音寺~0~長崎県~kyushu~3|御橋観音寺~0~長崎県~kyushu~3|小茂田浜神社~1~長崎県~kyushu~3|福石観音~0~長崎県~kyushu~3|万松院~0~長崎県~kyushu~3|霊丘神社~1~長崎県~kyushu~3|遠照寺~0~長野県~chubu~3|温泉寺~0~長野県~chubu~3|興禅寺~0~長野県~chubu~3|若一王子神社~1~長野県~chubu~3|大法寺~0~長野県~chubu~3|長国寺~0~長野県~chubu~3|因幡国分寺~0~鳥取県~chugoku~3|斎尾廃寺跡~0~鳥取県~chugoku~3|大御堂廃寺跡~0~鳥取県~chugoku~3|投入堂~0~鳥取県~chugoku~3|伯耆国分寺跡~0~鳥取県~chugoku~3|医光寺~0~島根県~chugoku~3|一畑寺~0~島根県~chugoku~3|永明寺~0~島根県~chugoku~3|松江護國神社~1~島根県~chugoku~3|須我神社~1~島根県~chugoku~3|千手院~0~島根県~chugoku~3|鰐淵寺~0~島根県~chugoku~3|濱田護國神社~1~島根県~chugoku~3|萬福寺~0~島根県~chugoku~3|阿波国分尼寺跡~0~徳島県~chugoku~3|忌部神社~1~徳島県~chugoku~3|金長神社~1~徳島県~chugoku~3|郡里廃寺跡~0~徳島県~chugoku~3|上一宮大粟神社~1~徳島県~chugoku~3|箸蔵寺~0~徳島県~chugoku~3|八倉比売神社~1~徳島県~chugoku~3|下野国分寺~0~栃木県~kanto~3|織姫神社~1~栃木県~kanto~3|星宮神社 (佐野市)~1~栃木県~kanto~3|惣宗寺~0~栃木県~kanto~3|西福寺~0~福井県~chubu~3|大塩八幡宮~1~福井県~chubu~3|瀧谷寺~0~福井県~chubu~3|福井神社~1~福井県~chubu~3|興宗寺~0~福岡県~kyushu~3|光雲神社~1~福岡県~kyushu~3|高祖神社~1~福岡県~kyushu~3|春日神社~1~福岡県~kyushu~3|勝立寺~0~福岡県~kyushu~3|世界平和パゴダ~0~福岡県~kyushu~3|成田山久留米分院~0~福岡県~kyushu~3|淡島神社~1~福岡県~kyushu~3|筑前国分寺~0~福岡県~kyushu~3|飛幡八幡宮~1~福岡県~kyushu~3|福厳寺~0~福岡県~kyushu~3|豊前国分寺~0~福岡県~kyushu~3|馬場都々古別神社~1~福島県~hokkaido~3|八槻都々古別神社~1~福島県~hokkaido~3|伊丹廃寺跡~0~兵庫県~kinki~3|越木岩神社~1~兵庫県~kinki~3|海神社~1~兵庫県~kinki~3|柿本神社~1~兵庫県~kinki~3|亀山本徳寺~0~兵庫県~kinki~3|久久比神社~1~兵庫県~kinki~3|金剛城寺~0~兵庫県~kinki~3|光明寺~0~兵庫県~kinki~3|広渡廃寺跡~0~兵庫県~kinki~3|高砂神社~1~兵庫県~kinki~3|春日神社~1~兵庫県~kinki~3|江別神社~1~北海道~hokkaido~3|高龍寺~0~北海道~hokkaido~3|札幌護国神社~1~北海道~hokkaido~3|正行寺~0~北海道~hokkaido~3|西野神社~1~北海道~hokkaido~3|白老八幡神社~1~北海道~hokkaido~3|北海道護國神社~1~北海道~hokkaido~3|北門神社~1~北海道~hokkaido~3|有珠善光寺~0~北海道~hokkaido~3|龍雲院~0~北海道~hokkaido~3|萬念寺~0~北海道~hokkaido~3|紀伊国分寺~0~和歌山県~kinki~3|紀州東照宮~1~和歌山県~kinki~3|隅田八幡神社~1~和歌山県~kinki~3|三栖廃寺跡~0~和歌山県~kinki~3|志磨神社~1~和歌山県~kinki~3|神倉神社~1~和歌山県~kinki~3|切目王子~1~和歌山県~kinki~3|朝椋神社~1~和歌山県~kinki~3|藤白神社~1~和歌山県~kinki~3|愛媛縣護國神社~1~愛媛県~chugoku~2|伊加奈志神社~1~愛媛県~chugoku~2|伊予神社~1~愛媛県~chugoku~2|伊豫岡八幡神社~1~愛媛県~chugoku~2|伊豫豆比古命神社~1~愛媛県~chugoku~2|一宮神社~1~愛媛県~chugoku~2|浦渡神社~1~愛媛県~chugoku~2|栄養寺~0~愛媛県~chugoku~2|永徳寺~0~愛媛県~chugoku~2|円福寺~0~愛媛県~chugoku~2|延命寺~0~愛媛県~chugoku~2|阿祢神社~1~茨城県~kanto~2|阿祢神社~1~茨城県~kanto~2|阿波山上神社~1~茨城県~kanto~2|阿弥陀寺~0~茨城県~kanto~2|愛宕神社 (行方市玉造甲)~1~茨城県~kanto~2|安福寺~0~茨城県~kanto~2|一ノ矢八坂神社~1~茨城県~kanto~2|稲村神社~1~茨城県~kanto~2|稲田神社~1~茨城県~kanto~2|茨城県護国神社~1~茨城県~kanto~2|茨城廃寺跡~0~茨城県~kanto~2|羽梨山神社~1~茨城県~kanto~2|化蘇沼稲荷神社~1~茨城県~kanto~2|加波山神社~1~茨城県~kanto~2|華蔵院~0~茨城県~kanto~2|回天神社~1~茨城県~kanto~2|鴨大神御子神主玉神社~1~茨城県~kanto~2|観音寺~0~茨城県~kanto~2|願入寺~0~茨城県~kanto~2|祇園寺~0~茨城県~kanto~2|吉沼八幡神社~1~茨城県~kanto~2|吉田神社~1~茨城県~kanto~2|久昌寺~0~茨城県~kanto~2|桑原神社~1~茨城県~kanto~2|結城廃寺跡~0~茨城県~kanto~2|御岩神社~1~茨城県~kanto~2|護国寺~0~茨城県~kanto~2|弘経寺~0~茨城県~kanto~2|阿智神社~1~岡山県~chugoku~2|葦守八幡宮~1~岡山県~chugoku~2|安住院~0~岡山県~chugoku~2|安養寺~0~岡山県~chugoku~2|稲荷神社~1~岡山県~chugoku~2|円通寺~0~岡山県~chugoku~2|延命寺~0~岡山県~chugoku~2|岡山県護国神社~1~岡山県~chugoku~2|沖田神社~1~岡山県~chugoku~2|恩徳寺 (岡山市)~0~岡山県~chugoku~2|観龍寺~0~岡山県~chugoku~2|関戸廃寺跡~0~岡山県~chugoku~2|祇園神社~1~岡山県~chugoku~2|吉川八幡宮~1~岡山県~chugoku~2|吉備寺~0~岡山県~chugoku~2|吉備津岡辛木神社~1~岡山県~chugoku~2|久米廃寺跡~0~岡山県~chugoku~2|玉井宮東照宮~1~岡山県~chugoku~2|金剛寺~0~岡山県~chugoku~2|金山寺~0~岡山県~chugoku~2|窪八幡宮~1~岡山県~chugoku~2|熊野神社~1~岡山県~chugoku~2|軽部神社~1~岡山県~chugoku~2|五流尊瀧院~0~岡山県~chugoku~2|弘泉寺~0~岡山県~chugoku~2|弘法寺~0~岡山県~chugoku~2|高野神社~1~岡山県~chugoku~2|沖縄県護国神社~1~沖縄県~kyushu~2|喜宝院~0~沖縄県~kyushu~2|宮古神社~1~沖縄県~kyushu~2|金武観音寺~0~沖縄県~kyushu~2|石垣宝来宝来神社~1~沖縄県~kyushu~2|袋中寺~0~沖縄県~kyushu~2|大東神社~1~沖縄県~kyushu~2|天王寺 (那覇市)~0~沖縄県~kyushu~2|天界寺~0~沖縄県~kyushu~2|一関八幡神社~1~岩手県~hokkaido~2|卯子酉様~1~岩手県~hokkaido~2|雲際寺~0~岩手県~hokkaido~2|横山八幡宮~1~岩手県~hokkaido~2|願成寺~0~岩手県~hokkaido~2|鬼越蒼前神社~1~岩手県~hokkaido~2|吉祥寺 (盛岡市)~0~岩手県~hokkaido~2|極楽寺~0~岩手県~hokkaido~2|光明寺~0~岩手県~hokkaido~2|黒石寺~0~岩手県~hokkaido~2|榊山稲荷神社~1~岩手県~hokkaido~2|三ツ石神社~1~岩手県~hokkaido~2|志賀理和気神社~1~岩手県~hokkaido~2|志和稲荷神社~1~岩手県~hokkaido~2|鹿島神社~1~岩手県~hokkaido~2|室根神社~1~岩手県~hokkaido~2|祥雲寺~0~岩手県~hokkaido~2|常堅寺~0~岩手県~hokkaido~2|聖寿寺 (盛岡市)~0~岩手県~hokkaido~2|千養寺~0~岩手県~hokkaido~2|大慈寺~0~岩手県~hokkaido~2|大念寺~0~岩手県~hokkaido~2|長者ヶ原廃寺跡~0~岩手県~hokkaido~2|東川院~0~岩手県~hokkaido~2|徳楽寺~0~岩手県~hokkaido~2|南部神社 (遠野市)~1~岩手県~hokkaido~2|日高神社~1~岩手県~hokkaido~2|配志和神社~1~岩手県~hokkaido~2|白山神社 (平泉町)~1~岩手県~hokkaido~2|八幡神社~1~岩手県~hokkaido~2|普門寺~0~岩手県~hokkaido~2|福泉寺~0~岩手県~hokkaido~2|阿多由太神社~1~岐阜県~chubu~2|阿遅加神社~1~岐阜県~chubu~2|茜部神社~1~岐阜県~chubu~2|安養寺~0~岐阜県~chubu~2|伊岐神社~1~岐阜県~chubu~2|伊豆神社~1~岐阜県~chubu~2|伊波乃西神社~1~岐阜県~chubu~2|伊富岐神社~1~岐阜県~chubu~2|雲龍寺~0~岐阜県~chubu~2|宮崎縣護國神社~1~宮崎県~kyushu~2|宮水神社~1~宮崎県~kyushu~2|串間神社~1~宮崎県~kyushu~2|今山大師寺~0~宮崎県~kyushu~2|昌竜寺~0~宮崎県~kyushu~2|成願寺~0~宮崎県~kyushu~2|大御神社~1~宮崎県~kyushu~2|椎葉厳島神社~1~宮崎県~kyushu~2|日向国分尼寺~0~宮崎県~kyushu~2|霧島東神社~1~宮崎県~kyushu~2|安福河伯神社~1~宮城県~hokkaido~2|伊豆佐比売神社~1~宮城県~hokkaido~2|医王寺~0~宮城県~hokkaido~2|横山不動尊~0~宮城県~hokkaido~2|賀茂神社 (仙台市)~1~宮城県~hokkaido~2|刈田嶺神社~1~宮城県~hokkaido~2|刈田嶺神社~1~宮城県~hokkaido~2|観音寺~0~宮城県~hokkaido~2|亀岡八幡宮~1~宮城県~hokkaido~2|祇却寺~0~宮城県~hokkaido~2|金蛇水神社~1~宮城県~hokkaido~2|九品寺~0~宮城県~hokkaido~2|熊野神社~1~宮城県~hokkaido~2|熊野那智神社~1~宮城県~hokkaido~2|熊野本宮社~1~宮城県~hokkaido~2|御釜神社~1~宮城県~hokkaido~2|光明院~0~宮城県~hokkaido~2|孝勝寺~0~宮城県~hokkaido~2|香林寺~0~宮城県~hokkaido~2|山神社~1~宮城県~hokkaido~2|鹿島御児神社~1~宮城県~hokkaido~2|鹿島緒名太神社~1~宮城県~hokkaido~2|鹿島天足和気神社~1~宮城県~hokkaido~2|松音寺~0~宮城県~hokkaido~2|諏訪神社~1~宮城県~hokkaido~2|諏訪神社~1~宮城県~hokkaido~2|瑞鳳寺~0~宮城県~hokkaido~2|青麻神社~1~宮城県~hokkaido~2|川口神社 (亘理町)~1~宮城県~hokkaido~2|医王寺~0~熊本県~kyushu~2|雲巌禅寺~0~熊本県~kyushu~2|永尾神社~1~熊本県~kyushu~2|塩屋八幡宮~1~熊本県~kyushu~2|熊本城稲荷神社~1~熊本県~kyushu~2|熊本大神宮~1~熊本県~kyushu~2|郡浦神社~1~熊本県~kyushu~2|甲佐神社~1~熊本県~kyushu~2|甲斐神社~1~熊本県~kyushu~2|国造神社~1~熊本県~kyushu~2|釈迦院~0~熊本県~kyushu~2|小国両神社~1~熊本県~kyushu~2|松井神社~1~熊本県~kyushu~2|西岸寺 (熊本市)~0~熊本県~kyushu~2|西巌殿寺~0~熊本県~kyushu~2|大宮神社 (山鹿市)~1~熊本県~kyushu~2|八代神社~1~熊本県~kyushu~2|幣立神社~1~熊本県~kyushu~2|本渡諏訪神社~1~熊本県~kyushu~2|満願寺~0~熊本県~kyushu~2|六殿神社~1~熊本県~kyushu~2|廣福寺~0~熊本県~kyushu~2|お茶のおばあさん~1~群馬県~kanto~2|愛宕神社~1~群馬県~kanto~2|愛宕神社~1~群馬県~kanto~2|愛宕神社~1~群馬県~kanto~2|愛宕神社 (館林市高根町)~1~群馬県~kanto~2|伊香保神社~1~群馬県~kanto~2|伊勢崎神社~1~群馬県~kanto~2|医光寺~0~群馬県~kanto~2|稲荷神社~1~群馬県~kanto~2|稲荷神社~1~群馬県~kanto~2|稲荷神社~1~群馬県~kanto~2|宇芸神社~1~群馬県~kanto~2|雲龍寺 (館林市)~0~群馬県~kanto~2|永明寺~0~群馬県~kanto~2|応声寺~0~群馬県~kanto~2|恩林寺~0~群馬県~kanto~2|火雷神社~1~群馬県~kanto~2|迦葉山龍華院~0~群馬県~kanto~2|賀茂神社~1~群馬県~kanto~2|覚応寺~0~群馬県~kanto~2|冠稲荷神社~1~群馬県~kanto~2|観性寺~0~群馬県~kanto~2|岩神稲荷神社~1~群馬県~kanto~2|教王院~0~群馬県~kanto~2|橋林寺~0~群馬県~kanto~2|玉村八幡宮~1~群馬県~kanto~2|桐生西宮神社~1~群馬県~kanto~2|桐生天満宮~1~群馬県~kanto~2|金山神社~1~群馬県~kanto~2|熊野神社~1~群馬県~kanto~2|群馬縣護國神社~1~群馬県~kanto~2|五宝寺~0~群馬県~kanto~2|吾妻神社~1~群馬県~kanto~2|光恩寺~0~群馬県~kanto~2|光泉寺~0~群馬県~kanto~2|甲波宿禰神社~1~群馬県~kanto~2|甲波宿禰神社~1~群馬県~kanto~2|甲波宿禰神社 (渋川市行幸田)~1~群馬県~kanto~2|三宮神社~1~群馬県~kanto~2|円福寺~0~広島県~chugoku~2|横見廃寺跡~0~広島県~chugoku~2|岡崎神社~1~広島県~chugoku~2|賀羅加波神社~1~広島県~chugoku~2|甘南備神社~1~広島県~chugoku~2|亀山神社~1~広島県~chugoku~2|金蓮寺~0~広島県~chugoku~2|賢忠寺~0~広島県~chugoku~2|御建神社~1~広島県~chugoku~2|御山神社~1~広島県~chugoku~2|御袖天満宮~1~広島県~chugoku~2|光照寺~0~広島県~chugoku~2|光政寺~0~広島県~chugoku~2|光明寺~0~広島県~chugoku~2|弘願寺~0~広島県~chugoku~2|国泰寺~0~広島県~chugoku~2|三翁神社~1~広島県~chugoku~2|三蔵稲荷神社~1~広島県~chugoku~2|糸碕神社~1~広島県~chugoku~2|西福寺~0~広島県~chugoku~2|西國寺~0~広島県~chugoku~2|素盞嗚神社~1~広島県~chugoku~2|草戸稲荷神社~1~広島県~chugoku~2|粟井神社~1~香川県~chugoku~2|伊吹八幡神社 (観音寺市)~1~香川県~chugoku~2|宇夫階神社~1~香川県~chugoku~2|華下天満宮~1~香川県~chugoku~2|海岸寺~0~香川県~chugoku~2|鴨神社 (坂出市)~1~香川県~chugoku~2|冠纓神社~1~香川県~chugoku~2|吉祥寺 (三豊市)~0~香川県~chugoku~2|興昌寺~0~香川県~chugoku~2|玉泉寺~0~香川県~chugoku~2|五智院~0~香川県~chugoku~2|香西寺~0~香川県~chugoku~2|香川縣護國神社~1~香川県~chugoku~2|高屋神社~1~香川県~chugoku~2|七仏寺~0~香川県~chugoku~2|釈王寺 (東かがわ市)~0~香川県~chugoku~2|寿覚院~0~香川県~chugoku~2|宗林寺~0~香川県~chugoku~2|洲崎寺~0~香川県~chugoku~2|小豆島大観音~0~香川県~chugoku~2|安楽寺~0~高知県~chugoku~2|一條神社~1~高知県~chugoku~2|加茂神社~1~高知県~chugoku~2|葛木男神社~1~高知県~chugoku~2|観音寺 (須崎市)~0~高知県~chugoku~2|久礼八幡宮~1~高知県~chugoku~2|吸江寺~0~高知県~chugoku~2|極楽寺 (高知市)~0~高知県~chugoku~2|琴平神社 (土佐市)~1~高知県~chugoku~2|郡頭神社~1~高知県~chugoku~2|月山神社~1~高知県~chugoku~2|御厨人窟~1~高知県~chugoku~2|御田八幡宮~1~高知県~chugoku~2|甲殿住吉神社~1~高知県~chugoku~2|高岡神社 (四万十町)~1~高知県~chugoku~2|高知坐神社~1~高知県~chugoku~2|高知縣護國神社~1~高知県~chugoku~2|高野寺~0~高知県~chugoku~2|若宮八幡宮~1~高知県~chugoku~2|真念庵~0~高知県~chugoku~2|神峯神社~1~高知県~chugoku~2|秦神社~1~高知県~chugoku~2|石見寺~0~高知県~chugoku~2|大川上美良布神社~1~高知県~chugoku~2|朝倉神社 (高知市)~1~高知県~chugoku~2|綾部神社~1~佐賀県~kyushu~2|安福寺~0~佐賀県~kyushu~2|稲佐神社~1~佐賀県~kyushu~2|牛嶋天満宮~1~佐賀県~kyushu~2|光勝寺~0~佐賀県~kyushu~2|佐賀縣護國神社~1~佐賀県~kyushu~2|浄満寺~0~佐賀県~kyushu~2|新北神社~1~佐賀県~kyushu~2|仁比山神社~1~佐賀県~kyushu~2|諏訪神社~1~佐賀県~kyushu~2|須賀神社~1~佐賀県~kyushu~2|専称寺 (多久市)~0~佐賀県~kyushu~2|大魚神社~1~佐賀県~kyushu~2|瀧光徳寺~0~佐賀県~kyushu~2|男女神社~1~佐賀県~kyushu~2|田嶋神社~1~佐賀県~kyushu~2|肥前国分寺跡~0~佐賀県~kyushu~2|肥前国分尼寺~0~佐賀県~kyushu~2|武雄神社~1~佐賀県~kyushu~2|宝当神社~1~佐賀県~kyushu~2|本福寺 (基山町)~0~佐賀県~kyushu~2|龍造寺八幡宮~1~佐賀県~kyushu~2|與賀神社~1~佐賀県~kyushu~2|みか神社~1~埼玉県~kanto~2|愛宕神社~1~埼玉県~kanto~2|伊古乃速御玉比売神社~1~埼玉県~kanto~2|医王寺~0~埼玉県~kanto~2|医王寺~0~埼玉県~kanto~2|稲荷社~1~埼玉県~kanto~2|稲荷神社~1~埼玉県~kanto~2|稲荷神社~1~埼玉県~kanto~2|稲荷神社~1~埼玉県~kanto~2|稲荷神社~1~埼玉県~kanto~2|稲荷神社~1~埼玉県~kanto~2|永昌寺~0~埼玉県~kanto~2|円福寺~0~埼玉県~kanto~2|円融寺~0~埼玉県~kanto~2|音楽寺~0~埼玉県~kanto~2|加治神社~1~埼玉県~kanto~2|河輪神社~1~埼玉県~kanto~2|回向院~0~埼玉県~kanto~2|皆野椋神社~1~埼玉県~kanto~2|観音院~0~埼玉県~kanto~2|観音院~0~埼玉県~kanto~2|観音寺~0~埼玉県~kanto~2|観音寺~0~埼玉県~kanto~2|観福寺~0~埼玉県~kanto~2|しあわせの宮~1~三重県~chubu~2|阿射加神社~1~三重県~chubu~2|伊奈冨神社~1~三重県~chubu~2|一乗寺~0~三重県~chubu~2|宇治山田神社~1~三重県~chubu~2|鵜森神社~1~三重県~chubu~2|下御井神社~1~三重県~chubu~2|加佐登神社~1~三重県~chubu~2|加努弥神社~1~三重県~chubu~2|賀多神社~1~三重県~chubu~2|鴨下神社~1~三重県~chubu~2|観音寺 (鈴鹿市寺家)~0~三重県~chubu~2|亀山神社~1~三重県~chubu~2|鏡宮神社~1~三重県~chubu~2|饗土橋姫神社~1~三重県~chubu~2|九木神社~1~三重県~chubu~2|桑名宗社~1~三重県~chubu~2|桑名別院本統寺~0~三重県~chubu~2|継松寺~0~三重県~chubu~2|御稲御倉~1~三重県~chubu~2|御塩殿神社~1~三重県~chubu~2|光明寺~0~三重県~chubu~2|江田神社~1~三重県~chubu~2|香良洲神社~1~三重県~chubu~2|烏帽子山八幡宮~1~山形県~hokkaido~2|羽黒山五重塔~1~山形県~hokkaido~2|寒河江八幡宮~1~山形県~hokkaido~2|岩根沢三山神社~1~山形県~hokkaido~2|玉川寺~0~山形県~hokkaido~2|犬の宮・猫の宮~1~山形県~hokkaido~2|笹野観音堂~0~山形県~hokkaido~2|山形県護国神社~1~山形県~hokkaido~2|若松寺~0~山形県~hokkaido~2|春日神社~1~山形県~hokkaido~2|小物忌神社~1~山形県~hokkaido~2|小物忌神社~1~山形県~hokkaido~2|松岬神社~1~山形県~hokkaido~2|城輪神社~1~山形県~hokkaido~2|専称寺~0~山形県~hokkaido~2|善寳寺~0~山形県~hokkaido~2|荘内神社~1~山形県~hokkaido~2|蔵王山神社~1~山形県~hokkaido~2|谷地八幡宮~1~山形県~hokkaido~2|白子神社 (米沢市)~1~山形県~hokkaido~2|北舘神社~1~山形県~hokkaido~2|林泉寺~0~山形県~hokkaido~2|阿弥陀寺~0~山口県~chugoku~2|引接寺~0~山口県~chugoku~2|円政寺~0~山口県~chugoku~2|漢陽寺~0~山口県~chugoku~2|吉香神社~1~山口県~chugoku~2|琴崎八幡宮~1~山口県~chugoku~2|古熊神社~1~山口県~chugoku~2|今八幡宮~1~山口県~chugoku~2|佐波神社~1~山口県~chugoku~2|山口県護国神社~1~山口県~chugoku~2|山口大神宮~1~山口県~chugoku~2|志都岐山神社~1~山口県~chugoku~2|笑山寺~0~山口県~chugoku~2|神功皇后神社~1~山口県~chugoku~2|仁壁神社~1~山口県~chugoku~2|菅原神社 (柳井市)~1~山口県~chugoku~2|石城神社~1~山口県~chugoku~2|大歳神社~1~山口県~chugoku~2|大照院~0~山口県~chugoku~2|大寧寺~0~山口県~chugoku~2|大連神社~1~山口県~chugoku~2|中山神社~1~山口県~chugoku~2|二所山田神社~1~山口県~chugoku~2|乃木神社~1~山口県~chugoku~2|彦島八幡宮~1~山口県~chugoku~2|麻羅観音~0~山口県~chugoku~2|木戸神社~1~山口県~chugoku~2|龍蔵寺~0~山口県~chugoku~2|龍福寺 (山口市)~0~山口県~chugoku~2|劔神社~1~山口県~chugoku~2|櫻山神社~1~山口県~chugoku~2|安楽寺~0~山梨県~chubu~2|雲峰寺~0~山梨県~chubu~2|永昌院~0~山梨県~chubu~2|河口浅間神社~1~山梨県~chubu~2|金櫻神社~1~山梨県~chubu~2|熊野神社~1~山梨県~chubu~2|軍刀利神社~1~山梨県~chubu~2|恵運院~0~山梨県~chubu~2|穴切大神社~1~山梨県~chubu~2|月江寺~0~山梨県~chubu~2|古長禅寺~0~山梨県~chubu~2|甲斐国分尼寺~0~山梨県~chubu~2|甲斐奈神社~1~山梨県~chubu~2|荒尾神社~1~山梨県~chubu~2|最勝寺~0~山梨県~chubu~2|三輪神社~1~山梨県~chubu~2|三國第一山新倉富士浅間神社~1~山梨県~chubu~2|山梨岡神社~1~山梨県~chubu~2|山梨岡神社 (山梨市)~1~山梨県~chubu~2|寺本廃寺~0~山梨県~chubu~2|慈雲寺~0~山梨県~chubu~2|慈眼寺~0~山梨県~chubu~2|慈照寺 (甲斐市)~0~山梨県~chubu~2|酒折宮~1~山梨県~chubu~2|周林寺~0~山梨県~chubu~2|小室浅間神社~1~山梨県~chubu~2|阿賀神社~1~滋賀県~kinki~2|芦浦観音寺~0~滋賀県~kinki~2|伊香具神社~1~滋賀県~kinki~2|伊豆神社~1~滋賀県~kinki~2|衣川廃寺跡~0~滋賀県~kinki~2|宇佐八幡宮~1~滋賀県~kinki~2|円満院~0~滋賀県~kinki~2|延寿寺~0~滋賀県~kinki~2|鵜戸神社~1~鹿児島県~kyushu~2|益救神社~1~鹿児島県~kyushu~2|花尾神社~1~鹿児島県~kyushu~2|蒲生八幡神社~1~鹿児島県~kyushu~2|鬼丸神社~1~鹿児島県~kyushu~2|玉山神社~1~鹿児島県~kyushu~2|郡山八幡神社~1~鹿児島県~kyushu~2|広済寺~0~鹿児島県~kyushu~2|荒田八幡宮~1~鹿児島県~kyushu~2|四十九所神社~1~鹿児島県~kyushu~2|鹿児島県護国神社~1~鹿児島県~kyushu~2|射楯兵主神社~1~鹿児島県~kyushu~2|松原神社~1~鹿児島県~kyushu~2|浄光明寺~0~鹿児島県~kyushu~2|菅原神社~1~鹿児島県~kyushu~2|西福寺~0~鹿児島県~kyushu~2|泰平寺~0~鹿児島県~kyushu~2|大穴持神社~1~鹿児島県~kyushu~2|大慈寺~0~鹿児島県~kyushu~2|竹屋神社~1~鹿児島県~kyushu~2|竹田神社~1~鹿児島県~kyushu~2|中島常楽院~0~鹿児島県~kyushu~2|鶴嶺神社~1~鹿児島県~kyushu~2|道隆寺~0~鹿児島県~kyushu~2|徳重神社~1~鹿児島県~kyushu~2|箱崎八幡神社~1~鹿児島県~kyushu~2|八幡神社~1~鹿児島県~kyushu~2|蛭児神社~1~鹿児島県~kyushu~2|腹五社神社~1~鹿児島県~kyushu~2|平松神社~1~鹿児島県~kyushu~2|宝光院~0~鹿児島県~kyushu~2|豊玉姫神社~1~鹿児島県~kyushu~2|本願寺鹿児島別院~0~鹿児島県~kyushu~2|妙円寺~0~鹿児島県~kyushu~2|剱神社~1~鹿児島県~kyushu~2|醫師神社~1~鹿児島県~kyushu~2|漢槎宮~1~秋田県~hokkaido~2|金峰神社 (にかほ市)~1~秋田県~hokkaido~2|古四王神社~1~秋田県~hokkaido~2|御座石神社~1~秋田県~hokkaido~2|高岩神社~1~秋田県~hokkaido~2|秋田県護国神社~1~秋田県~hokkaido~2|秋田諏訪宮~1~秋田県~hokkaido~2|十三騎神社~1~秋田県~hokkaido~2|真山神社~1~秋田県~hokkaido~2|水神社~1~秋田県~hokkaido~2|赤神神社~1~秋田県~hokkaido~2|多宝院~0~秋田県~hokkaido~2|太平山三吉神社~1~秋田県~hokkaido~2|大日霊貴神社~1~秋田県~hokkaido~2|大龍寺~0~秋田県~hokkaido~2|長谷寺~0~秋田県~hokkaido~2|綴子神社~1~秋田県~hokkaido~2|天照皇御祖神社~1~秋田県~hokkaido~2|天寧寺~0~秋田県~hokkaido~2|土崎神明社~1~秋田県~hokkaido~2|唐松神社~1~秋田県~hokkaido~2|日吉八幡神社~1~秋田県~hokkaido~2|八幡秋田神社~1~秋田県~hokkaido~2|保呂羽山波宇志別神社~1~秋田県~hokkaido~2|抱返神社~1~秋田県~hokkaido~2|与次郎稲荷神社~1~秋田県~hokkaido~2|老犬神社~1~秋田県~hokkaido~2|彌高神社~1~秋田県~hokkaido~2|蚶満寺~0~秋田県~hokkaido~2|安禅寺~0~新潟県~chubu~2|威徳寺~0~新潟県~chubu~2|雲洞庵~0~新潟県~chubu~2|栄涼寺~0~新潟県~chubu~2|乙寶寺~0~新潟県~chubu~2|角田山妙光寺~0~新潟県~chubu~2|金峯神社 (長岡市)~1~新潟県~chubu~2|五智国分寺~0~新潟県~chubu~2|根本寺~0~新潟県~chubu~2|松苧神社~1~新潟県~chubu~2|常安寺 (長岡市)~0~新潟県~chubu~2|浄善寺~0~新潟県~chubu~2|浄念寺~0~新潟県~chubu~2|新潟縣護國神社~1~新潟県~chubu~2|正法寺~0~新潟県~chubu~2|清龍寺~0~新潟県~chubu~2|西永寺 (新潟市南区)~0~新潟県~chubu~2|蒼柴神社~1~新潟県~chubu~2|長恩寺~0~新潟県~chubu~2|藤基神社~1~新潟県~chubu~2|日吉神社~1~新潟県~chubu~2|白山神社~1~新潟県~chubu~2|白山神社~1~新潟県~chubu~2|斐太神社~1~新潟県~chubu~2|物部神社~1~新潟県~chubu~2|平潟神社~1~新潟県~chubu~2|平等寺 (阿賀町)~0~新潟県~chubu~2|宝徳山稲荷大社~1~新潟県~chubu~2|法福寺 (長岡市)~0~新潟県~chubu~2|妙照寺~0~新潟県~chubu~2|妙宣寺~0~新潟県~chubu~2|明静院~0~新潟県~chubu~2|林泉寺~0~新潟県~chubu~2|円通寺~0~青森県~hokkaido~2|円覺寺~0~青森県~hokkaido~2|黒石神社~1~青森県~hokkaido~2|十和田神社~1~青森県~hokkaido~2|青森県護国神社~1~青森県~hokkaido~2|善知鳥神社~1~青森県~hokkaido~2|大円寺~0~青森県~hokkaido~2|長者山新羅神社~1~青森県~hokkaido~2|長勝寺~0~青森県~hokkaido~2|八幡宮~1~青森県~hokkaido~2|法光寺~0~青森県~hokkaido~2|蓮華寺~0~青森県~hokkaido~2|阿治古神社~1~静岡県~chubu~2|阿波々神社~1~静岡県~chubu~2|伊河麻神社~1~静岡県~chubu~2|稲荷神社~1~静岡県~chubu~2|引手力命神社~1~静岡県~chubu~2|雨櫻神社~1~静岡県~chubu~2|雲見浅間神社~1~静岡県~chubu~2|猿田彦神社~1~静岡県~chubu~2|応声教院~0~静岡県~chubu~2|音無神社~1~静岡県~chubu~2|下条妙蓮寺~0~静岡県~chubu~2|海蔵寺~0~静岡県~chubu~2|葛見神社~1~静岡県~chubu~2|阿岸本誓寺~0~石川県~chubu~2|伊須流岐比古神社~1~石川県~chubu~2|羽黒神社~1~石川県~chubu~2|羽咋神社~1~石川県~chubu~2|卯辰山山麓寺院群~0~石川県~chubu~2|永光寺~0~石川県~chubu~2|賀茂神社 (かほく市)~1~石川県~chubu~2|気多本宮~1~石川県~chubu~2|狭野神社~1~石川県~chubu~2|興徳寺~0~石川県~chubu~2|金沢神社~1~石川県~chubu~2|金剱宮~1~石川県~chubu~2|倶利迦羅不動寺~0~石川県~chubu~2|慶覚寺~0~石川県~chubu~2|江沼神社~1~石川県~chubu~2|高皇産霊神社~1~石川県~chubu~2|重蔵神社~1~石川県~chubu~2|春日神社~1~石川県~chubu~2|小松天満宮~1~石川県~chubu~2|小立野寺院群~0~石川県~chubu~2|松岡寺~0~石川県~chubu~2|須須神社~1~石川県~chubu~2|石浦神社~1~石川県~chubu~2|石川護国神社~1~石川県~chubu~2|石部神社~1~石川県~chubu~2|専称寺 (加賀市)~0~石川県~chubu~2|全性寺~0~石川県~chubu~2|大地主神社~1~石川県~chubu~2|大野日吉神社~1~石川県~chubu~2|大蓮寺~0~石川県~chubu~2|中村神社~1~石川県~chubu~2|鶴来別院~0~石川県~chubu~2|天徳院~0~石川県~chubu~2|桃雲寺~0~石川県~chubu~2|徳証寺~0~石川県~chubu~2|白山七社~1~石川県~chubu~2|阿弥陀寺~0~千葉県~kanto~2|愛宕神社~1~千葉県~kanto~2|安房須神社~1~千葉県~kanto~2|安養寺~0~千葉県~kanto~2|夷隅神社~1~千葉県~kanto~2|稲毛浅間神社~1~千葉県~kanto~2|胤重寺~0~千葉県~kanto~2|安国寺~0~大分県~kyushu~2|宇奈岐日女神社~1~大分県~kyushu~2|臼杵八坂神社~1~大分県~kyushu~2|火男火売神社~1~大分県~kyushu~2|岳林寺~0~大分県~kyushu~2|丸山神社~1~大分県~kyushu~2|岩戸寺 (国東市)~0~大分県~kyushu~2|犬丸天満宮~1~大分県~kyushu~2|護保寺~0~大分県~kyushu~2|広瀬神社 (竹田市)~1~大分県~kyushu~2|春日神社~1~大分県~kyushu~2|早吸日女神社~1~大分県~kyushu~2|大原八幡宮~1~大分県~kyushu~2|大分縣護國神社~1~大分県~kyushu~2|中津大神宮~1~大分県~kyushu~2|鉄道神社~1~大分県~kyushu~2|日出若宮八幡神社~1~大分県~kyushu~2|白鬚田原神社~1~大分県~kyushu~2|八阪神社~1~大分県~kyushu~2|八幡朝見神社~1~大分県~kyushu~2|富貴寺大堂~0~大分県~kyushu~2|文殊仙寺~0~大分県~kyushu~2|法鏡寺廃寺跡~0~大分県~kyushu~2|万寿寺~0~大分県~kyushu~2|龍原寺~0~大分県~kyushu~2|安国寺~0~長崎県~kyushu~2|壱岐国分寺~0~長崎県~kyushu~2|榎津神社~1~長崎県~kyushu~2|塩釜神社~1~長崎県~kyushu~2|塩竈神社 (新上五島町)~1~長崎県~kyushu~2|沖ノ神島神社~1~長崎県~kyushu~2|乙宮神社 (新上五島町小河原郷)~1~長崎県~kyushu~2|乙宮神社 (新上五島町立串郷)~1~長崎県~kyushu~2|海童神社 (新上五島町)~1~長崎県~kyushu~2|間伏神社~1~長崎県~kyushu~2|丸尾神社~1~長崎県~kyushu~2|亀岡神社~1~長崎県~kyushu~2|亀山八幡宮~1~長崎県~kyushu~2|橘神社 (雲仙市)~1~長崎県~kyushu~2|客人神社 (新上五島町)~1~長崎県~kyushu~2|金比羅神社 (新上五島町有川郷)~1~長崎県~kyushu~2|熊野神社 (新上五島町)~1~長崎県~kyushu~2|月讀神社~1~長崎県~kyushu~2|悟真寺~0~長崎県~kyushu~2|護国寺~0~長崎県~kyushu~2|光伝寺~0~長崎県~kyushu~2|江ノ濱神社~1~長崎県~kyushu~2|最教寺~0~長崎県~kyushu~2|山神社 (新上五島町)~1~長崎県~kyushu~2|山神神社 (新上五島町桐古里郷)~1~長崎県~kyushu~2|志々伎神社~1~長崎県~kyushu~2|志自岐羽黒神社~1~長崎県~kyushu~2|志自岐羽黒神社 (新上五島町太田郷)~1~長崎県~kyushu~2|事代主神社 (新上五島町)~1~長崎県~kyushu~2|愛宕稲荷神社~1~長野県~chubu~2|安布知神社~1~長野県~chubu~2|安養寺~0~長野県~chubu~2|安養寺~0~長野県~chubu~2|伊和神社~1~長野県~chubu~2|永福寺~0~長野県~chubu~2|洩矢神社~1~長野県~chubu~2|王滝御嶽神社~1~長野県~chubu~2|科野大宮社~1~長野県~chubu~2|開善寺 (飯田市)~0~長野県~chubu~2|岩松院~0~長野県~chubu~2|牛伏寺~0~長野県~chubu~2|郷福寺~0~長野県~chubu~2|金松寺~0~長野県~chubu~2|金台寺~0~長野県~chubu~2|駒形神社 (佐久市)~1~長野県~chubu~2|恵明寺~0~長野県~chubu~2|健命寺~0~長野県~chubu~2|建福寺~0~長野県~chubu~2|元善光寺~0~長野県~chubu~2|光明寺~0~長野県~chubu~2|郊戸八幡宮~1~長野県~chubu~2|高岡神社~1~長野県~chubu~2|高市神社~1~長野県~chubu~2|佐良志奈神社~1~長野県~chubu~2|沙田神社~1~長野県~chubu~2|坂城神社~1~長野県~chubu~2|三神社~1~長野県~chubu~2|四柱神社~1~長野県~chubu~2|慈雲寺~0~長野県~chubu~2|釈尊寺~0~長野県~chubu~2|若沢寺~0~長野県~chubu~2|手長神社~1~長野県~chubu~2|粟島神社 (米子市)~1~鳥取県~chugoku~2|意非神社~1~鳥取県~chugoku~2|河野神社~1~鳥取県~chugoku~2|蚊屋島神社~1~鳥取県~chugoku~2|賀茂神社~1~鳥取県~chugoku~2|賀茂神社 (鳥取県南部町)~1~鳥取県~chugoku~2|皆成院~0~鳥取県~chugoku~2|岩井温泉~1~鳥取県~chugoku~2|岩井廃寺~0~鳥取県~chugoku~2|興雲寺~0~鳥取県~chugoku~2|興禅寺~0~鳥取県~chugoku~2|玄忠寺~0~鳥取県~chugoku~2|光専寺 (智頭町)~0~鳥取県~chugoku~2|神崎神社 (琴浦町)~1~鳥取県~chugoku~2|聖神社~1~鳥取県~chugoku~2|青龍寺~0~鳥取県~chugoku~2|赤猪岩神社~1~鳥取県~chugoku~2|大雲院~0~鳥取県~chugoku~2|大岳院~0~鳥取県~chugoku~2|大蓮寺 (倉吉市)~0~鳥取県~chugoku~2|地蔵院 (倉吉市)~0~鳥取県~chugoku~2|智積寺~0~鳥取県~chugoku~2|中山神社 (鳥取県大山町)~1~鳥取県~chugoku~2|長綱寺~0~鳥取県~chugoku~2|長谷寺~0~鳥取県~chugoku~2|波波伎神社~1~鳥取県~chugoku~2|白兎神社~1~鳥取県~chugoku~2|不動院岩屋堂~0~鳥取県~chugoku~2|豊乗寺~0~鳥取県~chugoku~2|摩尼寺~0~鳥取県~chugoku~2|茂宇気神社~1~鳥取県~chugoku~2|龍徳寺~0~鳥取県~chugoku~2|隠岐国分尼寺~0~島根県~chugoku~2|隠岐神社~1~島根県~chugoku~2|宇受賀命神社~1~島根県~chugoku~2|火守神社~1~島根県~chugoku~2|岩屋寺~0~島根県~chugoku~2|玉作湯神社~1~島根県~chugoku~2|玉若酢命神社~1~島根県~chugoku~2|高津柿本神社~1~島根県~chugoku~2|高野寺~0~島根県~chugoku~2|佐毘売山神社~1~島根県~chugoku~2|出雲国分寺~0~島根県~chugoku~2|松江神社~1~島根県~chugoku~2|松養寺 (知夫村)~0~島根県~chugoku~2|焼火神社~1~島根県~chugoku~2|神原神社~1~島根県~chugoku~2|大念寺~0~島根県~chugoku~2|長浜神社~1~島根県~chugoku~2|天佐志比古命神社~1~島根県~chugoku~2|平濱八幡宮~1~島根県~chugoku~2|弥栄神社~1~島根県~chugoku~2|揖夜神社~1~島根県~chugoku~2|羅漢寺~0~島根県~chugoku~2|六所神社~1~島根県~chugoku~2|鷲原八幡宮~1~島根県~chugoku~2|一宿寺~0~徳島県~chugoku~2|王子神社~1~徳島県~chugoku~2|興源寺 (徳島市)~0~徳島県~chugoku~2|金磯弁財天~0~徳島県~chugoku~2|月夜御水大師~0~徳島県~chugoku~2|建治寺~0~徳島県~chugoku~2|建布都神社~1~徳島県~chugoku~2|見性寺~0~徳島県~chugoku~2|国中神社 (徳島市)~1~徳島県~chugoku~2|黒瀧寺~0~徳島県~chugoku~2|最明寺 (美馬市)~0~徳島県~chugoku~2|慈眼寺~0~徳島県~chugoku~2|慈眼寺~0~徳島県~chugoku~2|雲巌寺~0~栃木県~kanto~2|温泉寺~0~栃木県~kanto~2|下野国分寺跡~0~栃木県~kanto~2|下野国分尼寺~0~栃木県~kanto~2|下野國一社八幡宮~1~栃木県~kanto~2|加蘇山神社~1~栃木県~kanto~2|笠石神社~1~栃木県~kanto~2|樺崎寺~0~栃木県~kanto~2|玉藻稲荷神社~1~栃木県~kanto~2|古峯神社~1~栃木県~kanto~2|光真寺~0~栃木県~kanto~2|荒橿神社~1~栃木県~kanto~2|高勝寺~0~栃木県~kanto~2|今宮神社~1~栃木県~kanto~2|三和神社~1~栃木県~kanto~2|寺山観音寺~0~栃木県~kanto~2|慈光寺~0~栃木県~kanto~2|常楽寺~0~栃木県~kanto~2|壬生寺~0~栃木県~kanto~2|須賀神社~1~栃木県~kanto~2|善願寺~0~栃木県~kanto~2|村檜神社~1~栃木県~kanto~2|太平山神社~1~栃木県~kanto~2|台陽寺~0~栃木県~kanto~2|大慈寺~0~栃木県~kanto~2|大神神社 (栃木市)~1~栃木県~kanto~2|大前神社~1~栃木県~kanto~2|大猷院霊廟~0~栃木県~kanto~2|滝尾神社~1~栃木県~kanto~2|中村八幡宮~1~栃木県~kanto~2|朝日森天満宮~1~栃木県~kanto~2|栃木県護国神社~1~栃木県~kanto~2|那須温泉神社~1~栃木県~kanto~2|那須神社~1~栃木県~kanto~2|宇奈月神社~1~富山県~chubu~2|鵜坂神社~1~富山県~chubu~2|越中国分寺~0~富山県~chubu~2|円浄寺~0~富山県~chubu~2|櫛田神社 (射水市)~1~富山県~chubu~2|光禅寺~0~富山県~chubu~2|行徳寺~0~富山県~chubu~2|高岡関野神社~1~富山県~chubu~2|姉倉比売神社~1~富山県~chubu~2|勝興寺~0~富山県~chubu~2|上梨白山宮~1~富山県~chubu~2|埴生護国八幡宮~1~富山県~chubu~2|真宗大谷派井波別院瑞泉寺~0~富山県~chubu~2|真宗大谷派城端別院善徳寺~0~富山県~chubu~2|諏訪神社~1~富山県~chubu~2|西赤尾八幡社~1~富山県~chubu~2|西保神社~1~富山県~chubu~2|大法寺 (高岡市)~0~富山県~chubu~2|大佛寺~0~富山県~chubu~2|二上射水神社~1~富山県~chubu~2|入善神社~1~富山県~chubu~2|伏木神社~1~富山県~chubu~2|放生津八幡宮~1~富山県~chubu~2|本法寺 (富山市)~0~富山県~chubu~2|来迎寺~0~富山県~chubu~2|櫟原神社~1~富山県~chubu~2|安養寺~0~福井県~chubu~2|岡太神社~1~福井県~chubu~2|開善寺~0~福井県~chubu~2|興宗寺~0~福井県~chubu~2|空印寺~0~福井県~chubu~2|御誕生寺~0~福井県~chubu~2|佐佳枝廼社~1~福井県~chubu~2|三國神社~1~福井県~chubu~2|柴田神社~1~福井県~chubu~2|若狭神宮寺~0~福井県~chubu~2|若狭姫神社~1~福井県~chubu~2|松原神社~1~福井県~chubu~2|称念寺~0~福井県~chubu~2|常宮神社~1~福井県~chubu~2|常高寺~0~福井県~chubu~2|神明神社~1~福井県~chubu~2|性海寺~0~福井県~chubu~2|足羽神社~1~福井県~chubu~2|多田寺~0~福井県~chubu~2|大安寺~0~福井県~chubu~2|大谷寺 (越前町)~0~福井県~chubu~2|中山寺 (高浜町)~0~福井県~chubu~2|超勝寺~0~福井県~chubu~2|長源寺~0~福井県~chubu~2|天徳寺 (若狭町)~0~福井県~chubu~2|福井県護国神社~1~福井県~chubu~2|福通寺~0~福井県~chubu~2|妙隆寺~0~福井県~chubu~2|安国寺~0~福岡県~kyushu~2|医王寺~0~福岡県~kyushu~2|壱岐神社~1~福岡県~kyushu~2|榎社~1~福岡県~kyushu~2|安積国造神社~1~福島県~hokkaido~2|伊勢大御神 (南相馬市)~1~福島県~hokkaido~2|医王寺~0~福島県~hokkaido~2|隠津島神社~1~福島県~hokkaido~2|宇奈己呂和気神社~1~福島県~hokkaido~2|永昌寺~0~福島県~hokkaido~2|延命寺~0~福島県~hokkaido~2|王宮伊豆神社~1~福島県~hokkaido~2|温泉神社~1~福島県~hokkaido~2|開成山大神宮~1~福島県~hokkaido~2|蒲原神社~1~福島県~hokkaido~2|冠嶺神社~1~福島県~hokkaido~2|近津神社 (石川町)~1~福島県~hokkaido~2|恵隆寺~0~福島県~hokkaido~2|御刀神社~1~福島県~hokkaido~2|高屋敷稲荷神社~1~福島県~hokkaido~2|高座神社~1~福島県~hokkaido~2|三ヶ寺~0~福島県~hokkaido~2|山津見神社~1~福島県~hokkaido~2|蚕養国神社~1~福島県~hokkaido~2|鹿島御子神社~1~福島県~hokkaido~2|鹿島大神宮~1~福島県~hokkaido~2|借宿廃寺跡~0~福島県~hokkaido~2|小平潟天満宮~1~福島県~hokkaido~2|常泉寺~0~福島県~hokkaido~2|新宮熊野神社~1~福島県~hokkaido~2|正西寺~0~福島県~hokkaido~2|西根神社~1~福島県~hokkaido~2|石都々古和気神社~1~福島県~hokkaido~2|相馬神社~1~福島県~hokkaido~2|相馬太田神社~1~福島県~hokkaido~2|相馬中村神社~1~福島県~hokkaido~2|多珂神社~1~福島県~hokkaido~2|大鏑矢神社~1~福島県~hokkaido~2|田村神社 (郡山市)~1~福島県~hokkaido~2|土津神社~1~福島県~hokkaido~2|東光寺~0~福島県~hokkaido~2|南湖神社~1~福島県~hokkaido~2|二本松神社~1~福島県~hokkaido~2|二俣神社~1~福島県~hokkaido~2|日鷲神社~1~福島県~hokkaido~2|浦臼神社~1~北海道~hokkaido~2|永専寺~0~北海道~hokkaido~2|越後神社~1~北海道~hokkaido~2|温根湯神社~1~北海道~hokkaido~2|花岡神社~1~北海道~hokkaido~2|花畔神社~1~北海道~hokkaido~2|亀田八幡宮~1~北海道~hokkaido~2|丘珠神社~1~北海道~hokkaido~2|錦山天満宮~1~北海道~hokkaido~2|琴似神社~1~北海道~hokkaido~2|琴平神社~1~北海道~hokkaido~2|空知神社~1~北海道~hokkaido~2|経王寺~0~北海道~hokkaido~2|月寒神社~1~北海道~hokkaido~2|顕幽神社~1~北海道~hokkaido~2|呼人神社~1~北海道~hokkaido~2|光善寺~0~北海道~hokkaido~2|厚別神社~1~北海道~hokkaido~2|江南神社~1~北海道~hokkaido~2|江部乙神社~1~北海道~hokkaido~2|札幌八幡宮~1~北海道~hokkaido~2|札幌伏見稲荷神社~1~北海道~hokkaido~2|山口神社~1~北海道~hokkaido~2|市来知神社~1~北海道~hokkaido~2|実行寺~0~北海道~hokkaido~2|篠路神社~1~北海道~hokkaido~2|阿須賀神社~1~和歌山県~kinki~2|阿弥陀寺~0~和歌山県~kinki~2|伊達神社~1~和歌山県~kinki~2|一乗院~0~和歌山県~kinki~2|稲葉根王子~1~和歌山県~kinki~2|加太春日神社~1~和歌山県~kinki~2|海禅院~0~和歌山県~kinki~2|歓喜寺~0~和歌山県~kinki~2|吉祥寺~0~和歌山県~kinki~2|玉津島神社~1~和歌山県~kinki~2|熊谷寺~0~和歌山県~kinki~2|熊野三所大神社~1~和歌山県~kinki~2|荒田神社~1~和歌山県~kinki~2|刺田比古神社~1~和歌山県~kinki~2|施無畏寺~0~和歌山県~kinki~2|十三神社~1~和歌山県~kinki~2|十禅律院~0~和歌山県~kinki~2|深専寺~0~和歌山県~kinki~2|安国寺~0~沖縄県~kyushu~1|恵比須神社~1~沖縄県~kyushu~1|慈眼院~0~沖縄県~kyushu~1|十山神社~1~沖縄県~kyushu~1|出雲大社沖縄分社~1~沖縄県~kyushu~1|祥雲寺~0~沖縄県~kyushu~1|真教寺~0~沖縄県~kyushu~1|神宮寺~0~沖縄県~kyushu~1|神徳寺~0~沖縄県~kyushu~1|世持神社~1~沖縄県~kyushu~1|聖現寺~0~沖縄県~kyushu~1|西来院~0~沖縄県~kyushu~1|石嘉波神社~1~沖縄県~kyushu~1|大典寺~0~沖縄県~kyushu~1|大東宮~1~沖縄県~kyushu~1|遍照寺 (沖縄市)~0~沖縄県~kyushu~1|本願寺沖縄別院~0~沖縄県~kyushu~1|万松院~0~沖縄県~kyushu~1|臨海寺~0~沖縄県~kyushu~1|安浄寺~0~岩手県~hokkaido~1|鞍迫観音~0~岩手県~hokkaido~1|鵜住神社~1~岩手県~hokkaido~1|鵜鳥神社~1~岩手県~hokkaido~1|遠野郷八幡宮~1~岩手県~hokkaido~1|庵川観音堂~0~宮崎県~kyushu~1|円岳寺~0~宮崎県~kyushu~1|円福寺~0~宮崎県~kyushu~1|狭上稲荷神社~1~宮崎県~kyushu~1|極楽寺~0~宮崎県~kyushu~1|荒立神社~1~宮崎県~kyushu~1|黒尾神社~1~宮崎県~kyushu~1|今山八幡宮~1~宮崎県~kyushu~1|三福寺~0~宮崎県~kyushu~1|上行寺~0~宮崎県~kyushu~1|真栄寺~0~宮崎県~kyushu~1|速川神社 (西都市)~1~宮崎県~kyushu~1|大塚八幡神社~1~宮崎県~kyushu~1|瀧山神社~1~宮崎県~kyushu~1|長善寺~0~宮崎県~kyushu~1|定善寺~0~宮崎県~kyushu~1|土持神社~1~宮崎県~kyushu~1|東霧島神社~1~宮崎県~kyushu~1|日向妙国寺~0~宮崎県~kyushu~1|白鳥神社~1~宮崎県~kyushu~1|宝光院 (小林市)~0~宮崎県~kyushu~1|阿蘇山上神社~1~熊本県~kyushu~1|阿蘇比咩神社~1~熊本県~kyushu~1|印鑰神社~1~熊本県~kyushu~1|永国寺~0~熊本県~kyushu~1|永秀寺~0~熊本県~kyushu~1|往生院~0~熊本県~kyushu~1|岡留熊野座神社~1~熊本県~kyushu~1|河江神社~1~熊本県~kyushu~1|河尻神宮~1~熊本県~kyushu~1|海東阿蘇神社~1~熊本県~kyushu~1|貝洲加藤神社~1~熊本県~kyushu~1|観音寺~0~熊本県~kyushu~1|伊萬里神社~1~佐賀県~kyushu~1|医王寺~0~佐賀県~kyushu~1|因通寺~0~佐賀県~kyushu~1|円通寺~0~佐賀県~kyushu~1|於保天満宮~1~佐賀県~kyushu~1|願正寺~0~佐賀県~kyushu~1|教仙寺~0~佐賀県~kyushu~1|極楽寺 (佐賀市)~0~佐賀県~kyushu~1|櫛田宮~1~佐賀県~kyushu~1|掘江神社~1~佐賀県~kyushu~1|三岳寺 (小城市)~0~佐賀県~kyushu~1|四阿屋神社~1~佐賀県~kyushu~1|志賀神社~1~佐賀県~kyushu~1|宗眼寺~0~佐賀県~kyushu~1|修善院~0~佐賀県~kyushu~1|勝妙寺~0~佐賀県~kyushu~1|愛宕神社~1~山形県~hokkaido~1|愛宕神社~1~山形県~hokkaido~1|鮎貝八幡宮~1~山形県~hokkaido~1|安国寺~0~山形県~hokkaido~1|一宮神社~1~山形県~hokkaido~1|羽黒神社~1~山形県~hokkaido~1|塩野毘沙門堂~0~山形県~hokkaido~1|海向寺~0~山形県~hokkaido~1|吉祥院~0~山形県~hokkaido~1|月山神社~1~山形県~hokkaido~1|建勲神社~1~山形県~hokkaido~1|五所神社~1~山形県~hokkaido~1|御所神社~1~山形県~hokkaido~1|光禅寺~0~山形県~hokkaido~1|甲子大黒天本山~0~山形県~hokkaido~1|愛宕寺~0~山口県~chugoku~1|葦原神社~1~山口県~chugoku~1|宇津神社~1~山口県~chugoku~1|宇和奈利社~1~山口県~chugoku~1|雲林寺~0~山口県~chugoku~1|永福寺~0~山口県~chugoku~1|安楽山宮神社~1~鹿児島県~kyushu~1|安良神社~1~鹿児島県~kyushu~1|伊佐智佐神社~1~鹿児島県~kyushu~1|一乗院~0~鹿児島県~kyushu~1|一之宮神社~1~鹿児島県~kyushu~1|稲荷神社~1~鹿児島県~kyushu~1|旭岡山神社~1~秋田県~hokkaido~1|伊豆山神社~1~秋田県~hokkaido~1|雲昌寺~0~秋田県~hokkaido~1|塩湯彦神社~1~秋田県~hokkaido~1|横手神明社~1~秋田県~hokkaido~1|歓喜寺~0~秋田県~hokkaido~1|岩関神社~1~秋田県~hokkaido~1|金澤八幡宮~1~秋田県~hokkaido~1|月山神社 (鹿角市)~1~秋田県~hokkaido~1|香積寺~0~秋田県~hokkaido~1|国清寺跡~0~秋田県~hokkaido~1|三哲神社~1~秋田県~hokkaido~1|七座神社~1~秋田県~hokkaido~1|松舘菅原神社~1~秋田県~hokkaido~1|浄明寺~0~秋田県~hokkaido~1|清源寺 (秋田県南秋田郡八郎潟町)~0~秋田県~hokkaido~1|素波里神社~1~秋田県~hokkaido~1|大館八幡神社~1~秋田県~hokkaido~1|東湖八坂神社~1~秋田県~hokkaido~1|安隆寺~0~新潟県~chubu~1|鞍掛神社~1~新潟県~chubu~1|伊米神社八幡宮~1~新潟県~chubu~1|羽黒神社~1~新潟県~chubu~1|羽森神社~1~新潟県~chubu~1|雲母神社~1~新潟県~chubu~1|永昌庵~0~新潟県~chubu~1|円福寺~0~新潟県~chubu~1|円隆寺~0~新潟県~chubu~1|永昌寺~0~青森県~hokkaido~1|革秀寺~0~青森県~hokkaido~1|久渡寺~0~青森県~hokkaido~1|求聞寺~0~青森県~hokkaido~1|橋雲寺~0~青森県~hokkaido~1|胸肩神社~1~青森県~hokkaido~1|熊野神社~1~青森県~hokkaido~1|玄中寺~0~青森県~hokkaido~1|弘前天満宮~1~青森県~hokkaido~1|弘法寺~0~青森県~hokkaido~1|三八城神社~1~青森県~hokkaido~1|慈雲院~0~青森県~hokkaido~1|秋葉山神社~1~青森県~hokkaido~1|小田八幡宮~1~青森県~hokkaido~1|正行寺~0~青森県~hokkaido~1|対泉院~0~青森県~hokkaido~1|袋宮寺~0~青森県~hokkaido~1|大安寺~0~青森県~hokkaido~1|大間稲荷神社~1~青森県~hokkaido~1|大行院~0~青森県~hokkaido~1|大慈寺~0~青森県~hokkaido~1|長円寺~0~青森県~hokkaido~1|白山姫神社~1~青森県~hokkaido~1|普門院 (弘前市)~0~青森県~hokkaido~1|聞法寺~0~青森県~hokkaido~1|闇無浜神社~1~大分県~kyushu~1|伊美別宮社~1~大分県~kyushu~1|一心寺 (大分市)~0~大分県~kyushu~1|臼杵神社~1~大分県~kyushu~1|雲八幡宮~1~大分県~kyushu~1|永福寺~0~大分県~kyushu~1|円通寺~0~大分県~kyushu~1|応暦寺~0~大分県~kyushu~1|温泉神社~1~大分県~kyushu~1|温泉神社 (別府市青山町)~1~大分県~kyushu~1|火男火売神社下宮（鶴見権現）~1~大分県~kyushu~1|賀来神社~1~大分県~kyushu~1|願成就寺~0~大分県~kyushu~1|亀岡八幡神社~1~大分県~kyushu~1|阿太加夜神社~1~島根県~chugoku~1|伊甘神社~1~島根県~chugoku~1|阿別当神明宮~1~富山県~chubu~1|医王院~0~富山県~chubu~1|一万当社~1~富山県~chubu~1|運源寺~0~富山県~chubu~1|永安寺~0~富山県~chubu~1|越中護国八幡宮~1~富山県~chubu~1|於保多神社~1~富山県~chubu~1|乙劍社~1~富山県~chubu~1|下梨地主神社~1~富山県~chubu~1|加茂神社~1~富山県~chubu~1|皆葎住吉神社~1~富山県~chubu~1|皆蓮寺~0~富山県~chubu~1|各願寺~0~富山県~chubu~1|歓盛寺~0~富山県~chubu~1|観音寺~0~富山県~chubu~1|意足寺~0~福井県~chubu~1|宇波西神社~1~福井県~chubu~1|羽賀寺~0~福井県~chubu~1|永宮寺~0~福井県~chubu~1|越知神社~1~福井県~chubu~1|奥宮夜叉龍神社~1~福井県~chubu~1";
  var rows = RAW.split("|");

  function build(){
    if (typeof SHRINES === 'undefined' || !Array.isArray(SHRINES)) return false;
    if (window.__wabiShrinesAdded) return true;
    // 既存の113件とは「名前」で重複を見る。
    // 追加分どうしは「名前＋都道府県」で見る（八幡神社・稲荷神社は各県にあるため）
    var have = {}, seen = {};
    SHRINES.forEach(function(s){ have[s.name] = 1; });
    var added = 0;
    for (var i = 0; i < rows.length; i++){
      var p = rows[i].split("~");
      if (p.length < 5) continue;
      var name = p[0];
      var key = name + '@' + p[2];
      if (have[name] || seen[key]) continue;
      seen[key] = 1;
      SHRINES.push({
        rank: 1000 + i,              // 既存113件より下。並びは知名度順
        type: p[1] === '1' ? 'shrine' : 'temple',
        name: name,
        deity: '',                   // Wikidataからは祭神を取っていない
        addr: p[2],                  // 都道府県まで
        map: 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(name + ' ' + p[2]),
        area: p[3],
        rating: 0, rev: 0,           // 0 のときは★行を出さない
        visited: false,
        tags: [],
        wiki: parseInt(p[4], 10) || 1
      });
      added++;
    }
    window.__wabiShrinesAdded = added;
    return true;
  }

  /* ★行と「祭神：」を、中身が無いときだけ隠す ------------------------- */
  function wrapCard(){
    if (typeof renderCard !== 'function' || window.__wabiCardWrapped) return;
    window.__wabiCardWrapped = true;
    var orig = renderCard;
    window.renderCard = function(s, dr){
      var html = orig.apply(this, arguments);
      try {
        if (!s || !s.deity) html = html.replace('<span class="deity">祭神：</span>', '');
        if (!s || !s.rev) {
          html = html.replace(/<div><div class="stars">[\s\S]*?<\/div><\/div>/,
            '<div class="wabi-wiki">Wikipedia ' + ((s && s.wiki) || 1) + '言語</div>');
        }
      } catch(e){}
      return html;
    };
    var st = document.createElement('style');
    st.textContent = '.wabi-wiki{font-size:11px;color:var(--ink-3,#9A9086);letter-spacing:.04em;line-height:1.4}';
    document.head.appendChild(st);
  }

  /* ★課金事故の防止★
     applyApiKey() から呼ばれる loadAllPhotos() は SHRINES 全件に
     Google Places を投げる。2,000件超に増えたので上位60件までに制限する。 */
  function capPhotos(){
    if (typeof window.loadAllPhotos !== 'function' || window.__wabiPhotoCapped) return;
    window.__wabiPhotoCapped = true;
    var orig = window.loadAllPhotos;
    window.loadAllPhotos = function(){
      try {
        var backup = SHRINES.slice();
        var slim = backup.slice(0, 60);
        SHRINES.length = 0;
        Array.prototype.push.apply(SHRINES, slim);
        var r = orig.apply(this, arguments);
        Promise.resolve(r).then(function(){
          SHRINES.length = 0;
          Array.prototype.push.apply(SHRINES, backup);
          if (typeof filter === 'function') filter();
        });
        return r;
      } catch(e){ return orig.apply(this, arguments); }
    };
  }

  function run(){
    wrapCard();
    capPhotos();
    if (build() && window.WabiPrefFilter && window.WabiPrefFilter.rebuild) {
      window.WabiPrefFilter.rebuild();
    }
    try { if (typeof filter === 'function') filter(); } catch(e){}
  }

  if (document.readyState === 'complete') setTimeout(run, 150);
  else window.addEventListener('load', function(){ setTimeout(run, 150); });
  [600, 1500, 3000].forEach(function(ms){ setTimeout(run, ms); });
})();


/* __wabiShrineScore : ランキングの並びを「合成スコア」に置き換える（2026-08-12）
   ・index.html は触らない。__wabiShrines2341 が追加した神社仏閣の rank を上書きする
   ・Googleは一切呼ばない。出典は Wikidata（CC0）のみ。費用0円

   ★スコアの決め方（根拠つき）★
     日本の神社仏閣 55,014件を母数に各属性の出現数を実測し、
     「珍しい属性ほど強い証拠」＝情報量 -log2(出現率) を重みの基礎にした。

       Wikipedia記事あり 16,877件(31%)   文化財指定あり  802件(1.5%)
       国幣社  3,948件(7.2%)             重要文化財      429件(0.78%)
       式内社  2,813件(5.1%)             官幣社          370件(0.67%)
       国宝      241件(0.44%)            世界遺産         79件(0.14%)

     スコア = 3.0 × log2(1 + Wikipedia言語数)
            + 0.5 × ( 文化財ボーナス + 社格ボーナス )

     文化財（最も格の高い1つだけ）世界遺産9 / 国宝8 / 重要文化財7 /
       特別史跡・特別名勝6 / 史跡・名勝5 / 登録有形3 / その他2
     社格（同上）官幣社7 / 式内社4 / 国幣社4 / 論社・国史見在社2

   ★係数 0.5 にした理由（実測にもとづく修正）★
     当初は係数1.0で実装したが、東京都で **浅草寺が12位、靖国神社が11位**になった。
     原因は重みではなく **Wikidataのデータ欠落**。
     文化財が記録されているのは16,943件中778件（4.6%）しかなく、
     浅草寺の項目には P1435 が入っていない。
     つまりこの属性は「持っているか」ではなく「書かれているか」を表しており、
     +7点の加点は、記入の充実した無名寺院に有名寺院を追い抜かせてしまう。
     係数を0.5に下げると、格の順序は保ったまま
     **同程度の知名度どうしの並べ替え**として働き、逆転しなくなる。

   ★データが無い場合★
     言語数は最低1、文化財・社格は0として必ずスコアが出る。
     この一覧に無い神社は、これまでの順位のまま残る（欠落しない）。   */
(function(){
  if (window.__wabiShrineScore) return;
  window.__wabiShrineScore = true;

  // 名前~都道府県~言語数~文化財~社格　をスコアの高い順に並べたもの
  var RAW = "鹿苑寺~京都府~57~9~0|伊勢神宮~三重県~44~8~0|高徳院~神奈川県~42~8~0|賀茂御祖神社~京都府~22~9~4|慈照寺~京都府~33~9~0|延暦寺~滋賀県~32~9~0|東寺~京都府~30~9~0|日光二荒山神社~栃木県~18~9~4|宇治上神社~京都府~20~9~2|法隆寺地域の仏教建造物~奈良県~25~9~0|熊野速玉大社~三重県~15~9~4|熊野本宮大社~三重県~15~9~4|吉野水分神社~奈良県~15~9~4|宇佐神宮~大分県~16~8~4|醍醐寺~京都府~23~9~0|西芳寺~京都府~22~9~0|鹿島神宮~茨城県~16~7~4|東福寺~京都府~23~8~0|高山寺~京都府~20~9~0|天龍寺~京都府~20~9~0|南禅寺~京都府~22~8~0|唐招提寺~奈良県~19~9~0|金剛峯寺~和歌山県~19~9~0|三十三間堂~京都府~21~8~0|輪王寺~栃木県~18~9~0|元興寺~奈良県~18~9~0|大徳寺~京都府~20~8~0|知恩院~京都府~20~8~0|日吉大社~滋賀県~12~8~4|西本願寺~京都府~17~9~0|園城寺~滋賀県~19~8~0|丹生都比売神社~和歌山県~10~9~4|金峯山寺~奈良県~16~9~0|法起寺~奈良県~16~9~0|大神神社~奈良県~14~7~2|青岸渡寺~和歌山県~14~9~0|妙心寺~京都府~17~7~0|金峯神社~奈良県~8~9~4|毛越寺~岩手県~13~9~0|三宝院~京都府~13~9~0|香取神宮~千葉県~10~7~4|高台寺~京都府~15~7~0|静岡浅間神社~静岡県~9~7~4|石上神宮~奈良県~10~8~2|補陀洛山寺~和歌山県~11~9~0|相国寺~京都府~14~7~0|萬福寺~京都府~14~7~0|根津神社~東京都~14~7~0|崇福寺~長崎県~12~8~0|鹽竈神社~宮城県~8~7~4|松尾大社~京都府~8~7~4|佐太神社~島根県~8~7~4|高良大社~福岡県~8~7~4|吉田神社~京都府~13~7~0|建仁寺~京都府~13~7~0|泉涌寺~京都府~13~7~0|東本願寺~京都府~13~7~0|護国寺~東京都~13~7~0|上野東照宮~東京都~13~7~0|西大寺~奈良県~13~7~0|春日山原始林~奈良県~10~9~0|丹生官省符神社~和歌山県~10~9~0|秋篠寺~奈良県~11~8~0|長谷寺~奈良県~11~8~0|本能寺~京都府~20~3~0|立石寺~山形県~12~7~0|南宮大社~岐阜県~7~7~4|観自在王院跡~岩手県~9~9~0|桜井神社~大阪府~4~8~7|吉水神社~奈良県~9~9~0|大峯山寺~奈良県~9~9~0|西宮神社~兵庫県~9~7~2|浄瑠璃寺~京都府~10~8~0|宝厳寺~滋賀県~10~8~0|久能山東照宮~静岡県~10~8~0|鑁阿寺~栃木県~10~8~0|一乗寺~兵庫県~10~8~0|浄土寺~兵庫県~10~8~0|鶴林寺~兵庫県~10~8~0|根来寺~和歌山県~10~8~0|大覚寺~京都府~11~7~0|築地本願寺~東京都~11~7~0|圓教寺~兵庫県~11~7~0|方広寺~京都府~14~5~0|飛鳥寺~奈良県~14~5~0|氷川神社~埼玉県~15~0~4|広隆寺~京都府~9~8~0|大報恩寺~京都府~9~8~0|豊国神社~京都府~9~8~0|浄土寺~広島県~9~8~0|石山寺~滋賀県~9~8~0|観心寺~大阪府~9~8~0|富貴寺~大分県~9~8~0|三仏寺~鳥取県~9~8~0|新薬師寺~奈良県~9~8~0|當麻寺~奈良県~9~8~0|太山寺~兵庫県~9~8~0|大縣神社~愛知県~6~7~4|大神山神社~鳥取県~6~7~4|手向山八幡宮~奈良県~6~9~2|氣比神宮~福井県~6~7~4|笠間稲荷神社~茨城県~10~7~0|壬生寺~京都府~10~7~0|法観寺~京都府~10~7~0|六波羅蜜寺~京都府~10~7~0|尾山神社~石川県~10~7~0|寛永寺~東京都~10~7~0|橿原神宮~奈良県~10~7~0|總持寺~神奈川県~16~3~0|大安寺~奈良県~12~5~0|太山寺~愛媛県~8~8~0|本山寺~香川県~8~8~0|般若寺~奈良県~8~8~0|霊山寺~奈良県~8~8~0|無量光院跡~岩手県~7~9~0|宇治神社~京都府~7~7~2|多賀大社~滋賀県~7~5~4|香椎宮~福岡県~7~7~2|奥之院~和歌山県~7~9~0|金剛三昧院~和歌山県~7~9~0|慈尊院~和歌山県~7~9~0|神護寺~京都府~9~7~0|喜多院~埼玉県~9~7~0|談山神社~奈良県~9~7~0|宇太水分神社~奈良県~6~8~2|中山神社~岡山県~5~7~4|榛名神社~群馬県~5~7~4|日御碕神社~島根県~5~7~4|往馬坐伊古麻都比古神社~奈良県~5~7~4|愛宕念仏寺~京都府~8~7~0|三千院~京都府~8~7~0|佛通寺~広島県~8~7~0|屋島寺~香川県~8~7~0|摠見寺~滋賀県~8~7~0|岡寺~奈良県~8~7~0|道成寺~和歌山県~8~7~0|青井阿蘇神社~熊本県~7~8~0|功山寺~山口県~7~8~0|瑠璃光寺~山口県~7~8~0|正福寺~東京都~7~8~0|室生寺~奈良県~7~8~0|瑞龍寺~富山県~7~8~0|明通寺~福井県~7~8~0|長保寺~和歌山県~7~8~0|大観密寺~宮城県~19~0~0|神谷神社~香川県~4~8~4|都久夫須麻神社~滋賀県~4~8~4|苗村神社~滋賀県~4~8~4|白鬚神社~滋賀県~6~7~2|鹿児島神宮~鹿児島県~6~5~4|生田神社~兵庫県~11~0~4|石山本願寺~大阪府~18~0~0|仙台東照宮~宮城県~7~7~0|陸奥国分寺~宮城県~7~7~0|国分寺~香川県~7~7~0|安養院~神奈川県~7~7~0|岩木山神社~青森県~7~7~0|法華寺~奈良県~7~7~0|伊佐爾波神社~愛媛県~4~7~4|一之宮貫前神社~群馬県~4~7~4|寿福寺~神奈川県~9~5~0|水若酢神社~島根県~4~7~4|気多神社~富山県~4~7~4|大宝寺~愛媛県~6~8~0|永保寺~岐阜県~6~8~0|明王院~広島県~6~8~0|清白寺~山梨県~6~8~0|大善寺~山梨県~6~8~0|西明寺~滋賀県~6~8~0|孝恩寺~大阪府~6~8~0|安楽寺~長野県~6~8~0|東大寺二月堂~奈良県~6~8~0|東大寺法華堂~奈良県~6~8~0|白水阿弥陀堂~福島県~6~8~0|朝光寺~兵庫県~6~8~0|熊野三山~和歌山県~5~9~0|浄妙寺~神奈川県~8~5~0|瑞泉寺~神奈川県~8~5~0|東禅寺~東京都~8~5~0|歓喜院~埼玉県~3~8~4|御上神社~滋賀県~3~8~4|安泰寺~兵庫県~15~0~0|田縣神社~愛知県~9~0~4|長田神社~兵庫県~9~0~4|向嶽寺~山梨県~6~7~0|極楽寺~神奈川県~6~7~0|金剛寺~大阪府~6~7~0|水無瀬神宮~大阪府~6~7~0|柞原八幡宮~大分県~6~7~0|大山寺~鳥取県~6~7~0|不退寺~奈良県~6~7~0|粉河寺~和歌山県~6~7~0|赤間神宮~山口県~10~3~0|不動院~広島県~5~8~0|金剛輪寺~滋賀県~5~8~0|長寿寺~滋賀県~5~8~0|建水分神社~大阪府~2~7~7|泉井上神社~大阪府~2~7~7|大海神社~大阪府~2~7~7|仁科神明宮~長野県~5~8~0|栄山寺~奈良県~5~8~0|円成寺~奈良県~5~8~0|於美阿志神社~奈良県~2~7~7|武田神社~山梨県~14~0~0|伊奈波神社~岐阜県~8~0~4|大和神社~奈良県~8~0~4|廣瀬大社~奈良県~8~0~4|伊和神社~兵庫県~8~0~4|沼名前神社~広島県~3~7~4|浄智寺~神奈川県~7~5~0|明月院~神奈川県~7~5~0|中尊寺金色堂~岩手県~4~9~0|富士山-信仰の対象と芸術の源泉~山梨県~4~9~0|泉岳寺~東京都~13~0~0|山田寺~奈良県~6~6~0|廣田神社~兵庫県~10~0~2|大樹寺~愛知県~5~7~0|鳳来寺~愛知県~5~7~0|崇元寺~沖縄県~5~7~0|円通院~宮城県~5~7~0|白峯寺~香川県~5~7~0|金剛證寺~三重県~5~7~0|河口浅間神社~山梨県~2~9~4|光明寺~神奈川県~5~7~0|御穂神社~静岡県~2~9~4|大乗寺~石川県~5~7~0|叡福寺~大阪府~5~7~0|美多彌神社~大阪府~5~0~7|本寺専修寺~栃木県~5~7~0|安倍文殊院~奈良県~5~7~0|長岳寺~奈良県~5~7~0|氷室神社~奈良県~5~0~7|梅林寺~福岡県~5~7~0|紀三井寺~和歌山県~5~7~0|鎮西大社諏訪神社~長崎県~12~0~0|聖福寺~福岡県~12~0~0|宮﨑神宮~宮崎県~8~3~0|中宮寺~奈良県~8~3~0|多度大社~三重県~7~0~4|月山神社~山形県~7~0~4|度津神社~新潟県~7~0~4|彌彦神社~新潟県~7~0~4|生國魂神社~大阪府~7~0~4|大鳥大社~大阪府~7~0~4|枚岡神社~大阪府~7~0~4|西寒多神社~大分県~7~0~4|豊楽寺~高知県~4~8~0|常楽寺~滋賀県~4~8~0|善水寺~滋賀県~4~8~0|神魂神社~島根県~4~8~0|長弓寺~奈良県~4~8~0|東大寺大仏殿~奈良県~4~8~0|龍田大社~奈良県~9~0~2|善福院~和歌山県~4~8~0|東勝寺~神奈川県~6~5~0|玉泉寺~静岡県~6~5~0|観音院~鳥取県~6~5~0|観世音寺~福岡県~6~5~0|長谷寺~神奈川県~11~0~0|百済寺~大阪府~5~6~0|豪徳寺~東京都~11~0~0|東郷神社~東京都~11~0~0|妙義神社~群馬県~3~7~2|花窟神社~三重県~3~9~0|近江神宮~滋賀県~7~3~0|満月寺~滋賀県~7~3~0|山宮浅間神社~静岡県~3~9~0|岩屋寺~愛媛県~4~7~0|飛騨国分寺~岐阜県~4~7~0|安国寺~広島県~4~7~0|慈光寺~埼玉県~4~7~0|月讀宮~三重県~4~0~7|周防国分寺~山口県~4~7~0|長命寺~滋賀県~4~7~0|百済寺~滋賀県~4~7~0|臨済寺~静岡県~4~7~0|南宗寺~大阪府~4~7~0|羅漢寺~大分県~4~7~0|鳥取東照宮~鳥取県~4~7~0|須磨寺~兵庫県~4~7~0|売布神社~兵庫県~4~0~7|真宗大谷派函館別院~北海道~4~7~0|砥鹿神社~愛知県~6~0~4|大洗磯前神社~茨城県~6~0~4|筑波山神社~茨城県~6~0~4|飛騨一宮水無神社~岐阜県~6~0~4|都農神社~宮崎県~6~0~4|多家神社~広島県~6~0~4|皇大神宮~三重県~6~0~4|鳥海山大物忌神社~山形県~6~0~4|枚聞神社~鹿児島県~6~0~4|居多神社~新潟県~6~0~4|天津神社~新潟県~6~0~4|寒川神社~神奈川県~6~0~4|伊豆山神社~静岡県~6~0~4|安房神社~千葉県~6~0~4|玉前神社~千葉県~6~0~4|坐摩神社~大阪府~6~0~4|宇倍神社~鳥取県~6~0~4|倭文神社~鳥取県~6~0~4|大國魂神社~東京都~6~0~4|竈門神社~福岡県~6~0~4|出石神社~兵庫県~6~0~4|淡嶋神社~和歌山県~6~0~4|永源寺~滋賀県~10~0~0|勝尾寺~大阪府~10~0~0|山王神社~長崎県~10~0~0|酒見寺~兵庫県~10~0~0|知立神社~愛知県~2~7~4|頼久寺~岡山県~5~5~0|阿多由太神社~岐阜県~2~7~4|荒城神社~岐阜県~2~7~4|穴切大神社~山梨県~2~7~4|清浄光寺~神奈川県~5~5~0|願成就院~静岡県~5~5~0|了仙寺~静岡県~5~5~0|聖神社~大阪府~2~7~4|片埜神社~大阪府~2~7~4|光前寺~長野県~5~5~0|玉若酢命神社~島根県~2~7~4|大前神社~栃木県~2~7~4|多田神社~兵庫県~5~5~0|名草神社~兵庫県~2~7~4|加太春日神社~和歌山県~2~7~4|金蓮寺~愛知県~3~8~0|安国寺~岐阜県~3~8~0|向上寺~広島県~3~8~0|小村神社~高知県~7~0~2|大笹原神社~滋賀県~3~8~0|慈眼院~大阪府~3~8~0|大法寺~長野県~3~8~0|投入堂~鳥取県~3~8~0|合氣神社~茨城県~9~0~0|常磐神社~茨城県~9~0~0|東慶寺~神奈川県~9~0~0|平間寺~神奈川県~9~0~0|報国寺~神奈川県~9~0~0|妙本寺~神奈川県~9~0~0|大石寺~静岡県~9~0~0|愛宕神社~東京都~9~0~0|宮中三殿~東京都~9~0~0|柴又帝釈天~東京都~9~0~0|乃木神社~東京都~9~0~0|富岡八幡宮~東京都~9~0~0|国泰寺~富山県~9~0~0|崇福寺~福岡県~9~0~0|耕三寺~広島県~6~3~0|陶山神社~佐賀県~6~3~0|意富比神社~茨城県~5~0~4|田島神社~佐賀県~5~0~4|伊射波神社~三重県~5~0~4|佐美長神社~三重県~5~0~4|豊受大神宮~三重県~5~0~4|建部大社~滋賀県~5~0~4|事任八幡宮~静岡県~5~0~4|小国神社~静岡県~5~0~4|菅生石部神社~石川県~5~0~4|海神神社~長崎県~5~0~4|興神社~長崎県~5~0~4|和多都美神社~長崎県~5~0~4|八重垣神社~島根県~5~0~4|由良比女神社~島根県~5~0~4|大麻比古神社~徳島県~5~0~4|高瀬神社~富山県~5~0~4|劔神社~福井県~5~0~4|志賀海神社~福岡県~5~0~4|伊佐須美神社~福島県~5~0~4|日前神宮・國懸神宮~和歌山県~5~0~4|竈山神社~和歌山県~5~0~4|大須観音~愛知県~8~0~0|津島神社~愛知県~8~0~0|竹林寺~高知県~8~0~0|祐徳稲荷神社~佐賀県~8~0~0|久遠寺~山梨県~8~0~0|鎌倉宮~神奈川県~8~0~0|杉本寺~神奈川県~8~0~0|大船観音寺~神奈川県~8~0~0|円福寺~千葉県~8~0~0|那古寺~千葉県~8~0~0|太融寺~大阪府~8~0~0|大念仏寺~大阪府~8~0~0|豊國神社~大阪府~8~0~0|福済寺~長崎県~8~0~0|戸隠神社~長野県~8~0~0|花園神社~東京都~8~0~0|蓮光寺~東京都~8~0~0|十楽寺~徳島県~8~0~0|大日寺~徳島県~8~0~0|地蔵寺~徳島県~8~0~0|霊山寺~徳島県~8~0~0|鳳来山東照宮~愛知県~3~7~0|龍泉寺~愛知県~3~7~0|本蓮寺~岡山県~3~7~0|桃林寺~沖縄県~3~7~0|五大堂~宮城県~3~7~0|世良田東照宮~群馬県~3~7~0|仙波東照宮~埼玉県~3~7~0|東光寺~山口県~3~7~0|桑実寺~滋賀県~3~7~0|西教寺~滋賀県~3~7~0|日吉東照宮~滋賀県~3~7~0|蓮華峰寺~新潟県~3~7~0|英勝寺~神奈川県~3~7~0|櫛引八幡宮~青森県~3~7~0|那谷寺~石川県~3~7~0|烏帽子形八幡神社~大阪府~3~7~0|石切剣箭神社~大阪府~3~0~7|夜疑神社~大阪府~3~0~7|金剛寺~東京都~3~7~0|箸蔵寺~徳島県~3~7~0|瀧谷寺~福井県~3~7~0|中津宮~福岡県~1~9~4|辺津宮~福岡県~1~9~4|春日神社~兵庫県~3~7~0|紀州東照宮~和歌山県~3~7~0|備中国分寺~岡山県~4~5~0|末吉宮~沖縄県~4~5~0|高舘義経堂~岩手県~4~5~0|達谷窟~岩手県~4~5~0|美濃国分寺~岐阜県~4~5~0|陸奥国分尼寺~宮城県~4~5~0|生品神社~群馬県~4~5~0|義仲寺~滋賀県~4~5~0|清見寺~静岡県~4~5~0|能登国分寺~石川県~4~5~0|吉志部神社~大阪府~4~5~0|住吉行宮~大阪府~4~5~0|野中寺~大阪府~4~5~0|隠岐国分寺~島根県~4~5~0|下野薬師寺跡~栃木県~4~5~0|平泉寺白山神社~福井県~4~5~0|恵日寺~福島県~4~5~0|安養院~兵庫県~4~5~0|国泰寺~北海道~4~5~0|天孫神社~滋賀県~6~0~2|秋葉山本宮秋葉神社~静岡県~6~0~2|本妙寺~熊本県~5~3~0|冨士御室浅間神社~山梨県~2~9~0|北口本宮冨士浅間神社~山梨県~2~9~0|延暦寺根本中堂~滋賀県~2~9~0|吉御子神社~滋賀県~2~7~2|須山浅間神社~静岡県~2~9~0|村山浅間神社~静岡県~2~9~0|東口本宮冨士浅間神社~静岡県~2~9~0|日根神社~大阪府~2~5~4|佐毘売山神社~島根県~2~9~0|羅漢寺~島根県~2~9~0|高岩寺~東京都~5~3~0|太龍寺~徳島県~5~3~0|大猷院霊廟~栃木県~2~9~0|滝尾神社~栃木県~2~9~0|丹生酒殿神社~和歌山県~2~9~0|徳川家霊台~和歌山県~2~9~0|鬪雞神社~和歌山県~2~9~0|覚王山日泰寺~愛知県~7~0~0|萬松寺~愛知県~7~0~0|八坂寺~愛媛県~7~0~0|常陸国分寺~茨城県~3~6~0|青葉神社~宮城県~7~0~0|広島護国神社~広島県~7~0~0|三瀧寺~広島県~7~0~0|大窪寺~香川県~7~0~0|国分寺~高知県~7~0~0|禅師峰寺~高知県~7~0~0|高麗神社~埼玉県~7~0~0|熊野神社~山形県~7~0~0|照国神社~鹿児島県~7~0~0|佐助稲荷神社~神奈川県~7~0~0|遠江国分寺~静岡県~3~6~0|家原寺~大阪府~7~0~0|教興寺~大阪府~7~0~0|国分寺~大阪府~7~0~0|青蓮寺~大阪府~7~0~0|道明寺~大阪府~7~0~0|妙国寺~大阪府~7~0~0|御柱祭~長野県~7~0~0|斎尾廃寺跡~鳥取県~3~6~0|回向院~東京都~7~0~0|曹源寺~東京都~7~0~0|天王寺~東京都~7~0~0|氷川神社 (赤坂)~東京都~7~0~0|安楽寺~徳島県~7~0~0|極楽寺~徳島県~7~0~0|金泉寺~徳島県~7~0~0|法輪寺~徳島県~7~0~0|薬王寺~徳島県~7~0~0|櫛田神社~福岡県~7~0~0|忉利天上寺~兵庫県~7~0~0|若宮八幡社~愛知県~4~0~4|川原神社~愛知県~4~0~4|大神神社~愛知県~4~0~4|尾張大国霊神社~愛知県~4~0~4|酒列磯前神社~茨城県~4~0~4|江田神社~宮崎県~4~0~4|都萬神社~宮崎県~4~0~4|田村神社~香川県~4~0~4|與止日女神社~佐賀県~4~0~4|秩父神社~埼玉県~4~0~4|敢國神社~三重県~4~0~4|荒祭宮~三重県~4~0~4|都波岐神社・奈加等神社~三重県~4~0~4|出羽神社~山形県~4~0~4|玉祖神社~山口県~4~0~4|浅間神社~山梨県~4~0~4|大山阿夫利神社~神奈川県~4~0~4|焼津神社~静岡県~4~0~4|厳原八幡宮神社~長崎県~4~0~4|天手長男神社~長崎県~4~0~4|生島足島神社~長野県~4~0~4|穂高神社~長野県~4~0~4|須佐神社~島根県~4~0~4|物部神社~島根県~4~0~4|御田八幡神社~東京都~4~0~4|小野神社~東京都~4~0~4|武蔵御嶽神社~東京都~4~0~4|射水神社~富山県~4~0~4|雄山神社~富山県~4~0~4|若狭彦神社~福井県~4~0~4|都都古別神社~福島県~4~0~4|粟鹿神社~兵庫県~4~0~4|伊弉諾神宮~兵庫県~4~0~4|射楯兵主神社~兵庫県~4~0~4|大和大国魂神社~兵庫県~4~0~4|伊太祁曽神社~和歌山県~4~0~4|気多若宮神社~岐阜県~5~0~2|伊雑宮~三重県~5~0~2|羽黒山五重塔~山形県~2~8~0|富貴寺大堂~大分県~2~8~0|一宮神社~徳島県~5~0~2|勝興寺~富山県~2~8~0|三河国分尼寺~愛知県~3~5~0|本證寺~愛知県~3~5~0|安芸国分寺~広島県~3~5~0|福禅寺~広島県~3~5~0|讃岐国分尼寺~香川県~3~5~0|崇福寺跡~滋賀県~3~5~0|薩摩国分寺跡~鹿児島県~3~5~0|佐渡国分寺~新潟県~3~5~0|称名寺~神奈川県~3~5~0|白旗神社・法華堂跡 (源頼朝墓・北条義時墓)~神奈川県~3~5~0|浅間古墳~静岡県~3~5~0|下総国分寺~千葉県~3~5~0|上総国分寺~千葉県~3~5~0|上総国分尼寺跡~千葉県~3~5~0|豊後国分寺~大分県~3~5~0|永明寺~島根県~3~5~0|鰐淵寺~島根県~3~5~0|阿波国分尼寺跡~徳島県~3~5~0|筑前国分寺~福岡県~3~5~0|豊前国分寺~福岡県~3~5~0|伊丹廃寺跡~兵庫県~3~5~0|有珠善光寺~北海道~3~5~0|紀伊国分寺~和歌山県~3~5~0|三栖廃寺跡~和歌山県~3~5~0|總持寺祖院~石川県~4~3~0|少彦名神社~大阪府~4~3~0|笠覆寺~愛知県~6~0~0|荒子観音~愛知県~6~0~0|桃巌寺~愛知県~6~0~0|豊川稲荷~愛知県~6~0~0|観自在寺~愛媛県~6~0~0|吉祥寺~愛媛県~6~0~0|浄土寺~愛媛県~6~0~0|佛木寺~愛媛県~6~0~0|盛岡八幡宮~岩手県~6~0~0|崇福寺~岐阜県~6~0~0|竹駒神社~宮城県~6~0~0|加藤神社~熊本県~6~0~0|大慈寺~熊本県~6~0~0|八代宮~熊本県~6~0~0|千光寺~広島県~6~0~0|琴弾八幡宮~香川県~6~0~0|八栗寺~香川県~6~0~0|岩本寺~高知県~6~0~0|金剛福寺~高知県~6~0~0|最御崎寺~高知県~6~0~0|種間寺~高知県~6~0~0|神峯寺~高知県~6~0~0|清瀧寺~高知県~6~0~0|青龍寺~高知県~6~0~0|雪蹊寺~高知県~6~0~0|善楽寺~高知県~6~0~0|大日寺~高知県~6~0~0|津照寺~高知県~6~0~0|所澤神明社~埼玉県~6~0~0|鷲宮神社~埼玉県~6~0~0|二見興玉神社~三重県~6~0~0|北畠神社~三重県~6~0~0|恵林寺~山梨県~6~0~0|銭洗弁財天宇賀福神社~神奈川県~6~0~0|長寿寺~神奈川県~6~0~0|長勝寺~神奈川県~6~0~0|龍口寺~神奈川県~6~0~0|猿賀神社~青森県~6~0~0|青龍寺~青森県~6~0~0|妙立寺~石川県~6~0~0|千葉寺~千葉県~6~0~0|大福寺~千葉県~6~0~0|日本寺~千葉県~6~0~0|法華経寺~千葉県~6~0~0|万満寺~千葉県~6~0~0|葛井寺~大阪府~6~0~0|施福寺~大阪府~6~0~0|慈眼寺~大阪府~6~0~0|常光寺~大阪府~6~0~0|正圓寺~大阪府~6~0~0|全興寺~大阪府~6~0~0|太平寺~大阪府~6~0~0|難波神社~大阪府~6~0~0|難波八阪神社~大阪府~6~0~0|聖福寺~長崎県~6~0~0|王子神社~東京都~6~0~0|丸山神社~東京都~6~0~0|浄閑寺~東京都~6~0~0|水天宮~東京都~6~0~0|善養寺~東京都~6~0~0|東京十社~東京都~6~0~0|観音寺~徳島県~6~0~0|熊谷寺~徳島県~6~0~0|常楽寺~徳島県~6~0~0|切幡寺~徳島県~6~0~0|鶴林寺~徳島県~6~0~0|平等寺~徳島県~6~0~0|立江寺~徳島県~6~0~0|吉崎御坊~福井県~6~0~0|戒壇院~福岡県~6~0~0|宮地嶽神社~福岡県~6~0~0|光明禅寺~福岡県~6~0~0|南蔵院~福岡県~6~0~0|和布刈神社~福岡県~6~0~0|霊山神社~福島県~6~0~0|神呪寺~兵庫県~6~0~0|能福寺~兵庫県~6~0~0|湊川神社~兵庫県~6~0~0|葦守八幡宮~岡山県~2~7~0|五流尊瀧院~岡山県~2~7~0|真光寺~岡山県~2~7~0|誕生寺~岡山県~2~7~0|鶴山八幡宮~岡山県~2~7~0|遍照院~岡山県~2~7~0|本荘八幡宮~岡山県~2~7~0|照蓮寺~岐阜県~2~7~0|雷電神社~群馬県~2~7~0|西國寺~広島県~2~7~0|天寧寺~広島県~2~7~0|磐台寺~広島県~2~7~0|國前寺~広島県~2~7~0|大川上美良布神社~高知県~2~3~4|田嶋神社~佐賀県~2~7~0|與賀神社~佐賀県~2~7~0|来迎寺~三重県~2~7~0|大照院~山口県~2~7~0|円満院~滋賀県~2~7~0|三尾神社~滋賀県~2~7~0|慈眼堂~滋賀県~2~7~0|真宗大谷派長浜別院大通寺~滋賀県~2~7~0|聖衆来迎寺~滋賀県~2~7~0|白山神社~滋賀県~2~7~0|明王院~滋賀県~2~7~0|乙寶寺~新潟県~2~7~0|松苧神社~新潟県~2~7~0|妙宣寺~新潟県~2~7~0|覚園寺~神奈川県~2~7~0|光触寺~神奈川県~2~7~0|常楽寺~神奈川県~2~7~0|浄光明寺~神奈川県~2~7~0|真福寺~神奈川県~2~7~0|油山寺~静岡県~2~7~0|尾崎神社~石川県~2~7~0|神野寺~千葉県~2~7~0|石堂寺~千葉県~2~7~0|大聖寺~千葉県~2~7~0|飯香岡八幡宮~千葉県~2~7~0|松尾寺~長野県~2~7~0|白髯神社~長野県~2~7~0|不動院岩屋堂~鳥取県~2~7~0|鷲原八幡宮~島根県~2~7~0|円融寺~東京都~2~7~0|瑞聖寺~東京都~2~7~0|妙法寺~東京都~2~7~0|那須神社~栃木県~2~7~0|上梨白山宮~富山県~2~7~0|若狭神宮寺~福井県~2~7~0|桜井神社~福岡県~2~7~0|飯野八幡宮~福島県~2~7~0|伊居太神社~兵庫県~2~0~7|岡太神社~兵庫県~2~0~7|温泉寺~兵庫県~2~7~0|鴨神社~兵庫県~2~0~7|高売布神社~兵庫県~2~0~7|随願寺~兵庫県~2~7~0|多太神社~兵庫県~2~0~7|徳光院~兵庫県~2~7~0|柏原八幡宮~兵庫県~2~7~0|本興寺~兵庫県~2~7~0|弥勒寺~兵庫県~2~7~0|和歌浦天満宮~和歌山県~2~7~0|御器所八幡宮~愛知県~3~0~4|八剣宮~愛知県~3~0~4|羊神社~愛知県~3~0~4|安仁神社~岡山県~3~0~4|駒形神社~岩手県~3~0~4|手力雄神社~岐阜県~3~0~4|黄金山神社~宮城県~3~0~4|黄金山神社~宮城県~3~0~4|荒穂神社~佐賀県~3~0~4|金鑚神社~埼玉県~3~0~4|出雲伊波比神社~埼玉県~3~0~4|月夜見宮~三重県~3~0~4|忌宮神社~山口県~3~0~4|一宮浅間神社~山梨県~3~0~4|大井俣窪八幡神社~山梨県~3~0~4|鉛練比古神社~滋賀県~3~0~4|奥石神社~滋賀県~3~0~4|日吉大社東本宮本殿~滋賀県~1~8~2|日向大神宮~滋賀県~3~0~4|苗村神社西本殿~滋賀県~1~8~2|加紫久利神社~鹿児島県~3~0~4|伊古奈比咩命神社~静岡県~3~0~4|大野湊神社~石川県~3~0~4|高家神社~千葉県~3~0~4|姉埼神社~千葉県~3~0~4|忌部神社~徳島県~3~0~4|大塩八幡宮~福井県~3~0~4|馬場都々古別神社~福島県~3~0~4|八槻都々古別神社~福島県~3~0~4|海神社~兵庫県~3~0~4|久久比神社~兵庫県~3~0~4|志磨神社~和歌山県~3~0~4|朝椋神社~和歌山県~3~0~4|金神社~岐阜県~4~0~2|槵觸神社~宮崎県~4~0~2|古四王神社~秋田県~4~0~2|洲崎神社~千葉県~4~0~2|宇都宮二荒山神社~栃木県~4~0~2|広峯神社~兵庫県~4~0~2|間々観音~愛知県~5~0~0|興正寺~愛知県~5~0~0|甚目寺~愛知県~5~0~0|豊国神社~愛知県~5~0~0|本願寺名古屋別院~愛知県~5~0~0|国分寺~愛媛県~5~0~0|浄瑠璃寺~愛媛県~5~0~0|瑞應寺~愛媛県~5~0~0|繁多寺~愛媛県~5~0~0|宝厳寺~愛媛県~5~0~0|宝寿寺~愛媛県~5~0~0|明石寺~愛媛県~5~0~0|龍光寺~愛媛県~5~0~0|圓明寺~愛媛県~5~0~0|楽法寺~茨城県~5~0~0|常陸国分尼寺~茨城県~2~6~0|吉備津彦神社~岡山県~5~0~0|備前国総社宮~岡山県~5~0~0|沖縄神社~沖縄県~5~0~0|護国寺~沖縄県~5~0~0|尖閣神社~沖縄県~5~0~0|加納天満宮~岐阜県~5~0~0|岐阜護國神社~岐阜県~5~0~0|常在寺~岐阜県~5~0~0|瑞龍寺~岐阜県~5~0~0|正法寺~岐阜県~5~0~0|養老神社~岐阜県~5~0~0|正念寺~宮崎県~5~0~0|青島神社~宮崎県~5~0~0|高蔵寺~宮城県~5~0~0|菊池神社~熊本県~5~0~0|藤崎八旛宮~熊本県~5~0~0|北岡神社~熊本県~5~0~0|一宮寺~香川県~5~0~0|志度寺~香川県~5~0~0|長尾寺~香川県~5~0~0|曼荼羅寺~香川県~5~0~0|延光寺~高知県~5~0~0|金剛頂寺~高知県~5~0~0|千栗八幡宮~佐賀県~5~0~0|慈恩寺~埼玉県~5~0~0|氷川神社~埼玉県~5~0~0|平林寺~埼玉県~5~0~0|夏見廃寺~三重県~5~0~0|上杉神社~山形県~5~0~0|法善寺~山梨県~5~0~0|甘縄神明神社~神奈川県~5~0~0|勝福寺 (小田原市)~神奈川県~5~0~0|常立寺~神奈川県~5~0~0|長谷寺~神奈川県~5~0~0|妙法寺~神奈川県~5~0~0|伊豆国分寺~静岡県~5~0~0|井伊谷宮~静岡県~5~0~0|修禅寺~静岡県~5~0~0|豊国神社~石川県~5~0~0|一月寺~千葉県~5~0~0|笠森寺~千葉県~5~0~0|鏡忍寺~千葉県~5~0~0|高蔵寺~千葉県~5~0~0|清澄寺~千葉県~5~0~0|千葉神社~千葉県~5~0~0|誕生寺~千葉県~5~0~0|東海寺~千葉県~5~0~0|神角寺~大分県~5~0~0|両子寺~大分県~5~0~0|信濃国分寺~長野県~5~0~0|金持神社~鳥取県~5~0~0|若桜神社~鳥取県~5~0~0|白兎神社~鳥取県~5~0~0|名和神社~鳥取県~5~0~0|葛西神社~東京都~5~0~0|吉祥寺~東京都~5~0~0|井戸寺~徳島県~5~0~0|雲辺寺~徳島県~5~0~0|恩山寺~徳島県~5~0~0|国分寺~徳島県~5~0~0|焼山寺~徳島県~5~0~0|大山寺~徳島県~5~0~0|大日寺~徳島県~5~0~0|藤井寺~徳島県~5~0~0|童学寺~徳島県~5~0~0|西明寺 (益子町)~栃木県~5~0~0|大谷寺~栃木県~5~0~0|中禅寺~栃木県~5~0~0|金崎宮~福井県~5~0~0|宝慶寺~福井県~5~0~0|宇美八幡宮~福岡県~5~0~0|承天寺~福岡県~5~0~0|水天宮~福岡県~5~0~0|東長寺~福岡県~5~0~0|風浪宮~福岡県~5~0~0|勝常寺~福島県~5~0~0|上川神社~北海道~5~0~0|函館八幡宮~北海道~5~0~0|日牟禮八幡宮~滋賀県~3~3~0|松蔭寺~静岡県~3~3~0|寺町寺院群~石川県~3~3~0|高龍寺~北海道~3~3~0|備中国分尼寺~岡山県~2~5~0|弥勒寺跡~岐阜県~2~5~0|榴岡天満宮~宮城県~2~5~0|反町薬師~群馬県~2~5~0|法華寺~香川県~2~5~0|玉川寺~山形県~2~5~0|甲斐国分尼寺~山梨県~2~5~0|旧白毫院庭園~滋賀県~2~5~0|永福寺跡~神奈川県~2~5~0|相模国分尼寺~神奈川県~2~5~0|末松廃寺跡~石川県~2~5~0|下総国分尼寺~千葉県~2~5~0|岩井廃寺~鳥取県~2~5~0|出雲国分寺~島根県~2~5~0|下野国分尼寺~栃木県~2~5~0|大分廃寺~福岡県~2~5~0|天徳院~和歌山県~2~5~0|金蓮寺弥陀堂~愛知県~1~8~0|太山寺本堂~愛媛県~1~8~0|大宝寺本堂~愛媛県~1~8~0|息栖神社~茨城県~3~0~2|永保寺開山堂~岐阜県~1~8~0|永保寺観音堂~岐阜県~1~8~0|瑞巌寺本堂~宮城県~1~8~0|厳島神社摂社客神社祓殿~広島県~1~8~0|厳島神社本社祓殿~広島県~1~8~0|浄土寺本堂~広島県~1~8~0|不動院金堂~広島県~1~8~0|明王院本堂~広島県~1~8~0|本山寺本堂~香川県~1~8~0|豊楽寺薬師堂~高知県~1~8~0|専修寺御影堂~三重県~1~8~0|専修寺如来堂~三重県~1~8~0|本山専修寺~三重県~1~8~0|功山寺仏殿~山口県~1~8~0|清白寺仏殿~山梨県~1~8~0|大善寺本堂~山梨県~1~8~0|園城寺金堂~滋賀県~1~8~0|園城寺新羅善神堂~滋賀県~1~8~0|金剛輪寺本堂~滋賀県~1~8~0|常楽寺本堂~滋賀県~1~8~0|西明寺本堂~滋賀県~1~8~0|円覚寺舎利殿~神奈川県~1~8~0|久能山東照宮社殿~静岡県~1~8~0|温泉神社 (雲仙市)~長崎県~3~0~2|崇福寺大雄宝殿~長崎県~1~8~0|安楽寺八角三重塔~長野県~1~8~0|善光寺本堂~長野県~1~8~0|上一宮大粟神社~徳島県~3~0~2|八倉比売神社~徳島県~3~0~2|鑁阿寺本堂~栃木県~1~8~0|瑞龍寺仏殿~富山県~1~8~0|瑞龍寺法堂~富山県~1~8~0|明通寺本堂~福井県~1~8~0|高祖神社~福岡県~3~0~2|越木岩神社~兵庫県~3~0~2|浄土寺浄土堂~兵庫県~1~8~0|太山寺本堂~兵庫県~1~8~0|朝光寺本堂~兵庫県~1~8~0|鶴林寺太子堂~兵庫県~1~8~0|鶴林寺本堂~兵庫県~1~8~0|金剛峯寺不動堂~和歌山県~1~8~0|善福院釈迦堂~和歌山県~1~8~0|長保寺本堂~和歌山県~1~8~0|愛知縣護國神社~愛知県~4~0~0|勝鬘寺~愛知県~4~0~0|城山八幡宮~愛知県~4~0~0|誓願寺~愛知県~4~0~0|長楽寺~愛知県~4~0~0|那古野神社~愛知県~4~0~0|本光寺 (幸田町)~愛知県~4~0~0|名古屋東照宮~愛知県~4~0~0|六所神社~愛知県~4~0~0|横峰寺~愛媛県~4~0~0|香園寺~愛媛県~4~0~0|三角寺~愛媛県~4~0~0|西林寺~愛媛県~4~0~0|仙遊寺~愛媛県~4~0~0|前神寺~愛媛県~4~0~0|佐竹寺~茨城県~4~0~0|水戸東照宮~茨城県~4~0~0|正福寺~茨城県~4~0~0|清滝寺~茨城県~4~0~0|大御堂~茨城県~4~0~0|日輪寺~茨城県~4~0~0|高顕寺~岡山県~4~0~0|長福寺~岡山県~4~0~0|華厳寺~岐阜県~4~0~0|橿森神社~岐阜県~4~0~0|護国之寺~岐阜県~4~0~0|三輪神社~岐阜県~4~0~0|大龍寺~岐阜県~4~0~0|長良天神神社~岐阜県~4~0~0|濃飛護國神社~岐阜県~4~0~0|飛騨護國神社~岐阜県~4~0~0|美江寺~岐阜県~4~0~0|法華寺~岐阜県~4~0~0|本荘神社 (岐阜市)~岐阜県~4~0~0|来振寺~岐阜県~4~0~0|狭野神社~宮崎県~4~0~0|神門神社~宮崎県~4~0~0|天岩戸神社~宮崎県~4~0~0|愛宕神社~宮城県~4~0~0|西方寺~宮城県~4~0~0|健軍神社~熊本県~4~0~0|高橋稲荷神社~熊本県~4~0~0|上色見熊野座神社~熊本県~4~0~0|水澤寺~群馬県~4~0~0|達磨寺~群馬県~4~0~0|中之嶽神社~群馬県~4~0~0|長谷寺~群馬県~4~0~0|持光寺~広島県~4~0~0|郷照寺~香川県~4~0~0|金倉寺~香川県~4~0~0|甲山寺~香川県~4~0~0|根香寺~香川県~4~0~0|出釈迦寺~香川県~4~0~0|大興寺~香川県~4~0~0|天皇寺~香川県~4~0~0|弥谷寺~香川県~4~0~0|鏡神社~佐賀県~4~0~0|佐嘉神社~佐賀県~4~0~0|大興善寺 (基山町)~佐賀県~4~0~0|安楽寺~埼玉県~4~0~0|久伊豆神社~埼玉県~4~0~0|三峯神社~埼玉県~4~0~0|正法寺~埼玉県~4~0~0|伊賀国分寺跡~三重県~4~0~0|猿田彦神社~三重県~4~0~0|結城神社~三重県~4~0~0|鳥海月山両所宮~山形県~4~0~0|湯殿山神社~山形県~4~0~0|円光院~山梨県~4~0~0|景徳院~山梨県~4~0~0|甲斐国分寺~山梨県~4~0~0|山梨縣護國神社~山梨県~4~0~0|棲雲寺~山梨県~4~0~0|大泉寺~山梨県~4~0~0|長禅寺~山梨県~4~0~0|東光寺~山梨県~4~0~0|新田神社~鹿児島県~4~0~0|伊勢山皇大神宮~神奈川県~4~0~0|蕪嶋神社~青森県~4~0~0|五社神社・諏訪神社~静岡県~4~0~0|柴屋寺~静岡県~4~0~0|承元寺~静岡県~4~0~0|長楽寺~静岡県~4~0~0|方広寺~静岡県~4~0~0|龍潭寺~静岡県~4~0~0|安房国分寺~千葉県~4~0~0|小御門神社~千葉県~4~0~0|甚大寺~千葉県~4~0~0|筒森神社~千葉県~4~0~0|龍正院~千葉県~4~0~0|良玄寺~千葉県~4~0~0|真木大堂~大分県~4~0~0|長崎縣護國神社~長崎県~4~0~0|金龍寺~長野県~4~0~0|上淀廃寺跡~鳥取県~4~0~0|諏訪神社~鳥取県~4~0~0|月照寺~島根県~4~0~0|太皷谷稲成神社~島根県~4~0~0|愛染院~徳島県~4~0~0|東林院~徳島県~4~0~0|唐沢山神社~栃木県~4~0~0|満願寺~栃木県~4~0~0|日石寺~富山県~4~0~0|富山縣護國神社~富山県~4~0~0|若狭国分寺~福井県~4~0~0|藤島神社~福井県~4~0~0|萬徳寺~福井県~4~0~0|御祖神社~福岡県~4~0~0|七夕神社~福岡県~4~0~0|水田天満宮~福岡県~4~0~0|正覚寺~福岡県~4~0~0|千如寺~福岡県~4~0~0|善導寺~福岡県~4~0~0|如意輪寺~福岡県~4~0~0|福聚寺~福岡県~4~0~0|鷲尾愛宕神社~福岡県~4~0~0|姥神大神宮~北海道~4~0~0|岩見沢神社~北海道~4~0~0|上国寺~北海道~4~0~0|太田山神社~北海道~4~0~0|帯廣神社~北海道~4~0~0|樽前山神社~北海道~4~0~0|広八幡神社~和歌山県~4~0~0|浄妙寺 (有田市)~和歌山県~4~0~0|伊多波刀神社~愛知県~2~0~4|伊奴神社~愛知県~2~0~4|猿投神社~愛知県~2~0~4|高座結御子神社~愛知県~2~0~4|高牟神社~愛知県~2~0~4|桜井神社~愛知県~2~0~4|伊加奈志神社~愛媛県~2~0~4|伊予神社~愛媛県~2~0~4|伊豫豆比古命神社~愛媛県~2~0~4|村山神社~愛媛県~2~0~4|湯神社~愛媛県~2~0~4|國津比古命神社~愛媛県~2~0~4|阿祢神社~茨城県~2~0~4|阿祢神社~茨城県~2~0~4|阿波山上神社~茨城県~2~0~4|稲村神社~茨城県~2~0~4|稲田神社~茨城県~2~0~4|羽梨山神社~茨城県~2~0~4|鴨大神御子神主玉神社~茨城県~2~0~4|吉田神社~茨城県~2~0~4|桑原神社~茨城県~2~0~4|薩都神社~茨城県~2~0~4|楯縫神社~茨城県~2~0~4|静神社~茨城県~2~0~4|泉神社~茨城県~2~0~4|大井神社~茨城県~2~0~4|大井神社~茨城県~2~0~4|大国玉神社 (桜川市)~茨城県~2~0~4|長幡部神社~茨城県~2~0~4|天志良波神社~茨城県~2~0~4|藤内神社~茨城県~2~0~4|礒部稲村神社~茨城県~2~0~4|高野神社~岡山県~2~0~4|高野神社 (津山市高野本郷)~岡山県~2~0~4|国神社~岡山県~2~0~4|宗形神社~岡山県~2~0~4|石上布都魂神社~岡山県~2~0~4|足高神社~岡山県~2~0~4|天津神社~岡山県~2~0~4|日咩坂鍾乳穴神社~岡山県~2~0~4|尾治針名真若比咩神社~岡山県~2~0~4|尾針神社~岡山県~2~0~4|美和神社~岡山県~2~0~4|美和神社~岡山県~2~0~4|片山日子神社~岡山県~2~0~4|總社~岡山県~2~0~4|皷神社~岡山県~2~0~4|志賀理和気神社~岩手県~2~0~4|配志和神社~岩手県~2~0~4|阿遅加神社~岐阜県~2~0~4|茜部神社~岐阜県~2~0~4|伊波乃西神社~岐阜県~2~0~4|伊富岐神社~岐阜県~2~0~4|加佐美神社~岐阜県~2~0~4|恵那神社~岐阜県~2~0~4|御井神社~岐阜県~2~0~4|坂祝神社~岐阜県~2~0~4|坂本神社八幡宮~岐阜県~2~0~4|若江神社~岐阜県~2~0~4|村国真墨田神社~岐阜県~2~0~4|村国神社~岐阜県~2~0~4|多岐神社~岐阜県~2~0~4|大津神社 (飛騨市)~岐阜県~2~0~4|安福河伯神社~宮城県~2~0~4|伊豆佐比売神社~宮城県~2~0~4|刈田嶺神社~宮城県~2~0~4|鹿島御児神社~宮城県~2~0~4|鹿島緒名太神社~宮城県~2~0~4|鹿島天足和気神社~宮城県~2~0~4|多賀神社~宮城県~2~0~4|熱日高彦神社~宮城県~2~0~4|鼻節神社~宮城県~2~0~4|陸奥総社宮~宮城県~2~0~4|零羊崎神社~宮城県~2~0~4|零羊崎神社 (石巻市湊)~宮城県~2~0~4|国造神社~熊本県~2~0~4|伊香保神社~群馬県~2~0~4|宇芸神社~群馬県~2~0~4|火雷神社~群馬県~2~0~4|賀茂神社~群馬県~2~0~4|甲波宿禰神社~群馬県~2~0~4|甲波宿禰神社~群馬県~2~0~4|甲波宿禰神社 (渋川市行幸田)~群馬県~2~0~4|三宮神社~群馬県~2~0~4|小祝神社~群馬県~2~0~4|大國神社~群馬県~2~0~4|二宮赤城神社~群馬県~2~0~4|美和神社 (桐生市)~群馬県~2~0~4|武内神社~群馬県~2~0~4|倭文神社~群馬県~2~0~4|賀羅加波神社~広島県~2~0~4|甘南備神社~広島県~2~0~4|素盞嗚神社~広島県~2~0~4|知波夜比古神社~広島県~2~0~4|天別豊姫神社~広島県~2~0~4|粟井神社~香川県~2~0~4|鴨神社 (坂出市)~香川県~2~0~4|高屋神社~香川県~2~0~4|城山神社~香川県~2~0~4|多和神社~香川県~2~0~4|大水上神社~香川県~2~0~4|加茂神社~高知県~2~0~4|葛木男神社~高知県~2~0~4|郡頭神社~高知県~2~0~4|高知坐神社~高知県~2~0~4|朝倉神社 (高知市)~高知県~2~0~4|朝峯神社~高知県~2~0~4|天忍穂別神社~高知県~2~0~4|みか神社~埼玉県~2~0~4|伊古乃速御玉比売神社~埼玉県~2~0~4|皆野椋神社~埼玉県~2~0~4|玉敷神社~埼玉県~2~0~4|広瀬神社~埼玉県~2~0~4|今城青坂稲実池上神社~埼玉県~2~0~4|今城青坂稲実池上神社~埼玉県~2~0~4|出雲祝神社~埼玉県~2~0~4|出雲乃伊波比神社~埼玉県~2~0~4|小被神社~埼玉県~2~0~4|前玉神社~埼玉県~2~0~4|多気比売神社~埼玉県~2~0~4|中氷川神社~埼玉県~2~0~4|調神社~埼玉県~2~0~4|長幡部神社~埼玉県~2~0~4|天神社~埼玉県~2~0~4|姫宮神社~埼玉県~2~0~4|氷川女体神社~埼玉県~2~0~4|北野天神社~埼玉県~2~0~4|伊奈冨神社~三重県~2~0~4|宇治山田神社~三重県~2~0~4|加佐登神社~三重県~2~0~4|桑名宗社~三重県~2~0~4|江田神社~三重県~2~0~4|三宅神社~三重県~2~0~4|志等美神社~三重県~2~0~4|神戸神館神明社~三重県~2~0~4|多賀宮~三重県~2~0~4|大村神社~三重県~2~0~4|大土御祖神社~三重県~2~0~4|瀧原宮~三重県~2~0~4|丹生神社~三重県~2~0~4|朝熊神社~三重県~2~0~4|鳥出神社~三重県~2~0~4|能褒野神社~三重県~2~0~4|飯野高宮神山神社~三重県~2~0~4|片山神社~三重県~2~0~4|小物忌神社~山形県~2~0~4|小物忌神社~山形県~2~0~4|仁壁神社~山口県~2~0~4|石城神社~山口県~2~0~4|二所山田神社~山口県~2~0~4|劔神社~山口県~2~0~4|金櫻神社~山梨県~2~0~4|甲斐奈神社~山梨県~2~0~4|山梨岡神社~山梨県~2~0~4|山梨岡神社 (山梨市)~山梨県~2~0~4|穂見神社~山梨県~2~0~4|穂見神社 (南アルプス市)~山梨県~2~0~4|益救神社~鹿児島県~2~0~4|大穴持神社~鹿児島県~2~0~4|保呂羽山波宇志別神社~秋田県~2~0~4|白山神社~新潟県~2~0~4|白山神社~新潟県~2~0~4|斐太神社~新潟県~2~0~4|物部神社~新潟県~2~0~4|阿波々神社~静岡県~2~0~4|伊河麻神社~静岡県~2~0~4|引手力命神社~静岡県~2~0~4|雨櫻神社~静岡県~2~0~4|雲見浅間神社~静岡県~2~0~4|久佐奈岐神社~静岡県~2~0~4|敬満神社~静岡県~2~0~4|広瀬神社~静岡県~2~0~4|鹿苑神社~静岡県~2~0~4|守山八幡宮~静岡県~2~0~4|杉桙別命神社~静岡県~2~0~4|石室神社~静岡県~2~0~4|浅間神社~静岡県~2~0~4|草薙神社~静岡県~2~0~4|多賀神社 (熱海市)~静岡県~2~0~4|伊須流岐比古神社~石川県~2~0~4|羽咋神社~石川県~2~0~4|賀茂神社 (かほく市)~石川県~2~0~4|気多本宮~石川県~2~0~4|狭野神社~石川県~2~0~4|重蔵神社~石川県~2~0~4|須須神社~石川県~2~0~4|石浦神社~石川県~2~0~4|石部神社~石川県~2~0~4|下立松原神社~千葉県~2~0~4|寒川神社~千葉県~2~0~4|橘樹神社 (茂原市)~千葉県~2~0~4|島穴神社~千葉県~2~0~4|二宮神社~千葉県~2~0~4|飽富神社~千葉県~2~0~4|麻賀多神社~千葉県~2~0~4|宇奈岐日女神社~大分県~2~0~4|火男火売神社~大分県~2~0~4|早吸日女神社~大分県~2~0~4|月讀神社~長崎県~2~0~4|志々伎神社~長崎県~2~0~4|聖母宮~長崎県~2~0~4|多久頭魂神社~長崎県~2~0~4|太祝詞神社~長崎県~2~0~4|安布知神社~長野県~2~0~4|佐良志奈神社~長野県~2~0~4|沙田神社~長野県~2~0~4|坂城神社~長野県~2~0~4|川会神社~長野県~2~0~4|大山田神社~長野県~2~0~4|長倉神社~長野県~2~0~4|飯縄神社~長野県~2~0~4|武水別神社~長野県~2~0~4|意非神社~鳥取県~2~0~4|岩井温泉~鳥取県~2~0~4|波波伎神社~鳥取県~2~0~4|宇受賀命神社~島根県~2~0~4|玉作湯神社~島根県~2~0~4|神原神社~島根県~2~0~4|天佐志比古命神社~島根県~2~0~4|揖夜神社~島根県~2~0~4|六所神社~島根県~2~0~4|建布都神社~徳島県~2~0~4|大御和神社~徳島県~2~0~4|朝立彦神社~徳島県~2~0~4|津峯神社~徳島県~2~0~4|倭大国魂神社~徳島県~2~0~4|三和神社~栃木県~2~0~4|村檜神社~栃木県~2~0~4|太平山神社~栃木県~2~0~4|大神神社 (栃木市)~栃木県~2~0~4|那須温泉神社~栃木県~2~0~4|二荒山神社~栃木県~2~0~4|鵜坂神社~富山県~2~0~4|櫛田神社 (射水市)~富山県~2~0~4|高岡関野神社~富山県~2~0~4|姉倉比売神社~富山県~2~0~4|二上射水神社~富山県~2~0~4|櫟原神社~富山県~2~0~4|三國神社~福井県~2~0~4|足羽神社~福井県~2~0~4|織幡神社~福岡県~2~0~4|筑紫神社~福岡県~2~0~4|隠津島神社~福島県~2~0~4|宇奈己呂和気神社~福島県~2~0~4|温泉神社~福島県~2~0~4|蒲原神社~福島県~2~0~4|冠嶺神社~福島県~2~0~4|御刀神社~福島県~2~0~4|高座神社~福島県~2~0~4|蚕養国神社~福島県~2~0~4|鹿島御子神社~福島県~2~0~4|石都々古和気神社~福島県~2~0~4|多珂神社~福島県~2~0~4|二俣神社~福島県~2~0~4|桙衝神社~福島県~2~0~4|苕野神社~福島県~2~0~4|伊達神社~和歌山県~2~0~4|荒田神社~和歌山県~2~0~4|刺田比古神社~和歌山県~2~0~4|須佐神社 (有田市)~和歌山県~2~0~4|静火神社~和歌山県~2~0~4|大屋都姫神社~和歌山県~2~0~4|鳴神社~和歌山県~2~0~4|如法寺 (大洲市)~愛媛県~1~7~0|中尊寺金色堂 旧覆堂~岩手県~1~7~0|長楽寺~群馬県~1~7~0|常称寺~広島県~1~7~0|西郷寺~広島県~1~7~0|観菩提寺~三重県~1~7~0|西願寺~千葉県~1~7~0|鳳来寺~千葉県~1~7~0|浄光寺~長野県~1~7~0|定勝寺~長野県~1~7~0|円通寺~栃木県~1~7~0|会津さざえ堂~福島県~1~7~0|高積神社~和歌山県~1~0~7|鞆淵八幡神社~和歌山県~1~7~0|大御神社~宮崎県~2~3~0|正法寺~新潟県~2~3~0|蒼柴神社~新潟県~2~3~0|卯辰山山麓寺院群~石川県~2~3~0|金沢神社~石川県~2~3~0|宝円寺~石川県~2~3~0|亀岡神社~長崎県~2~3~0|恵明寺~長野県~2~3~0|象山神社~長野県~2~3~0|興禅寺~鳥取県~2~3~0|伊豫稲荷神社~愛媛県~3~0~0|栄福寺~愛媛県~3~0~0|延命寺~愛媛県~3~0~0|王至森寺~愛媛県~3~0~0|久米官衙遺跡群~愛媛県~3~0~0|極楽寺~愛媛県~3~0~0|高昌寺~愛媛県~3~0~0|石鎚神社~愛媛県~3~0~0|泰山寺~愛媛県~3~0~0|大寶寺~愛媛県~3~0~0|東雲神社~愛媛県~3~0~0|南光坊~愛媛県~3~0~0|一言主神社~茨城県~3~0~0|下館羽黒神社~茨城県~3~0~0|金村別雷神社~茨城県~3~0~0|常陸國總社宮~茨城県~3~0~0|大杉神社~茨城県~3~0~0|蔭涼寺~岡山県~3~0~0|岡山寺~岡山県~3~0~0|岡山神社~岡山県~3~0~0|国清寺~岡山県~3~0~0|最上稲荷~岡山県~3~0~0|作楽神社~岡山県~3~0~0|正楽寺~岡山県~3~0~0|西大寺~岡山県~3~0~0|大多羅寄宮~岡山県~3~0~0|幡多廃寺塔跡~岡山県~3~0~0|備前国分寺跡~岡山県~3~0~0|美作国分寺~岡山県~3~0~0|餘慶寺~岡山県~3~0~0|沖宮~沖縄県~3~0~0|金武宮~沖縄県~3~0~0|識名宮~沖縄県~3~0~0|天久宮~沖縄県~3~0~0|普天満宮~沖縄県~3~0~0|桜山神社~岩手県~3~0~0|正法寺~岩手県~3~0~0|報恩寺~岩手県~3~0~0|巨田神社~宮崎県~3~0~0|神柱宮~宮崎県~3~0~0|生目神社~宮崎県~3~0~0|川南護国神社~宮崎県~3~0~0|日向国分寺跡~宮崎県~3~0~0|塩流神社~宮城県~3~0~0|下増田神社~宮城県~3~0~0|宮城縣護國神社~宮城県~3~0~0|二柱神社~宮城県~3~0~0|輪王寺~宮城県~3~0~0|熊本県護国神社~熊本県~3~0~0|出水神社~熊本県~3~0~0|蓮華院誕生寺~熊本県~3~0~0|上野国分寺跡~群馬県~3~0~0|満徳寺~群馬県~3~0~0|宮の前廃寺跡~広島県~3~0~0|広島東照宮~広島県~3~0~0|艮神社~広島県~3~0~0|寺町廃寺跡~広島県~3~0~0|白神社~広島県~3~0~0|福山八幡宮~広島県~3~0~0|観音寺~香川県~3~0~0|松尾寺~香川県~3~0~0|神恵院~香川県~3~0~0|道隆寺~香川県~3~0~0|峰悧冨神社~香川県~3~0~0|木烏神社~香川県~3~0~0|伊都多神社~高知県~3~0~0|山内神社~高知県~3~0~0|大善寺~高知県~3~0~0|比江廃寺跡~高知県~3~0~0|不破八幡宮~高知県~3~0~0|鳴無神社~高知県~3~0~0|高伝寺~佐賀県~3~0~0|唐津神社~佐賀県~3~0~0|三芳野神社~埼玉県~3~0~0|聖天院~埼玉県~3~0~0|中院~埼玉県~3~0~0|天龍寺~埼玉県~3~0~0|東明寺~埼玉県~3~0~0|鳩峯八幡神社~埼玉県~3~0~0|不動寺~埼玉県~3~0~0|蓮馨寺~埼玉県~3~0~0|伊勢国分寺跡~三重県~3~0~0|志摩国分寺~三重県~3~0~0|樹敬寺~三重県~3~0~0|金峯神社 (鶴岡市)~山形県~3~0~0|慈恩寺~山形県~3~0~0|鳥越八幡神社~山形県~3~0~0|總光寺~山形県~3~0~0|亀山八幡宮~山口県~3~0~0|元乃隅神社~山口県~3~0~0|常栄寺~山口県~3~0~0|豊榮神社・野田神社~山口県~3~0~0|義光山矢の堂~山梨県~3~0~0|甲府五山~山梨県~3~0~0|能成寺~山梨県~3~0~0|法泉寺~山梨県~3~0~0|大隅国分寺跡~鹿児島県~3~0~0|南洲神社~鹿児島県~3~0~0|天徳寺~秋田県~3~0~0|弘前東照宮~青森県~3~0~0|高山稲荷神社~青森県~3~0~0|高照神社~青森県~3~0~0|最勝院~青森県~3~0~0|菩提寺~青森県~3~0~0|龗神社~青森県~3~0~0|宇多須神社~石川県~3~0~0|久保市乙剣宮~石川県~3~0~0|観福寺~千葉県~3~0~0|亀井院~千葉県~3~0~0|鶴峯八幡神社~千葉県~3~0~0|登渡神社~千葉県~3~0~0|壱岐神社~長崎県~3~0~0|観音寺~長崎県~3~0~0|御橋観音寺~長崎県~3~0~0|小茂田浜神社~長崎県~3~0~0|福石観音~長崎県~3~0~0|万松院~長崎県~3~0~0|霊丘神社~長崎県~3~0~0|遠照寺~長野県~3~0~0|温泉寺~長野県~3~0~0|興禅寺~長野県~3~0~0|若一王子神社~長野県~3~0~0|長国寺~長野県~3~0~0|因幡国分寺~鳥取県~3~0~0|大御堂廃寺跡~鳥取県~3~0~0|伯耆国分寺跡~鳥取県~3~0~0|医光寺~島根県~3~0~0|一畑寺~島根県~3~0~0|松江護國神社~島根県~3~0~0|須我神社~島根県~3~0~0|千手院~島根県~3~0~0|濱田護國神社~島根県~3~0~0|萬福寺~島根県~3~0~0|金長神社~徳島県~3~0~0|郡里廃寺跡~徳島県~3~0~0|下野国分寺~栃木県~3~0~0|織姫神社~栃木県~3~0~0|星宮神社 (佐野市)~栃木県~3~0~0|惣宗寺~栃木県~3~0~0|西福寺~福井県~3~0~0|福井神社~福井県~3~0~0|興宗寺~福岡県~3~0~0|光雲神社~福岡県~3~0~0|春日神社~福岡県~3~0~0|勝立寺~福岡県~3~0~0|世界平和パゴダ~福岡県~3~0~0|成田山久留米分院~福岡県~3~0~0|淡島神社~福岡県~3~0~0|江別神社~北海道~3~0~0|札幌護国神社~北海道~3~0~0|正行寺~北海道~3~0~0|西野神社~北海道~3~0~0|白老八幡神社~北海道~3~0~0|北海道護國神社~北海道~3~0~0|北門神社~北海道~3~0~0|龍雲院~北海道~3~0~0|萬念寺~北海道~3~0~0|隅田八幡神社~和歌山県~3~0~0|神倉神社~和歌山県~3~0~0|切目王子~和歌山県~3~0~0|藤白神社~和歌山県~3~0~0|加波山神社~茨城県~2~0~2|茂侶神社~茨城県~2~0~2|茂侶神社~茨城県~2~0~2|菅生神社~岡山県~2~0~2|若伊香保神社~群馬県~2~0~2|赤城神社~群馬県~2~0~2|赤城神社~群馬県~2~0~2|宇夫階神社~香川県~2~0~2|稲佐神社~佐賀県~2~0~2|龍造寺八幡宮~佐賀県~2~2~0|河輪神社~埼玉県~2~0~2|高城神社~埼玉県~2~0~2|阿射加神社~三重県~2~0~2|城輪神社~山形県~2~0~2|美和神社 (笛吹市)~山梨県~2~0~2|道隆寺~鹿児島県~2~2~0|松巌寺~長野県~2~2~0|西照神社~徳島県~2~0~2|加蘇山神社~栃木県~2~0~2|荒橿神社~栃木県~2~0~2|若狭姫神社~福井県~2~0~2|常宮神社~福井県~2~0~2|玉津島神社~和歌山県~2~0~2|池辺寺跡~熊本県~1~5~0|大原廃寺塔跡~鳥取県~1~5~0|土師百井廃寺跡~鳥取県~1~5~0|阿沼美神社~愛媛県~1~0~4|伊予豆比子命神社~愛媛県~1~0~4|阿弥神社~茨城県~1~0~4|愛宕神社~茨城県~1~0~4|稲村神社~茨城県~1~0~4|近津神社~茨城県~1~0~4|伊勢神社~岡山県~1~0~4|横田神社 (総社市)~岡山県~1~0~4|大神神社~岡山県~1~0~4|東霧島神社~宮崎県~1~0~4|霧島岑神社~宮崎県~1~0~4|伊去波夜和気命神社~宮城県~1~0~4|伊達神社~宮城県~1~0~4|刈田嶺神社~宮城県~1~0~4|行神社~宮城県~1~0~4|佐倍乃神社~宮城県~1~0~4|鹿島伊都乃比気神社~宮城県~1~0~4|鹿島緒名太神社~宮城県~1~0~4|石神山精神社~宮城県~1~0~4|多賀神社~宮城県~1~0~4|大高山神社~宮城県~1~0~4|零羊埼神社~宮城県~1~0~4|阿蘇比咩神社~熊本県~1~0~4|疋野神社~熊本県~1~0~4|伊加保神社~群馬県~1~0~4|甲波宿祢神社~群馬県~1~0~4|赤城神社~群馬県~1~0~4|神野神社 (まんのう町)~香川県~1~0~4|水主神社~香川県~1~0~4|西鴨神社~香川県~1~0~4|東鴨神社~香川県~1~0~4|白山神社~香川県~1~0~4|飯神社~香川県~1~0~4|和爾賀波神社~香川県~1~0~4|鰐河神社~香川県~1~0~4|小野神社~高知県~1~0~4|豊岡上天神社~高知県~1~0~4|阿保神社~埼玉県~1~0~4|今城青八坂稲実池上神社~埼玉県~1~0~4|月山神社~山形県~1~0~4|出羽神社(三神合祭殿)~山形県~1~0~4|小物忌神社~山形県~1~0~4|由豆佐売神社~山形県~1~0~4|宇波刀神社~山梨県~1~0~4|宇波刀神社~山梨県~1~0~4|玉諸神社~山梨県~1~0~4|山梨岡神社~山梨県~1~0~4|神部神社~山梨県~1~0~4|浅間神社~山梨県~1~0~4|倭文神社~山梨県~1~0~4|宮浦宮~鹿児島県~1~0~4|塩湯彦神社~秋田県~1~0~4|副川神社~秋田県~1~0~4|嶽六所神社~秋田県~1~0~4|伊米神社八幡宮~新潟県~1~0~4|関山神社~新潟県~1~0~4|魚沼神社~新潟県~1~0~4|三島神社~新潟県~1~0~4|石井神社 (出雲崎町)~新潟県~1~0~4|石船神社~新潟県~1~0~4|川合神社 (長岡市)~新潟県~1~0~4|大形神社~新潟県~1~0~4|能生白山神社~新潟県~1~0~4|明口神社~新潟県~1~0~4|穴水大宮~石川県~1~0~4|建石勝神社~石川県~1~0~4|三輪神社~石川県~1~0~4|出水神社~石川県~1~0~4|須須神社 奥宮~石川県~1~0~4|瀧浪神社~石川県~1~0~4|菟橋神社~石川県~1~0~4|波自加弥神社~石川県~1~0~4|火男火売神社下宮（鶴見権現）~大分県~1~0~4|健男霜凝日子神社~大分県~1~0~4|阿麻氐留神社~長崎県~1~0~4|胡簶神社~長崎県~1~0~4|天手長男神社~長崎県~1~0~4|天手長比売神社跡~長崎県~1~0~4|天神多久頭魂神社~長崎県~1~0~4|和多都美御子神社~長崎県~1~0~4|和多都美御子神社~長崎県~1~0~4|和多都美神社~長崎県~1~0~4|和多都美神社~長崎県~1~0~4|阿智神社~長野県~1~0~4|阿禮神社~長野県~1~0~4|岡田神社~長野県~1~0~4|健御名方富命彦神別神社~長野県~1~0~4|健御名方富命彦神別神社~長野県~1~0~4|皇足穂吉田大御神宮~長野県~1~0~4|妻科神社~長野県~1~0~4|守田迺神社~長野県~1~0~4|小川神社~長野県~1~0~4|大伴神社~長野県~1~0~4|長谷寺~長野県~1~0~4|美和神社~長野県~1~0~4|氷鉋斗賣神社~長野県~1~0~4|布制神社~長野県~1~0~4|風間神社~長野県~1~0~4|大神山神社 奥宮~鳥取県~1~0~4|天穂日命神社~鳥取県~1~0~4|二上山~鳥取県~1~0~4|倭文神社~鳥取県~1~0~4|伊甘神社~島根県~1~0~4|伊勢命神社~島根県~1~0~4|加賀神社 (松江市)~島根県~1~0~4|賀茂那備神社~島根県~1~0~4|海神社 (西ノ島町)~島根県~1~0~4|苅田神社~島根県~1~0~4|忌部神社 (松江市)~島根県~1~0~4|櫛代賀姫神社~島根県~1~0~4|御井神社 (斐川町)~島根県~1~0~4|佐久佐神社~島根県~1~0~4|佐香神社~島根県~1~0~4|佐毘売山神社~島根県~1~0~4|坐波夜都武自和気神社~島根県~1~0~4|山辺神宮~島根県~1~0~4|真名井神社~島根県~1~0~4|伊加加志神社~徳島県~1~0~4|伊笠神社~徳島県~1~0~4|伊射奈美神社~徳島県~1~0~4|伊射奈美神社~徳島県~1~0~4|宇志比古神社~徳島県~1~0~4|宇母理比古神社~徳島県~1~0~4|羽浦神社~徳島県~1~0~4|安房神社~栃木県~1~0~4|胸形神社~栃木県~1~0~4|健武山神社~栃木県~1~0~4|荒樫神社~栃木県~1~0~4|大神神社 （大神社）~栃木県~1~0~4|二荒山神社 奥宮~栃木県~1~0~4|二荒山神社中宮祠~栃木県~1~0~4|杉原神社~富山県~1~0~4|浅井神社~富山県~1~0~4|浅井神社 (高岡市福岡町赤丸)~富山県~1~0~4|速星神社~富山県~1~0~4|多久比禮志神社~富山県~1~0~4|白鳥神社 (富山市)~富山県~1~0~4|八心大市比古神社~富山県~1~0~4|比賣神社~富山県~1~0~4|比賣神社~富山県~1~0~4|雄山神社前立社壇~富山県~1~0~4|雄山神社中宮祈願殿~富山県~1~0~4|雄山神社峰本社~富山県~1~0~4|雄神神社~富山県~1~0~4|林神社~富山県~1~0~4|宇波西神社~福井県~1~0~4|篠座神社~福井県~1~0~4|大虫神社~福井県~1~0~4|天国津比咩神社 （天國津比咩神社）~福井県~1~0~4|天国津彦神社~福井県~1~0~4|天八百万比咩神社 （天八百萬比咩神社）~福井県~1~0~4|日野神社 (越前市)~福井県~1~0~4|白山神社 (福井市)~福井県~1~0~4|飯部磐座神社~福井県~1~0~4|國神神社~福井県~1~0~4|安達太良神社~福島県~1~0~4|伊波止和気神社~福島県~1~0~4|隠津島神社~福島県~1~0~4|隠津島神社~福島県~1~0~4|永倉神社~福島県~1~0~4|五十嵐神社~福島県~1~0~4|黒沼神社~福島県~1~0~4|佐麻久嶺神社~福島県~1~0~4|子鍬倉神社~福島県~1~0~4|子眉嶺神社~福島県~1~0~4|青海神社~福島県~1~0~4|大國魂神社~福島県~1~0~4|東屋沼神社~福島県~1~0~4|磐椅神社~福島県~1~0~4|沖縄県護国神社~沖縄県~2~0~0|喜宝院~沖縄県~2~0~0|宮古神社~沖縄県~2~0~0|金武観音寺~沖縄県~2~0~0|石垣宝来宝来神社~沖縄県~2~0~0|袋中寺~沖縄県~2~0~0|大東神社~沖縄県~2~0~0|天王寺 (那覇市)~沖縄県~2~0~0|天界寺~沖縄県~2~0~0|一関八幡神社~岩手県~2~0~0|卯子酉様~岩手県~2~0~0|雲際寺~岩手県~2~0~0|横山八幡宮~岩手県~2~0~0|願成寺~岩手県~2~0~0|鬼越蒼前神社~岩手県~2~0~0|吉祥寺 (盛岡市)~岩手県~2~0~0|極楽寺~岩手県~2~0~0|光明寺~岩手県~2~0~0|黒石寺~岩手県~2~0~0|榊山稲荷神社~岩手県~2~0~0|三ツ石神社~岩手県~2~0~0|志和稲荷神社~岩手県~2~0~0|鹿島神社~岩手県~2~0~0|室根神社~岩手県~2~0~0|祥雲寺~岩手県~2~0~0|常堅寺~岩手県~2~0~0|聖寿寺 (盛岡市)~岩手県~2~0~0|千養寺~岩手県~2~0~0|大慈寺~岩手県~2~0~0|大念寺~岩手県~2~0~0|長者ヶ原廃寺跡~岩手県~2~0~0|東川院~岩手県~2~0~0|徳楽寺~岩手県~2~0~0|南部神社 (遠野市)~岩手県~2~0~0|日高神社~岩手県~2~0~0|白山神社 (平泉町)~岩手県~2~0~0|八幡神社~岩手県~2~0~0|普門寺~岩手県~2~0~0|福泉寺~岩手県~2~0~0|宮崎縣護國神社~宮崎県~2~0~0|宮水神社~宮崎県~2~0~0|串間神社~宮崎県~2~0~0|今山大師寺~宮崎県~2~0~0|昌竜寺~宮崎県~2~0~0|成願寺~宮崎県~2~0~0|椎葉厳島神社~宮崎県~2~0~0|日向国分尼寺~宮崎県~2~0~0|霧島東神社~宮崎県~2~0~0|医王寺~宮城県~2~0~0|横山不動尊~宮城県~2~0~0|賀茂神社 (仙台市)~宮城県~2~0~0|刈田嶺神社~宮城県~2~0~0|医王寺~熊本県~2~0~0|雲巌禅寺~熊本県~2~0~0|永尾神社~熊本県~2~0~0|塩屋八幡宮~熊本県~2~0~0|熊本城稲荷神社~熊本県~2~0~0|熊本大神宮~熊本県~2~0~0|郡浦神社~熊本県~2~0~0|甲佐神社~熊本県~2~0~0|甲斐神社~熊本県~2~0~0|釈迦院~熊本県~2~0~0|小国両神社~熊本県~2~0~0|松井神社~熊本県~2~0~0|西岸寺 (熊本市)~熊本県~2~0~0|西巌殿寺~熊本県~2~0~0|大宮神社 (山鹿市)~熊本県~2~0~0|八代神社~熊本県~2~0~0|幣立神社~熊本県~2~0~0|本渡諏訪神社~熊本県~2~0~0|満願寺~熊本県~2~0~0|六殿神社~熊本県~2~0~0|廣福寺~熊本県~2~0~0|お茶のおばあさん~群馬県~2~0~0|愛宕神社~群馬県~2~0~0|愛宕神社~群馬県~2~0~0|愛宕神社~群馬県~2~0~0|愛宕神社 (館林市高根町)~群馬県~2~0~0|伊勢崎神社~群馬県~2~0~0|医光寺~群馬県~2~0~0|稲荷神社~群馬県~2~0~0|稲荷神社~群馬県~2~0~0|稲荷神社~群馬県~2~0~0|雲龍寺 (館林市)~群馬県~2~0~0|永明寺~群馬県~2~0~0|応声寺~群馬県~2~0~0|恩林寺~群馬県~2~0~0|迦葉山龍華院~群馬県~2~0~0|覚応寺~群馬県~2~0~0|円福寺~広島県~2~0~0|横見廃寺跡~広島県~2~0~0|岡崎神社~広島県~2~0~0|亀山神社~広島県~2~0~0|金蓮寺~広島県~2~0~0|賢忠寺~広島県~2~0~0|御建神社~広島県~2~0~0|御山神社~広島県~2~0~0|御袖天満宮~広島県~2~0~0|伊吹八幡神社 (観音寺市)~香川県~2~0~0|華下天満宮~香川県~2~0~0|海岸寺~香川県~2~0~0|安楽寺~高知県~2~0~0|一條神社~高知県~2~0~0|観音寺 (須崎市)~高知県~2~0~0|久礼八幡宮~高知県~2~0~0|吸江寺~高知県~2~0~0|極楽寺 (高知市)~高知県~2~0~0|琴平神社 (土佐市)~高知県~2~0~0|月山神社~高知県~2~0~0|御厨人窟~高知県~2~0~0|御田八幡宮~高知県~2~0~0|甲殿住吉神社~高知県~2~0~0|高岡神社 (四万十町)~高知県~2~0~0|高知縣護國神社~高知県~2~0~0|高野寺~高知県~2~0~0|綾部神社~佐賀県~2~0~0|安福寺~佐賀県~2~0~0|牛嶋天満宮~佐賀県~2~0~0|光勝寺~佐賀県~2~0~0|佐賀縣護國神社~佐賀県~2~0~0|浄満寺~佐賀県~2~0~0|新北神社~佐賀県~2~0~0|仁比山神社~佐賀県~2~0~0|諏訪神社~佐賀県~2~0~0|須賀神社~佐賀県~2~0~0|専称寺 (多久市)~佐賀県~2~0~0|大魚神社~佐賀県~2~0~0|瀧光徳寺~佐賀県~2~0~0|男女神社~佐賀県~2~0~0|肥前国分寺跡~佐賀県~2~0~0|肥前国分尼寺~佐賀県~2~0~0|武雄神社~佐賀県~2~0~0|宝当神社~佐賀県~2~0~0|本福寺 (基山町)~佐賀県~2~0~0|烏帽子山八幡宮~山形県~2~0~0|寒河江八幡宮~山形県~2~0~0|岩根沢三山神社~山形県~2~0~0|犬の宮・猫の宮~山形県~2~0~0|笹野観音堂~山形県~2~0~0|山形県護国神社~山形県~2~0~0|若松寺~山形県~2~0~0|春日神社~山形県~2~0~0|松岬神社~山形県~2~0~0|専称寺~山形県~2~0~0|善寳寺~山形県~2~0~0|荘内神社~山形県~2~0~0|蔵王山神社~山形県~2~0~0|谷地八幡宮~山形県~2~0~0|白子神社 (米沢市)~山形県~2~0~0|北舘神社~山形県~2~0~0|林泉寺~山形県~2~0~0|阿弥陀寺~山口県~2~0~0|引接寺~山口県~2~0~0|円政寺~山口県~2~0~0|漢陽寺~山口県~2~0~0|吉香神社~山口県~2~0~0|琴崎八幡宮~山口県~2~0~0|古熊神社~山口県~2~0~0|今八幡宮~山口県~2~0~0|佐波神社~山口県~2~0~0|山口県護国神社~山口県~2~0~0|山口大神宮~山口県~2~0~0|志都岐山神社~山口県~2~0~0|笑山寺~山口県~2~0~0|神功皇后神社~山口県~2~0~0|菅原神社 (柳井市)~山口県~2~0~0|大歳神社~山口県~2~0~0|大寧寺~山口県~2~0~0|大連神社~山口県~2~0~0|中山神社~山口県~2~0~0|乃木神社~山口県~2~0~0|彦島八幡宮~山口県~2~0~0|麻羅観音~山口県~2~0~0|木戸神社~山口県~2~0~0|龍蔵寺~山口県~2~0~0|龍福寺 (山口市)~山口県~2~0~0|櫻山神社~山口県~2~0~0|安楽寺~山梨県~2~0~0|雲峰寺~山梨県~2~0~0|永昌院~山梨県~2~0~0|熊野神社~山梨県~2~0~0|軍刀利神社~山梨県~2~0~0|鵜戸神社~鹿児島県~2~0~0|花尾神社~鹿児島県~2~0~0|蒲生八幡神社~鹿児島県~2~0~0|鬼丸神社~鹿児島県~2~0~0|玉山神社~鹿児島県~2~0~0|郡山八幡神社~鹿児島県~2~0~0|広済寺~鹿児島県~2~0~0|荒田八幡宮~鹿児島県~2~0~0|四十九所神社~鹿児島県~2~0~0|鹿児島県護国神社~鹿児島県~2~0~0|射楯兵主神社~鹿児島県~2~0~0|松原神社~鹿児島県~2~0~0|浄光明寺~鹿児島県~2~0~0|菅原神社~鹿児島県~2~0~0|西福寺~鹿児島県~2~0~0|泰平寺~鹿児島県~2~0~0|大慈寺~鹿児島県~2~0~0|竹屋神社~鹿児島県~2~0~0|竹田神社~鹿児島県~2~0~0|中島常楽院~鹿児島県~2~0~0|鶴嶺神社~鹿児島県~2~0~0|徳重神社~鹿児島県~2~0~0|箱崎八幡神社~鹿児島県~2~0~0|八幡神社~鹿児島県~2~0~0|蛭児神社~鹿児島県~2~0~0|腹五社神社~鹿児島県~2~0~0|平松神社~鹿児島県~2~0~0|宝光院~鹿児島県~2~0~0|豊玉姫神社~鹿児島県~2~0~0|本願寺鹿児島別院~鹿児島県~2~0~0|妙円寺~鹿児島県~2~0~0|剱神社~鹿児島県~2~0~0|醫師神社~鹿児島県~2~0~0|漢槎宮~秋田県~2~0~0|金峰神社 (にかほ市)~秋田県~2~0~0|古四王神社~秋田県~2~0~0|御座石神社~秋田県~2~0~0|高岩神社~秋田県~2~0~0|秋田県護国神社~秋田県~2~0~0|秋田諏訪宮~秋田県~2~0~0|十三騎神社~秋田県~2~0~0|真山神社~秋田県~2~0~0|水神社~秋田県~2~0~0|赤神神社~秋田県~2~0~0|多宝院~秋田県~2~0~0|太平山三吉神社~秋田県~2~0~0|大日霊貴神社~秋田県~2~0~0|大龍寺~秋田県~2~0~0|長谷寺~秋田県~2~0~0|綴子神社~秋田県~2~0~0|天照皇御祖神社~秋田県~2~0~0|天寧寺~秋田県~2~0~0|土崎神明社~秋田県~2~0~0|唐松神社~秋田県~2~0~0|日吉八幡神社~秋田県~2~0~0|八幡秋田神社~秋田県~2~0~0|抱返神社~秋田県~2~0~0|与次郎稲荷神社~秋田県~2~0~0|老犬神社~秋田県~2~0~0|彌高神社~秋田県~2~0~0|蚶満寺~秋田県~2~0~0|安禅寺~新潟県~2~0~0|威徳寺~新潟県~2~0~0|雲洞庵~新潟県~2~0~0|栄涼寺~新潟県~2~0~0|角田山妙光寺~新潟県~2~0~0|金峯神社 (長岡市)~新潟県~2~0~0|五智国分寺~新潟県~2~0~0|根本寺~新潟県~2~0~0|常安寺 (長岡市)~新潟県~2~0~0|浄善寺~新潟県~2~0~0|浄念寺~新潟県~2~0~0|新潟縣護國神社~新潟県~2~0~0|清龍寺~新潟県~2~0~0|西永寺 (新潟市南区)~新潟県~2~0~0|長恩寺~新潟県~2~0~0|藤基神社~新潟県~2~0~0|日吉神社~新潟県~2~0~0|平潟神社~新潟県~2~0~0|平等寺 (阿賀町)~新潟県~2~0~0|宝徳山稲荷大社~新潟県~2~0~0|法福寺 (長岡市)~新潟県~2~0~0|妙照寺~新潟県~2~0~0|明静院~新潟県~2~0~0|円通寺~青森県~2~0~0|円覺寺~青森県~2~0~0|黒石神社~青森県~2~0~0|十和田神社~青森県~2~0~0|青森県護国神社~青森県~2~0~0|善知鳥神社~青森県~2~0~0|大円寺~青森県~2~0~0|長者山新羅神社~青森県~2~0~0|長勝寺~青森県~2~0~0|八幡宮~青森県~2~0~0|法光寺~青森県~2~0~0|蓮華寺~青森県~2~0~0|阿岸本誓寺~石川県~2~0~0|羽黒神社~石川県~2~0~0|永光寺~石川県~2~0~0|興徳寺~石川県~2~0~0|金剱宮~石川県~2~0~0|倶利迦羅不動寺~石川県~2~0~0|慶覚寺~石川県~2~0~0|江沼神社~石川県~2~0~0|高皇産霊神社~石川県~2~0~0|春日神社~石川県~2~0~0|小松天満宮~石川県~2~0~0|小立野寺院群~石川県~2~0~0|松岡寺~石川県~2~0~0|石川護国神社~石川県~2~0~0|安国寺~大分県~2~0~0|臼杵八坂神社~大分県~2~0~0|岳林寺~大分県~2~0~0|丸山神社~大分県~2~0~0|岩戸寺 (国東市)~大分県~2~0~0|犬丸天満宮~大分県~2~0~0|護保寺~大分県~2~0~0|広瀬神社 (竹田市)~大分県~2~0~0|春日神社~大分県~2~0~0|大原八幡宮~大分県~2~0~0|大分縣護國神社~大分県~2~0~0|中津大神宮~大分県~2~0~0|鉄道神社~大分県~2~0~0|日出若宮八幡神社~大分県~2~0~0|白鬚田原神社~大分県~2~0~0|八阪神社~大分県~2~0~0|八幡朝見神社~大分県~2~0~0|文殊仙寺~大分県~2~0~0|法鏡寺廃寺跡~大分県~2~0~0|万寿寺~大分県~2~0~0|龍原寺~大分県~2~0~0|安国寺~長崎県~2~0~0|壱岐国分寺~長崎県~2~0~0|榎津神社~長崎県~2~0~0|塩釜神社~長崎県~2~0~0|塩竈神社 (新上五島町)~長崎県~2~0~0|沖ノ神島神社~長崎県~2~0~0|乙宮神社 (新上五島町小河原郷)~長崎県~2~0~0|乙宮神社 (新上五島町立串郷)~長崎県~2~0~0|海童神社 (新上五島町)~長崎県~2~0~0|間伏神社~長崎県~2~0~0|丸尾神社~長崎県~2~0~0|亀山八幡宮~長崎県~2~0~0|橘神社 (雲仙市)~長崎県~2~0~0|粟島神社 (米子市)~鳥取県~2~0~0|河野神社~鳥取県~2~0~0|蚊屋島神社~鳥取県~2~0~0|賀茂神社~鳥取県~2~0~0|賀茂神社 (鳥取県南部町)~鳥取県~2~0~0|皆成院~鳥取県~2~0~0|興雲寺~鳥取県~2~0~0|玄忠寺~鳥取県~2~0~0|光専寺 (智頭町)~鳥取県~2~0~0|神崎神社 (琴浦町)~鳥取県~2~0~0|聖神社~鳥取県~2~0~0|青龍寺~鳥取県~2~0~0|赤猪岩神社~鳥取県~2~0~0|大雲院~鳥取県~2~0~0|大岳院~鳥取県~2~0~0|大蓮寺 (倉吉市)~鳥取県~2~0~0|地蔵院 (倉吉市)~鳥取県~2~0~0|智積寺~鳥取県~2~0~0|中山神社 (鳥取県大山町)~鳥取県~2~0~0|長綱寺~鳥取県~2~0~0|雲巌寺~栃木県~2~0~0|温泉寺~栃木県~2~0~0|下野国分寺跡~栃木県~2~0~0|下野國一社八幡宮~栃木県~2~0~0|笠石神社~栃木県~2~0~0|樺崎寺~栃木県~2~0~0|玉藻稲荷神社~栃木県~2~0~0|古峯神社~栃木県~2~0~0|光真寺~栃木県~2~0~0|高勝寺~栃木県~2~0~0|今宮神社~栃木県~2~0~0|寺山観音寺~栃木県~2~0~0|宇奈月神社~富山県~2~0~0|越中国分寺~富山県~2~0~0|円浄寺~富山県~2~0~0|光禅寺~富山県~2~0~0|行徳寺~富山県~2~0~0|埴生護国八幡宮~富山県~2~0~0|真宗大谷派井波別院瑞泉寺~富山県~2~0~0|真宗大谷派城端別院善徳寺~富山県~2~0~0|諏訪神社~富山県~2~0~0|西赤尾八幡社~富山県~2~0~0|西保神社~富山県~2~0~0|大法寺 (高岡市)~富山県~2~0~0|大佛寺~富山県~2~0~0|入善神社~富山県~2~0~0|伏木神社~富山県~2~0~0|放生津八幡宮~富山県~2~0~0|本法寺 (富山市)~富山県~2~0~0|安養寺~福井県~2~0~0|岡太神社~福井県~2~0~0|開善寺~福井県~2~0~0|興宗寺~福井県~2~0~0|空印寺~福井県~2~0~0|御誕生寺~福井県~2~0~0|佐佳枝廼社~福井県~2~0~0|柴田神社~福井県~2~0~0|松原神社~福井県~2~0~0|称念寺~福井県~2~0~0|常高寺~福井県~2~0~0|神明神社~福井県~2~0~0|性海寺~福井県~2~0~0|多田寺~福井県~2~0~0|大安寺~福井県~2~0~0|大谷寺 (越前町)~福井県~2~0~0|中山寺 (高浜町)~福井県~2~0~0|超勝寺~福井県~2~0~0|安積国造神社~福島県~2~0~0|伊勢大御神 (南相馬市)~福島県~2~0~0|医王寺~福島県~2~0~0|永昌寺~福島県~2~0~0|延命寺~福島県~2~0~0|王宮伊豆神社~福島県~2~0~0|開成山大神宮~福島県~2~0~0|近津神社 (石川町)~福島県~2~0~0|恵隆寺~福島県~2~0~0|高屋敷稲荷神社~福島県~2~0~0|三ヶ寺~福島県~2~0~0|浦臼神社~北海道~2~0~0|永専寺~北海道~2~0~0|越後神社~北海道~2~0~0|温根湯神社~北海道~2~0~0|花岡神社~北海道~2~0~0|花畔神社~北海道~2~0~0|亀田八幡宮~北海道~2~0~0|丘珠神社~北海道~2~0~0|錦山天満宮~北海道~2~0~0|琴似神社~北海道~2~0~0|琴平神社~北海道~2~0~0|空知神社~北海道~2~0~0|経王寺~北海道~2~0~0|月寒神社~北海道~2~0~0|顕幽神社~北海道~2~0~0|呼人神社~北海道~2~0~0|光善寺~北海道~2~0~0|厚別神社~北海道~2~0~0|江南神社~北海道~2~0~0|江部乙神社~北海道~2~0~0|札幌八幡宮~北海道~2~0~0|札幌伏見稲荷神社~北海道~2~0~0|山口神社~北海道~2~0~0|市来知神社~北海道~2~0~0|実行寺~北海道~2~0~0|篠路神社~北海道~2~0~0|願正寺~佐賀県~1~3~0|真覚寺~佐賀県~1~2~0|氷見神社~山口県~1~0~2|紫尾神社~鹿児島県~1~0~2|紫尾神社~鹿児島県~1~0~2|鹿児島神社~鹿児島県~1~0~2|比売語曽社~大分県~1~0~2|安国寺~沖縄県~1~0~0|恵比須神社~沖縄県~1~0~0|慈眼院~沖縄県~1~0~0|十山神社~沖縄県~1~0~0|出雲大社沖縄分社~沖縄県~1~0~0|祥雲寺~沖縄県~1~0~0|真教寺~沖縄県~1~0~0|神宮寺~沖縄県~1~0~0|神徳寺~沖縄県~1~0~0|世持神社~沖縄県~1~0~0|聖現寺~沖縄県~1~0~0|西来院~沖縄県~1~0~0|石嘉波神社~沖縄県~1~0~0|大典寺~沖縄県~1~0~0|大東宮~沖縄県~1~0~0|遍照寺 (沖縄市)~沖縄県~1~0~0|本願寺沖縄別院~沖縄県~1~0~0|万松院~沖縄県~1~0~0|臨海寺~沖縄県~1~0~0|安浄寺~岩手県~1~0~0|鞍迫観音~岩手県~1~0~0|鵜住神社~岩手県~1~0~0|鵜鳥神社~岩手県~1~0~0|庵川観音堂~宮崎県~1~0~0|円岳寺~宮崎県~1~0~0|円福寺~宮崎県~1~0~0|狭上稲荷神社~宮崎県~1~0~0|極楽寺~宮崎県~1~0~0|荒立神社~宮崎県~1~0~0|黒尾神社~宮崎県~1~0~0|今山八幡宮~宮崎県~1~0~0|三福寺~宮崎県~1~0~0|上行寺~宮崎県~1~0~0|真栄寺~宮崎県~1~0~0|速川神社 (西都市)~宮崎県~1~0~0|大塚八幡神社~宮崎県~1~0~0|瀧山神社~宮崎県~1~0~0|長善寺~宮崎県~1~0~0|定善寺~宮崎県~1~0~0|土持神社~宮崎県~1~0~0|日向妙国寺~宮崎県~1~0~0|白鳥神社~宮崎県~1~0~0|阿蘇山上神社~熊本県~1~0~0|印鑰神社~熊本県~1~0~0|永国寺~熊本県~1~0~0|永秀寺~熊本県~1~0~0|往生院~熊本県~1~0~0|岡留熊野座神社~熊本県~1~0~0|河江神社~熊本県~1~0~0|河尻神宮~熊本県~1~0~0|海東阿蘇神社~熊本県~1~0~0|伊萬里神社~佐賀県~1~0~0|医王寺~佐賀県~1~0~0|因通寺~佐賀県~1~0~0|円通寺~佐賀県~1~0~0|於保天満宮~佐賀県~1~0~0|教仙寺~佐賀県~1~0~0|極楽寺 (佐賀市)~佐賀県~1~0~0|櫛田宮~佐賀県~1~0~0|掘江神社~佐賀県~1~0~0|三岳寺 (小城市)~佐賀県~1~0~0|四阿屋神社~佐賀県~1~0~0|志賀神社~佐賀県~1~0~0|宗眼寺~佐賀県~1~0~0|修善院~佐賀県~1~0~0|愛宕神社~山形県~1~0~0|愛宕神社~山形県~1~0~0|鮎貝八幡宮~山形県~1~0~0|安国寺~山形県~1~0~0|一宮神社~山形県~1~0~0|羽黒神社~山形県~1~0~0|塩野毘沙門堂~山形県~1~0~0|海向寺~山形県~1~0~0|吉祥院~山形県~1~0~0|建勲神社~山形県~1~0~0|五所神社~山形県~1~0~0|愛宕寺~山口県~1~0~0|葦原神社~山口県~1~0~0|宇津神社~山口県~1~0~0|宇和奈利社~山口県~1~0~0|安楽山宮神社~鹿児島県~1~0~0|安良神社~鹿児島県~1~0~0|旭岡山神社~秋田県~1~0~0|伊豆山神社~秋田県~1~0~0|雲昌寺~秋田県~1~0~0|横手神明社~秋田県~1~0~0|歓喜寺~秋田県~1~0~0|岩関神社~秋田県~1~0~0|金澤八幡宮~秋田県~1~0~0|月山神社 (鹿角市)~秋田県~1~0~0|香積寺~秋田県~1~0~0|国清寺跡~秋田県~1~0~0|三哲神社~秋田県~1~0~0|七座神社~秋田県~1~0~0|松舘菅原神社~秋田県~1~0~0|浄明寺~秋田県~1~0~0|清源寺 (秋田県南秋田郡八郎潟町)~秋田県~1~0~0|素波里神社~秋田県~1~0~0|永昌寺~青森県~1~0~0|革秀寺~青森県~1~0~0|久渡寺~青森県~1~0~0|求聞寺~青森県~1~0~0|橋雲寺~青森県~1~0~0|胸肩神社~青森県~1~0~0|熊野神社~青森県~1~0~0|玄中寺~青森県~1~0~0|弘前天満宮~青森県~1~0~0|弘法寺~青森県~1~0~0|三八城神社~青森県~1~0~0|慈雲院~青森県~1~0~0|秋葉山神社~青森県~1~0~0|小田八幡宮~青森県~1~0~0|正行寺~青森県~1~0~0|対泉院~青森県~1~0~0|袋宮寺~青森県~1~0~0|大安寺~青森県~1~0~0|大間稲荷神社~青森県~1~0~0|大行院~青森県~1~0~0|大慈寺~青森県~1~0~0|長円寺~青森県~1~0~0|白山姫神社~青森県~1~0~0|普門院 (弘前市)~青森県~1~0~0|聞法寺~青森県~1~0~0|闇無浜神社~大分県~1~0~0|伊美別宮社~大分県~1~0~0|一心寺 (大分市)~大分県~1~0~0|臼杵神社~大分県~1~0~0|雲八幡宮~大分県~1~0~0|永福寺~大分県~1~0~0|円通寺~大分県~1~0~0|応暦寺~大分県~1~0~0|温泉神社~大分県~1~0~0|温泉神社 (別府市青山町)~大分県~1~0~0|賀来神社~大分県~1~0~0";

  var done = false;
  function apply(){
    if (done) return true;
    if (typeof SHRINES === 'undefined' || !Array.isArray(SHRINES)) return false;
    if (!window.__wabiShrinesAdded) return false;   // 先に追加ブロックが動くのを待つ

    var rows = RAW.split("|");
    var order = {};
    for (var i = 0; i < rows.length; i++){
      var p = rows[i].split("~");
      if (p.length < 5) continue;
      order[p[0] + '@' + p[1]] = {
        i: i,
        wiki: parseInt(p[2], 10) || 1,
        her: parseInt(p[3], 10) || 0,
        rank: parseInt(p[4], 10) || 0
      };
    }

    var hit = 0, miss = 0;
    for (var j = 0; j < SHRINES.length; j++){
      var s = SHRINES[j];
      if (!s || s.rev) continue;              // 既存113件（クチコミつき）は触らない
      var key = s.name + '@' + s.addr;
      var o = order[key];
      if (!o) {
        // 新しい一覧に無いもの（各県の上位50から外れたもの）は、
        // 順位を付けられた分より後ろに回す。消しはしない。
        s.rank = 1000 + rows.length + miss;
        miss++;
        continue;
      }
      s.rank = 1000 + o.i;
      s.wiki = o.wiki;
      s.her = o.her;
      s.skaku = o.rank;
      s.score = Math.round((3.0 * Math.log(1 + Math.max(1, o.wiki)) / Math.log(2)
                            + 0.5 * (o.her + o.rank)) * 10) / 10;
      hit++;
    }
    window.__wabiScoreApplied = { hit: hit, miss: miss };
    done = true;
    try { if (typeof filter === 'function') filter(); } catch(e){}
    return true;
  }

  function run(){ try { apply(); } catch(e){} }
  if (document.readyState === 'complete') setTimeout(run, 400);
  else window.addEventListener('load', function(){ setTimeout(run, 400); });
  [900, 2000, 3500, 6000].forEach(function(ms){ setTimeout(run, ms); });

  window.WabiShrineScore = { apply: apply };
})();
