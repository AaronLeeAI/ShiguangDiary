export function meanPoolLastHiddenState(
  data: ArrayLike<number>,
  dims: readonly number[],
): Float32Array {
  if (dims.length !== 3 || dims[0] !== 1) {
    throw new Error(`无法处理模型输出维度：[${dims.join(', ')}]`)
  }

  const tokenCount = dims[1]
  const embeddingSize = dims[2]
  if (
    !Number.isInteger(tokenCount) ||
    tokenCount <= 0 ||
    !Number.isInteger(embeddingSize) ||
    embeddingSize <= 0 ||
    data.length !== tokenCount * embeddingSize
  ) {
    throw new Error('模型输出向量长度不正确')
  }

  const pooled = new Float32Array(embeddingSize)
  for (let tokenIndex = 0; tokenIndex < tokenCount; tokenIndex++) {
    const offset = tokenIndex * embeddingSize
    for (let dimension = 0; dimension < embeddingSize; dimension++) {
      pooled[dimension] += Number(data[offset + dimension] ?? 0)
    }
  }
  for (let dimension = 0; dimension < embeddingSize; dimension++) {
    pooled[dimension] /= tokenCount
  }
  return pooled
}
