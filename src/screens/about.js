import React, {Component} from 'react';
import Constants from 'expo-constants';
import {ScrollView, View, Text, Image, FlatList, Linking, SectionList} from 'react-native';
import ListItem from '../components/listitem';
import {InfoModal} from '../components/infoModal';
import {Map} from 'immutable';
import * as WebBrowser from 'expo-web-browser';
import LegalInfo from '../legal';
import BuildConfigs from '../config';

export default class About extends Component{
    static navigationOptions = ({navigation, navigationOptions}) => {
      const {params} = navigation.state;
      
      return {
        title: '앱 정보',
      };
    };

    constructor(props){
      super(props);
      this.state = {
        modal: Map({
          teamInfo: false,
          oss: false,
          legal: false,
        })
      };
    }

    setModal(name, visible) {
      let modal = this.state.modal.set(name, visible);
      this.setState({
        modal: modal
      });
    }

    render(){
      let modal = this.state.modal;
      return(
        <ScrollView style={{backgroundColor: 'white'}}>
          <View style={{padding: 32, alignItems: 'center'}}>
            <Image style={{marginBottom: 16, width: 200, height: 200,
              borderColor: 'lightgrey', borderWidth: 1, borderRadius: 56}}
            source={ require('../../assets/imgs/icon.png') }/>
            <Text style={{fontWeight: 'bold', fontSize: 36}}>{Constants.manifest.name}</Text>
            <Text>{Constants.manifest.version}</Text>
            <Text>OTA - {BuildConfigs.OtaDeployedAt}</Text>
          </View>
          <ListItem isHeader={true}>
            <Text style={{fontWeight: 'bold'}}>개발자 정보</Text>
          </ListItem>
          <ListItem onPress={()=>{
            this.setModal('teamInfo', true);
          }}>
            <Text>
            성공회대학교 S.OWL {Constants.manifest.name} 개발팀{'\n'}
            (눌러서 팀원 목록 보기)
            </Text>
          </ListItem>
          <ListItem isHeader={true}>
            <Text style={{fontWeight: 'bold'}}>웹사이트</Text>
          </ListItem>
          <ListItem onPress={()=>{
            Linking.openURL('https://www.facebook.com/SKHUsMobileApp/');
          }}>
            <Text>Facebook Page</Text>
          </ListItem>
          <ListItem onPress={()=>{
            Linking.openURL('https://skhus.sleepy-owl.com/');
          }}>
            <Text>홈페이지</Text>
          </ListItem>
          <ListItem onPress={()=>{
            Linking.openURL('https://sleepy-owl.com/');
          }}>
            <Text>성공회대 S.OWL(Sleepy OWL) 홈페이지</Text>
          </ListItem>

          <ListItem isHeader={true}>
            <Text style={{fontWeight: 'bold'}}>법적 고지사항</Text>
          </ListItem>
          <ListItem onPress={async()=>{
            await WebBrowser.openBrowserAsync('https://github.com/s-owl/skhus/wiki/PrivacyAndPermissions');
          }}>
            <Text>개인정보취급방침, 사용되는 시스템 권한 안내</Text>
          </ListItem>
          <ListItem onPress={()=>{
            this.setModal('oss', true);
          }}>
            <Text>
            개발에 사용된 오픈소스 소프트웨어 정보{'\n'}
            (눌러서 목록 보기)
            </Text>
          </ListItem>
          <ListItem onPress={()=>{
            this.setModal('legal', true);
          }}>
            <Text>면책사항{'\n'}(눌러서 보거나 숨기기)
            </Text>
          </ListItem>
          <InfoModal visible={modal.get('teamInfo')}
            icon='account-group'
            title={`성공회대학교 S.OWL ${Constants.manifest.name} 개발팀`}
            buttons={[{label: '닫기', onPress: ()=>{this.setModal('teamInfo', false);}}]}>
            <SectionList style={{height: '100%'}}
              renderItem={({item, index, section}) => (
                <ListItem key={index} >
                  <Text>{item}</Text>
                </ListItem>
              )}
              renderSectionHeader={({section: {period}}) => (
                <ListItem style={{flex: 0, flexDirection: 'row'}}>
                  <Text style={{fontWeight: 'bold'}}>{period}</Text>
                </ListItem>
              )}
              sections={LegalInfo.devlopers}
              keyExtractor={(item, index) => item + index}
            />
          </InfoModal>
          <InfoModal visible={modal.get('oss')}
            icon='apps'
            title='개발에 사용된 오픈소스 소프트웨어 정보'
            buttons={[{label: '닫기', onPress: ()=>{this.setModal('oss', false);}}]}>
            <FlatList
              data={LegalInfo.oss}
              renderItem={({item})=>(
                <View key={item.index}>
                  <ListItem>
                    <Text style={{fontWeight: 'bold'}}>{item.name}</Text>
                    <Text>by {item.author}</Text>
                    <Text>Licensed under {item.license}</Text>
                  </ListItem>
                  <View style={{flex: 1, flexDirection: 'row', justifyContent: 'center'}}>
                    <ListItem style={{flex: 1, alignItems: 'center'}} onPress={()=>{
                      Linking.openURL(item.url);
                    }}>
                      <Text>Source Code</Text>
                    </ListItem>
                    <ListItem style={{flex: 1, alignItems: 'center'}} onPress={()=>{
                      Linking.openURL(item.licenseUrl);
                    }}>
                      <Text>License Copy</Text>
                    </ListItem>
                  </View>
                </View>
              )}/>
          </InfoModal>
          <InfoModal visible={modal.get('legal')}
            icon='library-books'
            title='면책사항'
            buttons={[{label: '닫기', onPress: ()=>{this.setModal('legal', false);}}]}>
            <Text>
                본 앱은 성공회대학교 공식 인증 앱이 아니며, 사용 중 발생하는 모든 책임은 사용자 본인에게 있습니다.
            </Text>
          </InfoModal>
        </ScrollView>
      );
    }
}
