import { HStack, Text } from '@chakra-ui/react'
import { type KankenGrade } from '../../types/kanken'
import { getGradeLabel } from '../../utils/kanken/getGradeLabel'

interface GradePickerProps {
  grades: KankenGrade[]
  selectedGrade: KankenGrade
  onSelectGrade: (grade: KankenGrade) => void
}

export const GradePicker = (props: GradePickerProps) => {
  const { grades, selectedGrade, onSelectGrade } = props
  return <HStack w="full" justifyContent="space-between" my="4">
        {grades.sort().map(grade => <Text key={grade} fontSize="xl" fontWeight={grade === selectedGrade ? 'bold' : 'normal'} onClick={() => { onSelectGrade(grade) }}>{getGradeLabel(grade)}</Text>)}
    </HStack>
}
