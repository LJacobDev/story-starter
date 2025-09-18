export function formatStoryDate(input: Date | string): string {
  const d = typeof input === 'string' ? new Date(input) : input
  if (isNaN(d.getTime())) return ''
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const dayMs = 24 * 60 * 60 * 1000
  const days = Math.floor(diffMs / dayMs)
  if (days < 10) {
    return days === 0 ? 'today' : `${days} day${days === 1 ? '' : 's'} ago`
  }
  // Long date like "March 10th 2025"
  const month = d.toLocaleString('en-US', { month: 'long' })
  const day = d.getDate()
  const year = d.getFullYear()
  const suffix = (n: number) => {
    const j = n % 10, k = n % 100
    if (j === 1 && k !== 11) return 'st'
    if (j === 2 && k !== 12) return 'nd'
    if (j === 3 && k !== 13) return 'rd'
    return 'th'
  }
  return `${month} ${day}${suffix(day)} ${year}`
}
