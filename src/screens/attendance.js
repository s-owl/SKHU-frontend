import React, {Component} from 'react';
import {View, FlatList, Text, ActivityIndicator} from 'react-native';
import ListItem from '../components/listitem';
import DBHelper from '../tools/dbhelper';
import BuildConfigs from '../config';
import {ThemedText} from '../components/components';

export default class AttendanceScreen extends Component{
  constructor(props){
    super(props);
    this.state = {
      data: [{id: 0, lecture_name: '강의명', attend: '출석', late: '지각', absence: '결석', 
        approved: '공결', menstrual: '생공', early: '조퇴'}],
      isLoading: false
    };
    this.db = new DBHelper();
  }
  async componentDidMount(){
    this.setState({isLoading: true});
    await this.db.fetchAttendance();
    const data = await this.db.queryAttendance();
    data.unshift({id: 0, lecture_name: '강의명', attend: '출석', late: '지각', absence: '결석', 
      approved: '공결', menstrual: '생공', early: '조퇴'});
    this.setState({
      data: data,
      isLoading: false
    });
  }
  render(){
    if(this.state.isLoading){
      return(
        <View style={{justifyContent: 'center', padding: 32}}>
          <ActivityIndicator size="large" color={BuildConfigs.primaryColor} />
        </View>
      );
    }else if(this.state.data.length <= 1){
      return(
        <View style={{justifyContent: 'center', padding: 32}}>
          <ThemedText>출결현황을 불러오지 못했거나, 수강한 강의가 없어 표시할 출결현황 데이터가 없습니다. 수강 강의가 있음에도 출결 조회가 불가능한 경우 LMS도 확인해 보세요.</ThemedText>
        </View>
      );
    }else{
      return(
        <View>
          <FlatList style={{height: '100%'}}
            data={this.state.data}
            keyExtractor={(item, index) => index}
            renderItem={({item})=>
              <ListItem style={{flex: 1, flexDirection: 'row'}}>
                <ThemedText style={{flex: 1}}>{item.lecture_name}</ThemedText>
                <ThemedText style={{width: 30, textAlign: 'center'}}>{item.attend}</ThemedText>
                <ThemedText style={{width: 30, textAlign: 'center'}}>{item.late}</ThemedText>
                <ThemedText style={{width: 30, textAlign: 'center'}}>{item.absence}</ThemedText>
                <ThemedText style={{width: 30, textAlign: 'center'}}>{item.approved}</ThemedText>
                <ThemedText style={{width: 30, textAlign: 'center'}}>{item.menstrual}</ThemedText>
                <ThemedText style={{width: 30, textAlign: 'center'}}>{item.early}</ThemedText>
              </ListItem>
            }/>
        </View>
      );
    }
  }
}