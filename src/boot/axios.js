// src/boot/axios.js
import { boot } from 'quasar/wrappers'
import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

// فقط یک‌بار CSRF بگیریم، نه در هر درخواست
let csrfInitialized = false

api.interceptors.request.use(async (config) => {
  // اگر هنوز csrf نگرفتیم و درخواست login/register نیست
  if (!csrfInitialized && !['/login', '/register'].includes(config.url)) {
    await axios.get('http://localhost:8000/sanctum/csrf-cookie', {
      withCredentials: true,
    })
    csrfInitialized = true
  }

  // اگر توکن در localStorage هست، در همه درخواست‌ها بفرست
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

export default boot(({ app }) => {
  app.config.globalProperties.$axios = axios
  app.config.globalProperties.$api = api
})

export { axios, api }
