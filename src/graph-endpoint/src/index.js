const { GraphQLServer } = require('graphql-yoga')
const { Prisma } = require('prisma-binding')
const  Promise = require('bluebird')
const lodash = require('lodash')
const uuidv4 = require('uuid/v4')
const axios = require('axios')
const path = require('path')

const geo_utils = require("./geo_utils")


let outbound = geo_utils.readRouteJSON(path.join(__dirname, 'geo_utils', 'ruta_bsf.json'))
let inbound = geo_utils.readRouteJSON(path.join(__dirname, 'geo_utils', 'ruta_sfb.json'))

const resolvers = {
  Query: {
    getBusesForStop: async (parent, { data }, ctx, info) => {
      const response = await ctx.db.query.stops({
        where: data
      },`
      {
        onComing {
          time
          bus {
            position {
              latitude
              longitude
            }
          }
        }
      }
      `)
      return response.reduce((acc, { onComing }) =>  lodash.union(onComing, acc), [])
    },
    buses: (parent,  args , ctx, info) => ctx.db.query.buses(args, info),
    bus: (parent,  args , ctx, info) => ctx.db.query.bus(args, info),
    locations: (parent,  args , ctx, info) => ctx.db.query.locations(args, info),
    busLocations: (parent,  args , ctx, info) => ctx.db.query.busLocations(args, info),
    predictions: (parent,  args , ctx, info) => axios.get('http://localhost:5000/recommend/next_departure').then(({ data }) => data),
    getId: (parent,  args , ctx, info) => uuidv4(),
    arrivingToes: (parent,  args , ctx, info) => ctx.db.query.arrivingToes(args, info),
    routes: (parent,  args , ctx, info) => ctx.db.query.routes(args, info),
    stops: (parent,  args , ctx, info) => ctx.db.query.stops(args, info),
    route: (parent,  args , ctx, info) => ctx.db.query.route(args, info),
    plannedExits: (parent,  args , ctx, info) => ctx.db.query.plannedExits(args, info),
    asignedRoute: (parent,  args , ctx, info) => ctx.db.query.asignedRoute(args, info),
    asignedRoutes: (parent,  args , ctx, info) => ctx.db.query.asignedRoutes(args, info),
  },
  Mutation: {
    updateBuses: async (parent, { busses }, ctx, info) => {
      const timestamp = new Date().toISOString()
      const promises = busses.map(({ m1ID, location, status, speed, heading }) =>  ctx.db.mutation.upsertBus({
        where: { m1ID }, create: {
          m1ID,
          position: { create: { ...location }},
          locations: { create: { timestamp, position: { create: { ...location }} }},
          status,
          speed,
          heading
        } , update: {
          position: { update: { ...location }},
          locations: { create: { timestamp, position: { create: { ...location }} }},
          status,
          speed,
          heading
        }
      }).then(() => m1ID).then((m1ID) => {

        return ctx.db.query.busLocations({ where: {
            owner: { m1ID }
        }, last: 5, orderBy: 'createdAt_ASC'}, `{
            id
            timestamp
            position {
                latitude
                longitude
            }
        }`).then((res) => {
            const process = res.map(({position: { latitude, longitude }}) => ({ latitude, longitude }))
        
            // Get direction, can be 'outbound', 'inbound' or 'stopped' (if not moving)
            const direction = geo_utils.getDirection(outbound, inbound, process)
            const in_terminal = geo_utils.isAtTerminal(outbound, process[0]) || geo_utils.isAtTerminal(inbound, process[0])
            // mutation {
            //   updateBus(where: { m1ID: "1327"} data: {direction: "postion"}) {
            //     direction
            //   }
            // }

            if (in_terminal) {
              return ctx.db.mutation.updateBus({where: {m1ID}, data: { direction: 'at_terminal' }}, `{ id }`)
            } else {
              return ctx.db.mutation.updateBus({where: {m1ID}, data: { direction }}, `{ id }`)
            }

            
            // Determine if a bus has left the terminal based on location
            // console.log(geo_utils.isAtTerminal(outbound, locations[0]))
        })
      
      }).catch((err) => { console.log(err); console.log({m1ID, location}) }))


      return { count: busses.length }
    },
    createArrivingTo: (parent, data, ctx, info) => ctx.db.mutation.createArrivingTo(data, info),
    createStop: (parent, data, ctx, info) => ctx.db.mutation.createStop(data, info),
    deleteArrivingTo: (parent, data, ctx, info) => ctx.db.mutation.deleteArrivingTo(data, info),
    deleteBus: (parent, data, ctx, info) => ctx.db.mutation.deleteBus(data, info),
    upsertStop: (parent, data, ctx, info) => ctx.db.mutation.upsertStop(data, info),
    createBus: (parent, data, ctx, info) => ctx.db.mutation.createBus(data, info),
    createPlannedExit: (parent, data, ctx, info) => ctx.db.mutation.createPlannedExit(data, info),
    updateRoute: (parent, data, ctx, info) => ctx.db.mutation.updateRoute(data, info),
    upsertRoute: (parent, data, ctx, info) => ctx.db.mutation.upsertRoute(data, info),
    updateBus: (parent, data, ctx, info) => ctx.db.mutation.updateBus(data, info),
    createAsignedRoute: (parent, data, ctx, info) => ctx.db.mutation.createAsignedRoute(data, info),
    updateAsignedRoute: (parent, data, ctx, info) => ctx.db.mutation.updateAsignedRoute(data, info),
    deleteArrivingTos: (parent, data, ctx, info) => Promise.all(data.ids.map((id) => ctx.db.mutation.deleteBus({ id }, '{ id }'))).then((res) => ({ count: res.length }))
  }
};

const server = new GraphQLServer({
  typeDefs: './src/schema.graphql',
  resolvers,
  context : req => ({
    ...req,
    db: new Prisma({
      typeDefs: 'src/generated/prisma.graphql',
      endpoint: 'http://localhost:4466',
    })
  })
});

server.start(() => console.log('Server is running on http://localhost:4000'));
