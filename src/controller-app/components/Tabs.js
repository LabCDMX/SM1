import React, { Component } from 'react';
import { PixelRatio, Dimensions, TouchableOpacity } from 'react-native';
import { createMaterialTopTabNavigator } from 'react-navigation';
import styled from 'styled-components';
import { Constants } from 'expo';
import { MaterialTopTabBar } from 'react-navigation-tabs';

import { connect } from 'react-redux'

import { Road, Info } from './svg';

import { BG_WHITE, MAIN_COLOR } from '../Constants'

import { changeActive, changeBlur } from '../state'

import Route from './Map';
import List from './List';

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

  /* width: 24;
  height: 24;
  elevation: 3;
  top: ${PixelRatio.getPixelSizeForLayoutSize(7)};
  right: 12; */
`;


const { height, width } = Dimensions.get('window');

const BlurView = styled.View`
  position: absolute;
  width: ${width};
  height: 200;
  background-color: rgba(0,0,0,0.6);
  elevation: ${({ blur }) => blur ? 2 : 0};
`;


const InsideTopTextView = styled.View`
  flex-direction: row;
  align-items: center;
  height: 70;
  margin-left: ${width * 0.1};
  width: ${width * 0.8};
`;



class MaterialTopTabBarWithStatusBar extends Component {
  state = {
    left: 'Santa Fe',
    right: 'Balderas',
  }

  onPressTopText = () => {
    if (this.props.active === 'santa_fe') {
      this.setState(() => ({
        right: 'Santa Fe',
        left: 'Balderas',
      }))
      this.props.changeActive('balderas')
    } else {
      this.setState(() => ({
        left: 'Santa Fe',
        right: 'Balderas',
      }))
      this.props.changeActive('santa_fe')
    }
  }

  presInfo = () => {
    this.props.navigation.navigate('Info')
  }
  render() {
    const { blur } = this.props
    const { left, right } = this.state
    return (
      <TabView>
        <BlurView blur={blur}/>

        <TopTextView>
          <TouchableOpacity onPress={this.onPressTopText}>
            <InsideTopTextView>
              <TopLeft><TopText>{left}</TopText></TopLeft>
              <CenterText>
                <CenterSvg><Road /></CenterSvg>
              </CenterText>
              <TopRight><TopText>{right}</TopText></TopRight>
            </InsideTopTextView>
          </TouchableOpacity>
          <InfoView>
            <TouchableOpacity onPress={this.presInfo}>
              <Info />
            </TouchableOpacity>
          </InfoView> 
        </TopTextView>        
        <MaterialTopTabBar {...this.props} jumpToIndex={() => {}} />
      </TabView>
    )
  }
}

const mapStateToProps = (state) => ({
  blur: state.blur,
  active: state.active,
})

const mapDispatchToProps = {
  changeActive,
  changeBlur,
}

const ConectedBar = connect(mapStateToProps, mapDispatchToProps)(MaterialTopTabBarWithStatusBar)

export default createMaterialTopTabNavigator({
  Mapa: Route,
  'Plan de salidas': List,
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