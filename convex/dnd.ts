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

export const getCampaignMessages = query({
  args: { dndId: v.string() },
  handler: async (ctx, args) => {
    const id = ctx.db.normalizeId("dnd_campaigns", args.dndId);

    if (id === null) {
      return null;
    }

    return await ctx.db
      .query("dnd_messages")
      .filter((q) => q.eq(q.field("campaignId"), id))
      .collect();
  },
});

export const getLastCampaignMessage = query({
  args: { dndId: v.string() },
  handler: async (ctx, args) => {
    const id = ctx.db.normalizeId("dnd_campaigns", args.dndId);

    if (id === null) {
      return null;
    }

    return await ctx.db
      .query("dnd_messages")
      .filter((q) => q.eq(q.field("campaignId"), id))
      .order("desc")
      .first();
  },
});

export const getCampaignLocations = query({
  args: { dndId: v.string() },
  handler: async (ctx, args) => {
    const id = ctx.db.normalizeId("dnd_campaigns", args.dndId);

    if (id === null) {
      return null;
    }

    return await ctx.db
      .query("dnd_locations")
      .filter((q) => q.eq(q.field("campaignId"), id))
      .collect();
  },
});

export const getCampaignNPCs = query({
  args: { dndId: v.string() },
  handler: async (ctx, args) => {
    const id = ctx.db.normalizeId("dnd_campaigns", args.dndId);

    if (id === null) {
      return null;
    }

    return await ctx.db
      .query("dnd_npcs")
      .filter((q) => q.eq(q.field("campaignId"), id))
      .collect();
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

export const getPlayer = query({
  args: { playerId: v.string() },

  handler: async (ctx, args) => {
    const id = ctx.db.normalizeId("dnd_players", args.playerId);

    if (id === null) {
      return null;
    }

    return await ctx.db.get(id);
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
      status: "RUNNING",
    });
  },
});

export const updatePlayerContext = mutation({
  args: { context: v.string(), dndId: v.string() },
  handler: async (ctx, args) => {
    const id = ctx.db.normalizeId("dnd_campaigns", args.dndId);

    if (id === null) {
      return null;
    }

    await ctx.db.patch(id, {
      current_context: args.context,
    });
  },
});

export const setPlayerStartingLocation = mutation({
  args: {
    dndId: v.string(),
    locationId: v.string(),
  },
  handler: async (ctx, args) => {
    const id = ctx.db.normalizeId("dnd_campaigns", args.dndId);
    const locationId = ctx.db.normalizeId("dnd_locations", args.locationId);

    if (id === null || locationId === null) {
      return null;
    }

    const players = await ctx.db
      .query("dnd_players")
      .filter((q) => q.eq(q.field("campaignId"), id))
      .collect();

    for (const p of players) {
      await ctx.db.patch(p._id, { location: locationId });
    }
  },
});

export const insertNPC = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    hidden: v.boolean(),
    dndId: v.string(),
  },
  handler: async (ctx, args) => {
    const id = ctx.db.normalizeId("dnd_campaigns", args.dndId);

    if (id === null) {
      return null;
    }

    return await ctx.db.insert("dnd_npcs", {
      campaignId: id,
      name: args.name,
      description: args.description,
      hidden: args.hidden,
    });
  },
});

export const insertMessage = mutation({
  args: {
    message: v.string(),
    npcId: v.optional(v.string()),
    dndId: v.string(),
  },
  handler: async (ctx, args) => {
    const id = ctx.db.normalizeId("dnd_campaigns", args.dndId);

    if (id === null) {
      return null;
    }

    let normalizedNPCId = undefined;
    if (args.npcId) {
      normalizedNPCId = ctx.db.normalizeId("dnd_npcs", args.npcId) || undefined;
    }

    await ctx.db.insert("dnd_messages", {
      campaignId: id,
      message: args.message,
      npc: normalizedNPCId,
    });
  },
});

export const insertLocation = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    known_info: v.string(),
    hidden: v.boolean(),
    dndId: v.string(),
  },
  handler: async (ctx, args) => {
    const id = ctx.db.normalizeId("dnd_campaigns", args.dndId);

    if (id === null) {
      return null;
    }

    return await ctx.db.insert("dnd_locations", {
      campaignId: id,
      name: args.name,
      description: args.description,
      known_information: args.known_info,
      hidden: args.hidden,
    });
  },
});

export const updateLocation = mutation({
  args: {
    id: v.id("dnd_locations"),
    name: v.string(),
    description: v.string(),
    known_info: v.string(),
    hidden: v.boolean(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      name: args.name,
      description: args.description,
      known_information: args.known_info,
      hidden: args.hidden,
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
