import { kafka } from "../../../packages/utils/kafka";
import { WebSocket, WebSocketServer } from "ws";
import redis from "../../../packages/libs/redis/index";
import { Server as HttpServer } from "http";

const producer = kafka.producer();
const connectedUsers: Map<string, WebSocket> = new Map();
const unseenCounts: Map<string, number> = new Map();

type IncomingMessage = {
  type?: string;
  fromUserId: string;
  toUserId: string;
  messageBody: string;
  conversationId: string;
  senderType: string;
};

export async function createWebSocketServer(server: HttpServer) {
  const wss = new WebSocketServer({ server });

  await producer.connect();
  console.log("Kafka producer connected!");

  wss.on("connection", (ws: WebSocket) => {
    console.log("New Websocket connection!");

    let registeredUserId: string | null = null;

    ws.on("message", async (rawMessage) => {
      try {
        const messageStr = rawMessage.toString();

        //Register the user on the first plain message(non-json)
        if (!registeredUserId && !messageStr.startsWith("{")) {
          registeredUserId = messageStr;
          connectedUsers.set(registeredUserId, ws);
          console.log(`registered websocket for userId: ${registeredUserId}`);

          const isSeller = registeredUserId.startsWith("_seller");
          const redisKey = isSeller
            ? `online:seller:${registeredUserId.replace("seller_", "")}`
            : `online:user:${registeredUserId}`;
          await redis.set(redisKey, "");
          await redis.expire(redisKey, 300);
          return;
        }

        //process JSoN message
        const data: IncomingMessage = JSON.parse(messageStr);

        //if its seen
        if (data.type === "MARK_AS_SEEN" && registeredUserId) {
          const seenKey = `${registeredUserId}_${data.conversationId}`;
          unseenCounts.set(seenKey, 0);
          return;
        }

        //regular msg
        const {
          fromUserId,
          toUserId,
          messageBody,
          conversationId,
          senderType,
        } = data;

        if (!data || !toUserId || !messageBody || !conversationId) {
          console.warn("Invalid messsage format", data);
          return;
        }

        const now = new Date().toISOString();

        const messagePayload = {
          conversationId,
          senderId: fromUserId,
          senderType,
          content: messageBody,
          createdAt: now,
        };

        const messageEvent = JSON.stringify({
          type: "NEW_MESSAGE",
          payload: messagePayload,
        });

        const receiverKey =
          senderType === "user" ? `seller_${toUserId}` : `user_${toUserId}`;
        const senderKey =
          senderType === "user" ? `user_${fromUserId}` : `seller_${fromUserId}`;

        // update unseen count dynamically
        const unseenKey = `${receiverKey}_${conversationId}`;
        const prevCount = unseenCounts.get(unseenKey) || 0;
        unseenCounts.set(unseenKey, prevCount + 1);

        //send new message to recipient
        const receiverSocket = connectedUsers.get(receiverKey);
        if (receiverSocket && receiverSocket.readyState === WebSocket.OPEN) {
          receiverSocket.send(messageEvent);

          //notify unseen count
          receiverSocket.send(
            JSON.stringify({
              type: "UNSEEN_COUNT_UPDATE",
              payload: {
                conversationId,
                count: prevCount + 1,
              },
            })
          );
          console.log(`Delivered message + unseen count to ${receiverKey}`);
        } else {
          console.log(`User ${receiverKey} is offline. Message queued.`);
        }

        //echo to sender
        const senderSocket = connectedUsers.get(senderKey);
        if (senderSocket && senderSocket.readyState === WebSocket.OPEN) {
          senderSocket.send(messageEvent);
          console.log(`Echoed message to sender ${senderKey}`);
        }

        //push to kafka consumer
        await producer.send({
          topic: "chat.new_message",
          messages: [
            {
              key: conversationId,
              value: JSON.stringify(messagePayload),
            },
          ],
        });
        console.log(`message queued to kafka: ${conversationId}`);
      } catch (error) {}
    });

    ws.on("close", async () => {
      if (registeredUserId) {
        connectedUsers.delete(registeredUserId);
        console.log(`Disconnected user ${registeredUserId}`);
        const isSeller = registeredUserId.startsWith("seller_");
        const redisKey = isSeller
          ? `online:seller:${registeredUserId.replace("seller_", "")}`
          : `online:user:${registeredUserId}`;

        await redis.del(redisKey);
      }
    });

    ws.on("error", (err) => {
      console.error("Websocket error", err);
    });
  });
  console.log("Websocket server is ready.");
}
