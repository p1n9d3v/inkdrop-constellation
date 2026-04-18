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
const vis_network_1 = require("vis-network");
const vis_data_1 = require("vis-data");
const options = {
    physics: {
        enabled: true,
        solver: "forceAtlas2Based",
        forceAtlas2Based: {
            gravitationalConstant: -55,
            centralGravity: 0.025,
            springLength: 140,
            springConstant: 0.08,
            damping: 0.5,
            avoidOverlap: 0.9,
        },
        stabilization: {
            enabled: true,
            iterations: 400,
            updateInterval: 25,
            fit: true,
        },
        minVelocity: 0.5,
        maxVelocity: 50,
    },
    nodes: {
        shape: "dot",
        size: 12,
        color: { background: "#4ea1ff", border: "#2d6fc9" },
        font: {
            color: "#f5f5f5",
            size: 11,
            strokeWidth: 3,
            strokeColor: "#1e1e1e",
        },
        borderWidth: 2,
        scaling: {
            min: 8,
            max: 28,
            label: {
                enabled: true,
                min: 8,
                max: 20,
                drawThreshold: 9,
            },
        },
    },
    edges: {
        color: { color: "#888888", opacity: 0.5 },
        smooth: false,
        width: 0.8,
        arrows: { to: { scaleFactor: 0.5 }, from: { scaleFactor: 0.5 } },
    },
    interaction: { dragNodes: true, zoomView: true, dragView: true },
};
function convexHull(points) {
    if (points.length <= 1)
        return points.slice();
    const sorted = [...points].sort((a, b) => a.x - b.x || a.y - b.y);
    const cross = (O, A, B) => (A.x - O.x) * (B.y - O.y) - (A.y - O.y) * (B.x - O.x);
    const lower = [];
    for (const p of sorted) {
        while (lower.length >= 2 &&
            cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0)
            lower.pop();
        lower.push(p);
    }
    const upper = [];
    for (let i = sorted.length - 1; i >= 0; i--) {
        const p = sorted[i];
        while (upper.length >= 2 &&
            cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0)
            upper.pop();
        upper.push(p);
    }
    lower.pop();
    upper.pop();
    return lower.concat(upper);
}
function padHull(hull, pad) {
    if (hull.length === 0)
        return hull;
    const cx = hull.reduce((s, p) => s + p.x, 0) / hull.length;
    const cy = hull.reduce((s, p) => s + p.y, 0) / hull.length;
    return hull.map((p) => {
        const dx = p.x - cx;
        const dy = p.y - cy;
        const d = Math.hypot(dx, dy);
        if (d < 1e-6)
            return { x: p.x + pad, y: p.y };
        return { x: p.x + (dx / d) * pad, y: p.y + (dy / d) * pad };
    });
}
function hexAlpha(hex, alpha) {
    const a = Math.max(0, Math.min(255, Math.round(alpha * 255)))
        .toString(16)
        .padStart(2, "0");
    return hex + a;
}
const ConstellationGraph = ({ data, hideOrphans, showBooks, onAfterOpen, }) => {
    const containerRef = React.useRef(null);
    const networkRef = React.useRef(null);
    const nodesRef = React.useRef(null);
    const showBooksRef = React.useRef(showBooks);
    showBooksRef.current = showBooks;
    React.useEffect(() => {
        if (!containerRef.current)
            return;
        const n = data.nodes.length;
        const R = Math.max(180, Math.sqrt(Math.max(n, 1)) * 40);
        const initialNodes = data.nodes.map((node, i) => {
            const a = (i * 2 * Math.PI) / Math.max(n, 1);
            return {
                id: node.id,
                label: node.label,
                x: Math.cos(a) * R,
                y: Math.sin(a) * R,
                hidden: hideOrphans && node.orphan,
                color: node.color,
                shape: node.hasTag ? "dot" : "diamond",
                value: node.value,
            };
        });
        const anchorNodes = data.books.map((book) => ({
            id: `book-anchor:${book.id}`,
            label: "",
            size: 0.1,
            color: {
                background: "rgba(0,0,0,0)",
                border: "rgba(0,0,0,0)",
            },
            borderWidth: 0,
            chosen: false,
            value: 0,
            shape: "dot",
        }));
        const anchorEdges = [];
        for (const book of data.books) {
            for (const memberId of book.memberIds) {
                anchorEdges.push({
                    id: `anchor|${book.id}|${memberId}`,
                    from: memberId,
                    to: `book-anchor:${book.id}`,
                    color: { color: "rgba(0,0,0,0)", opacity: 0 },
                    width: 0.1,
                    smooth: false,
                    arrows: { to: { enabled: false }, from: { enabled: false } },
                    physics: true,
                    selectionWidth: 0,
                });
            }
        }
        const nodes = new vis_data_1.DataSet([...initialNodes, ...anchorNodes]);
        const edges = new vis_data_1.DataSet([...data.edges, ...anchorEdges]);
        nodesRef.current = nodes;
        const network = new vis_network_1.Network(containerRef.current, { nodes, edges }, options);
        networkRef.current = network;
        let justDragged = false;
        network.on("dragStart", () => {
            justDragged = true;
        });
        network.on("dragEnd", (params) => {
            if (params.nodes && params.nodes.length > 0) {
                nodes.update(params.nodes.map((id) => ({ id, fixed: false })));
                network.startSimulation();
            }
            setTimeout(() => {
                justDragged = false;
            }, 120);
        });
        network.on("click", (params) => {
            if (justDragged)
                return;
            if (!params.nodes || params.nodes.length === 0)
                return;
            const noteId = params.nodes[0];
            if (typeof noteId === "string" && noteId.startsWith("book-anchor:"))
                return;
            try {
                inkdrop.commands.dispatch(document.body, "core:open-note", {
                    noteId,
                });
                onAfterOpen?.();
            }
            catch (e) {
                console.error("constellation: open-note failed", e);
            }
        });
        network.on("beforeDrawing", (ctx) => {
            if (!showBooksRef.current)
                return;
            for (const book of data.books) {
                const positions = [];
                for (const memberId of book.memberIds) {
                    const rec = nodes.get(memberId);
                    if (!rec || rec.hidden)
                        continue;
                    const pos = network.getPositions([memberId])[memberId];
                    if (pos)
                        positions.push({ x: pos.x, y: pos.y });
                }
                if (positions.length === 0)
                    continue;
                let labelX = 0;
                let labelY = 0;
                ctx.save();
                if (positions.length <= 2) {
                    const cx = positions.reduce((s, p) => s + p.x, 0) / positions.length;
                    const cy = positions.reduce((s, p) => s + p.y, 0) / positions.length;
                    let r = 0;
                    for (const p of positions)
                        r = Math.max(r, Math.hypot(p.x - cx, p.y - cy));
                    r = Math.max(r + 40, 55);
                    ctx.beginPath();
                    ctx.arc(cx, cy, r, 0, Math.PI * 2);
                    labelX = cx;
                    labelY = cy - r;
                }
                else {
                    const hull = convexHull(positions);
                    const padded = padHull(hull, 40);
                    ctx.beginPath();
                    ctx.moveTo(padded[0].x, padded[0].y);
                    for (let i = 1; i < padded.length; i++)
                        ctx.lineTo(padded[i].x, padded[i].y);
                    ctx.closePath();
                    let topIdx = 0;
                    for (let i = 1; i < padded.length; i++) {
                        if (padded[i].y < padded[topIdx].y)
                            topIdx = i;
                    }
                    labelX = padded[topIdx].x;
                    labelY = padded[topIdx].y;
                }
                ctx.fillStyle = hexAlpha(book.color, 0.12);
                ctx.fill();
                ctx.strokeStyle = hexAlpha(book.color, 0.55);
                ctx.lineWidth = 1.5;
                ctx.stroke();
                ctx.restore();
                const zoom = network.getScale() || 1;
                const fontPx = Math.max(11, Math.min(18, 13 / zoom));
                labelY -= 6 / zoom;
                ctx.save();
                ctx.font = `600 ${fontPx}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
                ctx.textAlign = "center";
                ctx.textBaseline = "bottom";
                ctx.lineWidth = 3 / zoom;
                ctx.strokeStyle = "rgba(30, 30, 30, 0.9)";
                ctx.strokeText(book.name, labelX, labelY);
                ctx.fillStyle = book.color;
                ctx.fillText(book.name, labelX, labelY);
                ctx.restore();
            }
        });
        return () => {
            network.destroy();
            networkRef.current = null;
            nodesRef.current = null;
        };
    }, [data]);
    React.useEffect(() => {
        const nodes = nodesRef.current;
        if (!nodes)
            return;
        const updates = data.nodes.map((n) => ({
            id: n.id,
            hidden: hideOrphans && n.orphan,
        }));
        nodes.update(updates);
    }, [hideOrphans, data]);
    React.useEffect(() => {
        networkRef.current?.redraw();
    }, [showBooks]);
    return ((0, jsx_runtime_1.jsx)("div", { ref: containerRef, style: {
            width: "100%",
            height: "100%",
            background: "#1e1e1e",
            borderRadius: 4,
        } }));
};
exports.default = ConstellationGraph;
