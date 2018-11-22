import React from 'react';
import styled from 'styled-components';
import { Font } from 'expo';
import { createStackNavigator } from 'react-navigation';
import { TouchableOpacity, Dimensions, PixelRatio, View } from 'react-native'

import Carousel from './Carousel';
import Tabs from './Tabs';
import Info from './Info'
import { BG_WHITE, MAIN_COLOR } from '../Constants'

const MainView = styled.View`
  flex: 1;
  background-color: ${BG_WHITE};
  position: relative;
`;

const { height, width } = Dimensions.get('window');

const Button = styled.View`
  width: 100%;
  height: 100%;
  justify-content: center;
  align-items: center;
`;

const ButtonText = styled.Text`
  font-family: 'BarlowSemiCondensed-SemiBold';
  color: white;
`;

const BotButtonH = PixelRatio.getPixelSizeForLayoutSize(15)

const ViewTop = styled.View`
    position: absolute;
    bottom: 0;
    width: ${width};
    height: ${BotButtonH};
    background-color: ${MAIN_COLOR};
`;

const CarouselView = styled.View`
    height: ${height};
`;

class Stack extends React.Component {
  state = {
    fontLoaded: false
  }
  async componentDidMount() {
    await Font.loadAsync({
      'BarlowSemiCondensed-Regular': require('../assests/fonts/BarlowSemiCondensed-Regular.ttf'),
      'BarlowSemiCondensed-SemiBold': require('../assests/fonts/BarlowSemiCondensed-SemiBold.ttf'),
      'BarlowSemiCondensed-Medium': require('../assests/fonts/BarlowSemiCondensed-Medium.ttf'),
    });
    this.setState({ fontLoaded: true });
  }
  render() {
    return (
      this.state.fontLoaded ?
      <MainView>
          <CarouselView>
            <Carousel />
          </CarouselView>
          <ViewTop>
            <TouchableOpacity onPress={() => { this.props.navigation.navigate('Tabs') }}>
              <Button>
                <ButtonText>
                  Comenzar
                </ButtonText>
              </Button>
            </TouchableOpacity>
          </ViewTop>
      </MainView> : null
    );
  }
}

export default createStackNavigator({
  Home: Stack,
  Tabs,
  Info,
},
{
  initialRouteName: 'Home',
  headerMode: 'none',
});

