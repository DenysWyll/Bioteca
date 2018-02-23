var expect = chai.expect;

describe('Testes Bioteca', function(){
	
	var scope, control, http, window, id;
	
	chai.use(chaiHttp);
	
	beforeEach(angular.mock.module('bioteca'));
	
	beforeEach(inject(function($rootScope, $controller, $http){
		scope = $rootScope.$new();
		control = $controller("mainController", 
				{$scope: scope});
	}));
	
	//descreve o caso de teste
	describe('Testes de http reponse',function(){
		
		//Busca por todos os registros no banco e verfica o tamanho do array
		it('Deve retornar array carregado com 3060 registros', function(done){//Sempre usar em processos async(done)
			chai.request('http://localhost:8080')
			.get('/api/pacientes/')
			.end(function(err,res){
				//Sempre usar em processos async(done)
				if(err) done(err);
				expect(res.body.length).to.equal(3060); 
				//Sempre usar em processos async
				done();
			});
		});
		
		//Insere um novo registro
		it('Deve inserir um novo registro', function(done){
			
			
			var json = {
					"iid" : 000000,
					"nome" : "TESTE",
					"status" : "Em Placa",
					"coleta" : "01/02/2003",
					"num1" : 0000,
					"coleta1" : "01/02/2003",
					"statusDna1" : 0,
					"num2" : 0000,
					"coleta2" : "01/02/2003",
					"statusDna2" : 0,
					"num3" : 0000,
					"coleta3" : "01/02/2003",
					"statusDna3" : 0,
					"s1" : 123,
					"s2" : 123,
					"s3" : 123,
					"s4" : 123,
					"p1" : 123,
					"p2" : 123,
					"p3" : 123,
					"p4" : 123,
					"rna1" : 1234,
					"rna2" : 1234,
					"observ" : "TESTE DO CHAI"
			};
			
			chai.request('http://localhost:8080')
			.post('/api/pacientes/'+ "Teste Chai")
			.send(json)
			.end(function (err, res) {
			     if(err) done(err);
			     expect(err).to.be.null;
			     expect(res).to.have.status(200);
			     done();
			  });
		});
		
		//ALTERA PACIENTE COM SUCESSO
		it('Deve alterar o paciente criado', function(done){
			
			chai.request('http://localhost:8080')
			.get('/api/pacientes/busca/iid/00000')
			.end(function (err, res) {
				if(err) done(err);
				expect(err).to.be.null;
				expect(res).to.have.status(200);
				id = res.body[0]._id;
				
				var json = {
						"iid" : 000000,
						"nome" : "TESTE",
						"status" : "Em Placa",
						"coleta" : "01/02/2003",
						"dnas" : [
							{
							"_id" : 99991,
							"coleta" : "01/02/2003",
							"reprovado" : 0
							},
							{
							"_id" : 99992,
							"coleta" : "01/02/2003",
							"reprovado" : 0
							},
							{
							"_id" : 99993,
							"coleta" : "01/02/2003",
							"reprovado" : 0
							}
						],
						"soro" : {
								"s1" : 123,
								"s2" : 123,
								"s3" : 123,
								"s4" : 123
								},
						"plasma" : {
								"p1" : 123,
								"p2" : 123,
								"p3" : 123,
								"p4" : 123
								},
						"rna1" : 1234,
						"rna2" : 1234,
						"obs" : "TESTE DO CHAI ALTERA"
				};
				
				chai.request('http://localhost:8080')
				.put('/api/pacientes/'+id+'/Teste%20Chai')
				.send(json)
				.end(function (err, res) {
					if(err) done(err);
					expect(err).to.be.null;
					expect(res).to.have.status(200);
					done();
				});
			});
			
		});
		
		//PESQUISA POR DNA O1 COM SUCESSO
		it('Deve buscar paciente por DNA onda 1', function(done){
			chai.request('http://localhost:8080')
			.get('/api/pacientes/busca/dna1/99991')
			.end(function (err, res) {
				if(err) done(err);
				expect(err).to.be.null;
				expect(res).to.have.status(200);
				done();
			});
		});
		
		//PESQUISA POR DNA O2 COM SUCESSO
		it('Deve buscar paciente por DNA onda 2', function(done){
			chai.request('http://localhost:8080')
			.get('/api/pacientes/busca/dna2/99992')
			.end(function (err, res) {
				if(err) done(err);
				expect(err).to.be.null;
				expect(res).to.have.status(200);
				done();
			});
		});
		
		//PESQUISA POR DNA O3 COM SUCESSO
		it('Deve buscar paciente por DNA onda 3', function(done){
			chai.request('http://localhost:8080')
			.get('/api/pacientes/busca/dna3/99993')
			.end(function (err, res) {
				if(err) done(err);
				expect(err).to.be.null;
				expect(res).to.have.status(200);
				done();
			});
		});
		
		//PESQUISA POR NOME DO PACIENTE COM SUCESSO
		it('Deve buscar paciente por Nome', function(done){
			chai.request('http://localhost:8080')
			.get('/api/pacientes/busca/nome/TESTE')
			.end(function (err, res) {
				if(err) done(err);
				expect(err).to.be.null;
				expect(res).to.have.status(200);
				done();
			});
		});
		
		//PESQUISA POR IID COM SUCESSO
		it('Deve buscar paciente iid', function(done){
			chai.request('http://localhost:8080')
			.get('/api/pacientes/busca/iid/00000')
			.end(function (err, res) {
				if(err) done(err);
				expect(err).to.be.null;
				expect(res).to.have.status(200);
				done();
			});
		});
		
		//		PESQUISA POR DNA O1 CAMPO NULO
		it('Deve buscar sem sucesso paciente por DNA onda 1 campo nulo', function(done){
			chai.request('http://localhost:8080')
			.get('/api/pacientes/busca/dna1/')
			.end(function (err, res) {
				if(err) done(err);
				expect(err).to.be.null;
				expect(res.body).to.be.null;
				done();
			});
		});
		
		//		PESQUISA POR DNA O1 NÃO EXISTENTE
		it('Deve buscar sem sucesso paciente por DNA onda 1 não existente', function(done){
			chai.request('http://localhost:8080')
			.get('/api/pacientes/busca/dna1/789789789')
			.end(function (err, res) {
				if(err) done(err);
				expect(err).to.be.null;
				expect(res).to.have.status(200);
				expect(res.body.length).to.equal(0);
				done();
			});
		});
		
		//		PESQUISA POR DNA O2 CAMPO NULO
		it('Deve buscar sem sucesso paciente por DNA onda 2 campo nulo', function(done){
			chai.request('http://localhost:8080')
			.get('/api/pacientes/busca/dna2/')
			.end(function (err, res) {
				if(err) done(err);
				expect(err).to.be.null;
				expect(res.body).to.be.null;
				done();
			});
		});
		
		//		PESQUISA POR DNA O2 NÃO EXISTENTE
		it('Deve buscar sem sucesso paciente por DNA onda 2 não existente', function(done){
			chai.request('http://localhost:8080')
			.get('/api/pacientes/busca/dna2/789789789')
			.end(function (err, res) {
				if(err) done(err);
				expect(err).to.be.null;
				expect(res).to.have.status(200);
				expect(res.body.length).to.equal(0);
				done();
			});
		});
		
		//		PESQUISA POR DNA O3 CAMPO NULO
		it('Deve buscar sem sucesso paciente por DNA onda 3 campo nulo', function(done){
			chai.request('http://localhost:8080')
			.get('/api/pacientes/busca/dna3/')
			.end(function (err, res) {
				if(err) done(err);
				expect(err).to.be.null;
				expect(res.body).to.be.null;
				done();
			});
		});
		
		//		PESQUISA POR DNA O3 NÃO EXISTENTE
		it('Deve buscar sem sucesso paciente por DNA onda 3 não existente', function(done){
			chai.request('http://localhost:8080')
			.get('/api/pacientes/busca/dna3/789789789')
			.end(function (err, res) {
				if(err) done(err);
				expect(err).to.be.null;
				expect(res).to.have.status(200);
				expect(res.body.length).to.equal(0);
				done();
			});
		});
		
		//		PESQUISA POR NOME DO PACIENTE NÃO EXISTENTE
		it('Deve buscar sem sucesso paciente por Nome não existente', function(done){
			chai.request('http://localhost:8080')
			.get('/api/pacientes/busca/nome/TESTENAOEXISTENTE')
			.end(function (err, res) {
				if(err) done(err);
				expect(err).to.be.null;
				expect(res).to.have.status(200);
				expect(res.body.length).to.equal(0);
				done();
			});
		});
		
		//		PESQUISA POR NOME DO PACIENTE CAMPO NULO
		it('Deve buscar sem sucesso paciente por Nome campo nulo', function(done){
			chai.request('http://localhost:8080')
			.get('/api/pacientes/busca/nome/')
			.end(function (err, res) {
				if(err) done(err);
				expect(err).to.be.null;
				expect(res).to.have.status(200);
				expect(res.body).to.be.null;
				done();
			});
		});
		
		//		PESQUISA POR IID NÃO EXISTENTE
		it('Deve buscar sem sucesso paciente por iid não existente', function(done){
			chai.request('http://localhost:8080')
			.get('/api/pacientes/busca/iid/789789789')
			.end(function (err, res) {
				if(err) done(err);
				expect(err).to.be.null;
				expect(res).to.have.status(200);
				expect(res.body.length).to.equal(0);
				done();
			});
		});

		//		PESQUISA POR IID CAMPO NULO
		it('Deve buscar sem sucesso paciente por iid campo nulo', function(done){
			chai.request('http://localhost:8080')
			.get('/api/pacientes/busca/iid/')
			.end(function (err, res) {
				if(err) done(err);
				expect(err).to.be.null;
				expect(res).to.have.status(200);
				expect(res.body).to.be.null;
				done();
			});
		});

		//EXCLUI PACIENTE COM SUCESSO
		it('Deve excluir o paciente', function(done){
			chai.request('http://localhost:8080')
			.delete('/api/pacientes/'+id+'/Teste%20Chai')
			.end(function (err, res) {
				if(err) done(err);
				expect(err).to.be.null;
				expect(res).to.have.status(200);
				done();
			});
		});
	});
		
});
