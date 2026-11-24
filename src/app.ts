import cookieParser from "cookie-parser";
import express, { Application, Request, Response } from "express";
const app: Application = express();
import cors from "cors";
import config from "./config";

import { userRouter } from "./modules/users/user.route";
import { authRouter } from "./auth/auth.route";
import { postRouter } from "./modules/posts/post.route";
import { commentRouter } from "./modules/comments/comment.route";
import { subscriptRoutes } from "./modules/subscription/subscription.route";
import { stripe } from "./lib/stripe";
import { Stripe } from "stripe";

app.use(
  cors({
    origin: config.app_url,
    credentials: true,
  }),
);

const endpointSecret = config.stripe_webhook_secret!;

// app.post(
//   "/api/subscription/webhook",
//   express.raw({ type: "application/json" }),
//   async (request, response) => {
//     const signature = request.headers["stripe-signature"]!;
//     let event: Stripe.Event;

//     try {
//       // Thin event-এর বদলে standard constructEvent ব্যবহার করো
//       event = stripe.webhooks.constructEvent(
//         request.body,
//         signature,
//         endpointSecret,
//       );
//     } catch (err: any) {
//       console.log(`Webhook signature verification failed.`, err.message);
//       return response.status(400).json({ message: err.message });
//     }

//     console.log(event);

//     switch (event.type) {
//       case "payment_intent.succeeded": {
//         // 'v1.' ছাড়া
//         const paymentIntent = event.data.object as Stripe.PaymentIntent;
//         console.log(
//           `PaymentIntent for ${paymentIntent.amount} was successful!`,
//         );
//         break;
//       }
//       case "checkout.session.completed": {
//         const session = event.data.object as Stripe.Checkout.Session;
//         console.log(`Checkout completed: ${session.id}`);
//         break;
//       }
//       default:
//         console.log(`Unhandled event type ${event.type}.`);
//     }

//     response.send();
//   },
// );
app.use("/api/subscription/webhook", express.raw({type: "application/json"}))

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});

app.use("/api/users", userRouter);
app.use("/api/auth", authRouter);
app.use("/api/posts", postRouter);
app.use("/api/comments", commentRouter);
app.use("/api/subscription", subscriptRoutes);

export default app;
