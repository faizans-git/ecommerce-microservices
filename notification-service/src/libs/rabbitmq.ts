import amqp from "amqplib";
import logger from "./logger.js";
import { error } from "console";

let channel: amqp.Channel;

const rabbitmqUrl = process.env.RABBITMQ_URL;
if (!rabbitmqUrl) {
  logger.error("rabbitMq url undefined");
  throw error;
}
export async function connectRabbitMq() {
  try {
    const connection = await amqp.connect(rabbitmqUrl!);
    channel = await connection.createChannel();
    logger.info("RabbitMQ connected");
    return channel;
  } catch (error) {
    logger.error("Error connecting rabbit mq", error);
    throw error;
  }
}
export function getChannel() {
  if (!channel) throw new Error("RabbitMQ not initialized");
  return channel;
}
