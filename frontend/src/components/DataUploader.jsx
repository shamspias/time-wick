import React, {useState, useCallback} from 'react';
import {Upload, File, Database, Trash2, CheckCircle} from 'lucide-react';

const DataUploader = ({dataFiles, currentData, onUploadData, onLoadData, isLoading}) => {
    const [dragActive, setDragActive] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);

    const handleDrag = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    }, []);

    const handleFile = async (file) => {
        if (!file) return;

        const validExtensions = ['.csv', '.feather', '.parquet'];
        const fileExtension = file.name.substring(file.name.lastIndexOf('.'));

        if (!validExtensions.includes(fileExtension)) {
            alert('Please upload a CSV, Feather, or Parquet file');
            return;
        }

        setSelectedFile(file);
        const success = await onUploadData(file);
        if (success) {
            setSelectedFile(null);
        }
    };

    const handleFileInput = (e) => {
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                    <Database className="w-5 h-5 mr-2"/>
                    Data Management
                </h3>
                {currentData && (
                    <span className="flex items-center text-sm text-green-600 dark:text-green-400">
            <CheckCircle className="w-4 h-4 mr-1"/>
            Data Loaded
          </span>
                )}
            </div>

            {/* Upload Area */}
            <div
                className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                    dragActive
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    accept=".csv,.feather,.parquet"
                    onChange={handleFileInput}
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                    <Upload className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-500 mb-3"/>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        Drop your files here or{' '}
                        <span className="text-indigo-600 dark:text-indigo-400 font-medium">
              browse
            </span>
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                        Supports CSV, Feather, and Parquet files
                    </p>
                </label>
            </div>

            {/* Selected File */}
            {selectedFile && (
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <File className="w-4 h-4 text-blue-600 dark:text-blue-400 mr-2"/>
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                {selectedFile.name}
              </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                ({formatFileSize(selectedFile.size)})
              </span>
                        </div>
                        <button
                            onClick={() => setSelectedFile(null)}
                            className="text-red-500 hover:text-red-600"
                        >
                            <Trash2 className="w-4 h-4"/>
                        </button>
                    </div>
                </div>
            )}

            {/* Current Data Info */}
            {currentData && (
                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                        Current Dataset
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                            <span className="text-gray-500 dark:text-gray-400">Rows:</span>
                            <span className="ml-2 text-gray-900 dark:text-white font-medium">
                {currentData.rows?.toLocaleString()}
              </span>
                        </div>
                        <div>
                            <span className="text-gray-500 dark:text-gray-400">Columns:</span>
                            <span className="ml-2 text-gray-900 dark:text-white font-medium">
                {currentData.columns?.length}
              </span>
                        </div>
                        <div className="col-span-2">
                            <span className="text-gray-500 dark:text-gray-400">Time Range:</span>
                            <span className="ml-2 text-gray-900 dark:text-white font-medium text-xs">
                {currentData.start_date} to {currentData.end_date}
              </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Recent Files */}
            {dataFiles && dataFiles.length > 0 && (
                <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Recent Files
                    </h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                        {dataFiles.slice(0, 5).map((file, index) => (
                            <button
                                key={index}
                                onClick={() => onLoadData(file.path)}
                                className="w-full p-2 text-left bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            >
                                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {file.name}
                  </span>
                                    <span className="text-xs text-gray-500">
                    {formatFileSize(file.size)}
                  </span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default DataUploader;
