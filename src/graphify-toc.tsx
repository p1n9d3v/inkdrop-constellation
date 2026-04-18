import * as React from "react";
import { extractHeadings, jumpToLine, Heading } from "./toc";
import { useEditingNote } from "./use-editing-note";

const LEVEL_BAR_COLOR: Record<number, string> = {
  1: "#4ea1ff",
  2: "#5ab0ff",
  3: "#6dbbff",
  4: "#87c7ff",
  5: "#a5d4ff",
  6: "#c5e0ff",
};

const LEVEL_STYLE: Record<number, React.CSSProperties> = {
  1: { fontWeight: 600, fontSize: 13, letterSpacing: 0.2 },
  2: { fontWeight: 500, fontSize: 12.5 },
  3: { fontSize: 12 },
  4: { fontSize: 12, opacity: 0.8 },
  5: { fontSize: 11.5, opacity: 0.7 },
  6: { fontSize: 11.5, opacity: 0.6 },
};

const STYLE_TAG_ID = "graphify-toc-styles";
const TOC_STYLES = `
.graphify-toc-item {
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
.graphify-toc-item:hover {
  background: rgba(78, 161, 255, 0.12);
}
.graphify-toc-item:active {
  transform: translateX(1px);
}
.graphify-toc-bar {
  flex: none;
  width: 2px;
  align-self: stretch;
  border-radius: 2px;
  opacity: 0.9;
}
.graphify-toc-text {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.graphify-toc-empty {
  opacity: 0.5;
  font-size: 12px;
  padding: 12px 8px;
  text-align: center;
}
`;

function ensureStyles() {
  if (typeof document === "undefined") return;
  if (document.getElementById(STYLE_TAG_ID)) return;
  const el = document.createElement("style");
  el.id = STYLE_TAG_ID;
  el.textContent = TOC_STYLES;
  document.head.appendChild(el);
}

const TocItem: React.FC<{ h: Heading }> = ({ h }) => {
  const indent = (h.level - 1) * 12;
  const color = LEVEL_BAR_COLOR[h.level] ?? LEVEL_BAR_COLOR[6];
  const extra = LEVEL_STYLE[h.level] ?? LEVEL_STYLE[6];

  return (
    <div
      className="graphify-toc-item"
      style={{ paddingLeft: indent, ...extra }}
      onClick={() => jumpToLine(h.line)}
      title={h.text}
    >
      <div className="graphify-toc-bar" style={{ background: color }} />
      <div className="graphify-toc-text">{h.text}</div>
    </div>
  );
};

const GraphifyToc: React.FC = () => {
  React.useEffect(() => {
    ensureStyles();
  }, []);

  const note = useEditingNote();
  const headings = React.useMemo(
    () => (note ? extractHeadings(note.body) : []),
    [note?.body]
  );

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: 0,
      }}
    >
      <div
        style={{
          padding: "6px 8px",
          fontSize: 11,
          fontWeight: 600,
          opacity: 0.55,
          letterSpacing: 0.5,
          textTransform: "uppercase",
        }}
      >
        Outline
      </div>
      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflow: "auto",
          padding: "0 6px 6px 6px",
        }}
      >
        {!note ? (
          <div className="graphify-toc-empty">No note open</div>
        ) : headings.length === 0 ? (
          <div className="graphify-toc-empty">No headings</div>
        ) : (
          headings.map((h, i) => <TocItem key={i} h={h} />)
        )}
      </div>
    </div>
  );
};

export default GraphifyToc;
