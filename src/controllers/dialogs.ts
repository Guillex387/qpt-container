const { ipcRenderer } = require('electron');

export interface FileFilter {
  name: string;
  extensions: string[];
}

export const showErrorBox = (err: any) => {
  ipcRenderer.send('error-box', err.type ?? 'Unknow Error', err.message ?? '');
};

export const showOpenBox = (multiSelections: boolean = false, filters: FileFilter[] = []): string[] | undefined => {
  let properties = ['showHiddenFiles'];
  multiSelections && properties.push('multiSelections');
  return ipcRenderer.sendSync('open-box', { filters, properties });
};

export const showSaveBox = (filters: FileFilter[] = []): string => {
  return ipcRenderer.sendSync('save-box', { filters, properties: ['showHiddenFiles'] });
};
