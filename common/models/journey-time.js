'use strict';

module.exports = function(Journeytime) {
	
	Journeytime.createPoint = function(data, cb) {
		data.point = new Date()
		Journeytime.create(data, function(errorCreate, instanceCreate) {
			if (errorCreate) {
				cb(errorCreate)
			} else {
				cb(null, "Ponto registrado com sucesso.")
			}
		})
	}
	
	Journeytime.remoteMethod(
    'createPoint',
    {
      http: { path: '/createPoint', verb: 'post' },
      accepts: { arg: 'data', type: 'object', http: { source: 'body' } },
      returns: { arg: 'body', type: 'object', root: true },
      description: "Registra um novo ponto."
    }
  );

};
