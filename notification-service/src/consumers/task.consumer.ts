import { getChannel } from "../libs/rabbitmq.js";
import { sendOtpEmail, sendPasswordResetEmail } from "../utils/emailService.js";
import logger from "../libs/logger.js";

type EmailEvent =
  | { type: "OTP_EMAIL"; payload: { email: string; otp: string } }
  | {
      type: "PASSWORD_RESET_EMAIL";
      payload: { email: string; resetUrl: string };
    };

const MAX_RETRIES = 3;

export async function startEmailConsumer(): Promise<void> {
  const channel = getChannel();

  channel.consume(
    "emails",
    async (msg) => {
      if (!msg) return; // broker cancelled the consumer

      const retries = (msg.properties.headers?.["x-retry-count"] ??
        0) as number;

      let event: EmailEvent;
      try {
        event = JSON.parse(msg.content.toString()) as EmailEvent;
      } catch {
        logger.error("Failed to parse message", {
          content: msg.content.toString(),
        });
        channel.nack(msg, false, false);
        return;
      }

      try {
        if (event.type === "OTP_EMAIL") {
          await sendOtpEmail(event.payload.email, event.payload.otp);
        } else if (event.type === "PASSWORD_RESET_EMAIL") {
          await sendPasswordResetEmail(
            event.payload.email,
            event.payload.resetUrl,
          );
        } else {
          logger.warn("Unknown event type", { type: (event as any).type });
          channel.nack(msg, false, false);
          return;
        }

        channel.ack(msg);
        logger.info("Email sent", {
          type: event.type,
          to: event.payload.email,
        });
      } catch (err: any) {
        logger.error("Email send failed", {
          type: event.type,
          to: event.payload.email,
          retries,
          error: err.message,
        });

        if (retries < MAX_RETRIES) {
          // Republish with incremented retry count and delay
          const delay = Math.pow(2, retries) * 1000; // 1s, 2s, 4s
          setTimeout(() => {
            channel.sendToQueue("emails", msg.content, {
              persistent: true,
              headers: { "x-retry-count": retries + 1 },
            });
          }, delay);
          channel.ack(msg);
        } else {
          logger.error("Max retries reached, dead lettering", {
            type: event.type,
          });
          channel.nack(msg, false, false);
        }
      }
    },
    { noAck: false },
  );

  logger.info("Email consumer started");
}
