export type Heading = {
    level: number;
    text: string;
    line: number;
};
export declare function extractHeadings(body: string): Heading[];
export declare function jumpToLine(line: number): void;
export declare function jumpToHeading(heading: Heading, index: number): void;
