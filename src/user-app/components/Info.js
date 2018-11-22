import React, { Component } from 'react'
import styled from 'styled-components'
import { connect } from 'react-redux'

import { TouchableOpacity, Linking } from 'react-native';

import { BG_WHITE, MAIN_COLOR } from '../Constants'

const InfoView = styled.View`
    background-color: ${BG_WHITE};
    flex: 1;
    align-items: center;
`;

const InfoText = styled.Text`
    text-align: center;
    margin-top: 94;
    margin-bottom: 40;
    padding-left: 52;
    padding-right: 52;
`;

const LinkText = styled.Text`
    color: ${MAIN_COLOR};
`;

class Info extends Component {
    touchLink = () => {
        const url = 'https://m1-piloto.labcd.mx'
        Linking.canOpenURL(url).then(supported => {
            if (!supported) {
              console.log('Can\'t handle url: ' + url);
            } else {
              return Linking.openURL(url);
            }
          }).catch(err => console.error('An error occurred', err));
    }
    render () {
        return (
            <InfoView>
                <InfoText>
                    WAWA es un proyecto desarrollado por Datank.ai en colaboración con el Laboratorio para la Ciudad y el Sistema de Movilidad 1 en el marco de la convocatoria CódigoCDMX.
                </InfoText>
                <TouchableOpacity onPress={this.touchLink}>
                    <LinkText>
                        Más información en esta liga
                    </LinkText>
                </TouchableOpacity>
                <InfoText>
                    {this.props.userID}
                </InfoText>
            </InfoView>
        )
    }
}

const mapStateToProps = (state) => ({
    userID: state.userID
})

export default connect(mapStateToProps)(Info)