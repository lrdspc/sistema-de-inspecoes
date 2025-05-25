import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, File, AlertCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

interface FileUploadProps {
  onChange: (files: File[]) => void;
  value?: File[];
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in bytes
  maxFiles?: number;
  preview?: boolean;
  label?: string;
  error?: string;
  className?: string;
}

export function FileUpload({
  onChange,
  value = [],
  accept,
  multiple = false,
  maxSize,
  maxFiles = 10,
  preview = true,
  label,
  error,
  className,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const validateFile = (file: File): string | null => {
    if (accept) {
      const acceptedTypes = accept.split(',').map((type) => type.trim());
      const fileType = file.type;
      if (!acceptedTypes.some((type) => fileType.match(type))) {
        return 'Tipo de arquivo não permitido';
      }
    }

    if (maxSize && file.size > maxSize) {
      return `Arquivo muito grande. Tamanho máximo: ${(
        maxSize /
        1024 /
        1024
      ).toFixed(2)}MB`;
    }

    return null;
  };

  const handleFiles = (files: FileList) => {
    const fileArray = Array.from(files);
    const validFiles: File[] = [];
    const errors: string[] = [];

    if (fileArray.length + value.length > maxFiles) {
      errors.push(`Número máximo de arquivos excedido: ${maxFiles}`);
      return;
    }

    fileArray.forEach((file) => {
      const error = validateFile(file);
      if (error) {
        errors.push(`${file.name}: ${error}`);
      } else {
        validFiles.push(file);
      }
    });

    if (errors.length > 0) {
      alert(errors.join('\n'));
      return;
    }

    const newFiles = [...value, ...validFiles];
    onChange(newFiles);

    // Generate previews for images
    if (preview) {
      const newPreviews = validFiles.map((file) => {
        if (file.type.startsWith('image/')) {
          return URL.createObjectURL(file);
        }
        return '';
      });
      setPreviewUrls([...previewUrls, ...newPreviews]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const { files } = e.dataTransfer;
    handleFiles(files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;
    if (files) {
      handleFiles(files);
    }
  };

  const removeFile = (index: number) => {
    const newFiles = value.filter((_, i) => i !== index);
    onChange(newFiles);

    if (preview) {
      URL.revokeObjectURL(previewUrls[index]);
      const newPreviews = previewUrls.filter((_, i) => i !== index);
      setPreviewUrls(newPreviews);
    }
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <ImageIcon size={24} />;
    }
    return <File size={24} />;
  };

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}

      <div
        className={cn(
          'relative border-2 border-dashed rounded-lg p-4 transition-colors',
          isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300',
          error && 'border-red-500'
        )}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept={accept}
          multiple={multiple}
          onChange={handleFileInput}
        />

        <div className="text-center">
          <Upload
            className="mx-auto h-12 w-12 text-gray-400"
            onClick={() => fileInputRef.current?.click()}
          />
          <p className="mt-2 text-sm text-gray-600">
            Arraste e solte arquivos aqui ou{' '}
            <button
              type="button"
              className="text-blue-600 hover:text-blue-700"
              onClick={() => fileInputRef.current?.click()}
            >
              selecione do computador
            </button>
          </p>
          <p className="mt-1 text-xs text-gray-500">
            {accept && `Tipos permitidos: ${accept}`}
            {maxSize &&
              ` • Tamanho máximo: ${(maxSize / 1024 / 1024).toFixed(2)}MB`}
            {` • Máximo de ${maxFiles} ${
              maxFiles === 1 ? 'arquivo' : 'arquivos'
            }`}
          </p>
        </div>

        {value.length > 0 && (
          <div className="mt-4">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {value.map((file, index) => (
                <div
                  key={index}
                  className="relative rounded-lg border bg-white p-2"
                >
                  {preview && file.type.startsWith('image/') ? (
                    <img
                      src={previewUrls[index]}
                      alt={file.name}
                      className="h-32 w-full object-cover rounded"
                    />
                  ) : (
                    <div className="flex h-32 items-center justify-center bg-gray-50 rounded">
                      {getFileIcon(file)}
                    </div>
                  )}
                  <div className="mt-2">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(file.size / 1024).toFixed(2)}KB
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="absolute -right-2 -top-2 rounded-full bg-white p-1 shadow-sm hover:bg-gray-100"
                  >
                    <X size={16} className="text-gray-500" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-1 flex items-center text-sm text-red-600">
          <AlertCircle size={16} className="mr-1" />
          {error}
        </div>
      )}
    </div>
  );
}
