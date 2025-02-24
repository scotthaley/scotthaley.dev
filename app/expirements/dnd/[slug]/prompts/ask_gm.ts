import Groq from "groq-sdk";
import { GM_SYSTEM_MESSAGE } from "./constants";

export const askGM = async (
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
A player has asked you, as the GM, for additional information. 

Here is the message the player sent: "${message}".
Here is the last message the player received before sending this message: "${lastMessage}".
Here is the current campaign context: "${context}".
Here is context about the player that submitted this message: "${playerContext}".

You can come up with new information to answer their question as long as it
is consistent with the rest of the context and doesn't completely disrupt the
campaign story. Information given here would only be information that the player
characters would reasonably be able to sense in the game world. 

For example, if a player asks if an NPC grew up in some town, the player would not
be able to sense this without asking the NPC, therefor the GM would not be able
to give this information. However, the GM might suggest the player ask the NPC in 
this example. However, your response should never include dialog from NPCs, but 
should instead suggest that the player ask the NPC themselves. This way the player
has control over whether or not they actually ask the NPC.
`,
      },
    ],
    model: "llama3-70b-8192",
    temperature: 1.4,
  });

  return response.choices[0].message.content;
};
