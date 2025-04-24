import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('pages/HomePage.vue')
      },
      {
        path: 'contracts',
        component: () => import('pages/ContractsPage.vue')
      },
      {
        path: 'rent',
        component: () => import('pages/RentPage.vue')
      },
      {
        path: 'properties',
        component: () => import('pages/PropertyPage.vue')
      },
      {
        path: 'settings',
        component: () => import('pages/SettingsPage.vue')
      }
    ],
  },

  // Always leave this as last one
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;


