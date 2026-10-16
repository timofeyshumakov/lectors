import { callApi } from './callApi';

const ENTITY_TYPES = {
    SMART_PROCESS_1060: 1060,
    SMART_PROCESS_1094: 1094,
} as const;

export const FIELDS = {
    CONTACT_REGALIA: 'UF_CRM_1749554403214',
    CONTACT_CITY: 'UF_CRM_1753083765',
    IS_LECTOR: 'UF_CRM_1792048969189',
    SMART_PROCESS_1060_CONTACT_IDS: 'ufCrm42_1791882968',
} as const;

const SMART_PROCESS_ITEM_ID = BX24.placement.info().options.ENTITY_VALUE_ID || 340;

export interface ContactForm {
    lastName: string;
    firstName: string;
    secondName: string;
    regalia: string;
    company: { id: number; title: string } | null;
    city: { id: number; name: string } | null;
}

export interface Contact {
    id: number;
    crmId?: number;
    lastName: string;
    firstName: string;
    secondName: string;
    regalia: string;
    workplace: string;
    company: { id: number; title: string } | null;
    city: { id: number; name: string } | null;
}

export interface CityOption {
    id: number;
    name: string;
}

export interface CompanyOption {
    id: number;
    title: string;
}

export async function createContact(fields: Record<string, any>): Promise<number | null> {
    return new Promise((resolve) => {
        // @ts-ignore
        BX24.callMethod(
            'crm.contact.add',
            { fields },
            (res: any) => {
                if (res.data) {
                    resolve(res.data());
                } else {
                    console.error('Ошибка создания контакта:', res.error());
                    resolve(null);
                }
            }
        );
    });
}

export async function getSmartProcessContactIds(): Promise<number[]> {
    return new Promise((resolve) => {
        // @ts-ignore
        BX24.callMethod(
            'crm.item.get',
            {
                entityTypeId: ENTITY_TYPES.SMART_PROCESS_1060,
                id: SMART_PROCESS_ITEM_ID,
            },
            (res: any) => {
                if (res.data) {
                    const data = res.data();
                    const ids = data['item'][FIELDS.SMART_PROCESS_1060_CONTACT_IDS];
                    resolve(Array.isArray(ids) ? ids : []);
                } else {
                    resolve([]);
                }
            }
        );
    });
}

export async function updateSmartProcessContactIds(contactIds: number[]): Promise<boolean> {
    return new Promise((resolve) => {
        // @ts-ignore
        BX24.callMethod(
            'crm.item.update',
            {
                entityTypeId: ENTITY_TYPES.SMART_PROCESS_1060,
                id: SMART_PROCESS_ITEM_ID,
                fields: {
                    [FIELDS.SMART_PROCESS_1060_CONTACT_IDS]: contactIds,
                },
            },
            (res: any) => {
                if (res.data()) {
                    resolve(true);
                } else {
                    console.error('Ошибка обновления СП:', res.error());
                    resolve(false);
                }
            }
        );
    });
}

export async function getContactsByIds(ids: number[]): Promise<Contact[]> {
    if (ids.length === 0) return [];

    const items = await callApi(
        'crm.contact.list',
        { ID: ids },
        ['ID', 'NAME', 'LAST_NAME', 'SECOND_NAME', 'COMPANY_ID', FIELDS.CONTACT_REGALIA, FIELDS.CONTACT_CITY],
        null,
        0,
        0
    );

    return items;
}

export async function getCompanies(): Promise<CompanyOption[]> {
    const result = await callApi(
        'crm.company.list',
        {},
        ['ID', 'TITLE'],
        null,
        0,
        0
    );
    const items = Array.isArray(result) ? result : result.items || [];
    return items.map((item: any) => ({
        id: item.ID,
        title: item.TITLE,
    }));
}

export async function getCities(): Promise<CityOption[]> {
    const result = await callApi(
        'crm.item.list',
        {},
        ['ID', 'TITLE'],
        ENTITY_TYPES.SMART_PROCESS_1094,
        0,
        0
    );
    const items = Array.isArray(result) ? result : result.items || [];
    return items.map((item: any) => ({
        id: item.id ?? item.ID,
        name: item.title ?? item.TITLE,
    }));
}

export async function deleteContact(id: number): Promise<boolean> {
    return new Promise((resolve) => {
        // @ts-ignore
        BX24.callMethod(
            'crm.contact.delete',
            { id },
            (res: any) => {
                if (res.data()) {
                    resolve(true);
                } else {
                    console.error('Ошибка удаления контакта:', res.error());
                    resolve(false);
                }
            }
        );
    });
}
