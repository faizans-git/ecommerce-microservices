import amqp from "amqplib";
import logger from "./logger";

let channel: amqp.Channel | null;
let isConnecting = false;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 10;
const RECONNECT_DELAY_MS = 5000;

const rabbitmqUrl = process.env.RABBITMQ_URL;
if (!rabbitmqUrl) throw new Error("RABBITMQ_URL is not defined");

async function setupChannel(conn: amqp.ChannelModel): Promise<amqp.Channel> {
  const ch = await conn.createChannel();
  await ch.prefetch(5);

  await ch.assertExchange("dlx.product.events", "direct", { durable: true });
  await ch.assertQueue("product.events.dead", { durable: true });
  await ch.bindQueue(
    "product.events.dead",
    "dlx.product.events",
    "product.events",
  );
  await ch.assertQueue("product.events", {
    durable: true,
    arguments: {
      "x-dead-letter-exchange": "dlx.product.events",
      "x-dead-letter-routing-key": "product.events",
      "x-message-ttl": 86400000,
    },
  });

  ch.on("error", (err: Error) => {
    logger.error("Channel error", { message: err.message });
    channel = null;
  });
  ch.on("close", () => {
    logger.warn("Channel closed");
    channel = null;
  });

  return ch;
}

export async function connectRabbitMq(): Promise<void> {
  if (isConnecting) return;
  isConnecting = true;
  try {
    const conn = await amqp.connect(rabbitmqUrl!);
    conn.on("close", () => {
      channel = null;
      scheduleReconnect();
    });
    channel = await setupChannel(conn);
    reconnectAttempts = 0;
    logger.info("RabbitMQ connected");
  } catch (error) {
    logger.error("Error connecting with rabbit mq");
  }
}

function scheduleReconnect(): void {
  if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
    logger.error("RabbitMQ max reconnect attempts reached");
    return;
  }
  reconnectAttempts++;
  const delay = Math.min(RECONNECT_DELAY_MS * reconnectAttempts, 30000);
  logger.info(`Reconnecting in ${delay}ms (attempt ${reconnectAttempts})`);
  setTimeout(connectRabbitMq, delay);
}

export const getChannel = (): amqp.Channel => {
  if (!channel) throw new Error("RabbitMQ channel unavailable");
  return channel;
};
