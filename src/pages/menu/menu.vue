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
        <image class="avatar-img" src="" mode="aspectFill" />
        <text class="avatar-text">{{ avatarText }}</text>
      </view>
      <view class="user-info">
        <text class="user-name">{{ nickname }}</text>
        <text class="user-desc">个性签名：{{ signature }}</text>
      </view>
      <view class="points-box" @click="showModal = true">
        <text class="points-text">💝 88分</text>
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
          <!-- 评分 -->
          <view class="form-item">
            <text class="form-label">今日小程序评分</text>
            <view class="rating-box">
              <view class="star-item" v-for="(star, index) in 5" :key="index" @click="setRating(index + 1)">
                <text class="star-icon">{{ index < rating ? '⭐' : '☆' }}</text>
              </view>
            </view>
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

    <!-- 购物车按钮 -->
    <view 
      class="cart-btn" 
      v-if="cartList.length > 0" 
      :style="{ right: cartPosition.right, left: cartPosition.left }"
      @touchstart="onTouchStart"
      @touchmove="onTouchMove"
      @touchend="onTouchEnd"
      @click="toggleCart"
    >
      <text class="cart-icon">🛒</text>
      <view class="cart-badge">{{ cartTotalCount }}</view>
    </view>

    <!-- 购物车列表弹窗 -->
    <view class="cart-overlay" v-if="showCart" @click="toggleCart">
      <view class="cart-popup" @click.stop>
        <view class="cart-header">
          <text class="cart-title">购物车</text>
          <view class="cart-clear" @click="clearCart">清空</view>
        </view>
        <scroll-view class="cart-list" scroll-y>
          <view class="cart-item" v-for="(item, index) in cartList" :key="index">
            <view class="cart-item-left">
              <text class="cart-item-emoji">{{ item.emoji }}</text>
              <view class="cart-item-info">
                <text class="cart-item-name">{{ item.name }}</text>
                <text class="cart-item-price">¥{{ item.price }}</text>
              </view>
            </view>
            <view class="cart-item-right">
              <view class="quantity-minus" @click="decreaseCartItem(index)">-</view>
              <text class="quantity-num">{{ item.quantity }}</text>
              <view class="quantity-plus" @click="increaseCartItem(index)">+</view>
            </view>
          </view>
        </scroll-view>
        <view class="cart-footer">
          <text class="cart-total">合计：¥{{ cartTotalPrice }}</text>
          <view class="cart-checkout" @click="goToCheckout">结算</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import cartStore from '../../store/cart.js'
import { getHotFoods } from '../../api/food.js'
import { submitReview } from '../../api/review.js'
import TimeLottieAvatar from '@/components/TimeLottieAvatar.vue'
import LoadingLottie from '@/components/LoadingLottie.vue'

