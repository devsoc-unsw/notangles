from bs4 import BeautifulSoup
import requests
import re

BASE_URL = "http://timetable.unsw.edu.au/2020/COMP1511.html"

def get_class_info(soup):
    sessions = []
    refined_data = {}

    minor_headings = soup.find_all('td', {'class': 'classSearchSectionHeading'})

    for heading in minor_headings:
        section = heading.get_text()
        if re.search("Detail", section):
            sessions.append(heading)

    for session in sessions:
        parent_table = session.parent.find_next('table')
        class_forms = parent_table.find_all('td', {'class': 'formBody'})
        for class_form in class_forms:
            rows = class_form.find_all('tr')
            for row in rows:
                URL_data = row.find_all('td', {'class': ['label', 'data']})
                for data_point in URL_data:
                    line = data_point.get_text()
                    print(line)
            print('-----------------------')

data = requests.get(BASE_URL)
data = data.text

soup = BeautifulSoup(data, 'html.parser')

get_class_info(soup)
