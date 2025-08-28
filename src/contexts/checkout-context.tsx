"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

interface CheckoutContextType {
  selectedAddressId: string | null;
  setSelectedAddressId: (addressId: string | null) => void;
  clearCheckout: () => void;
}

const CheckoutContext = createContext<CheckoutContextType | undefined>(
  undefined,
);

export const useCheckout = () => {
  const context = useContext(CheckoutContext);
  if (context === undefined) {
    throw new Error("useCheckout must be used within a CheckoutProvider");
  }
  return context;
};

interface CheckoutProviderProps {
  children: ReactNode;
}

export const CheckoutProvider = ({ children }: CheckoutProviderProps) => {
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null,
  );
  const [isClient, setIsClient] = useState(false);

  // Carregar estado do localStorage no lado do cliente
  useEffect(() => {
    setIsClient(true);
    const savedAddressId = localStorage.getItem("selectedAddressId");
    if (savedAddressId) {
      setSelectedAddressId(savedAddressId);
    }
  }, []);

  const setSelectedAddressIdWithStorage = (addressId: string | null) => {
    setSelectedAddressId(addressId);
    if (isClient) {
      if (addressId) {
        localStorage.setItem("selectedAddressId", addressId);
      } else {
        localStorage.removeItem("selectedAddressId");
      }
    }
  };

  const clearCheckout = () => {
    setSelectedAddressIdWithStorage(null);
  };

  const value = {
    selectedAddressId,
    setSelectedAddressId: setSelectedAddressIdWithStorage,
    clearCheckout,
  };

  // Renderizar apenas no cliente para evitar problemas de hidratação
  if (!isClient) {
    return <div style={{ visibility: "hidden" }}>{children}</div>;
  }

  return (
    <CheckoutContext.Provider value={value}>
      {children}
    </CheckoutContext.Provider>
  );
};
