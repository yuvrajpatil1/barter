const swaggerAutogen = require("swagger-autogen")();

const doc = {
  info: {
    title: "Auth Service API",
    description: "Automatically generated Swagger docs",
    version: "1.0.0",
  },
  host: "localhost:6001",
  schemes: ["http"],
};

const outputFile = "./swagger-output.json";
const endpointsFiles = ["./routes/auth.router.ts"];

console.log("🔄 Generating swagger documentation...");
console.log("📍 Output file:", outputFile);
console.log("📁 Endpoints files:", endpointsFiles);

swaggerAutogen(outputFile, endpointsFiles, doc)
  .then(() => {
    console.log("✅ Swagger documentation generated successfully!");
  })
  .catch((error) => {
    console.error("❌ Error generating swagger documentation:", error);
  });
