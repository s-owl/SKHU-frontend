import React, { Component } from 'react';
import { 
    StyleSheet, Text ,View,  ScrollView,
     SafeAreaView, SectionList
  } from 'react-native';
import { CardItem } from './components';
// import { CardView } from './components';
// import { MaterialIcons } from '@expo/vector-icons';


export default class Menu extends Component {
    static navigationOptions = ({ navigation, navigationOptions }) => {
        const { params } = navigation.state;
        
        return {
            title: '전체 메뉴',
        };
    };

    render() {
        return(
           <SafeAreaView>
               <SectionList
                style={{marginTop: 16}}
                renderItem={({item, index, section}) => (
                    <CardItem key={index} onPress={item.onPress} style={{flex: 0, flexDirection: 'row'}}>
                        <Text>{item.label}</Text>
                    </CardItem>
                )}
                renderSectionHeader={({section: {title}}) => (
                    <Text style={{fontWeight: 'bold', padding: 8}}>{title}</Text>
                )}
                sections={[
                    {title: '관리', data: [
                        {label: '로그아웃', onPress: ()=>{}},
                        {label: '앱 정보', onPress: ()=>{}}
                    ]},
                    {title: '관리', data: [
                        {label: '로그아웃', onPress: ()=>{}},
                        {label: '앱 정보', onPress: ()=>{}}
                    ]},
                    {title: '관리', data: [
                        {label: '로그아웃', onPress: ()=>{ alert('Logging Out')}},
                        {label: '앱 정보', onPress: ()=>{}}
                    ]},
                ]}
                keyExtractor={(item, index) => item + index}
                />
           </SafeAreaView>
        );
    }

   
  }