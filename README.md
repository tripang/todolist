Todo list - test task
=======

A Symfony project created on June 16, 2015, 10:48 pm.

# Installation

git clone git@github.com:tripang/todolist.git

cd todolist

Checkout to runfix branch - get files from gitignore

git checkout runfix

Configurate MySQL params:

nano app/config/parameters.yml

Then:

php app/console doctrine:database:create

php app/console doctrine:schema:update --force

php app/console server:run

Now site must be available at http://localhost:8000/

# api-version

http://localhost:8000/angularjs/

The frontend is made on AngularJS. Most of this elements is a copypasted from TodoMVC.

# todo:

Optimise api-requests.
