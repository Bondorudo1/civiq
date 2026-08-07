import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { ComplaintCategory } from '@/api/types';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { COMPLAINT_CATEGORY } from '@/constants/civic';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const CATEGORIES = Object.keys(COMPLAINT_CATEGORY) as ComplaintCategory[];

export default function NewComplaintScreen() {
  const c = useTheme();
  const [category, setCategory] = useState<ComplaintCategory | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);

  const needsLocation = category ? COMPLAINT_CATEGORY[category].needsLocation : false;
  const canSubmit = !!category && title.trim().length >= 5 && description.trim().length >= 10;

  const pickPhoto = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.7 });
    if (!res.canceled) setPhoto(res.assets[0].uri);
  };

  // Foundation: no backend yet — just return. Real POST /complaints wires later.
  const submit = () => router.back();

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: c.brand }}>
        <View style={styles.bar}>
          <Pressable onPress={() => router.back()} hitSlop={12} accessibilityLabel="Înapoi">
            <Ionicons name="arrow-back" size={24} color={c.onBrand} />
          </Pressable>
          <Text style={[styles.barTitle, { color: c.onBrand }]}>Sesizare nouă</Text>
        </View>
      </SafeAreaView>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Text style={[styles.label, { color: c.textSecondary }]}>Categorie</Text>
        <View style={styles.cats}>
          {CATEGORIES.map((cat) => {
            const meta = COMPLAINT_CATEGORY[cat];
            const active = category === cat;
            return (
              <Pressable
                key={cat}
                onPress={() => setCategory(cat)}
                style={[styles.cat, { borderColor: active ? c.brand : c.line, backgroundColor: active ? c.brandWash : c.surface }]}>
                <Ionicons name={meta.icon} size={15} color={active ? c.brand : c.textSecondary} />
                <Text style={{ fontFamily: Fonts.semibold, fontSize: 12.5, color: active ? c.brand : c.text }}>{meta.label}</Text>
              </Pressable>
            );
          })}
        </View>

        <Field label="Titlu" icon="pricetag-outline" placeholder="Pe scurt, care e problema?" value={title} onChangeText={setTitle} />

        <View style={styles.group}>
          <Text style={[styles.label, { color: c.textSecondary }]}>Descriere</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Descrie problema: ce, unde, de când…"
            placeholderTextColor={c.textSecondary}
            multiline
            style={[styles.textarea, { backgroundColor: c.brandWash, color: c.text }]}
          />
        </View>

        {needsLocation ? (
          <View style={styles.group}>
            <Text style={[styles.label, { color: c.textSecondary }]}>Locație</Text>
            <Field icon="location-outline" placeholder="Adresa (ex. str. Independenței 24)" value={address} onChangeText={setAddress} />
            <View style={[styles.map, { backgroundColor: c.brandWash, borderColor: c.line }]}>
              <Ionicons name="map-outline" size={26} color={c.brand} />
              <Text style={[styles.mapText, { color: c.textSecondary }]}>Alege locația pe hartă</Text>
            </View>
          </View>
        ) : null}

        <View style={styles.group}>
          <Text style={[styles.label, { color: c.textSecondary }]}>Fotografie (opțional)</Text>
          {photo ? (
            <View style={styles.photoWrap}>
              <Image source={{ uri: photo }} style={styles.photo} contentFit="cover" />
              <Pressable onPress={() => setPhoto(null)} style={[styles.photoRemove, { backgroundColor: c.surface }]}>
                <Ionicons name="close" size={16} color={c.text} />
              </Pressable>
            </View>
          ) : (
            <Pressable onPress={pickPhoto} style={[styles.upload, { borderColor: c.line }]}>
              <Ionicons name="camera-outline" size={22} color={c.brand} />
              <Text style={[styles.uploadText, { color: c.textSecondary }]}>Adaugă o fotografie</Text>
            </Pressable>
          )}
        </View>

        {!canSubmit ? (
          <Text style={[styles.hint, { color: c.textSecondary }]}>
            Alege o categorie și completează titlul (min. 5 caractere) și descrierea (min. 10).
          </Text>
        ) : null}
        <Button title="Trimite sesizarea" icon="paper-plane-outline" onPress={submit} disabled={!canSubmit} />
      </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, paddingHorizontal: Spacing.three, paddingVertical: 12 },
  barTitle: { fontFamily: Fonts.semibold, fontSize: 18, letterSpacing: -0.2 },
  content: { padding: Spacing.four, gap: Spacing.three, paddingBottom: Spacing.six },
  label: { fontFamily: Fonts.medium, fontSize: 12.5, letterSpacing: 0.3 },
  group: { gap: Spacing.one },
  cats: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  cat: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 8 },
  textarea: {
    minHeight: 110,
    borderRadius: Radius.md,
    padding: Spacing.three,
    fontFamily: Fonts.regular,
    fontSize: 15,
    textAlignVertical: 'top',
  },
  map: {
    height: 120,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: Spacing.two,
  },
  mapText: { fontFamily: Fonts.medium, fontSize: 13 },
  upload: {
    height: 96,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  uploadText: { fontFamily: Fonts.medium, fontSize: 13 },
  photoWrap: { position: 'relative' },
  photo: { width: '100%', height: 160, borderRadius: Radius.md },
  photoRemove: { position: 'absolute', top: 8, right: 8, width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  hint: { fontFamily: Fonts.regular, fontSize: 12.5, lineHeight: 17, textAlign: 'center' },
});
