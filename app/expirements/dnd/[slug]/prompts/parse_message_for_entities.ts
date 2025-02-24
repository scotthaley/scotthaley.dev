import Groq from "groq-sdk";
import { GM_SYSTEM_MESSAGE } from "./constants";
import { Doc } from "@/convex/_generated/dataModel";

export const parseMessageForEntities = async (
  message: string,
  known_locations: Doc<"dnd_locations">[],
  known_npcs: Doc<"dnd_npcs">[],
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
seems to match an entity by its description, assume it is referring to that entity.

Here is a list of known locations:
${
  known_locations.length > 0
    ? known_locations.map(
        (l) => `
ID: ${l._id},
NAME: ${l.name},
DESCRIPTION: ${l.description}
--------------------------------------------
`,
      )
    : `There are no registered locations`
}


Here is a list of known npcs:
${
  known_npcs.length > 0
    ? known_npcs.map(
        (c) => `
ID: ${c._id},
NAME: ${c.name},
DESCRIPTION: ${c.description}
--------------------------------------------
`,
      )
    : `There are no registered NPCs`
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
                    enum: ["NPC", "LOCATION"],
                  },
                  id: {
                    type: "string",
                    description:
                      "The ID of the entity or null if this represents an unknown entity.",
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
          entity_type: string;
          id: string;
        }[];
      }
    ).entities;
  }
};
