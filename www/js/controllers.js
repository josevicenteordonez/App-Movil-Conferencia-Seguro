angular.module('starter.controllers', ['ionic.cloud','starter.directives'])

.controller('AppCtrl', function($scope, $ionicModal, $timeout, $ionicPush, $state, $http, $ionicPopup, $rootScope,$localStorage) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});
  
    $rootScope.menuEnabled = true;

  //Para poder mostrar la foto en el menu
  if($localStorage.picture_url){
      $rootScope.picture_url = $localStorage.picture_url;    
  }

  $rootScope.goToPage = function(route){
    $state.go('app.' + route);
  }

 //Verifica que el usuario está autenticado
 /* $scope.checkUser = function(){
    if (typeof $rootScope.$storage === 'undefined'){
      return false;
    }else{
      return $localStorage.id;
    }
  }
  */
  //Registro del token del dispositivo
  $ionicPush.register().then(function(t) {
    return $ionicPush.saveToken(t);
  }).then(function(t) {
    
      console.log('Token saved:', t.token);

      $http.post($rootScope.wsDomain + "/register_token/" + t.token)
      .success(function(data) {

        console.log(data.result.token);

        if(typeof data.result !== 'undefined'){
          //Sabremos que por debajo se registró el token correctamente o que ya estaba registrado
        }else{
          //console.log(data.result);
          var alertPopup = $ionicPopup.alert({
          title: 'Error al registrar el token',
          template: 'No podrá recibir notificaciones en este dispositivo. Contacte al Administrador'
          });
        }
      })
      .error(function(data) {
          console.log('error de servidor');
          var alertPopup = $ionicPopup.alert({
          title: 'Error de servidor al registrar el token',
          template: 'No podrá recibir notificaciones en este dispositivo. Asegúrese que tiene conexión a Internet y reinicie la aplicación'
          }) 
      });
  });

  //Escuchando por las notificaciones PUSH. Cuando reciba una notificación, mostrará la misma y redireccionará al link enviado
  $scope.$on('cloud:push:notification', function(event, data) {
    var msg = data.message;
    //alert(msg.title + ': ' + msg.text); //notificación PUSH

    swal({
      title: "Foco en el Cliente",   
      text: msg.text,   
      html: true });

    /*console.log('GUSTRAPO: ' + data.message.payload.state);
    for (var prop in data.message.payload) {
      console.log("obj." + prop + " = " + data.message.payload[prop]);
    }
    */
    //Redirección a la sección especificada en el campo state
    $state.go(data.message.payload.state);

  });

  //CONSULTO LOS PARAMETROS GLOBALES PARA VER SI LA TRIVIA, ENCUESTA y GALERIA ESTAN ACTIVADAS
  $http.get($rootScope.wsDomain + "/get_parameters")
      .success(function(data) {
                console.log(data);

                var params = data.results;

          for (var i=0 ; i < params.length; i++){

            console.log(params[i]["code"]);

              if (params[i]['code'] == 'TRIVIA_HABILITADO'){

                if(params[i]['value'] == 'SI'){
                  $rootScope.triviaHabilitado = true;
                }else{
                  $rootScope.triviaHabilitado = false;
                }
              }

              if (params[i]['code'] == 'GALERIA_HABILITADO'){

                if(params[i]['value'] == 'SI'){
                  $rootScope.galeriaHabilitado = true;
                }else{
                  $rootScope.galeriaHabilitado = false;
                }
              }

              if (params[i]['code'] == 'ENCUESTA_HABILITADO'){

                if(params[i]['value'] == 'SI'){
                  $rootScope.encuestaHabilitado = true;
                }else{
                  $rootScope.encuestaHabilitado = false;
                }
              }

          }

        }).error(function(data) {
              console.log('error de servidor');
        });

})

.controller('LogoutCtrl',function($rootScope,$scope,$state,$localStorage,$ionicLoading){

//    $localStorage.$reset(); //para borrar todo
    //Borramos la data que exista en el localStorage
    delete $localStorage.id;
    delete $localStorage.name;
    delete $localStorage.email;
    delete $localStorage.active;
    delete $localStorage.picture_url;

    $ionicLoading.hide();

    $state.go('app.login');
    
})


