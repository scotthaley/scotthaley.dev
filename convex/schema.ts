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
    current_act: v.optional(v.number()),
    current_room: v.optional(v.id("dnd_entities")),
    speaking: v.optional(v.string()),
  }),
  dnd_campaign_acts: defineTable({
    campaignId: v.id("dnd_campaigns"),
    number: v.number(),
    name: v.string(),
    description: v.string(),
    resolution: v.string(),
    encounters: v.array(
      v.object({
        encounter_description: v.string(),
        story_importance: v.string(),
      }),
    ),
  }),
  dnd_messages: defineTable({
    campaignId: v.id("dnd_campaigns"),
    message: v.string(),
    speaker: v.string(),
    summary: v.string(),
    to_gm: v.optional(v.boolean()),
  }).index("by_campaign", ["campaignId"]),
  dnd_players: defineTable({
    campaignId: v.id("dnd_campaigns"),
    name: v.string(),
    location: v.optional(v.id("dnd_entities")),
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
  dnd_entities: defineTable({
    campaignId: v.id("dnd_campaigns"),
    name: v.string(),
    aliases: v.array(v.string()),
    entity_type: v.union(
      v.literal("NPC"),
      v.literal("LOCATION"),
      v.literal("GROUP"),
      v.literal("OBJECT"),
    ),
    known_information: v.string(),
    full_information: v.string(),
    known_to_player: v.boolean(),
  }),
});
