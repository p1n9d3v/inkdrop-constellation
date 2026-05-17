"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadGraph = loadGraph;
const LINK_RE = /inkdrop:\/\/note\/([A-Za-z0-9_-]+)/g;
const TAG_COLOR_HEX = {
    default: "#8a9bb4",
    red: "#e74c3c",
    orange: "#f39c12",
    yellow: "#f1c40f",
    olive: "#808000",
    green: "#27ae60",
    teal: "#16a085",
    blue: "#3498db",
    violet: "#8e44ad",
    purple: "#9b59b6",
    pink: "#e91e63",
    brown: "#8b5a2b",
    grey: "#7f8c8d",
    black: "#2c3e50",
};
const UNTAGGED_COLOR = "#555555";
const UNTAGGED_BORDER = "#333333";
const BOOK_PALETTE = [
    "#ff6b6b",
    "#fcc419",
    "#51cf66",
    "#339af0",
    "#cc5de8",
    "#ffa94d",
    "#20c997",
    "#f06595",
    "#748ffc",
    "#66d9e8",
    "#d0bfff",
    "#ffc078",
];
function stripCode(md) {
    return md
        .replace(/```[\s\S]*?```/g, "")
        .replace(/~~~[\s\S]*?~~~/g, "")
        .replace(/`[^`\n]+`/g, "");
}
function truncate(s, n) {
    return s.length > n ? s.slice(0, n) + "…" : s;
}
function darken(hex) {
    const m = /^#([0-9a-f]{6})$/i.exec(hex);
    if (!m)
        return hex;
    const n = parseInt(m[1], 16);
    const r = Math.max(0, ((n >> 16) & 0xff) - 40);
    const g = Math.max(0, ((n >> 8) & 0xff) - 40);
    const b = Math.max(0, (n & 0xff) - 40);
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}
function hashStr(s) {
    let h = 0;
    for (let i = 0; i < s.length; i++)
        h = (h * 31 + s.charCodeAt(i)) | 0;
    return Math.abs(h);
}
async function loadGraph() {
    const [notesRes, tagsAll, booksAll] = await Promise.all([
        inkdrop.localDB.notes.all({ limit: 100000 }),
        inkdrop.localDB.tags.all(),
        inkdrop.localDB.books.all(),
    ]);
    const docs = notesRes.docs;
    const tagList = Array.isArray(tagsAll) ? tagsAll : tagsAll?.docs ?? [];
    const bookList = Array.isArray(booksAll)
        ? booksAll
        : booksAll?.docs ?? [];
    const tagColorById = new Map();
    for (const t of tagList) {
        const hex = TAG_COLOR_HEX[t.color] ?? TAG_COLOR_HEX.default;
        tagColorById.set(t._id, hex);
    }
    const noteIds = new Set(docs.map((n) => n._id));
    const titleById = new Map(docs.map((n) => [n._id, (n.title || "").trim() || "(untitled)"]));
    const directed = new Set();
    const SEP = "\u0000";
    for (const note of docs) {
        const stripped = stripCode(note.body || "");
        for (const m of stripped.matchAll(LINK_RE)) {
            const to = `note:${m[1]}`;
            if (to === note._id)
                continue;
            if (!noteIds.has(to))
                continue;
            directed.add(`${note._id}${SEP}${to}`);
        }
    }
    const seen = new Set();
    const edges = [];
    const connected = new Set();
    const degree = new Map();
    for (const key of directed) {
        if (seen.has(key))
            continue;
        const [from, to] = key.split(SEP);
        const reverseKey = `${to}${SEP}${from}`;
        const isBidi = directed.has(reverseKey);
        const sorted = [from, to].sort();
        const fromTitle = truncate(titleById.get(from) ?? from, 24);
        const toTitle = truncate(titleById.get(to) ?? to, 24);
        edges.push({
            id: isBidi ? `${sorted[0]}~${sorted[1]}` : `${from}|${to}`,
            from,
            to,
            label: `${fromTitle} ${isBidi ? "<->" : "->"} ${toTitle}`,
            arrows: isBidi ? "to, from" : "to",
        });
        seen.add(key);
        if (isBidi)
            seen.add(reverseKey);
        connected.add(from);
        connected.add(to);
        degree.set(from, (degree.get(from) ?? 0) + 1);
        degree.set(to, (degree.get(to) ?? 0) + 1);
    }
    const nodes = docs.map((n) => {
        const title = (n.title || "").trim() || "(untitled)";
        const firstTagId = n.tags?.[0];
        const hasTag = !!firstTagId && tagColorById.has(firstTagId);
        const bg = hasTag ? tagColorById.get(firstTagId) : UNTAGGED_COLOR;
        const border = hasTag ? darken(bg) : UNTAGGED_BORDER;
        const d = degree.get(n._id) ?? 0;
        return {
            id: n._id,
            title,
            label: truncate(title, 20),
            orphan: !connected.has(n._id),
            hasTag,
            color: { background: bg, border },
            degree: d,
            value: Math.sqrt(d),
        };
    });
    const memberMap = new Map();
    for (const note of docs) {
        const bid = note.bookId;
        if (!bid)
            continue;
        if (!memberMap.has(bid))
            memberMap.set(bid, []);
        memberMap.get(bid).push(note._id);
    }
    const books = bookList
        .filter((b) => memberMap.has(b._id))
        .map((b) => {
        const seed = b.name ?? b._id ?? "";
        return {
            id: b._id,
            name: b.name ?? "(unnamed)",
            color: BOOK_PALETTE[hashStr(seed) % BOOK_PALETTE.length],
            memberIds: memberMap.get(b._id) ?? [],
        };
    });
    return { nodes, edges, books };
}
