<template>
  <q-page class="users-page" padding>
    <q-card class="main-card">
      <!-- هدر کارت -->
      <q-card-section class="card-header">
        <div class="header-content">
          <q-icon name="admin_panel_settings" class="header-icon" />
          <div class="header-text">
            <div class="text-h5">مدیریت کاربران سیستم</div>
            <div class="text-subtitle">مدیریت و ویرایش اطلاعات کاربران سیستم</div>
          </div>
        </div>
      </q-card-section>

      <q-separator />

      <q-card-section class="content-section">
        <!-- بخش اقدامات و جستجو -->
        <div class="action-bar">
          <q-btn
            color="primary"
            label="افزودن کاربر جدید"
            @click="openAddDialog"
            class="add-btn"
            icon="person_add"
          />
          <q-space />
          <q-input
            dense
            outlined
            debounce="500"
            v-model="search"
            placeholder="جستجوی نام کاربری یا نام..."
            @update:model-value="loadUsers"
            class="search-input"
          >
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>
        </div>

        <!-- جدول کاربران -->
        <q-table
          :rows="users"
          :columns="columns"
          row-key="id"
          flat
          bordered
          :loading="loading"
          class="users-table"
          rows-per-page-label="تعداد در صفحه"
          :pagination="{ rowsPerPage: 10 }"
        >
          <template v-slot:loading>
            <q-inner-loading showing color="primary" />
          </template>

          <template v-slot:body-cell-role="props">
            <q-td align="center" class="role-cell">
              <q-badge :color="getRoleColor(props.row.role_id)" class="role-badge">
                {{ getRoleName(props.row.role_id) }}
              </q-badge>
            </q-td>
          </template>

          <template v-slot:body-cell-actions="props">
            <q-td align="center" class="actions-cell">
              <q-btn
                dense
                flat
                icon="edit"
                color="primary"
                @click="openEditDialog(props.row)"
                class="action-btn"
                size="12px"
              />
              <q-btn
                dense
                flat
                icon="delete"
                color="negative"
                @click="confirmDelete(props.row)"
                class="action-btn"
                size="12px"
              />
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- دیالوگ افزودن/ویرایش -->
    <q-dialog v-model="dialog" persistent>
      <q-card class="dialog-card">
        <q-card-section class="dialog-header">
          <div class="dialog-title">
            <q-icon :name="isEdit ? 'edit' : 'person_add'" class="dialog-icon" />
            {{ isEdit ? 'ویرایش کاربر' : 'افزودن کاربر جدید' }}
          </div>
        </q-card-section>
        <!-- پیام خطا -->
        <q-banner
          style="color: red;"
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
        <q-card-section class="dialog-body">
          <div class="row q-col-gutter-md">
            <div class="col-6">
              <q-input
                v-model="form.fname"
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
                v-model="form.lname"
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
            v-model="form.username"
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
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                label="کلمه عبور"
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
                    :name="showPassword ? 'visibility_off' : 'visibility'"
                    class="cursor-pointer"
                    @click="showPassword = !showPassword"
                  />
                </template>
              </q-input>
            </div>
            <div class="col-6">
              <q-input
                v-model="form.phone"
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
          </div>

          <div class="row q-col-gutter-md">
            <div class="col-6">
              <q-input
                v-model="form.email"
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
            <div class="col-6">
              <q-select
                v-model="form.role_id"
                :options="roleOptions"
                option-value="id"
                option-label="name"
                label="نقش کاربری"
                outlined
                dense
                emit-value
                map-options
                class="form-field"
                :input-style="{ textAlign: 'right', direction: 'rtl' }"
              >
                <template v-slot:prepend>
                  <q-icon name="admin_panel_settings" class="field-icon" />
                </template>
              </q-select>
            </div>
          </div>

          <!-- انتخاب حوزه -->
          <q-select
            v-model="selectedCity"
            :options="cities"
            option-value="id"
            option-label="name"
            label="انتخاب حوزه قضایی"
            outlined
            dense
            emit-value
            map-options
            class="form-field"
            :input-style="{ textAlign: 'right', direction: 'rtl' }"
          >
            <template v-slot:prepend>
              <q-icon name="location_city" class="field-icon" />
            </template>
          </q-select>
        </q-card-section>

        <q-card-actions align="center" class="dialog-actions">
          <q-btn
            :label="isEdit ? 'ویرایش' : 'ثـبــت'"
            color="primary"
            @click="saveUser"
            class="submit-btn"
            :loading="loading"
          />
          <q-btn
            label="انصراف"
            color="grey"
            v-close-popup
            class="cancel-btn"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- دیالوگ تایید حذف -->
    <q-dialog v-model="deleteDialog">
      <q-card class="delete-dialog-card">
        <q-card-section class="delete-header">
          <q-icon name="warning" color="orange" size="32px" />
          <div class="delete-title">تأیید حذف</div>
        </q-card-section>

        <q-card-section class="delete-body">
          آیا از حذف کاربر "{{ selectedUser.fname }} {{ selectedUser.lname }}" اطمینان دارید؟
          <div class="delete-warning">این عمل غیرقابل بازگشت است!</div>
        </q-card-section>

        <q-card-actions align="center" class="delete-actions">
          <q-btn
            label="تـأیید حذف"
            color="negative"
            @click="deleteUser"
            class="delete-confirm-btn"
          />
          <q-btn
            label="انصراف"
            color="grey"
            v-close-popup
            class="delete-cancel-btn"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api } from 'boot/axios'

