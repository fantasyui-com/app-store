// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.


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
    packages: [

      { name: 'Bootstrap Electron 1', description: 'Bootstrap based Electron Application Starter Pack', buttonLabel:'Install', progressBar:false, },
      { name: 'Bootstrap Electron 2', description: 'Bootstrap based Electron Application Starter Pack', buttonLabel:'Install', progressBar:false, },
      { name: 'Bootstrap Electron 3', description: 'Bootstrap based Electron Application Starter Pack', buttonLabel:'Install', progressBar:false, },
      { name: 'Bootstrap Electron 4', description: 'Bootstrap based Electron Application Starter Pack', buttonLabel:'Install', progressBar:false, },

    ]
  },

  methods: {
    install: function (pkg) {

      console.log(pkg.name);
      pkg.buttonLabel = 'Installing';
      pkg.progressBar = true;


    }
  }
})