.controller('LoginCtrl',function($scope,$rootScope,$http, $q,$state,$ionicPopup,$ionicHistory,$ionicLoading,$localStorage,$location){

    $scope.formData = {};

    $scope.loginData = {
      'title': 'Iniciar Sesión',
      'email' : 'Usuario (tu e-mail de La Caja)',
      'password' : 'Contraseña',
      'submit' : 'Ingresar'
    };

    //Si abren la app pero ya se habia logueado, se salta la pantalla de login
    if($localStorage.id){

      $ionicHistory.nextViewOptions({
        disableBack: true
      });

      $state.go('app.events');
      //$state.transitionTo('app.books', {}, { reload: true, inherit: true, notify: true });
      //$location.path('/app/books');
      //alert($location.path());
    }

    $scope.login = function(){ 

      if ($scope.formData.email && $scope.formData.password){

        $ionicLoading.show();

        //var d = $q.defer();

        //Borramos la data que exista en el localStorage
        delete $localStorage.id;
        delete $localStorage.name;
        delete $localStorage.email;
        delete $localStorage.active;
        delete $localStorage.picture_url;

        $http.get($rootScope.wsDomain + "/authenticate_user/" + $scope.formData.email + "/" + $scope.formData.password)
            .success(function(data) {
                console.log(data);
                //d.resolve('data received');

              if(data.user.length>0){

                  //Para evitar que muestre la flecha de Back
                  $ionicHistory.nextViewOptions({
                    disableBack: true
                  });

                  ////Guardo variables que funcionarán como variables de sesión en toda la app (tanto en storage como en rootScope.user_id porsia)
                  $rootScope.$storage = $localStorage.$default(data['user'][0]);
                  $rootScope.user_id = data['user'][0].id;

                  console.log('el id del usuario con localStorage es: ' + $localStorage.id);
                  console.log('el id del usuario con la variable $rootScope.user_id es: ' + $rootScope.user_id);

                  //Para poder mostrar la foto en el menu
                  $rootScope.picture_url = $localStorage.picture_url;

                  if (data['user'][0].active == false){

                    //Limpio los inputs
                    $scope.formData.email = null;
                    $scope.formData.password = null;

                    //Y lo enviamos a crear una clave propia ya que está en active = 0
                    $state.go('app.reset_password');

                  }else{

                      $rootScope.menuEnabled = true;

                      //Esta llamada es únicamente para tomar la foto de perfil y colocarla en el menú
                    /*  $http.get($rootScope.wsDomain + "/get_user/" + $localStorage.id)
                      .success(function(data) {
                          //console.log(JSON.stringify(data.results[0]));
                          $rootScope.picture_url = data.results[0].picture_url;
                          $ionicLoading.hide();
                      })
                      .error(function(data) {
                          console.log('error de servidor');
                          $ionicLoading.hide();
                      });
                      */
                      //Pantalla de inicio
                      $state.go('app.welcome');
                    }

              }else{

                    var alertPopup = $ionicPopup.alert({
                      title: 'Login fallido',
                      template: 'Por favor revise sus credenciales'
                    });
              }
              
              $ionicLoading.hide();

            })
            .error(function(data) {
              //console.log(data);
               // d.reject('the request had a problem');
                var alertPopup = $ionicPopup.alert({
                  title: 'Login fallido',
                  template: 'Error de servidor'
                  });
                $ionicLoading.hide();
            });
        }

    };

})

.controller('WelcomeCtrl',function($scope, $rootScope,$http,$ionicLoading,$localStorage,$ionicHistory){

  $ionicHistory.nextViewOptions({
      disableBack: true
  });

  $scope.welcomeData = {
      'title': '¡Bienvenidos!',
      'subtitle' : 'Convención 2016',
      'button' : 'Agenda'
    };
	
	$scope.showAgenda = function(){
		$state.go('app.events');
	};

})

.controller('PasswordCtrl', ['$scope','$http','$ionicHistory','$state','$rootScope','$ionicLoading','$ionicPopup','$localStorage', 
                     function($scope, $http, $ionicHistory, $state,$rootScope,$ionicLoading,$ionicPopup,$localStorage){

      $scope.formData = {};

      //Para evitar que muestre la flecha de Back
      $ionicHistory.nextViewOptions({
          disableBack: true
      });

      //Desactivo el menu para que no puedan verlo porque todavia no estan autenticados
      $rootScope.menuEnabled = false;


      $scope.sendEmail = function(){
            
            console.log($scope.formData.email);

            var config = {
                      headers : {
                          'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;'
                  }
            }

            $http.post($rootScope.wsDomain + "/send_email/" + $scope.formData.email, config)
              .success(function(data) {

                  console.log(data);

                  if (data.emailSent == true){

                    $ionicLoading.hide();
                    $state.go('app.login');                      
                  
                  }else{
                  
                    var alertPopup = $ionicPopup.alert({
                        title: 'Dirección no encontrada',
                        template: 'Error al enviar el email. Intente nuevamente'
                        });
                    $ionicLoading.hide();
                  }

              })
              .error(function(data) {
                  console.log('error de servidor');
                  $ionicLoading.hide();
              });

      };

      $scope.resetPassword = function(){

        $ionicLoading.show();

        if ($scope.formData.password === $scope.formData.passwordConfirmation){

            var config = {
                      headers : {
                          'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;'
                  }
            }

            $http.post($rootScope.wsDomain + "/reset_password/" + $localStorage.id + "/" + $scope.formData.password, config)
              .success(function(data) {
                  
                  $ionicLoading.hide();
                  $state.go('app.login');
                  
              })
              .error(function(data) {
                  console.log('error de servidor');
                  $ionicLoading.hide();
              });

        }else{

              var alertPopup = $ionicPopup.alert({
                  title: 'Contraseña no coincide',
                  template: 'Su contraseña nueva debe coincidir en los dos campos'
                  });
                $ionicLoading.hide();

        }

      };

}])

