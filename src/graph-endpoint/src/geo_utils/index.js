const fs = require("fs")
const turf = require("@turf/turf")

module.exports = {
    readRouteJSON: function(path) {
        var data = fs.readFileSync(path)
        var points = JSON.parse(data)
        var route = turf.lineString(points.map(p => [p.longitude, p.latitude]))
        return route;
    },
    increasingAlongRoute: function(route, points) {
        var locations = points.map(function(p) {
            var location = turf.nearestPointOnLine(route, p).properties.location
            return location
        })
        var differences = lagDiff(locations)
        var timesIncreased = differences.map(d => d > 0).reduce((a, b) => a + b)
        var isIncreasing = timesIncreased / differences.length > 0.5
        return isIncreasing
    },
    getDirection: function(outbound, inbound, json_points) {
        var points = json_points.map(p => turf.point([p.longitude, p.latitude]))
        var increasingOutbound = this.increasingAlongRoute(outbound, points)
        var increasingInbound = this.increasingAlongRoute(inbound, points)

        if(increasingOutbound) {
            return "outbound"
        } else if(increasingInbound) {
            return "inbound"
        } else {
            return "stopped"
        }
    },
    isAtTerminal: function(route, json_point, options) {
        var limit = opt(options, "limit", 200)
        var terminal = turf.point(route.geometry.coordinates[0])
        var point = turf.point([json_point.longitude, json_point.latitude])
        var distance = turf.distance(terminal, point, options={"units": "meters"})
        return distance < limit
    }
}

function opt(options, name, def) {
    return options && options[name] != undefined ? options[name]: def
}


// Get the difference between each element of an array and the previous element
function lagDiff(arr) {
    return arr.slice(1).map((x, i) => x - arr[i])
}