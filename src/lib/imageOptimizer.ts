const IMAGE_CONFIG = {
  maxWidth: 1920,
  maxHeight: 1080,
  quality: 0.8,
  formats: ['webp', 'jpeg'] as const,
};

interface OptimizeImageOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'image/jpeg' | 'image/png' | 'image/webp';
}

export const optimizeImage = async (
  file: File | Blob,
  options: OptimizeImageOptions = {}
): Promise<Blob> => {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 0.8,
    format = 'image/jpeg',
  } = options;

  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      let width = img.width;
      let height = img.height;

      // Calcular dimensões mantendo proporção
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }
      if (height > maxHeight) {
        width = Math.round((width * maxHeight) / height);
        height = maxHeight;
      }

      // Criar canvas para redimensionamento
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Não foi possível criar contexto 2D'));
        return;
      }

      // Desenhar imagem redimensionada
      ctx.drawImage(img, 0, 0, width, height);

      // Converter para blob
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Falha ao otimizar imagem'));
            return;
          }
          resolve(blob);
        },
        format,
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Falha ao carregar imagem'));
    };

    img.src = url;
  });
};

export const compressImage = async (
  file: File,
  maxSizeKB: number = 1024
): Promise<Blob> => {
  let quality = 0.8;
  let result = await optimizeImage(file, { quality });

  // Reduzir qualidade até atingir tamanho desejado
  while (result.size > maxSizeKB * 1024 && quality > 0.1) {
    quality -= 0.1;
    result = await optimizeImage(file, { quality });
  }

  return result;
};

export async function generateThumbnail(
  file: File,
  size: number = 200
): Promise<string> {
  const options: OptimizeImageOptions = {
    maxWidth: size,
    maxHeight: size,
    quality: 0.7,
    format: 'image/webp',
  };

  const optimized = await optimizeImage(file, options);
  return URL.createObjectURL(optimized);
}
