<template>
  <view class="user-container">
    <!-- 顶部背景区域 -->
    <view class="header-section">
      <view class="background-box">
        <view class="avatar-info">
          <view class="avatar-box" @click="goToEdit">
            <image v-if="showAvatar" class="avatar-img" :src="avatarUrl" mode="aspectFill" @error="onAvatarError" />
            <text v-else class="avatar-text">{{ avatarText }}</text>
          </view>
          <view class="name-text">{{ nickname }}</view>
        </view>
      </view>
    </view>

    <!-- 等级信息区域 -->
    <view class="level-section">
      <view class="level-card">
        <view class="level-title">称号 LV2</view>
        <view class="days-text">使用天数：30天</view>
        <view class="progress-bar">
          <view class="progress-fill" style="width: 60%"></view>
          <text class="progress-text">进阶进度条</text>
        </view>
      </view>
    </view>

    <!-- 最爱菜品区域 -->
    <view class="favorite-section">
      <view class="favorite-card">
        <view class="favorite-title">最爱菜品</view>
        <view class="food-list">
          <view class="food-item">
            <view class="food-icon">🍲</view>
            <text class="food-name">招牌牛肉锅</text>
            <text class="food-count">3次</text>
          </view>
          <view class="food-item">
            <view class="food-icon">🍛</view>
            <text class="food-name">咖喱鸡肉饭</text>
            <text class="food-count">5次</text>
          </view>
          <view class="food-item">
            <view class="food-icon">🥟</view>
            <text class="food-name">手工饺子</text>
            <text class="food-count">2次</text>
          </view>
          <view class="food-item">
            <view class="food-icon">🍮</view>
            <text class="food-name">草莓布丁</text>
            <text class="food-count">8次</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 底部导航 -->
    <view class="tab-bar">
      <view class="tab-item" @click="goToPage('/pages/menu/menu')">
        <text class="tab-icon">🏠</text>
        <text class="tab-name">首页</text>
      </view>
      <view class="tab-item" @click="goToPage('/pages/menuList/menuList')">
        <text class="tab-icon">📋</text>
        <text class="tab-name">菜单</text>
      </view>
      <view class="tab-item" @click="goToPage('/pages/order/order')">
        <text class="tab-icon">📦</text>
        <text class="tab-name">订单</text>
      </view>
      <view class="tab-item active">
        <text class="tab-icon">👤</text>
        <text class="tab-name">我的</text>
      </view>
    </view>
  </view>
</template>

<script>
import { getUserInfo } from '../../api/user.js'
import { getStaticUrl } from '../../utils/config.js'

