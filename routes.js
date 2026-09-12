// ══════════════════════════════════════════════════════════
// わびなび おすすめ巡拝ルート データ（10ルート）
// このファイルを書き換えてGitHubに上げ直せば、
// index.html を触らずにルートを変更できます。
// ══════════════════════════════════════════════════════════
(function(){
  var IMG = [
    'https://images.unsplash.com/photo-1492571350019-22de08371fd3?w=520&q=80&auto=format&fit=crop', // 0 水上の鳥居
    'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=520&q=80&auto=format&fit=crop', // 1 青い海
    'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=520&q=80&auto=format&fit=crop', // 2 門前町の夕景
    'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=520&q=80&auto=format&fit=crop', // 3 滝
    'https://images.unsplash.com/photo-1503640538573-148065ba4904?w=520&q=80&auto=format&fit=crop', // 4 日本庭園と池
    'https://images.unsplash.com/photo-1440581572325-0bea30075d9d?w=520&q=80&auto=format&fit=crop', // 5 杉の森
    'https://images.unsplash.com/photo-1476231682828-37e571bc172f?w=520&q=80&auto=format&fit=crop', // 6 山林
    'https://images.unsplash.com/photo-1478436127897-769e1b3f0f36?w=520&q=80&auto=format&fit=crop', // 7 千本鳥居
    'https://images.unsplash.com/photo-1526481280693-3bfa7568e0f3?w=520&q=80&auto=format&fit=crop', // 8 富士山と五重塔
    'https://images.unsplash.com/photo-1570459027562-4a916cc6113f?w=520&q=80&auto=format&fit=crop'  // 9 山と湖の紅葉
  ];

  var R = [
    {
      id:'r1', name:'東国三社巡り', emoji:'⛩',
      transport:'車', time:'約4時間', totalMove:'総移動時間 約45分',
      desc:'国譲り神話で活躍した武神タケミカヅチとフツヌシ、そして道案内の神クナドを巡る「東国三社参り」。江戸っ子が「お伊勢参りのみそぎ参り」と呼んだ由緒ある巡拝です。三社を巡って集める「東国三社守」も人気。強い決断力と勝負運を授かる、人生の転機にこそ訪れたい旅です',
      tags:['関東最強の開運','東国三社守'],
      cardDesc:'武神を祀る関東最強の三社。<br>江戸から続く開運参り',
      cardTag:'開運', cardImg: IMG[0],
      spots:[
        {name:'鹿島神宮',photo:'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Kashima-jingu_haiden-1.JPG/960px-Kashima-jingu_haiden-1.JPG',deity:'武甕槌大神',addr:'茨城県鹿嶋市宮中2306-1',loc:'茨城県鹿嶋市',move:'出発地から約10分',benefit:'勝負運・決断力',lat:35.9688,lng:140.6315},
        {name:'香取神宮',photo:'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/Katori-jingu_haiden_shomen.JPG/960px-Katori-jingu_haiden_shomen.JPG',deity:'経津主大神',addr:'千葉県香取市香取1697-1',loc:'千葉県香取市',move:'約20分',benefit:'勝運・交通安全',lat:35.8857,lng:140.5288},
        {name:'息栖神社',photo:'https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/Ikisu-jinja_haiden.JPG/960px-Ikisu-jinja_haiden.JPG',deity:'久那戸神',addr:'茨城県神栖市息栖2882',loc:'茨城県神栖市',move:'約20分',benefit:'厄除招福・交通守護',lat:35.8858,lng:140.6251}
      ]
    },
    {
      id:'r2', name:'えびす・だいこく両参り', emoji:'🎣',
      transport:'車', time:'約5時間', totalMove:'総移動時間 約1時間30分',
      desc:'国造りを成しとげた大国主大神（だいこく様）と、その御子神・事代主神（えびす様）。出雲大社と美保神社の両方をお参りする「えびすだいこく両参り」は、片方だけでは「片参り」と言われる山陰の古き習わしです。縁結びと商売繁盛、親子の神様から二重の福を授かります',
      tags:['縁結び','商売繁盛'],
      cardDesc:'出雲の大国さまとえびす様、<br>親子の神を巡る山陰の旅',
      cardTag:'縁結び', cardImg: IMG[1],
      spots:[
        {name:'出雲大社',photo:'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/Haiden_of_Izumo-taisha-1.JPG/960px-Haiden_of_Izumo-taisha-1.JPG',deity:'大国主大神',addr:'島根県出雲市大社町杵築東195',loc:'島根県出雲市',move:'出発地から約25分',benefit:'縁結び・福徳開運',lat:35.3998,lng:132.6852},
        {name:'美保神社',photo:'https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/Miho-jinja_haiden.jpg/960px-Miho-jinja_haiden.jpg',deity:'事代主神・三穂津姫命',addr:'島根県松江市美保関町美保関608',loc:'島根県松江市',move:'約1時間30分',benefit:'商売繁盛・海上安全',lat:35.5622,lng:133.3067}
      ]
    },
    {
      id:'r3', name:'お伊勢参り', emoji:'☀️',
      transport:'バス', time:'約7時間', totalMove:'総移動時間 約1時間10分',
      desc:'「一生に一度はお伊勢参り」。まず二見浦の夫婦岩で心身を清め、豊受大御神の外宮から天照大御神の内宮へ——江戸時代の旅人が守った正式順路をたどります。締めくくりは神宮の鬼門を守る朝熊岳金剛證寺。「お伊勢参らば朝熊をかけよ」と伊勢音頭に唄われた満願の地です',
      tags:['正式順路','一生に一度'],
      cardDesc:'禊から内宮へ、正式順路で<br>巡る一生に一度のお参り',
      cardTag:'正式順路', cardImg: IMG[2],
      spots:[
        {name:'二見興玉神社',photo:'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Futamiokitama_jinja_Haiden.jpg/960px-Futamiokitama_jinja_Haiden.jpg',deity:'猿田彦大神',addr:'三重県伊勢市二見町江575',loc:'三重県伊勢市',move:'出発地から約15分',benefit:'禊・夫婦円満',lat:34.5083,lng:136.7888},
        {name:'伊勢神宮 外宮（豊受大神宮）',photo:'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Geku_003.jpg/960px-Geku_003.jpg',deity:'豊受大御神',addr:'三重県伊勢市豊川町279',loc:'三重県伊勢市',move:'約20分',benefit:'衣食住・産業守護',lat:34.4874,lng:136.7037},
        {name:'猿田彦神社',photo:'https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/Ise_Sarutahiko_Shrine.jpg/960px-Ise_Sarutahiko_Shrine.jpg',deity:'猿田彦大神',addr:'三重県伊勢市宇治浦田2-1-10',loc:'三重県伊勢市',move:'約10分',benefit:'みちひらき',lat:34.4674,lng:136.7202},
        {name:'伊勢神宮 内宮（皇大神宮）',photo:'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Naiku_04.jpg/960px-Naiku_04.jpg',deity:'天照大御神',addr:'三重県伊勢市宇治館町1',loc:'三重県伊勢市',move:'約5分',benefit:'開運・国家安泰',lat:34.4569,lng:136.7230},
        {name:'朝熊岳金剛證寺',photo:'https://upload.wikimedia.org/wikipedia/commons/1/1b/Kongoshoji%28Mie%29_08.JPG',deity:'虚空蔵菩薩（本尊）',addr:'三重県伊勢市朝熊町岳548',loc:'三重県伊勢市',move:'約20分',benefit:'厄除け・福徳',lat:34.4575,lng:136.7854}
      ]
    },
    {
      id:'r4', name:'熊野三山', emoji:'🦅',
      transport:'車', time:'約7時間', totalMove:'総移動時間 約2時間',
      desc:'蘇りの聖地・熊野。平安の昔、上皇から庶民まで「蟻の熊野詣」と呼ばれるほど人々が列をなした祈りの道の終着点が熊野三山です。導きの神・八咫烏に見守られながら本宮・速玉・那智の三大社を巡れば、過去を浄めて新しい自分に生まれ変わると伝わります。那智の大滝の轟音もぜひ体感を',
      tags:['よみがえりの聖地','世界遺産'],
      cardDesc:'よみがえりの聖地・熊野。<br>八咫烏が導く再生の旅',
      cardTag:'世界遺産', cardImg: IMG[3],
      spots:[
        {name:'熊野本宮大社',photo:'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Inside_the_Kumano_Hongu_Taisha.jpg/960px-Inside_the_Kumano_Hongu_Taisha.jpg',deity:'家都美御子大神',addr:'和歌山県田辺市本宮町本宮1110',loc:'和歌山県田辺市',move:'出発地から約30分',benefit:'よみがえり・開運',lat:33.8404,lng:135.7736},
        {name:'熊野速玉大社',photo:'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Kumanohayatama-taisha12s5s4200.jpg/960px-Kumanohayatama-taisha12s5s4200.jpg',deity:'熊野速玉大神・熊野夫須美大神',addr:'和歌山県新宮市新宮1',loc:'和歌山県新宮市',move:'約45分',benefit:'現世安穏・夫婦円満',lat:33.7323,lng:135.9837},
        {name:'熊野那智大社',photo:'https://upload.wikimedia.org/wikipedia/commons/9/9c/Shrine_Kumano_nachi01.jpg',deity:'熊野夫須美大神',addr:'和歌山県東牟婁郡那智勝浦町那智山1',loc:'和歌山県那智勝浦町',move:'約40分',benefit:'諸願成就・縁結び',lat:33.6684,lng:135.8904}
      ]
    },
    {
      id:'r5', name:'諏訪大社 四社巡り', emoji:'🌲',
      transport:'車', time:'約4時間', totalMove:'総移動時間 約45分',
      desc:'諏訪湖をはさんで鎮まる上社と下社、あわせて四つのお宮をすべて参る「四社まいり」。御祭神は国譲り神話に登場する建御名方神です。七年目ごとの御柱祭で知られる日本最古級の古社で、社殿の四隅に立つ御柱に守られた境内は凛とした気に満ちています。四社で記念品がいただける授与も人気です',
      tags:['御柱','四社まいり'],
      cardDesc:'諏訪湖を囲む四つのお宮を<br>一日で参る「四社まいり」',
      cardTag:'御柱', cardImg: IMG[4],
      spots:[
        {name:'諏訪大社 上社本宮',photo:'https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Suwa-taisha%2C_Kamisha_Honmiya%2C_haiden-1.jpg/960px-Suwa-taisha%2C_Kamisha_Honmiya%2C_haiden-1.jpg',deity:'建御名方神',addr:'長野県諏訪市中洲宮山1',loc:'長野県諏訪市',move:'出発地から約15分',benefit:'勝負運・開運',lat:35.9985,lng:138.1190},
        {name:'諏訪大社 上社前宮',photo:'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Suwa-taisha%2C_Kamisha_Maemiya%2C_haisho.jpg/960px-Suwa-taisha%2C_Kamisha_Maemiya%2C_haisho.jpg',deity:'八坂刀売神',addr:'長野県茅野市宮川2030',loc:'長野県茅野市',move:'約5分',benefit:'生命力・水の恵み',lat:35.9911,lng:138.1334},
        {name:'諏訪大社 下社秋宮',photo:'https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Suwa-taisha%2C_Shimosha_Akimiya%2C_heihaiden.jpg/960px-Suwa-taisha%2C_Shimosha_Akimiya%2C_heihaiden.jpg',deity:'建御名方神・八坂刀売神',addr:'長野県諏訪郡下諏訪町5828',loc:'長野県下諏訪町',move:'約20分',benefit:'家内安全・縁結び',lat:36.0749,lng:138.0903},
        {name:'諏訪大社 下社春宮',photo:'https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/%E8%AB%8F%E8%A8%AA%E5%A4%A7%E7%A4%BE%E4%B8%8B%E7%A4%BE%E6%98%A5%E5%AE%AE_-_panoramio.jpg/960px-%E8%AB%8F%E8%A8%AA%E5%A4%A7%E7%A4%BE%E4%B8%8B%E7%A4%BE%E6%98%A5%E5%AE%AE_-_panoramio.jpg',deity:'建御名方神・八坂刀売神',addr:'長野県諏訪郡下諏訪町193',loc:'長野県下諏訪町',move:'約5分',benefit:'子授け・安産',lat:36.0818,lng:138.0819}
      ]
    },
    {
      id:'r6', name:'戸隠神社 五社巡り', emoji:'⛰',
      transport:'車', time:'約6時間', totalMove:'総移動時間 約2時間',
      desc:'天照大御神が隠れた天岩戸が飛来して山になった——そんな神話を持つ戸隠山の麓、五社を順に参る巡拝です。天岩戸を開いた力の神、舞を舞った芸能の神など、岩戸開き神話の神々が勢ぞろい。クライマックスは樹齢400年超の杉並木が続く約2kmの奥社参道。歩き切った先に開運の気が待っています',
      tags:['天岩戸神話','杉並木'],
      cardDesc:'天岩戸神話の五社を麓から<br>奥社へ。杉並木の神域歩き',
      cardTag:'杉並木', cardImg: IMG[5],
      spots:[
        {name:'戸隠神社 宝光社',photo:'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/%E6%88%B8%E9%9A%A0%E7%A5%9E%E7%A4%BE%E5%AE%9D%E5%85%89%E7%A4%BE_%E7%A4%BE%E6%AE%BF.jpg/960px-%E6%88%B8%E9%9A%A0%E7%A5%9E%E7%A4%BE%E5%AE%9D%E5%85%89%E7%A4%BE_%E7%A4%BE%E6%AE%BF.jpg',deity:'天表春命',addr:'長野県長野市戸隠2110',loc:'長野県長野市',move:'出発地から約50分',benefit:'女性守護・技芸上達',lat:36.7324,lng:138.0759},
        {name:'戸隠神社 火之御子社',photo:'https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/%E6%88%B8%E9%9A%A0%E7%A5%9E%E7%A4%BE%E7%81%AB%E4%B9%8B%E5%BE%A1%E5%AD%90%E7%A4%BE_%E7%A4%BE%E6%AE%BF.jpg/960px-%E6%88%B8%E9%9A%A0%E7%A5%9E%E7%A4%BE%E7%81%AB%E4%B9%8B%E5%BE%A1%E5%AD%90%E7%A4%BE_%E7%A4%BE%E6%AE%BF.jpg',deity:'天鈿女命',addr:'長野県長野市戸隠2410',loc:'長野県長野市',move:'約3分',benefit:'舞楽芸能・縁結び',lat:36.7372,lng:138.0797},
        {name:'戸隠神社 中社',photo:'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/%E6%88%B8%E9%9A%A0%E7%A5%9E%E7%A4%BE%E4%B8%AD%E7%A4%BE_%E7%A4%BE%E6%AE%BF.jpg/960px-%E6%88%B8%E9%9A%A0%E7%A5%9E%E7%A4%BE%E4%B8%AD%E7%A4%BE_%E7%A4%BE%E6%AE%BF.jpg',deity:'天八意思兼命',addr:'長野県長野市戸隠3506',loc:'長野県長野市',move:'約5分',benefit:'学業成就・商売繁盛',lat:36.7425,lng:138.0850},
        {name:'戸隠神社 九頭龍社',photo:'https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/%E6%88%B8%E9%9A%A0%E7%A5%9E%E7%A4%BE_%E4%B9%9D%E9%A0%AD%E9%BE%8D%E7%A4%BE.jpg/960px-%E6%88%B8%E9%9A%A0%E7%A5%9E%E7%A4%BE_%E4%B9%9D%E9%A0%AD%E9%BE%8D%E7%A4%BE.jpg',deity:'九頭龍大神',addr:'長野県長野市戸隠（奥社参道内）',loc:'長野県長野市',move:'車約10分＋徒歩約40分',benefit:'水の恵み・縁結び',lat:36.7654,lng:138.0622},
        {name:'戸隠神社 奥社',photo:'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/%E6%88%B8%E9%9A%A0%E7%A5%9E%E7%A4%BE%E5%A5%A5%E7%A4%BE.jpg/960px-%E6%88%B8%E9%9A%A0%E7%A5%9E%E7%A4%BE%E5%A5%A5%E7%A4%BE.jpg',deity:'天手力雄命',addr:'長野県長野市戸隠3690',loc:'長野県長野市',move:'徒歩約2分',benefit:'開運・心願成就',lat:36.7657,lng:138.0625}
      ]
    },
    {
      id:'r7', name:'秩父三社巡り', emoji:'🐺',
      transport:'車', time:'約7時間', totalMove:'総移動時間 約1時間50分',
      desc:'学問と開運の秩父神社、日本武尊を山火事から救った神犬伝説が残る宝登山神社、そして標高1,100mの雲上に鎮まる関東屈指のパワースポット・三峯神社。オオカミを神様のお使いとする珍しい信仰が今も息づく秩父の山々を巡り、心身を研ぎ澄ます一日です',
      tags:['オオカミ信仰','関東屈指の気'],
      cardDesc:'オオカミ信仰が息づく<br>秩父の霊気に触れる三社',
      cardTag:'霊気', cardImg: IMG[6],
      spots:[
        {name:'秩父神社',photo:'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Chichibu-jinja_ac_%284%29.jpg/960px-Chichibu-jinja_ac_%284%29.jpg',deity:'八意思兼命・知知夫彦命',addr:'埼玉県秩父市番場町1-3',loc:'埼玉県秩父市',move:'出発地から約5分',benefit:'学業成就・開運',lat:35.9976,lng:139.0842},
        {name:'宝登山神社',photo:'https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Hodosan_Shrine_%28Mt._Treasure-climb_Shrine%29_-_%E5%AE%9D%E7%99%BB%E5%B1%B1%E7%A5%9E%E7%A4%BE_-_panoramio_%2813%29.jpg/960px-Hodosan_Shrine_%28Mt._Treasure-climb_Shrine%29_-_%E5%AE%9D%E7%99%BB%E5%B1%B1%E7%A5%9E%E7%A4%BE_-_panoramio_%2813%29.jpg',deity:'神日本磐余彦尊・大山祗神・火産霊神',addr:'埼玉県秩父郡長瀞町長瀞1828',loc:'埼玉県長瀞町',move:'約25分',benefit:'火防・金運',lat:36.0933,lng:139.1031},
        {name:'三峯神社',photo:'https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/Mitsumine-jinja%2C_Haiden.jpg/960px-Mitsumine-jinja%2C_Haiden.jpg',deity:'伊弉諾尊・伊弉册尊',addr:'埼玉県秩父市三峰298-1',loc:'埼玉県秩父市',move:'約1時間20分',benefit:'厄除け・心願成就',lat:35.9257,lng:138.9298}
      ]
    },
    {
      id:'r8', name:'京都 五社巡り', emoji:'🏮',
      transport:'電車', time:'約7時間', totalMove:'総移動時間 約2時間40分',
      desc:'平安京は、四方を聖なる獣が守る「四神相応」の地に築かれました。北の玄武・上賀茂神社、西の白虎・松尾大社、南の朱雀・城南宮、東の青龍・八坂神社、そして中央の平安神宮。千年の都を守り続ける結界を一日で巡る「京都五社めぐり」です。専用色紙に御朱印を集める楽しみも',
      tags:['四神相応','専用色紙あり'],
      cardDesc:'平安京を守る四神の社と<br>平安神宮。千年の都の結界',
      cardTag:'色紙巡拝', cardImg: IMG[7],
      spots:[
        {name:'上賀茂神社（北・玄武）',photo:'https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Kamo-wakeikazuchi-jinja18n4272.jpg/960px-Kamo-wakeikazuchi-jinja18n4272.jpg',deity:'賀茂別雷大神',addr:'京都市北区上賀茂本山339',loc:'京都市北区',move:'出発地から約40分',benefit:'厄除け・雷除け',lat:35.0605,lng:135.7523},
        {name:'松尾大社（西・白虎）',photo:'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/Matsunoo-taisha_honden-1.JPG/960px-Matsunoo-taisha_honden-1.JPG',deity:'大山咋神・市杵島姫命',addr:'京都市西京区嵐山宮町3',loc:'京都市西京区',move:'約40分',benefit:'醸造守護・開運',lat:35.0002,lng:135.6853},
        {name:'城南宮（南・朱雀）',photo:'https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Jonangu_shrine.jpg/960px-Jonangu_shrine.jpg',deity:'国常立尊・八千矛神・息長帯日売尊',addr:'京都市伏見区中島鳥羽離宮町7',loc:'京都市伏見区',move:'約35分',benefit:'方除け・旅行安全',lat:34.9506,lng:135.7470},
        {name:'八坂神社（東・青龍）',photo:'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/JP-Kyoto-yasaka.JPG/960px-JP-Kyoto-yasaka.JPG',deity:'素戔嗚尊',addr:'京都市東山区祇園町北側625',loc:'京都市東山区',move:'約30分',benefit:'厄除け・美容',lat:35.0036,lng:135.7783},
        {name:'平安神宮（中央）',photo:'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Heian-jingu%2C_keidai-1.jpg/960px-Heian-jingu%2C_keidai-1.jpg',deity:'桓武天皇・孝明天皇',addr:'京都市左京区岡崎西天王町97',loc:'京都市左京区',move:'約15分',benefit:'開運招福・縁結び',lat:35.0161,lng:135.7829}
      ]
    },
    {
      id:'r9', name:'富士山麓両参り', emoji:'🗻',
      transport:'車', time:'約2時間30分', totalMove:'総移動時間 約15分',
      desc:'富士山の噴火を鎮めるため約1,900年前に創建されたと伝わる北口本宮冨士浅間神社。富士講の登拝門の先には、美の女神・木花開耶姫命が鎮まります。あわせて参るのは、日本三大金運神社に数えられる新屋山神社。霊峰のご神気と金運、両方をいただく実りの多い両参りです',
      tags:['金運日本一','富士のご神気'],
      cardDesc:'霊峰のご神気と日本三大<br>金運神社を短時間で両参り',
      cardTag:'金運', cardImg: IMG[8],
      spots:[
        {name:'北口本宮冨士浅間神社',photo:'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Kitaguchi_Hongu_Fuji_Sengen_jinja_Torii.jpg/960px-Kitaguchi_Hongu_Fuji_Sengen_jinja_Torii.jpg',deity:'木花開耶姫命・彦火瓊瓊杵尊・大山祗神',addr:'山梨県富士吉田市上吉田5558',loc:'山梨県富士吉田市',move:'出発地から約5分',benefit:'開運・安産・火防',lat:35.4710,lng:138.7926},
        {name:'新屋山神社',photo:'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/Arayayamashrine.jpg/960px-Arayayamashrine.jpg',deity:'大山祗大神',addr:'山梨県富士吉田市新屋1230',loc:'山梨県富士吉田市',move:'約10分',benefit:'金運・商売繁盛',lat:35.4668,lng:138.7973}
      ]
    },
    {
      id:'r10', name:'筑波山神社 両参り', emoji:'💞',
      transport:'徒歩', time:'約4時間30分', totalMove:'総移動時間 約1時間45分',
      desc:'「西の富士、東の筑波」と並び称される霊峰筑波山は、山そのものがご神体。男体山にはイザナギ、女体山にはイザナミ、夫婦二柱の神様が鎮まります。麓の拝殿からそれぞれの山頂御本殿へ登拝する両参りは、万葉の昔から続く縁結び・夫婦円満の祈りの道。山頂からの関東平野の大パノラマもご褒美です',
      tags:['縁結び','登拝'],
      cardDesc:'男体山と女体山、二柱の<br>御本殿を参る縁結び登拝',
      cardTag:'縁結び', cardImg: IMG[9],
      spots:[
        {name:'筑波山神社（拝殿）',photo:'https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Tsukubasan-jinja_haiden.JPG/960px-Tsukubasan-jinja_haiden.JPG',deity:'筑波男大神・筑波女大神',addr:'茨城県つくば市筑波1',loc:'茨城県つくば市',move:'出発地からバス約40分',benefit:'縁結び・夫婦和合',lat:36.2131,lng:140.1013},
        {name:'筑波山神社 男体山御本殿',photo:'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Tsukubasan-jinja_nantaisan-honden.JPG/960px-Tsukubasan-jinja_nantaisan-honden.JPG',deity:'伊弉諾尊',addr:'茨城県つくば市（男体山山頂）',loc:'茨城県つくば市',move:'ケーブルカー約8分＋徒歩約15分',benefit:'開運・国土安寧',lat:36.2258,lng:140.0984},
        {name:'筑波山神社 女体山御本殿',photo:'https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/Tsukubasan-jinja_nyotaisan-honden.JPG/960px-Tsukubasan-jinja_nyotaisan-honden.JPG',deity:'伊弉册尊',addr:'茨城県つくば市（女体山山頂）',loc:'茨城県つくば市',move:'徒歩約40分',benefit:'縁結び・良縁成就',lat:36.2255,lng:140.1066}
      ]
    }
  ];

  // ── ① アプリ本体のルートデータを10ルートに差し替え ──
  window.AI_ROUTES = R;

  // 神社名 → 写真 の対応表（写真が空欄のとき用の仮画像）
  var PHOTO_BY_NAME = {};
  R.forEach(function(r){
    r.spots.forEach(function(s){ PHOTO_BY_NAME[s.name] = s.photo || r.cardImg; });
  });

  // 空のままの写真に仮画像を入れる（APIキーがあれば後から本物の写真で上書きされます）
  function fillEmptyPhotos(){
    document.querySelectorAll('img[data-shrine]').forEach(function(img){
      var empty = !img.getAttribute('src');
      if (!empty) return;
      var name = img.getAttribute('data-shrine');
      if (PHOTO_BY_NAME[name]) img.src = PHOTO_BY_NAME[name];
    });
  }

  // ── ② 固定ルート表示の改良（社数カット防止・交通手段表示・写真埋め） ──
  var origRender = window.renderRouteCards;
  if (typeof origRender === 'function') {
    window.renderRouteCards = function(){
      if (!window._aiQuery && !window._dynamicRoutes) { window._dynamicRoutes = R; }
      origRender();
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
      fillEmptyPhotos();
    };
  }

  // ── ③ 神社写真タップで詳細ページが「手前に」正しい情報で開くようにする ──
  var SPOT_BY_NAME = {};
  R.forEach(function(r){ r.spots.forEach(function(s){ SPOT_BY_NAME[s.name] = s; }); });
  var origOpenSpot = window.openSpotDetail;
  if (typeof origOpenSpot === 'function') {
    window.openSpotDetail = function(name){
      var found = null;
      if (typeof SHRINES !== 'undefined') {
        found = SHRINES.find(function(s){ return s.name === name || s.name.indexOf(name) >= 0 || name.indexOf(s.name) >= 0; });
      }
      var mine = SPOT_BY_NAME[name];
      if (!found && mine && typeof openShrineDetail === 'function') {
        // アプリのデータベースに無い神社は、ルートデータの情報（主祭神・住所）で表示
        openShrineDetail({
          name: name,
          deity: mine.deity || '御祭神',
          addr: mine.addr || (mine.loc || ''),
          map: 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(name),
          area: '', rating: 0, rev: 0, visited: false,
          tags: [], badges: []
        });
      } else {
        origOpenSpot(name);
      }
      var sd = document.getElementById('pgShrineDetail');
      if (sd) sd.style.zIndex = '300'; // ルート一覧(110)より手前に
    };
  }

  // ── ④ カードをタップしたら、ローディング画面なしで即ルート一覧へ ──
  window.wabiOpenRoute = function(rid){
    window._aiQuery = null;
    window._dynamicRoutes = R;
    var pg = document.getElementById('pgAiRouteList');
    if (pg) pg.classList.add('show');
    if (typeof window.renderRouteCards === 'function') window.renderRouteCards();
    setTimeout(function(){
      var img = document.getElementById('aiRouteImg_' + rid);
      if (img) {
        var card = img.closest('.ai-rcard');
        if (card) card.scrollIntoView({behavior:'auto', block:'start'});
      }
    }, 100);
  };

  // ── ⑤ トップの「おすすめ巡拝ルート」カードを10件に作り替え ──
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

  // ── ⑥ 「3つのルートを比較して…」の文言を修正 ──
  var sub = document.querySelector('.ai-list-sub');
  if (sub) sub.textContent = '10のルートを比較して、あなたにぴったりの巡拝を選べます';

  // ── ⑦ 神社名を入力しないと「AIがおすすめルートを作成」を押せないようにする ──
  var heroInput = document.getElementById('heroSearchInput');
  var heroBtn = document.querySelector('.hero-search-cta');
  if (heroInput && heroBtn) {
    var syncHeroBtn = function(){
      var ok = heroInput.value.trim().length > 0;
      heroBtn.disabled = !ok;
      heroBtn.style.opacity = ok ? '' : '0.45';
      heroBtn.style.cursor = ok ? '' : 'not-allowed';
    };
    heroInput.addEventListener('input', syncHeroBtn);
    syncHeroBtn();
  }

  // ── ⑧ 「このルートを選ぶ」→ Googleマップで経路を開く ──
  window.selectRoute = function(rid){
    var routes = window._dynamicRoutes || window.AI_ROUTES;
    var route = routes.find(function(r){ return r.id === rid; });
    if (!route) route = window.AI_ROUTES.find(function(r){ return r.id === rid; });
    if (!route || !route.spots || !route.spots.length) return;
    // カッコ書きを除いた神社名で経路を組み立てる
    var names = route.spots.map(function(s){ return String(s.name).replace(/[（(].*$/, '').trim(); });
    var url;
    if (names.length === 1) {
      url = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(names[0]);
    } else {
      var mode = route.transport === '徒歩' ? 'walking'
               : (route.transport === '電車' || route.transport === 'バス') && names.length === 2 ? 'transit'
               : 'driving'; // 経由地ありは乗換案内非対応のため車モードで開く
      url = 'https://www.google.com/maps/dir/?api=1'
          + '&origin=' + encodeURIComponent(names[0])
          + '&destination=' + encodeURIComponent(names[names.length - 1])
          + (names.length > 2 ? '&waypoints=' + encodeURIComponent(names.slice(1, -1).join('|')) : '')
          + '&travelmode=' + mode;
    }
    window.open(url, '_blank');
  };

  // ── ⑨ ランキングカードは写真・御朱印どこを押しても詳細ページへ ──
  document.addEventListener('click', function(ev){
    var card = ev.target.closest ? ev.target.closest('.rcard') : null;
    if (!card) return;
    var el = ev.target;
    while (el && el !== card) {
      // 独自の動きを持つ要素（住所リンク・御朱印登録ボタンなど）はそのまま生かす
      if (el.tagName === 'A' || el.tagName === 'BUTTON' || (el.getAttribute && el.getAttribute('onclick'))) return;
      el = el.parentElement;
    }
    var rn = card.querySelector('.rname');
    if (rn) rn.click();
  });

  // ── ⑩ 詳細ページのトップ画像を少し縦長（4:3）にする ──
  var wabiCss = document.createElement('style');
  wabiCss.textContent = '.sd-hero{flex:0 0 auto !important;min-height:calc(min(100vw, 500px) * 0.75) !important;aspect-ratio:4 / 3 !important;}\n.sd-hero img{width:100%;height:100%;object-fit:cover;}'
    // iPhoneで入力欄タップ時に画面が拡大されるのを防ぐ（文字16px未満だとiOSが自動ズームするため）
    + '\ninput, textarea, select{font-size:16px !important;}';
  document.head.appendChild(wabiCss);

  // ── ⑫ 公開用APIキー（訪問者全員が神社の写真を見られるようにする）──
  // 下の '' の中にGoogleのAPIキーを貼り付けてください。
  // ※必ずGoogle Cloud側で「HTTPリファラー制限: https://marunavi.github.io/*」を設定してから貼ること
  var WABI_PUBLIC_API_KEY = 'AIzaSyBhItwVQYblQTxo92oWeXuskQW-JYipgCk';
  if (WABI_PUBLIC_API_KEY) {
    try {
      localStorage.setItem('gplaces_key', WABI_PUBLIC_API_KEY);
      API_KEY = WABI_PUBLIC_API_KEY;
      if (typeof showAppliedBar === 'function') showAppliedBar();
      if (typeof filter === 'function') filter();
    } catch(e){}
  }

  // ── ⑪ 詳細ページ：トップ画像の下に「別アングル写真＋御朱印」を2枚並べる ──
  function wabiAltPhoto(name){
    var trim = String(name).replace(/[（(].*$/,'').trim();
    return (window.sdCurrentPhotos && window.sdCurrentPhotos[1])
        || PHOTO_BY_NAME[name] || PHOTO_BY_NAME[trim]
        || (window.sdCurrentPhotos && window.sdCurrentPhotos[0]) || '';
  }
  var origPopulate = window.populateShrineDetail;
  if (typeof origPopulate === 'function') {
    window.populateShrineDetail = function(s){
      origPopulate(s);
      try {
        var hero = document.getElementById('sdHero');
        if (!hero) return;
        var old = document.getElementById('wabiSdDuo');
        if (old) old.remove();
        var duo = document.createElement('div');
        duo.id = 'wabiSdDuo';
        duo.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:10px 16px 4px;';
        var anchor = document.getElementById('sdThumbs') || hero;
        anchor.insertAdjacentElement('afterend', duo);
        // ① 神社の別アングル写真
        var alt = wabiAltPhoto(s.name);
        var c1 = document.createElement('div');
        if (alt) {
          var liIdx = window.sdCurrentPhotos ? window.sdCurrentPhotos.indexOf(alt) : -1;
          c1.innerHTML = '<img src="' + alt + '" loading="lazy" style="width:100%;aspect-ratio:1/1;object-fit:cover;border-radius:10px;display:block' + (liIdx > -1 ? ';cursor:pointer' : '') + '"' + (liIdx > -1 ? ' onclick="openLightbox(' + liIdx + ')"' : '') + '>';
        } else { c1.style.display = 'none'; }
        duo.appendChild(c1);
        // ② 御朱印（あれば表示、なければ募集中）
        var c2 = document.createElement('div');
        duo.appendChild(c2);
        var name = s.name;
        if (typeof resolveGoshuin === 'function') resolveGoshuin(name);
        var tries = 0;
        (function poll(){
          if (!document.getElementById('wabiSdDuo')) return;
          var v = (typeof goshuinFileCache !== 'undefined') ? goshuinFileCache[name] : undefined;
          if (typeof v === 'string' && v !== '__loading') {
            c2.innerHTML = '<div style="position:relative;background:#fff;border:1px solid #c9a84c;border-radius:10px;overflow:hidden">'
              + '<img src="' + v + '" loading="lazy" style="width:100%;aspect-ratio:1/1;object-fit:contain;display:block;background:#fff">'
              + '<span style="position:absolute;top:6px;left:6px;background:#a83320;color:#fff;font-size:10px;padding:2px 10px;border-radius:12px;font-family:\'Shippori Mincho\',serif">御朱印</span></div>';
            return;
          }
          if (v === false || tries > 16) {
            c2.innerHTML = (typeof goshuinPH === 'function') ? goshuinPH(name) : '';
            var im = c2.querySelector('img'); if (im) im.style.aspectRatio = '1/1';
            return;
          }
          tries++; setTimeout(poll, 250);
        })();
      } catch(e){}
    };
  }
})();

/* ══════════════════════════════════════════════════════════════
   ナビの出発地を「ルートの1番目の社」に固定する
   （2026-09-01 / concierge.js は触らず、この小さいファイルから上書き）

   ★何が起きていたか★
   これまでナビのURLは、出発地を神社の「名前（文字列）」で渡していた。
   Googleマップは名前から場所を特定できなかったとき、
   **黙って出発地を利用者の現在地に置き換える**。
   これが「最初に指定した神社からではなく、今いる場所から案内される」原因。

   ★直し方★
   出発地・経由地・目的地を、可能なかぎり「緯度,経度」で渡す。
   数字なので取り違えようがなく、現在地に化けることもない。
   座標が分からない地点だけ、これまでどおり名前で渡す。
   ══════════════════════════════════════════════════════════════ */
(function(){
  if (window.__wabiNavFix) return;
  window.__wabiNavFix = true;

  function clean(s){ return String(s || '').replace(/[（(].*$/, '').trim(); }

  // 画面に出ている可能性のあるルートを全部集める
  function allRoutes(){
    var out = [];
    try { if (Array.isArray(window._dynamicRoutes)) out = out.concat(window._dynamicRoutes); } catch(e){}
    try { if (Array.isArray(window.AI_ROUTES))      out = out.concat(window.AI_ROUTES); } catch(e){}
    return out;
  }

  // いま画面に出ているルート（1番目の社の名前から突き止める）
  var currentRoute = null;
  function setCurrentRoute(firstName){
    var n = clean(firstName), rs = allRoutes();
    currentRoute = null;
    for (var i = 0; i < rs.length; i++){
      var sp = rs[i] && rs[i].spots && rs[i].spots[0];
      if (sp && clean(sp.name) === n) { currentRoute = rs[i]; return; }
    }
  }

  // 名前から座標を探す
  //   ① いま開いているルート → 他のルート  ② 全国の座標表 SHRINE_COORDS
  // 内蔵データに座標が無い地点（飲食店・カフェなど）は、
  // Googleに一度だけ問い合わせて座標を控えておく。
  //   ここが空のままだと、Googleマップに「名前」を渡すことになり、
  //   同じ名前の店が複数あると経路を確定できず、入力画面のまま止まってしまう。
  var PT_CACHE = {};    // 「名前」→「緯度,経度」
  var PT_TRIED = {};    // 問い合わせ済みの印（同じ店を何度も聞かない）
  window.wabiPtCache = PT_CACHE;

  // いずれも**完全一致だけ**。見つかれば「緯度,経度」を返す。
  function coordOf(name){
    var n = clean(name);
    if (!n) return null;
    var i, j;

    // ⓪ Googleに問い合わせて分かった座標（飲食店など、内蔵データに無いもの）
    if (PT_CACHE[n]) return PT_CACHE[n];

    // ① ルートのデータ（Placesで取った正確な座標が入っている）
    //
    // ★ここも完全一致だけにする★
    //   以前は部分一致も採っていたため、「伊勢神宮（内宮）」を探しているのに
    //   別のルートの「伊勢神宮 外宮」を掴んで、出発地が入れ替わってしまっていた。
    //   さらに、いま開いているルートを最優先で見る。
    var rs = allRoutes();
    if (currentRoute && currentRoute.spots) rs = [currentRoute].concat(rs);
    for (i = 0; i < rs.length; i++){
      var spots = (rs[i] && rs[i].spots) || [];
      for (j = 0; j < spots.length; j++){
        var sp = spots[j];
        if (!sp) continue;
        if (typeof sp.lat !== 'number' || typeof sp.lng !== 'number') continue;
        if (clean(sp.name) === n) return sp.lat + ',' + sp.lng;
      }
    }

    // ② 全国の座標表（index.html の SHRINE_COORDS）
    //
    // ★以前は部分一致も採っていたが、これが事故のもとだった★
    //   例：「大神宮」→「東京大神宮」（東京）を掴んでしまい、
    //   伊勢のルートが関東まで伸びる、ということが起きる。
    //   なので**完全一致だけ**にする。
    try {
      if (typeof SHRINE_COORDS !== 'undefined' && SHRINE_COORDS){
        var keys = Object.keys(SHRINE_COORDS), k, c;
        for (i = 0; i < keys.length; i++){
          k = clean(keys[i]);
          if (k && k === n) { c = SHRINE_COORDS[keys[i]]; return c.lat + ',' + c.lng; }
        }
      }
    } catch(e){}

    return null;
  }

  // 2地点の距離（km）
  function distKm(a, b){
    if (!a || !b) return 0;
    var p = a.split(','), q = b.split(',');
    var la1 = +p[0], ln1 = +p[1], la2 = +q[0], ln2 = +q[1];
    if (!isFinite(la1) || !isFinite(la2)) return 0;
    var R = 6371, dLa = (la2-la1)*Math.PI/180, dLn = (ln2-ln1)*Math.PI/180;
    var x = Math.sin(dLa/2)*Math.sin(dLa/2)
          + Math.cos(la1*Math.PI/180)*Math.cos(la2*Math.PI/180)*Math.sin(dLn/2)*Math.sin(dLn/2);
    return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1-x));
  }

  // 1番目の社から遠すぎる地点は、拾い間違いとみなして捨てる
  var MAX_KM = 120;
  function sane(base, pt){
    if (!base || !pt) return true;
    if (!/^[-\d.]+,[-\d.]+$/.test(pt) || !/^[-\d.]+,[-\d.]+$/.test(base)) return true;
    return distKm(base, pt) <= MAX_KM;
  }

  // 住所を「都道府県＋市区町村」までに切り詰める（例：三重県伊勢市）
  function trimArea(v){
    var t = String(v || '').replace(/^日本[、,]?\s*/, '').replace(/〒[\d-]+\s*/, '').trim();
    var m = t.match(/^(.{2,3}[都道府県].{1,6}?[市区町村郡])/);
    if (m) return m[1];
    m = t.match(/^(.{2,3}[都道府県])/);
    if (m) return m[1];
    return t.replace(/\d.*$/, '').trim();
  }

  // 出発地の「地域」を取り出す（例：三重県伊勢市）。
  // 座標が分からない店などに付けて、遠くの同名店を掴まないようにする。
  function areaOf(firstName){
    var n = clean(firstName), rs = allRoutes(), i, j;
    for (i = 0; i < rs.length; i++){
      var spots = (rs[i] && rs[i].spots) || [];
      for (j = 0; j < spots.length; j++){
        if (spots[j] && clean(spots[j].name) === n) {
          var v = spots[j].loc || spots[j].addr || '';
          if (v) return trimArea(v);
        }
      }
    }
    try {
      if (typeof SHRINES !== 'undefined' && SHRINES){
        for (i = 0; i < SHRINES.length; i++){
          if (clean(SHRINES[i].name) === n && SHRINES[i].addr) return trimArea(SHRINES[i].addr);
        }
      }
    } catch(e){}
    return '';
  }

  // 座標が分からないときの「せめてもの手当て」。
  // 名前だけだと、Googleが同じ名前の別のお寺を掴んでしまう。
  // 住所が分かるならくっつけて、場所を絞り込む。
  function nameWithPlace(name){
    var n = clean(name);
    try {
      if (typeof SHRINES !== 'undefined' && SHRINES){
        // ★完全一致だけ★（部分一致だと別の県の同名社の住所が付いてしまう）
        for (var i = 0; i < SHRINES.length; i++){
          if (clean(SHRINES[i] && SHRINES[i].name) === n && SHRINES[i].addr)
            return n + ' ' + SHRINES[i].addr;
        }
      }
    } catch(e){}
    return n;
  }

  // 1番目の社の名前から、そのルートの交通手段を割り出す
  function transportOf(firstName){
    var n = clean(firstName), rs = allRoutes();
    for (var i = 0; i < rs.length; i++){
      var sp = rs[i] && rs[i].spots && rs[i].spots[0];
      if (sp && clean(sp.name) === n) return rs[i].transport || '';
    }
    return '';
  }
  function travelMode(t){
    if (t === '徒歩') return 'walking';
    if (t === '電車' || t === 'バス') return 'transit';
    return 'driving';
  }

  // 地点の並びからGoogleマップのURLを組み立てる
  function buildUrl(points, transport){
    var raw = (points || []).filter(Boolean);
    // 隣り合う地点がまったく同じだと、Googleが経路を出せず入力画面のまま止まる
    var p = [];
    for (var q = 0; q < raw.length; q++){
      if (q === 0 || String(raw[q]) !== String(raw[q - 1])) p.push(raw[q]);
    }
    if (!p.length) return null;
    if (p.length === 1) {
      return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(p[0]);
    }
    var way  = p.slice(1, -1).slice(0, 9);         // Googleの経由地は最大9つ
    var mode = travelMode(transport);

    // ★Googleマップの仕様★
    //   経由地（waypoints）は 車・徒歩・自転車 のみ対応。
    //   transit（電車・バス）と一緒に渡すと経路を出せず、
    //   入力画面のまま止まってしまう。その場合は travelmode を付けない。
    var u = 'https://www.google.com/maps/dir/?api=1'
          + '&origin=' + encodeURIComponent(p[0])
          + '&destination=' + encodeURIComponent(p[p.length - 1]);
    if (!(mode === 'transit' && way.length)) u += '&travelmode=' + mode;
    if (way.length) u += '&waypoints=' + way.map(encodeURIComponent).join('%7C');
    return u;
  }

  // 名前の並び → Googleに渡す地点の並び
  //   ・座標が分かればそれを使う
  //   ・1番目から遠すぎる座標は捨てる（拾い間違いよけ）
  //   ・座標が無いものは「名前＋地域」にして、遠くの同名店を掴まないようにする
  function resolvePoints(names){
    setCurrentRoute(names[0]);
    var base = coordOf(names[0]) || '';
    var area = areaOf(names[0]);
    return names.map(function(nm, i){
      var c = coordOf(nm);
      if (c && (i === 0 || sane(base, c))) return c;
      var withPlace = nameWithPlace(nm);
      if (withPlace !== clean(nm)) return withPlace;      // 住所が付いた
      return area ? (clean(nm) + ' ' + area) : clean(nm); // 地域名を足す
    });
  }
  window.resolvePointsPublic = resolvePoints;

  // ── 座標が分からない地点を、Googleに聞いて控えておく ──────
  //   ボタンを押した瞬間に問い合わせると、返事を待つ間に
  //   ポップアップがブロックされてしまうので、画面を開いた時点で先に済ませる。
  function placesReady(){
    return !!(window.google && google.maps && google.maps.places
              && google.maps.places.PlacesService);
  }
  var pSvc = null;
  function prefetchCoords(names){
    if (!names || !names.length || !placesReady()) return;
    if (!pSvc){
      try { pSvc = new google.maps.places.PlacesService(document.createElement('div')); }
      catch(e){ return; }
    }
    var base = coordOf(names[0]) || '';
    var area = areaOf(names[0]);
    var seen = {};
    names.forEach(function(nm){
      var n = clean(nm);
      if (!n || PT_CACHE[n] || PT_TRIED[n]) return;
      var c0 = coordOf(n);
      if (c0 && !seen[c0]) { seen[c0] = 1; return; }   // 座標が分かっていて重複もない
      // ここに来るのは
      //   ・座標が分からない（飲食店など）
      //   ・別の地点とまったく同じ座標になっている（内蔵データの取り違え）
      //     例：浅草寺と浅草神社が同じ緯度経度で登録されている
      PT_TRIED[n] = 1;
      var q = nameWithPlace(n);
      if (q === n && area) q = n + ' ' + area;   // 地域名を足して絞り込む
      try {
        pSvc.findPlaceFromQuery({ query: q, fields: ['geometry'] }, function(res, st){
          try {
            if (st !== google.maps.places.PlacesServiceStatus.OK || !res || !res[0]) return;
            var g = res[0].geometry && res[0].geometry.location;
            if (!g) return;
            var c = g.lat() + ',' + g.lng();
            if (base && !sane(base, c)) return;   // 出発地から遠すぎる＝別の店
            PT_CACHE[n] = c;
          } catch(e){}
        });
      } catch(e){}
    });
  }

  function namesInPreview(){
    return [].map.call(
      document.querySelectorAll('#wcPrevBody .wc-tl-nm'),
      function(n){ return String(n.textContent).trim(); }
    ).filter(Boolean);
  }

  // ── ① カスタマイズ済みルートの「このルートでナビを開始」 ──
  function bindNavi(){
    var btn = document.getElementById('wcNavi');
    if (!btn) return;
    btn.setAttribute('data-wapx', '1');     // concierge.js 側の上書きを止める
    btn.onclick = function(){
      var names = namesInPreview();
      if (!names.length) return;
      var pts = resolvePoints(names);
      var url = buildUrl(pts, transportOf(names[0]));
      if (url) window.open(url, '_blank');
    };
  }

  // ── ② ルート詳細ページの「このルートを作成」 ──
  function bindSelect(){
    var btn = document.getElementById('wrpSelect');
    if (!btn) return;
    btn.onclick = function(){
      var names = [].map.call(
        document.querySelectorAll('#wabiRoutePg .wrp-spot .wrp-spot-nm, #wabiRoutePg .wrp-spot-nm'),
        function(n){ return String(n.textContent).trim(); }
      ).filter(Boolean);
      if (!names.length) {
        // 画面から拾えないときは、開いているルートのデータから組み立てる
        var rs = allRoutes();
        for (var i = 0; i < rs.length; i++){
          if (rs[i] && rs[i].spots && rs[i].spots.length) { names = rs[i].spots.map(function(s){ return s.name; }); break; }
        }
      }
      if (!names.length) return;
      var pts = resolvePoints(names);
      var url = buildUrl(pts, transportOf(names[0]));
      if (url) window.open(url, '_blank', 'noopener');
    };
  }

  // 他の処理からも使えるように公開する（保存したルートの画面が使う）
  window.coordOfPublic = coordOf;
  window.navUrlPublic  = buildUrl;
  window.nameWithPlacePublic = nameWithPlace;

  // プレビューは開くたびに中身が作り直されるので、短い間隔で貼り直す
  function apply(){
    try { bindNavi(); bindSelect(); } catch(e){}
    // 画面を開いている間に、足りない座標を先読みしておく
    try {
      var pv = document.getElementById('wcPrev');
      if (pv && pv.style.display === 'block') prefetchCoords(namesInPreview());
      var rp = document.getElementById('wabiRoutePg');
      if (rp && rp.style.display !== 'none' && rp.offsetHeight > 0){
        prefetchCoords([].map.call(
          rp.querySelectorAll('.wrp-spot .nm, .wrp-spot-nm'),
          function(n){ return String(n.textContent).trim(); }
        ).filter(Boolean));
      }
    } catch(e){}
  }
  apply();
  setInterval(apply, 150);
})();

/* ══════════════════════════════════════════════════════════════
   下部メニュー（ホーム／マップ／みんなの投稿／マイページ）が
   AIルートの画面で効かなくなる問題の修正
   （2026-09-01）

   ★何が起きていたか★
   下部メニューを押すと concierge.js の closeAll() が走り、
   開いている画面を閉じてからホームやマップへ移動する。
   ところがその「閉じる対象の一覧」に
     ・pgAiRouteList（ルート提案ページ）
     ・pgAiLoading（作成中の画面）
     ・pgRouteMap ／ wcPrev ／ wcSpot ／ wcTheme
   が入っていなかった。
   そのためページが前面に残り続け、**押しても何も起きないように見えていた**。

   ★もうひとつの落とし穴★
   closeAll() は style.display='none' を直接書き込む。
   これらの画面は class="show" で表示する作りなので、
   一度 display:none を書かれると class を付け直しても開かなくなる。
   そこで、閉じるときは class を外し、display は空に戻す。
   ══════════════════════════════════════════════════════════════ */
(function(){
  if (window.__wabiNavClose) return;
  window.__wabiNavClose = true;

  // class="show" で開く画面（.ai-ov）
  var SHOW_PAGES = ['pgAiRouteList', 'pgAiLoading', 'pgRouteMap'];
  // style.display で開く画面
  var DISP_PAGES = ['wcPrev', 'wcSpot', 'wcTheme', 'wabiRoutePg'];

  function closeAiPages(){
    SHOW_PAGES.forEach(function(id){
      var el = document.getElementById(id);
      if (!el) return;
      el.classList.remove('show');
      el.style.display = '';          // 直接書かれた none を消す（また開けるように）
    });
    DISP_PAGES.forEach(function(id){
      var el = document.getElementById(id);
      if (el) el.style.display = 'none';
    });
  }
  window.wabiCloseAiPages = closeAiPages;

  // 下部メニューが押された瞬間に、concierge.js 側の処理より先に閉じる
  document.addEventListener('click', function(ev){
    try {
      var t = ev.target;
      if (!t || !t.closest) return;
      if (!t.closest('#wabiNav .wn')) return;
      closeAiPages();
    } catch(e){}
  }, true);   // true＝先に走らせる

  // 過去に display:none を書き込まれて開かなくなっている場合の復旧
  setInterval(function(){
    try {
      SHOW_PAGES.forEach(function(id){
        var el = document.getElementById(id);
        // 「開く指示（show）は出ているのに、直接 none が書かれている」状態を直す
        if (el && el.classList.contains('show') && el.style.display === 'none') el.style.display = '';
      });
    } catch(e){}
  }, 300);
})();

/* ══════════════════════════════════════════════════════════════
   マイページに「保存したルート」を追加する
   （2026-09-01 / index.html・concierge.js は触らずここから追加）

   ★これまでの状態★
   ・カスタマイズ済みルート画面の「♡ ルートを保存」
       → 端末の中には記録していたが、**見る画面がどこにも無かった**
   ・AI結果画面の「ルートを保存」
       → 中身が空で、メッセージを出すだけだった

   ここで、保存の中身をきちんと作り、マイページから一覧・ナビ・削除
   ができるようにする。保存先はこの端末の中だけ（localStorage）。
   ══════════════════════════════════════════════════════════════ */
(function(){
  if (window.__wabiSavedRoutes) return;
  window.__wabiSavedRoutes = true;

  var KEY     = 'wabi_saved_routes';   // 新しい保存先
  var OLD_KEY = 'wabi_custom_routes';  // 以前の「♡ ルートを保存」の記録

  function esc(s){
    return String(s == null ? '' : s)
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }
  function today(){
    var d = new Date();
    return d.getFullYear() + '.' + ('0'+(d.getMonth()+1)).slice(-2) + '.' + ('0'+d.getDate()).slice(-2);
  }
  function load(){
    var out = [];
    try { var a = JSON.parse(localStorage.getItem(KEY) || '[]'); if (Array.isArray(a)) out = a; } catch(e){}
    // 以前の形式の記録も、見えるように取り込む（一度だけ）
    try {
      var old = JSON.parse(localStorage.getItem(OLD_KEY) || '[]');
      if (Array.isArray(old) && old.length){
        old.forEach(function(o){
          if (!o || !o.name) return;
          if (out.some(function(x){ return x.name === o.name && x.date === (o.date || ''); })) return;
          out.push({ name:o.name, spots:[], added:o.added || [], transport:'', date:(o.date||'').replace(/-/g,'.') });
        });
        localStorage.setItem(KEY, JSON.stringify(out));
        localStorage.removeItem(OLD_KEY);
      }
    } catch(e){}
    return out;
  }
  function save(list){
    try { localStorage.setItem(KEY, JSON.stringify(list.slice(0, 50))); return true; }
    catch(e){ return false; }
  }
  function add(entry){
    var list = load();
    // 同じ内容が続けて入らないようにする
    var sig = entry.name + '|' + (entry.spots||[]).map(function(s){ return s.name; }).join(',');
    list = list.filter(function(x){
      return (x.name + '|' + (x.spots||[]).map(function(s){ return s.name; }).join(',')) !== sig;
    });
    list.unshift(entry);
    return save(list);
  }
  function toast(m){
    if (typeof showToast === 'function') showToast(m);
    else if (window.WABI_TOAST) window.WABI_TOAST(m);
  }

  // ── 保存する ────────────────────────────────────────────────
  // ① AI結果画面の「ルートを保存」（もともと中身が空だった）
  window.saveRoute = function(){
    try {
      var r = window.currentAiRoute;
      if (!r || !r.stops || !r.stops.length) { toast('保存できるルートがありません'); return; }
      var name = '';
      var t = document.getElementById('aiResultTitle');
      if (t) name = t.textContent.trim();
      if (!name) name = r.stops[0].name + ' からの巡礼';
      var ok = add({
        name: name,
        spots: r.stops.map(function(s){ return { name:s.name, lat:s.lat, lng:s.lng }; }),
        added: [], transport: '', date: today()
      });
      toast(ok ? '♡ マイページに保存しました' : '保存できませんでした（空き容量をご確認ください）');
    } catch(e){ toast('保存できませんでした'); }
  };

  // ② カスタマイズ済みルート画面の「♡ ルートを保存」
  //    画面に並んでいる順番のまま、座標つきで保存し直す
  function bindSave(){
    var btn = document.getElementById('wcSave');
    if (!btn || btn.getAttribute('data-wsv') === '1') return;
    btn.setAttribute('data-wsv', '1');
    btn.onclick = function(){
      try {
        var rows = [].map.call(document.querySelectorAll('#wcPrevBody .wc-tl-nm'),
                               function(n){ return String(n.textContent).trim(); }).filter(Boolean);
        if (!rows.length) { toast('保存できるルートがありません'); return; }
        var title = '';
        var h = document.querySelector('#wcPrevBody .wc-hero-t');
        if (h) title = h.textContent.replace(/\s+/g, ' ').trim();
        if (!title) title = rows[0] + ' からの巡礼';
        var spots = rows.map(function(nm){
          var c = (typeof window.coordOfPublic === 'function') ? window.coordOfPublic(nm) : null;
          var p = c ? c.split(',') : null;
          return p ? { name:nm, lat:+p[0], lng:+p[1] } : { name:nm };
        });
        var ok = add({ name:title, spots:spots, added:[],
                       transport:(window.WABI_ROUTE_TRANSPORT || ''), date:today() });
        toast(ok ? '♡ マイページに保存しました' : '保存できませんでした');
      } catch(e){ toast('保存できませんでした'); }
    };
  }

  // ── 一覧の画面 ──────────────────────────────────────────────
  var css = document.createElement('style');
  css.textContent = [
    '#wabiSaved{position:fixed;inset:0;z-index:2050;background:#FAF8F4;display:none;overflow-y:auto;}',
    '#wabiSaved .sv-hd{position:sticky;top:0;z-index:2;background:rgba(250,248,244,.96);backdrop-filter:blur(8px);',
      'display:flex;align-items:center;padding:14px 16px;border-bottom:1px solid #efe9dd;}',
    '#wabiSaved .sv-hd .b{font-size:22px;width:30px;cursor:pointer;color:#a83320;line-height:1;}',
    '#wabiSaved .sv-hd .t{flex:1;text-align:center;font-size:15px;font-weight:800;letter-spacing:.1em;}',
    '#wabiSaved .sv-in{max-width:500px;margin:0 auto;padding:18px 16px 110px;}',
    '#wabiSaved .sv-h{font-size:19px;font-weight:700;}',
    '#wabiSaved .sv-cnt{font-size:30px;font-weight:800;color:#5D3A7A;margin:2px 0 18px;}',
    '#wabiSaved .sv-cnt small{font-size:14px;margin-left:3px;color:#6F6F6F;}',
    '#wabiSaved .sv-card{background:#fff;border-radius:20px;box-shadow:0 8px 24px rgba(0,0,0,.06);',
      'padding:16px;margin-bottom:14px;}',
    '#wabiSaved .sv-nm{font-size:15px;font-weight:700;line-height:1.5;font-family:"Shippori Mincho",serif;}',
    '#wabiSaved .sv-dt{font-size:11px;color:#b8b2a6;margin-top:4px;}',
    '#wabiSaved .sv-sp{font-size:12.5px;color:#6b6355;line-height:1.9;margin-top:10px;}',
    '#wabiSaved .sv-btns{display:flex;gap:8px;margin-top:14px;}',
    '#wabiSaved .sv-b{flex:1;padding:11px 0;border-radius:12px;border:none;font-size:13px;font-weight:700;',
      'font-family:inherit;cursor:pointer;}',
    '#wabiSaved .sv-go{background:linear-gradient(135deg,#7a5aa8,#5a4470);color:#fff;}',
    '#wabiSaved .sv-del{background:#fff;border:1px solid #e0b0a8;color:#a83320;flex:0 0 92px;}',
    '#wabiSaved .sv-empty{text-align:center;color:#b8b2a6;font-size:13px;line-height:2;padding:50px 10px;}'
  ].join('');
  document.head.appendChild(css);

  var page = document.createElement('div');
  page.id = 'wabiSaved';
  page.innerHTML = '<div class="sv-hd"><div class="b" id="svBack">‹</div>'
    + '<div class="t">保存したルート</div><div style="width:30px"></div></div>'
    + '<div class="sv-in" id="svIn"></div>';
  document.body.appendChild(page);
  page.querySelector('#svBack').onclick = function(){ page.style.display = 'none'; };

  function render(){
    var list = load();
    var h = '<div class="sv-h">保存したルート</div>'
          + '<div class="sv-cnt">' + list.length + '<small>件</small></div>';
    if (!list.length){
      h += '<div class="sv-empty">まだ保存したルートがありません。<br>'
         + 'ルートの画面で「♡ ルートを保存」を押すと<br>ここに並びます。</div>';
    } else {
      h += list.map(function(r, i){
        var names = (r.spots || []).map(function(s){ return s.name; });
        if (!names.length && r.added && r.added.length) names = r.added.slice();
        return '<div class="sv-card">'
          + '<div class="sv-nm">' + esc(r.name) + '</div>'
          + '<div class="sv-dt">' + esc(r.date || '') + '</div>'
          + (names.length ? '<div class="sv-sp">' + names.map(function(n, j){
              return (j+1) + '. ' + esc(n); }).join('<br>') + '</div>' : '')
          + '<div class="sv-btns">'
          + '<button class="sv-b sv-go" data-go="' + i + '">ナビを開始 →</button>'
          + '<button class="sv-b sv-del" data-del="' + i + '">削除</button>'
          + '</div></div>';
      }).join('');
    }
    document.getElementById('svIn').innerHTML = h;

    document.querySelectorAll('#wabiSaved [data-go]').forEach(function(b){
      b.onclick = function(){
        var r = load()[+b.getAttribute('data-go')];
        if (!r) return;
        var pts = (r.spots || []).map(function(s){
          if (typeof s.lat === 'number' && typeof s.lng === 'number') return s.lat + ',' + s.lng;
          var c = (typeof window.coordOfPublic === 'function') ? window.coordOfPublic(s.name) : null;
          if (c) return c;
          return (typeof window.nameWithPlacePublic === 'function') ? window.nameWithPlacePublic(s.name) : s.name;
        });
        if (!pts.length) { toast('この記録には行き先が入っていません'); return; }
        var url = (typeof window.navUrlPublic === 'function') ? window.navUrlPublic(pts, r.transport) : null;
        if (url) window.open(url, '_blank');
      };
    });
    document.querySelectorAll('#wabiSaved [data-del]').forEach(function(b){
      b.onclick = function(){
        if (!confirm('この保存を削除しますか？')) return;
        var list = load();
        list.splice(+b.getAttribute('data-del'), 1);
        save(list); render();
      };
    });
  }

  function open(){ render(); page.style.display = 'block'; page.scrollTop = 0; }
  window.wabiOpenSavedRoutes = open;

  // ── マイページにカードを1枚足す ──────────────────────────────
  function addCard(){
    var wrap = document.querySelector('#wcMypage .mp-stats');
    if (!wrap) return;
    var exist = wrap.querySelector('[data-saved-routes]');
    if (exist){
      // ★必ず一番下に置く★
      //   concierge.js 側が既存6枚を並べ替えるので、放っておくと先頭に来てしまう。
      //   最後の1枚でなければ、末尾へ移し直す。
      if (wrap.lastElementChild !== exist) wrap.appendChild(exist);
      return;
    }
    var base = wrap.querySelector('.mp-stat');
    if (!base) return;
    var card = base.cloneNode(true);
    card.setAttribute('data-saved-routes', '1');
    card.removeAttribute('data-bg');
    card.style.background = '#3a3025 url(mp-follower.jpg) center/cover';   // 旧フォロワーの写真を流用
    var l = card.querySelector('.mp-stat-l');   if (l) l.textContent = '保存したルート';
    // アイコンも地図（ルート）のものに差し替える
    var ico = card.querySelector('.mp-stat-ic');
    if (ico) ico.innerHTML = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" '
      + 'stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">'
      + '<path d="m9 4-6 2v14l6-2 6 2 6-2V4l-6 2-6-2z"/><path d="M9 4v14"/><path d="M15 6v14"/></svg>';
    var v = card.querySelector('.mp-stat-v');
    if (v){ v.removeAttribute('data-count'); v.innerHTML = load().length + '<small>件</small>'; }
    card.onclick = function(ev){ ev.stopPropagation(); open(); };
    wrap.appendChild(card);
  }

  function tick(){
    try {
      bindSave();
      addCard();
      var c = document.querySelector('#wcMypage .mp-stats [data-saved-routes] .mp-stat-v');
      if (c) c.innerHTML = load().length + '<small>件</small>';
    } catch(e){}
  }
  tick();
  setInterval(tick, 500);
})();

/* ══════════════════════════════════════════════════════════════
   ・「♡ ルートを保存」を押したら、ハートを赤くして保存済みを示す
   ・ルート確認ページの下の余白を詰める
   （2026-09-01）
   ══════════════════════════════════════════════════════════════ */
(function(){
  if (window.__wabiSaveHeart) return;
  window.__wabiSaveHeart = true;

  var css = document.createElement('style');
  css.textContent = [
    // 保存済みのときのハート
    '#wcSave.wabi-saved{background:#fff !important;border:1.5px solid #d9534f !important;color:#d9534f !important;}',
    '#wcSave.wabi-saved .wabi-heart{color:#d9534f;}',
    '#wcSave .wabi-heart{margin-right:4px;}',
    // 押した瞬間の小さな鼓動
    '@keyframes wabiPop{0%{transform:scale(1)}40%{transform:scale(1.28)}100%{transform:scale(1)}}',
    '#wcSave.wabi-just .wabi-heart{display:inline-block;animation:wabiPop .42s ease;}',
    // ── ルート確認ページの下の余白を詰める ──
    //   下部メニュー（約60px）に隠れない分だけ残せば十分。96pxは空きすぎだった。
    '#wcPrev .wc-inner{padding-bottom:calc(var(--wabi-nav-h,60px) + 14px) !important;}',
    '#wcPrev .wc-inner > div:last-child{margin-bottom:14px !important;}'
  ].join('');
  document.head.appendChild(css);

  function savedList(){
    try { var a = JSON.parse(localStorage.getItem('wabi_saved_routes') || '[]'); return Array.isArray(a) ? a : []; }
    catch(e){ return []; }
  }
  // いま表示しているルートが保存済みか
  function isSaved(){
    try {
      var rows = [].map.call(document.querySelectorAll('#wcPrevBody .wc-tl-nm'),
                             function(n){ return String(n.textContent).trim(); }).filter(Boolean);
      if (!rows.length) return false;
      var sig = rows.join(',');
      return savedList().some(function(r){
        return (r.spots || []).map(function(s){ return s.name; }).join(',') === sig;
      });
    } catch(e){ return false; }
  }

  function paint(btn, justNow){
    if (!btn) return;
    var on = isSaved();
    btn.classList.toggle('wabi-saved', on);
    btn.innerHTML = '<span class="wabi-heart">' + (on ? '♥' : '♡') + '</span>'
                  + (on ? 'ルート保存済み' : 'ルートを保存');
    if (justNow) {
      btn.classList.add('wabi-just');
      setTimeout(function(){ btn.classList.remove('wabi-just'); }, 460);
    }
  }

  function bind(){
    var btn = document.getElementById('wcSave');
    if (!btn) return;
    // 保存処理が先に入るのを待つ（順番が入れ替わると保存が効かなくなるため）
    if (btn.getAttribute('data-wsv') !== '1') return;
    if (btn.getAttribute('data-whb') !== '1'){
      btn.setAttribute('data-whb', '1');
      var prev = btn.onclick;                       // 先に入っている保存処理
      btn.onclick = function(ev){
        if (typeof prev === 'function') { try { prev.call(btn, ev); } catch(e){} }
        setTimeout(function(){ paint(btn, true); }, 60);
      };
      paint(btn, false);
    } else {
      // 別のルートを開き直したときのために、状態だけ合わせ続ける
      var want = isSaved();
      if (btn.classList.contains('wabi-saved') !== want) paint(btn, false);
    }
  }
  setInterval(function(){ try { bind(); } catch(e){} }, 250);
  bind();
})();

/* ══════════════════════════════════════════════════════════════
   所要時間の見積もりを実際に近づける
   （2026-09-01）

   ★何が起きていたか★
   「7時間」を選んだのに、Googleマップで開くと移動だけで9時間になる。
   見積もりの計算に2つの甘さがあった。

   ① 距離を**直線距離**で測っていた
      実際の道のりは直線の 1.2〜1.4倍ある。山あいならもっと。
   ② 速度が現実離れしていた
      電車を時速25kmの一定としていたが、実際は
      駅までの徒歩・待ち時間・乗り換えが乗る。地方路線ならなおさら。

   その結果、入りきらない数の寺社を「7時間で回れます」と出していた。

   ★直し方★
   ・道のり ＝ 直線距離 × 交通手段ごとの係数
   ・速度は距離帯で変える（近距離は遅く、長距離は速く）
   ・乗降や駐車の手間を1区間ごとに足す
   ・そのうえで**選んだ時間に収まるところまでスポットを削る**
   ・画面に出す時間も、計算し直した値に差し替える
   ══════════════════════════════════════════════════════════════ */
(function(){
  if (window.__wabiTimeFix) return;
  window.__wabiTimeFix = true;

  // 交通手段ごとの現実的な見積もり
  //   detour : 直線距離を道のりに直す係数
  //   speed  : 道のり(km) → 時速(km/h)
  //   over   : 1区間ごとの手間（分）。駐車、駅までの徒歩、待ち、乗り換え
  //   min    : 1区間の最低所要（分）
  var MODE = {
    '徒歩': { detour:1.25, speed:function(){ return 4.5; },                 over:0,  min:3 },
    '車':   { detour:1.35, speed:function(km){ return km<5?22:km<20?32:km<50?45:55; }, over:6,  min:5 },
    'バス': { detour:1.35, speed:function(km){ return km<10?13:18; },        over:15, min:10 },
    '電車': { detour:1.25, speed:function(km){ return km<10?14:km<40?20:28; }, over:20, min:12 }
  };
  function modeOf(t){ return MODE[t] || MODE['電車']; }

  function legMin(km, transport){
    var m = modeOf(transport);
    var road = km * m.detour;
    var mins = road / m.speed(road) * 60 + m.over;
    return Math.max(m.min, mins);
  }
  window.wabiLegMin = legMin;

  function dist(a, b){
    if (typeof shrineDistKm === 'function') return shrineDistKm(a, b);
    return 0;
  }
  function hm(min){
    var t = Math.round(min);
    var h = Math.floor(t/60), m = Math.round((t%60)/5)*5;
    if (m === 60){ h++; m = 0; }
    if (h && m) return '約' + h + '時間' + m + '分';
    if (h)      return '約' + h + '時間';
    return '約' + Math.max(5, m) + '分';
  }
  function legLabel(min){
    var m = Math.round(min);
    if (m >= 60){ var h = Math.floor(m/60), mm = Math.round((m%60)/5)*5;
                  return mm ? ('約'+h+'時間'+mm+'分') : ('約'+h+'時間'); }
    return '約' + (m < 20 ? m : Math.round(m/5)*5) + '分';
  }

  // ルート1本を、選んだ時間に収まるように整え直す
  function retime(r, budgetMin, visitMin, transport){
    if (!r || !r.spots || r.spots.length < 2) return r;
    var spots = r.spots, keep = [spots[0]], used = visitMin, i, d, leg;
    for (i = 1; i < spots.length; i++){
      var a = keep[keep.length-1], b = spots[i];
      if (typeof a.lat !== 'number' || typeof b.lat !== 'number'){ keep.push(b); continue; }
      d = dist({lat:a.lat,lng:a.lng}, {lat:b.lat,lng:b.lng});
      leg = legMin(d, transport);
      // 2社目までは必ず入れる（1社だけの「ルート」にはしない）
      if (keep.length >= 2 && used + leg + visitMin > budgetMin) break;
      used += leg + visitMin;
      b.move = legLabel(leg);
      keep.push(b);
    }
    r.spots = keep;

    // 表示する時間を計算し直す
    var moveMin = 0;
    for (i = 1; i < keep.length; i++){
      var p = keep[i-1], q = keep[i];
      if (typeof p.lat !== 'number' || typeof q.lat !== 'number') continue;
      moveMin += legMin(dist({lat:p.lat,lng:p.lng}, {lat:q.lat,lng:q.lng}), transport);
    }
    r.time      = hm(moveMin + keep.length * visitMin);
    r.totalMove = '総移動時間 ' + hm(moveMin);
    r._moveMin  = Math.round(moveMin);
    r._stayMin  = keep.length * visitMin;
    return r;
  }

  // ★あとから足されるスポットにも効かせる★
  //   concierge.js には「スポット数が少ないと周辺の寺社を補充する」処理があり、
  //   せっかく削ったぶんを戻してしまう。定期的に見張って、はみ出したら削り直す。
  //   （すでに収まっていれば何も変わらないので、無駄な書き換えは起きない）
  function retimeAll(){
    try {
      var routes = window._dynamicRoutes;
      if (!routes || !routes.length) return;
      // ★手書きの10ルート（このファイルの上のほうで定義しているもの）は触らない★
      //   あちらは所要時間も人が書いたもの。AIが組んだルートだけを対象にする。
      if (!window._aiSelTime) return;
      var b = (typeof aiBudgetFor === 'function') ? aiBudgetFor(window._aiSelTime) : null;
      if (!b) return;
      routes.forEach(function(r){
        if (!r || !r._wabiDyn) return;
        retime(r, b.budgetMin, b.visitMin, r.transport || window._aiSelTrans || '電車');
      });
    } catch(e){}
  }
  window.wabiRetimeAll = retimeAll;
  setInterval(retimeAll, 800);

  // index.html の buildDynamicRoutes を包んで、返ってきたルートを整え直す
  var orig = window.buildDynamicRoutes;
  if (typeof orig === 'function'){
    window.buildDynamicRoutes = function(base, baseCoord, candidates, selTime, selTrans, budget){
      var routes = orig.apply(this, arguments);
      try {
        var b = budget || (typeof aiBudgetFor === 'function' ? aiBudgetFor(selTime) : null);
        if (!b || !routes || !routes.length) return routes;
        routes.forEach(function(r){
          r._wabiDyn = true;                       // AIが組んだルートの目印
          retime(r, b.budgetMin, b.visitMin, r.transport || selTrans);
        });
      } catch(e){}
      return routes;
    };
  }
})();




/* ══════════════════════════════════════════════════════════════
   ホーム画面のアイコンが横に潰れる問題の修正
   （2026-09-01）

   ★何が起きていたか★
   アイコンとして指定していた画像が**正方形ではなかった**（縦長だった）。
   iOSはホーム画面のアイコンを必ず正方形に引き伸ばすので、
   丸いはずの白い部分が横長の楕円に潰れていた。

   もうひとつ、その画像は別のリポジトリ（SIMBA3838/shrine-app）を
   参照していて、いつ消えてもおかしくない状態でもあった。

   ★直し方★
   **絵柄はそのまま**に、180×180の正方形・透明なしで作り直し、
   このファイルの中に埋め込んだ。外部を見に行かないので消える心配もない。
   （透明を残すと iOS が透明部分を黒で塗るため、透明も無くしてある）
   ══════════════════════════════════════════════════════════════ */
(function(){
  if (window.__wabiIconFix) return;
  window.__wabiIconFix = true;

  var ICON = 'data:image/png;base64,' + [
    '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',
    ''].join('');

  function apply(){
    try {
      var olds = document.querySelectorAll(
        'link[rel="apple-touch-icon"], link[rel="apple-touch-icon-precomposed"]');
      [].forEach.call(olds, function(el){
        if (el.getAttribute('data-wabi-icon') === '1') return;
        el.parentNode && el.parentNode.removeChild(el);
      });
      if (document.querySelector('link[data-wabi-icon="1"]')) return;

      [180, 167, 152, 120].forEach(function(sz){
        var l = document.createElement('link');
        l.rel = 'apple-touch-icon';
        l.setAttribute('sizes', sz + 'x' + sz);
        l.href = ICON;
        l.setAttribute('data-wabi-icon', '1');
        document.head.appendChild(l);
      });
      // Android・PWA用
      var big = document.createElement('link');
      big.rel = 'icon'; big.type = 'image/png';
      big.setAttribute('sizes', '192x192');
      big.href = ICON; big.setAttribute('data-wabi-icon', '1');
      document.head.appendChild(big);
    } catch(e){}
  }
  apply();
  var n = 0;
  var iv = setInterval(function(){ apply(); if (++n > 10) clearInterval(iv); }, 700);
})();

/* ============================================================
   __wabiUrlClean : LINEログイン後にURLへ残る認証パラメータを消す
   (state / code / liffClientId / liffRedirectUri など)
   LIFF SDK がパラメータを使い終わってから消すので、ログインは壊れない
   ============================================================ */
(function(){
  if (window.__wabiUrlClean) return;
  window.__wabiUrlClean = true;

  var JUNK = ['code','state','liffClientId','liffRedirectUri','liffReferer',
              'error','error_description','friendship_status_changed'];

  function params(){
    try { return new URLSearchParams(location.search || ''); } catch(e){ return null; }
  }

  function junkCount(){
    var q = params(); if (!q) return 0;
    var n = 0;
    for (var i = 0; i < JUNK.length; i++) if (q.has(JUNK[i])) n++;
    return n;
  }

  function strip(){
    try {
      var q = params(); if (!q) return;
      var changed = false;
      for (var i = 0; i < JUNK.length; i++){
        if (q.has(JUNK[i])) { q.delete(JUNK[i]); changed = true; }
      }
      if (!changed) return;
      var rest = q.toString();
      var url = location.pathname + (rest ? '?' + rest : '') + (location.hash || '');
      history.replaceState(null, '', url);
    } catch(e){}
  }

  if (!junkCount()) return;

  // 認証コードが無ければ SDK が使うものは何も残っていない → すぐ消してよい
  var hasCode = false;
  try { hasCode = !!(params() && params().get('code')); } catch(e){}
  if (!hasCode){ setTimeout(strip, 1200); return; }

  // 認証コードがある場合は LIFF SDK が処理し終わるのを待つ
  var t0 = Date.now();
  var iv = setInterval(function(){
    var ready = false;
    try {
      if (window.liff && typeof liff.isLoggedIn === 'function') ready = !!liff.isLoggedIn();
    } catch(e){ ready = false; }        // init 前は例外 → まだ待つ
    if (ready || (Date.now() - t0) > 12000){
      clearInterval(iv);
      strip();
    }
  }, 300);
})();

/* ══════════════════════════════════════════════════════════════
   ② わびなびおすすめ巡拝ルート：周辺スポットの写真が出ないのを直す
   原因：写真の取得を「開いた直後」と「1.5秒後」の2回しか試しておらず、
        Googleマップの部品の読み込みが遅い回線だと2回とも空振りして
        そのまま二度と取りに行かなかった。
   対策：Googleの部品が使えるようになるまで待って、最大3回まで取り直す。
   （2026-09-01）
   ══════════════════════════════════════════════════════════════ */
(function(){
  if (window.__wabiSpotPhoto2) return;
  window.__wabiSpotPhoto2 = true;

  var MAX_TRY = 3;
  var svc = null;

  function ready(){
    return !!(window.google && window.google.maps && google.maps.places
              && google.maps.places.PlacesService);
  }

  function hasPhoto(card){
    var im = card.querySelector('.im');
    return !!(im && /url\(/i.test(im.style.backgroundImage || ''));
  }

  function unhideFilledSections(){
    try {
      document.querySelectorAll('#wabiRoutePg .wrp-scroll').forEach(function(sc){
        var vis = 0;
        sc.querySelectorAll('.wpc').forEach(function(c){ if (c.style.display !== 'none') vis++; });
        var sec = sc.closest ? sc.closest('.wrp-sec') : null;
        if (sec && vis) sec.style.display = '';
      });
    } catch(e){}
  }

  function fill(){
    var pg = document.getElementById('wabiRoutePg');
    if (!pg || pg.style.display === 'none') return;      // 記事ページを開いている時だけ
    var cards = pg.querySelectorAll('.wpc[data-q]');
    if (!cards.length) return;
    if (!ready()) return;                                 // Googleの部品待ち（次の巡回で再挑戦）
    if (!svc) { try { svc = new google.maps.places.PlacesService(document.createElement('div')); } catch(e){ return; } }

    Array.prototype.forEach.call(cards, function(card){
      if (hasPhoto(card)) return;                         // すでに写真あり
      if (card.getAttribute('data-wbusy')) return;        // 問い合わせ中
      var tried = parseInt(card.getAttribute('data-wtry') || '0', 10);
      if (tried >= MAX_TRY) return;                       // 3回試してだめならアイコンのまま
      card.setAttribute('data-wtry', String(tried + 1));
      card.setAttribute('data-wbusy', '1');

      var q = card.getAttribute('data-q') || '';
      try {
        svc.findPlaceFromQuery(
          { query: q, fields: ['photos', 'rating', 'user_ratings_total'] },
          function(res, st){
            card.removeAttribute('data-wbusy');
            var ok = (st === google.maps.places.PlacesServiceStatus.OK && res && res[0]);
            if (!ok) return;
            card.setAttribute('data-wtry', String(MAX_TRY));   // 結果が返ったら打ち止め
            var p = res[0];
            if (p.photos && p.photos.length){
              var im = card.querySelector('.im');
              if (im){
                im.style.backgroundImage = 'url(' + p.photos[0].getUrl({ maxWidth: 400 }) + ')';
                im.textContent = '';
              }
            }
            var rt = card.querySelector('.rt');
            if (rt && !rt.textContent && p.rating){
              rt.innerHTML = '★ ' + p.rating.toFixed(1)
                + (p.user_ratings_total ? ' <span>(' + p.user_ratings_total.toLocaleString() + ')</span>' : '');
            }
            if (card.style.display === 'none' && !p.rating) card.style.display = '';
            unhideFilledSections();
          }
        );
      } catch(e){ card.removeAttribute('data-wbusy'); }
    });
  }

  setInterval(fill, 1200);
})();


/* ══════════════════════════════════════════════════════════════
   ③ おすすめ神社ランキング：タグを押しただけでは切り替えず、
      金色の「この条件で検索する」を押したときに反映する
   （2026-09-01）
   ══════════════════════════════════════════════════════════════ */
(function(){
  if (window.__wabiSearchGate) return;
  window.__wabiSearchGate = true;

  var css = document.createElement('style');
  css.textContent = [
    '@keyframes wabiSrchPulse{0%,100%{transform:scale(1);box-shadow:inset 0 0 0 1px rgba(255,255,255,.4),0 4px 14px -4px rgba(169,138,56,.65)}',
    '50%{transform:scale(1.02);box-shadow:inset 0 0 0 1px rgba(255,255,255,.55),0 8px 22px -4px rgba(169,138,56,.95)}}',
    '.btn-search.wabi-wait{animation:wabiSrchPulse 1.1s ease-in-out 2;}'
  ].join('');
  (document.head || document.documentElement).appendChild(css);

  var hold = 0;

  // concierge.js が後から window.filter を差し替えるので、
  // 見張って毎回かぶせ直す（かぶせ済みなら何もしない）
  function install(){
    var f = window.filter;
    if (typeof f !== 'function' || f.__wgate) return;
    var wrapped = function(){
      if (hold) return;                  // タグを押した流れの中では描き替えない
      return f.apply(this, arguments);
    };
    wrapped.__wgate = true;
    wrapped.__orig  = f;
    window.filter = wrapped;
  }
  install();
  setInterval(install, 400);

  // タグ（すべて／神社／お寺／御朱印…）を押したときだけ、少しの間だけ止める
  document.addEventListener('click', function(e){
    var t = e.target, tag = null;
    while (t && t !== document){
      if (t.classList && t.classList.contains('tag')) { tag = t; break; }
      t = t.parentNode;
    }
    if (!tag || !tag.closest || !tag.closest('.tagrow')) return;
    hold++;
    setTimeout(function(){ if (hold > 0) hold--; }, 150);
    var btn = document.querySelector('.btn-search');
    if (btn){
      btn.classList.remove('wabi-wait');
      void btn.offsetWidth;
      btn.classList.add('wabi-wait');
    }
  }, true);

  // 金色のボタンは必ず素通しで実行する
  document.addEventListener('click', function(e){
    var t = e.target, btn = null;
    while (t && t !== document){
      if (t.classList && t.classList.contains('btn-search')) { btn = t; break; }
      t = t.parentNode;
    }
    if (!btn) return;
    hold = 0;
    btn.classList.remove('wabi-wait');
  }, true);
})();


/* ══════════════════════════════════════════════════════════════
   ④ ツアー特集の「PR」バッジ：白い下地でタイトルが読めないのを直す
      デザインはそのまま、下地を薄くして文字が透ける
   （2026-09-01）
   ══════════════════════════════════════════════════════════════ */
(function(){
  if (window.__wabiPrBadge) return;
  window.__wabiPrBadge = true;

  var RULES = [
    'html body span.wabi-pr,',
    'html body #pgHome span.wabi-pr,',
    'html body.wabi-top #pgHome span.wabi-pr{',
    '  background:rgba(255,255,255,.38) !important;',
    '  color:#7A6E60 !important;',
    '  font-size:9.5px !important;',
    '  font-weight:700 !important;',
    '  letter-spacing:.04em !important;',
    '  padding:1px 5px !important;',
    '  border-radius:7px !important;',
    '  top:4px !important; right:4px !important;',
    '  text-shadow:0 0 3px #fff,0 0 2px #fff !important;',
    '  -webkit-backdrop-filter:blur(1px); backdrop-filter:blur(1px);',
    '  border:0 !important; box-shadow:none !important;',
    '}'
  ].join('\n');

  function put(){
    var old = document.getElementById('wabiPrBadgeCss');
    if (old) old.parentNode.removeChild(old);
    var s = document.createElement('style');
    s.id = 'wabiPrBadgeCss';
    s.textContent = RULES;
    (document.head || document.documentElement).appendChild(s);   // 常に最後に置き直す
  }
  put();
  var n = 0;
  var iv = setInterval(function(){ put(); if (++n > 12) clearInterval(iv); }, 900);
})();


/* ══════════════════════════════════════════════════════════════
   ⑤ ログアウト中は、名前とアイコンを既定の見た目に戻す（2026-09-01 改訂）

   前回の版はログイン→ログアウトの「切り替わった瞬間」だけを見ていたため、
   すでにログアウト済みの端末（前回ログアウトしたあとに読み込んだ場合）では
   何も起きず、ヘッダーに名前とアイコンが残ったままだった。

   今回は保存データを消さず、ログアウト中だけ
   wabiName / wabiAvatar / wabiNameMine / wabiAvatarMine を
   「読めない」状態にする（マスクする）方式に変更した。
     ・concierge.js の __wabiMineProfile は「名前があるとき」だけ
       ヘッダーを塗り替えるので、読めなくなれば塗り替えない
     ・マイページの apply() も既定表示になる
     ・保存データ自体は残るので、ログインし直せばそのまま戻る
   ══════════════════════════════════════════════════════════════ */
(function(){
  if (window.__wabiLogoutProfile2) return;
  window.__wabiLogoutProfile2 = true;

  var MASK = { wabiName:1, wabiAvatar:1, wabiNameMine:1, wabiAvatarMine:1 };
  var DEFAULT_NAME = '巡礼者 太郎';
  var PERSON_BIG = '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#fff" '
    + 'stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">'
    + '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>'
    + '<circle cx="12" cy="7" r="4"></circle></svg>';
  var PERSON_SM = '<svg viewBox="0 0 20 20" fill="none">'
    + '<circle cx="10" cy="6.5" r="3.2" stroke="currentColor" stroke-width="1.6"/>'
    + '<path d="M3.5 17c0-3.6 13-3.6 13 0" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>';

  var _get = localStorage.getItem.bind(localStorage);

  // ログイン判定は何度も呼ばれるので 250ms だけ結果を使い回す
  var cache = false, cacheAt = 0;
  function loggedIn(){
    var t = Date.now();
    if (t - cacheAt < 250) return cache;
    cacheAt = t;
    try {
      var u = JSON.parse(_get('wabiUser') || 'null');
      cache = !!(u && u.id);
    } catch(e){ cache = false; }
    return cache;
  }

  // ★ログアウト中は名前と写真を「無い」ことにする（消しはしない）
  localStorage.getItem = function(k){
    if (MASK[k] === 1 && !loggedIn()) return null;
    return _get(k);
  };

  function resetDom(){
    try {
      // マイページのアイコン
      var box = document.querySelector('#wcMypage .mp-av');
      if (box){
        var im = box.querySelector('img');
        if (im && im.parentNode) im.parentNode.removeChild(im);
        if (!box.querySelector('svg')) box.insertAdjacentHTML('afterbegin', PERSON_BIG);
        box.classList.remove('has-photo');
      }
      // マイページの名前
      var nmEl = document.querySelector('#wcMypage .mp-name');
      if (nmEl){
        var now = (nmEl.textContent || '').replace(/\s*✎\s*$/, '').trim();
        if (now && now !== DEFAULT_NAME){
          nmEl.innerHTML = DEFAULT_NAME + '<span class="wp-pen">✎</span>';
        }
      }
      // ヘッダーのボタンは __wabiHeaderBtn が一手に引き受ける（二重に書くとチカチカするため）
    } catch(e){}
  }

  /* ── 見張り役をここ1か所にまとめる（2026-09-02）──────────────
     これまでは 0.4秒ごとに見に行って直していたため、
     他の処理が名前を書く → 0.4秒後にこちらが書き直す、をくり返し、
     ログイン名と「巡礼者 太郎」が交互に表示されていた。
     画面の書き換えを検知して“画面に出る前”に直す方式に変更。
     これなら書き直しが目に見えない。                            */
  var busy = false;
  function fixNow(){
    if (busy) return;
    if (loggedIn()) return;
    busy = true;
    try { resetDom(); } catch(e){}
    busy = false;
  }

  var watched = false;
  function attach(){
    var pg = document.getElementById('wcMypage');
    if (!pg || watched) { fixNow(); return; }
    watched = true;
    try {
      new MutationObserver(fixNow).observe(pg, {
        childList: true, subtree: true, characterData: true
      });
    } catch(e){ watched = false; }
    fixNow();
  }

  attach();
  setInterval(attach, 800);   // 取りこぼし用のゆっくりした見回り
})();

/* ══════════════════════════════════════════════════════════════
   「もっと見る」を押すと、古い見た目や別の写真が一瞬出てから
   今のデザインに切り替わるのを直す

   原因：ページを開く関数（openSeasonList など）が、開くたびに
        中身を古い形で描き直していた。完成版は別の処理が
        最大0.8秒後に描き直すので、その差が見えていた。
   対策：完成版がすでに入っているときは、開く関数に中身を
        触らせない（一時的に id を外して見つけられなくする）。
        写真も描き直されないので、別の写真に入れ替わることもない。
   （2026-09-01）
   ══════════════════════════════════════════════════════════════ */
(function(){
  if (window.__wabiKeepList) return;
  window.__wabiKeepList = true;

  // fn : 開く関数の名前 / el : 中身の入れ物 / ok : 完成版のしるし
  var LIST = [
    { fn:'openSeasonList',  el:'seasonListFull',  ok:'.wev-card'  },  // この時期おすすめイベント
    { fn:'openEcList',      el:'ecGridFull',      ok:'.wgd-btn'   },  // 御朱印グッズ
    { fn:'openTourList',    el:'tourListFull',    ok:'.tour-card' },  // ツアー特集
    { fn:'openOsupplyList', el:'osupplyGridFull', ok:'.tour-card' }   // 参拝のお供
  ];

  function wrap(t){
    var f = window[t.fn];
    if (typeof f !== 'function' || f.__wkeep) return;

    var wrapped = function(){
      var el = null;
      try { el = document.getElementById(t.el); } catch(e){}
      // 完成版がまだ無い（読み込み直後など）ときは、いつも通り描かせる
      if (!el || !el.querySelector(t.ok)) return f.apply(this, arguments);

      // 完成版が入っている：一瞬だけ id を外して、描き直しをさせない
      var id = el.id;
      el.id = id + '__wkeep';
      try {
        return f.apply(this, arguments);
      } finally {
        el.id = id;
      }
    };
    wrapped.__wkeep = true;
    wrapped.__orig  = f;
    window[t.fn] = wrapped;
  }

  function install(){ for (var i = 0; i < LIST.length; i++) wrap(LIST[i]); }
  install();
  setInterval(install, 400);   // concierge.js が後から差し替えても かぶせ直す
})();

/* ══════════════════════════════════════════════════════════════
   マイページのカードを組み直す（2026-09-01）
   ① 「参拝した神社」→「参拝した神社仏閣」（お寺も数に入る）
   ② 「フォロー」と「フォロワー」を1枚にまとめ、
      中身は「フォロー中」「フォロワー」の2つだけ（おすすめ／リクエストは廃止）
   ③ 「フォロワー」のカードを外し、その位置に「保存したルート」を置く
      （カードの写真は旧フォロワーの mp-follower.jpg をそのまま使う）

   concierge.js は文字（ラベル）でカードを見分けているため、名前を変えると
   写真・並び順・数字・タップ先の紐づけが外れる。そこでこの4つは
   こちら側で引き受け直している。
   ══════════════════════════════════════════════════════════════ */
(function(){
  if (window.__wabiMypageCards3) return;
  window.__wabiMypageCards3 = true;

  var L_VISIT  = '参拝した神社仏閣';
  var L_PEOPLE = 'フォロー・フォロワー';
  var L_SAVED  = '保存したルート';

  var ORDER = ['御朱印', L_VISIT, 'お気に入りの神社仏閣', '投稿した記録', L_PEOPLE, L_SAVED];

  function labelOf(c){
    var l = c.querySelector('.mp-stat-l');
    return l ? l.textContent.trim() : '';
  }
  function cardByLabel(wrap, txt){
    var out = null;
    wrap.querySelectorAll('.mp-stat').forEach(function(c){ if (labelOf(c) === txt) out = c; });
    return out;
  }

  /* ── ① 参拝した神社仏閣：件数（お寺もふくむ）─────────────── */
  function visitedCount(){
    var rec = [];
    try { rec = JSON.parse(localStorage.getItem('wabiVisits') || '[]') || []; } catch(e){}
    var n = rec.length;
    try {
      if (typeof SHRINES !== 'undefined' && SHRINES && SHRINES.length){
        SHRINES.forEach(function(s){
          if (!s || !s.visited) return;
          for (var i = 0; i < rec.length; i++) if (rec[i] && rec[i].name === s.name) return;
          n++;                       // 神社・お寺の区別なく数える
        });
      }
    } catch(e){}
    return n;
  }

  function openVisitedPage(){
    var map = window.wabiOpenList || {};
    var f = map['参拝した神社'];
    if (typeof f !== 'function') return;
    f();
    // 開いたページの見出しも「神社仏閣」に直す
    setTimeout(function(){
      var pg = document.getElementById('wabiListPg');
      if (!pg) return;
      var t = pg.querySelector('.wlp-hd .t');  if (t) t.textContent = L_VISIT;
      var h = pg.querySelector('.wlp-h');      if (h) h.textContent = L_VISIT;
      var u = pg.querySelector('.wlp-cnt small'); if (u) u.textContent = 'ヶ所';
    }, 0);
  }

  /* ── ② フォロー・フォロワーを1ページにまとめる ─────────── */
  function openPeoplePage(which){
    var map = window.wabiOpenList || {};
    var f = (which === 'follower') ? map['フォロワー'] : map['フォロー'];
    if (typeof f !== 'function') return;
    f();
    setTimeout(function(){
      var pg = document.getElementById('wabiListPg');
      if (!pg) return;
      var t = pg.querySelector('.wlp-hd .t'); if (t) t.textContent = L_PEOPLE;
      var h = pg.querySelector('.wlp-h');
      if (h) h.textContent = (which === 'follower') ? 'フォロワー' : 'フォロー中';
      var tabs = pg.querySelectorAll('.wlp-tabs .tb');
      if (tabs.length < 2) return;
      tabs[0].textContent = 'フォロー中';
      tabs[1].textContent = 'フォロワー';
      tabs[0].classList.toggle('on', which !== 'follower');
      tabs[1].classList.toggle('on', which === 'follower');
      tabs[0].onclick = function(){ openPeoplePage('follow');    };
      tabs[1].onclick = function(){ openPeoplePage('follower');  };
    }, 0);
  }
  function n(k){ try { var a = JSON.parse(localStorage.getItem(k) || '[]'); return Array.isArray(a) ? a.length : 0; } catch(e){ return 0; } }
  // カードには「フォロー中／フォロワー」を並べて出す（合計だと意味が分からなくなるため）
  function peopleValueHtml(){
    return n('wabiFollowing') + '<small>／</small>' + n('wabiFollowers') + '<small>人</small>';
  }

  /* ── カードを組み直す ──────────────────────────────────── */
  function takeOver(card, label, unit, countFn, openFn, bgFile){
    var l = card.querySelector('.mp-stat-l');
    if (l && l.textContent.trim() !== label) l.textContent = label;
    if (bgFile){
      card.removeAttribute('data-bg');
      card.style.background = '#3a3025 url(' + bgFile + ') center/cover';
    }
    var v = card.querySelector('.mp-stat-v');
    if (v){
      var html = (unit === null) ? countFn() : (countFn() + (unit ? '<small>' + unit + '</small>' : ''));
      v.removeAttribute('data-count');
      if (v.innerHTML !== html) v.innerHTML = html;
    }
    if (!card.getAttribute('data-wtake')){
      card.setAttribute('data-wtake', '1');
      card.setAttribute('data-wlp', '1');       // concierge 側の紐づけを止める
      card.removeAttribute('data-tap');         // 「準備中です」を止める
      card.addEventListener('click', function(ev){ ev.stopPropagation(); openFn(); }, true);
    }
  }

  function run(){
    var wrap = document.querySelector('#wcMypage .mp-stats');
    if (!wrap) return;

    // ③ フォロワーのカードは外す（その場所は「保存したルート」が入る）
    var fw = cardByLabel(wrap, 'フォロワー');
    if (fw && fw.parentNode) fw.parentNode.removeChild(fw);

    // ① 参拝した神社 → 参拝した神社仏閣
    var v = cardByLabel(wrap, L_VISIT) || cardByLabel(wrap, '参拝した神社');
    if (v) takeOver(v, L_VISIT, 'ヶ所', visitedCount, openVisitedPage, 'mp-sanpai.jpg');

    // ② フォロー → フォロー・フォロワー
    var p = cardByLabel(wrap, L_PEOPLE) || cardByLabel(wrap, 'フォロー');
    if (p) takeOver(p, L_PEOPLE, null, peopleValueHtml, function(){ openPeoplePage('follow'); }, 'mp-follow.jpg');

    // 並び順を整える（concierge 側は名前が変わって並べ替えできないため）
    var have = {};
    wrap.querySelectorAll('.mp-stat').forEach(function(c){ have[labelOf(c)] = c; });
    for (var i = 0; i < ORDER.length; i++) if (!have[ORDER[i]]) return;   // 揃うまで待つ

    var same = true;
    for (var j = 0; j < ORDER.length; j++){
      if (wrap.children[j] !== have[ORDER[j]]) { same = false; break; }
    }
    if (!same){
      for (var k = 0; k < ORDER.length; k++) wrap.appendChild(have[ORDER[k]]);
    }
    wrap.setAttribute('data-ordered', '1');
  }

  // マイページを開いた直後にも即座に整える（一瞬だけ古い並びが見えないように）
  function hook(){
    if (typeof window.openWabiMypage !== 'function' || window.openWabiMypage.__wmc) return;
    var orig = window.openWabiMypage;
    var wrapped = function(){
      var r = orig.apply(this, arguments);
      [0, 60, 150, 300, 600, 1000].forEach(function(ms){ setTimeout(run, ms); });
      return r;
    };
    wrapped.__wmc = true;
    window.openWabiMypage = wrapped;
  }

  hook();
  run();
  setInterval(function(){ hook(); run(); }, 400);
})();

/* ══════════════════════════════════════════════════════════════
   AIルート作成：「神社中心」を選んでもお寺ばかり出る問題（2026-09-01）

   原因（3つ）
   1) index.html の buildRoutesViaPlaces は Google の Nearby Search を
      type:'place_of_worship' で呼んでいる。これは神社・寺・教会をまとめて
      返す種別なので、寺のほうが多い地域では寺ばかりになる。
      しかも候補はすべて type:'shrine' と決め打ちで、選んだ種別
      （神社中心／両方／寺院中心）はどこでも参照されていなかった。
   2) concierge.js の supplementDynamicRoutes も keyword:'神社 寺' で
      同じように寺を混ぜて補充していた。
   3) APIキー無しのときに使う SHRINE_COORDS には、善光寺・川崎大師・
      金閣寺など寺院が多数入っており、ここでも区別していなかった。

   対策
   ・名前からお寺／神社を見分ける kindOf() を用意
   ・Nearby Search（place_of_worship）の結果を、選んだ種別と反対のものだけ
     取り除く（判定できない名前は残すので、取りこぼしで空にはならない）
     → 1) と 2) の両方が同時に直る
   ・buildDynamicRoutes に渡る候補も同じ規則で間引く → 3) が直る
   ・「両方」を選んだときに種別指定が解除されるようにする
   ══════════════════════════════════════════════════════════════ */
(function(){
  if (window.__wabiKindFilter) return;
  window.__wabiKindFilter = true;

  /* ── 名前からお寺か神社かを見分ける ─────────────────────── */
  function kindOf(name){
    var n = String(name || '').replace(/[（(].*$/, '').trim();
    if (!n) return '';
    // 末尾がはっきりお寺（「神宮寺」のように神社の語を含んでいても寺）
    if (/(寺|院|庵|坊|大師|不動尊|観音|薬師堂|堂|大仏)$/.test(n)) return 'temple';
    // 神社の語
    if (/(神社|大社|神宮|大神宮|八幡宮|八幡$|天満宮|天神$|東照宮|稲荷|明神|権現|神明|宮$|社$)/.test(n)) return 'shrine';
    // お寺の語
    if (/(寺|院|大師|不動|観音|薬師|門跡|別院|霊場|札所|山門|伽藍)/.test(n)) return 'temple';
    return '';   // 判定できない → どちらにも寄せない
  }
  window.wabiKindOf = kindOf;

  /* ── いま選ばれている種別（トップの神社中心／両方／寺院中心）── */
  function wantKind(){
    try {
      var on = document.querySelector('.hero-search-toggles .hero-search-toggle.on');
      if (on){
        var t = (on.textContent || '').replace(/\s+/g, '');
        if (t.indexOf('神社') === 0) return 'shrine';
        if (t.indexOf('寺院') === 0) return 'temple';
        return '';                       // 両方
      }
    } catch(e){}
    try { if (typeof currentType !== 'undefined' && currentType) return currentType; } catch(e){}
    return '';
  }
  window.wabiWantKind = wantKind;

  // 反対の種別だけ取り除く（判定できないものは残す）
  function drop(list, want, nameOf){
    if (!want || !list || !list.length) return list;
    var other = (want === 'shrine') ? 'temple' : 'shrine';
    var kept = [];
    for (var i = 0; i < list.length; i++){
      if (kindOf(nameOf(list[i])) !== other) kept.push(list[i]);
    }
    return kept.length ? kept : list;    // 全部消えるくらいなら元のまま
  }

  /* ── ① Nearby Search（神社仏閣まとめて返す種別）の結果をふるいにかける ── */
  function patchPlaces(){
    try {
      if (!window.google || !google.maps || !google.maps.places) return false;
      var proto = google.maps.places.PlacesService && google.maps.places.PlacesService.prototype;
      if (!proto || typeof proto.nearbySearch !== 'function') return false;
      if (proto.nearbySearch.__wkind) return true;

      var orig = proto.nearbySearch;
      var wrapped = function(req, cb){
        var want = wantKind();
        var isWorship = req && (req.type === 'place_of_worship'
                        || (req.keyword && /神社|寺/.test(req.keyword)));
        if (!want || !isWorship || typeof cb !== 'function') return orig.call(this, req, cb);
        return orig.call(this, req, function(res, status, pagination){
          try { if (res && res.length) res = drop(res, want, function(p){ return p && p.name; }); } catch(e){}
          cb(res, status, pagination);
        });
      };
      wrapped.__wkind = true;
      proto.nearbySearch = wrapped;
      return true;
    } catch(e){ return false; }
  }

  /* ── ② ルート組み立てに渡る候補もふるいにかける ───────── */
  function patchBuild(){
    var f = window.buildDynamicRoutes;
    if (typeof f !== 'function' || f.__wkind) return;
    var wrapped = function(base, baseCoord, candidates, selTime, selTrans, budget){
      try {
        var want = wantKind();
        if (want && candidates && candidates.length){
          candidates = drop(candidates, want, function(c){
            return c && c.shrine && c.shrine.name;
          });
          // 種別を正しく持たせておく（テーマ色などで使われる）
          candidates.forEach(function(c){
            if (c && c.shrine){
              var k = kindOf(c.shrine.name);
              if (k) c.shrine.type = k;
            }
          });
        }
      } catch(e){}
      return f.call(this, base, baseCoord, candidates, selTime, selTrans, budget);
    };
    wrapped.__wkind = true;
    wrapped.__orig  = f;
    window.buildDynamicRoutes = wrapped;
  }

  /* ── ③ 「両方」を選んだら種別指定を解除する ───────────── */
  function patchMode(){
    var f = window.setSearchMode;
    if (typeof f !== 'function' || f.__wkind) return;
    var wrapped = function(el, mode){
      var r = f.call(this, el, mode);
      if (mode === 'both'){
        try { window.currentType = ''; } catch(e){}
        try { if (typeof currentType !== 'undefined') currentType = ''; } catch(e){}
        try { if (typeof filter === 'function') filter(); } catch(e){}
      }
      return r;
    };
    wrapped.__wkind = true;
    wrapped.__orig  = f;
    window.setSearchMode = wrapped;
  }

  function run(){ patchPlaces(); patchBuild(); patchMode(); }
  run();
  setInterval(run, 500);
})();

/* ══════════════════════════════════════════════════════════════
   ① ヘッダーのボタンが「ログイン」と自分のアイコンで
      交互に切り替わってチカチカする問題（2026-09-01）

   原因：このボタンを書き換える処理が concierge.js だけでも4か所あり
        （paintButton / syncHeaderName / repaintHeader / __wabiMineProfile）、
        それぞれが別のタイミング・別の条件で走るため、状態が食い違うと
        数百ミリ秒ごとに書き合いになって点滅する。

   対策：このボタンの中身は、ここ1か所だけが決める。
        MutationObserver で誰かが書き換えた瞬間を捉え、
        「同じフレームのうちに」正しい中身へ戻す。
        画面に描かれる前に直るので、点滅そのものが起きない。
   ══════════════════════════════════════════════════════════════ */
(function(){
  if (window.__wabiHeaderBtn) return;
  window.__wabiHeaderBtn = true;

  var PERSON = '<svg viewBox="0 0 20 20" fill="none">'
    + '<circle cx="10" cy="6.5" r="3.2" stroke="currentColor" stroke-width="1.6"/>'
    + '<path d="M3.5 17c0-3.6 13-3.6 13 0" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>';

  var _get = localStorage.getItem.bind(localStorage);
  function user(){
    try { var u = JSON.parse(_get('wabiUser') || 'null'); return (u && u.id) ? u : null; }
    catch(e){ return null; }
  }

  // 正しい中身を決める（ログイン中＝写真＋名前 ／ ログアウト中＝人型＋ログイン）
  function want(){
    var u = user();
    if (!u) return { img: '', text: 'ログイン' };
    var nm = '', av = '';
    try { nm = _get('wabiName') || ''; } catch(e){}
    try { av = _get('wabiAvatar') || ''; } catch(e){}
    var name = nm || u.name || '巡礼者';
    if (name.length > 6) name = name.slice(0, 6) + '…';
    return { img: av || u.pic || '', text: name };
  }

  function sigOf(w){ return (w.img ? '1' : '0') + '|' + w.text; }
  function nowSig(btn){ return (btn.querySelector('img') ? '1' : '0') + '|' + (btn.textContent || '').trim(); }
  function htmlOf(w){
    return (w.img
      ? '<img src="' + w.img + '" style="width:20px;height:20px;border-radius:50%;object-fit:cover">'
      : PERSON) + w.text;
  }

  var busy = false;
  function apply(){
    if (busy) return;
    var btn = document.getElementById('wlBtn');
    if (!btn) return;
    var w = want();
    if (nowSig(btn) === sigOf(w)) return;      // すでに正しい → 何もしない
    busy = true;
    try { btn.innerHTML = htmlOf(w); } catch(e){}   // onclick はボタン本体に付いているので消えない
    busy = false;
  }

  var obs = null;
  try { obs = new MutationObserver(apply); } catch(e){}

  function bind(){
    var btn = document.getElementById('wlBtn');
    if (!btn || btn.__wobs) return;
    btn.__wobs = true;
    if (obs) obs.observe(btn, { childList:true, subtree:true, characterData:true });
    apply();
  }

  bind();
  apply();
  setInterval(function(){ bind(); apply(); }, 400);   // ボタンが作り直されたときの保険
})();


/* ══════════════════════════════════════════════════════════════
   ② 「テーマで巡るベスト10」のカードを見やすくする（2026-09-01）
      ・細字のサブタイトル（説明文）を外す
      ・タイトルを一回り大きく（12.5px → 15.5px）
      ・14枚すべてに効く（index.html の10枚＋concierge.js が足す4枚）
   ══════════════════════════════════════════════════════════════ */
(function(){
  if (window.__wabiThemeCard) return;
  window.__wabiThemeCard = true;

  var RULES = [
    /* 細字のサブタイトルを消す */
    'html body #themeGrid .theme-card.theme-card .theme-card-desc,',
    'html body .theme-grid .theme-card.theme-card .theme-card-desc{display:none !important;}',

    /* タイトルを一回り大きく。3行まで表示して、はみ出す分だけ省略 */
    /* concierge.js の body.wabi-top #pgHome .theme-card-title{13px} に勝つため
       クラスを重ねて詳細度を上げている（.theme-card を3回書くのは意図的） */
    'html body #themeGrid .theme-card.theme-card.theme-card .theme-card-title,',
    'html body .theme-grid .theme-card.theme-card.theme-card .theme-card-title{',
    '  font-size:15.5px !important;',
    '  line-height:1.45 !important;',
    '  font-weight:700 !important;',
    '  margin-bottom:0 !important;',
    '  letter-spacing:.01em !important;',
    '  display:-webkit-box !important;',
    '  -webkit-line-clamp:4 !important;',
    '  -webkit-box-orient:vertical !important;',
    '  overflow:hidden !important;',
    '  text-shadow:0 1px 4px rgba(0,0,0,.85) !important;',
    '}',

    /* 文字が下に寄りすぎないよう、余白を少しだけ整える */
    'html body #themeGrid .theme-card.theme-card .theme-card-body,',
    'html body .theme-grid .theme-card.theme-card .theme-card-body{padding:.7rem .8rem .85rem !important;}',

    /* 文字が読みやすいよう、下側の影を少し濃く */
    'html body #themeGrid .theme-card::after,',
    'html body .theme-grid .theme-card::after{',
    '  background:linear-gradient(180deg,rgba(0,0,0,.10) 0%,rgba(0,0,0,.42) 45%,rgba(0,0,0,.88) 100%) !important;',
    '}'
  ].join('\n');

  function put(){
    var old = document.getElementById('wabiThemeCardCss');
    if (old && old.parentNode) old.parentNode.removeChild(old);
    var s = document.createElement('style');
    s.id = 'wabiThemeCardCss';
    s.textContent = RULES;
    (document.head || document.documentElement).appendChild(s);   // 常に最後に置き直す
  }
  put();
  var n = 0;
  var iv = setInterval(function(){ put(); if (++n > 12) clearInterval(iv); }, 900);
})();

/* ══════════════════════════════════════════════════════════════
   カスタマイズ済みルートの神社カードを大きく見やすくする（2026-09-01）
   写真 54px → 84px、名前 13px → 15.5px、説明 10.5px → 12px
   ══════════════════════════════════════════════════════════════ */
(function(){
  if (window.__wabiPrevCard) return;
  window.__wabiPrevCard = true;
  // ★2026-09-12 停止★
  // カスタマイズ済みルートの画面そのものを作り直したため、この調整は役目を終えた。
  // 写真を84px四方に固定する !important が残っていると、新しい見た目（横長3:2）に
  // 勝ってしまい、写真だけ元の正方形に戻ってしまう。よってここで抜ける。
  return;

  var RULES = [
    'html body #wcPrev .wc-tl{padding:20px 16px !important;border-radius:24px !important;}',

    /* 写真を大きく */
    'html body #wcPrev .wc-tl-i .wc-tl-th{',
    '  width:84px !important; height:84px !important; flex:0 0 84px !important;',
    '  border-radius:16px !important; font-size:34px !important;',
    '}',

    /* 行の間隔と番号 */
    'html body #wcPrev .wc-tl-i{padding:12px 0 !important; gap:14px !important;}',
    'html body #wcPrev .wc-tl-i .wc-tl-n{',
    '  width:30px !important; height:30px !important; flex:0 0 30px !important; font-size:13.5px !important;',
    '}',

    /* 文字を読みやすく */
    'html body #wcPrev .wc-tl-i .wc-tl-nm{font-size:15.5px !important; line-height:1.45 !important;}',
    'html body #wcPrev .wc-tl-i .wc-tl-mt{font-size:12px !important; margin-top:4px !important;}',

    /* 「移動 約10分」の縦線を写真の大きさに合わせる */
    'html body #wcPrev .wc-tl-mv{',
    '  font-size:11.5px !important; height:22px !important; line-height:22px !important;',
    '  margin-left:14px !important; padding-left:15px !important;',
    '}'
  ].join('\n');

  function put(){
    var old = document.getElementById('wabiPrevCardCss');
    if (old && old.parentNode) old.parentNode.removeChild(old);
    var s = document.createElement('style');
    s.id = 'wabiPrevCardCss';
    s.textContent = RULES;
    (document.head || document.documentElement).appendChild(s);
  }
  put();
  var n = 0;
  var iv = setInterval(function(){ put(); if (++n > 12) clearInterval(iv); }, 900);
})();

/* ══════════════════════════════════════════════════════════════
   わびなび：検索カードの「場所を指定」と同名施設の候補選択
   （2026-09-02 / モバイル版・PC版で同じコード・同じデータ構造）

   ■ 既存コードは書き換えない
     ・startAiRoute（モバイル）／ startAiRoutePC（PC）を「包む」だけ
     ・起点の特定は既存の buildRoutesViaPlaces の textSearch をそのまま使い、
       確定済みの施設があるときだけ、その結果を返す
     ・Google Places が使えないときは、必ず従来どおりの動作に戻す

   ■ 保持するデータ（両版で共通）
     window.wabiPickedPlace = {
       query, place_id, name, address, pref, city, lat, lng, raw
     }
     window.wabiPlaceScope  = { kind:'all'|'pref'|'here', pref, lat, lng }
   ══════════════════════════════════════════════════════════════ */
(function(){
  if (window.__wabiPlacePick) return;
  window.__wabiPlacePick = true;

  var PREFS = [
    '北海道','青森県','岩手県','宮城県','秋田県','山形県','福島県',
    '茨城県','栃木県','群馬県','埼玉県','千葉県','東京都','神奈川県',
    '新潟県','富山県','石川県','福井県','山梨県','長野県',
    '岐阜県','静岡県','愛知県','三重県',
    '滋賀県','京都府','大阪府','兵庫県','奈良県','和歌山県',
    '鳥取県','島根県','岡山県','広島県','山口県',
    '徳島県','香川県','愛媛県','高知県',
    '福岡県','佐賀県','長崎県','熊本県','大分県','宮崎県','鹿児島県','沖縄県'
  ];

  var IS_PC = !!document.getElementById('aiQueryInput');

  // 検索窓の下に出す注意書き
  var NOTE_TEXT = '※「〇〇神社」と「〇〇神宮」「〇〇大社」など、呼称の違いによって検索結果が異なる場合があります。';

  window.wabiPlaceScope = window.wabiPlaceScope || { kind:'all' };
  var prefCenter = {};        // 都道府県名 → {lat,lng}（一度引いたら覚えておく）

  /* ── 環境の違いを吸収する ───────────────────────────────── */
  function qInput(){ return document.getElementById(IS_PC ? 'aiQueryInput' : 'heroSearchInput'); }
  function queryText(){ var el = qInput(); return el ? String(el.value || '').trim() : ''; }
  function apiKey(){
    try { if (IS_PC) return window.pcApiKey || ''; } catch(e){}
    try { if (typeof API_KEY !== 'undefined' && API_KEY) return API_KEY; } catch(e){}
    try { return window.API_KEY || ''; } catch(e){}
    return '';
  }
  function toast(m){
    try { if (typeof showToast === 'function') { showToast(m); return; } } catch(e){}
    try { if (typeof showToastPC === 'function') { showToastPC(m); return; } } catch(e){}
    try { console.log('[wabi]', m); } catch(e){}
  }
  function placesOk(){
    return !!(window.google && google.maps && google.maps.places && google.maps.places.PlacesService);
  }
  var svcObj = null;
  function svc(){
    if (svcObj) return svcObj;
    if (!placesOk()) return null;
    try { svcObj = new google.maps.places.PlacesService(document.createElement('div')); } catch(e){ svcObj = null; }
    return svcObj;
  }
  // SDKの読み込みは既存の関数に任せる（APIキーを新しく書かない）
  function ensureSdk(cb){
    if (placesOk()) return cb(true);
    var k = apiKey();
    if (!k || typeof window.loadGoogleMapsSDK !== 'function') return cb(false);
    try {
      var p = window.loadGoogleMapsSDK(k);
      if (p && p.then) p.then(function(){ cb(placesOk()); }).catch(function(){ cb(false); });
      else cb(placesOk());
    } catch(e){ cb(false); }
    var t0 = Date.now();
    var iv = setInterval(function(){
      if (placesOk()) { clearInterval(iv); }
      else if (Date.now() - t0 > 8000) { clearInterval(iv); }
    }, 300);
  }

  /* ── 文字の正規化と、住所から都道府県・市区町村を取り出す ── */
  function norm(s){
    return String(s == null ? '' : s)
      .replace(/[（(].*?[)）]/g, '')
      .replace(/[\s　・,、]/g, '')
      .trim();
  }
  function prefOf(addr){
    var m = String(addr || '').match(/(北海道|東京都|京都府|大阪府|..[県])/);
    return m ? m[1] : '';
  }
  function cityOf(addr){
    var a = String(addr || '').replace(/^日本[、,]?\s*/, '').replace(/〒[\d-]+\s*/, '');
    var m = a.match(/(?:北海道|東京都|京都府|大阪府|..県)(.{1,8}?[市区町村郡])/);
    return m ? m[1] : '';
  }
  function shortAddr(addr){
    return String(addr || '').replace(/^日本[、,]?\s*/, '').replace(/〒[\d-]+\s*/, '').trim();
  }
  // 参拝対象らしいか（既存の isShrineOrTemple があればそれを使う）
  function worshipLike(name){
    try { if (typeof isShrineOrTemple === 'function') return isShrineOrTemple(name); } catch(e){}
    return !/(駅|ホテル|旅館|店|ショップ|コンビニ|銀行|学校|病院|公園|駐車場)$/.test(String(name||''));
  }

  /* ── 場所（都道府県・現在地）の中心座標を用意する ──────── */
  function scopeCenter(cb){
    var sc = window.wabiPlaceScope || { kind:'all' };
    if (sc.kind === 'here'){
      if (typeof sc.lat === 'number') return cb({ lat:sc.lat, lng:sc.lng });
      return cb(null);
    }
    if (sc.kind === 'pref' && sc.pref){
      if (prefCenter[sc.pref]) return cb(prefCenter[sc.pref]);
      var s = svc();
      if (!s) return cb(null);
      try {
        s.textSearch({ query: sc.pref, language:'ja', region:'JP' }, function(res, st){
          try {
            if (st === google.maps.places.PlacesServiceStatus.OK && res && res[0]
                && res[0].geometry && res[0].geometry.location){
              prefCenter[sc.pref] = { lat: res[0].geometry.location.lat(), lng: res[0].geometry.location.lng() };
            }
          } catch(e){}
          cb(prefCenter[sc.pref] || null);
        });
      } catch(e){ cb(null); }
      return;
    }
    cb(null);
  }

  /* ── 候補をさがす ───────────────────────────────────────── */
  var origTextSearch = null;     // 包む前の本物（自分の問い合わせに使う）
  function rawTextSearch(req, cb){
    var s = svc();
    if (!s) return cb(null, 'ERR');
    var f = origTextSearch || s.textSearch;
    try { f.call(s, req, cb); } catch(e){ cb(null, 'ERR'); }
  }

  function findCandidates(q, cb){
    ensureSdk(function(ok){
      if (!ok || !svc()) return cb(null);                 // Placesが使えない → 従来動作へ
      var sc0 = window.wabiPlaceScope || { kind:'all' };
      var sc = window.wabiPlaceScope || { kind:'all' };
      scopeCenter(function(center){
        var req = { language:'ja', region:'JP',
                    query: q + (sc.kind === 'pref' && sc.pref ? ' ' + sc.pref : '') };
        if (center){
          try {
            req.location = new google.maps.LatLng(center.lat, center.lng);
            req.radius   = (sc.kind === 'here') ? 30000 : 100000;
          } catch(e){}
        }
        rawTextSearch(req, function(res, st){
          var OK = 'OK';
          try { OK = google.maps.places.PlacesServiceStatus.OK; } catch(e){}
          if (st !== OK || !res || !res.length) return cb({ list: [], outOfPref: false });
          cb(shape(q, res, sc));
        });
      });
    });
  }

  // 検索結果 → 候補リスト（同じ名前のものだけに絞り、重複を除く）
  function shape(q, res, sc){
    var nq = norm(q), out = [], seen = {}, exact = [];
    for (var i = 0; i < res.length && out.length < 12; i++){
      var p = res[i];
      if (!p || !p.place_id || !p.geometry || !p.geometry.location) continue;
      if (seen[p.place_id]) continue;
      if (!worshipLike(p.name)) continue;
      var np = norm(p.name);
      if (np !== nq && np.indexOf(nq) < 0 && nq.indexOf(np) < 0) continue;
      seen[p.place_id] = 1;
      var addr = p.formatted_address || p.vicinity || '';
      var item = {
        place_id: p.place_id, name: p.name, address: shortAddr(addr),
        pref: prefOf(addr), city: cityOf(addr),
        lat: p.geometry.location.lat(), lng: p.geometry.location.lng(),
        rating: p.rating || 0, reviews: p.user_ratings_total || 0,
        raw: p
      };
      out.push(item);
      if (np === nq) exact.push(item);
    }
    // 名前がぴったり一致するものがあれば、それだけを候補にする
    var list = exact.length ? exact : out;

    // ★都道府県が選ばれているときは、その県のものだけにしぼる★
    //   以前は「先に並べる」だけだったため、Googleが県外の1件しか返さないと
    //   それを自動で確定してしまい、埼玉県を選んだのに千葉の神社が使われていた。
    if (sc && sc.kind === 'pref' && sc.pref){
      var inPref = list.filter(function(x){ return x.pref === sc.pref; });
      if (inPref.length) return { list: inPref, outOfPref: false };
      return { list: list, outOfPref: true };     // 県内に無い → 必ず利用者に選んでもらう
    }
    return { list: list, outOfPref: false };
  }

  function setPicked(q, item){
    window.wabiPickedPlace = {
      query: q, place_id: item.place_id, name: item.name, address: item.address,
      pref: item.pref, city: item.city, lat: item.lat, lng: item.lng, raw: item.raw
    };
  }

  /* ── 見た目（オーバーレイと下からのシート） ───────────── */
  var CSS = [
    '.wpk-mask{position:fixed;inset:0;z-index:2147482000;background:rgba(20,14,8,.5);display:none;}',
    '.wpk-mask.on{display:block;}',
    ".wpk-sheet{position:fixed;left:0;right:0;bottom:0;z-index:2147482001;background:#FAF8F4;",
      "border-radius:22px 22px 0 0;max-height:82vh;overflow-y:auto;-webkit-overflow-scrolling:touch;",
      "font-family:'Shippori Mincho','Noto Serif JP',serif;color:#2D2D2D;display:none;",
      "padding-bottom:calc(18px + env(safe-area-inset-bottom));box-shadow:0 -10px 40px rgba(0,0,0,.25);}",
    '.wpk-sheet.on{display:block;}',
    '.wpk-sheet .bar{width:44px;height:4px;border-radius:3px;background:#DCD4C6;margin:10px auto 4px;}',
    '.wpk-hd{position:sticky;top:0;background:#FAF8F4;padding:10px 18px 12px;border-bottom:1px solid #EFE9DD;z-index:2;}',
    '.wpk-ttl{font-size:16px;font-weight:800;letter-spacing:.04em;}',
    ".wpk-sub{font-size:12.5px;color:#7A7268;margin-top:5px;font-family:'Noto Serif JP',serif;line-height:1.7;}",
    '.wpk-list{padding:8px 14px 6px;}',
    '.wpk-it{display:flex;align-items:center;gap:12px;width:100%;box-sizing:border-box;background:#fff;',
      'border:1px solid #EAE3D6;border-radius:16px;padding:14px 14px;margin-bottom:10px;cursor:pointer;',
      'font-family:inherit;color:inherit;text-align:left;}',
    '.wpk-it:active{background:#F5F0E6;}',
    '.wpk-it .em{font-size:22px;flex:0 0 26px;text-align:center;}',
    '.wpk-it .bd{flex:1;min-width:0;}',
    '.wpk-it .nm,.wpk-it .ad,.wpk-it .rt{display:block;}',
    '.wpk-it .nm{font-size:15.5px;font-weight:700;line-height:1.4;}',
    ".wpk-it .ad{font-size:12.5px;color:#7A7268;margin-top:4px;line-height:1.6;font-family:'Noto Serif JP',serif;}",
    '.wpk-it .rt{font-size:11.5px;color:#C08A2E;font-weight:700;margin-top:4px;}',
    '.wpk-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:9px;padding:10px 14px 6px;}',
    '.wpk-grid button{padding:14px 6px;border-radius:14px;border:1px solid #EAE3D6;background:#fff;',
      'font-family:inherit;font-size:14.5px;font-weight:700;color:#2D2D2D;cursor:pointer;}',
    '.wpk-grid button.on{background:#3A1D5D;color:#fff;border-color:#3A1D5D;}',
    '.wpk-cancel{display:block;width:calc(100% - 28px);margin:8px 14px 4px;padding:14px 0;border-radius:14px;',
      'border:1px solid #EAE3D6;background:#fff;font-family:inherit;font-size:14.5px;font-weight:700;color:#7A7268;cursor:pointer;}',
    /* 場所ボタンは1つで横いっぱいなので、指で押しやすい高さにする */
    '#wabiPlaceBtn{padding-top:.55rem !important;padding-bottom:.55rem !important;}',
    '@media(min-width:820px){',
      '.wpk-sheet{left:50%;right:auto;bottom:auto;top:50%;transform:translate(-50%,-50%);',
        'width:560px;max-width:92vw;border-radius:20px;max-height:78vh;}',
      '.wpk-grid{grid-template-columns:repeat(4,1fr);}',
    '}'
  ].join('\n');

  var mask, sheet;
  function ui(){
    if (sheet) return;
    var st = document.createElement('style'); st.id = 'wabiPlacePickCss'; st.textContent = CSS;
    (document.head || document.documentElement).appendChild(st);
    mask = document.createElement('div');  mask.className = 'wpk-mask';
    sheet = document.createElement('div'); sheet.className = 'wpk-sheet';
    document.body.appendChild(mask); document.body.appendChild(sheet);
    mask.onclick = close;
  }
  function open(html){
    ui();
    sheet.innerHTML = '<div class="bar"></div>' + html;
    mask.classList.add('on'); sheet.classList.add('on'); sheet.scrollTop = 0;
  }
  function close(){ if (sheet){ sheet.classList.remove('on'); mask.classList.remove('on'); } }
  window.wabiClosePlaceSheet = close;
  function esc(s){
    return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;')
      .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  /* ── 場所を指定するシート ───────────────────────────────── */
  function labelOfScope(){
    var sc = window.wabiPlaceScope || { kind:'all' };
    if (sc.kind === 'here') return '📍 現在地から探す';
    if (sc.kind === 'pref' && sc.pref) return '🗾 ' + sc.pref;
    return '📍 全国';
  }
  function paintPlaceBtn(){
    var b = document.getElementById('wabiPlaceBtn');
    if (b){
      var want = labelOfScope() + '　▼';
      if (b.textContent.trim() !== want) b.textContent = want;
    }
  }
  function openScopeSheet(){
    open('<div class="wpk-hd"><div class="wpk-ttl">場所を指定</div>'
      + '<div class="wpk-sub">指定しなくても検索できます。同じ名前の神社・お寺が多いときに役立ちます。</div></div>'
      + '<div class="wpk-list">'
      + '<button class="wpk-it" data-a="here"><span class="em">📍</span><span class="bd"><span class="nm">現在地から探す</span>'
      +   '<span class="ad">いまいる場所の周辺を優先します</span></span></button>'
      + '<button class="wpk-it" data-a="pref"><span class="em">🗾</span><span class="bd"><span class="nm">都道府県を選ぶ</span>'
      +   '<span class="ad">47都道府県から選べます</span></span></button>'
      + '<button class="wpk-it" data-a="all"><span class="em">🌐</span><span class="bd"><span class="nm">全国</span>'
      +   '<span class="ad">場所をしぼらずに探します</span></span></button>'
      + '</div><button class="wpk-cancel" data-a="cancel">キャンセル</button>');
    sheet.querySelectorAll('[data-a]').forEach(function(b){
      b.onclick = function(){
        var a = b.getAttribute('data-a');
        if (a === 'cancel'){ close(); return; }
        if (a === 'all'){ window.wabiPlaceScope = { kind:'all' }; paintPlaceBtn(); close(); return; }
        if (a === 'pref'){ openPrefSheet(); return; }
        if (a === 'here'){ useHere(); return; }
      };
    });
  }
  function openPrefSheet(){
    var sc = window.wabiPlaceScope || {};
    open('<div class="wpk-hd"><div class="wpk-ttl">都道府県を選ぶ</div>'
      + '<div class="wpk-sub">選んだ都道府県の神社・お寺を優先して探します。</div></div>'
      + '<div class="wpk-grid">'
      + PREFS.map(function(p){
          return '<button data-p="' + esc(p) + '"' + (sc.pref === p ? ' class="on"' : '') + '>' + esc(p) + '</button>';
        }).join('')
      + '</div><button class="wpk-cancel" data-a="back">戻る</button>');
    sheet.querySelectorAll('[data-p]').forEach(function(b){
      b.onclick = function(){
        window.wabiPlaceScope = { kind:'pref', pref: b.getAttribute('data-p') };
        paintPlaceBtn(); close();
        // 中心座標をいま取っておく（作成ボタンを押したときの待ち時間を減らす）
        try { scopeCenter(function(){}); } catch(e){}
      };
    });
    var bk = sheet.querySelector('[data-a=back]');
    if (bk) bk.onclick = openScopeSheet;
  }
  function useHere(){
    if (!navigator.geolocation){
      toast('この端末では現在地を取得できません。都道府県からお選びください');
      openPrefSheet(); return;
    }
    toast('現在地を確認しています…');
    navigator.geolocation.getCurrentPosition(function(pos){
      window.wabiPlaceScope = { kind:'here', lat: pos.coords.latitude, lng: pos.coords.longitude };
      paintPlaceBtn(); close();
      toast('現在地の周辺を優先して探します');
    }, function(){
      // 拒否・失敗しても壊さない。別の方法を案内する
      toast('現在地を取得できませんでした。都道府県からお選びください');
      try { openPrefSheet(); } catch(e){}
    }, { enableHighAccuracy:false, timeout:8000, maximumAge:300000 });
  }

  /* ── 同名候補を選ぶシート ───────────────────────────────── */
  function openPicker(q, list, done, missPref){
    var sub = missPref
      ? ('<b>' + esc(missPref) + 'では見つかりませんでした。</b><br>ほかの場所の候補です。よろしければお選びください。')
      : ('同じ名前の神社・お寺が ' + list.length + ' か所見つかりました。<br>目的の場所をお選びください。');
    open('<div class="wpk-hd"><div class="wpk-ttl">どちらの「' + esc(q) + '」ですか？</div>'
      + '<div class="wpk-sub">' + sub + '</div></div>'
      + '<div class="wpk-list">'
      + list.map(function(x, i){
          var ic = (window.wabiKindOf && window.wabiKindOf(x.name) === 'temple') ? '卍' : '⛩';
          return '<button class="wpk-it" data-i="' + i + '"><span class="em">' + ic + '</span>'
            + '<span class="bd"><span class="nm">' + esc(x.name) + '</span>'
            + '<span class="ad">' + esc(x.address || (x.pref + x.city)) + '</span>'
            + (x.rating ? '<span class="rt">★ ' + x.rating.toFixed(1)
                + (x.reviews ? '（' + x.reviews.toLocaleString() + '件）' : '') + '</span>' : '')
            + '</span></button>';
        }).join('')
      + '</div><button class="wpk-cancel" data-a="cancel">やめる</button>');
    sheet.querySelectorAll('[data-i]').forEach(function(b){
      b.onclick = function(){
        var x = list[+b.getAttribute('data-i')];
        close();
        setPicked(q, x);
        var el = qInput();
        if (el) el.value = x.name;          // 入力欄も正式名称にそろえる
        toast('「' + (x.pref || '') + (x.city || '') + ' ' + x.name + '」で作成します');
        setTimeout(function(){ done(x); }, 60);
      };
    });
    var c = sheet.querySelector('[data-a=cancel]');
    if (c) c.onclick = close;
  }

  /* ── 検索カードに「場所を指定」を差し込む ───────────────── */
  function insertField(){
    if (document.getElementById('wabiPlaceBtn')) { paintPlaceBtn(); return; }
    var host, label, row, btn;
    if (IS_PC){
      var fields = document.querySelector('.search-fields');
      if (!fields || !fields.parentNode) return;
      // 検索窓のすぐ下に注意書き（大きさと色は「場所を指定」と同じクラスを使う）
      if (!document.getElementById('wabiNameNote')){
        var noteP = document.createElement('div');
        noteP.id = 'wabiNameNote';
        noteP.className = 'ai-field-label';
        noteP.style.cssText = 'margin-top:10px;line-height:1.7;';
        noteP.textContent = NOTE_TEXT;
        fields.parentNode.insertBefore(noteP, fields.nextSibling);
      }
      label = document.createElement('div');
      label.className = 'ai-field-label';
      label.style.marginTop = '20px';
      label.textContent = '場所を指定';
      row = document.createElement('div');
      row.className = 'ai-pill-row';
      btn = document.createElement('button');
      btn.className = 'ai-pill on';
      btn.id = 'wabiPlaceBtn';
      btn.type = 'button';
      row.appendChild(btn);
      var afterP = document.getElementById('wabiNameNote') || fields;
      afterP.parentNode.insertBefore(label, afterP.nextSibling);
      label.parentNode.insertBefore(row, label.nextSibling);
    } else {
      var wrap = document.querySelector('.hero-search .hero-search-input-wrap');
      if (!wrap || !wrap.parentNode) return;
      // 検索窓のすぐ下に注意書き（大きさと色は「場所を指定」と同じクラスを使う）
      if (!document.getElementById('wabiNameNote')){
        var noteM = document.createElement('div');
        noteM.id = 'wabiNameNote';
        noteM.className = 'hero-search-row-label';
        noteM.style.cssText = 'margin:.45rem 0 .1rem;line-height:1.7;';
        noteM.textContent = NOTE_TEXT;
        wrap.parentNode.insertBefore(noteM, wrap.nextSibling);
      }
      var after = document.querySelector('.hero-search .hero-search-toggles') || wrap;
      label = document.createElement('div');
      label.className = 'hero-search-row-label';
      label.style.marginTop = '.5rem';
      label.textContent = '場所を指定';
      row = document.createElement('div');
      row.className = 'hero-search-pills';
      btn = document.createElement('button');
      btn.className = 'hero-search-pill on';
      btn.id = 'wabiPlaceBtn';
      btn.type = 'button';
      row.appendChild(btn);
      after.parentNode.insertBefore(label, after.nextSibling);
      label.parentNode.insertBefore(row, label.nextSibling);
    }
    btn.onclick = function(ev){ ev.preventDefault(); ev.stopPropagation(); openScopeSheet(); };
    paintPlaceBtn();
  }

  /* ── textSearch を包む（確定した施設をそのまま起点にする）── */
  function patchTextSearch(){
    if (!placesOk()) return;
    var proto = google.maps.places.PlacesService.prototype;
    if (!proto || typeof proto.textSearch !== 'function' || proto.textSearch.__wpk) return;
    var orig = proto.textSearch;
    origTextSearch = orig;
    var wrapped = function(req, cb){
      try {
        var p = window.wabiPickedPlace;
        // 起点をさがす問い合わせ（利用者が入れた文字そのもの）のときだけ差し替える
        if (p && p.raw && req && typeof req.query === 'string'
            && (req.query === p.query || req.query === p.name) && typeof cb === 'function'){
          var OK = google.maps.places.PlacesServiceStatus.OK;
          setTimeout(function(){ try { cb([p.raw], OK); } catch(e){} }, 0);
          return;
        }
        // 場所が指定されているときは、検索範囲をそっと寄せる
        var sc = window.wabiPlaceScope;
        if (req && !req.location && sc){
          if (sc.kind === 'here' && typeof sc.lat === 'number'){
            req.location = new google.maps.LatLng(sc.lat, sc.lng); req.radius = 30000;
          } else if (sc.kind === 'pref' && sc.pref && prefCenter[sc.pref]){
            req.location = new google.maps.LatLng(prefCenter[sc.pref].lat, prefCenter[sc.pref].lng);
            req.radius = 100000;
          }
        }
      } catch(e){}
      return orig.call(this, req, cb);
    };
    wrapped.__wpk = true;
    proto.textSearch = wrapped;
  }

  /* ── AIルート作成を包む ─────────────────────────────────── */
  function sameScope(p){
    var sc = window.wabiPlaceScope || { kind:'all' };
    if (!p) return false;
    if (sc.kind === 'pref' && sc.pref && p.pref && p.pref !== sc.pref) return false;
    return true;
  }
  function wrapStart(name){
    var f = window[name];
    if (typeof f !== 'function' || f.__wpk) return;
    var wrapped = function(){
      var self = this, args = arguments;
      var q = queryText();
      if (!q) return f.apply(self, args);                       // 名前なし → 従来どおり
      var p = window.wabiPickedPlace;
      if (p && (p.query === q || p.name === q) && sameScope(p)) return f.apply(self, args);  // 確定済み
      if (window.wabiPickedPlace && window.wabiPickedPlace.query !== q) window.wabiPickedPlace = null;

      var fired = false;
      function go(){ if (fired) return; fired = true; f.apply(self, args); }
      // Places が遅い・使えないときも必ず動くように、12秒で従来動作へ
      //（都道府県を選ぶと問い合わせが2回になるため、6秒では足りないことがあった）
      var guard = setTimeout(go, 12000);

      findCandidates(q, function(r){
        clearTimeout(guard);
        if (r === null) return go();                            // Placesが使えない → 従来どおり
        var list = r.list || [];
        var sc = window.wabiPlaceScope || { kind:'all' };
        if (!list.length){
          toast(sc.kind === 'pref' && sc.pref
            ? sc.pref + 'で「' + q + '」が見つかりませんでした'
            : '「' + q + '」の検索結果が見つかりませんでした');
          return go();
        }
        // 選んだ都道府県の外しか無いときは、勝手に決めずに必ず選んでもらう
        if (r.outOfPref) return openPicker(q, list, function(){ fired = false; go(); }, sc.pref);
        if (list.length === 1){ setPicked(q, list[0]); return go(); }   // 一意 → そのまま
        openPicker(q, list, function(){ fired = false; go(); });        // 複数 → 選んでもらう
      });
      return;
    };
    wrapped.__wpk = true;
    wrapped.__orig = f;
    window[name] = wrapped;
  }

  /* ── 動かす ─────────────────────────────────────────────── */
  function run(){
    try { insertField(); } catch(e){}
    try { patchTextSearch(); } catch(e){}
    try { wrapStart(IS_PC ? 'startAiRoutePC' : 'startAiRoute'); } catch(e){}
    // 入力が変わったら、確定済みの施設は捨てる
    try {
      var el = qInput();
      if (el && !el.__wpk){
        el.__wpk = 1;
        el.addEventListener('input', function(){
          var p = window.wabiPickedPlace;
          if (p && p.query !== queryText() && p.name !== queryText()) window.wabiPickedPlace = null;
        });
      }
    } catch(e){}
  }
  run();
  setInterval(run, 600);
})();

/* ══════════════════════════════════════════════════════════════
   選んだ神社が使われず、関係のない固定ルート（鹿島神宮など）が
   出てしまう問題の修正（2026-09-02）

   ★何が起きていたか★
   index.html の buildRoutesViaPlaces は、起点のまわりを
   nearbySearch で探して1件も見つからないと null を返す。
   すると _dynamicRoutes が null になり、AI画面は
   作り置きの10ルート（先頭が東国三社巡り＝鹿島神宮）に戻る。
   郊外の小さな神社を選ぶと、8kmの範囲に他の社が無くてこうなっていた。

   ★対策は2段構え★
   ① 周辺検索が空振りしたら、範囲を広げて自動でもう一度さがす
      （8km →（×3）→（×6・最大50km））
   ② それでも駄目なときは、選んだ神社を起点に
      既存の buildDynamicRoutes を自分で呼び直してルートを作る
      （関数はそのまま使うので、ルートの作り方は今までと同じ）
   ══════════════════════════════════════════════════════════════ */
(function(){
  if (window.__wabiRouteRescue) return;
  window.__wabiRouteRescue = true;

  function placesOk(){
    return !!(window.google && google.maps && google.maps.places && google.maps.places.PlacesService);
  }
  var mySvc = null;
  function svc(){
    if (mySvc) return mySvc;
    if (!placesOk()) return null;
    try { mySvc = new google.maps.places.PlacesService(document.createElement('div')); } catch(e){ mySvc = null; }
    return mySvc;
  }
  function toast(m){
    try { if (typeof showToast === 'function') { showToast(m); return; } } catch(e){}
    try { if (typeof showToastPC === 'function') { showToastPC(m); return; } } catch(e){}
  }
  function isWorshipReq(req){
    return !!(req && (req.type === 'place_of_worship' || (req.keyword && /神社|寺/.test(req.keyword))));
  }

  /* ── ① 周辺検索が空振りしたら範囲を広げる ───────────────── */
  function patchWiden(){
    if (!placesOk()) return;
    var proto = google.maps.places.PlacesService.prototype;
    if (!proto || typeof proto.nearbySearch !== 'function' || proto.nearbySearch.__wwiden) return;
    var inner = proto.nearbySearch;
    var wrapped = function(req, cb){
      var self = this;
      if (!isWorshipReq(req) || typeof cb !== 'function' || !req.radius){
        return inner.call(self, req, cb);
      }
      var base = req.radius;
      var steps = [base, Math.min(base * 3, 50000), Math.min(base * 6, 50000)];
      var i = 0;
      function attempt(){
        var r = {};
        for (var k in req) r[k] = req[k];
        r.radius = steps[i];
        inner.call(self, r, function(res, st, pg){
          var empty = !res || !res.length;
          if (empty && i < steps.length - 1 && steps[i + 1] > steps[i]){
            i++; attempt(); return;                 // 見つからない → 範囲を広げて再挑戦
          }
          cb(res, st, pg);
        });
      }
      attempt();
    };
    wrapped.__wwiden = true;
    proto.nearbySearch = wrapped;
  }

  /* ── ② 固定ルートに戻ってしまったら、自分で組み立て直す ─── */
  function selTime(){
    var el = document.querySelector('#timePills .hero-search-pill.on')
          || document.querySelector('#aiTimePills .ai-pill.on');
    if (!el) return '3時間';
    return (el.getAttribute('data-v') || el.textContent || '3時間').trim();
  }
  function selTrans(){
    var el = document.querySelector('#transportPills .hero-search-pill.on')
          || document.querySelector('#aiTransPills .ai-pill.on');
    if (!el) return '電車';
    return (el.getAttribute('data-v') || el.textContent || '電車').trim();
  }

  var busy = false, doneFor = '';
  function rescue(){
    try {
      var p = window.wabiPickedPlace;
      if (!p || !p.lat) return;
      var isPC = !!document.getElementById('aiQueryInput');
      var cur = isPC ? window._aiRoutesPC : window._dynamicRoutes;
      // undefined＝取得中／配列＝成功。null のときだけ助ける
      if (cur !== null) { if (cur) doneFor = ''; return; }
      if (busy || doneFor === p.place_id) return;
      if (typeof window.buildDynamicRoutes !== 'function' || typeof window.aiBudgetFor !== 'function') return;
      if (!svc()) return;
      busy = true;

      var t = selTime(), tr = selTrans();
      var budget = window.aiBudgetFor(t);
      var baseCoord = { lat: p.lat, lng: p.lng };
      var raw = p.raw || {};
      var base = {
        name: p.name, addr: p.address || '', tags: [], type: 'shrine',
        rating: raw.rating || 0,
        photo: (raw.photos && raw.photos.length) ? raw.photos[0].getUrl({ maxWidth: 500 }) : null
      };

      // 広めにもう一度さがす（見つからなくても続行する）
      var req = { location: new google.maps.LatLng(p.lat, p.lng),
                  radius: Math.max(budget.nearbyRadiusM || 8000, 30000),
                  type: 'place_of_worship', language: 'ja' };
      svc().nearbySearch(req, function(res, st){
        var cands = [];
        try {
          if (res && res.length){
            res.forEach(function(x){
              if (!x || !x.geometry || !x.geometry.location) return;
              if (x.name === base.name) return;
              if (typeof isShrineOrTemple === 'function' && !isShrineOrTemple(x.name)) return;
              var c = { lat: x.geometry.location.lat(), lng: x.geometry.location.lng() };
              var d = 9999;
              try { if (typeof shrineDistKm === 'function') d = shrineDistKm(baseCoord, c); } catch(e){}
              cands.push({
                shrine: { name: x.name, addr: x.vicinity || '', tags: [], type: 'shrine',
                          rating: x.rating || 0, rev: x.user_ratings_total || 0,
                          photo: (x.photos && x.photos.length) ? x.photos[0].getUrl({ maxWidth: 500 }) : null },
                coord: c, dist: d, known: false
              });
            });
            cands.sort(function(a, b){ return a.dist - b.dist; });
          }
        } catch(e){}

        var routes = null;
        try { routes = window.buildDynamicRoutes(base, baseCoord, cands, t, tr, budget); } catch(e){}
        busy = false;
        if (!routes || !routes.length){
          doneFor = p.place_id;
          toast('「' + p.name + '」のまわりで巡拝先を見つけられませんでした');
          return;
        }
        doneFor = p.place_id;
        if (isPC) window._aiRoutesPC = routes; else window._dynamicRoutes = routes;
        try { if (typeof window.renderRouteCards === 'function') window.renderRouteCards(); } catch(e){}
        try { if (isPC && typeof window.renderAiRouteCardsPC === 'function') window.renderAiRouteCardsPC(tr, t); } catch(e){}
        if (!cands.length) toast('「' + p.name + '」だけのルートを用意しました');
      });
    } catch(e){ busy = false; }
  }

  function run(){ try { patchWiden(); } catch(e){} try { rescue(); } catch(e){} }
  run();
  setInterval(run, 400);
})();

/* ══════════════════════════════════════════════════════════════
   「この時期おすすめイベント」を data/events.json から読む（2026-09-02）

   ★これまでの問題★
   イベント10件は concierge.js（881KB）に直接書き込まれていたため、
   iPhone からは差し替えられず、7〜8月の終わった行事が出たままだった。

   ★これから★
   data/events.json（数KB）を差し替えるだけで更新できる。
   ファイルが無い・読めないときは、これまでどおり concierge.js の
   内蔵データが表示されるので、サイトが空になることはない。

   JSONの形（1件ぶん）
   { "id":"", "title":"", "sub":"", "area":"", "place":"",
     "period":"", "tag":"", "photo":"", "url":"" }
   ══════════════════════════════════════════════════════════════ */
(function(){
  if (window.__wabiEventsJson) return;
  window.__wabiEventsJson = true;

  var LIST = null;      // 読み込んだイベント
  var tried = false;

  function esc(s){
    return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;')
      .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  // concierge.js の evCard とまったく同じ形にする（見た目を変えないため）
  function card(e){
    return '<div class="wev-card" data-url="' + esc(e.url) + '">'
      + '<div class="im" data-ph="' + esc(e.photo || e.place || e.title) + '">'
      +   '<span class="ar">' + esc(e.area || '') + '</span></div>'
      + '<div class="bd">'
      +   '<div class="tt">' + esc(e.title) + '</div>'
      +   '<div class="sb">' + esc(e.sub || '') + '</div>'
      +   '<div class="pd">' + esc(e.period || '') + '</div>'
      +   '<span class="go">公式ページで詳しく見る ›</span>'
      + '</div></div>';
  }

  // period（例「2026年9月14日（月）〜16日（水）」）から年月を取り出す。
  // どちらのファイルが新しいかを、この数字で見分ける。
  function ym(list){
    var best = 0;
    (list || []).forEach(function(e){
      var m = String(e && e.period || '').match(/(20\d\d)\s*年\s*(\d{1,2})\s*月/);
      if (m){ var v = (+m[1]) * 100 + (+m[2]); if (v > best) best = v; }
    });
    return best;
  }

  function grab(url){
    return fetch(url, { cache: 'no-store' })
      .then(function(r){ return r.ok ? r.json() : null; })
      .then(function(j){
        if (!j || !j.length) return null;
        var v = j.filter(function(e){ return e && e.title && e.url; });
        return v.length ? v : null;
      })
      .catch(function(){ return null; });
  }

  function load(){
    if (tried) return;
    tried = true;
    try {
      // 正式な置き場所は data/events.json。
      // ただしアップロード先を間違えてルート直下に置かれることがあるので、
      // 両方を読んで「新しい月のほう」を採用する。
      Promise.all([ grab('data/events.json'), grab('events.json') ])
        .then(function(r){
          var a = r[0], b = r[1];
          if (!a && !b) return;                          // どちらも無い → 内蔵データのまま
          if (!a) { LIST = b; return; }
          if (!b) { LIST = a; return; }
          LIST = (ym(b) > ym(a)) ? b : a;                // 新しい月のほうを使う
        })
        .catch(function(){});
    } catch(e){}
  }

  function paint(){
    if (!LIST) return;
    [['seasonList', 5], ['seasonListFull', 0]].forEach(function(pair){
      var el = document.getElementById(pair[0]);
      if (!el) return;
      if (el.getAttribute('data-wev-src') === 'json') return;   // 済み
      var items = pair[1] ? LIST.slice(0, pair[1]) : LIST;
      el.innerHTML = items.map(card).join('');
      el.setAttribute('data-wev-src', 'json');
      bind(el);
    });
  }

  function bind(root){
    root.querySelectorAll('.wev-card').forEach(function(c){
      if (c.getAttribute('data-b')) return;
      c.setAttribute('data-b', '1');                    // concierge 側の二重結線を防ぐ
      c.onclick = function(){
        var u = c.getAttribute('data-url');
        if (u) window.open(u, '_blank', 'noopener');
      };
    });
    photos(root);
  }

  // 写真は Google から。取れなくてもカードは出る
  var svc = null;
  function photos(root){
    try {
      if (!(window.google && google.maps && google.maps.places)) return;
      if (!svc) svc = new google.maps.places.PlacesService(document.createElement('div'));
      root.querySelectorAll('.im[data-ph]').forEach(function(im){
        if (im.getAttribute('data-done')) return;
        var q = im.getAttribute('data-ph');
        if (!q) return;
        im.setAttribute('data-done', '1');
        svc.findPlaceFromQuery({ query: q, fields: ['photos'] }, function(res, st){
          try {
            if (st !== google.maps.places.PlacesServiceStatus.OK || !res || !res[0]) return;
            if (!res[0].photos || !res[0].photos.length) return;
            im.style.backgroundImage = 'url(' + res[0].photos[0].getUrl({ maxWidth: 600 }) + ')';
          } catch(e){}
        });
      });
    } catch(e){}
  }

  load();
  setInterval(function(){
    paint();
    try {
      ['seasonList', 'seasonListFull'].forEach(function(id){
        var el = document.getElementById(id);
        if (el && el.getAttribute('data-wev-src') === 'json') photos(el);
      });
    } catch(e){}
  }, 600);
})();

/* ══════════════════════════════════════════════════════════════
   ② 明治神宮で調べると「京都の愛宕神社」が混ざる問題（2026-09-02）

   ★原因★
   写真や座標を取りにいく findPlaceFromQuery が、
   「愛宕神社 神社」のように**名前だけ**で問い合わせていた。
   Googleは場所の指定が無いと、いちばん有名なものを返すので、
   東京・港区の愛宕神社を探しているのに京都の愛宕神社が返ってくる。
   （ルートの座標そのものは東京で正しいが、写真と詳細が京都のものになる）

   ★対策★
   問い合わせに場所の指定が無いときだけ、
   いま見ているルートの起点のまわり（60km）を指定として足す。
   起点が分からないときは何もしない（従来どおり）。
   ══════════════════════════════════════════════════════════════ */
(function(){
  if (window.__wabiPlaceBias) return;
  window.__wabiPlaceBias = true;

  // いま基準にすべき場所（緯度・経度）
  function center(){
    // ① 検索カードで確定した施設
    try {
      var p = window.wabiPickedPlace;
      if (p && typeof p.lat === 'number') return { lat: p.lat, lng: p.lng };
    } catch(e){}
    // ② いま作られているルートの1番目のスポット
    try {
      var rs = window._dynamicRoutes || window._aiRoutesPC;
      if (rs && rs.length){
        for (var i = 0; i < rs.length; i++){
          var s = rs[i] && rs[i].spots && rs[i].spots[0];
          if (s && typeof s.lat === 'number') return { lat: s.lat, lng: s.lng };
        }
      }
    } catch(e){}
    // ③ 開いているルート記事・プレビューの1番目
    try {
      var r = window.wabiCurrentRoute;
      if (r && r.spots && r.spots[0] && typeof r.spots[0].lat === 'number')
        return { lat: r.spots[0].lat, lng: r.spots[0].lng };
    } catch(e){}
    return null;
  }

  function patch(){
    try {
      if (!(window.google && google.maps && google.maps.places
            && google.maps.places.PlacesService)) return;
      var proto = google.maps.places.PlacesService.prototype;
      if (!proto || typeof proto.findPlaceFromQuery !== 'function') return;
      if (proto.findPlaceFromQuery.__wbias) return;

      var orig = proto.findPlaceFromQuery;
      var wrapped = function(req, cb){
        try {
          if (req && !req.locationBias && !req.locationRestriction){
            var c = center();
            // 60km以内を優先して探す（同じ名前の遠方の社を掴まないため）
            if (c) req.locationBias = { center: { lat: c.lat, lng: c.lng }, radius: 60000 };
          }
        } catch(e){}
        return orig.call(this, req, cb);
      };
      wrapped.__wbias = true;
      proto.findPlaceFromQuery = wrapped;
    } catch(e){}
  }

  patch();
  setInterval(patch, 500);
})();

/* ══════════════════════════════════════════════════════════════
   ③ ルート提案ページで下部メニューが効かなくなる問題の念押し修正
   （2026-09-02）

   これまでは click だけを見ていた。だが iPhone では、上に重なった画面が
   スクロールやタッチを先に受け取ると click が届かないことがある。
   そこで
     ・指が触れた瞬間（pointerdown / touchstart）にも反応する
     ・座標で「下部メニューのどのボタンか」を自分で判定する
     ・0.35秒たっても本来の click が来なければ、こちらから押してやる
     ・下部メニューは、あとから足したどの画面よりも必ず上に置く
   ══════════════════════════════════════════════════════════════ */
(function(){
  if (window.__wabiNavHard) return;
  window.__wabiNavHard = true;

  /* 下部メニューを最前面に固定する（自分で足したシート類より上） */
  var css = document.createElement('style');
  css.id = 'wabiNavHardCss';
  css.textContent = [
    'html body #wabiNav{',
    '  z-index:2147483600 !important;',
    '  pointer-events:auto !important;',
    '}',
    'html body #wabiNav .wn{pointer-events:auto !important;touch-action:manipulation;}'
  ].join('\n');
  function put(){
    var o = document.getElementById('wabiNavHardCss');
    if (o && o.parentNode) o.parentNode.removeChild(o);
    (document.head || document.documentElement).appendChild(css);
  }
  put();
  var n = 0;
  var iv = setInterval(function(){ put(); if (++n > 12) clearInterval(iv); }, 900);

  function close(){
    try { if (typeof window.wabiCloseAiPages === 'function') window.wabiCloseAiPages(); } catch(e){}
  }

  // その座標にある下部メニューのボタンを返す
  function wnAt(x, y){
    if (typeof x !== 'number' || typeof y !== 'number') return null;
    var nav = document.getElementById('wabiNav');
    if (!nav) return null;
    var r = nav.getBoundingClientRect();
    if (y < r.top - 2 || y > r.bottom + 2) return null;      // 下部メニューの高さの外
    var hit = null;
    nav.querySelectorAll('.wn').forEach(function(w){
      var b = w.getBoundingClientRect();
      if (x >= b.left - 2 && x <= b.right + 2) hit = w;
    });
    return hit;
  }

  var pending = null;

  function onDown(ev){
    try {
      var pt = ev.touches && ev.touches[0] ? ev.touches[0] : ev;
      var wn = wnAt(pt.clientX, pt.clientY);
      if (!wn) return;
      close();                                   // 先に上の画面を閉じる
      pending = wn;
      setTimeout(function(){
        if (pending !== wn) return;              // 本来の click が来た → 何もしない
        pending = null;
        try { wn.click(); } catch(e){}           // 来なかった → こちらから押す
      }, 350);
    } catch(e){}
  }

  ['pointerdown', 'touchstart'].forEach(function(t){
    document.addEventListener(t, onDown, true);
  });

  document.addEventListener('click', function(ev){
    try {
      var t = ev.target;
      if (t && t.closest && t.closest('#wabiNav .wn')){
        pending = null;                          // 本来の click が届いた
        close();
      }
    } catch(e){}
  }, true);
})();

/* ══════════════════════════════════════════════════════════════
   トップページの文字を1px大きくする（2026-09-02）

   ■ 対象
     トップページの「おすすめ記事」より上のセクションだけ。
     ヘッダー／検索カード／巡拝ルート／ランキング／みんなの投稿 など。
     おすすめ記事・テーマで巡るベスト10・それより下は今のまま。

   ■ 大きさの決め方（大きい文字は触らない）
       11px  → 12px
       12px  → 13px
       13px  → 13.5px
       15px以上 → そのまま
     行間も同じ比率で広げる。
     見出しと本文の大小の関係が変わらないので、デザインの印象は保たれる。

   ■ 大きくしない場所（ご指定）
     ① 検索窓の下の注意書き
     ② 「行きたい場所からルート作成」など4つ
     ③ ランキングカードの「◯件のクチコミ」
     ＋ 下部メニュー（高さが決まっていて崩れやすいため）

   ■ 二重に大きくならない仕組み
     一度変えた要素には data-wfs="1" の印を付け、二度目は触らない。
     画面が描き直されて新しい要素が出てきたら、それだけを大きくする。
   ══════════════════════════════════════════════════════════════ */
(function(){
  if (window.__wabiFontUp) return;
  window.__wabiFontUp = true;

  // 大きくしない場所
  var SKIP = [
    '#wabiNav',            // 下部メニュー
    '#wabiNameNote',       // ① 検索窓の下の注意書き
    '.hero-feat',          // ② 行きたい場所から…の4つ
    '.rcnt'                // ③ ◯件のクチコミ
  ].join(',');

  function targets(){
    var home = document.getElementById('pgHome');
    if (!home) return null;
    var kids = [].slice.call(home.children);
    // 「おすすめ記事」の1つ手前まで
    var stop = -1;
    for (var i = 0; i < kids.length; i++){
      var t = (kids[i].innerText || '').slice(0, 40);
      if (t.indexOf('おすすめ記事') >= 0) { stop = i; break; }
    }
    if (stop < 0) stop = 10;         // 見つからないときの安全値
    return kids.slice(0, stop);
  }

  function bump(e){
    try {
      if (e.getAttribute('data-wfs')) return;          // 済み
      if (e.closest && e.closest(SKIP)) { e.setAttribute('data-wfs','skip'); return; }
      var cs = getComputedStyle(e);
      var fs = parseFloat(cs.fontSize);
      if (!fs) return;
      var nv = null;
      if (fs <= 12.5) nv = fs + 1;
      else if (fs <= 13.5) nv = fs + 0.5;
      if (nv == null) { e.setAttribute('data-wfs','keep'); return; }
      e.setAttribute('data-wfs','1');
      var ratio = nv / fs;
      e.style.setProperty('font-size', nv.toFixed(1) + 'px', 'important');
      var lh = cs.lineHeight;
      if (/px$/.test(lh)){
        var lv = parseFloat(lh);
        if (lv) e.style.setProperty('line-height', (lv * ratio).toFixed(1) + 'px', 'important');
      }
    } catch(err){}
  }

  function run(){
    try {
      var secs = targets();
      if (!secs) return;
      secs.forEach(function(sec){
        bump(sec);
        sec.querySelectorAll('*').forEach(bump);
      });
    } catch(err){}
  }

  // ★concierge.js のデザインが当たってから始める★
  //   先に走ると、差し替え前の古いサイズ（10.5px など）を基準にしてしまい、
  //   さらに !important で固定してしまうので、狙いより小さくなる。
  function ready(){
    try {
      return !!document.getElementById('wabiTopFix3')
          && !!document.body && document.body.classList.contains('wabi-top');
    } catch(e){ return false; }
  }

  function start(){
    run();
    // 画面が描き直されたときのために、しばらく見張る（新しい要素だけ大きくなる）
    var n = 0;
    var iv = setInterval(function(){ run(); if (++n > 60) clearInterval(iv); }, 500);
    // それ以降もゆっくり見張る（検索結果の描き替えなど）
    setInterval(run, 2000);
  }

  var t0 = Date.now();
  var wait = setInterval(function(){
    if (ready() || Date.now() - t0 > 8000){    // 万一に備えて8秒で打ち切り
      clearInterval(wait);
      start();
    }
  }, 100);
})();

/* ============================================================
   __wabiHeroCopy : トップの説明文「行きたい神社やお寺、」の
                    改行前の読点（、）を消す
   ------------------------------------------------------------
   index.html の .hero-copy-sub は
     行きたい神社やお寺、<br>使える時間や…
   となっており、直後で改行するため「、」が不要。
   index.html は1.3MBあり携帯からアップロードできないため、
   ここ（routes.js）で表示時に取り除く。
   ・<br> の直前にある「、」だけを消す（文中の読点は残す）
   ・一度直した要素には印を付け、二度処理しない
   ============================================================ */
(function(){
  'use strict';
  function fix(el){
    if (!el || el.getAttribute('data-whc')) return;
    var h = el.innerHTML;
    if (h.indexOf('、') < 0) return;
    var n = h.replace(/、(\s*<br\s*\/?>)/gi, '$1');   // 改行直前の読点だけ削除
    if (n !== h) el.innerHTML = n;
    el.setAttribute('data-whc', '1');
  }
  function run(){
    try {
      var ls = document.querySelectorAll('.hero-copy-sub');
      for (var i = 0; i < ls.length; i++) fix(ls[i]);
    } catch (e) {}
  }
  function boot(){
    run();
    var n = 0;
    var iv = setInterval(function(){ run(); if (++n > 40) clearInterval(iv); }, 300);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();

/* ══════════════════════════════════════════════════════════════
   みんなの最新投稿：写真が神社・お寺と合っていないのを直す
   （2026-09-05）

   これまでの作り
   ・index.html の USER_POSTS には、寺社と関係のない
     フリー素材（Unsplash）の写真が入っていた
   ・concierge.js が Wikipedia の pageimages で上書きしていたが、
     Wikipedia が返すのは記事の代表画像なので、
     神社の紋章・地図・人物画・別の建物などが混ざる

   直し方
   ・Google Places（サイト内で既に使っている仕組み。鍵の追加なし）で
     「寺社名＋住所」で検索し、その場所の写真を取る
   ・返ってきた場所の名前と都道府県が一致するかを必ず確認してから使う
     （確認できないものは写真を出さず、鳥居マークのままにする）
   ・結果は端末内に7日間おぼえる（毎回の呼び出しを減らすため）
   ・Wikipedia の写真で上書きされないよう、書き換えを見張って直す

   ※合っている確証のない写真は「出さない」。
     関係ない写真を出すより、鳥居マークのほうが正しい。
   ══════════════════════════════════════════════════════════════ */
(function(){
  'use strict';
  if (window.__wabiPostPhoto) return;
  window.__wabiPostPhoto = true;

  var CACHE_KEY = 'wabiPostPhoto';
  var TTL = 7 * 24 * 60 * 60 * 1000;   // 7日
  var PHOTO = {};                       // 寺社名 → 確認できた写真URL

  function loadCache(){
    try {
      var o = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
      var now = Date.now();
      Object.keys(o).forEach(function(k){
        if (o[k] && o[k].u && (now - (o[k].t || 0)) < TTL) PHOTO[k] = o[k].u;
      });
    } catch(e){}
  }
  function saveCache(name, url){
    try {
      var o = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
      o[name] = { u: url, t: Date.now() };
      localStorage.setItem(CACHE_KEY, JSON.stringify(o));
    } catch(e){}
  }
  function dropCache(name){
    try {
      var o = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
      delete o[name];
      localStorage.setItem(CACHE_KEY, JSON.stringify(o));
    } catch(e){}
  }

  function prefOf(addr){
    var m = String(addr || '').match(/^(.{2,3}?[都道府県])/);
    return m ? m[1] : '';
  }

  /* 返ってきた場所が本当にその寺社かを確かめる
     （別の県の同名神社をつかまないようにするため）        */
  function looksRight(post, place){
    if (!place) return false;
    var want = String(post.shrine || '').replace(/\s/g, '');
    var got  = String(place.name || '').replace(/\s/g, '');
    if (!want || !got) return false;
    if (got.indexOf(want) < 0 && want.indexOf(got) < 0) return false;
    var pref = prefOf(post.addr);
    if (pref){
      var ad = String(place.formatted_address || '');
      if (ad && ad.indexOf(pref) < 0) return false;
    }
    return true;
  }

  /* ── 画面への反映 ───────────────────────────────── */
  function paintCard(card){
    try {
      var pid = card.getAttribute('data-pid');
      if (!pid || String(pid).charAt(0) === 'u') return;   // 自分の投稿は触らない
      var post = postById(pid);
      if (!post) return;
      var url = PHOTO[post.shrine] || '';
      var im  = card.querySelector('img');
      if (!im) return;
      if (url){
        if (im.getAttribute('src') !== url) im.setAttribute('src', url);
        card.classList.remove('noimg');
        if (!im.getAttribute('data-wpp')){
          im.setAttribute('data-wpp', '1');
          im.addEventListener('error', function(){
            // 写真URLの期限切れなど：覚えている内容を捨てて鳥居に戻す
            dropCache(post.shrine); delete PHOTO[post.shrine];
            card.classList.add('noimg');
          });
        }
      } else {
        // 確証のある写真がまだ無い：関係ない写真は出さず鳥居にする
        if (im.getAttribute('src')) im.removeAttribute('src');
        card.classList.add('noimg');
      }
    } catch(e){}
  }

  function paintAll(){
    try {
      var cards = document.querySelectorAll('.community-box .wcp-card');
      for (var i = 0; i < cards.length; i++) paintCard(cards[i]);
    } catch(e){}
  }

  function postById(pid){
    try {
      if (typeof USER_POSTS === 'undefined') return null;
      for (var i = 0; i < USER_POSTS.length; i++){
        if (String(USER_POSTS[i].id) === String(pid)) return USER_POSTS[i];
      }
    } catch(e){}
    return null;
  }

  /* ── 元の（関係ない）写真をまず外す ──────────────── */
  function stripWrongImages(){
    try {
      if (typeof USER_POSTS === 'undefined' || !USER_POSTS.length) return false;
      for (var i = 0; i < USER_POSTS.length; i++){
        var p = USER_POSTS[i];
        if (p.__wpp) continue;
        p.__wpp = 1;
        p.__imgOrig = p.img || '';
        p.img = PHOTO[p.shrine] || '';
        if (p.photos && p.photos.length) p.photos = p.img ? [p.img] : [];
      }
      return true;
    } catch(e){ return false; }
  }

  /* ── Google Places で正しい写真を取る ─────────────── */
  function placesReady(){
    try { return !!(window.google && google.maps && google.maps.places
                 && google.maps.places.PlacesService); } catch(e){ return false; }
  }

  function lookupAll(){
    if (typeof USER_POSTS === 'undefined') return;
    var svc;
    try { svc = new google.maps.places.PlacesService(document.createElement('div')); }
    catch(e){ return; }

    var todo = [];
    for (var i = 0; i < USER_POSTS.length; i++){
      var p = USER_POSTS[i];
      if (!p || !p.shrine) continue;
      if (String(p.id || '').charAt(0) === 'u') continue;   // 自分の投稿
      if (PHOTO[p.shrine]) continue;                        // 覚えている
      if (todo.indexOf(p) < 0) todo.push(p);
    }
    if (!todo.length) { paintAll(); return; }

    // 一度に投げると弾かれるので 300ms ずつずらす
    todo.forEach(function(p, idx){
      setTimeout(function(){
        try {
          svc.findPlaceFromQuery({
            query: p.shrine + ' ' + (p.addr || ''),
            fields: ['photos', 'name', 'formatted_address']
          }, function(res, st){
            try {
              if (st !== google.maps.places.PlacesServiceStatus.OK) return;
              if (!res || !res[0]) return;
              var place = res[0];
              if (!looksRight(p, place)) return;            // 確認できないものは使わない
              if (!place.photos || !place.photos.length) return;
              var url = place.photos[0].getUrl({ maxWidth: 600 });
              if (!url) return;
              PHOTO[p.shrine] = url;
              saveCache(p.shrine, url);
              // データ側も直す（もっと見る／投稿の詳細ページ用）
              for (var k = 0; k < USER_POSTS.length; k++){
                if (USER_POSTS[k].shrine === p.shrine){
                  USER_POSTS[k].img = url;
                  USER_POSTS[k].photos = [url];
                }
              }
              paintAll();
            } catch(e){}
          });
        } catch(e){}
      }, idx * 300);
    });
  }

  /* ── 起動 ────────────────────────────────────────── */
  loadCache();

  var n0 = 0;
  var iv0 = setInterval(function(){
    if (stripWrongImages() || ++n0 > 60) clearInterval(iv0);
  }, 100);
  stripWrongImages();

  var n1 = 0;
  var iv1 = setInterval(function(){
    if (placesReady()){ clearInterval(iv1); lookupAll(); }
    else if (++n1 > 150) clearInterval(iv1);       // 15秒であきらめる（鳥居のまま）
  }, 100);

  /* Wikipedia の写真で上書きされたら、画面に出る前に戻す */
  function watch(){
    try {
      var box = document.querySelector('.community-box');
      if (!box || box.__wpp) return;
      box.__wpp = 1;
      new MutationObserver(function(){ paintAll(); })
        .observe(box, { childList:true, subtree:true, attributes:true, attributeFilter:['src'] });
      paintAll();
    } catch(e){}
  }
  watch();
  setInterval(function(){ watch(); paintAll(); }, 1000);
})();

/* ══════════════════════════════════════════════════════════════
   記事の写真に、撮影者とライセンスの表示を入れる（2026-09-06）

   記事31本の写真はすべて ウィキメディア・コモンズ から取っている。
   コモンズの写真は多くが「撮影者名とライセンス名を表示すること」を
   条件に使用を許しているが、これまで表示が無かった。

   撮影者名とライセンスは写真ごとに違うため、決め打ちでは書けない。
   そこで「見る人のブラウザが、コモンズ本体に問い合わせて出す」方式にした。
   ・記事を開いたら、写真のファイル名からコモンズに一括で問い合わせる
   ・返ってきた撮影者名・ライセンス名をそのまま写真の下に出す
   ・答えが返るまで／返らないときは「出典：ウィキメディア・コモンズ」と
     写真のページへのリンクだけ出す（これは常に正しい）
   ・調べた結果は端末内に90日おぼえる（毎回問い合わせない）

   ※小さなカードの写真には入れない（デザインが崩れるため）。
   大きく表示される記事ページの写真に入れる。
   ══════════════════════════════════════════════════════════════ */
(function(){
  'use strict';
  if (window.__wabiImgCredit) return;
  window.__wabiImgCredit = true;

  var API = 'https://commons.wikimedia.org/w/api.php';
  var FILEPAGE = 'https://commons.wikimedia.org/wiki/File:';
  var CKEY = 'wabiImgCredit';
  var TTL = 90 * 24 * 60 * 60 * 1000; // 90日
  var MINW = 200; // これより小さい写真には入れない
  var memo = {}; // ファイル名 → {a:撮影者, l:ライセンス}

  /* 画像URL → コモンズのファイル名
     例 upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Foo.jpg/1280px-Foo.jpg → Foo.jpg */
  function fileOf(src){
    var m = String(src||'').match(
      /upload\.wikimedia\.org\/wikipedia\/commons\/(?:thumb\/)?[0-9a-f]\/[0-9a-f]{2}\/([^\/?#]+)/);
    if (!m) return null;
    try { return decodeURIComponent(m[1]); } catch(e){ return m[1]; }
  }

  /* コモンズが返す撮影者欄はHTMLなので、文字だけ取り出す */
  function plain(html){
    try {
      var d = document.createElement('div');
      d.innerHTML = String(html||'');
      return (d.textContent || '').replace(/\s+/g,' ').trim().slice(0,80);
    } catch(e){ return ''; }
  }
  function esc(s){
    return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;')
      .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function loadCache(){
    try {
      var o = JSON.parse(localStorage.getItem(CKEY) || '{}'), now = Date.now();
      Object.keys(o).forEach(function(k){
        if (o[k] && (now - (o[k].t||0)) < TTL) memo[k] = o[k];
      });
    } catch(e){}
  }
  function saveCache(){
    try {
      var o = {};
      Object.keys(memo).forEach(function(k){ o[k] = memo[k]; });
      localStorage.setItem(CKEY, JSON.stringify(o));
    } catch(e){}
  }

  var css = '.wimg-cr{font-size:10px;line-height:1.5;color:#a89a80;margin:5px 0 14px;'
          + 'text-align:right;font-family:"Noto Sans JP",sans-serif;}'
          + '.wimg-cr a{color:#a89a80;text-decoration:underline;}'
          /* 記事の一番上の写真は画面いっぱいなので、右端に余白を足す */
          + '.wimg-cr.hero{padding:0 16px;margin:6px 0 2px;}';
  try {
    var st = document.createElement('style');
    st.id = 'wabiImgCreditCss'; st.textContent = css;
    document.head.appendChild(st);
  } catch(e){}

  /* 1枚ぶんの表示を作る（判っている情報だけを書く） */
  function lineFor(file){
    var url = FILEPAGE + encodeURIComponent(file.replace(/ /g,'_'));
    var d = memo[file];
    if (d && d.a){
      return '写真：' + esc(d.a)
           + (d.l ? ' ／ ' + esc(d.l) : '')
           + ' ／ <a href="' + esc(url) + '" target="_blank" rel="noopener">ウィキメディア・コモンズ</a>';
    }
    // まだ判らない：確実に正しいことだけ出す
    return '出典：<a href="' + esc(url) + '" target="_blank" rel="noopener">ウィキメディア・コモンズ</a>';
  }

  /* 表示を差し込む位置を決める。
     記事の一番上の写真（.article-hero）のように、写真を切り抜いて
     見せている入れ物の中に入れると、表示が写真の上に重なって読めない。
     はみ出しを隠している入れ物は飛び越えて、その外側に置く。 */
  function anchorFor(im){
    var el = im;
    for (var i = 0; i < 4; i++){
      var pa = el.parentNode;
      if (!pa || pa === document.body || pa.nodeType !== 1) break;
      var cs;
      try { cs = getComputedStyle(pa); } catch(e){ break; }
      var clips = (cs.overflow === 'hidden' || cs.overflowY === 'hidden');
      var tight = pa.getBoundingClientRect().bottom <= el.getBoundingClientRect().bottom + 1;
      if (!clips && !tight) break;
      el = pa;
    }
    return el;
  }

  function paint(root){
    var imgs;
    try { imgs = (root || document).querySelectorAll('img'); } catch(e){ return []; }
    var want = [];
    [].forEach.call(imgs, function(im){
      var file = fileOf(im.getAttribute('src'));
      if (!file) return;
      var w = im.getBoundingClientRect().width || im.naturalWidth || 0;
      if (w && w < MINW) return; // 小さなカードは対象外
      var cr = im.__wcr;
      if (!cr || !cr.parentNode){
        cr = document.createElement('div');
        cr.className = 'wimg-cr';
        im.__wcr = cr;
        var after = anchorFor(im);
        if (after !== im) cr.className = 'wimg-cr hero'; // 画面いっぱいの写真
        if (after && after.parentNode) after.parentNode.insertBefore(cr, after.nextSibling);
      }
      var html = lineFor(file);
      if (cr.innerHTML !== html) cr.innerHTML = html;
      if (!memo[file] && want.indexOf(file) < 0) want.push(file);
    });
    return want;
  }

  var asking = {};
  function ask(files){
    var todo = files.filter(function(f){ return !asking[f]; });
    if (!todo.length) return;
    todo.forEach(function(f){ asking[f] = 1; });
    // まとめて問い合わせる（一度に20件まで）
    for (var i = 0; i < todo.length; i += 20){
      (function(chunk){
        var titles = chunk.map(function(f){ return 'File:' + f; }).join('|');
        var url = API + '?action=query&format=json&origin=*&prop=imageinfo'
                + '&iiprop=extmetadata'
                + '&iiextmetadatafilter=Artist%7CLicenseShortName'
                + '&titles=' + encodeURIComponent(titles);
        fetch(url).then(function(r){ return r.ok ? r.json() : null; }).then(function(j){
          if (!j || !j.query || !j.query.pages) return;
          var pages = j.query.pages, got = false;
          Object.keys(pages).forEach(function(k){
            var p = pages[k];
            var title = String(p.title||'').replace(/^File:/,'');
            var ii = p.imageinfo && p.imageinfo[0];
            var ex = (ii && ii.extmetadata) || {};
            var artist = plain(ex.Artist && ex.Artist.value);
            var license = plain(ex.LicenseShortName && ex.LicenseShortName.value);
            if (artist || license){
              memo[title] = { a:artist, l:license, t:Date.now() };
              got = true;
            }
          });
          if (got){ saveCache(); paint(document.getElementById('pgArticleDetail')); }
        }).catch(function(){});
      })(todo.slice(i, i + 20));
    }
  }

  function run(){
    var pg = document.getElementById('pgArticleDetail');
    if (!pg || pg.style.display === 'none') return;
    var want = paint(pg);
    if (want.length) ask(want);
  }

  loadCache();
  run();
  setInterval(run, 1200);
})();
