import QRCode from "qrcode";
import * as XLSX from "xlsx";
import {activationUrl,nfcUrl,formatDateTime} from "./tapInstaUtils";

export function sortProductionItems(items){
  return [...(items||[])].sort((a,b)=>{
    const unitA=Number(a?.unit_number)||0;
    const unitB=Number(b?.unit_number)||0;
    if(unitA!==unitB)return unitA-unitB;
    return String(a?.public_code||"").localeCompare(String(b?.public_code||""));
  });
}

export async function downloadQr(item){
  const data=await QRCode.toDataURL(activationUrl(item.public_code),{width:1200,margin:2,errorCorrectionLevel:"M"});
  const a=document.createElement("a");a.href=data;a.download=`TAP_INSTA_${item.public_code}_ATIVACAO.png`;document.body.appendChild(a);a.click();a.remove();
}

export function exportProductionXls(items,filename="tap_insta_producao.xls"){
  const ordered=sortProductionItems(items);
  if(!ordered.length)throw new Error("Nenhuma unidade para exportar.");

  const rows=ordered.map((item,index)=>({
    Ordem:index+1,
    Unidade:String(item.unit_number).padStart(3,"0"),
    "Código da peça":item.public_code,
    "Código de ativação":item.activation_code,
    "URL para gravar no NFC":nfcUrl(item.public_code),
  }));

  const ws=XLSX.utils.json_to_sheet(rows);
  ws["!cols"]=[{wch:9},{wch:10},{wch:18},{wch:20},{wch:52}];

  const wb=XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb,ws,"PRODUÇÃO");
  XLSX.writeFile(wb,filename,{bookType:"xls"});
}

export function exportXlsx(items,filename="tap_insta.xlsx"){
  if(!items?.length)throw new Error("Nenhuma unidade para exportar.");
  const rows=sortProductionItems(items).map(i=>({Lote:i.batch_code,Unidade:i.unit_number,"Código público":i.public_code,"Código de ativação":i.activation_code,"URL NFC":nfcUrl(i.public_code),"URL de ativação":activationUrl(i.public_code),Status:i.item_status,Instagram:i.instagram_username||"","Data de ativação":formatDateTime(i.activated_at),"Editável até":formatDateTime(i.editable_until)}));
  const ws=XLSX.utils.json_to_sheet(rows);ws["!cols"]=[{wch:16},{wch:10},{wch:18},{wch:20},{wch:48},{wch:54},{wch:14},{wch:28},{wch:22},{wch:22}];
  const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,ws,"TAP INSTA");XLSX.writeFile(wb,filename);
}