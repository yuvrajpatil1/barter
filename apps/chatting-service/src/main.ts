import express from "express";
import cookieParser from "cookie-parser";
import { startConsumer } from "./chat-message.consumer";
import { createWebSocketServer } from "./websocket";
import router from "./routes/chatting.routes";

const app = express();
app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send({ message: "Welcome to chatting-service!" });
});

//routes
app.use("/api", router);

const port = process.env.PORT || 6006;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});

//websocket server
createWebSocketServer(server);

//start kafka consumer
startConsumer().catch((error: any) => {
  console.log(error);
});

server.on("error", console.error);
