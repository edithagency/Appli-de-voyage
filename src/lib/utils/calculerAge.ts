export function calculerAge(dateNaissance: string) {
  const today = new Date()
  const birth = new Date(dateNaissance)
  return today.getFullYear() - birth.getFullYear()
}
