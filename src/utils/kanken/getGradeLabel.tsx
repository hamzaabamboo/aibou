export const getGradeLabel = (grade: string) => {
  switch (grade) {
    case '2-5':
      return '準2級'
    default:
      return `${grade}級`
  }
}
