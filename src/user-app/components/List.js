import React, { Component, Fragment } from 'react';
import styled from 'styled-components';
import { Text, View, SectionList, Dimensions, PixelRatio } from 'react-native';

import { connect } from 'react-redux'

import { BG_WHITE } from '../Constants';

import {
  BusBlack,
  BusGreen,
  BusGrey,
  Dispatched,
  NotDispatched,
  DispatchedTime
} from './svg';


const MainView = styled.View`
  flex: 1;
  background-color: white;
  align-items: center;
  justify-content: center;
`;

const FontText = styled.Text`
  font-family: 'BarlowSemiCondensed-Regular';
`;

const { height, width } = Dimensions.get('window');

const TitleView = styled.View`
  margin-top: 16;
  margin-left: 16;
  width: ${width};
`;

const Title = styled.Text`
  font-family: 'BarlowSemiCondensed-Regular';
  color: #A4A4A9;
`;

const Data = [
  { number: '6935', time: '01:10:00', status: 'CURRENT' },
  { number: '4932', time: '01:34:46', status: 'PAST' },
  { number: '6935', time: '01:34:46', status: 'PAST' }
];

const ListView = styled.View`
  margin-top: 16;
  margin-bottom: 16;
  margin-left: 20;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const chooseBus = (status) => {
  switch (status) {
    case 'DELAYED':
    return <BusBlack />;
    case 'ONTIME':
    return <BusBlack />;
    case 'CURRENT':
    return <BusBlack />;
    case 'PAST':
    return <BusGrey />;
    default:
    return null;
  }
}

const LeftView = styled.View`
  flex-direction: row;
  align-items: center;
`;
const RightView = styled.View`
  flex-direction: row;
  margin-right: 30;
  align-items: center;
`;

const chooseColor = (status) => {
  switch (status) {
    case 'DELAYED':
    return '#2f303f';
    case 'ONTIME':
    return '#2f303f';
    case 'CURRENT':
    return '#2f303f';
    case 'PAST':
    return '#C1C1C6';
    default:
    return 'black';
  }
}

const chooseDispatch = (status) => {
  switch (status) {
    case 'DELAYED':
    return <NotDispatched />;
    case 'ONTIME':
    return <Dispatched />;
    case 'CURRENT':
    return <Dispatched />;
    case 'PAST':
    return null;
    default:
    return null;
  }
}

const NumberText = styled.Text`
  color: ${({ color }) => color};
`;

const DispatchView = styled.View`
  margin-right: 8;
`;

const BusView = styled.View`
  margin-right: 16;
`;

const LineView = styled.View`
  width: ${width};
  align-items: flex-end;
`;

const Line = styled.View`
  border-width: 0.5;
  border-color: #E2E2E2;
  height: 1;
  width: ${width - (50)};
`;

const BlurView = styled.View`
  position: absolute;
  width: ${width};
  height: ${height};
  background-color: rgba(0,0,0,0.6);
  elevation: ${({ blur }) => blur ? 1 : 0};
  opacity: ${({ blur }) => blur ? 1 : 0};
`;

class HomeScreen extends Component {
  render() {
    const { blur } = this.props;
    return (
      <MainView>
        <BlurView blur={blur} />
        <SectionList
          sections={[
            {title: 'Miércoles 8 de Agosto', data: Data},
          ]}
          renderItem={({item: { number, status, time }}) => (<Fragment>
            <ListView>
              <LeftView>
                <BusView>
                  {chooseBus(status)}
                </BusView>
                <NumberText color={chooseColor(status)}>Nº. {number}</NumberText>
              </LeftView>
              <RightView>
                <NumberText color={chooseColor(status)}>{time}</NumberText>
              </RightView>
            </ListView>
            <LineView>
              <Line />
            </LineView>
          </Fragment>
          )}
          renderSectionHeader={({section}) => <TitleView><Title>{section.title}</Title></TitleView>}
          keyExtractor={(item, index) => item + index}
        />
      </MainView>
    );
  }
}

const mapStateToProps = (state) => ({
  blur: state.blur
})

export default connect(mapStateToProps)(HomeScreen)
