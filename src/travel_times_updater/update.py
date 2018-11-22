import os
import pytz
import click
import time
import logging
import traceback

from datetime import datetime, timedelta
from backend import get_data, post_results
from pipeline import Pipeline
from app_settings import MODEL_LOCATION, INBOUND_LOCATION, OUTBOUND_LOCATION, STOPS_LOCATION, GRAPHQL_URL


tz = pytz.timezone('America/Mexico_City')
def wait_until(utc_ts, timeout, period=1, *args, **kwargs):
    must_end = time.time() + timeout
    while time.time() < must_end:
        if datetime.now(pytz.timezone('UTC')) >= utc_ts:
            return True
        time.sleep(period)
    return False


@click.command()
@click.option('--wait_time', default=60)
def main(wait_time):
    pipeline = Pipeline(
        os.environ.get("MODEL_LOCATION", MODEL_LOCATION),
        os.environ.get("OUTBOUND_LOCATION", OUTBOUND_LOCATION),
        os.environ.get("INBOUND_LOCATION", INBOUND_LOCATION), 
        os.environ.get("STOPS_LOCATION", STOPS_LOCATION)
    )

    while True:
        try:
            ts = datetime.now(pytz.timezone('UTC')).replace(second=0, microsecond=0) + timedelta(minutes=1)
            logging.info("Waiting until {}".format(ts.astimezone(tz)))
            wait_until(ts, 1000000000)
            logging.info("Getting data")
            data = get_data(GRAPHQL_URL, ts)
            logging.info("Processing") 
            results = pipeline.process(data)
            post_results(GRAPHQL_URL, results, ts.astimezone(tz))
        except Exception as e:
            logging.error(e)
            logging.error(traceback.format_exc(limit=100))


if __name__ == "__main__":
    main()