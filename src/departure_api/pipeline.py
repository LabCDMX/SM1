import json
import logging
import pyproj
import pandas as pd
import numpy as np
from collections import OrderedDict
from smart_open import smart_open
from shapely.geometry import LineString, MultiPoint

from app_settings import INEGI_PROJ, MOVING_THRESHOLD

logging.basicConfig(level=logging.INFO)

def inegi_projection(df, lat_col="latitud", long_col="longitud", x_col="x", y_col="y"):
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

    projected = pd.DataFrame(np.array(proj(*np.array(df[[long_col, lat_col]]).T)).T)
    projected.columns = [x_col, y_col]

    return pd.concat([df, projected], axis=1)


class Pipeline(object):
    def __init__(self, weights_location, speeds_location, outbound_location, inbound_location, stops_location):
        with smart_open(weights_location, "r") as f:
            s = f.read()
            self.weights = json.loads(s)

        self.weights = {k: np.array(v) for k, v in self.weights.items()}

        self.speeds = pd.read_csv(speeds_location).set_index(["weekend", "hour", "raining", "origin"])
        self.outbound = LineString(pd.read_csv(outbound_location)[["x", "y"]].values)
        self.inbound = LineString(pd.read_csv(inbound_location)[["x", "y"]].values)

        stops = inegi_projection(pd.read_csv(stops_location))
        stops = stops.set_index("stop_id")
        stops_points = pd.Series([p for p in MultiPoint(stops[["x", "y"]].values)], index=stops.index)
        stops_dist = np.zeros(len(stops))

        # Add distance along route to stops
        idx_out = stops.leg == "outbound"
        stops_dist[idx_out] = [self.outbound.project(p) for p in stops_points[idx_out]]
        idx_in = ~idx_out
        stops_dist[idx_in] = [self.inbound.project(p) + self.outbound.length for p in stops_points[idx_in]]
        stops["distance"] = stops_dist

        self.stops = stops

    def get_last_position(self, locations):
        locations_df = pd.DataFrame(locations)
        loc_points = MultiPoint(inegi_projection(locations_df, lat_col="latitude", long_col="longitude")[["x", "y"]].values)
        outbound_dist = pd.Series([self.outbound.project(p) for p in loc_points])
        inbound_dist = pd.Series([self.inbound.project(p) for p in loc_points])

        if sum(outbound_dist < MOVING_THRESHOLD)/len(outbound_dist) > 0.9:
            return 0, "outbound"
        elif sum(inbound_dist < MOVING_THRESHOLD)/len(inbound_dist) > 0.9:
            return 0, "inbound"


        ascending_outbound = (outbound_dist - outbound_dist.shift()).dropna() > 0
        if ascending_outbound.sum()/len(ascending_outbound) > 0.5:
            leg = "outbound"
            distances = outbound_dist
        else:
            leg = "inbound"
            distances = inbound_dist

        last_pos = distances[len(distances)-1]

        return last_pos, leg

    def is_raining(self, timestamp):
        return False

    def update_positions(self, positions, timestamp):
        weekend = 1 if timestamp.weekday() > 4 else 0

        moving = np.concatenate([positions["moving_outbound"], positions["moving_inbound"] + self.outbound.length])
        idx = np.searchsorted(self.stops.distance, moving) - 1
        idx[idx < 0] = 0
        speeds = self.speeds.loc[(weekend, timestamp.hour, self.is_raining(timestamp))].loc[idx].speed.values
        positions["moving_outbound"] = positions["moving_outbound"] + speeds[0:len(positions["moving_outbound"])]*60
        positions["moving_inbound"] = positions["moving_inbound"] + speeds[len(positions["moving_outbound"]):]*60

        arrived_out = positions["moving_outbound"] >= self.outbound.length
        positions["moving_outbound"][arrived_out] = 0
        positions["waiting_inbound"] = np.concatenate([positions["waiting_inbound"], positions["moving_outbound"][arrived_out]])
        positions["moving_outbound"] = positions["moving_outbound"][~arrived_out]

        arrived_in = positions["moving_inbound"] >= self.inbound.length
        positions["moving_inbound"][arrived_in] = 0
        positions["waiting_outbound"] = np.concatenate([positions["waiting_outbound"], positions["moving_inbound"][arrived_in]])
        positions["moving_inbound"] = positions["moving_inbound"][~arrived_in]

        return positions

    def get_distances(self, positions):
        out_positions = sorted(list(positions["moving_outbound"]))
        out = [0, *out_positions, self.outbound.length]
        out_dist = [x - y for x, y in zip(out[1:], out[:-1])]

        in_positions = sorted(list(positions["moving_inbound"]))
        in_ = [0, *in_positions, self.inbound.length]
        in_dist = [x - y for x, y in zip(in_[1:], in_[:-1])]

        return out_dist, in_dist

    def get_state(self, positions, timestamp):
        out_dist, in_dist = self.get_distances(positions)
        weekend = 1 if timestamp.weekday() > 4 else 0
        state = OrderedDict({
            "waiting_out": len(positions["waiting_outbound"]),
            "waiting_in": len(positions["waiting_inbound"]),
            "moving_out": len(positions["moving_outbound"]),
            "moving_in": len(positions["moving_inbound"]),
            "closest_outbound": min([self.outbound.length, *positions["moving_outbound"]])/self.outbound.length,
            "farthest_outbound": max([0, *positions["moving_outbound"]])/self.outbound.length,
            "closest_inbound": min([self.inbound.length, *positions["moving_inbound"]])/self.inbound.length,
            "farthest_inbound": max([0, *positions["moving_inbound"]])/self.inbound.length,
            "mean_dist_outbound": (sum(out_dist)/len(out_dist))/self.outbound.length,
            "min_dist_outbound": min(out_dist)/self.outbound.length,
            "max_dist_outbound": max(out_dist)/self.outbound.length,
            "mean_dist_inbound": (sum(in_dist)/len(in_dist))/self.inbound.length,
            "min_dist_inbound": min(in_dist)/self.inbound.length,
            "max_dist_inbound": max(in_dist)/self.inbound.length,
            "none_out": 1 if len(positions["waiting_outbound"]) == 0 else 0,
            "none_in": 1 if len(positions["waiting_inbound"]) == 0 else 0,
            "mean_speed": self.speeds.loc[(weekend, timestamp.hour, self.is_raining(timestamp))].speed.mean(),
            "hour_minute": timestamp.hour + timestamp.minute/60,
            "last_out": 0,
            "last_in": 0
        })

        return state

    def get_action(self, state):
        # NN feed forward
        state_values = list(state.values())
        layer1 = np.matmul(state_values, self.weights["main/fc1/weights:0"]) + self.weights["main/fc1/biases:0"]
        layer1[layer1 < 0] = 0
        layer2 = np.matmul(layer1, self.weights["main/fc2/weights:0"]) + self.weights["main/fc2/biases:0"]
        layer2[layer2 < 0] = 0
        out = np.matmul(layer2, self.weights["main/output/weights:0"]) + self.weights["main/output/biases:0"]
        return np.argmax(out)

    def process(self, locations, timestamp):
        logging.info("Got {} buses".format(len(locations.values())))
        distances = [self.get_last_position(locs) for locs in locations.values()]
        if not distances:
            return {
                "outbound": [],
                "inbound": []
            }
        waiting_outbound = [0 for pos, leg in distances if pos < MOVING_THRESHOLD and leg == "outbound"]
        moving_outbound = [pos for pos, leg in distances if pos >= MOVING_THRESHOLD and leg == "outbound"]
        waiting_inbound = [0 for pos, leg in distances if pos < MOVING_THRESHOLD and leg == "inbound"]
        moving_inbound = [pos for pos, leg in distances if pos >= MOVING_THRESHOLD and leg == "inbound"]

        positions = {
            "waiting_outbound": np.array(waiting_outbound),
            "moving_outbound": np.array(moving_outbound),
            "waiting_inbound": np.array(waiting_inbound),
            "moving_inbound": np.array(moving_inbound)
        }
        outbound_ts = []
        inbound_ts = []
        while len(outbound_ts) < 5 or len(inbound_ts) < 5:
            positions = self.update_positions(positions, timestamp)
            state = self.get_state(positions, timestamp)
            action = self.get_action(state)
            timestamp = timestamp + pd.Timedelta("1 Min")

            if action == 1 or action == 3:
                if len(positions["waiting_outbound"] > 0):
                    positions["moving_outbound"] = np.append(positions["moving_outbound"], positions["waiting_outbound"][0])
                    positions["waiting_outbound"] = positions["waiting_outbound"][1:]
                    if len(outbound_ts) < 5:
                        logging.info("Recommending to send outbound at: {}".format(timestamp))
                        outbound_ts.append(timestamp)
            if action == 2 or action == 3:
                if len(positions["waiting_inbound"] > 0):
                    positions["moving_inbound"] = np.append(positions["moving_inbound"], positions["waiting_inbound"][0])
                    positions["waiting_inbound"] = positions["waiting_inbound"][1:]
                    if len(inbound_ts) < 5:
                        logging.info("Recommending to send inbound at: {}".format(timestamp))
                        inbound_ts.append(timestamp)

        return {
            "outbound": outbound_ts,
            "inbound": inbound_ts
        }