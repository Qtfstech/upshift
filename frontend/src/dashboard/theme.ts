// Validated categorical palette (fixed order — colour follows the campaign, never its rank).
const SERIES = ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#008300', '#4a3aa7', '#e34948'];

export interface ChartTheme {
  series: string[];
  other: string;
  surface: string;
  grid: string;
  axis: string;
  text: string;
  textMuted: string;
  accent: string;
}

const LIGHT: ChartTheme = {
  series: SERIES,
  other: '#a3a29c',
  surface: '#ffffff',
  grid: '#ebeae6',
  axis: '#d6d5cf',
  text: '#0b0b0b',
  textMuted: '#6b6a65',
  accent: '#2a78d6',
};

/** The dashboard is always light-themed, regardless of the OS setting. */
export function useChartTheme(): ChartTheme {
  return LIGHT;
}
