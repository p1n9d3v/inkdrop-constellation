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

  const [width, setWidth] = React.useState(() => {
    const saved = localStorage.getItem("inkdrop-constellation:width");
    if (saved) {
      const parsed = parseInt(saved, 10);
      if (!isNaN(parsed)) {
        return parsed;
      }
    }
    return EXPANDED_WIDTH;
  });
  const [isHovered, setIsHovered] = React.useState(false);
  const [isDragging, setIsDragging] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);

  const widthRef = React.useRef(width);
  React.useEffect(() => {
    widthRef.current = width;
  }, [width]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = widthRef.current;
    setIsDragging(true);

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const newWidth = Math.max(250, Math.min(startWidth - deltaX, window.innerWidth - 100));
      setWidth(newWidth);
    };

    const handlePointerUp = () => {
      setIsDragging(false);
      localStorage.setItem("inkdrop-constellation:width", widthRef.current.toString());
      document.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerup", handlePointerUp);
    };

    document.addEventListener("pointermove", handlePointerMove);
    document.addEventListener("pointerup", handlePointerUp);
  };

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
        width: width,
        flexShrink: 0,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "var(--main-background-color, transparent)",
        boxSizing: "border-box",
        position: "relative",
      }}
    >
      <div
        onPointerDown={handlePointerDown}
        onPointerOver={() => setIsHovered(true)}
        onPointerOut={() => setIsHovered(false)}
        style={{
          position: "absolute",
          top: 0,
          left: -3,
          width: 6,
          height: "100%",
          cursor: "col-resize",
          zIndex: 100,
          display: "flex",
          justifyContent: "center",
          background: "transparent",
        }}
      >
        <div
          style={{
            width: 1,
            height: "100%",
            background: isHovered || isDragging
              ? "var(--accent-color, #0088ff)"
              : "var(--border-color, #3a3a3a)",
            transition: "background-color 0.15s ease",
          }}
        />
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "6px 8px",
          borderBottom: "1px solid var(--border-color, #3a3a3a)",
          fontSize: 12,
          boxSizing: "border-box",
          position: "relative",
        }}
      >
        {width >= 360 && (
          <span style={{ fontWeight: 600, flexShrink: 0 }}>Constellation</span>
        )}
        <label
          style={{
            display: "flex",
            gap: 4,
            cursor: "pointer",
            alignItems: "center",
            flexShrink: 0,
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
            flexShrink: 0,
          }}
        >
          <input
            type="checkbox"
            checked={showBooks}
            onChange={(e) => setShowBooks(e.target.checked)}
          />
          Books
        </label>
        {width >= 380 ? (
          <div
            style={{
              marginLeft: "auto",
              display: "flex",
              alignItems: "center",
              gap: 4,
              flexShrink: 0,
            }}
          >
            <button
              onClick={() => emitToggle()}
              title="Open in modal"
              style={{ cursor: "pointer" }}
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
        ) : (
          <div
            style={{
              marginLeft: "auto",
              display: "flex",
              alignItems: "center",
              flexShrink: 0,
            }}
          >
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              title="Actions"
              style={{
                cursor: "pointer",
                border: "none",
                background: "transparent",
                color: "var(--text-color, inherit)",
                padding: "2px 6px",
                fontSize: 14,
                fontWeight: "bold",
              }}
            >
              ⋮
            </button>
            {menuOpen && (
              <>
                <div
                  onClick={() => setMenuOpen(false)}
                  style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 199,
                    background: "transparent",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    right: 8,
                    top: 28,
                    background: "var(--main-background-color, #1e1e1e)",
                    border: "1px solid var(--border-color, #3a3a3a)",
                    borderRadius: 6,
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
                    zIndex: 200,
                    padding: "4px 0",
                    minWidth: 130,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <button
                    onClick={() => {
                      emitToggle();
                      setMenuOpen(false);
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "6px 12px",
                      border: "none",
                      background: "transparent",
                      color: "var(--text-color, inherit)",
                      cursor: "pointer",
                      textAlign: "left",
                      fontSize: 12,
                      width: "100%",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(128, 128, 128, 0.15)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <span style={{ fontSize: 13 }}>⤢</span> Open in modal
                  </button>
                  <button
                    onClick={() => {
                      refresh();
                      setMenuOpen(false);
                    }}
                    disabled={loading}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "6px 12px",
                      border: "none",
                      background: "transparent",
                      color: "var(--text-color, inherit)",
                      cursor: "pointer",
                      textAlign: "left",
                      fontSize: 12,
                      width: "100%",
                      opacity: loading ? 0.5 : 1,
                    }}
                    onMouseEnter={(e) => {
                      if (!loading) e.currentTarget.style.background = "rgba(128, 128, 128, 0.15)";
                    }}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <span style={{ fontSize: 13 }}>↻</span> Refresh
                  </button>
                  <button
                    onClick={() => {
                      setCollapsed(true);
                      setMenuOpen(false);
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "6px 12px",
                      border: "none",
                      background: "transparent",
                      color: "var(--text-color, inherit)",
                      cursor: "pointer",
                      textAlign: "left",
                      fontSize: 12,
                      width: "100%",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(128, 128, 128, 0.15)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <span style={{ fontSize: 13 }}>▶</span> Collapse
                  </button>
                </div>
              </>
            )}
          </div>
        )}
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
