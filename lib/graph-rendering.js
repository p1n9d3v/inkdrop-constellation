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
exports.HIDDEN_TOOLTIP_TRANSFORM = exports.CYAN = exports.WHITE = exports.BASE_EDGE = exports.DIM_EDGE = exports.ACTIVE_EDGE = exports.MAX_PIXEL_RATIO = exports.FORMATION_MS = void 0;
exports.averageVectors = averageVectors;
exports.makeTextLabel = makeTextLabel;
exports.makeNodeLabel = makeNodeLabel;
exports.colorFromHex = colorFromHex;
exports.nodeColor = nodeColor;
exports.nodeDegree = nodeDegree;
exports.nodeBaseSize = nodeBaseSize;
exports.chooseHubIds = chooseHubIds;
exports.edgeColor = edgeColor;
exports.edgeLabel = edgeLabel;
exports.createEdgeBuffers = createEdgeBuffers;
exports.setEdgePosition = setEdgePosition;
exports.clearEdge = clearEdge;
exports.setEdgeColor = setEdgeColor;
exports.disposeObject = disposeObject;
const THREE = __importStar(require("three"));
exports.FORMATION_MS = 3200;
exports.MAX_PIXEL_RATIO = 2;
exports.ACTIVE_EDGE = 1.45;
exports.DIM_EDGE = 0.26;
exports.BASE_EDGE = 0.62;
exports.WHITE = new THREE.Color(0xf8ffff);
exports.CYAN = new THREE.Color(0xbfffff);
exports.HIDDEN_TOOLTIP_TRANSFORM = "translate3d(-9999px, -9999px, 0)";
const TAGGED_NODE_WHITE_MIX = 0.38;
const PLAIN_NODE_WHITE_MIX = 0.68;
function averageVectors(vectors) {
    const avg = new THREE.Vector3();
    if (vectors.length === 0)
        return avg;
    for (const v of vectors)
        avg.add(v);
    return avg.multiplyScalar(1 / vectors.length);
}
function makeTextLabel(text, color) {
    const el = document.createElement("div");
    el.textContent = text;
    el.style.position = "absolute";
    el.style.left = "0";
    el.style.top = "0";
    el.style.padding = "2px 4px";
    el.style.borderRadius = "4px";
    el.style.color = color;
    el.style.font = "600 11px -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif";
    el.style.textShadow = "0 1px 4px rgba(0, 0, 0, 0.9)";
    el.style.pointerEvents = "none";
    el.style.whiteSpace = "nowrap";
    el.style.maxWidth = "220px";
    el.style.overflow = "hidden";
    el.style.textOverflow = "ellipsis";
    el.style.opacity = "0";
    el.style.willChange = "transform, opacity";
    return el;
}
function makeNodeLabel(text, color) {
    const el = makeTextLabel(text, color);
    el.style.padding = "3px 6px";
    el.style.border = `1px solid ${color}66`;
    el.style.background = "rgba(4, 11, 13, 0.68)";
    el.style.boxShadow = `0 0 14px ${color}28`;
    el.style.backdropFilter = "blur(4px)";
    return el;
}
function colorFromHex(hex, fallback = 0xf8ffff) {
    try {
        return new THREE.Color(hex ?? fallback);
    }
    catch {
        return new THREE.Color(fallback);
    }
}
function nodeColor(node) {
    return colorFromHex(node.color.background).lerp(exports.WHITE, node.hasTag ? TAGGED_NODE_WHITE_MIX : PLAIN_NODE_WHITE_MIX);
}
function nodeDegree(node) {
    return Number.isFinite(node.degree) ? node.degree : Math.round(node.value * node.value);
}
function nodeBaseSize(degree, hub) {
    const degreeRoot = Math.sqrt(Math.max(degree, 1));
    return hub ? 4.8 + degreeRoot * 1.32 : 1.35 + degreeRoot * 0.38;
}
function chooseHubIds(data) {
    const ranked = data.nodes
        .map((node) => ({ id: node.id, degree: nodeDegree(node) }))
        .filter((node) => node.degree >= 3)
        .sort((a, b) => b.degree - a.degree || a.id.localeCompare(b.id));
    const limit = Math.ceil(ranked.length * 0.08);
    return new Set(ranked.slice(0, limit).map((node) => node.id));
}
function edgeColor(from, to) {
    return from.clone().lerp(to, 0.5).lerp(exports.CYAN, 0.36);
}
function edgeLabel(edge, fromLabel, toLabel) {
    if (edge.label)
        return edge.label;
    return `${fromLabel} ${edge.arrows === "to, from" ? "<->" : "->"} ${toLabel}`;
}
function createEdgeBuffers(edgeCount) {
    const segmentCount = Math.max(edgeCount, 1);
    const positions = new Float32Array(segmentCount * 6);
    const colors = new Float32Array(segmentCount * 6);
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3).setUsage(THREE.DynamicDrawUsage));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3).setUsage(THREE.DynamicDrawUsage));
    return { geometry, positions, colors };
}
function setEdgePosition(positions, index, from, to) {
    const offset = index * 6;
    positions[offset] = from.x;
    positions[offset + 1] = from.y;
    positions[offset + 2] = from.z;
    positions[offset + 3] = to.x;
    positions[offset + 4] = to.y;
    positions[offset + 5] = to.z;
}
function clearEdge(positions, colors, index) {
    const offset = index * 6;
    positions.fill(0, offset, offset + 6);
    colors.fill(0, offset, offset + 6);
}
function setEdgeColor(colors, index, color, intensity) {
    const offset = index * 6;
    const r = Math.min(1, color.r * intensity);
    const g = Math.min(1, color.g * intensity);
    const b = Math.min(1, color.b * intensity);
    colors[offset] = r;
    colors[offset + 1] = g;
    colors[offset + 2] = b;
    colors[offset + 3] = r;
    colors[offset + 4] = g;
    colors[offset + 5] = b;
}
function disposeObject(object) {
    const geometries = new Set();
    const materials = new Set();
    object.traverse((child) => {
        const mesh = child;
        const line = child;
        const points = child;
        const disposable = mesh.geometry ?? line.geometry ?? points.geometry;
        if (disposable)
            geometries.add(disposable);
        const material = mesh.material ?? line.material ?? points.material;
        if (Array.isArray(material)) {
            for (const m of material)
                materials.add(m);
        }
        else if (material) {
            materials.add(material);
        }
    });
    for (const geometry of geometries)
        geometry.dispose();
    for (const material of materials)
        material.dispose();
}
