import "dotenv/config";
import express from "express";
import mediaRoutes from "./routes/media-routes";

const app = express();

app.use(express.json({ limit: "10mb" }));
app.disable("x-powered-by");
app.use("/api/media", mediaRoutes);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Media service running on port ${PORT}`);
});

process.on("SIGTERM", () => {
  server.close(() => {
    console.log("Server terminated");
    process.exit(0);
  });
});
