import axios from "axios";
import { JishoWord } from "../types/jisho";

const JISHO_ENDPOINT = "https://jisho.org/api/v1/search/words?keyword=";

export const fetchJishoResults = async (keyword: string) => {
  const { data } = await axios.get<{
    meta: { status: number };
    data: JishoWord[];
  }>(`${JISHO_ENDPOINT}${encodeURIComponent(keyword)}`);
  return data.data;
};
