export function displayClass(c: any) {
  if (!c) return ''
  // prefer explicit name/title
  if (c.name) return c.name
  if (c.title) return c.title
  // otherwise build a readable label
  const parts = []
  if (c.id != null) parts.push(`Turma ${c.id}`)
  if (c.room) parts.push(c.room)
  if (c.semester) parts.push(c.semester)
  return parts.join(' • ')
}
