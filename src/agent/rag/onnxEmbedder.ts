import RNFS from 'react-native-fs'
import { InferenceSession, Tensor } from 'onnxruntime-react-native'
import { meanPoolLastHiddenState } from './pooling'
import type { EmbeddingProvider, RagProgress } from './types'

const MODEL_REVISION = '469261b351c8c1d9bca24b5f2f544ec264cfd2f3'
const MODEL_REPOSITORY =
  'https://huggingface.co/onnx-community/distiluse-base-multilingual-v2-merged-onnx'
const MODEL_MIRROR_REPOSITORY =
  'https://hf-mirror.com/onnx-community/distiluse-base-multilingual-v2-merged-onnx'
const MODEL_FILE = 'distiluse-base-multilingual-v2-int8.onnx'
const MODEL_REMOTE_FILE = 'combined_tokenizer_embedded_model.onnx'
const MODEL_SHA256 = '827d1a23e47f8c68a5788e58a06e137edf52aa568a6e4c852f4ce79f21b8a205'
export const LOCAL_RAG_MODEL_BYTES = 136313389
export const LOCAL_RAG_MODEL_ID = `distiluse-base-multilingual-v2-merged-onnx@${MODEL_REVISION}:mean-pool-v1`
export const LOCAL_RAG_MODEL_URL = `${MODEL_REPOSITORY}/resolve/${MODEL_REVISION}/${MODEL_REMOTE_FILE}?download=true`
const MODEL_DOWNLOAD_URLS = [
  `${MODEL_MIRROR_REPOSITORY}/resolve/${MODEL_REVISION}/${MODEL_REMOTE_FILE}`,
  LOCAL_RAG_MODEL_URL,
]

const modelDirectory = `${RNFS.DocumentDirectoryPath}/local-rag`
const modelPath = `${modelDirectory}/${MODEL_FILE}`
const temporaryPath = `${modelPath}.download`
const checksumMarkerPath = `${modelPath}.sha256`

async function safeUnlink(path: string): Promise<void> {
  if (await RNFS.exists(path)) {
    await RNFS.unlink(path)
  }
}

function describeNativeError(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message
  }
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return String((error as { message?: unknown }).message)
  }
  if (typeof error === 'object' && error !== null) {
    try {
      return JSON.stringify(error)
    } catch {
      return '未知本地推理错误'
    }
  }
  return String(error)
}

export class OnnxMultilingualEmbeddingProvider implements EmbeddingProvider {
  readonly modelId = LOCAL_RAG_MODEL_ID
  readonly modelBytes = LOCAL_RAG_MODEL_BYTES

  private session: InferenceSession | null = null
  private installPromise: Promise<void> | null = null
  private inferenceQueue: Promise<void> = Promise.resolve()

  async isInstalled(): Promise<boolean> {
    if (!(await RNFS.exists(modelPath))) {
      return false
    }
    const stat = await RNFS.stat(modelPath)
    if (Number(stat.size) !== LOCAL_RAG_MODEL_BYTES) {
      return false
    }

    if (await RNFS.exists(checksumMarkerPath)) {
      const marker = (await RNFS.readFile(checksumMarkerPath, 'utf8')).trim().toLowerCase()
      return marker === MODEL_SHA256
    }

    const checksum = (await RNFS.hash(modelPath, 'sha256')).toLowerCase()
    if (checksum !== MODEL_SHA256) {
      return false
    }
    await RNFS.writeFile(checksumMarkerPath, MODEL_SHA256, 'utf8')
    return true
  }

  async install(onProgress?: (progress: RagProgress) => void): Promise<void> {
    if (await this.isInstalled()) {
      onProgress?.({
        phase: 'download',
        completed: LOCAL_RAG_MODEL_BYTES,
        total: LOCAL_RAG_MODEL_BYTES,
        percent: 100,
        message: '本地语义模型已安装',
      })
      return
    }
    if (this.installPromise) {
      return this.installPromise
    }

    this.installPromise = this.downloadAndVerify(onProgress).finally(() => {
      this.installPromise = null
    })
    return this.installPromise
  }

