import React, { Component } from 'react';
import {
  StyleSheet, Text ,View, Image, TextInput, Linking,
  StatusBar, SafeAreaView, KeyboardAvoidingView,
  AsyncStorage, ActivityIndicator, NetInfo, Platform
} from 'react-native';
import ForestApi from './tools/apis';
import NavigationService from './tools/NavigationService';
import * as SecureStore from 'expo-secure-store';
import {MaterialCommunityIcons} from '@expo/vector-icons';
import SnackBar from 'react-native-snackbar-component';
import {CardView, CardItem, BottomModal} from './components/components';
import BuildConfigs from './config';
import Touchable from './components/touchable';
import {ErrorModal} from './components/errorModal';
import {HelpModal} from './components/helpModal';
import moment from 'moment';


export default class Login extends Component {
  static navigationOptions = ({ navigation, navigationOptions }) => {
    const { params } = navigation.state;

    return {
      header: null // 헤더 비활성화
    };
  };
  constructor(props){
    super(props);
    this.state = {
      isLoading: false,
      showHelp: false,
      enableHelp: true,
      msg: '',
      snackbar: false
    };
    this.textInput = {
      idInput: '',
      pwInput: ''
    };
    this.errorModal = React.createRef();
    this.helpModal = React.createRef();
  }
  showSnackbar(msg){
    this.setState({msg: msg, snackbar: true});
    setTimeout(()=>{
      this.setState({msg: '', snackbar: false});
    },3000);
  }
  async componentDidMount() {
    if(Platform.OS == 'ios') StatusBar.setBarStyle({barStyle: 'light-content'});
    const isLoggedOut = this.props.navigation.getParam('loggedOut', false);
    if(isLoggedOut){
      this.showSnackbar('로그아웃 되었습니다.');
    }
    const connInfo = await NetInfo.getConnectionInfo();
    if(connInfo.type == 'none'){
      this.errorModal.current.showError(this.errorModal.current.CommonErrors.noNetwork);
    }else{
      let id = await SecureStore.getItemAsync('userid');
      let pw = await SecureStore.getItemAsync('userpw');
      if(id !== null && pw !== null){
        this.runLogInProcess(id, pw);
      }
    }
  }

