import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/lobby/:lobbyId',
      name: 'lobby',
      component: () => import('../views/LobbyView.vue')
    },
    {
      path: '/game/:gameId',
      name: 'multiplayer_game',
      component: () => import('../views/GameView.vue')
    },
    {
      path: '/game/single',
      name: 'singleplayer_game',
      component: () => import('../views/SinglePlayerGameView.vue')
    }
  ]
})

export default router
