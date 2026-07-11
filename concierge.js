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

  // API接続時はこの関数を Google Places / 楽天トラベル 呼び出しに差し替える
  function fetchNearby(route){
    return WC_DATA[route.id] || WC_DATA.dyn;
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
    '.wc-row{display:flex;gap:10px;overflow-x:auto;padding:6px 2px 2px;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;}',
    '.wc-row::-webkit-scrollbar{display:none;}',
    '.wc-card{flex:0 0 calc(50% - 5px);background:#fff;border-radius:18px;box-shadow:0 3px 12px -6px rgba(90,70,40,.25);overflow:hidden;scroll-snap-align:start;}',
    '.wc-img{position:relative;width:100%;height:76px;display:flex;align-items:center;justify-content:center;font-size:26px;overflow:hidden;}',
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
    {key:'hotel',   tit:'宿泊施設',      sub:'PR・巡拝の拠点に', pr:true}
  ];
  var CAT_LABEL = {gourmet:'ランチ',cafe:'カフェ',sight:'観光',exp:'体験',hotel:'宿泊'};

  function cardHtml(item, cat, idx){
    return '<div class="wc-card">'
      + '<div class="wc-img" data-q="'+esc(item.name+' '+(currentNear||''))+'" style="background:'+item.img.grad+'">'
      +   '<span style="filter:drop-shadow(0 2px 6px rgba(0,0,0,.3))">'+item.img.emoji+'</span>'
      +   '<span class="wc-ai">🌿 AIおすすめ度 '+item.ai+'点</span>'
      +   (cat.pr ? '<span class="wc-pr">PR</span>' : '')
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
    if (!state.route || routes.indexOf(state.route) < 0) { state.route = routes[0]; state.added = []; }
    var d = fetchNearby(state.route);
    currentNear = d.near || String(state.route.spots[0].name).replace(/[（(].*$/,'');

    var old = document.getElementById('wcInline'); if (old) old.remove();
    var box = document.createElement('div'); box.id='wcInline';
    box.style.cssText = 'padding-bottom:96px;';
    var h = '';
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
    h += '<div class="wc-advice"><div class="wc-advice-t">💜 AIからのおすすめアドバイス</div><div class="wc-advice-b">'+(d.advice||'')+'</div></div>';
    h += '<div class="wc-list" id="wcAddedBox"></div>';
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

  function renderAddedList(){
    var boxEl = document.getElementById('wcAddedBox');
    if (!boxEl || !state.route) return;
    var h = '<div style="font-family:\'Shippori Mincho\',serif;font-weight:800;font-size:14px;color:#2a2018;margin-bottom:6px">現在のルート</div>';
    state.route.spots.forEach(function(s){
      h += '<div class="wc-li"><div class="wc-li-ic" style="background:'+G.sight+'">⛩</div><div class="wc-li-nm">'+s.name+'</div></div>';
    });
    state.added.forEach(function(a,i){
      h += '<div class="wc-li"><div class="wc-li-ic" style="background:'+a.item.img.grad+'">'+a.item.img.emoji+'</div>'
        + '<div class="wc-li-nm">'+a.item.name+' <span class="wc-li-tag">（'+CAT_LABEL[a.cat]+'）</span></div>'
        + '<button class="wc-li-btn" data-mv="-1" data-i="'+i+'">↑</button>'
        + '<button class="wc-li-btn" data-mv="1" data-i="'+i+'">↓</button>'
        + '<button class="wc-li-btn" data-del="'+i+'" style="color:#a83320">✕</button></div>';
    });
    if (!state.added.length) h += '<div style="font-size:11px;color:#a89a80;padding:8px 4px">気になるスポットを「＋ルートに追加」してみましょう</div>';
    boxEl.innerHTML = h;
    boxEl.querySelectorAll('[data-del]').forEach(function(btn){
      btn.onclick = function(){
        state.added.splice(+btn.getAttribute('data-del'),1);
        var inline = document.getElementById('wcInline');
        if (inline) { buildInlineKeep(); }
      };
    });
    boxEl.querySelectorAll('[data-mv]').forEach(function(btn){
      btn.onclick = function(){
        var i=+btn.getAttribute('data-i'), dd=+btn.getAttribute('data-mv'), j=i+dd;
        if (j<0 || j>=state.added.length) return;
        var t=state.added[i]; state.added[i]=state.added[j]; state.added[j]=t;
        renderAddedList();
      };
    });
  }
  // 削除後にボタン状態も同期して再構築（選択ルートは保持）
  function buildInlineKeep(){
    var keepRoute = state.route, keepAdded = state.added;
    buildInline();
    state.route = keepRoute; state.added = keepAdded;
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
    var r = state.route;
    var tl = [{name:r.spots[0].name, photo:r.spots[0].photo, meta:'約40分滞在', ic:'⛩', grad:G.sight}];
    state.added.filter(function(a){ return a.cat!=='hotel'; }).forEach(function(a){
      tl.push({name:a.item.name, meta:CAT_LABEL[a.cat]+'・約60分', ic:a.item.img.emoji, grad:a.item.img.grad});
    });
    r.spots.slice(1).forEach(function(s){ tl.push({name:s.name, photo:s.photo, meta:'約40分滞在', ic:'⛩', grad:G.sight}); });
    state.added.filter(function(a){ return a.cat==='hotel'; }).forEach(function(a){
      tl.push({name:a.item.name, meta:'宿泊・1泊', ic:a.item.img.emoji, grad:a.item.img.grad});
    });
    return tl;
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
  // 6. アプリへの組み込み
  // ─────────────────────────────────────────
  // ルート一覧が描画されるたびに、下に提案セクションを付ける
  var origRRC = window.renderRouteCards;
  if (typeof origRRC === 'function') {
    window.renderRouteCards = function(){
      origRRC();
      try { state.route = null; state.added = []; buildInline(); } catch(e){}
    };
  }
  // 「このルートを選ぶ」＝そのルートをベースにして、おすすめセクションへ移動
  window.selectRoute = function(rid){
    var routes = window._dynamicRoutes || window.AI_ROUTES || [];
    var route = routes.find(function(r){ return r.id===rid; });
    if (!route && window.AI_ROUTES) route = window.AI_ROUTES.find(function(r){ return r.id===rid; });
    if (!route || !route.spots || !route.spots.length) return;
    state.route = route; state.added = [];
    buildInline();
    toast('🌿 「'+route.name+'」をベースにしました。下のおすすめを追加できます');
    var el = document.getElementById('wcInline');
    if (el) el.scrollIntoView({behavior:'smooth', block:'start'});
  };
})();
