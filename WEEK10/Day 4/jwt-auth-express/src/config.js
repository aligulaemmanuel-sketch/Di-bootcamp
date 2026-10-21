require("dotenv").config();

const required = ["JWT_ACCESS_SECRET", "JWT_REFRESH_SECRET"];
for (const key of required) {
  if (!process.env[key] || process.env[key].startsWith("replace-me")) {
    console.error(`Missing or placeholder value for ${key}. Copy .env.example to .env and set real secrets.`);
    process.exit(1);
  }
}

module.exports = {
  port: Number(process.env.PORT || 3000),
  accessSecret: process.env.JWT_ACCESS_SECRET,
  refreshSecret: process.env.JWT_REFRESH_SECRET,
  accessTokenTtl: process.env.ACCESS_TOKEN_TTL || "15m",
  refreshTokenTtl: process.env.REFRESH_TOKEN_TTL || "7d",
  isProd: process.env.NODE_ENV === "production",
};
