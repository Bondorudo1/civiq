import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAdminCreatePost } from '@/api/hooks';
import type { Locale, PostType } from '@/api/types';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { POST_TYPE } from '@/constants/civic';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useLocale, useT } from '@/i18n';
import { adminDetailText } from '@/i18n/adminDetail';

const TYPES = Object.keys(POST_TYPE) as PostType[];

// Mirrors POST /api/admin/posts validation.
const LIMITS = { title: 200, body: 20000 };
const IMAGE_MAX_BYTES = 10 * 1024 * 1024;
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export default function AdminNewPostScreen() {
  const c = useTheme();
  const t = useT(adminDetailText);
  const loc = useLocale();
  const create = useAdminCreatePost();

  const [type, setType] = useState<PostType | null>(null);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [lang, setLang] = useState<Locale>('ro');
  const [image, setImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = !!type && title.trim().length >= 3 && body.trim().length >= 1;

  const pickImage = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.7 });
    if (res.canceled) return;
    const asset = res.assets[0];
    if (asset.mimeType && !IMAGE_TYPES.includes(asset.mimeType)) {
      setError(t.imageTypeError);
      return;
    }
    if (asset.fileSize && asset.fileSize > IMAGE_MAX_BYTES) {
      setError(t.imageSizeError);
      return;
    }
    setError(null);
    setImage(asset.uri);
  };

  const submit = () => {
    if (!canSubmit || !type) return;
    setError(null);
    create.mutate(
      { title: title.trim(), body: body.trim(), type, lang, imageUrl: image },
      {
        onSuccess: () => router.back(),
        onError: () => setError(t.publishPostFailed),
      },
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: c.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: c.brandDeep }}>
        <View style={styles.bar}>
          <Pressable onPress={() => router.back()} hitSlop={12} accessibilityLabel={t.back}>
            <Ionicons name="arrow-back" size={24} color={c.onBrand} />
          </Pressable>
          <Text style={[styles.barTitle, { color: c.onBrand }]}>{t.newPostBar}</Text>
        </View>
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={[styles.notice, { backgroundColor: c.brandWash, borderColor: c.brand }]}>
          <Ionicons name="people-outline" size={16} color={c.brand} />
          <Text style={[styles.noticeText, { color: c.brand }]}>{t.publicNotice}</Text>
        </View>

        <Text style={[styles.label, { color: c.textSecondary }]}>{t.fieldType}</Text>
        <View style={styles.chips}>
          {TYPES.map((pt) => {
            const meta = POST_TYPE[pt];
            const active = type === pt;
            return (
              <Pressable
                key={pt}
                onPress={() => setType(pt)}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                style={[styles.chip, { borderColor: active ? c.brand : c.line, backgroundColor: active ? c.brandWash : c.surface }]}>
                <Ionicons name={meta.icon} size={15} color={active ? c.brand : c.textSecondary} />
                <Text style={{ fontFamily: Fonts.semibold, fontSize: 12.5, color: active ? c.brand : c.text }}>
                  {meta.label[loc]}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Field
          label={t.fieldTitle}
          icon="pricetag-outline"
          placeholder={t.titlePlaceholder}
          value={title}
          onChangeText={setTitle}
          maxLength={LIMITS.title}
        />

        <View style={styles.group}>
          <Text style={[styles.label, { color: c.textSecondary }]}>{t.fieldBody}</Text>
          <TextInput
            value={body}
            onChangeText={setBody}
            placeholder={t.bodyPlaceholder}
            placeholderTextColor={c.textSecondary}
            underlineColorAndroid="transparent"
            maxLength={LIMITS.body}
            multiline
            style={[
              styles.textarea,
              { backgroundColor: c.brandWash, color: c.text },
              Platform.OS === 'web' ? ({ outlineStyle: 'none' } as object) : null,
            ]}
          />
        </View>

        <View style={styles.group}>
          <Text style={[styles.label, { color: c.textSecondary }]}>{t.originalLanguage}</Text>
          <View style={styles.chips}>
            {(['ro', 'ru'] as Locale[]).map((l) => {
              const active = lang === l;
              return (
                <Pressable
                  key={l}
                  onPress={() => setLang(l)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  style={[styles.chip, { borderColor: active ? c.brand : c.line, backgroundColor: active ? c.brandWash : c.surface }]}>
                  <Text style={{ fontFamily: Fonts.semibold, fontSize: 12.5, color: active ? c.brand : c.text }}>
                    {l === 'ro' ? t.langRo : t.langRu}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.group}>
          <Text style={[styles.label, { color: c.textSecondary }]}>{t.imageOptional}</Text>
          {image ? (
            <View style={styles.photoWrap}>
              <Image source={{ uri: image }} style={styles.photo} contentFit="cover" />
              <Pressable onPress={() => setImage(null)} style={[styles.photoRemove, { backgroundColor: c.surface }]}>
                <Ionicons name="close" size={16} color={c.text} />
              </Pressable>
            </View>
          ) : (
            <Pressable onPress={pickImage} style={[styles.upload, { borderColor: c.line }]}>
              <Ionicons name="image-outline" size={22} color={c.brand} />
              <Text style={[styles.uploadText, { color: c.textSecondary }]}>{t.addImage}</Text>
            </Pressable>
          )}
        </View>

        {error ? <Text style={[styles.hint, { color: c.accentPressed }]}>{error}</Text> : null}
        {!canSubmit ? (
          <Text style={[styles.hint, { color: c.textSecondary }]}>{t.incompleteHint}</Text>
        ) : null}

        <Button
          title={create.isPending ? t.publishing : t.publishPost}
          icon="megaphone-outline"
          onPress={submit}
          disabled={!canSubmit || create.isPending}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, paddingHorizontal: Spacing.three, paddingVertical: 12 },
  barTitle: { fontFamily: Fonts.semibold, fontSize: 18, letterSpacing: -0.2 },
  content: { padding: Spacing.four, gap: Spacing.three, paddingBottom: Spacing.six },
  label: { fontFamily: Fonts.medium, fontSize: 12.5, letterSpacing: 0.3 },
  group: { gap: Spacing.one },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 8 },
  textarea: {
    minHeight: 150,
    borderRadius: Radius.md,
    padding: Spacing.three,
    fontFamily: Fonts.regular,
    fontSize: 15,
    textAlignVertical: 'top',
  },
  upload: { height: 96, borderRadius: Radius.md, borderWidth: 1, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', gap: 6 },
  uploadText: { fontFamily: Fonts.medium, fontSize: 13 },
  photoWrap: { position: 'relative' },
  photo: { width: '100%', height: 160, borderRadius: Radius.md },
  photoRemove: { position: 'absolute', top: 8, right: 8, width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  notice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
    paddingVertical: 10,
  },
  noticeText: { flex: 1, fontFamily: Fonts.medium, fontSize: 12.5, lineHeight: 17 },
  hint: { fontFamily: Fonts.medium, fontSize: 12.5, lineHeight: 17, textAlign: 'center' },
});
