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
            width: EXPANDED_WIDTH,
            flexShrink: 0,
            height: "100%",
            borderLeft: "1px solid var(--border-color, #3a3a3a)",
            display: "flex",
            flexDirection: "column",
            background: "var(--main-background-color, transparent)",
            boxSizing: "border-box",
        }, children: [(0, jsx_runtime_1.jsxs)("div", { style: {
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "6px 8px",
                    borderBottom: "1px solid var(--border-color, #3a3a3a)",
                    fontSize: 12,
                }, children: [(0, jsx_runtime_1.jsx)("span", { style: { fontWeight: 600 }, children: "Constellation" }), (0, jsx_runtime_1.jsxs)("label", { style: {
                            display: "flex",
                            gap: 4,
                            cursor: "pointer",
                            alignItems: "center",
                        }, children: [(0, jsx_runtime_1.jsx)("input", { type: "checkbox", checked: hideOrphans, onChange: (e) => setHideOrphans(e.target.checked) }), "Orphans"] }), (0, jsx_runtime_1.jsxs)("label", { style: {
                            display: "flex",
                            gap: 4,
                            cursor: "pointer",
                            alignItems: "center",
                        }, children: [(0, jsx_runtime_1.jsx)("input", { type: "checkbox", checked: showBooks, onChange: (e) => setShowBooks(e.target.checked) }), "Books"] }), (0, jsx_runtime_1.jsx)("button", { onClick: () => (0, modal_bus_1.emitToggle)(), title: "Open in modal", style: { marginLeft: "auto", cursor: "pointer" }, children: "\u2922" }), (0, jsx_runtime_1.jsx)("button", { onClick: refresh, title: "Refresh", style: { cursor: "pointer" }, disabled: loading, children: "\u21BB" }), (0, jsx_runtime_1.jsx)("button", { onClick: () => setCollapsed(true), title: "Collapse", style: { cursor: "pointer" }, children: "\u25B6" })] }), (0, jsx_runtime_1.jsx)("div", { style: {
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
