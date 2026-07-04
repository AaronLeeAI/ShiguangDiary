/**
 * Shared Component Library — Barrel Export
 *
 * 所有公共组件必须从此文件统一导出。业务代码使用：
 *   import {Button, Icon} from '@components';
 *
 * 组件分类见 src/components/README.md。
 *
 * 当前导出范围：已存在的公共（非业务）组件。
 */

// -- Layout --
export { Screen } from './Screen'
export type { ScreenProps } from './Screen/types'

export { Divider } from './Divider'
export type { DividerProps } from './Divider/types'

// -- Button --
export { PrimaryButton } from './PrimaryButton'
export type { PrimaryButtonProps } from './PrimaryButton/types'

export { IconButton } from './IconButton'
export type { IconButtonProps } from './IconButton/types'

export { FloatingActionButton } from './FloatingActionButton'
export type { FloatingActionButtonProps } from './FloatingActionButton/types'

export { TextButton } from './TextButton'
export type { TextButtonProps, TextButtonSize } from './TextButton/types'

// -- Input --
export { TextField } from './TextField'
export type { TextFieldProps } from './TextField/types'

export { TextArea } from './TextArea'
export type { TextAreaProps } from './TextArea/types'

export { PasswordInput } from './PasswordInput'
export type { PasswordInputProps } from './PasswordInput/types'

export { Checkbox } from './Checkbox'
export type { CheckboxProps } from './Checkbox/types'

export { Switch } from './Switch'
export type { SwitchProps } from './Switch/types'

export { SearchBar } from './SearchBar'
export type { SearchBarProps } from './SearchBar/types'

export { DateTimePicker } from './DateTimePicker'
export type { DateTimePickerProps } from './DateTimePicker/types'

// -- Display --
export { Icon } from './Icon'
export type { IconProps, IconName, IconSize, IconVariant } from './Icon'

export { Avatar } from './Avatar'
export type { AvatarProps } from './Avatar/types'

export { Tag } from './Tag'
export type { TagProps } from './Tag/types'

export { EmptyState } from './EmptyState'
export type { EmptyStateProps } from './EmptyState/types'

export { Loading } from './Loading'
export type { LoadingProps } from './Loading/types'

export { Skeleton } from './Skeleton'
export type { SkeletonProps } from './Skeleton/types'

export { TabItem } from './TabItem'
export type { TabItemProps } from './TabItem/types'

export { BottomTabBar } from './BottomTabBar'
export type { BottomTabBarProps } from './BottomTabBar/types'

export { TopBar } from './TopBar'
export type { TopBarProps } from './TopBar/types'

// -- Feedback --
export { Toast } from './Toast'
export type { ToastOptions, ToastVariant, ToastPosition, ToastProviderProps } from './Toast/types'

export { BottomSheet } from './BottomSheet'
export type { BottomSheetProps } from './BottomSheet/types'

export { ActionSheet } from './ActionSheet'
export type { ActionSheetProps } from './ActionSheet/types'

export { AlertDialog } from './AlertDialog'
export type { AlertDialogProps } from './AlertDialog/types'

export { Modal } from './Modal'
export type { ModalProps } from './Modal/types'

export { LoadingOverlay } from './LoadingOverlay'
export type { LoadingOverlayProps } from './LoadingOverlay/types'

// -- Calendar --
export { Calendar } from './Calendar'
export type { CalendarProps } from './Calendar/types'
