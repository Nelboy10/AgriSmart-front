// utils/dateUtils.ts
export function getNextFriday(): Date {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 (dimanche) à 6 (samedi)
  
  // Calculer le nombre de jours jusqu'au vendredi prochain
  let daysUntilFriday = 6 - dayOfWeek;
  if (daysUntilFriday <= 0) {
    daysUntilFriday += 7;
  }
  
  const nextFriday = new Date(today);
  nextFriday.setDate(today.getDate() + daysUntilFriday);
  return nextFriday;
}

export function getDayOfWeek(date: Date): string {
  const days = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
  return days[date.getDay()];
}