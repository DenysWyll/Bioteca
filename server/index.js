var express = require('express');
var mongoose = require('mongoose');
var router = express.Router();
var multiparty = require('connect-multiparty');
var Paciente = mongoose.model('Paciente');
var Usuario = mongoose.model('Usuario');
var Solicitacao = mongoose.model('Solicitacao');

var maiorDna;

/*
 * @Author Denys Wylliam <denys.wylliam@gmail.com>
 */

// ROTA BUSCAR ============================================
router.get('/pacientes', function(req, res) {
    // utilizaremos o mongoose para buscar todos os pacientes no BD
    Paciente.find(function(err, pacientes) {
        // Em caso de erros, envia o erro na resposta
        if (err)
            res.send(err)
        // Retorna todos os pacientes encontrados no BD
        res.json(pacientes); 
    });
});

//ROTA ATUALIZA SOMENTE VALORES DE PLACAS
router.post('/pacientes/atualizaPlacas/:usuario', function(req, res){
	var registros = req.body;
	var ids = [];

	//atualiza os dados da base
	registros.forEach(function(p, i){
		if(p.iid != undefined){
			Paciente.update({"iid":p.iid},
				{"genotipado":p.genotipado, "emPlaca":p.em_placa},
			p, {upsert : true}, function(err, res){
				if(err) console.log(err);
				
			});
		}
	});
	res.json({});
});


//ROTA CRIAR MUITOS =======================================
router.post('/pacientes/many/:usuario/:maiordna', function(req, res){

	var registros = convertePaciente(req.body, req.params.maiordna);
	var ids = [];

	registros.forEach(function(p, i){
		if(p.iid != undefined)
			ids.push(p.iid);
	});

	Paciente.find({iid:{$in : ids}}, function(err, pacientes){
		if(err){console.log(err);}
		
		var _ = require('lodash');
		
		//se o banco não estiver vazio
		if(pacientes.length > 0){
			//compara dados novos com os da base
			var result = _.differenceWith(registros, pacientes, _.isEqual);
			
			//atualiza os dados da base
			result.forEach(function(p, i){
				if(p.iid != undefined){
					Paciente.update({"iid":p.iid}, 
					p, {upsert : true},{new : true}, function(err, res){
						if(err) console.log(err);
					});
				}
			});

		}else{
			Paciente.create(registros ,function(err, registros) {
				if (err){
					//res.send(err);
					console.log(err);
				}
			    insereLog(req.params.usuario, "Fez upload de registros");
			});
		}

		res.send({});
	});
});

