import Groq from "groq-sdk";
import { GM_SYSTEM_RUNNER_MESSAGE } from "./constants";

export const askGM = async (
  message: string,
  context: string,
  lastMessage: string,
  playerContext: string,
  nonExistentEntities: string[],
) => {
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  const response = await groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content: GM_SYSTEM_RUNNER_MESSAGE,
      },
      {
        role: "user",
        content: `
A player has asked you, as the game master (GM), for additional information. 

Here is the message the player sent: "${message}".
Here is the last message the player received before sending this message: "${lastMessage}".
Here is the current campaign context: "${context}".
Here is context about the player that submitted this message: "${playerContext}".

You can come up with new information to answer their question as long as it
is consistent with the rest of the context and doesn't completely disrupt the
campaign story. Information given here would only be information that the player
characters would reasonably be able to sense in the game world. 

No actions or dialog should happen in the world as a result of a question asked 
to the GM. The only information given in response should be information that the
player characters would already know. 

Answer the players question in character as the game master. You do not need to 
say who you are, or give any extra exposition, just answer the question asked. 
Give a small amount of information, generally only answering exactly what was asked.
The game is more fun of players have to think for themselves and ask questions
rather than being given all of the info. Answers should be 1 or 2 sentences. 
Answer as if you were just directly asked a question. It is okay to say you do
not have an answer.

${
  nonExistentEntities.length > 0
    ? `
In the message the player sent, the following entities were referenced which
could not be found in the existing campaign lore: ${nonExistentEntities.join(", ")}

In your response, you should call out that this entity does not exist and do not
identify these entities.
`
    : ""
}
`,
      },
    ],
    model: "llama-3.3-70b-versatile",
    temperature: 1.4,
  });

  return response.choices[0].message.content;
};
