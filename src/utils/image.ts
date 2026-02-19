import type { Binary } from '../types/recipe'

/**
 * Converts a Spring Boot / MongoDB Binary object to a base64 data URL.
 * The `data` field may be a single base64 string (Jackson byte[] serialization)
 * or an array of base64 strings (BSON Binary chunks).
 */
export function binaryToDataUrl(binary: Binary): string | null {
  if (!binary.data) return null
  const b64 = Array.isArray(binary.data) ? binary.data.join('') : binary.data
  if (!b64) return null
  return `data:image/jpeg;base64,${b64}`
}

/** Returns the data URL of the first image in the array, or null. */
export function firstImageUrl(images: Binary[] | undefined): string | null {
  if (!images || images.length === 0) return null
  return binaryToDataUrl(images[0])
}
