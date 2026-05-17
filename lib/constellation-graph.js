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
const THREE = __importStar(require("three"));
const brain_shape_1 = require("./brain-shape");
const graph_rendering_1 = require("./graph-rendering");
const GRAPH_BACKGROUND = "radial-gradient(circle at 45% 32%, rgba(154, 244, 255, 0.16), transparent 28%), " +
    "radial-gradient(circle at 50% 55%, rgba(210, 255, 255, 0.09), transparent 36%), " +
    "linear-gradient(135deg, #05090a 0%, #172022 52%, #050708 100%)";
const CAMERA_FOV = 42;
const BRAIN_FIT_WIDTH = 2.62;
const BRAIN_FIT_HEIGHT = 2.2;
const LABEL_MARGIN = 8;
function defaultCameraDistance(scale, width, height) {
    if (width >= height)
        return scale * 3.85;
    const aspect = width / Math.max(height, 1);
    const fov = THREE.MathUtils.degToRad(CAMERA_FOV);
    const visibleRatio = 2 * Math.tan(fov / 2);
    const fitWidth = (scale * BRAIN_FIT_WIDTH) / (visibleRatio * Math.max(aspect, 0.2));
    const fitHeight = (scale * BRAIN_FIT_HEIGHT) / visibleRatio;
    return (0, brain_shape_1.clamp)(Math.max(fitWidth, fitHeight) * 0.96, scale * 4.25, scale * 6.55);
}
function clampLabelX(element, x, width) {
    const halfWidth = Math.min(element.offsetWidth / 2 || 0, Math.max(0, width / 2 - LABEL_MARGIN));
    const min = LABEL_MARGIN + halfWidth;
    const max = Math.max(min, width - LABEL_MARGIN - halfWidth);
    return (0, brain_shape_1.clamp)(x, min, max);
}
const ConstellationGraph = ({ data, hideOrphans, showBooks, onAfterOpen, }) => {
    const containerRef = React.useRef(null);
    const labelLayerRef = React.useRef(null);
    const tooltipRef = React.useRef(null);
    const hideOrphansRef = React.useRef(hideOrphans);
    const showBooksRef = React.useRef(showBooks);
    const onAfterOpenRef = React.useRef(onAfterOpen);
    hideOrphansRef.current = hideOrphans;
    showBooksRef.current = showBooks;
    onAfterOpenRef.current = onAfterOpen;
    React.useEffect(() => {
        const container = containerRef.current;
        const labelLayer = labelLayerRef.current;
        if (!container || !labelLayer)
            return;
        const host = container;
        const labels = labelLayer;
        labels.innerHTML = "";
        const layout = (0, brain_shape_1.createBrainLayout)(data.nodes.length);
        const scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0x0b1416, 0.001);
        const camera = new THREE.PerspectiveCamera(CAMERA_FOV, 1, 1, layout.scale * 10);
        camera.position.set(0, 0, layout.scale * 3.85);
        camera.lookAt(0, 0, 0);
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setClearColor(0x000000, 0);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, graph_rendering_1.MAX_PIXEL_RATIO));
        renderer.domElement.style.display = "block";
        renderer.domElement.style.width = "100%";
        renderer.domElement.style.height = "100%";
        renderer.domElement.style.cursor = "grab";
        host.appendChild(renderer.domElement);
        const ambient = new THREE.AmbientLight(0x9fb7ff, 0.7);
        const key = new THREE.DirectionalLight(0xffffff, 1.6);
        key.position.set(-0.7, 0.6, 1);
        const rim = new THREE.DirectionalLight(0x5aa9ff, 1.1);
        rim.position.set(1, -0.4, -0.8);
        scene.add(ambient, key, rim);
        const brainGroup = new THREE.Group();
        brainGroup.rotation.x = -0.08;
        brainGroup.rotation.y = -0.32;
        scene.add(brainGroup);
        brainGroup.add((0, brain_shape_1.createBrainGuide)(layout.scale));
        brainGroup.add((0, brain_shape_1.createNeuralScaffold)(layout.scale, brain_shape_1.SCAFFOLD_POINTS));
        const nodeGeometry = new THREE.IcosahedronGeometry(1, 2);
        const glowGeometry = new THREE.SphereGeometry(1, 24, 12);
        const indexById = new Map();
        const hubIds = (0, graph_rendering_1.chooseHubIds)(data);
        const renderNodes = data.nodes.map((node, i) => {
            const targetPoint = layout.points[i] ?? { x: 0, y: 0, z: 0 };
            const target = new THREE.Vector3(targetPoint.x, targetPoint.y, targetPoint.z);
            const start = (0, brain_shape_1.createStartPosition)(node.id, layout.scale);
            const normal = target.clone().normalize();
            if (normal.lengthSq() < 0.001)
                normal.set(0, 1, 0);
            const degree = (0, graph_rendering_1.nodeDegree)(node);
            const hub = hubIds.has(node.id);
            const color = (0, graph_rendering_1.nodeColor)(node);
            const material = new THREE.MeshBasicMaterial({
                color,
                transparent: true,
                opacity: 0.95,
                blending: hub ? THREE.AdditiveBlending : THREE.NormalBlending,
                depthWrite: false,
            });
            const mesh = new THREE.Mesh(nodeGeometry, material);
            mesh.position.copy(start);
            mesh.userData = {
                noteId: node.id,
                label: node.label,
                title: node.title,
                degree,
            };
            mesh.renderOrder = 2;
            brainGroup.add(mesh);
            const glow = hub
                ? new THREE.Mesh(glowGeometry, new THREE.MeshBasicMaterial({
                    color: color.clone().lerp(graph_rendering_1.CYAN, 0.72),
                    transparent: true,
                    opacity: 0.16,
                    blending: THREE.AdditiveBlending,
                    depthWrite: false,
                }))
                : null;
            if (glow) {
                glow.position.copy(start);
                glow.renderOrder = 1;
                brainGroup.add(glow);
            }
            indexById.set(node.id, i);
            const labelEl = (0, graph_rendering_1.makeNodeLabel)(node.label, `#${color.getHexString()}`);
            labels.appendChild(labelEl);
            return {
                id: node.id,
                title: node.title,
                label: node.label,
                orphan: node.orphan,
                degree,
                start,
                target,
                normal,
                mesh,
                glow,
                labelEl,
                color,
                baseSize: (0, graph_rendering_1.nodeBaseSize)(degree, hub),
                delayMs: (0, brain_shape_1.hash01)(node.id, "delay") * 650,
                phase: (0, brain_shape_1.hash01)(node.id, "phase") * Math.PI * 2,
                hub,
            };
        });
        const connectedByIndex = renderNodes.map(() => new Set());
        const edgePairs = data.edges
            .map((edge) => {
            const from = indexById.get(edge.from);
            const to = indexById.get(edge.to);
            if (from === undefined || to === undefined)
                return null;
            const fromNode = renderNodes[from];
            const toNode = renderNodes[to];
            return {
                from,
                to,
                label: (0, graph_rendering_1.edgeLabel)(edge, fromNode.label, toNode.label),
                color: (0, graph_rendering_1.edgeColor)(fromNode.color, toNode.color),
            };
        })
            .filter((edge) => !!edge);
        for (const edge of edgePairs) {
            connectedByIndex[edge.from].add(edge.to);
            connectedByIndex[edge.to].add(edge.from);
        }
        const { geometry: edgeGeometry, positions: edgePositions, colors: edgeColors, } = (0, graph_rendering_1.createEdgeBuffers)(edgePairs.length);
        const edgeMaterial = new THREE.LineBasicMaterial({
            vertexColors: true,
            transparent: true,
            opacity: 0.04,
            depthWrite: false,
        });
        const edgeLines = new THREE.LineSegments(edgeGeometry, edgeMaterial);
        brainGroup.add(edgeLines);
        const bookGroup = new THREE.Group();
        brainGroup.add(bookGroup);
        const renderBooks = data.books
            .map((book) => {
            const memberIndexes = book.memberIds
                .map((id) => indexById.get(id))
                .filter((idx) => idx !== undefined);
            if (memberIndexes.length === 0)
                return null;
            const material = new THREE.MeshBasicMaterial({
                color: new THREE.Color(book.color),
                transparent: true,
                opacity: 0.035,
                wireframe: true,
                depthWrite: false,
            });
            const mesh = new THREE.Mesh(new THREE.SphereGeometry(1, 28, 14), material);
            bookGroup.add(mesh);
            const label = (0, graph_rendering_1.makeTextLabel)(book.name, book.color);
            labels.appendChild(label);
            return { memberIndexes, mesh, label };
        })
            .filter((book) => !!book);
        const raycaster = new THREE.Raycaster();
        raycaster.params.Line = { threshold: layout.scale * 0.026 };
        const pointer = new THREE.Vector2();
        let userZoomed = false;
        const drag = {
            down: false,
            moved: false,
            lastX: 0,
            lastY: 0,
            hovered: null,
            hoveredEdge: null,
        };
        function resize() {
            const rect = host.getBoundingClientRect();
            const width = Math.max(1, rect.width);
            const height = Math.max(1, rect.height);
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            if (!userZoomed) {
                camera.position.z = defaultCameraDistance(layout.scale, width, height);
            }
            renderer.setSize(width, height, false);
        }
        function setPointerFromEvent(event) {
            const rect = renderer.domElement.getBoundingClientRect();
            pointer.x = ((event.clientX - rect.left) / Math.max(rect.width, 1)) * 2 - 1;
            pointer.y = -((event.clientY - rect.top) / Math.max(rect.height, 1)) * 2 + 1;
        }
        function visibleNodeMeshes() {
            return renderNodes
                .filter((node) => !(hideOrphansRef.current && node.orphan))
                .map((node) => node.mesh);
        }
        function isEdgeVisible(edge) {
            const from = renderNodes[edge.from];
            const to = renderNodes[edge.to];
            return (!!from &&
                !!to &&
                !(hideOrphansRef.current && (from.orphan || to.orphan)) &&
                from.mesh.visible &&
                to.mesh.visible);
        }
        function pickNode(event) {
            setPointerFromEvent(event);
            raycaster.setFromCamera(pointer, camera);
            const hits = raycaster.intersectObjects(visibleNodeMeshes(), false);
            const mesh = hits[0]?.object;
            if (!mesh)
                return null;
            return renderNodes.find((node) => node.mesh === mesh) ?? null;
        }
        function pickEdge(event) {
            setPointerFromEvent(event);
            raycaster.setFromCamera(pointer, camera);
            const hits = raycaster.intersectObject(edgeLines, false);
            for (const hit of hits) {
                const index = hit.index === undefined ? -1 : Math.floor(hit.index / 2);
                const edge = edgePairs[index];
                if (edge && isEdgeVisible(edge))
                    return edge;
            }
            return null;
        }
        function showTooltip(text, event) {
            const tooltip = tooltipRef.current;
            if (!tooltip)
                return;
            if (!text) {
                tooltip.style.opacity = "0";
                tooltip.style.transform = graph_rendering_1.HIDDEN_TOOLTIP_TRANSFORM;
                return;
            }
            tooltip.textContent = text;
            tooltip.style.opacity = "1";
            tooltip.style.transform = `translate3d(${event.clientX + 12}px, ${event.clientY + 12}px, 0)`;
        }
        function onPointerDown(event) {
            drag.down = true;
            drag.moved = false;
            drag.hoveredEdge = null;
            drag.lastX = event.clientX;
            drag.lastY = event.clientY;
            renderer.domElement.setPointerCapture(event.pointerId);
            renderer.domElement.style.cursor = "grabbing";
        }
        function onPointerMove(event) {
            if (drag.down) {
                const dx = event.clientX - drag.lastX;
                const dy = event.clientY - drag.lastY;
                drag.lastX = event.clientX;
                drag.lastY = event.clientY;
                if (Math.abs(dx) + Math.abs(dy) > 1)
                    drag.moved = true;
                brainGroup.rotation.y += dx * 0.006;
                brainGroup.rotation.x = (0, brain_shape_1.clamp)(brainGroup.rotation.x + dy * 0.004, -0.8, 0.55);
                return;
            }
            drag.hovered = pickNode(event);
            drag.hoveredEdge = drag.hovered ? null : pickEdge(event);
            renderer.domElement.style.cursor = drag.hovered ? "pointer" : "grab";
            const tooltipText = drag.hovered
                ? `${drag.hovered.title} · ${drag.hovered.degree} links`
                : drag.hoveredEdge?.label ?? null;
            showTooltip(tooltipText, event);
        }
        function onPointerUp(event) {
            drag.down = false;
            if (renderer.domElement.hasPointerCapture(event.pointerId)) {
                renderer.domElement.releasePointerCapture(event.pointerId);
            }
            renderer.domElement.style.cursor = drag.hovered ? "pointer" : "grab";
            if (drag.moved)
                return;
            const node = drag.hovered ?? pickNode(event);
            if (!node)
                return;
            try {
                if (typeof inkdrop !== "undefined") {
                    inkdrop.commands.dispatch(document.body, "core:open-note", {
                        noteId: node.id,
                    });
                    onAfterOpenRef.current?.();
                }
            }
            catch (e) {
                console.error("constellation: open-note failed", e);
            }
        }
        function onPointerLeave() {
            drag.down = false;
            drag.hovered = null;
            drag.hoveredEdge = null;
            renderer.domElement.style.cursor = "grab";
            const tooltip = tooltipRef.current;
            if (tooltip) {
                tooltip.style.opacity = "0";
                tooltip.style.transform = graph_rendering_1.HIDDEN_TOOLTIP_TRANSFORM;
            }
        }
        function onWheel(event) {
            event.preventDefault();
            userZoomed = true;
            camera.position.z = (0, brain_shape_1.clamp)(camera.position.z + event.deltaY * 0.18, layout.scale * 1.35, layout.scale * 8.5);
        }
        renderer.domElement.addEventListener("pointerdown", onPointerDown);
        renderer.domElement.addEventListener("pointermove", onPointerMove);
        renderer.domElement.addEventListener("pointerup", onPointerUp);
        renderer.domElement.addEventListener("pointerleave", onPointerLeave);
        renderer.domElement.addEventListener("wheel", onWheel, { passive: false });
        const resizeObserver = new ResizeObserver(resize);
        resizeObserver.observe(host);
        resize();
        const tmpWorld = new THREE.Vector3();
        const tmpScreen = new THREE.Vector3();
        const tmpColor = new THREE.Color();
        const tmpVectors = [];
        const startedAt = performance.now();
        let frame = 0;
        function updateBooks(width, height, formed) {
            bookGroup.visible = showBooksRef.current;
            if (!showBooksRef.current) {
                for (const book of renderBooks)
                    book.label.style.opacity = "0";
                return;
            }
            for (const book of renderBooks) {
                tmpVectors.length = 0;
                for (const index of book.memberIndexes) {
                    const node = renderNodes[index];
                    if (!node || (hideOrphansRef.current && node.orphan))
                        continue;
                    tmpVectors.push(node.mesh.position);
                }
                if (tmpVectors.length === 0) {
                    book.mesh.visible = false;
                    book.label.style.opacity = "0";
                    continue;
                }
                const center = (0, graph_rendering_1.averageVectors)(tmpVectors);
                let radius = layout.scale * 0.12;
                for (const v of tmpVectors) {
                    radius = Math.max(radius, center.distanceTo(v) + 12);
                }
                radius = Math.min(radius, layout.scale * 0.34);
                book.mesh.visible = formed > 0.35;
                book.mesh.position.copy(center);
                book.mesh.scale.set(radius * 1.15, radius * 0.78, radius * 0.7);
                book.mesh.material.opacity = 0.018 * formed;
                book.mesh.getWorldPosition(tmpWorld);
                tmpScreen.copy(tmpWorld).project(camera);
                const x = clampLabelX(book.label, (tmpScreen.x * 0.5 + 0.5) * width, width);
                const y = (-tmpScreen.y * 0.5 + 0.5) * height;
                const behindCamera = tmpScreen.z < -1 || tmpScreen.z > 1;
                book.label.style.opacity = behindCamera
                    ? "0"
                    : String(0.18 + 0.24 * formed);
                book.label.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -100%)`;
            }
        }
        function updateNodeLabels(width, height, formed) {
            const zoomedForLabels = camera.position.z < layout.scale * 2.75;
            const hoveredIndex = drag.hovered ? renderNodes.indexOf(drag.hovered) : -1;
            const edgeFrom = drag.hoveredEdge?.from ?? -1;
            const edgeTo = drag.hoveredEdge?.to ?? -1;
            for (let i = 0; i < renderNodes.length; i++) {
                const node = renderNodes[i];
                const hidden = hideOrphansRef.current && node.orphan;
                const endpoint = i === edgeFrom || i === edgeTo;
                const prominent = node.hub || i === hoveredIndex || endpoint;
                const visible = formed > 0.72 &&
                    !hidden &&
                    (prominent || (zoomedForLabels && node.degree >= 2));
                if (!visible) {
                    node.labelEl.style.opacity = "0";
                    continue;
                }
                node.mesh.getWorldPosition(tmpWorld);
                tmpScreen.copy(tmpWorld).project(camera);
                const behindCamera = tmpScreen.z < -1 || tmpScreen.z > 1;
                if (behindCamera) {
                    node.labelEl.style.opacity = "0";
                    continue;
                }
                const x = clampLabelX(node.labelEl, (tmpScreen.x * 0.5 + 0.5) * width, width);
                const y = (-tmpScreen.y * 0.5 + 0.5) * height;
                node.labelEl.style.opacity = String(i === hoveredIndex || endpoint ? 1 : node.hub ? 0.82 : 0.52);
                node.labelEl.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -145%)`;
            }
        }
        function animate(now) {
            const elapsed = now - startedAt;
            const formed = (0, brain_shape_1.easeOutCubic)(elapsed / graph_rendering_1.FORMATION_MS);
            const settle = (0, brain_shape_1.clamp)((elapsed - graph_rendering_1.FORMATION_MS) / 1200, 0, 1);
            const hoveredIndex = drag.hovered ? renderNodes.indexOf(drag.hovered) : -1;
            const hoveredEdge = drag.hoveredEdge;
            if (!drag.down) {
                brainGroup.rotation.y += 0.00045;
            }
            for (let i = 0; i < renderNodes.length; i++) {
                const node = renderNodes[i];
                const hidden = hideOrphansRef.current && node.orphan;
                node.mesh.visible = !hidden;
                if (node.glow)
                    node.glow.visible = !hidden;
                if (hidden)
                    continue;
                const t = (0, brain_shape_1.easeOutCubic)((elapsed - node.delayMs) / graph_rendering_1.FORMATION_MS);
                const pulse = settle * Math.sin(now * 0.0014 + node.phase) * 1.3;
                const edgeEndpoint = hoveredEdge !== null &&
                    (hoveredEdge.from === i || hoveredEdge.to === i);
                const connected = hoveredIndex >= 0 &&
                    (hoveredIndex === i || connectedByIndex[hoveredIndex].has(i));
                const active = edgeEndpoint || connected;
                const dimmed = (hoveredIndex >= 0 || hoveredEdge !== null) && !active;
                node.mesh.position.lerpVectors(node.start, node.target, t);
                node.mesh.position.addScaledVector(node.normal, pulse);
                const scale = node.baseSize * (0.5 + t * 0.5) * (active ? 1.16 : 1);
                node.mesh.scale.setScalar(scale);
                tmpColor.copy(node.color);
                if (active)
                    tmpColor.lerp(graph_rendering_1.WHITE, 0.5);
                if (dimmed)
                    tmpColor.multiplyScalar(0.44);
                node.mesh.material.color.copy(tmpColor);
                const baseOpacity = node.hub ? 0.86 + t * 0.14 : 0.72 + t * 0.28;
                node.mesh.material.opacity = dimmed
                    ? baseOpacity * 0.38
                    : Math.min(1, baseOpacity + (active ? 0.08 : 0));
                if (node.glow) {
                    node.glow.visible = true;
                    node.glow.position.copy(node.mesh.position);
                    node.glow.scale.setScalar(scale * (3.05 + Math.sin(now * 0.001 + node.phase) * 0.22));
                    node.glow.material.opacity =
                        (0.1 + t * 0.18) *
                            (0.9 + settle * 0.1) *
                            (dimmed ? 0.36 : active ? 1.25 : 1);
                }
            }
            for (let i = 0; i < edgePairs.length; i++) {
                const edge = edgePairs[i];
                const from = renderNodes[edge.from];
                const to = renderNodes[edge.to];
                const hidden = (hideOrphansRef.current && (from.orphan || to.orphan)) ||
                    !from.mesh.visible ||
                    !to.mesh.visible;
                if (hidden) {
                    (0, graph_rendering_1.clearEdge)(edgePositions, edgeColors, i);
                    continue;
                }
                (0, graph_rendering_1.setEdgePosition)(edgePositions, i, from.mesh.position, to.mesh.position);
                const edgeActive = hoveredEdge === edge ||
                    (hoveredIndex >= 0 &&
                        (edge.from === hoveredIndex || edge.to === hoveredIndex));
                const hasHover = hoveredIndex >= 0 || hoveredEdge !== null;
                (0, graph_rendering_1.setEdgeColor)(edgeColors, i, edgeActive ? edge.color.clone().lerp(graph_rendering_1.WHITE, 0.42) : edge.color, (edgeActive ? graph_rendering_1.ACTIVE_EDGE : hasHover ? graph_rendering_1.DIM_EDGE : graph_rendering_1.BASE_EDGE) *
                    (0.3 + formed * 0.7));
            }
            edgeGeometry.attributes.position.needsUpdate = true;
            edgeGeometry.attributes.color.needsUpdate = true;
            edgeMaterial.opacity = 0.035 + formed * 0.12;
            const size = renderer.getSize(new THREE.Vector2());
            updateBooks(size.x, size.y, formed);
            updateNodeLabels(size.x, size.y, formed);
            renderer.render(scene, camera);
            frame = requestAnimationFrame(animate);
        }
        frame = requestAnimationFrame(animate);
        return () => {
            cancelAnimationFrame(frame);
            resizeObserver.disconnect();
            renderer.domElement.removeEventListener("pointerdown", onPointerDown);
            renderer.domElement.removeEventListener("pointermove", onPointerMove);
            renderer.domElement.removeEventListener("pointerup", onPointerUp);
            renderer.domElement.removeEventListener("pointerleave", onPointerLeave);
            renderer.domElement.removeEventListener("wheel", onWheel);
            labels.innerHTML = "";
            (0, graph_rendering_1.disposeObject)(scene);
            renderer.dispose();
            renderer.domElement.remove();
        };
    }, [data]);
    return ((0, jsx_runtime_1.jsxs)("div", { ref: containerRef, style: {
            width: "100%",
            height: "100%",
            position: "relative",
            overflow: "hidden",
            background: GRAPH_BACKGROUND,
            borderRadius: 4,
        }, children: [(0, jsx_runtime_1.jsx)("div", { ref: labelLayerRef, style: {
                    position: "absolute",
                    inset: 0,
                    pointerEvents: "none",
                    zIndex: 1,
                } }), (0, jsx_runtime_1.jsx)("div", { ref: tooltipRef, style: {
                    position: "fixed",
                    zIndex: 10000,
                    maxWidth: 220,
                    padding: "4px 7px",
                    borderRadius: 4,
                    background: "rgba(15, 18, 24, 0.92)",
                    border: "1px solid rgba(255, 255, 255, 0.14)",
                    color: "#f5f7fb",
                    fontSize: 12,
                    lineHeight: "16px",
                    opacity: 0,
                    pointerEvents: "none",
                    transform: graph_rendering_1.HIDDEN_TOOLTIP_TRANSFORM,
                    transition: "opacity 120ms ease",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                } })] }));
};
exports.default = ConstellationGraph;
