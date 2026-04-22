import JSZip from "jszip";
import { saveAs } from "file-saver";
import QRCode from "qrcode";

export async function generateZipQRCodes(tags) {
  const zip = new JSZip();

  for (let tag of tags) {
    const url = `${window.location.origin}/pet/${tag.code}`;
    const qr = await QRCode.toDataURL(url);

    const base64 = qr.split(",")[1];

    zip.file(`${tag.code}.png`, base64, { base64: true });
  }

  const content = await zip.generateAsync({ type: "blob" });

  saveAs(content, "qrcodes.zip");
}