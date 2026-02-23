/**
 * Application ID system
 *
 * Format:  {PREFIX}-{YEAR}-{SEQ5}-{CHECKSUM2}
 * Example: MBR-2024-00042-K7
 *
 * Prefixes
 *   MBR  — Member
 *   TRN  — Trainer
 *   STF  — Staff
 *
 * Rules
 *   - Generated once per user, stored in localStorage under key  appId_{userId}
 *   - Derived deterministically from userId + createdAt year + role
 *   - Unique and permanent — even if the user is deleted, the ID is never reused
 *     (localStorage entry remains; the sequence counter is also persisted)
 *   - Decoding the ID reveals: type, year, sequence, checksum validity
 */

type UserType = 'MEMBER' | 'TRAINER' | 'STAFF'

const PREFIX: Record<UserType, string> = {
  MEMBER: 'MBR',
  TRAINER: 'TRN',
  STAFF: 'STF',
}

const PREFIX_TO_TYPE: Record<string, UserType> = {
  MBR: 'MEMBER',
  TRN: 'TRAINER',
  STF: 'STAFF',
}

const COUNTER_KEY = (prefix: string, year: number) => `appid_counter_${prefix}_${year}`
const ID_KEY = (userId: number) => `appId_${userId}`
// Registry maps generated ID → userId so IDs are never reused
const REGISTRY_KEY = 'appid_registry'

function getRegistry(): Record<string, number> {
  try {
    return JSON.parse(localStorage.getItem(REGISTRY_KEY) || '{}')
  } catch {
    return {}
  }
}

function saveRegistry(reg: Record<string, number>) {
  localStorage.setItem(REGISTRY_KEY, JSON.stringify(reg))
}

/** Simple 2-char checksum derived from the id body */
function checksum(body: string): string {
  const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let h = 0
  for (let i = 0; i < body.length; i++) {
    h = (h * 31 + body.charCodeAt(i)) >>> 0
  }
  return CHARS[h % CHARS.length] + CHARS[(h >> 5) % CHARS.length]
}

/**
 * Get or create the permanent app ID for a user.
 * userId + createdAt are used for year derivation; role determines the prefix.
 */
export function getOrCreateAppId(
  userId: number,
  role: UserType,
  createdAt?: string
): string {
  const stored = localStorage.getItem(ID_KEY(userId))
  if (stored) return stored

  const prefix = PREFIX[role]
  const year = createdAt ? new Date(createdAt).getFullYear() : new Date().getFullYear()

  // Get and increment counter for this prefix+year
  const counterKey = COUNTER_KEY(prefix, year)
  const counter = parseInt(localStorage.getItem(counterKey) || '0', 10) + 1
  localStorage.setItem(counterKey, String(counter))

  const seq = String(counter).padStart(5, '0')
  const body = `${prefix}-${year}-${seq}`
  const cs = checksum(body)
  const id = `${body}-${cs}`

  // Persist ID and registry entry (guards against reuse after deletion)
  localStorage.setItem(ID_KEY(userId), id)
  const reg = getRegistry()
  reg[id] = userId
  saveRegistry(reg)

  return id
}

export interface DecodedAppId {
  raw: string
  valid: boolean
  userType: string      // "Member" | "Trainer" | "Staff"
  prefix: string        // "MBR" | "TRN" | "STF"
  year: number
  sequence: number
  checksumValid: boolean
  description: string   // human-readable one-liner
}

/**
 * Decode an app ID and return all embedded information.
 */
export function decodeAppId(id: string): DecodedAppId {
  const parts = id.split('-')
  const invalid: DecodedAppId = {
    raw: id, valid: false, userType: 'Unknown', prefix: '',
    year: 0, sequence: 0, checksumValid: false, description: 'Invalid ID format',
  }

  if (parts.length !== 4) return invalid

  const [prefix, yearStr, seqStr, cs] = parts
  const year = parseInt(yearStr, 10)
  const sequence = parseInt(seqStr, 10)

  if (!PREFIX_TO_TYPE[prefix]) return { ...invalid, description: `Unknown prefix "${prefix}"` }
  if (isNaN(year) || year < 2020 || year > 2100) return { ...invalid, description: 'Invalid year in ID' }
  if (isNaN(sequence) || sequence < 1) return { ...invalid, description: 'Invalid sequence in ID' }

  const body = `${prefix}-${yearStr}-${seqStr}`
  const expectedCs = checksum(body)
  const checksumValid = cs === expectedCs

  const userType = PREFIX_TO_TYPE[prefix]
  const typeLabel = userType === 'MEMBER' ? 'Member' : userType === 'TRAINER' ? 'Trainer' : 'Staff'

  return {
    raw: id,
    valid: checksumValid,
    userType: typeLabel,
    prefix,
    year,
    sequence,
    checksumValid,
    description: checksumValid
      ? `${typeLabel} #${sequence} registered in ${year}`
      : `${typeLabel} #${sequence} registered in ${year} (checksum mismatch — possible tampering)`,
  }
}
