module.exports = function (RED) {
  const zendesk = require('node-zendesk');

  function ZendeskConfig(config) {
    RED.nodes.createNode(this, config);

    var node = this;

    node.connect = function () {
      if (!node.client) {
        node.client = zendesk.createClient({
          username: node.credentials.username,
          token: node.credentials.token,
          disableGlobalState: true,
          remoteUri: config.remoteUri
        });
      }
    };

  }

  RED.nodes.registerType('ZendeskConfig', ZendeskConfig, {
    credentials: {
      username: {type: 'text'},
      token: {type: 'password'}
    }
  });

  function ReadZendesk(config) {
    RED.nodes.createNode(this, config);

    var node = this;

    node.zendeskConfig = RED.nodes.getNode(config.zendeskConfig);

    if (node.zendeskConfig) {
      node.zendeskConfig.connect();

      node.on('input', function (msg) {
        var cb = function(err, req, result) {
          if (err || req.statusCode >= 400) {
            node.error(err, msg);
          } else {
            msg.payload = result;
            node.send(msg);
          }
        };

        if (msg.ticketId) {
          node.zendeskConfig.client.tickets.show(msg.ticketId, cb);
        } else if (msg.query) {
          node.zendeskConfig.client.search.query(msg.query, cb);
        } else {
            node.error('No query or ticket ID given', msg);
        }
      });
    }
    else {
      node.error('ZenDesk connection not configured');
    }
  }

  RED.nodes.registerType('zendesk-read', ReadZendesk);

  function WriteZendesk(config) {
    RED.nodes.createNode(this, config);

    var node = this;

    node.zendeskConfig = RED.nodes.getNode(config.zendeskConfig);

    if (node.zendeskConfig) {
      node.zendeskConfig.connect();

      node.on('input', function (msg) {
        var cb = function(err, req, result) {
          if (err || req.statusCode >= 400) {
            node.error(err, msg);
          } else {
            msg.payload = result;
            node.send(msg);
          }
        };

        var ticket = {
          ticket: JSON.parse(JSON.stringify(msg.payload))
        };

        if (msg.ticketId) {
          node.zendeskConfig.client.tickets.update(msg.ticketId, ticket, cb);
        } else {
          node.zendeskConfig.client.tickets.create(ticket, cb);
        }
      });
    }
    else {
      node.error('ZenDesk connection not configured');
    }
  }

  RED.nodes.registerType('zendesk-write', WriteZendesk);

  function ReadZendeskComments(config) {
    RED.nodes.createNode(this, config);

    var node = this;

    node.zendeskConfig = RED.nodes.getNode(config.zendeskConfig);

    if (node.zendeskConfig) {
      node.zendeskConfig.connect();

      node.on('input', function (msg) {
        var cb = function(err, req, result) {
          if (err || req.statusCode >= 400) {
            node.error(err, msg);
          } else {
            msg.payload = result;
            node.send(msg);
          }
        };

        node.zendeskConfig.client.tickets.getComments(msg.ticketId, cb);
      });
    }
    else {
      node.error('ZenDesk connection not configured');
    }
  }

  RED.nodes.registerType('zendesk-read-comments', ReadZendeskComments);

};
