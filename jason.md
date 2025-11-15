# Document

## Things about the auto_server gRPC server and backend client

- Reason of adding grpcio-tools to requirements.txt:
  - To properly compile the .proto files into Python code within the Docker container.
  - `RUN python -m grpc_tools.protoc -I. --python_out=. --grpc_python_out=. autotimetabler.proto` in Dockerfile
- This ensures the gRPC server can handle requests as defined in the .proto file.

- Client connection details:
  - Host: `AUTO_SERVER_HOST_NAME` (set in environment/config)
  - Port: `AUTO_SERVER_HOST_PORT` (set in environment/config)
  - Ensure these match the Docker run command port mapping (50051:50051).
- Use of `autotimetabler.ts`:

  - Using `ts-proto` for generating TypeScript gRPC client code.

  ```
  pnpx protoc \
  --plugin=protoc-gen-ts_proto=/Users/jp/notangles-server-rewrite/server/node_modules/.bin/protoc-gen-ts_proto \
  --ts_proto_out=src/auto/proto \
  --ts_proto_opt=nestJs=true,useSnakeTypeName=false \
  --proto_path=../auto_server \
  ../auto_server/autotimetabler.proto
  ```

  - This will generate TypeScript code compatible with NestJS framework for client-server communication.

- Steps to build and run the auto_server Docker container:
  1.  Start Colima (if you're using Colima for Docker):
      ```
      colima start
      ```
  2.  Navigate to the `auto_server` directory.
  3.  Build the Docker image:
      ```
      docker build -t notangles-auto .
      ```
  4.  Run the Docker container:
      ```
      docker run -d -p 50051:50051 --name autotimetable notangles-auto
      ```
  5.  Check logs to ensure the server is running:
      ```
      docker logs -f autotimetable
      ```
  6.  Test the connection using bruno:
  - Use Guest login request
  - Find the TimetableID for the user
  - Add a course with that TimetableID
  - Call the AutoTimetabler request
  7.  Stop and remove the container when done:
  ```
  docker stop autotimetable
  docker rm autotimetable
  ```

## TODO:

- Test is that support multiple courses
- Implement that logic after getting the response from the `FindBestTimetable` method.
- Selecting classes based on the optimal timetable and update on the prisma database.
