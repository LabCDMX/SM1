import React, { Component, Fragment } from 'react';
import { Dimensions, PixelRatio, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import styled from 'styled-components';
import { MapView, Location, Permissions, Constants } from 'expo';
import { connect } from 'react-redux'
import moment from 'moment'

import mapStyle from './mapStyle';
import { Bus, Time } from './svg';
import {changeBlur, updateSelectedBus} from '../state';
import { BG_WHITE, MAIN_COLOR, BG_DARK_GREY, ROUTE_1, ROUTE_2 } from '../Constants';

import balderas_santafe from '../assests/ruta_bsf.json'
import santafe_balderas from '../assests/ruta_sfb.json'

import stopsBalderas from '../assests/stops_balderas.json'
import stopsSantafe from '../assests/stops_santafe.json'

import BotListContainer from './BotListContainer'

const TopView = styled.View`
  position: relative;
  flex: 1;
`;

const StyledMapView = styled(MapView)`
  flex: 1;
`;

const { height, width } = Dimensions.get('window');

const UNIT_VIEW_H = PixelRatio.getPixelSizeForLayoutSize(40);

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
  height: ${(UNIT_VIEW_H/3)}px;
  padding: ${PixelRatio.getPixelSizeForLayoutSize(3)}px;
  width: ${width - PixelRatio.getPixelSizeForLayoutSize(12)};
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const TopUnitViewText = styled.Text`
  font-family: 'BarlowSemiCondensed-Regular';
  color: #9B9BA1;
  justify-content: center;
`;

const BottomView = styled.View`
  background-color: ${MAIN_COLOR};
  height: ${(UNIT_VIEW_H/3)}px;
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

const LastUpdateView = styled.View`
  background-color: ${BG_DARK_GREY};
  height: 64;
  width: 100%;
  justify-content: center;
  padding-left: 24;
`;

const LastUpdateText = styled.Text`
  color: ${BG_WHITE};

`;

class Map extends React.Component {

  state = {
    lastUpdate: moment().format("HH:mm") + ' hrs',
    errorMessage: null,
    latitude:  19.4326020,
    longitude: -99.1332050,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  }

  pressDispatch = () => {
   
    if (!this.props.blur) {
      this.props.changeBlur(true);
      setTimeout(() => {
        this.props.changeBlur(false);
      }, 1000);
    }
  }

  static getDerivedStateFromProps () {
    return ({
      lastUpdate: moment().format("HH:mm") + ' hrs'
    })
  }
  componentDidMount() {
    this._getLocationAsync();
  }

  async _getLocationAsync() {
    const {status} = await Permissions.askAsync(Permissions.LOCATION);
    if (status !== 'granted') {
      this.setState({
        errorMessage: 'Permission to access location was denied',
      });
    }

    const location = await Location.getCurrentPositionAsync({enableHighAccuracy: true});
    this.setState({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude
    });
  }
  onRegionChangeComplete = (region) => {
    this.setState(() => ({
      ...region
    }))
  }

  pressBus = (bus) => {
    this.props.updateSelectedBus(bus)
    this.props.navigation.navigate('ArrvingToStation')

  }


  render() {
    const { blur, currentDirection, busses, navigation } = this.props;
    const { lastUpdate, latitude, longitude, latitudeDelta, longitudeDelta } = this.state

    const routeLtLng = currentDirection === 'santa_fe' ? santafe_balderas : balderas_santafe
    const routeColor = currentDirection === 'santa_fe' ? ROUTE_1 : ROUTE_2

    const currentStops = currentDirection === 'santa_fe' ? stopsSantafe : stopsBalderas

    const bound = currentDirection === 'santa_fe' ? 'inbound' : 'outbound'

    const filteredBuses = (busses || [])
      .filter(({direction}) => (direction === bound) || (direction === 'at_terminal')|| (direction === 'stopped'))

    const img = currentDirection === 'santa_fe' ? require('../assests/img/bus1.png') : require('../assests/img/bus2.png')
    return (<BotListContainer>
      {() => (<TopView>
        {<StyledMapView
          customMapStyle={mapStyle}
          showsMyLocationButton={true}
          showsUserLocation={true}
          onRegionChangeComplete={this.onRegionChangeComplete}
          region={{
            latitude,
            longitude,
            latitudeDelta,
            longitudeDelta,
          }}
        >
          <MapView.Polyline
            coordinates={routeLtLng}
            strokeColor={routeColor}
            strokeWidth={2}
          />        
          {currentStops.map(({coordinate, name, position}) => (<MapView.Marker
            title={name}
            coordinate={coordinate}
            key={currentDirection + name}
            sytle={{ zIndex: 1 }}
            image={require('../assests/img/bus_stop.png')}
          />
          ))}                     
          {(filteredBuses).map(({m1ID, position, ...rest}, index) => (<MapView.Marker
            key={m1ID}
            coordinate={position}
            image={img}
            onPress={() => { this.pressBus(m1ID) }}
            sytle={{ zIndex: 2 }}

          />))}
        </StyledMapView>}
        
        <LastUpdateView>
          <LastUpdateText>
            Última actualización: {lastUpdate}
          </LastUpdateText>
        </LastUpdateView>
      </TopView>)}
    </BotListContainer>)
  }
}


const mapDispatchToProps = {
  changeBlur,
  updateSelectedBus,
}


const mapStateToProps = (state) => ({
  blur: state.blur,
  currentDirection: state.currentDirection,
  busses: state.busses,
})

export default connect(mapStateToProps, mapDispatchToProps)(Map)