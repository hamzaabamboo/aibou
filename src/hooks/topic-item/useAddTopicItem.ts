import { useMutation, useQueryClient } from '@tanstack/react-query'

import { nanoid } from 'nanoid'

import { type JishoWord } from '../../types/jisho'
import { useDBContext } from '../contexts/useDBContext'
import { useUpdateTopicItem } from './useUpdateTopicItem'

export const useAddTopicItem = () => {
  const queryClient = useQueryClient()
  const { db } = useDBContext()
  const { mutate: editItem } = useUpdateTopicItem()

  return useMutation({
    mutationFn: async (data: {
      word: string
      jishoData: JishoWord
      topicId: string
    }) => {
      const { word, topicId } = data
      const idNumber = Number(topicId)
      const wordAlreadyExist =
        (await db?.topicEntries?.where({ word, topicId }).count()) ?? 0
      if (wordAlreadyExist > 0) {
        const a = (
          await db?.topicEntries?.where({ word, topicId }).toArray()
        )?.[0]
        if (a?.isDeleted) {
          await editItem({ id: a.id, topicId, isDeleted: false })
          await db?.topics.update(Number.isNaN(idNumber) ? topicId : idNumber, {
            lastUpdatedAt: new Date()
          })
          return
        }
        throw new Error('Word Already Exist')
      }
      try {
        await db?.topicEntries.add({
          ...data,
          id: nanoid(8),
          topicId,
          tags: [],
          createdAt: new Date(),
          lastUpdatedAt: new Date()
        })
        await db?.topics.update(Number.isNaN(idNumber) ? topicId : idNumber, {
          lastUpdatedAt: new Date()
        })
        return topicId
      } catch (e) {
        console.error('Error adding')
      }
    },
    onSuccess: (topicId) => {
      queryClient.invalidateQueries({ queryKey: ['fetchTopicItems', topicId] })
      queryClient.invalidateQueries({ queryKey: ['fetchLastUpdatedTopics'] })
    }
  })
}
