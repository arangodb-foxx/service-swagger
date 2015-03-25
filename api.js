'use strict';
var _ = require('underscore');
var Foxx = require('org/arangodb/foxx');
var FoxxManager = require('org/arangodb/foxx/manager');
var ctrl = new Foxx.Controller(applicationContext);
var jsonSchemaPrimitives = [
  'array',
  'boolean',
  'integer',
  'number',
  'null',
  'object',
  'string'
];

ctrl.get('/swagger.json', function (req, res) {
  var foxx = FoxxManager.routes(applicationContext.configuration.appPath);
  var app = foxx.appContext.app;
  var swagger = parseRoutes(applicationContext.configuration.appPath, foxx.routes, foxx.models);
  res.json({
    swagger: '2.0',
    info: {
      description: app._manifest.description,
      version: app._manifest.version,
      title: app._manifest.name,
      license: app._manifest.license && {name: app._manifest.license}
    },
    host: getHost(req),
    basePath: app._mount,
    schemes: [req.protocol],
    paths: swagger.paths,
    // securityDefinitions: {},
    definitions: swagger.definitions
  });
});

function fixSchema(model) {
  if (!model) {
    return undefined;
  }
  if (!model.type) {
    model.type = 'object';
  }
  if (model.type === 'object') {
    _.each(model.properties, function (prop, key) {
      model.properties[key] = fixSchema(prop);
    });
  } else if (model.type === 'array') {
    if (!model.items) {
      model.items = {
        anyOf: _.map(jsonSchemaPrimitives, function (type) {
          return {type: type};
        })
      };
    }
  }
  return model;
}

function swaggerifyPath(path) {
  return path.replace(/(?::)([^\/]*)/g, '{$1}');
}

function getHost(req) {
  return (
    (req.protocol === 'http' && req.server.port === '80') ||
    (req.protocol === 'https' && req.server.port === '443')
  ) ? req.server.address : req.server.address + ':' + req.server.port;
}

function parseRoutes(tag, routes, models) {
  var paths = {};
  var definitions = {};

  _.each(routes, function (route) {
    var path = swaggerifyPath(route.url.match);
    _.each(route.url.methods, function (method) {
      if (!paths[path]) {
        paths[path] = {};
      }
      paths[path][method] = {
        tags: [tag],
        summary: route.docs.summary,
        description: route.docs.notes,
        operationId: route.docs.nickname,
        responses: {
          default: {
            description: 'undocumented body',
            schema: {properties: {}, type: 'object'}
          }
        },
        parameters: route.docs.parameters.map(function (param) {
          var parameter = {
            in: param.paramType,
            name: param.name,
            description: param.description,
            required: param.required
          };
          var schema;
          if (jsonSchemaPrimitives.indexOf(param.dataType) !== -1) {
            schema = {type: param.dataType};
          } else {
            schema = {'$ref': '#/definitions/' + param.dataType};
            if (!definitions[param.dataType]) {
              definitions[param.dataType] = fixSchema(_.clone(models[param.dataType]));
            }
          }
          if (param.paramType === 'body') {
            parameter.schema = schema;
          } else if (schema.type) {
            parameter.type = schema.type;
          } else {
            parameter.type = 'string';
          }
          return parameter;
        })
      };
    });
  });

  return {
    paths: paths,
    definitions: definitions
  };
}
