import React from 'react'
import { CheckCircledIcon } from "@radix-ui/react-icons"

interface AlertModalProps {
  isOpen: boolean
  onClose: () => void
}

const AlertModal: React.FC<AlertModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm mx-auto">
        <div className="flex items-center mb-4">
          <CheckCircledIcon className="h-6 w-6 text-green-500 mr-2" />
          <h3 className="text-lg font-semibold">Success</h3>
        </div>
        <p className="mb-4">Your review has been submitted successfully.</p>
        <button
          onClick={onClose}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  )
}

export default AlertModal