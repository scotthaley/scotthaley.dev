"use client";

import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { Doc } from "@/convex/_generated/dataModel";
import { FormEvent, useCallback, useState } from "react";
import { submitMessage, submitStory, updateLocations } from "./actions";

export default function Campaign({ slug }: { slug: string }) {
  const campaign = useQuery(api.dnd.getCampaign, { dndId: slug });
  const players = useQuery(api.dnd.getCampaignPlayers, { dndId: slug });
  const locations = useQuery(api.dnd.getCampaignLocations, { dndId: slug });

  return campaign === null ? (
    <div>
      <h1>Campaign not found</h1>
    </div>
  ) : (
    <>
      {campaign && players && locations && (
        <CampaignScreen
          campaign={campaign}
          players={players}
          locations={locations}
        />
      )}
    </>
  );
}

const CampaignScreen = ({
  campaign,
  players,
  locations,
}: {
  campaign: Doc<"dnd_campaigns">;
  players: Doc<"dnd_players">[];
  locations: Doc<"dnd_locations">[];
}) => {
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const playersAdded = useMutation(api.dnd.playersAdded);

  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-col items-center">
        <div className="mb-4">{campaign && <h1>DND - {campaign.name}</h1>}</div>
        <div className="flex">
          <button
            className="underline"
            onClick={() => updateLocations(campaign._id)}
          >
            Update Locations
          </button>
        </div>
      </div>
      <div className="mt-12 flex flex-grow">
        <div className="w-[300px] bg-code-bg mr-4 p-2 flex-shrink-0 rounded-md">
          <div className="flex justify-center bg-gray-700 p-2 mb-6">
            <h4>Players</h4>
          </div>
          {players.map((p, i) => (
            <div
              className={`p-2 border-solid border-2 flex flex-col mb-4 cursor-pointer ${selectedPlayer === p._id ? "border-yellow-400" : "border-gray-600"}`}
              onClick={() => setSelectedPlayer(p._id)}
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
        <div className="flex-grow h-full">
          <div className="flex justify-center h-full">
            {renderCurrentScreen(campaign, players, selectedPlayer)}
          </div>
        </div>
        <div className="w-[300px] bg-code-bg ml-4 p-2 flex-shrink-0 rounded-md">
          <div className="flex justify-center bg-gray-700 p-2 mb-6">
            <h4>Locations</h4>
          </div>
          {locations
            .filter((l) => !l.hidden)
            .map((l, i) => (
              <div
                className="p-2 border-gray-600 border-solid border-2 flex flex-col mb-4"
                key={i}
              >
                <div className="mb-2">{l.name}</div>
                <div className="text-sm mb-2">{l.known_information}</div>
                <div className="text-sm">
                  {players
                    .filter((p) => p.location === l._id)
                    .map((p, i) => (
                      <div key={i}>{p.name}</div>
                    ))}
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
      </div>
    </div>
  );
};

const renderCurrentScreen = (
  campaign: Doc<"dnd_campaigns">,
  players: Doc<"dnd_players">[],
  selectedPlayer: string | null,
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
    case "RUNNING":
      return (
        <CampaignScreenRunning
          slug={campaign._id}
          selectedPlayer={selectedPlayer}
        />
      );
  }
};

const CampaignScreenRunning = ({
  slug,
  selectedPlayer,
}: {
  slug: string;
  selectedPlayer: string | null;
}) => {
  const [message, setMessage] = useState("");
  const messages = useQuery(api.dnd.getCampaignMessages, { dndId: slug });
  const npcs = useQuery(api.dnd.getCampaignNPCs, { dndId: slug });

  const submit = useCallback(() => {
    if (selectedPlayer !== null) {
      submitMessage(slug, message, selectedPlayer);
    }
  }, [message, selectedPlayer, slug]);

  return (
    <div className="flex-grow h-full flex flex-col">
      <div className="w-full h-full bg-code-bg text-[1.2rem] leading-[1.5rem] rounded-md relative">
        <div className="absolute w-full h-full p-4 pr-8 overflow-auto">
          {messages &&
            npcs &&
            messages.map((m, i) => (
              <div key={i} className="mb-6 flex">
                <div className="mr-4 text-nowrap min-w-20 flex-shrink-0">
                  {m.npc
                    ? npcs.find((n) => n._id === m.npc)!.name
                    : "Game Master"}
                </div>
                <div>{m.message}</div>
              </div>
            ))}
        </div>
      </div>
      <div className="h-[300px] py-4 flex">
        <textarea
          className="w-full rounded-md bg-code-bg resize-none p-4 flex-grow"
          placeholder="What do you want to say or do?"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <div className="px-4 flex flex-col">
          <button
            className={`${selectedPlayer == null ? "bg-gray-400" : "bg-theme-6"} text-theme-1 p-4 rounded-md`}
            disabled={selectedPlayer === null}
            onClick={submit}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
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
