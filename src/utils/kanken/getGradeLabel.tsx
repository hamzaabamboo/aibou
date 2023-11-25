export const getGradeLabel = (grade: string) => {
  switch (grade) {
    case '1-5':
      return '準1級'
    case '2-5':
      return '準2級'
    default:
      return `${grade}級`
  }
}
