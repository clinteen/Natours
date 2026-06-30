const { resolvePtr } = require('dns');
const fs = require('fs');
const http = require('http');
const url = require('url');
const express = require('express');


const requested_page = (TempPage, key) => {
    let output = TempPage.replace(/{IMAGE}/g, key.image);
    output = output.replace(/{DESCRIPTION}/g, key.description);
    output = output.replace(/{PRODUCTNAME}/g, key.productName);
    output = output.replace(/{QUANTITY}/g, key.quantity);
    output = output.replace(/{FROM}/g, key.from);
    output = output.replace(/{NUTRIENTS}/g, key.nutrients);
    output = output.replace(/{PRICE}/g, key.price);
    output = output.replace(/{ID}/g, key.id)   
    
    return output;

}

const prod_data = fs.readFileSync('./templates/product.html', 'utf-8');
const overview_data = fs.readFileSync('./templates/overview.html', 'utf-8');
const test_data = fs.readFileSync('./templates/test.html', 'utf-8');

const data = fs.readFileSync('./dev-data/data.json', 'utf-8');

const server = http.createServer((request, response) => {
    const {query, pathname} = url.parse(request.url, true);
    
    switch(pathname){
        case '/':
            const data_1 = JSON.parse(data);
            const mapped_data = data_1.map((el) => requested_page(test_data, el)).join('');
            const output = overview_data.replace(/{CARDS}/, mapped_data);

            response.writeHead(200, {'Content-Type': 'text/html'});
            response.end(output);
            break;
        case '/product':
            const data_2 = JSON.parse(data);
            const output_1 = requested_page(prod_data, data_2[query.id])

            response.writeHead(200, {'Content-Type': 'text/html'});
            response.end(output_1);
            break;
        case '/api':
            response.writeHead(200, {'Content-Type': 'application/json'});
            response.end(data);
            break;
        default:
            response.end('404! Page Not Found');    
    }
});

server.listen(3000, 'localhost', () =>{
    console.log('Started listening on port 3000');
});