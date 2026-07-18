require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { initDB } = require("./db");
const { createApiRouter } = require("./routes");
const { seedDatabase } = require("./seed");

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "*"
  })
);
app.use(express.json());

app.use("/api", createApiRouter());

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ message: "Something went wrong." });
});

async function startServer() {
  try {
    initDB();
    await seedDatabase();

    const port = process.env.PORT || 5000;
    app.listen(port, () => {
      console.log(`Aakaar backend listening on port ${port}`);
    });
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

startServer();

