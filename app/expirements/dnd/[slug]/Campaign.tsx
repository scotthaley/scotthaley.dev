"use client";

import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { Doc } from "@/convex/_generated/dataModel";
import { FormEvent, useCallback, useState } from "react";
import { submitStory } from "./actions";

export default function Campaign({ slug }: { slug: string }) {
  const campaign = useQuery(api.dnd.getCampaign, { dndId: slug });
  const players = useQuery(api.dnd.getCampaignPlayers, { dndId: slug });

  return campaign === null ? (
    <div>
      <h1>Campaign not found</h1>
    </div>
  ) : (
    <>
      {campaign && players && (
        <CampaignScreen campaign={campaign} players={players} />
      )}
    </>
  );
}

const CampaignScreen = ({
  campaign,
  players,
}: {
  campaign: Doc<"dnd_campaigns">;
  players: Doc<"dnd_players">[];
}) => {
  const playersAdded = useMutation(api.dnd.playersAdded);

  return (
    <div>
      <div className="flex justify-center">
        {campaign && <h1>DND ({campaign.name})</h1>}
      </div>
      <div className="mt-12 flex">
        <div className="w-[300px] bg-code-bg mr-8 p-2">
          <div className="flex justify-center bg-gray-700 p-2 mb-6">
            <h4>Players</h4>
          </div>
          {players.map((p, i) => (
            <div
              className="p-2 border-gray-600 border-solid border-2 flex flex-col mb-4"
              key={i}
            >
              <div>{p.name}</div>
              <div>
                Level {p.level} {p.class}
              </div>
              <div>
                {p.background} {p.race}
              </div>
            </div>
          ))}
          {campaign.status === "CREATED" && (
            <div className="mt-6 flex justify-center">
              <button
                className="bg-theme-6 text-theme-1 p-2 rounded-md"
                onClick={() => playersAdded({ dndId: campaign._id })}
              >
                Start Campaign
              </button>
            </div>
          )}
        </div>
        <div className="flex-grow">
          <div className="flex justify-center">
            {renderCurrentScreen(campaign, players)}
          </div>
        </div>
      </div>
    </div>
  );
};

const renderCurrentScreen = (
  campaign: Doc<"dnd_campaigns">,
  players: Doc<"dnd_players">[],
) => {
  switch (campaign.status) {
    case "CREATED":
      return <CampaignScreenAddPlayers slug={campaign._id} />;
    case "PLAYERS_ADDED":
      return (
        <CampaignScreenGenerateStory slug={campaign._id} players={players} />
      );
    case "STORY_GENERATED":
      return <></>;
  }
};