.controller('ProfileCtrl', ['$scope','$http','$ionicHistory','$state','$rootScope','$ionicLoading','$ionicPopup','$localStorage','$cordovaCamera','$cordovaFileTransfer', 
                     function($scope, $http, $ionicHistory, $state,$rootScope,$ionicLoading,$ionicPopup,$localStorage,$cordovaCamera,$cordovaFileTransfer){


      $scope.profilePicUrl = '';

      $scope.choosePhoto = function () {

        var options = {
          quality: 100,
          destinationType: Camera.DestinationType.FILE_URI,
          sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
          allowEdit: true,
          encodingType: Camera.EncodingType.JPEG,
          targetWidth: 800,
          targetHeight: 800,
          popoverOptions: CameraPopoverOptions,
          saveToPhotoAlbum: false
        };

        //Funcion para capturar la imagen desde la galeria de fotos
        $cordovaCamera.getPicture(options).then(function (imageURI) {
                //$scope.imgURI = "data:image/jpeg;base64," + imageData;

                $scope.profilePicUrl = imageURI;

                var backgroundPic = document.getElementById('profileBackground');
                var profilePic = document.getElementById('profilePicture');
                var profileThumb = document.getElementById('profileThumb');
                backgroundPic.src = $scope.profilePicUrl;
                profilePic.src = $scope.profilePicUrl;
                profileThumb.src = $scope.profilePicUrl;

                console.log($scope.profilePicUrl);

            }, function (err) {
                // An error occured. Show a message to the user
                console.log(err);
            });

      }


      $scope.saveProfile = function(){

        $ionicLoading.show();

        var server = $rootScope.wsDomain + "/upload_image";
        var filePath = $scope.profilePicUrl;
        var uploadOptions = {
            quality: 100
        };


        var config = {
                  headers : {
                      'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;'
              }
        }


        if ($scope.profilePicUrl != ''){

            //Esta funcion es la que sube la imagen al servidor
            $cordovaFileTransfer.upload(server, filePath, uploadOptions)
              .then(function(result) {
                //console.log('profile image uploaded to server!');
                var dataResponse = JSON.parse(result.response);
                $scope.profile.picture_url = $rootScope.wsDomain + '/img/users/' + dataResponse.results;


                  //Y esta función es la que guarda en BD los datos del perfil (tuve que repetirla mas abajo, no queda de otra)
                  $http.post($rootScope.wsDomain + "/update_user/" + $localStorage.id, JSON.stringify($scope.profile), config)
                    .success(function(data) {
                        //console.log(JSON.stringify(data));
                        $ionicLoading.hide();
                    })
                    .error(function(data) {
                        console.log('error de servidor');
                        $ionicLoading.hide();
                    });

              }, function(err) {
                
                console.log(JSON.stringify(err));

                $ionicLoading.hide();

                var alertPopup = $ionicPopup.alert({
                    title: 'Error cargando imagen',
                    template: 'Ha ocurrido un error cargando la imagen. Intente más tarde'
                });

              }, function (progress) {
                // constant progress updates
              });


        }else{

            //Tuve que repetir esta llamada porque si no anido las llamadas http, no las ejecuta todas.
            $http.post($rootScope.wsDomain + "/update_user/" + $localStorage.id, JSON.stringify($scope.profile), config)
              .success(function(data) {
                  //console.log(JSON.stringify(data));
                  $ionicLoading.hide();
              })
              .error(function(data) {
                  console.log('error de servidor');
                  $ionicLoading.hide();
              });

        }

      }



      $scope.loadProfile = function(){

          $ionicLoading.show();

          console.log('el id del usuario con localStorage es: ' + $localStorage.id);
          console.log('el id del usuario con la variable $rootScope.user_id es: ' + $rootScope.user_id);

          //Si la variable es indefinida, entonces sacalo del storage.
          if (typeof $rootScope.user_id == 'undefined'){
            $rootScope.user_id = $localStorage.id;
          }

          $http.get($rootScope.wsDomain + "/get_user/" + $localStorage.id)
            .success(function(data) {
                //console.log(JSON.stringify(data.results[0]));
                $scope.profile = data.results[0];
                $ionicLoading.hide();
            })
            .error(function(data) {
                console.log('error de servidor');
                $ionicLoading.hide();
            });

          $scope.$broadcast('scroll.refreshComplete');

      }

      $scope.loadProfile();

}])

