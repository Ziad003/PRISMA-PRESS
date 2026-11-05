import { Request, Response } from "express";
import { authService } from "./auth.service";
import { sendResponse } from "../utils/sendResponse";
import httpStatus from "http-status";


const loginUser = async (req: Request, res: Response) => {
    const payLoad = req.body;

    const {accessToken,refreshToken} = await authService.loginUserIntoDB(payLoad)

    res.cookie("accessToken",accessToken,{
        httpOnly:true,
        secure: false,
        sameSite: "none",
        maxAge: 1000 * 60 * 60 * 24
    })

    res.cookie("refreshToken",refreshToken,{
        httpOnly:true,
        secure:false,
        sameSite:false,
        maxAge:1000 * 60 * 60 * 24 * 7
    })

    sendResponse(res, {
        success: true,
        statuscode: httpStatus.OK,
        message: "Login successful",
        data: {accessToken,refreshToken}
    })
}


export const authController = {
    loginUser
}