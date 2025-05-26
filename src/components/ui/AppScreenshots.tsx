import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button';
import { cn } from '../../lib/utils';

const SCREENSHOTS = [
  {
    src: '/screenshots/home.png',
    alt: 'Tela inicial do Sistema de Inspeções',
    description: 'Dashboard com visão geral das vistorias e atividades',
  },
  {
    src: '/screenshots/vistoria.png',
    alt: 'Formulário de vistoria',
    description: 'Formulário intuitivo para registro de vistorias em campo',
  },
  {
    src: '/screenshots/relatorio.png',
    alt: 'Geração de relatório',
    description: 'Geração automática de relatórios detalhados',
  },
];

interface AppScreenshotsProps {
  className?: string;
}

export function AppScreenshots({ className }: AppScreenshotsProps) {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(true);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? SCREENSHOTS.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === SCREENSHOTS.length - 1 ? 0 : prev + 1));
  };

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  return (
    <div className={cn('relative overflow-hidden rounded-lg', className)}>
      <div className="aspect-video relative">
        {/* Overlay de carregamento */}
        {isLoading && (
          <div className="absolute inset-0 bg-gray-100 animate-pulse" />
        )}

        {/* Imagem atual */}
        <img
          src={SCREENSHOTS[currentIndex].src}
          alt={SCREENSHOTS[currentIndex].alt}
          className={cn(
            'w-full h-full object-cover transition-opacity duration-300',
            {
              'opacity-0': isLoading,
              'opacity-100': !isLoading,
            }
          )}
          onLoad={handleImageLoad}
        />

        {/* Botões de navegação */}
        <div className="absolute inset-0 flex items-center justify-between p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={goToPrevious}
            className="bg-white/80 hover:bg-white/90"
          >
            <ChevronLeft size={24} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={goToNext}
            className="bg-white/80 hover:bg-white/90"
          >
            <ChevronRight size={24} />
          </Button>
        </div>

        {/* Indicadores */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {SCREENSHOTS.map((_, index) => (
            <button
              key={index}
              className={cn('w-2 h-2 rounded-full transition-colors', {
                'bg-white': index === currentIndex,
                'bg-white/50': index !== currentIndex,
              })}
              onClick={() => setCurrentIndex(index)}
            />
          ))}
        </div>
      </div>

      {/* Descrição */}
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">
          {SCREENSHOTS[currentIndex].description}
        </p>
      </div>
    </div>
  );
}
