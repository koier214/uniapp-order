<template>
  <view>
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
      <view class="cart-popup">
        <view class="cart-header">
          <text class="cart-title">购物车</text>
          <view class="cart-clear" @click.stop="clearCart">清空</view>
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
              <view class="quantity-minus" @click.stop="decreaseItem(index)">-</view>
              <text class="quantity-num">{{ item.quantity }}</text>
              <view class="quantity-plus" @click.stop="increaseItem(index)">+</view>
            </view>
          </view>
        </scroll-view>
        <view class="cart-footer">
          <text class="cart-total">合计：¥{{ cartTotalPrice }}</text>
          <view class="cart-checkout" @click.stop="goToCheckout">结算</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import cartStore from '../store/cart.js'

export default {
  name: 'CartPopup',
  data() {
    return {
      cartList: [],
      showCart: false,
      cartPosition: { right: '30rpx', left: 'auto' },
      startX: 0,
      startY: 0,
      isDragging: false
    }
  },
  computed: {
    cartTotalCount() {
      return cartStore.getTotalCount(this.cartList)
    },
    cartTotalPrice() {
      return cartStore.getTotalPrice(this.cartList)
    }
  },
  // 组件创建时自动加载购物车数据
  created() {
    this.refreshCart()
  },
  methods: {
    // 刷新购物车数据（供父组件调用）
    refreshCart() {
      this.cartList = cartStore.getCart()
      if (this.cartList.length === 0) {
        this.showCart = false
      }
    },
    
    toggleCart() {
      this.showCart = !this.showCart
    },
    
    clearCart() {
      this.cartList = cartStore.clearCart()
      this.showCart = false
    },
    
    decreaseItem(index) {
      this.cartList = cartStore.decreaseItem(index)
      if (this.cartList.length === 0) {
        this.showCart = false
      }
    },
    
    increaseItem(index) {
      this.cartList = cartStore.increaseItem(index)
    },
    
    goToCheckout() {
      console.log('[DEBUG] goToCheckout 被调用')
      
      if (this.cartList.length === 0) {
        uni.showToast({
          title: '购物车是空的',
          icon: 'none'
        })
        return
      }
      
      this.showCart = false
      
      uni.navigateTo({
        url: '/pages/checkout/checkout',
        success: () => {
          console.log('[DEBUG] 跳转结算页面成功')
        },
        fail: (err) => {
          console.error('[DEBUG] 跳转结算页面失败:', err)
          uni.showToast({
            title: '跳转失败',
            icon: 'none'
          })
        }
      })
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

<style scoped>
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