<template>
  <view class="menu-container">
    <!-- 加载动画组件 - 设置最小2秒显示时长，显示时长计数器 -->
    <LoadingLottie 
      ref="loadingLottie" 
      loading-text="正在加载美食数据..."
      :show-duration="true"
    />
    
    <!-- 顶部轮播图 -->
    <view class="banner-section">
      <view class="banner-box">
        <image class="banner-img" src="" mode="aspectFill" />
        <view class="banner-overlay">
          <text class="banner-text">🍜 今日推荐 🍜</text>
          <text class="banner-sub">限时特惠 · 全场8折</text>
        </view>
      </view>
    </view>
    <TimeLottieAvatar />
    <!-- 个人信息栏 -->
    <view class="info-bar">
      <view class="avatar-box" @click="goToEdit">
        <image v-if="avatar" class="avatar-img" :src="avatarUrl" mode="aspectFill" />
        <text v-else class="avatar-text">{{ avatarText }}</text>
      </view>
      <view class="user-info">
        <text class="user-name">{{ nickname }}</text>
        <text class="user-desc">个性签名：{{ signature }}</text>
      </view>
      <view class="points-box" @click="showModal = true">
        <text class="points-text">💝 {{ points }}分</text>
      </view>
    </view>

    <!-- 分类菜单容器 -->
    <view class="category-container">
      <view class="category-section">
        <view class="category-item" @click="goToCategory(1)">
          <view class="category-icon">🥘</view>
          <text class="category-name">热菜</text>
        </view>
        <view class="category-item" @click="goToCategory(2)">
          <view class="category-icon">🥗</view>
          <text class="category-name">凉菜</text>
        </view>
        <view class="category-item" @click="goToCategory(3)">
          <view class="category-icon">🍚</view>
          <text class="category-name">主食</text>
        </view>
        <view class="category-item" @click="goToCategory(4)">
          <view class="category-icon">🍰</view>
          <text class="category-name">甜品</text>
        </view>
        <view class="category-item" @click="goToCategory(5)">
          <view class="category-icon">🧃</view>
          <text class="category-name">饮品</text>
        </view>
        <view class="category-item" @click="goToCategory(6)">
          <view class="category-icon">🍱</view>
          <text class="category-name">套餐</text>
        </view>
      </view>
    </view>

    <!-- 热门推荐 -->
    <view class="hot-section">
      <view class="hot-title">
        <text class="hot-text">🔥 热门推荐</text>
      </view>
      <view class="hot-list">
        <!-- 空状态 -->
        <view v-if="!hasHotFoods" class="empty-hot">
          <text class="empty-hot-text">当前还在建设中哦~</text>
        </view>
        <!-- 有数据时显示 -->
        <view v-else v-for="(food, index) in foodData" :key="index" class="hot-item">
          <view class="hot-img">{{ food.emoji }}</view>
          <view class="hot-info" @click="goToFoodDetail(index)">
            <text class="hot-name">{{ food.name }}</text>
            <text class="hot-desc">{{ food.description }}</text>
            <view class="hot-price">
              <text class="price-text">¥{{ food.price }}</text>
              <text v-if="food.oldPrice" class="old-price">¥{{ food.oldPrice }}</text>
            </view>
          </view>
          <view class="add-btn" @click="addToCart(index)">+</view>
        </view>
      </view>
    </view>

    <!-- 动态信息 -->
    <view class="notice-section">
      <view class="notice-icon">📢</view>
      <text class="notice-text">今日活动：满100减20，满200减50~</text>
    </view>

    <!-- 底部导航 -->
    <view class="tab-bar">
      <view class="tab-item active">
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
      <view class="tab-item" @click="goToPage('/pages/user/user')">
        <text class="tab-icon">👤</text>
        <text class="tab-name">我的</text>
      </view>
    </view>

    <!-- 评分弹框 -->
    <view class="modal-overlay" v-if="showModal" @click="closeModal">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">📝 今日评价</text>
          <view class="modal-close" @click="closeModal">
            <text class="close-icon">×</text>
          </view>
        </view>
        <view class="modal-body">
          <!-- 提示信息 -->
          <view class="error-tip" v-if="errorTip">
            <text class="error-tip-text">{{ errorTip }}</text>
          </view>
          <!-- 评分 -->
          <view class="form-item">
            <text class="form-label">今日小程序评分</text>
            <view class="rating-box">
              <view class="star-item" v-for="(star, index) in 5" :key="index" @click="setRating(index + 1)">
                <text class="star-icon">{{ index < rating ? '⭐' : '☆' }}</text>
                <text class="star-score">{{ index + 1 }}</text>
              </view>
            </view>
            <text class="rating-hint">{{ ratingText }}</text>
          </view>
          <!-- 建议 -->
          <view class="form-item">
            <text class="form-label">今日小程序建议</text>
            <textarea class="form-textarea" v-model="suggestion" placeholder="请输入您的建议..." :maxlength="200" />
          </view>
        </view>
        <view class="modal-footer">
          <view class="btn btn-cancel" @click="closeModal">取消</view>
          <view class="btn btn-confirm" @click="submitForm">提交</view>
        </view>
      </view>
    </view>

    <!-- 购物车组件 -->
    <CartPopup ref="cartPopup" />
  </view>
