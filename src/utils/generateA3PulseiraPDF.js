import jsPDF from "jspdf";
import QRCode from "qrcode";

const BASE_URL = "https://app.kydlab.com.br";

// A3 horizontal: 420 × 297 mm
const PAGE_WIDTH = 420;
const PAGE_HEIGHT = 297;

// Bloco definido para a pulseira
const BLOCK_WIDTH = 30;
const BLOCK_HEIGHT = 10;
const QR_AREA_WIDTH = 10;
const CODE_AREA_WIDTH = 20;

// QR preto com exatamente 7 × 7 mm.
// A área de 10 × 10 mm fornece 1,5 mm de respiro branco em cada lado.
const QR_SIZE = 7;

// 13 colunas × 29 linhas = 377 códigos
const COLS = 13;
const ROWS = 29;
const TOTAL_PER_PAGE = COLS * ROWS;

// Centralização na folha A3
const START_X = (PAGE_WIDTH - COLS * BLOCK_WIDTH) / 2; // 15 mm
const START_Y = (PAGE_HEIGHT - ROWS * BLOCK_HEIGHT) / 2; // 3,5 mm

function desenharQrVetorial(pdf, url, x, y, sizeMm) {
  /*
   * QRCode.create entrega a matriz lógica original do QR.
   * Cada módulo é desenhado diretamente como forma vetorial no PDF:
   * não existe PNG, redimensionamento, interpolação ou perda por DPI.
   */
  const qr = QRCode.create(url, {
    errorCorrectionLevel: "L",
  });

  const moduleCount = qr.modules.size;
  const moduleSize = sizeMm / moduleCount;
  const data = qr.modules.data;

  pdf.setFillColor(0, 0, 0);

  /*
   * Agrupa módulos pretos consecutivos em cada linha.
   * Isso mantém o QR rigorosamente vetorial e reduz o tamanho do PDF.
   */
  for (let row = 0; row < moduleCount; row++) {
    let runStart = -1;

    for (let col = 0; col <= moduleCount; col++) {
      const isDark =
        col < moduleCount && data[row * moduleCount + col] === 1;

      if (isDark && runStart === -1) {
        runStart = col;
      }

      if ((!isDark || col === moduleCount) && runStart !== -1) {
        const runLength = col - runStart;

        pdf.rect(
          x + runStart * moduleSize,
          y + row * moduleSize,
          runLength * moduleSize,
          moduleSize,
          "F"
        );

        runStart = -1;
      }
    }
  }
}

export function generateA3PulseiraPDF(tags) {
  if (!Array.isArray(tags) || tags.length === 0) {
    throw new Error("Nenhum código foi informado para o A3 Pulseira.");
  }

  if (tags.length > TOTAL_PER_PAGE) {
    throw new Error(
      `O A3 Pulseira comporta no máximo ${TOTAL_PER_PAGE} códigos por folha.`
    );
  }

  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a3",
    compress: true,
    putOnlyUsedFonts: true,
    floatPrecision: 16,
  });

  pdf.setLineWidth(0.1);
  pdf.setDrawColor(0, 0, 0);
  pdf.setTextColor(0, 0, 0);
  pdf.setFont("Helvetica", "bold");
  pdf.setFontSize(8);

  tags.forEach((tag, index) => {
    const row = Math.floor(index / COLS);
    const col = index % COLS;

    const x = START_X + col * BLOCK_WIDTH;
    const y = START_Y + row * BLOCK_HEIGHT;

    // Fundo branco explícito para garantir contraste máximo.
    pdf.setFillColor(255, 255, 255);
    pdf.rect(x, y, BLOCK_WIDTH, BLOCK_HEIGHT, "F");

    // Linha externa e divisória do bloco.
    pdf.setDrawColor(0, 0, 0);
    pdf.rect(x, y, BLOCK_WIDTH, BLOCK_HEIGHT, "S");
    pdf.line(x + QR_AREA_WIDTH, y, x + QR_AREA_WIDTH, y + BLOCK_HEIGHT);

    // QR 7 × 7 mm centralizado na área de 10 × 10 mm.
    const qrX = x + (QR_AREA_WIDTH - QR_SIZE) / 2;
    const qrY = y + (BLOCK_HEIGHT - QR_SIZE) / 2;
    const url = `${BASE_URL}/qr/${tag.code}`;

    desenharQrVetorial(pdf, url, qrX, qrY, QR_SIZE);

    // Código da peça centralizado na área direita de 20 × 10 mm.
    pdf.setFont("Helvetica", "bold");
    pdf.setFontSize(8);
    pdf.setTextColor(0, 0, 0);

    const codeCenterX = x + QR_AREA_WIDTH + CODE_AREA_WIDTH / 2;
    const codeBaselineY = y + BLOCK_HEIGHT / 2 + 1;

    pdf.text(String(tag.code), codeCenterX, codeBaselineY, {
      align: "center",
    });
  });

  return pdf;
}