import { config as conf } from "dotenv";
conf();

const _config = {
  port: process.env.PORT,
  mongoUri: process.env.MONGO_URI,
  env: process.env.NODE_ENV,
  jwtSecret: process.env.JWT_SECRET_KEY,
  cloudinary_cloud: process.env.CLOUDINARY_CLOUD,
  cloudinary_api_key: process.env.CLOUDINARY_API_KEY,
  cloudinary_api_secret: process.env.CLOUDINARY_API_SECRET,
  fontendDomain: process.env.FRONTEND_DOMAIN,
};

export const config = Object.freeze(_config);
