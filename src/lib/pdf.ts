import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Relatorio, Vistoria, Cliente, NaoConformidade } from './db';

interface GeneratePDFOptions {
  relatorio: Relatorio;
  vistoria: Vistoria;
  cliente: Cliente;
}

export async function generatePDF({
  relatorio,
  vistoria,
  cliente,
}: GeneratePDFOptions) {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Configurações
  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let yPos = margin;

  // Funções auxiliares
  const addText = (text: string, size = 12, isBold = false) => {
    pdf.setFontSize(size);
    pdf.setFont('helvetica', isBold ? 'bold' : 'normal');
    const lines = pdf.splitTextToSize(text, contentWidth);
    pdf.text(lines, margin, yPos);
    yPos += lines.length * size * 0.3527 + 5;
  };

  const addTitle = (text: string) => {
    addText(text, 16, true);
  };

  const addSubtitle = (text: string) => {
    addText(text, 14, true);
  };

  const addSection = (title: string, content: string) => {
    addSubtitle(title);
    addText(content);
    yPos += 5;
  };

  const checkPageBreak = (neededSpace: number) => {
    if (yPos + neededSpace > pdf.internal.pageSize.getHeight() - margin) {
      pdf.addPage();
      yPos = margin;
    }
  };

  // Cabeçalho
  pdf.addImage('/pwa-192x192.png', 'PNG', margin, yPos, 20, 20);
  yPos += 25;

  addTitle('Relatório de Vistoria Técnica');
  addText(`Protocolo: ${vistoria.protocolo}`, 12, true);
  addText(
    `Data: ${format(new Date(relatorio.dataCriacao), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}`
  );
  yPos += 10;

  // Dados do Cliente
  addSubtitle('Dados do Cliente');
  addText(`Nome/Razão Social: ${cliente.nome}`);
  addText(`Documento: ${cliente.documento}`);
  addText(
    `Endereço: ${cliente.logradouro}, ${cliente.numero}${cliente.complemento ? `, ${cliente.complemento}` : ''}`
  );
  addText(
    `${cliente.bairro} - ${cliente.cidade}/${cliente.estado} - CEP: ${cliente.cep}`
  );
  yPos += 10;

  // Dados da Vistoria
  addSubtitle('Dados da Vistoria');
  addText(
    `Data da Vistoria: ${format(new Date(vistoria.data), "dd/MM/yyyy 'às' HH:mm")}`
  );
  addText(`Técnico Responsável: Técnico Demonstração`);
  addText(`Unidade Regional: ${vistoria.unidadeRegional}`);

  if (vistoria.modeloTelha) {
    addText(`Modelo de Telha: ${vistoria.modeloTelha}`);
  }
  if (vistoria.espessura) {
    addText(`Espessura: ${vistoria.espessura}`);
  }
  if (vistoria.tecnologia) {
    addText(`Tecnologia: ${vistoria.tecnologia}`);
  }
  yPos += 10;

  // Conteúdo do Relatório
  checkPageBreak(100);
  addSection('Introdução', relatorio.introducao);

  checkPageBreak(150);
  addSection('Análise Técnica', relatorio.analiseTecnica);

  // Não Conformidades
  if (vistoria.naoConformidades && vistoria.naoConformidades.length > 0) {
    checkPageBreak(50 + vistoria.naoConformidades.length * 40);
    addSubtitle('Não Conformidades Identificadas');

    vistoria.naoConformidades.forEach((nc: NaoConformidade, index: number) => {
      addText(`Não Conformidade #${index + 1}`, 12, true);
      addText(`Tipo: ${nc.tipo}`);
      addText(`Descrição: ${nc.descricao}`);
      if (nc.observacoes) {
        addText(`Observações: ${nc.observacoes}`);
      }
      yPos += 5;
    });
  }

  // Registro Fotográfico
  if (vistoria.fotos && vistoria.fotos.length > 0) {
    checkPageBreak(80);
    addSubtitle('Registro Fotográfico');

    for (let i = 0; i < vistoria.fotos.length; i++) {
      checkPageBreak(90);
      const foto = vistoria.fotos[i];

      try {
        // Converter base64 para imagem
        const img = new Image();
        img.src = foto;
        await new Promise((resolve) => {
          img.onload = resolve;
        });

        // Calcular dimensões mantendo proporção
        const maxWidth = contentWidth;
        const maxHeight = 80;
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = (maxWidth * height) / width;
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = (maxHeight * width) / height;
          height = maxHeight;
        }

        pdf.addImage(foto, 'JPEG', margin, yPos, width, height);
        addText(`Foto ${i + 1}`, 10);
        yPos += height + 10;
      } catch (error) {
        console.error(`Erro ao adicionar foto ${i + 1}:`, error);
      }
    }
  }

  checkPageBreak(100);
  addSection('Conclusão', relatorio.conclusao);

  // Parecer Final
  checkPageBreak(50);
  addSubtitle('Parecer Final');
  const parecerLabel =
    relatorio.parecerFinal === 'procedente'
      ? 'Procedente'
      : relatorio.parecerFinal === 'improcedente'
        ? 'Improcedente'
        : 'Parcialmente Procedente';
  addText(parecerLabel, 12, true);

  // Assinaturas
  if (vistoria.assinaturaTecnico || vistoria.assinaturaCliente) {
    checkPageBreak(80);
    yPos += 20;

    if (vistoria.assinaturaTecnico) {
      pdf.addImage(vistoria.assinaturaTecnico, 'PNG', margin, yPos, 70, 30);
      yPos += 35;
      addText('Assinatura do Técnico', 10);
    }

    if (vistoria.assinaturaCliente) {
      pdf.addImage(
        vistoria.assinaturaCliente,
        'PNG',
        margin + 100,
        yPos - 35,
        70,
        30
      );
      yPos += 35;
      pdf.setFontSize(10);
      pdf.text('Assinatura do Cliente', margin + 100, yPos - 30);
    }
  }

  // Rodapé
  const pageCount = pdf.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);
    pdf.setFontSize(10);
    pdf.text(
      `Página ${i} de ${pageCount}`,
      pdf.internal.pageSize.getWidth() - 30,
      pdf.internal.pageSize.getHeight() - 10
    );
  }

  return pdf;
}
