import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

//  1. 引入 Pinia 的创建方法
import { createPinia } from 'pinia'

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import './permission'
import './style.css'

const app = createApp(App)

//  2. 实例化 Pinia 
const pinia = createPinia()

app.use(router)
app.use(pinia) //  3. 挂载 Pinia
app.use(ElementPlus)

app.mount('#app')