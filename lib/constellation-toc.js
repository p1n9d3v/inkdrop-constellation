"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const React = __importStar(require("react"));
const toc_1 = require("./toc");
const use_editing_note_1 = require("./use-editing-note");
const GOLDEN_ANGLE = 137.508;
function colorForIndex(index) {
    const hue = (index * GOLDEN_ANGLE) % 360;
    return `hsl(${hue.toFixed(1)}, 65%, 62%)`;
}
const LEVEL_STYLE = {
    1: { fontWeight: 600, fontSize: 13, letterSpacing: 0.2 },
    2: { fontWeight: 500, fontSize: 12.5 },
    3: { fontSize: 12 },
    4: { fontSize: 12, opacity: 0.8 },
    5: { fontSize: 11.5, opacity: 0.7 },
    6: { fontSize: 11.5, opacity: 0.6 },
};
const STYLE_TAG_ID = "constellation-toc-styles";
const TOC_STYLES = `
.constellation-toc-item {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  padding: 4px 8px 4px 0;
  border-radius: 4px;
  transition: background 0.12s ease, transform 0.12s ease;
  color: var(--text-color, inherit);
  user-select: none;
  line-height: 1.35;
}
.constellation-toc-item:hover {
  background: rgba(78, 161, 255, 0.12);
}
.constellation-toc-item:active {
  transform: translateX(1px);
}
.constellation-toc-bar {
  flex: none;
  width: 2px;
  align-self: stretch;
  border-radius: 2px;
  opacity: 0.9;
}
.constellation-toc-text {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.constellation-toc-empty {
  opacity: 0.5;
  font-size: 12px;
  padding: 12px 8px;
  text-align: center;
}
`;
function ensureStyles() {
    if (typeof document === "undefined")
        return;
    if (document.getElementById(STYLE_TAG_ID))
        return;
    const el = document.createElement("style");
    el.id = STYLE_TAG_ID;
    el.textContent = TOC_STYLES;
    document.head.appendChild(el);
}
const TocItem = ({ h, index }) => {
    const indent = (h.level - 1) * 12;
    const color = colorForIndex(index);
    const extra = LEVEL_STYLE[h.level] ?? LEVEL_STYLE[6];
    return ((0, jsx_runtime_1.jsxs)("div", { className: "constellation-toc-item", style: { paddingLeft: indent, ...extra }, onClick: () => (0, toc_1.jumpToHeading)(h, index), title: h.text, children: [(0, jsx_runtime_1.jsx)("div", { className: "constellation-toc-bar", style: { background: color } }), (0, jsx_runtime_1.jsx)("div", { className: "constellation-toc-text", children: h.text })] }));
};
const ConstellationToc = () => {
    React.useEffect(() => {
        ensureStyles();
    }, []);
    const note = (0, use_editing_note_1.useEditingNote)();
    const headings = React.useMemo(() => (note ? (0, toc_1.extractHeadings)(note.body) : []), [note?.body]);
    return ((0, jsx_runtime_1.jsxs)("div", { style: {
            display: "flex",
            flexDirection: "column",
            height: "100%",
            minHeight: 0,
        }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                    padding: "6px 8px",
                    fontSize: 11,
                    fontWeight: 600,
                    opacity: 0.55,
                    letterSpacing: 0.5,
                    textTransform: "uppercase",
                }, children: "Outline" }), (0, jsx_runtime_1.jsx)("div", { style: {
                    flex: 1,
                    minHeight: 0,
                    overflow: "auto",
                    padding: "0 6px 6px 6px",
                }, children: !note ? ((0, jsx_runtime_1.jsx)("div", { className: "constellation-toc-empty", children: "No note open" })) : headings.length === 0 ? ((0, jsx_runtime_1.jsx)("div", { className: "constellation-toc-empty", children: "No headings" })) : (headings.map((h, i) => (0, jsx_runtime_1.jsx)(TocItem, { h: h, index: i }, i))) })] }));
};
exports.default = ConstellationToc;
