export type EditingNote = {
    _id: string;
    title: string;
    body: string;
} | null;
export declare function useEditingNote(): EditingNote;
