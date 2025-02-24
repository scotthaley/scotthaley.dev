import Groq from "groq-sdk";
import { GM_SYSTEM_MESSAGE } from "./constants";

export const parseInitialLocations = async (context: string) => {
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
Register the locations that have been mentioned so far using the register_locations tool.

Exactly one location should be marked as the starting location for the players.

Here is the context you should consider for this:
"${context}"

-----------------

You should register each mentioned location. If a location is referenced but not named, 
give it a succinct descriptive name (e.g. "Dungeon", "Basement", "Town Square").
A location should be hidden if it's not something the player characters would likely know about.
A location that would be well known in the universe, like a large town, or a location that the player
characters have been told about would not be hidden.
The description of the location is all of the information that has been generated about this location so far
and will be used to keep future generated content from conflicting with existing content.
Known information should just be info that would likely be common knowledge in this world or information
that was directly given to the player characters via dialog. Known information will almost always be a subset
of the full description of the location.
`,
      },
    ],
    tools: [
      {
        type: "function",
        function: {
          name: "register_locations",
          description: "Used to register locations with the system",
          parameters: {
            type: "array",
            locations: {
              type: "object",
              properties: {
                name: {
                  type: "string",
                  description: "The name of the location",
                },
                starting_location: {
                  type: "boolean",
                  description: "Is this the starting location for the players?",
                },
                description: {
                  type: "string",
                  description: "The description of the location.",
                },
                known_info: {
                  type: "string",
                  description:
                    "The information the players are likely to know about this location.",
                },
                hidden: {
                  type: "boolean",
                  description: `Is this location currently known to the players? 
Should be 'false' if this would be a well known place, like a city, or if the players have been directly told about the location.`,
                },
              },
            },
          },
        },
      },
    ],
    model: "qwen-2.5-32b",
    tool_choice: "required",
  });

  if (response && response.choices[0].message) {
    return (
      JSON.parse(
        response.choices[0].message.tool_calls![0].function.arguments,
      ) as {
        locations: {
          name: string;
          description: string;
          starting_location: boolean;
          known_info: string;
          hidden: boolean;
        }[];
      }
    ).locations;
  }

  return [];
};
