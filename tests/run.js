// node tests/run.js   ->  ok: N checks
const F = require('../forever.js'), fs = require('fs'), path = require('path');
let n = 0, bad = 0;
function is(got, want, label) { n++; if (got !== want) { bad++; console.log('FAIL ' + label + '\n   got : ' + JSON.stringify(got) + '\n   want: ' + JSON.stringify(want)); } }
function has(got, part, label) { n++; if (!String(got).includes(part)) { bad++; console.log('FAIL ' + label + '\n   got : ' + JSON.stringify(got) + '\n   want it to include: ' + part); } }
const out = (src) => F.text(src);
const ex = (f) => out(fs.readFileSync(path.join(__dirname, '..', 'examples', f), 'utf8'));

// ── the five programs CH was shown, word for word
is(ex('own_square.txt'), '…918212890625\nyes  (proved)', 'ex1');
is(ex('minus_one.txt'), '…999999999999  (this is -1)\n0', 'ex2');
is(ex('one_third.txt'), '…666666666667  (this is 1/3)\n1', 'ex3');
is(ex('past_forever.txt'), 'forever + 1\nforever × 2', 'ex4');
is(ex('search.txt'), "no  (proved)\ncan't see the end", 'ex5');

// ── digits checked against plain big-number arithmetic done a different way
function powmod(b, e, m) { let r = 1n; b %= m; while (e > 0n) { if (e & 1n) r = r * b % m; b = b * b % m; e >>= 1n; } return r; }
const pad = (x, k) => '…' + String(x).padStart(k, '0');
is(out('x = 5\nforever: x = x × x\nshow 80 digits of x'), pad(powmod(5n, 2n ** 400n, 10n ** 80n), 80), 'own square from 5, 80 digits');
is(out('x = 6\nforever: x = x × x\nshow x'), 'never settles', '6 squared forever does NOT settle (its last two digits go 36, 96, 16, 56)');
{ // the twin of the own-square number, reached by a better rule
  const m = 10n ** 60n, e = powmod(5n, 2n ** 400n, m), twin = ((1n - e) % m + m) % m;
  is(out('x = 6\nforever: x = 3 × x × x − 2 × x × x × x\nshow 60 digits of x\nshow x × x = x'), pad(twin, 60) + '\nyes  (proved)', 'the twin, from 6');
  is(out('x = 5\nforever: x = 3 × x × x − 2 × x × x × x\nshow 60 digits of x\nshow x × x = x'), pad(e, 60) + '\nyes  (proved)', 'the same rule from 5');
}
is(out('x = 25\nforever: x = x × x\nshow 30 digits of x'), pad(powmod(5n, 2n ** 400n, 10n ** 30n), 30), 'from 25 lands on the same number');
{ // 1/7 by a loop: x = x × (2 − 7x), start 3 (7×3 = 21)
  const m = 10n ** 50n; let inv = 1n; for (let i = 0n; i < m; i++) { if ((7n * i) % 10n === 1n) { inv = i; break; } }
  let x = 3n; for (let i = 0; i < 60; i++) x = ((x * (2n - 7n * x)) % m + m) % m;
  is((x * 7n) % m, 1n, 'self-check of the checker');
  is(out('x = 3\nforever: x = x × (2 − 7 × x)\nshow 50 digits of x'), pad(x, 50) + '  (this is 1/7)', '1/7 by a loop');
}
{ // sum of all factorials 1! + 2! + 3! + ...
  const m = 10n ** 40n; let s = 0n, f = 1n; for (let k = 1n; k <= 400n; k++) { f = f * k % m; s = (s + f) % m; }
  is(out('n = 0  f = 1  s = 0\nforever: n = n + 1   f = f × n   s = s + f\nshow f\nshow 40 digits of s'), '0\n' + pad(s, 40), 'factorials go to 0, their sum settles');
}
{ // two names feeding each other
  const e = powmod(5n, 2n ** 400n, 10n ** 30n);
  is(out('a = 5  b = 5\nforever: t = a   a = b × b   b = t × t\nshow 30 digits of a'), pad(e, 30), 'a pair that pull each other in');
}

// ── things that settle, exactly
is(out('x = 10\nforever: x = x × x\nshow x'), '0', '10 squared forever is 0');
is(out('x = 1\nforever: x = x × x\nshow x'), '1', '1 stays 1');
is(out('x = 0  p = 1\nforever: x = x + p   p = p × 10\nshow x\nshow x × 9 + 1'), '…111111111111  (this is -1/9)\n0', 'ones forever is -1/9');
is(out('x = 1  p = 1\nforever: p = p × 10   x = x + 3 × p × p\nshow x'), '…030303030301  (this is -67/33)', 'geometric with squares, later order');
is(out('x = 3\nforever: x = 10 × x + 3\nshow x\nshow x × 3'), '…333333333333  (this is -1/3)\n…999999999999  (this is -1)', 'threes forever');
is(out('x = 7\nforever: x = x mod 5\nshow x'), '2', 'settles by standing still');
is(out('x = 5\nforever: x = x × x\ny = x × 2\nshow y = x + x\nshow x × x × x = x\nshow x = 5\nshow (1 − x) × (1 − x) = 1 − x\nshow x × (1 − x)'), 'yes  (proved)\nyes  (proved)\nno  (proved)\nyes  (proved)\n0', 'algebra with the endless number');
is(out('x = 5  y = 0\nforever: x = x × x   y = x + 1\nshow y × y = 3 × y − 2'), 'yes  (proved)', 'a name remade from a settling one');

is(out('a = 5\nforever: a = a × a\nb = 6\nforever: b = 3 × b × b − 2 × b × b × b\nshow a + b\nshow a × b\nshow b = 1 − a'), '1\n0\nyes  (proved)', 'the twins add to 1 and multiply to 0');
is(out('a = 5\nforever: a = a × a\nb = 25\nforever: b = b × b\nshow a = b'), 'yes  (proved)', 'two loops landing on the same endless number');

// ── sums it works out exactly by finding what stays the same on every step
is(out('n = 0  f = 1  s = 0\nforever: n = n + 1   f = f × n   s = s + n × f\nshow s'), '…999999999999  (this is -1)', '1×1! + 2×2! + 3×3! + … = −1');
is(out('n = 0  f = 1  s = 0\nforever: s = s + (n × n + 1) × f   n = n + 1   f = f × n\nshow s'), '1', 'sum of (k²+1)×k! = 1');
is(out('n = 0  f = 1  s = 0\nforever: s = s + (n^3 − 4 × n + 1) × f   n = n + 1   f = f × n × n\nshow s'), '3', 'sum of (k³−4k+1)×(k!)² = 3');
is(out('n = 0  f = 1  s = 0\nforever: s = s + (n^4 + 10 × n − 3) × f   n = n + 1   f = f × n × n\nshow s'), '…999999999993  (this is -7)', 'sum of (k⁴+10k−3)×(k!)² = −7');
is(out('n = 0  f = 1  s = 0\nforever: s = s + (n^5 − 29 × n + 7) × f   n = n + 1   f = f × n × n\nshow s'), '18', 'sum of (k⁵−29k+7)×(k!)² = 18');
is(out('n = 0  f = 1  s = 0\nforever: s = s + (n^3 − 4 × n + 2) × f   n = n + 1   f = f × n × n\nshow s'), '…517069851821', 'one off, and it is no longer a whole number');
{ // the same three facts in plain whole numbers: the sum up to N is the answer plus a multiple of (N!)²
  const fact = (k) => { let r = 1n; for (let i = 2n; i <= k; i++) r *= i; return r; };
  for (const [P, val] of [[(k) => k ** 3n - 4n * k + 1n, 3n], [(k) => k ** 4n + 10n * k - 3n, -7n], [(k) => k ** 5n - 29n * k + 7n, 18n]]) {
    let s = 0n, good = true;
    for (let N = 1n; N <= 40n; N++) { s += P(N - 1n) * fact(N - 1n) ** 2n; if ((s - val) % (fact(N) ** 2n) !== 0n) good = false; }
    is(good, true, 'plain-number check of an exact sum');
  }
}
{ const m = 10n ** 40n; let p = 1n, f = 1n; for (let k = 1n; k <= 400n; k++) { f = f * k % m; p = p * (1n + f) % m; }
  is(out('n = 0  f = 1  p = 1\nforever: n = n + 1   f = f × n   p = p × (1 + f)\nshow 40 digits of p'), pad(p, 40), 'an endless product'); }
