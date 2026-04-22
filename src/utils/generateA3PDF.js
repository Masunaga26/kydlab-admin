import jsPDF from "jspdf";
import QRCode from "qrcode";

export async function generateA3PDF(tags) {
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a3",
  });

  // 📐 CONFIGURAÇÃO (já otimizado pra 125)
  const qrSize = 15; // 1.5cm
  const textWidth = 30; // 3cm
  const boxWidth = qrSize + textWidth; // 45mm
  const boxHeight = 15; // 1.5cm

  const margin = 20; // 🔥 2cm

  const pageWidth = 297;
  const pageHeight = 420;

  const usableWidth = pageWidth - margin * 2;
  const usableHeight = pageHeight - margin * 2;

  const cols = Math.floor(usableWidth / boxWidth); // 5
  const rows = Math.floor(usableHeight / boxHeight); // 25

  let x = margin;
  let y = margin;
  let col = 0;
  let row = 0;

  for (let i = 0; i < tags.length; i++) {
    const tag = tags[i];

    const url = `https://kydlab.com.br/pet/${tag.code}`;

    const qr = await QRCode.toDataURL(url, {
      errorCorrectionLevel: "H",
      margin: 0,
      scale: 8, // 🔥 alta definição
    });

    // 🧱 Caixa
    pdf.rect(x, y, boxWidth, boxHeight);

    // divisão
    pdf.line(x + qrSize, y, x + qrSize, y + boxHeight);

    // QR
    pdf.addImage(qr, "PNG", x + 1, y + 1, qrSize - 2, qrSize - 2);

    // texto
    pdf.setFont("Helvetica", "bold");
    pdf.setFontSize(10);

    pdf.text(tag.code, x + qrSize + 2, y + boxHeight / 2 + 2);

    col++;
    x += boxWidth;

    if (col >= cols) {
      col = 0;
      x = margin;
      row++;
      y += boxHeight;
    }

    if (row >= rows) {
      pdf.addPage();
      row = 0;
      col = 0;
      x = margin;
      y = margin;
    }
  }

  pdf.save("QR_A3_125_KYDLAB.pdf");
}