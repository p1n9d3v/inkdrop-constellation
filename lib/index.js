"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const constellation_modal_1 = __importDefault(require("./constellation-modal"));
const constellation_pane_1 = __importDefault(require("./constellation-pane"));
const modal_bus_1 = require("./modal-bus");
const paneName = "ConstellationPane";
const modalName = "ConstellationModal";
const paneLayout = "mde";
const modalLayout = "modal";
let disposable = null;
module.exports = {
    activate() {
        inkdrop.components.registerClass(constellation_pane_1.default, paneName);
        inkdrop.layouts.insertComponentToLayoutAfter(paneLayout, "Editor", paneName);
        inkdrop.components.registerClass(constellation_modal_1.default, modalName);
        inkdrop.layouts.addComponentToLayout(modalLayout, modalName);
        disposable = inkdrop.commands.add(document.body, {
            "constellation:toggle-modal": () => (0, modal_bus_1.emitToggle)(),
        });
    },
    deactivate() {
        if (disposable) {
            disposable.dispose();
            disposable = null;
        }
        inkdrop.layouts.removeComponentFromLayout(modalLayout, modalName);
        inkdrop.components.deleteClass(constellation_modal_1.default);
        inkdrop.layouts.removeComponentFromLayout(paneLayout, paneName);
        inkdrop.components.deleteClass(constellation_pane_1.default);
    },
};
