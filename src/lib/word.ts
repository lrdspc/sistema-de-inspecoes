import {
  Document,
  Paragraph,
  TextRun,
  AlignmentType,
  HeadingLevel,
} from 'docx';

// Convert millimeters to twips (1 mm = 56.7 twips)
const MM_TO_TWIPS = 56.7;
const convertMillimetersToTwip = (mm: number) => Math.round(mm * MM_TO_TWIPS);

// Page size constants (A4)
const PAGE = {
  width: convertMillimetersToTwip(210),
  height: convertMillimetersToTwip(297),
};

// Document formatting constants
const FORMATTING = {
  margins: {
    top: convertMillimetersToTwip(25),
    right: convertMillimetersToTwip(25),
    bottom: convertMillimetersToTwip(25),
    left: convertMillimetersToTwip(30),
  },
  font: {
    name: 'Times New Roman',
    size: 24, // 12pt = 24 half-points
    lineSpacing: {
      before: 0,
      after: 240, // 8pt
      line: 360, // 1.5 lines
      lineRule: 'auto',
    },
    paragraph: {
      spacing: {
        before: 240, // 8pt
        after: 240, // 8pt
        line: 360, // 1.5 lines
        lineRule: 'auto',
      },
    },
  },
};

// Textos fixos do relatório
const TEXTOS = {
  introducao: (
    protocolo: string,
    modeloTelha: string
  ) => `A Área de Assistência Técnica foi solicitada para atender uma reclamação relacionada ao surgimento de infiltrações nas telhas de fibrocimento: - Telha da marca BRASILIT modelo ONDULADA de 5mm, produzidas com tecnologia CRFS - Cimento Reforçado com Fios Sintéticos - 100% sem amianto - cuja fabricação segue a norma internacional ISO 9933, bem como as normas técnicas da ABNT: NBR-15210-1, NBR-15210-2 e NBR-15210-3.

Em atenção a vossa solicitação, analisamos as evidências encontradas, para avaliar as manifestações patológicas reclamadas em telhas de nossa marca aplicada em sua cobertura conforme registro de reclamação protocolo FAR ${protocolo}.

O modelo de telha escolhido para a edificação foi: ${modeloTelha}. Esse modelo, como os demais, possui a necessidade de seguir rigorosamente as orientações técnicas contidas no Guia Técnico de Telhas de Fibrocimento e Acessórios para Telhado --- Brasilit para o melhor desempenho do produto, assim como a garantia do produto coberta por 5 anos (ou dez anos para sistema completo).

A análise do caso segue os requisitos presentes na norma ABNT NBR 7196: Telhas de fibrocimento sem amianto --- Execução de coberturas e fechamentos laterais ---Procedimento e Guia Técnico de Telhas de Fibrocimento e Acessórios para Telhado --- Brasilit.`,

  analiseTecnica: `Durante a visita técnica realizada no local, nossa equipe conduziu uma vistoria minuciosa da cobertura, documentando e analisando as condições de instalação e o estado atual das telhas. Após criteriosa avaliação das evidências coletadas em campo, identificamos alguns desvios nos procedimentos de manuseio e instalação em relação às especificações técnicas do fabricante, os quais são detalhados a seguir:`,

  conclusao: `Em função das não conformidades constatadas no manuseio e instalação das chapas Brasilit, finalizamos o atendimento considerando a reclamação como IMPROCEDENTE, onde os problemas reclamados se dão pelo incorreto manuseio e instalação das telhas e não a problemas relacionados à qualidade do material.

As telhas BRASILIT modelo FIBROCIMENTO ONDULADA possuem dez anos de garantia com relação a problemas de fabricação. A garantia Brasilit está condicionada a correta aplicação do produto, seguindo rigorosamente as instruções de instalação contidas no Guia Técnico de Telhas de Fibrocimento e Acessórios para Telhado --- Brasilit. Este guia técnico está sempre disponível em: http://www.brasilit.com.br.

Ratificamos que os produtos Brasilit atendem as Normas da Associação Brasileira de Normas Técnicas --- ABNT, específicas para cada linha de produto, e cumprimos as exigências legais de garantia de produtos conforme a legislação em vigor.`,

  assinatura: `Desde já, agradecemos e nos colocamos à disposição para quaisquer esclarecimentos que se fizerem necessário.

Atenciosamente,

Saint-Gobain do Brasil Prod. Ind. e para Cons. Civil Ltda.
Divisão Produtos Para Construção
Departamento de Assistência Técnica`,
};

// Banco de dados de não conformidades
const NAO_CONFORMIDADES = {
  '1': {
    titulo: 'Armazenagem Incorreta',
    texto:
      'Durante a inspeção, foi constatado que as telhas estão sendo armazenadas de forma inadequada, em desacordo com as recomendações técnicas do fabricante. As telhas BRASILIT devem ser armazenadas em local plano, firme, coberto e seco, protegidas das intempéries. O empilhamento deve ser feito horizontalmente, com as telhas apoiadas sobre caibros ou pontaletes de madeira espaçados no máximo a cada 50cm, garantindo um apoio uniforme. A altura máxima da pilha não deve ultrapassar 200 telhas. É fundamental manter uma distância mínima de 1 metro entre as pilhas para facilitar a circulação. O não cumprimento destas diretrizes pode resultar em deformações, trincas ou quebras das telhas, comprometendo sua integridade e desempenho futuro.',
  },
  '2': {
    titulo: 'Carga Permanente sobre as Telhas',
    texto:
      'Foi identificada a presença de cargas permanentes sobre as telhas, como equipamentos, materiais ou estruturas apoiadas diretamente sobre a cobertura. Esta prática é inadequada e contraria as especificações técnicas do fabricante. As telhas BRASILIT não são projetadas para suportar cargas concentradas adicionais além do seu próprio peso e das cargas previstas em projeto (vento e eventual acúmulo de água da chuva). O excesso de carga pode causar deformações, trincas e comprometer a estanqueidade do telhado.',
  },
  '3': {
    titulo: 'Corte de Canto Incorreto ou Ausente',
    texto:
      'Foi observado que os cortes de canto das telhas não foram executados corretamente ou estão ausentes em algumas peças. O corte de canto é fundamental para evitar a sobreposição de quatro telhas no mesmo ponto, o que pode causar infiltrações. O corte deve ser feito em ângulo de 45° com dimensões conforme especificado no catálogo técnico do produto.',
  },
};