.controller('SurveyCtrl', ['$scope','$http','$rootScope','$state','$timeout','$ionicLoading','$localStorage','$ionicHistory',
                    function($scope,$http,$rootScope,$state,$timeout,$ionicLoading,$localStorage,$ionicHistory) {

        $scope.congrats = {};

        //Para evitar que muestre la flecha de Back
        $ionicHistory.nextViewOptions({
            disableBack: true
        });


        $scope.loadSurvey = function(){

          $ionicLoading.show();

          //CONSULTO LOS PARAMETROS GLOBALES PARA VER SI LA TRIVIA, ENCUESTA y GALERIA ESTAN ACTIVADAS
          $http.get($rootScope.wsDomain + "/get_parameters")
            .success(function(data) {

                var params = data.results;

                for (var i=0 ; i < params.length; i++){

                  //console.log(params[i]["code"]);

                  if (params[i]['code'] == 'ENCUESTA_HABILITADO'){

                      var valor = params[i]['value'];

                    if(valor.toLowerCase() == 'si'){


                            $scope.surveyData = {
                              'title' : 'Nos importa tu opinión',
                              'description' : 'Contanos como fué tu experiencia para que podamos seguir mejorando.'
                            };

                            $http.get($rootScope.wsDomain + "/get_survey/" + $localStorage.id)
                              .success(function(data) {
                                $scope.questions = data.results;
                                console.log($scope.questions);
                                //Si se llenaron las preguntas, es porque se puede mostrar la encuesta, entonces se cargan las preguntas
                                if ($scope.questions){

                                  $scope.answers = [];
                                  $scope.questions.forEach(function(e,i){
                                    $scope.answers.push(e.answers); 
                                  });

                                }else{
                                  $scope.surveyData = {};
                                  $scope.congrats = {
                                    'img_url': 'img/encuesta_gracias.png',
                                    'message': '¡Gracias por participar!'
                                  }
                                  //$scope.message = "Gracias por haber respondido la encuesta!";                      
                                }
                                $ionicLoading.hide();

                            })
                            .error(function(data) {
                                console.log('error de servidor');
                                $ionicLoading.hide();
                            });



                    }else{

                      $ionicLoading.hide();

                      /*var alertPopup = $ionicPopup.alert({
                        title: 'Sección no habilitada',
                        template: 'Aún no se puede visitar esta sección'
                      });*/

                      $state.go('app.invalid');
                      
                    }

                    break;

                }

              }

          }).error(function(data) {
                console.log('error de servidor');
          });



        };



        $scope.sendResults = function(){

            $ionicLoading.show();

            var config = {
                      headers : {
                          'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;'
                  }
            }

            //Llamo al WS que guarda la respuesta de la pregunta
            $http.post($rootScope.wsDomain + "/send_survey/" + $localStorage.id, $scope.questions, config)
            .success(function(data){
                console.log('enviada la encuesta',data);
                $ionicLoading.hide();
                //$timeout(function () {
                    
                    $scope.loadSurvey();
                
                //}, 5000);

            })
            .error(function(data){
              console.log('error de servidor');
              $ionicLoading.hide();
            })

        };

        $scope.loadSurvey();
      
      /*}else{
          $state.go('app.login');
      }*/

}])

.controller('TriviaStartCtrl', ['$interval','$scope','$http','$rootScope','$ionicLoading','$state','$ionicHistory','$localStorage', '$ionicPopup' ,
                  function($interval,$scope,$http,$rootScope,$ionicLoading,$state,$ionicHistory,$localStorage,$ionicPopup) {

    //Para evitar que muestre la flecha de Back
    $ionicHistory.nextViewOptions({
        disableBack: true
    });

    $scope.loadTriviaStart = function(){

        $ionicLoading.show();

        //CONSULTO LOS PARAMETROS GLOBALES PARA VER SI LA TRIVIA, ENCUESTA y GALERIA ESTAN ACTIVADAS
        $http.get($rootScope.wsDomain + "/get_parameters")
            .success(function(data) {
                //console.log(data);

            var params = data.results;

            for (var i=0 ; i < params.length; i++){

              //console.log(params[i]["code"]);

                if (params[i]['code'] == 'TRIVIA_HABILITADO'){

                  var valor = params[i]['value'];

                  if(valor.toLowerCase() == 'si'){
                  
                    
                        $http.get($rootScope.wsDomain + "/get_trivia/" + $localStorage.id)
                          .success(function(data) {
                             $scope.questions = data.results;

                             if ($scope.questions){
                              
                              $scope.infoTrivia = {
                                'image':'img/triviainicio.png',
                                'title':'¡Trivia!',
                                'subtitle':'25 preguntas / 5 minutos',
                                'description':'Demostrá cuánto sabés de La Caja  y podrás participar por premios sorpresa!!'
                              }

                             }else{
                             
                              $scope.infoTrivia = {};
                              $state.go('app.trivia');

                            }

                            $ionicLoading.hide();
                         })
                          .error(function(data) {
                              console.log('error de servidor');
                              $ionicLoading.hide();
                          });


                  
                  }else{

                      $ionicLoading.hide();

                      /*var alertPopup = $ionicPopup.alert({
                        title: 'Sección no habilitada',
                        template: 'Aún no se puede visitar esta sección'
                      });*/

                      $state.go('app.invalid');
                  }

                  break;

                }

            }

          }).error(function(data) {
                console.log('error de servidor');
          });

    }

    $scope.loadTriviaStart();

}])

