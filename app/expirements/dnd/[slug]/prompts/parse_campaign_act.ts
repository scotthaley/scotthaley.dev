import Groq from "groq-sdk";
import { GM_SYSTEM_CREATIVE_MESSAGE } from "./constants";
import util from "util";

export const parseCampaignActs = async (acts: string, outline: string) => {
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
Here is the outline for the campaign you are working on:
"${outline}"

Here is a description of each act that has been created based on the outline:
"${acts}"

Use the register_act tool to register the individual acts that have been described. 
The resolution should give a clear explanation of when the game master should know 
that the players have done what is necessary to progress the story to the next act.
Each act should also include a list of encounters that are likely to happen
during this act. These encounters could be fights, conversations, or things they
need to discover. Also include how important it is for each of these encounters to occur.
Include at least 3 encounters that should happen and 3 encounters that could happen, 
but are not necessary.
`,
      },
    ],
    tools: [
      {
        type: "function",
        function: {
          name: "register_act",
          description:
            "Used to register individual acts from a description of the acts.",
          parameters: {
            type: "array",
            acts: {
              type: "object",
              description: "Represents an act from the campaign",
              parameters: {
                number: "number",
                name: "string",
                act_description: {
                  type: "string",
                  description:
                    "Any other text that was given that describes what happens in this act.",
                },
                resolution: {
                  type: "string",
                  description:
                    "An explanation of how to know when this act has concluded and we should move to the next act.",
                },
                encounters: {
                  type: "array",
                  encounter: {
                    type: "object",
                    description:
                      "Represents an encounter that could be part of this act",
                    parameters: {
                      encounter_description: {
                        type: "string",
                        description:
                          "A description of the encounter. Could be fights or conversations.",
                      },
                      story_importance: {
                        type: "string",
                        description:
                          "How important is it to the story that this encounter happens?",
                      },
                    },
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
        acts: {
          name: string;
          number: number;
          act_description: string;
          resolution: string;
          encounters: {
            encounter_description: string;
            story_importance: string;
          }[];
        }[];
      }
    ).acts;
  }

  return null;
};
