/**
 * Utilitários para formatação de nomes
 */

/**
 * Capitaliza a primeira letra de cada palavra em um nome
 * @param name - Nome a ser capitalizado
 * @returns Nome com primeira letra de cada palavra em maiúscula
 */
export const capitalizeName = (name: string): string => {
  if (!name || typeof name !== 'string') {
    return name || ''
  }
  
  return name
    .trim()
    .split(' ')
    .map(word => {
      if (word.length === 0) return word
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    })
    .join(' ')
}

/**
 * Extrai e capitaliza o primeiro nome
 * @param fullName - Nome completo
 * @returns Primeiro nome capitalizado
 */
export const getCapitalizedFirstName = (fullName: string): string => {
  const capitalizedFullName = capitalizeName(fullName)
  return capitalizedFullName.split(' ')[0] || 'Transformador'
}

/**
 * Capitaliza nome completo mantendo a formatação adequada
 * @param fullName - Nome completo
 * @returns Nome completo capitalizado
 */
export const getCapitalizedFullName = (fullName: string): string => {
  return capitalizeName(fullName) || 'Transformador'
}