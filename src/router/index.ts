import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'layout',
      component: () => import('../Layout.vue'),
      children: [
        {
          path: '',
          name: 'home',
          component: () => import('../views/Home.vue'),
          meta: { title: '首页' },
        },
      ],
    },
    {
      path: '/window/',
      name: 'window',
      component: () => import('../Window.vue'),
      children: [
        {
          path: 'test',
          name: 'win-test',
          component: () => import('../views/Test.vue'),
          meta: { title: '测试' },
        },
      ],
    },
  ],
})

export default router
