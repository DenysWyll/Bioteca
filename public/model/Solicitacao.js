var mongoose = require('mongoose');


var SolicitacaoSchema = new mongoose.Schema({
  justificativa : String,
  status: String
});
 
mongoose.model('Solicitacao', SolicitacaoSchema);
