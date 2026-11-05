import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";
import { ILoginUser } from "./auth.interface"
import jwt, { SignOptions } from "jsonwebtoken"
import config from "../config";
import { jwtutils } from "../utils/jwt";

const loginUserIntoDB = async (payLoad: ILoginUser) => {
    const { email, password } = payLoad;

    const user = await prisma.user.findUniqueOrThrow({
        where: { email }
    });

    if (!user) {
        throw new Error("No user with this email")
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
        throw new Error("Password doesn't match");
    }


    const jwtPayload={
        id:user.id,
        name:user.name,
        email:user.email,
        role:user.role
    }

//     const accessToken=jwt.sign(jwtPayload,config.jwt_access_secret as string, {
//         expiresIn:config.jwt_access_expires_in
//     }as SignOptions
// )

    const accessToken=jwtutils.createToken(
        jwtPayload,
        config.jwt_access_secret as string,
        config.jwt_access_expires_in as SignOptions
    )

  const refreshToken=jwtutils.createToken(
    jwtPayload,
    config.jwt_refresh_secret as string, 
    config.jwt_refresh_expires_in as SignOptions
  )

    return {
        accessToken,
        refreshToken
    };
}

export const authService = {
    loginUserIntoDB
}