from django.http import HttpResponse
from django.utils.deprecation import MiddlewareMixin


class HealthCheckMiddleware(MiddlewareMixin):
    def process_request(self, request):
        print(request)
        print(request.META)
        if request.META["PATH_INFO"] == "/healthcheck":
            return HttpResponse("ready to serve")
