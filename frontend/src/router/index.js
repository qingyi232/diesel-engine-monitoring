import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', name: 'Login', component: () => import('../views/Login.vue'), meta: { title: '登录' } },
  { path: '/home', name: 'Home', component: () => import('../views/Home.vue'), meta: { title: '首页', auth: true } },
  { path: '/intro', name: 'Introduction', component: () => import('../views/Introduction.vue'), meta: { title: '基本介绍', auth: true } },
  { path: '/catalog', name: 'Catalog', component: () => import('../views/Catalog.vue'), meta: { title: '学习目录', auth: true } },
  { path: '/section/:id', name: 'Section', component: () => import('../views/Section.vue'), meta: { title: '板块详情', auth: true } },
  { path: '/quiz', name: 'Quiz', component: () => import('../views/Quiz.vue'), meta: { title: '知识测试', auth: true } },
  { path: '/result', name: 'Result', component: () => import('../views/Result.vue'), meta: { title: '测试结果', auth: true } },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  document.title = `${to.meta.title || ''} - 柴油机润滑系统教学辅助系统`
  if (to.meta.auth && !localStorage.getItem('token')) {
    next('/login')
  } else {
    next()
  }
})

export default router
