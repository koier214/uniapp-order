// 评价模块API
import { post } from '../utils/request.js'

// 提交评价
export function submitReview(rating, suggestion) {
  return post('/review/submit', {
    rating,
    suggestion
  })
}
