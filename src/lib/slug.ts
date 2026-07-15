export function generateSlug(name: string): string {
  return (
    name
      // Normalize to decomposed form so accents become separate combining characters
      .normalize('NFD')
      // Remove combining diacritical marks (accents)
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      // Replace non-alphanumeric characters with hyphens
      .replace(/[^a-z0-9]+/g, '-')
      // Collapse multiple hyphens
      .replace(/-+/g, '-')
      // Trim hyphens from start and end
      .replace(/^-+|-+$/g, '') || 'agency'
  )
}