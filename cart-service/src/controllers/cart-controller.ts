import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import { cartService } from "../services/cart-service.js";
import logger from "../lib/logger.js";

export class CartController {
  getCart = asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.user!;
    const cart = await cartService.getUserCart(userId);

    res.status(200).json({ success: true, data: cart });
  });

  addItem = asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.user!;
    const { variantId, quantity } = req.body;

    logger.info(`Adding item to cart`, { userId, variantId, quantity });

    const updatedItem = await cartService.addToCart(
      userId,
      variantId,
      quantity,
    );

    logger.info(`Item updated`, { userId, variantId });

    res.status(200).json({
      success: true,
      message: "Item added to cart",
      data: updatedItem,
    });
  });

  updateItem = asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.user!;
    const { variantId, quantity } = req.body;

    const updatedItem = await cartService.updateQuantity(
      userId,
      variantId,
      quantity,
    );

    logger.info(`Item updated`, { userId, variantId });

    if (!updatedItem) {
      return res.status(200).json({ success: true, message: "Item removed" });
    }

    res.status(200).json({
      success: true,
      message: "Cart updated",
      data: updatedItem,
    });
  });

  removeItem = asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.user!;
    const variantId = req.params.variantId as string;

    await cartService.removeFromCart(userId, variantId);

    logger.info(`Item removed from cart`, { userId, variantId });
    res.status(200).json({ success: true, message: "Item removed" });
  });

  clearCart = asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.user!;

    await cartService.clearUserCart(userId);

    logger.info(`Cart cleared`, { userId });
    res.status(200).json({ success: true, message: "Cart cleared" });
  });
}

export const cartController = new CartController();
