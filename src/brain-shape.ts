import * as THREE from "three";

export type Vec3 = { x: number; y: number; z: number };

export type BrainLayout = {
  points: Vec3[];
  scale: number;
};

export const SCAFFOLD_POINTS = 980;

const BRAIN_X_SCALE = 1.18;
const BRAIN_Z_SCALE = 0.82;

const BRAIN_SIDE_OUTLINE: Array<[number, number]> = [
  [-1.04, -0.16],
  [-1.02, 0.12],
  [-0.9, 0.38],
  [-0.68, 0.6],
  [-0.4, 0.74],
  [-0.08, 0.82],
  [0.26, 0.82],
  [0.58, 0.72],
  [0.84, 0.52],
  [1.02, 0.24],
  [1.08, -0.06],
  [1.0, -0.34],
  [0.8, -0.54],
  [0.56, -0.64],
  [0.48, -0.78],
  [0.4, -0.92],
  [0.22, -0.98],
  [0.08, -0.92],
  [0.04, -1.14],
  [-0.18, -1.18],
  [-0.27, -0.96],
  [-0.2, -0.78],
  [-0.34, -0.62],
  [-0.6, -0.5],
  [-0.84, -0.38],
  [-1.0, -0.26],
];

export function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

export function easeOutCubic(t: number): number {
  const p = clamp(t, 0, 1);
  return 1 - Math.pow(1 - p, 3);
}

function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function hash01(seed: string, salt: string): number {
  return hashStr(`${seed}:${salt}`) / 0xffffffff;
}

function radicalInverse(index: number, base: number): number {
  let result = 0;
  let fraction = 1 / base;
  let i = index;
  while (i > 0) {
    result += fraction * (i % base);
    i = Math.floor(i / base);
    fraction /= base;
  }
  return result;
}

function pointInPolygon(
  x: number,
  y: number,
  polygon: Array<[number, number]>
): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0];
    const yi = polygon[i][1];
    const xj = polygon[j][0];
    const yj = polygon[j][1];
    const intersects =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersects) inside = !inside;
  }
  return inside;
}

function isInsideBrainProfile(x: number, y: number): boolean {
  return pointInPolygon(x, y, BRAIN_SIDE_OUTLINE);
}

function brainDepth(x: number, y: number): number {
  if (y < -0.78) {
    const stemWidth = Math.max(0, 0.36 - Math.abs(x + 0.03));
    return 0.14 + stemWidth * 0.28;
  }
  const dome = Math.sqrt(
    clamp(
      1 -
        Math.pow((x - 0.05) / 1.12, 2) -
        Math.pow((y - 0.04) / 0.92, 2),
      0,
      1
    )
  );
  const lowerBulk = clamp((y + 0.72) / 0.32, 0, 1);
  const midBulk = clamp(1 - Math.abs(y + 0.04) / 0.95, 0, 1);
  return 0.18 + dome * (0.62 + midBulk * 0.14) * lowerBulk;
}

export function createBrainLayout(count: number): BrainLayout {
  const n = Math.max(count, 1);
  const scale = Math.max(130, Math.sqrt(n) * 16);
  const points: Vec3[] = [];
  const surfaceCount = Math.ceil(count * 0.54);
  let sample = 1;

  while (points.length < count && sample < n * 420 + 8000) {
    const x = radicalInverse(sample, 2) * 2.08 - 1.04;
    const y = radicalInverse(sample, 3) * 1.98 - 1.1;
    sample += 1;

    if (!isInsideBrainProfile(x, y)) continue;

    const depth = brainDepth(x, y);
    const r = radicalInverse(sample, 5);
    const side = sample % 2 === 0 ? 1 : -1;
    const interior = radicalInverse(sample, 7);
    const z =
      points.length < surfaceCount
        ? side * depth * (0.62 + r * 0.34)
        : (interior * 2 - 1) * depth * (0.34 + r * 0.5);

    points.push({
      x: x * scale * BRAIN_X_SCALE,
      y: y * scale,
      z: z * scale * BRAIN_Z_SCALE,
    });
  }

  while (points.length < count) {
    const i = points.length;
    const a = (i * 2 * Math.PI) / Math.max(count, 1);
    points.push({
      x: Math.cos(a) * scale,
      y: Math.sin(a) * scale * 0.65,
      z: Math.sin(a * 1.7) * scale * 0.36,
    });
  }

  return { points, scale };
}

export function createStartPosition(id: string, scale: number): THREE.Vector3 {
  const theta = hash01(id, "theta") * Math.PI * 2;
  const phi = Math.acos(hash01(id, "phi") * 2 - 1);
  const radius = scale * (2.15 + hash01(id, "radius") * 1.1);
  return new THREE.Vector3(
    Math.cos(theta) * Math.sin(phi) * radius,
    Math.cos(phi) * radius,
    Math.sin(theta) * Math.sin(phi) * radius
  );
}

function createLine(
  points: THREE.Vector3[],
  material: THREE.LineBasicMaterial
): THREE.Line {
  return new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), material);
}

