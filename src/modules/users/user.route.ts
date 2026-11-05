import { Request, Response, Router } from "express";
const router = Router();

import { userController } from "./user.controller";
import auth from "../../middleware/authMiddleware";
import { Role } from "../../generated/prisma/enums";

router.post("/register", userController.registerUser);
router.get("/me", auth(Role.AUTHOR, Role.USER), userController.getMyProfile)
router.put("/my-profile",auth(Role.AUTHOR,Role.USER),userController.updateMyProfile)
export const userRouter = router;