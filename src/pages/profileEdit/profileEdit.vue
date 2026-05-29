<template>
  <view class="profile-edit-container">
    <!-- 顶部返回栏 -->
    <view class="top-bar">
      <view class="back-btn" @click="goBack">
        <text class="back-icon">←</text>
      </view>
      <text class="page-title">编辑个人资料</text>
      <view class="placeholder"></view>
    </view>

    <!-- 头像区域 -->
    <view class="avatar-section">
      <view class="avatar-box">
        <image class="avatar-img" src="" mode="aspectFill" />
        <text class="avatar-text">{{ avatarText }}</text>
      </view>
      <view class="change-avatar-btn" @click="changeAvatar">
        <text class="change-text">更换头像</text>
      </view>
    </view>

    <!-- 表单区域 -->
    <view class="form-section">
      <view class="form-card">
        <!-- 昵称 -->
        <view class="form-item">
          <text class="form-label">昵称</text>
          <input 
            class="form-input" 
            v-model="nickname" 
            placeholder="请输入昵称" 
            placeholder-class="placeholder-class"
          />
        </view>

        <!-- 手机号码 -->
        <view class="form-item">
          <text class="form-label">手机号码</text>
          <input 
            class="form-input" 
            v-model="phone" 
            type="number"
            placeholder="请输入手机号码" 
            placeholder-class="placeholder-class"
          />
        </view>

        <!-- 邮箱 -->
        <view class="form-item">
          <text class="form-label">邮箱</text>
          <input 
            class="form-input" 
            v-model="email" 
            placeholder="请输入邮箱" 
            placeholder-class="placeholder-class"
          />
        </view>

        <!-- 个性签名 -->
        <view class="form-item">
          <text class="form-label">个性签名</text>
          <textarea 
            class="form-textarea" 
            v-model="signature" 
            placeholder="请输入个性签名" 
            placeholder-class="placeholder-class"
            :maxlength="100"
          />
        </view>
      </view>
    </view>

    <!-- 保存按钮 -->
    <view class="save-section">
      <view class="save-btn" @click="saveProfile">
        <text class="save-text">保存修改</text>
      </view>
    </view>
  </view>
</template>

<script>
import { updateUserInfo, uploadAvatar } from '../../api/user.js'

export default {
  data() {
    return {
      nickname: '美食达人',
      phone: '',
      email: '',
      signature: '今天也要好好吃饭~'
    }
  },
  computed: {
    avatarText() {
      return this.nickname.charAt(0) || '萌'
    }
  },
  onLoad() {
    // 从本地存储获取用户信息
    this.loadUserInfo()
  },
  methods: {
    loadUserInfo() {
      try {
        const userInfo = uni.getStorageSync('userInfo')
        if (userInfo) {
          this.nickname = userInfo.nickname || '美食达人'
          this.phone = userInfo.phone || ''
          this.email = userInfo.email || ''
          this.signature = userInfo.signature || '今天也要好好吃饭~'
        }
      } catch (e) {
        console.error('加载用户信息失败', e)
      }
    },
    goBack() {
      uni.navigateBack()
    },
    changeAvatar() {
      uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: async (res) => {
          const tempFilePath = res.tempFilePaths[0]
          try {
            await uploadAvatar(tempFilePath)
            uni.showToast({
              title: '头像已更新',
              icon: 'success'
            })
          } catch (error) {
            console.error('上传头像失败', error)
            uni.showToast({
              title: '上传失败',
              icon: 'none'
            })
          }
        }
      })
    },
    async saveProfile() {
      // 简单验证
      if (!this.nickname.trim()) {
        uni.showToast({
          title: '请输入昵称',
          icon: 'none'
        })
        return
      }

      uni.showLoading({
        title: '保存中...'
      })

      try {
        // 构建请求参数，过滤空字段
        const updateData = {
          nickname: this.nickname,
          phone: this.phone,
          signature: this.signature
        }
        // 只有当email不为空时才发送
        if (this.email.trim()) {
          updateData.email = this.email
        }
        
        // 调用API保存
        await updateUserInfo(updateData)
        
        // 同步到本地存储
        const userInfo = {
          nickname: this.nickname,
          phone: this.phone,
          email: this.email,
          signature: this.signature
        }
        uni.setStorageSync('userInfo', userInfo)
        
        uni.hideLoading()
        uni.showToast({
          title: '保存成功',
          icon: 'success'
        })
        
        setTimeout(() => {
          uni.navigateBack()
        }, 1500)
      } catch (error) {
        uni.hideLoading()
        console.error('保存失败', error)
        uni.showToast({
          title: '保存失败',
          icon: 'none'
        })
      }
    }
  }
}
</script>

