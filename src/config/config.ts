import { config as conf } from "dotenv";
conf();

const _config = {
  port: process.env.PORT,
  mongoUri: process.env.MONGO_URI,
  env: process.env.NODE_ENV,
  jwtSecret: process.env.JWT_SECRET_KEY
};

export const config = Object.freeze(_config);
