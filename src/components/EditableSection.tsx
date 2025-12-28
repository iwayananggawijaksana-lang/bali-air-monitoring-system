import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface EditableSectionProps {
  content: string;
  sectionId: string;
  onSave: (content: string) => void;
}

export const EditableSection: React.FC<EditableSectionProps> = ({
  content,
  sectionId,
  onSave
}) => {
  const { isAdmin } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);

  const handleSave = () => {
    onSave(editedContent);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedContent(content);
    setIsEditing(false);
  };

  return (
    <div className="editable-section relative">
      {isAdmin && (
        <div className="admin-controls absolute top-0 right-0">
          {!isEditing ? (
            <button 
              onClick={() => setIsEditing(true)}
              className="edit-btn bg-blue-500 text-white px-3 py-1 rounded"
            >
              Edit
            </button>
          ) : (
            <div className="space-x-2">
              <button 
                onClick={handleSave}
                className="save-btn bg-green-500 text-white px-3 py-1 rounded"
              >
                Save
              </button>
              <button 
                onClick={handleCancel}
                className="cancel-btn bg-gray-500 text-white px-3 py-1 rounded"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      )}
      
      {isEditing ? (
        <textarea
          value={editedContent}
          onChange={(e) => setEditedContent(e.target.value)}
          className="w-full h-32 p-2 border rounded"
        />
      ) : (
        <div 
          className="content"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      )}
    </div>
  );
};