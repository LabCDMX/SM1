import React, { Component } from 'react'
import axios from 'axios'
import { connect } from 'react-redux'

import { AsyncStorage } from 'react-native'

import get from 'lodash/get'

import {
    updateBusLocation,
    updateInbound,
    updateOutbound,
    updateOperatorId,
} from '../state';

import { gql } from 'apollo-boost';

const MAP_INTERVAL = 30000
const PREDICT_INTERVAL = 600000
const MAIN_INTERVAL = 1000

const ROUTE_QUERY = gql`
    query {
        asignedRoute(where: {m1ID: "34-A"}) {
            buses
        }
    }
`;

const GETBUSES = gql`
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
        arrivingTo(last: 1, orderBy: time_ASC) {
            time
        }
    }
}
`;

class DataSource extends Component {
    state = {
        timerForMap: 0,
        timerForPredict: 0,
    }
    timerMain = undefined
    componentDidMount() {
        this.timerMain = setTimeout(this.mainLoop, MAIN_INTERVAL)
        this.getId()
    }

    getId = async () => {
        try {
            const value = await AsyncStorage.getItem('@WAWA:OP_ID');
            if (value !== null) {
              // We have data!!
              this.props.updateOperatorId(value)
            } else {
              axios.post('http://wawa.datank.ai:4000/',
                {"operationName":null,"variables":{},"query":"{\n  getId\n}\n"}
              ).then(({ data: { data: { getId } } }) => {
                    this.props.updateOperatorId(getId)
                    return AsyncStorage.setItem('@WAWA:OP_ID', getId);
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
        if (now > timerForPredict) {
            this.getPredictData()
        }
    }
    getMapData = () => {
        this.setState(() => ({
            timerForMap: Infinity,
        }))

        this.props.apollo.query({query: ROUTE_QUERY, fetchPolicy: 'network-only'}).then((data) => {
            this.props.apollo.query({
                query: GETBUSES,
                variables: {
                    buses: get(data, 'data.asignedRoute.buses')
                },
                fetchPolicy: 'network-only'
            }).then((data) => {
                this.props.updateBusLocation(get(data, 'data.buses'))
                this.setState(() => ({
                    timerForMap: Date.now() + MAP_INTERVAL,
                }))
            })

        }).catch((error) => {
            this.setState(() => ({
                timerForMap: Date.now() + MAP_INTERVAL,
            }))
        })

        // axios.post('http://wawa.datank.ai:4000/', 
        //     {"operationName":null,"variables":{},"query":"{\n  asignedRoute(where: {m1ID: \"34-A\"}) {\n    buses\n  }\n}\n"}
        // ).then(({ data: { data: { asignedRoute: { buses } } } }) => {
        //     axios.post('http://wawa.datank.ai:4000/',{
        //         "operationName":"getBuses",
        //         "variables":{ buses },
        //         "query":"query getBuses($buses: [String!]) {\n  buses(where: {m1ID_in: $buses}) {\n    m1ID\n    status\n    busType\n    direction\n    speed\n    heading\n    position {\n      latitude\n      longitude\n    }\n  }\n}\n"
        //     }).then(({ data: { data: buses } }) => {
        //         this.props.updateBusLocation(buses)
        //         this.setState(() => ({
        //             timerForMap: Date.now() + MAP_INTERVAL,
        //         }))
        //     })
        // }).catch((error) => {
        //     console.error(error)
        //     this.setState(() => ({
        //         timerForMap: Date.now() + MAP_INTERVAL,
        //     }))
        // })

    }
    getPredictData = () => {
        this.setState(() => ({
            timerForPredict: Infinity,
        }))
        axios.post('http://wawa.datank.ai:4000/', {
            operationName:null,
            variables:{},
            query: "{\n  predictions {\n    inbound\n    outbound\n  }\n}\n"
        }).then(({ data: { data: { predictions } } }) => {
            this.props.updateInbound(predictions.inbound)
            this.props.updateOutbound(predictions.outbound)
 
            this.setState(() => ({
                timerForPredict: Date.now() + PREDICT_INTERVAL,
            }))
        }).catch((error) => {
            console.error(error)
            this.setState(() => ({
                timerForPredict: Date.now() + PREDICT_INTERVAL,
            }))
        })
    }
    componentWillUnmount() {
        clearTimeout(this.timerMain)
    }
    render = () => null
}

const mapDispatchToProps = {
    updateBusLocation,
    updateOutbound,
    updateInbound,
    updateOperatorId
}

export default connect(undefined, mapDispatchToProps)(DataSource)
