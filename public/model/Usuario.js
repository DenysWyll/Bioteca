// Usuario.js
var mongoose = require('mongoose');

// Cria um novo Schema com os campos que iremos utilizar no model Usuario

var UsuarioSchema = new mongoose.Schema({
	nome : {type: String, required: true},
	email : {type: String, required: true, index: { unique: true }},
	senha : {type: String, required: true},
	grupo : {type: Number, required: true}
});
 
//Define o model Paciente
mongoose.model('Usuario', UsuarioSchema);
