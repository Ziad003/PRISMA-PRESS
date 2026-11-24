import { Request, Response } from "express";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";
import { subscriptionServices } from "./subscription.service";

const createcheckoutSeassion = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    const result = await subscriptionServices.createCheckoutSession(
      userId as string,
    );

    sendResponse(res, {
      success: true,
      statuscode: httpStatus.OK,
      message: "Checkout completed successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Something went wrong!",
      error: error.message,
    });
  }
};

const handleWebhook = async (req: Request, res: Response) => {
  try {
    const event = req.body as Buffer;
    const signature = req.headers["stripe-signature"]!;

    await subscriptionServices.handleWebhook(event, signature as string);

    sendResponse(res, {
      success: true,
      statuscode: httpStatus.OK,
      message: "Webhook handled successfully",
      data: null,
    });
  } catch (error: any) {
    console.error("Webhook error", error.message);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Something went wrong!",
      error: error.message,
    });
  }
};

export const subscriptionController = {
  createcheckoutSeassion,
  handleWebhook,
};
