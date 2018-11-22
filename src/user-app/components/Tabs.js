import React, { Component } from 'react';
import { PixelRatio, Dimensions, View, StyleSheet, TouchableOpacity } from 'react-native';
import { createMaterialTopTabNavigator } from 'react-navigation';
import styled from 'styled-components';
import { Constants } from 'expo';
import { MaterialTopTabBar } from 'react-navigation-tabs';
import { connect } from 'react-redux'

import { Road, Info } from './svg';
import { BG_WHITE, MAIN_COLOR } from '../Constants'
import Route from './Map';
import List from './List';

import BotListContainer from './BotListContainer';

const TabView = styled.View`
  background-color: ${BG_WHITE};
`;

const TopTextView = styled.View`
  height: 70;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  background-color: ${BG_WHITE};
`;

const TopText = styled.Text`
  font-family: 'BarlowSemiCondensed-SemiBold';
  font-size: ${PixelRatio.get() * 8}px;
`;

const TopLeft = styled.View`
  flex: 1;
  align-items: flex-end;
`;
const CenterText = styled.View`
  align-items: center;
  justify-content: center;
  width: ${PixelRatio.get() * 10}px;
`;
const TopRight = styled.View`
  flex: 1;
`;

const CenterSvg = styled.View`
  position: absolute;
  top: 2;
`;

const InfoView = styled.View`
  position: absolute;
  width: 24;
  height: 24;
  elevation: 1;
  top: ${PixelRatio.getPixelSizeForLayoutSize(7)};
  right: 12;
`;

const { height, width } = Dimensions.get('window');

const BlurView = styled.View`
  position: absolute;
  width: ${width};
  height: 200;
  background-color: rgba(0,0,0,0.6);
  elevation: ${({ blur }) => blur ? 2 : 0};
`;



const MaterialTopTabBarWithStatusBar = (props) => (
  <TabView>
    <BlurView blur={props.blur}/>
    <InfoView>
      <Info />
    </InfoView>
    <TopTextView>
      <TopLeft><TopText>Santa Fe</TopText></TopLeft>
      <CenterText>
        <CenterSvg><Road /></CenterSvg>
      </CenterText>
      <TopRight><TopText>Balderas</TopText></TopRight>
    </TopTextView>
    <MaterialTopTabBar {...props} jumpToIndex={() => {}} />
  </TabView>
)

const mapStateToProps = (state) => ({
  blur: state.blur
})

const ConectedBar = connect(mapStateToProps)(MaterialTopTabBarWithStatusBar)

const BotButtonH = PixelRatio.getPixelSizeForLayoutSize(15)
const ViewTop = styled.View`
    width: ${width};
    height: ${BotButtonH};
    background-color: ${MAIN_COLOR};
`;

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

export default createMaterialTopTabNavigator({
  Mapa: () => (<BotListContainer>{
    () => <Route />
  }</BotListContainer>), 
  'Mis Unidades': () => (<BotListContainer>{
    () => <List />
  }</BotListContainer>), 
},{
  initialRouteName: 'Mapa',
  tabBarComponent: ConectedBar,
  tabBarOptions: {
    labelStyle: {
      fontSize: 12,
      color: '#2f303f',
      fontFamily: 'BarlowSemiCondensed-Medium'
    },
    style: {
      backgroundColor: BG_WHITE,
      elevation: 0
    },
    indicatorStyle: {
      backgroundColor: MAIN_COLOR
    }
  }
})