//função que converte o form da view upload no json padrão
function convertePaciente(pacientes, maiorDna){
	var jsonPac = [];

	pacientes.forEach(function(p, i) {

		//Se houver registro de dna onda 2 e não houver da onda 3,
		//onda 3 é igual onda 2
		if((p.DNA_Onda_2 != 0 || p.DNA_Onda_2 != "") && 
		(p.DNA_Onda_3 == 0 || p.DNA_Onda_3 == "")){
			
				p.DNA_Onda_3 = p.DNA_Onda_2;
			
		}
		//Se não houver registro de dna onda 2, busca no banco o maior número de dna onda 2
		//e incrementa 1
		if((p.DNA_Onda_2 == 0 || p.DNA_Onda_2 == "") && 
			(p.DNA_Onda_3 == 0 || p.DNA_Onda_3 == "")){

			maiorDna++;
			p.DNA_Onda_3 = maiorDna;

		}
		
		jsonPac[i] = {
			"iid" : p.iid,
			"dnas" : [{
						"_id" : p.DNA_Onda_1,
						"coleta" : p.DNA_Onda_1_Coleta,
						"reprovado" : p.DNA_Onda_1_Reprovado,
						"onda" : "1",
						"soro" : {
								"s1" : p.Soro_1_Onda_1,
								"s2" : p.Soro_2_Onda_1,
								"s3" : p.Soro_3_Onda_1,
								"s4" : p.Soro_4_Onda_1,
								},
						"plasma" : {
								"p1" : p.Plasma_1_Onda_1,
								"p2" : p.Plasma_2_Onda_1,
								"p3" : p.Plasma_3_Onda_1,
								"p4" : p.Plasma_4_Onda_1
						},
						"rnaLatter1" : p.RnaLatter_1_Onda_1,
						"rnaLatter2" : p.RnaLatter_2_Onda_1
					},
					{
						"_id" : p.DNA_Onda_2,
						"coleta" : p.DNA_Onda_2_Coleta,
						"reprovado" : p.DNA_Onda_2_Reprovado,
						"onda" : "2",
						"soro" : {
								"s1" : p.Soro_1_Onda_2,
								"s2" : p.Soro_2_Onda_2,
								"s3" : p.Soro_3_Onda_2,
								"s4" : p.Soro_4_Onda_2,
								},
						"plasma" : {
								"p1" : p.Plasma_1_Onda_2,
								"p2" : p.Plasma_2_Onda_2,
								"p3" : p.Plasma_3_Onda_2,
								"p4" : p.Plasma_4_Onda_2
						},
						"rnaLatter1" : p.RnaLatter_1_Onda_2,
						"rnaLatter2" : p.RnaLatter_2_Onda_2
					},
					{
						"_id" : p.DNA_Onda_3,
						"coleta" : p.DNA_Onda_3_Coleta,
						"reprovado" : p.DNA_Onda_3_Reprovado,
						"onda" : "3",
						"soro" : {
								"s1" : p.Soro_1_Onda_3,
								"s2" : p.Soro_2_Onda_3,
								"s3" : p.Soro_3_Onda_3,
								"s4" : p.Soro_4_Onda_3,
								},
						"plasma" : {
								"p1" : p.Plasma_1_Onda_3,
								"p2" : p.Plasma_2_Onda_3,
								"p3" : p.Plasma_3_Onda_3,
								"p4" : p.Plasma_4_Onda_3
						},
						"mic1" : p.Microbiota_1,
						"mic2" : p.Microbiota_2
					}],
			"nome" : p.nome,
			"genotipado" : p.genotipado,
			"emPlaca" : p.em_placa,
			"coleta" : p.data_da_coleta,
		};
	});

	
	return jsonPac;
}

//função que busca o maior dna da onda 3 e retorna a incrementação do mesmo
router.get('/pacientes/maiordna', function(req, res){
	//dnas.2._id representa a posição 3 no array de dnas;
	//o sort com -1 significa para ordenar do maior para menor
	var findQuery = Paciente.find().sort({"dnas.2._id" : -1}).limit(1);

	findQuery.exec(function(err, maxResult){
	    if (err) {
	    	res.send(err);
		}
		
		if(maxResult[0] != undefined){
			if(maxResult[0].iid != undefined){
				if(maxResult[0].dnas[2]._id != undefined){
					maiorDna = parseInt(maxResult[0].dnas[2]._id);
				}
			}
		}
		
		res.json(maiorDna);
	});
});

