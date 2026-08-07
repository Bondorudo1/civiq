import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { type ComponentProps } from 'react';

import { CivicTabBar } from '@/components/civic-tab-bar';
import { useT } from '@/i18n';
import { adminTabsText } from '@/i18n/adminTabs';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

/** The primărie shell: a work queue first, publishing second. */
const ADMIN_ICONS: Record<string, IoniconName> = {
  index: 'file-tray-full',
  proiecte: 'document-text',
  anunturi: 'megaphone',
  locuitori: 'shield-checkmark',
  cont: 'person',
};

export default function AdminLayout() {
  const t = useT(adminTabsText);

  return (
    <Tabs
      screenOptions={{ headerShown: false, animation: 'shift' }}
      tabBar={(props) => <CivicTabBar {...props} icons={ADMIN_ICONS} shell="admin" />}>
      <Tabs.Screen name="index" options={{ title: t.tabQueue }} />
      <Tabs.Screen name="proiecte" options={{ title: t.tabPosts }} />
      <Tabs.Screen name="anunturi" options={{ title: t.tabNotices }} />
      <Tabs.Screen name="locuitori" options={{ title: t.tabResidents }} />
      <Tabs.Screen name="cont" options={{ title: t.tabAccount }} />
    </Tabs>
  );
}
