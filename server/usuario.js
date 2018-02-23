var express = require('express');
var mongoose = require('mongoose');
var router = express.Router();
var Usuario = mongoose.model('Usuario');
var Solicitacao = mongoose.model('Solicitacao');
//lib de email
var nodemailer = require('nodemailer');

/*
 * @Author Denys Wylliam <denys.wylliam@gmail.com>
 */

//ROTA DE ENVIO DE EMAIL
router.put('/retrieve/:email', function(req, res){
	
	//Verificar se o email é válido antes de tudo
	
	Usuario.findOne({
		"email": req.params.email
	},	
	function(err, usuario) {
	     if (err){
	    	 	res.send(err);
	     }
	     
	     if(usuario != null){
	    	 	// create reusable transporter object using the default SMTP transport
	    		var transporter = nodemailer.createTransport({
	    			service:"gmail",
	    			host: "smtp.gmail.com",
	    			auth: {
	    				user: "*",
	    				pass: "*"
	    			}
	    			
	    		});
	    		
	    		var texto = "<h3>Olá "+usuario.nome+"</h3>"+
	    					"<p>Acesse este" +
	    					"<a href='*"+
	    					usuario.nome+"&email="+req.params.email+"&id="+req.sessionID+"'> link </a>"+
	    					"para criar sua nova senha.</p>"+
	    					"<p>------------------------------</p>"+
	    					"<p>NÃO RESPONDA ESTE E-MAIL</p>";
	    		
	    		// Setup dos dados do email em unicode
	    		var mailOptions = {
	    		    to: req.params.email, // lista de destinos
	    		    subject: 'Recuperação de senha', // Assunto
	    		    text: 'Acesse o link abaixo para inserir sua nova senha.', // corpo do email
	    		    html: texto  // corpo html
	    		};

	    		// envia o email utilizando o objeto de transporte
	    		transporter.sendMail(mailOptions, function(error, info){
	    		    if(error){
	    		        return console.log(error);
	    		    }
	    		    console.log('Message sent: ' + info.response);
	    		});
	     }
	     res.send(usuario);
	});
});

//ROTA CRIAR USUARIO =============================================
router.post('/signin/', function(req, res) {
	var passwordHash = require('password-hash');
	
	//gera a senha criptografada a partir da senha digitada pelo usuario
    var hashedPassword = passwordHash.generate(req.body.password);
    
	Usuario.create({
		nome : req.body.name,
        email: req.body.email,
        senha: hashedPassword,
        grupo: 1,
        done : false
        
    }, function(err, usuario) {
        if (err)
        	console.log(err)
            return res.send(err);
    });
	
});

//ROTA DELETAR USUARIO============================================
router.delete('/login/excluir/:usuario_id', function(req, res) {
    // Remove o usuario no Model pelo parâmetro _id
    Usuario.remove({
        _id : req.params.usuario_id
    }, function(err, usuario) {
        if (err)
            res.send(err);
    });
});

//ROTA BUSCAR USUARIO =============================================
router.post('/login/buscaUsuario/', function(req, res) {
	//biblioteca que criptografa dados
	var passwordHash = require('password-hash');
	
	//busca pelo email
	Usuario.findOne({
			"email": req.body.email
	},	
	function(err, usuario) {
         if (err){
        	 	res.send(err);
         }
         
	     if(usuario != null){
	    	 //verifica se a senha digitada coincide com a senha no banco
	        if(passwordHash.verify(req.body.password, usuario.senha)){
	        	res.json(usuario);
	        }else{
	        	res.send("false");
	        }
	     //retorna false caso não tenha encontrado registros
	     }else{
	    	 res.send("false");
	     }
    });
});

