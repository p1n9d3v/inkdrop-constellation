import * as React from "react";

declare var inkdrop: any;

export type EditingNote = {
  _id: string;
  title: string;
  body: string;
} | null;

export function useEditingNote(): EditingNote {
  const getNote = (): EditingNote => {
    const state = inkdrop.store?.getState?.();
    const note = state?.editingNote;
    if (!note || !note._id) return null;
    return { _id: note._id, title: note.title ?? "", body: note.body ?? "" };
  };

  const [note, setNote] = React.useState<EditingNote>(getNote);

  React.useEffect(() => {
    const unsubscribe = inkdrop.store?.subscribe?.(() => {
      const next = getNote();
      setNote((prev) => {
        if (prev?._id === next?._id && prev?.body === next?.body) return prev;
        return next;
      });
    });
    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, []);

  return note;
}
