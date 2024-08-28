// ==UserScript==
// @name         Aggressive GPT
// @version      1
// @match        https://chatgpt.com/*
// @grant        GM_xmlhttpRequest
// @connect      discord.com
// ==/UserScript==

//指定開始時間　指定終了時間　起動回数　インスタンスのタイトル　メッセージ１　メッセージ２・・・
var orders = `

0:00 23:59 1 AAA こんちは こんち
2:48 2:49 1 BBB こんばわ　こんばん

`;
var url = localStorage.getItem('WebhookURL');
if (!url)
  if (url = prompt('DiscordのWebhook URLを入力する'))
    localStorage.setItem('WebhookURL', url);
setTimeout(function init(tomorrow) {
  var timers = {};
  var sleep = t => ({then: f => setTimeout(f, t)});
  var submit = async message => {
    var textarea = document.getElementById('prompt-textarea');
    textarea.value = message;
    textarea.dispatchEvent(new KeyboardEvent("input"));
    await sleep(3000);
    document.querySelector('[data-testid="send-button"]').click();
  };
  orders.replace(/^\s+|\s+$/g, '').split('\n').map(line => line.split(/[\s:]+/)).forEach(args => {
    if (args.length < 6) {
      console.log('指定方法が間違ってる');
      return;
    }
    var title = args[5];
    var instance = Array.from(document.querySelectorAll('[aria-label="チャット履歴"] a')).find(a => a.textContent.includes(title));
    if (!instance) {
      console.log('指定したタイトルのインスタンスがない：' + title);
      return;
    }
    var start = new Date();
    start.setHours(args[0]);
    start.setMinutes(parseInt(args[1], 10));
    start.setSeconds(0);
    var end = new Date();
    start.setHours(args[2]);
    start.setMinutes(parseInt(args[3], 10));
    start.setSeconds(0);
    var duration = end - start, times = +args[4], offset = start - new Date() + (tomorrow ? 24 * 60 * 60 * 1000 : 0);
    for (let i = 0; i < times; i++) {
      let message = args[6 + Math.floor(Math.random() * (args.length - 6))];
      let timeout = offset + Math.floor(Math.random() * duration);
      if (timeout <= 0)
        return;
      let id = setTimeout(async () => {
        instance.click();
        await sleep(3000);
        submit(message);
        if (url)
          GM_xmlhttpRequest({method: "POST", url, headers: {'Content-Type': 'application/json'}, data: JSON.stringify({username: title, content : '新しいメッセージ'})});
        delete timers[id];
        if (!Object.keys(timers).length)
          init(true);
      }, timeout);
      timers[id] = {timeout, title, message};
    };
  });
  console.log(Object.keys(timers).length ? timers : 'no task');
}, 3000);
