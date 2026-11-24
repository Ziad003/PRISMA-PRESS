import Stripe from "stripe";
import { stripe } from "../../lib/stripe";
import { prisma } from "../../lib/prisma";
import { SubscriptionStatus } from "../../generated/prisma/enums";

export const handleCheckoutCompleted= async (session: Stripe.Checkout.Session)=>{
          // console.log(session);
        
        const userId = session.metadata?.userId;
        const stripeCustomerId = session.customer as string;
        const stripeSubscriptionId = session.subscription as string;
        if (!userId || !stripeSubscriptionId || !stripeCustomerId) {
          console.log("Webhook: missing values for creating checkout session")
          return;
        }

        const stripeSubscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);

        // console.log("sub info", stripeSubscription.items.data[0]);
        const currentPeriodEndInMilliseconds = stripeSubscription.items.data[0]?.current_period_end!;
        const currentPeriodEnd = new Date(currentPeriodEndInMilliseconds * 1000);

        // console.log(currentPeriodEnd, "end");

        await prisma.subscription.upsert({
          where: {
            userId
          },
          create: {
            userId,
            stripeCustomerId,
            stripeSubscriptionId,
            status: "ACTIVE",
            currentPeriodEnd


          },
          update: {
            stripeCustomerId,
            stripeSubscriptionId,
            status: "ACTIVE",
            currentPeriodEnd

          }
        })
}

export const handleChangedSubscription = async(payload: Stripe.Subscription) => {
  console.log(payload)
    const stripeSubscriptionId=payload.id;

    const status= (payload.status==="active" || payload.status==="trialing")? SubscriptionStatus.ACTIVE:
                  payload.status==="canceled"? SubscriptionStatus.CANCLED:SubscriptionStatus.EXPIRED;
                  

                  const stripeSubscription= await stripe.subscriptions.retrieve(stripeSubscriptionId)
                  const currentPeriodEnd= new Date(stripeSubscription.items.data[0]?.current_period_end! * 1000)

                  const isSubscrioptionExist= await prisma.subscription.findUnique({
                    where:{
                      stripeSubscriptionId
                    }
                  })

                  if(!isSubscrioptionExist){
                    console.log(`Webhook: No subscription found for subscription id: ${stripeSubscriptionId}`)
                  
                    return;
                  }

                  await prisma.subscription.update({
                    where:{
                      stripeSubscriptionId
                    },
                    data:{
                      status,
                      currentPeriodEnd
                    }
                  })

 }