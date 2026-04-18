declare var inkdrop: any;

export type Heading = {
  level: number;
  text: string;
  line: number;
};

export function extractHeadings(body: string): Heading[] {
  const lines = body.split("\n");
  const out: Heading[] = [];
  let inFence = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^\s{0,3}(```|~~~)/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;

    const m = /^(#{1,6})\s+(.+?)\s*#*\s*$/.exec(line);
    if (!m) continue;

    out.push({
      level: m[1].length,
      text: m[2].trim(),
      line: i,
    });
  }
  return out;
}

export function jumpToLine(line: number) {
  const editor = inkdrop.getActiveEditor?.();
  if (!editor) return;
  const doc = editor.state.doc;
  const targetLine = Math.min(Math.max(line + 1, 1), doc.lines);
  const pos = doc.line(targetLine).from;
  editor.dispatch({
    selection: { anchor: pos, head: pos },
    scrollIntoView: true,
  });
  editor.focus();
}
