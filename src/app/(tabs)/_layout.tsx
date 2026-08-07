import { Tabs } from 'expo-router';

import { CivicTabBar } from '@/components/civic-tab-bar';
import { useT } from '@/i18n';
import { profileText } from '@/i18n/profile';

export default function TabsLayout() {
  const t = useT(profileText);

  return (
    <Tabs
      // Tabs are siblings, so the scenes shift along a shared horizontal axis
      // rather than stacking — matches the direction the tab bar itself implies.
      screenOptions={{ headerShown: false, animation: 'shift' }}
      tabBar={(props) => <CivicTabBar {...props} />}>
      <Tabs.Screen name="index" options={{ title: t.tabHome }} />
      <Tabs.Screen name="proiecte" options={{ title: t.tabProjects }} />
      <Tabs.Screen name="contact" options={{ title: t.tabComplaints }} />
      <Tabs.Screen name="profil" options={{ title: t.tabProfile }} />
    </Tabs>
  );
}
