<template>
  <q-page class="printers-page" padding>

    <q-card class="main-card">
      <!-- هدر کارت -->
      <q-card-section class="card-header">
        <div class="header-content">
          <q-icon name="print" class="header-icon" />
          <div class="header-text">
            <div class="text-h5">مدیریت پرینترها</div>
            <div class="text-subtitle">مدیریت و ویرایش اطلاعات پرینترها</div>
          </div>
        </div>
      </q-card-section>

      <q-separator />

      <q-card-section class="content-section">
        <!-- بخش اقدامات و جستجو -->
        <div class="action-bar">
          <q-btn
            color="primary"
            label="افزودن پرینتر جدید"
            @click="openAddDialog"
            class="add-btn"
            icon="add"
          />
          <q-space />
          <q-input
            dense
            outlined
            debounce="500"
            v-model="search"
            placeholder="جستجوی مدل پرینتر..."
            @update:model-value="loadPrinters"
            class="search-input"
          >
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>
        </div>

        <!-- جدول پرینترها -->
        <q-table
          :rows="printers"
          :columns="columns"
          row-key="id"
          flat
          bordered
          :loading="loading"
          class="printers-table"
          rows-per-page-label="تعداد در صفحه"
          :pagination="{ rowsPerPage: 10 }"
        >
          <template v-slot:loading>
            <q-inner-loading showing color="primary" />
          </template>

          <template v-slot:body-cell-actions="props">
            <q-td align="center" class="actions-cell">
              <q-btn
                dense
                flat
                icon="visibility"
                color="info"
                @click="openViewDialog(props.row)"
                class="action-btn"
                size="12px"
              />
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
      <q-card class="dialog-card printer-dialog">
        <q-card-section class="dialog-header">
          <div class="dialog-title">
            <q-icon :name="isEdit ? 'edit' : 'add'" class="dialog-icon" />
            {{ isEdit ? 'ویرایش پرینتر' : 'افزودن پرینتر جدید' }}
          </div>
        </q-card-section>
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
        <q-card-section class="dialog-body">
          <!-- انتخاب حوزه برای ادمین -->
          <q-select
            v-if="user?.role_id === 1"
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

          <!-- انتخاب شعبه -->
          <q-select
            v-model="selectedBranch"
            :options="branches"
            option-value="id"
            option-label="name"
            label="انتخاب شعبه"
            outlined
            dense
            emit-value
            map-options
            class="form-field"
            :input-style="{ textAlign: 'right', direction: 'rtl' }"
          >
            <template v-slot:prepend>
              <q-icon name="business" class="field-icon" />
            </template>
          </q-select>

          <div class="row q-col-gutter-md form-row">
            <div class="col-6">
              <q-input
                v-model="form.model"
                label="مدل پرینتر"
                outlined
                dense
                class="form-field"
                :input-style="{ textAlign: 'right', direction: 'rtl' }"
              >
                <template v-slot:prepend>
                  <q-icon name="print" class="field-icon" />
                </template>
              </q-input>
            </div>
            <div class="col-6">
              <q-input
                v-model="form.quantity"
                label="تعداد"
                type="number"
                outlined
                dense
                class="form-field"
                :input-style="{ textAlign: 'right', direction: 'rtl' }"
              >
                <template v-slot:prepend>
                  <q-icon name="numbers" class="field-icon" />
                </template>
              </q-input>
            </div>
          </div>

          <div class="row q-col-gutter-md form-row">
            <div class="col-6">
              <q-select
                v-model="form.type"
                :options="printerTypes"
                label="نوع پرینتر"
                outlined
                dense
                class="form-field"
                :input-style="{ textAlign: 'right', direction: 'rtl' }"
              >
                <template v-slot:prepend>
                  <q-icon name="category" class="field-icon" />
                </template>
              </q-select>
            </div>
            <div class="col-6">
              <q-input
                v-model="form.ip_address"
                label="آدرس IP"
                outlined
                dense
                class="form-field"
                :input-style="{ textAlign: 'right', direction: 'rtl' }"
              >
                <template v-slot:prepend>
                  <q-icon name="lan" class="field-icon" />
                </template>
              </q-input>
            </div>
          </div>
          <div class="row q-col-gutter-md checkbox-row">
            <div class="col-6">
              <div class="checkbox-container">
                <q-checkbox
                  v-model="form.is_color"
                  label="پرینتر رنگی"
                  :true-value="true"
                  :false-value="false"
                  class="custom-checkbox"
                  color="primary"
                />
              </div>
            </div>
            <div class="col-6">
              <div class="checkbox-container">
                <q-checkbox
                  v-model="form.is_network"
                  label="پرینتر شبکه"
                  :true-value="true"
                  :false-value="false"
                  class="custom-checkbox"
                  color="primary"
                />
              </div>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="center" class="dialog-actions">
          <q-btn
            :label="isEdit ? 'ویرایش' : 'ثـبــت'"
            color="primary"
            @click="savePrinter"
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

    <!-- دیالوگ نمایش اطلاعات -->
    <q-dialog v-model="viewDialog">
      <q-card class="view-dialog-card">
        <q-card-section class="view-header">
          <q-icon name="visibility" color="info" size="32px" />
          <div class="view-title">مشاهده اطلاعات پرینتر</div>
        </q-card-section>

        <q-card-section class="view-body">
          <div class="row q-col-gutter-md">
            <div class="col-6">
              <q-input v-model="viewData.model" label="مدل پرینتر" outlined dense readonly />
            </div>
            <div class="col-6">
              <q-input v-model="viewData.quantity" label="تعداد" outlined dense readonly />
            </div>
            <div class="col-6">
              <q-input v-model="viewData.ip_address" label="آدرس IP" outlined dense readonly />
            </div>
            <div class="col-6">
              <q-input v-model="viewData.type" label="نوع پرینتر" outlined dense readonly />
            </div>
            <div class="col-6">
              <q-input v-model="viewData.is_color_display" label="پرینتر رنگی" outlined dense readonly />
            </div>
            <div class="col-6">
              <q-input v-model="viewData.is_network_display" label="پرینتر شبکه" outlined dense readonly />
            </div>
            <div class="col-6">
              <q-input v-model="viewData.branch_name" label="شعبه" outlined dense readonly />
            </div>
            <div class="col-6" v-if="user?.role_id === 1">
              <q-input v-model="viewData.city_name" label="حوزه قضایی" outlined dense readonly />
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="center" class="view-actions">
          <q-btn
            label="بستن"
            color="grey"
            v-close-popup
            class="close-btn"
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
          آیا از حذف پرینتر "{{ selectedPrinter.model }}" اطمینان دارید؟
          <div class="delete-warning">این عمل غیرقابل بازگشت است!</div>
        </q-card-section>

        <q-card-actions align="center" class="delete-actions">
          <q-btn
            label="تـأیید حذف"
            color="negative"
            @click="deletePrinter"
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
const printers = ref([])
const cities = ref([])
const branches = ref([])
const loading = ref(false)
const errorMessage = ref('')
const user = ref(null)
const dialog = ref(false)
const viewDialog = ref(false)
const deleteDialog = ref(false)
const isEdit = ref(false)
const selectedPrinter = ref(null)
const selectedCity = ref(null)
const selectedBranch = ref(null)

