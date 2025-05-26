import React, { useRef, useEffect, useState } from 'react';
import { Eraser, Save, X } from 'lucide-react';
import { Button } from './Button';
import { cn } from '../../lib/utils';

interface SignaturePadProps {
  onSave: (signature: Blob) => void;
  onClose: () => void;
  className?: string;
}

export function SignaturePad({
  onSave,
  onClose,
  className,
}: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Configura o canvas para alta resolução em telas retina
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    const context = canvas.getContext('2d');
    if (!context) return;

    context.scale(dpr, dpr);
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.lineWidth = 2;
    context.strokeStyle = '#000000';

    contextRef.current = context;
  }, []);

  const startDrawing = (event: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (!canvas || !context) return;

    setIsDrawing(true);

    const { x, y } = getCoordinates(event, canvas);
    context.beginPath();
    context.moveTo(x, y);
  };

  const draw = (event: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (!canvas || !context) return;

    event.preventDefault(); // Previne scroll em touch devices

    const { x, y } = getCoordinates(event, canvas);
    context.lineTo(x, y);
    context.stroke();
  };

  const stopDrawing = () => {
    const context = contextRef.current;
    if (!context) return;

    context.closePath();
    setIsDrawing(false);
  };

  const getCoordinates = (
    event: React.MouseEvent | React.TouchEvent,
    canvas: HTMLCanvasElement
  ) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if ('touches' in event) {
      const touch = event.touches[0];
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
      };
    }

    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY,
    };
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (!canvas || !context) return;

    context.clearRect(0, 0, canvas.width, canvas.height);
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob(
      (blob) => {
        if (blob) {
          onSave(blob);
        }
      },
      'image/png',
      1.0
    );
  };

  return (
    <div className={cn('fixed inset-0 bg-white flex flex-col', className)}>
      <div className="flex justify-between items-center p-4 bg-gray-100">
        <Button variant="ghost" onClick={clear}>
          <Eraser size={20} className="mr-2" />
          Limpar
        </Button>
        <div>
          <Button variant="ghost" onClick={onClose} className="mr-2">
            <X size={20} className="mr-2" />
            Cancelar
          </Button>
          <Button onClick={saveSignature}>
            <Save size={20} className="mr-2" />
            Salvar
          </Button>
        </div>
      </div>

      <div className="flex-1 relative bg-white">
        <canvas
          ref={canvasRef}
          className="w-full h-full touch-none"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
      </div>

      <div className="p-4 text-center text-gray-500 text-sm">
        Assine no espaço acima usando o dedo ou uma caneta stylus
      </div>
    </div>
  );
}
