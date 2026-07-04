/**
 * SVG Icon Components
 *
 * 从 APK VectorDrawable 转换的 SVG 图标。
 * 每个图标是一个独立的 React Native 组件，支持 size / color 属性。
 *
 * 使用方式：
 *   import {CloseIcon, AddIcon} from '@assets/icons';
 *   <CloseIcon size={24} color={theme.colors.icon.secondary} />
 */

import React from 'react';
import Svg, {Path, G} from 'react-native-svg';

// ============ Icon Props ============

export interface IconProps {
  /** Icon size in dp (default: 24) */
  size?: number;
  /** Icon fill color (default: #000000) */
  color?: string;
  /** Whether icon should adapt to theme colors (default: false) */
  adaptive?: boolean;
}

// ============ Base Icon ============

interface BaseIconProps extends IconProps {
  children?: React.ReactNode;
}

const Icon: React.FC<BaseIconProps> = ({
  size = 24,
  color = '#000000',
  adaptive = false,
  children,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <G fill={adaptive ? 'currentColor' : color}>{children}</G>
  </Svg>
);

// ============ Close Icon (×) ============
// Android Vector: M4.405,5.723l1.43,-1.398L19.503,18.3l-1.43,1.398L4.405,5.723zM5.707,19.707l-1.414,-1.414 14,-14 1.414,1.414 -14,14z

export const CloseIcon: React.FC<IconProps> = ({
  size = 24,
  color,
  adaptive,
}) => (
  <Icon size={size} color={color} adaptive={adaptive}>
    <Path d="M4.405,5.723l1.43,-1.398L19.503,18.3l-1.43,1.398L4.405,5.723zM5.707,19.707l-1.414,-1.414 14,-14 1.414,1.414 -14,14z" />
  </Icon>
);

// ============ Back Icon (<) ============

export const BackIcon: React.FC<IconProps> = ({
  size = 24,
  color,
  adaptive,
}) => (
  <Icon size={size} color={color} adaptive={adaptive}>
    <Path d="M15.41,7.41L14,6l-6,6 6,6 1.41,-1.41L10.83,12z" />
  </Icon>
);

// ============ Add Icon (+) ============

export const AddIcon: React.FC<IconProps> = ({
  size = 24,
  color,
  adaptive,
}) => (
  <Icon size={size} color={color} adaptive={adaptive}>
    <Path d="M19,13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
  </Icon>
);

// ============ Search Icon ============

export const SearchIcon: React.FC<IconProps> = ({
  size = 24,
  color,
  adaptive,
}) => (
  <Icon size={size} color={color} adaptive={adaptive}>
    <Path d="M15.5,14h-0.79l-0.28,-0.27A6.471,6.471,0,0,0,16,9.5A6.5,6.5,0,1,0,9.5,16c1.61,0,3.09,-0.59,4.23,-1.57L14,14l.28,-0.28L15.5,14zM10,14.5A5,5,0,1,1,15,9.5A5,5,0,0,1,10,14.5z" />
  </Icon>
);

// ============ More Icon (⋮) ============

export const MoreIcon: React.FC<IconProps> = ({
  size = 24,
  color,
  adaptive,
}) => (
  <Icon size={size} color={color} adaptive={adaptive}>
    <Path d="M12,8c1.1,0 2,-0.9 2,-2s-0.9,-2 -2,-2 -2,0.9 -2,2 0.9,2 2,2zM12,10c-1.1,0 -2,0.9 -2,2s0.9,2 2,2 2,-0.9 2,-2 -0.9,-2 -2,-2zM12,16c-1.1,0 -2,0.9 -2,2s0.9,2 2,2 2,-0.9 2,-2 -0.9,-2 -2,-2z" />
  </Icon>
);

// ============ Edit Icon (✎) ============

export const EditIcon: React.FC<IconProps> = ({
  size = 24,
  color,
  adaptive,
}) => (
  <Icon size={size} color={color} adaptive={adaptive}>
    <Path d="M3,17.25V21h3.75L17.81,9.94l-3.75,-3.75L3,17.25zM20.71,7.04c0.39,-0.39 0.39,-1.02 0,-1.41l-2.34,-2.34c-0.39,-0.39 -1.02,-0.39 -1.41,0l-1.83,1.83 3.75,3.75 1.83,-1.83z" />
  </Icon>
);

// ============ Delete Icon (🗑) ============

export const DeleteIcon: React.FC<IconProps> = ({
  size = 24,
  color,
  adaptive,
}) => (
  <Icon size={size} color={color} adaptive={adaptive}>
    <Path d="M6,19c0,1.1 0.9,2 2,2h8c1.1,0 2,-0.9 2,-2V7H6v12zM19,4h-3.5l-1,-1h-5l-1,1H5v2h14V4z" />
  </Icon>
);

// ============ Save Icon (✓) ============

export const SaveIcon: React.FC<IconProps> = ({
  size = 24,
  color,
  adaptive,
}) => (
  <Icon size={size} color={color} adaptive={adaptive}>
    <Path d="M9,16.17L4.83,12l-1.42,1.41L9,19 21,7l-1.41,-1.41L9,16.17z" />
  </Icon>
);

// ============ Share Icon ============

export const ShareIcon: React.FC<IconProps> = ({
  size = 24,
  color,
  adaptive,
}) => (
  <Icon size={size} color={color} adaptive={adaptive}>
    <Path d="M18,16.08c-0.76,0 -1.44,0.3 -2.09,0.79L9.08,7.99c0.53,-0.41 1.2,-0.67 1.92,-0.67 2.04,0 3.69,1.65 3.69,3.69 0,0.72 -0.26,1.39 -0.67,1.92l8.88,6.83c0.49,-0.65 0.79,-1.33 0.79,-2.09C22,17.73 20.27,16 18,16.08zM6.81,10.91c0.76,0 1.44,-0.3 2.09,-0.79L15.72,17.01c-0.53,0.41 -1.2,0.67 -1.92,0.67 -2.04,0 -3.69,-1.65 -3.69,-3.69 0,-0.72 0.26,-1.39 0.67,-1.92L1.6,5.64C1.11,6.29 0.81,6.97 0.81,7.73C0.81,9.73 2.54,11.46 4.81,11.46L6.81,10.91zM17.25,4h-10.7l0.7,-1h-2l-1,1H3v2h2v14H3v2h2l1,1h2l-0.7,-1h10.7l-0.7,1h2l-1,-1h-2V6h2V4h-2z" />
  </Icon>
);

// ============ Camera Icon ============

export const CameraIcon: React.FC<IconProps> = ({
  size = 24,
  color,
  adaptive,
}) => (
  <Icon size={size} color={color} adaptive={adaptive}>
    <Path d="M12,15.2c1.77,0 3.2,-1.43 3.2,-3.2S13.77,8.8 12,8.8 8.8,10.23 8.8,12s1.43,3.2 3.2,3.2zM9,2L7.17,4H4c-1.1,0 -2,0.9 -2,2v12c0,1.1 0.9,2 2,2h16c1.1,0 2,-0.9 2,-2V6c0,-1.1 -0.9,-2 -2,-2h-3.17L15,2H9zM12,17c-2.76,0 -5,-2.24 -5,-5s2.24,-5 5,-5 5,2.24 5,5 -2.24,5 -5,5z" />
  </Icon>
);

// ============ Book Icon ============

export const BookIcon: React.FC<IconProps> = ({
  size = 24,
  color,
  adaptive,
}) => (
  <Icon size={size} color={color} adaptive={adaptive}>
    <Path d="M18,2H6c-1.1,0 -2,0.9 -2,2v16c0,1.1 0.9,2 2,2h12c1.1,0 2,-0.9 2,-2V4c0,-1.1 -0.9,-2 -2,-2zM6,4h5v8l-2.5,-1.5L6,12V4z" />
  </Icon>
);

// ============ Calendar Icon ============

export const CalendarIcon: React.FC<IconProps> = ({
  size = 24,
  color,
  adaptive,
}) => (
  <Icon size={size} color={color} adaptive={adaptive}>
    <Path d="M20,3h-1L19,1h-2v2H7V1H5v2H4c-1.1,0 -2,0.9 -2,2v16c0,1.1 0.9,2 2,2h16c1.1,0 2,-0.9 2,-2V5c0,-1.1 -0.9,-2 -2,-2zM20,21H4V8h16v13z" />
  </Icon>
);

// ============ Settings Icon ============

export const SettingsIcon: React.FC<IconProps> = ({
  size = 24,
  color,
  adaptive,
}) => (
  <Icon size={size} color={color} adaptive={adaptive}>
    <Path d="M19.14,12.94c0.04,-0.3 0.06,-0.61 0.06,-0.94 0,-0.32 -0.02,-0.64 -0.07,-0.94l2.03,-1.58c0.18,-0.14 0.23,-0.41 0.12,-0.61l-1.92,-3.32c-0.12,-0.22 -0.37,-0.29 -0.59,-0.22l-2.39,0.96c-0.5,-0.38 -1.03,-0.7 -1.62,-0.94L14.4,2.81c-0.04,-0.24 -0.24,-0.41 -0.48,-0.41h-3.84c-0.24,0 -0.43,0.17 -0.47,0.41L9.25,5.35C8.66,5.59 8.12,5.92 7.63,6.29L5.24,5.33c-0.22,-0.08 -0.47,0 -0.59,0.22L2.74,8.87C2.62,9.08 2.66,9.34 2.86,9.48l2.03,1.58C4.84,11.36 4.8,11.69 4.8,12s0.02,0.64 0.07,0.94l-2.03,1.58c-0.18,0.14 -0.23,0.41 -0.12,0.61l1.92,3.32c0.12,0.22 0.37,0.29 0.59,0.22l2.39,-0.96c0.5,0.38 1.03,0.7 1.62,0.94l0.36,2.54c0.05,0.24 0.24,0.41 0.48,0.41h3.84c0.24,0 0.44,-0.17 0.47,-0.41l0.36,-2.54c0.59,-0.24 1.13,-0.56 1.62,-0.94l2.39,0.96c0.22,0.08 0.47,0 0.59,-0.22l1.92,-3.32c0.12,-0.22 0.07,-0.47 -0.12,-0.61L19.14,12.94zM12,15.6c-1.98,0 -3.6,-1.62 -3.6,-3.6s1.62,-3.6 3.6,-3.6 3.6,1.62 3.6,3.6 -1.62,3.6 -3.6,3.6z" />
  </Icon>
);

// ============ Clock Icon ============

export const ClockIcon: React.FC<IconProps> = ({
  size = 24,
  color,
  adaptive,
}) => (
  <Icon size={size} color={color} adaptive={adaptive}>
    <Path d="M11.99,2C6.47,2 2,6.48 2,12s4.47,10 9.99,10C17.52,22 22,17.52 22,12S17.52,2 11.99,2zM12,20c-4.42,0 -8,-3.58 -8,-8s3.58,-8 8,-8 8,3.58 8,8 -3.58,8 -8,8zM12.5,7H11v6l5.25,3.15 0.75,-1.23 -4.5,-2.67z" />
  </Icon>
);

// ============ Export All ============

export const iconMap: Record<string, React.FC<IconProps>> = {
  close: CloseIcon,
  back: BackIcon,
  add: AddIcon,
  search: SearchIcon,
  more: MoreIcon,
  edit: EditIcon,
  delete: DeleteIcon,
  save: SaveIcon,
  share: ShareIcon,
  camera: CameraIcon,
  book: BookIcon,
  calendar: CalendarIcon,
  settings: SettingsIcon,
  clock: ClockIcon,
};
