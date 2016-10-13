
var questions = [
	{
		'question': 'Which city has the largest electric bus fleet running?',
		'answers': ['Dalian, China', 'London, UK' ,'New York, USA', 'Helsinki, FI' ],
		'correct_answer': 0
	},
	{
		'question': 'How much more efficient is an electric bus compared to a diesel bus?',
		'answers': ['1X', '3X' ,'5X', '7X' ],
		'correct_answer': 2
	},
	{
		'question': 'Which of these pollutants are emitted from diesel buses?',
		'answers': ['Carbon Monoxide', 'Sulfur Oxides' ,'Lead', 'All of the above' ],
		'correct_answer': 3
	},
	{
		'question': 'How many times fewer greenhouse gases does an electric bus emit when compared to a diesel bus?',
		'answers': ['1X', '3X' ,'5X', '7X' ],
		'correct_answer': 2
	},
	{
		'question': 'When did the first electric double-decker bus start running in London?',
		'answers': ['1995', '2000' ,'2011', '2016' ],
		'correct_answer': 3
	},
	{
		'question': 'On average, how many kilometers can an electric bus travel on one charge?',
		'answers': ['50-100', '100-300' ,'300-500', '500-700' ],
		'correct_answer': 2
	},
	{
		'question': 'Where were the first electric buses released in 2009?',
		'answers': ['Calofornia', 'Shanghai' ,'Moscow', 'Paris' ],
		'correct_answer': 1
	},
	{
		'question': 'How many tons of CO2 emissions will electric buses in Geneva, Switzerland eliminate each year ?',
		'answers': ['1000', '500' ,'250', '100' ],
		'correct_answer': 0
	},
	{
		'question': 'How much time does the fastest charging bus need to charge to move from one bus stop to the next?',
		'answers': ['5 min', '1 min' ,'30 sec', '10 sec' ],
		'correct_answer': 3
	},
	{
		'question': 'Which one of these is not a benefit of electric buses?',
		'answers': ['less emissions', 'more efficient' ,'less noise', 'pokemon' ],
		'correct_answer': 1
	}
]

var quiz = angular.module('quiz', ['ngMaterial', 'angular-svg-round-progressbar'])

quiz.config(function($mdThemingProvider) {
  $mdThemingProvider.theme('default')
    .primaryPalette('red', {
      'default': '400'
      })
});

quiz.run(['$rootScope', function($rootScope){

	$rootScope.fullscreen = false;
	$rootScope.initialized = false;


	llb_app.addListener('window_state', function(data){
		if(data.fullscreen)
		{
			$rootScope.$apply(function(){
				$rootScope.fullscreen = true
			})
			
		}
		else
		{
			$rootScope.$apply(function(){
				$rootScope.fullscreen = false
				$rootScope.$broadcast("changed_window_state");
			})


		}
	})

	llb_app.request('window_dimensions')

	llb_app.addListener('window_dimensions', function(data){
		$rootScope.$apply(function(){
			$rootScope.window_dimensions = data
			$rootScope.initialized = true;
		})
	})
}])

quiz.controller('MainController', ['$rootScope' , '$mdDialog', function($rootScope,  $mdDialog){
	var vm = this

	vm.screen = 'start';

	vm.startGame = function()
	{
		vm.screen = 'game';

		$mdDialog.show({
		  controller: 'GameController as vm',
		  templateUrl: 'game.tmpl.html',
		  clickOutsideToClose:false,
		  hasBackdrop: false,
		  fullscreen:true
		})
		.then(function(response){
			if(response.success)
			{
				vm.screen = 'success'
			}
			else
			{
				vm.screen = 'failure'
			}
		})
	}

	$rootScope.$on('changed_window_state', function(){
		vm.screen = 'start';
	})


}])

quiz.controller('GameController', ['$rootScope' , '$scope' , '$interval', '$timeout', '$mdDialog', function($rootScope, $scope, $interval, $timeout, $mdDialog){
	var vm = this;

	$rootScope.$on('changed_window_state', function(){
		$mdDialog.hide({success: false});
	})

	vm.totalTime = 60;
	vm.currentTime = 0;


	vm.timer = $interval(function(){
		vm.currentTime++;
		if(vm.currentTime >= vm.totalTime)
		{
			$mdDialog.hide({success: false})
		}
	}, 1000)

	$scope.$on('$destroy',function(){
		$interval.cancel(vm.timer)
	})

	vm.questions = questions;

	vm.currentIndex = 0;

	vm.answerAnimate = false;

	vm.score = 0;
	vm.battery = 10;

	vm.answer = function(index)
	{
		vm.answerAnimate = true;
		$timeout(function(){
			vm.answerAnimate = false;
			vm.currentIndex++;
			if(vm.currentIndex >= vm.questions.length )
			{
				if(vm.score >= 6)
				{
					$mdDialog.hide({success: true})
				}
				else
				{
					$mdDialog.hide({success: false})
				}
			}

		}, 2000)

		if(index == vm.questions[vm.currentIndex].correct_answer)
		{
			vm.score++;
		}
		else
		{
			vm.battery--;
			if(vm.battery <= 6)
			{
				$timeout(function(){
					$mdDialog.hide({success: false})
				}, 2000)
			}
		}

	}

	vm.shouldAnimate = function(index)
	{
		return (vm.answerAnimate && (index == vm.questions[vm.currentIndex].correct_answer))
	}

	vm.getPowerIcon = function()
	{
		var icon = vm.battery;
		if(icon == 7)
		{
			return '7.gif'
		}
		else
		{
			return icon+'.png'
		}
	}

}])