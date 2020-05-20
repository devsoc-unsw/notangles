#!/usr/bin/env python3

from bs4 import BeautifulSoup
import re
import requests
import json
import grequests

BASE_URL = "http://timetable.unsw.edu.au/2020/"

def remove_html_specials(text):
    newstr = text.replace('&amp;', 'and')
    newstr = newstr.replace('&nbsp', '')
    newstr = newstr.replace('&lt;', '<')
    newstr = newstr.replace('&gt;', '>')

    return newstr

def scrape_table(soup, url, fields):

    # Initialisation
    campuses = []
    refined_data = {}

    # Find all Campus Headings
    minor_headings = soup.find_all('td', {'class': 'classSearchMinorHeading'})

    # For each heading, filter out false-positives and store element in `campuses`
    for heading in minor_headings:
        campus = heading.get_text()
        if campus != '':
            campuses.append(heading)

    # Find subject area for each campus
    for campus in campuses:
        # Find the table containing subject data relative to the campus heading
        parent_table = campus.parent.find_next('tr')
        heading = parent_table.find('td', {'class' : 'tableHeading'})

        # Get all table entries containing subject data and store into `entries`
        low = heading.parent.parent.find_all('tr', {'class' : 'rowLowlight'})
        high = heading.parent.parent.find_all('tr', {'class' : 'rowHighlight'})
        entries = low + high

        # Construct refined data and store in list relative to campus name in `refinedData`
        campus_title = campus.getText().strip()
        refined_data[campus_title] = []

        for entry in entries:
            row_data = {}
            cells = entry.find_all('td', {'class' : 'data'})

            # Ensure data is in correct format
            if len(cells) != 3:
                continue

            # Store data in relevant locations
            for i in range(len(fields)):
                row_data[fields[i]] = cells[i].get_text()
            row_data['link'] = BASE_URL + cells[0].find('a')['href']

            # Add row data to collected data
            refined_data[campus_title].append(row_data)

    return refined_data

def get_campus_and_subject_areas(soup):
    return scrape_table(soup, BASE_URL, ["code", "subjectArea", "school"])

def scrape_faculty(soup, refined_data):
    key_list = refined_data.keys()
    for campus in key_list:
        faculty_reqs = [grequests.get(faculty['link']) for faculty in refined_data[campus]]
        faculty_res = grequests.map(faculty_reqs)
        faculty_res = [res._content.decode() for res in faculty_res]
        for faculty_index in range(len(refined_data[campus])):
            faculty = refined_data[campus][faculty_index]
            faculty_data = faculty_res[faculty_index]
            faculty_soup = BeautifulSoup(faculty_data, 'html.parser')
            scraped_faculty = scrape_table(faculty_soup, faculty['link'], ["code", "name", "uoc"])
            for field in scraped_faculty.keys():
                refined_data[campus][faculty_index][field.lower()] = scraped_faculty[field]
    return refined_data


data = requests.get(BASE_URL)
data = data.text

soup = BeautifulSoup(data, 'html.parser')

#print(scrape_faculty(soup, get_campus_and_subject_areas(soup)))
print(json.dumps(scrape_faculty(soup, get_campus_and_subject_areas(soup))))
