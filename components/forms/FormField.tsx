import React, { forwardRef } from "react";

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, error, id, type = "text", ...props }, ref) => {
    return (
      <div className="flex flex-col gap-[10px] w-full text-left">
        <label htmlFor={id} className="text-[18px] font-bold text-breezy-dark leading-[22px]">
          {label}
        </label>
        <div
          className={`w-full h-[46px] border rounded-[12px] px-[14px] flex items-center bg-white focus-within:border-breezy-blue transition-colors ${
            error ? "border-red-500 focus-within:border-red-500" : "border-breezy-light-gray"
          }`}
        >
          <input
            id={id}
            type={type}
            ref={ref}
            {...props}
            className="w-full bg-transparent outline-none text-[15px] text-breezy-dark placeholder-[#9AABBF]"
          />
        </div>
        {error && (
          <p className="text-red-500 text-[13px] font-semibold mt-1">
            {error}
          </p>
        )}
      </div>
    );
  }
);

FormField.displayName = "FormField";