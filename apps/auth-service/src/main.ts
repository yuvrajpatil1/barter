// File: apps/auth-service/src/main.ts
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { errorMiddleware } from "../../../packages/error-handler/error-middleware";
import router from "./routes/auth.router";
import swaggerUi from "swagger-ui-express";
import path from "path";
import fs from "fs";

const app = express();

app.use(
  cors({
    origin: ["http://localhost:3000"],
    allowedHeaders: ["Authorization", "Content-Type"],
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send({ message: "Hello API" });
});

// Setup swagger with proper error handling
const setupSwagger = () => {
  try {
    // Look for swagger file in the build directory
    const swaggerPath = path.join(__dirname, "../../../swagger-output.json");
    console.log("Looking for swagger file at:", swaggerPath);

    if (fs.existsSync(swaggerPath)) {
      const swaggerContent = fs.readFileSync(swaggerPath, "utf8");
      const swaggerDocument = JSON.parse(swaggerContent);

      app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
      app.get("/docs-json", (req, res) => {
        res.json(swaggerDocument);
      });

      console.log("✅ Swagger documentation loaded successfully");
      return true;
    } else {
      console.warn("⚠️ Swagger file not found at:", swaggerPath);
      return false;
    }
  } catch (error) {
    console.error("❌ Error loading swagger:");
    return false;
  }
};

// Try to setup swagger, but don't fail if it's not available
const swaggerAvailable = setupSwagger();

// Fallback endpoints if swagger is not available
if (!swaggerAvailable) {
  app.get("/api-docs", (req, res) => {
    res.status(404).json({
      message: "Swagger documentation not available",
      note: "Check the build logs for swagger generation issues",
    });
  });

  app.get("/docs-json", (req, res) => {
    res.status(404).json({
      message: "Swagger documentation not available",
      note: "Check the build logs for swagger generation issues",
    });
  });
}

// Routes
app.use("/api", router);

app.use(errorMiddleware);

const port = process.env.PORT || 6001;
const server = app.listen(port, () => {
  console.log(`🚀 Auth service is running on http://localhost:${port}/api`);
  if (swaggerAvailable) {
    console.log(`📚 Swagger Docs available at http://localhost:${port}/docs`);
  } else {
    console.log(
      "📚 Swagger documentation not available (service will work without it)"
    );
  }
});

server.on("error", (err) => {
  console.log("❌ Server error:", err);
});
