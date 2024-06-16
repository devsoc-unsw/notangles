import logging
import os
from concurrent import futures

import grpc
import sentry_sdk

import auto
import autotimetabler_pb2
import autotimetabler_pb2_grpc

# the command to compile proto file --> python -m grpc_tools.protoc -I./ --python_out=. --grpc_python_out=. ./autotimetabler.proto

sentry_sdk.init(
    os.environ.get("SENTRY_INGEST_AUTO_SERVER"),
    traces_sample_rate=float(os.environ.get("SENTRY_TRACE_RATE_AUTO_SERVER", "0")),
)

class AutoTimetablerServicer(autotimetabler_pb2_grpc.AutoTimetablerServicer):
    def FindBestTimetable(self, request, _context):
        """Passes request to auto algorithm.

        Args:
            request (request): grpc request message

        Returns:
            [int]: times
        """
        logging.info("Finding a timetable!")
        allocatedTimes, isOptimal = auto.sols(request)
        logging.info(allocatedTimes)
        return autotimetabler_pb2.AutoTimetableResponse(times=allocatedTimes, optimal=isOptimal)

def serve():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    autotimetabler_pb2_grpc.add_AutoTimetablerServicer_to_server(AutoTimetablerServicer(), server)
    server.add_insecure_port('[::]:50051')
    server.start()
    logging.info("Server started, listening on port 50051")
    server.wait_for_termination()

if __name__ == '__main__':
    logging.basicConfig(level=logging.INFO)
    serve()
