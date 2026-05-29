// 用户模块API
import { post, get, put, upload } from '../utils/request.js'

// 用户登录
export function login(phone, password) {
  return post('/user/login', {
    phone,
    password
  })
}

// 用户注册
export function register(phone, password, nickname) {
  return post('/user/register', {
    phone,
    password,
    nickname
  })
}

// 获取用户信息
export function getUserInfo() {
  return get('/user/info')
}

// 更新用户信息
export function updateUserInfo(data) {
  return put('/user', data)
}

// 上传头像
export function uploadAvatar(filePath) {
  return upload('/user/avatar', filePath)
}