is(out('x = 2\nforever: x = x^5\nshow x^5 = x\ny = x^4\nshow y × y = y'), 'yes  (proved)\nyes  (proved)', 'fifth powers from 2');
is(out('x = 3\nforever: x = x^5\nshow x'), 'never settles', 'fifth powers from 3 only look settled for 4 digits');
has(F.text('x = 3\nforever: x = x^5\nshow x', { why: true }), 'the last 5 digits of x go round 85443, 35443', 'fifth powers from 3: the reason');
is(out('show 2^10\nshow (1 + 2)^3'), '1024\n27', 'powers');

// ── looking deeper at loops that go round: rings and liars
has(F.text('x = 0\nforever: x = x × x + 1\nwhy x'), 'going round a ring of 6 endless numbers', 'square and add 1: a ring of six');
has(F.text('x = 0\nforever: x = x × x + 6\nwhy x'), 'going round a ring of 3 endless numbers', 'square and add 6: a ring of three');
has(F.text('x = 0\nforever: x = x × x + 14557\nwhy x'), 'take 2, 2, 2, 2, 2, 2, 8, 8, 40, 200, 1000, 5000 steps', 'a liar: calm for 6 digits, then it breaks');
has(F.text('x = 0\nforever: x = x × x + 7\nwhy x'), 'take 2, 2, 8, 8, 40, 200, 1000, 5000 steps', 'square and add 7');
{ // brute force: steps for the last k digits of x = x² + c to come round, starting from 0
  const per = (c, k) => { const m = 10n ** BigInt(k); let x = 0n, i = 0; const seen = new Map(); while (!seen.has(x)) { seen.set(x, i++); x = (x * x + c) % m; } return i - seen.get(x); };
  is([1, 2, 3, 4, 5, 6, 7, 8, 9].map((k) => per(14557n, k)).join(', '), '2, 2, 2, 2, 2, 2, 8, 8, 40', 'brute-force check of the liar 14557');
  is([1, 2, 3, 4, 5, 6].map((k) => per(1n, k)).join(', '), '6, 6, 6, 6, 6, 6', 'brute-force check of the ring of six');
}

// ── things proved to never settle
is(out('x = 2\nforever: x = x × x\nshow x'), 'never settles', '2 squared forever');
has(F.text('x = 2\nforever: x = x × x\nshow x', { why: true }), 'the last 2 digits of x go round 16, 56, 36, 96 every 4 steps', '2 squared: the reason');
is(out('x = 3\nforever: x = x × x\nshow x'), 'never settles', '3 squared forever');
is(out('n = 0\nforever: n = n + 1\nshow n\nshow n + 1'), 'never settles\nnever settles', 'a plain counter never settles, and that spreads');
is(out('lamp = no\nforever: lamp = not lamp\nshow lamp'), 'never settles', "Thomson's lamp");
is(out('x = 27  found = no\nforever:\n    if x is even: x = x / 2\n    else: x = 3 × x + 1\n    if x = 1: found = yes\nshow found\nshow x'), 'yes  (proved)\nnever settles', 'Collatz from 27 reaches 1 and then goes round');
has(F.text('x = 27\nforever:\n    if x is even: x = x / 2\n    else: x = 3 × x + 1\nshow x', { why: true }), 'x goes round 4, 2, 1 without end', 'Collatz: the reason');
is(out('x = 0  s = 1\nforever: x = x + s   s = s × 3\nshow x'), 'never settles', 'adding powers of 3');

// ── counting past forever
is(out('show 1 + forever = forever\nshow forever + 1 = forever\nshow forever + 1 > forever\nshow 2 × forever = forever\nshow forever × 2 = forever'), 'yes\nno\nyes\nyes\nno', 'order of adding matters past forever');
is(out('count n = 0\nforever:\n    forever: n = n + 1\nshow n'), 'forever × forever', 'forever inside forever');
is(out('count n = 0\nforever:\n    forever: n = n + 1\n    n = n + 5\nshow n\nn = n + 3\nforever: n = n + 2\nshow n'), 'forever × forever\nforever × forever + forever', 'a finite step is swallowed');
is(out('count n = 7\nforever: n = n + 3\nshow n\nshow n × 2\nshow n × forever\nshow (n + 4) × 3'), 'forever\nforever × 2\nforever × forever\nforever × 3 + 4', 'count arithmetic');
is(out('count n = forever\nshow n − 1'), 'stopped: there is no step just before forever, so that cannot be taken away', 'no step before forever');
is(out('count hits = 0  n = 0\nforever: n = n + 1   if n × n ends in 9: hits = hits + 1\nshow hits'), 'forever', 'squares ending in 9: without end');
is(out('count hits = 0  n = 0\nforever: n = n + 1   if n × n ends in 7: hits = hits + 1\nshow hits'), '0', 'squares ending in 7: none');
is(out('count hits = 0  x = 3\nforever:\n    if x ends in 3: hits = hits + 1\n    x = x × 10\nshow hits\nshow x'), '1\n0', 'happens once, block form');

// ── searches that run forever
is(out('found = no  n = 0\nforever: n = n + 1   if n × n = 2: found = yes\nshow found'), 'no  (proved)', 'no whole number squares to 2');
is(out('found = no  n = 0\nforever: n = n + 1   if n × n = 49: found = yes\nshow found'), 'yes  (found at step 7)', 'found by looking');
is(out('found = no  p = 1\nforever: p = p × 2   if p ends in 3: found = yes\nshow found'), 'no  (proved)', 'no power of 2 ends in 3');
is(out('found = no  p = 1\nforever: p = p × 2   if p ends in 2024: found = yes\nshow found'), 'no  (proved)', 'no power of 2 ends in 2024');
is(out('found = no  p = 1\nforever: p = p × 2   if p ends in 736: found = yes\nshow found'), 'yes  (found at step 36)', 'a power of 2 ending in 736');
is(out('found = no  p = 1\nforever: p = p × 7   if p ends in 99999: found = yes\nshow found'), 'no  (proved)', 'powers of 7');
is(out('found = no  a = 1  b = 1\nforever: t = a + b   a = b   b = t   if b × b = 2 × a × a + 7: found = yes\nshow found'), 'yes  (found at step 3)', 'found among Fibonacci numbers');
is(out('found = no  n = 0\nforever: n = n + 1   if (n × n − 13) × (n × n − 17) × (n × n − 221) = 0: found = yes\nshow found'), "can't see the end", 'honest when it cannot tell (this one has a match on every clock but none in whole numbers)');

// ── after a loop it could not see through
is(out('x = 196\nforever: x = x + backwards(x)\nshow x\nshow x + 1\nshow x = 5'), "can't see the end\ncan't see the end\ncan't see the end", 'the unseen spreads');
is(out('x = 196\nforever: x = x + backwards(x)\ny = 0\nforever: y = y + x\nshow y'), "can't see the end", 'a loop leaning on the unseen');