.controller('TriviaCtrl', ['$interval','$scope','$http','$rootScope','$ionicLoading','$state','$ionicHistory','$localStorage','$timeout',
                  function($interval,$scope,$http,$rootScope,$ionicLoading,$state,$ionicHistory,$localStorage,$timeout) {

            //$scope.displayThanks = 'none';

            //Para evitar que muestre la flecha de Back
            $ionicHistory.nextViewOptions({
                disableBack: true
            });

            $scope.activated = true;
            $scope.determinateValue = 0;

            var stop;

            $scope.runTimer = function(){
              // Don't start a new fight if we are already fighting
              if ( angular.isDefined(stop) ) return;

                //Asi como esta, es para 20 segundos cada pregunta
                stop = $interval(function() {

                  if ($scope.determinateValue < 100) {
                    $scope.determinateValue += 0.5;
                    $scope.seconds = parseInt(($scope.determinateValue * 2) * 0.1);
                    $scope.miliseconds = (($scope.determinateValue * 2) * 100);

                  } else {
                    $scope.stopTimer();
                  }
                }, 100);

            };

            $scope.stopTimer = function() {
              if (angular.isDefined(stop)) {
                $interval.cancel(stop);
                stop = undefined;
              }
            };

            $scope.resetTimer = function() {
              $scope.determinateValue = 0;
            };

            $scope.$on('$destroy', function() {
              // Make sure that the interval is destroyed too
              $scope.stopTimer();
            });


            //Evento que vigila los cambios de los segundos y cambia los colores de acuerdo a ello
            $scope.$watch('seconds',function(newValue){

              //Para cambiar el color dependiendo del numero
              if (newValue >= 0 && newValue < 7){
                //$scope.currentColor = "{color: 'red-500'}";
                $scope.currentColor = 'green-stroke';
                $scope.currentColorText = 'green-number';
              }
              if (newValue >= 7 && newValue < 15){
                $scope.currentColor = 'orange-stroke';
                $scope.currentColorText = 'orange-number';
              }
              if (newValue >= 15){
                $scope.currentColor = 'red-stroke';
                $scope.currentColorText = 'red-number';
              }
              if (newValue >= 20){
                $scope.goTo($scope.currentPage + 1);
              }

            });

          //Vigilo aparte los milisegundos que demora en responder porque se necesita guardar en BD en milisegundos
          $scope.$watch('miliseconds',function(newValue){
              $scope.miliseconds = newValue;
          });

          $scope.goTo = function (index) {

            $scope.resetTimer();

            //if (index > 0 && index <= $scope.totalItems) {
              if (index > 0 && index <= $scope.totalItems + 1) {
              $scope.currentPage = index;

              var config = {
                    headers : {
                        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;'
                    }
              }

              //Guardo los milisegundos que se tardó en responder para enviarlo al Web Service
              $scope.filteredQuestions[0].time_elapsed = $scope.miliseconds;

              //Llamo al WS que guarda la respuesta de la pregunta
              $http.post($rootScope.wsDomain + "/answer_trivia/" + $localStorage.id, $scope.filteredQuestions, config)
              .success(function(data){
                  //console.log('todo bien', JSON.stringify($scope.filteredQuestions));
                  
                  if(data.result){
                      console.log('pregunta de trivia guardada',data);
                      if (index == $scope.totalItems + 1) {
                        //alert('felicidades, terminaste la trivia');
                        $scope.loadTrivia();
                      }
                  }else{
                      console.log('Ya el usuario habia respondido la trivia',data);
                      //y volvemos a habilitar el menu
                      $rootScope.menuEnabled = true;
                  }
                  $scope.runTimer();
              })
              .error(function(data){
                console.log('error de servidor');
              });

            }
        };

          $scope.loadTrivia = function () {

              //Para que no puedan salirse de esta seccion si empezaron a jugar
              $rootScope.menuEnabled = false;

              $scope.thanksInfo = {};

              $ionicLoading.show();

              $http.get($rootScope.wsDomain + "/get_trivia/" + $localStorage.id)
                .success(function(data) {
                   $scope.questions = data.results;

                   if ($scope.questions){

                     //$rootScope.triviaSolved = false;

                     $scope.totalItems = $scope.questions.length;
                     $scope.itemsPerPage = 1;
                     $scope.currentPage = 1;

                     $scope.runTimer();

                      // $timeout(function () {
                      //   $scope.stopTimer();
                      // },19000);

                     

                     $scope.$watch('currentPage + itemsPerPage', function () {
                       var begin = (($scope.currentPage - 1) * $scope.itemsPerPage),
                       end = begin + $scope.itemsPerPage;

                      $timeout(function () {
                        $scope.filteredQuestions = $scope.questions.slice(begin, end);                      
                      },200);


                     });

                   }else{

                     $scope.thanksInfo = {
                      'url': 'img/triviawin.png',
                      'message' : '¡Gracias por participar!',
                      'message2': 'Esta noche conocerás a los ganadores.'
                    }
                    $rootScope.menuEnabled = true;
                    //$rootScope.triviaSolved = true;
                  }

                  $ionicLoading.hide();
               })
                .error(function(data) {
                    console.log('error de servidor');
                    $ionicLoading.hide();
                });
          };

             $scope.loadTrivia();
      
    }
  ])


