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
import csv
from six import StringIO
import datetime


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
        rc = getToolByName(self.context, 'reference_catalog')
        
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

        instrumentUID = self.request.form["getInstrumentUID"]
        instrumentObject = rc.lookupObject(instrumentUID)
        instrumentTitle = instrumentObject.Title()

        query["getInstrumentUID"] = instrumentUID

        datalines = []
       
        analyses = bac(query)
        count_analyses = len(analyses)

        for a in analyses:

            # http://localhost:8080/senaite/senaite_catalog_analysis/manage_objectInformation

            #created
            #getResultCaptureDate
            #review_state verified
            #getReferenceAnalysesGroupID
            #getReferenceResults
            #getParentURL
            #getResult
            #getKeyword

            dataline = []

            dataitem = {'value': a.getReferenceAnalysesGroupID}
            dataline.append(dataitem)
            
            dataitem = {'value': a.getKeyword}
            dataline.append(dataitem)

            date = ""

            if a.getResultCaptureDate is not None:
                date = a.getResultCaptureDate.strftime("%Y-%m-%d %H:%M:%S")

            dataitem = {'value': date}
            dataline.append(dataitem)

            dataitem = {'value': a.getResult}
            dataline.append(dataitem)

            dataitem = {'value': a.review_state}
            dataline.append(dataitem)

            datalines.append(dataline)
     

        fieldnames = [
            'Reference Analyses Group ID',
            'Keyword',
            'Result Capture Date',
            'Result',
            'Review State'
        ]
        output = StringIO()
        dw = csv.DictWriter(output, extrasaction='ignore',
                            fieldnames=fieldnames)
        dw.writerow(dict((fn, fn) for fn in fieldnames))
        for row in datalines:
            dw.writerow({
                'Reference Analyses Group ID': row[0]['value'],
                'Keyword': row[1]['value'],
                'Result Capture Date': row[2]['value'],
                'Result': row[3]['value'],
                'Review State': row[4]['value'],
            })
        report_data = output.getvalue()
        output.close()
        date = datetime.datetime.now().strftime("%Y%m%d%H%M")
        setheader = self.request.RESPONSE.setHeader
        setheader('Content-Type', 'text/csv')
        setheader("Content-Disposition",
                    "attachment;filename=\"referenceanalysis_%s_%s.csv\"" % (instrumentTitle, date))
        self.request.RESPONSE.write(report_data)

