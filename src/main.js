import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import 'font-awesome/css/font-awesome.min.css'

createApp(App)
	.use(router)
	.mount('#app')
