import { useMutation, useQueryClient } from "@tanstack/react-query";
import { nanoid } from "nanoid";
import { JishoWord } from "../types/jisho";
import { db } from "../utils/db";

export const useAddTopicItem = (topicId: string) => {
  const queryClient = useQueryClient();
  return useMutation(
    async (data: { word: string; jishoData: JishoWord }) => {
      try {
        await db?.topicEntries.add({
          ...data,
          id: nanoid(8),
          topicId,
          tags: [],
          createdAt: new Date(),
          lastUpdatedAt: new Date(),
        });
      } catch (e) {}
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["fetchTopicItems", topicId]);
      },
    }
  );
};
