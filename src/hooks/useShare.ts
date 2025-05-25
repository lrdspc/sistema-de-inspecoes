interface ShareData {
  title?: string;
  text?: string;
  url?: string;
  files?: File[];
}

export const useShare = () => {
  const isSupported = 'share' in navigator && 'canShare' in navigator;

  const share = async (data: ShareData) => {
    if (!isSupported) {
      throw new Error('Web Share API não é suportada neste navegador');
    }

    try {
      if (data.files && !navigator.canShare({ files: data.files })) {
        throw new Error(
          'Compartilhamento de arquivos não é suportado neste navegador'
        );
      }

      await navigator.share(data);
      return true;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Erro ao compartilhar conteúdo');
    }
  };

  return {
    isSupported,
    share,
  };
};
