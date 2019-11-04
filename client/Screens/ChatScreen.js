import React, { Component } from 'react';
import { Text, View, StyleSheet, Platform} from 'react-native';
import Spinner from 'react-native-loading-spinner-overlay';
import { KeyboardAvoidingView } from 'react-native';
import _ from 'lodash'; // 4.17.5

import { Icon } from 'native-base';
import { GiftedChat, Actions,Bubble,Time } from 'react-native-gifted-chat';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';


class ChatScreen extends Component {
  socket = null;
  
  

  constructor(props) {
    super(props);
   
    
    this.state={
      category:props.navigation.state.params.category,
      mobileNumber:props.navigation.state.params.mobileNumber,
      user_name:props.navigation.state.params.user_name
    }
    
    
   
  }

  state = {
    messages: [],
    
  };

  static navigationOptions = ({ navigation }) => {
    return {
      title: navigation.state.params.displayName,
      
      headerBackground: (
        <LinearGradient
          colors={['#51abc6', '#0d3279']}
          style={{ flex: 1 }}
          start={[0, 0]}
          end={[1, 0]}
        />
      ),
      headerLeft: (
        <MaterialCommunityIcons
          size={32}
          style={{ paddingRight: 10,color:'white' }}
          name="chevron-left"
          onPress={() => navigation.navigate('ChatTab',{
            isGroup: navigation.state.params.isGroup,
            socket:navigation.state.params.socket,
            receiverMobileNumber:navigation.state.params.name,
            me:navigation.state.params.mobileNumber,
          }
          
          )}
        />
      ),
      headerTitleStyle: { color: '#fff' },
      headerTintColor: 'white',  
      
    };
  };

  componentWillMount() {
   
    this.setState({
      messages: [{
        _id: 1,
        text: 'Hi, How can I help you?',
        createdAt: new Date(Date.UTC(2019, 10, 28, 17, 20, 0)),
          user: {
            _id: "Chatbot",
            name: "Chatbot",
            
            renderAvatarOnTop:true
            
          },

        
      }], 
    });

  }

  onSend(messages = []) {
    this.setState(previousState => ({
      messages: GiftedChat.append(previousState.messages, messages),
    }));
 
    console.log(this.state.user_name,JSON.stringify(messages));
    this.socket.send({
      type: 'message',
      user_name:this.state.user_name,
      category:this.state.category,
      message:messages[0].text,
      mobileNumber:this.state.mobileNumber,
    });
  }






