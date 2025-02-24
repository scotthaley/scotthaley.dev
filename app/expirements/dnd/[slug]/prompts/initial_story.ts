import { Doc } from "@/convex/_generated/dataModel";
import Groq from "groq-sdk";
import { GM_SYSTEM_MESSAGE } from "./constants";

export const initialStory = async (
  description: string,
  players: Doc<"dnd_players">[],
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
Give me an outline for a campaign that fits with this description:
"${description}"

These are the player characters for this campaign:
${players.map((p) => `${p.name} - Level ${p.level} ${p.class} - ${p.background} ${p.race}\n`)}

Include the player characters in the campaign lore in some way.

This outline will not be directly presented to the players, but will be used
to generate other details later. It should include key characters and locations, explain the
conflict, and give some brief possible resolutions of the conflict.

Do not include anything in the response other than the text of the story.
`,
      },
    ],
    model: "llama3-70b-8192",
    temperature: 1.4,
  });

  return response.choices[0].message.content;
};
