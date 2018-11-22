import os
import sys
import json
import pytz
import dateutil.parser
import requests
import logging
from collections import defaultdict
from datetime import datetime, timedelta
from flask import Flask, request
from flask_restplus import Resource, Api, fields
from pipeline import Pipeline
from backend import get_data
from app_settings import WEIGHTS_LOCATION, SPEEDS_LOCATION, OUTBOUND_LOCATION, INBOUND_LOCATION, STOPS_LOCATION


def get_flask_objects():
    weights_loc = os.environ.get("WEIGHTS_LOCATION", WEIGHTS_LOCATION)
    speeds_loc = os.environ.get("SPEEDS_LOCATION", SPEEDS_LOCATION)
    outbound_loc = os.environ.get("OUTBOUND_LOCATION", OUTBOUND_LOCATION)
    inbound_loc = os.environ.get("INBOUND_LOCATION", INBOUND_LOCATION)
    stops_loc = os.environ.get("STOPS_LOCATION", STOPS_LOCATION)

    logging.info("Initializing pipeline")
    pipeline = Pipeline(weights_loc, speeds_loc, outbound_loc, inbound_loc, stops_loc)
    logging.info("Pipeline ready!")
    app = Flask(__name__)
    api = Api(app)

    recommendations = api.model('DepartureRecommendations',{
        'outbound': fields.List(fields.DateTime()),
        'inbound': fields.List(fields.DateTime())
    })

    @api.route('/recommend/next_departure')
    class NextDeparture(Resource):
        @api.marshal_with(recommendations, code=200, description='Success')
        def get(self):
            timestamp = datetime.now(pytz.timezone('UTC'))
            logging.info("Retrieving data from GraphQL")
            data = get_data(timestamp=timestamp)
            logging.info("Processing..")
            return pipeline.process(data["buses"], timestamp.astimezone(pytz.timezone('America/Mexico_City')))

    return app, api


def build_app():
    app, _ = get_flask_objects()
    return app


if __name__ == "__main__":
    # Export the schema if there's an argument, and run the app
    app, api = get_flask_objects()
    if len(sys.argv) > 1:
        with app.test_request_context():
            schema = api.__schema__
        with open(sys.argv[1], "w") as f:
            json.dump(schema, f)
    app.run(debug=True)
