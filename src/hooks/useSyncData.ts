import axios from "axios";
import { getNewData } from "../utils/exportData";
import { useKeyValueData } from "./useKeyValueData";

export const useSyncData = () => {
  const [{ data: syncUrl, isLoading }] = useKeyValueData("syncUrl", "");
  const [{ data: syncSecret }] = useKeyValueData("syncSecret", "");

  return async (lastUpdated: Date = new Date(0)) => {
    const newData = await getNewData(lastUpdated);
    console.log(syncUrl, syncSecret, newData);

    await axios.post(
      syncUrl,
      { newData, lastUpdated: lastUpdated.valueOf() },
      {
        headers: {
          "x-aibou-secret": syncSecret,
        },
      }
    );
  };
};