<style>
/* 页面全局样式 */
page {
  background: linear-gradient(180deg, #fff0f5 0%, #ffe4ed 50%, #ffd6e0 100%);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}
</style>

<style scoped>
.profile-edit-container {
  padding: 0 30rpx;
  box-sizing: border-box;
  padding-top: 20rpx;
  padding-bottom: 100rpx;
  min-height: 100vh;
}

/* 顶部返回栏 */
.top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 30rpx 0;
  padding-top: calc(30rpx + env(safe-area-inset-top));
}

.back-btn {
  width: 80rpx;
  height: 80rpx;
  background: #ffffff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 20rpx rgba(255, 107, 157, 0.25);
  border: 3rpx solid #ffd6e0;
}

.back-icon {
  font-size: 36rpx;
  color: #ff6b9d;
  font-weight: 700;
  line-height: 1;
}

.page-title {
  font-size: 32rpx;
  font-weight: 700;
  color: #ff4d88;
}

.placeholder {
  width: 80rpx;
}

/* 头像区域 */
.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 30rpx;
  padding: 40rpx 0;
}

.avatar-box {
  width: 160rpx;
  height: 160rpx;
  background: #ffffff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 12rpx 32rpx rgba(255, 107, 157, 0.35);
  position: relative;
  overflow: hidden;
  border: 4rpx solid #ffd6e0;
  margin-bottom: 20rpx;
}

.avatar-text {
  font-size: 64rpx;
  font-weight: 700;
  color: #ff6b9d;
  position: relative;
  z-index: 1;
}

.change-avatar-btn {
  background: linear-gradient(135deg, #fff0f5 0%, #ffe4ed 100%);
  padding: 12rpx 32rpx;
  border-radius: 40rpx;
  border: 2rpx solid #ffd6e0;
}

.change-text {
  font-size: 24rpx;
  color: #ff6b9d;
  font-weight: 600;
}

/* 表单区域 */
.form-section {
  margin-bottom: 40rpx;
}

.form-card {
  background: #ffffff;
  border-radius: 32rpx;
  padding: 30rpx;
  box-shadow: 0 16rpx 45rpx rgba(255, 107, 157, 0.3);
  border: 4rpx solid #ffd6e0;
}

.form-item {
  display: flex;
  flex-direction: column;
  margin-bottom: 30rpx;
}

.form-item:last-child {
  margin-bottom: 0;
}

.form-label {
  font-size: 26rpx;
  font-weight: 600;
  color: #ff4d88;
  margin-bottom: 12rpx;
}

.form-input {
  width: 100%;
  height: 80rpx;
  background: linear-gradient(135deg, #fff0f5 0%, #ffe4ed 100%);
  border-radius: 20rpx;
  padding: 0 24rpx;
  font-size: 26rpx;
  color: #ff4d88;
  border: 2rpx solid #ffd6e0;
  box-sizing: border-box;
}

.form-textarea {
  width: 100%;
  min-height: 160rpx;
  background: linear-gradient(135deg, #fff0f5 0%, #ffe4ed 100%);
  border-radius: 20rpx;
  padding: 20rpx 24rpx;
  font-size: 26rpx;
  color: #ff4d88;
  border: 2rpx solid #ffd6e0;
  box-sizing: border-box;
  line-height: 1.6;
}

.placeholder-class {
  color: #ffb3d9;
}

/* 保存按钮 */
.save-section {
  padding: 0 10rpx;
}

.save-btn {
  width: 100%;
  height: 96rpx;
  background: linear-gradient(135deg, #ff6b9d 0%, #ff8fbb 100%);
  border-radius: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 12rpx 32rpx rgba(255, 107, 157, 0.4);
}

.save-text {
  font-size: 32rpx;
  font-weight: 700;
  color: #ffffff;
}
</style>
