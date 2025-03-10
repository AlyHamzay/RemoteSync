import React, { useEffect, useState, useRef } from "react";
import { FaList } from "react-icons/fa";
import { IoMdAdd } from "react-icons/io";
import { MdGridView } from "react-icons/md";
import { useParams, useSearchParams } from "react-router-dom";
import { Button, Loading, Table, Tabs, Title } from "../components";
import { AddTask, BoardView, TaskTitle } from "../components/tasks";
import { useChangeTaskStageMutation, useGetAllTaskQuery } from "../redux/slices/api/taskApiSlice";
import { useUploadImageMutation } from '../redux/slices/api/taskApiSlice';
import { TASK_TYPE } from "../utils";
import { useSelector } from "react-redux";
import TaskDialog from "../components/tasks/TaskDialog";
import { useTaskContext } from '../components/contextapi/TaskContext';
import { useScreenRecording } from '../components/contextapi/RecordingContext'

const TABS = [
  { title: "Board View", icon: <MdGridView /> },
  { title: "List View", icon: <FaList /> },
];

const Tasks = () => {
  const { taskId } = useTaskContext();
  const params = useParams();
  const { user } = useSelector((state) => state.auth);
  const [searchParams] = useSearchParams();
  const [searchTerm] = useState(searchParams.get("search") || "");
  const { taskStatus } = useTaskContext();
  const { stream } = useScreenRecording();
  
  const [selected, setSelected] = useState(0);
  const [open, setOpen] = useState(false);
  const videoRef = useRef(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false); // For TaskDialog

  const status = params?.status || "";

  const { data, isLoading, refetch } = useGetAllTaskQuery({
    strQuery: status,
    isTrashed: "",
    search: searchTerm,
  });
  const [uploadImage] = useUploadImageMutation();

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.onloadedmetadata = () => {
        videoRef.current.play();
      };
    }
  }, [stream]);

  // useEffect(() => {
  //   console.log("task page",data?.tasks)
  //   // Check for tasks in progress on initial load or data changes
  //   if (data?.tasks && Array.isArray(data.tasks)) {
  //     // const inProgressTask = data.tasks.find((task) => task.status === "in progress");
  //     // console.log(inProgressTask);
  //     // if (inProgressTask) {
  //       handleScreenShareStart(inProgressTask.id); // Start sharing for the task in progress
  //     // }
  //   }
  // }, [data]);
  useEffect(() => {
    if (taskStatus) {
      handleScreenShareStart(taskId);
    }
  }, [taskStatus]);
  

  const startTakingScreenshots = (stream, taskId) => {
    if (!videoRef.current) {
      console.log("Video reference not available.");
      return;
    }

    const interval = setInterval(async () => {
      const video = videoRef.current;

      if (video && video.readyState === video.HAVE_ENOUGH_DATA) {
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const context = canvas.getContext("2d");
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(async (blob) => {
          if (blob) {
            try {
              const arrayBuffer = await blob.arrayBuffer();
              const uint8Array = new Uint8Array(arrayBuffer);

              await uploadImage({
                taskId,
                uint8Array,
              }).unwrap();

              console.log("Screenshot uploaded successfully for task:", taskId);
            } catch (error) {
              console.error("Error uploading screenshot:", error);
            }
          }
        }, "image/png");
      } else {
        console.log("Video is not ready or has no data to capture.");
      }
    }, 5000);

    stream.getVideoTracks()[0].onended = () => {
      clearInterval(interval);
      console.log("Screen sharing stopped, clearing screenshot interval.");
    };
  };

  const handleScreenShareStart = async (taskId) => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      console.log("Stream received:", stream);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
        };
      }

      startTakingScreenshots(stream, taskId);
    } catch (err) {
      console.error("Error starting screen share:", err);
    }
  };

  useEffect(() => {
    refetch();
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }, [open]);

  return isLoading ? (
    <div className="py-10">
      <Loading />
    </div>
  ) : (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <Title title={status ? `${status} Tasks` : "Tasks"} />
        {!status && user?.isAdmin && (
          <Button
            label="Create Task"
            icon={<IoMdAdd className="text-lg" />}
            className="flex flex-row-reverse gap-1 items-center bg-purple-600 text-white rounded-md py-2 2xl:py-2.5"
            onClick={() => setOpen(true)}
          />
        )}
      </div>

      <div>
        <Tabs tabs={TABS} setSelected={setSelected}>
          {!status && (
            <div className="w-full flex justify-between gap-4 md:gap-x-12 py-4">
              <TaskTitle label="To Do" className={TASK_TYPE.todo} />
              <TaskTitle label="In Progress" className={TASK_TYPE["in progress"]} />
              <TaskTitle label="Completed" className={TASK_TYPE.completed} />
            </div>
          )}

          {selected === 0 ? (
            <BoardView tasks={data?.tasks} />
          ) : (
            <Table tasks={data?.tasks} />
          )}
        </Tabs>
      </div>

      <video ref={videoRef} autoPlay style={{ display: "none" }} />

      {isDialogOpen && (
        <TaskDialog
          onScreenShareStart={handleScreenShareStart}
          onClose={() => setIsDialogOpen(false)}
        />
      )}
      <AddTask open={open} setOpen={setOpen} />
    </div>
  );
};

export default Tasks;
