import { View, Text, Input, Picker } from '@tarojs/components'
import { useState } from 'react'
import { AtButton, AtToast } from 'taro-ui'
import Taro from '@tarojs/taro'
import { addBloodPressureRecord } from '@/api'
import './index.scss'

const BloodPressureInputPage = () => {
  const [systolic, setSystolic] = useState('')
  const [diastolic, setDiastolic] = useState('')
  const [heartRate, setHeartRate] = useState('')
  const [measurementTime, setMeasurementTime] = useState('')
  const [isOpened, setIsOpened] = useState(false)
  const [toastText, setToastText] = useState('')

  // 处理输入值变化
  const handleSystolicChange = (e) => {
    setSystolic(e.detail.value)
  }

  const handleDiastolicChange = (e) => {
    setDiastolic(e.detail.value)
  }

  const handleHeartRateChange = (e) => {
    setHeartRate(e.detail.value)
  }

  // 处理日期时间选择
  const handleTimeChange = (e) => {
    setMeasurementTime(e.detail.value)
  }

  // 校验输入值
  const validateInputs = () => {
    if (!systolic || !diastolic || !heartRate || !measurementTime) {
      setToastText('请填写所有数据')
      setIsOpened(true)
      return false
    }
    if (parseInt(systolic, 10) <= 0 || parseInt(diastolic, 10) <= 0 || parseInt(heartRate, 10) <= 0) {
      setToastText('数值必须大于 0')
      setIsOpened(true)
      return false
    }
    return true
  }

  // 确认按钮点击事件
  const handleConfirm = async () => {
    if (!validateInputs()) return

    try {
      const user = Taro.getStorageSync('user')
      const newRecord = {
        systolic: parseFloat(systolic),
        diastolic: parseFloat(diastolic),
        heartRate: parseFloat(heartRate),
        userId: user.id,
        measurementTime,
      }

      const response = await addBloodPressureRecord(newRecord)
      if (response.isSuccess()) {
        Taro.showToast({ title: '记录添加成功', icon: 'success', duration: 2000 })
        Taro.navigateBack()
      } else {
        throw new Error(response.msg || '添加记录失败')
      }
    } catch (error) {
      setToastText(error.message || '网络错误，请稍后重试')
      setIsOpened(true)
    }
  }

  // 取消按钮点击事件
  const handleCancel = () => {
    Taro.navigateBack()
  }

  return (
    <View className='blood-pressure-input-page'>
      <View className='input-group'>
        <Text className='label'>收缩压 (mmHg)</Text>
        <Input
          className='input'
          type='number'
          value={systolic}
          onInput={handleSystolicChange}
          placeholder='请输入收缩压'
        />
      </View>

      <View className='input-group'>
        <Text className='label'>舒张压 (mmHg)</Text>
        <Input
          className='input'
          type='number'
          value={diastolic}
          onInput={handleDiastolicChange}
          placeholder='请输入舒张压'
        />
      </View>

      <View className='input-group'>
        <Text className='label'>心率 (次/分)</Text>
        <Input
          className='input'
          type='number'
          value={heartRate}
          onInput={handleHeartRateChange}
          placeholder='请输入心率'
        />
      </View>

      <View className='input-group'>
        <Text className='label'>测量时间</Text>
        <Picker
          mode='dateTime'
          onChange={handleTimeChange}
          value={measurementTime}
        >
          <View className='picker'>
            {measurementTime || '请选择测量时间'}
          </View>
        </Picker>
      </View>

      <View className='button-group'>
        <AtButton onClick={handleCancel}>取消</AtButton>
        <AtButton type='primary' onClick={handleConfirm}>确认</AtButton>
      </View>

      <AtToast
        isOpened={isOpened}
        text={toastText}
        onClose={() => setIsOpened(false)}
      />
    </View>
  )
}

export default BloodPressureInputPage
