import React, { Component, Fragment } from 'react';
import { Dimensions, PixelRatio, TouchableOpacity, ActivityIndicator, StatusBar, Image } from 'react-native';
import styled from 'styled-components';
import { MapView } from 'expo';
import { connect } from 'react-redux'
import axios from 'axios'
import moment from 'moment'
import get from 'lodash/get'

import { gql } from 'apollo-boost';
import { Mutation } from 'react-apollo'

import mapStyle from './mapStyle';
import { Bus, Time } from './svg';
import {changeBlur, addBusToHistory} from '../state';
import { BG_WHITE, MAIN_COLOR, SECONDARY_COLOR } from '../Constants';

import balderas_santafe from '../assests/ruta_bsf.json'
import santafe_balderas from '../assests/ruta_sfb.json'
import { dayString, monthString } from './dateformat'

import delayPromise from '../util/delayPromise'

const TopView = styled.View`
  position: relative;
  flex: 1;
`;

const StyledMapView = styled(MapView)`
  flex: 1;
`;

const { height, width } = Dimensions.get('window');

const UNIT_VIEW_H = PixelRatio.getPixelSizeForLayoutSize(60);

const UnitView = styled.View`
  position: absolute;
  background-color: ${BG_WHITE};
  width: ${width - PixelRatio.getPixelSizeForLayoutSize(12)};
  height: ${UNIT_VIEW_H}px;
  bottom: ${PixelRatio.getPixelSizeForLayoutSize(8)};
  left: ${PixelRatio.getPixelSizeForLayoutSize(6)};
  align-items: center;
  border-top-left-radius: 2;
  border-top-right-radius: 2;
  justify-content: space-between;
  elevation: 2;
`;

const TopUnitView = styled.View`
  height: ${(UNIT_VIEW_H/4)}px;
  padding: ${PixelRatio.getPixelSizeForLayoutSize(3)}px;
  width: ${width - PixelRatio.getPixelSizeForLayoutSize(12)};
  flex-direction: row;
  justify-content: center;
  align-items: center;
`;

const TopUnitViewText = styled.Text`
  font-family: 'BarlowSemiCondensed-Regular';
  color: #9B9BA1;
  justify-content: center;
  text-align: center;
`;

const Line = styled.View`
  border-width: 0.5;
  border-color: #E2E2E2;
  height: 1;
  width: ${width - PixelRatio.getPixelSizeForLayoutSize(18)};
`;

const MiddleUnitView = TopUnitView.extend`
  flex-direction: row;
  justify-content: center;
`;

const MiddleUnitViewText = TopUnitViewText.extend`
  color: #2f303f;
`;

const BottomView = styled.View`
  background-color: ${MAIN_COLOR};
  height: ${(UNIT_VIEW_H/4)}px;
  width: ${width - 24};
  justify-content: center;
  align-items: center;
`;

const BottomText = styled.Text`
  color: white;
  font-family: 'BarlowSemiCondensed-SemiBold';
`;

const TimeView = styled.View`
  flex-direction: row;
  align-items: center;
`;

const TimeSvg = styled.View`
  position: absolute;
  left: -18;
  top: 3;
`;

const BlurView = styled.View`
  position: absolute;
  width: ${width};
  height: ${height};
  background-color: rgba(0,0,0,0.6);
  elevation: ${({ blur }) => blur ? 1 : 0};
`;

const TopText = styled.Text`
  position: absolute;
  bottom: 12;
  font-family: 'BarlowSemiCondensed-SemiBold';
`;

const ActivityIndicatorCont = styled.View`
  position: absolute;
  top: 30;
`;

const CalloutView = styled.View``;

const CalloutText = styled.Text``;

const today = new Date()

const MUTATION = gql`
  mutation create($date: DateTime!, $operator: UUID!) {
    createPlannedExit(data: {time: $date, operator: $operator}) {
      id
    }
  }
`;

class Map extends React.Component {
  state = {
    lastUpdate: dayString(today) + ' ' +  moment().format("d") +' de ' + monthString(today) + ' ' + moment().format(" YYYY") + ', ' + moment().format("HH:mm") + ' hrs'
  }
  pressDispatch = (update) => {
    this.props.changeBlur(true);
    const dateString = (new Date()).toISOString()
    const reqProm = update({
        variables:{date: (new Date()).toISOString(),
        operator:this.props.operator_id}
      })
    Promise.all([delayPromise(3000), reqProm]).then(() => {
      this.props.changeBlur(false);
      this.props.addBusToHistory(dateString)
    }).catch((err) => {
      console.log('error', err)
    })
  }

  static getDerivedStateFromProps(props) {

    const now = new Date()

    return {
      lastUpdate: dayString(now) + ' ' +  moment().format("d") +' de ' + monthString(now) + ' ' + moment(now).format("HH:mm") + ' hrs'
    }
  }

