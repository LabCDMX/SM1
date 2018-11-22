import React, { Component } from 'react'
import axios from 'axios'
import { connect } from 'react-redux'
import get from 'lodash/get'
import { AsyncStorage } from 'react-native'

import { gql } from 'apollo-boost'

import { updateBusLocation, updateOperatorId, updateRouteData } from '../state'

const MAIN_INTERVAL = 1000
const MAP_INTERVAL = 30000

const STOPS_QUERY = gql`
    {
        stops {
            m1ID
            displayName
            route {
                m1ID
            }
        }
    }
`;

const ID_QUERY = gql`{getId}`;

const ROUTE_QUERY = gql`
    { 
        asignedRoute(where: {m1ID: "34-A"}) {
            buses
        }
    }
`;

const BUS_QUERY = gql`
    query getBuses($buses: [String!]) {
        buses(where: {m1ID_in: $buses}) {
            m1ID
            status
            busType
            direction
            speed
            heading
            position {
                latitude
                longitude
            }
        }
    }
`;

class DataSource extends Component {
    state = {
        timerForMap: 0,
    }

    timerMain = undefined

    getRouteData = () => {
        this.props.apollo.query({ query: STOPS_QUERY}).then((res) => {
            this.props.updateRouteData(get(res, 'data.stops'))
        })

    }

    componentDidMount() {
        this.timerMain = setTimeout(this.mainLoop, MAIN_INTERVAL)
        this.getId()
        this.getRouteData()
    }
    getId = async () => {
        try {
            const value = await AsyncStorage.getItem('@WAWA:USR_ID');
            if (value !== null) {
              // We have data!!
            this.props.updateOperatorId(value)
            } else {
                this.props.apollo.query({ query: ID_QUERY, fetchPolicy: 'network-only' }).then((res) => {
                    return AsyncStorage.setItem('@WAWA:USR_ID', get(res, 'data.getId'));
                }).catch((error) => {
                console.error(error)
              })
            }
        } catch (error) {
          console.error(error)
        }
    }

    mainLoop = () => {
        this.timerMap = setTimeout(this.mainLoop, MAIN_INTERVAL)
        const now = Date.now()
        const { timerForMap, timerForPredict } = this.state
        if (now > timerForMap) {
            this.getMapData()
        }
    }

    getMapData = async () => {
        console.log('getMapData')
        this.setState(() => ({
            timerForMap: Infinity,
        }))

        const resAsigned = await this.props.apollo.query({ query: ROUTE_QUERY, fetchPolicy: 'network-only' })

        const buses = get(resAsigned, 'data.asignedRoute.buses')

        const resBus = await this.props.apollo.query({  query: BUS_QUERY, variables: { buses }, fetchPolicy: 'network-only'})

        this.props.updateBusLocation(get(resBus,'data.buses'))
        this.setState(() => ({
            timerForMap: Date.now() + MAP_INTERVAL,
        }))
    }

    componentWillUnmount() {
        clearTimeout(this.timerMain)
    }

    render = () => null
}

const mapDispatchToPropos = {
    updateBusLocation,
    updateOperatorId,
    updateRouteData,
}

export default connect(undefined, mapDispatchToPropos)(DataSource)