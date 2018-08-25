var server = require('./server');
var ds = server.dataSources.mysql;

/**
 * Liste no array lbTables todos os modelos que deseja que seja criado uma tabela no banco de dados.
 * O nome das tabelas deve seguir o mesmo padrão de nome descrito no arquivo ./server/model-config.json
 * Considerando que esteja na raiz do projeto, o script pode ser executado com o comando: 
 * node ./scripts/create-tables.js
 * 
 * Obs. Os relacionamentos presentes nos modelos não serão replicados nas tabelas, os mesmos devem ser criados manualmente.
 */
var lbTables = ['appACL', 'appAccessToken', 'appRoleMapping', 'appRole', 'employee'];
ds.automigrate(lbTables, function(er) {
  if (er){
    throw er;
  } 
  console.log('Loopback tables [' - lbTables - '] created in ', ds.adapter.name);
  ds.disconnect();
  console.log("Process done!");

  process.exit(0);
});