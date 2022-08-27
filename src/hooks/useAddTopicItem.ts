import { useMutation, useQueryClient } from "@tanstack/react-query";
import { JishoWord } from "../types/jisho";
import { db } from "../utils/db";

export const useAddTopicItem = (topicId: number) => {
  const queryClient = useQueryClient();
  return useMutation(
    async (data: { word: string; jishoData: JishoWord }) => {
      try {
        await db?.topicEntries.add({
          ...data,
          topicId,
          tags: [],
          createdAt: new Date(),
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
