# Review 检查清单

> 代码 Review 的统一标准。

## 1. 工程结构

- [ ] 目录结构符合 `DirectoryGuide.md`
- [ ] 组件结构符合 `ComponentConvention.md`
- [ ] Feature 内部有 `README.md`
- [ ] 没有循环依赖
- [ ] 没有冗余目录

## 2. 命名规范

- [ ] 文件名遵循约定（PascalCase 组件 / camelCase 工具）
- [ ] 标识符命名规范
- [ ] 没有缩写词
- [ ] 没有拼音命名
- [ ] 常量使用统一风格

## 3. 代码风格

- [ ] 遵循 `CodingStyle.md`
- [ ] 注释充分（函数注释、行内注释）
- [ ] 没有 `console.log`
- [ ] 没有 `any`（必要时用 `unknown`）
- [ ] 没有死代码
- [ ] 没有 TODO 残留（除非明确记录）

## 4. 类型系统

- [ ] TypeScript 严格模式通过
- [ ] Props 接口清晰
- [ ] 公开函数都有返回类型
- [ ] 没有类型断言滥用
- [ ] 没有隐式 any

## 5. 主题与样式

- [ ] 所有颜色来自 `@theme`
- [ ] 所有间距来自 `@theme`
- [ ] 所有字号来自 `@theme`
- [ ] 所有圆角来自 `@theme`
- [ ] 所有动画时长来自 `@theme`
- [ ] 没有硬编码样式值

## 6. 组件规范

- [ ] 函数组件优先
- [ ] 单组件不超过 300 行
- [ ] Props 解构
- [ ] 没有 prop drilling
- [ ] 合理拆分

## 7. 数据流

- [ ] 单向数据流
- [ ] 服务端状态用 React Query
- [ ] 客户端全局状态用 Zustand
- [ ] 局部状态用 useState
- [ ] 没有跨层访问

## 8. 性能

- [ ] 长列表用 FlashList
- [ ] keyExtractor 必填
- [ ] estimatedItemSize 必填
- [ ] 动画用 useNativeDriver
- [ ] 没有大对象内联
- [ ] 图片用 FastImage

## 9. 安全

- [ ] 没有敏感信息硬编码
- [ ] token 存储用 MMKV
- [ ] 没有日志输出 token

## 10. 测试

- [ ] 工具函数有单元测试
- [ ] 关键组件有渲染测试
- [ ] 覆盖率 ≥ 80%
- [ ] 测试命名清晰
- [ ] 测试独立可运行

## 11. 文档

- [ ] README.md 完整
- [ ] 复杂逻辑有注释
- [ ] 公开 API 有 JSDoc
- [ ] 修改影响文档已更新

## 12. 设计一致性

- [ ] 颜色与 Design System 一致
- [ ] 字号与 Design System 一致
- [ ] 间距与 Design System 一致
- [ ] 组件行为符合 `docs/project-设计-docs/components/`

## 13. iOS 兼容性

- [ ] Platform.select 处理
- [ ] 没有 Android 特定 API 调用
- [ ] 字体处理跨平台

## 14. 长期维护

- [ ] 没有过度设计
- [ ] 没有冗余抽象
- [ ] 没有过早优化
- [ ] 方便后续扩展

## 15. 决策记录

- [ ] 重要决策有注释说明
- [ ] 选型有理由
- [ ] 限制有文档

## 16. Review 总结

完成 Review 后输出：
- ✅ 通过项
- ⚠️ 建议改进
- ❌ 必须修复