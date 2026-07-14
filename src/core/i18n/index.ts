import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { settingsService } from '../../services/settings/SettingsService';

// Import translations
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
    common: viCommon,
    workspace: viWorkspace,
    projectExplorer: viProjectExplorer,
    scriptEditor: viScriptEditor
  },
  en: {
    common: enCommon,
    workspace: enWorkspace,
    projectExplorer: enProjectExplorer,
    scriptEditor: enScriptEditor
  }
};

const savedLang = settingsService.getSettings().language || 'vi';

void i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLang, // Lấy từ Settings
    fallbackLng: 'vi',
    interpolation: {
      escapeValue: false // React đã tự escape chống XSS
    },
    defaultNS: 'common'
  });

export default i18n;
