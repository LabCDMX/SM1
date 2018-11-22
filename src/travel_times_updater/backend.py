import pytz
import json
import logging
import requests

from collections import defaultdict
from app_settings import CURRENT_ROUTE
from datetime import timedelta, datetime


assignment_query = '''
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

get_arrivals_query = '''
    query {{
        stops(
            where: {{
                m1ID: "{stop_id}"
            }}
        ) {{
            onComing {{
                id
            }}
        }}
    }}
'''

arrival_create = '''
{{
    time: "{arrival_time}"
    bus: {{
        connect: {{
            m1ID: "{bus_id}"
        }}
    }}
}}
'''

arrival_id = '''
{{id: "{arrival_id}"}}
'''

update_arrivals = '''
mutation {{
    upsertStop(
        where: {{
            m1ID: "{stop_id}"
        }}
        create: {{
            m1ID: "{stop_id}"
            route: {{
                connect: {{
                    m1ID: "FAKE ROUTE"
                }}
            }}
            position: {{
                create: {{
                    latitude: -1
                    longitude: -1
                }}
            }}
        }}
        update: {{
            onComing: {{
                create: [
                    {arrival_creations}
                ]
                delete: [
                    {arrival_deletions}
                ]
            }}
        }}
    ) {{
        m1ID
        onComing(orderBy: time_ASC) {{
            id
            bus {{
                m1ID
                status
                busType
            }}
            time
        }}
    }}
}}
'''

def get_assigned_buses(graphql_url, route_id):
    query = assignment_query.format(route_id=route_id)
    results = requests.post(url=graphql_url, json={"query": query}).json()
    logging.info(results)
    return results["data"]["asignedRoute"]["buses"]


def get_data(graphql_url, timestamp):
    timestamp = timestamp - timedelta(minutes=10)
    buses = get_assigned_buses(graphql_url, CURRENT_ROUTE)
    query = bus_locations_query.format(
        m1IDs=json.dumps(buses), 
        timestamp=timestamp.strftime("%Y-%m-%dT%H:%M:%S")
    )
    logging.info(query)
    results = requests.post(url=graphql_url, json={"query": query}).json()
    bus_locations = defaultdict(list)
    for r in results["data"]["busLocations"]:
        bus_loc = {
            "timestamp": r["timestamp"]
        }
        bus_loc.update(r["position"])
        bus_locations[r["owner"]["m1ID"]].append(bus_loc)
    return bus_locations


def get_arrival_ids(graphql_url, stop_id):
    query = get_arrivals_query.format(stop_id=stop_id)
    res = requests.post(url=graphql_url, json={"query": query})
    arrival_ids = [arrival["id"] for arrival in res.json()["data"]["stops"][0]["onComing"]]
    return arrival_ids


def post_results(graphql_url, results, ts):
    logging.info("Updating arrivals")

    result_items = results.items()
    n_stops = len(result_items)
    for idx, (stop, arrivals) in enumerate(result_items):
        creations = [
            arrival_create.format(
                arrival_time=(arrival["arrival_time"]+timedelta(hours=6)).strftime("%Y-%m-%dT%H:%M:%S"),
                bus_id=arrival["bus_id"]
            )
        for arrival in arrivals if arrival["arrival_time"] >= ts]

        deletions = [
            arrival_id.format(arrival_id=_id)
        for _id in get_arrival_ids(graphql_url, stop)]
        query = update_arrivals.format(
            stop_id=stop,
            arrival_creations=",".join(creations),
            arrival_deletions=",".join(deletions)
        )

        res = requests.post(graphql_url, json={"query": query})
        if res.status_code != 200 or "error" in res.json():
            logging.error(json.dumps(res.json(), indent=4))
        if (idx + 1) % 10 == 0:
            logging.info("Updated {}/{}".format(idx+1, n_stops))
    
    logging.info("Elapsed: {}".format(datetime.now(pytz.timezone('America/Mexico_City')) - ts))