  componentDidMount() {

    this.socket.send({
      type: 'old_messages',
      category:this.state.category,
      mobileNumber:this.state.mobileNumber,
    });




    // this.socket.on(
    //   'typingStatus',
    //   function(message) {
        
    //     if (message.type == 'typingStatus') {
    //       if(message.status=="true"){
    //         console.log("typing Status Received",message.status)
    //         this.setState({isTyping:true})
    //       }
    //       else{
    //         console.log("typing Status Received",message.status)
    //         this.setState({isTyping:false})
    //       }
    //     }
    //   }.bind(this)
    // )


    this.socket.on(
      'old_messages',
      function(message) {
            console.log("old_message",JSON.stringify(message))
            for (var i = 0; i < message.length; i++) {
              userId=""
              if(message[i].senderMobileNumber == this.state.mobileNumber){
                  userId=message[i].user_name
              }
              else{
                userId="Chatbot"
              }
              this.setState(previousState => {
                return {
                  messages: GiftedChat.append(previousState.messages, {
                    _id: Math.round(Math.random() * 1000000),
                    text: message[i].message,
                    createdAt: message[i].timestamp,
                    user: {
                      _id: userId,
                      name: userId,
                     
                      renderAvatarOnTop:true
                     
                    },
                   
                  }),
                };
              });


            }




      }.bind(this)
    )




    this.socket.on(
      'message',
      function(message) {
        console.log("message",message);
        this.setState(previousState => {
          return {
            messages: GiftedChat.append(previousState.messages, {
              _id: Math.round(Math.random() * 1000000),
              text: message.message,
              createdAt: new Date(),
              user: {
                _id: "Chatbot",
                name: "Chatbot",
                renderAvatarOnTop:true
              },
            }),
          };
        });








        if (message.type == 'message') {
          console.log("message",message);
         
          // if(message.imageName!=''){
          //     this.setState(previousState => {
          //       return {
          //         messages: GiftedChat.append(previousState.messages, {
          //           _id: Math.round(Math.random() * 1000000),
          //           text: message.userInput[0].text,
          //           createdAt: new Date(),
          //           user: {
          //             _id: 2,
          //             name: message.senderName,
                     
          //             renderAvatarOnTop:true
                     
          //           },
          //           image:baseURL+'images/'+message.sender+'_'+message.receiver+'/'+ message.imageName,
          //         }),
          //       };
          //     });
          // }
          // else{
          //     this.setState(previousState => {
          //       return {
          //         messages: GiftedChat.append(previousState.messages, {
          //           _id: Math.round(Math.random() * 1000000),
          //           text: message.userInput[0].text,
          //           createdAt: new Date(),
          //           user: {
          //             _id: 2,
          //             name: message.senderName,
                     
          //             renderAvatarOnTop:true
                    
          //           },
          //         }),
          //       };
          //     });             
          // }

        }
      }.bind(this)
    );

    // this.socket.on(
    //   'requestOldPrivateMessages',
    //   function(message) {
    //     // console.log("RequestOldPrivateMessage Received from server "+message.messageList.length);
    //     if (message.type == 'requestOldPrivateMessages') {
    //       var receiverMobileNumber="";
    //       // console.log("These many messages should display "+message.messageList.length);
    //       for (var i = 0; i < message.messageList.length; i++) {
    //         if(this.isGroup=="true"){
    //           receiverMobileNumber=message.messageList[i].groupId;
    //         }
    //         else{
    //           receiverMobileNumber=message.messageList[i].receiverMobileNumber;
    //         }
          
    //         if (message.messageList[i].senderMobileNumber == this.me) {
    //           // message sent by me
    //           if(message.messageList[i].imageName!=''){
                
    //             // image in the message
    //             this.setState(previousState => {
    //               return {
    //                 messages: GiftedChat.append(previousState.messages, {
    //                   _id: message.messageList[i]._id,
    //                   text: message.messageList[i].message,
    //                   createdAt: message.messageList[i].timeStamp,
    //                   user: {
    //                     _id: this.me,
    //                     name: message.senderName,
                        
    //                     renderAvatarOnTop:true
                       
    //                   },
    //                   image:baseURL+'images/'+message.messageList[i].senderMobileNumber+'_'+receiverMobileNumber+'/'+ message.messageList[i].imageName,
    //                 }),
    //               };
    //             });
    //           }
    //           else{
    //             // image not in the message
    //             this.setState(previousState => {
    //               return {
    //                 messages: GiftedChat.append(previousState.messages, {
    //                   _id: message.messageList[i]._id,
    //                   text: message.messageList[i].message,
    //                   createdAt: message.messageList[i].timeStamp,
    //                   user: {
    //                     _id: this.me,
    //                     name: message.senderName,
                       
    //                     renderAvatarOnTop:true
                       
    //                   },
    //                 }),
    //               };
    //             });
    //           }
    //         } else {
            
    //           // message sent to me (received by me)
    //           if(message.messageList[i].imageName!=''){
    //             console.log(baseURL+'images/'+message.messageList[i].senderMobileNumber+'_'+receiverMobileNumber+'/'+ message.messageList[i].imageName)
    //             // image in the message
    //             this.setState(previousState => {
    //               return {
    //                 messages: GiftedChat.append(previousState.messages, {
    //                   _id: message.messageList[i]._id,
    //                   text: message.messageList[i].message,
    //                   createdAt: message.messageList[i].timeStamp,
    //                   user: {
    //                     _id: this.receiverMobileNumber,
    //                     name: this.isGroup=="true"?message.messageList[i].senderName:this.displayName,
                       
    //                     renderAvatarOnTop:true
                        
    //                   },
    //                   image:baseURL+'images/'+message.messageList[i].senderMobileNumber+'_'+receiverMobileNumber+'/'+ message.messageList[i].imageName,
    //                 }),
    //               };
    //             });
    //           }
    //           else{
    //             // image not in the message
    //             this.setState(previousState => {
    //               return {
    //                 messages: GiftedChat.append(previousState.messages, {
    //                   _id: message.messageList[i]._id,
    //                   text: message.messageList[i].message,
    //                   createdAt: message.messageList[i].timeStamp,
    //                   user: {
    //                     _id: this.receiverMobileNumber,
    //                     name: this.isGroup=="true"?message.messageList[i].senderName:this.displayName,
                       
    //                     renderAvatarOnTop:true
                        
    //                   },

    //                 }),
    //               };
    //             });
    //           }
    //         }
    //       }
    //     }
    //   }.bind(this)
    // );
     
    // Handle Back Button

  }

