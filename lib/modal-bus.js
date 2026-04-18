"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onToggle = exports.emitToggle = void 0;
const bus = new EventTarget();
const emitToggle = () => bus.dispatchEvent(new Event("toggle"));
exports.emitToggle = emitToggle;
const onToggle = (cb) => {
    const handler = () => cb();
    bus.addEventListener("toggle", handler);
    return () => bus.removeEventListener("toggle", handler);
};
exports.onToggle = onToggle;
