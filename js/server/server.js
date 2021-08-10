const jsonServer = require('json-server');
const path = require('path');
const hostname = 'localhost';

const dbPort = 8081;
const app = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, './server.json'));
const middlewares = jsonServer.defaults();

app.use(function(req, res, next){
  setTimeout(next, 2000);
});
app.use(middlewares);
app.use(router);

server = app.listen(dbPort, () => {
  console.log(`Database running at ${ hostname }:${ dbPort }`);
});