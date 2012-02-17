var TwitterSearch = function(params){
  this.type = 'twitter';
  this.query       = new TwitterQuery(params);
  this.filter      = new TwitterFilter(params);
  IWitness.log('*** searching %s - %s ***', params.start, params.end);
  this.total = 0;
  this.target = 0;
}

_.extend(TwitterSearch.prototype, {
  fetch: function(target){
    this.target += target;
    this.query.getNext(_.bind(this._gotData, this));
  },

  _gotData: function(data){
    if(!data.results.length) return Ember.sendEvent(this, 'done');
    var filtered = this.filter.filter(data.results);

    IWitness.log('%s to %s - %s found / %s passed',
                moment(_.first(data.results).created_at).format('MM/DD hh:mma'),
                moment(_.last(data.results).created_at).format('MM/DD hh:mma'),
                data.results.length,
                filtered.length);

    if (filtered.length)
      Ember.sendEvent(this, 'data', filtered);

    this.total += filtered.length;

    if (this.total >= this.target) {
      IWitness.log('--- got %s total results ---', this.total);
      Ember.sendEvent(this, 'done');
    } else if ( !this.query.isDone ) {
      this.query.getNext(_.bind(this._gotData, this));
    } else {
      Ember.sendEvent(this, 'done');
    }
  }
});

