const IMAGE_CONFIG = {
  maxWidth: 1920,
  maxHeight: 1080,
  quality: 0.8,
  formats: ['webp', 'jpeg'] as const
};

interface OptimizeOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: typeof IMAGE_CONFIG.formats[number];
}

export async function optimizeImage(file: File): Promise<File> {
  if (!file.type.startsWith('image/')) {
    return file;
  }

  const options: OptimizeOptions = {
    maxWidth: IMAGE_CONFIG.maxWidth,
    maxHeight: IMAGE_CONFIG.maxHeight,
    quality: IMAGE_CONFIG.quality,
    format: 'webp'
  };

  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    img.onload = () => {
      let width = img.width;
      let height = img.height;

      if (width > options.maxWidth!) {
        height = (options.maxWidth! * height) / width;
        width = options.maxWidth!;
      }

      if (height > options.maxHeight!) {
        width = (options.maxHeight! * width) / height;
        height = options.maxHeight!;
      }

      canvas.width = width;
      canvas.height = height;

      ctx?.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to create blob'));
            return;
          }
          resolve(new File([blob], file.name, { 
            type: `image/${options.format}` 
          }));
        },
        `image/${options.format}`,
        options.quality
      );
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}

export async function generateThumbnail(file: File, size: number = 200): Promise<string> {
  const options: OptimizeOptions = {
    maxWidth: size,
    maxHeight: size,
    quality: 0.7,
    format: 'webp'
  };

  const optimized = await optimizeImage(file);
  return URL.createObjectURL(optimized);
}