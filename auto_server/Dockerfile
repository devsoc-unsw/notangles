FROM python:3.10.11-slim-buster

WORKDIR /auto_server

COPY requirements.txt requirements.txt

RUN pip3 install -r requirements.txt

COPY . .

EXPOSE 50051

CMD [ "python3", "server.py"]
