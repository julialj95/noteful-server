module.exports = {
  PORT: process.env.PORT || 8000,
  NODE_ENV: process.env.NODE_ENV || "development",
  DATABASE_URL:
    process.env.DATABASE_URL ||
    "postgres://somestring:someuuid@ec2-23-23-184-76.compute-1.amazonaws.com:5432/d28qbhopgtqvcn",
};
