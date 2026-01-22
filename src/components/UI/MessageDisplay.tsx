import React, { useEffect } from "react";

export interface MessageType {
  type: "success" | "error" | "info";
  text: string;
}

interface MessageDisplayProps {
  message: MessageType | null;
  onClose: () => void;
  delay?: number;
}

const MessageDisplay: React.FC<MessageDisplayProps> = ({
  message,
  onClose,
  delay = 3,
}) => {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        onClose();
      }, delay * 1000);

      return () => clearTimeout(timer);
    }
  }, [message, onClose, delay]);

  if (!message) {
    return null;
  }

  const getMessageClasses = () => {
    switch (message.type) {
      case "error":
        return "bg-red-50 text-red-800 border border-red-100";
      case "success":
        return "bg-green-50 text-green-800 border border-green-100";
      case "info":
        return "bg-blue-50 text-blue-800 border border-blue-100";
      default:
        return "";
    }
  };

  const getIcon = () => {
    switch (message.type) {
      case "error":
        return "⚠️";
      case "success":
        return "✅";
      case "info":
        return "ℹ️";
      default:
        return "";
    }
  };

  return (
    <div
      className={`mb-6 p-4 rounded-md flex items-start ${getMessageClasses()}`}
    >
      <span className="mr-2 text-lg">{getIcon()}</span>
      <span>{message.text}</span>
    </div>
  );
};

export default MessageDisplay;
