import { Recogito } from "@recogito/recogito-js";
import React, { useRef, useState } from "react";
import "@recogito/recogito-js/dist/recogito.min.css";

export const useRecogito = () => {
  const contentRef = useRef<HTMLDivElement>(null);
  const recogitoRef = useRef<Recogito | null>(null);
  const [isRecogitoInitialized, setIsRecogitoInitialized] = useState(false);

  const initializeRecogito = (content: string) => {
    if (contentRef.current && !isRecogitoInitialized) {
      // Destroy existing instance if it exists
      if (recogitoRef.current) {
        recogitoRef.current.destroy();
      }

      // Create new instance
      recogitoRef.current = new Recogito({
        content: contentRef.current,
        readOnly: false,
      });

      setIsRecogitoInitialized(true);
    }
  };

  const destroyRecogito = () => {
    if (recogitoRef.current) {
      recogitoRef.current.destroy();
      recogitoRef.current = null;
      setIsRecogitoInitialized(false);
    }
  };

  return {
    contentRef,
    recogitoRef,
    isRecogitoInitialized,
    initializeRecogito,
    destroyRecogito,
  };
};
