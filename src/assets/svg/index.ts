/**
 * SVG Icon Registry
 *
 * 将 APK 中导出的 SVG 资源转换为 React Native SvgComponent。
 * 这些文件由 Task03 (Assets Pipeline) 自动生成 / 手动编写。
 * 后续 Task 通过 `import IconName from '@assets/svg/IconName'` 引用。
 */

import React from 'react';

interface SvgPlaceholderProps {
  size?: number;
  color?: string;
}

const PlaceholderSvg: React.FC<SvgPlaceholderProps> = () => null;

const emptyMap: Record<string, React.FC<SvgPlaceholderProps>> = {};

export default emptyMap;
export {PlaceholderSvg};
