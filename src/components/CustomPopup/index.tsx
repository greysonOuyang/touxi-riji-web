import React from 'react'
import { View, Image } from '@tarojs/components'
import { Popup } from '@nutui/nutui-react-taro'
import './index.scss'

import quedingIcon from '../../assets/icons/queding2.svg'
import quxiaoIcon from '../../assets/icons/quxiao2.svg'

interface CustomPopupProps {
  visible: boolean
  onClose: () => void
  onConfirm: () => void
  children: React.ReactNode
  height?: string | number
}

const CustomPopup: React.FC<CustomPopupProps> = ({
  visible,
  onClose,
  onConfirm,
  children,
  height = '50%'
}) => {
  return (
    <Popup
      visible={visible}
      position="bottom"
      onClose={onClose}
      style={{ height }}
    >
      <View className="custom-popup">
        <View className="custom-popup__header">
          <View className="custom-popup__cancel" onClick={onClose}>
            <Image src={quxiaoIcon} className="icon svg-icon" />
          </View>
          <View className="custom-popup__confirm" onClick={onConfirm}>
            <Image src={quedingIcon} className="icon svg-icon" />
          </View>
        </View>
        <View className="custom-popup__content">
          {children}
        </View>
      </View>
    </Popup>
  )
}

export default CustomPopup