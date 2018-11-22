import base64
import os
import json
import pandas as pd
import numpy as np
import dateutil
import requests
import pytz
def lambda_handler(event, context):
    tz = pytz.timezone("America/Mexico_City")
    s = "["+",\n".join(map(lambda x:base64.b64decode(x["kinesis"]["data"]).decode("utf-8"),event["Records"]))+"]"
    inputDF = pd.DataFrame(json.loads(s))
    inputDF["VehicleName"] = inputDF["VehicleName"].astype("str")
    print(f"""longitud de input: {len(inputDF[["VehicleName","Latitude","Longitude"]])}""")
    endpoint=os.environ["graphcoolEndpoint"]
    query = '''
    query{
      allBuses{
        id
        m1ID
      }
    }'''
    r = requests.post(endpoint,data=json.dumps({'query':query,'variables':None}),headers={'Content-Type':'application/json'})
    currentBuses = pd.DataFrame(json.loads(r.text)["data"]["allBuses"],columns=["id","m1ID"])
    iofCreatedVeic = inputDF["VehicleName"].isin(currentBuses["m1ID"])
    newBuses = inputDF[np.bitwise_not(iofCreatedVeic)]
    existentBuses = inputDF[iofCreatedVeic]
    existentBuses[np.bitwise_not(existentBuses["VehicleName"].isin(["True","False"]))].sort_values(by="GPSDateTime")
    existentBusesGrouped = pd.merge(currentBuses,existentBuses,left_on="m1ID",right_on="VehicleName").groupby(["id"])
    newBusesGrouped = newBuses.groupby(["VehicleName"])
    ruta = "cjavqpcdy0dwp01249s84h7lo" #remota
    newBusesQ = []
    i=1
    for name, group in newBusesGrouped:
        (latitude, longitude) = group.sort_values(by="GPSDateTime",ascending=False).iloc[0][["Latitude","Longitude"]]
        query = f'''bus{i}: createBus(
            m1ID: "{name}"
            busType: NORMAL
            latitude: {latitude}
            longitude: {longitude}
                routeId: "{ruta}"
              ){{
                m1ID
                latitude
                id
              }}'''
        i = i + 1
        newBusesQ.append(query)
        query = 'mutation{\n'+query+'\n }'
        # r = requests.post(endpoint,data=json.dumps({'query':query,'variables':None}),headers={'Content-Type':'application/json'})
    if len(newBusesQ) > 0:
        query = "\n".join(newBusesQ)
        query = 'mutation{\n'+query+'\n }'
        r = requests.post(endpoint,data=json.dumps({'query':query,'variables':None}),headers={'Content-Type':'application/json'})
        idsDF = pd.DataFrame(r.json()["data"]).transpose()[["id","m1ID"]]
        idsDf = pd.concat([currentBuses,idsDF])
        print(f"longitud de newbuses: {len(NewBusesQ)}")
    else:
        idsDF = currentBuses
    locationsHistoryDF = pd.merge(idsDF,inputDF,left_on="m1ID",right_on="VehicleName")
    locationsHistoryQ = []
    for i, row in locationsHistoryDF.iterrows():
        (latitude, longitude, timestamp, ownerId) = row[["Latitude","Longitude","GPSDateTime","id"]]
        timestamp = dateutil.parser.parse(timestamp)
        timestamp = timestamp - tz.utcoffset(timestamp)
        query = f"""busLocation{i}: createBusLocation(
            latitude:{latitude}
            longitude:{longitude}
            timestamp:"{timestamp.isoformat()}"
            ownerId:"{ownerId}"
            ){{id}}"""
        locationsHistoryQ.append(query)
    print("locationsHistoryQ")
    print(locationsHistoryQ)
    existentBusesQ = []
    i=1
    for iddf, group in existentBusesGrouped:
        (latitude, longitude) = group.sort_values(by="GPSDateTime",ascending=False).iloc[0][["Latitude","Longitude"]]
        query = f"""busUpdate{i}: updateBus(id:"{iddf}"
              latitude:{latitude}
              longitude:{longitude}){{
                latitude
                longitude
            }}"""
        i = i + 1
        existentBusesQ.append(query)
        query = 'mutation{\n'+query+'\n }'
        # r = requests.post(endpoint,data=json.dumps({'query':query,'variables':None}),headers={'Content-Type':'application/json'})
    query = "\n".join(locationsHistoryQ + existentBusesQ)
    query = 'mutation{\n'+query+'\n }'
    print(query)
    r = requests.post(endpoint,data=json.dumps({'query':query,'variables':None}),headers={'Content-Type':'application/json'})
    print(r.status_code)
    print(r.text)
    return 'Hello from Lambda'
