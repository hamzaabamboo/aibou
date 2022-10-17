import { useQuery } from "@tanstack/react-query";
import { db } from "../utils/db";

export const useGetTopicsList = () => {
  return useQuery(["fetchTopicsList"], async () => {
    const data = await db?.topics.toArray();
    return (data ?? []).filter((f) => !f.isDeleted);
  });
};
