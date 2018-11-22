import os
import json
import logging
import requests

from collections import defaultdict
from datetime import datetime, timedelta
from app_settings import GRAPHQL_URL, CURRENT_ROUTE

route_assignment_query = '''
query {{
    asignedRoute (
        where: {{
            m1ID: "{route_id}"
        }}
    ) {{
        buses
    }}
}}
'''

bus_locations_query = '''
query {{
    busLocations(where: {{
        owner: {{
            m1ID_in: {m1IDs}
        }},
        timestamp_gte: "{timestamp}"
    }},
    orderBy: timestamp_ASC) {{
        owner {{
            m1ID
        }}
        position {{
            latitude
            longitude
        }}
        timestamp
    }}
}}
'''

graphql_url = os.environ.get("GRAPHQL_URL", GRAPHQL_URL)
route_id = os.environ.get("CURRENT_ROUTE", CURRENT_ROUTE)


def get_assigned_buses(route_id):
    query = route_assignment_query.format(route_id=route_id)
    results = requests.post(url=graphql_url, json={"query": query}).json()
    logging.info(results)
    return results["data"]["asignedRoute"]["buses"]


def get_data(timestamp):
    timestamp = timestamp - timedelta(minutes=10)
    buses = get_assigned_buses(route_id)
    query = bus_locations_query.format(m1IDs=json.dumps(buses), timestamp=timestamp.strftime("%Y-%m-%dT%H:%M:%S"))
    logging.info(query)
    results = requests.post(url=graphql_url, json={"query": query}).json()
    bus_locations = defaultdict(list)
    for r in results["data"]["busLocations"]:
        bus_locations[r["owner"]["m1ID"]].append(r["position"])

    return {"buses": bus_locations}


