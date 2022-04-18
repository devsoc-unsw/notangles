import logging
from concurrent import futures

import grpc

import auto
import autotimetabler_pb2
import autotimetabler_pb2_grpc

# python -m grpc_tools.protoc -I./ --python_out=. --grpc_python_out=. ./autotimetabler.proto



class AutoTimetablerServicer(autotimetabler_pb2_grpc.AutoTimetablerServicer):
    def FindBestTimetable(self, request, _):
        """Passes request to auto algorithm.

        Args:
            request (request): grpc request message

        Returns:
            [int]: times
        """
        print("Finding a timetable")
        return autotimetabler_pb2.AutoTimetableResponse(times=auto.sols(request))


def main():
    """launches server
    """
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    autotimetabler_pb2_grpc.add_AutoTimetablerServicer_to_server(
        AutoTimetablerServicer(), server
    )
    server.add_insecure_port("0.0.0.0:50051")
    server.start()
    print("Autotimetabling server is running!")
    server.wait_for_termination()


if __name__ == "__main__":
    logging.basicConfig()
    main()
