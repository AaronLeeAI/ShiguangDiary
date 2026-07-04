/**
 * 导航容器
 *
 * 整个应用的路由结构：
 * - RootStack (NativeStack)
 *   - Splash (启动页)
 *   - MainTabs (BottomTabBar)
 *     - Home, Notebook, Album, Profile
 *   - Modal Stack (自上而下)
 *     - DiaryView, DiaryEdit, ... (全屏 Modal)
 *     - Dialogs (D001-D010 等弹层)
 */

import React, {useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator, type NativeStackNavigationProp} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';

import {useTheme} from '@theme';
import {Screen} from '@components';
import {ROUTES} from '@constants/routes';
import {RootStackParamList, TabParamList} from '@navigation/types';
import {AlbumScreen} from '@/screens/Album';
import {DiaryEditScreen} from '@/screens/DiaryEdit';
import {DiaryViewScreen} from '@/screens/DiaryView';
import {HomeScreen} from '@/screens/Home';
import {NotebookScreen} from '@/screens/Notebook';
import {ProfileScreen} from '@/screens/Profile';
import {SearchScreen} from '@/screens/Search';
import {
  NotebookCreate,
  NotebookSort,
  AlbumCreate,
  Account,
  About,
  Recycle,
  DarkMode,
  Export,
  VIP,
  Statistics,
  Drafts,
  Preferences,
  ListStyle,
  ThemeBackground,
  EditorToolbarPicker,
  FontManagement,
  AppLock,
  AppLockGesture,
  StickyNote,
} from './stubs';

// Splash：自动跳转到 MainTabs（1.5s 后）
const Splash = ({navigation}: {navigation: NativeStackNavigationProp<RootStackParamList, 'Splash'>}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace(ROUTES.MAIN_TABS);
    }, 1500);
    return () => clearTimeout(timer);
  }, [navigation]);

  return <Screen style={{justifyContent: 'center', alignItems: 'center'}} />;
};

// 4 Tab + DiaryView + DiaryEdit + Search 已实现
const Home = HomeScreen;
const Notebook = NotebookScreen;
const Album = AlbumScreen;
const Profile = ProfileScreen;
const Search = SearchScreen;
const DiaryView = DiaryViewScreen;
const DiaryEdit = DiaryEditScreen;

// Stack Navigator
const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

// Tab Navigator
function MainTabs() {
  const {colors} = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: colors.brand.primary,
        tabBarInactiveTintColor: colors.semantic.icon.tertiary,
        tabBarStyle: {
          backgroundColor: colors.semantic.bg.bottomTab,
          borderTopColor: colors.semantic.border.default,
          borderTopWidth: 0.5,
        },
      }}>
      <Tab.Screen name={ROUTES.HOME} component={Home} />
      <Tab.Screen name={ROUTES.NOTEBOOK} component={Notebook} />
      <Tab.Screen name={ROUTES.ALBUM} component={Album} />
      <Tab.Screen name={ROUTES.PROFILE} component={Profile} />
    </Tab.Navigator>
  );
}

// Root Navigator
export function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}>
        <Stack.Screen name={ROUTES.SPLASH} component={Splash} />
        <Stack.Screen name={ROUTES.MAIN_TABS} component={MainTabs} />

        {/* Full Screen Modals */}
        <Stack.Screen name={ROUTES.SEARCH} component={Search} />
        <Stack.Screen name={ROUTES.DIARY_VIEW} component={DiaryView} />
        <Stack.Screen name={ROUTES.DIARY_EDIT} component={DiaryEdit} />
        <Stack.Screen name={ROUTES.NOTEBOOK_CREATE} component={NotebookCreate} />
        <Stack.Screen name={ROUTES.NOTEBOOK_SORT} component={NotebookSort} />
        <Stack.Screen name={ROUTES.ALBUM_CREATE} component={AlbumCreate} />
        <Stack.Screen name={ROUTES.ACCOUNT} component={Account} />
        <Stack.Screen name={ROUTES.ABOUT} component={About} />
        <Stack.Screen name={ROUTES.RECYCLE} component={Recycle} />
        <Stack.Screen name={ROUTES.DARK_MODE} component={DarkMode} />
        <Stack.Screen name={ROUTES.EXPORT} component={Export} />
        <Stack.Screen name={ROUTES.VIP} component={VIP} />
        <Stack.Screen name={ROUTES.STATISTICS} component={Statistics} />
        <Stack.Screen name={ROUTES.DRAFTS} component={Drafts} />
        <Stack.Screen name={ROUTES.PREFERENCES} component={Preferences} />
        <Stack.Screen name={ROUTES.LIST_STYLE} component={ListStyle} />
        <Stack.Screen name={ROUTES.THEME_BACKGROUND} component={ThemeBackground} />
        <Stack.Screen name={ROUTES.EDITOR_TOOLBAR_PICKER} component={EditorToolbarPicker} />
        <Stack.Screen name={ROUTES.FONT_MANAGEMENT} component={FontManagement} />
        <Stack.Screen name={ROUTES.APP_LOCK} component={AppLock} />
        <Stack.Screen name={ROUTES.APP_LOCK_GESTURE} component={AppLockGesture} />
        <Stack.Screen name={ROUTES.STICKY_NOTE} component={StickyNote} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default AppNavigator;