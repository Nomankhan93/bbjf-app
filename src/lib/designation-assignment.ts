export const designationLevelOptions = [
  'UC',
  'City',
  'Taluka',
  'District',
  'Divisional',
  'Provincial',
] as const

export type DesignationLevel = (typeof designationLevelOptions)[number]

export const recommendedDesignationsByLevel: Record<DesignationLevel, string[]> = {
  UC: [
    'UC President',
    'UC Senior Vice President',
    'UC Vice President',
    'UC General Secretary',
    'UC Information Secretary',
    'UC Finance Secretary',
    'UC Coordinator',
  ],
  City: [
    'City President',
    'City Senior Vice President',
    'City Vice President',
    'City General Secretary',
    'City Information Secretary',
    'City Finance Secretary',
    'City Coordinator',
  ],
  Taluka: [
    'Taluka President',
    'Taluka Senior Vice President',
    'Taluka Vice President',
    'Taluka General Secretary',
    'Taluka Information Secretary',
    'Taluka Finance Secretary',
    'Taluka Coordinator',
  ],
  District: [
    'District President',
    'District Senior Vice President',
    'District Vice President',
    'District General Secretary',
    'District Information Secretary',
    'District Finance Secretary',
    'District Coordinator',
  ],
  Divisional: [
    'Divisional President',
    'Divisional Senior Vice President',
    'Divisional Vice President',
    'Divisional General Secretary',
    'Divisional Information Secretary',
    'Divisional Finance Secretary',
    'Divisional Coordinator',
  ],
  Provincial: [
    'Provincial President',
    'Provincial Senior Vice President',
    'Provincial Vice President',
    'Provincial General Secretary',
    'Provincial Information Secretary',
    'Provincial Finance Secretary',
    'Provincial Coordinator',
  ],
}

export function isDesignationLevel(value: string): value is DesignationLevel {
  return designationLevelOptions.includes(value as DesignationLevel)
}

export function getRecommendedDesignations(level: string) {
  if (!isDesignationLevel(level)) return []
  return recommendedDesignationsByLevel[level]
}

export function getDefaultDesignationArea(level: string, member: {
  district?: string | null
  taluka?: string | null
}) {
  if (level === 'Provincial') return 'Sindh'
  if (level === 'Divisional') return ''
  if (level === 'District') return member.district ?? ''
  if (level === 'Taluka' || level === 'City' || level === 'UC') {
    return member.taluka || member.district || ''
  }

  return ''
}
