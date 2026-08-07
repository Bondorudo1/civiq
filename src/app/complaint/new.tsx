import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { ComplaintCategory } from '@/api/types';
import { useCreateComplaint, useSpellcheck } from '@/api/hooks';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { WaterTexture } from '@/components/water-texture';
import { COMPLAINT_CATEGORY } from '@/constants/civic';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { VerifyGate } from '@/components/verify-gate';
import { useTheme } from '@/hooks/use-theme';
import { useVerification } from '@/hooks/use-verification';
import { shortRef } from '@/lib/id';

const CATEGORIES = Object.keys(COMPLAINT_CATEGORY) as ComplaintCategory[];

// Mirrors POST /api/complaints validation, so the form fails here instead of at 422/413.
const LIMITS = { title: 200, description: 4000, address: 255 };
const PHOTO_MAX_BYTES = 10 * 1024 * 1024;
const PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export default function NewComplaintScreen() {
  const c = useTheme();
  const [category, setCategory] = useState<ComplaintCategory | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = useCreateComplaint();
  const spell = useSpellcheck();
  const { canParticipate } = useVerification();

  const needsLocation = category ? COMPLAINT_CATEGORY[category].needsLocation : false;
  const canSubmit = !!category && title.trim().length >= 5 && description.trim().length >= 10;

  const pickPhoto = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.7 });
    if (res.canceled) return;
    const asset = res.assets[0];
    if (asset.mimeType && !PHOTO_TYPES.includes(asset.mimeType)) {
      setError('Sunt acceptate doar imagini JPEG, PNG sau WebP.');
      return;
    }
    if (asset.fileSize && asset.fileSize > PHOTO_MAX_BYTES) {
      setError('Fotografia depășește 10 MB. Alege una mai mică.');
      return;
    }
    setError(null);
    setPhoto(asset.uri);
  };

  const submit = () => {
    if (!canSubmit || !category) return;
    setError(null);
    create.mutate(
      {
        title: title.trim(),
        description: description.trim(),
        category,
        address: needsLocation && address.trim() ? address.trim() : null,
        photoUrl: photo,
      },
      {
        onSuccess: () => setSubmitted(true),
        onError: () => setError('Nu am putut trimite sesizarea. Verifică conexiunea și încearcă din nou.'),
      },
    );
  };

  if (submitted) {
    return (
      <View style={{ flex: 1, backgroundColor: c.background }}>
        <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
          <View style={styles.success}>
            <View style={styles.checkWrap}>
              <View style={styles.successMotif} pointerEvents="none">
                <WaterTexture width={220} height={200} color="#22A5BD" />
              </View>
              <Animated.View entering={ZoomIn.duration(420)} style={[styles.check, { backgroundColor: c.brand }]}>
                <Ionicons name="checkmark" size={42} color={c.onBrand} />
              </Animated.View>
            </View>
            <Text style={[styles.successTitle, { color: c.text }]}>Sesizarea a fost trimisă</Text>
            <Text style={[styles.successRef, { color: c.brand }]}>
              {create.data ? shortRef(create.data.id) : ''}
            </Text>
            <Text style={[styles.successMsg, { color: c.textSecondary }]}>
              Primăria răspunde în 30 de zile. Vei primi o notificare la fiecare schimbare de status.
            </Text>
            <View style={styles.successBtns}>
              <Button title="Vezi sesizările mele" icon="arrow-forward" onPress={() => router.replace('/contact')} />
              <Button title="Înapoi acasă" variant="secondary" onPress={() => router.replace('/')} />
            </View>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  // Gate before the form, not on submit — filling in a page you can't send is worse
  // than being told up front.
  if (!canParticipate) {
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
        <View style={styles.gate}>
          <VerifyGate action="depui o sesizare" />
        </View>
      </View>
    );
  }

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

        <Field
          label="Titlu"
          icon="pricetag-outline"
          placeholder="Pe scurt, care e problema?"
          value={title}
          onChangeText={setTitle}
          maxLength={LIMITS.title}
        />

        <View style={styles.group}>
          <Text style={[styles.label, { color: c.textSecondary }]}>Descriere</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Descrie problema: ce, unde, de când…"
            placeholderTextColor={c.textSecondary}
            underlineColorAndroid="transparent"
            maxLength={LIMITS.description}
            multiline
            style={[
              styles.textarea,
              { backgroundColor: c.brandWash, color: c.text },
              Platform.OS === 'web' ? ({ outlineStyle: 'none' } as object) : null,
            ]}
          />
          {/* POST /ai/spellcheck — pure string processing, nothing stored. */}
          <Pressable
            onPress={() =>
              spell.mutate(description, {
                onSuccess: setDescription,
                onError: () => setError('Corectarea nu e disponibilă acum. Poți trimite textul așa cum e.'),
              })
            }
            disabled={description.trim().length < 10 || spell.isPending}
            accessibilityRole="button"
            style={[styles.spell, { opacity: description.trim().length < 10 || spell.isPending ? 0.45 : 1 }]}>
            <Ionicons name="sparkles-outline" size={14} color={c.brand} />
            <Text style={[styles.spellText, { color: c.brand }]}>
              {spell.isPending ? 'Se verifică…' : 'Verifică textul'}
            </Text>
          </Pressable>
        </View>

        {needsLocation ? (
          <View style={styles.group}>
            <Text style={[styles.label, { color: c.textSecondary }]}>Locație</Text>
            <Field
              icon="location-outline"
              placeholder="Adresa (ex. str. Independenței 24)"
              value={address}
              onChangeText={setAddress}
              maxLength={LIMITS.address}
            />
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

        {error ? (
          <View style={[styles.error, { backgroundColor: c.accentWash, borderColor: c.accent }]}>
            <Ionicons name="alert-circle-outline" size={16} color={c.accentPressed} />
            <Text style={[styles.errorText, { color: c.accentPressed }]}>{error}</Text>
          </View>
        ) : null}

        {!canSubmit ? (
          <Text style={[styles.hint, { color: c.textSecondary }]}>
            Alege o categorie și completează titlul (min. 5 caractere) și descrierea (min. 10).
          </Text>
        ) : null}
        <Button
          title={create.isPending ? 'Se trimite…' : 'Trimite sesizarea'}
          icon="paper-plane-outline"
          onPress={submit}
          disabled={!canSubmit || create.isPending}
        />
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
  error: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
    paddingVertical: 10,
  },
  errorText: { flex: 1, fontFamily: Fonts.medium, fontSize: 12.5, lineHeight: 17 },
  gate: { padding: Spacing.four },
  spell: { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start', paddingVertical: 6 },
  spellText: { fontFamily: Fonts.semibold, fontSize: 12.5 },
  success: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.four },
  checkWrap: { width: 200, height: 190, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.two },
  successMotif: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', opacity: 0.7 },
  check: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0E7490',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  successTitle: { fontFamily: Fonts.bold, fontSize: 22, letterSpacing: -0.3, textAlign: 'center' },
  successRef: { fontFamily: Fonts.mono, fontSize: 15, marginTop: 3 },
  successMsg: { fontFamily: Fonts.regular, fontSize: 14, textAlign: 'center', lineHeight: 21, marginTop: Spacing.two, maxWidth: 300 },
  successBtns: { alignSelf: 'stretch', gap: Spacing.two, marginTop: Spacing.five },
});
