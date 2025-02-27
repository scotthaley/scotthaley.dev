import Groq from "groq-sdk";
import { SYSTEM_MESSAGE_GAME_MASTER } from "../constants";

export const genericGameMasterTextPrompt = async (
  prompt: string,
  context: { [label: string]: string },
  format?: string,
) => {
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  const system_prompt = `
${SYSTEM_MESSAGE_GAME_MASTER}

${
  format
    ? `
Respond in JSON. The JSON schema should include
${format}
`
    : ""
}
`;

  const response = await groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content: system_prompt,
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
    response_format: format ? { type: "json_object" } : undefined,
  });

  return response.choices[0].message.content;
};
