import dotenv from "dotenv";

dotenv.config({ quiet: true });

const config = {
  port: process.env.PORT as string,
};

export default config;
