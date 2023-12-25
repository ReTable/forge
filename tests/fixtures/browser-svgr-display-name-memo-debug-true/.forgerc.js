export default {
  target: 'browser',

  svgrDisplayName(name) {
    return {
      displayName: `forge(${name}DisplayName)`,
      isDebugOnly: true,
    };
  },
};