function createOutlineLayer(scale: number, z: number): THREE.Vector3[] {
  const shrink = Math.sqrt(1 - Math.abs(z) * 0.34);
  const points = BRAIN_SIDE_OUTLINE.map(
    ([x, y]) =>
      new THREE.Vector3(
        x * scale * BRAIN_X_SCALE * shrink,
        y * scale * (0.98 + shrink * 0.02),
        z * scale * BRAIN_Z_SCALE
      )
  );
  const curve = new THREE.CatmullRomCurve3(points, true, "centripetal");
  return curve.getPoints(132);
}

function makeBrainPoint(
  seed: number,
  scale: number,
  mode: "shell" | "core"
): THREE.Vector3 | null {
  const x = radicalInverse(seed, 2) * 2.08 - 1.04;
  const y = radicalInverse(seed, 3) * 1.98 - 1.1;
  if (!isInsideBrainProfile(x, y)) return null;
  const depth = brainDepth(x, y);
  const side = seed % 2 === 0 ? 1 : -1;
  const spread = radicalInverse(seed, 5);
  const inside = radicalInverse(seed, 7);
  const z =
    mode === "shell"
      ? side * depth * (0.72 + spread * 0.24)
      : (inside * 2 - 1) * depth * (0.18 + spread * 0.46);
  return new THREE.Vector3(x * scale * BRAIN_X_SCALE, y * scale, z * scale * BRAIN_Z_SCALE);
}

export function createNeuralScaffold(scale: number, count: number): THREE.Group {
  const group = new THREE.Group();
  const shellPoints: THREE.Vector3[] = [];
  const corePoints: THREE.Vector3[] = [];
  let seed = 1;
  const shellCount = Math.ceil(count * 0.6);

  const outlinePoints = createOutlineLayer(scale, 0);
  for (let i = 0; i < outlinePoints.length; i += 2) {
    shellPoints.push(outlinePoints[i]);
  }

  while (shellPoints.length < shellCount && seed < count * 60) {
    const point = makeBrainPoint(seed, scale, "shell");
    if (point) shellPoints.push(point);
    seed += 1;
  }
  while (corePoints.length < count - shellCount && seed < count * 90) {
    const point = makeBrainPoint(seed, scale, "core");
    if (point) corePoints.push(point);
    seed += 1;
  }
  const points = [...shellPoints, ...corePoints];

  const shellGeometry = new THREE.BufferGeometry().setFromPoints(shellPoints);
  const shellMaterial = new THREE.PointsMaterial({
    color: 0xf5ffff,
    transparent: true,
    opacity: 0.94,
    size: Math.max(1.05, scale * 0.011),
    sizeAttenuation: true,
    depthWrite: false,
  });
  group.add(new THREE.Points(shellGeometry, shellMaterial));

  const coreGeometry = new THREE.BufferGeometry().setFromPoints(corePoints);
  const coreMaterial = new THREE.PointsMaterial({
    color: 0xd9ffff,
    transparent: true,
    opacity: 0.56,
    size: Math.max(0.7, scale * 0.0068),
    sizeAttenuation: true,
    depthWrite: false,
  });
  group.add(new THREE.Points(coreGeometry, coreMaterial));

  const linePoints: THREE.Vector3[] = [];
  const maxDistance = scale * 0.2;
  const offsets = [7, 17, 31, 47];
  for (let i = 0; i < points.length; i++) {
    for (const offset of offsets) {
      const other = points[(i + offset) % points.length];
      if (points[i].distanceTo(other) > maxDistance) continue;
      linePoints.push(points[i], other);
    }
  }

  const lineGeometry = new THREE.BufferGeometry().setFromPoints(linePoints);
  const lineMaterial = new THREE.LineBasicMaterial({
    color: 0xd9ffff,
    transparent: true,
    opacity: 0.075,
    depthWrite: false,
  });
  group.add(new THREE.LineSegments(lineGeometry, lineMaterial));

  return group;
}

export function createBrainGuide(scale: number): THREE.Group {
  const group = new THREE.Group();
  const foldMaterial = new THREE.LineBasicMaterial({
    color: 0xcfffff,
    transparent: true,
    opacity: 0.035,
    depthWrite: false,
  });

  for (let row = 0; row < 7; row++) {
    const y = 0.58 - row * 0.17;
    const z = -0.18 + (row % 3) * 0.18;
    const points: THREE.Vector3[] = [];
    for (let i = 0; i <= 96; i++) {
      const t = i / 96;
      const x = t * 1.78 - 0.9;
      const yy = y + Math.sin(t * Math.PI * 4 + row * 0.65) * 0.05;
      if (!isInsideBrainProfile(x, yy)) continue;
      const zz = clamp(z, -brainDepth(x, yy) * 0.92, brainDepth(x, yy) * 0.92);
      points.push(
        new THREE.Vector3(x * scale * BRAIN_X_SCALE, yy * scale, zz * scale * BRAIN_Z_SCALE)
      );
    }
    if (points.length > 2) group.add(createLine(points, foldMaterial));
  }

  return group;
}
