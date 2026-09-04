export type Point = {
    x: number;
    y: number;
    timestamp: number;
};

export type StrokeTemplate = {
    strokes: Point[][];
};

export type CharacterTask = {
    id: string;
    character: string;
    title: string;
    instruction: string;
    template: StrokeTemplate;
};

// Placeholder templates for now, to be populated in Phase 5
const KSHA_TEMPLATE: StrokeTemplate = { strokes: [] };
const NJNA_TEMPLATE: StrokeTemplate = { strokes: [] };

export const CHARACTER_TASKS: CharacterTask[] = [
    {
        id: "ksha",
        character: "ക്ഷ",
        title: "Write ക്ഷ with your nose",
        instruction: "Trace the character shown on screen.",
        template: KSHA_TEMPLATE,
    },
    {
        id: "njna",
        character: "ഞ്ഞ",
        title: "Write ഞ്ഞ with your nose",
        instruction: "Trace the character shown on screen.",
        template: NJNA_TEMPLATE,
    },
];