interface GenerateWordDocOptions {
  cliente: string;
  empreendimento: string;
  cidade: string;
  estado: string;
  endereco: string;
  protocolo: string;
  assunto: string;
  dataVistoria: string;
  tecnico: string;
  departamento: string;
  unidade: string;
  coordenador: string;
  gerente: string;
  regional: string;
  modeloTelha: string;
  quantidadeTelhas: number;
  areaCoberta: number;
  naoConformidades: string[];
}

export async function generateWordDoc(data: GenerateWordDocOptions) {
  // Criar o documento
  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: FORMATTING.font.name,
            size: FORMATTING.font.size,
          },
          paragraph: {
            ...FORMATTING.font.paragraph,
            alignment: AlignmentType.JUSTIFIED,
          },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            size: {
              width: PAGE.width,
              height: PAGE.height,
              orientation: 'portrait',
            },
            margin: FORMATTING.margins,
          },
        },
        children: [
          // Título
          new Paragraph({
            children: [
              new TextRun({
                text: 'RELATÓRIO DE VISTORIA TÉCNICA',
                bold: true,
                size: 28, // 14pt
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { before: 480, after: 480 }, // 2 lines before and after
          }),

          // Informações básicas
          new Paragraph({
            children: [
              new TextRun({ text: 'Data de vistoria: ', bold: true }),
              new TextRun(data.dataVistoria),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Cliente: ', bold: true }),
              new TextRun(data.cliente),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Empreendimento: ', bold: true }),
              new TextRun(data.empreendimento),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Cidade: ', bold: true }),
              new TextRun(`${data.cidade} - ${data.estado}`),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Endereço: ', bold: true }),
              new TextRun(data.endereco),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'FAR/Protocolo: ', bold: true }),
              new TextRun(data.protocolo),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Assunto: ', bold: true }),
              new TextRun(data.assunto),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Elaborado por: ', bold: true }),
              new TextRun(data.tecnico),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Departamento: ', bold: true }),
              new TextRun(data.departamento),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Unidade: ', bold: true }),
              new TextRun(data.unidade),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Coordenador Responsável: ', bold: true }),
              new TextRun(data.coordenador),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Gerente Responsável: ', bold: true }),
              new TextRun(data.gerente),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Regional: ', bold: true }),
              new TextRun(data.regional),
            ],
            spacing: { after: 480 }, // 2 lines
          }),

          // Quantidade e modelo
          new Paragraph({
            children: [
              new TextRun({ text: 'Quantidade e modelo:', bold: true }),
            ],
            spacing: { before: 240, after: 240 },
          }),
          new Paragraph({
            text: `• ${data.quantidadeTelhas} telhas ${data.modeloTelha}`,
            spacing: { after: 240 },
          }),
          new Paragraph({
            text: `• Área coberta: ${data.areaCoberta}m² aproximadamente`,
            spacing: { after: 480 }, // 2 lines
          }),

          // Introdução
          new Paragraph({
            children: [
              new TextRun({
                text: 'Introdução',
                bold: true,
              }),
            ],
            spacing: { before: 480, after: 240 },
          }),
          new Paragraph({
            text: TEXTOS.introducao(data.protocolo, data.modeloTelha),
            spacing: { after: 480 }, // 2 lines
          }),

          // Análise Técnica
          new Paragraph({
            children: [
              new TextRun({
                text: 'Análise Técnica',
                bold: true,
              }),
            ],
            spacing: { before: 480, after: 240 },
          }),
          new Paragraph({
            text: TEXTOS.analiseTecnica,
            spacing: { after: 480 }, // 2 lines
          }),

          // Não Conformidades
          ...data.naoConformidades
            .map((ncId) => {
              const nc = NAO_CONFORMIDADES[ncId];
              if (!nc) return [];

              return [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: nc.titulo,
                      bold: true,
                    }),
                  ],
                  spacing: { before: 240, after: 240 },
                }),
                new Paragraph({
                  text: nc.texto,
                  spacing: { after: 480 }, // 2 lines
                }),
              ];
            })
            .flat(),

          // Conclusão
          new Paragraph({
            children: [
              new TextRun({
                text: 'Conclusão',
                bold: true,
              }),
            ],
            spacing: { before: 480, after: 240 },
          }),
          new Paragraph({
            text: 'Com base na análise técnica realizada, foram identificadas as seguintes não conformidades:',
            spacing: { before: 240, after: 240 },
          }),
          ...data.naoConformidades.map((ncId, index) => {
            const nc = NAO_CONFORMIDADES[ncId];
            if (!nc) return [];

            return new Paragraph({
              text: `${index + 1}. ${nc.titulo}`,
              spacing: {
                before: 120,
                after: 240,
              },
            });
          }),
          new Paragraph({
            text: TEXTOS.conclusao,
            spacing: { after: 480 }, // 2 lines
          }),

          // Assinatura
          new Paragraph({
            text: TEXTOS.assinatura,
            spacing: {
              before: 720, // 3 lines
              after: 480, // 2 lines
            },
            alignment: AlignmentType.LEFT,
          }),
        ],
      },
    ],
  });

  return doc;
}
