# AI 助手（Agent）接入说明

已将带工具调用的 LLM Agent 和本地语义 RAG 集成进本项目。当前是“单 Agent + 多工具”架构，
不是多个 Agent 互相调度；只读工具可并行，写日记仍需用户确认并串行执行。

## 一、本次改动

### 新增文件

| 路径                                            | 说明                                                         |
| ----------------------------------------------- | ------------------------------------------------------------ |
| `src/agent/**`                                  | Agent 核心（循环 / LLM 客户端 / 10 个工具 / TTS / 长期记忆） |
| `src/agent/rag/**`                              | 本地模型下载、分块、768 维向量、量化缓存和语义召回           |
| `src/components/AgentChat/AgentChat.tsx`        | 对话界面（流式 + 工具过程 + 朗读按钮）                       |
| `src/components/AgentChat/MemoryPanel.tsx`      | 长期记忆查看、添加、修改、删除                               |
| `src/screens/AgentChat/**`                      | 包装页，注入真实 repo 与 TTS                                 |
| `src/agent/adapter.ts`                          | **对接本项目 diaryRepository 与 DiaryModel**                 |
| `src/agent/tts/adapter.ts`                      | 用项目已有的 `react-native-tts`（离线、零新增依赖）          |
| `src/agent/setup.ts`                            | 异步初始化模型配置                                           |
| `src/agent/defaults.ts`                         | 可公开的网关与模型默认值（不含密钥）                         |
| `patches/onnxruntime-react-native+1.24.3.patch` | RN 字符串张量输入兼容补丁（安装依赖时自动应用）              |
| `__tests__/agent/rag.test.ts`                   | 分块、池化、量化、增量索引、语义召回与隐私边界测试           |

### 主要修改文件

- `App.tsx`：加 `initAgent()`
- `src/constants/routes.ts`：加 `AGENT_CHAT`
- `src/navigation/types.ts`：`RootStackParamList` 加 `AgentChat`
- `src/navigation/AppNavigator.tsx`：注册 `<Stack.Screen>` + import
- `src/screens/Profile/ProfileScreen.tsx`：菜单加「AI 助手」入口
- `src/database/**`：新增 `diary_embedding`、`agent_memory` 表及 DAO/Repository
- `android/**` / `metro.config.js`：接入 ONNX Runtime 与移动端扩展算子

## 二、怎么跑起来

**入口**：Profile 页 → 「AI 助手」。

**启用本地语义检索**：进入助手后点「启用」，首次会明确提示并下载约 130 MiB 的
多语言 INT8 ONNX 模型。下载文件会校验固定大小与 SHA-256，通过后才建立索引；以后
可离线做向量生成和匹配。模型固定到仓库 revision，避免上游文件变化导致不可复现。

**配置 LLM**：
当前默认网关 = 腾讯 MaaS（`https://tokenhub.tencentmaas.com/v1`，模型 `hy4-flash`）。

凭据链路（**key 不进源码、不进入安装包**）：

1. 首次进入「AI 助手」时，在「模型配置」里填写 API Key
2. `src/agent/agentSecrets.ts` 使用 iOS Keychain / Android Keystore 加密保存
3. `initAgent()` 启动时异步读取 apiKey / baseURL / model
4. 旧版 MMKV 凭据会自动迁移到系统安全存储并从 MMKV 删除

> 🔒 旧的 `src/agent/llmCredentials.ts` 不再被任何运行时代码导入，仅保留在
> `.gitignore` 中防止本地旧文件误提交。新安装不需要该文件也能构建。
>
> 相关 API 均为异步：`saveLLMCredentials` / `loadLLMCredentials` /
> `clearLLMCredentials`（从 `@/agent` 导出）。

**隐私边界**：

- 日记分块、768 维向量生成、量化和相似度检索均在设备本地完成。
- SQLite 只额外保存 int8 + Base64 向量和来源哈希，不复制日记正文。
- 加密日记不会进入语义索引，也不会进入 Agent 的关键词检索、统计或按 ID 读取上下文。
- 为让配置的大模型组织答案，命中的必要日记片段会随对话请求发给该模型服务；启用弹窗已明确说明这一点。

**语音**：默认用 `react-native-tts` 系统音色，无需网络、无需新增依赖。
若想要 edge-tts 神经音色，装 `react-native-sound` 后调用
`createNetworkTTSAdapter(fileWriter, player)` 并 `configureTTS({ baseURL, apiKey })`。

## 三、Agent 能做什么

| 用户说                 | Agent 行为                                  |
| ---------------------- | ------------------------------------------- |
| "我最近写了哪些日记"   | 调 `search_diaries` 检索                    |
| "哪段经历让我比较放松" | 调本机 `semantic_search_diaries` 按含义召回 |
| "我最近心情怎么样"     | 调 `mood_statistics` 统计并总结             |
| "帮我记一笔：今天…"    | 调 `create_diary` 写入数据库                |
| "把上周回顾念给我听"   | `weeklyReport` + 调 `read_aloud` 朗读       |
| "记住我每周想跑步三次" | 弹窗确认后调 `remember_user_fact`           |
| "你记得我什么"         | 调 `list_memories`，展示已确认的长期记忆    |
| "忘记刚才那项目标"     | 精确查找后确认调用 `forget_memory`          |
| 点某条回复的 🔊        | 端侧 TTS 朗读该文本                         |

