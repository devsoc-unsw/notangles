import json
import logging
from concurrent import futures

import grpc

import auto
import autotimetabler_pb2
import autotimetabler_pb2_grpc

# python -m grpc_tools.protoc -I../proto --python_out=. --grpc_python_out=. ../proto/autotimetabler.proto


class AutoTimetablerServicer(autotimetabler_pb2_grpc.AutoTimetablerServicer):
    def FindBestTimetable(self, request, context):
        print("Looking for the best timetable!")
        data = [
            request.start,
            request.end,
            request.days,
            request.gap,
            request.maxdays,
            json.loads(request.periods_list_serialized),
        ]
        return autotimetabler_pb2.AutoTimetableResponse(times=auto.sols(*data))


def main():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    autotimetabler_pb2_grpc.add_AutoTimetablerServicer_to_server(
        AutoTimetablerServicer(), server
    )
    server.add_insecure_port("localhost:50051")
    server.start()
    print("Autotimetabling server is running!")
    server.wait_for_termination()


if __name__ == "__main__":
    logging.basicConfig()
    main()
