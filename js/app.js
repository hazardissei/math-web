/* 数学版 Memora X：画面の型（中身は仮）。
   画面は stack に積む（戻ると1つ前）。シートとメニューは #layer に出す。
   ?frame=1 … 画像づくり用（時刻の帯・ホームの線を描き、タイマーは止める）／?r=名前 … DEMO のその画面から始める */
(function () {
  'use strict';
  var D = window.MXDATA, R = String.raw, Q = new URLSearchParams(location.search), FRAME = Q.get('frame') === '1';
  if (FRAME) document.documentElement.classList.add('frame');
  var app = document.getElementById('app'), layer = document.getElementById('layer');

  /* ---------- 部品 ---------- */
  var P = {
    set: '<path d="M4 7.5h9M17 7.5h3M4 16.5h3M11 16.5h9"/><circle cx="15" cy="7.5" r="2"/><circle cx="9" cy="16.5" r="2"/>',
    play: '<path d="M8.5 5.8v12.4L18.6 12z" fill="currentColor" stroke="none"/>',
    arr: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    cr: '<path d="M9.5 6l6 6-6 6"/>', cl: '<path d="M14.5 6l-6 6 6 6"/>', cd: '<path d="M6 9.5l6 6 6-6"/>', cu: '<path d="M6 14.5l6-6 6 6"/>',
    x: '<path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/>', ck: '<path d="M5 12.5l4.5 4.5L19 7.5"/>', pause: '<path d="M9 6.5v11M15 6.5v11"/>',
    home: '<path d="M4 10.2 12 4l8 6.2V19a1 1 0 0 1-1 1h-4.5v-5.5h-5V20H5a1 1 0 0 1-1-1z"/>',
    rev: '<path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3"/><path d="M4.5 4.5v3.8h3.8"/>',
    rec: '<rect x="4" y="5" width="16" height="15" rx="3"/><path d="M4 10h16M9 3v4M15 3v4"/>',
    cam: '<path d="M4 8.5A2.5 2.5 0 0 1 6.5 6H8l1.5-2h5L16 6h1.5A2.5 2.5 0 0 1 20 8.5v8a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 16.5z"/><circle cx="12" cy="12.5" r="3.5"/>',
    chat: '<path d="M5 6.5A2.5 2.5 0 0 1 7.5 4h9A2.5 2.5 0 0 1 19 6.5v7a2.5 2.5 0 0 1-2.5 2.5H11l-4 3.5V16a2 2 0 0 1-2-2z"/>',
    hd: '<path d="M5 8h14M5 12h14M5 16h14"/>'
  };
  function ic(n) { return '<svg class="i" viewBox="0 0 24 24" aria-hidden="true">' + (P[n] || '') + '</svg>'; }
  function act(a, v) { return ' data-act="' + a + '"' + (v !== undefined ? ' data-v="' + v + '"' : '') + ' tabindex="0" role="button"'; }
  function lv(v) { var s = '<span class="lv">'; for (var i = 1; i <= 8; i++) s += '<i' + (i <= v ? ' class="f"' : '') + '></i>'; return s + '</span>'; }
  function av(a) { var s = '<span class="av" aria-hidden="true">'; for (var i = 1; i <= 8; i++) s += '<i' + (a.indexOf(i) >= 0 ? '' : ' class="n"') + '></i>'; return s + '</span>'; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function pad(n) { return ('0' + n).slice(-2); }
  function mmss(t) { return pad(Math.floor(t / 60)) + ':' + pad(t % 60); }
  function paras(t) { return t.map(function (p) { return '<p' + (/^\(/.test(p) ? ' class="sq"' : '') + '>' + esc(p).replace(/^(\([^)]*\))　/, '<span class="sqn">$1</span>') + '</p>'; }).join(''); }
  function flat(t) { return esc(t.join(' ')); }
  function pct(s) { return s.total ? Math.round(s.ok / s.total * 100) : 0; }
  function math(el) {
    if (!window.renderMathInElement) return;
    try { renderMathInElement(el, { delimiters: [{ left: '$$', right: '$$', display: true }, { left: '$', right: '$', display: false }], throwOnError: false }); } catch (e) {}
  }
  function nv() { return '<div class="nv" data-k="戻る"><div class="rb"' + act('back') + ' aria-label="戻る">' + ic('cl') + '</div></div>'; }
  function tab(on) {
    return '<nav class="tab">' + [['home', 'ホーム'], ['rev', '復習'], ['rec', '記録']].map(function (a) {
      return '<a class="' + (a[0] === on ? 'on' : '') + '"' + act('tab', a[0]) + '>' + ic(a[0]) + a[1] + '</a>';
    }).join('') + '</nav>';
  }
  function chip(q) { return q.st === 'ok' ? '<span class="st ok">' + ic('ck') + '正解</span>' : q.st === 'ng' ? '<span class="st ng">まちがい</span>' : '<span class="st no">まだ</span>'; }
  function dot(q) { return q.st === 'ok' ? '<span class="dot ok">' + ic('ck') + '</span>' : '<span class="dot ' + q.st + '"></span>'; }
  /* 問題のカード：小問の前で改行した問題文を、はじめの行だけ見せる。続きがあれば「全文」を出す（行を測るのは app.js の終わり） */
  var qOpen = {};
  function moreLabel(open) { return open ? '閉じる' + ic('cu') : '全文' + ic('cd'); }
  function card(q, head, c2) {
    var open = qOpen[q.id];
    return '<div class="cd qb" data-id="' + q.id + '"' + act('prob') + '><div class="q-h"><span class="lb">' + head + '</span><span class="q-more"' + act('qmore') + ' hidden>' + moreLabel(open) + '</span></div>' +
      '<div class="q-t' + (c2 ? ' c2' : '') + (open ? ' open' : '') + '">' + paras(q.t) + '</div>' +
      '<div class="ft">' + chip(q) + '<span class="tmr">' + (q.st === 'no' ? '目安 ' + q.aim + '分' : q.time) + '</span></div></div>';
  }
  function strip(lvs, on) {
    var s = '';
    for (var i = 1; i <= 8; i++) s += lvs.indexOf(i) >= 0 ? '<span class="' + (i === on ? 'on' : '') + '"' + act('lv', i) + ' aria-label="レベル' + i + '">' + i + '</span>' : '<span class="no">' + i + '<small>なし</small></span>';
    return s;
  }
  var NOTE = function (w) { return '<div class="note">この問題の' + w + 'は、まだ入っていません（型を見るための仮の問題です）。</div>'; };

  /* ---------- 画面の積み重ね ---------- */
  var stack = [], shown = null, lastSi = 0, onClose = null, ai = null;
  function cur() { return stack[stack.length - 1]; }
  function show(restore) {
    closeLayer(true);
    var e = cur(), s = S[e.n](e.p, e);
    shown = e;
    document.body.className = s.body || '';
    statusBar(s.body === 'dark');
    app.innerHTML = '<div class="v">' + s.html + '</div>';
    math(app);
    if (window.MXFIT) window.MXFIT();
    if (s.after) s.after(e);
    window.scrollTo(0, restore ? (e.y || 0) : 0);
  }
  /* iPhone の時刻の帯の字の色（撮る画面だけ白い字） */
  function statusBar(dark) {
    var sb = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.StatusBar;
    if (!sb) return;
    try { var r = sb.setStyle({ style: dark ? 'DARK' : 'LIGHT' }); if (r && r.catch) r.catch(function () {}); } catch (e) {}
  }
  function go(n, p) { if (cur() && cur() === shown) cur().y = window.scrollY; stack.push({ n: n, p: p || {} }); show(); }
  function back() { if (stack.length > 1) { stack.pop(); show(true); } }
  function replace(n, p) { stack[stack.length - 1] = { n: n, p: p || {} }; show(); }
  function popTo(i) { stack.length = i + 1; show(true); }
  function rerender() { cur().y = window.scrollY; show(true); }
  function ctxOf(el) { var m = el.closest('main'); return m ? [].map.call(m.querySelectorAll('[data-id]'), function (x) { return x.dataset.id; }) : [el.dataset.id]; }

  /* シート・メニュー（下から出す） */
  function openLayer(html, o) {
    o = o || {};
    layer.innerHTML = (o.scrim === false ? '' : '<div class="scrim' + (o.instant ? '' : ' off') + '" data-close="1"></div>') + html;
    onClose = o.close || null;
    var sh = layer.querySelector('.sheet'), sc = layer.querySelector('.scrim');
    if (sh && !o.instant && !FRAME) {
      sh.classList.add('off');
      requestAnimationFrame(function () { requestAnimationFrame(function () { sh.classList.remove('off'); if (sc) sc.classList.remove('off'); }); });
    } else if (sc) sc.classList.remove('off');
    math(layer);
  }
  function closeLayer(silent) {
    if (!layer.innerHTML) return;
    var f = onClose; onClose = null; layer.innerHTML = '';
    if (!silent && f) f();
  }
  var tt;
  function toast(s) {
    var t = document.querySelector('.toast');
    if (!t) { t = document.createElement('div'); t.className = 'toast off'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
    t.textContent = s;
    requestAnimationFrame(function () { t.classList.remove('off'); });
    clearTimeout(tt); tt = setTimeout(function () { t.classList.add('off'); }, 1800);
  }

  /* ---------- 画面 ---------- */
  var S = {};

  /* ①ホーム */
  S.home = function () {
    return { html: '<main class="scr s-home">' +
      '<div class="hd" data-k="見出し"><div><div class="br">Memora X · 中身は仮の見本</div><h1>数学</h1></div><div class="rb"' + act('settings') + ' aria-label="設定">' + ic('set') + '</div></div>' +
      '<div class="cd rs3" data-k="つづきから"' + act('cont') + '><div class="rb k s">' + ic('play') + '</div><div class="m"><span class="lb">つづきから</span><span class="t3b">2次関数の最大・最小</span></div><span class="mt">Ⅰ · Lv3</span></div>' +
      '<div class="full">' +
      '<div class="cd dr" data-k="単元別演習"' + act('units') + '><div><div class="t1">単元別演習</div><div class="mt">数学Ⅰ〜C を単元ごとに、レベル1〜8で</div></div><div class="ft"><span class="hint">Ⅰ A Ⅱ B Ⅲ C</span><div class="rb k">' + ic('arr') + '</div></div></div>' +
      '<div class="cd dr" data-k="入試演習"' + act('exam') + '><div><div class="t1">入試演習</div><div class="mt">大学の過去問を、大学ごと・レベルごとに</div></div><div class="ft"><span class="hint">文系 · 理系</span><div class="rb k">' + ic('arr') + '</div></div></div>' +
      '</div></main>' + tab('home') };
  };

  /* ②単元：科目を切りかえて、大単元のカード */
  S.units = function (p) {
    var sj = D.subjects[p.si];
    return { html: '<main class="scr nb s-units">' + nv() +
      '<div class="ttl" data-k="題"><div class="lb">単元別演習</div><h1>' + sj.name + '</h1></div>' +
      '<div class="seg" data-k="科目">' + D.subjects.map(function (s, i) { return '<span class="' + (i === p.si ? 'on' : '') + '"' + act('subj', i) + ' aria-label="' + s.name + '">' + s.short + '</span>'; }).join('') + '</div>' +
      '<div class="stack" data-k="大単元">' + sj.units.map(function (u, bi) {
        var s = D.sum(D.bigAll(p.si, bi));
        return '<div class="cd u2"' + act('big', bi) + '><div class="top"><span class="ix">' + pad(bi + 1) + '</span><span class="t2">' + u.name + '</span>' + ic('cr') + '</div>' +
          '<div class="names">' + u.smalls.map(function (x) { return x.name; }).join(' · ') + '</div>' +
          '<div class="ft"><div class="bar"><i style="width:' + pct(s) + '%"></i></div><span class="mt"><span class="num">' + s.total + '</span>問</span></div></div>';
      }).join('') + '</div></main>' };
  };

  /* 小単元の行（あるレベルを8つの四角で） */
  S.small = function (p) {
    var sj = D.subjects[p.si], u = sj.units[p.bi];
    return { html: '<main class="scr nb s-small">' + nv() +
      '<div class="ttl" data-k="題"><div class="lb">' + sj.name + '</div><h1>' + u.name + '</h1></div>' +
      '<div class="cd rows" data-k="小単元">' + u.smalls.map(function (sm, ki) {
        var s = D.sum(D.smallAll(p.si, p.bi, ki));
        return '<div class="pr"' + act('small', ki) + '><div class="nm"><div class="t3b">' + sm.name + '</div><div class="mt">' + s.total + '問' + (s.ok ? ' · ' + s.ok + '問 正解' : '') + '</div></div>' + av(D.smallLevels(p.si, p.bi, ki)) + ic('cr') + '</div>';
      }).join('') + '</div>' +
      '<div class="lg" data-k="凡例"><span><span class="av"><i></i></span>問題あり</span><span><span class="av"><i class="n"></i></span>なし</span><span>左からレベル1〜8</span></div></main>' };
  };

  /* ③問題の一覧：上にレベルの帯 */
  S.list = function (p) {
    var sj = D.subjects[p.si], u = sj.units[p.bi], sm = u.smalls[p.ki], lvs = D.smallLevels(p.si, p.bi, p.ki);
    if (lvs.indexOf(p.lv) < 0) p.lv = lvs[0];
    var ids = D.unitIds(p.si, p.bi, p.ki, p.lv), s = D.sum(ids);
    return { html: '<main class="scr nb s-list">' + nv() +
      '<div class="ttl" data-k="題"><div class="lb">' + sj.name + ' · ' + u.name + '</div><h1>' + sm.name + '</h1></div>' +
      '<div class="lvw" data-k="レベル"><div class="strip">' + strip(lvs, p.lv) + '</div></div>' +
      '<div class="cap mt" data-k="件数"><span><b>レベル' + p.lv + '</b> · <span class="num">' + ids.length + '</span>問</span><span><span class="num">' + s.ok + '</span>問 正解</span></div>' +
      '<div class="stack" data-k="問題">' + ids.map(function (id, i) { return card(D.prob(id), '問' + (i + 1), false); }).join('') + '</div></main>' };
  };

  /* ④問題を解く：上の帯（×・タイマー・レベル）と「解いた」 */
  function pill(tm) {
    return '<div class="tp' + (tm.run || tm.done ? '' : ' stop') + '" data-k="タイマー"' + act('timer') + ' aria-label="タイマー">' + ic(tm.done ? 'ck' : tm.run ? 'pause' : 'play') + '<span class="tv">' + mmss(tm.t) + '</span></div>';
  }
  function updPill(e) { var el = app.querySelector('.tp'); if (el) el.outerHTML = pill(e.tm); }
  S.prob = function (p, e) {
    var q = D.prob(p.id), tm = e.tm || (e.tm = { t: 0, run: true, done: false });
    return { body: 'paper', html:
      '<div class="tb" data-k="上"><div class="rb"' + act('back') + ' aria-label="閉じる">' + ic('x') + '</div>' + pill(tm) + '<div class="lvc" data-k="難しさ">' + lv(q.lv) + 'レベル' + q.lv + '</div></div>' +
      '<main class="scr pp s-prob"><div class="src" data-k="出典"><span>' + q.src[0] + '</span><span>' + q.src[1] + '</span></div><div class="ptx" data-k="問題文">' + paras(q.t) + '</div></main>' +
      '<div class="fixb cta" data-k="解いた"' + act('solved') + '>解いた</div>',
      after: function () { if (e.sheet) solvedSheet(e, true); } };
  };
  setInterval(function () {
    var e = cur();
    if (FRAME || !e || e.n !== 'prob' || !e.tm || !e.tm.run || e.tm.done || document.hidden) return;
    e.tm.t++; var v = app.querySelector('.tp .tv'); if (v) v.textContent = mmss(e.tm.t);
  }, 1000);

  /* ⑥解いたあと：下から出るシート（方針／解答・写真で採点） */
  function solvedSheet(e, instant) {
    var q = D.prob(e.p.id);
    openLayer('<div class="sheet" data-k="シート" data-layer="over"><div class="grab"></div>' +
      '<div class="sh-t"><div class="n">' + mmss(e.tm.t) + '</div><div class="mt">解き終わりました · 目安 ' + q.aim + '分</div></div>' +
      '<div class="ch2"><div class="cb"' + act('hoshin') + '><div><div class="t2">方針を見る</div><div class="mt">まず考え方だけ見て、もう一度解く</div></div>' + ic('cr') + '</div>' +
      '<div class="cb k"' + act('kai') + '><div><div class="t2">解答を見る</div><div class="mt">答えと解き方を見る</div></div>' + ic('cr') + '</div></div>' +
      '<div class="lnk"' + act('cam') + '>' + ic('cam') + '紙の答えを写真で採点する</div></div>',
      { instant: instant, close: function () { e.sheet = false; e.tm.done = false; e.tm.run = true; updPill(e); } });
  }

  /* ⑦方針：上に問題、下に方針 */
  S.hoshin = function (p) {
    var q = D.prob(p.id);
    return { html: '<main class="scr s-hoshin">' +
      '<div class="hdr2" data-k="上"><div class="rb"' + act('back') + ' aria-label="戻る">' + ic('cl') + '</div><span class="lvc">' + lv(q.lv) + 'レベル' + q.lv + '</span></div>' +
      '<div class="src2" data-k="出典">' + q.src[0] + ' ' + q.src[1] + '</div><div class="ptx sm" data-k="問題文">' + paras(q.t) + '</div></main>' +
      '<div class="split" data-k="方針" data-layer="over"><div class="grab"></div><h2 class="h2">方針</h2>' +
      (q.hs ? '<ol class="hs">' + q.hs.map(function (x, i) { return '<li><span class="n">' + (i + 1) + '</span><p>' + x + '</p></li>'; }).join('') + '</ol>' : '<div class="hs">' + NOTE('方針') + '</div>') +
      '<div class="btn2"><div class="cta w"' + act('again') + '>もう一度解く</div><div class="cta"' + act('kai') + '>解説を見る</div></div></div>' };
  };

  /* ⑧解説：上に問題の一部・単元・右下にAI・下に写真で採点と次の問題 */
  S.kai = function (p, e) {
    var q = D.prob(p.id);
    return { body: 'paper', html: '<main class="scr s-kai">' +
      '<div class="hdr2" data-k="上"><div class="rb"' + act('back') + ' aria-label="戻る">' + ic('cl') + '</div><span class="lvc">' + lv(q.lv) + 'レベル' + q.lv + '</span></div>' +
      '<div class="peek" data-k="問題"><div class="pc' + (e.open ? ' open' : '') + '"' + act('peek') + '><div class="ph"><span>' + q.short + '</span><span>' + (e.open ? '閉じる' + ic('cu') : '全文' + ic('cd')) + '</span></div>' +
      '<div class="pt">' + (e.open ? paras(q.t) : flat(q.t)) + '</div></div></div>' +
      '<div class="unit" data-k="単元">' + q.units.map(function (u) { return '<span>' + u + '</span>'; }).join('') + '</div>' +
      '<h2 class="h2" data-k="題">解説</h2><div class="exb" data-k="解説">' + (q.ex || NOTE('解説')) + '</div></main>' +
      '<div class="fab dock" data-k="AI"' + act('ai') + '>' + ic('chat') + 'AIに聞く</div>' +
      '<div class="bb dock" data-k="下"><div class="btn2"><div class="cta w"' + act('cam') + '>写真で採点</div><div class="cta"' + act('next') + '>次の問題</div></div></div>' };
  };

  /* ⑩AIに聞く：よくある質問（D）→ 選ぶか書くと、下から出るチャット（A） */
  var SUG = ['この式の変形がわからない', '図で見たい', 'どうしてこの考え方になるの？', '別の解き方はある？'];
  var SUG1 = ['この式の変形がわからない', '図で見たい', R`なぜ $0\le x\le a$ で考えるの？`, '別の解き方はある？'];
  var ANS1 = [
    function () { return R`$x^2-(2ax-a^2)$ のかっこを外すと $x^2-2ax+a^2$。これは $(x-a)^2$ を展開した形と同じなので、まとめて $(x-a)^2$ と書けます。`; },
    function () { return R`$a=1$ のときの図です。曲線 $C$ はいつも接線 $\ell$ より上にあり、色のついた部分が $S(a)$ です。` + fig(); },
    function () { return R`囲まれた部分は、$y$ 軸（$x=0$）から接点 P（$x=a$）までです。この間で、上の曲線 $C$ から下の接線 $\ell$ を引いて積分します。`; },
    function () { return R`$\displaystyle\int_0^a x^2\,dx$ から $\displaystyle\int_0^a (2ax-a^2)\,dx$ を引く方法もあります。後ろは $a^3-a^3=0$ なので、すぐに $S(a)=\dfrac{a^3}{3}$ が出ます。`; }
  ];
  function fig() {
    // a=1 のとき：C は y=x²、ℓ は y=2x−1。0≤x≤1 で C と ℓ のあいだが S
    var X = function (x) { return (40 + x * 110).toFixed(1); }, Y = function (y) { return (112 - y * 50).toFixed(1); }, c = '', a = '', i, x;
    for (i = 0; i <= 35; i++) { x = -0.3 + i * 0.05; c += (i ? 'L' : 'M') + X(x) + ' ' + Y(x * x); }
    for (i = 0; i <= 20; i++) { x = i / 20; a += (i ? 'L' : 'M') + X(x) + ' ' + Y(x * x); }
    a += 'L' + X(0) + ' ' + Y(-1) + 'Z';
    return '<svg class="fig" viewBox="0 0 240 180" role="img" aria-label="放物線 C と接線 ℓ と面積 S の図">' +
      '<path d="' + a + '" fill="rgba(29,29,31,.13)"/>' +
      '<path d="M8 ' + Y(0) + 'H232M' + X(0) + ' 174V6" stroke="#b4b4b9" stroke-width="1" fill="none"/>' +
      '<path d="' + c + '" stroke="#1d1d1f" stroke-width="2" fill="none"/>' +
      '<path d="M' + X(-0.1) + ' ' + Y(-1.2) + 'L' + X(1.6) + ' ' + Y(2.2) + '" stroke="#1d1d1f" stroke-width="1.5" stroke-dasharray="5 4" fill="none"/>' +
      '<circle cx="' + X(1) + '" cy="' + Y(1) + '" r="3.5" fill="#1d1d1f"/><circle cx="' + X(0.5) + '" cy="' + Y(0) + '" r="3.5" fill="#1d1d1f"/>' +
      '<g font-family="Inter,sans-serif" font-size="12" font-weight="700" fill="#1d1d1f">' +
      '<text x="158" y="66">P</text><text x="90" y="129">Q</text><text x="26" y="127">O</text><text x="194" y="22">C</text>' +
      '<text x="212" y="32" font-style="italic">ℓ</text><text x="66" y="125" font-size="11">S</text></g></svg>';
  }
  function sugs() { return ai.q.ai ? SUG1 : SUG; }
  function answer(i) {
    if (!ai.q.ai) return 'いまは型だけなので、AIの答えはまだ出ません。問題と解説が入ると、ここに答えが出ます。';
    return ANS1[i] ? ANS1[i]() : 'いまは見本の答えだけです。ここに、聞いたことへの答えが出ます。';
  }
  function msg(m) {
    return m.u ? '<div class="bu">' + esc(m.u) + '</div>' :
      '<div class="ai-l">AI</div><div class="ba' + (m.typing ? ' typing' : '') + '">' + (m.typing ? '<span></span><span></span><span></span>' : m.a) + '</div>';
  }
  function aiSheet() {
    var chat = ai.msgs.length > 0;
    var inner = '<div class="grab"></div><div class="shh"><span class="t1s">AIに聞く</span><span class="rb s"' + act('aiclose') + ' aria-label="閉じる">' + ic('x') + '</span></div>' +
      '<span class="qchip">' + ic('chat') + esc(ai.chip) + '</span>' +
      (chat ? '<div class="msgs">' + ai.msgs.map(msg).join('') + '</div>' :
        '<div class="sg-l">よくある質問</div><div class="sgs">' + sugs().map(function (s, i) { return '<span' + act('aiq', i) + '>' + ic('chat') + esc(s) + '</span>'; }).join('') + '</div>') +
      '<form class="inp" id="aif"><input id="aiin" type="text" enterkeyhint="send" autocomplete="off" placeholder="' + (chat ? '続けて聞く…' : '自分で書いて聞く…') + '" aria-label="AIに聞く">' +
      '<button class="rb k" type="submit" aria-label="送る">' + ic('arr') + '</button></form>';
    var sh = layer.querySelector('.sheet');
    if (sh) { sh.className = 'sheet' + (chat ? ' tall' : ''); sh.innerHTML = inner; math(sh); }
    else openLayer('<div class="sheet' + (chat ? ' tall' : '') + '" data-k="AI" data-layer="over">' + inner + '</div>', { close: function () { ai = null; } });
    var m = layer.querySelector('.msgs'); if (m) m.scrollTop = m.scrollHeight;
  }
  function ask(text, i) {
    if (!ai || !text) return;
    ai.msgs.push({ u: text }, { typing: true }); aiSheet();
    var me = ai;
    setTimeout(function () { if (ai !== me) return; ai.msgs.pop(); ai.msgs.push({ a: answer(i) }); aiSheet(); }, FRAME ? 0 : 700);
  }
  function secChip() {
    var bs = app.querySelectorAll('.exb b'), best = null;
    for (var i = 0; i < bs.length; i++) {
      if (!/^\(.+\)$/.test(bs[i].textContent)) continue;
      if (!best || bs[i].getBoundingClientRect().top < window.innerHeight * 0.5) best = bs[i];
    }
    return best ? '解説 ' + best.textContent + ' について' : 'この解説について';
  }

  /* 撮る画面（仮）と⑨写真で採点（写真に赤い印とまとめ） */
  function paper(marks) {
    return '<div class="pg"><div>(1)　y′ = 2x より 傾き 2a</div><div class="in">ℓ : y = 2ax − a²</div><div>(2)　S(a) = ∫₀ᵃ (x − a)² dx</div>' +
      '<div class="in">= [ (x − a)³ / 3 ]₀ᵃ = a³/3</div><div>(3)　Q (a, 0)</div><div class="in">T(a) = ½ · a · a² = a³/2</div><div class="in">T(a) / S(a) = 3/2</div>' +
      (marks ? '<i class="okm" style="top:25px"></i><i class="okm" style="top:93px"></i>' +
        '<i class="mk" style="left:70px;top:157px;width:92px;height:34px"></i><b class="pin" style="left:152px;top:146px">1</b>' +
        '<i class="mk" style="left:205px;top:191px;width:54px;height:34px"></i><b class="pin" style="left:251px;top:180px">2</b>' : '') + '</div>';
  }
  S.cam = function () {
    return { body: 'dark', html:
      '<div class="camtop" data-k="上"><div class="rb"' + act('back') + ' aria-label="閉じる">' + ic('x') + '</div><span class="t2">答案を撮る</span><span style="width:42px"></span></div>' +
      '<div class="vf" data-k="枠"><div class="photo">' + paper(false) + '</div><i class="c1"></i><i class="c2"></i><i class="c3"></i><i class="c4"></i>' +
      '<div class="gh"><span>紙ぜんたいを枠に入れてください</span></div></div>' +
      '<div class="shut" data-k="シャッター"' + act('shoot') + ' aria-label="撮る"><span></span></div>' };
  };
  S.grade = function (p) {
    var q = D.prob(p.id);
    return { html: '<main class="scr s-grade">' + nv() +
      '<div class="ttl" data-k="題"><div class="lb">' + q.short + '</div><h1>採点</h1></div>' +
      '<div class="marks" data-k="結果"><span>(1) ○</span><span>(2) ○</span><span class="ng">(3) ×</span></div>' +
      '<div class="photo" data-k="写真">' + (q.photo ? '' : '<span class="mtag">見本の写真</span>') + paper(true) + '</div>' +
      '<div class="cd sumc" data-k="まとめ"><div class="t3b">まちがいのまとめ</div><ol class="mist">' +
      R`<li><span class="rpin">1</span><span>Q の $x$ 座標が $a$ になっている。$\ell$ の式で $y=0$ とすると $x=\dfrac{a}{2}$。</span></li>` +
      R`<li><span class="rpin">2</span><span>そのため $T(a)$ と最後の比がずれた（正しくは $\dfrac34$）。</span></li></ol></div></main>` +
      '<div class="bb dock" data-k="下"><div class="btn2"><div class="cta w"' + act('retake') + '>撮り直す</div><div class="cta"' + act('kai') + '>解説を見る</div></div></div>' };
  };

  /* ⑤入試演習：文系／理系・大学ごと（50音順か自分の並び）／難易度ごと */
  var order = {};
  try { order = JSON.parse(localStorage.getItem('mxm.order') || '{}') || {}; } catch (e) { order = {}; }
  function saveOrder() { try { localStorage.setItem('mxm.order', JSON.stringify(order)); } catch (e) {} }
  function kana(bun) { return D.univsFor(bun).slice().sort(function (a, b) { return a.yomi.localeCompare(b.yomi, 'ja'); }); }
  function mine(bun) {
    var k = kana(bun), ids = (order[bun] || []).filter(function (id) { return k.some(function (u) { return u.id === id; }); });
    k.forEach(function (u) { if (ids.indexOf(u.id) < 0) ids.push(u.id); });
    return ids.map(function (id) { return D.univ(id); });
  }
  var GYO = [['あ', 'あいうえお'], ['か', 'かきくけこがぎぐげご'], ['さ', 'さしすせそざじずぜぞ'], ['た', 'たちつてとだぢづでど'], ['な', 'なにぬねの'],
    ['は', 'はひふへほばびぶべぼぱぴぷぺぽ'], ['ま', 'まみむめも'], ['や', 'やゆよ'], ['ら', 'らりるれろ'], ['わ', 'わをん']];
  function gyo(y) { var c = y.charAt(0); for (var i = 0; i < GYO.length; i++) if (GYO[i][1].indexOf(c) >= 0) return GYO[i][0] + '行'; return ''; }
  function ucard(u, bun) {
    var s = D.sum(D.univAll(u.id, bun));
    return '<div class="cd uc"' + act('univ', u.id) + '><div class="top"><span class="t2">' + u.name + '</span>' + ic('cr') + '</div>' +
      '<div class="ft"><div class="bar"><i style="width:' + pct(s) + '%"></i></div><span class="mt">' + D.years.length + '年分 · <span class="num">' + s.total + '</span>問</span></div></div>';
  }
  function univList(p, bun) {
    if (p.order === 'mine') return '<div class="stack" data-k="大学" style="margin-top:14px">' + mine(bun).map(function (u) { return ucard(u, bun); }).join('') + '</div>';
    var h = '', g = null;
    kana(bun).forEach(function (u) {
      var x = gyo(u.yomi);
      if (x !== g) { h += (g !== null ? '</div>' : '') + '<div class="gh">' + x + '</div><div class="stack">'; g = x; }
      h += ucard(u, bun);
    });
    return '<div data-k="大学">' + h + '</div></div>';
  }
  function editList(bun) {
    return '<div class="rhint" data-k="ヒント"><span>右のつまみで動かす · 上から順に出ます</span><u' + act('reset') + '>50音順にもどす</u></div>' +
      '<div class="cd rl" data-k="大学">' + mine(bun).map(function (u, i) {
        return '<div class="rr" data-u="' + u.id + '"><span class="n">' + (i + 1) + '</span><span class="t3b">' + u.name + '</span><span class="hdl" aria-label="' + u.name + 'を動かす"><i></i><i></i><i></i></span></div>';
      }).join('') + '</div>';
  }
  function lvList(p, bun) {
    var us = p.order === 'mine' ? mine(bun) : kana(bun), by = {};
    us.forEach(function (u) { D.univAll(u.id, bun).forEach(function (id) { var l = D.prob(id).lv; (by[l] = by[l] || []).push(id); }); });
    var lvs = Object.keys(by).map(Number);
    if (!by[p.lv]) p.lv = lvs.indexOf(6) >= 0 ? 6 : lvs[0];
    var ids = by[p.lv], s = D.sum(ids), n = p.more ? ids.length : Math.min(ids.length, 20);
    return '<div class="strip" data-k="レベル">' + strip(lvs, p.lv) + '</div>' +
      '<div class="cap mt" data-k="件数"><span><b>レベル' + p.lv + '</b> · <span class="num">' + ids.length + '</span>問</span><span><span class="num">' + s.ok + '</span>問 正解</span></div>' +
      '<div class="stack" data-k="問題">' + ids.slice(0, n).map(function (id) { var q = D.prob(id); return card(q, q.head, true); }).join('') + '</div>' +
      (n < ids.length ? '<div class="more"' + act('more') + '>ほかの ' + (ids.length - n) + '問も見る</div>' : '');
  }
  S.exam = function (p) {
    var bun = p.bun, srt = p.sort;
    var pillH = srt !== 'univ' ? '' : p.edit ? '<span class="so k"' + act('done') + '>完了</span>' :
      '<span class="so"' + act('menu') + '>' + (p.order === 'mine' ? '自分の並び' : '50音順') + ic('cd') + '</span>';
    var html = '<main class="scr nb s-exam">' + nv() +
      '<div class="ttl" data-k="題"><div class="lb">大学の過去問</div><h1>入試演習</h1></div>' +
      '<div class="seg" data-k="切りかえ"><span class="' + (bun === 'bun' ? 'on' : '') + '"' + act('bun', 'bun') + '>文系</span><span class="' + (bun === 'ri' ? 'on' : '') + '"' + act('bun', 'ri') + '>理系</span></div>' +
      '<div class="sorts" data-k="並び"><div class="tx"><span class="' + (srt === 'univ' ? 'on' : '') + '"' + act('sort', 'univ') + '>大学ごと</span><span class="' + (srt === 'lv' ? 'on' : '') + '"' + act('sort', 'lv') + '>難易度ごと</span></div>' + pillH + '</div>' +
      (srt === 'lv' ? lvList(p, bun) : p.edit ? editList(bun) : univList(p, bun));
    return { html: html + '</main>', after: p.edit ? bindDrag : null };
  };
  /* 並べかえ：右のつまみを押したまま上下に動かす */
  function bindDrag() {
    var list = app.querySelector('.rl'); if (!list) return;
    function num() { [].forEach.call(list.children, function (r, i) { r.querySelector('.n').textContent = i + 1; }); }
    function keep() { order[cur().p.bun] = [].map.call(list.children, function (r) { return r.dataset.u; }); saveOrder(); }
    list.addEventListener('pointerdown', function (ev) {
      var hd = ev.target.closest('.hdl'); if (!hd) return;
      var row = hd.closest('.rr'), y0 = ev.clientY, dy = 0;
      ev.preventDefault();
      try { hd.setPointerCapture(ev.pointerId); } catch (e) {}
      row.classList.add('lift');
      function place() { row.style.transform = 'translateY(' + dy + 'px) scale(1.03)'; }
      function mv(e2) {
        var y = e2.clientY;
        var sy = window.scrollY;
        if (y > window.innerHeight - 70) window.scrollBy(0, 10); else if (y < 90) window.scrollBy(0, -10);
        y0 -= window.scrollY - sy;
        dy = y - y0;
        var nx = row.nextElementSibling, pv = row.previousElementSibling;
        if (nx && dy > nx.offsetHeight / 2) { list.insertBefore(nx, row); y0 += nx.offsetHeight; dy -= nx.offsetHeight; num(); }
        else if (pv && dy < -pv.offsetHeight / 2) { list.insertBefore(row, pv); y0 -= pv.offsetHeight; dy += pv.offsetHeight; num(); }
        place();
      }
      function up() {
        hd.removeEventListener('pointermove', mv); hd.removeEventListener('pointerup', up); hd.removeEventListener('pointercancel', up);
        row.classList.remove('lift'); row.style.transform = ''; keep();
      }
      hd.addEventListener('pointermove', mv); hd.addEventListener('pointerup', up); hd.addEventListener('pointercancel', up);
      place();
    });
  }
  /* 大学を押したあと：年度ごとに第1問から */
  S.univ = function (p) {
    var u = D.univ(p.u), s = D.sum(D.univAll(p.u, p.bun));
    return { html: '<main class="scr nb s-univ">' + nv() +
      '<div class="ttl" data-k="題"><div class="lb">入試演習 · ' + (p.bun === 'ri' ? '理系' : '文系') + '</div><h1>' + u.name + '</h1></div>' +
      '<div class="sum mt" data-k="まとめ">' + D.years[D.years.length - 1] + '〜' + D.years[0] + ' · <span class="num">' + s.total + '</span>問 · <span class="num">' + s.ok + '</span>問 正解</div>' +
      '<div data-k="年度">' + D.years.map(function (y) {
        var ids = D.examIds(p.u, p.bun, y);
        return '<div class="yr"><b>' + y + '年</b><span class="mt"><span class="num">' + ids.length + '</span>問</span></div><div class="cd rows">' + ids.map(function (id) {
          var q = D.prob(id);
          return '<div class="pr" data-id="' + id + '"' + act('prob') + '><span class="t3b">第' + q.n + '問</span><span class="lvl">' + lv(q.lv) + 'レベル' + q.lv + '</span>' + dot(q) + ic('cr') + '</div>';
        }).join('') + '</div>';
      }).join('') + '</div></main>' };
  };

  /* 復習・記録（仮：形は次の回で案から選ぶ） */
  var KARI = '<div class="note" data-k="仮">仮の画面です。形は、次の回で案から選んでもらいます。</div>';
  S.rev = function () {
    return { html: '<main class="scr s-rev"><div class="hd" data-k="見出し"><div><div class="br">Memora X</div><h1>復習</h1></div></div>' +
      '<div class="lb" style="margin:0 4px 10px">まちがえた問題</div><div class="cd rows" data-k="まちがい">' + D.review().map(function (id) {
        var q = D.prob(id);
        return '<div class="pr" data-id="' + id + '"' + act('prob') + '><div class="nm"><div class="t3b">' + (q.kind === 'e' ? q.head : q.src[0] + ' ' + q.src[1]) + '</div>' +
          '<div class="mt">' + (q.kind === 'e' ? q.units.join(' · ') : q.units[1]) + ' · レベル' + q.lv + '</div></div>' + dot(q) + ic('cr') + '</div>';
      }).join('') + '</div>' + KARI + '</main>' + tab('rev') };
  };
  S.rec = function () {
    var r = D.record(), ok = 0, done = 0;
    r.forEach(function (s) { ok += s.ok; done += s.ok + s.ng; });
    return { html: '<main class="scr s-rec"><div class="hd" data-k="見出し"><div><div class="br">Memora X</div><h1>記録</h1></div></div>' +
      '<div class="grid2" data-k="数"><div class="cd big"><div class="lb">解いた問題</div><div class="n">' + done + '</div></div><div class="cd big"><div class="lb">正解</div><div class="n">' + ok + '</div></div></div>' +
      '<div class="sec">科目ごとの正解</div><div class="cd rows" data-k="科目">' + r.map(function (s) {
        return '<div class="pr"><span class="t3b sj">' + s.name + '</span><div class="bar"><i style="width:' + pct(s) + '%"></i></div><span class="mt num">' + s.ok + ' / ' + s.total + '</span></div>';
      }).join('') + '</div>' + KARI + '</main>' + tab('rec') };
  };

  /* ---------- 押したとき ---------- */
  var A = {
    back: back,
    tab: function (el) { stack = [{ n: el.dataset.v, p: {} }]; show(); },
    settings: function () { toast('設定は次に作ります'); },
    cont: function () { go('list', { si: 0, bi: 2, ki: 1, lv: 3 }); },
    units: function () { go('units', { si: lastSi }); },
    exam: function () { go('exam', { bun: 'ri', sort: 'univ', order: order.mode === 'mine' ? 'mine' : 'kana' }); },
    subj: function (el) { lastSi = cur().p.si = +el.dataset.v; show(); },
    big: function (el) { go('small', { si: cur().p.si, bi: +el.dataset.v }); },
    small: function (el) { var p = cur().p; go('list', { si: p.si, bi: p.bi, ki: +el.dataset.v }); },
    lv: function (el) { cur().p.lv = +el.dataset.v; cur().p.more = false; rerender(); },
    prob: function (el) { go('prob', { id: el.dataset.id, ctx: ctxOf(el) }); },
    qmore: function (el) {
      var c = el.closest('.qb'), open = qOpen[c.dataset.id] = !qOpen[c.dataset.id];
      c.querySelector('.q-t').classList.toggle('open', open);
      el.innerHTML = moreLabel(open);
      window.MXFIT();
    },
    timer: function () { var e = cur(); if (e.tm.done) return; e.tm.run = !e.tm.run; updPill(e); },
    solved: function () { var e = cur(); e.tm.run = false; e.tm.done = true; e.sheet = true; updPill(e); solvedSheet(e); },
    hoshin: function () { var p = cur().p; go('hoshin', { id: p.id, ctx: p.ctx }); },
    kai: function () {
      var p = cur().p;
      for (var i = stack.length - 2; i >= 0; i--) if (stack[i].n === 'kai' && stack[i].p.id === p.id) return popTo(i);
      go('kai', { id: p.id, ctx: p.ctx });
    },
    again: function () {
      var p = cur().p;
      for (var i = stack.length - 2; i >= 0; i--) if (stack[i].n === 'prob' && stack[i].p.id === p.id) {
        var e = stack[i]; e.sheet = false; e.tm.done = false; e.tm.run = true; return popTo(i);
      }
      go('prob', { id: p.id, ctx: p.ctx });
    },
    next: function () {
      var p = cur().p, ctx = p.ctx || [], i = ctx.indexOf(p.id);
      if (i < 0 || i + 1 >= ctx.length) { toast('この一覧の最後の問題です'); return; }
      var j = stack.length - 1; while (j > 0 && /^(prob|hoshin|kai|cam|grade)$/.test(stack[j].n)) j--;
      stack.length = j + 1; go('prob', { id: ctx[i + 1], ctx: ctx });
    },
    peek: function () {
      var e = cur(), q = D.prob(e.p.id), pc = app.querySelector('.peek .pc');
      e.open = !e.open; pc.classList.toggle('open', e.open);
      pc.querySelector('.pt').innerHTML = e.open ? paras(q.t) : flat(q.t);
      pc.querySelector('.ph span:last-child').innerHTML = e.open ? '閉じる' + ic('cu') : '全文' + ic('cd');
      math(pc);
    },
    ai: function () { ai = { q: D.prob(cur().p.id), chip: secChip(), msgs: [] }; aiSheet(); },
    aiq: function (el) { var i = +el.dataset.v; ask(sugs()[i], i); },
    aiclose: function () { closeLayer(); },
    cam: function () { var p = cur().p; go('cam', { id: p.id, ctx: p.ctx }); },
    shoot: function () {
      var e = cur();
      openLayer('<div class="busy" data-layer="over"><div class="spin"></div>採点しています…</div>', { scrim: false, instant: true });
      setTimeout(function () { if (cur() === e) replace('grade', { id: e.p.id, ctx: e.p.ctx }); }, FRAME ? 0 : 1100);
    },
    retake: function () { var p = cur().p; replace('cam', { id: p.id, ctx: p.ctx }); },
    bun: function (el) { var p = cur().p; p.bun = el.dataset.v; p.edit = false; p.more = false; show(); },
    sort: function (el) { var p = cur().p; p.sort = el.dataset.v; p.edit = false; p.more = false; show(); },
    menu: function (el) {
      var r = el.getBoundingClientRect(), p = cur().p;
      openLayer('<div class="clear" data-close="1"></div><div class="menu" data-k="メニュー" data-layer="over" style="top:' + Math.round(r.bottom + 8) + 'px;right:' + Math.round(Math.max(16, window.innerWidth - r.right)) + 'px">' +
        '<div' + act('order', 'kana') + '>50音順' + (p.order !== 'mine' ? ic('ck') : '') + '</div>' +
        '<div' + act('order', 'mine') + '>自分の並び' + (p.order === 'mine' ? ic('ck') : '') + '</div><hr>' +
        '<div' + act('edit') + '>並べかえる' + ic('hd') + '</div></div>', { scrim: false, instant: true });
    },
    order: function (el) { var p = cur().p; p.order = order.mode = el.dataset.v; saveOrder(); show(); },
    edit: function () { var p = cur().p; p.edit = true; p.order = 'mine'; show(); },
    done: function () { var p = cur().p; p.edit = false; p.order = order.mode = 'mine'; saveOrder(); show(); },
    reset: function () { var p = cur().p; order[p.bun] = kana(p.bun).map(function (u) { return u.id; }); saveOrder(); rerender(); },
    univ: function (el) { go('univ', { u: el.dataset.v, bun: cur().p.bun }); },
    more: function () { cur().p.more = true; rerender(); }
  };
  document.addEventListener('click', function (ev) {
    if (ev.target.closest('[data-close]')) { closeLayer(); return; }
    var el = ev.target.closest('[data-act]'); if (!el) return;
    var f = A[el.dataset.act]; if (f) { ev.preventDefault(); f(el, ev); }
  });
  document.addEventListener('keydown', function (ev) {
    var t = ev.target;
    if ((ev.key === 'Enter' || ev.key === ' ') && t.matches && t.matches('[data-act]')) { ev.preventDefault(); t.click(); }
    if (ev.key === 'Escape') closeLayer();
  });
  document.addEventListener('submit', function (ev) {
    if (ev.target.id !== 'aif') return;
    ev.preventDefault();
    var inp = ev.target.querySelector('input'), v = inp.value.trim(); inp.value = '';
    if (v) ask(v, -1);
  });

  /* ---------- 見本の画面（画像づくりと確かめ用：?r=名前） ---------- */
  var S1 = 'e.todai.ri.2025.1', MY = ['todai', 'kyoto', 'titech', 'waseda', 'keio', 'osaka', 'tohoku', 'nagoya', 'kyushu', 'hokudai'], post = null;
  function H() { return { n: 'home', p: {} }; }
  function E(p) { return { n: 'exam', p: Object.assign({ bun: 'ri', sort: 'univ', order: 'kana' }, p || {}) }; }
  function EX1() { return [H(), E(), { n: 'univ', p: { u: 'todai', bun: 'ri' } }]; }
  var DEMO = {
    home: function () { stack = [H()]; },
    units: function () { stack = [H(), { n: 'units', p: { si: 0 } }]; },
    small: function () { stack = [H(), { n: 'units', p: { si: 0 } }, { n: 'small', p: { si: 0, bi: 2 } }]; },
    list: function () { stack = [H(), { n: 'list', p: { si: 0, bi: 2, ki: 1, lv: 3 } }]; },
    prob: function () { stack = EX1().concat([{ n: 'prob', p: { id: S1, ctx: D.univAll('todai', 'ri') }, tm: { t: 522, run: true, done: false } }]); },
    sheet: function () { DEMO.prob(); var e = cur(); e.tm.run = false; e.tm.done = true; e.sheet = true; },
    hoshin: function () { DEMO.sheet(); stack.push({ n: 'hoshin', p: { id: S1, ctx: cur().p.ctx } }); },
    kai: function () { DEMO.sheet(); stack.push({ n: 'kai', p: { id: S1, ctx: cur().p.ctx } }); },
    aid: function () { DEMO.kai(); post = function () { window.scrollTo(0, 150); A.ai(); }; },
    aia: function () { DEMO.kai(); post = function () { window.scrollTo(0, 150); A.ai(); ask(SUG1[0], 0); }; },
    aif: function () { DEMO.kai(); post = function () { window.scrollTo(0, 150); A.ai(); ask(SUG1[1], 1); }; },
    cam: function () { DEMO.kai(); stack.push({ n: 'cam', p: { id: S1 } }); },
    grade: function () { DEMO.kai(); stack.push({ n: 'grade', p: { id: S1 } }); },
    exam: function () { stack = [H(), E()]; },
    menu: function () { stack = [H(), E()]; post = function () { A.menu(app.querySelector('.so')); }; },
    edit: function () { order.ri = MY; stack = [H(), E({ order: 'mine', edit: true })]; post = function () { app.querySelector('.rr').classList.add('lift'); }; },
    mine: function () { order.ri = MY; stack = [H(), E({ order: 'mine' })]; },
    lvl: function () { stack = [H(), E({ sort: 'lv', lv: 6 })]; },
    bun: function () { stack = [H(), E({ bun: 'bun' })]; },
    univ: function () { stack = EX1(); },
    rev: function () { stack = [{ n: 'rev', p: {} }]; },
    rec: function () { stack = [{ n: 'rec', p: {} }]; }
  };

  /* ---------- はじめ ---------- */
  if (FRAME) document.body.insertAdjacentHTML('beforeend', '<div class="sb"><span class="sb-t">9:41</span><span class="sb-i">' +
    '<svg width="18" height="12" viewBox="0 0 18 12"><rect x="0" y="8" width="3" height="4" rx="1"/><rect x="5" y="5.5" width="3" height="6.5" rx="1"/><rect x="10" y="3" width="3" height="9" rx="1"/><rect x="15" y="0" width="3" height="12" rx="1"/></svg>' +
    '<svg width="16" height="12" viewBox="0 0 16 12"><path d="M8 2.3c2.3 0 4.4.9 5.9 2.4l1.2-1.2A10.1 10.1 0 0 0 8 .6C5.2.6 2.7 1.7.9 3.5l1.2 1.2A8.4 8.4 0 0 1 8 2.3zm0 3.3c1.4 0 2.7.5 3.6 1.4l1.2-1.2A6.8 6.8 0 0 0 8 3.9c-1.9 0-3.6.7-4.8 1.9l1.2 1.2c.9-.9 2.2-1.4 3.6-1.4zm0 3.3c.6 0 1.1.2 1.5.6L8 11 6.5 9.5c.4-.4.9-.6 1.5-.6z"/></svg>' +
    '<svg width="27" height="13" viewBox="0 0 27 13"><rect x=".5" y=".5" width="23" height="12" rx="3.8" fill="none" stroke="currentColor" stroke-opacity=".35"/><rect x="2" y="2" width="20" height="9" rx="2.4"/><path d="M25 4.4v4.2c.8-.3 1.4-1.1 1.4-2.1S25.8 4.7 25 4.4z" fill-opacity=".4"/></svg>' +
    '</span></div><div class="hi"></div>');
  var r = Q.get('r');
  if (r && DEMO[r]) DEMO[r](); else stack = [H()];
  show();
  if (post) post();
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(function () { setTimeout(function () { window.__ready = true; }, 250); });
})();

/* 式と小問の見せ方（LaTeX の原稿から変換したデータのために足した。docs/設計メモ_数学.md の 11/4）。
   別行の式：幅の狭いスマホで超える式を 90% まで縮める。それでも超える式は横スクロールのままにして、右端を薄くして続きがあることを示す。
   行内の式：すぐ後の句読点が行頭に、すぐ前のカッコが行末に来ないように、まとめて1つにする（文字の側に WORD JOINER などを入れても防げない）。
   小問：解説をスクロールしている間、いま読んでいる小問の番号を右上に残す。
   一覧のカード：問題文のはじめの行だけ見せて、続きがあれば「全文」を出す。
   フォントの読み込み後と画面の変化のたびに測り直す。 */
window.MXFIT = (function () {
  'use strict';
  var MIN = 0.9, SEL = '.exb .katex-display,.ptx .katex-display,.hs .katex-display', OPEN = /[（「『【]$/, CLOSE = /^[、。，．）」』】？！：；]/;
  function glue() {
    document.querySelectorAll('.katex').forEach(function (k) {
      if (k.closest('.qw-nb') || k.closest('.katex-display')) return;
      /* KaTeX の自動描画は式を span で包むので、その外側の文字を見る */
      var m = k.parentNode.childNodes.length === 1 ? k.parentNode : k, p = m.parentNode, a = m.previousSibling, b = m.nextSibling;
      var open = a && a.nodeType === 3 && OPEN.test(a.data), close = b && b.nodeType === 3 && CLOSE.test(b.data);
      if (!open && !close) return;
      var w = document.createElement('span');
      w.className = 'qw-nb';
      p.insertBefore(w, m);
      if (open) { w.appendChild(document.createTextNode(a.data.slice(-1))); a.data = a.data.slice(0, -1); }
      w.appendChild(m);
      if (close) { w.appendChild(document.createTextNode(b.data.charAt(0))); b.data = b.data.slice(1); }
    });
  }
  /* 小問の番号の行が画面の外に出たら、右上に番号を残す。位置は解説の上に貼り付く問題文（.peek）の右下の角。小問の終わりが近づいたら消す */
  function past() {
    var subs = document.querySelectorAll('.qw-sub');
    if (!subs.length) return;
    var peek = document.querySelector('.peek'), line = peek ? parseFloat(getComputedStyle(peek).top) + peek.offsetHeight : 0;
    document.documentElement.style.setProperty('--qw-top', line + 'px');
    subs.forEach(function (s) {
      var head = s.querySelector('.qw-subhead');
      if (head) s.classList.toggle('qw-past', head.getBoundingClientRect().bottom < line && s.getBoundingClientRect().bottom > line + 40);
    });
  }
  function more(d) { d.classList.toggle('qw-more', d.scrollLeft + d.clientWidth < d.scrollWidth - 1); }
  function fit(d) {
    var k = d.querySelector('.katex');
    if (!k) return;
    k.style.fontSize = '';
    if (d.scrollWidth > d.clientWidth + 1) k.style.fontSize = parseFloat(getComputedStyle(k).fontSize) * Math.max(MIN, d.clientWidth / d.scrollWidth) + 'px';
    more(d);
  }
  /* カードの問題文の n 行目の下の端と右の端。n 行で終わるときは null。式は .base、字は Range で1行ずつ測る */
  function cutAt(t, n) {
    var w = document.createTreeWalker(t, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT), range = document.createRange(), lines = 0, bottom = 0, right = 0, x, rs, i;
    while ((x = w.nextNode())) {
      if (x.nodeType === 3) { if (x.parentNode.closest('.katex')) continue; range.selectNodeContents(x); rs = range.getClientRects(); }
      else if (x.matches('.katex-html > .base')) rs = [x.getBoundingClientRect()];
      else continue;
      for (i = 0; i < rs.length; i++) {
        if (rs[i].width < 1) continue;
        if (!lines || rs[i].top >= bottom - 1) {
          if (lines === n) return { bottom: bottom, right: right };
          lines++; bottom = rs[i].bottom; right = rs[i].right;
        } else { bottom = Math.max(bottom, rs[i].bottom); right = Math.max(right, rs[i].right); }
      }
    }
    return null;
  }
  /* 段落が分かれると -webkit-line-clamp の効き方がブラウザでそろわない（Safari は段落ごとに数えることがある）ので、行を測って高さを決める。ふつう3行、c2 は2行 */
  function clip() {
    var ts = [].slice.call(document.querySelectorAll('.q-t'));
    ts.forEach(function (t) { t.style.maxHeight = ''; });
    ts.map(function (t) { var b = t.getBoundingClientRect(); return { top: b.top, left: b.left, end: cutAt(t, t.classList.contains('c2') ? 2 : 3) }; }).forEach(function (m, i) {
      var t = ts[i], cut = !!m.end && !t.classList.contains('open');
      t.parentNode.querySelector('.q-more').hidden = !m.end;
      t.classList.toggle('cut', cut);
      if (!cut) return;
      t.style.maxHeight = m.end.bottom - m.top + 2 + 'px';
      t.style.setProperty('--end', m.end.right - m.left + 'px');
    });
  }
  function all() { glue(); clip(); document.querySelectorAll(SEL).forEach(fit); past(); }
  var frame = 0;
  function later() { cancelAnimationFrame(frame); frame = requestAnimationFrame(all); }
  new MutationObserver(function (rs) {
    /* タイマーの数字（.tp）が毎秒変わるだけなら測り直さない */
    for (var i = 0; i < rs.length; i++) if (!rs[i].target.closest('.tp')) return later();
  }).observe(document.documentElement, { childList: true, subtree: true });
  window.addEventListener('resize', later);
  document.addEventListener('scroll', function (e) { if (e.target.matches && e.target.matches(SEL)) more(e.target); else past(); }, true);
  if (document.fonts && document.fonts.addEventListener) document.fonts.addEventListener('loadingdone', later);
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(later);
  return all;
})();
