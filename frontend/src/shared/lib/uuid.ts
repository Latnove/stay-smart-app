const UUID_REGEXP = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export const isUUID = (value: unknown): value is string => typeof value === 'string' && UUID_REGEXP.test(value)

export const filterUUIDs = (values: unknown[]) => Array.from(new Set(values.filter(isUUID)))
