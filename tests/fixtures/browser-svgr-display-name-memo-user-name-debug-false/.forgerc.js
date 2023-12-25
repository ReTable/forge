export default {
  target: 'browser',

  svgrComponentName(name) {
    return `Ui${name.slice(3)}Icon`;
  },

  svgrDisplayName(name) {
    return {
      displayName: `forge(${name}DisplayName)`,
      isDebugOnly: false,
    };
  },
};
