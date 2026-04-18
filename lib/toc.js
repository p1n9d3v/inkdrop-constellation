"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractHeadings = extractHeadings;
exports.jumpToLine = jumpToLine;
exports.jumpToHeading = jumpToHeading;
function extractHeadings(body) {
    const lines = body.split("\n");
    const out = [];
    let inFence = false;
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (/^\s{0,3}(```|~~~)/.test(line)) {
            inFence = !inFence;
            continue;
        }
        if (inFence)
            continue;
        const m = /^(#{1,6})\s+(.+?)\s*#*\s*$/.exec(line);
        if (!m)
            continue;
        out.push({
            level: m[1].length,
            text: m[2].trim(),
            line: i,
        });
    }
    return out;
}
function jumpToLine(line) {
    const editor = inkdrop.getActiveEditor?.();
    if (!editor)
        return;
    const doc = editor.state.doc;
    const targetLine = Math.min(Math.max(line + 1, 1), doc.lines);
    const pos = doc.line(targetLine).from;
    editor.dispatch({
        selection: { anchor: pos, head: pos },
        scrollIntoView: true,
    });
    editor.focus();
}
function getVisiblePreviewContainer() {
    if (typeof document === "undefined")
        return null;
    const el = document.querySelector(".mde-preview-container");
    if (!el)
        return null;
    if (el.offsetParent === null)
        return null;
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0)
        return null;
    return el;
}
function scrollPreviewToIndex(preview, index) {
    const headers = preview.querySelectorAll("h1, h2, h3, h4, h5, h6");
    const target = headers[index];
    if (!target)
        return false;
    preview.scrollTop = target.offsetTop - preview.offsetTop;
    return true;
}
function jumpToHeading(heading, index) {
    const preview = getVisiblePreviewContainer();
    if (preview && scrollPreviewToIndex(preview, index)) {
        return;
    }
    jumpToLine(heading.line);
}
