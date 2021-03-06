import moment from 'moment'
import './connectioncheck.html'

Template.connectioncheck.events({
  'click #connectButton': (event) => {
    event.preventDefault()
    Meteor.reconnect()
  },
})
Template.connectioncheck.helpers({
  offline: () => (Meteor.status().status === 'failed'
      || Meteor.status().status === 'waiting') && Meteor.status().retryCount > 1,
  nextRetry: () => moment(new Date(Meteor.status().retryTime)).fromNow(),
})