</template>

<script>
import cartStore from '../../store/cart.js'
import { getHotFoods } from '../../api/food.js'
import { submitReview } from '../../api/review.js'
import { getUserInfo } from '../../api/user.js'
import TimeLottieAvatar from '@/components/TimeLottieAvatar.vue'
import LoadingLottie from '@/components/LoadingLottie.vue'
import CartPopup from '@/components/CartPopup.vue'

export default {
  data() {
    return {
      showModal: false,
      rating: 0,
      suggestion: '',
      errorTip: '',
      avatar: '',
      nickname: '美食达人',
      signature: '今天也要好好吃饭~',
      points: 0,
      foodData: [],
      hasHotFoods: true
    }
  },
  computed: {
    avatarText() {
      return this.nickname.charAt(0) || '萌'
    },
    avatarUrl() {
      // 如果avatar是完整URL，直接返回；如果是相对路径，拼接BASE_URL
      if (!this.avatar) return ''
      if (this.avatar.startsWith('http://') || this.avatar.startsWith('https://')) {
        return this.avatar
      }
      // 拼接后端地址
      const BASE_URL = 'https://qhhxncfdtcyd.sealoshzh.site'
      return BASE_URL + this.avatar
    },
    ratingText() {
      const texts = ['', '非常不满意', '不满意', '一般', '满意', '非常满意']
      return this.rating > 0 ? texts[this.rating] + ' (' + this.rating + '分)' : '请选择评分'
    }
  },
  onShow() {
    // 刷新购物车数据
    this.$refs.cartPopup?.refreshCart()
    // 从本地存储获取用户信息
    this.loadUserInfo()
    // 获取热门推荐菜品
    this.loadHotFoods()
  },
  methods: {
    goToPage(path) {
      uni.reLaunch({
        url: path
      })
    },
    goToHistory() {
      uni.navigateTo({
        url: '/pages/stats/stats'
      })
    },
    goToEdit() {
      uni.navigateTo({
        url: '/pages/profileEdit/profileEdit'
      })
    },
    loadUserInfo() {
      try {
        const userInfo = uni.getStorageSync('userInfo')
        if (userInfo) {
          this.avatar = userInfo.avatar || ''
          this.nickname = userInfo.nickname || '美食达人'
          this.signature = userInfo.signature || '今天也要好好吃饭~'
          this.points = userInfo.points || 0
        }
      } catch (e) {
        console.error('加载用户信息失败', e)
      }
    },
    async loadHotFoods() {
      // 网络请求开始时显示加载动画
      this.$refs.loadingLottie?.showLoading()
      
      try {
        const result = await getHotFoods()
        this.foodData = result.map(item => ({
          id: item.foodId || item.id,
          foodId: item.foodId || item.id,
          name: item.name,
          price: item.price,
          oldPrice: item.oldPrice,
          emoji: item.emoji || '🍽️',
          description: item.desc || item.description
        }))
        // 检查是否有数据
        if (!result || result.length === 0) {
          this.hasHotFoods = false
          uni.showToast({
            title: '当前还在建设中哦~',
            icon: 'none'
          })
        } else {
          this.hasHotFoods = true
        }
      } catch (error) {
        // API请求失败
        console.error('获取热门菜品失败', error)
        this.hasHotFoods = false
        uni.showToast({
          title: '当前还在建设中哦~',
          icon: 'none'
        })
      } finally {
        // 数据加载完成（成功或失败），隐藏加载动画
        setTimeout(() => {
          this.$refs.loadingLottie?.hideLoading()
        }, 500)
      }
    },
    closeModal() {
      this.showModal = false
      this.rating = 0
      this.suggestion = ''
    },
    setRating(value) {
      this.rating = value
    },
    async submitForm() {
      // 清除之前的错误提示
      this.errorTip = ''
      
      if (this.rating === 0) {
        this.errorTip = '请先选择评分'
        return
      }
      
      uni.showLoading({
        title: '提交中...'
      })
      
      try {
        // 提交评价（后端会根据评分增加用户积分）
        const reviewResult = await submitReview(this.rating, this.suggestion)
        console.log('[DEBUG] 评价提交结果:', reviewResult)
        
        // 关闭弹窗
        this.closeModal()
        
        // 从后端获取最新用户信息（包含更新后的积分）
        await this.fetchUserInfo()
        
        uni.hideLoading()
        uni.showToast({
          title: '提交成功！积分已更新',
          icon: 'success',
          duration: 2000
        })
        
        console.log('[DEBUG] 提交后最新积分:', this.points)
      } catch (error) {
        uni.hideLoading()
        console.error('提交评价失败', error)
        uni.showToast({
          title: '提交失败，请重试',
          icon: 'none',
          duration: 2000
        })
      }
    },
    async fetchUserInfo() {
      try {
        const result = await getUserInfo()
        console.log('[DEBUG] 获取用户信息:', result)
        
        // 更新页面数据
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
        
        console.log('[DEBUG] 用户积分更新为:', this.points)
      } catch (error) {
        console.error('获取用户信息失败', error)
      }
    },
    goToCategory(categoryIndex) {
      uni.reLaunch({
        url: `/pages/menuList/menuList?category=${categoryIndex}`
      })
    },
    goToFoodDetail(foodIndex) {
      const food = this.foodData[foodIndex]
      uni.navigateTo({
        url: `/pages/foodDetail/foodDetail?foodId=${food.id}`
      })
    },
    addToCart(foodIndex) {
      const food = this.foodData[foodIndex]
      cartStore.addItem(food)
      this.$refs.cartPopup?.refreshCart()
      
      uni.showToast({
        title: '已加入购物车',
        icon: 'success',
        duration: 1000
      })
    }
  },
  components: {
    TimeLottieAvatar,
    LoadingLottie,
    CartPopup
  }
}
</script>

