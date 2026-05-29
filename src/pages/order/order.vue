<template>
  <view class="order-container">
    <!-- 顶部标签切换 -->
    <view class="tab-section">
      <view class="tab-list">
        <view 
          v-for="(tab, index) in tabs" 
          :key="index"
          :class="['tab-item', { active: activeTab === index }]"
          @click="activeTab = index"
        >
          <text class="tab-name">{{ tab }}</text>
        </view>
      </view>
    </view>

    <!-- 订单列表 -->
    <view class="order-list">
      <!-- 空状态 -->
      <view v-if="isEmpty" class="empty-state">
        <text class="empty-icon">📦</text>
        <text class="empty-text">{{ emptyText }}</text>
      </view>
      <view 
        v-else
        v-for="(order, index) in filteredOrders" 
        :key="index"
        class="order-card"
      >
        <!-- 顶部信息行 -->
        <view class="order-header">
          <view class="location">
            <text class="location-icon">📍</text>
            <text class="location-text">{{ order.location }}</text>
          </view>
          <view class="status">
            <text :class="['status-text', order.status === '已完成' ? 'completed' : '']">
              {{ order.status }}
            </text>
          </view>
        </view>

        <!-- 菜品信息 -->
        <view class="order-items">
          <view class="item-row" v-for="(item, itemIndex) in order.items" :key="itemIndex">
            <text class="item-name">{{ item.name }}</text>
            <text class="item-count">x{{ item.count }}</text>
          </view>
        </view>

        <!-- 底部信息行 -->
        <view class="order-footer">
          <view class="order-time">
            <text class="time-text">{{ order.time }}</text>
          </view>
          <view class="order-actions">
            <view class="action-btn primary" @click="handleAction(order, 'reorder')">
              <text class="action-text">再来一单</text>
            </view>
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
      <view class="tab-item active">
        <text class="tab-icon">📦</text>
        <text class="tab-name">订单</text>
      </view>
      <view class="tab-item" @click="goToPage('/pages/user/user')">
        <text class="tab-icon">👤</text>
        <text class="tab-name">我的</text>
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
          <view class="cart-checkout">去结算</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import cartStore from '../../store/cart.js'
import { getOrderList } from '../../api/order.js'

