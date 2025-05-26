import { useState, useCallback } from 'react';
import { getDB } from '../lib/db';
import { useOfflineSync } from './useOfflineSync';

interface PhotoMetadata {
  id: string;
  vistoriaId: string;
  timestamp: number;
  description?: string;
  localUrl: string;
  remoteUrl?: string;
  syncStatus: 'pending' | 'syncing' | 'synced' | 'error';
  retries?: number;
  error?: string;
}

export function usePhotoStorage(vistoriaId: string) {
  const [photos, setPhotos] = useState<PhotoMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addToSyncQueue } = useOfflineSync();

  const loadPhotos = useCallback(async () => {
    try {
      setIsLoading(true);
      const db = await getDB();
      const vistoriaPhotos = await db.getAllFromIndex(
        'photos',
        'por_vistoria',
        vistoriaId
      );
      setPhotos(vistoriaPhotos);
    } catch (error) {
      console.error('Erro ao carregar fotos:', error);
    } finally {
      setIsLoading(false);
    }
  }, [vistoriaId]);

  const savePhoto = useCallback(
    async (photo: Blob, description?: string) => {
      try {
        // Gera URL local para a foto
        const localUrl = URL.createObjectURL(photo);

        // Cria metadata da foto
        const photoMetadata: PhotoMetadata = {
          id: crypto.randomUUID(),
          vistoriaId,
          timestamp: Date.now(),
          description,
          localUrl,
          syncStatus: 'pending',
        };

        // Salva no IndexedDB
        const db = await getDB();
        await db.add('photos', photoMetadata);

        // Adiciona à fila de sincronização
        await addToSyncQueue({
          id: photoMetadata.id,
          type: 'foto',
          action: 'create',
          data: {
            photo,
            metadata: photoMetadata,
          },
        });

        // Atualiza estado local
        setPhotos((prev) => [...prev, photoMetadata]);

        return photoMetadata;
      } catch (error) {
        console.error('Erro ao salvar foto:', error);
        throw error;
      }
    },
    [vistoriaId, addToSyncQueue]
  );

  const deletePhoto = useCallback(
    async (photoId: string) => {
      try {
        const db = await getDB();
        const photo = await db.get('photos', photoId);

        if (photo) {
          // Remove URL local
          URL.revokeObjectURL(photo.localUrl);

          // Remove do IndexedDB
          await db.delete('photos', photoId);

          // Se já foi sincronizada, adiciona operação de delete à fila
          if (photo.syncStatus === 'synced' && photo.remoteUrl) {
            await addToSyncQueue({
              id: photoId,
              type: 'foto',
              action: 'delete',
              data: {
                remoteUrl: photo.remoteUrl,
              },
            });
          }

          // Atualiza estado local
          setPhotos((prev) => prev.filter((p) => p.id !== photoId));
        }
      } catch (error) {
        console.error('Erro ao deletar foto:', error);
        throw error;
      }
    },
    [addToSyncQueue]
  );

  const updatePhotoDescription = useCallback(
    async (photoId: string, description: string) => {
      try {
        const db = await getDB();
        const photo = await db.get('photos', photoId);

        if (photo) {
          const updatedPhoto = {
            ...photo,
            description,
            syncStatus:
              photo.syncStatus === 'synced' ? 'pending' : photo.syncStatus,
          };

          // Atualiza no IndexedDB
          await db.put('photos', updatedPhoto);

          // Se já foi sincronizada, adiciona operação de update à fila
          if (photo.syncStatus === 'synced') {
            await addToSyncQueue({
              id: photoId,
              type: 'foto',
              action: 'update',
              data: {
                description,
              },
            });
          }

          // Atualiza estado local
          setPhotos((prev) =>
            prev.map((p) => (p.id === photoId ? updatedPhoto : p))
          );
        }
      } catch (error) {
        console.error('Erro ao atualizar descrição da foto:', error);
        throw error;
      }
    },
    [addToSyncQueue]
  );

  return {
    photos,
    isLoading,
    savePhoto,
    deletePhoto,
    updatePhotoDescription,
    loadPhotos,
  };
}
