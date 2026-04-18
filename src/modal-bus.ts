const bus = new EventTarget();

export const emitToggle = () => bus.dispatchEvent(new Event("toggle"));

export const onToggle = (cb: () => void): (() => void) => {
  const handler = () => cb();
  bus.addEventListener("toggle", handler);
  return () => bus.removeEventListener("toggle", handler);
};
