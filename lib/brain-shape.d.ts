import * as THREE from "three";
export type Vec3 = {
    x: number;
    y: number;
    z: number;
};
export type BrainLayout = {
    points: Vec3[];
    scale: number;
};
export declare const SCAFFOLD_POINTS = 980;
export declare function clamp(n: number, min: number, max: number): number;
export declare function easeOutCubic(t: number): number;
export declare function hash01(seed: string, salt: string): number;
export declare function createBrainLayout(count: number): BrainLayout;
export declare function createStartPosition(id: string, scale: number): THREE.Vector3;
export declare function createNeuralScaffold(scale: number, count: number): THREE.Group;
export declare function createBrainGuide(scale: number): THREE.Group;
