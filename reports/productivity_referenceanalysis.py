# -*- coding: utf-8 -*-
#
# This file is part of SENAITE.CORE.
#
# SENAITE.CORE is free software: you can redistribute it and/or modify it under
# the terms of the GNU General Public License as published by the Free Software
# Foundation, version 2.
#
# This program is distributed in the hope that it will be useful, but WITHOUT
# ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
# FOR A PARTICULAR PURPOSE. See the GNU General Public License for more
# details.
#
# You should have received a copy of the GNU General Public License along with
# this program; if not, write to the Free Software Foundation, Inc., 51
# Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
#
# Copyright 2018-2021 by it's authors.
# Some rights reserved, see README and LICENSE.

from Products.CMFCore.utils import getToolByName
from bika.lims.browser import BrowserView
from Products.Five.browser.pagetemplatefile import ViewPageTemplateFile
from bika.lims import bikaMessageFactory as _
from bika.lims.utils import t
from bika.lims.utils import formatDateQuery, formatDateParms, logged_in_client
from plone.app.layout.globals.interfaces import IViewView
from senaite.core.workflow import ANALYSIS_WORKFLOW
from zope.interface import implements


class Report(BrowserView):
    implements(IViewView)
    template = ViewPageTemplateFile("templates/productivity_referenceanalysis.pt")

    def __init__(self, context, request, report=None):
        self.report = report
        BrowserView.__init__(self, context, request)

    def __call__(self):

        # get all the data into datalines
        sc = getToolByName(self.context, 'senaite_catalog_setup')
        bac = getToolByName(self.context, 'senaite_catalog_analysis')

        self.report_content = {}
        parms = []
        headings = {}
        headings['header'] = _("Analyses per sample type")
        headings['subheader'] = _("Number of analyses requested per sample type")

        count_all = 0
        query = {'portal_type': 'ReferenceAnalysis'}
       
        date_query = formatDateQuery(self.context, 'getDateCreated')
        if date_query:
            query['created'] = date_query
            requested = formatDateParms(self.context, 'getDateCreated')
            parms.append(
                {'title': _('Created'),
                 'value': requested,
                 'type': 'text'})


        if not self.request.form.get("getInstrumentUID", ""):
            return

        query["getInstrumentUID"] = self.request.form["getInstrumentUID"]

        datalines = []
       
        analyses = bac(query)
        count_analyses = len(analyses)

        dataline = []
        dataitem = {'value': self.request.form["getInstrumentUID"]}
        dataline.append(dataitem)
        dataitem = {'value': count_analyses}

        dataline.append(dataitem)

        datalines.append(dataline)

        count_all += count_analyses

        import csv
        from six import StringIO
        import datetime

        fieldnames = [
            'Sample Type',
            'Analyses',
        ]
        output = StringIO()
        dw = csv.DictWriter(output, extrasaction='ignore',
                            fieldnames=fieldnames)
        dw.writerow(dict((fn, fn) for fn in fieldnames))
        for row in datalines:
            dw.writerow({
                'Sample Type': row[0]['value'],
                'Analyses': row[1]['value'],
            })
        report_data = output.getvalue()
        output.close()
        date = datetime.datetime.now().strftime("%Y%m%d%H%M")
        setheader = self.request.RESPONSE.setHeader
        setheader('Content-Type', 'text/csv')
        setheader("Content-Disposition",
                    "attachment;filename=\"referenceanalysis_%s.csv\"" % date)
        self.request.RESPONSE.write(report_data)

