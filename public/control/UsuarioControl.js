var bioteca = angular.module('bioteca', []);

/*
 * @Author Denys Wylliam <denys.wylliam@gmail.com>
 */

function usuarioController($scope, $http, $window) {
	$scope.usuarioNome = getCookie("nome");
	$scope.grupo = getCookie("grupo");
	
	$scope.mostraMensagens = function(){
		if($scope.grupo != null && $scope.grupo < 2){
			$window.document.getElementById("alertInf").style.display = 'block';
		}
	}
	
	//METODOS DE USUARIO==================================================
	$scope.logout = function(){
		$window.document.cookie = "nome=;";
		$window.document.cookie = "email=;";
		$window.document.cookie = "grupo=;";
		$scope.usuarioNome = getCookie("nome");
		$scope.grupo = getCookie("grupo");
		$window.document.getElementById("usuario").style.display = 'none';
		//redireciona usuário para a home
		$window.location.href = '../view/ViewLogin.html';
	}
	
	function getCookie(cname) {
	    var name = cname + "=";
	    var decodedCookie = decodeURIComponent($window.document.cookie);
	    var ca = decodedCookie.split(';');
	    for(var i = 0; i <ca.length; i++) {
	        var c = ca[i];
	        while (c.charAt(0) == ' ') {
	            c = c.substring(1);
	        }
	        if (c.indexOf(name) == 0) {
	            return c.substring(name.length, c.length);
	        }
	    }
	    return "";
	}
	//==================================================================
	
	$scope.login = function(){
		
		if($scope.user.email != "" && 
		   $scope.user.password != ""){
			
			$http.post('/user/login/buscaUsuario/',$scope.user)
			.success(function(data){
				if(data != "false"){
					//$window.document.cookie = "nome=; email=; grupo=;";
					//Recarrega informações do usuário em cookies novamente
					$window.document.cookie = "nome="+data.nome; 
					$window.document.cookie = "email="+data.email; 
					$window.document.cookie = "grupo="+data.grupo;
					
					//Captura infos dos cookies para as variaveis em escopo
					$scope.usuarioNome = getCookie("nome");
					$scope.grupo = getCookie("grupo");
					
					//redireciona usuário para a home
					$window.location.href = '../view/index.html';
				}else{
					alert("Senha ou email inválidos!");
				}
			})
			.error(function(data){
				alert("Senha ou email inválidos!");
			});
		}
	}
	
	//exclui um usuário
	$scope.excluir = function(){
		
		if($scope.user.email != "" && 
		   $scope.user.password != ""){
					
			$http.post('/user/login/buscaUsuario/',$scope.user)
			.success(function(data){
				if(data != "false"){
					
					$http.delete('/user/login/excluir/' + data._id)
			        .success(function(data) {
			        	$window.document.cookie = "nome=; email=; grupo=;";
			        	//Captura infos dos cookies para as variaveis em escopo
						$scope.usuarioNome = getCookie("nome");
						$scope.grupo = getCookie("grupo");
						
						//redireciona usuário para a home
						$window.location.href = '../view/index.html';
			        })
			        .error(function(data) {
			            console.log('Error: ' + data);
			        });
					
					
				}else{
					alert("Senha ou email inválidos!");
				}
			})
			.error(function(data){
				alert("Senha ou email inválidos!");
			});
			
		}
		
	}
	
	//cadastra novo usuário
	$scope.cadastrar = function(){
		//se os campos estiverem vazios, não registra
		if($scope.user.name != "" &&
		   $scope.user.email != "" &&
		   $scope.user.password != ""){
				//verifica se existe email no banco
				$http.get('/user/login/buscaEmail/' + $scope.user.email)
				.success(function(data){
					//recebe true caso não esteja cadastrado
					$emailNaoCadastrado = data;
					
					if($emailNaoCadastrado == "true"){
						//se não está cadastrado verifica se a senha digitada é a mesma que a confirmada		
						if($scope.user.password == $scope.user.confirmPassword){
							//caso senhas coincidirem, cadastra usuário
							$http.post('/user/signin/',$scope.user)
							.success(function(data){
								//limpa o campo
								$scope.user = [];
								$window.location.href = '../view/ViewLogin.html'
							})
							.error(function(data){
								//Alerta de erro durante o cadastro
								alert("Algun erro ocorreu:\n "+data);
							});
						}else{
							alert("senhas não conferem");
						}
						
					}else{
						alert("email já existe");
					}
				})
				.error(function(data){
					//erro durante a busca do email
					alert(data);
				});
		}else{
			//alerta de erro caso os campos estejam vazios
			alert("preencha todos os campos");	
		}
		//se email não existir no banco de dados, não registra
	}
	
	$scope.capturaParametros = function(){
		var query = decodeURI($window.location.search.slice(1));
		var partes = query.split('&');
		var data = {};
		partes.forEach(function (parte) {
		    var chaveValor = parte.split('=');
		    var chave = chaveValor[0];
		    var valor = chaveValor[1];
		    data[chave] = valor;
		});
		
		$scope.usuario = data;
	}
	
	//envia uma solicitacao para o administrador dar acesso de escrita
	$scope.enviarSolicitacao = function(){
		$scope.user.email = getCookie("email");
		$http.post('/user/geren/solicit/', $scope.user)
		.success(function(data){
			$window.document.getElementById("successInf").style.display = 'block';
			$scope.user.justif = "";
		})
		.error(function(data){
			//tratar
		});
	}
	
	$scope.excluirSolicitacao = function(){
		if($scope.statusSolicit != "aguardando"){
			$http.delete('/user/geren/excluiSolicit/' + $scope.idSolicit);
		}
	}
	
	$scope.buscaStatus = function(){
		$http.get('/user/geren/buscaSolicit')
		.success(function(data){
			data.forEach(function(elt, i) {
				if(elt.email == getCookie("email")){
					$scope.statusSolicit = elt.status;
					$scope.idSolicit = elt._id;
					$window.document.getElementById("statusInf").style.display = 'block';
				}
			});
		})
		.error(function(data){
		});
	}
	
	//Ao clicar em 'Esqueceu sua senha?' envia um email para o destinatario
	//alterar nome para enviarEmailRecuperacao
	$scope.recuperarSenha = function(){
		if($scope.user.email != undefined){
			if (confirm("Um email será enviado para "+$scope.user.email+
				" para a modificação da senha, deseja prosseguir?") == true) {
				
				$http.put('/user/retrieve/'+$scope.user.email)
				.success(function(data){
					//====================================================================================
					console.log("SUCESSO");
				})
				.error(function(error){
					//====================================================================================
					console.log("Erro\n"+error);
				});
				
			}
		}
	}
	
	//Altera a senha do usuario
	$scope.atualizarSenha = function(){
		$scope.usuario.password = $scope.user.pass;
		
		$http.post('/user/usuario/updatepass/',$scope.usuario)
		.success(function(data){
			$window.location.href = '../view/ViewLogin.html';
		})
		.error(function(error){
			console.log(error);
		});
	}
	
	
	//carrega a tabela de solicitações pendentes
	$scope.carregaTabela = function(){
		$http.get('/user/geren/buscaSolicit')
		.success(function(data){
			$scope.solicitacoes = data;
			console.log(data);
		})
		.error(function(data){
			//tratar
		});
	}
	
	$scope.respondeSolicit = function(status, email){
		switch (status) {
		case "aceitar":
			$http.put('/user/usuario/'+2+'/'+email)
			.success(function(data){
				$http.put('/user/geren/atualizaSolicit/'+"Aceito"+"/"+data._id);
				$window.document.getElementById("respInf").style.display = 'block';
			})
			.error(function(data){
				//tratar
			});
			break;
		case "recusar":
			$http.put('/user/usuario/'+1+'/'+email)
			.success(function(data){
				$http.put('/user/geren/atualizaSolicit/'+"Recusado"+"/"+data._id);
				$window.document.getElementById("respInf").style.display = 'block';
			})
			.error(function(data){
				//tratar
			});
			break;

		}
		
	}
	
	$scope.setSolicitacaoSelecionada = function(sol) {
        $scope.sol = sol;
   };
	
}
