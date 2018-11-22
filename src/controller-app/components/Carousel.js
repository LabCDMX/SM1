import React, { Component } from 'react';
import { PixelRatio, Dimensions, Image } from 'react-native';
import { createMaterialBottomTabNavigator } from 'react-navigation-material-bottom-tabs';
import { createMaterialTopTabNavigator } from 'react-navigation';
import styled from 'styled-components';
import { Constants } from 'expo';
import { MaterialTopTabBar } from 'react-navigation-tabs';

import { connect } from 'react-redux'

import { BG_WHITE, MAIN_COLOR } from '../Constants'

import { PointFilled, PointStroke } from './svg';

import Route from './Map';
import List from './List';

const TabView = styled.View`
  background-color: white;
  align-items: center;
`;


const { height, width } = Dimensions.get('window');


const TopTab = styled.View`
  height: ${PixelRatio.getPixelSizeForLayoutSize(25)};
  align-items: center;
  justify-content: center;
`;

const TopText = styled.Text`
  font-family: 'BarlowSemiCondensed-SemiBold';
  font-size: 16;
`;

const PointView = styled.View`
  flex-direction: row;
  width: 30;
  justify-content: space-between;
`;
const OnePointView = styled.View`
`;


const MaterialTopTabBarWithStatusBar = (props) => {
  const { index } =  props.navigationState

  return (
    <TabView>
      <TopTab>
        <TopText>WAWA</TopText>
      </TopTab>
      <PointView>
        <OnePointView>{0 !== parseInt(index) ? <PointStroke /> : <PointFilled />}</OnePointView>
        <OnePointView>{1 !== parseInt(index) ? <PointStroke /> : <PointFilled />}</OnePointView>
        <OnePointView>{2 !== parseInt(index) ? <PointStroke /> : <PointFilled />}</OnePointView>

      </PointView>
    </TabView>
  )
}

const mapStateToProps = (state) => ({
  blur: state.blur
})

const ConectedBar = connect(mapStateToProps)(MaterialTopTabBarWithStatusBar)

const TabContentView = styled.View`
  background-color: white;
  justify-content: space-around;
  flex: 1;
  align-items: center;
  padding-top: ${PixelRatio.getPixelSizeForLayoutSize(15) * 2};
  padding-bottom: ${PixelRatio.getPixelSizeForLayoutSize(15) * 2};
`;

const TabContentTitle = styled.Text`
  font-family: 'BarlowSemiCondensed-SemiBold';
  margin-bottom: 10;
  font-size: 18;
`;

const TabContentText = styled.Text`
    font-family: 'BarlowSemiCondensed-Regular';
    text-align: center;
    color:  #82838c;
`;

const TextView = styled.View`
  width: ${width * (2/3)};
    align-items: center;
`;

const ImgView = styled(Image)`
  width: ${PixelRatio.getPixelSizeForLayoutSize(80)};
  height: ${PixelRatio.getPixelSizeForLayoutSize(80)};
`;

const TabComp = (img, title, content) => class One extends Component {
    render() {
        return (
            <TabContentView>
              <ImgView source={img} />
              <TextView>
                <TabContentTitle>{title}</TabContentTitle>
                <TabContentText>{content}</TabContentText>
              </TextView>
            </TabContentView>
        )
    }
}


const One = TabComp(
  require('../assests/img/img_1.png'),
  'Administra',
  'Administra las unidades de tu ruta de la manera más eficiente'
);
const Two = TabComp(
  require('../assests/img/img_2.png'),
  'Monitorea',
  'Ubica la posición de tus unidades en un mapa en tiempo real'
);
const Three = TabComp(
  require('../assests/img/img_3.png'),
  'Almacena',
  'Guarda una bitácora de las unidades despachadas y su hora de salida'
);

export default createMaterialTopTabNavigator({
  One,
  Two,
  Three
},{
  initialRouteName: 'One',
  tabBarComponent: ConectedBar,
  tabBarOptions: {
    labelStyle: {
      fontSize: 12,
      color: 'black',
      fontFamily: 'BarlowSemiCondensed-Medium'
    },
    style: {
      backgroundColor: 'white',
      elevation: 0
    },
    indicatorStyle: {
      backgroundColor: MAIN_COLOR
    }
  }
})