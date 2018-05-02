const express = require('express');
const app = express();

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.send('<script src="bundle.js"></script>Hello World.');
});

app.listen(3001, () => {
  console.log('Express listening on port 3001.');
});
