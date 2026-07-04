/**
 * Screen Stubs
 *
 * 未实现的页面占位组件。使用 Screen 组件包裹，显示页面名称和"开发中"提示。
 * 当页面实现后，删除此处对应的 stub 并替换为真实页面导入。
 */

import React from 'react';
import {Text, View} from 'react-native';

import {Screen} from '@components';
import {useTheme} from '@theme';

interface StubProps {
  title: string;
  subtitle?: string;
}

/**
 * 创建标准页面占位组件
 */
const createStub = ({title, subtitle}: StubProps): React.FC => {
  const StubComponent: React.FC = () => {
    const {colors, typography} = useTheme();

    return (
      <Screen padded>
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Text
            style={{
              ...typography.titleL,
              color: colors.semantic.text.primary,
              marginBottom: 8,
            }}>
            {title}
          </Text>
          <Text
            style={{
              ...typography.bodyS,
              color: colors.semantic.text.tertiary,
            }}>
            {subtitle ?? '开发中'}
          </Text>
        </View>
      </Screen>
    );
  };
  StubComponent.displayName = title;
  return StubComponent;
};

// 页面级占位
export const NotebookCreate = createStub({title: '新建日记本'});
export const NotebookSort = createStub({title: '日记本排序'});
export const AlbumCreate = createStub({title: '新建专辑'});
export const Account = createStub({title: '账户管理'});
export const About = createStub({title: '关于'});
export const Recycle = createStub({title: '回收站'});
export const DarkMode = createStub({title: '深色模式'});
export const Export = createStub({title: '导出'});
export const VIP = createStub({title: '会员中心'});
export const Statistics = createStub({title: '统计'});
export const Drafts = createStub({title: '草稿箱'});
export const Preferences = createStub({title: '偏好设置'});
export const ListStyle = createStub({title: '列表样式'});
export const ThemeBackground = createStub({title: '主题背景'});
export const EditorToolbarPicker = createStub({title: '工具栏定制'});
export const FontManagement = createStub({title: '字体管理'});
export const AppLock = createStub({title: '应用锁'});
export const AppLockGesture = createStub({title: '手势密码'});
export const StickyNote = createStub({title: '便签'});