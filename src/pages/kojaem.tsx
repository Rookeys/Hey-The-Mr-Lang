import { ChatLoading } from "@/components/ChatLoading";
import { formatConversationHistory } from "@/utils/formatConversationHistory";
import { yupResolver } from "@hookform/resolvers/yup";
import axios from "axios";
import { useEffect, useState } from "react";
import { FieldValues, FormProvider, useForm } from "react-hook-form";
import { GoPaperAirplane } from "react-icons/go";
import { object, string } from "yup";

const Kojaem = () => {
  const [history, setHistory] = useState<Array<string>>([]);

  const supabase = async () => {
    await axios.post("/api/kojaem/supabase");
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
      // if (!process.env.NEXT_PUBLIC_LAMBDA_TEST_URL) {
      //   return;
      // }
      const question = data.question;

      resetField("question");

      const formattedConversationHistory = formatConversationHistory(history);

      setHistory(prev => [...prev, `${question}`]);

      const { data: response } = await axios.post(
        process.env.NEXT_PUBLIC_LAMBDA_TEST_URL ?? "/api/kojaem/langChain",
        {
          question,
          history: formattedConversationHistory,
        }
      );

      setHistory(prev => [...prev, `${response}`]);
    } catch (error) {
      console.log(error);
      setHistory(prev => [...prev, '서버가 불안정합니다. 잠시 후 다시 질문 해주세요.'])
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
      <div className="flex flex-col w-full max-w-[640px] justify-center items-center gap-[4px] bg-blue-100 p-[12px] rounded-md">
        <h1 className="text-[20px] font-semibold">대화 히스토리</h1>
        <div className="flex flex-col gap-[4px] w-full">
          {history.map((data, i) => {
            return i % 2 === 0 ? (
              <div key={i} className="bg-gray-100 w-fit p-[4px] rounded-md mr-[20%]">
                <p className="text-blue-400">{data}</p>
              </div>
            ) : (
              <div
                key={i}
                className="bg-gray-100 w-fit p-[4px] rounded-md self-end ml-[20%]"
              >
                <p className="text-green-600">{data}</p>
              </div>
            );
          })}
        </div>
        {isSubmitting && (
          <ChatLoading className="self-end mt-[20px] mb-[20px]" />
        )}
        <FormProvider {...formMethods}>
          <form
            onSubmit={handleSubmit(submit)}
            className="w-full flex justify-center"
          >
            <div className="flex w-full justify-between bg-blue-50 rounded-md p-[2px]">
              <textarea
                placeholder={
                  isSubmitting
                    ? `요청중입니다... (시간이 걸릴 수 있습니다)`
                    : "KoJaem 님에 대해 무엇이 궁금하신가요?"
                }
                {...register("question")}
                disabled={isSubmitting}
                className="resize-none ring-0 outline-none bg-transparent placeholder:text-gray-400 w-full"
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-[20px] flex items-center justify-center"
              >
                <GoPaperAirplane />
              </button>
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );
};

export default Kojaem;