//ROTA ATUALIZAR SENHA USUARIO ==========================================
router.post('/usuario/updatepass/', function(req, res){
	var passwordHash = require('password-hash');
	var emailUsuario = req.body.email;
	
	
	//gera a senha criptografada a partir da senha digitada pelo usuario
    var hashedPassword = passwordHash.generate(req.body.password);
    
    if(req.sessionID == req.body.id){
    	
		Usuario.findOne({"email": emailUsuario}, function(err, usuario){
			if(err) res.send(err);
			Usuario.update(
				{"email": usuario.email},
				{"senha": hashedPassword},
					function(err) {
						if (err) 
							console.log("Erro na atualização\n"+err)
							res.send(err);
							res.send();
					}
			);
		});
	
    }else{
    	
    	res.send("Sessão Expirada!");
    	
    }
	
});

//ROTA ATUALIZAR GRUPO USUARIO ==========================================
router.put('/usuario/:grupo/:usuario', function(req, res) {
    // Busca o paciente no Model pelo parâmetro id
    var emailUsuario = req.params.usuario;
    var grupo = req.params.grupo;
    var user;
    Usuario.findOne({"email":emailUsuario}, function(err, usuario){
    	user = usuario;
    });
    Usuario.update( 
        {"email": emailUsuario}, 
        {"grupo": grupo}, 
        function(err) {
            if (err) res.send(err);
            insereLog(req.params.usuario, "Atualizou usuario de email: "+emailUsuario+" para o grupo "+grupo);
            res.json(user);
        });
});

//ROTA CRIAR SOLICITACAO
router.post('/geren/solicit/', function(req, res){
	Usuario.findOne({
		"email":req.body.email
	},function(err, usuario){
		if(err)	res.send(err);
		
		Solicitacao.create({
			"_id": usuario._id,
			"justificativa": req.body.justif,
			"status":"Aguardando"
		}, 
		function(err, solicitacao){
			if(err)res.send(err);
			res.send(solicitacao);
		});
		
	});
	
});

//ROTA ATUALIZAR SOLICITACAO ==========================================
router.put('/geren/atualizaSolicit/:status/:id', function(req, res) {
    // Busca o paciente no Model pelo parâmetro id
 
    Solicitacao.update( 
        {"_id": req.params.id}, 
        {"status": req.params.status}, 
        function(err, sol) {
            if (err) res.send(err);
           // insereLog(req.params.usuario, "Atualizou usuario de email: "+emailUsuario+" para o grupo "+grupo);
            res.json(sol);
        });
});
	
//ROTA BUSCAR SOLICITACOES ============================================
router.get('/geren/buscaSolicit',function(req, res){
	//Busca todas as solicitações
	Solicitacao.find(function(err, s){
		if(err) res.send(err);
		var solicitacoes = [];
		//busca os usuarios que fizeram solicitações
		
		s.forEach(function(elt, i) {
			Usuario.findOne({
				"_id": elt._id
			},function(err, usuario){
				if(err) res.send(err);
				solicitacoes[i] = {"nome": usuario.nome,
									"email": usuario.email, 
									"justificativa":elt.justificativa,
									"status": elt.status};
			});
		});
		//espera 0.5 segundo, para executar a operação anterior
		setTimeout(function() {
			res.json(solicitacoes);
		}, 500);	
		
	});
});

//ROTA EXCLUIR SOLICITACAO =========================================
router.delete('/geren/excluiSolicit/:id', function(req, res){
	Solicitacao.remove({"_id": req.params.id},function(err,solicit){
		if(err) res.send(err);
		res.json();
	});
});


//ROTA VERIFICA SE EMAIL JA EXISTE =================================
router.get('/login/buscaEmail/:email', function(req,res){
	Usuario.findOne({
		"email": req.params.email
	},
	function(err, user){
		if(err)
			res.send(false)
		
		if(user == null){
			res.send(true)
		}else if(user.email == req.params.email){
			res.send(false);
		}else{
			console.log(user);
			res.send(true);
		}
	});
});

function insereLog(usuario, acao){
	var fs = require('fs');
	var path = require('path');
	
	var caminho = path.join(__dirname, '../public/TEMP_FILES/log.txt');
	var data = (new Date()+"-"+usuario+"-"+acao+"\n");
	fs.appendFileSync(caminho, data);
	
}


module.exports = router;