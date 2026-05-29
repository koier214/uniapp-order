<template>
  <view class="stats-container">
    <!-- 自定义导航栏 -->
    <view class="custom-nav">
      <view class="nav-back" @click="goBack">
        <text class="back-icon">←</text>
      </view>
      <text class="nav-title">饮食分析</text>
      <view class="nav-placeholder"></view>
    </view>

    <!-- 近一个月热量统计 -->
    <view class="chart-section">
      <view class="section-title">
        <text class="title-icon">📊</text>
        <text class="title-text">近一个月热量摄入</text>
      </view>
      <view class="chart-box">
        <!-- 折线图 -->
        <view class="line-chart">
          <!-- Y轴 -->
          <view class="y-axis">
            <text class="y-label">1000</text>
            <text class="y-label">750</text>
            <text class="y-label">500</text>
            <text class="y-label">250</text>
            <text class="y-label">0</text>
          </view>
          <!-- 图表区域 -->
          <view class="chart-area">
            <!-- 网格线 -->
            <view class="grid-line" v-for="i in 4" :key="i"></view>
            <!-- 折线 -->
            <view class="line-path">
              <view class="line-point" v-for="(point, index) in calorieData" :key="index" 
                :style="{ left: point.x + '%', bottom: point.y + '%' }"></view>
            </view>
            <!-- 面积填充 -->
            <view class="area-fill"></view>
            <!-- X轴标签 -->
            <view class="x-labels">
              <text class="x-label" v-for="(label, index) in xLabels" :key="index">{{ label }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 用餐时间分布 -->
    <view class="chart-section">
      <view class="section-title">
        <text class="title-icon">🕐</text>
        <text class="title-text">用餐时间分布</text>
      </view>
      <view class="chart-box">
        <!-- 扇形图 -->
        <view class="pie-chart">
          <view class="pie-circle">
            <!-- 扇形区域 -->
            <view class="pie-segment segment-1"></view>
            <view class="pie-segment segment-2"></view>
            <view class="pie-segment segment-3"></view>
            <view class="pie-segment segment-4"></view>
            <!-- 中心圆 -->
            <view class="pie-center"></view>
          </view>
          <!-- 图例 -->
          <view class="pie-legend">
            <view class="legend-item" v-for="(item, index) in timeData" :key="index">
              <view class="legend-dot" :style="{ backgroundColor: item.color }"></view>
              <text class="legend-text">{{ item.name }}</text>
              <text class="legend-count">{{ item.count }}次</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 统计卡片 -->
    <view class="stats-cards">
      <view class="stat-card">
        <text class="stat-icon">🔥</text>
        <text class="stat-value">{{ totalCalorie.toLocaleString() }}</text>
        <text class="stat-label">总热量 (kcal)</text>
      </view>
      <view class="stat-card">
        <text class="stat-icon">🍽️</text>
        <text class="stat-value">{{ mealCount }}</text>
        <text class="stat-label">用餐次数</text>
      </view>
      <view class="stat-card">
        <text class="stat-icon">📈</text>
        <text class="stat-value">{{ avgCalorie }}</text>
        <text class="stat-label">日均热量</text>
      </view>
    </view>
  </view>
</template>

<script>
import { getAnalysis } from '../../api/stats.js'

export default {
  data() {
    return {
      xLabels: ['5/1', '5/5', '5/10', '5/15', '5/20', '5/23'],
      calorieData: [
        { x: 0, y: 58 },
        { x: 20, y: 72 },
        { x: 40, y: 65 },
        { x: 60, y: 89 },
        { x: 80, y: 78 },
        { x: 100, y: 74 }
      ],
      timeData: [
        { name: '早餐 (7-9点)', count: 10, color: '#ff9f7f' },
        { name: '午餐 (11-13点)', count: 12, color: '#ff6b9d' },
        { name: '下午茶 (14-16点)', count: 8, color: '#ffd6e0' },
        { name: '晚餐 (17-19点)', count: 12, color: '#ff8fbb' }
      ],
      totalCalorie: 21860,
      mealCount: 42,
      avgCalorie: 740
    }
  },
  onShow() {
    this.loadAnalysis()
  },
  methods: {
    async loadAnalysis() {
      try {
        const result = await getAnalysis()
        
        // 更新图表数据
        if (result.calorieData) {
          this.calorieData = result.calorieData
        }
        if (result.timeData) {
          this.timeData = result.timeData
        }
        if (result.xLabels) {
          this.xLabels = result.xLabels
        }
        
        // 更新统计数据
        this.totalCalorie = result.totalCalorie || 0
        this.mealCount = result.mealCount || 0
        this.avgCalorie = result.avgCalorie || 0
      } catch (error) {
        console.error('获取统计分析数据失败', error)
        uni.showToast({
          title: '当前还在建设中哦~',
          icon: 'none'
        })
      }
    },
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
.stats-container {
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

/* 图表区域 */
.chart-section {
  margin-bottom: 30rpx;
}

.section-title {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
  padding-left: 10rpx;
}

.title-icon {
  font-size: 36rpx;
  margin-right: 12rpx;
}

.title-text {
  font-size: 28rpx;
  font-weight: 700;
  color: #ff4d88;
}

.chart-box {
  background: #ffffff;
  border-radius: 24rpx;
  padding: 30rpx 20rpx;
  box-shadow: 0 18rpx 50rpx rgba(255, 107, 157, 0.38), 0 9rpx 24rpx rgba(255, 107, 157, 0.19);
  border: 4rpx solid #ffd6e0;
}

/* 折线图 */
.line-chart {
  display: flex;
  height: 350rpx;
  position: relative;
}

.y-axis {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 10rpx 0;
  width: 70rpx;
}

.y-label {
  font-size: 18rpx;
  color: #ff80aa;
  text-align: right;
}

.chart-area {
  flex: 1;
  position: relative;
  margin-left: 10rpx;
}

.grid-line {
  position: absolute;
  left: 0;
  right: 0;
  height: 2rpx;
  background: #ffe4ed;
}

.grid-line:nth-child(1) { top: 20%; }
.grid-line:nth-child(2) { top: 40%; }
.grid-line:nth-child(3) { top: 60%; }
.grid-line:nth-child(4) { top: 80%; }

.line-path {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 50rpx;
  background: linear-gradient(90deg, 
    rgba(255, 107, 157, 0.4) 0%,
    rgba(255, 143, 187, 0.4) 20%,
    rgba(255, 107, 157, 0.4) 40%,
    rgba(255, 143, 187, 0.4) 60%,
    rgba(255, 107, 157, 0.4) 80%,
    rgba(255, 143, 187, 0.4) 100%
  );
  clip-path: polygon(
    0% 42%, 
    20% 28%, 
    40% 35%, 
    60% 11%, 
    80% 22%, 
    100% 26%, 
    100% 100%, 
    0% 100%
  );
}

.line-point {
  position: absolute;
  width: 20rpx;
  height: 20rpx;
  background: #ff6b9d;
  border-radius: 50%;
  border: 4rpx solid #ffffff;
  box-shadow: 0 4rpx 8rpx rgba(255, 107, 157, 0.4);
  transform: translate(-50%, 50%);
}

.area-fill {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 50rpx;
  background: linear-gradient(to bottom, 
    rgba(255, 107, 157, 0.2) 0%, 
    rgba(255, 107, 157, 0.05) 100%
  );
  clip-path: polygon(
    0% 42%, 
    20% 28%, 
    40% 35%, 
    60% 11%, 
    80% 22%, 
    100% 26%, 
    100% 100%, 
    0% 100%
  );
}

.x-labels {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
}

.x-label {
  font-size: 18rpx;
  color: #ff80aa;
}

/* 扇形图 */
.pie-chart {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.pie-circle {
  width: 280rpx;
  height: 280rpx;
  border-radius: 50%;
  position: relative;
  overflow: hidden;
  margin-bottom: 30rpx;
}

.pie-segment {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.segment-1 {
  background: conic-gradient(
    #ff9f7f 0% 23.8%,
    transparent 23.8% 100%
  );
}

.segment-2 {
  background: conic-gradient(
    transparent 0% 23.8%,
    #ff6b9d 23.8% 52.4%,
    transparent 52.4% 100%
  );
}

.segment-3 {
  background: conic-gradient(
    transparent 0% 52.4%,
    #ffd6e0 52.4% 71.4%,
    transparent 71.4% 100%
  );
}

.segment-4 {
  background: conic-gradient(
    transparent 0% 71.4%,
    #ff8fbb 71.4% 100%
  );
}

.pie-center {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 140rpx;
  height: 140rpx;
  background: #ffffff;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  border: 4rpx solid #ffd6e0;
}

.pie-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
  justify-content: center;
}

.legend-item {
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, #fff0f5 0%, #ffe4ed 100%);
  border-radius: 16rpx;
  padding: 12rpx 20rpx;
  border: 2rpx solid #ffd6e0;
}

.legend-dot {
  width: 20rpx;
  height: 20rpx;
  border-radius: 50%;
  margin-right: 10rpx;
}

.legend-text {
  font-size: 20rpx;
  color: #ff4d88;
  margin-right: 10rpx;
}

.legend-count {
  font-size: 20rpx;
  color: #ff80aa;
  font-weight: 600;
}

/* 统计卡片 */
.stats-cards {
  display: flex;
  gap: 20rpx;
  margin-top: 10rpx;
}

.stat-card {
  flex: 1;
  background: #ffffff;
  border-radius: 20rpx;
  padding: 30rpx 20rpx;
  box-shadow: 0 18rpx 50rpx rgba(255, 107, 157, 0.38), 0 9rpx 24rpx rgba(255, 107, 157, 0.19);
  border: 4rpx solid #ffd6e0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-icon {
  font-size: 48rpx;
  margin-bottom: 12rpx;
}

.stat-value {
  font-size: 32rpx;
  font-weight: 700;
  color: #ff4d88;
  margin-bottom: 8rpx;
}

.stat-label {
  font-size: 20rpx;
  color: #ff80aa;
}
</style>
