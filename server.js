const express = require('express');
const axios = require('axios');
const moment = require('moment');

// Initialize app
const app = express();

// Middleware
app.use(express.json());

// Get Route
app.get('/api/rates', async (req, res) => {
    console.log('Query to endpoint: ', req.query);

    if(req.query.base && req.query.currency){
        // Initialize the results object
        let results = {};
        let currentDate = moment().format('YYYY-MM-DD');

        //Destructure base and currency from the req.query prop
        //and ensure they only allow Uppercased
        let {base, currency} = req.query;
        base = base.toUpperCase();
        currency = currency.toUpperCase();

        // Set params
        let params = { base, symbols: currency };

        try{
            let response = await axios.get('https://api.exchangeratesapi.io/latest', { params });

            //console.log(response.data);
            results.base = base;
            results.date = currentDate;
            results.rates = response.data.rates;
    
        }catch(error){
            console.error(`There was an error with the exchange call: ${error}`);
            console.error(error.response.status);
            console.error(error.response.data);

            if(error.response.data.error.startsWith('Base')){
                return res.status(400).send(error.response.data);
            }else if(error.response.data.error.startsWith('Symbols')){
                return res.status(400).send({ error:`The inputed currency of '${currency}' is NOT supported` });
            }else{
                return res.status(503).send({ error: 'This API must be called with base and currency query parameters',});
            }
        }

        return res.send({ results: results });

    }else{
        res.status(400).send({ error: `This API requires  base and currency parameters`});
    }
});

// Ensure validation of endpoint

app.all('/:identifer', (req, res) => {
    res.status(404).send({ error: 'Sorry the path to this endpoint does not exist' });
});

app.all('/', (req, res) => {
    res.status(404).send({ error: 'Sorry the path to this endpoint does not exist' })
});


//Environment Variable
let port = process.env.PORT || 3000;

// Server
app.listen(port, (error) => {
    if(error){
        console.error(error);
    }
    console.log(`Server started and listening on port: ${port}`);
});