const search = ref('')
const users = ref([])
const cities = ref([])
const loading = ref(false)
const errorMessage = ref('')
const user = ref(null)
const dialog = ref(false)
const deleteDialog = ref(false)
const isEdit = ref(false)
const selectedUser = ref(null)
const selectedCity = ref(null)
const showPassword = ref(false)

const roleOptions = [
  { id: 1, name: 'مدیر سیستم' },
  { id: 2, name: 'کاربر حوزه' }
]

const form = ref({
  id: null,
  fname: '',
  lname: '',
  username: '',
  password: '',
  phone: '',
  email: '',
  role_id: 2,
  city_id: null
})

const columns = [
  {
    name: 'username',
    label: 'نام کاربری',
    field: 'username',
    align: 'center',
    sortable: true
  },
  {
    name: 'role',
    label: 'نقش',
    field: 'role_id',
    align: 'center',
    sortable: true
  },
  {
    name: 'city',
    label: 'حوزه قضایی',
    field: row => row.city?.name || '-',
    align: 'center',
    sortable: true
  },
  {
    name: 'actions',
    label: 'عملیات',
    align: 'center',
    sortable: false
  }
]

// توابع کمکی
const getRoleName = (roleId) => {
  const role = roleOptions.find(r => r.id === roleId)
  return role ? role.name : 'نامشخص'
}

const getRoleColor = (roleId) => {
  return roleId === 1 ? 'primary' : 'secondary'
}

async function loadUsers() {
  loading.value = true
  errorMessage.value = ''
  try {
    const res = await api.get('/users', {
      params: { search: search.value || '' }
    })
    users.value = res.data
  } catch (err) {
    errorMessage.value = err.response?.data?.message || 'خطا در دریافت اطلاعات'
  } finally {
    loading.value = false
  }
}

async function loadCities() {
  try {
    const res = await api.get('/cities')
    cities.value = res.data
  } catch (err) {
    console.error('خطا در دریافت حوزه‌ها:', err)
  }
}

function openAddDialog() {
  isEdit.value = false
  form.value = {
    id: null,
    fname: '',
    lname: '',
    username: '',
    password: '',
    phone: '',
    email: '',
    role_id: 2,
    city_id: null
  }
  selectedCity.value = null
  errorMessage.value = ''
  showPassword.value = false

  loadCities()
  dialog.value = true
}

function openEditDialog(row) {
  isEdit.value = true
  form.value = {
    ...row,
    password: '' // برای ویرایش، رمز عبور خالی می‌ماند مگر اینکه کاربر بخواهد تغییر دهد
  }
  selectedCity.value = row.city_id
  errorMessage.value = ''
  showPassword.value = false

  loadCities()
  dialog.value = true
}

async function saveUser() {
  form.value.city_id = selectedCity.value

  // اعتبارسنجی فیلدهای ضروری
  if (!form.value.fname || !form.value.lname || !form.value.username || !form.value.role_id || !form.value.city_id) {
    errorMessage.value = 'لطفاً فیلدهای ضروری (نام، نام خانوادگی، نام کاربری، نقش و حوزه) را پر کنید'
    return
  }

  // برای کاربر جدید، رمز عبور الزامی است
  if (!isEdit.value && !form.value.password) {
    errorMessage.value = 'برای کاربر جدید، کلمه عبور الزامی است'
    return
  }

  const submitData = {
    fname: form.value.fname,
    lname: form.value.lname,
    username: form.value.username,
    phone: form.value.phone,
    email: form.value.email,
    role_id: form.value.role_id,
    city_id: form.value.city_id
  }

  // اگر رمز عبور وارد شده، آن را هم اضافه کن
  if (form.value.password) {
    submitData.password = form.value.password
  }

  try {
    if (isEdit.value) {
      await api.put(`/users/${form.value.id}`, submitData)
    } else {
      await api.post('/users', submitData)
    }
    dialog.value = false
    loadUsers()
  } catch (err) {
    console.error('خطا در ثبت کاربر:', err)
    if (err.response?.status === 422 && err.response.data.errors) {
      errorMessage.value = Object.values(err.response.data.errors).flat().join('، ')
    } else {
      errorMessage.value = err.response?.data?.message || 'خطا در ثبت اطلاعات'
    }
  }
}

