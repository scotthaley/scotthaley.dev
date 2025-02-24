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

export const submitMessage = async (
  slug: string,
  message: string,
  playerId: string,
) => {
  const campaign = await fetchQuery(api.dnd.getCampaign, { dndId: slug });
  const npcs = await fetchQuery(api.dnd.getCampaignNPCs, { dndId: slug });
  const locations = await fetchQuery(api.dnd.getCampaignLocations, {
    dndId: slug,
  });
  const lastMessage = await fetchQuery(api.dnd.getLastCampaignMessage, {
    dndId: slug,
  });
  const player = await fetchQuery(api.dnd.getPlayer, { playerId });

  if (
    campaign === null ||
    lastMessage === null ||
    player === null ||
    npcs === null ||
    locations === null
  )
    return;

  // TODO: better player context?
  const playerContext = `Name: ${player.name}`;

  const response = await parsePlayerMessage(
    message,
    campaign.current_context!,
    lastMessage.message,
    playerContext,
  );

  console.log(response);

  if (response === PlayerMessageType.REQUEST_GM_INFO) {
    const entities =
      (await parseMessageForEntities(message, locations, npcs)) || [];

    console.log("Entities asked about:", entities);

    const question_context = `
Campaign Outline: "${campaign.generated_story}"

Information about referenced locations:
${locations
  .filter((l) => entities.find((e) => e.id === l._id))
  .map(
    (l) => `
ID: ${l._id},
NAME: ${l.name},
DESCRIPTION: ${l.description}
INFORMATION THE PLAYER KNOWS: ${l.known_information}
IS THE LOCATION HIDDEN: ${l.hidden}
--------------------------------------------
`,
  )}

Information about referenced NPCs:
${npcs
  .filter((npc) => entities.find((e) => e.id === npc._id))
  .map(
    (npc) => `
ID: ${npc._id},
NAME: ${npc.name},
DESCRIPTION: ${npc.description}
IS THE NPC HIDDEN: ${npc.hidden}
--------------------------------------------
`,
  )}
`;

    const gm_response = await askGM(
      message,
      question_context,
      lastMessage.message,
      playerContext,
    );

    console.log("GM response:", gm_response);

    if (gm_response === null) return;

    const entities_in_response =
      (await parseMessageForEntities(gm_response, locations, npcs)) || [];

    console.log("Entities from response:", entities_in_response);
  }
};

export const submitStory = async (
  description: string,
  slug: string,
  players: Doc<"dnd_players">[],
) => {
  const story = await initialStory(description, players);
  if (story === null) return;

  console.log(story);

  await fetchMutation(api.dnd.updateStory, {
    dndId: slug,
    story,
  });

  await registerFirstMessages(slug, String(story));
};

const registerFirstMessages = async (slug: string, story: string) => {
  const messages = await generateFirstMessages(story);

  console.log(messages);

  await Promise.all(
    messages.map((m) => registerMessage(slug, m.message, m.speaker)),
  );
};

const registerMessage = async (slug: string, message: string, npc?: string) => {
  if (!npc || npc === "Game Master") {
    await fetchMutation(api.dnd.insertMessage, {
      dndId: slug,
      message: message,
    });
  } else {
    const npcId = await getNPC(slug, npc, `${npc} said: ${message}`);
    await fetchMutation(api.dnd.insertMessage, {
      dndId: slug,
      message: message,
      npcId,
    });
  }

  await updatePlayerContext(slug, message, npc);
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
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

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
