# Attachment Feature

> 附件管理功能

## 职责范围

- 图片选择（相册/相机）
- 图片压缩
- 附件上传
- 附件预览
- 附件删除

## 目录

```
attachment/
├── README.md
├── index.ts
├── components/    # ImageGrid, AttachmentItem
├── hooks/         # useImagePicker, useAttachmentUpload
└── utils/         # 图片压缩、文件存储
```

## 关联

- **依赖**：api（上传）、storage（本地缓存）
- **被引用**：editor（写日记插入图片）、diary（附件展示）

## 状态

🚧 **待开发**