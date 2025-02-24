import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  dnd_campaigns: defineTable({
    name: v.string(),
    status: v.union(
      v.literal("CREATED"),
      v.literal("PLAYERS_ADDED"),
      v.literal("STORY_GENERATED"),
      v.literal("RUNNING"),
    ),
    generated_story: v.optional(v.string()),
    current_context: v.optional(v.string()),
  }),
  dnd_messages: defineTable({
    campaignId: v.id("dnd_campaigns"),
    message: v.string(),
    npc: v.optional(v.id("dnd_npcs")),
    player: v.optional(v.id("dnd_players")),
  }).index("by_campaign", ["campaignId"]),
  dnd_players: defineTable({
    campaignId: v.id("dnd_campaigns"),
    name: v.string(),
    location: v.optional(v.id("dnd_locations")),
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
  dnd_npcs: defineTable({
    campaignId: v.id("dnd_campaigns"),
    name: v.string(),
    description: v.string(),
    location: v.optional(v.id("dnd_locations")),
    hidden: v.boolean(),
  }),
  dnd_locations: defineTable({
    campaignId: v.id("dnd_campaigns"),
    name: v.string(),
    description: v.string(),
    known_information: v.optional(v.string()),
    hidden: v.boolean(),
  }),
});
