import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

export const getUserById = query({
  args: {
    clerkId: v.string()
  },
  handler(ctx, args_0) {
    const { clerkId } = args_0;
    return ctx.db
      .query('users')
      .filter((q) => q.eq(q.field('clerkId'), clerkId))
      .unique();
  }
});

export const createUser = mutation({
  args: {
    clerkId: v.string(),
    username: v.string(),
    email: v.string(),
    imageUrl: v.optional(v.string())
  },
  handler(ctx, args) {
    return ctx.db.insert('users', args);
  }
});

export const updateUser = mutation({
  args: {
    clerkId: v.string(),
    username: v.string(),
    email: v.string(),
    imageUrl: v.optional(v.string())
  },
  async handler(ctx, args) {
    const { clerkId, username, email, imageUrl } = args;
    const user = await ctx.db
      .query('users')
      .filter((q) => q.eq(q.field('clerkId'), clerkId))
      .first();

    // Step 2: If the user exists, patch their information
    if (user) {
      return ctx.db.patch(user._id, { username, email, imageUrl });
    } else {
      throw new Error('User not found');
    }
  }
});


export const deleteUser = mutation({
  args: {
    clerkId: v.string()
  },
  async handler(ctx, args_0) {
    const { clerkId } = args_0;
    const user = await ctx.db
      .query('users')
      .filter((q) => q.eq(q.field('clerkId'), clerkId)).first();

    if(user){
      await ctx.db.delete(user._id);
      return { success: true, message: 'User deleted successfully' };
    } else{
        throw new Error("User not found");  
    }
  }
});