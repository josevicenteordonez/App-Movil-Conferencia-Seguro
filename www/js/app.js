// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers','ionic.cloud','ngCordova','ngMaterial','ngStorage','ion-gallery'])

.run(function($ionicPlatform,$cordovaBarcodeScanner,$rootScope) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }

    //Dominio donde se encuentran los Web Services
    //$rootScope.wsDomain = "http://localhost/lacaja"; //Local
    $rootScope.wsDomain = "http://deltatech.com.ve/demos/lacaja"; //Deltatech

  });
})

.config(function($stateProvider, $urlRouterProvider,$ionicCloudProvider,$ionicConfigProvider) {

  $ionicConfigProvider.tabs.position('top');
  $ionicConfigProvider.tabs.style('striped');
  $ionicConfigProvider.form.toggle('small');
  
  //$ionicConfigProvider.views.maxCache(1);
  
  $ionicConfigProvider.views.forwardCache(false); //para cargar cada pagina siempre!
  
  $ionicConfigProvider.backButton.text('');

  /*$ionicConfigProvider.scrolling.jsScrolling(true);*/

  //if(ionic.Platform.isAndroid()){
    //$ionicConfigProvider.scrolling.jsScrolling(false);  
 // }
  
/*
$routeProvider
   .when('app.books', {
    templateUrl: 'books.html',
    controller: 'BooksCtrl',
    resolve: {
      // I will cause a 1 second delay
      delay: function($q, $timeout) {
        var delay = $q.defer();
        $timeout(delay.resolve, 1000);
        return delay.promise;
      }
    }
  });
*/

  $ionicCloudProvider.init({
    "core": {
      "app_id": "79c9448e"
    },
    "push": {
      "sender_id": "675929797358",
      "pluginConfig": {
        "ios": {
          "badge": true,
          "sound": true
        },
        "android": {
          "iconColor": "#343434"
        }
      }
    }
  });


  $stateProvider

    .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/menu.html',
    controller: 'AppCtrl'
  })

  .state('app.login', {
    url: '/login',
    views: {
      'menuContent': {
        templateUrl: 'templates/login.html',
        controller: 'LoginCtrl'
      }
    }
  })

  .state('app.logout', {
    url: '/logout',
    views: {
      'menuContent': {
        //templateUrl: 'templates/logout.html',
        controller: 'LogoutCtrl'
      }
    }
  })
 .state('app.welcome', {
    url: '/welcome',
    views: {
      'menuContent': {
        templateUrl: 'templates/welcome.html',
        controller: 'WelcomeCtrl'
      }
    }
  })
  .state('app.forgot_password', {
    url: '/forgot_password',
    views: {
      'menuContent': {
        templateUrl: 'templates/forgot_password.html',
        controller: 'PasswordCtrl'
      }
    }
  })

  .state('app.reset_password', {
    url: '/reset_password',
    views: {
      'menuContent': {
        templateUrl: 'templates/reset_password.html',
        controller: 'PasswordCtrl'
      }
    }
  })

  .state('app.information', {
    url: '/information',
    views: {
      'menuContent': {
        templateUrl: 'templates/information.html',
        controller: 'InformationCtrl'
      }
    }
  })

  .state('app.gallery', {
    url: '/gallery',
    views: {
      'menuContent': {
        templateUrl: 'templates/gallery.html',
        controller: 'GalleryCtrl'
      }
    }
  })

  .state('app.profile', {
    url: '/profile',
    views: {
      'menuContent': {
        templateUrl: 'templates/profile.html',
        controller: 'ProfileCtrl'
      }
    }
  })

  .state('app.survey', {
    url: '/survey',
    views: {
      'menuContent': {
        templateUrl: 'templates/survey.html',
        controller: 'SurveyCtrl'
      }
    }
  })

  .state('app.trivia', {
    url: '/trivia',
    views: {
      'menuContent': {
        templateUrl: 'templates/trivia.html',
        controller: 'TriviaCtrl'
      }
    }
  })

  .state('app.trivia_start', {
    url: '/trivia_start',
    views: {
      'menuContent': {
        templateUrl: 'templates/trivia_start.html',
        controller: 'TriviaStartCtrl'
      }
    }
  })

  .state('app.treasure', {
    url: '/treasure',
    views: {
      'menuContent': {
        templateUrl: 'templates/treasure.html',
        controller: 'TreasureCtrl'
      }
    }
  })

  .state('app.events', {
    url: '/events',
    views: {
      'menuContent': {
        templateUrl: 'templates/events.html',
        controller: 'EventsCtrl'
      }
    }
  })

  .state('app.contacts', {
    url: '/contacts',
    views: {
      'menuContent': {
        templateUrl: 'templates/contacts.html',
        controller: 'ContactsCtrl'
      }
    }
  })

  .state('app.contact', {
    url: '/contact/:userId',
    views: {
      'menuContent': {
        templateUrl: 'templates/contact.html',
        controller: 'ContactCtrl'
      }
    }
  })

  .state('app.books', {
    url: '/books',
    views: {
      'menuContent': {
        templateUrl: 'templates/books.html',
        controller: 'BooksCtrl'
      }
    }
  })

    .state('app.invalid', {
      url: '/invalid',
      views: {
        'menuContent': {
          templateUrl: 'templates/invalid.html'
        }
      }
    })

  .state('app.single', {
    url: '/playlists/:playlistId',
    views: {
      'menuContent': {
        templateUrl: 'templates/playlist.html',
        controller: 'PlaylistCtrl'
      }
    }
  });
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/login');
});
