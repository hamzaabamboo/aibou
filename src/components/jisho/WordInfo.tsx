import {
  Button,
  Heading,
  HStack,
  IconButton,
  Link,
  Select,
  Stack,
  Text,
  useToast
} from '@chakra-ui/react'
import { useState } from 'react'
import { useRouter } from 'next/router'

import { DownloadIcon, ExternalLinkIcon } from '@chakra-ui/icons'
import { useFetchTopicItemDataOnline } from 'hooks/search/useFetchTopicItemDataOnline'
import { useGetSearchResults } from 'hooks/search/useGetSearch'
import { sortJishoReadings } from 'utils/sortJishoReadings'

import { useGetTopicsList } from '../../hooks/topic/useGetTopicsList'
import { useAddTopicItem } from '../../hooks/topic-item/useAddTopicItem'
import { useUpdateTopicItem } from '../../hooks/topic-item/useUpdateTopicItem'
import { type JishoWord } from '../../types/jisho'
import { type TopicItem } from '../../types/topic'
import { KanjiDisplay } from './KanjiDisplay'
import { SearchResultItem } from './SearchResultItem'

interface WordInfoProps {
  item: TopicItem
  isEditable?: boolean
  isAddable?: boolean
}
export function WordInfo(props: WordInfoProps) {
  const { item, isAddable, isEditable } = props
  const [topicIDToAdd, setTopicIDToAdd] = useState<string | undefined>()
  const { mutate: updateTopicItem, isPending: isLoadingTopics } =
    useUpdateTopicItem()
  const { mutate: fetchJishoResults } = useFetchTopicItemDataOnline(
    item?.topicId
  )
  const { data: topics } = useGetTopicsList()
  const { mutate: addTopicItem, isPending: isLoading } = useAddTopicItem()

  const { data } = useGetSearchResults(item.word, { exact: true })

  const { push } = useRouter()
  const toast = useToast()

  const handleChangeReading = (index: number) => {
    updateTopicItem({
      ...item,
      word: item.jishoData?.japanese[index].word ?? item.word,
      jishoData: {
        ...(item.jishoData as JishoWord),
        japanese:
          item.jishoData != null && index !== 0
            ? [
                item.jishoData.japanese[index],
                ...(item.jishoData?.japanese.filter(
                  (_, idx) => idx !== index
                ) ?? [])
              ]
            : item.jishoData?.japanese ?? []
      }
    })
  }

  const handleChangeMeaning = (index: number) => {
    if (!data) return
    updateTopicItem({
      ...item,
      jishoData: {
        ...data[index]
      }
    })
  }

  const handleAddToTopic = async () => {
    const word =
      item.jishoData?.japanese[0].word ?? item.jishoData?.japanese[0].reading
    const topicId = topicIDToAdd ?? topics?.[0].id
    if (!topicId || isLoading || item?.jishoData == null || !word) return
    await addTopicItem(
      {
        topicId,
        word,
        jishoData: item.jishoData
      },
      {
        onSuccess: () => {
          push(`/topics/details?id=${topicId}`)
        },
        onError: (error) => {
          toast({
            status: 'warning',
            title: error.message
          })
        }
      }
    )
  }

  return (
    <Stack>
      {item.jishoData != null && (
        <SearchResultItem isCard={false} item={item.jishoData} />
      )}
      <Stack>
        <Heading size="lg">Search On</Heading>
        <Link
          href={`https://www.google.com/search?q=${encodeURIComponent(
            item.word
          )}`}
          isExternal
        >
          Google
          <ExternalLinkIcon mx="2px" />
        </Link>
        <Link
          href={`https://jisho.org/search/${encodeURIComponent(item.word)}`}
          isExternal
        >
          Jisho
          <ExternalLinkIcon mx="2px" />
        </Link>
        <Link
          href={`https://kotobank.jp/gs/?q=${encodeURIComponent(item.word)}`}
          isExternal
        >
          Kotobank
          <ExternalLinkIcon mx="2px" />
        </Link>
        <Link
          href={`https://www.kanjipedia.jp/search/?k=${encodeURIComponent(
            item.word
          )}&kt=1&wt=1&ky=1&wy=1&sk=partial&t=kotoba`}
          isExternal
        >
          Kanjipedia
          <ExternalLinkIcon mx="2px" />
        </Link>
        <Link
          href={`https://kanji.jitenon.jp/cat/search.php?getdata=${item.word
            .split('')
            .map((s) => s.charCodeAt(0).toString(16))
            .join('_')}&search=contain&how=${encodeURIComponent('すべて')}`}
          isExternal
        >
          Kanji Jiten Online
          <ExternalLinkIcon mx="2px" />
        </Link>
      </Stack>
      {isEditable && (
        <Stack>
          <Heading size="lg">Edit</Heading>
          <HStack justifyContent="space-between">
            <Text>Change Reading</Text>
            <Select
              value={0}
              onChange={(e) => {
                handleChangeReading(Number(e.target.value))
              }}
            >
              {item.jishoData?.japanese.map((o, idx) => (
                // eslint-disable-next-line jsx-a11y/control-has-associated-label
                <option key={idx} value={idx}>
                  <KanjiDisplay data={o} hideRuby />
                </option>
              ))}
            </Select>
          </HStack>
          {data && data.length > 0 && (
            <HStack justifyContent="space-between">
              <Text>Change Alternative Reading/ Sense</Text>
              <Select
                value={data.findIndex((d) => d.slug === item.jishoData?.slug)}
                onChange={(e) => {
                  handleChangeMeaning(Number(e.target.value))
                }}
              >
                {data
                  .map((word) => sortJishoReadings(word, item.word))
                  .map((o, idx) => (
                    // eslint-disable-next-line jsx-a11y/control-has-associated-label
                    <option key={idx} value={idx}>
                      <KanjiDisplay data={o.japanese[0]} hideRuby />
                    </option>
                  ))}
              </Select>
            </HStack>
          )}
          <HStack justifyContent="space-between">
            <Text>Download Data from Jisho</Text>
            <IconButton
              aria-label="download"
              icon={<DownloadIcon />}
              onClick={() => {
                fetchJishoResults([item])
              }}
            />
          </HStack>
        </Stack>
      )}
      {isAddable && (
        <Stack>
          <Heading size="md">Add to topic</Heading>
          <HStack>
            <Text>Select Topic:</Text>
            <Select
              isDisabled={isLoadingTopics}
              value={topicIDToAdd}
              onChange={(e) => {
                setTopicIDToAdd(e.target.value)
              }}
            >
              {topics?.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </Select>
            <Button
              isDisabled={isLoadingTopics}
              onClick={async () => {
                await handleAddToTopic()
              }}
            >
              Add
            </Button>
          </HStack>
        </Stack>
      )}
    </Stack>
  )
}
