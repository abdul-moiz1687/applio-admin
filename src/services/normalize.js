import { ApiError } from './api'

/** Service-record arrays may be embedded under any of these keys. Verify the real key against the backend. */
export const SERVICE_KEYS = ['serviceRecords', 'serviceHistory', 'services'] // UNVERIFIED key names

/** Accepts a bare array or an array under one of the given keys; anything else is treated as an unexpected shape. */
export function normalizeList(payload, keys) {
  const list = Array.isArray(payload) ? payload : keys.map((k) => payload?.[k]).find(Array.isArray)
  if (!Array.isArray(list)) {
    throw new ApiError('The server returned an unexpected response format.', { kind: 'server', data: payload })
  }
  return list.filter((item) => item && typeof item === 'object')
}

/** Displays a value that may be a plain string or a populated object with a name/email. */
export function labelOf(value) {
  if (!value) return ''
  if (typeof value === 'string') return value
  if (typeof value === 'object') return value.name || value.email || ''
  return String(value)
}

const idOf = (raw) => raw?._id ?? raw?.id ?? null

export function normalizeUser(raw) {
  return {
    id: idOf(raw),
    name: raw.name ?? '',
    email: raw.email ?? '',
    role: raw.role ?? 'user',
    createdAt: raw.createdAt ?? null,
  }
}

export function normalizeService(raw, index) {
  const appliance = raw.appliance

  const applianceName =
    appliance && typeof appliance === 'object'
      ? [
          appliance.name,
          appliance.brand,
          appliance.model,
        ]
          .filter(Boolean)
          .join(' · ') ||
        appliance.serialNumber ||
        idOf(appliance) ||
        'Unknown appliance'
      : labelOf(appliance) || 'Unknown appliance'

  return {
    id: idOf(raw) ?? `service-${index}`,
    appliance: applianceName,
    applianceId:
      appliance && typeof appliance === 'object'
        ? idOf(appliance)
        : appliance ?? null,
    date: raw.serviceDate ?? raw.date ?? null,
    description: raw.description ?? '',
    technician: labelOf(raw.technician),
    cost: raw.cost ?? null,
  }
}

export function normalizeAppliance(raw) {
  const serviceKey = SERVICE_KEYS.find((k) => Array.isArray(raw[k]))
  return {
    id: idOf(raw),
    name: raw.name ?? '',
    brand: raw.brand ?? '',
    model: raw.model ?? '',
    serialNumber: raw.serialNumber ?? '',
    purchaseDate: raw.purchaseDate ?? null,
    warrantyDuration: raw.warrantyDuration ?? null,
    owner: labelOf(raw.owner),
    // null means the response did not include service records at all, which is different from an empty list.
    services: serviceKey ? raw[serviceKey].map(normalizeService) : null,
  }
}

// Describes a populated appliance object or a plain appliance ID.
export function describeAppliance(value) {
  if (!value) return 'Unknown appliance'

  if (typeof value === 'string') {
    return value
  }

  const description = [
    value.name,
    value.brand,
    value.model,
  ]
    .filter(Boolean)
    .join(' · ')

  return description || value.serialNumber || value._id || value.id || 'Unknown appliance'
}
