import { useMe } from '@/api/hooks';
import type { VerificationStatus } from '@/api/types';

/**
 * Who may act, not just read. Reading the city's business is open; commenting,
 * reacting and filing a complaint wait for the primărie's approval, so one
 * resident is one voice.
 *
 * Admins are participants by definition — they are the primărie.
 */
export function useVerification() {
  const { data: me } = useMe();
  const status: VerificationStatus = me?.verification ?? 'UNVERIFIED';
  const isAdmin = me?.role === 'ADMIN';

  return {
    status,
    /** The gate. Submitting a request is not enough — only approval opens it. */
    canParticipate: isAdmin || status === 'VERIFIED',
    /** A request is in the queue; the resident is waiting on an operator. */
    isPending: status === 'PENDING',
    isRejected: status === 'REJECTED',
  };
}

export const VERIFICATION_LABEL: Record<VerificationStatus, string> = {
  UNVERIFIED: 'Neverificat',
  PENDING: 'În verificare',
  VERIFIED: 'Verificat',
  REJECTED: 'Respins',
};
