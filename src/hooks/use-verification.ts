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
  /**
   * `verification` is a change request the backend may not have shipped yet.
   * A `me` object WITHOUT the field means the server doesn't enforce the gate —
   * treating that as UNVERIFIED would lock every citizen out of participating,
   * with no way through (the verify endpoint wouldn't exist either). Only an
   * explicit status gates. The mock always sets it, so demos exercise the flow.
   */
  const enforced = me?.verification !== undefined;
  const status: VerificationStatus = me?.verification ?? 'UNVERIFIED';
  const isAdmin = me?.role === 'ADMIN';

  return {
    status,
    /** The gate. Submitting a request is not enough — only approval opens it. */
    canParticipate: isAdmin || !enforced || status === 'VERIFIED',
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
