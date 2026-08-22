// Doit rester aligné avec normaliser_telephone() dans MMA_BACKEND/main/views/common.py
const SEPARATEURS = /[\s.\-() ]/g;

/**
 * Normalise un numéro français vers ses 10 chiffres (ex: "0612345678").
 * Tolère les séparateurs usuels et les indicatifs +33 / 0033.
 * Retourne "" si la saisie est vide, null si le format n'est pas reconnu.
 */
export function normaliserTelephone(valeur: string | null | undefined): string | null {
  let brut = (valeur ?? "").replace(SEPARATEURS, "");
  if (!brut) return "";
  if (brut.startsWith("+33")) {
    brut = "0" + brut.slice(3);
  } else if (brut.startsWith("0033")) {
    brut = "0" + brut.slice(4);
  }
  return /^0[1-9]\d{8}$/.test(brut) ? brut : null;
}

/** Met un numéro en forme pour l'affichage : "06 12 34 56 78". */
export function formaterTelephone(valeur: string | null | undefined): string {
  const normalise = normaliserTelephone(valeur);
  if (!normalise) return valeur || "";
  return normalise.replace(/(\d{2})(?=\d)/g, "$1 ");
}