// ROTA CRIAR =============================================
router.post('/pacientes/:usuario', function(req, res) {
    // Cria um paciente, as informações são enviadas por uma requisição AJAX pelo Angular
	Paciente.create({
		iid : req.body.iid,
        dnas : [{_id : req.body.num1,
					coleta: req.body.coleta1,
					reprovado: req.body.statusDna1,
					onda: 1,
					soro : {  s1: req.body.s1_Onda1,
								s2: req.body.s2_Onda1,
								s3: req.body.s3_Onda1,
								s4: req.body.s4_Onda1
							},
					plasma : { p1: req.body.p1_Onda1,
									p2: req.body.p2_Onda1,
									p3: req.body.p3_Onda1,
									p4: req.body.p4_Onda1
							},
					rnaLatter1 : req.body.rnaLatter_1_Onda_1,
					rnaLatter2 : req.body.rnaLatter_2_Onda_1
				},
				{_id : req.body.num2,
					coleta: req.body.coleta2,
					reprovado: req.body.statusDna2,
					onda: 2,
					soro : {  s1: req.body.s1_Onda2,
							s2: req.body.s2_Onda2,
							s3: req.body.s3_Onda2,
							s4: req.body.s4_Onda2
						},
					plasma : { p1: req.body.p1_Onda2,
								p2: req.body.p2_Onda2,
								p3: req.body.p3_Onda2,
								p4: req.body.p4_Onda2
							},
					rnaLatter1 : req.body.rnaLatter_1_Onda_2,
					rnaLatter2 : req.body.rnaLatter_2_Onda_2 
				},
				{	_id : req.body.num3,
	    		  	coleta: req.body.coleta3,
	    		  	reprovado: req.body.statusDna3,
	    		 	 onda: 3,
				  	soro : {  s1: req.body.s1_Onda3,
							 s2: req.body.s2_Onda3,
							 s3: req.body.s3_Onda3,
							 s4: req.body.s4_Onda3
						 },
				  	plasma : { p1: req.body.p1_Onda3,
								 p2: req.body.p2_Onda3,
								 p3: req.body.p3_Onda3,
								 p4: req.body.p4_Onda3
						   },
					mic1 : req.body.mic1,
					mic2 : req.body.mic2
				
				}
			],
		nome : req.body.nome,
		genotipado : req.body.genotipado,
		emPlaca : req.body.emPlaca,
		coleta : req.body.coleta,
		obs: req.body.observ,
		done : false
 
    }, function(err, pacientes) {
        if (err) {
        	console.log(err);
            return res.send(err);
        }
        insereLog(req.params.usuario, "Criou registro com iid:"+req.body.iid);
        res.send(pacientes);
    });
});
 
// ROTA DELETAR ============================================
router.delete('/pacientes/:paciente_id/:usuario', function(req, res) {
    // Remove o paciente no Model pelo parâmetro _id
    Paciente.remove({
        _id : req.params.paciente_id
    }, function(err, paciente) {
        if (err)
            res.send(err);
        
        insereLog(req.params.usuario, "Removeu registro");
        // Busca novamente todos os pacientes após termos removido o registro
        Paciente.find(function(err, pacientes) {
            if (err)
                res.send(err)
            res.json(pacientes);
        });
    });
});
 
//ROTA BUSCAR SELECIONADO=====================================
router.get('/pacientes/:paciente_id', function(req, res) {
    // Busca o paciente no Model pelo parâmetro id
    Paciente.findOne({
        _id : req.params.paciente_id
    }, function(err, paciente) {
        if (err)
            res.send(err);
        res.json(paciente);
    });
});

