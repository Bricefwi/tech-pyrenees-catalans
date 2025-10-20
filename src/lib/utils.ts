import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { supabase } from "@/integrations/supabase/client";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Upload a blob to Supabase Storage and return the public URL
 */
export async function saveToStorageAndReturnUrl(
  blob: Blob,
  path: string
): Promise<string> {
  const { data, error } = await supabase.storage
    .from("imotion-docs")
    .upload(path, blob, {
      upsert: true,
      contentType: blob.type,
    });

  if (error) throw error;

  const { data: urlData } = supabase.storage
    .from("imotion-docs")
    .getPublicUrl(data.path);

  return urlData.publicUrl;
}
