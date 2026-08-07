import { Tabs } from 'expo-router';

import { CivicTabBar } from '@/components/civic-tab-bar';

export default function TabsLayout() {
  return (
    <Tabs
      // Tabs are siblings, so the scenes shift along a shared horizontal axis
      // rather than stacking — matches the direction the tab bar itself implies.
      screenOptions={{ headerShown: false, animation: 'shift' }}
      tabBar={(props) => <CivicTabBar {...props} />}>
      <Tabs.Screen name="index" options={{ title: 'Acasă' }} />
      <Tabs.Screen name="proiecte" options={{ title: 'Proiecte' }} />
      <Tabs.Screen name="contact" options={{ title: 'Sesizări' }} />
      <Tabs.Screen name="profil" options={{ title: 'Profil' }} />
    </Tabs>
  );
}
