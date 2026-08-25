import type { Area } from "react-easy-crop";

const AVATAR_OUTPUT_SIZE = 768;
const MAX_WORKING_CANVAS_EDGE = 4096;

type CropMemberAvatarOptions = {
  crop: Area;
  imageSrc: string;
  rotation: number;
};

function angleToRadians(degrees: number) {
  return (degrees * Math.PI) / 180;
}

function rotatedBounds(width: number, height: number, rotation: number) {
  const radians = angleToRadians(rotation);

  return {
    height:
      Math.abs(Math.sin(radians) * width) +
      Math.abs(Math.cos(radians) * height),
    width:
      Math.abs(Math.cos(radians) * width) +
      Math.abs(Math.sin(radians) * height),
  };
}

function loadImage(imageSrc: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.decoding = "async";
    image.addEventListener("load", () => resolve(image), { once: true });
    image.addEventListener(
      "error",
      () => reject(new Error("Foto tidak dapat dimuat.")),
      { once: true },
    );
    image.src = imageSrc;
  });
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number,
) {
  return new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, type, quality);
  });
}

function blobToDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener(
      "load",
      () => {
        if (typeof reader.result === "string") resolve(reader.result);
        else reject(new Error("Hasil foto tidak dapat dibaca."));
      },
      { once: true },
    );
    reader.addEventListener(
      "error",
      () => reject(new Error("Hasil foto tidak dapat dibaca.")),
      { once: true },
    );
    reader.readAsDataURL(blob);
  });
}

export async function cropMemberAvatar({
  crop,
  imageSrc,
  rotation,
}: CropMemberAvatarOptions) {
  const image = await loadImage(imageSrc);
  const bounds = rotatedBounds(
    image.naturalWidth,
    image.naturalHeight,
    rotation,
  );
  const workingScale = Math.min(
    1,
    MAX_WORKING_CANVAS_EDGE / Math.max(bounds.width, bounds.height),
  );
  const workingCanvas = document.createElement("canvas");
  workingCanvas.width = Math.max(1, Math.round(bounds.width * workingScale));
  workingCanvas.height = Math.max(1, Math.round(bounds.height * workingScale));

  const workingContext = workingCanvas.getContext("2d");
  if (!workingContext) throw new Error("Editor foto tidak tersedia.");

  workingContext.imageSmoothingEnabled = true;
  workingContext.imageSmoothingQuality = "high";
  workingContext.scale(workingScale, workingScale);
  workingContext.translate(bounds.width / 2, bounds.height / 2);
  workingContext.rotate(angleToRadians(rotation));
  workingContext.translate(-image.naturalWidth / 2, -image.naturalHeight / 2);
  workingContext.drawImage(image, 0, 0);

  const outputCanvas = document.createElement("canvas");
  outputCanvas.width = AVATAR_OUTPUT_SIZE;
  outputCanvas.height = AVATAR_OUTPUT_SIZE;
  const outputContext = outputCanvas.getContext("2d");
  if (!outputContext) throw new Error("Editor foto tidak tersedia.");

  outputContext.imageSmoothingEnabled = true;
  outputContext.imageSmoothingQuality = "high";
  outputContext.drawImage(
    workingCanvas,
    crop.x * workingScale,
    crop.y * workingScale,
    crop.width * workingScale,
    crop.height * workingScale,
    0,
    0,
    AVATAR_OUTPUT_SIZE,
    AVATAR_OUTPUT_SIZE,
  );

  const blob =
    (await canvasToBlob(outputCanvas, "image/webp", 0.9)) ??
    (await canvasToBlob(outputCanvas, "image/jpeg", 0.92));

  if (!blob) throw new Error("Hasil foto tidak dapat disiapkan.");
  return blobToDataUrl(blob);
}
