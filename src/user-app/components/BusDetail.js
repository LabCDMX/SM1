import React , { Component, Fragment } from 'react'
import styled from 'styled-components'
import { connect } from 'react-redux'
import axios from 'axios'
import get from 'lodash/get'
import { SectionList, Text, Dimensions } from 'react-native'

import { gql } from 'apollo-boost'
import { Query } from "react-apollo";

import { Place, BusGrey, BusBlack } from './svg';

import { BORDER_GREY } from '../Constants'
import moment from 'moment';

const TopView = styled.View`
    height: 43;
`

const NameView = styled.View`
    flex-direction: row;
    align-items: center;
    padding-left: 16;
    padding-right: 16;

`

const RouteName = styled.Text`
    position: absolute;
    left: 56;
`

const BusType = styled.Text`

`

const GreyTextView = styled.View`
    margin-top: 16;
`

const GreyText = styled.Text`
    color: #82838c;
    position: absolute;
    left: 56;
`

const { height, width } = Dimensions.get('window');

const Line = styled.View`
  border-width: 0.5;
  border-color: #E2E2E2;
  height: 1;
  width: ${width - (50)};
  position: absolute;
  right: 0;
  bottom: 0;
`;

const BusTypeView = styled.View`
    position: absolute;
    right: 16;
    border: 1px solid ${BORDER_GREY};
    padding-top: 4px;
    padding-bottom: 2px;
    padding-left: 10px;
    padding-right: 10px;
    border-radius: 5px;
    align-items: center;
    justify-content: center;
`

const ListView = styled.View`
    flex: 1;
    background-color: white;
`

const StationListItem = styled.View`
    padding-left: 16;
    padding-right: 16;
    padding-top: 16;
    padding-bottom: 16;
    align-items: center;
    flex-direction: row;
`

const StationListTitle = styled(StationListItem)`
    padding-bottom: 0;
`

const StationName = styled.Text`
    margin-left: 16;
`

const Time = styled.Text`
    position: absolute;
    right: 16;
`

const errorTxt = () => <Text>Una disculpa, en este momento no es posible obtener esta información</Text>

const STOPQUERY = gql`
    query getStop($stop: String!) {
        stops(where: {m1ID: $stop}) {
            m1ID
            displayName
            route
            { 
                m1ID 
            } 
            onComing(orderBy: time_ASC) {
                time
                bus 
                { 
                    status
                    busType 
                } 
            } 
        }
    }
`

class BusDetail extends Component {
    state = {
        stationName: null,
        // onComing: []
    }
    // componentWillMount() {
    //     const { currentDirection, selectedStation, routeData } = this.props


    //     const direction = currentDirection === 'santa_fe' ? 'SANTA FE - BALDERAS' : 'BALDERAS - SANTA FE'
    //     const foundStation = routeData.filter(({route: {m1ID} }) => (m1ID === direction)).filter(({displayName}) => (displayName === selectedStation))
    //     axios.post('http://wawa.datank.ai:4000/',{
    //         "operationName":"getStop",
    //         "variables":{"stop":get(foundStation, '[0].m1ID')},
    //         "query":"query getStop($stop: String!) { stops(where: {m1ID: $stop}) { m1ID displayName route { m1ID } onComing(orderBy: time_ASC) { time bus { status busType } } }}"
    //     }).then((data) => {
    //         this.setState(() => ({
    //             onComing: get(data, 'data.data.stops[0].onComing', []),
    //             stationName: selectedStation
    //         }))
    //     })
    // }
    render () {
        const { currentDirection, selectedStation, routeData } = this.props
        const displayRoute = currentDirection === 'santa_fe' ? 'Santa Fe' : 'Balderas'
        const direction = currentDirection === 'santa_fe' ? 'SANTA FE - BALDERAS' : 'BALDERAS - SANTA FE'
        const foundStation = routeData.filter(({route: {m1ID} }) => (m1ID === direction)).filter(({displayName}) => (displayName === selectedStation))
        return <Query query={STOPQUERY} variables={{stop: get(foundStation, '[0].m1ID')}}>
            {({ loading, error, data }) => {
                if (loading) return  <Text>Cargando...</Text>;
                if (error) errorTxt()
                const onComing = get(data, 'stops[0].onComing', [])

                if (onComing.length === 0) errorTxt()
                return (<Fragment>
                    <TopView>
                        <NameView>
                            <Place />
                            <RouteName>{displayRoute}</RouteName>
                            <BusTypeView>
                                <BusType>
                                    {selectedStation}
                                </BusType>
                            </BusTypeView>
                        </NameView>
                    </TopView>
                    <ListView>
                    <SectionList
                        renderItem={({item, index, section}) => (
                            <Fragment>
                                <StationListItem key={index}>
                                    {index !== 0 ? <BusGrey /> : <BusBlack />}
                                    <StationName style={{color: index !== 0 ? 'rgba(47, 48, 63, .3)': 'black'}}>{item.bus.busType || 'Camion'}</StationName>
                                    <Time style={{color: index !== 0 ? 'rgba(47, 48, 63, .3)': 'black'}}>{moment(item.time).format("HH:mm") + ' hrs'}</Time>
                                </StationListItem>
                                <Line />
                            </Fragment>
                        )}
                        renderSectionHeader={({section: {title}}) => (
                            <StationListTitle>
                                <Text style={{color: '#2F303F'}}>{title}</Text>
                            </StationListTitle>

                        )}
                        sections={[
                            {title: 'Tiempo estimado de llegada:', data: onComing},
                        ]}
                        keyExtractor={(item, index) => item + index}
                        />
                    </ListView>
                </Fragment>)
            }}
        </Query>

    }
}

const mapStateToProps = (state) => ({
    selectedBus: state.selectedBus,
    currentDirection: state.currentDirection,
    selectedStation: state.selectedStation,
    routeData: state.routeData
})


export default connect(mapStateToProps)(BusDetail)