.controller('TreasureCtrl', function($scope,$ionicPlatform,$cordovaBarcodeScanner,$http,$rootScope,$state,$ionicLoading,$ionicPopup,$localStorage){

    $scope.loadClue = function(){

      $ionicLoading.show();

      //Llamo al Web Service para obtener la pista asignada
       $http.get($rootScope.wsDomain + "/get_assigned_clue/" + $localStorage.id)
      .success(function(data) {
            console.log(data);
            $scope.clue = data.assigned_clue;

            $scope.currentPage = data.total_clues; //La cant de pistas asignadas nos ayuda a paginar.

            $scope.clues_to_win = data.clues_to_win; //Con ello sabremos qué mostrar en la vista (felicitaciones, pistas, etc)

           $scope.$watch('currentPage', function () {

                 $http.get($rootScope.wsDomain + "/get_assigned_clue/" + $localStorage.id)
                .success(function(data) {

                    console.log(data);

                      $scope.clue = data.assigned_clue;
                      //$scope.new_clue = data.new_clue.clue_id;

                })
                .error(function(data) {
                    console.log('error de servidor');

                });


           });

         $ionicLoading.hide();
      })
      .error(function(data) {
          console.log('error de servidor');
          $ionicLoading.hide();
      });

      $scope.$broadcast('scroll.refreshComplete');

    }

    //Escaneo del código QR (Pista)
    $scope.scanQR = function(index){

        $scope.QRcode = '';

        $ionicPlatform.ready(function() {
        $cordovaBarcodeScanner
          .scan()
          .then(function(barcodeData) {

            console.log(barcodeData.text);
            console.log('el clue id asignado es ' + $scope.clue.clue_id);
            console.log('el QR escaneado fue ' + barcodeData.text);

            if ($scope.clue.clue_id == barcodeData.text){

              $ionicLoading.show();

                     //Llamo al Web Service para obtener la proxima pista
                     $http.get($rootScope.wsDomain + "/get_new_clue/" + $localStorage.id)
                     .success(function(data) {
                      console.log(data);
                      $scope.new_clue = data.new_clue;

                      $scope.currentPage = index;

                       //Si es una pista entre 1 y 9998 es porque aun puede jugar.
                      /* if ($scope.new_clue.clue_id > 0 && $scope.new_clue.clue_id < 9999){

                         $scope.currentPage = index;

                       }
                       if ($scope.new_clue.clue_id == 9999) {
                        $scope.message = "Finalizaste la búsqueda del tesoro!";
                      }*/
                      $ionicLoading.hide();
                    })
                     .error(function(data) {
                      console.log('error de servidor');
                      $ionicLoading.hide();
                    });

                   }else{

                    var alertPopup = $ionicPopup.alert({
                      title: 'Pista no válida',
                      template: 'Escaneaste una pista que no coincide con la que te toca'
                    });
                    console.log('pista no valida');

                  }

          }, function(error) {
            // An error occurred
          });
      });
          // alert(barcodeData.text);

        //$scope.barcodeData = 10;
    }

    $scope.loadClue();

})

