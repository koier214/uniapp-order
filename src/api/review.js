// 评价模块API
import { put } from '../utils/request.js'

// 提交/更新评价（覆盖之前的评分）
export function submitReview(rating, suggestion) {
  return put('/review/submit', {
    rating,
    suggestion
  })
}
