// 禁止語チェック: scripts/anon-words.txt の語が配布物・ソースに含まれていないか確認する
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = process.cwd();
const listPath = join(root, 'scripts', 'anon-words.txt');
const words = readFileSync(listPath, 'utf8')
  .split(/\r?\n/)
  .map((l) => l.trim())
  .filter((l) => l && !l.startsWith('#'));

const targets = ['src', 'docs', 'public', 'README.md', 'index.html', '.github'];
const exts = new Set(['.ts', '.tsx', '.md', '.html', '.json', '.txt', '.css', '.yml', '.yaml', '.js', '.mjs']);

function walk(p, out) {
  let st;
  try {
    st = statSync(p);
  } catch {
    return;
  }
  if (st.isDirectory()) {
    for (const name of readdirSync(p)) walk(join(p, name), out);
  } else if ([...exts].some((e) => p.endsWith(e))) {
    out.push(p);
  }
}

const files = [];
for (const t of targets) walk(join(root, t), files);

if (words.length === 0) {
  console.log(`check:anon — 禁止語リストが空のため、${files.length} ファイルを走査しましたが判定は行いません。`);
  process.exit(0);
}

let hits = 0;
for (const f of files) {
  const lines = readFileSync(f, 'utf8').split(/\r?\n/);
  lines.forEach((line, i) => {
    const lower = line.toLowerCase();
    for (const w of words) {
      if (lower.includes(w.toLowerCase())) {
        hits++;
        console.error(`${relative(root, f)}:${i + 1}: 禁止語「${w}」`);
      }
    }
  });
}

if (hits > 0) {
  console.error(`check:anon — ${hits} 件の禁止語が見つかりました。`);
  process.exit(1);
}
console.log(`check:anon — ${files.length} ファイルを走査し、禁止語 ${words.length} 語について該当なし。`);
