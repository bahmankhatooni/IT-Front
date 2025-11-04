<template>
  <q-page  padding>
    <!-- پیام خطا -->
    <q-banner v-if="errorMessage" class="bg-red text-white q-mb-md" rounded dense style="text-align: center">
      {{ errorMessage }}
    </q-banner>
    <q-card >
      <!-- هدر -->
      <q-card-section class="bg-blue-2">
        <div class="text-h6 text-center">مدیریت حوزه‌ها</div>
      </q-card-section>
      <q-separator />
      <q-card-section v-if="user?.role_id === 1">
        <!-- 🔍 بخش دکمه و جستجو -->
        <div class="row items-center q-mb-md q-gutter-sm">
          <q-btn color="positive" label="افزودن حوزه جدید" @click="openAddDialog" />
          <q-space />
          <q-input
            dense
            outlined
            debounce="500"
            v-model="search"
            placeholder="نام حوزه"
            @update:model-value="loadCities"
            style="width: 250px"
          >
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>
        </div>
        <!-- جدول -->
        <q-table
          :rows="cities"
          :columns="columns"
          row-key="id"
          flat
          bordered
          :loading="loading"
          rows-per-page-label="تعداد در صفحه"
        >
          <template v-slot:body-cell-actions="props">
            <q-td align="center">
              <q-btn dense flat icon="edit" color="primary" @click="openEditDialog(props.row)" />
              <q-btn dense flat icon="delete" color="negative" @click="confirmDelete(props.row)" />
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- دیالوگ افزودن/ویرایش -->
    <q-dialog v-model="dialog">
      <q-card style="min-width: 350px; border-radius: 12px; padding: 16px;">
        <q-card-section>
          <div class="text-h6 text-center">{{ isEdit ? 'ویرایش حوزه' : 'افزودن حوزه جدید' }}</div>
        </q-card-section>

        <q-card-section>
          <q-input v-model="form.code" label="کد حوزه" outlined dense class="q-mb-md" />
          <q-input v-model="form.name" label="نام حوزه" outlined dense />
        </q-card-section>

        <div class="row justify-around q-gutter-sm q-mt-sm">
          <q-btn  :label="isEdit ? 'ویرایش' : 'ثـبــت'" color="positive" @click="saveCity" />
          <q-btn  label="انصراف" color="grey" v-close-popup />
        </div>
      </q-card>
    </q-dialog>

    <!-- دیالوگ تایید حذف -->
    <q-dialog v-model="deleteDialog">
      <q-card style="min-width: 300px; border-radius: 12px; padding: 16px;">
        <q-card-section> آیا از حذف حوزه "{{ selectedCity.name }}" اطمینان دارید؟ </q-card-section>
        <div class="row justify-around q-gutter-sm q-mt-sm">
          <q-btn  label="تـأیید" color="negative" @click="deleteCity" />
          <q-btn  label="انصراف" color="grey" v-close-popup />
        </div>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api } from 'boot/axios'

const cities = ref([])
const loading = ref(false)
const errorMessage = ref('')
const user = ref(null);
const dialog = ref(false)
const deleteDialog = ref(false)
const isEdit = ref(false)
const selectedCity = ref(null)
const search = ref('')
const form = ref({ id: null, code: '', name: '' })

const columns = [
  { name: 'code', label: 'کد', field: 'code', align: 'center' },
  { name: 'name', label: 'نام شهرستان', field: 'name', align: 'center' },
  { name: 'actions', label: 'عملیات', field: 'actions', align: 'center' },
]

// واکشی لیست شهرها
async function loadCities() {
  loading.value = true
  errorMessage.value = ''
  try {
    const res = await api.get('/cities', {
      params: { search: search.value || '' } // 🔍 پارامتر جستجو
    })
    cities.value = res.data
  } catch (err) {
    if (err.response?.status === 401) {
      errorMessage.value = 'دسترسی غیرمجاز یا توکن منقضی شده است.'
    } else {
      errorMessage.value = err.response?.data?.message || 'خطا در دریافت داده‌ها'
    }
  } finally {
    loading.value = false
  }
}

function openAddDialog() {
  isEdit.value = false
  form.value = { id: null, code: '', name: '' }
  errorMessage.value = ''
  dialog.value = true
}

function openEditDialog(row) {
  isEdit.value = true
  form.value = { ...row }
  errorMessage.value = ''
  dialog.value = true
}

// ذخیره یا ویرایش حوزه
async function saveCity() {
  if (!form.value.code || !form.value.name) {
    errorMessage.value = 'لطفاً تمام فیلدها را پر کنید'
    return
  }

  const formData = new FormData()
  formData.append('code', form.value.code)
  formData.append('name', form.value.name)

  try {
    if (isEdit.value) {
      formData.append('_method', 'PUT')
      await api.post(`/cities/${form.value.id}`, formData)
    } else {
      await api.post('/cities', formData)
    }
    await loadCities()
    dialog.value = false
  } catch (err) {
    if (err.response && err.response.status === 422 && err.response.data.errors) {
      const errors = err.response.data.errors
      errorMessage.value = Object.values(errors).flat().join('، ')
    } else if (err.response?.status === 401) {
      errorMessage.value = 'دسترسی غیرمجاز یا توکن منقضی شده است.'
    } else {
      errorMessage.value = err.response?.data?.message || 'خطا در ثبت اطلاعات'
    }
  }
}

function confirmDelete(row) {
  selectedCity.value = row
  deleteDialog.value = true
}

async function deleteCity() {
  try {
    await api.delete(`/cities/${selectedCity.value.id}`)
    await loadCities()
    deleteDialog.value = false
  } catch (err) {
    if (err.response?.status === 401) {
      errorMessage.value = 'دسترسی غیرمجاز یا توکن منقضی شده است.'
    } else {
      errorMessage.value = err.response?.data?.message || 'خطا در حذف'
    }
  }
}

onMounted(() => {
  const userData = localStorage.getItem('user');
  if (userData) {
    user.value = JSON.parse(userData);
  }
  loadCities()
})
</script>

<style scoped>
.bg-blue-2 {
  background: #cce5ff;
}
</style>
