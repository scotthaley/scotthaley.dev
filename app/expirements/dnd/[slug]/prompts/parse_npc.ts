import Groq from "groq-sdk";
import { GM_SYSTEM_CREATIVE_MESSAGE } from "./constants";
import { Doc } from "@/convex/_generated/dataModel";

export const parseNPC = async (
  npc: string,
  npcs: Doc<"dnd_entities">[],
  message?: string,
) => {
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  const response = await groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content: GM_SYSTEM_CREATIVE_MESSAGE,
      },
      {
        role: "user",
        content: `
The NPC "${npc}" was mentioned. This is either an existing NPC or it could be a new
one that isn't currently registered.

Use the is_npc tool with the NPC ID given if it is an existing NPC or use the
new_npc tool if this is a new NPC that isn't already registered.

${
  message
    ? `
This is the message the NPC was mentioned in: "${message}". If this is a new NPC,
include any relevant information that is in this message in the description of the new npc
in the new_npc tool call.
`
    : `If this is a new NPC, leave the description blank in the new_npc tool call as there isn't
currently any other information about this character.`
}

The registered NPCs are:
${
  npcs.length > 0
    ? npcs.map(
        (c) => `
ID: ${c._id},
NAME: ${c.name},
FULL INFO: ${c.full_information},
PLAYER KNOWN INFO: ${c.known_information},
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
          name: "is_npc",
          description:
            "Used to indicate the mentioned NPC is already registered and has the given ID.",
          parameters: {
            type: "string",
            description: "The ID of the mentioned NPC.",
          },
        },
      },
      {
        type: "function",
        function: {
          name: "new_npc",
          description:
            "Used to register a new NPC that hasn't previously been registered",
          parameters: {
            type: "object",
            properties: {
              name: {
                type: "string",
                description: "The name of the NPC",
              },
              description: {
                type: "string",
                description: "Information about the NPC",
              },
            },
          },
        },
      },
    ],
    model: "qwen-2.5-32b",
    tool_choice: "required",
  });

  if (response && response.choices[0].message.tool_calls) {
    return response.choices[0].message.tool_calls[0];
  }

  return null;
};
