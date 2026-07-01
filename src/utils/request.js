// 请求工具函数
// 后端服务器地址配置 - 根据实际情况修改
// 线上地址（生产环境）
const BASE_URL = 'https://oopnpjictkfv.sealoshzh.site/api/v1'
// 公网调试地址（测试环境）
// const BASE_URL = 'https://qhhxncfdtcyd.sealoshzh.site/api/v1'

// 获取token
export function getToken() {
  try {
    return uni.getStorageSync('token') || ''
  } catch (e) {
    return ''
  }
}

// 设置token
export function setToken(token) {
  try {
    uni.setStorageSync('token', token)
  } catch (e) {
    console.error('保存token失败', e)
  }
}

// 移除token
export function removeToken() {
  try {
    uni.removeStorageSync('token')
  } catch (e) {
    console.error('移除token失败', e)
  }
}

// 统一请求方法
export function request(options) {
  return new Promise((resolve, reject) => {
    const { url, method = 'GET', data = {}, header = {} } = options
    const fullUrl = BASE_URL + url
    
    // 添加token到请求头
    const token = getToken()
    if (token) {
      header['Authorization'] = `Bearer ${token}`
    }
    
    // 调试日志
    console.log(`[REQUEST] ${method.toUpperCase()} ${fullUrl}`)
    console.log(`[REQUEST DATA]`, data)
    
    uni.request({
      url: fullUrl,
      method: method.toUpperCase(),
      data: data,
      header: {
        'Content-Type': 'application/json',
        ...header
      },
      success: (res) => {
        const { statusCode, data } = res
        
        console.log(`[RESPONSE] ${fullUrl} - Status: ${statusCode}`)
        console.log(`[RESPONSE DATA]`, data)
        
        if (statusCode === 200) {
          // 统一处理业务错误
          if (data.code === 200) {
            resolve(data.data)
          } else if (data.code === 401) {
            // token失效，清除本地token并跳转到登录页
            removeToken()
            uni.reLaunch({
              url: '/pages/login/login'
            })
            reject(new Error('登录已失效，请重新登录'))
          } else {
            // 业务错误，显示错误信息
            uni.showToast({
              title: data.message || '请求失败',
              icon: 'none'
            })
            reject(new Error(data.message || '请求失败'))
          }
        } else if (statusCode === 422) {
          // 参数校验错误
          console.error(`[VALIDATION ERROR] ${fullUrl} - Status: ${statusCode}`)
          console.error(`[VALIDATION DATA]`, data)
          uni.showToast({
            title: data.message || '参数校验失败',
            icon: 'none'
          })
          reject(new Error(data.message || `参数校验失败: ${statusCode}`))
        } else if (statusCode === 0) {
          // 网络错误
          console.error(`[NETWORK ERROR] 无法连接到服务器: ${fullUrl}`)
          uni.showToast({
            title: '网络连接失败，请检查后端服务',
            icon: 'none'
          })
          reject(new Error(`NETWORK_ERROR: 无法连接到 ${fullUrl}`))
        } else if (statusCode >= 500) {
          // 服务器错误
          console.error(`[SERVER ERROR] ${fullUrl} - Status: ${statusCode}`)
          uni.showToast({
            title: '服务器内部错误',
            icon: 'none'
          })
          reject(new Error(`服务器错误: ${statusCode}`))
        } else {
          // 其他HTTP错误
          uni.showToast({
            title: `请求失败，状态码: ${statusCode}`,
            icon: 'none'
          })
          reject(new Error(`HTTP错误: ${statusCode}`))
        }
      },
      fail: (err) => {
        // 网络错误
        console.error(`[REQUEST FAIL] ${fullUrl}`)
        console.error(`[ERROR DETAIL]`, err)
        
        uni.showToast({
          title: '网络连接失败，请检查后端服务',
          icon: 'none'
        })
        reject(new Error(`NETWORK_ERROR: ${err.errMsg || '未知错误'}`))
      }
    })
  })
}

// GET请求
export function get(url, data = {}, header = {}) {
  return request({
    url,
    method: 'GET',
    data,
    header
  })
}

// POST请求
export function post(url, data = {}, header = {}) {
  return request({
    url,
    method: 'POST',
    data,
    header
  })
}

// PUT请求
export function put(url, data = {}, header = {}) {
  return request({
    url,
    method: 'PUT',
    data,
    header
  })
}

// DELETE请求
export function del(url, data = {}, header = {}) {
  return request({
    url,
    method: 'DELETE',
    data,
    header
  })
}

// 上传文件
export function upload(url, filePath, name = 'file', formData = {}) {
  return new Promise((resolve, reject) => {
    const token = getToken()
    uni.uploadFile({
      url: BASE_URL + url,
      filePath: filePath,
      name: name,
      formData: formData,
      header: token ? { 'Authorization': `Bearer ${token}` } : {},
      success: (res) => {
        const data = JSON.parse(res.data)
        if (data.code === 200) {
          resolve(data.data)
        } else {
          uni.showToast({
            title: data.message || '上传失败',
            icon: 'none'
          })
          reject(new Error(data.message))
        }
      },
      fail: (err) => {
        uni.showToast({
          title: '上传失败',
          icon: 'none'
        })
        reject(err)
      }
    })
  })
}
