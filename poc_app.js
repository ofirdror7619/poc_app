const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const {main} = require('./index');

const app = express();
const port = 3000;

app.use(cors());

app.use(bodyParser.json());


// Get all items
app.get('/', async (req, res) => {
    const {query} = req;
    console.log(query)
    const response = await main(query['alarmName'], query['region']);
    res.json(response);
    // res.send(query['agent'] + ' ' + query['region']);
});


app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});