export default {
  data() {
    return {
      avatar: '',
      nickname: '美食达人',
      signature: '今天也要好好吃饭~',
      points: 0,
      avatarLoadError: false
    }
  },
  computed: {
    avatarText() {
      return this.nickname.charAt(0) || '萌'
    },
    avatarUrl() {
      return getStaticUrl(this.avatar)
    },
    // 当图片加载失败时回退到文字头像
    showAvatar() {
      return this.avatar && !this.avatarLoadError
    }
  },
  onShow() {
    // 从API获取用户信息
    this.loadUserInfo()
  },
  methods: {
    goToPage(path) {
      uni.reLaunch({
        url: path
      })
    },
    goToEdit() {
      uni.navigateTo({
        url: '/pages/profileEdit/profileEdit'
      })
    },
    onAvatarError() {
      // 图片加载失败时回退到文字头像显示
      console.log('[DEBUG] 头像图片加载失败，切换到文字头像')
      this.avatarLoadError = true
    },
    async loadUserInfo() {
      try {
        const result = await getUserInfo()
        this.avatar = result.avatar || ''
        this.nickname = result.nickname || '美食达人'
        this.signature = result.signature || '今天也要好好吃饭~'
        this.points = result.points || 0
        
        // 同步到本地存储
        uni.setStorageSync('userInfo', {
          avatar: this.avatar,
          nickname: this.nickname,
          signature: this.signature,
          points: this.points,
          phone: result.phone || '',
          email: result.email || ''
        })
      } catch (error) {
        console.error('获取用户信息失败', error)
        // 从本地存储获取备用
        try {
          const userInfo = uni.getStorageSync('userInfo')
          if (userInfo) {
            this.avatar = userInfo.avatar || ''
            this.nickname = userInfo.nickname || '美食达人'
            this.signature = userInfo.signature || '今天也要好好吃饭~'
            this.points = userInfo.points || 0
          }
        } catch (e) {
          console.error('加载本地用户信息失败', e)
        }
        uni.showToast({
          title: '当前还在建设中哦~',
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
  overflow-y: auto !important;
  min-height: 100vh !important;
  height: auto !important;
}
</style>

<style scoped>
.user-container {
  padding: 0 30rpx;
  box-sizing: border-box;
  padding-top: 20rpx;
  padding-bottom: 180rpx;
}

/* 顶部背景区域 */
.header-section {
  margin-bottom: 30rpx;
  padding-top: 20rpx;
}

.background-box {
  width: 100%;
  height: 320rpx;
  background: linear-gradient(135deg, #ff6b9d 0%, #ff8fbb 50%, #ffd6e0 100%);
  border-radius: 32rpx;
  display: flex;
  align-items: flex-end;
  justify-content: flex-start;
  box-shadow: 0 20rpx 50rpx rgba(255, 107, 157, 0.45), 0 8rpx 20rpx rgba(255, 107, 157, 0.2);
  position: relative;
  overflow: hidden;
  border: 4rpx solid #ffd6e0;
  padding: 40rpx 30rpx;
  box-sizing: border-box;
}

.avatar-info {
  display: flex;
  align-items: center;
  gap: 24rpx;
}

.avatar-box {
  width: 120rpx;
  height: 120rpx;
  background: #ffffff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 20rpx rgba(255, 107, 157, 0.3);
  position: relative;
  overflow: hidden;
  flex-shrink: 0;
}

.avatar-text {
  font-size: 48rpx;
  font-weight: 700;
  color: #ff6b9d;
  position: relative;
  z-index: 1;
}

.name-text {
  font-size: 36rpx;
  font-weight: 700;
  color: #ffffff;
  text-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

/* 等级信息区域 */
.level-section {
  margin-bottom: 30rpx;
}

.level-card {
  background: #ffffff;
  border-radius: 24rpx;
  padding: 30rpx;
  box-shadow: 0 16rpx 40rpx rgba(255, 107, 157, 0.3), 0 8rpx 20rpx rgba(255, 107, 157, 0.15);
  border: 4rpx solid #ffd6e0;
}

.level-title {
  font-size: 28rpx;
  font-weight: 700;
  color: #ff4d88;
  margin-bottom: 16rpx;
}

.days-text {
  font-size: 24rpx;
  color: #ff80aa;
  margin-bottom: 20rpx;
}

.progress-bar {
  width: 100%;
  height: 40rpx;
  background: linear-gradient(135deg, #fff0f5 0%, #ffe4ed 100%);
  border-radius: 20rpx;
  position: relative;
  overflow: hidden;
  border: 2rpx solid #ffd6e0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.progress-fill {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  background: linear-gradient(135deg, #ff6b9d 0%, #ff8fbb 100%);
  border-radius: 18rpx;
  z-index: 1;
}

.progress-text {
  font-size: 20rpx;
  color: #ffffff;
  font-weight: 600;
  text-shadow: 0 1rpx 3rpx rgba(0, 0, 0, 0.2);
  position: relative;
  z-index: 2;
}

/* 最爱菜品区域 */
.favorite-section {
  margin-bottom: 30rpx;
}

.favorite-card {
  background: #ffffff;
  border-radius: 24rpx;
  padding: 30rpx;
  box-shadow: 0 16rpx 40rpx rgba(255, 107, 157, 0.3), 0 8rpx 20rpx rgba(255, 107, 157, 0.15);
  border: 4rpx solid #ffd6e0;
}

.favorite-title {
  font-size: 32rpx;
  font-weight: 700;
  color: #ff4d88;
  margin-bottom: 24rpx;
  padding-bottom: 16rpx;
  border-bottom: 2rpx dashed #ffe4ed;
}

.food-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.food-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(135deg, #fff0f5 0%, #ffe4ed 100%);
  border-radius: 20rpx;
  padding: 20rpx 24rpx;
  border: 3rpx solid #ffd6e0;
}

.food-icon {
  font-size: 48rpx;
  margin-right: 20rpx;
}

.food-name {
  flex: 1;
  font-size: 26rpx;
  color: #ff4d88;
  font-weight: 600;
}

.food-count {
  font-size: 24rpx;
  color: #ff80aa;
  font-weight: 600;
}

/* 底部导航 */
.tab-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 999;
  display: flex;
  background: #ffffff;
  padding: 16rpx 0;
  padding-bottom: calc(16rpx + env(safe-area-inset-bottom));
  box-shadow: 0 -8rpx 24rpx rgba(255, 107, 157, 0.15);
  border-top: 4rpx solid #ffd6e0;
}

.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8rpx 0;
  border-radius: 16rpx;
  margin: 0 8rpx;
  transition: none;
  box-sizing: border-box;
}

.tab-item.active {
  background: linear-gradient(135deg, #ff6b9d 0%, #ff8fbb 100%);
  box-shadow: 0 4rpx 12rpx rgba(255, 107, 157, 0.3);
}

.tab-item.active .tab-icon,
.tab-item.active .tab-name {
  color: #ffffff;
  font-weight: 700;
}

.tab-icon {
  font-size: 40rpx;
  margin-bottom: 6rpx;
  color: #ffb3d9;
}

.tab-name {
  font-size: 22rpx;
  color: #ffb3d9;
  font-weight: 400;
}

.tab-item:not(.active) .tab-name {
  color: #ff80aa;
}

.tab-item:not(.active) .tab-name,
.tab-item:not(.active) .tab-icon {
  font-weight: 400 !important;
}
</style>