// ── plain arithmetic
is(out('show 2 + 3 × 4\nshow (2 + 3) × 4\nshow 7 − 10\nshow 1 / 3\nshow 1 / 3 + 2 / 3\nshow 10 / 2\nshow 17 mod 5'), '14\n20\n…999999999997  (this is -3)\n…666666666667  (this is 1/3)\n1\n5\n2', 'sums');
is(out('show 1 / 2'), 'stopped: 2 does not go into 1. Here you can divide by anything except what has a 2 or a 5 left over underneath', '1/2 does not exist here');
is(out('x = 5\nforever: x = x × x\nshow x < 3'), 'stopped: endless numbers have no bigger or smaller, only the same or different', 'no order on endless numbers');
is(out('show y'), 'stopped: line 1: y has no value yet', 'unknown name');
is(out('x = 3\nrepeat 4: x = x × x\nshow x\nshow backwards(1230)\nshow 12321 is a palindrome'), '43046721\n321\nyes', 'repeat and helpers');
// towers on 2, 5, 10 … (a fresh Claude Opus agent found x = 2 ^ x, GitHub Copilot found x = 10 ^ x, 2026-11-18).
// The 30 digits were worked out separately with Euler's theorem in Python.
is(out('x = 0\nforever: x = 2 ^ x\nshow 30 digits of x\nshow 2 ^ x = x'), '…159853338098615075353432948736\nyes  (proved)', 'tower of 2s settles');
is(out('x = 0\nforever: x = 5 ^ x\nshow 30 digits of x'), '…159083587117493152618408203125', 'tower of 5s settles');
is(out('x = 3\nforever: x = 12 ^ x\nshow 30 digits of x'), '…359135848584931714421454012416', 'tower of 12s settles');
is(out('x = 0\nforever: x = 10 ^ x\nshow x'), '…000000000000', 'tower of 10s settles on 0');
is(out('x = 0\nforever: x = 2 ^ x\nshow 2 ^ (x + 1)').startsWith('stopped: a power with an endless'), true, 'a 2 on the bottom still needs a top known to be huge');
is(out('x = -3\nforever: x = 2 ^ x\nshow x').startsWith('stopped'), true, 'a tower of 2s from a minus number is refused');
// two Opus agents (2026-11-18): c = 5^45 − 2 is calm for 46 digits, so the hunt shows ring of 2 though it goes wild
// at digit 47. The label stays (it is what the hunt saw), but its why must not call it a proof.
{ const h = F.text('hunt c from 0 to 9:\n    x = 0\n    forever: x = x × x + c\n    show x', { why: true });
  is(/ring of N: that means every digit I looked at, 40 deep, came round every N steps, which is what I saw, not a proof/.test(h), true, 'a hunt says its rings are not proofs'); }
// a ring is proved to keep its length when the step's slopes round its last digit's ring multiply to a number ending
// in 0 (the contraction rule, run on the whole ring). It must fire for x × x + 1, and never for the liar 5^45 − 2
// (slopes 2 × 7 × 2 × 2: no 0), nor for a loop that leans on another restless name.
has(F.text('x = 0\nforever: x = x × x + 1\nwhy x'), 'And that is proved: the slopes of the step at 0, 1, 2, 5, 6, 7 multiply to a number ending in 0', 'a ring through a flat spot is proved');
{ const t = F.text('x = 0\nforever: x = x × x + ' + (5n ** 45n - 2n) + '\nwhy x');
  is(/As far as I can see, x is going round a ring of 2/.test(t) && !/proved/.test(t), true, 'the liar 5^45 - 2 keeps "as far as I can see"'); }
{ const t = F.text('x = 0\ny = 0\nforever:\n  y = 4 - y\n  x = x × x + y\nwhy x');
  is(/As far as I can see/.test(t) && !/proved/.test(t), true, 'a ring that leans on another restless name is not proved'); }
{ // every proved ring, checked by brute force on its last 1, 5, 20 and 60 digits
  const per = (f, m) => { const seen = new Map(); let x = 0n, k = 0; while (!seen.has(x)) { seen.set(x, k); x = ((f(x) % m) + m) % m; k++; } return k - seen.get(x); };
  let proved = 0, wrong = [];
  for (const p of [2, 3, 4, 5]) for (let c = -20; c <= 60; c++) {
    const m = /ring of (\d+) endless numbers forever/.exec(F.text('x = 0\nforever: x = ' + Array(p).fill('x').join(' × ') + (c < 0 ? ' - ' + -c : ' + ' + c) + '\nwhy x'));
    if (!m) continue; proved++;
    for (const j of [1, 5, 20, 60]) if (per((x) => x ** BigInt(p) + BigInt(c), 10n ** BigInt(j)) !== +m[1]) { wrong.push(p + ',' + c + ' at ' + j); break; }
  }
  is(proved > 100 && wrong.length === 0, true, 'proved rings hold on 60 digits (' + proved + ' proved, wrong: ' + wrong.join('; ') + ')');
}
// Copilot (2026-11-19): y = 2 × x − y with x a settled endless number comes back to y every 2 steps, exactly, but
// the ring proof only took fixed whole numbers. It now takes settled names too, and proves rings that come back
// exactly (checked as algebra), in separate loops or the same one. x − 3 × y (Copilot's second probe) goes wild.
has(F.text('x = 5\nforever: x = x × x\ny = 1\nforever: y = 2 × x - y\nwhy y'), 'And that is proved: doing the step 2 times in a row gives back exactly y', 'a ring that comes back exactly, leaning on a settled endless number');
has(F.text('x = 5\ny = 1\nforever:\n  x = x × x\n  y = 2 × x - y\nwhy y'), 'And that is proved: doing the step 2 times in a row gives back exactly y', 'the same, with x settling in the same loop');
has(F.text('x = 5\nforever: x = x × x\ny = 0\nforever: y = y × y + x\nwhy y'), 'And that is proved: the slopes of the step at 0, 5 multiply to a number ending in 0', 'slopes, with a settled endless number in the step');
{ const t = F.text('x = 5\nforever: x = x × x\ny = 1\nforever:\n  y = 3 × y + x\n  y = 2 × x - y\nwhy y');
  is(/take 4, 20, 200, 2000/.test(t) && !/proved/.test(t), true, 'x − 3 × y goes wild, and nothing is called proved'); }
// Copilot (2026-11-19): a branch test with and, or or not got no answer. Each part reads only last digits, so the
// whole test does too.
is(out('x = 10\nforever:\n  if x is even and x ends in 0: x = x × x\nshow x'), '0', 'and in a branch test');
is(out('x = 10\nforever:\n  if x is even or x ends in 3: x = x × x\nshow x'), '0', 'or in a branch test');
is(out('x = 3\nforever:\n  if not x is even: x = x + 1\nshow x'), '4', 'not in a branch test');
is(out('x = 7\nforever:\n  if x ends in 7 or x ends in 1: x = 3 × x\n  else: x = x + 1\nshow x'), 'never settles', 'or with else: a ring of 6 on the last digit');
// the checker's two-name sweep (2026-11-19): x = 5 + 10 × y + 2 × y × y, with y the endless root of y = 5 + 10 × y × y,
// is 4 + 51 × y / 5 by y's own rule: a 5 underneath, so its digits came out empty and the run crashed. Checked
// against plain iteration.
is(out('x = 8\ny = (0 − 9)\nforever:\n  x = 5 + 10 × y + 2 × y × y\n  y = 5 + 10 × y × y\nshow 30 digits of x'), '…411752665613729308205119632605', 'a 5 underneath that cancels: no crash');
is(out('x = 1\ny = (0 − 5)\nforever:\n  x = (0 − 9) + (0 − 1) × y + (0 − 10) × y × y\n  y = 5 + (0 − 10) × x + 4 × y × y\nshow 30 digits of x'), '…137439875059769145678143241596', 'the same crash, in a loop where y reads x');
// blind breaker agents (2026-11-19). 1: a = a × a after forever doubles the power of forever every step; at 2^1024
// it became forever^Infinity, Infinity × 2 = Infinity looked like a loop at rest, and a = b said yes. The top of
// that climb is forever ^ forever, which the language can't write: it must say so, never print Infinity.
{ const t = out('count a = 0\nforever: a = a + 1\nforever: a = a × a\nshow a\ncount b = a\nforever: b = b × b\nshow a = b');
  is(t.includes('Infinity') || t.includes('yes'), false, 'a count whose power of forever keeps doubling is not called settled: ' + t); }
