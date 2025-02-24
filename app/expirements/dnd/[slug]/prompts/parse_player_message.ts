import Groq from "groq-sdk";
import { GM_SYSTEM_MESSAGE } from "./constants";

export enum PlayerMessageType {
  "REQUEST_NPC_INFO" = "REQUEST_NPC_INFO",
  "REQUEST_GM_INFO" = "REQUEST_GM_INFO",
  "PERFORM_ACTION" = "PERFORM_ACTION",
}

export const parsePlayerMessage = async (
  message: string,
  context: string,
  lastMessage: string,
  playerContext: string,
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
Classify this message sent from the player.

Here is the message the player sent: "${message}".
Here is the last message the player received before sending this message: "${lastMessage}".
Here is the current campaign context: "${context}".
Here is context about the player that submitted this message: "${playerContext}".

The categories available to classify the message are:
- REQUEST_NPC_INFO: Player is asking an NPC for information
- REQUEST_GM_INFO: Player is asking the omniscient Game Master for information
- PERFORM_ACTION: Player is attempting to perform some action
`,
      },
    ],
    tools: [
      {
        type: "function",
        function: {
          name: "classify_message",
          description:
            "Used to classify the message into one of the categories.",
          parameters: {
            message_classification: {
              type: "string",
              description: "The classification of the message",
              enum: ["REQUEST_NPC_INFO", "PERFORM_ACTION", "REQUEST_GM_INFO"],
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
      ) as { message_classification: PlayerMessageType }
    ).message_classification;
  }
};
