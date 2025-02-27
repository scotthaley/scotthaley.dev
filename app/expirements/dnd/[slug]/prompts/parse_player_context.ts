import Groq from "groq-sdk";
import { GM_SYSTEM_CREATIVE_MESSAGE } from "./constants";

export const parsePlayerContext = async (message: string, npc?: string) => {
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
Given that the last message the players recieved was "${message}" and this 
was spoken by "${npc || "Game Master"}", what is the current context the players are in?

Examples:
- Speaking with [npc name]
- Fighting with [npc name]
- Exploring [location name]
`,
      },
    ],
    model: "llama-3.3-70b-versatile",
    temperature: 1.4,
  });

  if (response.choices[0].message.content) {
    console.log("Current context:\n------------------");
    console.log(response.choices[0].message.content);

    return response.choices[0].message.content;
  }
};
