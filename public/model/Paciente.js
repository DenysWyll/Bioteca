// Paciente.js
var mongoose = require('mongoose');

// Cria um novo Schema com os campos que iremos utilizar no model Paciente

var PacienteSchema = new mongoose.Schema({
  iid : {type : Number,
		 index : true,
		 unique : true},
  
  dnas : [{ _id : Number, 
			coleta : Date, 
	  		reprovado : {type : Boolean,
	  					 lowercase: true},
						  
	  		onda : {type: Number, 
					  index: true},
			soro : { 	s1 : Number, 
						s2 : Number, 
						s3 : Number, 
						s4 : Number},
			
			plasma : { 	  p1 : Number,
						  p2 : Number,
						  p3 : Number,
						  p4 : Number},
			
			rnaLatter1 : Number,
			rnaLatter2 : Number,
			mic1 : Number,
  			mic2 : Number
	  		}],
  nome : { type : String,
	  	   uppercase: true,
	  	   index: true},
  genotipado : Number,
  emPlaca : Number,
  coleta : String, 
  obs : String
});
 
//Define o model Paciente
mongoose.model('Paciente', PacienteSchema);