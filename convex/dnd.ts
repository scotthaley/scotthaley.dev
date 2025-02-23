import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getCampaign = query({
  args: { dndId: v.string() },
  handler: async (ctx, args) => {
    const id = ctx.db.normalizeId("dnd_campaigns", args.dndId);

    if (id === null) {
      return null;
    }

    return await ctx.db.get(id);
  },
});

export const getCampaignPlayers = query({
  args: { dndId: v.string() },
  handler: async (ctx, args) => {
    const id = ctx.db.normalizeId("dnd_campaigns", args.dndId);

    if (id === null) {
      return null;
    }

    return await ctx.db
      .query("dnd_players")
      .filter((q) => q.eq(q.field("campaignId"), id))
      .collect();
  },
});

export const playersAdded = mutation({
  args: { dndId: v.string() },
  handler: async (ctx, args) => {
    const id = ctx.db.normalizeId("dnd_campaigns", args.dndId);

    if (id === null) {
      return null;
    }

    await ctx.db.patch(id, {
      status: "PLAYERS_ADDED",
    });
  },
});

export const updateStory = mutation({
  args: { story: v.string(), dndId: v.string() },
  handler: async (ctx, args) => {
    const id = ctx.db.normalizeId("dnd_campaigns", args.dndId);

    if (id === null) {
      return null;
    }

    await ctx.db.patch(id, {
      generated_story: args.story,
      status: "STORY_GENERATED",
    });
  },
});

export const insertMessage = mutation({
  args: { message: v.string(), dndId: v.string() },
  handler: async (ctx, args) => {
    const id = ctx.db.normalizeId("dnd_campaigns", args.dndId);

    if (id === null) {
      return null;
    }

    await ctx.db.insert("dnd_messages", {
      campaignId: id,
      message: args.message,
    });
  },
});

export const insertPlayer = mutation({
  args: {
    dndId: v.string(),
    name: v.string(),
    charClass: v.string(),
    race: v.string(),
    background: v.string(),
    level: v.number(),
    xp: v.number(),
    hp: v.number(),
    maxHp: v.number(),
    strength: v.number(),
    dexterity: v.number(),
    constitution: v.number(),
    intelligence: v.number(),
    wisdom: v.number(),
    charisma: v.number(),
  },
  handler: async (ctx, args) => {
    const id = ctx.db.normalizeId("dnd_campaigns", args.dndId);

    if (id === null) {
      return null;
    }

    await ctx.db.insert("dnd_players", {
      campaignId: id,
      name: args.name,
      class: args.charClass,
      race: args.race,
      background: args.background,
      level: args.level,
      exp: args.xp,
      hitpoints: args.hp,
      hitpoint_max: args.maxHp,
      strength: args.strength,
      dexterity: args.dexterity,
      constitution: args.constitution,
      intelligence: args.intelligence,
      wisdom: args.wisdom,
      charisma: args.charisma,
    });
  },
});
