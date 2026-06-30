
// Using Callbacks to work with Asynchrounous codes

// function Request_Function(resource, callback){
//     const request = new XMLHttpRequest();

//     request.open('GET', resource);
//     request.send();

//     request.addEventListener('readystatechange', () => {
//         if(request.readyState === 4 && request.status === 200){
//             const data = JSON.parse(request.responseText);
//             callback(data, undefined);
//         } else if(request.readyState === 4){
//             callback(undefined, "Cannot get api");
//         };
//     });
// }

// Request_Function('JSON/luigi.json', (data, err)=> {
//     if(data){
//         console.log(data);
//     }else{
//         console.log(err);
//     }
// });

// Request_Function('JSON/luigi.json', (data, err) => {
//     console.log(data);
//     Request_Function('JSON/mario.json', (data, err) => {
//         console.log(data);
//         Request_Function('JSON/ben.json', (data, err) => {
//             console.log(data);
//         })
//     })
// });

// Using the Promise Method to work with Asynchrounous code

// const Request_Function = (resource) => {
//     return new Promise((resolve, reject) => {
//         const request = new XMLHttpRequest();

//         request.open('GET', resource);
//         request.send();

//         request.addEventListener('readystatechange', () => {
//             if(request.readyState === 4 && request.status === 200){
//                 const data = JSON.parse(request.responseText);
//                 resolve(data);
//             } else if(request.readyState === 4){
//                 reject('There is an error');
//             };
//         });
//     });
// };

// The first method; Using the then function

// Request_Function('JSON/mario.json').then((data) =>{
//     console.log(data);
// }, (err) =>{
//     console.log(err);
// })


// The second method; Using the then and catch function 

// Request_Function("JSON/ben.json").then((data) => {
//     console.log(data);
//     return Request_Function('JSON/mario.json');
// }).then((data) => {
//     console.log(data);
//     return Request_Function('JSON/luigi.json');
// }).then((data) => {
//     console.log(data);
// }).catch((err) => {
//     console.log(err);
// })


// Using the Fetch Api Method

// fetch('JSON/mario.json').then((response) => {
//     console.log(response);
//     return response.json();
// }).then((data) => {
//     console.log(data);
// }).catch((err) => {
//     console.log(err);
// });


// Async and Await

const MyToDos = async () => {
    const response = await fetch('JSON/mario.json');

    if(response.status !== 200){
        throw new Error('This is an error');
    };

    const data = await response.json();

    const response_2 = await fetch('JSON/luigi.json');
    const data_2 = await response_2.json();

    console.log(data_2);
    return data;
};

MyToDos().then(data => {
    console.log(data);
}).catch((err) => {
    console.log('rejected', err.message);
});


// function TESt(){
//     console.log(1 + 2);
//     return "Success";
// };

// TESt();