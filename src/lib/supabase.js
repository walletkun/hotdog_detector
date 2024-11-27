import { createClient } from "@supabase/supabase-js";


const supbaseURL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supbaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;


if(!supbaseURL || !supbaseAnonKey){
  throw new Error('Missing env variables for supabase');
}

export const supabase = createClient(supbaseURL, supbaseAnonKey);