import React, { useRef, useState, useCallback } from 'react';
import { Camera, FlipCamera, X } from 'lucide-react';
import { Button } from './Button';
import { cn } from '../../lib/utils';

interface CameraCaptureProps {
  onCapture: (photo: Blob) => void;
  onClose: () => void;
  className?: string;
}

export function CameraCapture({
  onCapture,
  onClose,
  className,
}: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>(
    'environment'
  );

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsStreaming(true);
      }
    } catch (error) {
      console.error('Erro ao acessar câmera:', error);
    }
  }, [facingMode]);

  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
      setIsStreaming(false);
    }
  }, []);

  const toggleCamera = useCallback(() => {
    stopCamera();
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  }, [stopCamera]);

  const capturePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (context) {
        // Ajusta o canvas para o tamanho do vídeo
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Desenha o frame atual do vídeo no canvas
        context.drawImage(video, 0, 0);

        // Converte o canvas para Blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              onCapture(blob);
            }
          },
          'image/jpeg',
          0.8
        );
      }
    }
  }, [onCapture]);

  React.useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  return (
    <div className={cn('fixed inset-0 bg-black flex flex-col', className)}>
      <div className="flex justify-between items-center p-4 bg-gray-900">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleCamera}
          className="text-white"
        >
          <FlipCamera size={24} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="text-white"
        >
          <X size={24} />
        </Button>
      </div>

      <div className="flex-1 relative">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
        <canvas ref={canvasRef} className="hidden" />
      </div>

      <div className="p-4 bg-gray-900">
        <Button
          onClick={capturePhoto}
          className="w-16 h-16 rounded-full bg-white hover:bg-gray-200 flex items-center justify-center mx-auto"
        >
          <Camera size={32} className="text-gray-900" />
        </Button>
      </div>
    </div>
  );
}
