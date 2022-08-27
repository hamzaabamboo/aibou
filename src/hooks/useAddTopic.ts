import { useMutation, useQueryClient } from "@tanstack/react-query";
import { db } from "../utils/db";

export const useAddTopic = () => {
  const queryClient = useQueryClient();
  return useMutation(
    async (data: { name: string; description?: string }) => {
      try {
        await db?.topics.add({ ...data, createdAt: new Date() });
      } catch (e) {}
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["fetchTopicsList"]);
      },
    }
  );
};