function confirmDelete(row) {
  selectedUser.value = row
  deleteDialog.value = true
}

async function deleteUser() {
  try {
    await api.delete(`/users/${selectedUser.value.id}`)
    loadUsers()
    deleteDialog.value = false
  } catch (err) {
    errorMessage.value = err.response?.data?.message || 'خطا در حذف'
  }
}

onMounted(() => {
  const userData = localStorage.getItem('user')
  if (userData) {
    user.value = JSON.parse(userData)
  }
  loadUsers()
})
</script>

<style scoped>
.users-page {
  background: transparent;
  font-family: Vazirmatn, serif;
}

/* استایل‌های مشابه EmployeePage */
.main-card {
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(25, 118, 210, 0.1);
  border: 1px solid #e3f2fd;
  background: white;
}

.card-header {
  background: linear-gradient(135deg, #1976d2 0%, #42a5f5 100%);
  color: white;
  border-radius: 16px 16px 0 0;
  padding: 24px;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-icon {
  font-size: 36px;
  color: white;
}

.header-text {
  display: flex;
  flex-direction: column;
}

.text-h5 {
  font-weight: bold;
  margin-bottom: 4px;
}

.text-subtitle {
  opacity: 0.9;
  font-size: 14px;
}

.content-section {
  padding: 24px;
}

.action-bar {
  display: flex;
  align-items: center;
  margin-bottom: 24px;
  gap: 16px;
}

.add-btn {
  border-radius: 10px;
  padding: 8px 20px;
  font-weight: bold;
  box-shadow: 0 2px 8px rgba(25, 118, 210, 0.3);
}

.search-input {
  min-width: 280px;
  border-radius: 10px;
}

.users-table {
  border-radius: 12px;
  overflow: hidden;
}

.users-table :deep(.q-table__top) {
  background: #f8fbff;
  border-bottom: 1px solid #e3f2fd;
}

.users-table :deep(.q-table__control) {
  direction: rtl;
}

.actions-cell {
  display: flex;
  justify-content: center;
  gap: 8px;
}

.action-btn {
  border-radius: 8px;
  transition: all 0.3s ease;
}

.action-btn:hover {
  transform: scale(1.1);
  background: rgba(25, 118, 210, 0.1);
}

.role-cell {
  padding: 8px;
}

.role-badge {
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 12px;
}

.dialog-card {
  min-width: 500px;
  border-radius: 16px;
  overflow: hidden;
}

.dialog-header {
  background: linear-gradient(135deg, #1976d2 0%, #42a5f5 100%);
  color: white;
  padding: 20px;
}

.dialog-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 18px;
  font-weight: bold;
}

.dialog-icon {
  font-size: 24px;
}

.dialog-body {
  padding: 24px;
}

.form-field {
  margin-bottom: 16px;
  border-radius: 10px;
}

.form-field :deep(.q-field__control) {
  border-radius: 10px;
}

.field-icon {
  color: #42a5f5;
}

.dialog-actions {
  padding: 16px 24px 24px;
  gap: 12px;
}

.submit-btn, .cancel-btn {
  min-width: 120px;
  border-radius: 10px;
  font-weight: bold;
}

.delete-dialog-card {
  min-width: 350px;
  border-radius: 16px;
  overflow: hidden;
}

.delete-header {
  background: #fff3e0;
  padding: 20px;
  text-align: center;
  border-bottom: 1px solid #ffcc80;
}

.delete-title {
  font-size: 18px;
  font-weight: bold;
  color: #f57c00;
  margin-top: 8px;
}

.delete-body {
  padding: 24px;
  text-align: center;
  font-size: 16px;
}

.delete-warning {
  color: #f44336;
  font-size: 14px;
  margin-top: 8px;
  font-weight: bold;
}

.delete-actions {
  padding: 16px 24px 24px;
  gap: 12px;
}

.delete-confirm-btn, .delete-cancel-btn {
  min-width: 120px;
  border-radius: 10px;
  font-weight: bold;
}

.error-banner {
  border-radius: 10px;
  border: 1px solid #ffcdd2;
}

@media (max-width: 768px) {
  .action-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .search-input {
    min-width: auto;
  }

  .dialog-card {
    min-width: 90vw;
    margin: 10px;
  }

  .header-content {
    flex-direction: column;
    text-align: center;
    gap: 12px;
  }

  .actions-cell {
    flex-direction: column;
    gap: 4px;
  }
}

@media (max-width: 480px) {
  .content-section {
    padding: 16px;
  }

  .card-header {
    padding: 20px 16px;
  }

  .dialog-body {
    padding: 20px 16px;
  }
}

.main-card {
  animation: fadeInUp 0.5s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

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
</style>
