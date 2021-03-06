import i18next from 'i18next'
import { saveAs } from 'file-saver'
import { FlowRouter } from 'meteor/ostrio:flow-router-extra'
import { NullXlsx } from '@neovici/nullxlsx'
import i18nextReady from '../../startup/client/startup.js'
import './periodtimetable.html'
import './pagination.js'
import './limitpicker.js'

Template.periodtimetable.onCreated(function periodtimetableCreated() {
  this.periodTimecards = new ReactiveVar()
  this.totalPeriodTimeCards = new ReactiveVar()
  Tracker.autorun(() => {
    if (this.data.project.get()
      && this.data.resource.get()
      && this.data.period.get()
      && this.data.limit.get()
      && this.data.customer.get()) {
      Meteor.call('getTotalHoursForPeriod',
        {
          projectId: this.data.project.get(),
          userId: this.data.resource.get(),
          period: this.data.period.get(),
          customer: this.data.customer.get(),
          limit: this.data.limit.get(),
          page: Number(FlowRouter.getQueryParam('page')),
        }, (error, result) => {
          if (error) {
            console.error(error)
          } else {
            this.periodTimecards.set(result.totalHours)
            this.totalPeriodTimeCards.set(result.totalEntries)
          }
        })
    }
  })
})
Template.periodtimetable.onRendered(() => {
  const templateInstance = Template.instance()
  templateInstance.autorun(() => {
    if (templateInstance.subscriptionsReady() && i18nextReady.get()) {
      let data = []
      if (templateInstance.periodTimecards.get()) {
        data = templateInstance.periodTimecards.get()
          .map((entry) => Object.entries(entry)
            .map((key) => key[1]))
      }
      const columns = [
        { name: i18next.t('globals.project'), editable: false },
        { name: i18next.t('globals.resource'), editable: false },
        {
          name: Meteor.user() && Meteor.user().profile.timeunit === 'd' ? i18next.t('globals.day_plural') : i18next.t('globals.hour_plural'),
          editable: false,
          format: (value) => value.toFixed(Meteor.user().profile.precision
            ? Meteor.user().profile.precision : 2),
        },
      ]
      if (!templateInstance.datatable) {
        import('frappe-datatable/dist/frappe-datatable.css').then(() => {
          import('frappe-datatable').then((datatable) => {
            const DataTable = datatable.default
            templateInstance.datatable = new DataTable('#datatable-container', {
              columns,
              serialNoColumn: false,
              clusterize: false,
              layout: 'ratio',
              showTotalRow: true,
              data,
              noDataMessage: i18next.t('tabular.sZeroRecords'),
            })
          })
        })
      }
      if (templateInstance.datatable && templateInstance.periodTimecards.get()
        && window.BootstrapLoaded.get()) {
        templateInstance.datatable
          .refresh(data, columns)
        if (templateInstance.periodTimecards.get().length === 0) {
          $('.dt-scrollable').height('auto')
        } else {
          $('[data-toggle="tooltip"]').tooltip()
        }
      }
    }
  })
})
Template.periodtimetable.helpers({
  periodTimecards() {
    return Template.instance().periodTimecards.get()
  },
  totalPeriodTimeCards() {
    return Template.instance().totalPeriodTimeCards
  },
})
Template.periodtimetable.events({
  'click .js-export-csv': (event, templateInstance) => {
    event.preventDefault()
    const csvArray = [`\uFEFF${i18next.t('globals.project')},${i18next.t('globals.resource')},${Meteor.user() && Meteor.user().profile.timeunit === 'd' ? i18next.t('globals.day_plural') : i18next.t('globals.hour_plural')}\r\n`]
    for (const timeEntry of templateInstance.periodTimecards.get()) {
      csvArray.push(`${timeEntry.projectId},${timeEntry.userId},${timeEntry.totalHours}\r\n`)
    }
    saveAs(new Blob(csvArray, { type: 'text/csv;charset=utf-8;header=present' }), `titra_total_time_${templateInstance.data.period.get()}.csv`)
  },
  'click .js-export-xlsx': (event, templateInstance) => {
    event.preventDefault()
    const data = [[i18next.t('globals.project'), i18next.t('globals.resource'), Meteor.user() && Meteor.user().profile.timeunit === 'd' ? i18next.t('globals.day_plural') : i18next.t('globals.hour_plural')]]
    for (const timeEntry of templateInstance.periodTimecards.get()) {
      data.push([timeEntry.projectId, timeEntry.userId, timeEntry.totalHours])
    }
    saveAs(new NullXlsx('temp.xlsx', { frozen: 1, filter: 1 }).addSheetFromData(data, 'total time').createDownloadUrl(), `titra_total_time_${templateInstance.data.period.get()}.xlsx`)
  },
})
Template.periodtimetable.onDestroyed(() => {
  FlowRouter.setQueryParams({ page: null })
})
