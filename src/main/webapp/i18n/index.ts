/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
const angularLanguages = {
  fr: async (): Promise<void> => import('@angular/common/locales/fr'),
  'ar-ly': async (): Promise<void> => import('@angular/common/locales/ar-LY'),
  // jhipster-needle-i18n-language-angular-loader - JHipster will add languages in this object
};

const languagesData = {
  fr: async (): Promise<any> => import('i18n/fr.json').catch(),
  'ar-ly': async (): Promise<any> => import('i18n/ar-ly.json').catch(),
  // jhipster-needle-i18n-language-loader - JHipster will add languages in this object
};

export const loadLocale = (locale: keyof typeof angularLanguages): Promise<any> => {
  angularLanguages[locale]();
  return languagesData[locale]();
};
