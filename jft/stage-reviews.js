// Original transfer tasks: a new everyday text and spoken message after each stage.
window.ikigaiJftReviews = [
  {
    id: 1, title: 'First steps review', sourceTitle: 'Classroom card',
    source: 'わたしはマリです。フィリピンから来（き）ました。日本語（にほんご）のクラスは火曜日（かようび）の午後二時（ごごにじ）からです。教室（きょうしつ）は二階（にかい）です。',
    translation: 'I am Mari. I came from the Philippines. Japanese class starts Tuesday at 2 p.m. The classroom is on the second floor.',
    spoken: 'クラスのあと、図書館（としょかん）へ行（い）きます。',
    questions: [
      ['Where is Mari from?', ['The Philippines','Japan','Brazil'], 0, 'フィリピンから来ました names her country.'],
      ['Where is the classroom?', ['First floor','Second floor','Third floor'], 1, '二階 means second floor.'],
      ['When does class start?', ['Tuesday at 2 p.m.','Thursday at 2 p.m.','Tuesday at 3 p.m.'], 0, '火曜日の午後二時から gives the day and time.'],
      ['Listen. Where will the speaker go after class?', ['The library','The station','The shop'], 0, '図書館へ行きます means going to the library.', 'Listening'],
    ],
  },
  {
    id: 2, title: 'Daily errands review', sourceTitle: 'Shop and bus plan',
    source: '駅前（えきまえ）の店（みせ）は午前九時（ごぜんくじ）から午後六時（ごごろくじ）までです。パンは一つ百八十円（ひゃくはちじゅうえん）で、カードで払（はら）えます。美術館（びじゅつかん）行（い）きのバスは十時半（じゅうじはん）に二番（にばん）乗（の）り場（ば）から出（で）ます。',
    translation: 'The shop by the station is open from 9 a.m. to 6 p.m. Bread costs ¥180 each, and cards are accepted. The museum bus leaves from bay two at 10:30.',
    spoken: 'パンを二つください。カードで払（はら）います。',
    questions: [
      ['How much is one bread roll?', ['¥180','¥280','¥100'], 0, 'パンは一つ百八十円.'],
      ['Where does the museum bus depart?', ['Bay one','Bay two','Bay three'], 1, '二番乗り場 is bay two.'],
      ['Can a customer pay by card?', ['Yes','No','Only after six'], 0, 'カードで払えます means cards are accepted.'],
      ['Listen. How many bread rolls does the customer request?', ['One','Two','Three'], 1, '二つ means two.', 'Listening'],
    ],
  },
  {
    id: 3, title: 'Life and work review', sourceTitle: 'Workplace message',
    source: 'アヤさんへ。明日（あした）は午前八時半（ごぜんはちじはん）に事務所（じむしょ）に来（き）てください。作業場（さぎょうば）に入（はい）る前（まえ）に手袋（てぶくろ）を着（つ）けてください。昼休（ひるやす）みは正午（しょうご）からです。',
    translation: 'Aya, please come to the office tomorrow at 8:30 a.m. Put on gloves before entering the work area. The lunch break begins at noon.',
    spoken: '明日（あした）は名札（なふだ）も持（も）ってきてください。',
    questions: [
      ['When should Aya arrive?', ['8:00 a.m.','8:30 a.m.','9:30 a.m.'], 1, '午前八時半 is 8:30 a.m.'],
      ['What must Aya do before entering the work area?', ['Take off her shoes','Put on gloves','Call the office'], 1, '手袋を着けてください says to put on gloves.'],
      ['When does lunch break begin?', ['11 a.m.','Noon','1 p.m.'], 1, '正午 means noon.'],
      ['Listen. What else should Aya bring?', ['A name badge','A book','A ticket'], 0, '名札 means name badge.', 'Listening'],
    ],
  },
  {
    id: 4, title: 'Plans and participation review', sourceTitle: 'Weekend class update',
    source: '土曜日（どようび）の写真（しゃしん）クラスは雨（あめ）のため、市民（しみん）センターで行（おこな）います。午前十時（ごぜんじゅうじ）に東口（ひがしぐち）で集（あつ）まってください。カメラがない人（ひと）は、金曜日（きんようび）までに連絡（れんらく）してください。',
    translation: 'Because of rain, Saturday’s photography class will be at the community center. Meet at the east entrance at 10 a.m. If you do not have a camera, contact the organizers by Friday.',
    spoken: 'カメラがない方（かた）には、カメラを貸（か）します。',
    questions: [
      ['Why did the venue change?', ['Rain','A holiday','A canceled train'], 0, '雨のため gives the reason.'],
      ['Where should participants meet?', ['West entrance','East entrance','The station'], 1, '東口 is the east entrance.'],
      ['By when should someone without a camera contact the organizers?', ['Thursday','Friday','Saturday'], 1, '金曜日までに sets the deadline.'],
      ['Listen. What can people without a camera do?', ['Borrow one','Buy one at the class','Skip the class'], 0, 'カメラを貸します means cameras can be borrowed.', 'Listening'],
    ],
  },
  {
    id: 5, title: 'Food, travel, and health review', sourceTitle: 'Trip meal note',
    source: '日曜日（にちようび）のバスは午前九時（ごぜんくじ）に駅（えき）の北口（きたぐち）から出（で）ます。昼（ひる）の弁当（べんとう）には卵（たまご）が入（はい）っています。アレルギーがある方（かた）は、土曜日（どようび）までに電話（でんわ）してください。',
    translation: 'Sunday’s bus leaves from the station’s north exit at 9 a.m. The lunch box contains egg. Anyone with an allergy should call by Saturday.',
    spoken: 'バスに乗（の）る前（まえ）に水（みず）を二本（にほん）買（か）います。',
    questions: [
      ['Where does the bus depart?', ['North exit','South exit','Community center'], 0, '北口 is the north exit.'],
      ['What does the lunch box contain?', ['Milk','Egg','Wheat'], 1, '卵が入っています.'],
      ['By when should someone with an allergy call?', ['Friday','Saturday','Sunday'], 1, '土曜日までに is the deadline.'],
      ['Listen. How many bottles of water will the speaker buy?', ['One','Two','Three'], 1, '水を二本 means two bottles of water.', 'Listening'],
    ],
  },
  {
    id: 6, title: 'Community and work review', sourceTitle: 'Building event notice',
    source: '日曜日（にちようび）の防災（ぼうさい）イベントは午後一時（ごごいちじ）からです。雨（あめ）の場合（ばあい）は二階（にかい）の会議室（かいぎしつ）で行（おこな）います。非常口（ひじょうぐち）の前（まえ）に物（もの）を置（お）かないでください。',
    translation: 'Sunday’s disaster-preparedness event starts at 1 p.m. If it rains, it will be held in the second-floor meeting room. Do not place anything in front of the emergency exit.',
    spoken: 'イベントのあと、受付（うけつけ）に来（き）てください。',
    questions: [
      ['When does the event begin?', ['1 p.m.','2 p.m.','1 a.m.'], 0, '午後一時 is 1 p.m.'],
      ['Where does it move if it rains?', ['First-floor lobby','Second-floor meeting room','Outside the building'], 1, '二階の会議室 is the new location.'],
      ['What must be kept clear?', ['The corridor window','The emergency exit','The station gate'], 1, '非常口の前に物を置かないでください.'],
      ['Listen. Where should participants go after the event?', ['Reception','The station','The emergency exit'], 0, '受付に来てください means come to reception.', 'Listening'],
    ],
  },
  {
    id: 7, title: 'Next steps review', sourceTitle: 'Application update',
    source: 'ホテルの仕事（しごと）に応募（おうぼ）しました。書類（しょるい）の締（し）め切（き）りは金曜日（きんようび）です。面接（めんせつ）は来週（らいしゅう）の月曜日（げつようび）に変（か）わりました。新（あたら）しいお知（し）らせを確認（かくにん）してください。',
    translation: 'I applied for a hotel job. The document deadline is Friday. The interview has moved to next Monday. Check the new notice.',
    spoken: '面接（めんせつ）は午前十時（ごぜんじゅうじ）からです。',
    questions: [
      ['What kind of work is the writer applying for?', ['Hotel work','Restaurant work','School work'], 0, 'ホテルの仕事 is hotel work.'],
      ['When are the documents due?', ['Friday','Monday','Next month'], 0, '締め切りは金曜日です.'],
      ['When is the updated interview?', ['This Friday','Next Monday','Next Tuesday'], 1, '来週の月曜日 is next Monday.'],
      ['Listen. When does the interview begin?', ['9 a.m.','10 a.m.','10 p.m.'], 1, '午前十時 is 10 a.m.', 'Listening'],
    ],
  },
];
