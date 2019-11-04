import React, { Component } from 'react';
import { StyleSheet, FlatList,AppState,AsyncStorage } from 'react-native';
import {
  ListItem,
  Left,
  Body,
  Right,
  Thumbnail,
  Text,
  View,
} from 'native-base';
import _ from 'lodash';
import { SearchBar } from 'react-native-elements';
import { AppLoading } from 'expo';


import * as Font from 'expo-font';


class ChatTab extends Component {
  socket = null;
  chatTabArray = [{name:'Travel and Bookings',lastMessage:'',latestMessageTime:'',category:'bookings'},{name:'Customer Support',lastMessage:'',latestMessageTime:'',category:'support'},{name:'General',lastMessage:'',latestMessageTime:'',category:'normal'}];
  
  constructor(props) {
    super();
    this.socket = props.screenProps.socket;
    this.mobileNumber = props.screenProps.mobileNumber;
    this.myName = props.screenProps.user_name;
  
    this.state = {
      
     
      refreshing: false,
      fontLoaded: false,
     
    };
	this.tempChatTabArray = props.screenProps.chatTabArray;
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
		  // console.log('error loading icon fonts', error);
    }
    
  
   
	  }
  componentDidMount() {
  

  }


 

  



	searchFilterFunction = text => {
    console.log("Chat CAlled")
		// console.log(this.tempChatTabArray);
		const newData = this.tempChatTabArray.filter(item => {
			const itemData = `${item.name.toUpperCase()}`;
			console.log(itemData);
      const textData = text.toUpperCase();
      if(itemData.indexOf(textData)>-1){
        return itemData.indexOf(textData) > -1;
      }
      else{
        return -1
      }
        
    });
    if(newData>-1){
      this.setState({
        chatTabArray: newData,
      });
    }

	};

   renderFlatListHeader = () => {
    return (
      <SearchBar
        placeholder="Search..."
        lightTheme
        round
        onChangeText={text => this.searchFilterFunction(text)}
        autoCorrect={false}
      />
    );
  };


  render() {
   
	if (!this.state.fontLoaded) {
      return <AppLoading />;
  }
  else{
      return (
        <FlatList
          data={this.chatTabArray}
          renderItem={({ item }) => (
            <ListItem
              avatar
              button={true}
              onLongPress={() => console.log('event -> onLongPress')}
              onPress={() =>
                this.props.navigation.navigate('ChatScreen', {
                  socket: this.socket,
                  category:item.category,
                  displayName: item.name,
                  mobileNumber:this.mobileNumber,
                  user_name:this.myName
                })
              }>
              <Left>
                <Thumbnail source={require('../../assets/snack-icon.png')} />
              </Left>
              <Body>
        
                { 
                  isNaN(item.name)? <Text>{item.name}</Text>:<Text>+{item.name}</Text>}
                
                <Text numberOfLines = { 1 } note>{item.latestMessage}</Text>
              </Body>
              <Right>
                <Text note>{item.latestMessageTime}</Text>
              </Right>
            </ListItem>
          )}
          keyExtractor={(item, index) => index.toString()}
              refreshing={this.state.refreshing}
              onRefresh={this.handleRefresh}
              ListHeaderComponent={this.renderFlatListHeader}
            />
          );
    }
  }
}

export default ChatTab;

const styles = StyleSheet.create({
  emptyView:{
    padding:10,
  }
});
