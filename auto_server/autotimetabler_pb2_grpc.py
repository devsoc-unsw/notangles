# Generated by the gRPC Python protocol compiler plugin. DO NOT EDIT!
"""Client and server classes corresponding to protobuf-defined services."""
import grpc

import autotimetabler_pb2 as autotimetabler__pb2


class AutoTimetablerStub(object):
    """Missing associated documentation comment in .proto file."""

    def __init__(self, channel):
        """Constructor.

        Args:
            channel: A grpc.Channel.
        """
        self.FindBestTimetable = channel.unary_unary(
                '/AutoTimetabler/FindBestTimetable',
                request_serializer=autotimetabler__pb2.TimetableConstraints.SerializeToString,
                response_deserializer=autotimetabler__pb2.AutoTimetableResponse.FromString,
                )


class AutoTimetablerServicer(object):
    """Missing associated documentation comment in .proto file."""

    def FindBestTimetable(self, request, context):
        """Missing associated documentation comment in .proto file."""
        context.set_code(grpc.StatusCode.UNIMPLEMENTED)
        context.set_details('Method not implemented!')
        raise NotImplementedError('Method not implemented!')


def add_AutoTimetablerServicer_to_server(servicer, server):
    rpc_method_handlers = {
            'FindBestTimetable': grpc.unary_unary_rpc_method_handler(
                    servicer.FindBestTimetable,
                    request_deserializer=autotimetabler__pb2.TimetableConstraints.FromString,
                    response_serializer=autotimetabler__pb2.AutoTimetableResponse.SerializeToString,
            ),
    }
    generic_handler = grpc.method_handlers_generic_handler(
            'AutoTimetabler', rpc_method_handlers)
    server.add_generic_rpc_handlers((generic_handler,))


 # This class is part of an EXPERIMENTAL API.
class AutoTimetabler(object):
    """Missing associated documentation comment in .proto file."""

    @staticmethod
    def FindBestTimetable(request,
            target,
            options=(),
            channel_credentials=None,
            call_credentials=None,
            insecure=False,
            compression=None,
            wait_for_ready=None,
            timeout=None,
            metadata=None):
        return grpc.experimental.unary_unary(request, target, '/AutoTimetabler/FindBestTimetable',
            autotimetabler__pb2.TimetableConstraints.SerializeToString,
            autotimetabler__pb2.AutoTimetableResponse.FromString,
            options, channel_credentials,
            insecure, call_credentials, compression, wait_for_ready, timeout, metadata)
