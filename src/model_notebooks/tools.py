import pyproj
import numpy as np
import pandas as pd
from scipy.spatial.distance import cdist
from shapely.geometry import LineString, MultiPoint

from settings import INEGI_PROJ


def get_route_from_points(points_csv, x_col='x', y_col='y', **kwargs):
    points_df = pd.read_csv(points_csv, **kwargs)
    route = LineString(points_df[[x_col, y_col]].values)

    return route


def project_points_to_route(points, route, x_col='x', y_col='y'):
    multi_point = MultiPoint(points[[x_col, y_col]].values)
    return [route.project(p) for p in multi_point]


def read_point_data(loc, lat_col='latitud', long_col='longitud', x_col='x', y_col='y', **kwargs):
    points = pd.read_csv(loc, **kwargs)
    projected_points = inegi_projection(points, lat_col, long_col, x_col, y_col)

    return projected_points


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


def closest_stop(units, stops, x_col, y_col):
    x = units[[x_col, y_col]]
    y = stops[[x_col, y_col]]

    dist = cdist(x, y)
    closest = pd.DataFrame(np.array([[stops.index[s], dist[idx, s]]  for idx, s in enumerate(dist.argmin(axis=1))]))
    closest.columns = ["closest_stop", "distance"]
    return pd.concat([units, closest], axis=1)


def find_closest_stops(units, stops, r=1000, route_col="ruta", x_col="x", y_col="y"):

    # Get a bounding box for our stops
    min_x, min_y = (stops[x_col].min() - r), (stops[y_col].min() - r)
    max_x, max_y = stops[x_col].max() + r, stops[y_col].max() + r

    # Filter to the general area of our stops
    filter_ = (units.x >= min_x) & (units.x <= max_x) & (units.y >= min_y) & (units.y <= max_y)
    local = units[filter_].reset_index(drop=True)

    # For each route, find the closest stop for each unit
    closest = stops.groupby(route_col).apply(lambda x: pd.DataFrame(closest_stop(local, x, x_col, y_col)))
    closest = closest.reset_index().drop("level_1", axis=1)

    # Filter out every point not close enough
    closest = closest[closest.distance <= r]

    return closest
