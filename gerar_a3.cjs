const PDFDocument = require("pdfkit");
const QRCode = require("qrcode");
const fs = require("fs");

// 🔥 CONFIGURAÇÕES
const BASE_URL = "https://kydlab.com.br/qr";
const OUTPUT = "A3_QR_CODES.pdf";

// 📐 MEDIDAS (em pontos PDF)
const CM = 28.35;

// A3
const PAGE_WIDTH = 29.7 * CM;
const PAGE_HEIGHT = 42 * CM;

// Margens
const MARGIN = 2 * CM;

// Bloco
const BLOCK_HEIGHT = 1.5 * CM;
const QR_BOX = 1.5 * CM;
const CODE_WIDTH = 3 * CM;

// QR real
const QR_SIZE = 1 * CM;

// Grid
const COLS = 5;
const ROWS = 25;

// 🔢 TOTAL
const TOTAL = COLS * ROWS;

// 🔥 EXEMPLO DE CÓDIGOS (substituir pelo banco depois)
const codigos = Array.from({ length: TOTAL }, (_, i) => `KYD${1000 + i}`);

// 📄 CRIA PDF
const doc = new PDFDocument({
  size: [PAGE_WIDTH, PAGE_HEIGHT],
  margin: 0,
});

doc.pipe(fs.createWriteStream(OUTPUT));

async function gerar() {
  for (let i = 0; i < TOTAL; i++) {
    const code = codigos[i];
    const url = `${BASE_URL}/${code}`;

    const col = i % COLS;
    const row = Math.floor(i / COLS);

    const x = MARGIN + col * (QR_BOX + CODE_WIDTH);
    const y = MARGIN + row * BLOCK_HEIGHT;

    // 🔲 QUADRO QR
    doc.rect(x, y, QR_BOX, QR_BOX).stroke();

    // 🔲 QUADRO CÓDIGO
    doc.rect(x + QR_BOX, y, CODE_WIDTH, QR_BOX).stroke();

    // 📱 GERAR QR
    const qrBuffer = await QRCode.toBuffer(url, {
      width: QR_SIZE,
      margin: 0,
    });

    // 📍 CENTRALIZAR QR DENTRO DO QUADRO
    const qrX = x + (QR_BOX - QR_SIZE) / 2;
    const qrY = y + (QR_BOX - QR_SIZE) / 2;

    doc.image(qrBuffer, qrX, qrY, {
      width: QR_SIZE,
      height: QR_SIZE,
    });

    // 🔤 TEXTO DO CÓDIGO
    doc
      .fontSize(8)
      .text(code, x + QR_BOX + 5, y + QR_BOX / 2 - 4);
  }

  doc.end();
  console.log("✅ PDF gerado:", OUTPUT);
}

gerar();