export function roundWeightKg(value: number): number {
  return Math.round(value * 100) / 100;
}

export function formatWeightKg(value: number): string {
  return roundWeightKg(value).toFixed(2);
}

export function formatWeightDisplay(value: number): string {
  return `${formatWeightKg(value)} kg`;
}
