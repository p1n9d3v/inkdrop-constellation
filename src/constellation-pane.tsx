import * as React from "react";
import ConstellationGraph from "./constellation-graph";
import ConstellationToc from "./constellation-toc";
import { loadGraph, GraphData } from "./load-notes";
import { emitToggle } from "./modal-bus";

const EXPANDED_WIDTH = 560;
const COLLAPSED_WIDTH = 32;

const ConstellationPane: React.FC = () => {
  const [collapsed, setCollapsed] = React.useState(false);
  const [data, setData] = React.useState<GraphData | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [hideOrphans, setHideOrphans] = React.useState(true);
  const [showBooks, setShowBooks] = React.useState(true);

  React.useEffect(() => {
    setLoading(true);
    loadGraph()
      .then(setData)
      .catch((e) => console.error("constellation pane: load failed", e))
      .finally(() => setLoading(false));
  }, []);

  const refresh = () => {
    setLoading(true);
    loadGraph()
      .then(setData)
      .catch((e) => console.error("constellation pane: refresh failed", e))
      .finally(() => setLoading(false));
  };

  if (collapsed) {
    return (
      <div
        style={{
          width: COLLAPSED_WIDTH,
          height: "100%",
          borderLeft: "1px solid var(--border-color, #3a3a3a)",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
          paddingTop: 8,
          background: "var(--main-background-color, transparent)",
        }}
      >
        <button
          title="Expand Constellation"
          onClick={() => setCollapsed(false)}
          style={{
            writingMode: "vertical-rl",
            border: "none",
            background: "transparent",
            cursor: "pointer",
            fontSize: 12,
            color: "var(--text-color, inherit)",
            padding: 4,
          }}
        >
          Constellation ▶
        </button>
      </div>
    );
  }

  const orphanCount = data?.nodes.filter((n) => n.orphan).length ?? 0;

  return (
    <div
      style={{
        width: EXPANDED_WIDTH,
        flexShrink: 0,
        height: "100%",
        borderLeft: "1px solid var(--border-color, #3a3a3a)",
        display: "flex",
        flexDirection: "column",
        background: "var(--main-background-color, transparent)",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "6px 8px",
          borderBottom: "1px solid var(--border-color, #3a3a3a)",
          fontSize: 12,
        }}
      >
        <span style={{ fontWeight: 600 }}>Constellation</span>
        <label
          style={{
            display: "flex",
            gap: 4,
            cursor: "pointer",
            alignItems: "center",
          }}
        >
          <input
            type="checkbox"
            checked={hideOrphans}
            onChange={(e) => setHideOrphans(e.target.checked)}
          />
          Orphans
        </label>
        <label
          style={{
            display: "flex",
            gap: 4,
            cursor: "pointer",
            alignItems: "center",
          }}
        >
          <input
            type="checkbox"
            checked={showBooks}
            onChange={(e) => setShowBooks(e.target.checked)}
          />
          Books
        </label>
        <button
          onClick={() => emitToggle()}
          title="Open in modal"
          style={{ marginLeft: "auto", cursor: "pointer" }}
        >
          ⤢
        </button>
        <button
          onClick={refresh}
          title="Refresh"
          style={{ cursor: "pointer" }}
          disabled={loading}
        >
          ↻
        </button>
        <button
          onClick={() => setCollapsed(true)}
          title="Collapse"
          style={{ cursor: "pointer" }}
        >
          ▶
        </button>
      </div>
      <div
        style={{
          flex: "0 0 40%",
          minHeight: 0,
          borderBottom: "1px solid var(--border-color, #3a3a3a)",
        }}
      >
        <ConstellationToc />
      </div>
      <div style={{ flex: 1, minHeight: 0, padding: 4 }}>
        {data ? (
          <ConstellationGraph
            data={data}
            hideOrphans={hideOrphans}
            showBooks={showBooks}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              opacity: 0.7,
            }}
          >
            {loading ? "Loading notes..." : "No data"}
          </div>
        )}
      </div>
      {data && (
        <div
          style={{
            padding: "4px 8px",
            fontSize: 11,
            opacity: 0.6,
            borderTop: "1px solid var(--border-color, #3a3a3a)",
          }}
        >
          {data.nodes.length} notes · {data.edges.length} edges ·{" "}
          {orphanCount} orphans
        </div>
      )}
    </div>
  );
};

export default ConstellationPane;
