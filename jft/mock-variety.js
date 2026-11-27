// Unseen original mock texts. These follow the official category types but do not reproduce sample questions.
(() => {
  const exams = window.ikigaiJft.exams;
  const q = (prompt, choices, answer, why) => ({ prompt, choices, answer, why, skill: 'Reading · unseen source' });
  const reading = id => exams.find(exam => exam.id === id).sections.find(section => section.title === 'Reading Comprehension').groups;
  reading('a')[2] = {
    text: '練習用の薬の案内（実際の薬の説明ではありません）<br/>A のど用：朝と夜に一つ。眠くなりません。<br/>B せき用：朝・昼・夜、食事のあとに一つ。飲んだあと、眠くなることがあります。<br/>C はな用：夜に一つ。車を運転する前には飲まないでください。<br/>わからないときは、薬局の人に聞いてください。',
    questions: [
      q('Which fictional medicine is taken after each of three meals?', ['A', 'B', 'C'], 1, 'B says 朝・昼・夜、食事のあとに一つ.'),
      q('Which fictional medicine says it does not make you sleepy?', ['A', 'B', 'C'], 0, 'A says 眠くなりません.'),
      q('What should someone do if the instructions are unclear?', ['Ask pharmacy staff', 'Take all three', 'Wait until the next day'], 0, 'The last line says 薬局の人に聞いてください.'),
    ],
  };
  reading('a')[3] = {
    text: '昨日、町の音楽会に行きました。午後二時に始まりましたが、私は三時に着きました。最初の歌は聞けませんでした。友達のスピーチを聞いてから、いっしょに写真を撮りました。雨が降っていたので、外の店には行きませんでした。来月の音楽会には早く行きたいです。',
    questions: [
      q('Which part did the writer miss?', ['The first song', 'The friend’s speech', 'The photographs'], 0, 'The writer arrived at three, so 最初の歌は聞けませんでした.'),
      q('What did the writer do after the speech?', ['Took photos with a friend', 'Went to an outdoor stall', 'Went home before the speech'], 0, 'スピーチを聞いてから、いっしょに写真を撮りました.'),
      q('Why did the writer skip the outdoor stalls?', ['It was raining', 'They were closed for a holiday', 'The writer had no money'], 0, '雨が降っていたので gives the reason.'),
    ],
  };
  reading('b')[1] = {
    text: '来週の仕事の予定<br/>月曜日：午前九時から午後五時まで、受付の仕事。<br/>火曜日：休み。<br/>水曜日：午前十時から午後六時まで、二階の会議室の準備。<br/>木曜日：午前九時から午後三時まで、受付の仕事。<br/>金曜日：午前九時から午後五時まで、書類の整理。<br/>水曜日は、始まる十五分前に事務所へ来てください。',
    questions: [
      q('Which weekday is a day off?', ['Tuesday', 'Wednesday', 'Thursday'], 0, '火曜日：休み means Tuesday is off.'),
      q('Where will the Wednesday task take place?', ['Second-floor meeting room', 'First-floor reception', 'At a train station'], 0, '水曜日 names 二階の会議室の準備.'),
      q('By what time should the worker arrive on Wednesday?', ['9:45 a.m.', '10:15 a.m.', '9:00 a.m.'], 0, 'The task starts at ten; 十五分前 means 9:45.'),
    ],
  };
  reading('b')[3] = {
    text: 'アパートの皆さんへ<br/>木曜日の午前十時から十一時まで、建物の水を止めます。台所とおふろの水が使えません。飲み水が必要な方は、前の日までに準備してください。工事の時間が変わるときは、一階の入口に新しいお知らせを出します。質問がある方は、管理人に電話してください。',
    questions: [
      q('When will the water be unavailable?', ['Thursday, 10–11 a.m.', 'Wednesday, 10–11 a.m.', 'Thursday, 10–11 p.m.'], 0, '木曜日の午前十時から十一時まで.'),
      q('What should residents prepare in advance if needed?', ['Drinking water', 'A new key', 'A train ticket'], 0, '飲み水が必要な方は、前の日までに準備してください.'),
      q('Where will a change to the work time be posted?', ['At the first-floor entrance', 'In the bathroom', 'At the train station'], 0, '一階の入口に新しいお知らせを出します.'),
    ],
  };
})();
