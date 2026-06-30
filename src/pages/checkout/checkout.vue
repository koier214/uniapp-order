<template>
  <view class="checkout-container">
    <!-- 顶部标题栏 -->
    <view class="header-bar">
      <view class="back-btn" @click="goBack">
        <text class="back-icon">←</text>
      </view>
      <text class="header-title">确认订单</text>
      <view class="header-placeholder"></view>
    </view>

    <!-- 购物车商品列表 -->
    <view class="cart-section">
      <view class="section-title">📋 订单明细</view>
      <view class="cart-list">
        <view v-for="(item, index) in cartList" :key="index" class="cart-item">
          <view class="item-left">
            <text class="item-emoji">{{ item.emoji }}</text>
            <view class="item-info">
              <text class="item-name">{{ item.name }}</text>
              <text class="item-price">¥{{ item.price }}</text>
            </view>
          </view>
          <view class="item-right">
            <view class="quantity-minus" @click="decreaseItem(index)">-</view>
            <text class="quantity-num">{{ item.quantity }}</text>
            <view class="quantity-plus" @click="increaseItem(index)">+</view>
          </view>
        </view>
      </view>
      <!-- 空购物车状态 -->
      <view v-if="cartList.length === 0" class="empty-cart">
        <text class="empty-icon">🛒</text>
        <text class="empty-text">购物车是空的~</text>
      </view>
    </view>

    <!-- 厨师信息 -->
    <view class="chef-section">
      <view class="section-title">👨‍🍳 厨师信息</view>
      <view class="chef-card">
        <view class="chef-avatar">👨‍🍳</view>
        <view class="chef-info">
          <text class="chef-name">金牌厨师 - 王师傅</text>
          <text class="chef-desc">从业15年，擅长川湘菜</text>
          <view class="chef-rating">
            <text class="rating-stars">⭐⭐⭐⭐⭐</text>
            <text class="rating-text">4.9分</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 备注栏 -->
    <view class="remark-section">
      <view class="section-title">📝 订单备注</view>
      <view class="remark-card">
        <textarea 
          class="remark-input" 
          v-model="remark" 
          placeholder="请输入备注信息（如：少辣、不要香菜等）"
          maxlength="200"
        />
        <text class="remark-count">{{ remark.length }}/200</text>
      </view>
    </view>

    <!-- 金额明细 -->
    <view class="amount-section">
      <view class="amount-row">
        <text class="amount-label">商品金额</text>
        <text class="amount-value">¥{{ originalPrice }}</text>
      </view>
      <view class="amount-row">
        <text class="amount-label">优惠金额</text>
        <text class="amount-value discount">-¥{{ discount }}</text>
      </view>
      <view class="amount-row total">
        <text class="amount-label">合计</text>
        <text class="amount-value">¥{{ totalPrice }}</text>
      </view>
    </view>

    <!-- 底部提交按钮 -->
    <view class="footer-bar">
      <view class="total-info">
        <text class="total-label">实付金额</text>
        <text class="total-price">¥{{ totalPrice }}</text>
      </view>
      <view class="submit-btn" @click="submitOrder">
        <text class="submit-text">提交订单</text>
      </view>
    </view>
  </view>
</template>

<script>
import cartStore from '../../store/cart.js'
import { createOrder } from '../../api/order.js'

