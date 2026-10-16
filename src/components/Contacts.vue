<template>
  <div class="app-shell">
    <div class="report-header">
      <h2>Контакты</h2>
      <span class="counter">{{ contacts.length }}</span>
    </div>

    <v-card class="report-card mb-4">
      <div class="form-section">
        <v-row dense>
          <v-col cols="12" md="4">
            <v-text-field v-model="form.lastName" label="Фамилия" placeholder="Иванов" />
          </v-col>
          <v-col cols="12" md="4">
            <v-text-field v-model="form.firstName" label="Имя" placeholder="Иван" />
          </v-col>
          <v-col cols="12" md="4">
            <v-text-field v-model="form.secondName" label="Отчество" placeholder="Иванович" />
          </v-col>
          <v-col cols="12" md="4">
            <v-text-field v-model="form.regalia" label="Регалии" placeholder="Кандидат наук" />
          </v-col>
          <v-col cols="12" md="4">
            <v-autocomplete v-model="form.company" :items="companies" item-title="title" item-value="id" label="Место работы" return-object clearable />
          </v-col>
          <v-col cols="12" md="4">
            <v-autocomplete v-model="form.city" :items="cities" item-title="name" item-value="id" label="Город" return-object clearable />
          </v-col>
        </v-row>
      </div>
      <div class="form-actions">
        <button class="btn-primary" @click="addContact" :disabled="loading">Добавить контакт</button>
        <button class="btn-secondary" @click="clearForm">Очистить</button>
      </div>
    </v-card>

    <v-card class="report-card">
      <table class="contacts-table">
        <thead>
          <tr>
            <th>Фамилия</th>
            <th>Имя</th>
            <th>Отчество</th>
            <th>Регалии</th>
            <th>Место работы</th>
            <th>Город</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="contact in contacts" :key="contact.crmId">
            <td><span class="contact-name">{{ contact.lastName }}</span></td>
            <td>{{ contact.firstName }}</td>
            <td>{{ contact.secondName }}</td>
            <td><span v-if="contact.regalia">{{ contact.regalia }}</span><span v-else class="text-muted">—</span></td>
            <td><span v-if="contact.company" class="text-teal">{{ contact.company.title }}</span><span v-else class="text-muted">—</span></td>
            <td><span v-if="contact.city">{{ contact.city.name }}</span><span v-else class="text-muted">—</span></td>
            <td><button class="btn-delete" @click="deleteContact(contact.crmId)">Удалить</button></td>
          </tr>
          <tr v-if="contacts.length === 0">
            <td colspan="7" class="text-center py-8"><span class="text-muted">Нет контактов</span></td>
          </tr>
        </tbody>
      </table>
    </v-card>

    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner"><span></span><span></span><span></span><span></span></div>
      <span class="loading-text">Сохранение...</span>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { callApi } from '../functions/callApi';
import {
  createContact,
  getSmartProcessContactIds,
  updateSmartProcessContactIds,
  getContactsByIds,
  getCompanies,
  getCities,
  deleteContact,
  FIELDS,
} from '../functions/contactsApi';
import type { ContactForm, Contact, CityOption, CompanyOption } from '../functions/contactsApi';

