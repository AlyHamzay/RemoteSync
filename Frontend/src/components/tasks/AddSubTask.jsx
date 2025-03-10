import { Dialog } from "@headlessui/react";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { useCreateSubTaskMutation } from "../../redux/slices/api/taskApiSlice";
import { useGetTeamListsQuery } from "../../redux/slices/api/userApiSlice";
import Button from "../Button";
import Loading from "../Loading";
import ModalWrapper from "../ModalWrapper";
import Textbox from "../Textbox";

const AddSubTask = ({ open, setOpen, id }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const [selectedMembers, setSelectedMembers] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [addSbTask, { isLoading }] = useCreateSubTaskMutation();

  const { data: userList, isLoading: isUserLoading } = useGetTeamListsQuery({ search: "" });

  const handleOnSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        subteam: selectedMembers.map((member) => member._id), // Map selected members to IDs
      };

      const res = await addSbTask({ data: payload, id }).unwrap();

      toast.success(res.message);

      setTimeout(() => {
        setOpen(false);
      }, 500);
    } catch (err) {
      console.log(err);
      toast.error(err?.data?.message || err.error);
    }
  };

  const handleAddMember = (member) => {
    if (!selectedMembers.find((m) => m._id === member._id)) {
      setSelectedMembers([...selectedMembers, member]);
    }
    setInputValue(""); // Clear the input after adding a member
  };

  const handleRemoveMember = (memberId) => {
    setSelectedMembers(selectedMembers.filter((m) => m._id !== memberId));
  };

  // Filtered Suggestions for Mentions
  const filteredUsers = userList
    ? userList.filter((user) =>
        user.name.toLowerCase().includes(inputValue.replace("@", "").toLowerCase()) &&
        !selectedMembers.find((m) => m._id === user._id)
      )
    : [];

  return (
    <>
      <ModalWrapper open={open} setOpen={setOpen}>
        <form onSubmit={handleSubmit(handleOnSubmit)} className="">
          <Dialog.Title
            as="h2"
            className="text-base font-bold leading-6 text-gray-900 mb-4"
          >
            ADD SUB-TASK
          </Dialog.Title>
          <div className="mt-2 flex flex-col gap-6">
            <Textbox
              placeholder="Sub-Task title"
              type="text"
              name="title"
              label="Title"
              className="w-full rounded"
              register={register("title", {
                required: "Title is required!",
              })}
              error={errors.title ? errors.title.message : ""}
            />

            <div className="flex items-center gap-4">
              <Textbox
                placeholder="Date"
                type="date"
                name="date"
                label="Task Date"
                className="w-full rounded"
                register={register("date", {
                  required: "Date is required!",
                })}
                error={errors.date ? errors.date.message : ""}
              />
              <Textbox
                placeholder="Tag"
                type="text"
                name="tag"
                label="Tag"
                className="w-full rounded"
                register={register("tag", {
                  required: "Tag is required!",
                })}
                error={errors.tag ? errors.tag.message : ""}
              />
            </div>

            {/* Member Mentions */}
            <div>
              <label
                htmlFor="subteam"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Assign Members (use @name)
              </label>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type @ to search members..."
                className="w-full rounded border border-gray-300 p-2"
              />
              {/* Suggestions Dropdown */}
              {inputValue.startsWith("@") && filteredUsers.length > 0 && (
                <ul className="bg-white border border-gray-200 rounded mt-2 max-h-40 overflow-y-auto">
                  {filteredUsers.map((user) => (
                    <li
                      key={user._id}
                      onClick={() => handleAddMember(user)}
                      className="px-3 py-2 hover:bg-blue-100 cursor-pointer"
                    >
                      @{user.name}
                    </li>
                  ))}
                </ul>
              )}
              {/* Selected Members */}
              {selectedMembers.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Assigned Members:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedMembers.map((member) => (
                      <div
                        key={member._id}
                        className="flex items-center gap-2 px-3 py-1 bg-blue-100 rounded-full text-sm"
                      >
                        <span>{member.name}</span>
                        <button
                          type="button"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => handleRemoveMember(member._id)}
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {isLoading ? (
            <div className="mt-8">
              <Loading />
            </div>
          ) : (
            <div className="py-3 mt-4 flex sm:flex-row-reverse gap-4">
              <Button
                type="submit"
                className="bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700 sm:ml-3 sm:w-auto"
                label="Add Task"
              />

              <Button
                type="button"
                className="bg-white border text-sm font-semibold text-gray-900 sm:w-auto"
                onClick={() => setOpen(false)}
                label="Cancel"
              />
            </div>
          )}
        </form>
      </ModalWrapper>
    </>
  );
};

export default AddSubTask;