has(F.text('count a = 0\nforever: a = a + 1\nforever: a = a × a\nwhy a'), 'the top of that climb is forever ^ forever', 'and it says why');
is(out('count a = 0\nforever: a = a + 1\nrepeat 10: a = a × a\nshow a'), 'forever^1024', 'a power of forever that fits is still exact');
is(out('count a = 0\nforever: a = a + 1\nrepeat 1100: a = a × a\nshow a').startsWith('stopped: a count past forever got a power of forever too big'), true, 'outside a forever loop it stops with a clear message');
// 2: a flag first set inside the loop (no value before it) crashed the watcher.
is(out('n = 0\nforever:\n  n = n + 1\n  if n ends in 7: found = yes\nshow found'), 'yes  (found at step 7)', 'a flag with no start value, set inside the loop');
// Copilot (2026-11-18): c = 8 looks settled in its last digit (0, 8, 2, 2…) but its last 2 digits go round 72, 92.
is(out('x = 0\nforever: x = x × x + 8\nshow x'), 'never settles', 'x × x + 8 is not fooled by its calm last digit');
// Copilot (2026-11-18): repeat 10 ^ 64 had no time limit and froze the page. It now stops with a clear message.
is(/^stopped: line 2: repeat ran out of time after \d+ rounds\. To loop forever, write forever:$/m.test(F.text('x = 0\nrepeat 3000000: x = x + 1\nshow x', { repeatMs: 1 })), true, 'repeat stops when it runs out of time');
is(F.text('x = 0\nrepeat 1000: x = x + 1\nshow x', { repeatMs: 1000 }), '1000', 'a short repeat still finishes');
is(out('a = 4\nif a is even: show 1\nelse: show 2\nif a is odd: show 1 else: show 2'), '1\n2', 'if and else');
is(out('n = 0\nforever: n = n + 1   show n'), '1\n2\n3\n4\n… and so on, forever', 'show inside forever');

// ── random loops: every "settled" and every "never settles" is checked by brute force
{
  let seed = 12345; const rnd = (k) => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed % k; };
  let settled = 0, restless = 0, unseen = 0;
  for (let trial = 0; trial < 400; trial++) {
    const f = trial % 2 ? 1 : [5, 10, 2][rnd(3)];
    const a = (rnd(21) - 10) * f, b = (rnd(21) - 10) * f, c = rnd(21) - 10, x0 = rnd(40) - 10;
    const src = 'x = ' + (x0 < 0 ? '0 − ' + -x0 : x0) + '\nforever: x = ' + (a < 0 ? '0 − ' + -a : a) + ' × x × x + ' + (b < 0 ? '0 − ' + -b : b) + ' × x + ' + (c < 0 ? '0 − ' + -c : c) + '\nshow 25 digits of x';
    const got = out(src).split('  (')[0];
    const m = 10n ** 25n; let x = BigInt(x0); const tail = [];
    for (let i = 0; i < 700; i++) { x = (((BigInt(a) * x * x + BigInt(b) * x + BigInt(c)) % m) + m) % m; if (i >= 600) tail.push(x); }
    const still = tail.every((t) => t === tail[0]);
    if (got === 'never settles') { restless++; n++; if (still) { bad++; console.log('FAIL said never settles but brute force settles:\n' + src); } }
    else if (got === "can't see the end") unseen++;
    else {
      settled++; n++;
      const want = /^\d+$/.test(got) ? got : null;
      const brute = pad(tail[0], 25);
      if (!still || (want === null ? got !== brute : BigInt(want) % m !== tail[0])) { bad++; console.log('FAIL settled value wrong:\n' + src + '\n got ' + got + '\n brute ' + brute + ' still=' + still); }
    }
  }
  n++; if (settled < 40 || restless < 40) { bad++; console.log('FAIL random loops too one-sided: settled ' + settled + ', restless ' + restless + ', unseen ' + unseen); }
  console.log('random loops: ' + settled + ' settled, ' + restless + ' never settle, ' + unseen + " can't see the end (all settled / never-settles answers brute-force checked)");
}

// ── hunt: one line tries a whole range and sorts the answers
{
  const H = (body, lo = 0, hi = 99) => 'hunt c from ' + lo + ' to ' + hi + ':\n    ' + body.split('\n').join('\n    ');
  is(out(H('x = 0\nforever: x = x × x + c\nshow x')),
    'hunt c from 0 to 99: tried 100 numbers, 5 kinds of answer\n' +
    '  settles     10   0, 10, 20, 30, 40, 50, 60, 70, …\n' +
    '  ring of 6   10   1, 11, 21, 31, 41, 51, 61, 71, …\n' +
    '  goes wild   40   2, 3, 7, 8, 12, 13, 17, 18, …\n' +
    '  ring of 2   30   4, 5, 9, 14, 15, 19, 24, 25, …\n' +
    '  ring of 3   10   6, 16, 26, 36, 46, 56, 66, 76, …', 'hunt: liar loops sort by last digit');
  // every square checked one by one against the same program written without hunt
  const r = F.run(H('x = 0\nforever: x = x × x + c\nshow x', 0, 59)), items = r.lines[0].hunt.items;
  is(items.length, 60, 'hunt: one item per number');
  for (const it of items) {
    const single = F.run('x = 0\nforever: x = x × x + ' + it.c + '\nshow x').lines[0];
    const kind = single.text === 'never settles' ? (/ring of (\d+)/.test(single.why) ? 'ring of ' + single.why.match(/ring of (\d+)/)[1] : /take [\d, ]+ steps/.test(single.why) ? 'goes wild' : 'never settles') : "can't see the end" === single.text ? "can't see the end" : 'settles';
    is(it.group, kind, 'hunt agrees with the single loop for c = ' + it.c);
    if (it.value !== undefined) is(it.value, single.text, 'hunt value for c = ' + it.c);
  }
  // yes / no answers, and names from outside the hunt
  is(out('k = 3\nhunt c from 1 to 6:\n    show c × k ends in 2'), 'hunt c from 1 to 6: tried 6 numbers, 2 kinds of answer\n  no   5   1, 2, 3, 5, 6\n  yes  1   4', 'hunt: yes/no and an outside name');
  // the hunt leaves nothing behind
  is(out('x = 7\nhunt c from 0 to 3:\n    x = c\n    show x\nshow x'), 'hunt c from 0 to 3: tried 4 numbers, 1 kind of answer\n  settles  4   0, 1, 2, 3\n7', 'hunt: names inside do not leak out');
  has(out('hunt c from 0 to 3:\n    x = c'), 'a hunt needs a show line inside it', 'hunt: needs a show');
  has(out('hunt c from 5 to 3:\n    show c'), 'at least as big', 'hunt: backwards range');
  has(out('hunt c from 0 to 5000:\n    show c'), 'at most 2000', 'hunt: range cap');
  has(out('hunt c from 0 to 3:\n    show c +'), 'line 2', 'hunt: a typo is still a typo');
  has(F.text(H('x = c + 89\nforever: x = x + backwards(x)\nshow x', 0, 50), { huntMs: 300 }), 'ran out of time after c = ', 'hunt: time budget');
  is(out('hunt c from 1 to 3: show c × c'), 'hunt c from 1 to 3: tried 3 numbers, 1 kind of answer\n  settles  3   1, 2, 3', 'hunt on one line');
  // the dividing hunt: 1/3 when c ends in 7, and a half-and-third mix when c is even
  const t = F.run(H('x = c\nforever: x = x × (2 − 3 × x)\nshow x', 0, 99)).lines[0].hunt;
  is(t.items.filter((x) => x.group === 'settles').map((x) => Number(x.c) % 10).every((d) => d === 0 || d === 2 || d === 7), true, 'hunt thirds: settles only for c ending in 0, 2 or 7');
  is(t.items.find((x) => x.c === '7').value, '…666666666667  (this is 1/3)', 'hunt thirds: 7 lands on 1/3');
}

