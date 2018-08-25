/*
 * Este scripte realiza a descoberta do esquema à partir do datasource e faz a criação dos modelos;
 * O nome do modelo será o mesmo nome da tabela do banco, porem no padrão "dashed lowercase";
 * Caso o script encontre modelos antigos que tenham o mesmo do modelo a ser criado, 
 * um backup do modelo antigo será criado automaticamente;
 * 
 * Considerando que esteja na raiz do projeto, o script pode ser executado com o comando: 
 * node ./scripts/discover-schema.js
 * 
 * Obs. Os relacionamentos presentes no banco não serão replicados nos modelos, a relação deve ser criada manualmente.
 */

var path = require('path');
var fs = require('fs');
var app = require('loopback');

var outputDirectory = path.resolve(__dirname, '../common', 'models');
console.log(outputDirectory);
// Load db driver
var mysql = require('mysql');

var numberOfModels = 0;
var doneCount = 0;

function callback(err, schema) {
  if (err) {
    console.error(err);
    return;
  }
  if (typeof schema != 'object') {
    throw 'schema object not defined';
  }
  console.log("Auto discovery for schema " + schema.name);
  /*
  * Convert schema name from CamelCase to dashed lowercase (loopback format 
  * for json files describing models), for example: CamelCase -> camel-case.
  */
  //var model_name = schema.name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
  var model_name = mapName(null, schema.name);

  console.log('Writing model JSON file..');
  // write model definition JSON file
  var now_ms = Date.now();
  var model_JSON_file = path.join(outputDirectory, model_name + '.json');
  // if JSON file exists
  if (fs.existsSync(model_JSON_file)) {
    // save a backup copy of the JSON file
    let bkp_file = path.join(outputDirectory, model_name + ".json" + '.bkp_' + now_ms);
    fs.renameSync(model_JSON_file, bkp_file);
    console.log("Backing up old JSON file..");
  }
  // write the new JSON file
  fs.writeFileSync(
    model_JSON_file,
    JSON.stringify(schema, null, 2)
  );
  console.log("JSON saved to " + model_JSON_file);

  console.log('Writing model JS file..');
  // write model JS file, useful to extend a model with custom methods
  var model_JS_file = path.join(outputDirectory, model_name + '.js');
   // if JS file exists
  if (fs.existsSync(model_JS_file)) {
    // save a backup copy of the JS file
    let bkp_file = path.join(outputDirectory, model_name + ".js" + '.bkp_' + now_ms)
    fs.renameSync(model_JS_file, bkp_file);
    console.log("Backing up old JS file..");
  } 
  // write the new JS file
  fs.writeFileSync(
    model_JS_file,
    "'use strict'; \n\nmodule.exports=function(" + model_name + ") {\n\n};"
  );
  console.log("JSON saved to " + model_JSON_file);

  // Append model to model-config.json
  var model_config_file = path.resolve(__dirname, '../server/model-config.json');
  var model_config_obj = JSON.parse(fs.readFileSync(model_config_file, 'utf8'));
  if (typeof model_config_obj[model_name] === 'undefined') {
    model_config_obj[model_name] = { 'dataSource': datasourceName, 'public': true };
    let json_content = JSON.stringify(model_config_obj, null, 2);
    fs.writeFileSync(model_config_file, JSON.stringify(model_config_obj, null, 2));
  }

  doneCount++;
  if (doneCount == (numberOfModels)) {
    console.log(" ");
    console.log("______                             ______ _____ _   _  _____ _   ");
    console.log("| ___ \\                            |  _  \\  _  | \\ | ||  ___| |  ");
    console.log("| |_/ / __ ___   ___ ___  ___ ___  | | | | | | |  \\| || |__ | |  ");
    console.log("|  __/ '__/ _ \\ / __/ _ \\/ __/ __| | | | | | | | . ` ||  __|| |  ");
    console.log("| |  | | | (_) | (_|  __/\__ \\__ \\  | |/ /\\ \\_/ / |\\  || |___|_|  ");
    console.log("\\_|  |_|  \\___/ \\___\\___||___/___/ |___/  \\___/\\_| \\_/\\____/(_)  ");
    console.log("                                                               ");
    console.log(" ");                                          
    process.exit(0);
  }
}

// custom name mapper
function mapName(type, name) {
  return name;
};

var datasourceName = "";
function main() {
      var datasource = JSON.parse(fs.readFileSync(path.resolve(__dirname, '..', 'server/datasources.json'), 'utf8'));
      Object.keys(datasource).forEach(function (key) {
        if(key !== "db" && datasourceName === ""){
          datasourceName = key;
        }
      });

      var con = mysql.createConnection(datasource[datasourceName]);
      var ds = app.createDataSource(datasourceName, datasource[datasourceName]);

      con.connect(function(err) {
        if (err){
          throw err;
        } 
        con.query("show tables from " + datasource[datasourceName].database, function (err, result, fields) {
          if (err) {
            throw err;
          }

          numberOfModels = result.length;
          console.log(this.numberOfModels);
          result.forEach(function(element) {
            Object.keys(element).forEach(function (key) {
               options = {};
               options.nameMapper = mapName;
              ds.discoverSchema(element[key], options, callback);
              console.log(element[key]);
            });
          }, this);
        });
      });
}
// Start the process
main();