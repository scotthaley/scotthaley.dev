import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { fetchMutation, fetchQuery } from "convex/nextjs";
import { generateOutlinePrompt } from "./prompts/generate_outline";
import { generateCampaignActsPrompt } from "./prompts/generate_acts";
import { parseActsPrompt } from "./prompts/parse_acts";
import { genericDesignerTextPrompt } from "./prompts/generic_designer_prompt";
import { genericGameMasterTextPrompt } from "./prompts/generic_gm_prompt";
import { smallSummaryPrompt } from "./prompts/small_summary_prompt";
import { classifyMessagePrompt } from "./prompts/classify_message_prompt";

export class DNDEngine {
  campaignId: string;
  _campaign: Doc<"dnd_campaigns"> | null = null;
  _players: Doc<"dnd_players">[] | null = null;

  constructor(slug: string) {
    this.campaignId = slug;
  }

  log(message?: any, ...other: any[]) {
    console.log(message, ...other);
  }

  public async generateCampaign(prompt: string) {
    try {
      await this.generateOutline(prompt);
      await this.generateActs(3);
      await this.setupStartingLocation();
      await this.setCampaignStatus("RUNNING");
      await this.generateFirstMessages();
    } catch (exception) {
      throw exception;
    }
  }

  public async submitMessage(playerId: string, message: string) {
    const player = await this.getPlayer(playerId);

    if (!player) {
      throw Error("Failed to fetch player");
    }

    const message_classification = await classifyMessagePrompt(message, []);

    this.log("Message classification:", message_classification);

    switch (message_classification) {
      case "GM_REQUEST_INFO":
        await this.registerMessage(message, player.name, true);
        await fetchMutation(api.dnd.updateCampaign, {
          id: (await this.getCampaign())._id,
          speaking: "Game Master",
        });

        const gm_response =
          await this.askGameMasterWithLocationCampaignContext<{
            is_reasonable: boolean;
            justification: string;
            entities: string[];
          }>(
            `
The player asked the following question to the GM: ${message}.
Is this a reasonable question based on the current context of the campaign?
Or is this question about something which the PCs would have no knowledge or 
doesn't exist?
`,
            `
{
  "is_reasonable": boolean (is the question reasonable),
  "justification": "string (if not reasonable, what is the reason it is not a reasonable question?)",
  "entities": [
    "string (name of the specific entities that are being asked about)"
  ],
}
`,
          );

        this.log("GM answer:", gm_response);

        if (gm_response.is_reasonable) {
          let entity_context = "";
          for (const e of gm_response.entities) {
            const e_context = await this.checkEntityContent(
              e,
              "UNKNOWN",
              message,
            );
            if (e_context) entity_context += `<${e}>${e_context}</${e}>\n`;
          }

          console.log("---------------");
          console.log(entity_context);

          const full_response =
            await this.askGameMasterWithLocationCampaignContext(
              `${entity_context}\n${message}`,
            );

          await this.registerMessage(full_response, "Game Master");
        } else {
          this.log("Question deemed unreasonable");
        }

        await fetchMutation(api.dnd.updateCampaign, {
          id: (await this.getCampaign())._id,
          speaking: undefined,
        });
      default:
        return;
    }
  }

  private async getCampaign() {
    if (!this._campaign)
      this._campaign = await fetchQuery(api.dnd.getCampaign, {
        dndId: this.campaignId,
      });
    return this._campaign!;
  }

  private async getPlayers() {
    if (!this._players)
      this._players = await fetchQuery(api.dnd.getCampaignPlayers, {
        dndId: this.campaignId,
      });
    return this._players!;
  }

  private async getPlayer(playerId: string) {
    const players = await this.getPlayers();
    return players.find((p) => p._id === playerId);
  }

  private async getCurrentAct() {
    const current_act = await fetchQuery(api.dnd.getCurrentAct, {
      dndId: this.campaignId,
    });

    if (!current_act) {
      throw Error("Failed to fetch current act");
    }
    return current_act;
  }

  private async getCurrentRoom() {
    const current_room = await fetchQuery(api.dnd.getCurrentRoom, {
      campaignId: (await this.getCampaign())._id,
    });

    if (!current_room) {
      throw Error("Failed to fetch current room");
    }
    return current_room;
  }

  private async setupStartingLocation() {
    const startingLocation = await this.askDesignerWithBasicCampaignContext(
      `
What is the name of the location (specific area) where the players should start the campaign?
The starting area will usually be relatively safe so that players aren't immediately thrown
into danger.
`,
    );

    this.log("Starting location:", startingLocation);

    const location = await this.generateEntityContent(
      startingLocation,
      "LOCATION",
      "This is the starting location for the players.",
    );

    if (!location) {
      throw Error("Failed to setup starting location");
    }

    this._campaign = await fetchMutation(api.dnd.updateCampaign, {
      id: (await this.getCampaign())._id,
      current_room: location._id,
    });
  }

