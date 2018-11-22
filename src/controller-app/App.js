import React, { Fragment } from 'react';

import { Provider } from 'react-redux';
import { createStore } from 'redux';

import ApolloClient from 'apollo-boost'
import {ApolloProvider, ApolloConsumer} from 'react-apollo'

import reducer from './state';

import Stack from './components/Stack'
import DataSource from './components/DataSource'

const store = createStore(reducer)

import Test from './components/Test'

const client = new ApolloClient({ uri: 'http://wawa.datank.ai:4000' })

export default class extends React.Component {
  render() {
    return (
      <ApolloProvider client={client}>
        <Provider store={store}>
          {/* <Test /> */}
          <Fragment>
            <ApolloConsumer>
              {client => <DataSource apollo={client} />}
            </ApolloConsumer>
            <Stack />
          </Fragment>
        </Provider>
      </ApolloProvider>
    )
  }
}
