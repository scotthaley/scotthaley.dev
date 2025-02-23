import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  dnd_campaigns: defineTable({
    name: v.string(),
    status: v.union(
      v.literal("CREATED"),
      v.literal("PLAYERS_ADDED"),
      v.literal("STORY_GENERATED"),
    ),
    generated_story: v.optional(v.string()),
  }),
  dnd_messages: defineTable({
    campaignId: v.id("dnd_campaigns"),
    message: v.string(),
  }).index("by_campaign", ["campaignId"]),
  dnd_players: defineTable({
    campaignId: v.id("dnd_campaigns"),
    name: v.string(),
    class: v.string(),
    race: v.string(),
    background: v.string(),
    level: v.number(),
    exp: v.number(),
    hitpoints: v.number(),
    hitpoint_max: v.number(),
    strength: v.number(),
    dexterity: v.number(),
    constitution: v.number(),
    intelligence: v.number(),
    wisdom: v.number(),
    charisma: v.number(),
  }),
});
