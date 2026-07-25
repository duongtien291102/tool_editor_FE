import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { settingsService } from '@/services/settings/SettingsService';

import viRoot from '@/locales/vi.json';
import enRoot from '@/locales/en.json';

import viCommon from '@/locales/vi/common.json';
import viWorkspace from '@/locales/vi/workspace.json';
import viProjectExplorer from '@/locales/vi/project-explorer.json';
import viScriptEditor from '@/locales/vi/script-editor.json';

import enCommon from '@/locales/en/common.json';
import enWorkspace from '@/locales/en/workspace.json';
import enProjectExplorer from '@/locales/en/project-explorer.json';
import enScriptEditor from '@/locales/en/script-editor.json';

const resources = {
  vi: {
    translation: viRoot,
    workspace: viWorkspace,
    projectExplorer: viProjectExplorer,
    scriptEditor: viScriptEditor,
    ...viRoot,
    common: { ...viCommon, ...viRoot.common },
  },
  en: {
    translation: enRoot,
    workspace: enWorkspace,
    projectExplorer: enProjectExplorer,
    scriptEditor: enScriptEditor,
    ...enRoot,
    common: { ...enCommon, ...enRoot.common },
  },
};

const savedSettings = settingsService.getSettings();
const savedLang = savedSettings.language || 'vi';

void i18n.use(initReactI18next).init({
  resources,
  lng: savedLang,
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
  defaultNS: 'translation',
});

export default i18n;
