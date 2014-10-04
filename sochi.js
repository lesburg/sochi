var express = require('express');
var bodyParser = require('body-parser');
var app = express();

var projects = [
                  {name: 'Project #1', owner: 'mickey_mouse', description: 'Plain description'},
                  {name: 'Project #2', owner: 'minnie_mouse', description: '*Bold* description'}
               ];

app.use('/', express.static(__dirname));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.get('/projects.json', function(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(projects));
});

app.post('/projects.json', function(req, res) {
  projects.push(req.body);
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(projects));
});

app.listen(3000);

console.log('Server started: http://localhost:3000/');
