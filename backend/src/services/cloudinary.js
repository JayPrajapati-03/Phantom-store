import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY || process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET || process.env.CLOUDINARY_SECRET
});

const uploadBuffer = (buffer, options) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(result);
    });

    stream.end(buffer);
  });

const uploadFile = async (file, options) => {
  if (!file) {
    throw new Error("A file path, data URI, or buffer is required for upload");
  }

  const result = file.buffer || Buffer.isBuffer(file)
    ? await uploadBuffer(file.buffer || file, options)
    : await cloudinary.uploader.upload(file.path || file, options);

  return {
    url: result.secure_url,
    publicId: result.public_id,
    resourceType: result.resource_type,
    format: result.format,
    bytes: result.bytes
  };
};

export const uploadImage = async (file, folder = "phantom-store/images") =>
  uploadFile(file, {
    folder,
    resource_type: "image",
    transformation: [{ quality: "auto", fetch_format: "auto" }]
  });

export const uploadModel = async (file, folder = "phantom-store/models") =>
  uploadFile(file, {
    folder,
    resource_type: "raw"
  });

export default cloudinary;
