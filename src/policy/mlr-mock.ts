// Mock for the Shaman MLR (Medical Legal Regulatory) document store.
// In production this would be a remote API: `fetchApprovalCode(mlrDocumentId)`.

const DOCS: Record<string, string> = {
  mlr_uk_scemblix_2026_q2: 'UK | 2026-05 | SCEM-12345',
  mlr_uk_scemblix_2026_q1: 'UK | 2026-02 | SCEM-12099',
};

export function resolveApprovalCode(mlrDocumentId: string | null): string | null {
  if (!mlrDocumentId) return null;
  return DOCS[mlrDocumentId] ?? null;
}
