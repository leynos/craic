import type { Annotation } from "./hooks/useDocumentManagement";

declare module "@recogito/recogito-js" {
  export class Recogito {
    constructor(options: { content: HTMLElement; readOnly?: boolean });
    destroy(): void;
    setAnnotations(annotations: Annotation[]): void;
    on(event: string, callback: (annotation: Annotation) => void): void;
  }
}
