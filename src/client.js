import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://SEU-PROJETO.supabase.co";
const supabaseKey = "sb_publishable_ohwlWD9GxMx2pn3izyCxTQ_ZPvHKKy_";

export const supabase = createClient(supabaseUrl, supabaseKey);