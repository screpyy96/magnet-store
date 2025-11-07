import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';

export default function ImageUploader({ onFileChange, maxFiles = 10 }) {
  const onDrop = useCallback((acceptedFiles, fileRejections) => {
    if (fileRejections.length > 0) {
      const error = fileRejections[0].errors[0];
      if (error.code === 'too-many-files') {
        alert(`You can only upload up to ${maxFiles} files`);
        return;
      }
      alert(error.message);
      return;
    }
    
    // If maxFiles is set, only take the first N files
    const filesToProcess = maxFiles 
      ? acceptedFiles.slice(0, maxFiles) 
      : acceptedFiles;
      
    if (onFileChange && typeof onFileChange === 'function') {
      onFileChange({ target: { files: filesToProcess } });
    } else {
      console.warn('onFileChange prop is not provided or is not a function');
    }
  }, [onFileChange, maxFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif']
    },
    multiple: true,
    maxFiles: maxFiles || null, // null means unlimited
    maxSize: 10 * 1024 * 1024, // 10MB
    onDropRejected: (fileRejections) => {
      const error = fileRejections[0].errors[0];
      if (error.code === 'file-too-large') {
        alert('File is too large. Maximum size is 10MB');
      } else if (error.code === 'file-invalid-type') {
        alert('Invalid file type. Please upload an image (JPEG, JPG, PNG, GIF)');
      }
    }
  });

  return (
    <div>
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-xl p-6 lg:p-8
          flex flex-col items-center justify-center
          cursor-pointer transition-all duration-200
          ${isDragActive 
            ? 'border-pink-500 bg-pink-50 scale-[1.02]' 
            : 'border-pink-300 hover:border-pink-400 hover:bg-pink-50/50 bg-gradient-to-br from-pink-50 to-orange-50'
          }
        `}
      >
        <input {...getInputProps()} />
        
        <div className="text-center">
          {/* Icon */}
          <svg
            className={`mx-auto h-10 w-10 lg:h-12 lg:w-12 mb-2 ${isDragActive ? 'text-pink-500' : 'text-gray-400'}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          
          <div>
            <motion.p 
              className="text-sm lg:text-base font-medium text-gray-900"
              animate={{ scale: isDragActive ? 1.05 : 1 }}
            >
              {isDragActive 
                ? 'Drop photos here' 
                : 'Tap to upload photos'}
            </motion.p>
            <p className="mt-1 text-xs text-gray-500">
              {maxFiles 
                ? `Up to ${maxFiles} ${maxFiles === 1 ? 'photo' : 'photos'} • JPG, PNG • Max 10MB`
                : 'JPG, PNG • Max 10MB each'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 