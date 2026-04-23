import jsPDF from "jspdf";
import QRCode from "qrcode";

const BASE_URL = "https://app.kydlab.com.br";

export async function generateA3PDF(tags) {
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a3",
  });

  const qrSize = 15;
  const textWidth = 30;
  const boxWidth = qrSize + textWidth;
  const boxHeight = 15;

  const margin = 20;

  const pageWidth = 297;
  const pageHeight = 420;

  const usableWidth = pageWidth - margin * 2;
  const usableHeight = pageHeight - margin * 2;

  const cols = Math.floor(usableWidth / boxWidth);
  const rows = Math.floor(usableHeight / boxHeight);

  let x = margin;
  let y = margin;
  let col = 0;
  let row = 0;

  for (let i = 0; i < tags.length; i++) {
    const tag = tags[i];

    const url = `${BASE_URL}/qr/${tag.code}`;

    const qr = await QRCode.toDataURL(url, {
      errorCorrectionLevel: "H",
      margin: 0,
      scale: 8,
    });

    pdf.rect(x, y, boxWidth, boxHeight);
    pdf.line(x + qrSize, y, x + qrSize, y + boxHeight);

    pdf.addImage(qr, "PNG", x + 1, y + 1, qrSize - 2, qrSize - 2);

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

  pdf.save("QR_A3_KYDLAB.pdf");
}