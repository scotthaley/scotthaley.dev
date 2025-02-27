import Groq from "groq-sdk";
import { SYSTEM_MESSAGE_GAME_DESIGNER } from "../constants";

export const parseActsPrompt = async (acts: string, outline: string) => {
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
<campaign outline>
"${outline}"
</campaign outline>

<description of acts>
"${acts}"
</description of acts>

Give me a JSON object that includes data about each of the acts of the campaign
that have been described.

The resolution should give a clear explanation of when the game master should know 
that the players have done what is necessary to progress the story to the next act.
Each act should also include a list of encounters that are likely to happen
during this act. These encounters could be fights, conversations, or things they
need to discover. Also include how important it is for each of these encounters to occur.
Include at least 3 encounters that should happen and 3 encounters that could happen, 
but are not necessary.

The JSON schema should include:
{
  "acts": {
    "number": "number (the act number, starting with 1)",
    "name": "string (a nice name for the act)",
    "description": "string (any text that was given that describes what happens in this act)",
    "resolution": "string (an explanation of how to know when this act has concluded)",
    "encounters": {
      "encounter_description": "string (a description of the encounter. could be fights or converations)",
      "story_importance": "string (how important is it to the story that this encounter happens)"
    }[]
  }[]
}
`,
      },
    ],
    model: "llama-3.3-70b-versatile",
    response_format: { type: "json_object" },
  });

  console.log(response.choices[0].message.content);

  if (response.choices[0].message.content) {
    return (
      JSON.parse(response.choices[0].message.content) as {
        acts: {
          name: string;
          number: number;
          description: string;
          resolution: string;
          encounters: {
            encounter_description: string;
            story_importance: string;
          }[];
        }[];
      }
    ).acts;
  }

  return null;
};
