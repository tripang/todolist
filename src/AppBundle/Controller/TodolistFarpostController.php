<?php

namespace AppBundle\Controller;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;

use AppBundle\Entity\TaskList;
use AppBundle\Entity\Task;

/*
 * Установка MySQL
 *
 * Установить параметры базы:
 * nano app/config/parameters.yml
 *
 * php app/console doctrine:database:create
 * php app/console doctrine:schema:update --force
 */

/**
* @Route("/")
*/
class TodolistFarpostController extends Controller
{
    /**
     * @Route("", name="lists")
     */
    public function listsAction()
    {
        $lists = $this->getDoctrine()
            ->getRepository('AppBundle:TaskList')
            ->findAll();

        $tasklists = [];
        $i= 0;
        foreach ($lists as $list) {
            $tasklists[] = ['i' => $i, 'list' => $list];
            $i++;
        }

        return $this->render('farpost/index.html.twig', ['lists' => $tasklists]);
    }

    /**
     * @Route("create", name="create")
     */
    public function createAction(Request $request)
    {
        $taskName = $request->query->get('task');
        $listName = $request->query->get('list');

        if ($taskName) {
            // create task
            $existTask = $this->findTask($taskName, $listName);

            if (!$existTask) {
                $list = $this->getDoctrine()
                ->getRepository('AppBundle:TaskList')
                ->find($listName);

                $task = new Task();
                $task->setName($taskName);
                $task->setCompleted(false);
                $task->setTaskList($list);

                $em = $this->getDoctrine()->getManager();
                $em->persist($task);
                $em->flush();
            }
        } else {
            //create list
            $existList = $this->getDoctrine()
                ->getRepository('AppBundle:TaskList')
                ->find($listName);

            if (!$existList) {
                $taskList = new TaskList();
                $taskList->setName($listName);
                $em = $this->getDoctrine()->getManager();
                $em->persist($taskList);
                $em->flush();
            }
        }

        return $this->redirectToRoute('lists');
    }

    /**
     * @Route("delete", name="delete")
     */
    public function deleteAction(Request $request)
    {
        $listName = $request->query->get('list');
        $taskName = $request->query->get('task');

        if ($taskName) {
            // delete task
            $existTask = $this->findTask($taskName, $listName);

            if ($existTask) {
                $em = $this->getDoctrine()->getManager();
                $em->remove($existTask);
                $em->flush();
            }
        } else {
            // delete list and tasks
            $list = $this->getDoctrine()
                ->getRepository('AppBundle:TaskList')
                ->find($listName);

            $tasks = $list->getTasks();

            $em = $this->getDoctrine()->getManager();
            foreach ($tasks as $task) { $em->remove($task); }

            $em->remove($list);
            $em->flush();
        }

        return $this->redirectToRoute('lists');
    }

    private function findTask($taskName, $listName) {

        return $this->getDoctrine()
            ->getRepository('AppBundle:Task')
            ->createQueryBuilder('t')
            ->where('t.taskList = :taskList')
            ->andWhere('t.name = :name')
            ->setParameters(['taskList'=> $listName, 'name' => $taskName])
            ->getQuery()
            ->setMaxResults(1)
            ->getOneOrNullResult();
    }
}
