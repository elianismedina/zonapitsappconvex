import { httpRouter } from "convex/server";
import { internal } from "./_generated/api";
import { httpAction } from "./_generated/server";

const http = httpRouter();

const handleClerkWebhook = httpAction(async (ctx, request) => {
  const { data, type } = await request.json();

  switch (type) {
    case "user.created":
      await ctx.runMutation(internal.users.createUser, {
        clerkId: data.id,
        email: data.email_addresses[0].email_address,
        first_name: data.first_name || undefined,
        last_name: data.last_name || undefined,
        imageUrl: data.image_url || undefined,
        username: data.username || undefined,
        followersCount: 0,
      });

      break;
    case "user.deleted":
      break;
    default:
      break;
  }
   return new Response(null, { status: 200 });
});

http.route({
  path: "/clerk-users-webhook",
  method: "POST",
  handler: handleClerkWebhook,
});

export default http;
