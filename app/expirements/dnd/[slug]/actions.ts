"use server";

import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { fetchMutation, fetchQuery } from "convex/nextjs";
import Groq from "groq-sdk";
import { initialStory } from "./prompts/initial_story";
import { generateFirstMessages } from "./prompts/generate_first_messages";
import { parseNPC } from "./prompts/parse_npc";
import { parsePlayerContext } from "./prompts/parse_player_context";
import { parseInitialLocations } from "./prompts/parse_initial_locations";
import {
  parsePlayerMessage,
  PlayerMessageType,
} from "./prompts/parse_player_message";
import { parseMessageForEntities } from "./prompts/parse_message_for_entities";
import { askGM } from "./prompts/ask_gm";
import { getEntityUpdatesFromMessage } from "./prompts/get_entity_updates_from_message";
import { generateCampaignActs } from "./prompts/generate_campaign_acts";
import { parseCampaignActs } from "./prompts/parse_campaign_act";
import { DNDEngine } from "./engine/engine";

export const submitMessage = async (
  slug: string,
  message: string,
  playerId: string,
) => {
  const engine = new DNDEngine(slug);
  await engine.submitMessage(playerId, message);

  //   const campaign = await fetchQuery(api.dnd.getCampaign, { dndId: slug });
  //   const current_act = await fetchQuery(api.dnd.getCurrentAct, { dndId: slug });
  //   const known_entities = await fetchQuery(api.dnd.getCampaignEntities, {
  //     dndId: slug,
  //   });
  //   const lastMessage = await fetchQuery(api.dnd.getLastCampaignMessage, {
  //     dndId: slug,
  //   });
  //   const player = await fetchQuery(api.dnd.getPlayer, { playerId });
  //
  //   if (
  //     campaign === null ||
  //     lastMessage === null ||
  //     player === null ||
  //     known_entities === null ||
  //     current_act === null
  //   )
  //     return;
  //
  //   // TODO: better player context?
  //   const playerContext = `Name: ${player.name}`;
  //
  //   const response = await parsePlayerMessage(
  //     message,
  //     campaign.current_context!,
  //     lastMessage.message,
  //     playerContext,
  //   );
  //
  //   // await registerMessage(slug, message, undefined, playerId);
  //
  //   if (response === PlayerMessageType.REQUEST_GM_INFO) {
  //     const entities =
  //       (await parseMessageForEntities(message, known_entities)) || [];
  //
  //     console.log("Entities asked about:", entities);
  //
  //     const question_context = `
  // Campaign Outline: "${campaign.generated_story}"
  //
  // Current act context:
  // Number: "${current_act.number}"
  // Name: "${current_act.name}"
  // Description: "${current_act.description}"
  // Resolution: "${current_act.resolution}"
  // Encounters: "${current_act.encounters}"
  //
  // Information about known entities:
  // ${
  //   known_entities.length > 0
  //     ? known_entities
  //         .filter((ke) => entities.find((e) => e.id === ke._id))
  //         .map(
  //           (l) => `
  // ID: ${l._id},
  // NAME: ${l.name},
  // FULL INFO: ${l.full_information},
  // PLAYER KNOWN INFO: ${l.known_information},
  // KNOWN TO PLAYER: ${l.known_to_player}
  // --------------------------------------------
  // `,
  //         )
  //     : `There are no known entities`
  // }
  // `;
  //
  //     const non_existent_entities = entities
  //       .filter((e) => !e.id)
  //       .map((e) => e.name);
  //
  //     const gm_response = await askGM(
  //       message,
  //       question_context,
  //       lastMessage.message,
  //       playerContext,
  //       non_existent_entities,
  //     );
  //
  //     if (gm_response === null) return;
  //     console.log(gm_response);
  //
  //     // await registerMessage(slug, gm_response);
  //   }
};

export const submitStory = async (description: string, slug: string) => {
  const engine = new DNDEngine(slug);
  await engine.generateCampaign(description);
};

export const testFirstMessages = async (slug: string) => {
  const engine = new DNDEngine(slug);
  await engine.generateFirstMessages();
};

