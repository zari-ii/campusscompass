import { createContext, useContext, useState, ReactNode } from "react";

interface AdminViewContextType {
  viewAsUser: boolean;
  toggleViewAsUser: () => void;
}

const AdminViewContext = createContext<AdminViewContextType | undefined>(undefined);

export const AdminViewProvider = ({ children }: { children: ReactNode }) => {
  const [viewAsUser, setViewAsUser] = useState(false);

  const toggleViewAsUser = () => {
    setViewAsUser(prev => !prev);
  };

  return (
    <AdminViewContext.Provider value={{ viewAsUser, toggleViewAsUser }}>
      {children}
    </AdminViewContext.Provider>
  );
};

export const useAdminView = () => {
  const context = useContext(AdminViewContext);
  if (!context) {
    throw new Error("useAdminView must be used within an AdminViewProvider");
  }
  return context;
};
