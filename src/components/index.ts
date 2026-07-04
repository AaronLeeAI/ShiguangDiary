/**
 * Shared Component Library — Barrel Export
 *
 * 所有公共组件必须从此文件统一导出。业务代码使用：
 *   import {Button, Icon} from '@components';
 *
 * 组件分类见 src/components/README.md。
 *
 * 当前导出范围：已存在的公共（非业务）组件。
 * 缺失的组件（Screen、Divider 等）标记为 TODO，在后续 Task 中实现。
 */

// -- Layout --
// TODO: Screen
// export {default as Screen} from './Screen';

// TODO: Divider
// export {default as Divider} from './Divider';

// -- Button --
export {default as PrimaryButton} from './PrimaryButton';
export type {PrimaryButtonProps} from './PrimaryButton/types';

export {default as IconButton} from './IconButton';
export type {IconButtonProps} from './IconButton/types';

export {default as FloatingActionButton} from './FloatingActionButton';
export type {FloatingActionButtonProps} from './FloatingActionButton/types';

// -- Input --
export {default as TextField} from './TextField';
export type {TextFieldProps} from './TextField/types';

export {default as TextArea} from './TextArea';
export type {TextAreaProps} from './TextArea/types';

export {default as Checkbox} from './Checkbox';
export type {CheckboxProps} from './Checkbox/types';

export {default as Switch} from './Switch';
export type {SwitchProps} from './Switch/types';

export {default as SearchBar} from './SearchBar/SearchBar';
export type {SearchBarProps} from './SearchBar/types';

export {default as DateTimePicker} from './DateTimePicker';
export type {DateTimePickerProps} from './DateTimePicker/types';

// -- Display --
export {default as Icon} from './Icon';
export type {IconProps, IconName, IconSize, IconVariant} from './Icon';

export {default as Avatar} from './Avatar';
export type {AvatarProps} from './Avatar/types';

export {default as Tag} from './Tag';
export type {TagProps} from './Tag/types';

export {default as EmptyState} from './EmptyState';
export type {EmptyStateProps} from './EmptyState/types';

export {default as Loading} from './Loading';
export type {LoadingProps} from './Loading/types';

export {default as Skeleton} from './Skeleton';
export type {SkeletonProps} from './Skeleton/types';

export {default as TabItem} from './TabItem';
export type {TabItemProps} from './TabItem/types';

export {default as BottomTabBar} from './BottomTabBar';
export type {BottomTabBarProps} from './BottomTabBar/types';

export {default as TopBar} from './TopBar';
export type {TopBarProps} from './TopBar/types';

// -- Feedback --
export {default as Toast} from './Toast';
export type {ToastOptions, ToastVariant, ToastPosition, ToastProviderProps} from './Toast/types';

export {default as BottomSheet} from './BottomSheet';
export type {BottomSheetProps} from './BottomSheet/types';

export {default as ActionSheet} from './ActionSheet';
export type {ActionSheetProps} from './ActionSheet/types';

export {default as AlertDialog} from './AlertDialog';
export type {AlertDialogProps} from './AlertDialog/types';

export {default as Modal} from './Modal';
export type {ModalProps} from './Modal/types';

// -- Calendar --
export {default as Calendar} from './Calendar';
export type {CalendarProps} from './Calendar/types';
