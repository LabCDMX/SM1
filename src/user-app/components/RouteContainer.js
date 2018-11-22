import React, { Component, Fragment } from 'react'
import styled from 'styled-components'

import { TouchableOpacity, StatusBar } from 'react-native'

import { connect } from 'react-redux'

import {Arrow, Info, Road} from './svg'

import { BG_GREY } from '../Constants'

import { changeDirection } from '../state'

const TopView = styled.View`
    width: 100%;
    height: 80;
    flex-direction: row;
    justify-content: space-around;
    align-items: center;
    elevation: 2;
`;

const SvgView = styled.View`
    width: 24;
    height: 24;
    justify-content: center;
    align-items: center;
`

const TextView = styled.View`
    flex-direction: row;
    justify-content: space-around;
    align-items: center;
`

const RouteName = styled.Text`
    font-size: 18;
`;

class RouteContainer extends Component {
    clickChange = (routeName) => {
        if (routeName !== 'Map') {
            return
        }
        if (this.props.currentDirection === 'santa_fe') {
            this.props.changeDirection('balderas')
        } else {
            this.props.changeDirection('santa_fe')
        }
    }
    render () {
        const { currentDirection, navigation: { state: { routeName } } } = this.props;
        const left = currentDirection === 'santa_fe' ? 'Santa Fe' : 'Balderas';
        const right = currentDirection === 'santa_fe' ? 'Balderas' : 'Santa Fe';

        const showArrow = routeName !== 'Map';
        const showInfo = routeName === 'Map' || routeName === 'BusDetail';

        return (<Fragment>
            <StatusBar
                backgroundColor={BG_GREY}
                barStyle="dark-content"
            />
            <TopView>
                <TouchableOpacity onPress={() => { this.props.navigation.navigate('Map') }}>
                    <SvgView>
                        {showArrow && <Arrow />}
                    </SvgView>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => this.clickChange(routeName)}>
                    <TextView>
                        {showArrow ? <RouteName>WAWA Beta</RouteName> : (
                            <Fragment>
                                <RouteName>{left}</RouteName>
                                <SvgView><Road /></SvgView>
                                <RouteName>{right}</RouteName>
                            </Fragment>
                        )}

                    </TextView>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => { this.props.navigation.navigate('Info') }}
                >
                    <SvgView>
                        {showInfo && <Info />}
                    </SvgView>
                </TouchableOpacity>
            </TopView>
            {this.props.innerElement()}
        </Fragment>)
    }
}

const mapDispatchToProps = {
    changeDirection
}

const mapStateToProps = (state) => ({
    currentDirection: state.currentDirection
})

export default connect(mapStateToProps, mapDispatchToProps)(RouteContainer)