import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { BadRequestException } from "@nestjs/common";
import { validateProfilePhotoData } from "./profile-photo";

describe("validateProfilePhotoData", () => {
  it("accepts supported image signatures and an empty photo", () => {
    const jpeg = `data:image/jpeg;base64,${Buffer.from([0xff, 0xd8, 0xff, 0x00]).toString("base64")}`;
    const png = `data:image/png;base64,${Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]).toString("base64")}`;
    const webp = `data:image/webp;base64,${Buffer.from("RIFF0000WEBP").toString("base64")}`;

    assert.equal(validateProfilePhotoData(jpeg), jpeg);
    assert.equal(validateProfilePhotoData(png), png);
    assert.equal(validateProfilePhotoData(webp), webp);
    assert.equal(validateProfilePhotoData(null), null);
  });

  it("rejects mismatched image data and oversized photos", () => {
    const mismatched = `data:image/png;base64,${Buffer.from("not an image").toString("base64")}`;
    const oversized = `data:image/jpeg;base64,${Buffer.concat([
      Buffer.from([0xff, 0xd8, 0xff]),
      Buffer.alloc(1_000_000),
    ]).toString("base64")}`;

    assert.throws(() => validateProfilePhotoData(mismatched), BadRequestException);
    assert.throws(() => validateProfilePhotoData("data:image/svg+xml;base64,PHN2Zz4="), BadRequestException);
    assert.throws(() => validateProfilePhotoData(oversized), /smaller than 1 MB/);
  });
});