// ── hunt ... ends in: look only at numbers ending in some digits (the zoom)
{
  const r = F.run('hunt c from 0 to 9 ends in 57:\n    show c'), h = r.lines[0].hunt;
  is(h.items.map((x) => x.c).join(','), '57,157,257,357,457,557,657,757,857,957', 'ends in: the numbers tried');
  is(r.lines[0].text.split('\n')[0], 'hunt c from 0 to 9 ends in 57: tried 10 numbers, 1 kind of answer', 'ends in: head line');
  is(F.run('hunt c from 0 to 2 ends in 007:\n    show c').lines[0].hunt.items.map((x) => x.c).join(','), '7,1007,2007', 'ends in: leading zeros count');
  is(out('show 57 ends in 7'), 'yes', 'ends in still works as a test');
  const z = F.run('hunt c from 0 to 99 ends in 557:\n    x = 0\n    forever: x = x × x + c\n    show x').lines[0].hunt.items;
  const tame = (it) => { let t = 0; while (t < it.wild.length && it.wild[t] === it.wild[0]) t++; return t; };
  const best = z.filter((x) => x.wild).sort((a, b) => tame(b) - tame(a))[0];
  is(best.c + ':' + tame(best), '14557:6', 'zooming on ...557 finds the record liar 14557');
}

// ── looking deeper goes 40 digits, not 9: a 10-digit liar is not mistaken for a ring (CH found this by zooming)
{
  const w = F.run('x = 0\nforever: x = x × x + 406530182\nshow x').lines[0].why;
  has(w, 'take 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 8, 8, 40', '406530182 keeps a ring for 10 digits, then goes wild');
  const h = F.run('hunt c from 0 to 99 ends in 6530182:\n    x = 0\n    forever: x = x × x + c\n    show x').lines[0].hunt;
  is(h.groups.map((g) => g.label + ' ' + g.count).join(', '), 'goes wild 100', 'the zoomed view ending in 6530182 has no fake rings');
  has(F.run('x = 0\nforever: x = x × x + 1\nshow x').lines[0].why, 'the last 1 to 40 digits all come round every 6 steps', 'a true ring is checked 40 digits deep');
}

// ── Break it #1 (Leo AI): a loop that starts on its own answer settles at once, proved by the rule, not digits
{
  const E = 'e = 5\nforever: e = e × e\nf = 1 - e\n';
  is(out(E + 'y = f\nforever: y = y × y\nshow y'), '…081787109376', "squaring the 6-twin forever settles (it is already its own square)");
  has(F.run(E + 'y = f\nforever: y = y × y\nshow y').lines[0].why, 'gives back exactly what it started with', 'and it says why');
  is(out(E + 'y = e\nforever: y = y × y\nshow y'), '…918212890625', 'same for the 5-twin');
  is(out(E + 'r = e - f\nforever: r = r × r × r\nshow r'), '…836425781249', 'the odd square root of 1 is still under cubing');
  is(out(E + 'r = e - f\nforever: r = r × r\nshow r'), '1', 'squaring the odd square root of 1 settles on 1 after one step');
  is(out(E + 'a = e\nb = f\nforever: t = a   a = b   b = t\nshow a'), 'never settles', 'swapping the twins forever never settles');
  is(out(E + 'y = e + 1\nforever: y = y × y\nshow y'), "can't see the end", 'a start that is not at rest is not claimed');
  is(out(E + 'y = e\nforever: show y   y = y × y').split('\n')[1], '… and so on, forever', 'a show inside still prints');
}

// ── Break it #2 (GPT Luna): a big number can hide what happens past 40 digits, so look as deep as the loop's own numbers
{
  const M = '1' + '0'.repeat(40);
  const r = F.run('M = ' + M + '\nx = 0\nforever: x = (M + 1) × x + M\nshow x').lines[0];
  is(r.text, 'never settles', "Luna's loop: the 41st digit goes round, so it never settles");
  has(r.why, 'the last 40 digits of x stay put, but the digit to their left goes round 0, 1, 2, 3, 4, 5, 6, 7, 8, 9', 'and it names the digit that moves');
  is(out('M = ' + M + '\nx = 1 + M\nforever: x = x × x\nshow x'), 'never settles', '1 + M squared forever: digit 41 goes 2, 4, 8, 6');
  is(out('M = ' + M + M + '\nx = 0\nforever: x = (M + 1) × x + M\nshow x'), 'never settles', 'the same trick 81 digits deep');
  is(out('M = ' + M + '\nx = 0\nforever: x = M × x + 1\nshow x').split('  ')[0], '…000000000001', 'a big multiplier that pulls digits together still settles');
}

// ── a straight-line loop that settles shows its exact fraction, like a one-name loop does (Luna test 5)
is(out('x = 0\ny = 0\nforever: t = x   x = y   y = 10 × t + 1\nshow x\nshow y'), '…111111111111  (this is -1/9)\n…111111111111  (this is -1/9)', 'two names passing a number back and forth settle on exactly -1/9');
is(out('x = 1\ny = 2\nforever: x = 10 × y + 3   y = 20 × x + 7\nshow x'), '…' + (() => { const m = 10n ** 12n; let x = 1n, y = 2n; for (let i = 0; i < 200; i++) { x = (10n * y + 3n) % m; y = (20n * x + 7n) % m; } return String(x).padStart(12, '0'); })() + '  (this is -73/199)', 'a coupled pair names its fraction');

// ── Gemma's probe: a decimal point gets a clear answer, not a crash or a rounded guess
is(out('x = 1\nforever: x = x + 0.1\nshow x'), 'stopped: line 2: there are no decimal points here. Numbers grow to the left, not the right, so 0.1 would be 1 ÷ 10, and nothing here can be divided by 10 (it has a 2 and a 5 in it). Try 1 / 3 or 1 / 7 instead', '0.1 is explained');

