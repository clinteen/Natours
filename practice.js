// const { resolve } = require('dns');
const fs = require('fs');
// const { reject } = require('lodash');


const new_Func = async () => {
    try {
        const data = await ReadFunction('./dev-data/data.json');

        const data2 = await WriteFunction('./new-text.txt', data);
        console.log(data2);
    } catch(err){
        console.log(err);
    }
};










const ReadFunction = (data) => {
    return new Promise((resolve, reject) => {
        fs.readFile(data,'utf-8', (err, datas) => {
            if(err){
                reject(`This is a file error: ${err.message}`);
            }
            resolve(datas);

        });
    });
};

const WriteFunction = (text, data) => {
    return new Promise((resolve, reject) => {
        fs.writeFile(text, data, (err) => {
            if(err){
                console.log(err);
                reject(`This is a saving error: ${err.message}`);
            }
            resolve('File Saved successfully');
        });
    });
};

new_Func();

// ReadFunction('./dev-data/data.json').then((data) => {
//     return WriteFunction('./test.txt', data);
// }).then((data) => {
//     console.log(data);
// }).catch((err) => {
//     console.log(err);
// })

