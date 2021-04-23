const express = require('express');

const app = express();

app.get('*', (_, res) => res.send('Hello World!'));

const { PORT } = process.env;

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});