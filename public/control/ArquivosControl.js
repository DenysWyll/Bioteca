var bioteca = angular.module('bioteca', []);

/*
 * @Author Denys Wylliam <denys.wylliam@gmail.com>
 */

function arquivosControl($scope, $http, $window) {
	
	$scope.usuarioNome = getCookie("nome");
	$scope.grupo = getCookie("grupo");
	$scope.arquivo = "Nenhum arquivo selecionado";
	$scope.inMemory = true;
	$scope.wasSent = true;
	$scope.numRegistros = 0;
	$scope.posicao = 0;
	$scope.paginationNum = 0;
	$scope.indices = [];
	$scope.sortType = 'name';
	$scope.sortReverse = false;
	$scope.placas = false;
	
	//METODOS DE USUARIO========================================================
	
	$scope.verificaLogin = function(){
		if($scope.usuarioNome == ""){
				$window.document.getElementById("usuario").style.display = 'none';
				$window.location.href = '../view/ViewLogin.html';
		}
	}
		
	$scope.logout = function(){
		$window.document.cookie = "nome=;";
		$window.document.cookie = "email=;";
		$window.document.cookie = "grupo=;";
		$scope.usuarioNome = getCookie("nome");
		$scope.grupo = getCookie("grupo");
		$window.document.getElementById("usuario").style.display = 'none';
		//redireciona usuário para a home
		$window.location.href = '../view/index.html';
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
	//=========================================================================
	
	//Ao clicar em enviar, grava o json no banco
	$scope.upload = function (){
		if($scope.pacientes != null){

			if($scope.placas){
				$http.post('/api/pacientes/atualizaPlacas/'
							+$scope.usuarioNome, $scope.pacientes)
				.success(function(data) {
					$scope.pacientes = "";
					$scope.inMemory = true;
					$scope.wasSent = true;
					$window.document.getElementById("successInf").style.display = 'block';
				})
				.error(function(data) {
					$window.document.getElementById("infoInf").style.display = 'none';
					$window.document.getElementById("dangerInf").style.display = 'block';
				});
				
			}else{
				//busca o maior numero de dna na base de dados
				$http.get('/api/pacientes/maiordna')
				.success(function(data){
					$scope.maiordna = data;

					$http.post('/api/pacientes/many/'+ 
							$scope.usuarioNome +'/'+ 
							$scope.maiordna, $scope.pacientes)
					.success(function(data) {
						$scope.pacientes = "";
						$scope.inMemory = true;
						$scope.wasSent = true;
						$window.document.getElementById("successInf").style.display = 'block';
					})
					.error(function(data) {
						$window.document.getElementById("infoInf").style.display = 'none';
						$window.document.getElementById("dangerInf").style.display = 'block';
					});
				})
				.error(function(data){
					//TODO
				});
			}
			

		}else{
			
			alert("Nenhum registro para salvar no banco!");
		
		}
	}
	
	//ao clicar em upload, grava o arquivo no servidor
	$scope.enviar = function(){
		if($window.document.getElementById("arquivoInput").files[0] != undefined){
			var formData = new FormData();
			var xhr = new XMLHttpRequest();
			//captura o arquivo pelo id
			var arquivo = $window.document.getElementById("arquivoInput").files[0];
			formData.append("file", arquivo);
			
			xhr.onreadystatechange = function() {
			  if (xhr.readyState == 4) {
			  	var div = document.getElementById('mensagem');
			    var resposta = xhr.responseText;
			    div.innerHTML += resposta;
			  }
			}

			xhr.open("POST", "/file/upload");
			xhr.send(formData);
			$window.document.getElementById("infoInf").style.display = 'block';
			$scope.wasSent = false;
		}
	}

	//método get para buscar os dados no arquivo json gerado e apresentar na view
	$scope.visualizar = function(){
		$window.document.getElementById("load").style.display = 'block';
		$http.get('/file/paciente/getJson/')
		.success(function(data) {
			$scope.numRegistros = data.length;
			$scope.pacientes = data;
			$scope.inMemory = false;
			$window.document.getElementById("load").style.display = 'none';
			carregaIndices();
		})
		.error(function(data) {
			alert("Ação não correspondeu");
			$window.document.getElementById("load").style.display = 'none';
		});
	}
	
	
	//Função que captura o Paciente selecionado na linha da tabela
    $scope.setPacienteSelecionado = function(pac) {
         $scope.paciente = pac;
    };
    
    //Função que habilita botão se arquivo for enviado
    $scope.setEnvio = function(){
    	$scope.wasSent = false;
    };
    
	//divide o array em 50 e transforma em indices para o paginator
	var carregaIndices = function(){
		$scope.indices = [];
	    for (var i = 0; i <= parseInt($scope.numRegistros/50)+1; i++) {
			$scope.indices[i] = i+1;
		}
	    //retorna para o indice 1 do paginator
	    $scope.recarregaTabela(1);
	}
	
	//muda a tabela ao clicar em um valor da paginação
	$scope.recarregaTabela = function(n){
		$scope.posicao = (n-1)*50;
	}
	
	//muda posição de leitura do array ao clicar em um numero do paginator
	$scope.mudaNumPaginacao = function(operacao){
		switch (operacao) {
			case "mais":
				if($scope.paginationNum <= $scope.indices.length)
				$scope.paginationNum++;
				$scope.posicao+=50;
			break;
			case "menos":
				if($scope.paginationNum > 0)
				$scope.paginationNum--;
				$scope.posicao-=50;
			break;
		}
	}
	
	$scope.deletaLinha = function(item) {
		 //apaga a linha do array 
		 var index = $scope.pacientes.indexOf(item);
		 $scope.pacientes.splice(index, 1);
	     $scope.numRegistros = $scope.pacientes.length;
	     //recarrega o paginator
	     carregaIndices();
	}

};




