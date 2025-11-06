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
.login-container {
  height: 100vh;
  background: linear-gradient(135deg, #1976d2 0%, #42a5f5 50%, #90caf9 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  font-family: Vazirmatn, serif;
}

.background-shapes {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.shape {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
}

.shape-1 {
  width: 200px;
  height: 200px;
  top: -50px;
  left: -50px;
}

.shape-2 {
  width: 150px;
  height: 150px;
  bottom: 100px;
  right: -30px;
}

.shape-3 {
  width: 100px;
  height: 100px;
  top: 50%;
  left: 10%;
}

.shape-4 {
  width: 80px;
  height: 80px;
  bottom: 20%;
  right: 20%;
}

.login-content {
  z-index: 10;
  width: 100%;
  max-width: 400px;
  padding: 20px;
}

.login-card {
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.card-header {
  background: linear-gradient(135deg, #1976d2, #42a5f5);
  color: white;
  border-radius: 20px 20px 0 0;
  padding: 30px 20px;
}

.logo-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 80px;
  height: 80px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  margin: 0 auto;
}

.logo-icon {
  font-size: 40px;
  color: white;
}

.form-section {
  padding: 30px 20px 20px 20px;
}

.login-btn {
  border-radius: 10px;
  height: 50px;
  font-weight: bold;
  font-size: 16px;
  box-shadow: 0 4px 15px rgba(25, 118, 210, 0.3);
  transition: all 0.3s ease;
}

.login-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(25, 118, 210, 0.4);
}

.links-section {
  padding: 20px;
  border-top: 1px solid #e0e0e0;
}

.error-banner {
  margin: 0 20px;
  border-radius: 10px;
}

/* استایل‌های responsive */
@media (max-width: 600px) {
  .login-content {
    padding: 10px;
    max-width: 350px;
  }

  .login-card {
    border-radius: 15px;
  }

  .card-header {
    padding: 20px 15px;
  }

  .logo-container {
    width: 60px;
    height: 60px;
  }

  .logo-icon {
    font-size: 30px;
  }
}

/* انیمیشن‌ها */
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

.shape-1 {
  animation: float 6s ease-in-out infinite;
}

.shape-2 {
  animation: float 7s ease-in-out infinite;
}

.shape-3 {
  animation: float 8s ease-in-out infinite;
}

.shape-4 {
  animation: float 9s ease-in-out infinite;
}

/* استایل‌های سفارشی برای فیلدها */
:deep(.q-field--outlined .q-field__control) {
  border-radius: 10px;
  border: 2px solid #e0e0e0;
  transition: all 0.3s ease;
}

:deep(.q-field--outlined .q-field__control:hover) {
  border-color: #42a5f5;
}

:deep(.q-field--outlined.q-field--focused .q-field__control) {
  border-color: #1976d2;
  box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.1);
}

:deep(.q-field__label) {
  font-weight: 500;
  color: #666;
}

:deep(.q-field--dense .q-field__control) {
  direction: rtl;
}
</style>
