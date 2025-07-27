import { kafka } from "../../../packages/utils/kafka";
import prisma from "../../../packages/libs/prisma";
import { Consumer, EachMessagePayload } from "kafkajs";
import { incrementUnseenCount } from "../../../packages/libs/redis/message.redis";

interface BufferedMessage {
  conversationId: string;
  senderId: string;
  senderType: string;
  content: string;
  createdAt: string;
}

const TOPIC = "chat_new_meassge";
const GROUP_ID = "chat-message-db-writer";
const BATCH_INTERVAL_MS = 3000;

let buffer: BufferedMessage[] = [];
let flushTimer: NodeJS.Timeout | null = null;

//initialize kafka consumer
export async function startConsumer() {
  const consumer: Consumer = kafka.consumer({ groupId: GROUP_ID });
  await consumer.connect();
  await consumer.subscribe({ topic: TOPIC, fromBeginning: false });
  console.log(`kafka consumer connected and subscribed to "${TOPIC}"`);

  //start consuming
  await consumer.run({
    eachMessage: async ({ message }: EachMessagePayload) => {
      if (!message.value) return;

      try {
        const parsed: BufferedMessage = JSON.parse(message.value.toString());
        buffer.push(parsed);

        //if this is the first message in an empty array then start the timer
        if (buffer.length === 1 && !flushTimer) {
          flushTimer = setTimeout(flushBufferToDb, BATCH_INTERVAL_MS);
        }
      } catch (error) {
        console.log("fAILED TO PARSE KAFKA MESSSAGE", error);
      }
    },
  });
}

//flush the buffer to db and reset the timer
async function flushBufferToDb() {
  const toInsert = buffer.splice(0, buffer.length);
  if (flushTimer) {
    clearTimeout(flushTimer);
    flushTimer = null;
  }

  if (toInsert.length === 0) return;

  try {
    const prismaPayload = toInsert.map((msg) => ({
      conversationId: msg.conversationId,
      senderId: msg.senderId,
      senderType: msg.senderId,
      content: msg.content,
      createdAt: new Date(msg.createdAt),
    }));

    await prisma.message.createMany({
      data: prismaPayload,
    });

    //redis unseen counter (only if db insrt is successful)
    for (const msg of prismaPayload) {
      const receiverType = msg.senderType === "user" ? "seller" : "user";
      await incrementUnseenCount(receiverType, msg.conversationId);
    }
    console.log(`flused ${prismaPayload.length} messages to DB and Redis.`);
  } catch (error) {
    console.log("Error inserting to DB: ", error);
    buffer.unshift(...toInsert);
    if (!flushTimer) {
      flushTimer = setTimeout(flushBufferToDb, BATCH_INTERVAL_MS);
    }
  }
}