export default defineComponent({
  name: 'Contacts',
  setup() {
    const form = ref<ContactForm>({
      lastName: '',
      firstName: '',
      secondName: '',
      regalia: '',
      company: null,
      city: null,
    });

    const contacts = ref<Contact[]>([]);
    const cities = ref<CityOption[]>([]);
    const companies = ref<CompanyOption[]>([]);
    const loading = ref(false);

    const companyMap = ref<Record<number, string>>({});
    const cityMap = ref<Record<number, string>>({});

    async function loadCompanyNames(companyIds: number[]) {
      if (companyIds.length === 0) return;
      try {
        const items = await callApi(
          'crm.company.list',
          { ID: companyIds },
          ['ID', 'TITLE'],
          null,
          0,
          0
        );
        items.forEach((item: any) => {
          companyMap.value[item.ID] = item.TITLE;
        });
      } catch (e) {
        console.error('Ошибка загрузки компаний:', e);
      }
    }

    async function loadCityNames(cityIds: number[]) {
      if (cityIds.length === 0) return;
      try {
        const items = await callApi(
          'crm.item.list',
          {},
          ['ID', 'TITLE'],
          1094,
          0,
          0
        );
        items.forEach((item: any) => {
          cityMap.value[item.id ?? item.ID] = item.title ?? item.TITLE;
        });
      } catch (e) {
        console.error('Ошибка загрузки городов:', e);
      }
    }

    async function loadContacts() {
      const ids = await getSmartProcessContactIds();
      if (ids.length === 0) {
        contacts.value = [];
        return;
      }

      const crmContacts = await getContactsByIds(ids);

      const companyIds = [...new Set(
        crmContacts
          .filter((c: any) => c.COMPANY_ID)
          .map((c: any) => c.COMPANY_ID)
      )];

      const cityIds = [...new Set(
        crmContacts
          .filter((c: any) => c[FIELDS.CONTACT_CITY])
          .map((c: any) => c[FIELDS.CONTACT_CITY])
      )];

      await Promise.all([
        loadCompanyNames(companyIds),
        loadCityNames(cityIds),
      ]);

      contacts.value = crmContacts.map((crm: any) => {
        const companyId = crm.COMPANY_ID;
        const cityId = crm[FIELDS.CONTACT_CITY];
        return {
          id: crm.ID,
          crmId: crm.ID,
          lastName: crm.LAST_NAME || '',
          firstName: crm.NAME || '',
          secondName: crm.SECOND_NAME || '',
          regalia: crm[FIELDS.CONTACT_REGALIA] || '',
          workplace: '',
          company: companyId ? { id: companyId, title: companyMap.value[companyId] || '' } : null,
          city: cityId ? { id: cityId, name: cityMap.value[cityId] || '' } : null,
        };
      });
    }

    async function loadCities() {
      try { cities.value = await getCities(); } catch (e) { console.error(e); }
    }

    async function loadCompanies() {
      try { companies.value = await getCompanies(); } catch (e) { console.error(e); }
    }

    async function addContact() {
      if (!form.value.firstName.trim()) return;

      loading.value = true;
      try {
        const fields: Record<string, any> = {
          NAME: form.value.firstName,
          LAST_NAME: form.value.lastName,
          SECOND_NAME: form.value.secondName,
          TYPE_ID: 'UC_HJSZ1E',
          [FIELDS.IS_LECTOR]: 'Y',
        };

        if (form.value.regalia.trim()) {
          fields[FIELDS.CONTACT_REGALIA] = form.value.regalia;
        }

        if (form.value.city) {
          fields[FIELDS.CONTACT_CITY] = form.value.city.id;
        }

        if (form.value.company) {
          fields.COMPANY_ID = form.value.company.id;
        }

        const crmId = await createContact(fields);
        if (!crmId) return;

        const ids = await getSmartProcessContactIds();
        if (!ids.includes(crmId)) {
          ids.push(crmId);
          await updateSmartProcessContactIds(ids);
        }

        await loadContacts();
        clearForm();
      } catch (e) {
        console.error('Ошибка добавления:', e);
      } finally {
        loading.value = false;
      }
    }

    async function deleteContactById(crmId: number) {
      loading.value = true;
      try {
        await deleteContact(crmId);

        const ids = await getSmartProcessContactIds();
        const filtered = ids.filter(id => id !== crmId);
        await updateSmartProcessContactIds(filtered);

        await loadContacts();
      } catch (e) {
        console.error('Ошибка удаления:', e);
      } finally {
        loading.value = false;
      }
    }

    function clearForm() {
      form.value = { lastName: '', firstName: '', secondName: '', regalia: '', company: null, city: null };
    }

    onMounted(async () => {
      await Promise.all([loadCities(), loadCompanies()]);
      await loadContacts();
    });

    return { form, contacts, cities, companies, loading, addContact, deleteContact: deleteContactById, clearForm };
  },
});
</script>

<style scoped lang="sass">
.contacts-table
  .text-center
    text-align: center !important
    .text-muted
      font-size: 0.9rem
      padding: 32px 0
</style>