export default {
  data() {
    return {
      showModal: false,
      rating: 0,
      suggestion: '',
      cartList: [],
      showCart: false,
      cartPosition: { right: '30rpx', left: 'auto' },
      startX: 0,
      startY: 0,
      isDragging: false,
      nickname: '美食达人',
      signature: '今天也要好好吃饭~',
      foodData: [],
      hasHotFoods: true
    }
  },
  computed: {
    cartTotalCount() {
      return cartStore.getTotalCount(this.cartList)
    },
    cartTotalPrice() {
      return cartStore.getTotalPrice(this.cartList)
    },
    avatarText() {
      return this.nickname.charAt(0) || '萌'
    }
  },
  onShow() {
    // 从 store 获取最新购物车数据
    this.cartList = cartStore.getCart()
    // 如果购物车为空，关闭弹窗
    if (this.cartList.length === 0) {
      this.showCart = false
    }
    // 从本地存储获取用户信息
    this.loadUserInfo()
    // 获取热门推荐菜品（会自动显示和隐藏加载动画）
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
          this.nickname = userInfo.nickname || '美食达人'
          this.signature = userInfo.signature || '今天也要好好吃饭~'
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
      if (this.rating === 0) {
        uni.showToast({
          title: '请先评分',
          icon: 'none'
        })
        return
      }
      if (!this.suggestion.trim()) {
        uni.showToast({
          title: '请填写建议',
          icon: 'none'
        })
        return
      }
      
      try {
        await submitReview(this.rating, this.suggestion)
        uni.showToast({
          title: '提交成功',
          icon: 'success'
        })
        setTimeout(() => {
          this.closeModal()
        }, 1500)
      } catch (error) {
        console.error('提交评价失败', error)
        uni.showToast({
          title: '提交失败',
          icon: 'none'
        })
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
      this.cartList = cartStore.addItem(food)
      
      uni.showToast({
        title: '已加入购物车',
        icon: 'success',
        duration: 1000
      })
    },
    toggleCart() {
      this.showCart = !this.showCart
    },
    clearCart() {
      this.cartList = cartStore.clearCart()
      this.showCart = false
    },
    decreaseCartItem(index) {
      this.cartList = cartStore.decreaseItem(index)
      // 如果购物车为空，关闭弹窗
      if (this.cartList.length === 0) {
        this.showCart = false
      }
    },
    increaseCartItem(index) {
      this.cartList = cartStore.increaseItem(index)
    },
    onTouchStart(e) {
      this.isDragging = true
      const touch = e.touches[0]
      this.startX = touch.clientX
      this.startY = touch.clientY
    },
    onTouchMove(e) {
      if (!this.isDragging) return
    },
    onTouchEnd(e) {
      if (!this.isDragging) return
      this.isDragging = false
      
      const touch = e.changedTouches[0]
      const endX = touch.clientX
      const screenWidth = uni.getSystemInfoSync().screenWidth
      
      if (endX < screenWidth / 2) {
        this.cartPosition = { left: '30rpx', right: 'auto' }
      } else {
        this.cartPosition = { right: '30rpx', left: 'auto' }
      }
    },
    goToCheckout() {
      uni.navigateTo({
        url: '/pages/checkout/checkout'
      })
    }
  },
  components: {
    TimeLottieAvatar,
    LoadingLottie
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
  padding: 10rpx;
}

.star-icon {
  font-size: 56rpx;
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

/* 购物车按钮 */
.cart-btn {
  position: fixed;
  bottom: 200rpx;
  width: 120rpx;
  height: 120rpx;
  background: linear-gradient(135deg, #ff6b9d 0%, #ff8fbb 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 12rpx 32rpx rgba(255, 107, 157, 0.4);
  z-index: 9998;
  transition: left 0.3s, right 0.3s;
  border: 4rpx solid #ffd6e0;
}

.cart-icon {
  font-size: 56rpx;
}

.cart-badge {
  position: absolute;
  top: -8rpx;
  right: -8rpx;
  min-width: 44rpx;
  height: 44rpx;
  background: #ff4d88;
  border-radius: 22rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  color: #ffffff;
  font-weight: 700;
  padding: 0 8rpx;
  border: 3rpx solid #ffffff;
}

/* 购物车弹窗 */
.cart-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 9999;
}

.cart-popup {
  width: 100%;
  max-width: 100vw;
  max-height: 70vh;
  background: #ffffff;
  border-radius: 32rpx 32rpx 0 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 -20rpx 60rpx rgba(255, 107, 157, 0.3);
  box-sizing: border-box;
}

.cart-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 30rpx;
  background: linear-gradient(135deg, #fff0f5 0%, #ffe4ed 100%);
  border-bottom: 3rpx solid #ffd6e0;
}

.cart-title {
  font-size: 32rpx;
  font-weight: 700;
  color: #ff4d88;
}

.cart-clear {
  font-size: 26rpx;
  color: #ff80aa;
  font-weight: 500;
}

.cart-list {
  flex: 1;
  max-height: 50vh;
  padding: 20rpx 30rpx;
  width: 100%;
  box-sizing: border-box;
  overflow-x: hidden;
}

.cart-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 0;
  border-bottom: 2rpx solid #ffe4ed;
  width: 100%;
  box-sizing: border-box;
}

.cart-item-left {
  display: flex;
  align-items: center;
  flex: 1;
}

.cart-item-emoji {
  font-size: 56rpx;
  margin-right: 20rpx;
}

.cart-item-info {
  display: flex;
  flex-direction: column;
}

.cart-item-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #ff4d88;
  margin-bottom: 8rpx;
}

.cart-item-price {
  font-size: 24rpx;
  color: #ff80aa;
}

.cart-item-right {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.quantity-minus,
.quantity-plus {
  width: 56rpx;
  height: 56rpx;
  background: linear-gradient(135deg, #fff0f5 0%, #ffe4ed 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  color: #ff6b9d;
  font-weight: 700;
  border: 2rpx solid #ffd6e0;
}

.quantity-num {
  font-size: 28rpx;
  font-weight: 600;
  color: #ff4d88;
  min-width: 40rpx;
  text-align: center;
}

.cart-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 30rpx;
  padding-bottom: calc(30rpx + env(safe-area-inset-bottom));
  background: #ffffff;
  border-top: 3rpx solid #ffd6e0;
}

.cart-total {
  font-size: 28rpx;
  font-weight: 600;
  color: #ff4d88;
}

.cart-checkout {
  background: linear-gradient(135deg, #ff6b9d 0%, #ff8fbb 100%);
  padding: 20rpx 50rpx;
  border-radius: 40rpx;
  font-size: 28rpx;
  font-weight: 700;
  color: #ffffff;
  box-shadow: 0 8rpx 20rpx rgba(255, 107, 157, 0.3);
}
</style>
