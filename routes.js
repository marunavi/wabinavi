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
})();
