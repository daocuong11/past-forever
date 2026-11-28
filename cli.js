#!/usr/bin/env node
const F = require('./forever.js'), fs = require('fs');
const args = process.argv.slice(2), why = args.includes('--why');
const wi = args.indexOf('--wav'), wavOut = wi >= 0 ? args[wi + 1] : null;
const file = args.find((a, i) => !a.startsWith('--') && !(wi >= 0 && i === wi + 1));
if (!file || (wi >= 0 && !wavOut)) { console.log('use: node cli.js program.txt [--why] [--wav song.wav]'); process.exit(1); }
let src;
try {
  src = fs.readFileSync(file, 'utf8');
} catch (e) {
  if (e.code === 'ENOENT') { console.log(`can't open ${file}: no such file`); process.exit(1); }
  if (e.code === 'EISDIR') { console.log(`${file} is a folder: name one program, like examples/graham.txt`); process.exit(1); }
  throw e;
}
const result = F.text(src, { why });
console.log(result);
if (result.includes('stopped: ')) process.exitCode = 1;
if (wavOut) {
  const sung = F.run(src).lines.filter((l) => l.sing);
  if (!sung.length) { console.log('no sing line to save: add a line like  sing x'); process.exit(1); }
  fs.writeFileSync(wavOut, F.wav(sung.map((l) => l.sing.digits).join('')));
  console.log('saved ' + wavOut + ' (' + sung.reduce((n, l) => n + l.sing.digits.length, 0) + ' notes)');
}
