import React, { Component } from 'react';
import { TouchableOpacity, Dimensions, PixelRatio, Linking } from 'react-native'
import { connect } from 'react-redux'
import styled from 'styled-components';

import { BG_WHITE, MAIN_COLOR } from '../Constants'

const MainView = styled.View`
    height: 100%;
    background-color: ${BG_WHITE};
    width: 100%;
    justify-content: center;
    align-items: center;
`;
const InfoText = styled.Text`
    margin-bottom: 40;
    text-align: center;
`;
const InfoTextColor =  styled(InfoText)`
    color: ${MAIN_COLOR};
`;

const BotButtonH = PixelRatio.getPixelSizeForLayoutSize(10)

const { width } = Dimensions.get('window');

const ButtonView = styled.View`
    background-color: ${MAIN_COLOR};
    height: ${BotButtonH};
    width: ${width * 0.45};
    justify-content: center;
    align-items: center;
`;

const ButtonText = styled.Text`
    color: white;
`;

class Info extends Component {
    openLink = () => {
        const url = 'ttps://m1-piloto.labcd.mx'
        Linking.canOpenURL(url).then(supported => {
            if (!supported) {
              console.log('Can\'t handle url: ' + url);
            } else {
              return Linking.openURL(url);
            }
          }).catch(err => console.error('An error occurred', err));
    }
    render () {
        console.log('{this.props.operator_id}', this.props.operator_id)
         return (<MainView>
            <InfoText>WAWA es un proyecto desarrollado por Datank.ai en colaboración con el Laboratorio para la Ciudad y el Sistema de Movilidad 1 en el marco de la convocatoria CódigoCDMX.</InfoText>
            <InfoText>ID: {this.props.operator_id}</InfoText>
            <TouchableOpacity onPress={this.openLink}>
                <InfoTextColor>Más información en esta liga</InfoTextColor>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { this.props.navigation.navigate('Tabs') }}>
                <ButtonView>
                    <ButtonText>
                        Regresar
                    </ButtonText>
                </ButtonView>
            </TouchableOpacity>
         </MainView>)
    }
}

const mapStateToProps = (state) => ({
    operator_id: state.operator_id,
  })

export default connect(mapStateToProps)(Info)