//ROTA BUSCAR ESPECIFICO  ==================================
router.get('/pacientes/busca/:filtro/:pesq', function(req, res) {
	
	if(req.params.pesq != ""){
		if(req.params.filtro == "iid"){

			Paciente.find({
		        iid : req.params.pesq
			}, function(err, paciente) {
		        if (err)
		            res.send(err);
		        res.json(paciente);
		        converteJsonToCsv(paciente, req.sessionID);
			});
				
		}else if(req.params.filtro == "dna1"){
			
			Paciente.find({
				"dnas.0._id" : req.params.pesq,
				"dnas.0.onda" : 1
		    }, function(err, paciente) {
		        if (err)
		            res.send(err);
		        res.json(paciente);
		        converteJsonToCsv(paciente, req.sessionID);
		    });
			
		}else if(req.params.filtro == "dna2"){
			
			Paciente.find({
				"dnas.1._id" : req.params.pesq,
				"dnas.1.onda" : 2
		    }, function(err, paciente) {
		        if (err)
		            res.send(err);
		        res.json(paciente);
		        converteJsonToCsv(paciente, req.sessionID);
		    });
			
		}else if(req.params.filtro == "dna3"){
			
			Paciente.find({
				"dnas.2._id" : req.params.pesq,
				"dnas.2.onda" : 3
		    }, function(err, paciente) {
		        if (err)
		            res.send(err);
		        res.json(paciente);
		        converteJsonToCsv(paciente, req.sessionID);
		    });
			
		}else if(req.params.filtro == "nome"){
			
			Paciente.find({
				//Este regex serve para ignorar 
				//o case sensitive e serve como .contains()
		        nome : {$regex : new RegExp(req.params.pesq,"i")}
		    }, function(err, paciente) {
		        if (err)
		            res.send(err);
		        res.json(paciente);
		        converteJsonToCsv(paciente, req.sessionID);
		    });
			
		}else if (req.params.filtro == "genotipado"){

			Paciente.find({
		        genotipado : 1
		    }, function(err, paciente) {
		        if (err)
		            res.send(err);
		        res.json(paciente);
		        converteJsonToCsv(paciente, req.sessionID);
			});
			
		}else if (req.params.filtro == "nGenotipado"){

			Paciente.find({
		        genotipado : 0
		    }, function(err, paciente) {
		        if (err)
		            res.send(err);
		        res.json(paciente);
		        converteJsonToCsv(paciente, req.sessionID);
			});
			
		}else if (req.params.filtro == "emPlaca"){
				
			Paciente.find({
		        emPlaca : 1
		    }, function(err, paciente) {
		        if (err)
		            res.send(err);
		        res.json(paciente);
		        converteJsonToCsv(paciente, req.sessionID);
			});

		}else{
			Paciente.find(function(err, paciente) {
		        if (err)
		            res.send(err)
		        res.json(paciente);
		        converteJsonToCsv(paciente, req.sessionID);
		    });
		}
	}else{
		Paciente.find(function(err, paciente) {
	        if (err)
	            res.send(err)
	        res.json(paciente);
	        converteJsonToCsv(paciente, req.sessionID);
	    });
	}
	
    
});

// ROTA ATUALIZAR ==========================================
router.put('/pacientes/:paciente_id/:usuario', function(req, res) {
    // Busca o paciente no Model pelo parâmetro id
    var pacienteData = req.body;
    var id = req.params.paciente_id;
	 
	//cria um backup em csv nas pasta /TEMP_FILES/backups
	geraBackup();

    Paciente.update( 
        {_id: id }, 
        pacienteData, 
        { upsert: true}, 
        function(err, paciente) {
            if (err) res.send(err);
			insereLog(req.params.usuario, "Atualizou registro com iid: "+req.body.iid);
			

            res.json(paciente);
        });
    
});

