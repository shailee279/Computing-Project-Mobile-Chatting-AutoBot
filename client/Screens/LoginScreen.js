import React, { Component } from 'react';
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Animated,
  Dimensions,
  Keyboard,
  Platform,
  AsyncStorage,
} from 'react-native';
import * as Font from 'expo-font';
import { TextField } from 'react-native-material-textfield';

import * as io from 'socket.io-client';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { countryCode } from '../assets/countryCode';
import ModalFilterPicker from 'react-native-modal-filter-picker';
import {baseURL} from '../assets/baseURL';


const SCREEN_HEIGHT = Dimensions.get('window').height;
const socket = io.connect(
  baseURL,
  { transports: ['websocket'] }
);

class LoginScreen extends Component {
  constructor(props, ctx) {
    super(props, ctx);
    this.state = {
      
      loggedIn: null,
      visible: false,
      picked: '1',
      loginEnabled:false,
      forwardArrowBottom:0,
      forwardArrowOpacity:0,
      mobileNumber:'',
      mobileNumberError:null,
      placeholderText: 'Enter Mobile Number',
      password:'',
      user_name:"",
    };
  }

  async saveItem(item, selectedValue) {
    try {
      await AsyncStorage.setItem(item, selectedValue);
    } catch (error) {
      console.error('AsyncStorage error: ' + error.message);
    }
  }

  static navigationOptions = {
    header: null,
  };

