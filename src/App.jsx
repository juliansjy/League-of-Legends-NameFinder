import { useState, useEffect } from "react";
import * as React from "react";
import Header from "./components/Header";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const api_key = window.localStorage.getItem("riotKey");
const url = "https://developer.riotgames.com/";

const fetchJSON = (...args) =>
  fetch(...args).then((response) => response.json());

export default function App() {
  const [info, setInfo] = useState([]);
  const [summonerName, setSummonerName] = useState("");
  const [saveKey, setSaveKey] = useState(false);
  const [apiKey, setApiKey] = useState(api_key);
  // should be either number or null
  // index of the opened accordian
  // set 0 to open first accordion, set 1 to opend second accordion
  const [expandedGameID, setExpandedGameID] = useState(null);

  const handleChange = (panelID) => (_event) => {
    if (expandedGameID === null) {
      setExpandedGameID(panelID);
    } else {
      setExpandedGameID(null);
    }
  };

  const finding = (e) => {
    e.preventDefault();
    setSummonerName(e.target[0].value);
  };

  const updateKey = (e) => {
    e.preventDefault();
    window.localStorage.setItem("riotKey", e.target[0].value);
    setApiKey(e.target[0].value);
    setSaveKey(false);
  };

  const helping = () => {
    setSaveKey(true);
  };

  useEffect(() => {
    async function fetchData() {
      if (!summonerName || !apiKey) return;
      const { puuid } = await fetchJSON(
        `https://euw1.api.riotgames.com/lol/summoner/v4/summoners/by-name/${summonerName}?api_key=${apiKey}`
      ); //summonername to puuid

      const matchIDs = await fetchJSON(
        `https://europe.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=20&api_key=${apiKey}`
      ); //puuid to matchID

      const matches = await Promise.all(
        matchIDs.slice(0, 5).map((matchID) => {
          return fetchJSON(
            `https://europe.api.riotgames.com/lol/match/v5/matches/${matchID}?api_key=${apiKey}`
          );
        })
      );

      const stats = matches.map((m) => {
        return m.info.participants.find((p) => p.puuid === puuid);
      });

      setInfo(stats);
    }
    fetchData();
  }, [summonerName, apiKey]);

  return (
    <>
      <Header />
      <a
        onClick={helping}
        href={url}
        width="500"
        height="600"
        target="_blank"
        rel="noreferrer"
      >
        refresh API
      </a>

      {saveKey && (
        <form onSubmit={updateKey}>
          <input type="text"></input>
          <button type="submit">update key</button>
        </form>
      )}

      {!saveKey && (
        <form onSubmit={finding}>
          <input type="text" />
          <button type="submit">search</button>
        </form>
      )}

      {!saveKey && (
        <div>
          {info.map((game, key) => (
            <Accordion
              key={key}
              expanded={expandedGameID === key}
              onClick={handleChange(key)}
              TransitionProps={{ unmountOnExit: true }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1bh-content"
                id="panel1bh-header"
              >
                <Typography sx={{ width: "33%", flexShrink: 0 }}>
                  Game + number
                </Typography>
                <Typography sx={{ color: "text.secondary" }}>test</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography component={"div"}>
                  <pre>
                    <code>
                      {JSON.stringify(game, null, 2)} {game.challenges.kda}
                    </code>
                  </pre>
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </div>
      )}
      <h2>
        you must have a Riot Games developer account with api key for this app to work
      </h2>
    </>
  );
}