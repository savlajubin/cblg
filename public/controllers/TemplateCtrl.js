/*@function : TemplateCtrl
 * @author   : Abhishek
 */
app.controller('TemplateCtrl', ['$scope', 'Template', 'Module', '$routeParams', '$route', 'logger', 'CONSTANTS', '$window', function ($scope, Template, Module, $routeParams, $route, logger, CONSTANTS, $window) {
    //$scope.name ="Add";
//save EmailTemplate
 $scope.saveEmailTemplate = function (contact) {
     console.log("dasfgcxvzxcxc"); 
     if(!$routeParams.id){
        Template.saveEmailTemplate().save(contact, function (response) {
            if (response.code == CONSTANTS.CODES.OK) {
//                $location.path('/advcc/contacts');
                window.history.back();
            } else {
                logger.logError(response.message);
            }
        });
    }
    else{
        contact.user_id = $routeParams.id;
        console.log($routeParams.id);
           Template.editEmailTemplate().save(contact, function (response) {
                    if (response.code == 200) {
                        $route.reload();
                        logger.logSuccess(response.message);
                    }
                    else {
                        logger.logError(response.message);
                    }
                })
    }
    };
//Template List
$scope.listForm = true;
$scope.templateList = function () {
    console.log("sdhsuihdushduisahduisah");
        Template.templateList().get({}, function (response) {
            console.log(response);
            if (response.code == CONSTANTS.CODES.OK) {
                   
       
                $scope.lists = response.data;
          
                
                $scope.lists.forEach(function (item) {

                    item.contacts = [];
                   response.data.forEach(function (c) {
                        if (c.list_id == item._id) {
                            console.log(c);
                            item.contacts.push(c);
                        }
                    });
                });
            
                Module.pagination($scope.lists);
            } else {
                Module.pagination({});
                logger.logError(response.message);
            }
        });

    };

//change template Status
  $scope.changetemplatestatus = function (_id, status) {
                var user = {
                    
                    '_id': _id,
                    'status': !status
                }
                console.log(status);
                Template.changetemplatestatus().save(user, function (response) {
                    if (response.code == CONSTANTS.CODES.OK) {
                        $scope.userList = response.data;
                        //Module.pagination(response.data)
                        logger.logSuccess(response.message);
                        $route.reload()
                    } else {
                        logger.logError(response.message);
                    }
                });
            }
// delete Template List
  
  $scope.deleteTemplateList = function (id) {
      console.log("inside delete");
                Template.deleteTemplateList(id).get(function (response) {
                    if (response.code == 200) {
                        $route.reload();
                        logger.logSuccess(response.message);
                    }
                    else {
                        logger.logError(response.message);
                    }
                })
            }

  //Template VIEW 
  $scope.templateView = function (ids) {
                $scope.id = ids
                Template.findByIDTemplate().get({id: $scope.id}, function (response) {
                    if (response.code == CONSTANTS.CODES.OK) {
                        $scope.userInfo = response.data[0];
                    } else {
                        logger.logError(response.message);
                    }
                });
                $scope.showListView = false;
                $scope.showAddPhone = false;
                $scope.showviewcron = false;
                $scope.manageAccess = false;
            }
//Go to previous tab
 $scope.previoustab=function(){
     console.log("nvdjnfdk");
     $window.location.href = '#!/advcc/templateList';
 }


// Edit Template Form POPUP
$scope.getEditEmailTemplateForm = function (user_id,template_name,template) {
            
               
                $scope.editForm = true;
                $scope.listForm = false;
                $scope.template_name = template_name;
                $scope.template = template;
                $scope._id = user_id;
            }

//Edit Template Form
$scope.editEmailTemplate = function (id, template_name,template) {
                Template.editEmailTemplate().save({user_id: id, template_name: template_name, template: template}, function (response) {
                    if (response.code == 200) {
                        $route.reload();
                        logger.logSuccess(response.message);
                    }
                    else {
                        logger.logError(response.message);
                    }
                })
            }
//get templateInfo
 $scope.template_Info = function () {
     if($routeParams.id){
         $scope.name = "Edit"
         
     }
     else{
         $scope.name= "Add"
     }
     
                Template.template_Info().get({id: $routeParams.id}, function (response) {
                    console.log(response);
                    if (response.code == CONSTANTS.CODES.OK) {
                        $scope.LGNuserList = response.data;
                        console.log("Success : " + response.message);
                        $scope.contact=response.data[0];
                        //$scope.contact=response.data[0].template;
                    } else {
                        logger.logError(response.message);
                        console.log('Error :' + response.message);
                    }

                });
            }
    
    
    
}]);
  app.filter('capitalize', function() {
    return function(input) {
      return (!!input) ? input.charAt(0).toUpperCase() + input.substr(1).toLowerCase() : '';
    }
});
  app.filter('append', function() {
    return function(input) {
      if(input.toString().length == 1){
          return '0' + input; 
    }
    else{ 
        return input;
    }
    }
});