  componentWillMount() {

    this.loginHeight = new Animated.Value(150);

    this.keyboardWillShowListener = Keyboard.addListener(
      'keyboardWillShow',
      this._keyboardWillShow
    );
    this.keyboardWillHideListener = Keyboard.addListener(
      'keyboardWillHide',
      this._keyboardWillHide
    );
    this.keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      this._keyboardWillShow
    );
    this.keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      this._keyboardWillHide
    );
    this.keyboardHeight = new Animated.Value(0);
    
    this.borderBottomWidth = new Animated.Value(0);
  }





  
  componentDidMount() {
    Font.loadAsync({
      'Moonbright-Demo': require('../assets/fonts/Moonbright-Demo.ttf')
    })
      .then(() => {
         this.setState({ fontLoaded: true });
      });



    AsyncStorage.getItem('loggedIn').then(token => {
      this.setState(
        { loggedIn: token },
        () => 
        {
          AsyncStorage.getItem('user_name').then(user_name => {
            this.setState(
              { user_name: user_name },
              () => {
                AsyncStorage.getItem('password').then(password => {
         
                  this.setState(
                    { password: password },
                    () => {
                      if (this.state.loggedIn != null && this.state.loggedIn != '') {
            
                        socket.send({
                          type: 'login',
                          mobileNumber: this.state.loggedIn,
                          password:this.state.password,
                          user_name:this.state.user_name
                        });
                      }
                    }
                  );
    
                }).catch({
                  
                });
              }
            );
         

    
          }).catch({
            
          });

        }
        
        
      );

    }).catch({
      
    });

    socket.on(
      'login',
      function(data) {
        this.saveItem("loggedIn",data.mobileNumber)
        this.saveItem("user_name",data.user_name)
        this.saveItem("password",data.password)
        this.props.navigation.navigate('MainScreenNew', {
          socket: socket,
          mobileNumber: data.mobileNumber,
          myName:data.user_name
        });
      }.bind(this)
    );



    //this.getAllContacts(0);
  }

  componentWillUnmount() {
    this.listener && this.listener.remove();
  }



  onPressNext() {
    // console.log("next clicked");
    let mobileNumber = this.state.picked + this.state.mobileNumber;

    if (this.state.mobileNumber.length == 0) {
      // console.log("err Please enter mobile number");
      this.setState({ mobileNumberError: 'Please enter mobile number' });
    } else {

      socket.send({
        type: 'login',
        mobileNumber: mobileNumber,
        password:this.state.password,
        user_name:this.state.user_name

      });
    }
  }

  _keyboardWillShow = event => {
    this.setState({logoOpacity:.3,logoTextOpacity:0})
    let duration = 0;
    this.setState({forwardArrowBottom:event.endCoordinates.height + 10,forwardArrowOpacity:1})
    if (Platform.OS == 'android') {
      duration = 100;
    } else {
      duration = event.duration;
    }
    Animated.parallel([
      Animated.timing(this.keyboardHeight, {
        duration: duration + 100,
        toValue: event.endCoordinates.height + 10,
      }),
      Animated.timing(this.borderBottomWidth, {
        duration: duration,
        toValue: 1,
      }),
    ]).start();
  };

  _keyboardWillHide = event => {
    this.setState({logoOpacity:1,logoTextOpacity:1})
    let duration = 0;
    if(this.state.mobileNumber.length==0){
      this.setState({forwardArrowOpacity:0})
    }
    else{
      this.setState({forwardArrowOpacity:1})
    }
    if (Platform.OS == 'android') {
      duration = 100;
    } else {
      duration = event.duration;
    }
    Animated.parallel([
      Animated.timing(this.keyboardHeight, {
        duration: duration + 100,
        toValue: 0,
      }),
      Animated.timing(this.borderBottomWidth, {
        duration: duration,
        toValue: 0,
      }),
    ]).start();
  };
  increaseHeightOfLogin = () => {
    //console.log("Increase height")
    this.setState({ placeholderText: '9876543210',loginEnabled:true });
    Animated.timing(this.loginHeight, {
      toValue: SCREEN_HEIGHT+250,
      duration: 500,
    }).start(() => {
      
    }); 
  };

  decreaseHeightOfLogin = () => {
    this.setState({ loginEnabled:false });
    Keyboard.dismiss();
    Animated.timing(this.loginHeight, {
      toValue: 150,
      duration: 500,
    }).start();
  };

  onShow = () => {
    //console.log("clicked")
    this.setState({ visible: true });
  };

  onSelect = picked => {

    this.setState({
      picked: picked,
      visible: false,
    });

    this.refs.textInputMobile.blur();

    // setTimeout(() => {
    //   this.refs.textInputMobile.focus();
    // }, 50);
  };

  onCancel = () => {
    this.setState({
      visible: false,
    });
  };

  render() {
    const visible = this.state.visible;
    const picked = this.state.picked;
    const headerTextOpacity = this.loginHeight.interpolate({
      inputRange: [150, SCREEN_HEIGHT],
      outputRange: [1, 0],
    });

    const marginTop = this.loginHeight.interpolate({
      inputRange: [150, SCREEN_HEIGHT],
      outputRange: [25, 100],
    });
    const headerBackArrowOpacity = this.loginHeight.interpolate({
      inputRange: [150, SCREEN_HEIGHT],
      outputRange: [0, 1],
    });

    const titleTextLeft = this.loginHeight.interpolate({
      inputRange: [150, SCREEN_HEIGHT],
      outputRange: [65, 25],
    });

    const titleTextBottom = this.loginHeight.interpolate({
      inputRange: [150, 400, SCREEN_HEIGHT],
      outputRange: [0, 0, 100],
    });
   
    const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);
    return (
      <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
        <Animated.View
          style={{
            position: 'absolute',
            height: 60,
            width: 60,
            top: 60,
            left: 25,
            zIndex: 100,
            opacity: headerBackArrowOpacity,
          }}>
          <TouchableOpacity onPress={() => this.decreaseHeightOfLogin()}>
            <Ionicons name="md-arrow-back" size={32} style={{ color: 'white' }} />
          </TouchableOpacity>
        </Animated.View>

        <AnimatedTouchable
          style={{
            position: 'absolute',
            height: 60,
            width: 60,
            right: 10,
            bottom: this.state.forwardArrowBottom,
            opacity: this.state.forwardArrowOpacity,
            zIndex: 100,
            backgroundColor: '#ffffff',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 30,
          }}
          onPress={() => this.onPressNext()}
          >
          <Ionicons
            size={32}
           
            name="md-arrow-forward"
            style={{ color: '#0161b2' }}
          />
        </AnimatedTouchable>

        <LinearGradient
              colors={['#03bbfa', '#0053a9']}
              style={{ flex: 1 }}
              start={[0, 0]}
              end={[1, 0]}
        >
          {this.state.loginEnabled?null
          :
          <View
            style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
             <Text style={{ fontWeight: 'bold', fontSize: 30,color:'white',opacity:this.state.logoTextOpacity }}>Lets Talk</Text>
            
          </View>
          }
          

          {/*Bottom Half*/}
          <View>
          {this.state.loggedIn != null && this.state.loggedIn != ''?null:
            <View>
            <View style={{ height: this.loginHeight ,flexDirection: 'row',marginLeft:30,marginRight:30,height:30,bottom:250,borderBottomColor: 'white',borderBottomWidth:1}} >
                <TouchableOpacity onPress={this.onShow}>
                      <Text style={{ fontSize: 20,color: 'white',flex:1,paddingRight:20}}>+{picked}</Text>
                </TouchableOpacity>
                <ModalFilterPicker
                      visible={visible}
                      onSelect={this.onSelect}
                      onCancel={this.onCancel}
                      options={countryCode}
                      keyboardShouldPersistTaps="always"
                      title="Select Your Country Code"
                />
                <TextInput
                          ref="textInputMobile"
                          keyboardType="numeric"
                          placeholder={this.state.placeholderText}
                          style={{ flex: 4, fontSize: 20, color: 'white',flex:5  }}
                          underlineColorAndroid="transparent"
                          onChangeText={mobileNumber =>
                            this.setState({ mobileNumber })  
                          }
                    /> 
                
                  
            </View>
            <View style={{ height: this.loginHeight ,marginLeft:30,marginRight:30,height:30,bottom:200,borderBottomColor: 'white',borderBottomWidth:1}}>
            <TextInput
                  ref="textInputName"
                  placeholder={"Enter Name"}
                  style={{ flex: 4, fontSize: 20, color: 'white',flex:5  }}
                  underlineColorAndroid="transparent"
                  onChangeText={user_name =>
                    this.setState({ user_name })  
                  }
            />
            </View>
            <View style={{ height: this.loginHeight ,marginLeft:30,marginRight:30,height:30,bottom:150,borderBottomColor: 'white',borderBottomWidth:1}}>
            <TextInput
                  ref="textInputPassword"
                  secureTextEntry={true}
                  placeholder={"Enter Password"}
                  style={{ flex: 4, fontSize: 20, color: 'white',flex:5  }}
                  underlineColorAndroid="transparent"
                  onChangeText={password =>
                    this.setState({ password })  
                  }
            />

            </View>
            </View>
            
           }
           


          </View>
        </LinearGradient>
       
      </KeyboardAvoidingView>
    );
  }
}

export default LoginScreen;
