#!/bin/bash

PROTO_DEST=./src/proto

FINAL_TS=$PROTO_DEST/autotimetabler_grpc_pb.d.ts
FINAL_JS=$PROTO_DEST/autotimetabler_grpc_pb.js

npx grpc_tools_node_protoc --js_out=import_style=commonjs,binary:./src/proto --grpc_out=./src/proto -I ./ ./autotimetabler.proto
npx grpc_tools_node_protoc --plugin=protoc-gen-ts=./node_modules/.bin/protoc-gen-ts --ts_out=./src/proto -I ./ ./autotimetabler.proto

sed -i -r 's/(import.*")grpc/\1@grpc\/grpc-js/' $FINAL_TS       # replaces grpc import with @grpc/grpc-js
sed -i -r 's/(require.*'')grpc/\1@grpc\/grpc-js/' $FINAL_JS     # replaces grpc import with @grpc/grpc-js

python3 -m grpc_tools.protoc -I./ --python_out=../auto_server --grpc_python_out=../auto_server ./autotimetabler.proto