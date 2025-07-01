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
      
    onFileChange({ target: { files: filesToProcess } });
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
    <div className="bg-white rounded-2xl shadow-lg p-2 md:p-4">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Your Images</h2>
      {maxFiles && (
        <p className="text-sm text-gray-500 mb-4">
          Maximum {maxFiles} {maxFiles === 1 ? 'file' : 'files'}
        </p>
      )}
      
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-xl p-8
          flex flex-col items-center justify-center
          cursor-pointer transition-colors duration-200
          ${isDragActive 
            ? 'border-indigo-500 bg-indigo-50' 
            : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'
          }
        `}
      >
        <input {...getInputProps()} />
        
        <div className="text-center">
          <svg
            className={`mx-auto h-12 w-12 ${isDragActive ? 'text-indigo-500' : 'text-gray-400'}`}
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
            />
          </svg>
          
          <div className="mt-4">
            <motion.p 
              className="text-lg text-gray-700"
              animate={{ scale: isDragActive ? 1.05 : 1 }}
            >
              {isDragActive 
                ? 'Drop your images here...' 
                : 'Drag & drop your images here, or click to select'}
            </motion.p>
            <p className="mt-2 text-sm text-gray-600">
              {isDragActive
                ? 'Drop the files here...'
                : `Drag and drop your images here, or click to select files${maxFiles ? ` (max ${maxFiles})` : ''}`
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 