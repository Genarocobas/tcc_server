var unique = require('array-unique');
var app = require('../server/server');

var models = app.models();

let models2 = [];

models.forEach(function (Model) {
 models2.push(Model.modelName);
});

models2 = unique(models2);

models2.forEach(function (model) {
  let acl = {'model': model, 'property': '*', 'accessType':'*', 'permission': 'DENY', 'principalType': 'ROLE', 'principalId': '$everyone'}
  app.models.appACL.upsertWithWhere({ 'model': model, 'permission': acl.permission}, acl , function (errUpdate, instanceUpdate) {
    if (!errUpdate) {
      acl.permission = 'ALLOW';
      acl.principalId = '$authenticated'
      app.models.appACL.upsertWithWhere({ 'model': model, 'permission': acl.permission}, acl , function (errUpdate, instanceUpdate) {
        if (!errUpdate) {
          if (model === 'user') {
            createExtraACLs();
          }
          console.log('ACL ' + model + ' created!');
        }
      });
    }
  });
});

function createExtraACLs() {
  let acl = {'model': 'user', 'property': 'login', 'accessType':'*', 'permission': 'ALLOW', 'principalType': 'ROLE', 'principalId': '$everyone'}
  app.models.appACL.upsertWithWhere({ 'model': acl.model, 'property': acl.property}, acl , function (errUpdate, instanceUpdate) {
    if (!errUpdate) {
      acl.property = 'create';
      app.models.appACL.upsertWithWhere({ 'model': acl.model, 'property': acl.property}, acl , function (errUpdate, instanceUpdate) {
        if (!errUpdate) {
          acl.property = 'recovery';
          app.models.appACL.upsertWithWhere({ 'model': acl.model, 'property': acl.property}, acl , function (errUpdate, instanceUpdate) {
            if (!errUpdate) {
               console.log('Done...');
               process.exit(0);
            }
          });  
        }
      });  
    }
  });
}