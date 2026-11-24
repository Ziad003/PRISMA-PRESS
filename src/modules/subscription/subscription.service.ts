import { Stripe } from "stripe";
import config from "../../config";
import { prisma } from "../../lib/prisma";
import { stripe } from "../../lib/stripe";
import { SubscriptionStatus } from "../../generated/prisma/enums";
import { handleChangedSubscription, handleCheckoutCompleted } from "./subscription.utils";

const createCheckoutSession = async (userId: string) => {
  const transactionResult = await prisma.$transaction(async (tx) => {
    const user = await tx.user.findUniqueOrThrow({
      where: {
        id: userId,
      },
      include: {
        subscription: true,
      },
    });

    let stripeCustomerId = user.subscription?.stripeCustomerId;
    //old subscriber
    if (!stripeCustomerId) {
      //new subscriber
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: {
          userId: user.id,
        },
      });
      stripeCustomerId = customer.id;
    }

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: config.stripe_product_price_id,
          quantity: 1,
        },
      ],
      mode: "subscription",
      customer: stripeCustomerId,
      success_url: `${config.app_url}/premium?success=true`,
      cancel_url: `${config.app_url}/payment?success=false`,
      metadata: { userId: user.id },
    });

    return session.url;
  });
  return transactionResult;
};

const handleWebhook = async (payload: Buffer, signature: string) => {
  const endpointSecret = config.stripe_webhook_secret!;
  const event = stripe.webhooks.constructEvent(
    payload,
    signature,
    endpointSecret,
  );

  try {
    switch (event.type) {
      case "checkout.session.completed": {

        await handleCheckoutCompleted(event.data.object )

        break;
      }
      case "customer.subscription.updated": {
        await handleChangedSubscription(event.data.object)
        break;

        /*
          To test this run this comman in terminal
          stripe subscriptions cancel sub_id
        */
      }
      case "customer.subscription.deleted": {
        await handleChangedSubscription(event.data.object)
        break;
      }

      default:
        console.log(`No event matched. Unhandled event type ${event.type}.`);
        break;
    }
  } catch (error: any) {
    console.error("Error", error.message)
  }
};



export const subscriptionServices = {
  createCheckoutSession,
  handleWebhook,
};