export default {
  data() {
    return {
      activeTab: 0,
      tabs: ['全部', '今日'],
      cartList: [],
      showCart: false,
      cartPosition: { right: '30rpx', left: 'auto' },
      startX: 0,
      startY: 0,
      isDragging: false,
      orders: [],
      isEmpty: false,
      emptyText: '当前还在建设中哦~'
    }
  },
  computed: {
    filteredOrders() {
      if (this.activeTab === 0) {
        return this.orders
      } else {
        return this.orders.filter(order => order.date === '今天')
      }
    },
    cartTotalCount() {
      return cartStore.getTotalCount(this.cartList)
    },
    cartTotalPrice() {
      return cartStore.getTotalPrice(this.cartList)
    }
  },
  onShow() {
    // 页面显示时从 store 获取最新购物车数据
    this.cartList = cartStore.getCart()
    // 如果购物车为空，关闭弹窗
    if (this.cartList.length === 0) {
      this.showCart = false
    }
    // 获取订单列表
    this.loadOrders()
  },
  methods: {
    async loadOrders() {
      try {
        const result = await getOrderList('all')
        this.orders = result.map(order => ({
          location: order.storeName || '门店',
          status: this.getStatusText(order.status),
          items: order.items.map(item => ({
            name: item.name,
            count: item.quantity,
            price: item.price,
            emoji: item.emoji || '🍽️'
          })),
          time: this.formatTime(order.createTime),
          date: this.formatDate(order.createTime)
        }))
        // 检查是否有数据
        if (!result || result.length === 0) {
          this.isEmpty = true
        } else {
          this.isEmpty = false
        }
      } catch (error) {
        console.error('获取订单列表失败', error)
        this.isEmpty = true
        uni.showToast({
          title: '当前还在建设中哦~',
          icon: 'none'
        })
      }
    },
    getStatusText(status) {
      const statusMap = {
        'pending': '待付款',
        'paid': '待接单',
        'confirmed': '进行中',
        'completed': '已完成',
        'cancelled': '已取消'
      }
      return statusMap[status] || status
    },
    formatTime(dateStr) {
      if (!dateStr) return '未知时间'
      const date = new Date(dateStr)
      return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
    },
    formatDate(dateStr) {
      if (!dateStr) return '未知日期'
      const date = new Date(dateStr)
      const today = new Date()
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      
      if (date.toDateString() === today.toDateString()) {
        return '今天'
      } else if (date.toDateString() === yesterday.toDateString()) {
        return '昨天'
      } else {
        return `${date.getMonth() + 1}月${date.getDate()}日`
      }
    },
    goToPage(path) {
      uni.reLaunch({
        url: path
      })
    },
    handleAction(order, action) {
      if (action === 'reorder') {
        // 遍历订单中的所有商品，添加到购物车
        order.items.forEach(item => {
          const cartItem = {
            name: item.name,
            price: item.price,
            emoji: item.emoji
          }
          cartStore.addItemWithQuantity(cartItem, item.count)
        })
        
        // 更新本地购物车数据
        this.cartList = cartStore.getCart()
        
        uni.showToast({
          title: '已加入购物车',
          icon: 'success'
        })
      }
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
    }
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
.order-container {
  padding: 0 30rpx;
  box-sizing: border-box;
  padding-top: 20rpx;
  padding-bottom: 140rpx;
}

/* 顶部标签切换 */
.tab-section {
  margin-bottom: 30rpx;
  padding-top: 20rpx;
}

.tab-list {
  display: flex;
  background: #ffffff;
  border-radius: 24rpx;
  padding: 8rpx;
  box-shadow: 0 18rpx 50rpx rgba(255, 107, 157, 0.38), 0 9rpx 24rpx rgba(255, 107, 157, 0.19);
  border: 4rpx solid #ffd6e0;
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 20rpx 0;
  border-radius: 16rpx;
  transition: all 0.3s;
}

.tab-item.active {
  background: linear-gradient(135deg, #ff6b9d 0%, #ff8fbb 100%);
}

.tab-name {
  font-size: 28rpx;
  font-weight: 600;
}

.tab-item.active .tab-name {
  color: #ffffff;
}

.tab-item:not(.active) .tab-name {
  color: #ff80aa;
}

/* 订单列表 */
.order-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 150rpx 0;
}

.empty-icon {
  font-size: 100rpx;
  margin-bottom: 30rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #ff80aa;
}

/* 订单卡片 */
.order-card {
  background: #ffffff;
  border-radius: 24rpx;
  padding: 28rpx;
  box-shadow: 0 18rpx 50rpx rgba(255, 107, 157, 0.38), 0 9rpx 24rpx rgba(255, 107, 157, 0.19);
  border: 4rpx solid #ffd6e0;
}

/* 订单头部 */
.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
  padding-bottom: 16rpx;
  border-bottom: 2rpx dashed #ffe4ed;
}

.location {
  display: flex;
  align-items: center;
}

.location-icon {
  font-size: 28rpx;
  margin-right: 8rpx;
}

.location-text {
  font-size: 26rpx;
  color: #ff4d88;
  font-weight: 600;
}

.status-text {
  font-size: 24rpx;
  font-weight: 600;
  color: #ff80aa;
}

.status-text.completed {
  color: #66cc99;
}

/* 订单菜品 */
.order-items {
  margin-bottom: 20rpx;
}

.item-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10rpx 0;
}

.item-name {
  font-size: 26rpx;
  color: #ff4d88;
}

.item-count {
  font-size: 24rpx;
  color: #ff80aa;
}

/* 订单底部 */
.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16rpx;
  border-top: 2rpx dashed #ffe4ed;
}

.order-time {
  flex: 1;
}

.time-text {
  font-size: 24rpx;
  color: #ff80aa;
}

.order-actions {
  display: flex;
  gap: 16rpx;
}

.action-btn {
  padding: 12rpx 24rpx;
  border-radius: 20rpx;
  font-size: 24rpx;
}

.action-btn.secondary {
  background: linear-gradient(135deg, #fff0f5 0%, #ffe4ed 100%);
  border: 2rpx solid #ffd6e0;
}

.action-btn.primary {
  background: linear-gradient(135deg, #ff6b9d 0%, #ff8fbb 100%);
}

.action-text {
  font-size: 24rpx;
  font-weight: 600;
}

.action-btn.secondary .action-text {
  color: #ff4d88;
}

.action-btn.primary .action-text {
  color: #ffffff;
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

.tab-item:not(.active) .tab-name,
.tab-item:not(.active) .tab-icon {
  font-weight: 400 !important;
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
