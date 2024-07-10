export default function calculerAjustementEPI(
  EPIJoueur: number,
  MMRJoueur: number,
  estGagnant: number
): number {
  const baseEPI = 10;
  const maxPerteEPI = 30;
  const cibleEPI = MMRJoueur / 2;
  const differenceEPI = cibleEPI - EPIJoueur;
  let ajustement: number;

  if (estGagnant === 1) {
    ajustement = baseEPI + 5 + Math.abs(differenceEPI) / 10;
    ajustement = Math.min(ajustement, baseEPI * 3); // prend le plus petit
  } else {
    ajustement = -baseEPI - Math.abs(differenceEPI) / 20;
    ajustement = Math.max(ajustement, -maxPerteEPI); // prend le plus grand
  }

  const EPIAjuste = Math.round(EPIJoueur + ajustement);
  return EPIAjuste;
}
