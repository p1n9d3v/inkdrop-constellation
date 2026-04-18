import GraphifyModal from "./graphify-modal";
import GraphifyPane from "./graphify-pane";
import { emitToggle } from "./modal-bus";

const paneName = "GraphifyPane";
const modalName = "GraphifyModal";
const paneLayout = "mde";
const modalLayout = "modal";

declare var inkdrop: any;

let disposable: any = null;

module.exports = {
  activate() {
    inkdrop.components.registerClass(GraphifyPane, paneName);
    inkdrop.layouts.insertComponentToLayoutAfter(
      paneLayout,
      "Editor",
      paneName,
    );

    inkdrop.components.registerClass(GraphifyModal, modalName);
    inkdrop.layouts.addComponentToLayout(modalLayout, modalName);

    disposable = inkdrop.commands.add(document.body, {
      "graphify:toggle-modal": () => emitToggle(),
    });
  },

  deactivate() {
    if (disposable) {
      disposable.dispose();
      disposable = null;
    }
    inkdrop.layouts.removeComponentFromLayout(modalLayout, modalName);
    inkdrop.components.deleteClass(GraphifyModal);
    inkdrop.layouts.removeComponentFromLayout(paneLayout, paneName);
    inkdrop.components.deleteClass(GraphifyPane);
  },
};