另提供独立能力：`analyzeMood()`（自动识别情绪）、`autoTag()`（自动打标签）、
`narrateWeeklyReport()` / `narrateDiary()`（语音叙事）。

## 四、数据层适配说明

`src/agent/adapter.ts` 已按本项目真实模型适配：

- `DiaryModel.createdAt/updatedAt` 是 **number 毫秒时间戳**（非字符串）
- `create()` 补齐了完整字段（`isPinned/isEncrypted/isDraft` 等 `0|1`）
- 软删除和加密日记已从 Agent 上下文过滤
- 新增工具只需改 `src/agent/tools/definitions.ts`，不碰数据库层

## 五、验证情况

- TypeScript 与本次改动的 ESLint 校验通过
- Jest：16 个测试套件、84 个测试全部通过（含本地 RAG、事务、隐私过滤、上下文压缩、会话持久化和工具权限）
- Android 15 模拟器已完成原生构建、安装、约 130 MiB 模型下载、SHA-256 校验和 768 维真实向量建索引
- 真机链路测试“想找个安静发呆的地方”，正确召回“午后咖啡”，相关内容为“很安静，适合发呆”
- `adapter.ts` 对接真实 `DiaryModel` / `diaryRepository` 类型正确

## 六、Agent 架构优化（参考开源项目）

参考项目统一放在 `D:\Code\AgentReferenceProjects`，均使用官方仓库的浅克隆，
不会进入拾光日记的 Git 历史或安装包。

本次只移植适合本地日记的轻量模式：

- **上下文 micro-compact**：历史完整保存在本机，请求模型时只保留最近消息，
  较早内容压成短摘要，避免长对话越来越慢或超出模型窗口。
- **工具分级调度**：检索、读取、统计可并行；新建/修改日记始终串行。
- **写操作确认**：模型不能直接写日记，App 会显示具体动作，用户确认后才执行。
- **工具结果限流**：超长日记/结果会先截断成安全预览，避免挤爆上下文。
- **本地会话恢复**：最近 40 条用户/助手消息保存在 MMKV，可在聊天页一键清空；
  工具原始结果、系统提示和 API Key 不写入会话记录。

主要参考：Pi 的轻量 TypeScript 运行时、claude-code-from-scratch 的上下文与权限分层、
DeerFlow 的记忆/编排边界、DeepSeek Harness 的会话与工具权限思路。未复制整套框架，
避免引入 Python 服务、沙箱进程或常驻网关。

## 七、日记 Agent 产品化优化

本轮进一步参考 DayBook、Witness、Khoj、Mem0 和 Letta 的产品/记忆设计，代码均为
拾光日记重新实现，没有复制第三方源码：

- **双层记忆**：原始日记继续作为带日期的情景记忆；只有用户确认过的简短事实才进入
  `agent_memory` 长期记忆表。
- **用户控制**：模型提议保存人物、目标、偏好或习惯时必须弹窗确认；记忆页支持手动
  新增、编辑、删除，删除不会影响原始日记。
- **可追溯回答**：关键词/语义检索和按 ID 读取产生结构化来源卡片，显示标题、日期和
  必要片段，点击可直接打开日记原文；来源会随本地聊天会话恢复。
- **日记式首页**：助手首页提供本周回顾、温暖时刻、情绪小结、陪写日记四个入口，
  同时清楚展示本地语义索引状态和隐私边界。
- **服务降级**：模型限流或暂时不可用时，非写入类问题会尝试本地语义检索，至少给出
  可核对的相关日记；429/鉴权/网络错误改为可理解的中文提示。
- **旧数据兼容**：自动把早期日记的 Unix 秒时间戳归一为毫秒，避免统计、日期筛选和
  来源卡片日期出现偏差。

## 八、检索与护栏升级（混合检索 + 评测门禁）

在第七节基础上，检索从"向量单路"升级为混合检索，并补上生成侧护栏：

- **混合召回**：向量（语义）+ BM25（字面）双路，各取 top 40；中文按 2-gram 分词，
  不用额外词典。专有名词、人名、作品名不再依赖小模型的表征能力。
- **RRF 名次融合**：只看名次不看绝对分，规避余弦相似度与 BM25 分数的量纲差异。
- **去冗余**：先按日记归并（同一篇只留最强段落），再用 MMR（λ=0.75）抑制同主题重复。
- **多问法召回**：去掉提问外壳/时间状语、拆复合句后多路召回再融合；默认关闭，
  仅在 `lowConfidence` 或 Agent 判断首次结果不理想时用 `multiQuery=true` 重试一次。
- **置信度门控**：两条路都没有像样证据时返回 `lowConfidence: true`，让模型如实说"没找到"。
- **间接提示注入防护**：检索结果包成 `<untrusted_evidence>` 并用 5 类模式探测，
  日记正文里"忽略以上指令"之类文本不会被当作指令执行。
- **接地校验**：答案中出现的完整日期若不在来源里，发 `grounding_report`，UI 提示核对。
- **评测门禁**：`src/agent/rag/eval/` 提供 recall@k / MRR / nDCG@k 与黄金集，
  CI 中断言 `hybrid recall@5 ≥ 0.9` 且不低于纯向量。当前合成集结果：
  dense `0.900 / 0.800 / 0.826` → hybrid `1.000 / 0.900 / 0.926`。

详细设计、取舍与真机复测步骤见 [docs/ai/RagRetrievalUpgrade.md](./docs/ai/RagRetrievalUpgrade.md)。