  render() {
    let logInContainer;
    if(this.state.isLoading){
      logInContainer = (
        <ActivityIndicator size="large" color={BuildConfigs.primaryColor} />
      );
    }else{
      logInContainer = (
        <View>
          <Text style={ styles.info }>성공회대학교 종합정보시스템{'\n'}계정으로 로그인 하세요.</Text>
          <TextInput style={ styles.login_input } placeholder='아이디(학번) 입력'
            underlineColorAndroid="transparent"
            returnKeyType='next' autocorrect={ false } onSubmitEditing={ () => this.refs.password.focus() }
            onChangeText={(text)=>{this.textInput.idInput = text;}} keyboardType='default'>
          </TextInput>
          <TextInput style={ styles.login_input } placeholder='비밀번호 입력' secureTextEntry={ true }
            underlineColorAndroid="transparent"
            returnkeyType='go' ref={ 'password' }  autocorrect={ false }
            onSubmitEditing={ () => {
              let id = this.textInput.idInput.replace(/\s/g,'');
              let pw = this.textInput.pwInput.replace(/\s/g,'');
              this.runLogInProcess(id, pw);
            } }
            onChangeText={(text)=>{
              this.textInput.pwInput = text;
            }}>
          </TextInput>
          <CardView elevate={true} onPress={()=>{
            let id = this.textInput.idInput.replace(/\s/g,'');
            let pw = this.textInput.pwInput.replace(/\s/g,'');
            this.runLogInProcess(id, pw);
          }} style={{backgroundColor: '#569f59', justifyContent: 'center', flexDirection: 'row'}}>
            <MaterialCommunityIcons name={'login'} size={16} color={'white'} style={{marginRight: 8}}/>
            <Text style={{color: 'white'}}>Log In</Text>
          </CardView>
        </View>
      );
    }

    let helpButton;
    if(this.state.enableHelp){
      helpButton = (
        <Touchable onPress={()=>{
          if(!this.state.isLoading){
            this.helpModal.current.open(undefined, true);
          }
        }}>
          <View style={ styles.footer }>
            <Text>여기를 눌러 도움 얻기</Text>
            <Text>(C)2018-Present Sleepy OWL</Text>
            <Image style={{width: 60, height: 60}} source={ require('../assets/imgs/Sowl_Logo.png') }/>
          </View>
        </Touchable>
      );
    }else{
      helpButton = (
        <View style={ styles.footer }>
          <Text>(C)2018-Present Sleepy OWL</Text>
          <Image style={{width: 60, height: 60}} source={ require('../assets/imgs/Sowl_Logo.png') }/>
        </View>
      );
    }

    return (
      <SafeAreaView style={ styles.container }>
        <KeyboardAvoidingView  style={ styles.container } behavior="padding" enabled>
          <View style={ styles.container }>
            <View style={ styles.title_container }>
              <Image source={ require('../assets/imgs/icon.png') } style={{width: 150, height: 150}}/>
            </View>
            <View style={ styles.login_container }>
              {logInContainer}
              {helpButton}
            </View>
          </View>
          <SnackBar visible={this.state.snackbar} textMessage={this.state.msg}/>
          <ErrorModal ref={this.errorModal}/>
          <HelpModal ref={this.helpModal}/>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }
  async runLogInProcess(id, pw){
    console.log('Logging in...');
    try{
      let sessionUpdatedAt = await SecureStore.getItemAsync('sessionUpdatedAt');
      if (sessionUpdatedAt != null) {
        sessionUpdatedAt = moment.utc(sessionUpdatedAt);
        const loginRequired = moment().utc().isAfter(sessionUpdatedAt.add('85', 'minutes'));
        if(!loginRequired){
          NavigationService.reset('Main');
          return;
        }
      }
    }catch(err){
      console.error(err);
    }
    try{
      this.setState({isLoading: true, enableHelp: false});
      if(id.length <= 0 || pw.length <= 0){
        this.showSnackbar('학번 또는 비밀번호가 입력되지 않았습니다.');
        this.setState({isLoading: false, enableHelp: true});
      }else if(pw.length < 8){
        this.errorModal.current.showError(this.errorModal.current.CommonErrors.wrongLogin);
        this.setState({isLoading: false, enableHelp: true});
      }else{
        let response = await ForestApi.login(id, pw);
        if(response.ok){
          let data = await response.json();
          console.log(data['credential-new-token']);
          console.log(data['credential-new-token'].length);
          await SecureStore.setItemAsync('CredentialOld', data['credential-old']);
          await SecureStore.setItemAsync('CredentialNew', data['credential-new']);
          await AsyncStorage.setItemAsync('CredentialNewToken', data['credential-new-token']);
          await SecureStore.setItemAsync('userid', id);
          await SecureStore.setItemAsync('userpw', pw);
          await SecureStore.setItemAsync('sessionUpdatedAt', moment().utc().format());
          this.setState({isLoading: false});
          NavigationService.reset('Main');
        }else if(response.status == 400){
          this.setState({isLoading: false, enableHelp: true});
          this.errorModal.current.showError(this.errorModal.current.CommonErrors.wrongLogin);
        }else if(response.status == 401){
          this.setState({isLoading: false, enableHelp: true});
          let msg = await response.text();
          this.errorModal.current.showError(this.errorModal.current.CommonErrors.loginError, msg);
        }else{
          this.setState({isLoading: false, enableHelp: true});
        }
      }
    }catch(err){
      this.setState({isLoading: false, enableHelp: true});
      this.errorModal.current.showError(this.errorModal.current.CommonErrors.netError, 
        `${err}\n${err.message}\n${err.stack}`);
      console.log(err);
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    // flexDirection: 'column',
  },
  title_container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20
  },
  title_text: {
    fontWeight: 'bold',
    fontSize: 30,
    color: 'black',
    textAlign: 'center'
  },
  login_container: {
    flex: 1,
    backgroundColor: 'white',
    marginLeft: 20,
    marginRight: 20,
    paddingBottom: 140
  },
  login_input: {
    height: 50,
    backgroundColor: 'rgba(220, 220, 220, 0.8)',
    marginBottom: 15,
    paddingHorizontal: 20,
    borderRadius: 10
  },
  button_container: {
    height: 60,
    borderRadius: 10,
    backgroundColor: 'rgba(60, 60, 60, 0.8)',
    paddingVertical: 20
  },
  footer: {
    marginTop: 10,
    alignItems: 'center'
  },
  info: {
    textAlign: 'center',
    padding: 5
  },
});
