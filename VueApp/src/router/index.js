import component from 'element-plus/es/components/tree-select/src/tree-select-option.mjs'
import { createRouter, createWebHistory } from 'vue-router'
import Main from '../views/Main.vue'

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: "/", 
            name: "home",
            component: Main
        }
    ]
})

export default router
