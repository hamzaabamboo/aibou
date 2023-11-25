import { useQuery } from '@tanstack/react-query'

import axios from 'axios'
import { useKeyValueData } from 'hooks/utils/useKeyValueData'
import { SearchApiResults } from 'types/api'
import { parseJishoResults } from 'types/jisho'

export const useJishoSearch = (
  keyword: string,
  results: { exact?: boolean } = {},
  enabled = false
) => {
  const { exact } = results
  const [{ data: dictionaryApiUrl }] = useKeyValueData('dictionaryApiUrl', '')
  const [{ data: dictionaryApiSecret }] = useKeyValueData(
    'dictionaryApiSecret',
    ''
  )
  const query = useQuery({
    queryKey: ['jishoSearch', keyword],
    queryFn: async ({ signal }) => {
      if (!keyword) return []
      const { data } = await axios.get<SearchApiResults>(
        `${dictionaryApiUrl}`,
        {
          params: {
            q: keyword,
            exact
          },
          headers: {
            'x-jisho-secret': dictionaryApiSecret
          },
          signal
        }
      )

      const res = parseJishoResults([...data])
      return res
    },
    enabled,
    refetchOnMount: false
  })

  return query
}
