import { useQueryClient, useMutation } from "@tanstack/react-query";
import axios from "axios";
import { SearchAPIResults } from "../types/api";
import { TopicItem } from "../types/topic";
import { db } from "../utils/db";

export const useFetchJishoResults = (topicId: string) => {
  const queryClient = useQueryClient();
  return useMutation(
    ["updateJishoResults"],
    async (words?: TopicItem[]) => {
      if (!words) return;
      const toUpdate: TopicItem[] = [];
      for (let word of words) {
        if (!word.id) return;
        const { data } = await axios.get<SearchAPIResults>(
          `/api/search?keyword=${encodeURIComponent(word.word)}`
        );
        const jishoData = data.results.find((m) => m.slug === word.word);
        toUpdate.push({
          ...word,
          jishoData,
        });
      }
      await db?.topicEntries.bulkPut(toUpdate);
    },
    {
      onSuccess: () =>
        queryClient.invalidateQueries(["fetchTopicItems", topicId]),
    }
  );
};
