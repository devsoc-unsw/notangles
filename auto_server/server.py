import logging
from concurrent import futures

import grpc

import autotimetabler_pb2
import autotimetabler_pb2_grpc
import clingo_solver

# the command to compile proto file --> python -m grpc_tools.protoc -I./ --python_out=. --grpc_python_out=. ./autotimetabler.proto


class AutoTimetablerServicer(autotimetabler_pb2_grpc.AutoTimetablerServicer):
    def FindBestTimetable(self, request, context):
        """Finds the best timetable.

        Args:
            request (request): grpc request message

        Returns:
            AutoTimetableResponse: The best result using the existing wire format.
        """
        logging.info("Finding a timetable!")
        try:
            result = clingo_solver.solve(request)
        except ValueError as error:
            context.abort(grpc.StatusCode.INVALID_ARGUMENT, str(error))

        primary = result.primary
        if primary is None:
            return autotimetabler_pb2.AutoTimetableResponse()

        logging.info("Found an optimal timetable")
        return autotimetabler_pb2.AutoTimetableResponse(
            times=primary.times,
            optimal=primary.optimal,
        )


def serve():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    autotimetabler_pb2_grpc.add_AutoTimetablerServicer_to_server(
        AutoTimetablerServicer(), server
    )
    server.add_insecure_port("[::]:50051")
    server.start()
    logging.info("Server started, listening on port 50051")
    server.wait_for_termination()


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    serve()
