// Original Ikigai Quest practice. Each set has a new source and five questions.
// The listening variants combine details differently from the reading variants.
(() => {
  const p = (ja, en) => ({ ja, en });
  const topics = [
    {
      title: 'At the supermarket', kind: 'Store notice',
      prompts: ['Which day is the offer?', 'How much is one bread roll?', 'What is sold out?', 'When does the shop close?', 'How can you pay?'],
      rows: [
        [p('土曜日', 'Saturday'), p('百五十円', '¥150'), p('牛乳', 'Milk'), p('午後七時', '7 p.m.'), p('商品券', 'With a gift voucher')],
        [p('日曜日', 'Sunday'), p('百八十円', '¥180'), p('卵', 'Eggs'), p('午後六時', '6 p.m.'), p('現金', 'In cash')],
        [p('水曜日', 'Wednesday'), p('百二十円', '¥120'), p('ヨーグルト', 'Yogurt'), p('午後八時', '8 p.m.'), p('電子マネー', 'With electronic money')],
        [p('金曜日', 'Friday'), p('二百円', '¥200'), p('チーズ', 'Cheese'), p('午後九時', '9 p.m.'), p('クレジットカード', 'By credit card')],
      ],
      read: a => `駅前のスーパーからのお知らせです。${a[0]}はパンが一つ${a[1]}です。${a[2]}は今日、売り切れです。店は${a[3]}に閉まります。${a[4]}で払えます。`,
      hear: a => `いらっしゃいませ。${a[0]}のパンは一つ${a[1]}です。すみません、${a[2]}はもうありません。店は${a[3]}までです。${a[4]}でお支払いいただけます。`,
    },
    {
      title: 'The bus stop', kind: 'Transit update',
      prompts: ['Which day is this bus running?', 'Where is it going?', 'When does it leave?', 'Which bay should you use?', 'Why was the schedule changed?'],
      rows: [
        [p('月曜日', 'Monday'), p('市役所', 'City hall'), p('午前九時半', '9:30 a.m.'), p('二番乗り場', 'Bay 2'), p('道路の工事', 'Roadworks')],
        [p('火曜日', 'Tuesday'), p('病院', 'The hospital'), p('午前十時', '10 a.m.'), p('三番乗り場', 'Bay 3'), p('雪', 'Snow')],
        [p('木曜日', 'Thursday'), p('美術館', 'The museum'), p('午後一時', '1 p.m.'), p('一番乗り場', 'Bay 1'), p('雨', 'Rain')],
        [p('土曜日', 'Saturday'), p('空港', 'The airport'), p('午後二時半', '2:30 p.m.'), p('四番乗り場', 'Bay 4'), p('交通事故', 'A traffic accident')],
      ],
      read: a => `バスのお知らせ。${a[0]}の${a[1]}行きは、${a[4]}のため、時間が変わりました。${a[2]}に${a[3]}から出発します。乗る前に行き先を確認してください。`,
      hear: a => `お知らせします。${a[4]}のため、${a[0]}の${a[1]}行きのバスは、${a[2]}に出ます。乗り場は${a[3]}です。お間違えのないようにお願いします。`,
    },
    {
      title: 'A clinic appointment', kind: 'Appointment card',
      prompts: ['What day is the appointment?', 'What time is it?', 'Where should the patient go?', 'What should the patient bring?', 'By which day should they call to change it?'],
      rows: [
        [p('金曜日', 'Friday'), p('午前九時', '9 a.m.'), p('二階の受付', 'Second-floor reception'), p('保険証', 'Health insurance card'), p('木曜日', 'Thursday')],
        [p('火曜日', 'Tuesday'), p('午後二時', '2 p.m.'), p('一階の受付', 'First-floor reception'), p('診察券', 'Patient card'), p('月曜日', 'Monday')],
        [p('木曜日', 'Thursday'), p('午前十一時', '11 a.m.'), p('三階の受付', 'Third-floor reception'), p('予約の紙', 'Appointment slip'), p('水曜日', 'Wednesday')],
        [p('水曜日', 'Wednesday'), p('午後三時半', '3:30 p.m.'), p('別館の受付', 'Annex reception'), p('お薬手帳', 'Medication notebook'), p('火曜日', 'Tuesday')],
      ],
      read: a => `クリニックの予約カード。診察は${a[0]}の${a[1]}からです。${a[2]}に来て、${a[3]}を出してください。予約を変えたい場合は、${a[4]}までに電話してください。`,
      hear: a => `ご予約は${a[0]}の${a[1]}です。${a[2]}にお越しください。${a[3]}を忘れないでくださいね。変更するときは${a[4]}までにお電話ください。`,
    },
    {
      title: 'Tomorrow at work', kind: 'Shift message',
      prompts: ['Which day is the shift?', 'When should the worker arrive?', 'Where should they go?', 'What should they bring?', 'What will they do?'],
      rows: [
        [p('月曜日', 'Monday'), p('午前八時半', '8:30 a.m.'), p('一階の事務所', 'First-floor office'), p('名札', 'Name badge'), p('受付の仕事', 'Reception work')],
        [p('火曜日', 'Tuesday'), p('午前九時', '9 a.m.'), p('二階の会議室', 'Second-floor meeting room'), p('ノート', 'Notebook'), p('会議の準備', 'Meeting preparation')],
        [p('木曜日', 'Thursday'), p('午前十時', '10 a.m.'), p('倉庫', 'The storeroom'), p('手袋', 'Gloves'), p('荷物の整理', 'Sorting packages')],
        [p('金曜日', 'Friday'), p('午後一時', '1 p.m.'), p('店の入口', 'The shop entrance'), p('エプロン', 'Apron'), p('店の掃除', 'Cleaning the shop')],
      ],
      read: a => `仕事の連絡です。${a[0]}は${a[1]}に${a[2]}へ来てください。${a[3]}を持ってきてください。最初に${a[4]}をします。遅れるときは電話してください。`,
      hear: a => `明日の予定を確認します。${a[0]}は${a[1]}に${a[2]}へ来てください。${a[3]}も必要です。${a[4]}から始めます。`,
    },
    {
      title: 'A community class', kind: 'Class flyer',
      prompts: ['What day is the class?', 'When does it start?', 'Where is it held?', 'How much does it cost?', 'What should participants bring?'],
      rows: [
        [p('土曜日', 'Saturday'), p('午前十時', '10 a.m.'), p('市民センター', 'Community center'), p('五百円', '¥500'), p('ペン', 'A pen')],
        [p('日曜日', 'Sunday'), p('午後二時', '2 p.m.'), p('図書館', 'The library'), p('無料', 'Free'), p('ノート', 'A notebook')],
        [p('水曜日', 'Wednesday'), p('午後六時', '6 p.m.'), p('学校の体育館', 'The school gym'), p('三百円', '¥300'), p('室内用の靴', 'Indoor shoes')],
        [p('金曜日', 'Friday'), p('午後七時', '7 p.m.'), p('駅前の教室', 'The classroom by the station'), p('千円', '¥1,000'), p('写真', 'A photograph')],
      ],
      read: a => `地域のクラスに参加しませんか。${a[0]}の${a[1]}から、${a[2]}で行います。参加費は${a[3]}です。${a[4]}を持ってきてください。申し込みは受付まで。`,
      hear: a => `今週のクラスについてお知らせします。${a[0]}の${a[1]}に${a[2]}で始まります。参加費は${a[3]}です。${a[4]}をお持ちください。`,
    },
    {
      title: 'An apartment notice', kind: 'Building notice',
      prompts: ['Which day is the work?', 'When will it start?', 'What cannot be used?', 'What should residents use or do instead?', 'Where will updates be posted?'],
      rows: [
        [p('月曜日', 'Monday'), p('午前九時', '9 a.m.'), p('エレベーター', 'The elevator'), p('階段を使ってください', 'Use the stairs'), p('一階の入口', 'The first-floor entrance')],
        [p('火曜日', 'Tuesday'), p('午前十時', '10 a.m.'), p('水道', 'The water supply'), p('水を用意してください', 'Prepare water'), p('管理人室の前', 'Outside the manager’s office')],
        [p('木曜日', 'Thursday'), p('午後一時', '1 p.m.'), p('駐車場', 'The parking area'), p('近くの駐車場を使ってください', 'Use the nearby parking area'), p('建物の掲示板', 'The building noticeboard')],
        [p('金曜日', 'Friday'), p('午後二時', '2 p.m.'), p('インターネット', 'The internet'), p('時間をおいて使ってください', 'Try again later'), p('エレベーターの横', 'Beside the elevator')],
      ],
      read: a => `住んでいる皆さんへ。${a[0]}の${a[1]}から点検をします。その間、${a[2]}が使えません。${a[3]}。時間が変わる場合は、${a[4]}にお知らせを出します。`,
      hear: a => `建物の点検のお知らせです。${a[0]}の${a[1]}から${a[2]}が使えません。すみませんが、${a[3]}。変更があれば${a[4]}にお知らせを出します。`,
    },
    {
      title: 'A restaurant booking', kind: 'Reservation message',
      prompts: ['Which day is the reservation?', 'What time is it?', 'How many people are coming?', 'Where will they sit?', 'What did they request?'],
      rows: [
        [p('金曜日', 'Friday'), p('午後六時', '6 p.m.'), p('二人', 'Two people'), p('窓の近く', 'By the window'), p('子ども用のいす', 'A child’s chair')],
        [p('土曜日', 'Saturday'), p('午後七時', '7 p.m.'), p('四人', 'Four people'), p('奥のテーブル', 'A table in the back'), p('野菜の料理', 'A vegetable dish')],
        [p('日曜日', 'Sunday'), p('午後五時半', '5:30 p.m.'), p('三人', 'Three people'), p('入口の近く', 'Near the entrance'), p('水', 'Water')],
        [p('水曜日', 'Wednesday'), p('午後八時', '8 p.m.'), p('五人', 'Five people'), p('二階', 'On the second floor'), p('魚の料理', 'A fish dish')],
      ],
      read: a => `レストランの予約を確認します。${a[0]}の${a[1]}から${a[2]}です。お席は${a[3]}です。ご希望の${a[4]}も承りました。変更するときはお電話ください。`,
      hear: a => `ご予約ありがとうございます。${a[0]}の${a[1]}、${a[2]}ですね。お席は${a[3]}です。${a[4]}もご希望ですね。`,
    },
    {
      title: 'A parcel delivery', kind: 'Delivery slip',
      prompts: ['Which day is the delivery?', 'When will the parcel arrive?', 'Where can it be collected?', 'What must the recipient bring?', 'By which day should they collect it?'],
      rows: [
        [p('月曜日', 'Monday'), p('午前十時', '10 a.m.'), p('駅前の店', 'The shop by the station'), p('身分証明書', 'An ID card'), p('金曜日', 'Friday')],
        [p('火曜日', 'Tuesday'), p('午後二時', '2 p.m.'), p('郵便局', 'The post office'), p('不在票', 'The missed-delivery slip'), p('土曜日', 'Saturday')],
        [p('木曜日', 'Thursday'), p('午後四時', '4 p.m.'), p('アパートの受付', 'Apartment reception'), p('部屋の鍵', 'The room key'), p('日曜日', 'Sunday')],
        [p('金曜日', 'Friday'), p('午後六時', '6 p.m.'), p('コンビニ', 'The convenience store'), p('受け取り番号', 'The collection number'), p('月曜日', 'Monday')],
      ],
      read: a => `荷物のお知らせです。${a[0]}の${a[1]}に届きます。受け取りは${a[2]}です。${a[3]}を持ってきてください。${a[4]}までに受け取ってください。`,
      hear: a => `お荷物についてご連絡します。${a[0]}の${a[1]}に届きます。${a[2]}で受け取れます。${a[3]}が必要です。${a[4]}までにお願いします。`,
    },
    {
      title: 'A local event', kind: 'Event announcement',
      prompts: ['Which day is the event?', 'What time does it begin?', 'Where will people meet?', 'Where will it move if it rains?', 'What should participants bring?'],
      rows: [
        [p('土曜日', 'Saturday'), p('午前九時', '9 a.m.'), p('公園の入口', 'The park entrance'), p('市民センター', 'Community center'), p('水', 'Water')],
        [p('日曜日', 'Sunday'), p('午前十時', '10 a.m.'), p('駅の東口', 'The station’s east exit'), p('図書館', 'The library'), p('カメラ', 'A camera')],
        [p('水曜日', 'Wednesday'), p('午後一時', '1 p.m.'), p('学校の門', 'The school gate'), p('体育館', 'The gym'), p('タオル', 'A towel')],
        [p('金曜日', 'Friday'), p('午後三時', '3 p.m.'), p('川の橋', 'The bridge over the river'), p('町のホール', 'The town hall'), p('ノート', 'A notebook')],
      ],
      read: a => `町のイベントのお知らせ。${a[0]}の${a[1]}に${a[2]}で集まります。雨の場合は${a[3]}で行います。${a[4]}を持ってきてください。参加したい人は受付に連絡してください。`,
      hear: a => `イベントは${a[0]}の${a[1]}からです。${a[2]}に集まってください。雨が降ったら${a[3]}に変わります。${a[4]}を忘れないでください。`,
    },
    {
      title: 'At the library', kind: 'Library information',
      prompts: ['Which day is the activity?', 'When does it begin?', 'Which room is it in?', 'What should visitors bring?', 'By when must they register?'],
      rows: [
        [p('月曜日', 'Monday'), p('午前十時', '10 a.m.'), p('一階の部屋', 'A first-floor room'), p('図書館のカード', 'A library card'), p('金曜日', 'Friday')],
        [p('火曜日', 'Tuesday'), p('午後二時', '2 p.m.'), p('二階の会議室', 'The second-floor meeting room'), p('ノート', 'A notebook'), p('月曜日', 'Monday')],
        [p('木曜日', 'Thursday'), p('午後四時', '4 p.m.'), p('三階の教室', 'A third-floor classroom'), p('ペン', 'A pen'), p('水曜日', 'Wednesday')],
        [p('土曜日', 'Saturday'), p('午前十一時', '11 a.m.'), p('別館の部屋', 'A room in the annex'), p('本', 'A book'), p('金曜日の午後五時', 'Friday at 5 p.m.')],
      ],
      read: a => `図書館の活動に参加しませんか。${a[0]}の${a[1]}から、${a[2]}で行います。${a[3]}を持ってきてください。申し込みは${a[4]}までです。人数が多いときは早めに締め切ります。`,
      hear: a => `図書館からお知らせです。活動は${a[0]}の${a[1]}に${a[2]}で始まります。${a[3]}が必要です。${a[4]}までにお申し込みください。`,
    },
  ];

  const mix = (rows, index, topicIndex) => {
    const next = rows[(index + 1) % 4];
    const later = rows[(index + 3) % 4];
    const result = [next[0], rows[(index + 2) % 4][1], later[2], rows[index][3], next[4]];
    if (topicIndex === 3 || topicIndex === 4 || topicIndex === 7) {
      result[3] = later[3]; // Equipment or document must fit the location.
      if (topicIndex !== 7) result[4] = later[4]; // Keep a delivery deadline after its day.
    }
    if (topicIndex === 5) result[3] = later[3]; // Building alternative must fit the outage.
    return result;
  };
  const sets = { reading: [], listening: [] };
  topics.forEach((topic, topicIndex) => {
    for (let index = 0; index < 4; index++) {
      for (const mode of ['reading', 'listening']) {
        const row = mode === 'reading' ? topic.rows[index] : mix(topic.rows, index, topicIndex);
        const questions = topic.prompts.map((prompt, factIndex) => ({
          prompt,
          choices: topic.rows.map(record => record[factIndex].en),
          answer: topic.rows.findIndex(record => record[factIndex].en === row[factIndex].en),
          explanation: `The ${mode === 'reading' ? 'text' : 'recording'} says ${row[factIndex].ja}, meaning ${row[factIndex].en}.`,
        }));
        sets[mode].push({
          id: `${mode[0]}${String(topicIndex * 4 + index + 1).padStart(2, '0')}`,
          title: topic.title,
          kind: topic.kind,
          source: mode === 'reading' ? topic.read(row.map(fact => fact.ja)) : topic.hear(row.map(fact => fact.ja)),
          questions,
        });
      }
    }
  });
  window.ikigaiJftPracticeBank = sets;
})();
