<!-- UserSettings.vue -->
<template>
  <q-page class="user-settings-page" padding>
    <q-card class="main-card">
      <!-- هدر کارت -->
      <q-card-section class="card-header">
        <div class="header-content">
          <q-icon name="settings" class="header-icon" />
          <div class="header-text">
            <div class="text-h5">تنظیمات کاربری</div>
            <div class="text-subtitle">مدیریت اطلاعات حساب کاربری و تغییر رمز عبور</div>
          </div>
        </div>
      </q-card-section>

      <q-separator />

      <q-card-section class="content-section">
        <!-- تب‌های تنظیمات -->
        <q-tabs
          v-model="activeTab"
          dense
          class="text-grey"
          active-color="primary"
          indicator-color="primary"
          align="justify"
          narrow-indicator
        >
          <q-tab name="profile" icon="person" label="پروفایل کاربری" />
          <q-tab name="password" icon="lock" label="تغییر رمز عبور" />
        </q-tabs>

        <q-separator />

        <q-tab-panels v-model="activeTab" animated class="q-mt-md">
          <!-- تب پروفایل کاربری -->
          <q-tab-panel name="profile">
            <div class="text-h6 q-mb-md">ویرایش اطلاعات کاربری</div>

            <!-- پیام موفقیت -->
            <q-banner
              v-if="successMessage"
              class="bg-positive text-white q-mb-md"
              rounded
              dense
            >
              <template v-slot:avatar>
                <q-icon name="check_circle" />
              </template>
              {{ successMessage }}
            </q-banner>

            <!-- پیام خطا -->
            <q-banner
              v-if="errorMessage"
              class="error-banner q-mb-md"
              rounded
              dense
            >
              <template v-slot:avatar>
                <q-icon name="error" />
              </template>
              {{ errorMessage }}
            </q-banner>

            <div class="row q-col-gutter-md">
              <div class="col-6">
                <q-input
                  v-model="profileForm.fname"
                  label="نام"
                  outlined
                  dense
                  class="form-field"
                  :input-style="{ textAlign: 'right', direction: 'rtl' }"
                >
                  <template v-slot:prepend>
                    <q-icon name="person" class="field-icon" />
                  </template>
                </q-input>
              </div>
              <div class="col-6">
                <q-input
                  v-model="profileForm.lname"
                  label="نام خانوادگی"
                  outlined
                  dense
                  class="form-field"
                  :input-style="{ textAlign: 'right', direction: 'rtl' }"
                >
                  <template v-slot:prepend>
                    <q-icon name="people" class="field-icon" />
                  </template>
                </q-input>
              </div>
            </div>

            <q-input
              v-model="profileForm.username"
              label="نام کاربری"
              outlined
              dense
              class="form-field"
              :input-style="{ textAlign: 'right', direction: 'rtl' }"
            >
              <template v-slot:prepend>
                <q-icon name="badge" class="field-icon" />
              </template>
            </q-input>

            <div class="row q-col-gutter-md">
              <div class="col-6">
                <q-input
                  v-model="profileForm.phone"
                  label="تلفن"
                  outlined
                  dense
                  class="form-field"
                  :input-style="{ textAlign: 'right', direction: 'rtl' }"
                >
                  <template v-slot:prepend>
                    <q-icon name="phone" class="field-icon" />
                  </template>
                </q-input>
              </div>
              <div class="col-6">
                <q-input
                  v-model="profileForm.email"
                  label="ایمیل"
                  type="email"
                  outlined
                  dense
                  class="form-field"
                  :input-style="{ textAlign: 'right', direction: 'rtl' }"
                >
                  <template v-slot:prepend>
                    <q-icon name="email" class="field-icon" />
                  </template>
                </q-input>
              </div>
            </div>

            <!-- اطلاعات فقط خواندنی -->
            <div class="row q-col-gutter-md">
              <div class="col-6">
                <q-input
                  :value="userInfo.role_name"
                  label="نقش کاربری"
                  outlined
                  dense
                  readonly
                  class="form-field"
                >
                  <template v-slot:prepend>
                    <q-icon name="admin_panel_settings" class="field-icon" />
                  </template>
                </q-input>
              </div>
              <div class="col-6">
                <q-input
                  :value="userInfo.city_name"
                  label="حوزه قضایی"
                  outlined
                  dense
                  readonly
                  class="form-field"
                >
                  <template v-slot:prepend>
                    <q-icon name="location_city" class="field-icon" />
                  </template>
                </q-input>
              </div>
            </div>

            <div class="row justify-center q-mt-lg">
              <q-btn
                label="بروزرسانی پروفایل"
                color="primary"
                @click="updateProfile"
                class="submit-btn"
                :loading="loading"
                icon="save"
              />
            </div>
          </q-tab-panel>

          <!-- تب تغییر رمز عبور -->
          <q-tab-panel name="password">
            <div class="text-h6 q-mb-md">تغییر رمز عبور</div>

            <!-- پیام موفقیت -->
            <q-banner
              v-if="passwordSuccess"
              class="bg-positive text-white q-mb-md"
              rounded
              dense
            >
              <template v-slot:avatar>
                <q-icon name="check_circle" />
              </template>
              {{ passwordSuccess }}
            </q-banner>

            <!-- پیام خطا -->
            <q-banner
              v-if="passwordError"
              class="error-banner q-mb-md"
              rounded
              dense
            >
              <template v-slot:avatar>
                <q-icon name="error" />
              </template>
              {{ passwordError }}
            </q-banner>

            <div class="row q-col-gutter-md">
              <div class="col-12">
                <q-input
                  v-model="passwordForm.current_password"
                  :type="showCurrentPassword ? 'text' : 'password'"
                  label="رمز عبور فعلی"
                  outlined
                  dense
                  class="form-field"
                  :input-style="{ textAlign: 'right', direction: 'rtl' }"
                >
                  <template v-slot:prepend>
                    <q-icon name="lock" class="field-icon" />
                  </template>
                  <template v-slot:append>
                    <q-icon
                      :name="showCurrentPassword ? 'visibility_off' : 'visibility'"
                      class="cursor-pointer"
                      @click="showCurrentPassword = !showCurrentPassword"
                    />
                  </template>
                </q-input>
              </div>
            </div>

            <div class="row q-col-gutter-md">
              <div class="col-6">
                <q-input
                  v-model="passwordForm.new_password"
                  :type="showNewPassword ? 'text' : 'password'"
                  label="رمز عبور جدید"
                  outlined
                  dense
                  class="form-field"
                  :input-style="{ textAlign: 'right', direction: 'rtl' }"
                >
                  <template v-slot:prepend>
                    <q-icon name="lock_reset" class="field-icon" />
                  </template>
                  <template v-slot:append>
                    <q-icon
                      :name="showNewPassword ? 'visibility_off' : 'visibility'"
                      class="cursor-pointer"
                      @click="showNewPassword = !showNewPassword"
                    />
                  </template>
                </q-input>
              </div>
              <div class="col-6">
                <q-input
                  v-model="passwordForm.new_password_confirmation"
                  :type="showConfirmPassword ? 'text' : 'password'"
                  label="تکرار رمز عبور جدید"
                  outlined
                  dense
                  class="form-field"
                  :input-style="{ textAlign: 'right', direction: 'rtl' }"
                >
                  <template v-slot:prepend>
                    <q-icon name="lock_reset" class="field-icon" />
                  </template>
                  <template v-slot:append>
                    <q-icon
                      :name="showConfirmPassword ? 'visibility_off' : 'visibility'"
                      class="cursor-pointer"
                      @click="showConfirmPassword = !showConfirmPassword"
                    />
                  </template>
                </q-input>
              </div>
            </div>

            <div class="row justify-center q-mt-lg">
              <q-btn
                label="تغییر رمز عبور"
                color="primary"
                @click="changePassword"
                class="submit-btn"
                :loading="passwordLoading"
                icon="lock"
              />
            </div>
          </q-tab-panel>
        </q-tab-panels>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import { api } from 'boot/axios'

