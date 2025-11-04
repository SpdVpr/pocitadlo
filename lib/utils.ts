export function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function formatHours(seconds: number): string {
  const hours = seconds / 3600;
  return hours.toFixed(2) + 'h';
}

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('cs-CZ', {
    style: 'currency',
    currency: 'CZK',
  }).format(amount);
}

export function parseTimeInput(input: string): number {
  if (input.includes(':')) {
    const [hours, minutes] = input.split(':').map(Number);
    return (hours * 3600) + (minutes * 60);
  }
  const hours = parseFloat(input);
  return Math.round(hours * 3600);
}

export function getCurrentMonthYear(): { month: number; year: number } {
  const now = new Date();
  return {
    month: now.getMonth() + 1,
    year: now.getFullYear(),
  };
}

export function getMonthName(month: number): string {
  const months = [
    'leden', 'únor', 'březen', 'duben', 'květen', 'červen',
    'červenec', 'srpen', 'září', 'říjen', 'listopad', 'prosinec'
  ];
  return months[month - 1];
}
