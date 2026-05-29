// 统计分析模块API
import { get } from '../utils/request.js'

// 获取饮食分析
export function getAnalysis() {
  return get('/stats/analysis')
}

// 获取历史记录
export function getHistory(page = 1, pageSize = 20) {
  return get('/stats/history', {
    page,
    pageSize
  })
}