  componentWillUnmount() {
    
  }

	renderBubble(props) { 
		return ( 
			    <Bubble
				  {...props}
				  wrapperStyle={{
					left: {
					  backgroundColor: '#e5e4e9',
					},
					right: {
					  backgroundColor: '#168fff',
					},
				  }}
				  />
		 );
   }

   renderLoading(props) { 
		return ( 
        <Spinner
          visible={true}
          textContent={'Loading...'}
          textStyle={styles.spinnerTextStyle}
      />
		 );
   }
   
   
   renderAvatar(props) {
    console.log(props) 
		return ( 
      <View style={styles.circle}>
        <Text style={styles.avatarText}>{props.user.name}</Text>
      </View>
		 );
	 }






  render() {
    this.socket = this.props.navigation.state.params.socket;
    
    
  
    // console.log("Messages are ",this.state.messages)
    return (
      <View style={{ flex: 1 ,backgroundColor:'#ffffff'}}>
        <GiftedChat
        
          messages={this.state.messages}
          onSend={messages => this.onSend(messages)}
          user={{
            _id: this.state.user_name,
            name: this.isGroup=="true"?this.myName:this.displayName,

          }}
        
		      renderBubble={this.renderBubble.bind(this)}
          renderAvatarOnTop={true}
        
        />
         {Platform.OS === 'android' ? <KeyboardAvoidingView behavior={'padding'} keyboardVerticalOffset={80}/> : null}
       
      </View>
    );
  }
}

export default ChatScreen;

const styles = StyleSheet.create({
  spinnerTextStyle: {
    color: '#FFF'
  },
  userHashTagSent: {
    fontStyle: 'italic',
    backgroundColor: '#1067b6', 
    color:'#fff'
  },
  systemHashTagSent: {
    fontStyle: 'italic',
    backgroundColor: '#1067b6', 
    color:'#fff'
  },
  userHashTagReceived: {
    fontStyle: 'italic',
    backgroundColor: '#cac9cf', 
    color:'#000'
  },
  systemHashTagReceived: {
    fontStyle: 'italic',
    backgroundColor: '#cac9cf', 
    color:'#000'
  },
  parseTextSent:{
  	  paddingLeft:10,
	  paddingRight:10,
	  paddingTop:5,
	  paddingBottom:5,
	  color:'#fff'
  },
  parseTextReceived:{
  	  paddingLeft:10,
	  paddingRight:10,
	  paddingTop:5,
	  paddingBottom:5,
	  color:'#000'
  },
  circle: {
    width: 40,
    height: 40,
    borderRadius: 40/2,
    backgroundColor: '#51abc6',
    color:'white'
  },
  avatarText:{
    marginTop:10,
    marginLeft:10,
    color:'white'
  }

});
