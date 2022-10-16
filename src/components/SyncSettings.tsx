import {
  Accordion,
  AccordionItem,
  AccordionButton,
  HStack,
  AccordionIcon,
  AccordionPanel,
  Text,
  Stack,
  Input,
  Select,
  Switch,
} from "@chakra-ui/react";
import { filter, orderBy } from "lodash";
import { useKeyValueData } from "../hooks/useKeyValueData";

export const SyncSettings = () => {
  const [{ data: syncUrl, isLoading }, { mutate: setSyncUrl }] =
    useKeyValueData("syncUrl", "");
  const [{ data: syncSecret }, { mutate: setSyncSecret }] = useKeyValueData(
    "syncSecret",
    ""
  );

  return (
    <Accordion allowToggle>
      <AccordionItem>
        <AccordionButton>
          <HStack flex="1">
            <Text>Sync settings</Text>
          </HStack>
          <AccordionIcon />
        </AccordionButton>
        <AccordionPanel>
          <Stack>
            <HStack>
              <Text>Sync URL:</Text>
              <Input
                type="text"
                value={syncUrl}
                onChange={(e) => setSyncUrl(e.target.value)}
              />
            </HStack>
            <HStack>
              <Text>Secret Key:</Text>
              <Input
                type="text"
                value={syncSecret}
                onChange={(e) => setSyncSecret(e.target.value)}
              />
            </HStack>
          </Stack>
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  );
};
