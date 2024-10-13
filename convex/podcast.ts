import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

export const getPodcastById = query({
  args: {
    _id: v.string()
  },
  handler(ctx, args_0) {
    const { _id } = args_0;
    return ctx.db
      .query('podcast')
      .filter((q) => q.eq(q.field('_id'), _id))
      .unique();
  }
});

export const createPodcast = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    audioUrl: v.optional(v.string()),
    audioStorageId: v.optional(v.id('_storage')),
    imageUrl: v.optional(v.string()),
    imageStorageId: v.optional(v.id('_storage')),
    voicePrompt: v.string(),
    imagePrompt: v.string(),
    voiceType: v.string(),
    audioDuration: v.number(),
    views: v.string(),
    author: v.string(),
    user: v.id('users'),
  },
  handler(ctx, args) {
    return ctx.db.insert('podcast', args);
  }
})


export const updatePodcast = mutation({
  args: {
    _id: v.string(),
    title: v.string(),
    description: v.string(),
    audioUrl: v.optional(v.string()),
    audioStorageId: v.optional(v.id('_storage')),
    imageUrl: v.optional(v.string()),
    imageStorageId: v.optional(v.id('_storage')),
    audioPrompt: v.string(),
    imagePrompt: v.string(),
    voiceType: v.string(),
    audioDuration: v.number(),
    views: v.string(),
    author: v.string(),
    user: v.id('users'),
  },
  async handler(ctx, args) {
    const podcast = await ctx.db
    .query('podcast').filter((q) => q.eq(q.field('_id'), args._id)).first();
    
    if(podcast){
      const { _id, ...updatedFields } = args;
      return await ctx.db.patch(podcast._id, updatedFields);
    } else {
        throw new Error("Podcast not found");
    }
  }
});