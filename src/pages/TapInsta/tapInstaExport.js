import QRCode from "qrcode";
import * as XLSX from "xlsx";
import {activationUrl,nfcUrl,formatDateTime} from "./tapInstaUtils";
export async function downloadQr(item){
  const data=await QRCode.toDataURL(activationUrl(item.public_code),{width:1200,margin:2,errorCorrectionLevel:"M"});
  const a=document.createElement("a");a.href=data;a.download=`TAP_INSTA_${item.public_code}_ATIVACAO.png`;document.body.appendChild(a);a.click();a.remove();
}
export function exportXlsx(items,filename="tap_insta.xlsx"){
  if(!items?.length)throw new Error("Nenhuma unidade para exportar.");
  const rows=items.map(i=>({Lote:i.batch_code,Unidade:i.unit_number,"Código público":i.public_code,"Código de ativação":i.activation_code,"URL NFC":nfcUrl(i.public_code),"URL de ativação":activationUrl(i.public_code),Status:i.item_status,Instagram:i.instagram_username||"","Data de ativação":formatDateTime(i.activated_at),"Editável até":formatDateTime(i.editable_until)}));
  const ws=XLSX.utils.json_to_sheet(rows);ws["!cols"]=[{wch:16},{wch:10},{wch:18},{wch:20},{wch:48},{wch:54},{wch:14},{wch:28},{wch:22},{wch:22}];
  const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,ws,"TAP INSTA");XLSX.writeFile(wb,filename);
}
