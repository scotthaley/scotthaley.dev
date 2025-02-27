import { Doc } from "@/convex/_generated/dataModel";
import Groq from "groq-sdk";
import { GM_SYSTEM_CREATIVE_MESSAGE } from "./constants";

export const generateCampaignActs = async (
  outline: string,
  act_count: number,
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
Come up with ${act_count} different acts for the campaign we are running.
Each act should have an explanation of the resolution which will be used
later to determine if we are ready to move to the next act.

Here is the outline of the current campaign:
"${outline}"
`,
      },
    ],
    model: "llama-3.3-70b-versatile",
    temperature: 1.4,
  });

  return response.choices[0].message.content;
};
