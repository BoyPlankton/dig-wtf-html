window.APP = window.APP || {}

function parseAnswers (answers, dnsType) {
  var response = {
    name: '',
    ttl: 0,
    type: '',
    value: [],
    desc: ''
  }

  answers.forEach(answer => {
    response.name = answer.name
    response.ttl = answer.ttl
    response.type = answer.type
    response.value.push(answer.data)
    response.desc = dnsType.desc
  })

  return response
}

function formatA (data) {
  return '<a href="https://talosintelligence.com/reputation_center/lookup?search=' + data + '">' + data + '</a>'
}

function formatCNAME (data) {
  return '<a href="#/dig/' + data + '">' + data + '</a>'
}

function formatMX (data) {
  return data.preference + ' ' + data.exchange
}

function formatSOA (data) {
  return data.mname + '. ' + data.rname + '. ' + data.serial + ' ' + data.refresh + ' ' + data.retry + ' ' + data.expire + ' ' + data.minimum
}

function formatAnswer (type, answer) {
  switch (type) {
    case 'A':
      answer = formatA(answer)
      break
    case 'CNAME':
      answer = formatCNAME(answer)
      break
    case 'MX':
      answer = formatMX(answer)
      break
    case 'SOA':
      answer = formatSOA(answer)
      break
  }

  return answer
}

APP.DigModel = Backbone.Model.extend({
})

APP.DigCollection = Backbone.Collection.extend({
  model: APP.DigModel
})

APP.DigSearchView = Backbone.View.extend({
  el: $('#search-form'),

  events: {
    // listen for the submit event of the form
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

  render: function () {
    var results = { results: [] }
    this.collection.forEach(c => {
      results.results.push(c.attributes)
    })
    this.$el.html(this.template(results))
    return this // enable chained calls
  }
})

APP.DigRouter = Backbone.Router.extend({
  routes: {
    'dig/:host': 'dig'
  },

  initialize: function () {
    this.searchview = new APP.DigSearchView()
    this.collection = new APP.DigCollection()
    this.resultview = new APP.DigResultsView({ collection: this.collection })

    // start backbone watching url changes
    Backbone.history.start()
  },

  dig: function (host) {
    var timeout = 1000
    var url = 'https://cloudflare-dns.com/dns-query'

    const dnsTypes = [
      { type: 'A', desc: 'IPv4 Address' },
      { type: 'NS', desc: 'Name Servers' },
      { type: 'MX', desc: 'Mail Exchange' },
      { type: 'TXT', desc: 'Text' },
      { type: 'AAAA', desc: 'IPv6 Address' }
    ]

    console.log(host)

    const resolver = new doh.DohResolver(url)

    this.collection.reset()

    // if there's a CNAME then there isn't anything else.
    resolver.query(host, 'CNAME', 'POST', null, timeout)
      .then(response => {
        console.log(JSON.stringify(response, null, 4))

        if (response.answers.length > 0) {
          this.collection.add(new APP.DigModel(parseAnswers(response.answers, { type: 'CNAME', desc: 'Canonical Name' })))
          this.resultview.render()
        } else {
          _.each(dnsTypes, v => {
            resolver.query(host, v.type, 'POST', null, timeout)
              .then(response => {
                console.log(JSON.stringify(response, null, 4))

                if (response.answers.length > 0) {
                  this.collection.add(new APP.DigModel(parseAnswers(response.answers, v)))
                  this.resultview.render()
                }
              })
              .catch(console.error)
          })
        }
      })
      .catch(console.error)
  }
})
