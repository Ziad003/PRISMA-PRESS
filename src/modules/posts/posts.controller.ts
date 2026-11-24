import { Request, Response } from "express"
import { sendResponse } from "../../utils/sendResponse"
import httpStatus from "http-status"

const createPost=async(req:Request,res:Response)=>{
    try {
        
        
    } catch (error:any) {
        sendResponse(res,{
            success:true,
            statuscode:httpStatus.INTERNAL_SERVER_ERROR,
            message:error.messae
        })
    }
}