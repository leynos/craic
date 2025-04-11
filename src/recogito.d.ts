declare module '@recogito/recogito-js' {
  export class Recogito {
    constructor(options: { content: HTMLElement; readOnly?: boolean });
    destroy(): void;
    setAnnotations(annotations: any[]): void;
    on(event: string, callback: (annotation: any) => void): void;
  }
} 