import { del, put } from "@vercel/blob";

const allowedTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "video/mp4",
  "video/webm",
  "video/quicktime"
]);

const maxFileSize = 25 * 1024 * 1024;

export async function uploadToBlob(file: File) {
  if (!allowedTypes.has(file.type)) {
    throw new Error("Formato nao permitido. Use jpg, png, webp, mp4, webm ou mov.");
  }

  if (file.size > maxFileSize) {
    throw new Error("Arquivo muito grande. O limite atual e 25 MB.");
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error("Configure BLOB_READ_WRITE_TOKEN para enviar arquivos.");
  }

  const extension = file.name.split(".").pop() || "media";
  const name = `love-page/${Date.now()}-${crypto.randomUUID()}.${extension}`;
  return put(name, file, { access: "public" });
}

export async function deleteBlob(url?: string | null) {
  if (!url || !process.env.BLOB_READ_WRITE_TOKEN) return;
  await del(url);
}
