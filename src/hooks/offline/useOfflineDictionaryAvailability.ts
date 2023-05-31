import { useKeyValueData } from "../utils/useKeyValueData";
import { useDownloadOfflineDictionary } from "./useDownloadOfflineDictionary";

export const useOfflineDictionaryAvailability = () => {
    const { isDBDownloaded } = useDownloadOfflineDictionary();
    const [
      { data: offlineDictionaryEnabled },
    ] = useKeyValueData("offlineDictionaryEnabled", true);
    const isAvailable = isDBDownloaded && (offlineDictionaryEnabled ?? false);

    return isAvailable
}