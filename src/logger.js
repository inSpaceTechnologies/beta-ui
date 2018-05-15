/* eslint no-console: 0 */ // --> OFF

// TODO: get this from env
const debug = true;

export default {
  error: (message) => {
    if (debug) {
      console.error(message);
    }
  },
};