.controller('EventsCtrl',function($scope,$http,$rootScope,$ionicLoading,$localStorage,$timeout){

  $scope.loadEvents = function(){

      $scope.firstDay = '2016-09-30';
      $scope.secondDay = '2016-10-01';

      //$ionicLoading.show();          

      $http.get($rootScope.wsDomain + "/get_events")
      .success(function(data) {
          //console.log(data.results);
          $scope.events = data.results;
          $ionicLoading.hide();
      })
      .error(function(data) {
          console.log('error de servidor');
          $ionicLoading.hide();
      });

      $scope.$broadcast('scroll.refreshComplete');

  }

  $scope.toggleGroup = function(event) {
    event.show = !event.show;
  };

  $scope.isGroupShown = function(event) {
    return event.show;
  };



  /* BUG reparado aqui */
  //Si ya habia iniciado sesion y lanza la app, espero unos 2 segundos para cargar la data porque si no, carga en blanco. 
  //Esto se hizo porque como desde el LoginCtrl se redirige a Books, cargaba en blanco y con esto se forza a recargar
  if ($localStorage.id){

      $ionicLoading.show();
          // To refresh the page
      $timeout(function () {

          $scope.loadEvents();

      }, 2000);

  }else{ //si no, cargo la data normal

      $ionicLoading.show();
      $scope.loadEvents();

  }




})

.controller('InformationCtrl',function($scope, $rootScope,$http,$ionicLoading,$localStorage){

  $scope.loadInfo = function(){

    $ionicLoading.show();

    $scope.model = {
      'info': []
    }

    $http.get($rootScope.wsDomain + "/get_general_info")
      .success(function(data) {
          console.log(data.results);
          $scope.model.info = data.results;
          $ionicLoading.hide();
      })
      .error(function(data) {
          console.log('error de servidor');
          $ionicLoading.hide();
      });

      $scope.$broadcast('scroll.refreshComplete');

    }

  $scope.loadInfo();

})

.controller('ContactsCtrl',function($scope, $rootScope,$http,$ionicPlatform,$ionicLoading,$localStorage){

    $ionicPlatform.ready(function() {
      $scope.openURL = function(url){
        cordova.InAppBrowser.open(url, '_blank', 'location=yes');
      }
    });

  $scope.loadContacts = function(){

    $ionicLoading.show();

    $scope.model = {
      'contacts': []
    }

    $http.get($rootScope.wsDomain + "/get_users")
      .success(function(data) {
          console.log(data.results);
          $scope.model.contacts = data.results;
          $ionicLoading.hide();
      })
      .error(function(data) {
          console.log('error de servidor');
          $ionicLoading.hide();
      });

    $scope.showSearch= function(){
      document.getElementById("titulocontacto").classList.add("ocultar");
      document.getElementById("logobusqueda").classList.add("ocultar");
      document.getElementById("search").classList.remove("ocultar");
      document.getElementById("cerrarbusqueda").classList.remove("ocultar");
    };

    $scope.closeSearch= function(){
      document.getElementById("search").classList.add("ocultar");
      document.getElementById("cerrarbusqueda").classList.add("ocultar");
      document.getElementById("titulocontacto").classList.remove("ocultar");
      document.getElementById("logobusqueda").classList.remove("ocultar");
      $scope.model.search={};
    };

    $scope.$broadcast('scroll.refreshComplete');

  }

  $scope.loadContacts();

})

.controller('ContactCtrl',function($scope, $rootScope,$http,$ionicLoading,$stateParams,$localStorage,$ionicPlatform){

    $ionicPlatform.ready(function() {
      $scope.openURL = function(url){
        cordova.InAppBrowser.open(url, '_blank', 'location=yes');
      }
    });

  $scope.loadContact = function(){

    $ionicLoading.show();

    $scope.model = {
      'contact': []
    }

    $http.get($rootScope.wsDomain + "/get_user/" + $stateParams.userId)
      .success(function(data) {
          console.log(data.results);
          $scope.model.contact = data.results[0];
          $ionicLoading.hide();
      })
      .error(function(data) {
          console.log('error de servidor');
          $ionicLoading.hide();
      });

    $scope.$broadcast('scroll.refreshComplete');

  }

  $scope.loadContact();

})

