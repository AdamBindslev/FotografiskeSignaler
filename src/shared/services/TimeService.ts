/**
 * TimeService.ts - Fælles tidsstyring og datoformatering for Fotografiske Signaler (§9.2)
 */

export type TimeListener = (date: Date) => void;

export class TimeService {
  private static currentDate: Date = new Date();
  private static listeners: Set<TimeListener> = new Set();

  public static getDate(): Date {
    return new Date(this.currentDate.getTime());
  }

  public static setDate(d: Date): void {
    this.currentDate = new Date(d.getTime());
    this.notifyListeners();
  }

  public static setTimeToNow(): void {
    this.setDate(new Date());
  }

  public static subscribe(listener: TimeListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private static notifyListeners(): void {
    const d = this.getDate();
    this.listeners.forEach((listener) => {
      try {
        listener(d);
      } catch (err) {
        console.error('Fejl i time listener:', err);
      }
    });
  }

  public static formatTime(date: Date | null | undefined): string {
    if (!date || isNaN(date.getTime())) return '--:--';
    const h = String(date.getHours()).padStart(2, '0');
    const m = String(date.getMinutes()).padStart(2, '0');
    return `${h}:${m}`;
  }

  public static formatDateDanish(date: Date): string {
    const days = ['Søndag', 'Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag'];
    const months = ['jan', 'feb', 'mar', 'apr', 'maj', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];
    const dayName = days[date.getDay()];
    const dayNum = date.getDate();
    const monthName = months[date.getMonth()];
    return `${dayName} d. ${dayNum}. ${monthName}`;
  }

  public static formatShortDate(date: Date): string {
    const days = ['Søn', 'Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør'];
    const months = ['jan', 'feb', 'mar', 'apr', 'maj', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];
    return `${days[date.getDay()]} ${date.getDate()}. ${months[date.getMonth()]}`;
  }

  public static formatDuration(ms: number): string {
    if (isNaN(ms) || ms < 0) ms = 0;
    const totalMinutes = Math.round(ms / 60000);
    if (totalMinutes < 1) return 'under 1 min';
    if (totalMinutes < 60) return `${totalMinutes} min`;
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    if (hours < 24) {
      if (mins === 0) return hours === 1 ? '1 time' : `${hours} timer`;
      return hours === 1 ? `1 t. ${mins} min` : `${hours} t. ${mins} min`;
    }
    const days = Math.floor(hours / 24);
    const remH = Math.round(hours % 24);
    if (days === 1) {
      return remH > 0 ? `1 d. ${remH} t.` : '1 dag';
    }
    return `${days} dage`;
  }
}
