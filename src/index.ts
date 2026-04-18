import ConstellationModal from "./graphify-modal";
import ConstellationPane from "./graphify-pane";
import { emitToggle } from "./modal-bus";

const paneName = "ConstellationPane";
const modalName = "ConstellationModal";
const paneLayout = "mde";
const modalLayout = "modal";

declare var inkdrop: any;

let disposable: any = null;

module.exports = {
  activate() {
    inkdrop.components.registerClass(ConstellationPane, paneName);
    inkdrop.layouts.insertComponentToLayoutAfter(
      paneLayout,
      "Editor",
      paneName,
    );

    inkdrop.components.registerClass(ConstellationModal, modalName);
    inkdrop.layouts.addComponentToLayout(modalLayout, modalName);

    disposable = inkdrop.commands.add(document.body, {
      "constellation:toggle-modal": () => emitToggle(),
    });
  },

  deactivate() {
    if (disposable) {
      disposable.dispose();
      disposable = null;
    }
    inkdrop.layouts.removeComponentFromLayout(modalLayout, modalName);
    inkdrop.components.deleteClass(ConstellationModal);
    inkdrop.layouts.removeComponentFromLayout(paneLayout, paneName);
    inkdrop.components.deleteClass(ConstellationPane);
  },
};
