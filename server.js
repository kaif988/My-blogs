const http = require('http');
const fs = require('fs');
const path = require('path');


const server = http.createServer((req, res ) => {
    console.log(req.url , req.method);
    ///set header
    res.setHeader('Content-Type' , 'text/html');

    //simple Routing

   let filepath = './public';
    switch(req.url){
        case '/':
            filepath = path.join(filepath,'index.html');
            break;
        case '/about':
            filepath = path.join(filepath,'about.html');
            break;
        default:
            filepath = path.join(filepath,'404.html');
            break;
    }

    // path to html file

    fs.readFile(filepath, (err , data) => {
        if(err){
            console.log(err);
            res.end()
        }else{
            res.write(data);
            res.end();
        }
    })

})

server.listen(8000, 'localhost',() =>{
    console.log('port listerning to server');
})





