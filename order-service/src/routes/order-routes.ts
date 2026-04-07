import { Router } from "express";
import { validate } from "../middlewares/validateMiddleware.js";
import { gatewayAuth } from "../middlewares/authMiddleware.js";

const router = Router();

router.use(gatewayAuth);

router.post("/");

router.get("/");

router.get("/:id");

export default router;
