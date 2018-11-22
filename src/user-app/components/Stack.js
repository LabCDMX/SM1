import React from 'react';
import styled from 'styled-components';
import { Font } from 'expo';
import { createStackNavigator } from 'react-navigation';
import { Dimensions } from 'react-native'

import Carousel from './Carousel';
import Tabs from './Tabs';
import { BG_WHITE } from '../Constants'

import BotButton from './BotButton';

import Map from './Map'
import Info from './Info'
import BusDetail from './BusDetail'
import ArrvingToStation from './ArrvingToStation'

import RouteContainer from './RouteContainer'

const MainView = styled.View`
  flex: 1;
  background-color: ${BG_WHITE};
  position: relative;
`;

const { height, width } = Dimensions.get('window');

const CarouselView = styled.View`
    height: ${height};
`;

class Stack extends React.Component {
  render() {
    return (
      <MainView>
          <CarouselView>
            <Carousel />
          </CarouselView>
          <BotButton onPress={() => { this.props.navigation.navigate('Map') }}/>
      </MainView>
    );
  }
}

export default createStackNavigator({
  Home: Stack,
  Info: (props) => <RouteContainer {...props} innerElement={() => <Info {...props} />} />,
  Map: (props) => <RouteContainer {...props} innerElement={() => <Map {...props} />} />,
  BusDetail: (props) => <RouteContainer {...props} innerElement={() => <BusDetail {...props} />} />,
  ArrvingToStation: (props) => <RouteContainer {...props} innerElement={() => <ArrvingToStation {...props} />} />,
},
{
  initialRouteName: 'Home',
  headerMode: 'none',
});