//faz backup dos dados do banco
function geraBackup(){
	var fs = require('fs');
	var path = require('path');
	var json2csv = require('json2csv');
	var localDate = new Date();


	var fields = [	'iid', 'genotipado', 'emPlaca', 'nome', 'coleta',
		'dnas.0._id','dnas.0.reprovado','dnas.0.coleta', 
		'dnas.0.soro.s1','dnas.0.soro.s2','dnas.0.soro.s3','dnas.0.soro.s4',
		'dnas.0.plasma.p1','dnas.0.plasma.p2','dnas.0.plasma.p3','dnas.0.plasma.p4',
		'dnas.0.rnaLatter1','dnas.0.rnaLatter2',
		'dnas.1._id','dnas.1.reprovado','dnas.1.coleta',
		'dnas.1.soro.s1','dnas.1.soro.s2','dnas.1.soro.s3','dnas.1.soro.s4',
		'dnas.1.plasma.p1','dnas.1.plasma.p2','dnas.1.plasma.p3','dnas.1.plasma.p4',
		'dnas.1.rnaLatter1','dnas.1.rnaLatter2',
		'dnas.2._id','dnas.2.reprovado','dnas.2.coleta',
		'dnas.2.soro.s1','dnas.2.soro.s2','dnas.2.soro.s3','dnas.2.soro.s4',
		'dnas.2.plasma.p1','dnas.2.plasma.p2','dnas.2.plasma.p3','dnas.2.plasma.p4',
		'dnas.2.mic1','dnas.2.mic2'];

	var fieldNames = ['iid', 'genotipado', 'em_placa' , 'nome' ,'data_da_coleta',
		'DNA_Onda_1', 'DNA_Onda_1_Reprovado', 'DNA_Onda_1_Coleta',
		'Soro_1_Onda_1', 'Soro_2_Onda_1','Soro_3_Onda_1', 'Soro_4_Onda_1', 
		'Plasma_1_Onda_1','Plasma_2_Onda_1','Plasma_3_Onda_1','Plasma_4_Onda_1',
		'RnaLatter_1_Onda_1','RnaLatter_2_Onda_1',
		'DNA_Onda_2', 'DNA_Onda_2_Reprovado', 'DNA_Onda_2_Coleta',
		'Soro_1_Onda_2', 'Soro_2_Onda_2','Soro_3_Onda_2', 'Soro_4_Onda_2', 
		'Plasma_1_Onda_2','Plasma_2_Onda_2','Plasma_3_Onda_2','Plasma_4_Onda_2', 
		'RnaLatter_1_Onda_2','RnaLatter_2_Onda_2',
		'DNA_Onda_3', 'DNA_Onda_3_Reprovado', 'DNA_Onda_3_Coleta',
		'Soro_1_Onda_3', 'Soro_2_Onda_3','Soro_3_Onda_3', 'Soro_4_Onda_3', 
		'Plasma_1_Onda_3','Plasma_2_Onda_3','Plasma_3_Onda_3','Plasma_4_Onda_3',
		'Microbiota_1','Microbiota_2'];
	try {
	
		Paciente.find(function(err, pacientes) {
			if (err)
				res.send(err)
			
			var result = json2csv({ data: pacientes, fields: fields, fieldNames: fieldNames });
			
			//cria um valor random para diferenciar um nome de arquivo
			var fileBackup = 'backup_bioteca-'+ localDate.getFullYear() 
												+ localDate.getMonth() 
												+ localDate.getDate() +"-"
												+ localDate.getMinutes() + '.csv';
	
			//indica onde será gravado arquivo
			var outPath = path.join(__dirname, '../public/TEMP_FILES/backup/'+ fileBackup);
	
			//escreve o arquivo no diretório
			fs.writeFileSync(outPath, result.toString(), 'utf8',
			function(err){console.log(err);});
			return pacientes;
		});

		

	} catch (err) {

		console.error(err);
	}
}

