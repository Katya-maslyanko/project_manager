// app/redux.tsx
"use client";

import { useRef } from "react";
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { api } from "@/state/api"; // Импортируйте ваш API
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage"; // Используйте локальное хранилище
import { PersistGate } from "redux-persist/integration/react";

// Конфигурация для redux-persist
const persistConfig = {
  key: "root",
  storage,
};

// Объединение редьюсеров
const rootReducer = combineReducers({
  [api.reducerPath]: api.reducer,
});

// Создание персистентного редьюсера
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Функция для создания хранилища
export const makeStore = () => {
  return configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'], // Игнорируем действия, связанные с persist
        },
      }).concat(api.middleware), // Добавляем middleware для API
  });
};

// Компонент StoreProvider
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