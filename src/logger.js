/* eslint no-console: 0 */ // --> OFF

const debug = (process.env.NODE_ENV !== 'production');

export default {
  log: (message) => {
    if (debug) {
      console.log(message);
    }
  },
  error: (message) => {
    if (debug) {
      console.error(message);
    }
  },
};
