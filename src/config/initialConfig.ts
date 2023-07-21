export const initialConfig = {
  entry: 'index',

  check: true,
  typings: true,

  build: {
    production: true,
  },

  watch: {
    production: false,
    storybook: true,
  },
};

const defaultConfig = {
  entries: ['index'],

  production: false,
  check: true,
  typings: true,
  storybook: false,
};

export const defaultBuildConfig = {
  ...defaultConfig,

  production: true,
};

export const defaultWatchConfig = {
  ...defaultConfig,

  production: false,
};
