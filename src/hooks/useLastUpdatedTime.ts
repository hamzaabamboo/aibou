import { useQuery } from "@tanstack/react-query";
import { max } from "lodash";
import { db } from "../utils/db";

export const useLastUpdatedTime = () => {
  return useQuery(["lastUpdatedData"], async () => {
    return max([
      (
        await db?.topics.orderBy("lastUpdatedAt").last()
      )?.lastUpdatedAt.valueOf(),
      (
        await db?.topicEntries.orderBy("lastUpdatedAt").last()
      )?.lastUpdatedAt.valueOf(),
    ]);
  });
};
