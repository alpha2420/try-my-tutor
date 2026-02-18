import { createContext, useState, useContext } from 'react';

const RequirementContext = createContext();

export function RequirementProvider({ children }) {
    const [requirementData, setRequirementData] = useState({
        location: '',
        subject: '',
        grade: '',
        board: '',
        budget: '',
        days: [],
        duration: '',
        genderPreference: 'Any',
        experience: 'Any',
    });

    const updateRequirement = (key, value) => {
        setRequirementData(prev => ({ ...prev, [key]: value }));
    };

    return (
        <RequirementContext.Provider value={{ requirementData, updateRequirement }}>
            {children}
        </RequirementContext.Provider>
    );
}

export const useRequirement = () => useContext(RequirementContext);
