<template>
  <div class="login-container">
    <div class="background-shapes">
      <div class="shape shape-1"></div>
      <div class="shape shape-2"></div>
      <div class="shape shape-3"></div>
      <div class="shape shape-4"></div>
    </div>

    <div class="login-content">
      <q-card class="login-card">
        <!-- هدر کارت -->
        <q-card-section class="card-header text-center">
          <div class="logo-container">
            <q-icon name="computer" class="logo-icon" />
          </div>
          <div class="text-h5 text-weight-bold q-mt-md">سامانه مدیریت تجهیزات</div>
          <div class="text-subtitle1 text-white-7">ورود به پنل کاربری</div>
        </q-card-section>

        <!-- پیام خطا -->
        <q-banner
          v-if="errorMessage"
          class="bg-red text-white q-mb-md error-banner"
          rounded
          dense
        >
          <template v-slot:avatar>
            <q-icon name="error" />
          </template>
          {{ errorMessage }}
        </q-banner>

        <!-- فرم ورود -->
        <q-card-section class="form-section">
          <q-input
            v-model="username"
            label="نام کاربری"
            outlined
            dense
            class="q-mb-md"
            :input-style="{ textAlign: 'right', direction: 'rtl' }"
          >
            <template v-slot:prepend>
              <q-icon name="person" class="text-blue-6" />
            </template>
          </q-input>

          <q-input
            v-model="password"
            type="password"
            label="کلمه عبور"
            outlined
            dense
            :input-style="{ textAlign: 'right', direction: 'rtl' }"
          >
            <template v-slot:prepend>
              <q-icon name="lock" class="text-blue-6" />
            </template>
          </q-input>
        </q-card-section>

        <!-- دکمه ورود -->
        <q-card-actions class="q-px-lg">
          <q-btn
            color="primary"
            label="ورود به سیستم"
            @click="login"
            class="full-width login-btn"
            size="lg"
            :loading="loading"
          />
        </q-card-actions>

        <!-- لینک‌های پایین -->
        <q-card-section class="text-center links-section">
          <div class="row justify-center q-gutter-xl">
            <q-btn
              flat
              dense
              color="blue-7"
              label="فراموشی گذرواژه"
              @click="goToForgotPassword"
              icon="vpn_key"
            />
            <q-btn
              flat
              dense
              color="blue-7"
              label="ورود با موبایل"
              @click="goToLoginWithPhone"
              icon="phone_iphone"
            />
          </div>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { api } from 'boot/axios'

const router = useRouter()
const username = ref('')
const password = ref('')
const errorMessage = ref('')
const loading = ref(false)

const login = async () => {
  errorMessage.value = ''
  loading.value = true

  // اعتبارسنجی سمت کلاینت
  if (!username.value || !password.value) {
    errorMessage.value = 'لطفاً نام کاربری و رمز عبور را وارد کنید'
    loading.value = false
    return
  }

  try {
    // فقط یک بار csrf بگیریم
    await api.get('/sanctum/csrf-cookie')

    const res = await api.post('/login', {
      username: username.value,
      password: password.value,
    })

    // ذخیره توکن و کاربر
    localStorage.setItem('user', JSON.stringify(res.data.user))
    localStorage.setItem('token', res.data.token)

    // تنظیم هدر Authorization برای axios
    api.defaults.headers.Authorization = `Bearer ${res.data.token}`

    // بررسی اگر از صفحه خاصی به login آمده بودیم، به همان صفحه برگردیم
    const redirectPath = router.currentRoute.value.query.redirect || '/dashboard'
    router.push(redirectPath)
  } catch (err) {
    console.error('خطای لاگین:', err)

    if (err.response && err.response.data) {
      if (err.response.data.errors) {
        const firstError = Object.values(err.response.data.errors)[0][0]
        errorMessage.value = firstError
      } else if (err.response.data.message) {
        errorMessage.value = err.response.data.message
      } else {
        errorMessage.value = 'خطا در ارتباط با سرور'
      }
    } else {
      errorMessage.value = 'خطا در ارتباط با سرور'
    }
  } finally {
    loading.value = false
  }
}

const goToForgotPassword = () => {
  router.push('/forgot-password')
}

const goToLoginWithPhone = () => {
  router.push('/login-phone')
}
</script>
<style scoped>
/* فقط استایل‌های خاص این کامپوننت که در فایل global نیستند */
</style>
