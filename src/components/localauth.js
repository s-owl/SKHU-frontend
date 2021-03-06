import React, {useState, useEffect} from 'react';
import {Modal, View, StyleSheet, Platform} from 'react-native';
import {MaterialIcons} from '@expo/vector-icons';
import ListItem from './listitem';
import Touchable from './touchable';
import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';
import {ThemedText} from './components';
import {useTheme} from '@react-navigation/native';

export default function LocalAuth(props){
  const {colors} = useTheme();
  const [pin, setPin] = useState('');
  const [pinCheck, setPinCheck] = useState('');
  const [display, setDisplay] = useState('______');
  const [msg, setMsg] = useState('');
  const [pinRegistered, setPinRegistered] = useState(false);
  const [icon, setIcon] = useState('lock-outline');
  const [visible, setVisible] = useState(false);

  const resetStates = ()=>{
    setPin('');
    setPinCheck('');
    setDisplay('______');
    setMsg('');
    setPinRegistered(false);
    setIcon('lock-outline');
    setVisible(false);
  };

  useEffect(()=>{
    if(props.visible){
      startAuth();
    }else{
      resetStates();
      (async()=>{
        if(Platform.OS == 'android'){
          await LocalAuthentication.cancelAuthenticate();
        }
      })();
    }
  }, [props.visible]);

  const getDisplayString = (len=0)=>{
    if(len >= 6){
      return '*'.repeat(6);
    }else{
      return '*'.repeat(len) + '_'.repeat(6-len);
    }
  };

  const bioAuth = async()=>{
    const result = await LocalAuthentication.authenticateAsync({
      fallbackLabel: '',
      promptMessage: 'SKHU\'s 생체인증',
      disableDeviceFallback: true,
      cancelLabel: 'PIN 으로 인증'});
    console.log('AUTH ERR:'+result.error);
    if(result.success){
      authSuccess();
    }else if(result.error == 'user_cancel'){
      setVisible(true);
      setMsg('6자리 PIN으로 인증하세요');
      setPin('');
      setPinCheck('');
      setIcon('lock-outline');
      setDisplay(getDisplayString());
    }
    else{
      console.log(result.error);
      setVisible(true);
      setMsg('생체인증 실패. 6자리 PIN으로 인증하세요');
      setPin('');
      setPinCheck('');
      setDisplay(getDisplayString());
      setIcon('error-outline');
    }
  }; 

  const authSuccess = async()=>{
    setMsg('인증되었습니다.');
    setPin('');
    setPinCheck('');
    setDisplay(getDisplayString());
    setIcon('lock-open');
    setTimeout(async ()=>{
      props.onAuthSuccess();
      props.onClose();
      resetStates();
      if(Platform.OS == 'android'){
        await LocalAuthentication.cancelAuthenticate();
      }
    }, 500);
  };

  const startAuth = async()=>{
    resetStates();
    const pin = await SecureStore.getItemAsync('localAuthPin');
    const hasHw = await LocalAuthentication.hasHardwareAsync();
    const bioAuthRegistered = await LocalAuthentication.isEnrolledAsync();
    setPinRegistered(typeof pin == 'string');
    if(typeof pin == 'string'){
      if(hasHw && bioAuthRegistered){
        bioAuth();
      }else{
        setVisible(true);
        setMsg('등록한 6자리 PIN으로 인증하세요.');
      }
    }else{
      setVisible(true);
      setMsg('새로 등록할 6자리 PIN을 입력하세요.');
    }
  };

  
  const inputDigit = async(digit)=>{
    let newPin;
    if(digit == '<' && pin.length > 0){
      newPin = pin.slice(0, -1);
      setPin(newPin),
      setDisplay(getDisplayString(newPin.length));
    }else if(digit != '<' && pin.length < 6){
      newPin = `${pin}${digit}`;
      setPin(newPin),
      setDisplay(getDisplayString(newPin.length));
      if(newPin.length == 6){
        if(pinRegistered){
          const pin = await SecureStore.getItemAsync('localAuthPin');
          if(newPin == pin){
            authSuccess();
          }else{
            setMsg('틀린 PIN 입니다.');
            setPin('');
            setPinCheck('');
            setDisplay(getDisplayString());
            setIcon('error-outline');
          }
        }else{
          if(pinCheck.length == 0){
            setMsg('동일한 PIN을 다시 한번 입력하세요.');
            setPin('');
            setPinCheck(newPin);
            setDisplay(getDisplayString());
          }else if(pinCheck == newPin){
            await SecureStore.setItemAsync('localAuthPin', newPin);
            setMsg('등록 완료. 방금 등록한 PIN 으로 인증하세요.');
            setPin('');
            setPinCheck('');
            setDisplay(getDisplayString());
            setPinRegistered(true);
          }else if(pinCheck != newPin){
            setMsg('틀렸습니다. 처음부터 다시 시작하세요.');
            setPin('');
            setPinCheck('');
            setDisplay(getDisplayString());
            setIcon('error-outline');
            setTimeout(()=>startAuth(), 500);
          }
        }
      }
    }
  };
  return(
    <Modal
      animationType="fade"
      visible={visible}>
      <View style={{paddingTop: 30, padding: 16, flex: 1, backgroundColor: colors.background}}>
        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
          <MaterialIcons color={colors.text} name={icon} size={32} style={{padding: 16}}/>
          <ThemedText>{msg}</ThemedText>
          <ThemedText style={{fontSize: 32}}>{display}</ThemedText>
        </View>
        <View style={{flex: 3, justifyContent: 'flex-end'}}>
          <View style={styles.digitRow}>
            <Touchable style={styles.digitButton} borderless={true}
              onPress={()=>inputDigit(1)}><ThemedText style={{fontSize: 24}}>1</ThemedText></Touchable>
            <Touchable style={styles.digitButton} borderless={true}
              onPress={()=>inputDigit(2)}><ThemedText style={{fontSize: 24}}>2</ThemedText></Touchable>
            <Touchable style={styles.digitButton} borderless={true}
              onPress={()=>inputDigit(3)}><ThemedText style={{fontSize: 24}}>3</ThemedText></Touchable>
          </View>
          <View style={styles.digitRow}>
            <Touchable style={styles.digitButton} borderless={true}
              onPress={()=>inputDigit(4)}><ThemedText style={{fontSize: 24}}>4</ThemedText></Touchable>
            <Touchable style={styles.digitButton} borderless={true}
              onPress={()=>inputDigit(5)}><ThemedText style={{fontSize: 24}}>5</ThemedText></Touchable>
            <Touchable style={styles.digitButton} borderless={true}
              onPress={()=>inputDigit(6)}><ThemedText style={{fontSize: 24}}>6</ThemedText></Touchable>
          </View>
          <View style={styles.digitRow}>
            <Touchable style={styles.digitButton} borderless={true}
              onPress={()=>inputDigit(7)}><ThemedText style={{fontSize: 24}}>7</ThemedText></Touchable>
            <Touchable style={styles.digitButton} borderless={true}
              onPress={()=>inputDigit(8)}><ThemedText style={{fontSize: 24}}>8</ThemedText></Touchable>
            <Touchable style={styles.digitButton} borderless={true}
              onPress={()=>inputDigit(9)}><ThemedText style={{fontSize: 24}}>9</ThemedText></Touchable>
          </View>
          <View style={styles.digitRow}>
            <Touchable style={styles.digitButton} borderless={true}
              onPress={()=>inputDigit(0)}><ThemedText style={{fontSize: 24}}>0</ThemedText></Touchable>
            <Touchable style={styles.digitButton} borderless={true}
              onPress={()=>inputDigit('<')}><ThemedText style={{fontSize: 24}}>{'<'}</ThemedText></Touchable>
          </View>
          <View style={styles.digitRow}>
            <ListItem style={{flex: 1, alignItems: 'center', justifyContent: 'center'}} onPress={async ()=>{
              props.onClose();
            }}>
              <ThemedText>취소</ThemedText>
            </ListItem>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  digitButton: {
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center'
  },
  digitRow: {
    flex: 1, flexDirection: 'row', width: '100%',
    marginTop: 8, marginBottom: 8,
  }
});
