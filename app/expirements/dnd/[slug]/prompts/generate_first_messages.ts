import Groq from "groq-sdk";
import { GM_SYSTEM_RUNNER_MESSAGE } from "./constants";

export const generateFirstMessages = async (
  outline: string,
  first_act_context: string,
) => {
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  const response = await groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content: GM_SYSTEM_RUNNER_MESSAGE,
      },
      {
        role: "user",
        content: `
Here is the campaign outline:
"${outline}"

Here is the description of the first act of the campaign:
"${first_act_context}"

Register a couple messages that  will be the first introduction to the story for the players. 
It should get the players excited for the journey they are going on, give 
some hints at the problems they will face, but not reveal too much.

Use the register_messages tool to register the messages including the actual text
of the messages and whoever the speaker is. The speaker could either be an NPC in
the world, or if it makes more sense it could just be the Game Master who would
be considered omniscient.

Generally it would make sense for the first message to be an introduction to the
campaign by the Game Master and then starting the story by some dialog from an
NPC. As this is the first introduction to the campaign for the players, the Game Master
should include a decent amount of details about the setting and give an introduction
to the conflict in the campaign. The Game Master should also explain where the player 
characters are, what they currently see around them, and should introduce the NPC character(s)
that are about to speak to them.

Register at least 2 messages, with 1 of them being from an NPC other than the Game Master.
`,
      },
    ],
    tools: [
      {
        type: "function",
        function: {
          name: "register_messages",
          description:
            "Used to register a list of messages with each respective speaker.",
          parameters: {
            type: "array",
            messages: {
              type: "object",
              properties: {
                message: {
                  type: "string",
                  description:
                    "The actual message text that will be shown to the players.",
                },
                speaker: {
                  type: "string",
                  description:
                    "The NPC that has spoken this message or just 'Game Master' if it's not coming from an NPC.",
                },
              },
            },
          },
        },
      },
    ],
    tool_choice: "required",
    model: "qwen-2.5-32b",
    temperature: 1,
  });

  console.log("--------------");

  if (response.choices[0].message?.tool_calls![0]) {
    return (
      JSON.parse(
        response.choices[0].message.tool_calls![0].function.arguments,
      ) as {
        messages: {
          message: string;
          speaker: string;
        }[];
      }
    ).messages;
  }

  return [];
};
