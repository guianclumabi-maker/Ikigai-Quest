// Original Ikigai Quest A2 expansion. Existing chapter IDs 1–15 are untouched.
(() => {
  'use strict';
  const course = window.ikigaiJft;
  const item = (ja, en, note) => [ja, en, note];
  const question = (prompt, choices, answer, why, skill) => ({ prompt, choices, answer, why, skill });
  const lessons = [
    {
      id: 16, title: 'Weather changes a plan', goal: 'Understand a forecast and agree on a new plan.',
      scene: 'You planned a picnic. The forecast changes, so you check a notice and call a friend.',
      teach: 'The stem of a ます verb plus そうです describes an appearance: 雨が降りそうです means rain looks likely. A plain form plus かもしれません marks uncertainty. Do not confuse these with a report of something you heard.',
      words: [['天気予報（てんきよほう）','weather forecast'],['晴（は）れる','to clear up'],['降（ふ）る','to fall, of rain'],['中止（ちゅうし）','cancellation'],['延期（えんき）','postponement'],['屋内（おくない）','indoors']],
      examples: [
        item('午後（ごご）は雨（あめ）が降（ふ）りそうです。','It looks like it will rain this afternoon.','降ります loses ます before そうです; the speaker is judging signs of rain.'),
        item('明日（あした）は晴（は）れるかもしれません。','It may be sunny tomorrow.','晴れる is the plain form before かもしれません; the prediction is uncertain.'),
        item('天気予報（てんきよほう）を見（み）ましたか。','Did you check the forecast?','を marks what was checked; 見ました is polite past tense.'),
        item('雨（あめ）なら、公園（こうえん）に行（い）きません。','If it rains, we will not go to the park.','なら sets the condition being discussed; 行きません is a polite negative.'),
        item('雨（あめ）の場合（ばあい）、会場（かいじょう）は体育館（たいいくかん）です。','In case of rain, the venue is the gym.','の場合 is common in notices for a stated condition.'),
        item('ピクニックは中止（ちゅうし）になりました。','The picnic has been canceled.','中止になる describes a change to the event’s status.'),
        item('土曜日（どようび）に延期（えんき）しましょう。','Let’s postpone it to Saturday.','に marks the new day; ましょう makes a suggestion.'),
        item('屋内（おくない）で昼（ひる）ご飯（はん）を食（た）べましょう。','Let’s eat lunch indoors.','で marks where the eating will happen.'),
        item('まだ雨（あめ）が降（ふ）っていません。','It is not raining yet.','まだ with a negative form means not yet.'),
        item('出（で）かける前（まえ）に連絡（れんらく）してください。','Please contact me before you leave.','Dictionary form plus 前に means before an action.')
      ],
      passage: ['Picnic notice','日曜日（にちようび）のピクニックは、午前（ごぜん）に雨（あめ）が降（ふ）る場合（ばあい）、中止（ちゅうし）です。<br>午後（ごご）に晴（は）れたら、二時（にじ）から体育館（たいいくかん）で集（あつ）まります。<br>出（で）かける前（まえ）に、このページを見（み）てください。'],
      translation: 'Sunday’s picnic is canceled if it rains in the morning. If it clears up in the afternoon, the group will meet at the gym from 2 p.m. Check this page before leaving.',
      script: [['A','明日（あした）は雨（あめ）が降（ふ）りそうですね。','It looks as though it will rain tomorrow.'],['B','そうですね。公園（こうえん）の代（か）わりに体育館（たいいくかん）に行（い）きましょう。','Yes. Let’s go to the gym instead of the park.']],
      checks: [
        question('If it rains Sunday morning, what happens to the picnic?',['It starts earlier','It is canceled','It moves outside'],1,'The notice says 午前に雨が降る場合、中止です.','Reading'),
        question('Where will the group meet if the weather clears in the afternoon?',['At the gym','At the park','At the station'],0,'The notice names 体育館 as the meeting place.','Reading'),
        question('What should you do before leaving?',['Buy a ticket','Call the gym','Check the page'],2,'出かける前に、このページを見てください asks you to check the page.','Reading'),
        question('In the conversation, what replaces the park?',['A café','The gym','A library'],1,'B says 公園の代わりに体育館.','Listening')
      ], task: ['Tell a friend that tomorrow’s park plan might change because of rain.','明日（あした）は雨（あめ）が降（ふ）るかもしれません。公園（こうえん）に行（い）く前（まえ）に連絡（れんらく）します。']
    },
    {
      id: 17, title: 'Describing your area', goal: 'Compare two places and explain which suits you.',
      scene: 'You are choosing between two apartments and want to compare travel time and nearby shops.',
      teach: 'A より B のほうが … compares two things: B has more of the quality. 近い and 遠い describe distance; 便利 describes convenience. A shorter trip does not automatically mean a cheaper apartment.',
      words: [['駅（えき）','station'],['近（ちか）い','near'],['遠（とお）い','far'],['便利（べんり）','convenient'],['家賃（やちん）','rent'],['静（しず）か','quiet']],
      examples: [
        item('この部屋（へや）は駅（えき）に近（ちか）いです。','This room is close to the station.','に marks the point of reference for 近い.'),
        item('あの部屋（へや）は駅（えき）から遠（とお）いです。','That room is far from the station.','から marks the starting point for measuring distance.'),
        item('AよりBのほうが安（やす）いです。','B is cheaper than A.','より marks the comparison baseline; のほうが marks the option with the quality.'),
        item('駅前（えきまえ）のほうが便利（べんり）です。','The area in front of the station is more convenient.','のほうが can refer back to a comparison already understood.'),
        item('この町（まち）は静（しず）かです。','This town is quiet.','静か is a な-adjective; do not add い.'),
        item('スーパーまで歩（ある）いて五分（ごふん）です。','The supermarket is five minutes away on foot.','歩いて gives the mode of travel; まで marks the destination.'),
        item('家賃（やちん）は月（つき）に六万円（ろくまんえん）です。','The rent is 60,000 yen per month.','月に sets the monthly interval.'),
        item('近（ちか）いですが、少（すこ）し高（たか）いです。','It is close, but a little expensive.','が links contrasting descriptions politely.'),
        item('駅（えき）から十分（じゅっぷん）かかります。','It takes ten minutes from the station.','かかります expresses the time required.'),
        item('私（わたし）は静（しず）かな所（ところ）が好（す）きです。','I like quiet places.','A な-adjective uses な before a noun: 静かな所.')
      ],
      passage: ['Two apartment listings','A：駅（えき）から歩（ある）いて三分（さんぷん）。家賃（やちん）は七万円（ななまんえん）。スーパーは近（ちか）いです。<br>B：駅（えき）から歩（ある）いて十二分（じゅうにふん）。家賃（やちん）は五万円（ごまんえん）。公園（こうえん）が近（ちか）くて、静（しず）かです。'],
      translation: 'A is a three-minute walk from the station, costs ¥70,000 monthly, and is near a supermarket. B is a twelve-minute walk, costs ¥50,000 monthly, and is quiet near a park.',
      script: [['A','駅（えき）に近（ちか）い部屋（へや）がいいですか。','Would you prefer a room close to the station?'],['B','いいえ。家賃（やちん）が安（やす）くて、静（しず）かな部屋（へや）がいいです。','No. I want a cheaper, quiet room.']],
      checks: [question('Which listing has the lower rent?',['A','B','They cost the same'],1,'B is ¥50,000; A is ¥70,000.','Reading'),question('Which listing is closer to the station?',['A','B','Neither'],0,'A is three minutes away; B is twelve.','Reading'),question('Which listing is near a park?',['A','B','Both'],1,'B says 公園が近くて.','Reading'),question('What does the speaker prefer?',['A cheap, quiet room','A room over a shop','A room beside the station'],0,'B asks for 家賃が安くて、静かな部屋.','Listening')],
      task: ['Compare the two apartments for a friend who wants a shorter walk.','Aのほうが駅（えき）に近（ちか）いです。でも、Bより家賃（やちん）が高（たか）いです。']
    },
    {
      id: 18, title: 'When you get lost', goal: 'Ask for clarification and follow landmark-based directions.',
      scene: 'You leave a station through the wrong exit and need to find the community center.',
      teach: 'A て-form plus から sequences actions: turn, then continue. まで identifies the endpoint. When directions are unclear, repeat the landmark and ask for confirmation.',
      words: [['出口（でぐち）','exit'],['右（みぎ）','right'],['左（ひだり）','left'],['曲（ま）がる','to turn'],['交差点（こうさてん）','intersection'],['まっすぐ','straight ahead']],
      examples: [
        item('東口（ひがしぐち）から出（で）てください。','Please leave by the east exit.','から marks the starting exit.'),
        item('交差点（こうさてん）までまっすぐ行（い）ってください。','Go straight until the intersection.','まで tells you where to stop going straight.'),
        item('右（みぎ）に曲（ま）がってから、橋（はし）を渡（わた）ります。','After turning right, cross the bridge.','てから gives a clear order: turn first, cross second.'),
        item('左（ひだり）ではなく、右（みぎ）です。','It is right, not left.','ではなく corrects a previous choice.'),
        item('銀行（ぎんこう）のとなりにあります。','It is next to the bank.','のとなり locates one place relative to another.'),
        item('二（ふた）つ目（め）の信号（しんごう）で曲（ま）がります。','Turn at the second traffic light.','で marks the place where you turn.'),
        item('この道（みち）で合（あ）っていますか。','Is this the right road?','合っていますか checks whether your choice is correct.'),
        item('もう一度（いちど）言（い）ってください。','Please say it once more.','もう一度 requests a repeat.'),
        item('ここから歩（ある）いて何分（なんぷん）ですか。','How many minutes is it from here on foot?','何分 asks for the amount of time.'),
        item('橋（はし）を渡（わた）ったら、左（ひだり）にあります。','After you cross the bridge, it is on the left.','渡ったら makes the crossing the point after which you look left.')
      ],
      passage: ['Community center directions','駅（えき）の東口（ひがしぐち）から出（で）てください。<br>二（ふた）つ目（め）の信号（しんごう）までまっすぐ行（い）き、右（みぎ）に曲（ま）がります。<br>橋（はし）を渡（わた）ってから、左（ひだり）の青（あお）い建物（たてもの）に入（はい）ってください。'],
      translation: 'Leave by the east exit. Go straight to the second traffic light and turn right. After crossing the bridge, enter the blue building on the left.',
      script: [['Visitor','すみません。西口（にしぐち）から出（で）ました。ここから行（い）けますか。','Excuse me. I came out of the west exit. Can I get there from here?'],['Staff','はい。駅（えき）に戻（もど）って、東口（ひがしぐち）から出（で）てください。','Yes. Go back to the station and leave from the east exit.']],
      checks: [question('Which exit does the written route use?',['East','West','North'],0,'東口 means east exit.','Reading'),question('Where do you turn right?',['At the first light','At the second light','Before the station'],1,'二つ目の信号で右に曲がります.','Reading'),question('What color is the destination building?',['Red','White','Blue'],2,'The note says 青い建物.','Reading'),question('What must the visitor do first after taking the wrong exit?',['Cross a bridge','Return to the station','Enter the bank'],1,'The staff says 駅に戻って.','Listening')],
      task: ['Give a friend two steps from the east exit to the bridge.','東口（ひがしぐち）から出（で）て、二（ふた）つ目（め）の信号（しんごう）で右（みぎ）に曲（ま）がってください。']
    },
    {
      id: 19, title: 'Hobbies and experience', goal: 'Talk about something you have tried and something you want to try.',
      scene: 'A local club invites you to join a weekend activity.',
      teach: 'The past plain form plus ことがあります describes an experience at least once. The て-form plus みたいです expresses wanting to try an action. Keep the meaning separate from simply wanting an object.',
      words: [['趣味（しゅみ）','hobby'],['経験（けいけん）','experience'],['参加（さんか）する','to join'],['登山（とざん）','mountain climbing'],['写真（しゃしん）','photo'],['初（はじ）めて','for the first time']],
      examples: [
        item('日本（にほん）で山（やま）に登（のぼ）ったことがあります。','I have climbed a mountain in Japan.','登った is the past plain form before ことがあります.'),
        item('まだ登（のぼ）ったことがありません。','I have not climbed one yet.','ありません makes the experience statement negative.'),
        item('陶芸（とうげい）をしてみたいです。','I would like to try pottery.','して is the て-form; みたい expresses a wish to try.'),
        item('写真（しゃしん）を撮（と）るのが好（す）きです。','I like taking photographs.','の turns the action into something that can be liked.'),
        item('週末（しゅうまつ）にクラブに参加（さんか）しませんか。','Would you like to join the club this weekend?','ませんか is a gentle invitation.'),
        item('初（はじ）めてですが、大丈夫（だいじょうぶ）ですか。','It is my first time; is that all right?','ですが gives context before asking.'),
        item('道具（どうぐ）を持（も）っていません。','I do not have any equipment.','持っていません describes the present state of not having it.'),
        item('道具（どうぐ）はクラブで借（か）りられます。','You can borrow equipment at the club.','借りられます expresses ability to borrow.'),
        item('一緒（いっしょ）に行（い）きましょう。','Let’s go together.','ましょう invites joint action.'),
        item('終（お）わったあとで、お茶（ちゃ）を飲（の）みます。','After it ends, we will have tea.','Past plain form plus あとで sets the next action.')
      ],
      passage: ['Weekend photo club','写真（しゃしん）クラブは毎月（まいつき）第二（だいに）土曜日（どようび）に集（あつ）まります。<br>初（はじ）めての人（ひと）も参加（さんか）できます。<br>カメラを持（も）っていない人（ひと）は、申（もう）し込（こ）むときに教（おし）えてください。'],
      translation: 'The photo club meets on the second Saturday of every month. First-time visitors may join. If you do not have a camera, tell the club when you apply.',
      script: [['A','写真（しゃしん）クラブに行（い）ったことがありますか。','Have you been to the photo club?'],['B','まだありません。でも、今度（こんど）行（い）ってみたいです。','Not yet. But I would like to try going next time.']],
      checks: [question('When does the photo club meet?',['Every Sunday','The second Saturday each month','Every weekday'],1,'毎月第二土曜日 gives the schedule.','Reading'),question('Can first-time visitors join?',['Yes','No','Only with a camera'],0,'初めての人も参加できます.','Reading'),question('When should you say that you lack a camera?',['After the meeting','When applying','A month later'],1,'The notice says 申し込むとき.','Reading'),question('Has B been to the club?',['Yes, often','Yes, once','Not yet'],2,'まだありません means not yet.','Listening')],
      task: ['Tell the club what you would like to try and whether you have done it before.','写真（しゃしん）を撮（と）ってみたいです。クラブに行（い）ったことはまだありません。']
    },
    {
      id: 20, title: 'Asking how to do something', goal: 'Ask a coworker for a demonstration and confirm the steps.',
      scene: 'A new machine has short instructions, but you need someone to show you how it works.',
      teach: 'The ます-stem plus 方 means “how to do”: 使い方 is how to use something. 〜てもらえますか asks someone to do a favor. 〜ていただけますか is more polite.',
      words: [['使（つか）い方（かた）','how to use'],['説明（せつめい）','explanation'],['押（お）す','to press'],['確認（かくにん）','to confirm'],['画面（がめん）','screen'],['印刷（いんさつ）','printing']],
      examples: [
        item('この機械（きかい）の使（つか）い方（かた）を教（おし）えてください。','Please teach me how to use this machine.','使います loses ます before 方; を marks what is taught.'),
        item('もう一度（いちど）見（み）せてもらえますか。','Could you show me once more?','て-form plus もらえますか asks for a favor.'),
        item('ゆっくり説明（せつめい）していただけますか。','Could you explain it slowly?','いただけますか is a more polite request.'),
        item('最初（さいしょ）に青（あお）いボタンを押（お）します。','First, press the blue button.','最初に introduces the first step.'),
        item('番号（ばんごう）を入（い）れてから、確認（かくにん）します。','After entering the number, check it.','てから orders the two actions.'),
        item('画面（がめん）に名前（なまえ）が出（で）ます。','A name appears on the screen.','に marks where the name appears.'),
        item('間違（まちが）えたら、戻（もど）るを押（お）してください。','If you make a mistake, press Back.','たら gives the condition for the instruction.'),
        item('印刷（いんさつ）する前（まえ）に確認（かくにん）します。','Check it before printing.','Dictionary form plus 前に means before the action.'),
        item('ここまでで合（あ）っていますか。','Am I correct up to this point?','ここまで asks about the steps completed so far.'),
        item('自分（じぶん）でやってみます。','I will try doing it myself.','てみます expresses making an attempt.')
      ],
      passage: ['Printer quick guide','一（いち）、画面（がめん）で名前（なまえ）を選（えら）びます。<br>二（に）、部数（ぶすう）を入（い）れます。<br>三（さん）、印刷（いんさつ）する前（まえ）に番号（ばんごう）を確認（かくにん）してください。<br>間違（まちが）えた場合（ばあい）は「戻（もど）る」を押（お）します。'],
      translation: 'Select your name on the screen. Enter the number of copies. Check the number before printing. If you make a mistake, press Back.',
      script: [['New coworker','部数（ぶすう）の入（い）れ方（かた）を見（み）せてもらえますか。','Could you show me how to enter the number of copies?'],['Coworker','はい。まず、ここを押（お）してください。','Sure. First, press here.']],
      checks: [question('What do you choose first?',['Your name','A paper size','The date'],0,'The first instruction says 名前を選びます.','Reading'),question('What must be checked before printing?',['The weather','The number','The address'],1,'印刷する前に番号を確認.','Reading'),question('What do you press after a mistake?',['Print','Start','Back'],2,'The guide says 「戻る」を押します.','Reading'),question('What does the new coworker request?',['A demonstration','A new machine','A day off'],0,'見せてもらえますか asks to be shown.','Listening')],
      task: ['Ask a coworker to show you how to print, then confirm the first step.','印刷（いんさつ）の仕方（しかた）を見（み）せてもらえますか。最初（さいしょ）にここを押（お）しますか。']
    },
    {
      id: 21, title: 'Joining a class', goal: 'Compare classes and ask about fees and registration.',
      scene: 'You want to join a weekend Japanese class but need to check its schedule.',
      teach: '〜たいです states your own wish. 〜つもりです describes a plan or intention. Use いつまでに for a deadline and いくら for a fee. Check whether a listed time is the start time or the registration deadline.',
      words: [['授業（じゅぎょう）','class'],['入会（にゅうかい）','joining a group'],['申（もう）し込（こ）む','to apply'],['授業料（じゅぎょうりょう）','tuition'],['締（し）め切（き）り','deadline'],['見学（けんがく）','observation visit']],
      examples: [
        item('日本語（にほんご）の授業（じゅぎょう）を受（う）けたいです。','I want to take a Japanese class.','受けます loses ます before たいです.'),
        item('来月（らいげつ）から通（かよ）うつもりです。','I plan to attend from next month.','Plain form plus つもりです expresses an intention.'),
        item('授業料（じゅぎょうりょう）は月（つき）にいくらですか。','How much is the tuition per month?','いくら asks the price; 月に makes it monthly.'),
        item('いつまでに申（もう）し込（こ）めばいいですか。','By when should I apply?','いつまでに asks for the deadline.'),
        item('土曜日（どようび）のクラスは空（あ）いていますか。','Are there places open in the Saturday class?','空いています asks about availability.'),
        item('見学（けんがく）してもいいですか。','May I observe a class?','てもいいですか asks permission.'),
        item('初級（しょきゅう）のクラスは午後（ごご）です。','The beginner class is in the afternoon.','は identifies which class is being described.'),
        item('申込書（もうしこみしょ）を出（だ）してください。','Please submit the application form.','を marks the form being submitted.'),
        item('授業（じゅぎょう）は毎週（まいしゅう）二回（にかい）あります。','There are classes twice each week.','二回 counts occurrences, not people.'),
        item('締（し）め切（き）りを過（す）ぎました。','The deadline has passed.','を marks the point in time that was passed.')
      ],
      passage: ['Japanese class schedule','初級（しょきゅう）A：火曜日（かようび）午後（ごご）六時（ろくじ）から。月（つき）四回（よんかい）。<br>初級（しょきゅう）B：土曜日（どようび）午前（ごぜん）十時（じゅうじ）から。月（つき）四回（よんかい）。<br>授業料（じゅぎょうりょう）：月（つき）三千円（さんぜんえん）。申（もう）し込（こ）みは来週（らいしゅう）の金曜日（きんようび）まで。'],
      translation: 'Beginner A meets Tuesdays at 6 p.m.; Beginner B meets Saturdays at 10 a.m. Each meets four times a month. Tuition is ¥3,000 monthly. Apply by next Friday.',
      script: [['Caller','土曜日（どようび）のクラスを見学（けんがく）したいです。','I would like to observe the Saturday class.'],['Staff','はい。来週（らいしゅう）は空（あ）いています。十時（じゅうじ）に来（き）てください。','Certainly. There is space next week. Please come at ten.']],
      checks: [question('When is Beginner B?',['Tuesday evening','Saturday morning','Friday afternoon'],1,'初級B is 土曜日午前十時.','Reading'),question('How much is tuition per month?',['¥300','¥3,000','¥30,000'],1,'月三千円 is ¥3,000 per month.','Reading'),question('What is the application deadline?',['Next Friday','Next Saturday','Tomorrow'],0,'来週の金曜日まで gives the deadline.','Reading'),question('When should the caller arrive to observe?',['At nine','At ten','At six'],1,'The staff says 十時に来てください.','Listening')],
      task: ['Ask about the tuition and say you plan to join next month.','授業料（じゅぎょうりょう）はいくらですか。来月（らいげつ）から通（かよ）うつもりです。']
    },
  ];

  for (const lesson of lessons) {
    // Six unseen checks supplement the four passage/dialogue questions in each chapter.
    const meanings = lesson.examples.slice(0, 6).map((example, index) => {
      const distractors = [lesson.examples[(index + 3) % 10][1], lesson.examples[(index + 6) % 10][1]];
      return question(`Which meaning matches 「${example[0]}」?`, [example[1], ...distractors], 0, example[2], 'Expression');
    });
    lesson.questions = [...lesson.checks, ...meanings];
    delete lesson.checks;
    course.lessons.push(lesson);
  }
})();
