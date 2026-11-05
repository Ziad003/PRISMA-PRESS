import { NextFunction, Request, Response } from "express";
import { Role } from "../generated/prisma/enums";
import { jwtutils } from "../utils/jwt";
import config from "../config";
import { prisma } from "../lib/prisma";

declare global {
    namespace Express {
        interface Request {
            user?: {
                email: string,
                name: string,
                id: string,
                role: Role
            }
        }
    }
}

const auth = (...requiredRole: Role[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const token = req.cookies.accessToken ? req.cookies.accessToken
                : req.headers.authorization?.startsWith("Bearer")
                    ? req.headers.authorization?.split(" ")[1]
                    : req.headers.authorization;
            if (!token) {
                throw new Error("Please log in to access this resource");
            }

            const verifyToken = jwtutils.verifyToken(token, config.jwt_access_secret as string);

            if (typeof verifyToken === 'string') {
                throw new Error(verifyToken)
            }

            const { email, name, id, role } = verifyToken;

            if (requiredRole.length && !requiredRole.includes(role)) {
                throw new Error("You are not authorized to access this");
            }

            const user = await prisma.user.findUniqueOrThrow({
                where: {
                    id,
                    email
                }
            });

            if (!user) {
                throw new Error("User not found");
            }

            if (user.activeStatus === "BLOCKED") {
                throw new Error("Your access has been blocked. Please contact support for assostance.")
            }

            req.user = {
                email,
                name,
                id,
                role
            }

            next();

        } catch (error:any) {
            next(error.message)
        }
    }
}

export default auth;