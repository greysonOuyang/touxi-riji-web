import React from 'react';
import { View, Text } from '@tarojs/components';

const SettingsPage: React.FC = () => {
  return (
    <View className='settings-page'>
      <Text>设置页面</Text>
      <Text>在这里进行应用的设置。</Text>
    </View>
  );
}

export default SettingsPage;