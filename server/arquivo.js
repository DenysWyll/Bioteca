var express = require('express');
var mongoose = require('mongoose');
var router = express.Router();
var multiparty = require('connect-multiparty');
var Paciente = mongoose.model('Paciente');
var Usuario = mongoose.model('Usuario');
var Solicitacao = mongoose.model('Solicitacao');

var maiorDna;
var fileUpload = "";

/*
 * @Author Denys Wylliam <denys.wylliam@gmail.com>
 */

//Faz upload do arquivo csv e o coloca em /public/TEMP_FILES/upload/
router.post('/upload',multiparty(), function(req, res){
	var fs = require('fs');
	
	res.setHeader("Access-Control-Allow-Origin", "*");

	var arquivo = req.files.file;
	var temporario = req.files.file.path;
	var novo = './public/TEMP_FILES/upload/' + req.files.file.name;
	
	fs.rename(temporario, novo, function(err){
		if(err){
			res.status(500).json({error: err})
		}
		fileUpload = req.files.file.name;
		res.json({message: "none"});
	})
	
});

//ROTA DE LEITURA DO ARQUIVO JSON ======================================
router.get('/paciente/getJson/', function(req, res) {
	res.json(converteArquivoToJson(fileUpload));
});

//recebe o arquivo e converte no formato json 
function converteArquivoToJson(arquivo){
	// Importa pacotes do node (file system)
	var fs = require('fs');
	var path = require('path');
	
	var filePath = path.join(__dirname, '../public/TEMP_FILES/upload/'+arquivo);
	
	// Leitura do csv
	var f = fs.readFileSync(filePath, {encoding: 'utf-8'}, 
	    function(err){
			console.log("Erro ao ler arquivo");
			console.log(err);
	});

	// Split de linhas
	f = f.split("\n");
	
	// Adciona a primeira linha como cabeçalho
	headers = f.shift().split(",");
	
	var json = [];  

	f.forEach(function(d, i){
	    tmp = {}
		row = d.split(",")
		
		// Loop para cada linha
	    for(var i = 0; i < headers.length; i++){
	    	tmp[headers[i]] = row[i];
	    }
	    //console.log(tmp);
	    try {
	    	// Adiciona o objeto na lista
	    	json.push(tmp);
		} catch (e) {
			console.log("ERRO AO PARSEAR JSON:\n"+ e.message);
		}
	});
	
	//retira linha em branco
	json.pop();

	//apaga o arquivo
	if(fs.existsSync(filePath)){
		fs.unlinkSync(filePath);
	}
	
	return(json);
	
}




//ROTA QUE RETORNA O NOME DO ARQUIVO PARA DOWNLOAD
router.get('/pacientes/download/capturaNomeArquivo/', function(req, res){
	var file = 'bioteca'+req.sessionID+'.csv';
	res.send(file);
});

function insereLog(usuario, acao){
	var fs = require('fs');
	var path = require('path');
	
	var caminho = path.join(__dirname, '../public/TEMP_FILES/log.txt');
	var data = (new Date()+"-"+usuario+"-"+acao+"\n");
	fs.appendFileSync(caminho, data);
	
	
}
module.exports = router;
