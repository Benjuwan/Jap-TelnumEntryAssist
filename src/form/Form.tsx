import { ChangeEvent } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { useAdjustPhoneNumber } from "./hooks/useAdjustPhoneNumber";

type TheFormType = {
  tel: string;
};

export const Form = () => {
  const { register, handleSubmit, setValue } = useForm({
    defaultValues: {
      tel: "",
    },
  });

  const onSubmit: SubmitHandler<TheFormType> = (data) => {
    console.log(data);
  };

  const { adjustPhoneNumber } = useAdjustPhoneNumber();
  const handlePhoneNumber: (telValue: string) => void = (telValue: string) => {
    const formattedNumber: string = adjustPhoneNumber(telValue);
    setValue("tel", formattedNumber);
  };

  return (
    <div className="font-sans max-w-[320px] my-[5em] mx-auto">
      <form name="contact" onSubmit={handleSubmit(onSubmit)}>
        <label className="w-full leading-[1.5] text-[16px]">
          <span className="block tracking-[0.25em] border-l-[4px] border-[#333] pl-[0.5em] mb-[0.5em]">電話番号</span>
          <input
            type="tel"
            id="tel"
            className="w-full rounded border border-[#333] pt-[0.5em] pr-[0] pb-[0.5em] pl-[0.5em]"
            autoComplete="tel"
            {...register("tel")}
            onChange={(e: ChangeEvent<HTMLInputElement>) => handlePhoneNumber(e.target.value)}
          />
        </label>
        <button className="block text-[14px] cursor-pointer appearance-none rounded border border-[#333] w-fit my-[1em] mx-auto py-[0.5em] px-[2em] tracking-[0.25em]">送信<br />（特に何もなし）</button>
      </form>
    </div>
  );
};
