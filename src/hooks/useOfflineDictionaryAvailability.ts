import { useDownloadOfflineDictionary } from "./useDownloadOfflineDictionary";
import { useKeyValueData } from "./useKeyValueData";

export const useOfflineDictionaryAvailability = () => {
    const { isDBDownloaded } = useDownloadOfflineDictionary();
    const [
      { data: offlineDictionaryEnabled },
    ] = useKeyValueData("offlineDictionaryEnabled", true);
    const isAvailable = isDBDownloaded && (offlineDictionaryEnabled ?? false);

    return isAvailable
}