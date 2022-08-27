import { useQuery } from "@tanstack/react-query";
import { db } from "../utils/db";

export const useGetTopicItems = (topicId: number) => {
  return useQuery(["fetchTopicItems", topicId], async () => {
    const data = await db?.topicEntries.where({ topicId }).toArray();
    return data;
  });
};
