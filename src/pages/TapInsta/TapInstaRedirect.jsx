import {useEffect,useState} from "react";
import {useParams} from "react-router-dom";
import {getDestination} from "./tapInstaService";
import {instagramUrl} from "./tapInstaUtils";
import "./tapinsta.css";
export default function TapInstaRedirect(){
  const {publicCode}=useParams();const [state,setState]=useState("loading");
  useEffect(()=>{let mounted=true;(async()=>{try{const d=await getDestination(publicCode);if(!mounted)return;if(d?.item_status==="active"&&d?.instagram_username){window.location.replace(instagramUrl(d.instagram_username));return;}setState(d?.item_status==="available"?"available":"unavailable");}catch(e){console.error(e);if(mounted)setState("error");}})();return()=>{mounted=false}},[publicCode]);
  const copy={loading:["Abrindo Instagram...","Só um instante."],available:["Ainda não ativado","Use o QR Code e o código que estão dentro da embalagem para ativar."],unavailable:["Indisponível","Este TAP INSTA não está disponível."],error:["Não foi possível abrir","Verifique sua conexão e tente novamente."]}[state];
  return <main className="ti-page"><section className="ti-card ti-center"><div className="ti-logo"><span/></div><p className="ti-eyebrow">TAP INSTA</p><h1>{copy[0]}</h1><p>{copy[1]}</p></section></main>;
}
