import amqp from "amqplib";
import logger from "../utils/logger.js";

const RECONNECT_DELAY_MS = 5000;
const MAX_RECONNECT_ATTEMPTS = 10;

let channel: amqp.Channel | null = null;
let reconnectAttempts = 0;
let isConnecting = false;

const rabbitmqUrl = process.env.RABBITMQ_URL;
if (!rabbitmqUrl) {
  throw new Error("RABBITMQ_URL is not defined");
}

async function setupChannel(
  connection: amqp.ChannelModel,
): Promise<amqp.Channel> {
  const ch = await connection.createChannel();

  await ch.prefetch(1);

  await ch.assertExchange("dlx.emails", "direct", { durable: true });
  await ch.assertQueue("emails.dead", {
    durable: true,
  });
  await ch.bindQueue("emails.dead", "dlx.emails", "emails");

  await ch.assertQueue("emails", {
    durable: true,
    arguments: {
      "x-dead-letter-exchange": "dlx.emails",
      "x-dead-letter-routing-key": "emails",
      "x-message-ttl": 24 * 60 * 60 * 1000, // 24hr TTL
    },
  });

  ch.on("error", (err) => {
    logger.error("RabbitMQ channel error", { message: err.message });
    channel = null;
  });

  ch.on("close", () => {
    logger.warn("RabbitMQ channel closed");
    channel = null;
  });

  return ch;
}

export async function connectRabbitMq(): Promise<void> {
  if (isConnecting) return;
  isConnecting = true;

  try {
    const connection = await amqp.connect(rabbitmqUrl!);

    connection.on("error", (err) => {
      logger.error("RabbitMQ connection error", { message: err.message });
      channel = null;
      scheduleReconnect();
    });

    connection.on("close", () => {
      logger.warn("RabbitMQ connection closed — reconnecting");
      channel = null;
      scheduleReconnect();
    });

    channel = await setupChannel(connection);
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
    logger.error("RabbitMQ max reconnect attempts reached — giving up");
    return;
  }
  reconnectAttempts++;
  const delay = Math.min(RECONNECT_DELAY_MS * reconnectAttempts, 30000);
  logger.info(
    `RabbitMQ reconnecting in ${delay}ms (attempt ${reconnectAttempts})`,
  );
  setTimeout(connectRabbitMq, delay);
}

export function getChannel(): amqp.Channel {
  if (!channel) throw new Error("RabbitMQ channel unavailable");
  return channel;
}

export function isChannelReady(): boolean {
  return channel !== null;
}
