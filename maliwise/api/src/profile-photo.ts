import { BadRequestException } from "@nestjs/common";

export function validateProfilePhotoData(profilePhotoData: string | null | undefined) {
  if (profilePhotoData === undefined || profilePhotoData === null) return profilePhotoData;
  const match = /^data:image\/(png|jpeg|webp);base64,([A-Za-z0-9+/]+={0,2})$/.exec(profilePhotoData);
  if (!match) throw new BadRequestException("Upload a PNG, JPEG, or WebP profile photo.");

  const image = Buffer.from(match[2], "base64");
  if (image.length === 0 || image.length > 1_000_000) {
    throw new BadRequestException("Profile photos must be smaller than 1 MB.");
  }
  const validSignature = match[1] === "png"
    ? image.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
    : match[1] === "jpeg"
      ? image[0] === 0xff && image[1] === 0xd8 && image[2] === 0xff
      : image.toString("ascii", 0, 4) === "RIFF" && image.toString("ascii", 8, 12) === "WEBP";
  if (!validSignature) throw new BadRequestException("The selected file is not a valid image.");
  return profilePhotoData;
}
