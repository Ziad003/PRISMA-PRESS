import { NextFunction, Request, RequestHandler, Response } from "express";
import httpStatus from "http-status";
import { userServe } from "./user.service";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import jwt from "jsonwebtoken";
import config from "../../config";
import { jwtutils } from "../../utils/jwt";


// const registerUser = async (req: Request, res: Response) => {

//     try {
//         const payload = req.body;

//     const user = await userServe.registerUserIntoDb(payload)

//     res
//         .status(httpStatus.CREATED)
//         .json({
//             success: true,
//             statusCode: httpStatus.CREATED,
//             message: "User registered successfully",
//             data: {
//                 user
//             }

//         });
//     } catch (error) {
//         console.log(error);
//         res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
//             success:false,
//             STATUS_CODES:httpStatus.INTERNAL_SERVER_ERROR,
//             message:(error as Error).message
//         })
//     }
// }
const registerUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body;
    const user = await userServe.registerUserIntoDb(payload);

    // res.status(httpStatus.CREATED).json({
    //     success:true,
    //     successCode: httpStatus.CREATED,
    //     message: "User registered successfully",
    //     data:{
    //         user
    //     }
    // })
    sendResponse(res, {
        success: true,
        statuscode: httpStatus.CREATED,
        message: "User regustered successfully",
        data: { user }
    })
});

const getMyProfile = async (req: Request, res: Response) => {

    try {
        // const { accessToken } = req.cookies
        // console.log(req.user)
        // const verifyToken = jwtutils.verifyToken(accessToken, config.jwt_access_secret as string)

        // if (typeof verifyToken === "string") {
        //     throw new Error(verifyToken)
        // }

        const user = await userServe.getMyProfileFromDB(req.user?.id as string)


        sendResponse(res, {
            success: true,
            statuscode: httpStatus.OK,
            message: "User profile fetched successfully",
            data: { user }
        })
    } catch (error: any) {
        sendResponse(res, {
            success: false,
            statuscode: httpStatus.FORBIDDEN,
            message: "Can not access profile",
            error: error.message
        })
    }
};

const updateMyProfile=async(req:Request,res:Response)=>{
  try {
      const userId=req.user?.id as string
    const payload=req.body;

    const updatedProfile=await userServe.updateMyProfileInDB(userId,payload)
    
    sendResponse(res,{
        success:true,
        statuscode:httpStatus.OK,
        message:"Successfully updated",
        data:{updatedProfile}
    })
} catch (error:any) {
    sendResponse(res,{
        success:false,
        statuscode:httpStatus.FORBIDDEN,
        message:"Can not update.",
        error:error.message
    })
  }

}


export const userController = {
    registerUser,
    getMyProfile,
    updateMyProfile
}