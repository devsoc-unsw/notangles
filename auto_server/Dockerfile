FROM python:3.10.17-slim-bookworm

WORKDIR /auto_server

COPY requirements.txt .

RUN pip3 install -r requirements.txt

COPY . .

EXPOSE 50051

CMD ["python3", "server.py"]
