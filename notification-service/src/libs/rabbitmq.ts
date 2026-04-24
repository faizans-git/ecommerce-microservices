import amqp from "amqplib";
import logger from "./logger.js";

const RECONNECT_DELAY_MS = 5000;
const MAX_RECONNECT_ATTEMPTS = 10;

let channel: amqp.Channel | null = null;
let reconnectAttempts = 0;
let isConnecting = false;

const rabbitmqUrl = process.env.RABBITMQ_URL;
if (!rabbitmqUrl) throw new Error("RABBITMQ_URL is not defined");

async function setupChannel(conn: amqp.ChannelModel): Promise<amqp.Channel> {
  const ch = await conn.createChannel();
  await ch.prefetch(1);

  await ch.assertExchange("dlx.emails", "direct", { durable: true });
  await ch.assertQueue("emails.dead", { durable: true });
  await ch.bindQueue("emails.dead", "dlx.emails", "emails");

  await ch.assertQueue("emails", {
    durable: true,
    arguments: {
      "x-dead-letter-exchange": "dlx.emails",
      "x-dead-letter-routing-key": "emails",
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
    conn.on("error", (err: Error) => {
      channel = null;
      scheduleReconnect();
    });
    conn.on("close", () => {
      channel = null;
      scheduleReconnect();
    });
    channel = await setupChannel(conn);
    reconnectAttempts = 0;
    logger.info("RabbitMQ connected");
  } catch (err: any) {
    logger.error("RabbitMQ connection failed", { message: err.message });
    scheduleReconnect();
  } finally {
    isConnecting = false;
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
export const isChannelReady = () => channel !== null;
