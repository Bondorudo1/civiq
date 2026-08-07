import { Tabs } from 'expo-router';

import { CivicTabBar } from '@/components/civic-tab-bar';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={(props) => <CivicTabBar {...props} />}>
      <Tabs.Screen name="index" options={{ title: 'Acasă' }} />
      <Tabs.Screen name="proiecte" options={{ title: 'Proiecte' }} />
      <Tabs.Screen name="contact" options={{ title: 'Sesizări' }} />
      <Tabs.Screen name="profil" options={{ title: 'Profil' }} />
    </Tabs>
  );
}
