export default {
  expo: {
    name: 'ResearchFlow AI',
    slug: 'researchflow-ai',
    version: '1.0.0',
    orientation: 'portrait',
    userInterfaceStyle: 'dark',
    backgroundColor: '#0B0F14',
    platforms: ['ios', 'android', 'web'],
    web: { bundler: 'metro' },
    extra: {
      apiUrl: process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:8000',
    },
  },
};
