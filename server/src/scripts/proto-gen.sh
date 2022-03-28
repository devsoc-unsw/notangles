#!/bin/bash
npx grpc_tools_node_protoc \
    --js_out=import_style=commonjs,binary:./ \
    --grpc_out=./ \
    --ts_out=./ \
    autotimetabler.proto