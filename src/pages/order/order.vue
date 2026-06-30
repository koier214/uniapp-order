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

    <!-- 购物车组件 -->
    <CartPopup ref="cartPopup" />
  </view>
</template>

<script>
import cartStore from '../../store/cart.js'
import { getOrderList } from '../../api/order.js'
import CartPopup from '@/components/CartPopup.vue'

export default {
  data() {
    return {
      activeTab: 0,
      tabs: ['全部', '今日'],
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
    }
  },
  onShow() {
    // 刷新购物车数据
    this.$refs.cartPopup?.refreshCart()
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
        
        // 刷新购物车数据
        this.$refs.cartPopup?.refreshCart()
        
        uni.showToast({
          title: '已加入购物车',
          icon: 'success'
        })
      }
    }
  },
  components: {
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
</style>
