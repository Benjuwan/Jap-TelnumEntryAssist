import { styled } from "styled-components";
import { ChangeEvent } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { useAdjustPhoneNumber } from "./hooks/useAdjustPhoneNumber";

export const Form = () => {
  const { register, handleSubmit, setValue } = useForm({
    defaultValues: {
      tel: "",
    },
  });

  const onSubmit: SubmitHandler<any> = (data) => {
    console.log(data);
  };

  const { adjustPhoneNumber } = useAdjustPhoneNumber();
  const handlePhoneNumber: (telValue: string) => void = (telValue: string) => {
    const formattedNumber: string = adjustPhoneNumber(telValue);
    setValue("tel", formattedNumber);
  };

  return (
    <TheForm name="contact" onSubmit={handleSubmit(onSubmit)}>
      <label>
        <span>電話番号</span>
        <input
          type="tel"
          id="tel"
          autoComplete="tel"
          {...register("tel")}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            handlePhoneNumber(e.target.value)
          }
        />
      </label>
      <button>送信</button>
    </TheForm>
  );
};

const TheForm = styled.form`
  text-align: left;

  & label {
    width: 100%;
    line-height: 1.5;
    font-size: 16px;
    
    & span {
      letter-spacing: 0.25em;
      display: block;
      border-left: 4px solid #333;
      padding-left: 0.5em;
      margin-bottom: 0.5em;
    }

    & input {
      width: 100%;
      border-radius: 4px;
      border: 1px solid #333;
      padding: 0.5em 0 0.5em 0.5em;
    }
  }
  
  & button {
    cursor: pointer;
    appearance: none;;
    border-radius: 4px;
    border: 1px solid #333;
    display: block;
    width: fit-content;
    margin: 1em auto;
    padding: .5em 2em;
    letter-spacing: 0.25em;
  }
`;
