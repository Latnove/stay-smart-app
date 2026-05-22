export const declension = (number: number, one: string, few: string, many: string) => {
  number = Math.abs(number) % 100
  const n1 = number % 10

  if (number > 10 && number < 20) return many
  if (n1 > 1 && n1 < 5) return few
  if (n1 === 1) return one
  return many
}