// ── towers: a number on top of a power.  3 ^ 3 ^ 3 ^ … forever is where Graham's number gets its last digits
{
  // checked a different way: the tower one floor at a time, each floor worked out on the last 70 digits, using that
  // 3 ^ (4 × 5^69 × 2^68) = 1 on the last 70 digits (Carmichael), which this test checks first
  const m = 10n ** 70n, lam = 4n * 5n ** 69n * 2n ** 68n / 4n;
  is(powmod(3n, lam, m), 1n, '3 comes back to 1 on the last 70 digits after λ(10^70) steps');
  let t = 3n; for (let i = 0; i < 100; i++) t = powmod(3n, t % lam, m);
  const g60 = String(t % 10n ** 60n).padStart(60, '0');
  is(out('x = 3\nforever: x = 3 ^ x\nshow 60 digits of x'), '…' + g60, "3 ^ 3 ^ 3 … forever: 60 digits, floor by floor");
  is(g60.slice(-10), '2464195387', "and they end in Graham's number's famous last ten digits");
  // OEIS A133613 (Graham's number's digits from the right), the 105 terms on oeis.org/A133613/list, 2026-11-16
  is(out('x = 3\nforever: x = 3 ^ x\nshow 105 digits of x'), '…615089404248265018193851562535796399618993967905496638003222348723967018485186439059104575627262464195387', 'all 105 digits listed on the OEIS match');
  is(out('x = 3\nforever: x = 3 ^ x\nshow 3 ^ x = x'), 'yes  (proved)', 'the tower is 3 ^ itself, proved');
  has(F.run('x = 3\nforever: x = 3 ^ x\nshow x').lines[0].why, 'every step locks in one more digit for good', 'and it says how it knows');
  is(out('x = 3\nforever: x = 3 ^ x\nshow 1000 digits of x').length, 1001, 'a thousand digits come back quickly');
  is(out('show 3 ^ 7625597484987'), '…' + String(powmod(3n, 7625597484987n, 10n ** 12n)).padStart(12, '0') + '  (the end of a whole number with about 3,638,334,640,025 digits)', 'a tower of four 3s, its last 12 digits, and how long it is');
  is(out('show (0 − 2) ^ 9999'), '…' + String(((-(2n ** 9999n)) % 10n ** 12n + 10n ** 12n) % 10n ** 12n).padStart(12, '0') + '  (this is minus a whole number with about 3,010 digits)', 'a huge minus power says it is minus');
  // night shift bug hunt: a settled tower fed back into the same loop said "never settles", because the engine
  // compared the number with itself by digits instead of knowing it is the same number
  is(out('x = 3\nforever: x = 3 ^ x\ny = x\nforever: y = 3 ^ y\nshow y\nshow y = 3 ^ y'), '…262464195387\nyes  (proved)', 'a tower that is already at rest stays at rest');
  is(out('x = 3\nforever: x = 3 ^ x\nforever: x = 3 ^ x\nshow x'), '…262464195387', 'running the tower loop twice changes nothing');
  is(out('x = 0\nforever: x = 7 ^ x\nshow x'), '…' + String((() => { let y = 0n; for (let i = 0; i < 40; i++) y = powmod(7n, y, 10n ** 12n); return y; })()).padStart(12, '0'), 'a tower of 7s');
  is(out('x = 1/7\nforever: x = 9 ^ x\nshow x').startsWith('…'), true, 'an endless fraction can go on top');
  is(out('x = 1\nforever: x = 3 ^ x + x\nshow x'), 'never settles', 'x = 3 ^ x + x: its last 2 digits go round 50 steps');
  { let y = 1n; const M = 10n ** 40n; for (let i = 0; i < 200; i++) y = (powmod(3n, y, M) + 1n) % M;
    is(out('x = 1\nforever: x = 3 ^ x + 1\nshow 40 digits of x'), '…' + String(y).padStart(40, '0'), 'x = 3 ^ x + 1 settles too (it once said "too big")'); }
  is(out('x = 1\nforever: x = 3 ^ x + 1\nshow 301 digits of x'), 'stopped: I can only work out the last 300 digits of x', 'the slower towers say how far they go');
  // this was "can't see the end" until 2026-11-18: towers on 2, 5, 10 … now settle by their own rule (see bigTowerLoop)
  is(out('x = 2\nforever: x = 2 ^ x\nshow x'), '…353432948736', 'a tower of 2s settles, from any start');
  is(out('x = 5\nforever: x = x × x\nshow 5 ^ x'), 'stopped: a power with an endless number or a huge number on top needs an ordinary whole number at the bottom with no 2 or 5 in it, like 3, 7 or 11', 'an endless top needs a bottom with no 2 or 5');
  is(out('show 2 ^ 3 ^ 2'), '512', 'towers read from the top down');
  is(out('show 2 ^ 64 ^ 2 = 2 ^ 4096'), 'yes', 'a 1,234-digit power is still worked out exactly');
  is(out('show 3 ^ -1'), '…666666666667  (this is 1/3)', 'a minus number on top divides');
  is(out('show (0 − 1) ^ 99999999999999'), '…999999999999  (this is -1)', 'minus one to a huge power');
  is(out('x = 5\nshow x ^ 100'), 'stopped: line 2: a power of a name can be 64 at most', 'a name to a big power is still capped');
}

// ── night shift bug hunt: asking for a huge number of digits froze the page (100000 digits of the own square)
is(out('x = 5\nforever: x = x × x\nshow 100000 digits of x'), 'stopped: line 3: I show at most 2000 digits at a time', 'a digit count that would freeze the page gets a clear answer');
is(out('x = 5\nforever: x = x × x\nshow 2000 digits of x').length, 2001, '2000 digits still work');
has(out('x = 5\nforever: x = x × x\nshow 0 digits of x'), 'at least 1 digit', 'show 0 digits gets a clear error');
has(out('x = 5\nforever: x = x × x\nsing 0 digits of x'), 'at least 1 digit', 'sing 0 digits gets a clear error');
is(out('x = 5\nforever: x = x × x\nshow 1 digits of x'), '…5', 'show 1 digits of x still works');

// ── found by an explorer agent in a GitHub Codespace (Nov 2026): loops that branch on their own last digits, and
// y = 10 × y + (an endless number). Both used to say "can't see the end".
is(out('x = 0\nforever:\n  if x is even: x = x + 1\n  else: x = x + 3\nshow x'), 'never settles', 'if even add 1, else add 3: never settles');
has(F.text('x = 0\nforever:\n  if x is even: x = x + 1\n  else: x = x + 3\nwhy x'), 'goes round 0, 1, 4, 5, 8, 9, 2, 3, 6, 7 every 10 steps', 'the if/else loop: the reason is its last digit going round');
is(out('x = 1\nforever:\n  if x is even: x = x × 10\n  else: x = x × x + 1\nshow x'), '0', 'if even times 10, else square and add 1: settles on 0');
has(F.text('x = 1\nforever:\n  if x is even: x = x × 10\n  else: x = x × x + 1\nwhy x'), 'from step 2 on it stays the same', 'the settling if/else loop says from when the test is frozen');
is(out('x = 3\nforever:\n  if x is odd: x = x × 10 + 5\nshow x'), '…555555555555  (this is -5/9)', 'an if with no else, frozen on odd, settles exactly');
is(out('x = 0\nforever:\n  if x ends in 25: x = x + 100\n  else: x = x + 5\nshow x'), 'never settles', 'ends in 25: once frozen it only adds 100, so it never settles');
is(out('x = 5\nforever: x = x × x\ny = 0\nforever: y = 10 × y + x\nshow y\nshow 9 × y + x'), '…786865234375\n0', 'y = 10 × y + an endless number settles on −x ÷ 9');
has(F.text('x = 5\nforever: x = x × x\ny = 0\nforever: y = 10 × y + x\nwhy y'), 'leaves alone is −x ÷ 9', 'y = 10 × y + x: the reason names −x ÷ 9');
is(out('x = 5\nforever: x = x × x\ny = 3\nforever: y = 20 × y + x × x + 1\nshow y'), '…162199321546', 'y = 20 × y + x × x + 1 settles to the digits Python gets');
is(out('x = 0\ny = 0\nforever:\n  x = x + 1\n  y = 10 × y + x\nshow y'), 'never settles', 'leaning on a counter still never settles');

// ── counts that only climb (explorer agent, Nov 2026): after forever a count is the top of its climb
is(out('count f = 2\nforever: f = f × f\nshow f'), 'forever', '2, 4, 16, 256 … squared forever ends at forever');
is(out('count z = 0\nforever: z = z × z + 1\nshow z'), 'forever', 'z × z + 1 from 0 climbs to forever');
is(out('count w = 1\nforever: w = w × w\nshow w'), '1', '1 squared forever stays 1');
is(out('count a = 0\nforever: a = a + 1\ncount b = 0\nforever: b = b + a\nshow b'), 'forever × forever', 'adding a count made by an earlier loop: forever × forever');
is(out('count x = forever + 3\nforever: x = x × 2\nshow x'), 'forever × forever', 'doubling forever + 3 forever climbs to forever × forever');
is(out('count d = forever\nforever: d = d × forever\nshow d'), "can't see the end", 'times forever, forever: the top is forever ^ forever, which it cannot write yet');
has(F.text('count d = forever\nforever: d = d × forever\nwhy d'), 'forever ^ forever, a number this language can\'t write yet', 'and it says why');
is(out('count a = forever\ncount k = 0\nx = 0\nforever:\n  x = x + 1\n  if x ends in 3: k = k + a\nshow k'), 'forever × forever', 'a count that adds an outside count some of the time');

// ── x = x ^ x (explorer agent, Nov 2026): once x is big, its last k digits only need the last k digits of x
is(out('x = 2\nforever: x = x ^ x\nshow x'), 'never settles', 'x ^ x from 2 never settles');
has(F.text('x = 2\nforever: x = x ^ x\nwhy x'), 'the last 3 digits of x go round 256, 656, 056, 456, 856 every 5 steps', 'x ^ x from 2: the 3-digit ring');
has(F.text('x = 3\nforever: x = x ^ x\nwhy x'), 'go round 03, 27 every 2 steps', 'x ^ x from 3: the 2-digit ring');
has(F.text('x = 7\nforever: x = x ^ x\nwhy x'), 'take 2, 2, 2, 10, 50, 250', 'x ^ x from 7 is a liar: calm for 4 digits, then wild');
is(out('x = 10\nforever: x = x ^ x\nshow x'), '0', 'x ^ x from 10 settles on exactly 0 (it used to say can\'t see the end; found by certify.py)');
is(out('x = 30\nforever: x = x ^ x\nshow x = 0'), 'yes', 'x ^ x from 30 is 0');
{ // brute force on the 5s and 2s sides: 7 ^ 7 = 823543, and the next one ends in …160007
  is(powmod(823543n, 823543n, 1000000n), 160007n, 'brute force: 823543 ^ 823543 ends in 160007, so the last 3 digits flip 543, 007');
}
is(F.text('count f = 2\nforever: f = f × f\nshow f'), 'forever', 'the climbing count answers without running out the clock');

