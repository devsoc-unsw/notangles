#!/usr/bin/env bash
set -euo pipefail

cd -- "$(dirname -- "${BASH_SOURCE[0]}")"

PROTO_DIR="../proto"
PROTO_SRC="$PROTO_DIR/autotimetabler.proto"
PROTO_DEST="./src/proto"
PROTOC="./node_modules/.bin/grpc_tools_node_protoc"

mkdir -p "$PROTO_DEST"

# Generate JavaScript messages and gRPC bindings
"$PROTOC" \
  --plugin=protoc-gen-jspb=./node_modules/.bin/protoc-gen-js \
  --jspb_out="import_style=commonjs,binary:$PROTO_DEST" \
  --grpc_out="grpc_js:$PROTO_DEST" \
  --proto_path="$PROTO_DIR" \
  "$PROTO_SRC"

# Generate TypeScript declarations
"$PROTOC" \
  --plugin=protoc-gen-ts=./node_modules/.bin/protoc-gen-ts \
  --ts_out="grpc_js:$PROTO_DEST" \
  --proto_path="$PROTO_DIR" \
  "$PROTO_SRC"

# Generate Python bindings
python3 -m grpc_tools.protoc \
  --proto_path="$PROTO_DIR" \
  --python_out=../auto_server \
  --grpc_python_out=../auto_server \
  "$PROTO_SRC"
