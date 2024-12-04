import { View } from '@tarojs/components'
import React from 'react'
import './index.scss'

interface CustomPopupProps {
  isOpened: boolean
  onClose: () => void
  onConfirm?: () => void
  children?: React.ReactNode
  title?: string
  confirmText?: string
  cancelText?: string
  showFooter?: boolean
}

const CustomPopup: React.FC<CustomPopupProps> = ({
  isOpened,
  onClose,
  onConfirm,
  children,
  title,
  confirmText = '确定',
  cancelText = '取消',
  showFooter = true
}) => {
  if (!isOpened) return null

  const handleMaskClick = (e) => {
    e.stopPropagation()
    onClose()
  }

  const handlePopupClick = (e) => {
    e.stopPropagation()
  }

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm()
    }
    onClose()
  }

  return (
    <View className='custom-popup-mask' onClick={handleMaskClick}>
      <View className='custom-popup-content' onClick={handlePopupClick}>
        {title && (
          <View className='custom-popup-title'>
            {showFooter && (
              <>
                <View 
                  className='custom-popup-btn custom-popup-cancel' 
                  onClick={onClose}
                >
                  {cancelText}
                </View>
                <View 
                  className='custom-popup-btn custom-popup-confirm' 
                  onClick={handleConfirm}
                >
                  {confirmText}
                </View>
              </>
            )}
            {title}
          </View>
        )}
        
        <View className='custom-popup-body'>
          {children}
        </View>
      </View>
    </View>
  )

}

export default CustomPopup