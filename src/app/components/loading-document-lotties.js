'use client';

import Lottie from 'lottie-react'; // Ensure you import the right types
import React, { useEffect, useRef } from 'react';

import documentLoading from '../assets/document-loading.json';

export const LoadingDocumentLottie = ({ playAnimation }) => {
  const lottieRef = useRef(null); // Create a ref using useRef

  useEffect(() => {
    if (lottieRef.current) {
      if (playAnimation) {
        lottieRef.current.play(); // Play animation when `playAnimation` is true
      } else {
        lottieRef.current.stop(); // Stop the animation when not playing
      }
    }
  }, [playAnimation]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50 z-50">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-sm w-full">
        <div className="flex justify-center w-32 mx-auto">
          <Lottie
            lottieRef={lottieRef}
            width={20}
            height={20}
            animationData={JSON.parse(JSON.stringify(documentLoading))}
            loop={true}
          />
        </div>
        <p className="text-center mt-4 text-gray-900">processing document...</p>
      </div>
    </div>
  );
};
