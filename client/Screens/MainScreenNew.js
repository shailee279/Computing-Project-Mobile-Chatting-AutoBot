import React, { Component } from 'react';
import {StyleSheet, Platform,BackHandler } from 'react-native';

import { Ionicons} from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import {
  createBottomTabNavigator,
  createStackNavigator,
  
} from 'react-navigation';
import ChatTab from '../components/AppTabNavigator/ChatTab';
import SettingTab from '../components/AppTabNavigator/SettingTab';
import ChatScreen from '../Screens/ChatScreen';

class MainScreenNew extends Component {
  static navigationOptions = {
    header: null,
  };
  
  socket=null
  mobileNumber=null
  myName=""


  componentDidMount(){
    BackHandler.addEventListener('hardwareBackPress', function() {
      BackHandler.exitApp()
      return true
    });
  }
  
  render() {
    
    
    this.socket = this.props.navigation.state.params.socket;
    this.mobileNumber=this.props.navigation.state.params.mobileNumber
    this.myName=this.props.navigation.state.params.myName

    console.log("Mobile Number is ",this.mobileNumber);
    console.log("Nme is ",this.myName);

    return (
      <AppTabNavigator
        screenProps={{
          socket: this.socket,
          user_name:this.myName,
          mobileNumber:this.mobileNumber

          
        }}
      />
    );
  }
}

export default MainScreenNew;

const ChatStack = createStackNavigator({
  ChatTab: {
    screen: ChatTab,
    navigationOptions: ({ navigation }) => ({
      title: 'Chat Tab',
      headerBackground: (
        <LinearGradient
          colors={['#51abc6', '#0d3279']}
          style={{ flex: 1 }}
          start={[0, 0]}
          end={[1, 0]}
        />
      ),
      headerTitleStyle: { color: '#fff' },
    }),
  },
  ChatScreen: {
    screen: ChatScreen,
  },
});

ChatStack.navigationOptions = ({ navigation }) => {
  let tabBarVisible = true;

  if (navigation.state.index > 0) {
    tabBarVisible = false;
  }

  return {
    tabBarVisible,
  };
};




const SettingStack = createStackNavigator({
  SettingTab: {
    screen: SettingTab,
    headerMode: 'none',
    navigationOptions: {
        title:'Settings',
        headerBackground: (
          <LinearGradient
            colors={['#51abc6', '#0d3279']}
            style={{ flex: 1 }}
            start={[0, 0]}
            end={[1, 0]}
          />
        ),
        headerTitleStyle: { color: '#fff' },
    }
  },
});


const AppTabNavigator = createBottomTabNavigator(
  {
   
    Chat: {
      screen: ChatStack,
      navigationOptions: {
        tabBarIcon: ({ tintColor }) => (
          <Ionicons size={32}
            name="md-chatboxes"
            ios="ios-chatboxes"
            android="md-chatboxes"
            style={{ color: tintColor }}
          />
        ),
      },
    },
    Setting: {
      screen: SettingStack,
      navigationOptions: {
        headerVisible: false,
        tabBarIcon: ({ tintColor }) => (
          <Ionicons size={32}
            name="md-settings"
            ios="ios-settings"
            android="md-settings"
            style={{ color: tintColor }}
          />
        ),
      },
    },
  },
  {
    initialRouteName: 'Chat',
    animationEnabled: true,
    swipeEnabled: true,
    tabBarPosition: 'bottom',
    tabBarOptions: {
      styles: {
        ...Platform.select({
          android: {
            backgroundColor: '#ffffff',
          },
        }),
      },

      activeTintColor: 'black',
      inactiveTintColor: 'grey',
      showIcon: true,
      showLabel: false,
    },
  }
);

const styles = StyleSheet.create({});
