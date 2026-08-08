/**
 * HTTP client for API Rev 3.
 *
 * Owns the three things every call needs and no screen should think about:
 * the bearer token, snake_case ↔ camelCase at the boundary, and the unified
 * `{ code, message, fields }` error envelope.
 */

import { Platform } from 'react-native';

import type { ApiError } from './types';

/**
 * `localhost` only resolves to the dev machine on an emulator — a phone running
 * Expo Go needs the machine's LAN address. Set EXPO_PUBLIC_API_URL in .env
 * (e.g. http://192.168.1.20:8000/api); Expo inlines it at bundle time.
 */
export const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000/api';

let authToken: string | null = null;

/** Called by the auth store; the client never imports the store (that would cycle). */
export function setAuthToken(token: string | null) {
  authToken = token;
}

const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

const snakeToCamel = (s: string) => s.replace(/_([a-z0-9])/g, (_, ch: string) => ch.toUpperCase());
const camelToSnake = (s: string) => s.replace(/[A-Z]/g, (ch) => `_${ch.toLowerCase()}`);

function convertKeys<T>(value: unknown, map: (key: string) => string): T {
  if (Array.isArray(value)) return value.map((v) => convertKeys(v, map)) as T;
  if (isPlainObject(value)) {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) out[map(k)] = convertKeys(v, map);
    return out as T;
  }
  return value as T;
}

export const toCamel = <T>(value: unknown): T => convertKeys<T>(value, snakeToCamel);
export const toSnake = <T>(value: unknown): T => convertKeys<T>(value, camelToSnake);

/** The paged envelope every list endpoint returns. */
export type Page<T> = { items: T[]; total: number; page: number; size: number; pages: number };

type Query = Record<string, string | number | boolean | undefined | null>;

function buildUrl(path: string, query?: Query): string {
  const url = `${BASE_URL}${path}`;
  if (!query) return url;
  const params = Object.entries(query)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${encodeURIComponent(camelToSnake(k))}=${encodeURIComponent(String(v))}`);
  return params.length ? `${url}?${params.join('&')}` : url;
}

function headers(extra?: Record<string, string>): Record<string, string> {
  return {
    Accept: 'application/json',
    ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    ...extra,
  };
}

async function toError(res: Response): Promise<ApiError> {
  try {
    const raw = (await res.json()) as Record<string, unknown>;
    if (raw && typeof raw.code === 'string') return toCamel<ApiError>(raw);
  } catch {
    // Non-JSON body (a proxy error page, say) — fall through to a generic shape.
  }
  return { code: res.status === 401 ? 'UNAUTHORIZED' : 'INTERNAL', message: `HTTP ${res.status}` };
}

async function parse<T>(res: Response): Promise<T> {
  if (!res.ok) throw await toError(res);
  if (res.status === 204) return undefined as T;
  const text = await res.text();
  if (!text) return undefined as T;
  return toCamel<T>(JSON.parse(text));
}

export async function get<T>(path: string, query?: Query): Promise<T> {
  return parse<T>(await fetch(buildUrl(path, query), { headers: headers() }));
}

export async function send<T>(
  method: 'POST' | 'PATCH' | 'DELETE',
  path: string,
  body?: unknown,
  query?: Query,
): Promise<T> {
  return parse<T>(
    await fetch(buildUrl(path, query), {
      method,
      headers: headers(body === undefined ? undefined : { 'Content-Type': 'application/json' }),
      body: body === undefined ? undefined : JSON.stringify(toSnake(body)),
    }),
  );
}

const EXT_BY_MIME: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

/**
 * A filename with a real extension: Android content:// URIs end in an opaque id,
 * and a data: uri's "last segment" is the whole base64 payload — megabytes of it,
 * inside a multipart header. Derive the extension from the mime type instead.
 */
function fileName(uri: string, mime: string): string {
  const ext = EXT_BY_MIME[mime] ?? 'jpg';
  if (uri.startsWith('data:')) return `photo.${ext}`;
  const last = (uri.split('/').pop() ?? 'upload').split(/[?#]/)[0];
  if (last.length > 0 && last.length <= 100 && /\.[a-z0-9]{2,5}$/i.test(last)) return last;
  return `photo.${ext}`;
}

/** Complaints and posts take multipart because they carry an image. */
export async function sendForm<T>(
  method: 'POST' | 'PATCH',
  path: string,
  fields: Record<string, string | number | undefined | null>,
  file?: { field: string; uri: string; mimeType?: string } | null,
): Promise<T> {
  const form = new FormData();
  for (const [k, v] of Object.entries(fields)) {
    if (v !== undefined && v !== null && v !== '') form.append(camelToSnake(k), String(v));
  }
  if (file) {
    const mime = file.mimeType ?? 'image/jpeg';
    const name = fileName(file.uri, mime);
    if (Platform.OS === 'web') {
      // The browser's FormData needs a real Blob — appending RN's {uri,name,type}
      // object stringifies it to "[object Object]" and the server never gets a file.
      // The picker's blob:/data: uri is fetchable locally.
      const blob = await (await fetch(file.uri)).blob();
      form.append(file.field, new File([blob], name, { type: blob.type || mime }));
    } else {
      // RN's FormData takes this shape for files; the cast keeps TS's DOM types happy.
      form.append(file.field, { uri: file.uri, name, type: mime } as unknown as Blob);
    }
  }
  return parse<T>(await fetch(buildUrl(path), { method, headers: headers(), body: form }));
}

/**
 * List endpoints are paged; the MVP asks for one large page rather than adding
 * infinite scroll to every screen. Revisit if a real deployment outgrows it.
 */
export const PAGE_SIZE = 100;

export const items = <T>(page: Page<T>): T[] => page?.items ?? [];
