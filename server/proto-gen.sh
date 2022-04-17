#!/bin/bash

PROTO_DEST=./src/proto

# # generate js codes via grpc-tools
# npx grpc_tools_node_protoc \
# --js_out=import_style=commonjs,binary:./${PROTO_DEST} \
# --grpc_out=./${PROTO_DEST} \
# -I ./ \
# ./*.proto


# # generate d.ts codes
# protoc \
# --plugin=protoc-gen-ts=./node_modules/.bin/protoc-gen-ts \
# --ts_out=./${PROTO_DEST} \
# -I ./ \
# ./*.proto




npx grpc_tools_node_protoc --js_out=import_style=commonjs,binary:./src/proto --grpc_out=./src/proto -I ./ ./autotimetabler.proto
npx grpc_tools_node_protoc --plugin=protoc-gen-ts=./node_modules/.bin/protoc-gen-ts --ts_out=./src/proto -I ./ ./autotimetabler.proto