.controller('BooksCtrl',function($scope, $rootScope,$http,$state,$ionicLoading,$ionicPlatform,$cordovaFileTransfer,$timeout,$localStorage,$timeout,$cordovaFileOpener2){

  $scope.downloadFile = function(url){

    $ionicLoading.show({template: 'Descargando...'});

    $ionicPlatform.ready(function() {

      //var targetPath = window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, gotFS, fail);
      if (ionic.Platform.isIOS()){
        var targetPath = cordova.file.tempDirectory;
      }
      if (ionic.Platform.isAndroid()){
        var targetPath = cordova.file.externalDataDirectory;
      }

      var filename = url.split("/").pop();
      
      var trustHosts = true;
      var options = {};

      $cordovaFileTransfer.download(url, targetPath + filename, options, trustHosts)
        .then(function(result) {
          // Success!
          $ionicLoading.hide();
          console.log(result);

            //Una vez descargado el archivo, se abre con la aplicación que tenga por defecto el dispositivo
            $cordovaFileOpener2.open(
              targetPath + filename,
              'application/pdf'
            ).then(function() {
                // file opened successfully
            }, function(err) {
                // An error occurred. Show a message to the user
            });


        }, function(err) {
          // Error
          $ionicLoading.hide();
          console.log(JSON.stringify(err));
        }, function (progress) {
          /*$timeout(function () {
            $scope.downloadProgress = (progress.loaded / progress.total) * 100;
          });*/
        });

     });

  };

  $scope.loadBooks = function(){

    $ionicLoading.show();

    $http.get($rootScope.wsDomain + "/get_books")
      .success(function(data) {
          console.log(data.results);
          $scope.books = data.results;
          $ionicLoading.hide();
      })
      .error(function(data) {
          console.log('error de servidor');
          $ionicLoading.hide();
      });

      //$scope.$broadcast('scroll.refreshComplete');

  }

  $scope.loadBooks();

})

.controller('GalleryCtrl',function($scope, $rootScope,$http,$ionicHistory,$ionicLoading,$state,$localStorage,$ionicPlatform,$cordovaFileTransfer,$cordovaFileOpener2){

    $ionicHistory.nextViewOptions({
        disableBack: true
    });


  $scope.downloadFile = function(url){

    $ionicLoading.show({template: 'Descargando...'});

    $ionicPlatform.ready(function() {

      //var targetPath = window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, gotFS, fail);
      if (ionic.Platform.isIOS()){
        var targetPath = cordova.file.tempDirectory;
      }
      if (ionic.Platform.isAndroid()){
        var targetPath = cordova.file.externalDataDirectory;
      }

      var filename = url.split("/").pop();
      
      var trustHosts = true;
      var options = {};

      $cordovaFileTransfer.download(url, targetPath + filename, options, trustHosts)
        .then(function(result) {
          // Success!
          $ionicLoading.hide();
          console.log(result);

            //Una vez descargado el archivo, se abre con la aplicación que tenga por defecto el dispositivo
            $cordovaFileOpener2.open(
              targetPath + filename,
              'image/jpeg'
            ).then(function() {
                // file opened successfully
            }, function(err) {
                // An error occurred. Show a message to the user
            });


        }, function(err) {
          // Error
          $ionicLoading.hide();
          console.log(JSON.stringify(err));
        }, function (progress) {
          /*$timeout(function () {
            $scope.downloadProgress = (progress.loaded / progress.total) * 100;
          });*/
        });

     });

  };


    $scope.loadPictures = function(){

      $ionicLoading.show();

      //CONSULTO LOS PARAMETROS GLOBALES PARA VER SI LA TRIVIA, ENCUESTA y GALERIA ESTAN ACTIVADAS
      $http.get($rootScope.wsDomain + "/get_parameters")
        .success(function(data) {

          var params = data.results;

          for (var i=0 ; i < params.length; i++){

              if (params[i]['code'] == 'GALERIA_HABILITADO'){

                var valor = params[i]['value'];

                if(valor.toLowerCase() == 'si'){
                
                    $http.get($rootScope.wsDomain + "/get_gallery")
                      .success(function(data) {
                          
                          $scope.galleryData = {
                            'title': '22 de Noviembre'
                          };
                          $scope.pictures = data.results;
                          $ionicLoading.hide();
                      })
                      .error(function(data) {
                          console.log('error de servidor');
                          $ionicLoading.hide();
                      });
                
                }else{
                
                      $ionicLoading.hide();

                      /*var alertPopup = $ionicPopup.alert({
                        title: 'Sección no habilitada',
                        template: 'Aún no se puede visitar esta sección'
                      });*/

                      $state.go('app.invalid');
                
                }
              
                break;

              }

          }

        }).error(function(data) {
              console.log('error de servidor');
        });







  }

  $scope.loadPictures();

})

.controller('PlaylistsCtrl', function($scope) {
  $scope.playlists = [
    { title: 'Reggae', id: 1 },
    { title: 'Chill', id: 2 },
    { title: 'Dubstep', id: 3 },
    { title: 'Indie', id: 4 },
    { title: 'Rap', id: 5 },
    { title: 'Cowbell', id: 6 }
  ];
})

.controller('PlaylistCtrl', function($scope, $stateParams) {
});