const printerTypes = [
  'لیزری',
  'جوهرافشان',
  'سوزنی',
  'حرارتی',
  'سه بعدی'
]


const form = ref({
  id: null,
  model: '',
  city_id: null,
  branch_id: null,
  quantity: 1,
  ip_address: '',
  type: 'لیزری',
  is_color: false,
  is_network: false
})

const viewData = ref({
  model: '',
  quantity: '',
  ip_address: '',
  type: '',
  is_color_display: '',
  is_network_display: '',
  branch_name: '',
  city_name: ''
})

const columns = [
  {
    name: 'city',
    label: 'حوزه قضایی',
    field: row => row.city?.name || '-',
    align: 'center',
    sortable: true
  },
  {
    name: 'branch',
    label: 'شعبه',
    field: row => row.branch?.name || '-',
    align: 'center',
    sortable: true
  },
  {
    name: 'model',
    label: 'مدل پرینتر',
    field: 'model',
    align: 'center',
    sortable: true
  },
  {
    name: 'type',
    label: 'نوع',
    field: 'type',
    align: 'center',
    sortable: true
  },

  {
    name: 'quantity',
    label: 'تعداد',
    field: 'quantity',
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

async function loadPrinters() {
  loading.value = true
  errorMessage.value = ''
  try {
    const res = await api.get('/printers', {
      params: { search: search.value || '' }
    })
    // مرتب‌سازی بر اساس ID به صورت نزولی (جدیدترین اول)
    printers.value = res.data.sort((a, b) => b.id - a.id)
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

async function loadBranches() {
  try {
    const res = await api.get('/branches')
    branches.value = res.data
  } catch (err) {
    console.error('خطا در دریافت شعبات:', err)
  }
}

function openAddDialog() {
  isEdit.value = false
  form.value = {
    id: null,
    model: '',
    city_id: null,
    branch_id: null,
    quantity: 1,
    ip_address: '',
    type: 'لیزری',
    is_color: false,
    is_network: false
  }
  selectedCity.value = null
  selectedBranch.value = null
  errorMessage.value = ''

  if (user.value?.role_id === 1) loadCities()
  loadBranches()

  dialog.value = true
}

function openEditDialog(row) {
  isEdit.value = true

  form.value = {
    ...row,
  }

  selectedCity.value = row.city_id
  selectedBranch.value = row.branch_id

  errorMessage.value = ''

  dialog.value = true

  setTimeout(() => {
    if (user.value?.role_id === 1) {
      loadCities()
    }
    loadBranches()
  }, 100)
}

function openViewDialog(row) {
  viewData.value = {
    model: row.model || '-',
    quantity: row.quantity || '-',
    ip_address: row.ip_address || '-',
    type: row.type || '-',
    is_color_display: row.is_color ? 'بله' : 'خیر',
    is_network_display: row.is_network ? 'بله' : 'خیر',
    branch_name: row.branch?.name || '-',
    city_name: row.city?.name || '-'
  }
  viewDialog.value = true
}

async function savePrinter() {
  if (user.value?.role_id === 1) {
    form.value.city_id = selectedCity.value
  } else {
    form.value.city_id = user.value.city_id
  }
  form.value.branch_id = selectedBranch.value

  if (!form.value.model || !form.value.branch_id) {
    errorMessage.value = 'لطفاً فیلدهای مدل پرینتر و شعبه را پر کنید'
    return
  }

  const submitData = {
    ...form.value,
  }

  try {
    if (isEdit.value) {
      await api.put(`/printers/${form.value.id}`, submitData)
    } else {
      await api.post('/printers', submitData)
    }
    dialog.value = false
    loadPrinters()
  } catch (err) {
    console.error('خطا در ثبت پرینتر:', err)
    if (err.response?.status === 422 && err.response.data.errors) {
      errorMessage.value = Object.values(err.response.data.errors).flat().join('، ')
    } else {
      errorMessage.value = err.response?.data?.message || 'خطا در ثبت اطلاعات'
    }
  }
}

function confirmDelete(row) {
  selectedPrinter.value = row
  deleteDialog.value = true
}

async function deletePrinter() {
  try {
    await api.delete(`/printers/${selectedPrinter.value.id}`)
    loadPrinters()
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
  loadPrinters()
})
</script>
<style scoped>
/* فقط استایل‌های خاص این کامپوننت که در فایل global نیستند */
</style>