// ── explorer agent's stress test (Nov 2026): a polynomial with an endless fixed number in it, and a tower plus 10 × x
is(out('x = 6\nforever: x = x ^ 5\ny = 0 − 10\nforever: y = (0 − 7) + 70 × y − 8 × y × y − 3 × x\nshow 20 digits of y'), '…61989826218117194115', 'y = −7 + 70y − 8y² − 3x with x endless settles (digits from a Python brute force)');
has(F.text('x = 6\nforever: x = x ^ 5\ny = 0 − 10\nforever: y = (0 − 7) + 70 × y − 8 × y × y − 3 × x\nwhy y'), 'x is fixed while this loop runs', 'and it says why');
is(out('x = 0 − 1\nforever: x = 3 ^ x − 10 × x\nshow 20 digits of x'), '…14449124018888973193', 'x = 3 ^ x − 10 × x settles (digits from a Python brute force)');
has(F.text('x = 0 − 1\nforever: x = 3 ^ x − 10 × x\nwhy x'), 'ten times two numbers that share k digits share k + 1', 'and it says why');
is(out('x = 0\nforever: x = 3 ^ x − x\nshow x'), 'never settles', 'x = 3 ^ x − x gains no digit, and its last 2 digits go round');

// ── sing: one note per digit, right to left, on A minor pentatonic (the explorer's recipe)
is(out('x = 3\nforever: x = 3 ^ x\nsing 12 digits of x'), '♪ …262464195387', 'sing shows the digits it plays');
is(out('sing 2024'), '♪ 2024', 'a plain whole number sings all its digits');
is(out('x = 2\nforever: x = x × x\nsing x'), '♪ nothing to sing: never settles', 'a loop that never settles has nothing to sing');
is(out('sing 2001 digits of 7'), 'stopped: line 1: I sing at most 2000 digits at a time', 'sing has the same digit cap as show');
is(out('x = yes\nsing x'), 'stopped: line 2: sing needs a number', 'sing needs a number');
{
  const r = F.run('x = 3\nforever: x = 3 ^ x\nsing 360 digits of x');
  const d = r.lines[0].sing.digits;
  is(d.length, 360, 'sing 360 digits gives 360 notes');
  is(d.slice(-12), '262464195387', 'the song ends in the digits of Graham\'s number');
  const f = F.notes('0379');
  is(f.map((x) => Math.round(x)).join(' '), [22, 17, 7, 0].map((st) => Math.round(220 * 2 ** (st / 12))).join(' '), 'notes go right to left: 9, 7, 3, 0 on the scale 0 3 5 7 10 12 15 17 19 22');
  const ev = F.song('0123456789');
  is(ev.filter((e) => e.v === 'bass').length + ':' + ev.filter((e) => e.v === 'bell').length, '3:1', 'a bass every 4th digit, a bell every 10th');
  const w = F.wav(d);
  const txt = (a, b) => String.fromCharCode(...w.slice(a, b));
  is(txt(0, 4) + txt(8, 12) + txt(36, 40), 'RIFFWAVEdata', 'sing makes a real WAV file');
  const dv = new DataView(w.buffer), secs = dv.getUint32(40, true) / 2 / dv.getUint32(24, true);
  is(secs > 57 && secs < 59.5, true, '360 digits make about a minute of sound (' + secs.toFixed(1) + ' s)');
  let peak = 0; for (let i = 44; i < w.length; i += 2) peak = Math.max(peak, Math.abs(dv.getInt16(i, true)));
  is(peak > 25000 && peak < 32768, true, 'the song is loud but never clips');
}

// ── liars/records.txt: the record liars, 2 up to 1000 digits of calm. Check the file is in order, starts with the
// list the README quotes, and that every record up to 40 digits really is calm exactly that long (plain base 10).
{
  const rows = fs.readFileSync(path.join(__dirname, '..', 'liars', 'records.txt'), 'utf8').split('\n')
    .filter((l) => l && !l.startsWith('#')).map((l) => l.split(' ')).map(([d, c]) => [Number(d), BigInt(c)]);
  is(rows.slice(0, 10).map((r) => String(r[1])).join(', '), '2, 7, 57, 182, 1068, 14557, 30982, 265357, 6139557, 8077857', 'the record liars start like the README says');
  is(rows.every((r, i) => i === 0 || (r[0] > rows[i - 1][0] && r[1] > rows[i - 1][1])), true, 'each record is bigger and calm for longer than the one before');
  is(rows[rows.length - 1][0] >= 1000, true, 'the list reaches 1000 digits of calm');
  is(String(rows.find((r) => r[0] === 35)[1]), '38533618339183472936432', 'the README liar is in the list');
  const per = (c, k) => { const m = 10n ** BigInt(k); let x = 0n, i = 0; const seen = new Map(); while (!seen.has(x)) { seen.set(x, i++); x = (x * x + c) % m; } return i - seen.get(x); };
  const calm = (c, most) => { for (let j = 1; j <= most; j++) if (per(c, j) % 5 === 0) return j - 1; return most; };
  const wrong = rows.filter(([d]) => d <= 40).filter(([d, c]) => calm(c, d + 1) !== d).map(([d, c]) => d + ':' + c);
  is(wrong.join(' '), '', 'every record liar up to 40 digits is calm exactly as long as the list says');
  is([1000, 1001, 1002].map((k) => per(rows[rows.length - 1][1], k)).join(', '), '2, 2, 10', 'the liars/README.md check of the 1000-digit liar prints 2, 2, 10');
}

// ── the README's zero-twins claim: two non-zero numbers whose product is exactly 0 and whose sum is exactly 1
is(ex('zero_twins.txt'), '…918212890625\n…081787109376\n0\n1', 'the README zero-twins example prints its two numbers, then 0 and 1');
is(out('x = 5\nforever: x = x × x\ny = 6\nforever: y = y ^ 5\nshow x × y = 0\nshow x = 0\nshow y = 0'), 'yes\nno  (proved)\nno  (proved)', 'the twins multiply to exactly 0, and neither one is 0');
is(BigInt(625) * 9376n, 5860000n, 'the hand check in the README is right');

// ── an outside review (2026-11-19): each line below failed before its fix
// a show before a hunt is not the hunt's show (it used to sort every number as "settles" by the 42)
has(out('show 42\nhunt c from 0 to 0:\n    x = c'), 'a hunt needs a show line inside it', 'hunt: a show before it does not count');
is(out('show 42\nhunt c from 0 to 1:\n    show c = 0\nshow 1'), '42\nhunt c from 0 to 1: tried 2 numbers, 2 kinds of answer\n  yes  1   0\n  no   1   1\n1', 'hunt: a show before it changes nothing');
is(out('hunt c from 0 to 1:\n    hunt d from 0 to 0:\n        show d\n    show c'), 'hunt c from 0 to 1: tried 2 numbers, 1 kind of answer\n  settles  2   0, 1', 'hunt: a hunt inside a hunt keeps the outer show');
{ // in a browser there is no process: a number too big must still say so, not throw "process is not defined"
  const vm = require('vm'), ctx = { console }; ctx.window = ctx; vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'forever.js'), 'utf8'), ctx);
  let got; try { got = ctx.Forever.run('show ' + '('.repeat(20000) + '1' + ')'.repeat(20000)).error; } catch (e) { got = 'threw ' + e.message; }
  is(got, 'that number got too big for this machine', 'browser: too big is an answer, not a crash');
}

