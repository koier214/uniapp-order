<template>
  <view class="login-container">
    <!-- Logo 区域 -->
    <view class="logo-section">
      <view class="logo-box">
        <text class="logo-text">萌</text>
      </view>
    </view>

    <!-- 标题 -->
    <view class="title-section">
      <text class="main-title">欢迎回来</text>
      <text class="sub-title">登录开启美好时光</text>
    </view>

    <!-- 表单区域 -->
    <view class="form-section">
      <!-- 手机号输入 -->
      <view class="input-group">
        <view class="input-wrapper">
          <text class="prefix-icon">💕</text>
          <input 
            class="phone-input" 
            type="number" 
            placeholder="请输入手机号" 
            v-model="phone"
            maxlength="11"
            @input="onPhoneInput"
          />
        </view>
      </view>

      <!-- 密码输入 -->
      <view class="input-group">
        <view class="input-wrapper code-wrapper">
          <text class="code-prefix">🔒</text>
          <input 
            class="code-input" 
            :type="showPassword ? 'text' : 'password'" 
            placeholder="请输入密码" 
            v-model="password"
          />
          <text class="toggle-password" @tap="togglePassword">
            {{ showPassword ? '👁️' : '🙈' }}
          </text>
        </view>
      </view>

      <!-- 协议区域 -->
      <view class="agreement-section">
        <view class="checkbox-wrapper" @tap="toggleAgreement">
          <view class="checkbox" :class="{ checked: agreed }">
            <text v-if="agreed" class="check-icon">♥</text>
          </view>
        </view>
        <view class="agreement-text">
          <text>已阅读并同意</text>
          <text class="link">《用户服务协议》</text>
          <text>和</text>
          <text class="link">《隐私政策》</text>
        </view>
      </view>

      <!-- 登录按钮 -->
      <button class="login-btn" @tap="handleLogin">
        立即登录
      </button>
    </view>

    <!-- 注册入口 -->
    <view class="register-section">
      <text class="register-text">还没有账号？</text>
      <text class="register-link" @tap="goRegister">立即注册</text>
    </view>
  </view>
</template>

<script>
import { login } from '../../api/user.js'

export default {
  data() {
    return {
      phone: '',
      password: '',
      showPassword: false,
      agreed: false
    }
  },

  methods: {
    onPhoneInput(e) {
      this.phone = e.detail.value.replace(/\D/g, '')
    },

    togglePassword() {
      this.showPassword = !this.showPassword
    },

    toggleAgreement() {
      this.agreed = !this.agreed
    },

    async handleLogin() {
      if (!this.phone) {
        uni.showToast({
          title: '请输入手机号',
          icon: 'none'
        })
        return
      }
      if (!/^1[3-9]\d{9}$/.test(this.phone)) {
        uni.showToast({
          title: '请输入正确的手机号',
          icon: 'none'
        })
        return
      }
      if (!this.password) {
        uni.showToast({
          title: '请输入密码',
          icon: 'none'
        })
        return
      }
      if (this.password.length < 6) {
        uni.showToast({
          title: '密码长度不能少于6位',
          icon: 'none'
        })
        return
      }
      if (!this.agreed) {
        uni.showToast({
          title: '请先阅读并同意协议',
          icon: 'none'
        })
        return
      }

      uni.showLoading({
        title: '登录中...'
      })

      try {
        const result = await login(this.phone, this.password)
        
        // 保存token和用户信息
        uni.setStorageSync('token', result.token)
        if (result.userInfo) {
          uni.setStorageSync('userInfo', result.userInfo)
        }
        
        uni.hideLoading()
        uni.showToast({
          title: '登录成功',
          icon: 'success'
        })
        
        setTimeout(() => {
          uni.reLaunch({
            url: '/pages/menu/menu'
          })
        }, 1500)
      } catch (error) {
        uni.hideLoading()
        console.error('登录失败', error)
        // 后端服务不可用时，使用模拟登录
        this.handleMockLogin()
      }
    },

    // 模拟登录（后端服务不可用时使用）
    handleMockLogin() {
      uni.showModal({
        title: '网络提示',
        content: '后端服务暂时不可用，是否使用测试账号登录体验应用？',
        confirmText: '确定',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            // 模拟登录成功，保存模拟数据
            const mockToken = 'mock_token_123456'
            const mockUserInfo = {
              nickname: '美食达人',
              phone: this.phone,
              signature: '今天也要好好吃饭~',
              points: 100
            }
            
            uni.setStorageSync('token', mockToken)
            uni.setStorageSync('userInfo', mockUserInfo)
            
            uni.showToast({
              title: '登录成功',
              icon: 'success'
            })
            
            setTimeout(() => {
              uni.reLaunch({
                url: '/pages/menu/menu'
              })
            }, 1500)
          }
        }
      })
    },

    goRegister() {
      uni.navigateTo({
        url: '/pages/register/register'
      })
    }
  }
}
</script>

