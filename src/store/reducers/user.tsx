// src/store/reducers/user.js
import Taro from '@tarojs/taro';
import { SET_TOKEN } from '../actions/user';

const INITIAL_STATE = {
  token: Taro.getStorageSync('token') || null,
};

export default function user(state = INITIAL_STATE, action) {
  switch (action.type) {
    case SET_TOKEN:
      return {
        ...state,
        token: action.payload,
      };
    default:
      return state;
  }
}