  public async generateFirstMessages() {
    const startingInfo = await this.askDesignerWithLocationCampaignContext(
      `
Give directions for the GM to introduce the story with a combination of GM and NPC dialog as if you 
are speaking directly to the GM. Do not give specific examples of dialog, leave that up to the GM.
Give specific direction on having at least one message come from the GM.
What is the bare minimum information needs to be conveyed to the players for their introduction to the campaign?
What information makes sense to come from the GM and what information makes sense to come from an NPC,
and specifically which NPC?
`,
    );

    this.log("Starting info:", startingInfo);

    await this.createMessagesFromPrompt(startingInfo);
  }

  private async createMessagesFromPrompt(prompt: string) {
    const messages_text = await this.askGameMasterWithLocationCampaignContext<{
      messages: { speaker: string; message: string }[];
    }>(
      prompt,
      `
{
  "messages": {
    "speaker": "string (the NPC that is speaking, or Game Master)",
    "message": "string (the actual spoken dialog)"
  }[]
}
`,
    );

    const messages = messages_text.messages;

    for (const m of messages) {
      await this.registerMessage(m.message, m.speaker);
    }
  }

  private async registerMessage(
    message: string,
    speaker: string,
    to_gm?: boolean,
  ) {
    const campaign = await this.getCampaign();

    const summary = await smallSummaryPrompt(`${speaker} says: "${message}"`);

    await fetchMutation(api.dnd.insertMessage, {
      campaignId: campaign._id,
      message,
      speaker,
      to_gm,
      summary: summary || "",
    });
  }

  private async generateOutline(prompt: string) {
    this.log("Generating outline");

    const outline = await generateOutlinePrompt(
      prompt,
      await this.getPlayers(),
    );

    if (!outline) {
      throw Error("Failed to generate outline");
    }

    this._campaign = await fetchMutation(api.dnd.updateCampaign, {
      id: (await this.getCampaign())._id,
      generated_story: outline,
      current_act: 1,
    });

    this.log("Outline generated");
  }

  private async setCampaignStatus(
    status: "CREATED" | "PLAYERS_ADDED" | "STORY_GENERATED" | "RUNNING",
  ) {
    this._campaign = await fetchMutation(api.dnd.updateCampaign, {
      id: (await this.getCampaign())._id,
      status,
    });
  }

  private async generateActs(count: number) {
    this.log("Generating acts text");

    const campaign = await this.getCampaign();

    const acts_text = await generateCampaignActsPrompt(
      campaign.generated_story!,
      count,
    );

    if (acts_text) {
      this.log("Acts text generated");
      this.log("Parsing campaign acts");

      const acts = await parseActsPrompt(acts_text, campaign.generated_story!);

      if (!acts) {
        throw Error("Failed to generate acts text");
      }

      await fetchMutation(api.dnd.insertActs, {
        campaignId: campaign._id,
        acts,
      });

      this.log("Acts parsed and stored");
    }
  }

  private async askDesignerWithBasicCampaignContext(
    prompt: string,
    directive: string = "Only answer the question, do not include anything else in your response.",
  ) {
    const currentAct = await this.getCurrentAct();
    const campaign = await this.getCampaign();

    const answer = await genericDesignerTextPrompt(
      `${prompt}\n\n${directive}`,
      {
        "campaign outline": campaign.generated_story!,
        "current act description": currentAct.description,
        "current act resolution": currentAct.resolution,
        "current act encounters": JSON.stringify(currentAct.encounters),
      },
    );

    if (!answer) {
      throw Error("Failed to generate startingLocation");
    }

    return answer;
  }

  private async askDesignerWithLocationCampaignContext(
    prompt: string,
    directive: string = "Only answer the question, do not include anything else in your response.",
  ) {
    const currentAct = await this.getCurrentAct();
    const campaign = await this.getCampaign();
    const currentRoom = await this.getCurrentRoom();

    const answer = await genericDesignerTextPrompt(
      `${prompt}\n\n${directive}`,
      {
        "campaign outline": campaign.generated_story!,
        "current act description": currentAct.description,
        "current act resolution": currentAct.resolution,
        "current act encounters": JSON.stringify(currentAct.encounters),
        "current room": currentRoom.full_information,
      },
    );

    if (!answer) {
      throw Error("Failed to generate startingLocation");
    }

    return answer;
  }

  private async askGameMasterWithLocationCampaignContext<T = string>(
    prompt: string,
    format?: string,
    directive: string = "Only answer the question, do not include anything else in your response.",
  ) {
    const currentAct = await this.getCurrentAct();
    const campaign = await this.getCampaign();
    const currentRoom = await this.getCurrentRoom();
    const recentLog = (
      await fetchQuery(api.dnd.getRecentCampaignLog, {
        campaignId: campaign._id,
      })
    )
      .map((m, i) => `${i}. ${m.summary}`)
      .join("\n");

    const answer = await genericGameMasterTextPrompt(
      `${prompt}\n\n${directive}`,
      {
        "campaign outline": campaign.generated_story!,
        "current act description": currentAct.description,
        "current act resolution": currentAct.resolution,
        "current act encounters": JSON.stringify(currentAct.encounters),
        "current location": currentRoom.full_information,
        "recent campaign log": recentLog,
      },
      format,
    );

    if (!answer) {
      throw Error("Failed to generate startingLocation");
    }

    if (format) return JSON.parse(answer) as T;
    else return answer as T;
  }

