<?php

namespace AppBundle\Controller;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

use AppBundle\Entity\TaskList;
use AppBundle\Entity\Task;

/**
* @Route("/api")
*/
class ApiController extends Controller
{
    /**
     * @Route("", name="api")
     */
    public function ApiAction()
    {
        $response = new Response();
        return $response;
    }

    /**
     * @Route("/todos/lists")
     */
    public function ListsAction(Request $request)
    {
        $listName = $request->query->get('list');

        $lists = $this->getDoctrine()
            ->getRepository('AppBundle:TaskList')
            ->findAll();

        $res = [];
        foreach ($lists as $list) {
            $res[] = $list->getName();
        }

        $response = new Response(json_encode($res));
        $response->headers->set('Content-Type', 'application/json');
        return $response;
    }

    /**
     * @Route("/todos/list/insert/{listName}")
     */
    public function InsertListAction($listName)
    {
        $list = $this->getDoctrine()
            ->getRepository('AppBundle:TaskList')
            ->findOneByName($listName);
        if (!$list) {
            $list = new TaskList();
            $list->setName($listName);

            $em = $this->getDoctrine()->getManager();
            $em->persist($list);
            $em->flush();
        }

        $response = new Response();
        $response->headers->set('Content-Type', 'application/json');
        return $response;
    }

    /**
     * @Route("/todos/list/delete/{listName}")
     */
    public function DeleteListAction($listName)
    {
        $list = $this->getDoctrine()
            ->getRepository('AppBundle:TaskList')
            ->findOneByName($listName);
        if ($list) {
            $tasks = $list->getTasks();
            $em = $this->getDoctrine()->getManager();
            foreach ($tasks as $task) { $em->remove($task); }
            $em->remove($list);
            $em->flush();
        }

        $response = new Response();
        $response->headers->set('Content-Type', 'application/json');
        return $response;
    }

    /**
     * @Route("/todos/delete")
     */
    public function DeleteAction(Request $request)
    {
        $taskName = $request->query->get('title');
        $listName = $request->query->get('list');

        $task = $this->findTask($taskName, $listName);

        if ($task) {
            $em = $this->getDoctrine()->getManager();
            $em->remove($task);
            $em->flush();
        }

        $response = new Response(json_encode($task->getName()));
        $response->headers->set('Content-Type', 'application/json');
        return $response;
    }

    /**
     * @Route("/todos/get")
     */
    public function GetAction(Request $request)
    {
        $listName = $request->query->get('list');
        $tasks = [];
        $list = $this->getDoctrine()
            ->getRepository('AppBundle:TaskList')
            ->findOneByName($listName);

        if ($list) {
            foreach ($list->getTasks() as $task) {
                $tasks[] = [
                    'completed' => $task->getCompleted(),
                    'title' => $task->getName(),
                    'list' => $task->getTaskList()
                ];
            }
        }

        $response = new Response(json_encode($tasks));
        $response->headers->set('Content-Type', 'application/json');
        return $response;
    }

    /**
     * @Route("/todos/insert")
     */
    public function InsertAction(Request $request)
    {
        $completed = $request->query->get('completed') === 'true' ? true : false;
        $taskName = $request->query->get('title');
        $listName = $request->query->get('list');

        $existTask = $this->findTask($taskName, $listName);

        if (!$existTask) {
            $list = $this->getDoctrine()
                ->getRepository('AppBundle:TaskList')
                ->find($listName);

            $task = new Task();
            $task->setName($taskName);
            $task->setCompleted($completed);
            $task->setTaskList($list);

            $em = $this->getDoctrine()->getManager();
            $em->persist($task);
            $em->flush();
        }

        $response = new Response();
        $response->headers->set('Content-Type', 'application/json');
        return $response;
    }

    /**
     * @Route("/todos/put")
     */
    public function PutAction(Request $request)
    {
        $completed = $request->query->get('completed') === 'true' ? true : false;
        $taskName = $request->query->get('title');
        $listName = $request->query->get('list');

        $task = $this->findTask($taskName, $listName);

        if ($task) {
            $task->setName($taskName);
            $task->setCompleted($completed);

            $em = $this->getDoctrine()->getManager();
            $em->persist($task);
            $em->flush();
        }

        $response = new Response(json_encode($task->getName()));
        $response->headers->set('Content-Type', 'application/json');
        return $response;
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
