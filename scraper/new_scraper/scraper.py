#!/usr/bin/env python3

from bs4 import BeautifulSoup
import re
import requests

BASEURL = "http://timetable.unsw.edu.au/2020/"

def removeHtmlSpecials(text):
    newstr = text.replace('&amp;', 'and')
    newstr = newstr.replace('&nbsp', '')
    newstr = newstr.replace('&lt;', '<')
    newstr = newstr.replace('&gt;', '>')

    return newstr

def getCampusAndSubjectAreas(soup):
    # Initialisation
    campuses = []
    refinedData = {}

    # Find all Campus Headings
    minorHeadings = soup.find_all('td', {'class': 'classSearchMinorHeading'})

    # For each heading, filter out false-positives and store element in `campuses`
    for heading in minorHeadings:
        campus = heading.getText()
        if campus != '':
            campuses.append(heading)

    # Find subject area for each campus
    for campus in campuses:
        # Find the table containing subject data relative to the campus heading
        parentTable = campus.parent.findNext('tr')
        heading = parentTable.find('td', {'class' : 'tableHeading'})

        # Get all table entries containing subject data and store into `entries`
        low = heading.parent.parent.find_all('tr', {'class' : 'rowLowlight'})
        high = heading.parent.parent.find_all('tr', {'class' : 'rowHighlight'})
        entries = low + high

        # Construct refined data and store in list relative to campus name in `refinedData`
        campusTitle = campus.getText().strip()
        refinedData[campusTitle] = []

        for entry in entries:
            rowData = {}
            cells = entry.find_all('td', {'class' : 'data'})

            # Ensure data is in correct format
            if len(cells) != 3:
                continue

            # Store data in relevant locations
            rowData['code'] = cells[0].getText()
            rowData['subjectArea'] = cells[1].getText()
            rowData['school'] = cells[2].getText()

            rowData['link'] = BASEURL + cells[0].find('a')['href']

            # Add row data to collected data
            refinedData[campusTitle].append(rowData)

    return refinedData


data = requests.get(BASEURL)
data = data.text

soup = BeautifulSoup(data, 'html.parser')

print(getCampusAndSubjectAreas(soup))
