import { useToast } from "@chakra-ui/react";
import axios from "axios";
import { Topic, TopicItem } from "../types/topic";
import { getNewData, importData } from "../utils/exportData";
import { useKeyValueData } from "./useKeyValueData";

export const useSyncData = () => {
  const [{ data: syncUrl, isLoading }] = useKeyValueData("syncUrl", "");
  const [{ data: syncSecret }] = useKeyValueData("syncSecret", "");
  const [{ data: lastUpdatedTime }, { mutate: updateLastUpdatedTime }] =
    useKeyValueData("lastSyncedTime", "");
  const toast = useToast();

  return async (lastUpdated: Date = new Date(0)) => {
    const newData = await getNewData(lastUpdated);

    try {
      const { data } = await axios.post<{
        topics: Topic[];
        topicItem: TopicItem[];
        timestamp: number;
      }>(
        syncUrl,
        { newData, lastUpdated: lastUpdated.valueOf() },
        {
          headers: {
            "x-aibou-secret": syncSecret,
          },
        }
      );
      await importData(data);
      await updateLastUpdatedTime(new Date().valueOf());
      toast({
        title: "Update Succesfully",
        status: "success",
        description: "Data has been updated",
      });
    } catch (error) {
      toast({
        title: "Sync Failed",
        status: "error",
        description: `Something went wrong ${(error as any).message}`,
      });
    }
  };
};
