/*global angular */

/**
 * The main controller for the app. The controller:
 * - retrieves and persists the model via the todoStorage service
 * - exposes the model to the template and provides event handlers
 */
angular.module('todomvc')
    .controller('TodoCtrl', function TodoCtrl($scope, $routeParams, $filter, store, $rootScope, $location) {
        'use strict';

        $scope.currentList = $routeParams.list ? $routeParams.list : false;
        $rootScope.currentList = $scope.currentList;

        store.get($scope.currentList);
        var todos = $scope.todos = store.todos;

        store.getLists();
        var lists = $scope.lists = store.lists;

        $scope.$watch('lists', function () {
            if (!$scope.currentList) {
                if (lists.length) {
                    $location.path('/list/' + lists[0]);
                } else {
                    $location.path('/');
                }
            }
        }, true);

        $scope.newTodo = '';
        $scope.editedTodo = null;

        $scope.addList = function () {
            var newList = $scope.newList.trim();
            if (!newList) {
                return;
            }

            $scope.saving = true;
            store.insertList(newList)
                .then(function success() {
                    $scope.newList = '';
                })
                .finally(function () {
                    $scope.saving = false;
                    $location.path('/list/'+newList);
                });
        }

        $scope.deleteList = function (list) {
            store.deleteList(list)
                .then(function success() {

                })
                .finally(function () {
                    if (list === $scope.currentList) {
                        if ($scope.lists.length) {
                            $location.path('/list/' + $scope.lists[0]);
                        } else {
                            $location.path('/');
                        }
                    }
                });
        };

        $scope.$watch('todos', function () {
            $scope.remainingCount = $filter('filter')(todos, {completed: false}).length;
            $scope.completedCount = todos.length - $scope.remainingCount;
            $scope.allChecked = !$scope.remainingCount;
        }, true);

        // Monitor the current route for changes and adjust the filter accordingly.
        $scope.$on('$routeChangeSuccess', function () {
            var status = $scope.status = $routeParams.status || '';

            $scope.statusFilter = (status === 'active') ?
                    {completed: false} : (status === 'completed') ?
                    {completed: true} : null;
        });

        $scope.addTodo = function () {
            var newTodo = {
                title: $scope.newTodo.trim(),
                completed: false
            };

            if (!newTodo.title) {
                return;
            }

            $scope.saving = true;
            store.insert(newTodo)
                .then(function success() {
                    $scope.newTodo = '';
                })
                .finally(function () {
                    $scope.saving = false;
                });
        };

        $scope.editTodo = function (todo) {
            return;
            $scope.editedTodo = todo;
            // Clone the original todo to restore it on demand.
            $scope.originalTodo = angular.extend({}, todo);
        };

        $scope.saveEdits = function (todo, event) {
            // Blur events are automatically triggered after the form submit event.
            // This does some unfortunate logic handling to prevent saving twice.
            if (event === 'blur' && $scope.saveEvent === 'submit') {
                $scope.saveEvent = null;
                return;
            }

            $scope.saveEvent = event;

            if ($scope.reverted) {
                // Todo edits were reverted-- don't save.
                $scope.reverted = null;
                return;
            }

            todo.title = todo.title.trim();

            if (todo.title === $scope.originalTodo.title) {
                $scope.editedTodo = null;
                return;
            }

            store[todo.title ? 'put' : 'delete'](todo)
                    .then(function success() {
                    }, function error() {
                        todo.title = $scope.originalTodo.title;
                    })
                    .finally(function () {
                        $scope.editedTodo = null;
                    });
        };

        $scope.revertEdits = function (todo) {
            todos[todos.indexOf(todo)] = $scope.originalTodo;
            $scope.editedTodo = null;
            $scope.originalTodo = null;
            $scope.reverted = true;
        };

        $scope.removeTodo = function (todo) {
            store.delete(todo);
        };

        $scope.saveTodo = function (todo) {
            store.put(todo);
        };

        $scope.toggleCompleted = function (todo, completed) {
            if (angular.isDefined(completed)) {
                todo.completed = completed;
            }
            store.put(todo, todos.indexOf(todo))
                    .then(function success() {
                    }, function error() {
                        todo.completed = !todo.completed;
                    });
        };

        $scope.clearCompletedTodos = function () {
            store.clearCompleted();
        };

        $scope.markAll = function (completed) {
            todos.forEach(function (todo) {
                if (todo.completed !== completed) {
                    $scope.toggleCompleted(todo, completed);
                }
            });
        };
    });
