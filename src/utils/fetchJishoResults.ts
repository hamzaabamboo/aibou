import axios from 'axios'
import { type JishoWord } from '../types/jisho'

/**
 * Referenced from : https://jisho.org/forum/54fefc1f6e73340b1f160000-is-there-any-kind-of-search-api
 */
const JISHO_ENDPOINT = 'https://jisho.org/api/v1/search/words?keyword='

export const fetchJishoResults = async (keyword: string) => {
  const { data } = await axios.get<{
    meta: { status: number }
    data: JishoWord[]
  }>(`${JISHO_ENDPOINT}${encodeURIComponent(keyword)}`)
  return data.data
}
