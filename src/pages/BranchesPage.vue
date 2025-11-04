<template>
  <q-page padding>
    <!-- پیام خطا -->
    <q-banner v-if="errorMessage" class="bg-red text-white q-mb-md" rounded dense style="text-align: center;">
      {{ errorMessage }}
    </q-banner>
    <q-card>
      <!-- هدر -->
      <q-card-section class="bg-blue-2">
        <div class="text-h6 text-center">مدیریت شعبات</div>
      </q-card-section>
      <q-separator />
      <q-card-section>
      <div class="row items-center q-mb-md q-gutter-sm">
        <q-btn color="positive" label="افزودن شعبه جدید" @click="openAddDialog" />
        <q-space />
        <q-input
          dense
          outlined
          debounce="500"
          v-model="search"
          placeholder="نام شعبه"
          @update:model-value="loadBranches"
          style="width: 250px"
        >
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>

        <!-- جدول -->
        <q-table
          :rows="branches"
          :columns="columns"
          row-key="id"
          flat
          bordered
          :loading="loading"
          rows-per-page-label="تعداد در صفحه"
        >
          <template v-slot:body-cell-actions="props">
            <q-td align="center">
              <q-btn
                dense
                flat
                icon="edit"
                color="primary"
                @click="openEditDialog(props.row)"
              />
              <q-btn
                dense
                flat
                icon="delete"
                color="negative"
                @click="confirmDelete(props.row)"
              />
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- دیالوگ افزودن/ویرایش -->
    <q-dialog v-model="dialog">
      <q-card style="min-width: 350px; border-radius: 12px; padding: 16px;">
        <q-card-section>
          <div class="text-h6 text-center">
            {{ isEdit ? 'ویرایش شعبه' : 'افزودن شعبه جدید' }}
          </div>
        </q-card-section>

        <q-card-section>
          <q-input v-model="form.code" label="کد شعبه" outlined dense class="q-mb-md" />
          <q-input v-model="form.name" label="نام شعبه" outlined dense class="q-mb-md" />

          <!-- فقط برای ادمین -->
          <q-select
            v-if="user?.role_id === 1"
            v-model="selectedCity"
            :options="cities"
            option-value="id"
            option-label="name"
            label="انتخاب شهرستان"
            outlined
            dense
            emit-value
            map-options
          />

        </q-card-section>

        <div class="row justify-around q-gutter-sm q-mt-sm">
          <q-btn :label="isEdit ? 'ویرایش' : 'ثـبــت'" color="positive" @click="saveBranch" />
          <q-btn label="انصراف" color="grey" v-close-popup />
        </div>
      </q-card>
    </q-dialog>

    <!-- دیالوگ تایید حذف -->
    <q-dialog v-model="deleteDialog">
      <q-card style="min-width: 300px; border-radius: 12px; padding: 16px;">
        <q-card-section>
          آیا از حذف شعبه "{{ selectedBranch.name }}" اطمینان دارید؟
        </q-card-section>
        <div class="row justify-around q-gutter-sm q-mt-sm">
          <q-btn label="تـأیید" color="negative" @click="deleteBranch" />
          <q-btn label="انصراف" color="grey" v-close-popup />
        </div>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api } from 'boot/axios'
const search = ref('')
const branches = ref([])
const cities = ref([])
const loading = ref(false)
const errorMessage = ref('')
const user = ref(null)
const dialog = ref(false)
const deleteDialog = ref(false)
const isEdit = ref(false)
const selectedBranch = ref(null)
const selectedCity = ref(null)
const form = ref({ id: null, code: '', name: '', city_id: null })

const columns = [
  { name: 'code', label: 'کد شعبه', field: 'code', align: 'center' },
  { name: 'name', label: 'نام شعبه', field: 'name', align: 'center' },
  { name: 'city', label: 'نام حوزه', field: row => row.city?.name || '-', align: 'center' },
  { name: 'actions', label: 'عملیات', field: 'actions', align: 'center' },
]

async function loadBranches() {
  loading.value = true
  errorMessage.value = ''
  try {
    const res = await api.get('/branches',{
      params: { search: search.value || '' } // 🔍 پارامتر جستجو
    })
    branches.value = res.data
  } catch (err) {
    errorMessage.value = err.response?.data?.message || 'خطا در دریافت داده‌ها'
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
  form.value = { id: null, code: '', name: '', city_id: null }
  errorMessage.value = ''
  if (user.value?.role_id === 1) loadCities()
  dialog.value = true
}

function openEditDialog(row) {
  isEdit.value = true
  form.value = { id: row.id, code: row.code, name: row.name, city_id: row.city_id }
  errorMessage.value = ''
  if (user.value?.role_id === 1) loadCities()
  dialog.value = true
}

async function saveBranch() {
  if (user.value?.role_id === 1) {
    form.value.city_id = selectedCity.value
  }

  if (!form.value.code || !form.value.name) {
    errorMessage.value = 'لطفاً تمام فیلدها را پر کنید'
    return
  }

  // اگر city_user هست، city_id خودش تنظیم میشه
  if (user.value?.role_id !== 1) {
    form.value.city_id = user.value.city_id
  }

  const formData = new FormData()
  formData.append('code', form.value.code)
  formData.append('name', form.value.name)
  formData.append('city_id', form.value.city_id)

  try {
    if (isEdit.value) {
      formData.append('_method', 'PUT')
      await api.post(`/branches/${form.value.id}`, formData)
    } else {
      await api.post('/branches', formData)
    }
    dialog.value = false
    loadBranches()
  } catch (err) {
    console.error('خطا در ثبت شعبه:', err)
    if (err.response?.status === 422 && err.response.data.errors) {
      errorMessage.value = Object.values(err.response.data.errors).flat().join('، ')
    } else {
      errorMessage.value = err.response?.data?.message || 'خطا در ثبت اطلاعات'
    }
  }
}

function confirmDelete(row) {
  selectedBranch.value = row
  deleteDialog.value = true
}

async function deleteBranch() {
  try {
    await api.delete(`/branches/${selectedBranch.value.id}`)
    loadBranches()
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
  loadBranches()
})
</script>

<style scoped>
.bg-blue-2 {
  background: #cce5ff;
}
</style>
