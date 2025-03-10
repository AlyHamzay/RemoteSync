import clsx from "clsx";
import React, { useState, useEffect } from "react";
import { IoMdAdd } from "react-icons/io";
import {
  MdKeyboardArrowDown,
  MdKeyboardArrowUp,
  MdKeyboardDoubleArrowUp,
} from "react-icons/md";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

import {
  BGS,
  PRIOTITYSTYELS,
  TASK_TYPE,
  formatDate,
} from "../../utils/index.js";
import UserInfo from "../UserInfo.jsx";
import { AddSubTask, TaskAssets, TaskColor, TaskDialog } from "./index";
import { useGetSingleTaskQuery } from "../../redux/slices/api/taskApiSlice";

const ICONS = {
  high: <MdKeyboardDoubleArrowUp />, 
  medium: <MdKeyboardArrowUp />, 
  low: <MdKeyboardArrowDown />,
};

const TaskCard = ({ task, onScreenShareStart }) => {
  const { user } = useSelector((state) => state.auth);
  const [open, setOpen] = useState(false);

  // Get latest task data to ensure subtask completion is reflected
  const { data, refetch } = useGetSingleTaskQuery(task._id, {
    skip: !task?._id,
  });
  
  const updatedTask = data?.task || task;

  // Ensure subTasks is always an array
  const subTasks = Array.isArray(updatedTask?.subTasks) ? updatedTask?.subTasks : [];

  // Find the first incomplete subtask
  const nextSubTask = subTasks.find((subTask) => !subTask.isCompleted);

  // Extract assigned members' names
  const assignedMembers = nextSubTask?.subteam?.length > 0 
    ? nextSubTask.subteam.map((member) => member.name).join(", ") 
    : "Unassigned";

  useEffect(() => {
    refetch(); // Ensure updated data is fetched when TaskCard re-renders
  }, []);

  return (
    <>
      <div className='w-full h-fit bg-white dark:bg-[#1f1f1f] shadow-md p-4 rounded'>
        <div className='w-full flex justify-between'>
          <div
            className={clsx(
              "flex flex-1 gap-1 items-center text-sm font-medium",
              PRIOTITYSTYELS[updatedTask?.priority]
            )}
          >
            <span className='text-lg'>{ICONS[updatedTask?.priority]}</span>
            <span className='uppercase'>{updatedTask?.priority} Priority</span>
          </div>
          <TaskDialog task={updatedTask} />
        </div>
        <>
          <Link to={`/task/${updatedTask._id}`}>
            <div className='flex items-center gap-2'>
              <TaskColor className={TASK_TYPE[updatedTask.stage]} />
              <h4 className='text- line-clamp-1 text-black dark:text-white'>
                {updatedTask?.title}
              </h4>
            </div>
          </Link>
          <span className='text-sm text-gray-600 dark:text-gray-400'>
            {formatDate(new Date(updatedTask?.date))}
          </span>
        </>

        <div className='w-full border-t border-gray-200 dark:border-gray-700 my-2' />
        <div className='flex items-center justify-between mb-2'>
          <TaskAssets
            activities={updatedTask?.activities?.length}
            subTasks={subTasks} // Ensure this is always an array
            assets={updatedTask?.assets?.length}
          />

          <div className='flex flex-row-reverse'>
            {updatedTask?.team?.length > 0 &&
              updatedTask?.team?.map((m, index) => (
                <div
                  key={index}
                  className={clsx(
                    "w-7 h-7 rounded-full text-white flex items-center justify-center text-sm -mr-1",
                    BGS[index % BGS?.length]
                  )}
                >
                  <UserInfo user={m} />
                </div>
              ))}
          </div>
        </div>

        {nextSubTask ? (
          <div className='py-4 border-t border-gray-200 dark:border-gray-700'>
            <h5 className='text-base line-clamp-1 text-black dark:text-gray-400'>
              {nextSubTask.title}
            </h5>

            <div className='p-4 space-x-8'>
              <span className='text-sm text-gray-600 dark:text-gray-500'>
                {formatDate(new Date(nextSubTask?.date))}
              </span>
              <span className='bg-blue-600/10 px-3 py-1 rounded-full text-blue-700 font-medium'>
                {nextSubTask?.tag}
              </span>
              <span className='text-sm text-gray-700 dark:text-gray-300'>
                Assigned to: <ul className='list-disc pl-80 text-sm text-gray-700 dark:text-gray-300'>
                {assignedMembers.split(", ").map((name, idx) => (
                  <li key={idx} className='mt-1'>{name}</li>
                ))}
              </ul>
              </span>
            </div>
          </div>
        ) : (
          <div className='py-4 border-t border-gray-200 dark:border-gray-700'>
            <span className='text-gray-500'>No Sub-Task</span>
          </div>
        )}

        <div className='w-full pb-2'>
          <button
            disabled={user.isAdmin ? false : true}
            onClick={() => setOpen(true)}
            className='w-full flex gap-4 items-center text-sm text-gray-500 font-semibold disabled:cursor-not-allowed disabled:text-gray-300'
          >
            <IoMdAdd className='text-lg' />
            <span>ADD SUBTASK</span>
          </button>
        </div>
      </div>

      <AddSubTask open={open} setOpen={setOpen} id={updatedTask._id} />
    </>
  );
};

export default TaskCard;