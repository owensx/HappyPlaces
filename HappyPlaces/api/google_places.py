from HappyPlaces import google_helper
from HappyPlaces.api.base_api import API


class GooglePlacesAPI(API):
    def get_response_body(self, request, params):
        query = request.GET["queryString"]
        count = int(request.GET["count"])

        places = google_helper.query_google_places(query=query)

        data = []

        for place in places[:count]:
            data.append(google_helper.format_google_details(place))

        return {
            'body': data
        }
