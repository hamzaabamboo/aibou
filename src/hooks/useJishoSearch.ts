import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { SearchAPIResults } from "../types/api";

export const useJishoSearch = (keyword: string) => {
  return useQuery(["jishoSearch", keyword], async () => {
    const { data } = await axios.get<SearchAPIResults>(
      `/api/search?keyword=${encodeURIComponent(keyword)}`
    );
    return data.results;
  });
};
