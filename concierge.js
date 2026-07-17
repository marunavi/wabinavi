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
  function fetchDynamicNearby(route, cb){
    try{
      var s0 = route.spots[0];
      if (typeof API_KEY==='undefined' || !API_KEY || typeof google==='undefined' || !google.maps || !google.maps.places || !s0 || !s0.lat){ cb(null); return; }
      var svc = new google.maps.places.PlacesService(document.createElement('div'));
      var center = new google.maps.LatLng(s0.lat, s0.lng);
      var out = { near:String(s0.name).replace(/[（(].*$/,''), gourmet:[], cafe:[], sight:[], exp:[], hotel:[],
        advice: String(s0.name).replace(/[（(].*$/,'')+'周辺の人気スポットをAIが選びました。ランチやカフェを追加して、あなただけの巡拝プランに仕上げましょう。' };
      var jobs = [
        {key:'gourmet', type:'restaurant', radius:800,  emoji:'🍱', grad:G.food,  genre:'お食事処'},
        {key:'cafe',    type:'cafe',       radius:800,  emoji:'☕',  grad:G.cafe,  genre:'カフェ'},
        {key:'sight',   type:'tourist_attraction', radius:1500, emoji:'🏞', grad:G.sight, genre:'観光名所'},
        {key:'hotel',   type:'lodging',    radius:1500, emoji:'🏨', grad:G.hotel, genre:'ホテル'}
      ];
      var done = 0;
      jobs.forEach(function(job){
        svc.nearbySearch({location:center, radius:job.radius, type:job.type}, function(res, status){
          if (status===google.maps.places.PlacesServiceStatus.OK && res){
            var notHotel = function(p){ return job.key==='hotel' || !(p.types && p.types.indexOf('lodging')>-1); };
            var list = res.filter(function(p){ return notHotel(p) && p.rating>=4.0 && (p.user_ratings_total||0)>=50 && p.name!==s0.name; });
            // 4件に満たなければ条件をゆるめて補充（人気順）
            var relaxed = res.filter(function(p){ return notHotel(p) && (p.user_ratings_total||0)>=5 && p.name!==s0.name; })
              .sort(function(a,b){ return (b.user_ratings_total||0)-(a.user_ratings_total||0); });
            relaxed.forEach(function(p){ if (list.length<4 && list.indexOf(p)<0) list.push(p); });
            list.sort(function(a,b){ return (b.rating||0)-(a.rating||0); });
            out[job.key] = list.slice(0,4).map(function(p){
              var dist = (p.geometry&&p.geometry.location)?haversine(s0.lat,s0.lng,p.geometry.location.lat(),p.geometry.location.lng()):600;
              var mins = Math.max(1, Math.round(dist/80));
              return { name:p.name, genre:job.genre, rating:p.rating||4.0, reviews:p.user_ratings_total||0,
                walk:(mins>20?'車'+Math.round(mins/5)+'分':'徒歩'+mins+'分'),
                ai:Math.min(99, Math.round((p.rating||4)*19 + Math.min((p.user_ratings_total||0),1000)/125)),
                img:I(job.emoji, job.grad),
                photoUrl:(p.photos&&p.photos.length)?p.photos[0].getUrl({maxWidth:500}):null };
            });
          }
          done++;
          if (done===jobs.length) cb(out);
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
    '.wc-cta-wrap{position:fixed;bottom:0;left:0;right:0;z-index:6;padding:10px 16px calc(12px + env(safe-area-inset-bottom));background:linear-gradient(to top,#F8F5EF 65%,rgba(248,245,239,0));}',
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

  function cardHtml(item, cat, idx){
    return '<div class="wc-card">'
      + '<div class="wc-img" data-q="'+esc(item.name+' '+(currentNear||''))+'" style="background:'+item.img.grad+'">'
      +   (item.photoUrl ? '<img src="'+esc(item.photoUrl)+'" loading="lazy" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">' : '')
      +   '<span style="filter:drop-shadow(0 2px 6px rgba(0,0,0,.3));'+(item.photoUrl?'display:none;':'')+'">'+item.img.emoji+'</span>'
      +   '<span class="wc-ai">🌿 おすすめ度 '+item.ai+'点</span>'
      + '</div>'
      + '<div class="wc-body">'
      +   '<div class="wc-name" title="'+esc(item.name+'（'+item.genre+'）')+'">'+item.name+'</div>'
      +   '<div class="wc-meta">★<b style="color:#2a2018">'+item.rating.toFixed(1)+'</b>（'+item.reviews+'）・'+item.walk+'</div>'
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
    box.style.cssText = 'padding-bottom:96px;';
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
    var pg = document.getElementById('pgAiRouteList');
    if (pg && !document.getElementById('wcInlineCtaBar')) {
      var bar = document.createElement('div');
      bar.id = 'wcInlineCtaBar'; bar.className = 'wc-cta-wrap';
      bar.innerHTML = '<button class="wc-cta" id="wcInlineCta">カスタマイズしたルートを見る →</button>';
      pg.appendChild(bar);
      document.getElementById('wcInlineCta').onclick = openPreview;
    }
    resolveCardPhotos();
    setTimeout(resolveCardPhotos, 1200); // SDK読み込みが遅れた場合の再試行
  }

  // 滞在時間（分）の目安
  var STAY = {shrine:40, gourmet:60, cafe:30, sight:30, exp:60};
  var CAT_BADGE = {gourmet:'ランチ', cafe:'カフェ・休憩', sight:'観光', exp:'体験', hotel:'宿泊'};

  // 並び順つきのルート項目リストを最新化（神社＋追加スポット）
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
      if (!valid.some(function(it){ return it.type==='add' && it.a.key===a.key; })) valid.push({type:'add', a:a});
    });
    state.items = valid;
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
          + '<div class="wcb-sb">'+(currentNear||'')+'から'+a.item.walk+'</div>'
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
  }

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
      if (it.type==='shrine') return {name:it.spot.name, photo:it.spot.photo, meta:'約'+STAY.shrine+'分滞在', ic:'⛩', grad:G.sight};
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
        + '<div class="wc-tl-th" style="background:'+t.grad+'">'+(t.photo?'<img src="'+esc(t.photo)+'" loading="lazy">':t.ic)+'</div>'
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
  spotPg.innerHTML = '<div class="wc-sd-inner" id="wcSpotBody"></div><div class="wc-cta-wrap" style="z-index:266"><button class="wc-cta" id="wcSpotCta">このスポットを追加してルートを更新 →</button></div>';
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
      + '<div class="wc-sd-meta">★ '+item.rating.toFixed(1)+'（'+item.reviews+'件の口コミ）・'+(currentNear||'')+'から'+item.walk+'</div>'
      + '<div class="wc-sd-btns"><button class="wc-sd-add" id="sdAdd">＋ ルートに追加</button><button class="wc-sd-map" id="sdMap">📍 地図で見る</button></div>'
      + '</div>';
    // ② AIおすすめ理由
    h += '<div class="wc-sd-card wc-sd-reason"><div class="wc-sd-h">🌿 AIがおすすめする理由</div>'
      + '<div class="wc-sd-txt">'+item.name+'は、'+(currentNear||'神社')+'から'+item.walk+'。巡礼の途中で立ち寄りやすい'+item.genre+'の人気店です。地元の方にも観光客にも親しまれており、参拝とあわせて訪れるのに最適です。</div>'
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
            return '<div class="wc-mini"><div class="wc-mini-img" style="background:'+G.sight+'">'+(s.photo?'<img src="'+esc(s.photo)+'" loading="lazy">':'⛩')+'</div>'
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
    function mapOpen(){ window.open('https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(item.name+' '+(currentNear||'')),'_blank'); }
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
      var q = item.name+' '+(currentNear||'');
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
  setInterval(upgradeRankingPhotos, 1200);

  // ─────────────────────────────────────────
  // 10. トップ「テーマで巡るベスト10」「季節の行事・ライトアップ」をJSONから表示
  //（管理画面 admin/sections.html で編集 → data/themes.json・events.json をアップで反映）
  // ─────────────────────────────────────────
  function renderTopSection(headText, jsonUrl){
    fetch(jsonUrl, {cache:'no-store'}).then(function(r){ return r.ok ? r.json() : null; }).then(function(items){
      if (!items || !items.length) return;
      var head = [...document.querySelectorAll('div,h2,h3,span')].find(function(e){
        return e.tagName!=='SCRIPT' && e.childElementCount===0 && (e.textContent||'').trim().indexOf(headText)===0 && !e.closest('#wcPost,#wcPrev,#wcSpot');
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
        // カード列が見つからなければ、見出しの直後に新設
        row = document.createElement('div');
        row.style.cssText='display:flex;gap:10px;overflow-x:auto;padding:10px 0 6px;';
        head.parentElement.insertAdjacentElement('afterend', row);
      }
      row.innerHTML = items.map(function(t,i){
        return '<div class="route-card" data-wtop="'+i+'" style="flex:0 0 165px;cursor:pointer">'
          + '<div class="route-card-img-wrap"><div class="route-card-img wtop-img" data-shrine-w="'+esc(t.shrine||'')+'" style="display:flex;align-items:center;justify-content:center;font-size:30px;background:linear-gradient(135deg,#8a9ab0,#4a5a70);color:#fff">'+(t.emoji||'⛩')+'</div></div>'
          + '<div class="route-card-body"><div class="route-card-title">'+(t.emoji?t.emoji+' ':'')+esc(t.title||'')+'</div>'
          + '<div class="route-card-desc">'+esc(t.desc||'')+'</div>'
          + '<div class="route-card-meta">'+esc(t.meta||'')+'</div></div></div>';
      }).join('');
      row.querySelectorAll('[data-wtop]').forEach(function(c){
        var t = items[+c.getAttribute('data-wtop')];
        c.onclick = function(){ if (t.link) location.href = t.link; };
      });
      // 神社名からWikipediaの実写真を差し込み
      var names = items.map(function(t){ return t.shrine; }).filter(Boolean);
      if (names.length) wikiPhotosFor([...new Set(names)], function(map){
        row.querySelectorAll('.wtop-img').forEach(function(el){
          var u = map[el.getAttribute('data-shrine-w')];
          if (u){ el.style.background='url('+u+') center/cover'; el.textContent=''; }
        });
      });
    }).catch(function(){});
  }
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
