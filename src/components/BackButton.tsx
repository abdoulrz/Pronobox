import React from 'react';
import { useNavigate } from 'react-router-dom';
interface BackButtonProps {
  to?: string;
  label?: string;
  className?: string;
}
const BackButton: React.FC<BackButtonProps> = ({
  to,
  label = 'Retour',
  className = ''
}) => {
  const navigate = useNavigate();
  const handleClick = () => {
    if (to) {
      navigate(to);
    } else {
      navigate(-1);
    }
  };
  return (
    <button
      onClick={handleClick}
      className={`flex items-center text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 ${className}`}>

      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5 mr-1"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor">

        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M10 19l-7-7m0 0l7-7m-7 7h18" />

      </svg>
      {label}
    </button>);

};
export default BackButton;