// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const EventEmitter = require('events');
const fs = require('fs')
const path = require('path')
const mkdirp = require('mkdirp');
const pacote = require('pacote');

const { spawn } = require('child_process');

class MyEmitter extends EventEmitter {}
const ee = new MyEmitter();

const stateManager = {

  applyDefault: function(package){
    if(!package.state) package.state = {};
    package.state.buttonAction = 'install-package';
    package.state.progressBar = false;
    package.state.buttonLabel = 'Install';
  },

  applyInstalled: function(package){
    package.state.buttonAction = 'launch-package';
    package.state.progressBar = false;
    package.state.buttonLabel = 'Launch';
  }

}

const dirapps = path.join( path.resolve(__dirname), 'installed' );
mkdirp.sync(dirapps);

// this is the initial library.
let packages = [];
packages.push( { name: 'bootstrap-electron', description: 'Bootstrap based Electron Application Starter Pack', state:{} } );

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

    this.ee.on('install-package', async (package) => {
      console.log('install-package event occurred for [%s]', package.name, package);

      await pacote.extract(package.name, path.join(dirapps, package.name));
      stateManager.applyInstalled(package);


    });

    this.ee.on('launch-package', async (package) => {
      console.log('launch-package event occurred for [%s]', package.name, package);



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




  },

  methods: {
    something: function (o) {
      // Dispatch events from methods
      this.ee.emit('event');
    }
  }
})
