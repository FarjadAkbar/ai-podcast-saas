import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// use hasManyThrough relation for files.
// use s3 for file storage.

export default defineSchema({
  users: defineTable({
    email: v.string(),
    imageUrl: v.optional(v.string()),
    clerkId: v.string(),
    username: v.string(),
  }),
  podcast: defineTable({
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
  })
  .searchIndex('search_author', { searchField: 'author' })
  .searchIndex('search_title', { searchField: 'title' })
  .searchIndex('search_body', { searchField: 'description' })
});