export default {
  data() {
    return {
      cartList: [],
      remark: '',
      originalPrice: 0,
      discount: 0
    }
  },
  computed: {
    // 计算总价
    totalPrice() {
      return Math.max(0, this.originalPrice - this.discount).toFixed(2)
    }
  },
  onLoad() {
    // 从 store 获取购物车数据
    this.cartList = cartStore.getCart()
    this.calculatePrice()
  },
  methods: {
    // 返回上一页
    goBack() {
      uni.navigateBack()
    },
    
    // 计算价格
    calculatePrice() {
      let total = 0
      this.cartList.forEach(item => {
        total += item.price * item.quantity
      })
      this.originalPrice = total.toFixed(2)
      
      // 计算优惠
      if (total >= 200) {
        this.discount = 50
      } else if (total >= 100) {
        this.discount = 20
      } else {
        this.discount = 0
      }
    },
    
    // 减少数量
    decreaseItem(index) {
      this.cartList = cartStore.decreaseItem(index)
      this.calculatePrice()
      // 如果购物车为空，返回上一页
      if (this.cartList.length === 0) {
        setTimeout(() => {
          uni.navigateBack()
        }, 500)
      }
    },
    
    // 增加数量
    increaseItem(index) {
      this.cartList = cartStore.increaseItem(index)
      this.calculatePrice()
    },
    
    // 提交订单
    async submitOrder() {
      console.log('[DEBUG] submitOrder 被调用')
      
      if (this.cartList.length === 0) {
        console.log('[DEBUG] 购物车为空')
        uni.showToast({
          title: '购物车是空的',
          icon: 'none'
        })
        return
      }
      
      console.log('[DEBUG] 购物车数据:', this.cartList)
      
      // 显示加载提示
      uni.showLoading({
        title: '提交中...'
      })
      
      try {
        // 准备订单数据
        const items = this.cartList.map(item => ({
          foodId: item.id || item.foodId || 0,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          emoji: item.emoji || '🍽️'
        }))
        
        console.log('[DEBUG] 准备提交的订单数据:', items)
        console.log('[DEBUG] 备注:', this.remark)
        
        // 调用后端API创建订单
        const result = await createOrder(items, this.remark, '')
        
        console.log('[DEBUG] 创建订单成功:', result)
        
        // 清空购物车
        cartStore.clearCart()
        
        uni.hideLoading()
        uni.showToast({
          title: '订单提交成功',
          icon: 'success',
          duration: 1500
        })
        
        // 跳转到订单页面
        setTimeout(() => {
          uni.reLaunch({
            url: '/pages/order/order'
          })
        }, 1500)
      } catch (error) {
        console.error('[DEBUG] 创建订单失败:', error)
        uni.hideLoading()
        uni.showToast({
          title: '订单提交失败，请重试',
          icon: 'none'
        })
        console.error('提交订单失败:', error)
      }
    }
  }
}
</script>

