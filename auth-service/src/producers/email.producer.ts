import { getChannel, isChannelReady } from "../lib/connectRabbitMq.js";
import logger from "../utils/logger.js";

const QUEUE = "emails";

type EmailEvent =
  | { type: "OTP_EMAIL"; payload: { email: string; otp: string } }
  | {
      type: "PASSWORD_RESET_EMAIL";
      payload: { email: string; resetUrl: string };
    };

export async function publishEmailEvent(event: EmailEvent): Promise<void> {
  if (!isChannelReady()) {
    logger.error("Cannot publish email event — RabbitMQ unavailable", {
      type: event.type,
      to: event.payload.email,
    });
    return;
  }

  const channel = getChannel();
  const message = Buffer.from(JSON.stringify(event));

  const sent = channel.sendToQueue(QUEUE, message, {
    persistent: true,
    contentType: "application/json",
    timestamp: Date.now(),
    messageId: crypto.randomUUID(),
  });

  if (!sent) {
    logger.warn("RabbitMQ write buffer full — message may be dropped", {
      type: event.type,
    });
  }

  logger.info("Email event published", {
    type: event.type,
    to: event.payload.email,
  });
}
