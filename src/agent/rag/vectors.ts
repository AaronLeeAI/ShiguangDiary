/* eslint-disable no-bitwise */

const BASE64_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'

export function normalizeVector(vector: ArrayLike<number>): Float32Array {
  let squared = 0
  for (let index = 0; index < vector.length; index++) {
    const value = Number(vector[index] ?? 0)
    squared += value * value
  }
  const magnitude = Math.sqrt(squared)
  const normalized = new Float32Array(vector.length)
  if (!Number.isFinite(magnitude) || magnitude === 0) {
    return normalized
  }
  for (let index = 0; index < vector.length; index++) {
    normalized[index] = Number(vector[index] ?? 0) / magnitude
  }
  return normalized
}

function bytesToBase64(bytes: Uint8Array): string {
  let output = ''
  for (let index = 0; index < bytes.length; index += 3) {
    const first = bytes[index] ?? 0
    const hasSecond = index + 1 < bytes.length
    const hasThird = index + 2 < bytes.length
    const second = bytes[index + 1] ?? 0
    const third = bytes[index + 2] ?? 0
    const triplet = (first << 16) | (second << 8) | third
    output += BASE64_ALPHABET[(triplet >> 18) & 63]
    output += BASE64_ALPHABET[(triplet >> 12) & 63]
    output += hasSecond ? BASE64_ALPHABET[(triplet >> 6) & 63] : '='
    output += hasThird ? BASE64_ALPHABET[triplet & 63] : '='
  }
  return output
}

function base64ToBytes(value: string): Uint8Array {
  const clean = value.replace(/\s/g, '')
  if (!clean || clean.length % 4 !== 0) {
    return new Uint8Array()
  }
  const padding = clean.endsWith('==') ? 2 : clean.endsWith('=') ? 1 : 0
  const bytes = new Uint8Array((clean.length / 4) * 3 - padding)
  let offset = 0
  for (let index = 0; index < clean.length; index += 4) {
    const a = BASE64_ALPHABET.indexOf(clean[index])
    const b = BASE64_ALPHABET.indexOf(clean[index + 1])
    const c = clean[index + 2] === '=' ? 0 : BASE64_ALPHABET.indexOf(clean[index + 2])
    const d = clean[index + 3] === '=' ? 0 : BASE64_ALPHABET.indexOf(clean[index + 3])
    if (a < 0 || b < 0 || c < 0 || d < 0) {
      return new Uint8Array()
    }
    const triplet = (a << 18) | (b << 12) | (c << 6) | d
    if (offset < bytes.length) {
      bytes[offset++] = (triplet >> 16) & 255
    }
    if (offset < bytes.length) {
      bytes[offset++] = (triplet >> 8) & 255
    }
    if (offset < bytes.length) {
      bytes[offset++] = triplet & 255
    }
  }
  return bytes
}

/** 将单位向量压缩为 int8 + Base64，显著降低 SQLite 索引体积。 */
export function encodeVector(vector: ArrayLike<number>): string {
  const normalized = normalizeVector(vector)
  const bytes = new Uint8Array(normalized.length)
  for (let index = 0; index < normalized.length; index++) {
    const quantized = Math.max(-127, Math.min(127, Math.round(normalized[index] * 127)))
    bytes[index] = quantized < 0 ? quantized + 256 : quantized
  }
  return bytesToBase64(bytes)
}

/** 查询向量必须已归一化；返回近似余弦相似度。 */
export function similarityToEncodedVector(
  normalizedQuery: ArrayLike<number>,
  encodedVector: string,
): number | null {
  const bytes = base64ToBytes(encodedVector)
  if (bytes.length === 0 || bytes.length !== normalizedQuery.length) {
    return null
  }
  let score = 0
  for (let index = 0; index < bytes.length; index++) {
    const signed = bytes[index] > 127 ? bytes[index] - 256 : bytes[index]
    score += Number(normalizedQuery[index] ?? 0) * (signed / 127)
  }
  return Math.max(-1, Math.min(1, score))
}
