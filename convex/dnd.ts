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
      .query("dnd_entities")
      .filter((q) =>
        q.and(
          q.eq(q.field("campaignId"), id),
          q.eq(q.field("entity_type"), "LOCATION"),
        ),
      )
      .collect();
  },
});

export const getCampaignEntities = query({
  args: { dndId: v.string() },
  handler: async (ctx, args) => {
    const id = ctx.db.normalizeId("dnd_campaigns", args.dndId);

    if (id === null) {
      return null;
    }

    return await ctx.db
      .query("dnd_entities")
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
      .query("dnd_entities")
      .filter((q) =>
        q.and(
          q.eq(q.field("campaignId"), id),
          q.eq(q.field("entity_type"), "NPC"),
        ),
      )
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
    const locationId = ctx.db.normalizeId("dnd_entities", args.locationId);

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

    return await ctx.db.insert("dnd_entities", {
      campaignId: id,
      name: args.name,
      aliases: [],
      full_information: args.description,
      known_information: args.description,
      entity_type: "NPC",
      known_to_player: !args.hidden,
    });
  },
});

export const insertMessage = mutation({
  args: {
    message: v.string(),
    npcId: v.optional(v.string()),
    playerId: v.optional(v.string()),
    dndId: v.string(),
  },
  handler: async (ctx, args) => {
    const id = ctx.db.normalizeId("dnd_campaigns", args.dndId);

    if (id === null) {
      return null;
    }

    let normalizedNPCId = undefined;
    if (args.npcId) {
      normalizedNPCId =
        ctx.db.normalizeId("dnd_entities", args.npcId) || undefined;
    }

    let normalizedPlayerId = undefined;
    if (args.playerId) {
      normalizedPlayerId =
        ctx.db.normalizeId("dnd_players", args.playerId) || undefined;
    }

    await ctx.db.insert("dnd_messages", {
      campaignId: id,
      message: args.message,
      npc: normalizedNPCId,
      player: normalizedPlayerId,
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

    return await ctx.db.insert("dnd_entities", {
      campaignId: id,
      name: args.name,
      aliases: [],
      full_information: args.description,
      known_information: args.known_info,
      entity_type: "LOCATION",
      known_to_player: !args.hidden,
    });
  },
});

export const updateLocation = mutation({
  args: {
    id: v.id("dnd_entities"),
    name: v.string(),
    description: v.string(),
    known_info: v.string(),
    hidden: v.boolean(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      name: args.name,
      full_information: args.description,
      known_information: args.known_info,
      known_to_player: args.hidden,
    });
  },
});

export const upsertEntity = mutation({
  args: {
    dndId: v.string(),
    id: v.optional(v.union(v.string(), v.null())),
    name: v.string(),
    aliases: v.array(v.string()),
    full_info: v.string(),
    known_info: v.string(),
    known_to_player: v.boolean(),
    entity_type: v.union(
      v.literal("NPC"),
      v.literal("LOCATION"),
      v.literal("GROUP"),
      v.literal("OBJECT"),
    ),
  },
  handler: async (ctx, args) => {
    if (args.id) {
      const entityId = ctx.db.normalizeId("dnd_entities", args.id);

      if (entityId === null) {
        return null;
      }

      return await ctx.db.patch(entityId, {
        name: args.name,
        aliases: args.aliases,
        full_information: args.full_info,
        known_information: args.known_info,
        entity_type: args.entity_type,
        known_to_player: args.known_to_player,
      });
    } else {
      const campaignId = ctx.db.normalizeId("dnd_campaigns", args.dndId);

      if (campaignId === null) {
        return null;
      }

      return await ctx.db.insert("dnd_entities", {
        campaignId,
        name: args.name,
        aliases: args.aliases,
        full_information: args.full_info,
        known_information: args.known_info,
        entity_type: args.entity_type,
        known_to_player: args.known_to_player,
      });
    }
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
