/**
 * Profile Screen - P004 个人中心
 *
 * 整合组件：
 * - TopBar：标题"我的"
 * - Avatar：用户头像
 * - 统计栏：日记数 / 日记本数 / 相册数
 * - 设置菜单：点击跳转到对应页面
 * - BottomTabBar
 */

import React, {useCallback, useEffect, useMemo} from 'react';
import {Pressable, ScrollView, Text, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {Avatar} from '@/components/Avatar';
import {BottomTabBar} from '@/components/BottomTabBar';
import {Icon} from '@/components/Icon';
import {TopBar} from '@/components/TopBar';
import {ROUTES} from '@constants/routes';
import {colors, spacing} from '@theme';
import {useDiaryStore} from '@store/diaryStore';

import {styles} from './styles';
import type {ProfileMenuItem, ProfileScreenProps} from './types';

const MENU_GROUPS: ProfileMenuItem[][] = [
  [
    {key: 'recycle', label: '回收站', icon: 'recycle', showArrow: true, route: 'Recycle'},
    {key: 'drafts', label: '草稿箱', icon: 'edit', showArrow: true, route: 'Drafts'},
    {key: 'statistics', label: '数据统计', icon: 'chart', showArrow: true, route: 'Statistics'},
  ],
  [
    {key: 'darkmode', label: '深色模式', icon: 'moon', showArrow: true, route: 'DarkMode'},
    {key: 'preferences', label: '偏好设置', icon: 'tune', showArrow: true, route: 'Preferences'},
    {key: 'liststyle', label: '列表样式', icon: 'list', showArrow: true, route: 'ListStyle'},
    {key: 'theme-bg', label: '主题背景', icon: 'image', showArrow: true, route: 'ThemeBackground'},
  ],
  [
    {key: 'export', label: '导出与备份', icon: 'export', showArrow: true, route: 'Export'},
    {key: 'about', label: '关于拾光日记', icon: 'doc', showArrow: true, route: 'About'},
  ],
];

/**
 * ProfileScreen 组件
 */
export const ProfileScreen: React.FC<ProfileScreenProps> = ({navigation}) => {
  const insets = useSafeAreaInsets();

  // 从 store 读取真实数据
  const diaries = useDiaryStore(s => s.diaries);
  const notebooks = useDiaryStore(s => s.notebooks);
  const albums = useDiaryStore(s => s.albums);
  const initialized = useDiaryStore(s => s.initialized);
  const init = useDiaryStore(s => s.init);

  useEffect(() => {
    if (!initialized) init();
  }, [initialized, init]);

  const stats = useMemo(
    () => [
      {label: '日记', value: diaries.length},
      {label: '日记本', value: notebooks.length},
      {label: '相册', value: albums.length},
    ],
    [diaries.length, notebooks.length, albums.length],
  );

  const handleItemPress = useCallback(
    (item: ProfileMenuItem) => {
      if (item.onPress) {
        item.onPress();
        return;
      }
      if (item.route) {
        navigation.navigate(item.route as never);
      }
    },
    [navigation],
  );

  const handleEditProfile = useCallback(() => {
    navigation.navigate(ROUTES.ACCOUNT);
  }, [navigation]);

  const handleTabPress = useCallback(
    (tab: 'Home' | 'Notebook' | 'Album' | 'Profile') => {
      if (tab === 'Profile') return;
      navigation.navigate(ROUTES.MAIN_TABS, {screen: tab});
    },
    [navigation],
  );

  return (
    <View style={[styles.container, {paddingTop: insets.top}]}>
      <TopBar title="我的" />

      <ScrollView style={styles.body} contentContainerStyle={styles.scrollContent}>
        {/* 用户卡片 */}
        <View style={styles.userCard}>
          <Avatar size="large" name="拾光" />
          <Text style={styles.userName}>拾光日记</Text>
          <Text style={styles.userBio}>记录每一个值得记住的瞬间</Text>
          <Pressable
            onPress={handleEditProfile}
            style={({pressed}) => [styles.editButton, pressed && {opacity: 0.6}]}>
            <Text style={styles.editButtonText}>编辑资料</Text>
          </Pressable>
        </View>

        {/* 统计 */}
        <View style={styles.statsRow}>
          {stats.map((s, idx) => (
            <React.Fragment key={s.label}>
              {idx > 0 && <View style={styles.statDivider} />}
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            </React.Fragment>
          ))}
        </View>

        {/* 菜单组 */}
        {MENU_GROUPS.map((group, gIdx) => (
          <View key={`group-${gIdx}`} style={styles.menuGroup}>
            {group.map((item, iIdx) => (
              <Pressable
                key={item.key}
                onPress={() => handleItemPress(item)}
                style={({pressed}) => [
                  styles.menuItem,
                  iIdx === group.length - 1 && styles.menuItemLast,
                  pressed && {backgroundColor: colors.semantic.bg.subtle},
                ]}>
                <View style={styles.menuIcon}>
                  <Icon
                    name={item.icon}
                    size={22}
                    color={item.destructive ? colors.func.danger : colors.semantic.icon.primary}
                  />
                </View>
                <Text
                  style={[
                    styles.menuLabel,
                    item.destructive && styles.menuLabelDestructive,
                  ]}>
                  {item.label}
                </Text>
                {!!item.hint && <Text style={styles.menuHint}>{item.hint}</Text>}
                {item.showArrow !== false && (
                  <View style={styles.menuArrow}>
                    <Icon
                      name="chevronRight"
                      size={16}
                      color={colors.semantic.icon.tertiary}
                    />
                  </View>
                )}
              </Pressable>
            ))}
          </View>
        ))}
      </ScrollView>

      <BottomTabBar currentTab="Profile" onTabPress={handleTabPress} />
    </View>
  );
};

export default ProfileScreen;