//converte os dados da busca específica em csv e salva o arquivo em TEMP_FILES
function converteJsonToCsv(json, sessionID){
	var fs = require('fs');
	var path = require('path');
	var json2csv = require('json2csv');
	var localDate = new Date();
	var fileDownload = 'bioteca' + sessionID +'.csv';
	
	//Verifica se arquivos são antigos=======================
	var caminho = path.join(__dirname, '../public/TEMP_FILES/download');
	var dir = fs.readdirSync(caminho);
	
	//se tiver conteudo na pasta
	if(dir.length > 0){
		
		dir.forEach(function(elt, i) {
			
			var f = fs.statSync(caminho+"/"+elt);
			var fileDate = new Date(f.ctime);
			
			
			//se data atual menos a data de criação do arquivo for maior que um dia, apaga o mesmo
			if((localDate.getDate() - fileDate.getDate())>1){
				var filePath = path.join(__dirname, '../public/TEMP_FILES/upload/'+elt);
				
				if(fs.existsSync(filePath)){
					fs.unlinkSync(filePath, function(){
						//fileDownload = "";
					});
				}
				
			}
			
		});
		
	}
	//=======================================================
	
	
	var fields = [	'iid', 'genotipado', 'emPlaca', 'nome', 'coleta',
		'dnas.0._id','dnas.0.reprovado','dnas.0.coleta', 
		'dnas.0.soro.s1','dnas.0.soro.s2','dnas.0.soro.s3','dnas.0.soro.s4',
		'dnas.0.plasma.p1','dnas.0.plasma.p2','dnas.0.plasma.p3','dnas.0.plasma.p4',
		'dnas.0.rnaLatter1','dnas.0.rnaLatter2',
		'dnas.1._id','dnas.1.reprovado','dnas.1.coleta',
		'dnas.1.soro.s1','dnas.1.soro.s2','dnas.1.soro.s3','dnas.1.soro.s4',
		'dnas.1.plasma.p1','dnas.1.plasma.p2','dnas.1.plasma.p3','dnas.1.plasma.p4',
		'dnas.1.rnaLatter1','dnas.1.rnaLatter2',
		'dnas.2._id','dnas.2.reprovado','dnas.2.coleta',
		'dnas.2.soro.s1','dnas.2.soro.s2','dnas.2.soro.s3','dnas.2.soro.s4',
		'dnas.2.plasma.p1','dnas.2.plasma.p2','dnas.2.plasma.p3','dnas.2.plasma.p4',
		'dnas.2.mic1','dnas.2.mic2'];

	var fieldNames = ['iid', 'genotipado', 'em_placa' , 'nome' ,'data_da_coleta',
		'DNA_Onda_1', 'DNA_Onda_1_Reprovado', 'DNA_Onda_1_Coleta',
		'Soro_1_Onda_1', 'Soro_2_Onda_1','Soro_3_Onda_1', 'Soro_4_Onda_1', 
		'Plasma_1_Onda_1','Plasma_2_Onda_1','Plasma_3_Onda_1','Plasma_4_Onda_1',
		'RnaLatter_1_Onda_1','RnaLatter_2_Onda_1',
		'DNA_Onda_2', 'DNA_Onda_2_Reprovado', 'DNA_Onda_2_Coleta',
		'Soro_1_Onda_2', 'Soro_2_Onda_2','Soro_3_Onda_2', 'Soro_4_Onda_2', 
		'Plasma_1_Onda_2','Plasma_2_Onda_2','Plasma_3_Onda_2','Plasma_4_Onda_2', 
		'RnaLatter_1_Onda_2','RnaLatter_2_Onda_2',
		'DNA_Onda_3', 'DNA_Onda_3_Reprovado', 'DNA_Onda_3_Coleta',
		'Soro_1_Onda_3', 'Soro_2_Onda_3','Soro_3_Onda_3', 'Soro_4_Onda_3', 
		'Plasma_1_Onda_3','Plasma_2_Onda_3','Plasma_3_Onda_3','Plasma_4_Onda_3',
		'Microbiota_1','Microbiota_2'];
	try {
	  
	  var result = json2csv({ data: json, fields: fields, fieldNames: fieldNames });
	  
	  //console.log(result);
	  
	  //cria um valor random para diferenciar um nome de arquivo
	  fileDownload = 'bioteca'+ sessionID + '.csv';
	  
	  //indica onde será gravado arquivo
	  var outPath = path.join(__dirname, '../public/TEMP_FILES/download/'+ fileDownload);
	  
	  //escreve o arquivo no diretório
	  fs.writeFileSync(outPath, result.toString(), 'utf8',
			  function(err){console.log(err);});
	
	} catch (err) {
	 
	  console.error(err);
	}
}

function insereLog(usuario, acao){
	var fs = require('fs');
	var path = require('path');
	
	var caminho = path.join(__dirname, '../public/TEMP_FILES/log.txt');
	var data = (new Date()+"-"+usuario+"-"+acao+"\n");
	fs.appendFileSync(caminho, data);
	
}

// DEFININDO NOSSA ROTA PARA O ANGULARJS/FRONT-END =========
router.get('*', function(req, res) {
	
    // O Angular irá lidar com as mudanças de páginas no front-end
    res.sendfile('./public/view/ViewLogin.html');
});


module.exports = router;
