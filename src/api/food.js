// 菜品模块API
import { get, post } from '../utils/request.js'

// 获取分类列表
export function getCategories() {
  return get('/food/categories')
}

// 获取菜品列表（按分类）
export function getFoodList(categoryId) {
  return get('/food/list', { categoryId })
}

// 获取热门菜品
export function getHotFoods() {
  return get('/food/hot')
}

// 获取菜品详情
export function getFoodDetail(foodId) {
  return get(`/food/detail/${foodId}`)
}

// 初始化菜品数据
export function initFoodData() {
  return post('/food/init')
}
