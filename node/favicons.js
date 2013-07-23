// Generated by CoffeeScript 1.4.0
(function() {
  var DEV, MONGODB_PORT, MONGODB_SERVER, app, db, express, mongo, server,
    _this = this;

  express = require('express');

  mongo = require('mongodb');

  DEV = process.env.NODE_ENV === 'development';
  DEV = true;
  // MONGODB_SERVER = DEV ? 'localhost' : 'db22';
  MONGODB_SERVER = 'app';

  MONGODB_PORT = parseInt(process.env.MONGODB_PORT || 27017, 10);

  if (DEV) {
    server = new mongo.Server(MONGODB_SERVER, MONGODB_PORT, {
      auto_reconnect: true,
      poolSize: 12
    });
  } else {
    server = new mongo.ReplSetServers([
      new mongo.Server(MONGODB_SERVER, MONGODB_PORT, {
        auto_reconnect: true
      })
    ], {
      rs_name: 'nbset'
    });
  }

  db = new mongo.Db('newszeit', server, {
    readPreference: mongo.ReadPreference.SECONDARY_PREFERRED,
    safe: false
  });

  app = express.createServer();

  app.use(express.bodyParser());

  db.open(function(err, client) {
    return client.collection("feed_icons", function(err, collection) {
      _this.collection = collection;
    });
  });

  app.get(/^\/rss_feeds\/icon\/(\d+)\/?/, function(req, res) {
    var etag, feed_id;
    feed_id = parseInt(req.params, 10);
    etag = req.header('If-None-Match');
    return _this.collection.findOne({
      _id: feed_id
    }, function(err, docs) {
      console.log("Req: " + feed_id + ", etag: " + etag);
      if (!err && etag && docs && docs.color === etag) {
        return res.send(304);
      } else if (!err && docs && docs.data) {
        res.header('etag', docs.color);
        return res.send(new Buffer(docs.data, 'base64'), {
          "Content-Type": "image/png"
        });
      } else {
        return res.redirect('/media/img/icons/circular/world.png');
      }
    });
  });

  app.listen(3030);

}).call(this);
