export async function readImageFile(
  file?: File,
  maxSizeBytes: number = 2 * 1024 * 1024,
): Promise<{ base64: string; dataUrl: string; contentType: string } | null> {
  if (!file) {
    return null;
  }

  if (!file.type.startsWith("image/")) {
    throw new Error("Please select an image file");
  }

  if (file.size > maxSizeBytes) {
    throw new Error(`Image must be smaller than ${Math.round(maxSizeBytes / (1024 * 1024))} MB`);
  }

  return await new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const dataUrl = String(reader.result);
      const base64 = dataUrl.split(",")[1] ?? "";

      resolve({ base64, dataUrl, contentType: file.type });
    };

    reader.onerror = () => reject(new Error("Failed to read image"));

    reader.readAsDataURL(file);
  });
}
