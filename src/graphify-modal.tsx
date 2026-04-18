import * as React from "react";
import { createPortal } from "react-dom";
import { onToggle } from "./modal-bus";
import GraphifyGraph from "./graphify-graph";
import { loadGraph, GraphData } from "./load-notes";

const GraphifyModal: React.FC = () => {
  const [open, setOpen] = React.useState(false);
  const [data, setData] = React.useState<GraphData | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [hideOrphans, setHideOrphans] = React.useState(true);
  const [showBooks, setShowBooks] = React.useState(true);

  React.useEffect(() => {
    return onToggle(() => setOpen((v) => !v));
  }, []);

  React.useEffect(() => {
    if (!open) return;
    setData(null);
    setLoading(true);
    loadGraph()
      .then(setData)
      .catch((e) => console.error("graphify: loadGraph failed", e))
      .finally(() => setLoading(false));
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (!open) return null;

  const orphanCount = data?.nodes.filter((n) => n.orphan).length ?? 0;
  const stats = data
    ? `${data.nodes.length} notes · ${data.edges.length} edges · ${orphanCount} orphans`
    : loading
    ? "Loading..."
    : "";

  const overlay = (
    <div
      onClick={() => setOpen(false)}
      style={
        {
          position: "fixed",
          inset: 0,
          background: "rgba(0, 0, 0, 0.45)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
          WebkitAppRegion: "no-drag",
        } as React.CSSProperties
      }
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 820,
          height: 600,
          background: "var(--main-background-color, #2a2a2a)",
          color: "var(--text-color, #eee)",
          borderRadius: 8,
          padding: 20,
          boxShadow: "0 10px 40px rgba(0,0,0,0.45)",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          <div style={{ fontSize: 16, fontWeight: 600 }}>Graphify</div>
          <div style={{ fontSize: 12, opacity: 0.7 }}>{stats}</div>
          <label
            style={{
              marginLeft: "auto",
              fontSize: 13,
              display: "flex",
              alignItems: "center",
              gap: 6,
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={hideOrphans}
              onChange={(e) => setHideOrphans(e.target.checked)}
            />
            Hide orphans
          </label>
          <label
            style={{
              fontSize: 13,
              display: "flex",
              alignItems: "center",
              gap: 6,
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={showBooks}
              onChange={(e) => setShowBooks(e.target.checked)}
            />
            Show books
          </label>
          <button onClick={() => setOpen(false)}>Close</button>
        </div>
        <div style={{ flex: 1, minHeight: 0 }}>
          {data ? (
            <GraphifyGraph
              data={data}
              hideOrphans={hideOrphans}
              showBooks={showBooks}
              onAfterOpen={() => setOpen(false)}
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                background: "#1e1e1e",
                borderRadius: 4,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                opacity: 0.7,
              }}
            >
              {loading ? "Loading notes..." : "No data"}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(overlay, document.body);
};

export default GraphifyModal;