<style>
page {
  background: linear-gradient(180deg, #fff0f5 0%, #ffe4ed 50%, #ffd6e0 100%);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.login-container {
  padding: 100rpx 60rpx 60rpx;
  min-height: 100vh;
  box-sizing: border-box;
}

.logo-section {
  display: flex;
  justify-content: center;
  margin-bottom: 60rpx;
}

.logo-box {
  width: 140rpx;
  height: 140rpx;
  background: linear-gradient(135deg, #ff6b9d 0%, #ff8fbb 50%, #ffb3d9 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 16rpx 40rpx rgba(255, 107, 157, 0.35);
}

.logo-text {
  font-size: 56rpx;
  font-weight: 700;
  color: #ffffff;
}

.title-section {
  text-align: center;
  margin-bottom: 80rpx;
}

.main-title {
  display: block;
  font-size: 48rpx;
  font-weight: 700;
  color: #ff4d88;
  margin-bottom: 12rpx;
}

.sub-title {
  font-size: 28rpx;
  color: #ff80aa;
}

.form-section {
  margin-bottom: 60rpx;
}

.input-group {
  margin-bottom: 36rpx;
}

.input-wrapper {
  background-color: #ffffff;
  border-radius: 32rpx;
  padding: 32rpx 36rpx;
  display: flex;
  align-items: center;
  border: 4rpx solid #ffd6e0;
  box-shadow: 0 8rpx 24rpx rgba(255, 107, 157, 0.15);
  box-sizing: border-box;
  width: 100%;
}

.prefix-icon {
  font-size: 36rpx;
  margin-right: 20rpx;
  flex-shrink: 0;
}

.code-prefix {
  font-size: 32rpx;
  margin-right: 20rpx;
  flex-shrink: 0;
}

.phone-input {
  flex: 1;
  font-size: 30rpx;
  color: #ff4d88;
  min-width: 0;
}

.code-wrapper {
  padding: 20rpx 20rpx 20rpx 36rpx;
}

.code-input {
  flex: 1;
  font-size: 30rpx;
  color: #ff4d88;
  padding: 12rpx 0;
  min-width: 0;
}

.toggle-password {
  font-size: 32rpx;
  margin-left: 16rpx;
  padding: 8rpx;
  flex-shrink: 0;
}

.agreement-section {
  display: flex;
  align-items: flex-start;
  margin-bottom: 56rpx;
  padding: 0 12rpx;
}

.checkbox-wrapper {
  margin-right: 16rpx;
  margin-top: 4rpx;
  flex-shrink: 0;
}

.checkbox {
  width: 40rpx;
  height: 40rpx;
  border-radius: 12rpx;
  border: 3rpx solid #ffb3d9;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #ffffff;
}

.checkbox.checked {
  background: linear-gradient(135deg, #ff6b9d 0%, #ff8fbb 100%);
  border-color: transparent;
}

.check-icon {
  font-size: 24rpx;
  color: #ffffff;
  font-weight: 700;
}

.agreement-text {
  flex: 1;
  font-size: 24rpx;
  color: #ff80aa;
  line-height: 1.7;
}

.link {
  color: #ff4d88;
  font-weight: 500;
}

.login-btn {
  width: 100%;
  height: 104rpx;
  line-height: 104rpx;
  background: linear-gradient(135deg, #ff6b9d 0%, #ff8fbb 100%);
  color: #ffffff;
  border-radius: 32rpx;
  font-size: 34rpx;
  font-weight: 700;
  border: none;
  box-shadow: 0 16rpx 40rpx rgba(255, 107, 157, 0.35);
}

.login-btn::after {
  border: none;
}

.register-section {
  text-align: center;
}

.register-text {
  font-size: 28rpx;
  color: #ffb3d9;
}

.register-link {
  font-size: 28rpx;
  color: #ff4d88;
  font-weight: 600;
}
</style>
