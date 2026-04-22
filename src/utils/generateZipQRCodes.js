import JSZip from "jszip";
import { saveAs } from "file-saver";
import QRCode from "qrcode";

const BASE_URL = "https://app.kydlab.com.br"; // 🔥 padrão fixo

export async function generateZipQRCodes(tags) {
  const zip = new JSZip();

  for (let tag of tags) {

    const url = `${BASE_URL}/qr/${tag.code}`; // 🔥 CORRETO

    const qr = await QRCode.toDataURL(url);

    const base64 = qr.split(",")[1];

    zip.file(`${tag.code}.png`, base64, { base64: true });
  }

  const content = await zip.generateAsync({ type: "blob" });

  saveAs(content, "qrcodes.zip");
}