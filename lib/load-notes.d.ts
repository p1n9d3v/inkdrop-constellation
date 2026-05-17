export type GraphNode = {
    id: string;
    title: string;
    label: string;
    orphan: boolean;
    hasTag: boolean;
    color: {
        background: string;
        border: string;
    };
    degree: number;
    value: number;
};
export type GraphEdge = {
    id: string;
    from: string;
    to: string;
    label: string;
    arrows: "to" | "to, from";
};
export type GraphBook = {
    id: string;
    name: string;
    color: string;
    memberIds: string[];
};
export type GraphData = {
    nodes: GraphNode[];
    edges: GraphEdge[];
    books: GraphBook[];
};
export declare function loadGraph(): Promise<GraphData>;
