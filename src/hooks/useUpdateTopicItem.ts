import { useMutation, useQueryClient } from "@tanstack/react-query";
import { db } from "../utils/db";
import { Topic, TopicItem } from "../types/topic";

export const useUpdateTopicItem = (topicId: string) => {
  const queryClient = useQueryClient();
  return useMutation(
    async (data: Partial<TopicItem>) => {
      const id = data.id;
      if (!id) return;
      await db?.topicEntries.update(id, {
        ...data,
        lastUpdatedAt: new Date(),
      });

      const topicIdNumber = Number(topicId);
      await db?.topics.update(isNaN(topicIdNumber) ? topicId : topicIdNumber, {
        lastUpdatedAt: new Date(),
      });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["fetchTopic", topicId]);
        queryClient.invalidateQueries(["fetchTopicItems", topicId]);
      },
    }
  );
};
