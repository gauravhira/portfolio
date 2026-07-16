const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

export function cloudinaryUrl(publicId: string | null | undefined): string | null {
  if (!publicId || !CLOUD_NAME || CLOUD_NAME === "change-me") return null;
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${publicId}`;
}
