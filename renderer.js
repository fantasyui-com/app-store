// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const EventEmitter = require('events');
const fs = require('fs')
const path = require('path')
const mkdirp = require('mkdirp');
const pacote = require('pacote');
const rimraf = require('rimraf');

const { spawn } = require('child_process');

const stateManager = {

  applyDefault: function(package){
    if(!package.state) package.state = {};
    package.state.name = 'Default'
    package.state.buttonAction = 'install-package';
    package.state.progressBar = false;
    package.state.buttonLabel = 'Install';
  },

  applyInstalling: function(package){
    package.state.name = 'Installing'
    package.state.buttonAction = 'noop';
    package.state.progressBar = true;
    package.state.buttonLabel = 'Installing';
  },

  applyUpdating: function(package){
    package.state.name = 'Updating'
    package.state.buttonAction = 'noop';
    package.state.progressBar = true;
    package.state.buttonLabel = 'Updating';
  },

  applyInstalled: function(package){
    package.state.name = 'Installed'
    package.state.buttonAction = 'launch-package';
    package.state.progressBar = false;
    package.state.buttonLabel = 'Launch';
  },

}

const envPaths = require('env-paths');
const paths = envPaths('npm-app-store');

const dirapps = path.join( paths.cache, 'installed' );
mkdirp.sync(dirapps);
console.log('dirapps: %s',dirapps);

// this is the initial library.
// let packages = [];
// packages.push( { name: 'bootstrap-electron', description: 'Bootstrap based Electron Application Starter Pack', state:{} } );

let packages = require('app-catalog').data;

packages.forEach(p => {
    stateManager.applyDefault(p);
})

let installed = fs.readdirSync(dirapps);
installed.forEach(i => {
  packages.forEach(p => {
    if(p.name === i){
      stateManager.applyInstalled(p);
    }
  })
})


class MyEmitter extends EventEmitter {}
const ee = new MyEmitter();

ee.on('install-package', async (package) => {
  stateManager.applyInstalling(package);
  await pacote.extract(package.name, path.join(dirapps, package.name));
  const install = spawn("npm", ["i"], {cwd:path.join(dirapps, package.name)});
   install.stdout.on('data', (data) => {
     console.log(`electron stdout: ${data}`);
   });
   install.stderr.on('data', (data) => {
     console.log(`electron stderr: ${data}`);
   });
   install.on('close', (code) => {
     console.log(`electron child process exited with code ${code}`);
     stateManager.applyInstalled(package);
   });
});

ee.on('update-package', async (package) => {
  stateManager.applyUpdating(package);

  const install = spawn("npm", ["update"], {cwd:path.join(dirapps, package.name)});
   install.stdout.on('data', (data) => {
     console.log(`electron stdout: ${data}`);
   });
   install.stderr.on('data', (data) => {
     console.log(`electron stderr: ${data}`);
   });
   install.on('close', (code) => {
     console.log(`electron child process exited with code ${code}`);
     stateManager.applyInstalled(package);
   });
});

ee.on('uninstall-package', async (package) => {
  if(dirapps && package.name) rimraf(path.join(dirapps, package.name), function(){
    stateManager.applyDefault(package);
  });
});

ee.on('launch-package', async (package) => {
  const electron = spawn("electron", [path.join(dirapps, package.name)]);
   electron.stdout.on('data', (data) => {
     console.log(`electron stdout: ${data}`);
   });
   electron.stderr.on('data', (data) => {
     console.log(`electron stderr: ${data}`);
   });
   electron.on('close', (code) => {
     console.log(`electron child process exited with code ${code}`);
   });
});




Vue.component('cycle', {
  template: '#cycle-template',
  props: {
    ee: Object,
    model: Object
  },
  data: function () {
    return {
      open: false
    }
  },
  created () {

    // this.record = this.ds.record.getRecord('test/johndoe')
    //
    // this.record.subscribe(values => {
    //
    //   this.firstname = values.firstname
    //   this.lastname = values.lastname
    //
    // })

  },
  methods: {

    buttonAction: function (package) {
      this.ee.emit(package.state.buttonAction, package);
    },

    uninstallAction: function (package) {
      this.ee.emit('uninstall-package', package);
    },

    updateAction: function (package) {
      this.ee.emit('update-package', package);
    }

  }
})


var appTitle = new Vue({
  el: '#app-title',
  data: {
    name: 'App Store',
    description: 'Manage Electron Applications'
  }
});


var appPackages = new Vue({
  el: '#app-packages',

  data: {
    packages
  },
  created () {
    this.ee = ee;

    // Subscribe to events in created()
    this.ee.on('event', (o) => {
      console.log('an event occurred!', o);
    });

  },

  methods: {
    something: function (o) {
      // Dispatch events from methods
      this.ee.emit('event');
    }
  }
})
