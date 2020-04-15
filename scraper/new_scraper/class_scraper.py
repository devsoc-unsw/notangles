from bs4 import BeautifulSoup
import requests
import re

BASEURL = "http://timetable.unsw.edu.au/2020/COMP1511.html"

def getClassInfo(soup):
    sessions = []
    refinedData = {}

    minorHeadings = soup.find_all('td', {'class': 'classSearchSectionHeading'})

    for heading in minorHeadings:
        section = heading.getText()
        if re.search("Detail", section):
            sessions.append(heading)

    for session in sessions:
        parentTable = session.parent.findNext('table')
        classForms = parentTable.find_all('td', {'class': 'formBody'})
        for classForm in classForms:
            rows = classForm.find_all('tr')
            for row in rows:
                URLdata = row.find_all('td', {'class': ['label', 'data']})
                for dataPoint in URLdata:
                    line = dataPoint.getText()
                    print(line)
            print('-----------------------')

data = requests.get(BASEURL)
data = data.text

soup = BeautifulSoup(data, 'html.parser')

getClassInfo(soup)
