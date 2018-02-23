var express = require('express');
var router = express.Router();

//Define as rotas para as paginas

router.get('/', function(req, res){
    res.sendfile('./public/view/index.html');
});

router.get('/admin', function(req, res){
    res.sendfile('./public/view/ViewAdministrador.html');
});

router.get('/paciente', function(req, res){
    res.sendfile('./public/view/ViewCadastroPaciente.html');
});

router.get('/usuario', function(req, res){
    res.sendfile('./public/view/ViewCadastroUsuario.html');
});

router.get('/gerenciamento', function(req, res){
    res.sendfile('./public/view/ViewGerenciamentoUsuario.html');
});

router.get('/login', function(req, res){
    res.sendfile('./public/view/ViewLogin.html');
});

router.get('/upload', function(req, res){
    res.sendfile('./public/view/ViewUploadArquivos.html');
});

module.exports = router;