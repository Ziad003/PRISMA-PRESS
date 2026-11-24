import { Router } from "express";
import { subscriptionController } from "./subscription.controller";
import auth from "../../middleware/authMiddleware";
import { Role } from "../../generated/prisma/enums";

const router=Router();

router.post("/checkout",
    auth(Role.USER,Role.ADMIN,Role.AUTHOR),
    subscriptionController.createcheckoutSeassion)

router.post("/webhook",subscriptionController.handleWebhook)

export const subscriptRoutes=router;