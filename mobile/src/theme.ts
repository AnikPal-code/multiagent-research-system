import { Platform } from 'react-native';

export const colors = {
  bg: '#0B0F14',
  surface: '#131922',
  surfaceRaised: '#1B2330',
  border: '#232C3A',
  accent: '#F2A93B', // amber signal — active / in-progress
  accentSoft: 'rgba(242,169,59,0.14)',
  pulse: '#4FD1C5', // teal — completed stage
  pulseSoft: 'rgba(79,209,197,0.14)',
  error: '#EB5757',
  errorSoft: 'rgba(235,87,87,0.14)',
  text: '#E8EDF2',
  textMuted: '#7C8B9C',
  textFaint: '#4A5568',
};

export const fonts = {
  mono: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'Courier New' }),
  display: Platform.select({ ios: 'System', android: 'sans-serif-medium', default: 'System' }),
  body: Platform.select({ ios: 'System', android: 'sans-serif', default: 'System' }),
};

export const spacing = (n: number) => n * 8;

export const radius = {
  sm: 6,
  md: 12,
  lg: 20,
};
