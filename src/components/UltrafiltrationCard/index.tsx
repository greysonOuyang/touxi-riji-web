import React, { useState } from 'react'
import { View } from '@tarojs/components'
import TimePicker from '../TimePicker'
import './index.scss'

const UltrafiltrationCard: React.FC = () => {
  const [visible, setVisible] = useState(false)
  const [selectedTime, setSelectedTime] = useState('')

  const handleOpenForm = () => {
    setVisible(true)
  }

  const handleCloseForm = () => {
    setVisible(false)
  }

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time)
  }

  const handleSave = () => {
    console.log('Saving time:', selectedTime)
    handleCloseForm()
  }



  return (
    <View className="ultrafiltration-card">
      <TimePicker onTimeChange={handleTimeSelect} />
    </View>
  )
}

export default UltrafiltrationCard