// app.js
 
// INICIANDO ==========================================
var express  = require('express');
// cria nossa aplicação Express
var app      = express();
// mongoose for mongodb
var mongoose = require('mongoose');
// solicitações para log no console (express4)
var logger = require('morgan');
// puxar informações por POST HTML (express4)
var bodyParser = require('body-parser');
// simular DELETE e PUT (express4)
var methodOverride = require('method-override');
// gerenciamento de arquivos
var fs = require('fs');
var path = require('path');
//gerenciamento de sessão
var cookieParser = require('cookie-parser');
var session = require('express-session');
// MONGODB ============================================
// conectando ao mongodb no localhost, criando o banco de dados bioteca
mongoose.connect('mongodb://localhost/bioteca');
// Requisição ao arquivo que cria nossos models 
require('./public/model/Paciente');
require('./public/model/Usuario');
require('./public/model/Solicitacao');
 
// DEFININDO A APLICAÇÃO ==============================
// definindo local de arquivos públicos
app.use(express.static(__dirname + '/public'));
// logando todas as requisições no console
app.use(logger('dev'));
// parse application/x-www-form-urlencoded                                    
app.use(bodyParser.urlencoded({limit: '5mb', 'extended':'true'}));
// parse application/json          
app.use(bodyParser.json({limit: '5mb'}));
// parse application/vnd.api+json as json
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
app.use(methodOverride());

app.use(cookieParser());
app.use(session({
    secret: '34SDgsdgspxxxxxxxdfsG', // just a long random string
    resave: false,
    saveUninitialized: true
}));

// ROTAS ===============================================
// Incluindo rotas definidas nos arquivos abaixo
var index = require('./server/index');
var user = require('./server/usuario');
var file = require('./server/arquivo');
var router = require('./routes/router');
// definindo as rotas da aplicação
app.use('/api', index);
app.use('/user', user);
app.use('/file',file);
app.use('/', router);

// LISTEN (iniciando nossa aplicação em node) ==========
// Define a porta 8080 onde será executada nossa aplicação
app.listen(8080);
// Imprime uma mensagem no console
console.log("Aplicação executada na porta 8080");