<style scoped>
/* 页面容器 */
.checkout-container {
  min-height: 100vh;
  background: linear-gradient(180deg, #fff0f5 0%, #ffe4ed 50%, #ffd6e0 100%);
  padding-bottom: 140rpx;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

/* 顶部标题栏 */
.header-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 60rpx 30rpx 30rpx;
  background: linear-gradient(135deg, #ff6b9d 0%, #ff8fbb 100%);
}

.back-btn {
  width: 70rpx;
  height: 70rpx;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-icon {
  font-size: 36rpx;
  color: #ffffff;
  font-weight: 700;
}

.header-title {
  font-size: 34rpx;
  font-weight: 700;
  color: #ffffff;
}

.header-placeholder {
  width: 70rpx;
}

/* 通用标题样式 */
.section-title {
  font-size: 30rpx;
  font-weight: 700;
  color: #ff4d88;
  margin-bottom: 20rpx;
  padding-left: 10rpx;
  border-left: 6rpx solid #ff6b9d;
}

/* 购物车商品列表 */
.cart-section {
  margin: 30rpx;
  padding: 30rpx;
  background: #ffffff;
  border-radius: 24rpx;
  box-shadow: 0 16rpx 45rpx rgba(255, 107, 157, 0.35), 0 8rpx 22rpx rgba(255, 107, 157, 0.18);
  border: 3rpx solid #ffd6e0;
}

.cart-list {
  margin-top: 20rpx;
}

.cart-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 0;
  border-bottom: 2rpx solid #ffe4ed;
}

.cart-item:last-child {
  border-bottom: none;
}

.item-left {
  display: flex;
  align-items: center;
  flex: 1;
}

.item-emoji {
  font-size: 60rpx;
  margin-right: 20rpx;
}

.item-info {
  display: flex;
  flex-direction: column;
}

.item-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #ff4d88;
  margin-bottom: 8rpx;
}

.item-price {
  font-size: 24rpx;
  color: #ff80aa;
}

.item-right {
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

/* 空购物车状态 */
.empty-cart {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60rpx 0;
}

.empty-icon {
  font-size: 80rpx;
  margin-bottom: 20rpx;
}

.empty-text {
  font-size: 26rpx;
  color: #ff80aa;
}

/* 厨师信息 */
.chef-section {
  margin: 0 30rpx 30rpx;
  padding: 30rpx;
  background: #ffffff;
  border-radius: 24rpx;
  box-shadow: 0 16rpx 45rpx rgba(255, 107, 157, 0.35), 0 8rpx 22rpx rgba(255, 107, 157, 0.18);
  border: 3rpx solid #ffd6e0;
}

.chef-card {
  display: flex;
  align-items: center;
  padding: 20rpx;
  background: linear-gradient(135deg, #fff0f5 0%, #ffe4ed 100%);
  border-radius: 20rpx;
  border: 2rpx solid #ffd6e0;
}

.chef-avatar {
  font-size: 80rpx;
  margin-right: 24rpx;
}

.chef-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.chef-name {
  font-size: 30rpx;
  font-weight: 700;
  color: #ff4d88;
  margin-bottom: 8rpx;
}

.chef-desc {
  font-size: 22rpx;
  color: #ff80aa;
  margin-bottom: 10rpx;
}

.chef-rating {
  display: flex;
  align-items: center;
}

.rating-stars {
  font-size: 22rpx;
  margin-right: 10rpx;
}

.rating-text {
  font-size: 22rpx;
  color: #ff6b9d;
  font-weight: 600;
}

/* 备注栏 */
.remark-section {
  margin: 0 30rpx 30rpx;
  padding: 30rpx;
  background: #ffffff;
  border-radius: 24rpx;
  box-shadow: 0 16rpx 45rpx rgba(255, 107, 157, 0.35), 0 8rpx 22rpx rgba(255, 107, 157, 0.18);
  border: 3rpx solid #ffd6e0;
}

.remark-card {
  position: relative;
  background: linear-gradient(135deg, #fff0f5 0%, #ffe4ed 100%);
  border-radius: 16rpx;
  padding: 20rpx;
  border: 2rpx solid #ffd6e0;
}

.remark-input {
  width: 100%;
  min-height: 160rpx;
  font-size: 26rpx;
  color: #ff4d88;
  line-height: 1.6;
}

.remark-input::placeholder {
  color: #ffb3d9;
}

.remark-count {
  position: absolute;
  bottom: 15rpx;
  right: 15rpx;
  font-size: 20rpx;
  color: #ffb3d9;
}

/* 金额明细 */
.amount-section {
  margin: 0 30rpx 30rpx;
  padding: 30rpx;
  background: #ffffff;
  border-radius: 24rpx;
  box-shadow: 0 16rpx 45rpx rgba(255, 107, 157, 0.35), 0 8rpx 22rpx rgba(255, 107, 157, 0.18);
  border: 3rpx solid #ffd6e0;
}

.amount-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16rpx 0;
}

.amount-label {
  font-size: 26rpx;
  color: #ff80aa;
}

.amount-value {
  font-size: 26rpx;
  color: #ff4d88;
  font-weight: 600;
}

.amount-value.discount {
  color: #52c41a;
}

.amount-row.total {
  border-top: 2rpx solid #ffd6e0;
  padding-top: 24rpx;
  margin-top: 16rpx;
}

.amount-row.total .amount-label {
  font-size: 28rpx;
  font-weight: 700;
  color: #ff4d88;
}

.amount-row.total .amount-value {
  font-size: 36rpx;
  font-weight: 700;
  color: #ff6b9d;
}

/* 底部提交栏 */
.footer-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  background: #ffffff;
  padding: 20rpx 30rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  box-shadow: 0 -8rpx 24rpx rgba(255, 107, 157, 0.15);
  border-top: 4rpx solid #ffd6e0;
}

.total-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.total-label {
  font-size: 22rpx;
  color: #ff80aa;
  margin-bottom: 4rpx;
}

.total-price {
  font-size: 40rpx;
  font-weight: 700;
  color: #ff6b9d;
}

.submit-btn {
  background: linear-gradient(135deg, #ff6b9d 0%, #ff8fbb 100%);
  padding: 24rpx 60rpx;
  border-radius: 40rpx;
  box-shadow: 0 8rpx 20rpx rgba(255, 107, 157, 0.3);
}

.submit-text {
  font-size: 30rpx;
  font-weight: 700;
  color: #ffffff;
}
</style>
