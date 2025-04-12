import React from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import AnalysisResults from '../components/analysis/AnalysisResults';

const AnalysisPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const note = useSelector((state: RootState) =>
    state.notes.items.find(n => n.id === id)
  );

  if (!note) {
    return null;
  }

  return <AnalysisResults note={note} />;
};

export default AnalysisPage;
