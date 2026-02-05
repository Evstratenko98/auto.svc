export type TermResult = {
  term: number;
  termUnit: 'month' | 'day';
};

/*
 * Parses an ISO 8601 period string (e.g., "P1Y2M10D") and converts it to a term and term unit.
 */
export const parsePeriodToTerm = (period: string): TermResult | null => {
  if (!period || typeof period !== 'string') return null;

  const regex = /^P(?:(\d+)Y)?(?:(\d+)M)?(?:(\d+)D)?$/;
  const match = period.match(regex);

  if (!match) return null;

  const years = parseInt(match[1] || '0', 10);
  const months = parseInt(match[2] || '0', 10);
  const days = parseInt(match[3] || '0', 10);

  if (months > 0 || years > 0) {
    const totalMonths = years * 12 + months;

    return {
      term: totalMonths,
      termUnit: 'month',
    };
  }

  if (days > 0) {
    return {
      term: days,
      termUnit: 'day',
    };
  }

  return null;
};
