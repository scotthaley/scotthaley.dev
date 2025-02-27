import Groq from "groq-sdk";
import { SYSTEM_MESSAGE_GAME_MASTER } from "../constants";

export const classifyMessagePrompt = async (
  message: string,
  last_messages: string[],
) => {
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  const response = await groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content: SYSTEM_MESSAGE_GAME_MASTER,
      },
      {
        role: "user",
        content: `
<last messages>
${last_messages.join("\n")}
</last messages>

<message from player>
${message}
</message from player>

Give me a JSON object that classifies the message from the player as one of the following:
- "GM_REQUEST_INFO": The classification if the message is requesting info from the GM. 
A request to the GM will either directly address the GM or be about something the player's
character would know. Ex: "Do I see anything else in the room?" is a question that would
make sense to ask the GM, but not an NPC. "What else can you share about the plan?" is
a question that would make sense to ask an NPC, so it should be classified "NPC_REQUEST_INFO".
- "NPC_REQUEST_INFO": The classification if the message is requesting info from an NPC.
If a specific NPC is not named, assume they are talking to whoever sent the last message.
- "PERFORM_ACTION": The classification if the message is trying to perform some action.
This could even be speaking if they are not asking for information.

The JSON schema should include:
{
  "classification": {
    "type": "string",
    "description": "the classification of the message",
    "enum": [
      "GM_REQUEST_INFO",
      "NPC_REQUEST_INFO",
      "PERFORM_ACTION"
    ]
  }
}
`,
      },
    ],
    model: "llama-3.3-70b-versatile",
    response_format: { type: "json_object" },
  });

  console.log(response.choices[0].message.content);

  if (response.choices[0].message.content) {
    return (
      JSON.parse(response.choices[0].message.content) as {
        classification:
          | "GM_REQUEST_INFO"
          | "NPC_REQUEST_INFO"
          | "PERFORM_ACTION";
      }
    ).classification;
  }

  return null;
};
