import Groq from "groq-sdk";
import { SYSTEM_MESSAGE_GAME_DESIGNER } from "../constants";

export const genericDesignerTextPrompt = async (
  prompt: string,
  context: { [label: string]: string },
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
<context>
${Object.keys(context)
  .map(
    (label) => `
<${label}>
${context[label]}
</${label}>
`,
  )
  .join("\n")}
</context>
${prompt}
`,
      },
    ],
    model: "llama-3.3-70b-versatile",
    temperature: 1.4,
  });

  return response.choices[0].message.content;
};
