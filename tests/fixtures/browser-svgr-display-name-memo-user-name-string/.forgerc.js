export default {
  target: 'browser',

  svgrComponentName(name) {
    return `Ui${name.slice(3)}Icon`;
  },

  svgrDisplayName(name) {
    return `forge(${name}DisplayName)`;
  },
};
