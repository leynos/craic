import { Recogito } from "@recogito/recogito-js";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import "@recogito/recogito-js/dist/recogito.min.css";
import type { Annotation } from "../hooks/useDocumentManagement";

interface MarkdownAnnotatorProps {
  content: string;
  annotations: Annotation[];
  onAnnotationCreate?: (annotation: Annotation) => void;
}

const MarkdownAnnotator: React.FC<MarkdownAnnotatorProps> = ({
  content,
  annotations,
  onAnnotationCreate,
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const recogitoRef = useRef<Recogito | null>(null);
  const [isRecogitoInitialized, setIsRecogitoInitialized] = useState(false);

  // Initialize Recogito after the markdown is rendered
  useEffect(() => {
    if (contentRef.current && !isRecogitoInitialized && !recogitoRef.current) {
      recogitoRef.current = new Recogito({
        content: contentRef.current,
        readOnly: false,
      });

      if (onAnnotationCreate) {
        recogitoRef.current.on("createAnnotation", onAnnotationCreate);
      }

      setIsRecogitoInitialized(true);
    }

    return () => {
      if (recogitoRef.current) {
        recogitoRef.current.destroy();
        recogitoRef.current = null;
        setIsRecogitoInitialized(false);
      }
    };
  }, [isRecogitoInitialized, onAnnotationCreate]);

  // Update annotations when they change
  useEffect(() => {
    if (recogitoRef.current) {
      recogitoRef.current.setAnnotations(annotations);
    }
  }, [annotations]);

  return (
    <div className="markdown-annotator">
      <div ref={contentRef}>
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    </div>
  );
};

export default MarkdownAnnotator;
