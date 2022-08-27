import axios from "axios";
import { KanjiApiKanji } from "../types/kanji-api";

const JISHO_ENDPOINT = "https://kanjiapi.dev/v1/kanji";

export const fetchKanjiApiResults = async (kanji: string) => {
  const { data } = await axios.get<KanjiApiKanji>(
    `${JISHO_ENDPOINT}${encodeURIComponent(kanji)}`
  );
  return data.data;
};
