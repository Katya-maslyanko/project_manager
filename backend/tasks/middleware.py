from threading import local
from django.conf import settings

_thread_locals = local()

class CurrentRequestMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        _thread_locals.request = request
        response = self.get_response(request)
        return response

def get_current_request():
    return getattr(_thread_locals, 'request', None)

settings.CURRENT_REQUEST = get_current_request