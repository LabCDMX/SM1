import React, { Fragment } from 'react';

import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { Font } from 'expo';

import ApolloClient from 'apollo-boost'
import {ApolloProvider, ApolloConsumer} from 'react-apollo'

import reducer from './state';

import Stack from './components/Stack'
import DataSource from './components/DataSource'

const store = createStore(reducer)

const client = new ApolloClient({ uri: 'http://wawa.datank.ai:4000' })

export default class extends React.Component {
  state = {
    fontLoaded: false
  }
  async componentDidMount() {
    await Font.loadAsync({
      'BarlowSemiCondensed-Regular': require('./assests/fonts/BarlowSemiCondensed-Regular.ttf'),
      'BarlowSemiCondensed-SemiBold': require('./assests/fonts/BarlowSemiCondensed-SemiBold.ttf'),
      'BarlowSemiCondensed-Medium': require('./assests/fonts/BarlowSemiCondensed-Medium.ttf'),
    });
    this.setState({ fontLoaded: true });
  }
  render() {
    return (
      this.state.fontLoaded ?
      <ApolloProvider client={client}>
        <Provider store={store}>
          <Fragment>
            <Stack />
            <ApolloConsumer>
              {client => <DataSource apollo={client} />}
            </ApolloConsumer>
          </Fragment>
        </Provider>
      </ApolloProvider>: null
    );
  }
}