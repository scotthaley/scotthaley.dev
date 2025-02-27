import { Doc } from "@/convex/_generated/dataModel";
import Groq from "groq-sdk";
import { SYSTEM_MESSAGE_GAME_DESIGNER } from "../constants";

export const generateOutlinePrompt = async (
  description: string,
  players: Doc<"dnd_players">[],
) => {
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  const response = await groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content: SYSTEM_MESSAGE_GAME_DESIGNER,
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

Do not include anything in the response other than the text of the outline.
`,
      },
    ],
    model: "llama-3.3-70b-versatile",
    temperature: 1.4,
  });

  const init_outline = response.choices[0].message.content;

  if (init_outline === null) return null;

  const refined_response = await groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content: SYSTEM_MESSAGE_GAME_DESIGNER,
      },
      {
        role: "user",
        content: `
Here is an outline for a campaign that you are helping design:
"${init_outline}"

What questions do you have in this outline? Is there any content
that is hinted at but not included? Are there any events or activities 
that are mentioned that seem like it would be difficult to actually
run because of a lack of details?

Give me an updated outline that addresses these questions.
Do not include anything in the response other than the text of the outline.
`,
      },
    ],
    model: "llama-3.3-70b-versatile",
    temperature: 1.4,
  });

  return refined_response.choices[0].message.content;
};
