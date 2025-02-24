import Groq from "groq-sdk";
import { GM_SYSTEM_MESSAGE } from "./constants";
import { Doc } from "@/convex/_generated/dataModel";

export const getEntityUpdatesFromMessage = async (
  message: string,
  known_entities: Doc<"dnd_entities">[],
) => {
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  const response = await groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content: GM_SYSTEM_MESSAGE,
      },
      {
        role: "user",
        content: `
Use the identify_entities tool to identify entities that are referenced in the following message: "${message}"

If an entity is referenced but is not in either list of known entities, still include it in the identify_entities 
tool call. Try to infer if the entity would be a location or an npc. The message might not reference an entity by
name, but rather by something in the description of the entity. If the message is referencing something that 
seems to match an entity by its description, assume it is referring to that entity. If an entity is not refernced
by a proper noun, it is most likely referncing another entity as an alias.

Along with the identified entities, also include a succinct summary of all the current information about this
entity, including existing information along with any new information that was generated as a part of the message.
This information is used to ensure future generated content is consistent. This information can be very succinct 
and does not need to be complete sentences as it won't be viewable by player characters, 
but only used for providing context in future prompts.

If an alias is used for an entity, include in updated_aliases in the identification.

Here is a list of known entities:
${
  known_entities.length > 0
    ? known_entities.map(
        (l) => `
ID: ${l._id},
NAME: ${l.name},
ALIASES: ${l.aliases.join(", ")}
FULL INFO: ${l.full_information},
PLAYER KNOWN INFO: ${l.known_information},
KNOWN TO PLAYER: ${l.known_to_player}
--------------------------------------------
`,
      )
    : `There are no registered locations`
}
`,
      },
    ],
    tools: [
      {
        type: "function",
        function: {
          name: "identify_entities",
          description: "Used to identify entities in a given message",
          parameters: {
            entities: {
              type: "array",
              entities: {
                type: "object",
                description: "Represents either an NPC or a location.",
                parameters: {
                  name: "string",
                  entity_type: {
                    type: "string",
                    description: "The type of entity this represents.",
                    enum: ["NPC", "LOCATION", "GROUP", "OBJECT"],
                  },
                  id: {
                    type: "string",
                    description:
                      "The ID of the entity or null if this represents an unknown entity.",
                  },
                  updated_aliases: {
                    type: "array",
                    name: "string",
                  },
                  updated_full_information: {
                    type: "string",
                    description:
                      "Succinct summary of all background information for this entity.",
                  },
                  updated_known_information: {
                    type: "string",
                    description:
                      "Succinct summary of all information the players would know about this entity.",
                  },
                  known_to_players: {
                    type: "boolean",
                    description: "Is this entity known to the players?",
                  },
                },
              },
            },
          },
        },
      },
    ],
    model: "qwen-2.5-32b",
    tool_choice: "required",
  });

  if (response && response.choices[0].message) {
    return (
      JSON.parse(
        response.choices[0].message.tool_calls![0].function.arguments,
      ) as {
        entities: {
          name: string;
          entity_type: "NPC" | "LOCATION" | "GROUP" | "OBJECT";
          id: string;
          updated_full_information: string;
          updated_known_information: string;
          known_to_players: boolean;
          updated_aliases: string[];
        }[];
      }
    ).entities;
  }
};
