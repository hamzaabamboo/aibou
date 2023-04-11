import { useQuery } from "@tanstack/react-query";
import { db } from "../utils/db";
import { Topic } from "../types/topic";

export const useLastUpdatedTopics = () => {
  return useQuery(["fetchLastUpdatedTopics"], async () => {
    const data = await (
      await db?.topics.limit(3).sortBy("lastUpdatedAt")
    )?.values();
    return Array.from(data ?? []).filter((f) => !f.isDeleted) as Topic[];
  });
};
