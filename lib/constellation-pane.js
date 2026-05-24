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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const React = __importStar(require("react"));
const constellation_graph_1 = __importDefault(require("./constellation-graph"));
const constellation_toc_1 = __importDefault(require("./constellation-toc"));
const load_notes_1 = require("./load-notes");
const modal_bus_1 = require("./modal-bus");
const EXPANDED_WIDTH = 560;
const COLLAPSED_WIDTH = 32;
const ConstellationPane = () => {
    const [collapsed, setCollapsed] = React.useState(false);
    const [data, setData] = React.useState(null);
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
    const handlePointerDown = (e) => {
        e.preventDefault();
        const startX = e.clientX;
        const startWidth = widthRef.current;
        setIsDragging(true);
        const handlePointerMove = (moveEvent) => {
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
        (0, load_notes_1.loadGraph)()
            .then(setData)
            .catch((e) => console.error("constellation pane: load failed", e))
            .finally(() => setLoading(false));
    }, []);
    const refresh = () => {
        setLoading(true);
        (0, load_notes_1.loadGraph)()
            .then(setData)
            .catch((e) => console.error("constellation pane: refresh failed", e))
            .finally(() => setLoading(false));
    };
    if (collapsed) {
        return ((0, jsx_runtime_1.jsx)("div", { style: {
                width: COLLAPSED_WIDTH,
                height: "100%",
                borderLeft: "1px solid var(--border-color, #3a3a3a)",
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "center",
                paddingTop: 8,
                background: "var(--main-background-color, transparent)",
            }, children: (0, jsx_runtime_1.jsx)("button", { title: "Expand Constellation", onClick: () => setCollapsed(false), style: {
                    writingMode: "vertical-rl",
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    fontSize: 12,
                    color: "var(--text-color, inherit)",
                    padding: 4,
                }, children: "Constellation \u25B6" }) }));
    }
    const orphanCount = data?.nodes.filter((n) => n.orphan).length ?? 0;
    return ((0, jsx_runtime_1.jsxs)("div", { style: {
            width: width,
            flexShrink: 0,
            height: "100%",
            display: "flex",
            flexDirection: "column",
            background: "var(--main-background-color, transparent)",
            boxSizing: "border-box",
            position: "relative",
        }, children: [(0, jsx_runtime_1.jsx)("div", { onPointerDown: handlePointerDown, onPointerOver: () => setIsHovered(true), onPointerOut: () => setIsHovered(false), style: {
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
                }, children: (0, jsx_runtime_1.jsx)("div", { style: {
                        width: 1,
                        height: "100%",
                        background: isHovered || isDragging
                            ? "var(--accent-color, #0088ff)"
                            : "var(--border-color, #3a3a3a)",
                        transition: "background-color 0.15s ease",
                    } }) }), (0, jsx_runtime_1.jsxs)("div", { style: {
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "6px 8px",
                    borderBottom: "1px solid var(--border-color, #3a3a3a)",
                    fontSize: 12,
                    boxSizing: "border-box",
                    position: "relative",
                }, children: [width >= 360 && ((0, jsx_runtime_1.jsx)("span", { style: { fontWeight: 600, flexShrink: 0 }, children: "Constellation" })), (0, jsx_runtime_1.jsxs)("label", { style: {
                            display: "flex",
                            gap: 4,
                            cursor: "pointer",
                            alignItems: "center",
                            flexShrink: 0,
                        }, children: [(0, jsx_runtime_1.jsx)("input", { type: "checkbox", checked: hideOrphans, onChange: (e) => setHideOrphans(e.target.checked) }), "Orphans"] }), (0, jsx_runtime_1.jsxs)("label", { style: {
                            display: "flex",
                            gap: 4,
                            cursor: "pointer",
                            alignItems: "center",
                            flexShrink: 0,
                        }, children: [(0, jsx_runtime_1.jsx)("input", { type: "checkbox", checked: showBooks, onChange: (e) => setShowBooks(e.target.checked) }), "Books"] }), width >= 380 ? ((0, jsx_runtime_1.jsxs)("div", { style: {
                            marginLeft: "auto",
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                            flexShrink: 0,
                        }, children: [(0, jsx_runtime_1.jsx)("button", { onClick: () => (0, modal_bus_1.emitToggle)(), title: "Open in modal", style: { cursor: "pointer" }, children: "\u2922" }), (0, jsx_runtime_1.jsx)("button", { onClick: refresh, title: "Refresh", style: { cursor: "pointer" }, disabled: loading, children: "\u21BB" }), (0, jsx_runtime_1.jsx)("button", { onClick: () => setCollapsed(true), title: "Collapse", style: { cursor: "pointer" }, children: "\u25B6" })] })) : ((0, jsx_runtime_1.jsxs)("div", { style: {
                            marginLeft: "auto",
                            display: "flex",
                            alignItems: "center",
                            flexShrink: 0,
                        }, children: [(0, jsx_runtime_1.jsx)("button", { onClick: () => setMenuOpen(!menuOpen), title: "Actions", style: {
                                    cursor: "pointer",
                                    border: "none",
                                    background: "transparent",
                                    color: "var(--text-color, inherit)",
                                    padding: "2px 6px",
                                    fontSize: 14,
                                    fontWeight: "bold",
                                }, children: "\u22EE" }), menuOpen && ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("div", { onClick: () => setMenuOpen(false), style: {
                                            position: "fixed",
                                            top: 0,
                                            left: 0,
                                            right: 0,
                                            bottom: 0,
                                            zIndex: 199,
                                            background: "transparent",
                                        } }), (0, jsx_runtime_1.jsxs)("div", { style: {
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
                                        }, children: [(0, jsx_runtime_1.jsxs)("button", { onClick: () => {
                                                    (0, modal_bus_1.emitToggle)();
                                                    setMenuOpen(false);
                                                }, style: {
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
                                                }, onMouseEnter: (e) => (e.currentTarget.style.background = "rgba(128, 128, 128, 0.15)"), onMouseLeave: (e) => (e.currentTarget.style.background = "transparent"), children: [(0, jsx_runtime_1.jsx)("span", { style: { fontSize: 13 }, children: "\u2922" }), " Open in modal"] }), (0, jsx_runtime_1.jsxs)("button", { onClick: () => {
                                                    refresh();
                                                    setMenuOpen(false);
                                                }, disabled: loading, style: {
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
                                                }, onMouseEnter: (e) => {
                                                    if (!loading)
                                                        e.currentTarget.style.background = "rgba(128, 128, 128, 0.15)";
                                                }, onMouseLeave: (e) => (e.currentTarget.style.background = "transparent"), children: [(0, jsx_runtime_1.jsx)("span", { style: { fontSize: 13 }, children: "\u21BB" }), " Refresh"] }), (0, jsx_runtime_1.jsxs)("button", { onClick: () => {
                                                    setCollapsed(true);
                                                    setMenuOpen(false);
                                                }, style: {
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
                                                }, onMouseEnter: (e) => (e.currentTarget.style.background = "rgba(128, 128, 128, 0.15)"), onMouseLeave: (e) => (e.currentTarget.style.background = "transparent"), children: [(0, jsx_runtime_1.jsx)("span", { style: { fontSize: 13 }, children: "\u25B6" }), " Collapse"] })] })] }))] }))] }), (0, jsx_runtime_1.jsx)("div", { style: {
                    flex: "0 0 40%",
                    minHeight: 0,
                    borderBottom: "1px solid var(--border-color, #3a3a3a)",
                }, children: (0, jsx_runtime_1.jsx)(constellation_toc_1.default, {}) }), (0, jsx_runtime_1.jsx)("div", { style: { flex: 1, minHeight: 0, padding: 4 }, children: data ? ((0, jsx_runtime_1.jsx)(constellation_graph_1.default, { data: data, hideOrphans: hideOrphans, showBooks: showBooks })) : ((0, jsx_runtime_1.jsx)("div", { style: {
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 12,
                        opacity: 0.7,
                    }, children: loading ? "Loading notes..." : "No data" })) }), data && ((0, jsx_runtime_1.jsxs)("div", { style: {
                    padding: "4px 8px",
                    fontSize: 11,
                    opacity: 0.6,
                    borderTop: "1px solid var(--border-color, #3a3a3a)",
                }, children: [data.nodes.length, " notes \u00B7 ", data.edges.length, " edges \u00B7", " ", orphanCount, " orphans"] }))] }));
};
exports.default = ConstellationPane;
