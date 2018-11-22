import React, { Component } from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { TouchableOpacity, Dimensions, PixelRatio, FlatList } from 'react-native';

import { withNavigation } from 'react-navigation';

import { MAIN_COLOR } from '../Constants';
import { changeBlur, updateselectedStation } from '../state';
import { Place } from './svg';

import stopsBalderas from '../assests/stops_balderas.json'
import stopsSantafe from '../assests/stops_santafe.json'

const BotButtonH = PixelRatio.getPixelSizeForLayoutSize(15)

const { height, width } = Dimensions.get('window');

const MainView = styled.View`
    flex-grow: 1;
`;

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

const SVGCont = styled.View`
    right: 20;
    top: ${(BotButtonH/2) - 4.5};
    position: absolute;
`;

const ListCont = styled.View`
  background-color: ${MAIN_COLOR};
  position: absolute;
  bottom: 0;
  width: ${width};
  elevation: 4;
  height: ${height/2};
`;

const ListItemView = styled.View`
    height: ${BotButtonH};
    align-items: center;
    justify-content: center;
    width: ${width};
    elevation: 5;
`;

const ListItemText = styled.Text`
    color: white;
    font-family: 'BarlowSemiCondensed-SemiBold';
    font-size: 13;
`;

class BotListContainer extends Component {

    onPress = () => {
        this.props.changeBlur(true);
    }
    onPressList = (item) => {
        this.props.changeBlur(false);
        // this.props.onPress(item)
        this.props.navigation.navigate('BusDetail')
        this.props.updateselectedStation(item.name)
    }
    renderItem =  ({item}) => (
        <TouchableOpacity onPress={() => { this.onPressList(item) }}>
        <ListItemView>
            <ListItemText>{item.name}</ListItemText>
        </ListItemView>
        </TouchableOpacity>
    )
    
    render() {
        const { children, blur, currentDirection } = this.props;

        const currentStops = currentDirection === 'santa_fe' ? stopsSantafe : stopsBalderas;
        return (
            <MainView>
                {children()}
                <ViewTop>
                    <TouchableOpacity onPress={this.onPress}>
                    <Button>
                        <ButtonText>
                            Selecciona un parada
                        </ButtonText>
                    </Button>
                    </TouchableOpacity>
                    <SVGCont>
                        <Place />
                    </SVGCont>
                </ViewTop>
                {blur && <ListCont>
                    <FlatList
                        data={currentStops}
                        renderItem={this.renderItem}
                        keyExtractor={({ name, postion }) => (name + postion)}
                        extraData={({ name }) => name}
                    />
                </ListCont>}
            </MainView>
        )
    }
}

const mapStateToProps = (state) => ({
    blur: state.blur,
    currentDirection: state.currentDirection,
})


const mapDispatchToProps = {
    changeBlur,
    updateselectedStation,
  }

export default withNavigation(connect(mapStateToProps, mapDispatchToProps)(BotListContainer))