const activeTab = ref('profile')
const loading = ref(false)
const passwordLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const passwordError = ref('')
const passwordSuccess = ref('')

const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)

const userInfo = ref({
  role_name: '',
  city_name: ''
})

const profileForm = reactive({
  fname: '',
  lname: '',
  username: '',
  phone: '',
  email: ''
})

const passwordForm = reactive({
  current_password: '',
  new_password: '',
  new_password_confirmation: ''
})

// بارگذاری اطلاعات کاربر
async function loadUserProfile() {
  try {
    const res = await api.get('/user/profile')
    const user = res.data

    // پر کردن فرم پروفایل
    profileForm.fname = user.fname
    profileForm.lname = user.lname
    profileForm.username = user.username
    profileForm.phone = user.phone || ''
    profileForm.email = user.email || ''

    // ذخیره اطلاعات کاربر
    userInfo.value.role_name = user.role?.name || 'نامشخص'
    userInfo.value.city_name = user.city?.name || 'نامشخص'

    // بروزرسانی اطلاعات در localStorage
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}')
    storedUser.fname = user.fname
    storedUser.lname = user.lname
    storedUser.username = user.username
    localStorage.setItem('user', JSON.stringify(storedUser))

  } catch (err) {
    errorMessage.value = 'خطا در دریافت اطلاعات کاربر'
    console.error('Error loading user profile:', err)
  }
}

