import React, { useEffect, useRef, useState } from 'react';
import { Recogito } from '@recogito/recogito-js';
import ReactMarkdown from 'react-markdown';
import '@recogito/recogito-js/dist/recogito.min.css';

interface Annotation {
  speaker: string;
  mark: string[];
}

interface MarkdownAnnotatorProps {
  content: string;
  annotations: Annotation[];
  onAnnotationCreate?: (annotation: any) => void;
}

const MarkdownAnnotator: React.FC<MarkdownAnnotatorProps> = ({ content, annotations, onAnnotationCreate }) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const recogitoRef = useRef<Recogito | null>(null);
  const [isRecogitoInitialized, setIsRecogitoInitialized] = useState(false);

  // Initialize Recogito after the markdown is rendered
  useEffect(() => {
    if (contentRef.current && !isRecogitoInitialized && !recogitoRef.current) {
      recogitoRef.current = new Recogito({
        content: contentRef.current,
        readOnly: false, // Allow editing
      });

      // Convert internal annotations to WebAnnotation format
      const webAnnotations = annotations.map((annotation) => ({
        '@context': 'http://www.w3.org/ns/anno.jsonld',
        type: 'Annotation',
        body: [
          {
            type: 'TextualBody',
            value: annotation.speaker,
          },
        ],
        target: {
          selector: {
            type: 'TextPositionSelector',
            start: annotation.mark[0],
            end: annotation.mark[1],
          },
        },
      }));

      // Set existing annotations
      recogitoRef.current.setAnnotations(webAnnotations);

      // Add event handler for creating annotations
      recogitoRef.current.on('createAnnotation', (annotation) => {
        if (onAnnotationCreate) {
          onAnnotationCreate(annotation);
        }
      });

      setIsRecogitoInitialized(true);

      return () => {
        if (recogitoRef.current) {
          recogitoRef.current.destroy();
          recogitoRef.current = null;
          setIsRecogitoInitialized(false);
        }
      };
    }
  }, [content, annotations, onAnnotationCreate]);

  return (
    <div className="markdown-container">
      <div ref={contentRef} className="markdown-content">
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    </div>
  );
};

export default MarkdownAnnotator; 