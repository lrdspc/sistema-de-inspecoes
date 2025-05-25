import { useState, useCallback } from 'react';

interface UseCameraOptions {
  facingMode?: 'user' | 'environment';
  audio?: boolean;
}

export const useCamera = () => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const startCamera = useCallback(async (options: UseCameraOptions = {}) => {
    try {
      const constraints = {
        video: {
          facingMode: options.facingMode || 'environment',
        },
        audio: options.audio || false,
      };

      const mediaStream =
        await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      setError(null);
      return mediaStream;
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error('Failed to access camera')
      );
      setStream(null);
      throw err;
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  }, [stream]);

  const takePhoto = useCallback(async () => {
    if (!stream) throw new Error('Camera not started');

    const video = document.createElement('video');
    video.srcObject = stream;
    await video.play();

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext('2d');
    context?.drawImage(video, 0, 0);

    return canvas.toDataURL('image/jpeg');
  }, [stream]);

  return {
    stream,
    error,
    startCamera,
    stopCamera,
    takePhoto,
    isActive: !!stream,
  };
};
