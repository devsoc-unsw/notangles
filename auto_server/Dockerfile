FROM python:3.10.17-slim-bookworm

WORKDIR /auto_server

COPY requirements.txt .

RUN pip3 install -r requirements.txt

COPY . .

RUN python -m grpc_tools.protoc -I. --python_out=. --grpc_python_out=. autotimetabler.proto

EXPOSE 50051

CMD ["python3", "server.py"]
