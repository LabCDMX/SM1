import io
import pytz
import logging
import pandas as pd
import numpy as np
import pyproj
from collections import defaultdict
from datetime import datetime
from smart_open import smart_open
from shapely.geometry import LineString, MultiPoint, Point
from dateutil import parser


from app_settings import INEGI_PROJ

tz = pytz.timezone('America/Mexico_City')
logging.basicConfig(level=logging.INFO)
def inegi_projection(points, lon_att="longitude", lat_att="latitude"):
    '''
    Projects a dataframe's latitude and longitude columns to euclidean space using INEGI's projection (defined in
    settings module)
    :param df: a pandas DataFrame, it must have columns for latitude and longitude
    :param lat_col: the name of the latitude column
    :param long_col: the name of the longitude column
    :param x_col: the name of the output column for the x coordinate
    :param y_col: the name of the output column for the y coordinate
    :return: a pandas DataFrame, like df but with x_col, y_col columns corresponding to the projection
    '''

    proj = pyproj.Proj(INEGI_PROJ)
    
    points_npy = np.array([(p[lon_att], p[lat_att]) for p in points])
    projected = np.array(proj(*points_npy.T)).T

    return [Point(*p) for p in projected]


def is_raining(timestamp):
    # TODO: This
    return False


class Pipeline(object):
    def __init__(self, predictions_filename, outbound_filename, inbound_filename, stops_filename):
        self.predictions = pd.read_csv(predictions_filename)
        self.pred_dict = self.predictions.set_index(["origin", "weekend", "hour", "raining"])
        self.outbound = LineString(pd.read_csv(outbound_filename)[["x", "y"]].values)
        self.inbound = LineString(pd.read_csv(inbound_filename)[["x", "y"]].values)

        stops = pd.read_csv(stops_filename)
        stops = stops.set_index("stop_id")

        stops_lonlat = stops[["longitud", "latitud"]].to_dict(orient="records")
        stops_xy = inegi_projection(stops_lonlat, lon_att="longitud", lat_att="latitud")
        stops_points = pd.Series(stops_xy, index=stops.index)
        stops_dist = np.zeros(len(stops))

        # Add distance along route to stops
        idx_out = stops.leg == "outbound"
        stops_dist[idx_out] = [self.outbound.project(p) for p in stops_points[idx_out]]
        idx_in = ~idx_out
        stops_dist[idx_in] = [self.inbound.project(p) for p in stops_points[idx_in]]
        stops["distance"] = stops_dist

        self.stops = stops
        self.last_seen = {}

    def assign_leg(self, points):
        # Get the positions outbound and inbound
        positions_out = [self.outbound.project(p) for p in points]
        ascending_out = np.diff(positions_out) > 0
        positions_in = [self.inbound.project(p) for p in points]
        ascending_in = np.diff(positions_in) > 0

        # Where is it moving towards?
        movement_direction = np.where(ascending_out[np.logical_xor(ascending_out, ascending_in)], "outbound", "inbound")

        if len(movement_direction) == 0:
            # Bus not moving, use distance to route
            if self.outbound.distance(points[-1]) < self.inbound.distance(points[-1]):
                return "outbound"
            else:
                return "inbound"

        # Where were we moving towards last?
        last_direction = movement_direction[-1]
        moving = last_direction

        # Detect changes in direction
        direction_changes = np.arange(len(movement_direction))[last_direction != movement_direction]
        if len(direction_changes) > 0:
            last_change = direction_changes[-1]
            # If near terminal, ignore the change, otherwise choose the most frequent direction of movement
            if last_direction == "outbound":
                if not positions_out[last_change] < 500:
                    moving = "outbound" if (movement_direction == "outbound").mean() > 0.5 else "inbound"
            else:
                if not positions_in[last_change] < 500:
                    moving = "inbound" if (movement_direction == "inbound").mean() > 0.5 else "outbound"

        return moving

    def preprocess(self, locations):
        points = inegi_projection(locations)
        leg = self.assign_leg(points)

        if leg == "outbound":
            last_loc = self.outbound.project(points[-1])
        else:
            last_loc = self.inbound.project(points[-1])

        last_stop_iloc = np.searchsorted(self.stops[self.stops.leg == leg].distance, last_loc)[0]
        last_stop_iloc = last_stop_iloc - 1 if last_stop_iloc > 0 else 0
        last_stop = self.stops[self.stops.leg == leg].iloc[last_stop_iloc]

        return last_stop, last_loc

    def predict(self, stop, timestamp):
        weekend = 1 if timestamp.weekday() > 4 else 0
        hour = timestamp.hour
        raining = is_raining(timestamp)

        return self.pred_dict.loc[(stop, weekend, hour, raining)]

    def process_locations(self, locations, timestamp):
        last_stop, last_loc = self.preprocess(locations)
        logging.info(last_stop)
        logging.info(last_loc)
        route_stops = self.stops[(self.stops.ruta == last_stop.ruta) & (self.stops.leg == last_stop.leg)]
        next_stops = route_stops[route_stops.posicion > last_stop.posicion].sort_values("posicion")

        # No next stops if this is the last
        if next_stops.empty:
            logging.info("No next stops, location: {}".format(locations[-1]))
            return []

        results = []
        for _, next_stop in next_stops.iterrows():
            prediction = self.predict(last_stop.name, timestamp)
            to_travel = prediction["travel_distance"] - (last_loc - self.stops.loc[last_stop.name, "distance"])
            travel_time = (to_travel/prediction["travel_distance"])*prediction["travel_time"]
            arrival_time = timestamp + pd.Timedelta(travel_time, unit="s")
            results.append({"stop_id": next_stop.name, "stop_name": next_stop.ubicacion, "arrival_time": arrival_time})

            last_stop = next_stop
            last_loc = last_stop.distance
            timestamp = arrival_time

        logging.info("---- Proximas paradas -----")
        logging.info(pd.DataFrame(results)[["stop_name", "arrival_time"]])

        return results

    def process(self, bus_locations):
        results = defaultdict(list)
        for stop_id in self.stops.index: 
            results[stop_id] = []
        
        for bus, locations in bus_locations.items():
            logging.info("**************  Autobus: {} *************".format(bus))
            logging.info("Last seen: {}".format(self.last_seen.get(bus)))
            timestamp = parser.parse(locations[-1]["timestamp"]).astimezone(pytz.timezone('UTC'))
            logging.info("Last update: {}".format(timestamp))

            self.last_seen[bus] = timestamp
            timestamp = timestamp.astimezone(tz)
            logging.info("Local time: {}".format(timestamp))
            arrivals = self.process_locations(locations, timestamp)
            for arrival in arrivals:
                arrival["bus_id"] = bus
                results[arrival["stop_id"]].append(arrival)
        
        return results
