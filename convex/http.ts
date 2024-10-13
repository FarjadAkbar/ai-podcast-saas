import type { WebhookEvent } from "@clerk/nextjs/server";
import { httpRouter } from "convex/server";
import { Webhook } from "svix";

import { api, internal } from './_generated/api'
import { httpAction } from "./_generated/server";

// define the webhook handler
const handleClerkWebhook = httpAction(async (ctx, request) => {
    const event = await validateRequest(request)
    if (!event) {
      return new Response('Error occured', { status: 400 })
    }
    switch (event.type) {
        case 'user.created':
            await ctx.runMutation(api.users.createUser, {
                clerkId: event.data.id,
                email: event.data.email_addresses[0].email_address,
                imageUrl: event.data.image_url,
                username: event.data.username as string
            })
            break;
        case "user.updated":
            await ctx.runMutation(api.users.updateUser, {
                clerkId: event.data.id,
                imageUrl: event.data.image_url,
                email: event.data.email_addresses[0].email_address,
                username: event.data.username as string
            });
            break;
        case "user.deleted":
            await ctx.runMutation(api.users.deleteUser, {
            clerkId: event.data.id as string,
            });
            break;
        default: {
          console.log('ignored Clerk webhook event', event.type)
        }
      }
    return new Response(null, { status: 200 })
  });
  
  // define the http router
  const http = httpRouter()
  
  // define the webhook route
  http.route({
    path: '/clerk',
    method: 'POST',
    handler: handleClerkWebhook,
  })


  const validateRequest = async (
    req: Request
  ): Promise<WebhookEvent | undefined> => {
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET!;
    if (!webhookSecret) {
      throw new Error("CLERK_WEBHOOK_SECRET is not defined");
    }
    const payloadString = await req.text();
    const headerPayload = req.headers;
    const svixHeaders = {
      "svix-id": headerPayload.get("svix-id")!,
      "svix-timestamp": headerPayload.get("svix-timestamp")!,
      "svix-signature": headerPayload.get("svix-signature")!,
    };
    const wh = new Webhook(webhookSecret);
    const event = wh.verify(payloadString, svixHeaders);
    return event as unknown as WebhookEvent;
  };

  
export default http;