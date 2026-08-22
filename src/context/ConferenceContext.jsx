import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const ConferenceContext = createContext(null);

export const ConferenceProvider = ({ children }) => {
  const [conferences, setConferences] = useState([]);
  const [selectedConference, setSelectedConference] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchConferences = async () => {
    try {
      setLoading(true);
      const res = await api.get('/conferences');
      const confList = res.data.conferences || [];
      setConferences(confList);

      const savedConfId = localStorage.getItem('cmt_selected_conference_id');
      if (savedConfId) {
        const found = confList.find((c) => c.id === parseInt(savedConfId, 10));
        if (found) {
          setSelectedConference(found);
        } else if (confList.length > 0) {
          setSelectedConference(confList[0]);
          localStorage.setItem('cmt_selected_conference_id', confList[0].id);
        }
      } else if (confList.length > 0) {
        setSelectedConference(confList[0]);
        localStorage.setItem('cmt_selected_conference_id', confList[0].id);
      }
    } catch (err) {
      console.error('Failed to load conferences:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConferences();
  }, []);

  const selectConference = (conf) => {
    setSelectedConference(conf);
    if (conf) {
      localStorage.setItem('cmt_selected_conference_id', conf.id);
    }
  };

  return (
    <ConferenceContext.Provider
      value={{
        conferences,
        selectedConference,
        selectConference,
        refreshConferences: fetchConferences,
        loading,
      }}
    >
      {children}
    </ConferenceContext.Provider>
  );
};

export const useConference = () => useContext(ConferenceContext);
