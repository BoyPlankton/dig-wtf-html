"use strict";

window.APP = window.APP || {};

APP.DigModel = Backbone.Model.extend({
});

APP.DigCollection = Backbone.Collection.extend({
  model: APP.DigModel,
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

APP.DigResultsView = Backbone.View.extend({
  el: $('#results'),

  template: _.template($('#digTemplate').html()),

  render: function(){
    var results = {results: []}
    this.collection.forEach( c => {
      console.log(c.attributes);
      results.results.push(c.attributes);
    })
    this.$el.html(this.template(results));
    return this; // enable chained calls
  }
});

APP.DigRouter = Backbone.Router.extend({
  routes: {
    "dig/:host": "dig"
  },

  initialize: function () {
    this.searchview = new APP.DigSearchView();
    this.collection = new APP.DigCollection();
    this.resultview = new APP.DigResultsView({collection: this.collection});

    // start backbone watching url changes
    Backbone.history.start();
  },

  dig: function (host) {
    var self = this;
    var timeout = 1000;
    var url = "https://cloudflare-dns.com/dns-query";

    /*
    const type_map = {
      1: "A",
      2: "NS",
      3: "MD",
      4: "MF",
      5: "CNAME",
      7: "MB",
      8: "MG",
      9: "MR",
      11: "WKS",
      12: "PTR",
      13: "HINFO",
      14: "MINFO",
      15: "MX",
      16: "TXT",
      17: "RP",
      18: "AFDB",
      19: "X25",
      20: "ISDN",
      21: "RT",
      22: "NSAP",
      23: "NSAP-PTR",
      24: "SIG",
      25: "KEY",
      26: "PX",
      27: "GPOS",
      28: "AAAA",
      29: "LOC",
      30: "NXT",
      31: "EID",
      32: "NIMLOC",
      33: "SRV",
      34: "ATMA",
      35: "NAPTR",
      36: "KX",
      37: "CERT",
      38: "A6",
      39: "DNAME",
      40: "SINK",
      41: "OPT",
      42: "APL",
      43: "DS",
      44: "SSHFP",
      45: "IPSECKEY",
      46: "RRSIG",
      47: "NSEC",
      48: "DNSKEY",
      49: "DHCID",
      50: "NSEC3",
      51: "NSEC3PARAM",
      52: "TLSA",
      53: "SMIMEA",
      55: "HIP",
      56: "NINFO",
      57: "RKEY",
      58: "TALINK",
      59: "CDS",
      60: "CDNSKEY",
      61: "OPENPGPKEY",
      62: "CSYNC",
      63: "ZONEMD",
      64: "SVCB",
      65: "HTTPS",
      99: "SPF",
      100: "UINFO",
      101: "UID",
      102: "GID",
      103: "UNSPEC",
      104: "NID",
      105: "L32",
      106: "L64",
      107: "LP",
      108: "EUI48",
      109: "EUI64",
      249: "TKEY",
      250: "TSIG",
      251: "IXFR",
      252: "AXFR",
      253: "MAILB",
      254: "MAILA",
      256: "URI",
      257: "CAA",
      258: "AVC",
      259: "DOA",
      260: "AMTRELAY",
      32768: "TA"
    };
    */

    const types = [
      "A",
      "AAAA",
      "NS",
      "MX",
      "TXT",
      "SOA",
      "CNAME"
    ];

    console.log(host);

    const resolver = new doh.DohResolver(url);

    this.collection.reset();

    types.forEach( v => {
      resolver.query(host, v, "POST", null, timeout)
        .then(response => {
          console.log(JSON.stringify(response, null, 4));

          response.answers.forEach( answer => {
            console.log(answer);
            this.collection.add(new APP.DigModel( parseAnswer(answer) ));
            this.resultview.render();
          });
        })
        .catch(console.error);
    });
  }
});