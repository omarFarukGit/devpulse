import dotenv from "dotenv";

dotenv.config({ quiet: true });

const config = {
  port: process.env.PORT as string,
  connectionString: process.env.NEON_URI as string,
};

export default config;
