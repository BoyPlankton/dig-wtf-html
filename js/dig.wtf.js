"use strict";

window.APP = window.APP || {};

// Router
APP.DigRouter = Backbone.Router.extend({
  routes: {
    "dig/:host": "dig"
  },

  $container: $('#results'),

  initialize: function () {
    this.collection = new APP.DigCollection();
    this.searchview = new APP.DigSearchView();

    // start backbone watching url changes
    Backbone.history.start();
  },

  dig: function (host) {
    var self = this;
    
    this.collection.url = '/v3/' + host;
    
    this.collection.fetch({
      reset: true,
      success: function(){
        var view = new APP.DigView({collection: self.collection});
        self.$container.html(view.render().el);
      },
      error: function(){
        console.log("error");
      }
    });
  }
});

// Models
APP.DigModel = Backbone.Model.extend({
});

APP.DigCollection = Backbone.Collection.extend({
  model: APP.DigModel,

  parse: function (data) {
    var self = this;

    _.each(data, function(item, index){
      var result = new self.model();
      
      result.set('_id', index);
      result.set('name', item['name']);
      result.set('ttl', item['TTL']);
      result.set('type', item['type']);
      result.set('value', item['data']);
      
      self.push(result);
    })

    return this.models;
  }
});

// Views
APP.DigView = Backbone.View.extend({
	template: _.template($('#digTemplate').html()),

  render: function () {
    this.$el.html(
    	this.template({results: this.collection.toJSON()})
    );

    return this;
  }
});

APP.DigSearchView = Backbone.View.extend({
  el: $("#searchForm"),

  events: {
      // listen for the submit event of the form
      "submit": "onSubmit",
  },

  initialize: function() {
    this.hostname = $("input[name=hostname]");
  },

  onSubmit: function(e) {
    e.preventDefault();

    Backbone.history.navigate('#/dig/' + this.hostname.val(), false);
  },
});
