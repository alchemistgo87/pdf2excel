"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileIcon, X, Eye, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";

interface UploadedFile extends File {
  extractedText?: string;
}

interface FileUploadProps {
  onExtract?: (text: string) => void;
}

export function FileUpload({
  onExtract,
}: FileUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [previewFile, setPreviewFile] = useState<UploadedFile | null>(null);
  const [isLoading, setIsLoading] = useState<{ [key: string]: boolean }>({});
  const [isUploading, setIsUploading] = useState(false);

  const extractText = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/extract', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to extract text');
      }

      const data = await response.json();
      return data.text;
    } catch (error) {
      console.error('Error extracting text:', error);
      throw error;
    }
  };

  const handleRemoveFile = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
    onExtract?.(undefined);
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const newFiles = acceptedFiles as UploadedFile[];
    setFiles((prevFiles) => [...prevFiles, ...newFiles]);

    for (const file of newFiles) {
      try {
        setIsLoading((prev) => ({ ...prev, [file.name]: true }));
        const extractedText = await extractText(file);
        file.extractedText = extractedText;
        setFiles((prevFiles) => [...prevFiles]);
        onExtract?.(extractedText);
        toast({
          title: "Success",
          description: `Text extracted from ${file.name}`,
        });
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: `Failed to extract text from ${file.name}`,
        });
      } finally {
        setIsLoading((prev) => ({ ...prev, [file.name]: false }));
      }
    }
  }, [toast, onExtract]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
    disabled: isUploading,
  });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-8",
          "flex flex-col items-center justify-center gap-4",
          "transition-colors duration-200 ease-in-out cursor-pointer",
          isDragActive
            ? "border-blue-400 bg-blue-50"
            : "border-gray-300 hover:border-gray-400",
          isUploading ? 'opacity-50 cursor-not-allowed' : ''
        )}
      >
        <input {...getInputProps()} />
        {isUploading ? (
          <>
            <Loader2 className="h-10 w-10 text-muted-foreground animate-spin" />
            <p className="text-sm text-muted-foreground">
              Extracting text from PDF...
            </p>
          </>
        ) : (
          <>
            <Upload className="h-10 w-10 text-muted-foreground" />
            <div className="text-center space-y-2">
              {isDragActive ? (
                <p className="text-sm text-blue-500 font-medium">Drop your PDF here</p>
              ) : (
                <>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium text-blue-500">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500 mt-1">PDF files only (max 10MB)</p>
                </>
              )}
            </div>
          </>
        )}
      </div>

      {files.length > 0 && (
        <div className="space-y-4">
          {files.map((file, index) => (
            <Card key={index} className="p-4 relative">
              <Button
                size="sm"
                variant="ghost"
                className="absolute top-2 right-2 h-8 w-8 p-0"
                onClick={() => handleRemoveFile(index)}
              >
                <X className="h-4 w-4" />
              </Button>

              <div className="flex items-center gap-3 mt-1">
                <FileIcon className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="font-medium text-sm">{file.name}</p>
                  <p className="text-xs text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                {isLoading[file.name] && (
                  <div className="ml-auto">
                    <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                  </div>
                )}
              </div>

              {file.extractedText && (
                <div className="mt-4 flex justify-end gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setPreviewFile(file)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Preview PDF
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!previewFile} onOpenChange={() => setPreviewFile(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileIcon className="h-5 w-5" />
              {previewFile?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4 relative">
            <div className="absolute top-0 right-0 p-2 bg-white rounded-bl-lg border border-gray-200">
              <p className="text-xs text-gray-500">
                {previewFile && (previewFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-4 rounded-lg max-h-[60vh] overflow-auto">
              {previewFile?.extractedText}
            </pre>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
