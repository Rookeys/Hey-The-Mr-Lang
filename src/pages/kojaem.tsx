import { yupResolver } from "@hookform/resolvers/yup";
import axios from "axios";
import React from "react";
import { FieldValues, FormProvider, useForm } from "react-hook-form";
import { object, string } from "yup";

const Kojaem = () => {
  const supabase = async () => {
    await axios.get("/api/supabase");
  };

  const promptTemplate = async () => {
    await axios.get("/api/promptTemplate");
  };

  const firstChain = async () => {
    await axios.get("/api/firstChain");
  };

  const retrieval = async () => {
    await axios.get("/api/retrieval");
  };

  const runnableSequence = async () => {
    await axios.get("/api/runnableSequence");
  };

  const test = async () => {
    await axios.get("/api/test");
  };

  const schema = object().shape({
    question: string().required(`질문을 입력해주세요`),
  });

  const formMethods = useForm({
    resolver: yupResolver(schema),
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
    register,
    resetField,
  } = formMethods;

  const submit = async (data: FieldValues) => {
    try {
      const question = data.question;

      resetField("question");

      const { data: response } = await axios.post("/api/test", {
        question,
      });

      console.log('response:', response);

    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="w-full h-full flex flex-col gap-4 items-center">
      <div className="border border-blue-400 w-fit p-2 rounded-full">
        <button
          type="button"
          onClick={supabase}
        >{`context -> supabase 버튼`}</button>
      </div>
      <div className="border border-blue-400 w-fit p-2 rounded-full">
        <button
          type="button"
          onClick={promptTemplate}
        >{`promptTemplate 버튼`}</button>
      </div>
      <div className="border border-blue-400 w-fit p-2 rounded-full">
        <button type="button" onClick={firstChain}>{`firstChain 버튼`}</button>
      </div>
      <div className="border border-blue-400 w-fit p-2 rounded-full">
        <button type="button" onClick={retrieval}>{`retrieval 버튼`}</button>
      </div>
      <div className="border border-blue-400 w-fit p-2 rounded-full">
        <button
          type="button"
          onClick={runnableSequence}
        >{`runnableSequence 버튼`}</button>
      </div>
      <div className="border border-blue-400 w-fit p-2 rounded-full">
        <button type="button" onClick={test}>{`test 버튼`}</button>
      </div>
      <FormProvider {...formMethods}>
        <form
          onSubmit={handleSubmit(submit)}
          className="w-full flex justify-center"
        >
          <textarea
            placeholder={
              isSubmitting
                ? "Waiting for response..."
                : "What is this legal case about?"
            }
            {...register("question")}
            disabled={isSubmitting}
          />
          <button type="submit">보내기 버튼</button>
        </form>
      </FormProvider>
    </div>
  );
};

export default Kojaem;
