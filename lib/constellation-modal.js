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
const react_dom_1 = require("react-dom");
const modal_bus_1 = require("./modal-bus");
const constellation_graph_1 = __importDefault(require("./constellation-graph"));
const load_notes_1 = require("./load-notes");
const ConstellationModal = () => {
    const [open, setOpen] = React.useState(false);
    const [data, setData] = React.useState(null);
    const [loading, setLoading] = React.useState(false);
    const [hideOrphans, setHideOrphans] = React.useState(true);
    const [showBooks, setShowBooks] = React.useState(true);
    React.useEffect(() => {
        return (0, modal_bus_1.onToggle)(() => setOpen((v) => !v));
    }, []);
    React.useEffect(() => {
        if (!open)
            return;
        setData(null);
        setLoading(true);
        (0, load_notes_1.loadGraph)()
            .then(setData)
            .catch((e) => console.error("constellation: loadGraph failed", e))
            .finally(() => setLoading(false));
    }, [open]);
    React.useEffect(() => {
        if (!open)
            return;
        const onKey = (e) => {
            if (e.key === "Escape")
                setOpen(false);
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open]);
    if (!open)
        return null;
    const orphanCount = data?.nodes.filter((n) => n.orphan).length ?? 0;
    const stats = data
        ? `${data.nodes.length} notes · ${data.edges.length} edges · ${orphanCount} orphans`
        : loading
            ? "Loading..."
            : "";
    const overlay = ((0, jsx_runtime_1.jsx)("div", { onClick: () => setOpen(false), style: {
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            WebkitAppRegion: "no-drag",
        }, children: (0, jsx_runtime_1.jsxs)("div", { onClick: (e) => e.stopPropagation(), style: {
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
            }, children: [(0, jsx_runtime_1.jsxs)("div", { style: {
                        display: "flex",
                        alignItems: "center",
                        gap: 16,
                    }, children: [(0, jsx_runtime_1.jsx)("div", { style: { fontSize: 16, fontWeight: 600 }, children: "Constellation" }), (0, jsx_runtime_1.jsx)("div", { style: { fontSize: 12, opacity: 0.7 }, children: stats }), (0, jsx_runtime_1.jsxs)("label", { style: {
                                marginLeft: "auto",
                                fontSize: 13,
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                                cursor: "pointer",
                            }, children: [(0, jsx_runtime_1.jsx)("input", { type: "checkbox", checked: hideOrphans, onChange: (e) => setHideOrphans(e.target.checked) }), "Hide orphans"] }), (0, jsx_runtime_1.jsxs)("label", { style: {
                                fontSize: 13,
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                                cursor: "pointer",
                            }, children: [(0, jsx_runtime_1.jsx)("input", { type: "checkbox", checked: showBooks, onChange: (e) => setShowBooks(e.target.checked) }), "Show books"] }), (0, jsx_runtime_1.jsx)("button", { onClick: () => setOpen(false), children: "Close" })] }), (0, jsx_runtime_1.jsx)("div", { style: { flex: 1, minHeight: 0 }, children: data ? ((0, jsx_runtime_1.jsx)(constellation_graph_1.default, { data: data, hideOrphans: hideOrphans, showBooks: showBooks, onAfterOpen: () => setOpen(false) })) : ((0, jsx_runtime_1.jsx)("div", { style: {
                            width: "100%",
                            height: "100%",
                            background: "#1e1e1e",
                            borderRadius: 4,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            opacity: 0.7,
                        }, children: loading ? "Loading notes..." : "No data" })) })] }) }));
    return (0, react_dom_1.createPortal)(overlay, document.body);
};
exports.default = ConstellationModal;
