import express from "express";
import dotenv from "dotenv";

dotenv.config({
  path: `.env.${process.env.NODE_ENV || "development"}`,
});

const PORT = process.env.PORT || 5000;

const app = express();

app.get("/", (req, res) => {
  res.send("Hello from Test Container 1!");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