  static displayDescription({ status, heading, speed, m1ID, busType, maxCapacity, arrivingTo }) {
    const title = 'Numero de Unidad: ' + m1ID + '\n'
    let displayedStatus = 'Sin información\n'
    if (status === 'Stopped') {
      displayedStatus = 'Parada\n'
    } else if (status === 'Moving'){
      displayedStatus = 'En movimento\n'
    }
    const displayedVelocity  = 'Velocidad: ' + speed  + ' Km/h\n'
    const displayedCapacity  = 'Tipo de unidad: ' + busType + '\n'
    const diplayedMaxCapacity = 'Capacidad: ' + maxCapacity + '\n'
    const diplayedArrivingTo = 'Llegada a C. cto ' + moment(get(arrivingTo, '[0].time')).format("HH:mm") + ' hrs'
    return (<CalloutView>
      <CalloutText>{
        title +
        'Estatus: ' + displayedStatus + 
        displayedVelocity +
        displayedCapacity +
        diplayedMaxCapacity +
        diplayedArrivingTo
        }
      </CalloutText>
    </CalloutView>)
  }

  render() {
    const { inbound, outbound, active, blur, busses, last_change } = this.props
    const currentBuses = active === 'santa_fe' ? inbound : outbound

    const routeLtLng = active === 'santa_fe' ? santafe_balderas : balderas_santafe
    const routeColor = active === 'santa_fe' ? MAIN_COLOR : SECONDARY_COLOR

    const bound = active === 'santa_fe' ? 'inbound' : 'outbound'

    const filteredBuses = (busses || [])
      .filter(({direction}) => (direction === bound) || (direction === 'at_terminal')|| (direction === 'stopped'))

    const img = active === 'santa_fe' ? require('../assests/img/bus.png') : require('../assests/img/bus2.png')

    return (
      <Mutation
      mutation={MUTATION}>
      {(create, { data }) => (

          <TopView>
          {blur ? <StatusBar
            backgroundColor="rgba(0,0,0,0.6)"
            barStyle="light-content"
          /> : <StatusBar
            backgroundColor={BG_WHITE}
            barStyle="light-content"
          />}
          <BlurView blur={blur} />
          <StyledMapView
            customMapStyle={mapStyle}
            initialRegion={{
              latitude:  19.4326020,
              longitude: -99.1332050,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
          >
            {(filteredBuses).map(({m1ID, position, ...rest}, index) => (<MapView.Marker
              key={m1ID}
              coordinate={position}
              image={img}
            >
              <MapView.Callout>
                {Map.displayDescription({...rest, m1ID})}
              </MapView.Callout>
            </MapView.Marker>))}
            <MapView.Polyline
              coordinates={routeLtLng}
              strokeColor={routeColor}
              strokeWidth={2}
            />
          </StyledMapView>
          <UnitView>
            {blur ? <Fragment>
              <ActivityIndicatorCont>
                <ActivityIndicator size="large" color={MAIN_COLOR} />
              </ActivityIndicatorCont>
              <TopText>ESTA UNIDAD INICIA TRAYECTO</TopText>
            </Fragment>
            : <Fragment>
              <TopUnitView>
                <TopUnitViewText>Tiempo estimado para despachar la próxima unidad:</TopUnitViewText>
                {/* <Bus /> */}
              </TopUnitView>
              <Line />
              <MiddleUnitView>
                {/* <MiddleUnitViewText>{this.state.lastUpdate}</MiddleUnitViewText> */}
                <TimeView>
                  <TimeSvg>
                    <Time />
                  </TimeSvg>
                  <MiddleUnitViewText>{moment(currentBuses[0]).format("HH:mm") + ' hrs'}</MiddleUnitViewText>
                </TimeView>
              </MiddleUnitView>
              <TopUnitView>
                <TopUnitViewText>Última actualización: {last_change}</TopUnitViewText>
                {/* <Bus /> */}
              </TopUnitView>
              <TouchableOpacity onPress={() => this.pressDispatch(create)}>
              {/* <TouchableOpacity onPress={create({variables:{date: (new Date()).toISOString(),operator:this.props.operator_id}})}> */}
                <BottomView>
                  <BottomText>DESPACHAR</BottomText>
                </BottomView>
              </TouchableOpacity>
              </Fragment>}
          </UnitView>
        </TopView>
      )}
      </Mutation>
    );
  }
}


const mapDispatchToProps = {
  changeBlur,
  addBusToHistory
}


const mapStateToProps = (state) => ({
  blur: state.blur,
  inbound: state.inbound,
  outbound: state.outbound,
  active: state.active,
  busses: state.busses,
  operator_id: state.operator_id,
  last_change: state.last_change,
})

export default connect(mapStateToProps, mapDispatchToProps)(Map)