import * as React from 'react';
import { StyleSheet } from 'react-native';


import MainScreenNew from './Screens/MainScreenNew';
import LoginScreen from './Screens/LoginScreen';

import { createStackNavigator } from 'react-navigation';

console.disableYellowBox = true;
export default class App extends React.Component {
  
  render() {
    return <AppStackNaviagtor />;
  }
}



const AppStackNaviagtor = createStackNavigator({
  
   LoginScreen: {
     screen: LoginScreen,
   },
  MainScreenNew: {
    screen: MainScreenNew,
  },
});
const styles = StyleSheet.create({});
