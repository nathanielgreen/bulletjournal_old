angular.module('bulletjournal', ['ionic'])

.factory('Logs', function() {
  return {
    all: function() {
      var logString = window.localStorage['logs'];
      if(logString) {
        return angular.fromJson(logString);
      }
      return [];
    },
    save: function(logs) {
      window.localStorage['logs'] = angular.toJson(logs);
    },
    newLog: function(logTitle) {
      // Add a new log
      return {
        title: logTitle,
        tasks: []
      };
    },
    getLastActiveIndex: function() {
      return parseInt(window.localStorage['lastActiveLog']) || 0;
    },
    setLastActiveIndex: function(index) {
      window.localStorage['lastActiveLog'] = index;
    }
  }
})

.controller('DailyCtrl', function($scope, $timeout, $ionicModal, Logs, $ionicSideMenuDelegate) {

  // A utility function for creating a new log
  // with the given logTitle
  var createLog = function(logTitle) {
    var newLog = Logs.newLog(logTitle);
    $scope.logs.push(newLog);
    Logs.save($scope.logs);
    $scope.selectLog(newLog, $scope.logs.length-1);
  }


  // Load or initialize logs
  $scope.logs = Logs.all();

  // Grab the last active, or the first log
  $scope.activeLog = $scope.logs[Logs.getLastActiveIndex()];

  // Called to create a new log
  $scope.newLog = function() {
    var logTitle = prompt('Log name');
    if(logTitle) {
      createLog(logTitle);
    }
  };

  // Called to select the given log
  $scope.selectLog = function(log, index) {
    $scope.activeLog = log;
    Logs.setLastActiveIndex(index);
    $ionicSideMenuDelegate.toggleLeft(false);
  };

  // Create our modal
  $ionicModal.fromTemplateUrl('new-task.html', function(modal) {
    $scope.taskModal = modal;
  }, {
    scope: $scope
  });

  $scope.createTask = function(task) {
    if(!$scope.activeLog || !task) {
      return;
    }
    $scope.activeLog.tasks.push({
      title: task.title
    });
    $scope.taskModal.hide();

    // Inefficient, but save all the logs
    Logs.save($scope.logs);

    task.title = "";
  };

  $scope.newTask = function() {
    $scope.taskModal.show();
  };

  $scope.closeNewTask = function() {
    $scope.taskModal.hide();
  }

  $scope.toggleLogs = function() {
    $ionicSideMenuDelegate.toggleLeft();
  };

  $scope.toggleTaskCompletion = function() {
  };


  // Try to create the first log, make sure to defer
  // this by using $timeout so everything is initialized
  // properly
  $timeout(function() {
    if($scope.logs.length == 0) {
      while(true) {
        var logTitle = prompt('Your first log title:');
        if(logTitle) {
          createLog(logTitle);
          break;
        }
      }
    }
  }, 1000);

})

.directive('iconSwitcher', function() {
  
  return {
    restrict : 'A',
    
    link : function(scope, elem, attrs) {
      
      var currentState = true;
      
      elem.on('click', function() {
        
        if(currentState === true) {
          angular.element(elem).removeClass(attrs.onIcon);
          angular.element(elem).addClass(attrs.offIcon);
        } else {
          angular.element(elem).removeClass(attrs.offIcon);
          angular.element(elem).addClass(attrs.onIcon);
        }
        
        currentState = !currentState

      });
      
      
    }
  };
});  
