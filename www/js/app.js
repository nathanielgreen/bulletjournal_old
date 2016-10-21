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
        items: []
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

.factory('Items', function() {
  return {
    all: function() {
      var itemString = window.localStorage['items'];
      if(itemString) {
        return angular.fromJson(itemString);
      }
      return [];
    },
    save: function(items) {
      window.localStorage['items'] = angular.toJson(items);
    },
    newItem: function(itemTitle) {
      return {
        title: itemTitle,
        item: []
      };
    }
  }
})


.controller('DailyCtrl', function($scope, $timeout, $ionicModal, 
      Logs, Items, $ionicSideMenuDelegate, $ionicPopup) {

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

  $scope.items = Items.all();

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
  $ionicModal.fromTemplateUrl('new-item.html', function(modal) {
    $scope.itemModal = modal;
  }, {
    scope: $scope
  });

  
  $scope.createItem = function(item) {
    if(!$scope.activeLog || !item) {
      return;
    }
    $scope.items.push({
      title: item.title,
      type: item.type,
      icon: checkItemType(item)
    });
    Items.save($scope.items);
    console.log($scope.items);
    $scope.itemModal.hide();

    // Inefficient, but save all the logs
    Logs.save($scope.logs);

    item.title = "";
    item.type = "";
  };

  $scope.deleteLog = function(log) {
    var logIndex = $scope.logs.indexOf(log);
    console.log($scope.logs);
    console.log(logIndex);
    $scope.logs.splice(logIndex, 1);
    Logs.save($scope.logs);
  };

  $scope.deleteItem = function(item) {
    var itemIndex = $scope.items.indexOf(item);
    $scope.items.splice(itemIndex, 1);
    Items.save($scope.items);
  };

  $scope.newItem = function() {
    $scope.itemModal.show();
  };

  $scope.closeNewItem = function() {
    $scope.itemModal.hide();
  }

  $scope.toggleLogs = function() {
    $ionicSideMenuDelegate.toggleLeft();
  };

  $scope.toggleTaskCompletion = function() {
  };

	$scope.confirmItemDelete = function(item) {
		var confirmPopup = $ionicPopup.confirm({
			title: 'Delete Item',
			template: 'Are you sure you want to delete this item?'
		});

		confirmPopup.then(function(res) {
      if(res) {
        $scope.deleteItem(item);
			} else {
				console.log('You are not sure');
			}
		});
  };

  $scope.confirmLogDelete = function(log) {
    var confirmPopup = $ionicPopup.confirm({
      title: 'Delete Log',
      template: 'Are you sure you want to delete this log?'
    });

    confirmPopup.then(function(res) {
      if(res) {
        $scope.deleteLog(log);
      } else {
        console.log('You are not sure');
      }
    });
  };

  checkItemType = function(item) {
    if(item.type == "Task"){  return "ion-android-checkbox-outline-blank" }
    if(item.type == "Event"){ return "ion-android-radio-button-off" }
    if(item.type == "Note"){  return "ion-android-remove" }
  };

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

