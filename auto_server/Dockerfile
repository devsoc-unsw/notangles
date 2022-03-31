FROM python:3.10.4-slim-buster

WORKDIR /auto_server

COPY requirements.txt requirements.txt

RUN pip3 install -r requirements.txt

COPY . .

CMD [ "python3", "server.py", "--host=0.0.0.0"]