  private async checkEntityContent(
    entity: string,
    entityType: "NPC" | "LOCATION" | "GROUP" | "OBJECT" | "UNKNOWN",
    question: string,
  ) {
    const campaign = await this.getCampaign();
    const allEntities = (await fetchQuery(api.dnd.getCampaignEntities, {
      dndId: this.campaignId,
    }))!
      .map((e) => `"${e.name}"`)
      .join(",");

    this.log(`Checking content for entity: ${entity} - "${question}"`);

    let match = JSON.parse(
      (await genericGameMasterTextPrompt(
        `
The player is asking about this "${entity}".
If it seems like this entity is probably referring to an existing entity,
because the name is similar, give me the exact name of the entity in the
master entity list.
`,
        {
          "master entity list": allEntities,
        },
        `
{
  matched_entity: "string (the exact name of the matched entity in the master entity list)",
  found_match: boolean (was a match found?)
}
`,
      ))!,
    ) as { matched_entity: string; found_match: boolean };

    let entityToCheck = match.found_match ? match.matched_entity : entity;

    let storedEntity = await fetchQuery(api.dnd.getCampaignEntity, {
      campaignId: campaign._id,
      name: entityToCheck,
    });

    if (!storedEntity) {
      storedEntity = await this.generateEntityContent(
        entityToCheck,
        entityType,
        `Make sure content exists to be able to answer this question: "${question}"`,
      );

      this.log(`Content generated for entity: ${entityToCheck}`);
    } else {
      this.log(`Content already exists for entity: ${entityToCheck}`);
    }

    if (!storedEntity) {
      this.log(`Failed to store entity content for: ${entityToCheck}`);
      return null;
    }

    return this.askGameMasterWithLocationCampaignContext(question);
  }

  private async generateEntityContent(
    entity: string,
    entityType: "NPC" | "LOCATION" | "GROUP" | "OBJECT" | "UNKNOWN",
    extraInfo?: string,
  ) {
    this.log(`Generating content for entity: ${entity}`);

    const entityDesc = entityType ? `${entityType} : ${entity}` : entity;
    let extraInstructions = "";
    switch (entityType) {
      case "LOCATION":
        extraInstructions = `
This is a single location that should not have multiple sections or rooms.
* What does the room look like?
* What NPCs are in the room?

${extraInfo || ""}
`;
        break;
      default:
        extraInstructions = "";
    }

    const entityInfo = await this.askDesignerWithBasicCampaignContext(
      `
Give me background content for ${entityDesc}.
${extraInstructions}
`,
      "Come up with new content that is consistent with the existing campaign context.",
    );

    if (!entityInfo) {
      throw Error("Failed to generate entity content");
    }

    this.log(`Entity content for (${entity}):`, entityInfo);

    const knownInfo = await this.askDesignerWithBasicCampaignContext(`
<entity info>${entityInfo}</entity info>
Based on the given entity info and the existing campaign context, what would make sense
for the player characters to know about this entity? Generally this would be things
the players could directly sense (they can see, feel, or hear) or things that would
be common knowledge in this world.
`);

    if (!knownInfo) {
      throw Error("Failed to generate entity player known info");
    }

    this.log(`Known info for (${entity}):`, knownInfo);

    const detectedType =
      entityType === "UNKNOWN"
        ? (
            await this.askGameMasterWithLocationCampaignContext<{
              entity_type: "LOCATION" | "NPC" | "GROUP" | "OBJECT" | "OTHER";
            }>(
              `
<entity info>${knownInfo}</entity info>
Based on the entity info, what type of entity is ${entity}?

- LOCATION: Any physical location or area where characters could be present
- NPC: Any character (friend or enemy) in the campaign that has dialog, motivations, and background.
Even non human characters such as AI or computer programs, animals, or ghosts will be considered NPCs.
- GROUP: Any sort of organization or union of characters
- OBJECT: Any inanimate object that has lore and can be held
- OTHER: Any other type of entity, such as concepts or generic terms
`,
              `
{
  entity_type: {
    "type": "string",
    "description": "The detected entity type based on the name and known info",
    "enum": [
      "LOCATION",
      "NPC",
      "GROUP",
      "OBJECT",
      "OTHER"
    ]
  }
}
`,
            )
          ).entity_type
        : entityType;

    if (detectedType === "OTHER") return null;

    return fetchMutation(api.dnd.upsertEntity, {
      name: entity,
      dndId: this.campaignId,
      entity_type: detectedType,
      full_info: entityInfo,
      known_info: knownInfo,
      known_to_player: true,
      aliases: [],
    });
  }
}
