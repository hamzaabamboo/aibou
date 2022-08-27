import { useQuery } from "@tanstack/react-query";
import { db } from "../utils/db";

export const useGetTopic = (topicId: number) => {
  return useQuery(["fetchTopic", topicId], async () => {
    const data = await db?.topics.get(topicId);
    return data;
  });
};
