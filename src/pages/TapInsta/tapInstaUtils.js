export const BASE_URL="https://app.kydlab.com.br";
export const normalizePublicCode=v=>String(v??"").toUpperCase().replace(/[^A-Z0-9]/g,"").slice(0,6);
export const normalizeActivationCode=v=>String(v??"").toUpperCase().replace(/[^A-Z]/g,"").slice(0,4);
export const normalizeInstagramUsername=v=>String(v??"").trim()
  .replace(/^https?:\/\/(www\.)?instagram\.com\//i,"").replace(/^www\.instagram\.com\//i,"")
  .replace(/^instagram\.com\//i,"").replace(/^@/,"").split(/[/?#]/)[0].trim().toLowerCase();
export const validActivationCode=v=>/^[A-HJ-KM-NP-Z]{4}$/.test(normalizeActivationCode(v));
export const validInstagram=v=>/^[a-z0-9._]{1,30}$/.test(normalizeInstagramUsername(v));
export function instagramUrl(v){const u=normalizeInstagramUsername(v);if(!validInstagram(u))throw new Error("Instagram inválido.");return `https://www.instagram.com/${u}/`;}
export const nfcUrl=c=>`${BASE_URL}/i/${normalizePublicCode(c)}`;
export const activationUrl=c=>`${BASE_URL}/tapinsta/${normalizePublicCode(c)}`;
export const formatDateTime=v=>v?new Intl.DateTimeFormat("pt-BR",{dateStyle:"short",timeStyle:"short"}).format(new Date(v)):"-";
