import React, {Component} from "react";
import { Text, View, StyleSheet, ImageBackground,
  KeyboardAvoidingView } from 'react-native'


import * as Font from 'expo-font';
import { TextField } from 'react-native-material-textfield';
import { Ionicons } from '@expo/vector-icons';
class SettingsTab extends Component{
  constructor(props) {
    super();
    console.log("props is ",props.screenProps.mobileNumber);
    this.state = {
      mobileNumber:props.screenProps.mobileNumber,
      user_name:props.screenProps.user_name
    };
  }
 
  static navigationOptions = {
    headerVisible: false,
       
    }
  

  async componentWillMount() { 
    try {
      await Font.loadAsync({
      'MaterialIcons': require('../../assets/fonts/MaterialIcons.ttf'),
      'MaterialCommunityIcons': require('../../assets/fonts/MaterialCommunityIcons.ttf'),
      'Material Design Icons': require('../../assets/fonts/MaterialCommunityIcons.ttf'),
      });
      
      this.setState({ fontLoaded: true });
    } catch (error) {
      console.log('error loading icon fonts', error);
    }
    }

  
  
  render(){
    

    return (
    
      <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }} >
          
      <ImageBackground source={require('../../assets/bg-screen.jpg')} style={styles.backgroundImage}>
        <View style={[styles.overlay,styles.regform]}>
           
                 <TextField
                    label="Name"
                    underlineColorAndroid={'transparent'}
                    value={this.state.user_name==null?"":this.state.user_name}
                    textColor = '#FFFFFF'
                    baseColor = '#FFFFFF'
                    tintColor = '#FFFFFF'
                    errorColor="rgb(255,255,255)"
                    editable={false}
                   
                  />
                   <TextField
                    label="Mobile Number"
                    underlineColorAndroid={'transparent'}
                    editable={false}
                    value={this.state.mobileNumber==null?"":"+"+this.state.mobileNumber}
                    textColor = '#FFFFFF'
                    baseColor = '#FFFFFF'
                    tintColor = '#FFFFFF'
                    disabledLineType="dotted"  
                    disabled
                    
                  />
                  { this.state.nameFocus?
                  <View
                  style={{
                    position: 'absolute',
                    height: 60,
                    width: 60,
                    right: 10,
                    bottom:100,
                    opacity: 1,
                    zIndex: 100,
                    backgroundColor: '#ffffff',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 30,
                    
                  }}>
                  <Ionicons
                    size={32}
                    onPress={() => this.onPressNext()}
                    name="md-checkmark"
                    style={{ color: '#0161b2' }}
                  />
                </View>
                :
                null  
                  }
                  
         
          </View>
      
      </ImageBackground>
      </KeyboardAvoidingView>  
    

    );
  }
}

export default SettingsTab;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems:'center',
  },
  regform: {
    flex: 1,
    padding: 20,
    
  },
  backgroundImage: {
    flex: 1,
    width: null,
    height: null,
},
  overlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: '#03bbfa',
    opacity: 0.9
  },
  colorItem:{
    color:'white'
  }

  
});