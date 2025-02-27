import Groq from "groq-sdk";

export const smallSummaryPrompt = async (text: string) => {
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  const response = await groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content: `
Your job is to create very short summaries of text that will
be used to create a log to give context for future prompts. 
Exclude all unnecessary language, making the summary as small as possible.
Important things to include would be who, why, and what? Who was involved,
what did they do, what did they do it to? Include mention of specific
people, places, or things. In the context of these messages, "you" will
generally refer to the player characters.
`,
      },
      {
        role: "user",
        content: `
Summarize the following text:
"${text}"
`,
      },
    ],
    model: "llama-3.3-70b-versatile",
    temperature: 1.4,
  });

  return response.choices[0].message.content;
};
