const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());

app.use(bodyParser.json());


// Get all items
app.get('/', (req, res) => {
    const { query } = req;
    res.send(query['agent'] + ' ' + query['region']);
});


app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});