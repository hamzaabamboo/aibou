import { useQuery } from "@tanstack/react-query";
import { db } from "../utils/db";

export const useGetTopic = (topicId: string) => {
  return useQuery(["fetchTopic", topicId], async () => {
    const idNumber = Number(topicId);
    try {
      const data =
        (await db?.topics.get(topicId)) ||
        (!isNaN(idNumber) && (await db?.topics.get(idNumber))) ||
        undefined;
      return data;
    } catch (error) {
      return;
    }
  });
};
