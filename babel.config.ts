export default function (api: any) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin',
      [
        'module-resolver',
        {
          alias: {
            '@react-three/drei': './node_modules/@react-three/drei/native/index.js',
            '@/*': ['./'],
            '@/components/*': ['./components/*'],
            '@/utils/*': ['./utils/*'],
            '@/store/*': ['./store/*'],
            '@/types/*': ['./types/*'],
            '@/data/*': ['./data/*'],
          },
        },
      ],
    ],
  };
};