const CampaignScreenAddPlayers = ({ slug }: { slug: string }) => {
  const [name, setName] = useState("John Madden");
  const [charClass, setCharClass] = useState("Warlock");
  const [race, setRace] = useState("Drow");
  const [background, setBackground] = useState("Noble");
  const [level, setLevel] = useState(1);
  const [xp, setXp] = useState(0);
  const [hp, setHp] = useState(10);
  const [maxHp, setMaxHp] = useState(10);
  const [strength, setStrength] = useState(9);
  const [dexterity, setDexterity] = useState(13);
  const [constitution, setConstitution] = useState(15);
  const [intelligence, setIntelligence] = useState(14);
  const [wisdom, setWisdom] = useState(11);
  const [charisma, setCharisma] = useState(16);

  const insertPlayer = useMutation(api.dnd.insertPlayer);

  const submit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      insertPlayer({
        dndId: slug,
        name,
        charClass,
        race,
        background,
        level,
        xp,
        hp,
        maxHp,
        strength,
        dexterity,
        constitution,
        intelligence,
        wisdom,
        charisma,
      });
    },
    [
      name,
      charClass,
      race,
      background,
      level,
      xp,
      hp,
      maxHp,
      strength,
      dexterity,
      constitution,
      intelligence,
      wisdom,
      charisma,
    ],
  );

  return (
    <div>
      <form action="#" onSubmit={submit}>
        <h2>Add a new player character</h2>
        <div className="flex flex-col">
          <label className="mt-6">
            Name
            <input
              className="bg-code-bg ml-6 rounded-md p-2"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          <label className="mt-6">
            Class
            <input
              className="bg-code-bg ml-6 rounded-md p-2"
              type="text"
              value={charClass}
              onChange={(e) => setCharClass(e.target.value)}
            />
          </label>
          <label className="mt-6">
            Race
            <input
              className="bg-code-bg ml-6 rounded-md p-2"
              type="text"
              value={race}
              onChange={(e) => setRace(e.target.value)}
            />
          </label>
          <label className="mt-6">
            Background
            <input
              className="bg-code-bg ml-6 rounded-md p-2"
              type="text"
              value={background}
              onChange={(e) => setBackground(e.target.value)}
            />
          </label>
          <label className="mt-6">
            Level
            <input
              className="bg-code-bg ml-6 rounded-md p-2"
              type="number"
              value={level}
              onChange={(e) => setLevel(parseInt(e.target.value))}
            />
          </label>
          <label className="mt-6">
            XP
            <input
              className="bg-code-bg ml-6 rounded-md p-2"
              type="number"
              value={xp}
              onChange={(e) => setXp(parseInt(e.target.value))}
            />
          </label>
          <label className="mt-6">
            HP
            <input
              className="bg-code-bg ml-6 rounded-md p-2"
              type="number"
              value={hp}
              onChange={(e) => setHp(parseInt(e.target.value))}
            />
          </label>
          <label className="mt-6">
            Max HP
            <input
              className="bg-code-bg ml-6 rounded-md p-2"
              type="number"
              value={maxHp}
              onChange={(e) => setMaxHp(parseInt(e.target.value))}
            />
          </label>
          <label className="mt-6">
            Strength
            <input
              className="bg-code-bg ml-6 rounded-md p-2"
              type="number"
              value={strength}
              onChange={(e) => setStrength(parseInt(e.target.value))}
            />
          </label>
          <label className="mt-6">
            Dexterity
            <input
              className="bg-code-bg ml-6 rounded-md p-2"
              type="number"
              value={dexterity}
              onChange={(e) => setDexterity(parseInt(e.target.value))}
            />
          </label>
          <label className="mt-6">
            Constitution
            <input
              className="bg-code-bg ml-6 rounded-md p-2"
              type="number"
              value={constitution}
              onChange={(e) => setConstitution(parseInt(e.target.value))}
            />
          </label>
          <label className="mt-6">
            Intelligence
            <input
              className="bg-code-bg ml-6 rounded-md p-2"
              type="number"
              value={intelligence}
              onChange={(e) => setIntelligence(parseInt(e.target.value))}
            />
          </label>
          <label className="mt-6">
            Wisdom
            <input
              className="bg-code-bg ml-6 rounded-md p-2"
              type="number"
              value={wisdom}
              onChange={(e) => setWisdom(parseInt(e.target.value))}
            />
          </label>
          <label className="mt-6">
            Charisma
            <input
              className="bg-code-bg ml-6 rounded-md p-2"
              type="number"
              value={charisma}
              onChange={(e) => setCharisma(parseInt(e.target.value))}
            />
          </label>
          <div className="mt-6">
            <button className="bg-theme-6 text-theme-1 p-2 rounded-md">
              Add Player
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

const CampaignScreenGenerateStory = ({
  slug,
  players,
}: {
  slug: string;
  players: Doc<"dnd_players">[];
}) => {
  const [story, setStory] = useState(
    "A classic fantasy story with some mystery elements",
  );

  const submit = useCallback(() => {
    submitStory(story, slug, players);
  }, [story]);

  return (
    <div>
      <p>What kind of story do you want to play?</p>
      <textarea
        className="w-full rounded-md my-8 bg-code-bg h-44 p-4"
        placeholder="A classic fantasy story..."
        value={story}
        onChange={(e) => setStory(e.target.value)}
      />
      <button
        className="bg-theme-6 text-theme-1 p-2 rounded-md"
        onClick={submit}
      >
        Generate Story
      </button>
    </div>
  );
};
