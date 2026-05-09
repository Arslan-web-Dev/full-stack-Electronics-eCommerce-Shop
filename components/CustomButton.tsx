// *********************
// Role of the component: Custom button component
// Name of the component: CustomButton.tsx
// Developer: Aleksandar Kuzmanovic
// Version: 1.0
// Component call: <CustomButton paddingX={paddingX} paddingY={paddingY} text={text} buttonType={buttonType} customWidth={customWidth} textSize={textSize} />
// Input parameters: CustomButtonProps interface
// Output: custom button component
// *********************

import React from "react";

interface CustomButtonProps {
  paddingX: number;
  paddingY: number;
  text: string;
  buttonType: "submit" | "reset" | "button";
  customWidth: string;
  textSize: string;
}

const CustomButton = ({
  paddingX,
  paddingY,
  text,
  buttonType,
  customWidth,
  textSize
}: CustomButtonProps) => {


  return (
    <button
      type={`${buttonType}`}
      className={`${customWidth !== "no" ? `w-${customWidth}` : "w-auto"} uppercase bg-slate-900 px-${paddingX} py-${paddingY} text-${textSize} font-bold text-white shadow-lg hover:bg-primary-600 transition-all active:scale-95 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/50`}
    >
      {text}
    </button>
  );
};

export default CustomButton;
