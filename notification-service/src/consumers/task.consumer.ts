import { getChannel } from "../libs/rabbitmq.js";
import logger from "../libs/logger.js";

export async function startTaskConsumer() {
  const channel = getChannel();
  const queue = "tasks";

  await channel.assertQueue(queue, { durable: true });

  channel.consume(queue, async (msg) => {
    if (!msg) return;

    try {
      const content = msg.content.toString();

      logger.info("Message received", { content });

      await new Promise((res) => setTimeout(res, 1000));

      channel.ack(msg);
    } catch (err) {
      logger.error("Message processing failed", { err });

      channel.nack(msg, false, false);
    }
  });

  logger.info("Task consumer started");
}