const registerFirstMessages = async (
  slug: string,
  outline: string,
  first_act_context: string,
) => {
  const messages = await generateFirstMessages(outline, first_act_context);

  console.log(messages);

  await Promise.all(
    messages.map((m) => registerMessage(slug, m.message, m.speaker)),
  );
};

const updateEntitiesFromMessage = async (slug: string, message: string) => {
  const known_entities = await fetchQuery(api.dnd.getCampaignEntities, {
    dndId: slug,
  });

  if (known_entities === null) return;

  const entity_updates =
    (await getEntityUpdatesFromMessage(message, known_entities)) || [];

  console.log("Update entities:", entity_updates);

  for (const entity of entity_updates) {
    await fetchMutation(api.dnd.upsertEntity, {
      dndId: slug,
      id: entity.id,
      name: entity.name,
      aliases: entity.updated_aliases,
      full_info: entity.updated_full_information,
      known_info: entity.updated_known_information,
      known_to_player: entity.known_to_players,
      entity_type: entity.entity_type,
    });
  }
};

const registerMessage = async (
  slug: string,
  message: string,
  npc?: string,
  playerId?: string,
) => {
  if (!npc || npc === "Game Master") {
    await fetchMutation(api.dnd.insertMessage, {
      dndId: slug,
      message: message,
      playerId,
    });
  } else {
    const npcId = await getNPC(slug, npc, `${npc} said: ${message}`);
    await fetchMutation(api.dnd.insertMessage, {
      dndId: slug,
      message: message,
      npcId,
    });
  }

  if (!playerId) {
    await updatePlayerContext(slug, message, npc);
    await updateEntitiesFromMessage(slug, message);
  }
};

const getNPC = async (slug: string, npc: string, message?: string) => {
  let npcs = await fetchQuery(api.dnd.getCampaignNPCs, { dndId: slug });
  npcs = npcs || [];

  const response = await parseNPC(npc, npcs, message);

  if (response) {
    if (response.function.name === "new_npc") {
      const new_npc = JSON.parse(response.function.arguments) as {
        name: string;
        description: string;
      };
      return await fetchMutation(api.dnd.insertNPC, {
        dndId: slug,
        name: new_npc.name,
        description: new_npc.description,
        hidden: false,
      });
    } else if (response.function.name === "is_npc") {
      return JSON.parse(response.function.arguments);
    }
  }
};

const updatePlayerContext = async (
  slug: string,
  lastMessage: string,
  npc?: string,
) => {
  const response = await parsePlayerContext(lastMessage, npc);

  if (response) {
    await fetchMutation(api.dnd.updatePlayerContext, {
      context: response,
      dndId: slug,
    });
  }
};

export const updateLocations = async (slug: string) => {
  let context = "";

  const campaign = await fetchQuery(api.dnd.getCampaign, { dndId: slug });
  context +=
    "Campaign Outline\n-------------------\n\n" + campaign?.generated_story!;

  const messages = await fetchQuery(api.dnd.getCampaignMessages, {
    dndId: slug,
  });
  if (messages) {
    const lastMessage = messages[messages.length - 1];
    context +=
      "-------------------\n\nLast Campaign Message\n----------------\n\n" +
      lastMessage.message;
  }

  const newLocations = await parseInitialLocations(context);

  if (newLocations) {
    const existingLocations = await fetchQuery(api.dnd.getCampaignLocations, {
      dndId: slug,
    });

    console.log(newLocations);

    await Promise.all(
      newLocations.map(async (l) => {
        let el = existingLocations?.find((el) => el.name === l.name)?._id;

        if (el === undefined) {
          el = (await fetchMutation(api.dnd.insertLocation, {
            name: l.name,
            description: l.description,
            hidden: l.hidden,
            known_info: l.known_info,
            dndId: slug,
          }))!;
        } else {
          fetchMutation(api.dnd.updateLocation, {
            id: el,
            name: l.name,
            description: l.description,
            known_info: l.known_info,
            hidden: l.hidden,
          });
        }

        if (l.starting_location) {
          await fetchMutation(api.dnd.setPlayerStartingLocation, {
            locationId: el,
            dndId: slug,
          });
        }
      }),
    );

    console.log("Locations updated");
  }
};
