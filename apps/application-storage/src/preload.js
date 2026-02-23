const { contextBridge } = require('electron');
const path = require('node:path');
const { applicationFlow } = require('./application-planner');

const plannerOptions = {
  cwd: process.cwd(),
  appRoot: path.resolve(__dirname, '..'),
};

async function loadLocalApplications() {
  const result = await applicationFlow(plannerOptions)
    .locateLocalJson('applications.json')
    .readJson()
    .normalizeApplications()
    .execute();

  if (result.needsUrl && !result.error) {
    return {
      ...result,
      ok: true,
      message: 'applications.json was not found. Provide a URL to load the catalog.',
    };
  }

  return result;
}

async function loadApplicationsFromUrl(url) {
  const result = await applicationFlow(plannerOptions)
    .useRemoteJson(url)
    .readJson()
    .normalizeApplications()
    .execute();

  return result;
}

contextBridge.exposeInMainWorld('applicationStorage', {
  loadLocalApplications,
  loadApplicationsFromUrl,
});
