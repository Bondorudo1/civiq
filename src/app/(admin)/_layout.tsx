import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { type ComponentProps } from 'react';

import { CivicTabBar } from '@/components/civic-tab-bar';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

/** The primărie shell: a work queue first, publishing second. */
const ADMIN_ICONS: Record<string, IoniconName> = {
  index: 'file-tray-full',
  proiecte: 'document-text',
  anunturi: 'megaphone',
  cont: 'person',
};

export default function AdminLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false, animation: 'shift' }}
      tabBar={(props) => <CivicTabBar {...props} icons={ADMIN_ICONS} />}>
      <Tabs.Screen name="index" options={{ title: 'Sesizări' }} />
      <Tabs.Screen name="proiecte" options={{ title: 'Proiecte' }} />
      <Tabs.Screen name="anunturi" options={{ title: 'Anunțuri' }} />
      <Tabs.Screen name="cont" options={{ title: 'Cont' }} />
    </Tabs>
  );
}
