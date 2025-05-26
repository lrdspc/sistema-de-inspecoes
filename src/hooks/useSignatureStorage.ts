import { useState, useCallback } from 'react';
import { getDB, SignatureMetadata } from '../lib/db';
import { useOfflineSync } from './useOfflineSync';

export function useSignatureStorage(vistoriaId: string, relatorioId?: string) {
  const [signatures, setSignatures] = useState<SignatureMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addToSyncQueue } = useOfflineSync();

  const loadSignatures = useCallback(async () => {
    try {
      setIsLoading(true);
      const db = await getDB();
      const allSignatures = await db.getAllFromIndex(
        'signatures',
        'por_vistoria',
        vistoriaId
      );
      setSignatures(allSignatures);
    } catch (error) {
      console.error('Erro ao carregar assinaturas:', error);
    } finally {
      setIsLoading(false);
    }
  }, [vistoriaId]);

  const saveSignature = useCallback(
    async (signature: Blob, tipo: 'tecnico' | 'cliente') => {
      try {
        // Gera URL local para a assinatura
        const localUrl = URL.createObjectURL(signature);

        // Cria metadata da assinatura
        const signatureMetadata: SignatureMetadata = {
          id: crypto.randomUUID(),
          vistoriaId,
          relatorioId,
          tipo,
          timestamp: Date.now(),
          localUrl,
          syncStatus: 'pending',
        };

        // Salva no IndexedDB
        const db = await getDB();
        await db.add('signatures', signatureMetadata);

        // Adiciona à fila de sincronização
        await addToSyncQueue({
          id: signatureMetadata.id,
          type: 'assinatura',
          action: 'create',
          data: {
            signature,
            metadata: signatureMetadata,
          },
        });

        // Atualiza estado local
        setSignatures((prev) => [...prev, signatureMetadata]);

        return signatureMetadata;
      } catch (error) {
        console.error('Erro ao salvar assinatura:', error);
        throw error;
      }
    },
    [vistoriaId, relatorioId, addToSyncQueue]
  );

  const deleteSignature = useCallback(
    async (signatureId: string) => {
      try {
        const db = await getDB();
        const signature = await db.get('signatures', signatureId);

        if (signature) {
          // Remove URL local
          URL.revokeObjectURL(signature.localUrl);

          // Remove do IndexedDB
          await db.delete('signatures', signatureId);

          // Se já foi sincronizada, adiciona operação de delete à fila
          if (signature.syncStatus === 'synced' && signature.remoteUrl) {
            await addToSyncQueue({
              id: signatureId,
              type: 'assinatura',
              action: 'delete',
              data: {
                remoteUrl: signature.remoteUrl,
              },
            });
          }

          // Atualiza estado local
          setSignatures((prev) => prev.filter((s) => s.id !== signatureId));
        }
      } catch (error) {
        console.error('Erro ao deletar assinatura:', error);
        throw error;
      }
    },
    [addToSyncQueue]
  );

  const getSignatureByType = useCallback(
    (tipo: 'tecnico' | 'cliente') => {
      return signatures.find((s) => s.tipo === tipo);
    },
    [signatures]
  );

  return {
    signatures,
    isLoading,
    saveSignature,
    deleteSignature,
    getSignatureByType,
    loadSignatures,
  };
}
