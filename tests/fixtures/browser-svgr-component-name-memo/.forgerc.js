export default {
  target: 'browser',

  svgrComponentName(name) {
    return `Ui${name.slice(3)}Icon`;
  },
};
