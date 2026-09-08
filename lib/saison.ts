// Doit rester aligné avec _saison_courante() dans MMA_BACKEND/main/views/common.py :
// la saison court du 1er septembre au 31 août.

/** Saison en cours, au format "2025-2026". */
export function saisonCourante(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1; // 1-12

  // De septembre à décembre on est dans la saison qui commence cette année,
  // de janvier à août dans celle commencée l'année précédente.
  return month >= 9 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
}