<style>
/* 页面全局样式 - 必须是非scoped的 */
page {
  background: linear-gradient(180deg, #fff0f5 0%, #ffe4ed 50%, #ffd6e0 100%);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  overflow-y: auto !important;
  min-height: 100vh !important;
  height: auto !important;
}
</style>

<style scoped>
/* 组件样式 - scoped避免污染 */
.menu-container {
  padding: 0 30rpx;
  box-sizing: border-box;
  padding-top: 20rpx;
  padding-bottom: 140rpx;
}

/* 轮播图 */
.banner-section {
  margin-bottom: 30rpx;
  padding-top: 20rpx;
}

.banner-box {
  width: 100%;
  height: 280rpx;
  background: linear-gradient(135deg, #ff6b9d 0%, #ff8fbb 100%);
  border-radius: 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 24rpx 60rpx rgba(255, 107, 157, 0.5), 0 10rpx 28rpx rgba(255, 107, 157, 0.28);
  position: relative;
  overflow: hidden;
  border: 4rpx solid #ffd6e0;
}

.banner-img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 32rpx;
}

.banner-overlay {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.banner-text {
  font-size: 48rpx;
  font-weight: 700;
  color: #ffffff;
}

.banner-sub {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.9);
  margin-top: 12rpx;
}

/* 个人信息栏 */
.info-bar {
  display: flex;
  align-items: center;
  background: #ffffff;
  border-radius: 24rpx;
  padding: 24rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 16rpx 45rpx rgba(255, 107, 157, 0.32), 0 8rpx 20rpx rgba(255, 107, 157, 0.16);
  border: 4rpx solid #ffd6e0;
}

.avatar-box {
  width: 100rpx;
  height: 100rpx;
  background: linear-gradient(135deg, #ff6b9d 0%, #ff8fbb 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 24rpx;
  position: relative;
  overflow: hidden;
}

.avatar-img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.avatar-text {
  font-size: 36rpx;
  font-weight: 700;
  color: #ffffff;
  position: relative;
  z-index: 1;
}

.user-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.user-name {
  font-size: 30rpx;
  font-weight: 600;
  color: #ff4d88;
  margin-bottom: 8rpx;
}

.user-desc {
  font-size: 24rpx;
  color: #ff80aa;
}

.points-box {
  background: linear-gradient(135deg, #fff0f5 0%, #ffe4ed 100%);
  padding: 12rpx 24rpx;
  border-radius: 20rpx;
}

.points-text {
  font-size: 24rpx;
  color: #ff4d88;
  font-weight: 600;
}

/* 分类菜单容器 */
.category-container {
  background: #ffffff;
  border-radius: 24rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 20rpx 55rpx rgba(255, 107, 157, 0.4), 0 10rpx 26rpx rgba(255, 107, 157, 0.2);
  border: 4rpx solid #ffd6e0;
}

/* 分类菜单 */
.category-section {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
}

.category-item {
  width: 140rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 24rpx;
}

.category-icon {
  width: 100rpx;
  height: 100rpx;
  background: #ffffff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48rpx;
  margin-bottom: 12rpx;
  box-shadow: 0 8rpx 20rpx rgba(255, 107, 157, 0.2);
  border: 4rpx solid #ffd6e0;
}

.category-name {
  font-size: 24rpx;
  color: #ff4d88;
  font-weight: 500;
}

/* 热门推荐 */
.hot-section {
  margin-bottom: 30rpx;
}

.hot-title {
  margin-bottom: 24rpx;
}

.hot-text {
  font-size: 32rpx;
  font-weight: 700;
  color: #ff4d88;
}

.hot-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

/* 空状态 */
.empty-hot {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60rpx 0;
}

.empty-hot-text {
  font-size: 28rpx;
  color: #ff80aa;
}

.hot-item {
  background: #ffffff;
  border-radius: 24rpx;
  padding: 24rpx;
  display: flex;
  align-items: center;
  box-shadow: 0 16rpx 45rpx rgba(255, 107, 157, 0.32), 0 8rpx 20rpx rgba(255, 107, 157, 0.16);
  border: 4rpx solid #ffd6e0;
}

.hot-img {
  width: 120rpx;
  height: 120rpx;
  background: linear-gradient(135deg, #fff0f5 0%, #ffe4ed 100%);
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 60rpx;
  margin-right: 24rpx;
}

.hot-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.hot-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #ff4d88;
  margin-bottom: 8rpx;
}

.hot-desc {
  font-size: 22rpx;
  color: #ff80aa;
  margin-bottom: 12rpx;
}

.hot-price {
  display: flex;
  align-items: center;
}

.price-text {
  font-size: 32rpx;
  font-weight: 700;
  color: #ff4d88;
  margin-right: 16rpx;
}

.old-price {
  font-size: 22rpx;
  color: #ffb3d9;
  text-decoration: line-through;
}

.add-btn {
  width: 60rpx;
  height: 60rpx;
  background: linear-gradient(135deg, #ff6b9d 0%, #ff8fbb 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36rpx;
  color: #ffffff;
  font-weight: 700;
  box-shadow: 0 8rpx 20rpx rgba(255, 107, 157, 0.3);
}

/* 动态信息 */
.notice-section {
  display: flex;
  align-items: center;
  background: #ffffff;
  border-radius: 24rpx;
  padding: 24rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 16rpx 45rpx rgba(255, 107, 157, 0.32), 0 8rpx 20rpx rgba(255, 107, 157, 0.16);
  border: 4rpx solid #ffd6e0;
}

.notice-icon {
  font-size: 32rpx;
  margin-right: 16rpx;
}

.notice-text {
  flex: 1;
  font-size: 24rpx;
  color: #ff4d88;
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

/* 弹框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 40rpx;
}

.modal-content {
  width: 100%;
  max-width: 600rpx;
  background: #ffffff;
  border-radius: 32rpx;
  overflow: hidden;
  box-shadow: 0 20rpx 60rpx rgba(255, 107, 157, 0.4);
  border: 4rpx solid #ffd6e0;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 30rpx;
  background: linear-gradient(135deg, #fff0f5 0%, #ffe4ed 100%);
  border-bottom: 2rpx solid #ffd6e0;
}

.modal-title {
  font-size: 32rpx;
  font-weight: 700;
  color: #ff4d88;
}

.modal-close {
  width: 60rpx;
  height: 60rpx;
  background: #ffffff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 12rpx rgba(255, 107, 157, 0.2);
}

.close-icon {
  font-size: 40rpx;
  color: #ff6b9d;
  font-weight: 700;
  line-height: 1;
}

.modal-body {
  padding: 40rpx 30rpx;
}

.form-item {
  margin-bottom: 40rpx;
}

.form-item:last-child {
  margin-bottom: 0;
}

.form-label {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  color: #ff4d88;
  margin-bottom: 20rpx;
}

/* 错误提示 */
.error-tip {
  background: #fff0f5;
  border: 2rpx solid #ff4d88;
  border-radius: 16rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;
  text-align: center;
}

.error-tip-text {
  font-size: 26rpx;
  color: #ff4d88;
  font-weight: 600;
}

.rating-box {
  display: flex;
  gap: 20rpx;
  justify-content: center;
  padding: 20rpx 0;
  background: linear-gradient(135deg, #fff0f5 0%, #ffe4ed 100%);
  border-radius: 20rpx;
  border: 2rpx solid #ffd6e0;
}

.star-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10rpx;
}

.star-icon {
  font-size: 56rpx;
}

.star-score {
  font-size: 20rpx;
  color: #ff6b9d;
  margin-top: 8rpx;
  font-weight: 600;
}

.rating-hint {
  display: block;
  text-align: center;
  font-size: 24rpx;
  color: #ff6b9d;
  margin-top: 16rpx;
  font-weight: 500;
}

.form-textarea {
  width: 100%;
  min-height: 200rpx;
  background: linear-gradient(135deg, #fff0f5 0%, #ffe4ed 100%);
  border-radius: 20rpx;
  padding: 24rpx;
  font-size: 26rpx;
  color: #ff4d88;
  border: 2rpx solid #ffd6e0;
  box-sizing: border-box;
  line-height: 1.6;
}

.modal-footer {
  display: flex;
  gap: 20rpx;
  padding: 0 30rpx 30rpx;
}

.btn {
  flex: 1;
  height: 88rpx;
  border-radius: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30rpx;
  font-weight: 600;
}

.btn-cancel {
  background: linear-gradient(135deg, #fff0f5 0%, #ffe4ed 100%);
  color: #ff6b9d;
  border: 2rpx solid #ffd6e0;
}

.btn-confirm {
  background: linear-gradient(135deg, #ff6b9d 0%, #ff8fbb 100%);
  color: #ffffff;
  box-shadow: 0 8rpx 20rpx rgba(255, 107, 157, 0.3);
}
</style>
