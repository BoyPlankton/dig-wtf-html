window.APP = window.APP || {}

class dnsType {
  constructor (id, type, desc) {
    this.id = id
    this.type = type
    this.desc = desc
    this.answers = []
    this.ttl = 0
    this.timeout = 1000
    this.url = 'https://cloudflare-dns.com/dns-query'
    this.resolver = new doh.DohResolver(this.url)
  }

  resolveName(name) {
    this.resolver.query(name, this.type, 'POST', null, this.timeout)
      .then(response => {
        console.log(JSON.stringify(response))
        if (response.answers.length > 0) {
          this.ttl = response.answers[0].ttl
          _.each(response.answers, a => {
            this.answers.push(a.data)
          })
        }
      })
      .catch(console.error)
  }

  test() {
    console.log("test")
  }
}

const dnsTypes = [
  new dnsType(1,   'A',          'IPv4 Address'),
  new dnsType(2,   'NS',         'Name Servers'),
  new dnsType(13,  'HINFO',      'Host Information'),
  new dnsType(15,  'MX',         'Mail Exchange'),
  new dnsType(16,  'TXT',        'Text'),
  new dnsType(17,  'RP',         'Responsible Person'),
  new dnsType(18,  'AFSDB',      'AFS Database Location'),
  new dnsType(28,  'AAAA',       'IPv6 Address'),
  new dnsType(29,  'LOC',        'Geographical Location'),
  new dnsType(33,  'SRV',        'Service Locator'),
  new dnsType(36,  'KX',         'Key Exchange'),
  new dnsType(37,  'CERT',       'Certificate'),
  new dnsType(42,  'APL',        'Address Prefix List'),
  new dnsType(44,  'SSHFP',      'SSH Public Key Fingerprint'),
  new dnsType(45,  'IPSECKEY',   'IPsec Key'),
  new dnsType(49,  'DHCID',      'DHCP Identifier'),
  new dnsType(52,  'TLSA',       'TLS Certificate Association'),
  new dnsType(53,  'SMIMEA',     'S/MIME Association'),
  new dnsType(55,  'HIP',        'Host Identification Protocol'),
  new dnsType(61,  'OPENPGPKEY', 'OpenPGP Public Key'),
  new dnsType(64,  'SVCB',       'Service Binding'),
  new dnsType(65,  'HTTPS',      'HTTPS Binding'),
  new dnsType(108, 'EUI48',      'MAC Address (EUI-48)'),
  new dnsType(109, 'EUI64',      'MAC Address (EUI-64)'),
  new dnsType(256, 'URI',        'Uniform Resource Identifier'),
  new dnsType(257, 'CAA',        'Certificate Authority Authorization')
]

APP.DigResultModel = Backbone.Model.extend({})

APP.DigResultsCollection = Backbone.Collection.extend({
  model: APP.DigResultModel
})

APP.DigSearchView = Backbone.View.extend({
  el: $('#search-form'),

  events: {
    'submit': 'onSubmit'
  },

  initialize: function () {
    this.hostname = $('input[name=hostname]')
  },

  onSubmit: function (e) {
    e.preventDefault()

    Backbone.history.navigate('#/dig/' + this.hostname.val(), false)
  }
})

APP.DigResultsView = Backbone.View.extend({
  el: $('#results'),

  template: _.template($('#dig-template').html()),

  initialize: function(options) {
    this.collection = options.collection;

    _.bindAll(this, 'render');

    this.collection.bind('reset', this.render);
    this.collection.bind('add', this.render);
    this.collection.bind('remove', this.render);
  },

  render: function () {
    var results = { results: [] }

    this.collection.forEach(c => {
      results.results.push(c.attributes)
    })

    this.$el.html(this.template(results))
    
    return this
  }
})

APP.DigRouter = Backbone.Router.extend({
  routes: {
    'dig/:host': 'dig'
  },

  initialize: function () {
    this.searchview = new APP.DigSearchView()
    this.collection = new APP.DigResultsCollection()
    this.resultview = new APP.DigResultsView({ collection: this.collection })

    Backbone.history.start()
  },

  dig: function (name) {
    this.collection.reset()

    resolver = new doh.DohResolver('https://cloudflare-dns.com/dns-query')
    timeout = 1000

    resolver.query(name, 'CNAME', 'POST', null, timeout)
      .then(response => {
        console.log(JSON.stringify(response, null, 4))

        if (response.answers.length > 0) {
          this.collection.add([{ type: 'CNAME', desc: 'Canonical Name', ttl: response.answers[0].ttl, answers: response.answers }])
        } else {
          _.each(dnsTypes, v => {
            resolver.query(name, v.type, 'POST', null, timeout)
              .then(response => {
                console.log(JSON.stringify(response, null, 4))

                if (response.answers.length > 0) {
                  this.collection.add([{ type: v.type, desc: v.desc, ttl: response.answers[0].ttl, answers: response.answers }])
                }
              })
              .catch(console.error)
          })
        }
      })
      .catch(console.error)
  }
})
