import * as React from "react";
import type { GraphData } from "./load-notes";
type Props = {
    data: GraphData;
    hideOrphans: boolean;
    showBooks: boolean;
    isDragging?: boolean;
    onAfterOpen?: () => void;
};
declare const ConstellationGraph: React.FC<Props>;
export default ConstellationGraph;
