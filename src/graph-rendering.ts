import * as THREE from "three";
import type { GraphData } from "./load-notes";

export type RenderNode = {
  id: string;
  title: string;
  label: string;
  orphan: boolean;
  degree: number;
  start: THREE.Vector3;
  target: THREE.Vector3;
  normal: THREE.Vector3;
  mesh: THREE.Mesh<THREE.BufferGeometry, THREE.MeshBasicMaterial>;
  glow: THREE.Mesh<THREE.SphereGeometry, THREE.MeshBasicMaterial> | null;
  labelEl: HTMLDivElement;
  color: THREE.Color;
  baseSize: number;
  delayMs: number;
  phase: number;
  hub: boolean;
  labelWidth?: number;
};

export type RenderEdge = {
  from: number;
  to: number;
  label: string;
  color: THREE.Color;
};

export type RenderBook = {
  memberIndexes: number[];
  mesh: THREE.Mesh<THREE.SphereGeometry, THREE.MeshBasicMaterial>;
  label: HTMLDivElement;
  labelWidth?: number;
};

export const FORMATION_MS = 3200;
export const MAX_PIXEL_RATIO = 2;
export const ACTIVE_EDGE = 1.45;
export const DIM_EDGE = 0.26;
export const BASE_EDGE = 0.62;
export const WHITE = new THREE.Color(0xf8ffff);
export const CYAN = new THREE.Color(0xbfffff);
export const HIDDEN_TOOLTIP_TRANSFORM = "translate3d(-9999px, -9999px, 0)";

const TAGGED_NODE_WHITE_MIX = 0.38;
const PLAIN_NODE_WHITE_MIX = 0.68;

export function averageVectors(vectors: THREE.Vector3[]): THREE.Vector3 {
  const avg = new THREE.Vector3();
  if (vectors.length === 0) return avg;
  for (const v of vectors) avg.add(v);
  return avg.multiplyScalar(1 / vectors.length);
}

export function makeTextLabel(text: string, color: string): HTMLDivElement {
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

export function makeNodeLabel(text: string, color: string): HTMLDivElement {
  const el = makeTextLabel(text, color);
  el.style.padding = "3px 6px";
  el.style.border = `1px solid ${color}66`;
  el.style.background = "rgba(4, 11, 13, 0.68)";
  el.style.boxShadow = `0 0 14px ${color}28`;
  el.style.backdropFilter = "blur(4px)";
  return el;
}

export function colorFromHex(hex: string | undefined, fallback = 0xf8ffff): THREE.Color {
  try {
    return new THREE.Color(hex ?? fallback);
  } catch {
    return new THREE.Color(fallback);
  }
}

export function nodeColor(node: GraphData["nodes"][number]): THREE.Color {
  return colorFromHex(node.color.background).lerp(
    WHITE,
    node.hasTag ? TAGGED_NODE_WHITE_MIX : PLAIN_NODE_WHITE_MIX
  );
}

export function nodeDegree(node: GraphData["nodes"][number]): number {
  return Number.isFinite(node.degree) ? node.degree : Math.round(node.value * node.value);
}

export function nodeBaseSize(degree: number, hub: boolean): number {
  const degreeRoot = Math.sqrt(Math.max(degree, 1));
  return hub ? 4.8 + degreeRoot * 1.32 : 1.35 + degreeRoot * 0.38;
}

export function chooseHubIds(data: GraphData): Set<string> {
  const ranked = data.nodes
    .map((node) => ({ id: node.id, degree: nodeDegree(node) }))
    .filter((node) => node.degree >= 3)
    .sort((a, b) => b.degree - a.degree || a.id.localeCompare(b.id));
  const limit = Math.ceil(ranked.length * 0.08);
  return new Set(ranked.slice(0, limit).map((node) => node.id));
}

export function edgeColor(from: THREE.Color, to: THREE.Color): THREE.Color {
  return from.clone().lerp(to, 0.5).lerp(CYAN, 0.36);
}

export function edgeLabel(
  edge: GraphData["edges"][number],
  fromLabel: string,
  toLabel: string
): string {
  if (edge.label) return edge.label;
  return `${fromLabel} ${edge.arrows === "to, from" ? "<->" : "->"} ${toLabel}`;
}

export function createEdgeBuffers(edgeCount: number): {
  geometry: THREE.BufferGeometry;
  positions: Float32Array;
  colors: Float32Array;
} {
  const segmentCount = Math.max(edgeCount, 1);
  const positions = new Float32Array(segmentCount * 6);
  const colors = new Float32Array(segmentCount * 6);
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.BufferAttribute(positions, 3).setUsage(THREE.DynamicDrawUsage)
  );
  geometry.setAttribute(
    "color",
    new THREE.BufferAttribute(colors, 3).setUsage(THREE.DynamicDrawUsage)
  );
  return { geometry, positions, colors };
}

export function setEdgePosition(
  positions: Float32Array,
  index: number,
  from: THREE.Vector3,
  to: THREE.Vector3
) {
  const offset = index * 6;
  positions[offset] = from.x;
  positions[offset + 1] = from.y;
  positions[offset + 2] = from.z;
  positions[offset + 3] = to.x;
  positions[offset + 4] = to.y;
  positions[offset + 5] = to.z;
}

export function clearEdge(
  positions: Float32Array,
  colors: Float32Array,
  index: number
) {
  const offset = index * 6;
  positions.fill(0, offset, offset + 6);
  colors.fill(0, offset, offset + 6);
}

export function setEdgeColor(
  colors: Float32Array,
  index: number,
  color: THREE.Color,
  intensity: number
) {
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

export function disposeObject(object: THREE.Object3D) {
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();
  object.traverse((child) => {
    const mesh = child as THREE.Mesh;
    const line = child as THREE.LineSegments;
    const points = child as THREE.Points;
    const disposable = mesh.geometry ?? line.geometry ?? points.geometry;
    if (disposable) geometries.add(disposable);

    const material = mesh.material ?? line.material ?? points.material;
    if (Array.isArray(material)) {
      for (const m of material) materials.add(m);
    } else if (material) {
      materials.add(material);
    }
  });
  for (const geometry of geometries) geometry.dispose();
  for (const material of materials) material.dispose();
}
