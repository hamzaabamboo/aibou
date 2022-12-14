import { useMutation, useQueryClient } from "@tanstack/react-query";
import { db } from "../utils/db";
import { nanoid } from "nanoid";

export const useAddTopic = () => {
  const queryClient = useQueryClient();
  return useMutation(
    async (data: { name: string; description?: string }) => {
      try {
        await db?.topics.add({
          ...data,
          id: nanoid(5),
          createdAt: new Date(),
          lastUpdatedAt: new Date(),
        });
      } catch (e) {}
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["fetchTopicsList"]);
      },
    }
  );
};
