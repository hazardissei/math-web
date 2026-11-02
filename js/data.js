/* 数学版 Memora X：仮の中身（単元の木・問題・過去問）。
   問題が入ったら、この形（subjects・prob・…）のまま本物に差しかえる。
   問題の id：単元別 u.<科目>.<大単元>.<小単元>.<レベル>.<番号>／過去問 e.<大学>.<ri|bun>.<年>.<番号> */
window.MXDATA = (function () {
  'use strict';
  var R = String.raw;
  function h(s) { var x = 2166136261; for (var i = 0; i < s.length; i++) { x ^= s.charCodeAt(i); x = Math.imul(x, 16777619); } return x >>> 0; }
  function mss(t) { return Math.floor(t / 60) + ':' + ('0' + (t % 60)).slice(-2); }

  /* 科目 → 大単元 → 小単元（新課程） */
  var SUBJ = [
    ['数学Ⅰ', 'Ⅰ', [['数と式', '式の計算・実数・1次不等式'], ['集合と命題', '集合・命題と条件・命題と証明'], ['2次関数', '2次関数のグラフ・最大・最小・2次関数の決定・2次方程式・グラフとx軸・2次不等式'], ['図形と計量', '三角比・三角比の拡張・正弦定理・余弦定理・図形の計量'], ['データの分析', 'データの散らばり・データの相関・仮説検定の考え方']]],
    ['数学A', 'A', [['場合の数と確率', '集合の要素の個数・順列・組合せ・確率とその基本性質・独立な試行と確率・条件付き確率・期待値'], ['図形の性質', '三角形の性質・円の性質・作図・空間図形'], ['数学と人間の活動', '約数と倍数・ユークリッドの互除法・1次不定方程式・n進法']]],
    ['数学Ⅱ', 'Ⅱ', [['いろいろな式', '式と証明・複素数と方程式・剰余の定理と因数定理・高次方程式'], ['図形と方程式', '点と直線・円・軌跡と領域'], ['指数関数・対数関数', '指数関数・対数関数'], ['三角関数', '三角関数・加法定理'], ['微分法と積分法', '微分係数と導関数・導関数の応用・不定積分と定積分・面積']]],
    ['数学B', 'B', [['数列', '等差数列と等比数列・いろいろな数列・漸化式・数学的帰納法'], ['統計的な推測', '確率分布・二項分布・正規分布・区間推定・仮説検定']]],
    ['数学Ⅲ', 'Ⅲ', [['極限', '数列の極限・無限級数・関数の極限・連続性'], ['微分法', '導関数・いろいろな関数の導関数・接線と法線・グラフの概形・方程式・不等式への応用'], ['積分法', '不定積分・定積分・面積・体積・曲線の長さ']]],
    ['数学C', 'C', [['ベクトル', '平面上のベクトル・ベクトルの内積・位置ベクトル・空間のベクトル'], ['平面上の曲線と複素数平面', '2次曲線・媒介変数表示と極座標・複素数平面・ド・モアブルの定理']]]
  ];
  // 「最大・最小」「正弦定理・余弦定理」などは1つの名前なので、区切りの「・」で分けたあとにつなぎ直す
  var JOIN = { '最大': '最大・最小', '正弦定理': '正弦定理・余弦定理', '方程式': '方程式・不等式への応用', 'ド': 'ド・モアブルの定理' };
  var subjects = SUBJ.map(function (s) {
    return { name: s[0], short: s[1], units: s[2].map(function (u) {
      var parts = u[1].split('・'), smalls = [];
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i];
        if (JOIN[p] && JOIN[p] === p + '・' + parts[i + 1]) { smalls.push(JOIN[p]); i++; } else smalls.push(p);
      }
      return { name: u[0], smalls: smalls.map(function (n) { return { name: n }; }) };
    }) };
  });

  /* 仮の問題文（大単元ごと）。「@@」の左が大単元 */
  var UP = {};
  R`
数と式@@$x=\dfrac{1}{\sqrt{3}-\sqrt{2}}$ のとき、$x+\dfrac{1}{x}$ と $x^2+\dfrac{1}{x^2}$ の値を求めよ。
数と式@@不等式 $|2x-3|\lt 5$ を解け。
数と式@@$(a+b+c)^2-(a-b-c)^2$ を展開して整理せよ。
集合と命題@@命題「$x^2=1$ ならば $x=1$」の真偽を調べ、偽であれば反例をあげよ。
集合と命題@@$\sqrt{2}$ が無理数であることを使って、$1+\sqrt{2}$ が無理数であることを証明せよ。
2次関数@@放物線 $y=x^2-6x+7$ の頂点の座標を求めよ。
2次関数@@2次不等式 $x^2-5x+6\lt 0$ を解け。
2次関数@@放物線 $y=x^2+ax+b$ が2点 $(1,\ 2),\ (3,\ 4)$ を通るとき、$a,\ b$ の値を求めよ。
図形と計量@@$\triangle\mathrm{ABC}$ において、$a=7,\ b=5,\ c=3$ のとき、角 A の大きさを求めよ。
図形と計量@@$\sin\theta=\dfrac{3}{5}\ (90^\circ\lt\theta\lt 180^\circ)$ のとき、$\cos\theta$ と $\tan\theta$ の値を求めよ。
データの分析@@5個のデータ $3,\ 5,\ 6,\ 8,\ 8$ の平均値と分散を求めよ。
データの分析@@変量 $x$ の分散が $4$ のとき、$y=3x+2$ の分散と標準偏差を求めよ。
場合の数と確率@@男子4人と女子3人が1列に並ぶとき、女子3人が続いて並ぶ並び方は何通りあるか。
場合の数と確率@@さいころを3回投げるとき、出る目の積が偶数になる確率を求めよ。
図形の性質@@円に内接する四角形 ABCD で $\angle\mathrm{A}=100^\circ$ のとき、$\angle\mathrm{C}$ を求めよ。
図形の性質@@$\triangle\mathrm{ABC}$ の重心を G、辺 BC の中点を M とするとき、$\mathrm{AG}:\mathrm{GM}$ を求めよ。
数学と人間の活動@@$1071$ と $1029$ の最大公約数を、ユークリッドの互除法で求めよ。
数学と人間の活動@@方程式 $7x+5y=1$ の整数解をすべて求めよ。
いろいろな式@@$x^3-2x^2-5x+6$ を因数分解せよ。
いろいろな式@@2次方程式 $x^2-2x+3=0$ の2つの解を $\alpha,\ \beta$ とするとき、$\alpha^2+\beta^2$ の値を求めよ。
図形と方程式@@点 $(1,\ 2)$ と直線 $3x+4y-1=0$ の距離を求めよ。
図形と方程式@@円 $x^2+y^2=5$ 上の点 $(2,\ 1)$ における接線の方程式を求めよ。
指数関数・対数関数@@方程式 $4^x-3\cdot 2^{x+1}+8=0$ を解け。
指数関数・対数関数@@$\log_2 3=a$ のとき、$\log_6 12$ を $a$ で表せ。
三角関数@@$0\le\theta\lt 2\pi$ のとき、方程式 $\sin\theta+\sqrt{3}\cos\theta=1$ を解け。
三角関数@@$\alpha,\ \beta$ は鋭角で $\sin\alpha=\dfrac{3}{5},\ \cos\beta=\dfrac{5}{13}$ のとき、$\sin(\alpha+\beta)$ を求めよ。
微分法と積分法@@関数 $f(x)=x^3-3x^2+2$ の極値を求めよ。
微分法と積分法@@放物線 $y=x^2-2x$ と $x$ 軸で囲まれた部分の面積を求めよ。
数列@@数列 $\{a_n\}$ が $a_1=1,\ a_{n+1}=2a_n+1$ を満たすとき、一般項 $a_n$ を求めよ。
数列@@和 $\displaystyle\sum_{k=1}^{n}k(k+1)$ を求めよ。
統計的な推測@@確率変数 $X$ が二項分布 $B\left(100,\ \dfrac{1}{5}\right)$ に従うとき、$X$ の平均と標準偏差を求めよ。
統計的な推測@@ある工場の製品から400個を取り出したところ、不良品が20個あった。不良品の割合を、信頼度95%で推定せよ。
極限@@極限 $\displaystyle\lim_{n\to\infty}\left(\sqrt{n^2+2n}-n\right)$ を求めよ。
極限@@無限級数 $\displaystyle\sum_{n=1}^{\infty}\frac{1}{n(n+1)}$ の和を求めよ。
微分法@@関数 $f(x)=xe^{-x}$ の増減を調べ、極値を求めよ。
微分法@@曲線 $y=\log x$ 上の点 $(e,\ 1)$ における接線の方程式を求めよ。
積分法@@定積分 $\displaystyle\int_0^{\frac{\pi}{2}}x\sin x\,dx$ を求めよ。
積分法@@曲線 $y=\sqrt{x}$ と $x$ 軸、直線 $x=4$ で囲まれた部分を、$x$ 軸のまわりに1回転させてできる立体の体積を求めよ。
ベクトル@@$|\vec{a}|=2,\ |\vec{b}|=3,\ \vec{a}\cdot\vec{b}=-3$ のとき、$|\vec{a}+2\vec{b}|$ を求めよ。
ベクトル@@$\triangle\mathrm{OAB}$ で、辺 AB を $2:1$ に内分する点を P とするとき、$\overrightarrow{\mathrm{OP}}$ を $\overrightarrow{\mathrm{OA}},\ \overrightarrow{\mathrm{OB}}$ で表せ。
平面上の曲線と複素数平面@@楕円 $\dfrac{x^2}{9}+\dfrac{y^2}{4}=1$ の焦点の座標を求めよ。
平面上の曲線と複素数平面@@複素数 $z=1+\sqrt{3}i$ について、$z^6$ を求めよ。
`.trim().split('\n').forEach(function (l) { var a = l.split('@@'); (UP[a[0]] = UP[a[0]] || []).push(a[1]); });

  /* 仮の過去問の文（文系にも出せるものは 1）。段落は「//」で区切る */
  var EX = R`
0@@数学C|平面上の曲線と複素数平面|複素数平面@@複素数平面上で、$|z-1|=1$ を満たす点 $z$ について、$w=\dfrac{1}{z}$ が描く図形を求めよ。ただし $z\neq 0$ とする。
1@@数学C|ベクトル|空間のベクトル@@四面体 OABC において、$\overrightarrow{\mathrm{OA}}=\vec{a},\ \overrightarrow{\mathrm{OB}}=\vec{b},\ \overrightarrow{\mathrm{OC}}=\vec{c}$ とする。辺 AB の中点を M、辺 OC を $2:1$ に内分する点を N とする。//(1)　$\overrightarrow{\mathrm{MN}}$ を $\vec{a},\ \vec{b},\ \vec{c}$ で表せ。//(2)　線分 MN の中点を P とするとき、$\overrightarrow{\mathrm{OP}}$ を $\vec{a},\ \vec{b},\ \vec{c}$ で表せ。
0@@数学Ⅲ|微分法|グラフの概形@@関数 $f(x)=xe^{-x}$ について、次の問いに答えよ。//(1)　曲線 $y=f(x)$ の変曲点を求めよ。//(2)　曲線 $y=f(x)$、$x$ 軸および直線 $x=2$ で囲まれた部分の面積を求めよ。
0@@数学Ⅲ|極限|数列の極限@@数列 $\{a_n\}$ を $a_1=2,\ a_{n+1}=\dfrac{a_n}{2}+\dfrac{1}{a_n}$ で定める。//(1)　すべての自然数 $n$ について $a_n\gt\sqrt{2}$ であることを示せ。//(2)　$\displaystyle\lim_{n\to\infty}a_n$ を求めよ。
1@@数学A|場合の数と確率|独立な試行と確率@@袋の中に赤玉3個と白玉2個が入っている。袋から玉を1個取り出して色を調べ、もとに戻す操作を $n$ 回くり返す。赤玉が奇数回出る確率 $p_n$ を求めよ。
1@@数学Ⅱ|三角関数|加法定理@@$0\le\theta\le\pi$ のとき、関数 $y=\sin 2\theta+2(\sin\theta+\cos\theta)$ の最大値と最小値を求めよ。
1@@数学A|数学と人間の活動|約数と倍数@@$n$ を自然数とする。$n^3-n$ は $6$ の倍数であることを証明せよ。
1@@数学B|数列|漸化式@@数列 $\{a_n\}$ が $a_1=3,\ a_{n+1}=3a_n-2$ を満たすとき、一般項 $a_n$ と $\displaystyle\sum_{k=1}^{n}a_k$ を求めよ。
1@@数学Ⅱ|図形と方程式|軌跡と領域@@実数 $x,\ y$ が $x^2+y^2\le 4,\ y\ge 0$ を満たすとき、$x+y$ の最大値と最小値を求めよ。
1@@数学Ⅱ|微分法と積分法|面積@@放物線 $y=x^2$ と直線 $y=mx+1$ で囲まれた部分の面積を $S(m)$ とする。$S(m)$ の最小値を求めよ。
0@@数学Ⅲ|積分法|体積@@曲線 $y=\sin x\ (0\le x\le\pi)$ と $x$ 軸で囲まれた部分を、$x$ 軸のまわりに1回転させてできる立体の体積を求めよ。
`.trim().split('\n').map(function (l) { var a = l.split('@@'); return { bun: a[0] === '1', units: a[1].split('|'), t: a[2].split('//') }; });

  /* 中身まで入れた見本（方針・解説・AI・写真の採点） */
  var SAMPLE = {
    'e.todai.ri.2025.1': {
      t: [R`$a$ を正の実数とする。放物線 $C:\ y=x^2$ 上の点 $\mathrm{P}(a,\ a^2)$ における接線を $\ell$ とする。`,
        R`(1)　$\ell$ の方程式を求めよ。`,
        R`(2)　$C$ と $\ell$、および $y$ 軸で囲まれた部分の面積 $S(a)$ を求めよ。`,
        R`(3)　$\ell$ と $x$ 軸の交点を $\mathrm{Q}$ とし、$\triangle\mathrm{OPQ}$ の面積を $T(a)$ とする。$\dfrac{T(a)}{S(a)}$ は $a$ によらない定数であることを示せ。`],
      units: ['数学Ⅱ', '微分法と積分法', '面積'],
      hs: [R`接線は、$y=x^2$ を微分して、点 P での傾き $2a$ を使う。`,
        R`囲まれた部分は $0\le x\le a$。曲線と接線の差 $(x-a)^2$ を積分する。`,
        R`Q の座標から $T(a)$ を出して、$S(a)$ との比をとる。`],
      ex: R`<p><b>(1)</b>　$y'=2x$ より、P での接線の傾きは $2a$。</p>
$$\ell:\ y=2ax-a^2$$
<p><b>(2)</b>　$0\le x\le a$ で $x^2-(2ax-a^2)=(x-a)^2\ge 0$ だから</p>
$$S(a)=\int_0^a (x-a)^2\,dx=\frac{a^3}{3}$$
<p><b>(3)</b>　Q は $\left(\dfrac{a}{2},\ 0\right)$ なので</p>
$$T(a)=\frac12\cdot\frac a2\cdot a^2=\frac{a^3}{4}$$
<p>よって $\dfrac{T(a)}{S(a)}=\dfrac34$ で、$a$ によらない。</p>`,
      ai: true, photo: true
    },
    'u.0.2.1.3.1': {
      t: [R`関数 $y=x^2-4x+5\ (0\le x\le 3)$ の最大値と最小値を求めよ。`],
      hs: [R`平方完成して、軸と頂点を出す。`, R`軸 $x=2$ は $0\le x\le 3$ の中にあるので、最小は頂点。`, R`最大は、軸から遠い端 $x=0$ で考える。`],
      ex: R`<p>$y=(x-2)^2+1$ なので、軸は $x=2$、頂点は $(2,\ 1)$。</p>
<p>軸は $0\le x\le 3$ の中にあるので、最小値は $x=2$ のとき $1$。</p>
<p>軸から遠いのは $x=0$ の端なので、最大値は $x=0$ のとき</p>
$$y=0-0+5=5$$
<p>よって、最大値 $5$（$x=0$）、最小値 $1$（$x=2$）。</p>`
    },
    'u.0.2.1.3.2': {
      t: [R`$a$ を定数とする。関数 $y=x^2-2ax+3\ (0\le x\le 2)$ の最小値を求めよ。`],
      hs: [R`平方完成すると、軸は $x=a$。`, R`軸が区間の左・中・右のどこにあるかで3つに分ける。`, R`それぞれ、最小になる $x$ を決めて値を出す。`],
      ex: R`<p>$y=(x-a)^2-a^2+3$ なので、軸は $x=a$。</p>
<p><b>(i)</b>　$a\lt 0$ のとき、$x=0$ で最小。最小値は $3$。</p>
<p><b>(ii)</b>　$0\le a\le 2$ のとき、$x=a$ で最小。最小値は $-a^2+3$。</p>
<p><b>(iii)</b>　$a\gt 2$ のとき、$x=2$ で最小。最小値は $7-4a$。</p>`
    },
    'u.0.2.1.3.3': {
      t: [R`関数 $y=-x^2+2x+k\ (-1\le x\le 2)$ の最大値が $5$ のとき、定数 $k$ の値と最小値を求めよ。`],
      hs: [R`平方完成して、軸 $x=1$ を出す。`, R`上に凸なので、最大は頂点。最大値が $5$ になる $k$ を決める。`, R`最小は、軸から遠い端 $x=-1$。`],
      ex: R`<p>$y=-(x-1)^2+k+1$ なので、軸は $x=1$。上に凸で、軸は区間の中にある。</p>
<p>最大値は $x=1$ のとき $k+1$。これが $5$ なので $k=4$。</p>
<p>最小は、軸から遠い $x=-1$ のときで</p>
$$y=-1-2+4=1$$
<p>よって $k=4$、最小値 $1$（$x=-1$）。</p>`
    },
    'u.0.2.1.3.4': {
      t: [R`$x+y=4$ のとき、$x^2+y^2$ の最小値と、そのときの $x,\ y$ の値を求めよ。`],
      hs: [R`$y=4-x$ を代入して、$x$ だけの式にする。`, R`2次関数として平方完成する。`, R`最小になる $x$ から $y$ も出す。`],
      ex: R`<p>$y=4-x$ を代入すると</p>
$$x^2+(4-x)^2=2x^2-8x+16=2(x-2)^2+8$$
<p>$x$ はすべての実数をとれるので、$x=2$ のとき最小値 $8$。このとき $y=2$。</p>`
    },
    'u.0.2.1.3.5': {
      t: [R`$x\ge 0,\ y\ge 0,\ 2x+y=6$ のとき、$xy$ の最大値を求めよ。`],
      hs: [R`$y=6-2x$ を代入する。`, R`$y\ge 0$ から、$x$ の範囲 $0\le x\le 3$ を出す。`, R`その範囲で、2次関数の最大を考える。`],
      ex: R`<p>$y=6-2x$ で、$y\ge 0$ より $0\le x\le 3$。</p>
$$xy=x(6-2x)=-2\left(x-\frac32\right)^2+\frac92$$
<p>軸 $x=\dfrac32$ は範囲の中にあるので、$x=\dfrac32,\ y=3$ のとき最大値 $\dfrac92$。</p>`
    }
  };
  /* 見本の正解・まちがい（それ以外は仮に決める） */
  var ST = { 'u.0.2.1.3.1': ['ok', 372], 'u.0.2.1.3.2': ['ok', 520], 'u.0.2.1.3.3': ['ng', 725], 'u.0.2.1.3.4': ['no'], 'u.0.2.1.3.5': ['no'],
    'e.todai.ri.2025.1': ['ok', 1120], 'e.todai.ri.2025.2': ['ok', 1265], 'e.todai.ri.2025.3': ['ng', 1450], 'e.todai.ri.2025.4': ['no'], 'e.todai.ri.2025.5': ['no'], 'e.todai.ri.2025.6': ['no'],
    'e.todai.ri.2024.1': ['ok', 980], 'e.todai.ri.2024.2': ['no'], 'e.todai.ri.2024.3': ['no'] };
  var RATE = { '0.0': 32, '0.1': 10, '0.2': 21, '0.3': 6, '1.0': 8, '2.4': 12, '3.0': 6 };

  /* 単元別 */
  var MAXMIN = '0.2.1';
  function smallLevels(si, bi, ki) {
    if (si + '.' + bi + '.' + ki === MAXMIN) return [1, 2, 3, 4, 5, 6, 7];
    var x = h('L' + si + '.' + bi + '.' + ki), lo = 1 + (x % 2) + (si >= 4 ? 1 : 0), hi = Math.min(8, 5 + ((x >> 3) % 4) + (si >= 4 ? 1 : 0)), a = [];
    for (var l = lo; l <= hi; l++) a.push(l);
    if ((x >> 7) % 3 === 0 && a.length > 4) a.splice(1 + ((x >> 9) % (a.length - 2)), 1);
    return a;
  }
  function count(si, bi, ki, lv) { return si + '.' + bi + '.' + ki === MAXMIN && lv === 3 ? 5 : 2 + (h('C' + si + bi + ki + lv) % 4); }
  function unitIds(si, bi, ki, lv) { var a = []; for (var n = 1; n <= count(si, bi, ki, lv); n++) a.push(['u', si, bi, ki, lv, n].join('.')); return a; }
  function status(id, rate) {
    if (ST[id]) return ST[id];
    var x = h('s' + id) % 100;
    if (x < rate) return ['ok', 0];
    if (rate > 0 && x < rate + 4) return ['ng', 0];
    return ['no'];
  }
  function unitProb(id) {
    var a = id.split('.').slice(1).map(Number), si = a[0], bi = a[1], ki = a[2], lv = a[3], n = a[4];
    var sj = subjects[si], u = sj.units[bi], sm = u.smalls[ki], s = SAMPLE[id] || {};
    var pool = UP[u.name] || UP['2次関数'];
    var aim = lv * 2 + 2, st = status(id, RATE[si + '.' + bi] || 0);
    var t = st[0] === 'no' ? 0 : (st[1] || aim * 60 - 90 + (h('t' + id) % 240));
    return { id: id, kind: 'u', lv: lv, n: n, t: s.t || [pool[(n - 1 + lv + ki) % pool.length]], hs: s.hs || null, ex: s.ex || null,
      units: [sj.name, u.name, sm.name], src: [sj.name + ' · ' + sm.name, '問' + n], short: sj.name + ' · ' + sm.name + ' 問' + n,
      aim: aim, st: st[0], time: t ? mss(t) : '', sample: !!SAMPLE[id], ai: !!s.ai, photo: !!s.photo };
  }

  /* 過去問（大学ごと）：id・名前・よみ・理系と文系の1年の問題数・レベルの幅 */
  var UNIV = [
    ['aoyama', '青山学院大学', 'あおやまがくいんだいがく', 4, 3, 2, 5], ['osaka', '大阪大学', 'おおさかだいがく', 5, 3, 4, 7],
    ['gakushuin', '学習院大学', 'がくしゅういんだいがく', 3, 3, 2, 5], ['kyushu', '九州大学', 'きゅうしゅうだいがく', 5, 4, 4, 7],
    ['kyoto', '京都大学', 'きょうとだいがく', 6, 5, 5, 8], ['keio', '慶應義塾大学', 'けいおうぎじゅくだいがく', 5, 4, 4, 7],
    ['chuo', '中央大学', 'ちゅうおうだいがく', 4, 3, 2, 5], ['tmd', '東京医科歯科大学', 'とうきょういかしかだいがく', 3, 0, 5, 7],
    ['titech', '東京工業大学', 'とうきょうこうぎょうだいがく', 5, 0, 5, 8], ['todai', '東京大学', 'とうきょうだいがく', 6, 4, 5, 8],
    ['tohoku', '東北大学', 'とうほくだいがく', 6, 4, 4, 7], ['nagoya', '名古屋大学', 'なごやだいがく', 4, 3, 4, 7],
    ['hitotsubashi', '一橋大学', 'ひとつばしだいがく', 0, 5, 5, 7], ['hosei', '法政大学', 'ほうせいだいがく', 3, 3, 2, 5],
    ['hokudai', '北海道大学', 'ほっかいどうだいがく', 5, 4, 4, 7], ['meiji', '明治大学', 'めいじだいがく', 4, 3, 2, 5],
    ['rikkyo', '立教大学', 'りっきょうだいがく', 4, 3, 2, 5], ['waseda', '早稲田大学', 'わせだだいがく', 5, 4, 4, 7]
  ].map(function (u) { return { id: u[0], name: u[1], yomi: u[2], ri: u[3], bun: u[4], lo: u[5], hi: u[6] }; });
  var UM = {}; UNIV.forEach(function (u) { UM[u.id] = u; });
  var YEARS = [2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016];
  var LV = { 'todai.ri.2025': [6, 5, 7, 6, 8, 7], 'todai.ri.2024': [5, 6, 7, 6, 7, 8] };
  function examIds(uid, bun, year) { var u = UM[uid], a = []; for (var n = 1; n <= u[bun]; n++) a.push(['e', uid, bun, year, n].join('.')); return a; }
  function examProb(id) {
    var a = id.split('.'), u = UM[a[1]], bun = a[2], year = +a[3], n = +a[4], s = SAMPLE[id] || {};
    var lvs = LV[u.id + '.' + bun + '.' + year], lv = lvs ? lvs[n - 1] : u.lo + (h('l' + id) % (u.hi - u.lo + 1));
    var pool = EX.filter(function (e) { return bun === 'ri' || e.bun; }), e = pool[h('p' + id) % pool.length];
    var aim = lv * 3 + 2, st = status(id, 6);
    var t = st[0] === 'no' ? 0 : (st[1] || aim * 60 - 120 + (h('t' + id) % 300)), bl = bun === 'ri' ? '理系' : '文系';
    return { id: id, kind: 'e', lv: lv, n: n, year: year, univ: u.id, bun: bun, t: s.t || e.t, hs: s.hs || null, ex: s.ex || null,
      units: s.units || e.units, src: [u.name + ' ' + year + '年 ' + bl, '第' + n + '問'], short: u.name + ' ' + year + ' ' + bl + ' 第' + n + '問',
      head: u.name + ' ' + year + ' 第' + n + '問', aim: aim, st: st[0], time: t ? mss(t) : '', sample: !!SAMPLE[id], ai: !!s.ai, photo: !!s.photo };
  }
  var cache = {};
  function prob(id) { return cache[id] || (cache[id] = id.charAt(0) === 'u' ? unitProb(id) : examProb(id)); }
  function sum(ids) { var ok = 0, ng = 0; ids.forEach(function (i) { var q = prob(i); if (q.st === 'ok') ok++; else if (q.st === 'ng') ng++; }); return { total: ids.length, ok: ok, ng: ng }; }
  function smallAll(si, bi, ki) { var a = []; smallLevels(si, bi, ki).forEach(function (lv) { a = a.concat(unitIds(si, bi, ki, lv)); }); return a; }
  function bigAll(si, bi) { var a = []; subjects[si].units[bi].smalls.forEach(function (s, ki) { a = a.concat(smallAll(si, bi, ki)); }); return a; }
  function univAll(uid, bun) { var a = []; YEARS.forEach(function (y) { a = a.concat(examIds(uid, bun, y)); }); return a; }

  return {
    subjects: subjects, univs: UNIV, years: YEARS, prob: prob, sum: sum,
    smallLevels: smallLevels, unitIds: unitIds, smallAll: smallAll, bigAll: bigAll,
    examIds: examIds, univAll: univAll, univ: function (id) { return UM[id]; },
    univsFor: function (bun) { return UNIV.filter(function (u) { return u[bun] > 0; }); },
    /* 復習（仮）：まちがえた問題 */
    review: function () {
      var a = [];
      subjects[0].units[2].smalls.forEach(function (s, ki) { a = a.concat(smallAll(0, 2, ki)); });
      a = a.concat(univAll('todai', 'ri'), univAll('kyoto', 'ri'));
      return a.filter(function (i) { return prob(i).st === 'ng'; }).slice(0, 8);
    },
    /* 記録（仮）：科目ごとの正解の数 */
    record: function () {
      return subjects.map(function (sj, si) { var ids = []; sj.units.forEach(function (u, bi) { ids = ids.concat(bigAll(si, bi)); }); var s = sum(ids); s.name = sj.name; return s; });
    }
  };
})();