  async embed(text: string): Promise<Float32Array> {
    const task = this.inferenceQueue.then(async () => {
      const session = await this.getSession()
      let input: Tensor
      try {
        input = new Tensor('string', [text], [1])
      } catch (error) {
        throw new Error(`本地语义模型输入创建失败：${describeNativeError(error)}`, { cause: error })
      }
      try {
        const outputs = await session.run({ text: input })
        const output = outputs.text_embedding
        if (output?.data && output.data.length > 0) {
          const data = output.data as ArrayLike<number>
          const vector = new Float32Array(data.length)
          for (let index = 0; index < data.length; index++) {
            vector[index] = Number(data[index] ?? 0)
          }
          return vector
        }

        const hiddenState = outputs.last_hidden_state
        if (hiddenState?.data && hiddenState.dims) {
          return meanPoolLastHiddenState(hiddenState.data as ArrayLike<number>, hiddenState.dims)
        }

        const names = Object.keys(outputs).join(', ')
        throw new Error(`模型没有返回可用的语义向量（输出：${names || '无'}）`)
      } catch (error) {
        throw new Error(`本地语义模型执行失败：${describeNativeError(error)}`, { cause: error })
      }
    })
    this.inferenceQueue = task.then(
      () => undefined,
      () => undefined,
    )
    return task
  }

  private async getSession(): Promise<InferenceSession> {
    if (this.session) {
      return this.session
    }
    if (!(await this.isInstalled())) {
      throw new Error('本地语义模型尚未安装')
    }
    try {
      this.session = await InferenceSession.create(modelPath)
    } catch (error) {
      throw new Error(`本地语义模型加载失败：${describeNativeError(error)}`, { cause: error })
    }
    return this.session
  }

  private async downloadAndVerify(onProgress?: (progress: RagProgress) => void): Promise<void> {
    await RNFS.mkdir(modelDirectory)
    await safeUnlink(temporaryPath)
    await safeUnlink(modelPath)
    await safeUnlink(checksumMarkerPath)

    onProgress?.({
      phase: 'download',
      completed: 0,
      total: LOCAL_RAG_MODEL_BYTES,
      percent: 0,
      message: '正在下载本地语义模型…',
    })

    let lastError: unknown = new Error('模型下载失败')
    for (let sourceIndex = 0; sourceIndex < MODEL_DOWNLOAD_URLS.length; sourceIndex++) {
      await safeUnlink(temporaryPath)
      if (sourceIndex > 0) {
        onProgress?.({
          phase: 'download',
          completed: 0,
          total: LOCAL_RAG_MODEL_BYTES,
          percent: 0,
          message: '当前线路不可用，正在切换备用下载线路…',
        })
      }

      try {
        const download = RNFS.downloadFile({
          fromUrl: MODEL_DOWNLOAD_URLS[sourceIndex],
          toFile: temporaryPath,
          connectionTimeout: 15000,
          readTimeout: 120000,
          progressDivider: 1,
          progress: event => {
            const total = event.contentLength > 0 ? event.contentLength : LOCAL_RAG_MODEL_BYTES
            const percent = Math.max(
              0,
              Math.min(100, Math.round((event.bytesWritten / total) * 100)),
            )
            onProgress?.({
              phase: 'download',
              completed: event.bytesWritten,
              total,
              percent,
              message: `正在下载本地语义模型（${percent}%）`,
            })
          },
        })
        const result = await download.promise
        if (result.statusCode < 200 || result.statusCode >= 300) {
          throw new Error(`模型下载失败（HTTP ${result.statusCode}）`)
        }
        const stat = await RNFS.stat(temporaryPath)
        if (Number(stat.size) !== LOCAL_RAG_MODEL_BYTES) {
          throw new Error('模型文件大小校验失败')
        }
        const checksum = (await RNFS.hash(temporaryPath, 'sha256')).toLowerCase()
        if (checksum !== MODEL_SHA256) {
          throw new Error('模型文件完整性校验失败')
        }
        await RNFS.moveFile(temporaryPath, modelPath)
        await RNFS.writeFile(checksumMarkerPath, MODEL_SHA256, 'utf8')
        onProgress?.({
          phase: 'download',
          completed: LOCAL_RAG_MODEL_BYTES,
          total: LOCAL_RAG_MODEL_BYTES,
          percent: 100,
          message: '模型下载并校验完成',
        })
        return
      } catch (error) {
        lastError = error
      }
    }

    await safeUnlink(temporaryPath)
    throw lastError
  }
}

export const onnxMultilingualEmbeddingProvider = new OnnxMultilingualEmbeddingProvider()