// ── the LMArena agent (2026-11-20 duel): x = (x + 1) mod 10007 said "can't see the end" because the watch stopped at
// 4000 steps. A loop whose names are only ever set to (…) mod N can be in so few states that watching longer always
// sees it come round. Each answer is checked against a plain simulation that looks for the first repeat.
{
  const sim = (x0, f) => { const seen = new Map(); let x = x0, i = 0; while (!seen.has(x)) { seen.set(x, i++); x = f(x); } return i - seen.get(x) === 1 ? String(x) : 'never settles'; };
  is(out('x = 0\nforever: x = (x + 1) mod 10007\nshow x'), sim(0n, (x) => (x + 1n) % 10007n), 'a ring of 10007 is seen (it said can\'t see the end)');
  has(F.run('x = 0\nforever: x = (x + 1) mod 10007\nshow x\nwhy x').lines[1].why || out('x = 0\nforever: x = (x + 1) mod 10007\nwhy x'), 'every 10007 steps', 'the ring of 10007 says how long it is');
  is(out('x = 0\nforever: x = (x + 1) mod 99991\nshow x'), 'never settles', 'a ring of 99991');
  is(out('x = 2\nforever: x = (x × x + 1) mod 65537\nshow x'), sim(2n, (x) => (x * x + 1n) % 65537n), 'x × x + 1 mod 65537 against a plain simulation');
  is(out('x = 1\nforever: x = (x × 3) mod 40961\nshow x'), sim(1n, (x) => (x * 3n) % 40961n), 'x × 3 mod 40961 against a plain simulation');
  is(out('x = 7\nforever: x = (x × x) mod 4096\nshow x'), sim(7n, (x) => (x * x) % 4096n), 'squares mod 4096 settle, against a plain simulation');
  // two names, and a flag: still a few states, still seen
  is(out('x = 0   y = 0\nforever: x = (x + 1) mod 4999   y = (y + 2) mod 3\nshow x'), 'never settles', 'two names held in by mod');
  is(out('x = 0   f = no\nforever: x = (x + 1) mod 6007   f = x = 5000\nshow f'), 'never settles', 'a flag that turns on and off with a ring of 6007');
  // too many states to watch: it still says so honestly, never a guess
  is(out('x = 0\nforever: x = (x + 1) mod 1000003\nshow x'), "can't see the end", 'a ring too long to watch stays honest');
  // a loop that isn't held in by mod keeps the old watch
  is(out('x = 196\nforever: x = x + backwards(x)\nshow x'), "can't see the end", '196 still can\'t see the end');
}

// ── the LMArena agent, deep round (2026-11-20): two ifs that both count n. x = x × x + 1 from 3 is even every other
// step, so n goes up forever; the engine read only the last if (never true) and said n is exactly 0. Now it must
// never say a finite number here (forever, or an honest can't see the end).
{
  const twoIfs = (a, b) => out('count n = 0\nx = 3\nforever:\n    x = x × x + 1\n    if x ' + a + ': n = n + 1\n    if x ' + b + ': n = n + 1\nshow n');
  for (const got of [twoIfs('is even', 'ends in 9'), twoIfs('ends in 9', 'is even')]) {
    n++; if (!(got === 'forever' || got === "can't see the end")) { bad++; console.log('FAIL two ifs on one count gave a wrong answer: ' + JSON.stringify(got)); }
  }
  is(out('count n = 0\nx = 3\nforever:\n    x = x × x + 1\n    if x is even: n = n + 1\nshow n'), 'forever', 'one if on a count still works');
}

// ── the LMArena agent, merge-gate pass (2026-11-20): a lamp the loop can only turn OFF came out as yes when the watch saw
// it turn off but never saw the loop come round (x = (x + 1) mod 200003, lamp off at x = 3000; wrong on main too)
{
  const lamp = (at) => out('x = 0\nlamp = yes\nforever:\n    x = (x + 1) mod 200003\n    if x = ' + at + ': lamp = no\nshow lamp');
  is(lamp(3000), 'no  (found at step 3000)', 'a lamp turned off at step 3000 stays off (it said yes)');
  is(lamp(5000), 'no  (found at step 5000)', 'a lamp turned off at step 5000 stays off (it said yes)');
  is(out('x = 0\nlamp = no\nforever:\n    x = (x + 1) mod 200003\n    if x = 3000: lamp = yes\nshow lamp'), 'yes  (found at step 3000)', 'a lamp turned on still says yes');
  // two ifs that set one flag to the SAME value are read together, so this proof is kept
  is(out('x = 0\nlamp = no\nforever:\n    x = x + 1\n    if x × x = 2: lamp = yes\n    if x × x = 3: lamp = yes\nshow lamp'), 'no  (proved)', 'two ifs on one flag, neither ever true: still proved no');
  is(out('x = 0\nlamp = no\nforever:\n    x = x + 1\n    if x × x = 2: lamp = yes\n    if x × x = 4: lamp = yes\nshow lamp'), 'yes  (found at step 2)', 'two ifs on one flag, the second one true');
  n++; { const g = out('x = 0\nlamp = no\nforever:\n    x = x + 1\n    if x × x = 4: lamp = yes\n    if x × x = 2: lamp = no\nshow lamp'); if (g !== 'yes  (found at step 2)' && g !== "can't see the end") { bad++; console.log('FAIL two ifs setting one flag both ways: ' + g); } }
}

// ── the LMArena agent, re-check (2026-11-20): 80 ifs setting one flag walked the same 100,000 digit states 80 times
// (8 s in the CLI, 4 s frozen in the playground). The walk is now done once and reused.
{
  const ifs = Array.from({ length: 80 }, (_, i) => '    if x ends in ' + String(10 * i + 1).padStart(6, '0') + ': lamp = yes').join('\n');
  const before = F.STATS.orbitWalks;
  is(out('x = 0\nlamp = no\nforever:\n    x = x + 10\n' + ifs + '\nshow lamp'), 'no  (proved)', '80 ifs on one flag, none can hold (x ends in 0)');
  const walks = F.STATS.orbitWalks - before;
  n++; if (walks > 5) { bad++; console.log('FAIL 80 ifs on the same digits should share one walk, ran ' + walks); }
  is(out('x = 0\nlamp = no\nforever:\n    x = x + 10\n' + ifs + '\n    if x ends in 000790: lamp = yes\nshow lamp'), 'yes  (found at step 79)', 'the same 80 plus one that does hold (x = 790 at step 79)');
}

// ── CodeQL alerts (2026-11-27): the pages never put text back in as HTML, and the sing test's server stays in docs/
{
  for (const f of ['page.src.html', 'sing.src.html']) {
    const src = fs.readFileSync(path.join(__dirname, '..', 'page', f), 'utf8');
    is(/\.innerHTML\s*=\s*[^;]*\.textContent/.test(src), false, f + ': no text read back in as innerHTML (DOM text reinterpreted as HTML)');
  }
  const sing = fs.readFileSync(path.join(__dirname, 'sing.js'), 'utf8');
  has(sing, "startsWith(docs + path.sep)", 'tests/sing.js serves only files inside docs/ (uncontrolled path)');
}

// ── the CLI says plainly when it cannot read the program (#30)
{
  const { spawnSync } = require('child_process');
  const cli = (...a) => spawnSync('node', [path.join(__dirname, '..', 'cli.js'), ...a], { encoding: 'utf8' });
  const missing = cli('examples/grahm.txt');
  is(missing.status, 1, 'cli: missing file exits 1');
  is(missing.stdout.trim(), "can't open examples/grahm.txt: no such file", 'cli: missing file says so plainly');
  is(missing.stderr, '', 'cli: missing file prints no stack trace');
  const folder = cli('examples');
  is(folder.status, 1, 'cli: a folder exits 1');
  is(folder.stdout.trim(), 'examples is a folder: name one program, like examples/graham.txt', 'cli: a folder says so plainly');
  is(folder.stderr, '', 'cli: a folder prints no stack trace');
}

console.log(bad ? 'FAILED: ' + bad + ' of ' + n + ' checks' : 'ok: ' + n + ' checks');
process.exit(bad ? 1 : 0);
