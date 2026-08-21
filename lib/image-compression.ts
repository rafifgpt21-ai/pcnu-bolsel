import "client-only";

export type ImageCompressionProfile = "thumbnail" | "content";
export type ImageCompressionResult = {
  file: File;
  originalBytes: number;
  finalBytes: number;
  width: number;
  height: number;
  savedPercent: number;
};

const MIB = 1024 * 1024;
const MAX_SOURCE_BYTES = 20 * MIB;
const MAX_PIXELS = 40_000_000;
const profiles = {
  thumbnail: { edge: 960, target: 120 * 1024, quality: 0.74 },
  content: { edge: 1600, target: 320 * 1024, quality: 0.78 },
} as const;

function canvasBlob(canvas: HTMLCanvasElement, quality: number) {
  return new Promise<Blob>((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("Gagal mengompresi gambar")), "image/webp", quality));
}

export async function compressImage(source: File, profileName: ImageCompressionProfile): Promise<ImageCompressionResult> {
  if (!new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]).has(source.type)) {
    throw new Error("Gunakan gambar JPEG, PNG, WebP, atau AVIF");
  }
  if (source.size > MAX_SOURCE_BYTES) throw new Error("Ukuran sumber gambar maksimal 20 MB");
  const bitmap = await createImageBitmap(source, { imageOrientation: "from-image" });
  try {
    if (bitmap.width * bitmap.height > MAX_PIXELS) throw new Error("Resolusi gambar maksimal 40 megapiksel");
    const profile = profiles[profileName];
    let edge = Math.min(profile.edge, Math.max(bitmap.width, bitmap.height));
    let best: Blob | null = null;
    let outputWidth = bitmap.width;
    let outputHeight = bitmap.height;
    while (edge >= 640) {
      const scale = Math.min(1, edge / Math.max(bitmap.width, bitmap.height));
      outputWidth = Math.max(1, Math.round(bitmap.width * scale));
      outputHeight = Math.max(1, Math.round(bitmap.height * scale));
      const canvas = document.createElement("canvas");
      canvas.width = outputWidth;
      canvas.height = outputHeight;
      const context = canvas.getContext("2d", { alpha: true });
      if (!context) throw new Error("Canvas browser tidak tersedia");
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = "high";
      context.drawImage(bitmap, 0, 0, outputWidth, outputHeight);
      for (let quality = profile.quality; quality >= 0.48; quality -= 0.06) {
        const blob = await canvasBlob(canvas, quality);
        if (!best || blob.size < best.size) best = blob;
        if (blob.size <= profile.target) break;
      }
      canvas.width = 0;
      canvas.height = 0;
      if (best && best.size <= profile.target) break;
      edge = Math.round(edge * 0.84);
    }
    if (!best || best.size > MIB) throw new Error("Gambar tidak dapat dikompresi hingga di bawah 1 MB");
    const name = `${source.name.replace(/\.[^.]+$/, "").replace(/[^A-Za-z0-9._-]+/g, "-") || "image"}.webp`;
    const file = new File([best], name, { type: "image/webp", lastModified: Date.now() });
    return {
      file,
      originalBytes: source.size,
      finalBytes: file.size,
      width: outputWidth,
      height: outputHeight,
      savedPercent: Math.max(0, Math.round((1 - file.size / source.size) * 100)),
    };
  } finally {
    bitmap.close();
  }
}

export function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < MIB) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / MIB).toFixed(2)} MB`;
}
