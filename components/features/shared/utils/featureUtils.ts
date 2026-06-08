export function buildFeatureKey(name: string) {
  return name.toLowerCase().replace(/\s+/g, '-')
}
