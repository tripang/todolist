/*global angular */

/**
 * Services that persists and retrieves todos from localStorage or a backend API
 * if available.
 *
 * They both follow the same API, returning promises for all changes to the
 * model.
 */
angular.module('todomvc')
    .factory('todoStorage', function ($http, $injector) {
        'use strict';

        // Detect if an API backend is present. If so, return the API module, else
        // hand off the localStorage adapter
        return $http.get('/api')
            .then(function () {
                return $injector.get('api');
            }, function () {
                return $injector.get('localStorage');
            });
    })

    .factory('api', function ($http, $rootScope) {
        'use strict';

        var store = {
            todos: [],
            lists: [],
            getLists: function () {
                return $http.get('/api/todos/lists')
                    .then(function (resp) {
                        angular.copy(resp.data, store.lists);
                        return store.lists;
                    });
            },
            insertList: function (list) {
                var originalLists = store.lists.slice(0);

                return $http.get('/api/todos/list/insert/'+list)
                    .then(function success() {
                        store.lists.push(list);
                        return store.lists;
                    }, function error() {
                        angular.copy(originalLists, store.lists);
                        return store.lists;
                    });
            },
            deleteList: function (list) {
                var originalLists = store.lists.slice(0);

                store.lists.splice(store.lists.indexOf(list), 1);

                return $http.get('/api/todos/list/delete/' + list)
                    .then(function success() {
                        return store.lists;
                    }, function error() {
                        angular.copy(originalLists, store.lists);
                        return store.lists;
                    });
            },
            delete: function (todo) {
                var originalTodos = store.todos.slice(0);

                store.todos.splice(store.todos.indexOf(todo), 1);

                return $http.get('/api/todos/delete?' + getUri(todo))
                        .then(function success() {
                            return store.todos;
                        }, function error() {
                            angular.copy(originalTodos, store.todos);
                            return originalTodos;
                        });
            },
            get: function (list) {
                return $http.get('/api/todos/get?list=' + list)
                        .then(function (resp) {
                            angular.copy(resp.data, store.todos);
                            return store.todos;
                        });
            },
            insert: function (todo) {
                var originalTodos = store.todos.slice(0);

                return $http.get('/api/todos/insert?' + getUri(todo))
                        .then(function success(resp) {
                            todo.id = resp.data.id;
                            store.todos.push(todo);
                            return store.todos;
                        }, function error() {
                            angular.copy(originalTodos, store.todos);
                            return store.todos;
                        });
            },
            put: function (todo) {
                var originalTodos = store.todos.slice(0);

                return $http.get('/api/todos/put?'+getUri(todo))
                    .then(function success() {
                        return store.todos;
                    }, function error() {
                        angular.copy(originalTodos, store.todos);
                        return originalTodos;
                    });
            }
        };

        function getUri(obj) {
            obj['list'] = $rootScope.currentList;
            return Object.keys(obj).map(function(k) {
                return encodeURIComponent(k) + '=' + encodeURIComponent(obj[k]);
            }).join('&');
        }

        return store;
    })

    .factory('localStorage', function ($q) {
        'use strict';

        var STORAGE_ID = 'todos-angularjs';

        var store = {
            todos: [],
            _getFromLocalStorage: function () {
                return JSON.parse(localStorage.getItem(STORAGE_ID) || '[]');
            },
            _saveToLocalStorage: function (todos) {
                localStorage.setItem(STORAGE_ID, JSON.stringify(todos));
            },
            clearCompleted: function () {
                var deferred = $q.defer();

                var completeTodos = [];
                var incompleteTodos = [];
                store.todos.forEach(function (todo) {
                    if (todo.completed) {
                        completeTodos.push(todo);
                    } else {
                        incompleteTodos.push(todo);
                    }
                });

                angular.copy(incompleteTodos, store.todos);

                store._saveToLocalStorage(store.todos);
                deferred.resolve(store.todos);

                return deferred.promise;
            },
            delete: function (todo) {
                var deferred = $q.defer();

                store.todos.splice(store.todos.indexOf(todo), 1);

                store._saveToLocalStorage(store.todos);
                deferred.resolve(store.todos);

                return deferred.promise;
            },
            get: function () {
                var deferred = $q.defer();

                angular.copy(store._getFromLocalStorage(), store.todos);
                deferred.resolve(store.todos);

                return deferred.promise;
            },
            insert: function (todo) {
                var deferred = $q.defer();

                store.todos.push(todo);

                store._saveToLocalStorage(store.todos);
                deferred.resolve(store.todos);

                return deferred.promise;
            },
            put: function (todo, index) {
                var deferred = $q.defer();

                store.todos[index] = todo;

                store._saveToLocalStorage(store.todos);
                deferred.resolve(store.todos);

                return deferred.promise;
            }
        };

        return store;
    });
