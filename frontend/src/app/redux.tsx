"use client";

import { useRef } from "react";
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { api } from "@/state/api"; // Import your API
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage"; // Use local storage
import { PersistGate } from "redux-persist/integration/react";

// Configuration for redux-persist
const persistConfig = {
  key: "root",
  storage,
};

// Combine reducers
const rootReducer = combineReducers({
  [api.reducerPath]: api.reducer,
});

// Create a persistent reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Function to create the store
export const makeStore = () => {
  return configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'], // Ignore persist actions
        },
      }).concat(api.middleware), // Add API middleware
  });
};

// StoreProvider component
export default function StoreProvider({ children }: { children: React.ReactNode }) {
  const storeRef = useRef(makeStore());
  const persistor = persistStore(storeRef.current);

  return (
    <Provider store={storeRef.current}>
      <PersistGate loading={null} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  );
}