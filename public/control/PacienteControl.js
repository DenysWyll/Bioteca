var bioteca = angular.module('bioteca',[]);

/*
 * @Author Denys Wylliam <denys.wylliam@gmail.com>
 */

bioteca.controller('mainController', function($scope, $http, $window){

	$scope.usuarioNome = getCookie("nome");
	$scope.grupo = getCookie("grupo");
	$scope.posicao = 0;
	$scope.paginationNum = 0;
	$scope.indices = [];
	
	//order by
	$scope.sortType = 'name';
	$scope.sortReverse = false;
	
	$scope.todos = [];
	
	$scope.addTodo = function(title, completed){
		$scope.todos.push({
			title: title,
			completed: completed
		});
	};
	
    // Quando acessar a página, carrega todos os pacientes e envia para a view($scope)
	$scope.refresh = function (){
        $http.get('/api/pacientes')
            .success(function(data) {
                $scope.pacientes = data;
                $scope.filtrados = data;
                //$scope.formPaciente = {};
            })
            .error(function(data) {
                console.log('Error: ' + data);
            });
    };
    
    //METODOS DE USUARIO============================================================
    
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
	//==================================================================
	
	
    // Quando clicar no botão Criar, envia informações para a API Node
    $scope.criarPaciente = function() {
        $http.post('/api/pacientes/' + $scope.usuarioNome, $scope.formPaciente)
            .success(function(data) {
                // Limpa o formulário para criação de outros pacientes
                $scope.formPaciente = {};
                $scope.pacientes = data;
                $scope.filtrados = data;
                console.log(data);
                $window.document.getElementById("successInf").style.display = 'block';
            })
            .error(function(data) {
                console.log('Error: ' + data);
                $window.document.getElementById("dangerInf").style.display = 'block';
            });
    };
 
    // Ao clicar no botão Remover, deleta o Paciente
    $scope.deletarPaciente = function(id) {
    	if (confirm("Apagar esse registro?") == true) {
	        $http.delete('/api/pacientes/' + id + "/" + $scope.usuarioNome)
	            .success(function(data) {
	                $scope.pacientes = data;
	                $scope.filtrados = data;
	                carregaIndices();
	            })
	            .error(function(data) {
	                console.log('Error: ' + data);
	            });
    	}
    };
    
    
    //converte o formato da data para dd/mm/yyyy
    var convertDate = function(inputFormat) {
    	  function pad(s) { return (s < 10) ? '0' + s : s; }
    	  var d = new Date(inputFormat);
    	  return [pad(d.getDate()), pad(d.getMonth()+1), d.getFullYear()].join('/');
    }
    
     //Ao clicar no botão pesquisar, busca o Paciente   
    $scope.buscarPacienteEspecifico = function(pesq) {

		$window.document.getElementById("load").style.display = 'block';
		
		$http.get('/api/pacientes/busca/' + $scope.pesq + "/" + pesq)
			.success(function(data) {
			
				$scope.pacientes = data;
				$scope.filtrados = data;
				
				carregaIndices();
				$window.document.getElementById("downPanel").style.display = 'block';
				$window.document.getElementById("load").style.display = 'none';
				//captura o nome do arquivo gerado para download
				$http.get('/file/pacientes/download/capturaNomeArquivo/')
				.success(function(data) {
					$scope.arquivo = data;
				})
				.error(function(data) {
					console.log('Error: ' + data);
				});
			
		})
		.error(function(data) {
			console.log('Error: ' + data);
			$window.document.getElementById("load").style.display = 'none';
		});
    };
    
    // Ao clicar no botão Editar, busca o Paciente selecionado e o coloca no formulario
    $scope.editarPaciente = function(paciente) {
                $scope.formPaciente = paciente;
                $scope.formPaciente.dnas[0].coleta = convertDate($scope.formPaciente.dnas[0].coleta);
                $scope.formPaciente.dnas[1].coleta = convertDate($scope.formPaciente.dnas[1].coleta);
                $scope.formPaciente.dnas[2].coleta = convertDate($scope.formPaciente.dnas[2].coleta);
                $scope.formPaciente.coleta = convertDate($scope.formPaciente.coleta);
    };
    
    // Recebe o JSON do Paciente e atualiza
    $scope.atualizarPaciente = function() {        
        $http.put('/api/pacientes/' + $scope.formPaciente._id +"/"+ $scope.usuarioNome, $scope.formPaciente)
        .success( function(response){
        	
            $scope.refresh();
            carregaIndices();
            $window.document.getElementById("successEditInf").style.display = 'block';
            
        })
        .error(function(data){
        	$window.document.getElementById("dangerInf").style.display = 'block';
        });
    };
    
    //Função que captura o Paciente selecionado na linha da tabela
    $scope.setPacienteSelecionado = function(pac) {
         $scope.paciente = pac;
    };
    
       
    //divide o array em 50 e transforma em indices para o paginator
    var carregaIndices = function(){
    	$scope.indices = [];
    	var tamanhoArray = $scope.filtrados.length;
    	
    	//apenas cria indices se o numero de registros ultrapassarem 50
    	if(tamanhoArray > 50){

    		for (var i = 0; i <= parseInt(tamanhoArray/50); i++) {
    			$scope.indices[i] = i+1;
			}
			
    	}else{
    		$scope.indices[0] = 1;
    	}
        
        //retorna para o indice 1 do paginator
        $scope.recarregaTabela(1);
    }
    
    //muda a tabela ao clicar em um valor da paginação
    $scope.recarregaTabela = function(n){
    	$scope.paginationNum = n;
    	$scope.posicao = (n-1)*50;
    }
    
    //muda posição de leitura do array ao clicar em um numero do paginator
    $scope.mudaNumPaginacao = function(operacao){
    	switch (operacao) {
		case "mais":
			if($scope.paginationNum < $scope.indices.length){
				$scope.paginationNum++;
				$scope.posicao+=50;
			}
			break;
		case "menos":
			if($scope.paginationNum > 1){
				$scope.paginationNum--;
				$scope.posicao-=50;
			}
			break;
		}
    }
    
});

