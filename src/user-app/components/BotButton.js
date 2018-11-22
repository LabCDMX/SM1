import React, { Component } from 'react';
import styled from 'styled-components';
import { TouchableOpacity, Dimensions, PixelRatio } from 'react-native';

import { MAIN_COLOR } from '../Constants'

const BotButtonH = PixelRatio.getPixelSizeForLayoutSize(15)

const { height, width } = Dimensions.get('window');

const ViewTop = styled.View`
  position: absolute;
  bottom: 0;
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


export default class extends Component {
  render () {
    return (
      <ViewTop rel={this.props.rel}>
        <TouchableOpacity onPress={this.props.onPress}>
          <Button>
            <ButtonText>
              {this.props.title || 'COMENZAR'}
            </ButtonText>
          </Button>
        </TouchableOpacity>
      </ViewTop>
    );
  }
}
