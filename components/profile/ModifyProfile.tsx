import {useNavigation} from '@react-navigation/native';
import React, {useState} from 'react';
import {Pressable, StyleSheet, View, Platform, Image, ActivityIndicator} from 'react-native';
import {launchImageLibrary} from 'react-native-image-picker';
import storage from '@react-native-firebase/storage';
import {createUser} from '../../utils/auth';
import DabadaInput from '../common/DabadaInput';
import DabadaButton from '../common/DabadaButton';
import type {StackNavigationProp} from '@react-navigation/stack';
import {useRecoilState} from 'recoil';
import {authInfoProps, authInfoState} from '../../recoil/authInfoAtom';
import {useTranslation} from 'react-i18next';

function ModifyProfile() {
  const {t} = useTranslation();
  const navigation = useNavigation<StackNavigationProp<any>>();
  const [authInfo, setAuthInfo] = useRecoilState<authInfoProps>(authInfoState);
  const [nickname, setNickname] = useState(authInfo.u_nickname);
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    setLoading(true);

    let photoURL = null;
    if (response) {
      const asset = response.assets[0];
      const extension = asset.fileName.split('.').pop(); // 확장자 추출
      const reference = storage().ref(`/profile/${authInfo.u_id}.${extension}`);

      if (Platform.OS === 'android') {
        await reference.putString(asset.base64, 'base64', {
          contentType: asset.type,
        });
      } else {
        await reference.putFile(asset.uri);
      }

      photoURL = response ? await reference.getDownloadURL() : null;
    } else {
      photoURL = authInfo?.u_photoUrl || {};
    }

    const userInfo = {
      u_id: authInfo.u_id,
      u_nickname: nickname,
      u_photoUrl: photoURL,
      u_group: 'somansa',
      u_lang: 'ko',
    };

    createUser(userInfo); // Firebase 프로필 정보 갱신
    setAuthInfo(userInfo); // 프로필 정보 recoil 저장
    navigation.navigate('BottomTab');
  };

  const onCancel = async () => {
    navigation.goBack();
  };

  const onSelectImage = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        maxWidth: 512,
        maxHeight: 512,
        includeBase64: Platform.OS === 'android',
      },
      res => {
        if (res.didCancel) {
          console.log(' 취소 ');
          return;
        }
        console.log(res);
        setResponse(res);
      },
    );
  };

  return (
    <View style={styles.block}>
      <Pressable onPress={onSelectImage}>
        <Image style={styles.circle} source={response ? {uri: response?.assets[0]?.uri} : authInfo?.u_photoUrl ? {uri: authInfo.u_photoUrl} : require('../../assets/user.png')} />
      </Pressable>

      <View style={styles.form}>
        <DabadaInput placeholder={t('common.nickname', '닉네임')} value={nickname} onChangeText={setNickname} onSubmitEditing={onSubmit} returnKeyType="next" hasMarginBottom={false} />
        {loading && <ActivityIndicator size={32} color="#6200ee" style={styles.spinner} />}
        {!loading && (
          <View style={styles.buttons}>
            <DabadaButton title={t('button.save', '저장')} onPress={onSubmit} hasMarginBottom={true} />
            <DabadaButton title={t('button.cancel', '취소')} onPress={onCancel} theme="secondary" hasMarginBottom={false} />
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    alignItems: 'center',
    marginTop: 24,
    paddingHorizontal: 16,
    width: '100%',
  },
  circle: {
    backgroundColor: '#cdcdcd',
    borderRadius: 64,
    width: 128,
    height: 128,
  },
  form: {
    marginTop: 16,
    width: '100%',
  },
  buttons: {
    marginTop: 48,
  },
  spinner: {
    marginTop: 48,
    height: 104,
  },
});

export default ModifyProfile;
