import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ProcessingPanel from '../components/processing/ProcessingPanel';

const ProcessingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  if (!id) {
    return null;
  }

  const handleComplete = () => {
    navigate(`/notes/${id}/analysis`);
  };

  return (
    <ProcessingPanel
      noteId={id}
      onComplete={handleComplete}
    />
  );
};

export default ProcessingPage;
