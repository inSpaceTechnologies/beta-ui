module.exports = {
  "extends": [
    "airbnb-base",
    "plugin:vue/recommended"
  ],
  "rules": {
    "no-param-reassign": [2, { "props": false }],
    'max-len': ['off'],
  },
  "env": {
    "browser": true,
    "node": true
  },
};
