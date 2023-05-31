// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { type SearchAPIResults } from '../../types/api'
import { fetchJishoResults } from '../../utils/fetchJishoResults'

export default async function handler (
  req: NextApiRequest,
  res: NextApiResponse<SearchAPIResults>
) {
  const { keyword } = req.query
  if (typeof keyword !== 'string') return res.status(400)
  res.status(200).json({ results: await fetchJishoResults(keyword) })
}