// بروزرسانی پروفایل
async function updateProfile() {
  if (!profileForm.fname || !profileForm.lname || !profileForm.username) {
    errorMessage.value = 'لطفاً فیلدهای ضروری (نام، نام خانوادگی و نام کاربری) را پر کنید'
    return
  }

  loading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const res = await api.put('/user/profile', profileForm)
    successMessage.value = res.data.message

    // بروزرسانی اطلاعات در localStorage
    await loadUserProfile()

    // پاک کردن پیام موفقیت بعد از 3 ثانیه
    setTimeout(() => {
      successMessage.value = ''
    }, 3000)

  } catch (err) {
    console.error('Error updating profile:', err)
    if (err.response?.status === 422 && err.response.data.errors) {
      errorMessage.value = Object.values(err.response.data.errors).flat().join('، ')
    } else {
      errorMessage.value = err.response?.data?.message || 'خطا در بروزرسانی پروفایل'
    }
  } finally {
    loading.value = false
  }
}

// تغییر رمز عبور
async function changePassword() {
  if (!passwordForm.current_password || !passwordForm.new_password || !passwordForm.new_password_confirmation) {
    passwordError.value = 'لطفاً تمام فیلدهای مربوط به رمز عبور را پر کنید'
    return
  }

  if (passwordForm.new_password !== passwordForm.new_password_confirmation) {
    passwordError.value = 'رمز عبور جدید و تکرار آن مطابقت ندارند'
    return
  }

  if (passwordForm.new_password.length < 6) {
    passwordError.value = 'رمز عبور جدید باید حداقل 6 کاراکتر باشد'
    return
  }

  passwordLoading.value = true
  passwordError.value = ''
  passwordSuccess.value = ''

  try {
    const res = await api.put('/user/change-password', passwordForm)
    passwordSuccess.value = res.data.message

    // پاک کردن فرم
    passwordForm.current_password = ''
    passwordForm.new_password = ''
    passwordForm.new_password_confirmation = ''

    // پاک کردن پیام موفقیت بعد از 3 ثانیه
    setTimeout(() => {
      passwordSuccess.value = ''
    }, 3000)

  } catch (err) {
    console.error('Error changing password:', err)
    if (err.response?.status === 422 && err.response.data.errors) {
      passwordError.value = Object.values(err.response.data.errors).flat().join('، ')
    } else {
      passwordError.value = err.response?.data?.message || 'خطا در تغییر رمز عبور'
    }
  } finally {
    passwordLoading.value = false
  }
}

onMounted(() => {
  loadUserProfile()
})
</script>

<style scoped>
/* فقط استایل‌های خاص این کامپوننت که در فایل global نیستند */
</style>
