import React from 'react';
import { gql } from 'apollo-boost';
import { Query } from 'react-apollo';

import { Text } from 'react-native'
 
const GET_MOVIES = gql`
  query {
    dogs {
        id
        breed
        displayImage
    }
    }
`
 
const App = () => (
  <Query query={GET_MOVIES}>
    {({ loading, error, data }) => {
        console.error(error)
      if (loading) return <Text>Loading...</Text>;
      if (error) return <Text>Error :(</Text>;
 
      return (
        <Text>{data.dogs[0].breed}</Text>
      )
    }}
  </Query>
)

export default App