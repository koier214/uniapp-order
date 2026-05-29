<template>
  <view class="history-container">
    <!-- 自定义导航栏 -->
    <view class="custom-nav">
      <view class="nav-back" @click="goBack">
        <text class="back-icon">←</text>
      </view>
      <text class="nav-title">历史记录</text>
      <view class="nav-placeholder"></view>
    </view>

    <!-- 记录列表 -->
    <view class="record-list">
      <view class="record-item" v-for="(item, index) in recordList" :key="index">
        <view class="record-header">
          <text class="record-date">{{ item.date }}</text>
          <text class="record-status" :class="item.status">{{ item.statusText }}</text>
        </view>
        <view class="record-content">
          <view class="food-item" v-for="(food, fIndex) in item.foods" :key="fIndex">
            <text class="food-icon">{{ food.icon }}</text>
            <text class="food-name">{{ food.name }}</text>
            <text class="food-count">x{{ food.count }}</text>
          </view>
        </view>
        <view class="record-footer">
          <text class="record-time">{{ item.time }}</text>
          <text class="record-total">合计 ¥{{ item.total }}</text>
        </view>
      </view>
    </view>

    <!-- 空状态 -->
    <view class="empty-state" v-if="recordList.length === 0">
      <text class="empty-icon">📋</text>
      <text class="empty-text">暂无点餐记录</text>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      recordList: [
        {
          date: '今天',
          time: '12:30',
          status: 'completed',
          statusText: '已完成',
          foods: [
            { icon: '🍲', name: '招牌牛肉锅', count: 1 },
            { icon: '🍛', name: '咖喱鸡肉饭', count: 1 }
          ],
          total: 106
        },
        {
          date: '昨天',
          time: '18:45',
          status: 'completed',
          statusText: '已完成',
          foods: [
            { icon: '🥟', name: '手工饺子', count: 1 },
            { icon: '🍮', name: '草莓布丁', count: 2 },
            { icon: '🧋', name: '珍珠奶茶', count: 1 }
          ],
          total: 88
        },
        {
          date: '5月21日',
          time: '19:20',
          status: 'completed',
          statusText: '已完成',
          foods: [
            { icon: '🍖', name: '红烧排骨', count: 1 },
            { icon: '🥘', name: '宫保鸡丁', count: 1 }
          ],
          total: 98
        },
        {
          date: '5月20日',
          time: '12:15',
          status: 'completed',
          statusText: '已完成',
          foods: [
            { icon: '🍚', name: '蛋炒饭', count: 2 },
            { icon: '🍜', name: '牛肉面', count: 1 }
          ],
          total: 82
        }
      ]
    }
  },
  methods: {
    goBack() {
      uni.navigateBack()
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
.history-container {
  padding: 0 30rpx;
  box-sizing: border-box;
  padding-bottom: 40rpx;
}

/* 自定义导航栏 */
.custom-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 0;
  padding-top: 40rpx;
  margin-bottom: 20rpx;
}

.nav-back {
  width: 80rpx;
  height: 80rpx;
  background: #ffffff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 20rpx rgba(255, 107, 157, 0.3);
  border: 3rpx solid #ffd6e0;
}

.back-icon {
  font-size: 36rpx;
  color: #ff6b9d;
  font-weight: 700;
}

.nav-title {
  font-size: 32rpx;
  font-weight: 700;
  color: #ff4d88;
}

.nav-placeholder {
  width: 80rpx;
}

/* 记录列表 */
.record-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.record-item {
  background: #ffffff;
  border-radius: 24rpx;
  padding: 28rpx;
  box-shadow: 0 18rpx 50rpx rgba(255, 107, 157, 0.38), 0 9rpx 24rpx rgba(255, 107, 157, 0.19);
  border: 4rpx solid #ffd6e0;
}

.record-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
  padding-bottom: 16rpx;
  border-bottom: 2rpx dashed #ffe4ed;
}

.record-date {
  font-size: 26rpx;
  font-weight: 700;
  color: #ff4d88;
}

.record-status {
  font-size: 22rpx;
  font-weight: 600;
  padding: 6rpx 16rpx;
  border-radius: 16rpx;
}

.record-status.completed {
  background: linear-gradient(135deg, #6dd5ed 0%, #2193b0 100%);
  color: #ffffff;
}

.record-content {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  margin-bottom: 20rpx;
}

.food-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(135deg, #fff0f5 0%, #ffe4ed 100%);
  border-radius: 16rpx;
  padding: 16rpx 20rpx;
  border: 2rpx solid #ffd6e0;
}

.food-icon {
  font-size: 36rpx;
  margin-right: 16rpx;
}

.food-name {
  flex: 1;
  font-size: 24rpx;
  color: #ff4d88;
  font-weight: 600;
}

.food-count {
  font-size: 24rpx;
  color: #ff80aa;
  font-weight: 600;
}

.record-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16rpx;
  border-top: 2rpx dashed #ffe4ed;
}

.record-time {
  font-size: 22rpx;
  color: #ff99bb;
}

.record-total {
  font-size: 26rpx;
  font-weight: 700;
  color: #ff4d88;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 0;
}

.empty-icon {
  font-size: 100rpx;
  margin-bottom: 24rpx;
}

.empty-text {
  font-size: 26rpx;
  color: #ff99bb;
}
</style>
