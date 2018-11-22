import base64
import os
import json
import dateutil
import requests
import datetime
import os
import pytz
def lambda_handler(event, context):
    tz = pytz.timezone("America/Mexico_City")
    delta = datetime.timedelta(hours=1)
    now = (datetime.datetime.now() - delta)
    nowString = now.isoformat()
    endpoint=os.environ["graphcoolEndpoint"]
    print(f"Deleting everything before {nowString}")
    continueDeleting = True
    while continueDeleting == True:
        query = f"""{{allBusLocations(filter:{{timestamp_lt:"{nowString}"}}){{id}}}}"""
        r = requests.post(endpoint,data=json.dumps({'query':query,'variables':None}),headers={'Content-Type':'application/json'})
        oldLocations = r.json()["data"]["allBusLocations"]
        print(oldLocations)
        oldLocationsQ = []
        for i, loc in enumerate(oldLocations):
            query = f"""oldLoc{i}: deleteBusLocation(id:"{loc["id"]}"){{id}}"""
            oldLocationsQ.append(query)
        if len(oldLocationsQ) > 0:
            print(f"Deleting {len(oldLocationsQ)} locations")
            query = "mutation{\n"+("\n".join(oldLocationsQ)) + "\n }"
            r = requests.post(endpoint,data=json.dumps({'query':query,'variables':None}),headers={'Content-Type':'application/json'})
        else:
            continueDeleting = False
    return 'Hello from Lambda'
