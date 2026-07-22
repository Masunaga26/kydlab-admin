import {supabase} from "../../supabaseClient";
import {normalizePublicCode,normalizeActivationCode,normalizeInstagramUsername} from "./tapInstaUtils";
const first=d=>Array.isArray(d)?d[0]??null:d??null;
async function rpc(name,args={}){const {data,error}=await supabase.rpc(name,args);if(error)throw error;return data;}
export async function getDestination(publicCode){return first(await rpc("tapinsta_get_destination",{p_public_code:normalizePublicCode(publicCode)}));}
export async function validateActivation(publicCode,activationCode){return first(await rpc("tapinsta_validate_activation",{p_public_code:normalizePublicCode(publicCode),p_activation_code:normalizeActivationCode(activationCode)}));}
export async function activate({publicCode,activationCode,instagramUsername}){return first(await rpc("tapinsta_activate",{p_public_code:normalizePublicCode(publicCode),p_activation_code:normalizeActivationCode(activationCode),p_instagram_username:normalizeInstagramUsername(instagramUsername)}));}
export const createBatch=(quantity,batchCode)=>rpc("tapinsta_admin_create_batch",{p_quantity:Number(quantity),p_batch_code:batchCode?.trim()||null});
export const listBatches=()=>rpc("tapinsta_admin_list_batches");
export const listItems=(batchId=null,search="")=>rpc("tapinsta_admin_list_items",{p_batch_id:batchId||null,p_search:search?.trim()||null});
export const discardItem=id=>rpc("tapinsta_admin_discard_item",{p_item_id:id});
