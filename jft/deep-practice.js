// Original follow-up conversations and practice for each non-kana chapter.
// Keep this separate from the base lessons so existing chapter IDs and saved progress remain stable.
(() => {
  'use strict';
  const talks = {
    3: [['Classmate','お名前（なまえ）は何（なん）ですか。','What is your name?'],['You','リナです。フィリピンから来（き）ました。','I am Rina. I came from the Philippines.']],
    4: [['Visitor','この本（ほん）はいくらですか。','How much is this book?'],['Staff','八百円（はっぴゃくえん）です。','It is 800 yen.']],
    5: [['Customer','カードで払（はら）えますか。','Can I pay by card?'],['Clerk','はい、カードで払（はら）えます。','Yes, you can pay by card.']],
    6: [['Customer','このサンドイッチに卵（たまご）は入（はい）っていますか。','Does this sandwich contain egg?'],['Clerk','はい、卵（たまご）が入（はい）っています。','Yes, it contains egg.']],
    7: [['Visitor','美術館（びじゅつかん）行（い）きのバスは何番（なんばん）乗（の）り場（ば）ですか。','Which bay has the museum bus?'],['Staff','二番（にばん）乗（の）り場（ば）です。','It leaves from bay two.']],
    8: [['Visitor','図書館（としょかん）は日曜日（にちようび）も開（あ）いていますか。','Is the library open on Sunday too?'],['Staff','はい。でも、入館（にゅうかん）は午後五時半（ごごごじはん）までです。','Yes, but you must enter by 5:30 p.m.']],
    9: [['Friend','日曜日（にちようび）に映画（えいが）を見（み）ませんか。','Would you like to see a movie on Sunday?'],['You','いいですね。午後二時半（ごごにじはん）に駅（えき）の前（まえ）で会（あ）いましょう。','Sounds good. Let us meet in front of the station at 2:30 p.m.']],
    10: [['Worker','この箱（はこ）はどこに置（お）きますか。','Where should I put this box?'],['Colleague','二階（にかい）の倉庫（そうこ）の棚（たな）に置（お）いてください。','Put it on the shelf in the second-floor storeroom.']],
    11: [['Worker','火曜日（かようび）は何時（なんじ）に来（き）ますか。','What time should I come on Tuesday?'],['Supervisor','午前十時五十分（ごぜんじゅうじごじゅっぷん）に来（き）てください。','Please come at 10:50 a.m.']],
    12: [['Worker','ここで写真（しゃしん）を撮（と）ってもいいですか。','May I take photos here?'],['Supervisor','いいえ、作業場（さぎょうば）では撮（と）らないでください。','No. Please do not take photos in the work area.']],
    13: [['Patient','昨日（きのう）から熱（ねつ）があります。予約（よやく）が必要（ひつよう）ですか。','I have had a fever since yesterday. Do I need an appointment?'],['Staff','はい。初（はじ）めての方（かた）は電話（でんわ）で予約（よやく）してください。','Yes. First-time patients should book by phone.']],
    14: [['Resident','台所（だいどころ）で水（みず）が止（と）まりません。','The water will not stop in the kitchen.'],['Manager','わかりました。今日（きょう）の午後（ごご）に見（み）に行（い）きます。','Understood. I will come take a look this afternoon.']],
    15: [['Friend','雨（あめ）が降（ふ）ったら、料理教室（りょうりきょうしつ）はどこですか。','Where is the cooking class if it rains?'],['You','市民（しみん）センターの二階（にかい）です。','It is on the second floor of the community center.']],
    16: [['Friend','明日（あした）も公園（こうえん）で会（あ）いますか。','Are we still meeting at the park tomorrow?'],['You','雨（あめ）なら体育館（たいいくかん）で会（あ）いましょう。','If it rains, let us meet at the gym.']],
    17: [['Friend','駅（えき）に近（ちか）い部屋（へや）はどちらですか。','Which room is closer to the station?'],['You','Aのほうが近（ちか）いですが、家賃（やちん）は高（たか）いです。','A is closer, but its rent is higher.']],
    18: [['Visitor','市民（しみん）センターへはどの出口（でぐち）から出（で）ますか。','Which exit should I use for the community center?'],['Staff','東口（ひがしぐち）から出（で）てください。','Please use the east exit.']],
    19: [['Friend','写真（しゃしん）クラブに行（い）ったことがありますか。','Have you been to the photo club?'],['You','いいえ、まだありません。でも、行（い）ってみたいです。','No, not yet. But I would like to try it.']],
    20: [['Worker','印刷（いんさつ）の仕方（しかた）を教（おし）えてください。','Please show me how to print.'],['Colleague','まず、画面（がめん）で名前（なまえ）を選（えら）んでください。','First, select your name on the screen.']],
    21: [['Learner','土曜日（どようび）のクラスは何時（なんじ）からですか。','What time does the Saturday class start?'],['Staff','午前十時（ごぜんじゅうじ）からです。','It starts at 10 a.m.']],
    22: [['Friend','私（わたし）は野菜（やさい）を切（き）ります。パンを温（あたた）めてもらえますか。','I will cut the vegetables. Could you warm the bread?'],['You','はい、パンを温（あたた）めます。','Yes, I will warm the bread.']],
    23: [['Customer','卵（たまご）のアレルギーがあります。ソースに卵（たまご）は入（はい）っていますか。','I have an egg allergy. Does the sauce contain egg?'],['Staff','はい。材料（ざいりょう）を確認（かくにん）します。','Yes. I will check the ingredients.']],
    24: [['Traveler','土曜日（どようび）のバスに空席（くうせき）はありますか。','Are seats available on Saturday’s bus?'],['Agent','はい、二席（にせき）あります。','Yes, two seats remain.']],
    25: [['Traveler','中央線（ちゅうおうせん）は動（うご）いていますか。','Is the Central Line running?'],['Staff','いいえ。代行（だいこう）バスを使（つか）ってください。','No. Please use the replacement bus.']],
    26: [['Patient','昨日（きのう）から熱（ねつ）と咳（せき）があります。','I have had a fever and cough since yesterday.'],['Staff','わかりました。保険証（ほけんしょう）を見（み）せてください。','Understood. Please show your insurance card.']],
    27: [['Patient','青（あお）い薬（くすり）はいつ飲（の）みますか。','When should I take the blue medicine?'],['Pharmacist','寝（ね）る前（まえ）に一錠（いちじょう）飲（の）んでください。','Take one tablet before bed.']],
    28: [['Neighbor','廊下（ろうか）に物（もの）を置（お）かないでください。','Please do not leave things in the corridor.'],['Resident','すみません。すぐに片（かた）づけます。','Sorry. I will move them right away.']],
    29: [['Friend','雨（あめ）なら市場（いちば）は中止（ちゅうし）ですか。','Is the market canceled if it rains?'],['You','いいえ。市民（しみん）センターの二階（にかい）で開催（かいさい）します。','No. It will be held on the community center’s second floor.']],
    30: [['Friend','花火（はなび）は何時（なんじ）からですか。','What time do the fireworks begin?'],['You','午後七時（ごごしちじ）からです。','They begin at 7 p.m.']],
    31: [['Worker','お客様（きゃくさま）への電話（でんわ）はもうしましたか。','Have you called the customer yet?'],['Colleague','いいえ、まだです。午後二時（ごごにじ）までにお願（ねが）いします。','No, not yet. Please do it by 2 p.m.']],
    32: [['Supervisor','けがをした人（ひと）はいますか。','Was anyone hurt?'],['Worker','いいえ、けがをした人（ひと）はいません。','No, no one was hurt.']],
    33: [['Visitor','エレベーターを使（つか）ってもいいですか。','May I use the elevator?'],['Staff','いいえ、東側（ひがしがわ）の階段（かいだん）を使（つか）ってください。','No. Please use the east stairs.']],
    34: [['Friend','最近（さいきん）、何（なに）ができるようになりましたか。','What have you become able to do recently?'],['Learner','短（みじか）いメニューが読（よ）めるようになりました。','I have become able to read short menus.']],
    35: [['Friend','どうして日本語（にほんご）を勉強（べんきょう）していますか。','Why are you studying Japanese?'],['You','日本（にほん）で働（はたら）くために勉強（べんきょう）しています。','I am studying in order to work in Japan.']],
    36: [['Friend','集合場所（しゅうごうばしょ）は一階（いっかい）ですか。','Is the meeting place on the first floor?'],['You','いいえ、新（あたら）しいお知（し）らせでは二階（にかい）です。','No. The new notice says the second floor.']],
  };
  const course = window.ikigaiJft;
  const question = (prompt, choices, answer, why, skill, audio) => ({ prompt, choices, answer, why, skill, audio });
  for (const lesson of course.lessons) {
    if (lesson.chart) {
      lesson.kanaDrill = true;
      const cells = lesson.chart.flat().filter(Boolean);
      const positions = [0, 5, 10, 15, 20, 25, 30, 35, 40];
      for (const position of positions) {
        const [kana, reading] = cells[position];
        const wrong = [cells[(position + 3) % cells.length][1], cells[(position + 8) % cells.length][1]];
        lesson.questions.push(question(`Hear and read ${kana}. Which sound matches?`, [reading, ...wrong], 0,
          `${kana} is read ${reading}.`, 'Kana recall', kana));
      }
      continue;
    }
    if (!lesson.passage || !lesson.words) continue;
    lesson.secondScript = talks[lesson.id];
    const extra = [];
    // Recall the word from a practical English cue, then identify a spoken word.
    for (let i = 0; i < 3; i++) {
      const right = lesson.words[i];
      const others = [lesson.words[(i + 2) % lesson.words.length], lesson.words[(i + 4) % lesson.words.length]];
      extra.push(question(`Which Japanese word means “${right[1]}”?`, [right[0], ...others.map(x => x[0])], 0,
        `${right[0]} means ${right[1]}.`, 'Vocabulary'));
    }
    const distractors = lesson.words.slice(3, 6).map(word => word[1]);
    extra.push(question('Listen to the word. What does it mean?', [lesson.words[0][1], ...distractors.slice(0, 2)], 0,
      `${lesson.words[0][0]} means ${lesson.words[0][1]}.`, 'Listening · word', lesson.words[0][0]));
    const talk = talks[lesson.id];
    if (talk) {
      const otherMeaning = course.lessons.find(item => item.id === (lesson.id === 36 ? 35 : lesson.id + 1))?.script?.[0]?.[2] || distractors[0];
      extra.push(question('Listen to the second speaker. What did they say?', [talk[1][2], talk[0][2], otherMeaning], 0,
        `${talk[1][1]} means “${talk[1][2]}”`, 'Listening · dialogue', talk[1][1]));
    }
    // Earlier chapters need additional expression practice to reach a full mixed check.
    if (lesson.questions.length < 10) {
      for (let i = 0; i < 4; i++) {
        const right = lesson.examples[i];
        extra.push(question(`Which sentence means “${right[1]}”?`,
          [right[0], lesson.examples[i + 4][0], lesson.examples[i + 8][0]], 0,
          right[2], 'Expression'));
      }
    }
    lesson.questions.push(...extra);
  }
})();
