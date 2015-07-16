var innodroid = angular.module('innodroid', []);

innodroid.filter('to_trusted', ['$sce', function($sce){
  return function(text) {
    return $sce.trustAsHtml(text);
  };
}]);

innodroid.controller('testimonials', ['$scope', function($scope) {
  $scope.testimonials = testimonialsLoad;
  $scope.selectedTestimonial = {};

  $scope.showTestimonial = function(testimonial) {
    $scope.selectedTestimonial = testimonial;
    $('#tstmodal').modal('show');
  }
}]);

innodroid.controller('projects', ['$scope', function($scope) {
  $scope.projects = projectsLoad;
  $scope.selectedProject = {};

  $scope.showProject = function(proj) {
    if (!proj.description) {
      window.open(proj.link);
    } else {
      $scope.selectedProject = proj;
      $('#projmodal').modal('show');
    }
  }
}]);

