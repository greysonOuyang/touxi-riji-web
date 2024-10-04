import React, { useState } from 'react';
import { View } from '@tarojs/components';
import { Button, Popup, Grid, GridItem } from '@nutui/nutui-react-taro';
import { Plus } from '@nutui/icons-react-taro';
import './index.scss';

interface FloatingAddButtonProps {
  onAddData: (type: string) => void;
}

const FloatingAddButton: React.FC<FloatingAddButtonProps> = ({ onAddData }) => {
  const [visible, setVisible] = useState(false);

  const handleAdd = (type: string) => {
    setVisible(false);
    onAddData(type);
  };

  const renderGridItem = (icon: JSX.Element, text: string, type: string) => {
    return (
      <GridItem onClick={() => handleAdd(type)}>
        <View className="grid-item-content">
          {icon}
          <View className="grid-text">{text}</View>
        </View>
      </GridItem>
    );
  };

  return (
    <>
      <View className="floating-add-button" onClick={() => setVisible(true)}>
  <svg className="plus-icon" viewBox="0 0 24 24">
    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
  </svg>
</View>
      <Popup 
        visible={visible} 
        position="bottom" 
        onClose={() => setVisible(false)}
        style={{ height: '30%' }}
      >
        <Grid columns={4}>
          {renderGridItem(
            <svg className="grid-icon" viewBox="0 0 24 24">
              <path d="M12,20L12,20c-4.4,0-8-3.6-8-8V6c0-1.1,0.9-2,2-2h12c1.1,0,2,0.9,2,2v6C20,16.4,16.4,20,12,20z M12,10c-1.1,0-2,0.9-2,2s0.9,2,2,2s2-0.9,2-2S13.1,10,12,10z"/>
            </svg>,
            '超滤量',
            'ultrafiltration'
          )}
          {renderGridItem(
            <svg className="grid-icon" viewBox="0 0 24 24">
              <path d="M19,3H5C3.9,3,3,3.9,3,5v14c0,1.1,0.9,2,2,2h14c1.1,0,2-0.9,2-2V5C21,3.9,20.1,3,19,3z M12,12c-1.7,0-3-1.3-3-3s1.3-3,3-3s3,1.3,3,3S13.7,12,12,12z M17,18H7v-1.5c0-1.7,2.5-2.5,5-2.5s5,0.8,5,2.5V18z"/>
            </svg>,
            '体重',
            'weight'
          )}
          {renderGridItem(
            <svg className="grid-icon" viewBox="0 0 24 24">
              <path d="M12,21.35l-1.45-1.32C5.4,15.36,2,12.28,2,8.5C2,5.42,4.42,3,7.5,3c1.74,0,3.41,0.81,4.5,2.09C13.09,3.81,14.76,3,16.5,3C19.58,3,22,5.42,22,8.5c0,3.78-3.4,6.86-8.55,11.54L12,21.35z"/>
            </svg>,
            '血压',
            'bloodPressure'
          )}
          {renderGridItem(
            <svg className="grid-icon" viewBox="0 0 24 24">
              <path d="M3,13h2v-2H3V13z M3,17h2v-2H3V17z M3,9h2V7H3V9z M7,13h14v-2H7V13z M7,17h14v-2H7V17z M7,7v2h14V7H7z"/>
            </svg>,
            '血糖',
            'bloodSugar'
          )}
        </Grid>
      </Popup>
    </>
  );
};

export default FloatingAddButton;