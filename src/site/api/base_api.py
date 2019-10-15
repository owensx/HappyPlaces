import traceback
import uuid
import logging
import abc
import json

from django.core.exceptions import ValidationError
from django.db import IntegrityError
from django.http import HttpResponse


class API(abc.ABC):
    def __init__(self):
        self._logger = logging.getLogger(__name__)

    def handle_request(self, request, **kwargs):
        request_id = str(uuid.uuid4())
        self._logger.debug('Received new request, assigning id ' + request_id)

        try:
            response_body = self.get_response_body(request, kwargs)
            response_body['request_id'] = request_id
        except (IntegrityError, ValidationError) as e:
            self._logger.error(traceback.format_exc())
            return HttpResponse(status=400, reason=e)
        except:
            self._logger.error(traceback.format_exc())
            return HttpResponse(status=500, reason='Internal Server Error, Request Id: ' + request_id)
        else:
            self._logger.debug('Returning below data:')
            self._logger.debug(response_body)

            return HttpResponse(json.dumps(response_body), content_type="application/json")

    @abc.abstractmethod
    def get_response_body(self, request, params):
        ...
