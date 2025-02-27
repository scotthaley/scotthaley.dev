import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

function removeUndefinedValues<T extends object>(obj: T): T {
  const result: Partial<T> = {};

  for (const key in obj) {
    if (obj[key] !== undefined) {
      result[key] = obj[key];
    }
  }

  return result as T;
}

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

export const updateCampaign = mutation({
  args: {
    id: v.id("dnd_campaigns"),
    name: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal("CREATED"),
        v.literal("PLAYERS_ADDED"),
        v.literal("STORY_GENERATED"),
        v.literal("RUNNING"),
      ),
    ),
    generated_story: v.optional(v.string()),
    current_context: v.optional(v.string()),
    current_act: v.optional(v.number()),
    current_room: v.optional(v.id("dnd_entities")),
    speaking: v.optional(v.string()),
  },
  handler: async (
    ctx,
    {
      id,
      name,
      status,
      generated_story,
      current_context,
      current_act,
      current_room,
      speaking,
    },
  ) => {
    await ctx.db.patch(id, {
      ...removeUndefinedValues({
        name,
        status,
        generated_story,
        current_context,
        current_act,
        current_room,
      }),
      speaking,
    });
    return ctx.db.get(id);
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
      .order("desc")
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

export const getRecentCampaignLog = query({
  args: { campaignId: v.id("dnd_campaigns") },
  handler: async (ctx, { campaignId }) => {
    return await ctx.db
      .query("dnd_messages")
      .filter((q) => q.eq(q.field("campaignId"), campaignId))
      .order("asc")
      .take(20);
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

export const getCampaignEntity = query({
  args: { campaignId: v.id("dnd_campaigns"), name: v.string() },
  handler: async (ctx, { campaignId, name }) => {
    return await ctx.db
      .query("dnd_entities")
      .filter((q) => q.eq(q.field("campaignId"), campaignId))
      .filter((q) => q.eq(q.field("name"), name))
      .unique();
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

export const getCurrentAct = query({
  args: { dndId: v.string() },
  handler: async (ctx, args) => {
    const id = ctx.db.normalizeId("dnd_campaigns", args.dndId);

    if (id === null) {
      return null;
    }

    const campaign = await ctx.db.get(id);

    return await ctx.db
      .query("dnd_campaign_acts")
      .filter((q) =>
        q.and(
          q.eq(q.field("campaignId"), id),
          q.eq(q.field("number"), campaign?.current_act),
        ),
      )
      .unique();
  },
});

export const getCurrentRoom = query({
  args: { campaignId: v.id("dnd_campaigns") },
  handler: async (ctx, { campaignId }) => {
    const campaign = await ctx.db.get(campaignId);

    if (!campaign?.current_room) {
      return null;
    }

    return await ctx.db.get(campaign?.current_room);
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
      current_act: 1,
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
    speaker: v.string(),
    summary: v.string(),
    campaignId: v.id("dnd_campaigns"),
    to_gm: v.optional(v.boolean()),
  },
  handler: async (ctx, { campaignId, message, speaker, summary, to_gm }) => {
    await ctx.db.insert("dnd_messages", {
      campaignId,
      message,
      speaker,
      summary,
      to_gm,
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

export const insertActs = mutation({
  args: {
    campaignId: v.id("dnd_campaigns"),
    acts: v.array(
      v.object({
        name: v.string(),
        number: v.number(),
        description: v.string(),
        resolution: v.string(),
        encounters: v.array(
          v.object({
            encounter_description: v.string(),
            story_importance: v.string(),
          }),
        ),
      }),
    ),
  },
  handler: async (ctx, { campaignId, acts }) => {
    for (const a of acts) {
      await ctx.db.insert("dnd_campaign_acts", {
        campaignId,
        number: a.number,
        name: a.name,
        description: a.description,
        resolution: a.resolution,
        encounters: a.encounters,
      });
    }
  },
});

export const insertAct = mutation({
  args: {
    dndId: v.string(),
    name: v.string(),
    number: v.number(),
    description: v.string(),
    resolution: v.string(),
    encounters: v.array(
      v.object({
        encounter_description: v.string(),
        story_importance: v.string(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const campaignId = ctx.db.normalizeId("dnd_campaigns", args.dndId);

    if (campaignId === null) {
      return null;
    }

    return await ctx.db.insert("dnd_campaign_acts", {
      campaignId,
      number: args.number,
      name: args.name,
      description: args.description,
      resolution: args.resolution,
      encounters: args.encounters,
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

      await ctx.db.patch(entityId, {
        name: args.name,
        aliases: args.aliases,
        full_information: args.full_info,
        known_information: args.known_info,
        entity_type: args.entity_type,
        known_to_player: args.known_to_player,
      });
      return ctx.db.get(entityId);
    } else {
      const campaignId = ctx.db.normalizeId("dnd_campaigns", args.dndId);

      if (campaignId === null) {
        return null;
      }

      const id = await ctx.db.insert("dnd_entities", {
        campaignId,
        name: args.name,
        aliases: args.aliases,
        full_information: args.full_info,
        known_information: args.known_info,
        entity_type: args.entity_type,
        known_to_player: args.known_to_player,
      });
      return ctx.db.get(id);
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
