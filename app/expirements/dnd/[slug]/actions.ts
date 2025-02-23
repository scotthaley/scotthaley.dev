"use server";

import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { fetchMutation } from "convex/nextjs";
import Groq from "groq-sdk";

const GM_SYSTEM_MESSAGE = `
You are a game master that is running a tabletop roleplaying game. Your
job is to generate different pieces of content as part of the roleplaying game.
Always respond with only the content being asked of so that your reponse
can be used without any transormation. Only include quotes if a character 
is actually speaking.
`;

export async function submitStory(
  description: string,
  slug: string,
  players: Doc<"dnd_players">[],
) {
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  const story = await initialStory(groq, description, players);
  if (story === null) return;

  await fetchMutation(api.dnd.updateStory, {
    dndId: slug,
    story,
  });

  const firstMessage = await generateFirstMessage(groq, story);
  if (firstMessage === null) return;

  await fetchMutation(api.dnd.insertMessage, {
    dndId: slug,
    message: firstMessage,
  });
}

const initialStory = async (
  groq: Groq,
  description: string,
  players: Doc<"dnd_players">[],
) => {
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
    temperature: 1.2,
  });

  return response.choices[0].message.content;
};

const generateFirstMessage = async (groq: Groq, story: string) => {
  const response = await groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content: GM_SYSTEM_MESSAGE,
      },
      {
        role: "user",
        content: `
Given this story:
"${story}"

Give me what will be the first introduction to the story for the players. 
It should get the players excited for the journey they are going on, give 
some hints at the problems they will face, but not reveal too much.


Do not include anything in the response other than the text of the story.
`,
      },
    ],
    model: "llama3-70b-8192",
  });

  return response.choices[0].message.content;
};
