// add imports and like figure out consumption logic

type ProductCreatedEvent = {
  type: "PRODUCT_CREATED";
  payload: { productId: string; imageUrls: string[] };
};

export async function startProductConsumer() {
  const ch = getChannel();

  await ch.assertQueue("product.events", { durable: true });

  ch.consume(
    "product.events",
    async (msg) => {
      if (!msg) return;
      try {
        const event = JSON.parse(msg.content.toString()) as ProductCreatedEvent;
        if (event.type === "PRODUCT_CREATED") {
          // store productId → urls mapping in your DB
          // so you can run a cleanup job for orphaned uploads
          await markImagesAttached(
            event.payload.imageUrls,
            event.payload.productId,
          );
        }
        ch.ack(msg);
      } catch {
        ch.nack(msg, false, false);
      }
    },
    { noAck: false },
  );
}
